using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://seq:5341")
    .Enrich.FromLogContext()
    .CreateLogger();

try  {
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowNextJsApp",
            policy =>
            {
                policy.WithOrigins(
                        "http://localhost:3000"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
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

    builder.Services.AddReverseProxy()
        .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

    var app = builder.Build();

    //app.UseHttpsRedirection();

    app.UseCors("AllowNextJsApp");

    app.UseRouting();

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseSerilogRequestLogging();

    app.MapReverseProxy();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "ApiGateway terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}