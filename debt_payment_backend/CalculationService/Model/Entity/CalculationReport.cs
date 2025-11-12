using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CalculationService.Model.Entity
{
    [Index(nameof(ScenarioHash), Name = "IX_CalculationReport_ScenarioHash")]
    public class CalculationReport
    {
        [Key]
        public Guid CalculationId { get; set; } 
        [Required]
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ReportDataJson { get; set; } = string.Empty;

        [Column(TypeName = "varchar(100)")]
        public string ScenarioHash { get; set; } = string.Empty;
    }
}