using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class MonthlyPaymentDetailDto
    {
        public int Month { get; set; }
        public string MonthYear { get; set; } = string.Empty;
        public decimal InterestPaid { get; set; }
        public decimal TotalPaymentAmount { get; set; }
        public string MonthlyNote { get; set; } = string.Empty;        
        public decimal PrincipalPaid { get; set; }
        public decimal EndingBalance { get; set; }
        public List<string> PaidOffDebts { get; set; } = new();
    }
}