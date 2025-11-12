using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculationService.Data;
using CalculationService.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace CalculationService.Repository.Impl
{
    public class CalculationRepositoryImpl : CalculationRepository
    {
        private readonly ApplicationDbContext _context;

        public CalculationRepositoryImpl(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CalculationReport> AddCalculationReportAsync(CalculationReport calculationReport)
        {
            await _context.CalculationReports.AddAsync(calculationReport);
            return calculationReport;
        }

        public async Task<CalculationReport?> GetCalculationReportByIdAndUserIdAsync(string userId, Guid calculationId)
        {
            return await _context.CalculationReports.FirstOrDefaultAsync(c => c.CalculationId == calculationId 
            && c.UserId == userId);
        }

        public async Task<List<CalculationReport>> GetCalculationsByUserId(string userId)
        {
            return await _context.CalculationReports
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}