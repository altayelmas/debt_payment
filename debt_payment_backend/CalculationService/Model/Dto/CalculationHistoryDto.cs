using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.CalculationService.Model.Dto
{
    public class CalculationHistoryDto
    {
        public Guid ReportId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalDebt { get; set; }
        public decimal ExtraPayment { get; set; }
        public string RecommendedPayOffDate { get; set; } = string.Empty;
        public decimal RecommendedInterestSaved { get; set; }
    }
}