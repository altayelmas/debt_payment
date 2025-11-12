using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Dto;

namespace debt_payment_backend.CalculationService.Model.Dto
{
    public class StrategyResultDto
    {
        public string StrategyName { get; set; } = string.Empty;
        public decimal TotalInterestPaid { get; set; }
        public int TotalMonths { get; set; }
        public decimal TotalPaid { get; set; }
        public string PayOffDate { get; set; } = string.Empty;
        public List<MonthlyPaymentDetailDto> PaymentSchedule { get; set; } = new();
    }
}