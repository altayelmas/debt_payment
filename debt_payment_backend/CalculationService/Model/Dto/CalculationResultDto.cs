using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.CalculationService.Model.Dto
{
    public class CalculationResultDto
    {
        public decimal BeginningDebt { get; set; }
        public StrategyResultDto SnowballResult { get; set; } = null!;
        public StrategyResultDto AvalancheResult { get; set; } = null!;
        public string Recommendation { get; set; } = string.Empty;
        public decimal ExtraPayment { get; set; }
        public decimal CurrentTotalDebt { get; set; }
        public Guid CalculationId { get; set; }
        public bool IsPlanOutdated { get; set; }
    }
}