using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DebtService.Model.Dto
{
    public class DistributePaymentRequest
    {
        public decimal Amount { get; set; }
        public string Strategy { get; set; } = "Avalanche";
        public DateTime? Date { get; set; }
        public Guid CalculationReportId { get; set; }
    }
}