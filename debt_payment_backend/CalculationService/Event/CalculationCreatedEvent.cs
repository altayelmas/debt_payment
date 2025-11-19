using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DebtPayment.Shared.Events
{
    public class CalculationCreatedEvent
    {
        public Guid ReportId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public decimal TotalDebt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}