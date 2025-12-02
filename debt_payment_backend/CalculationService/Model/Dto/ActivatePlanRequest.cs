using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class ActivatePlanRequest
    {
        public Guid ReportId { get; set; }
        public string Strategy { get; set; } = "Avalanche";
    }
}