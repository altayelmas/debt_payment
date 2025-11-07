using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.CalculationService.Model.Dto
{
    public class DebtDto
    {
        public int DebtId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public decimal InterestRate { get; set; }
        public decimal MinPayment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}