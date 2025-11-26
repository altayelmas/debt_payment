using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class ActualPaymentDto
    {
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}