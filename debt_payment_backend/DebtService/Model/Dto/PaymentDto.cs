using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DebtService.Model.Dto
{
    public class PaymentDto
    {
        public int DebtId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public Guid CalculationReportId { get; set; }
    }
}