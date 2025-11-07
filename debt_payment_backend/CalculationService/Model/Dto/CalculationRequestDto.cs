using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.CalculationService.Model.Dto
{
    public class CalculationRequestDto
    {
        [Range(0, double.MaxValue, ErrorMessage = "Extra payment cannot be negative")]
        public decimal ExtraMonthlyPayment { get; set; }
    }
}