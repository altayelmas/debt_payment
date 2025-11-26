using System.Text;
using CalculationService.Data;
using CalculationService.Repository;
using CalculationService.Repository.Impl;
using CalculationService.Service;
using CalculationService.Service.Impl;
using debt_payment_backend.CalculationService.Service;
using debt_payment_backend.CalculationService.Service.Impl;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using Serilog;

QuestPDF.Settings.License = LicenseType.Community;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://seq:5341")
    .Enrich.FromLogContext()
    .CreateLogger();

try {
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();
    
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins",
            policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000",
                        "http://localhost:5000",
                        "http://localhost:5002"

                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {

        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    });

    builder.Services.AddHttpClient("DebtServiceClient", client =>
    {
        string debtServiceUrl = builder.Configuration["ServiceEndpoints:DebtService"]
                                ?? throw new InvalidOperationException("DebtService URL is not defined in appsettings.");

        client.BaseAddress = new Uri(debtServiceUrl);
    });

    builder.Services.AddHttpContextAccessor();
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

    builder.Services.AddAuthorization();

    builder.Services.AddScoped<CalculateService, CalculateServiceImpl>();
    builder.Services.AddScoped<CalculationRepository, CalculationRepositoryImpl>();
    builder.Services.AddScoped<PlanService, PlanServiceImpl>();
    builder.Services.AddScoped<PlanRepository, PlanRepositoryImpl>();

    builder.Services.AddMassTransit(x =>
    {
        x.UsingRabbitMq((context, cfg) =>
        {
            cfg.Host("rabbitmq", "/", h => {
                h.Username("guest");
                h.Password("guest");
            });
        });
    });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddSwaggerGen(options =>
    {
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header (CalculationService)",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            { 
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] { } 
            }
        });
    });

    var app = builder.Build();

    app.ApplyCalculationMigrations();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    //app.UseHttpsRedirection();

    app.UseCors("AllowSpecificOrigins");

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
} catch (Exception ex) {
    Log.Fatal(ex, "CalculationService terminated unexpectedly");
} finally {
    Log.CloseAndFlush();
}

