using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CalculationService.Model.Entity
{
    public class CalculationReport
    {
        [Key]
        public Guid CalculationId { get; set; } 
        [Required]
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ReportDataJson { get; set; } = string.Empty;
    }
}