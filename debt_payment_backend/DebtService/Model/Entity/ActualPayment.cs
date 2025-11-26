using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Entity;

namespace DebtService.Model.Entity
{
    public class ActualPayment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DebtId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public string? Note { get; set; }

        [ForeignKey("DebtId")]
        public Debt Debt { get; set; } = null!;
        
        [Required]
        public Guid CalculationReportId { get; set; }
    }
}