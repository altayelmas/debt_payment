using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Model.Entity;

namespace CalculationService.Repository
{
    public interface CalculationRepository
    {
        Task<CalculationReport?> GetCalculationReportByIdAndUserIdAsync(string userId, Guid reportId);
        Task<bool> SaveChangesAsync();
        Task<CalculationReport> AddCalculationReportAsync(CalculationReport calculationReport);
        Task<List<CalculationReport>> GetCalculationsByUserId(string userId);
        Task<CalculationReport?> GetReportByHashAsync(string hash);

    }
}