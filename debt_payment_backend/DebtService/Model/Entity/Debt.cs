using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.DebtService.Model.Entity
{
    public class Debt
    {
        [Key]
        public int DebtId { get; set; }
        [Required]
        public string UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal CurrentBalance { get; set; }
        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal InterestRate { get; set; }
        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal MinPayment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}