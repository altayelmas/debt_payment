using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class ActiveDebtStatusDto
    {
        public string DebtName { get; set; } = string.Empty;
        public decimal DebtId { get; set; }
        public decimal CurrentBalance { get; set; } 
        public decimal StartingBalance { get; set; }
        public bool IsPaidOff => CurrentBalance <= 0;
    }
}