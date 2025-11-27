using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Exceptions
{
    public class PaymentInsufficientException: Exception
    {
        public decimal DeficitAmount { get; }

        public PaymentInsufficientException(decimal deficitAmount) 
            : base($"Payment insufficient. Deficit: {deficitAmount}")
        {
            DeficitAmount = deficitAmount;
        }
    }
}