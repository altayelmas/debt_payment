using MassTransit;
using NotificationService.Consumer;
using NotificationService.Service;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://seq")
    .Enrich.FromLogContext()
    .CreateLogger();

try {
    var builder = Host.CreateApplicationBuilder(args);

    builder.Services.AddSerilog();

    builder.Services.AddMassTransit(x =>
    {
        x.AddConsumer<CalculationCreatedConsumer>();

        x.UsingRabbitMq((context, cfg) =>
        {
            cfg.Host("rabbitmq", "/", h => {
                h.Username("guest");
                h.Password("guest");
            });

            cfg.ReceiveEndpoint("notification-queue", e =>
            {
                e.ConfigureConsumer<CalculationCreatedConsumer>(context);
            });
        });
    });

    builder.Services.AddScoped<EmailService>();

    var host = builder.Build();
    host.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Notification Service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}