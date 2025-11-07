using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace debt_payment_backend.DebtService.Model.Dto
{
    public class ServiceResultDto
    {
        public bool IsSuccess { get; set; }
        public bool NotFound { get; set; }
        public string Error { get; set; } = string.Empty;
    }
}