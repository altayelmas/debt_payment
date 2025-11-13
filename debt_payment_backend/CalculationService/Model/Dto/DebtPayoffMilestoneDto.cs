using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Dto
{
    public class DebtPayoffMilestoneDto
    {
        public int Month { get; set; }
        public string MonthYear { get; set; } = string.Empty;
        public string DebtName { get; set; } = string.Empty;
    }
}