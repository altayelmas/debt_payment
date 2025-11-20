using MassTransit;
using NotificationService.Consumer;
using NotificationService.Service;

var builder = Host.CreateApplicationBuilder(args);

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