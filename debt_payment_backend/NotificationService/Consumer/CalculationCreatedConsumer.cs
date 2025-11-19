using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DebtPayment.Shared.Events;
using MassTransit;

namespace NotificationService.Consumer
{
    public class CalculationCreatedConsumer: IConsumer<CalculationCreatedEvent>
    {
        private readonly ILogger<CalculationCreatedConsumer> _logger;
        public CalculationCreatedConsumer(ILogger<CalculationCreatedConsumer> logger)
        {
            _logger = logger;
        }

        public Task Consume(ConsumeContext<CalculationCreatedEvent> context)
    {
        var message = context.Message;
        
        _logger.LogInformation("📧 E-POSTA GÖNDERİLİYOR...");
        _logger.LogInformation($"Kime: {message.Email}");
        _logger.LogInformation($"Konu: Hesaplama Raporunuz Hazır! (ID: {message.ReportId})");
        _logger.LogInformation($"Toplam Borç: {message.TotalDebt}");
        _logger.LogInformation("E-posta başarıyla gönderildi! ✅");        
        return Task.CompletedTask;
    }
    }
}