using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DebtPayment.Shared.Events;
using MassTransit;
using NotificationService.Service;

namespace NotificationService.Consumer
{
    public class CalculationCreatedConsumer: IConsumer<CalculationCreatedEvent>
    {
        private readonly ILogger<CalculationCreatedConsumer> _logger;
        private readonly EmailService _emailService;
        public CalculationCreatedConsumer(ILogger<CalculationCreatedConsumer> logger, EmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public Task Consume(ConsumeContext<CalculationCreatedEvent> context)
        {
            var message = context.Message;
            
            _logger.LogInformation($"📧 İşleniyor: Rapor {message.ReportId}");

            _logger.LogInformation("--------------------------------------------------");
            _logger.LogInformation("📨 [SİMÜLASYON] YENİ E-POSTA GÖNDERİMİ TETİKLENDİ");
            _logger.LogInformation("--------------------------------------------------");
            _logger.LogInformation($"KİME:    {message.Email}");
            _logger.LogInformation($"KONU:    Hesaplama Raporunuz Hazır (ID: {message.ReportId})");
            _logger.LogInformation($"İÇERİK:  Merhaba, toplam {message.TotalDebt:C2} tutarındaki borç planınız oluşturuldu.");
            _logger.LogInformation("--------------------------------------------------");
            _logger.LogInformation("E-posta servis sağlayıcısına başarıyla iletildi (Simüle Edildi).");

            return Task.CompletedTask;

            /*
            var emailBody = $@"
                <h1>Hesaplama Raporunuz Hazır!</h1>
                <p>Merhaba,</p>
                <p>Borç hesaplamanız başarıyla tamamlandı.</p>
                <ul>
                    <li><strong>Toplam Borç:</strong> {message.TotalDebt:C2}</li>
                    <li><strong>Tarih:</strong> {message.CreatedAt}</li>
                </ul>
                <p>Detayları görmek için uygulamayı ziyaret edin.</p>
                <br>
                <p>Debt Calculator</p>
            ";

            await _emailService.SendEmailAsync(message.Email, "Borç Hesaplama Sonucunuz", emailBody);*/
        }
    }
}