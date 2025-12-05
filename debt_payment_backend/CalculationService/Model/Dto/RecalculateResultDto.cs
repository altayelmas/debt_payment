using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class RecalculateResultDto
    {
        public Guid ReportId { get; set; }
        public decimal NewMonthlyPayment { get; set; }
        public bool PaymentIncreased { get; set; }
    }
}