using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.DebtService.Model.Dto
{
    public class DebtCreateUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Balance should be higher than 0")]
        public decimal CurrentBalance { get; set; }
        [Required]
        [Range(0, 100, ErrorMessage = "Interest rate should be between 0 and 100")]
        public decimal InterestRate { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Minimum payment should be higher than 0")]
        public decimal MinPayment { get; set; }
    }
}