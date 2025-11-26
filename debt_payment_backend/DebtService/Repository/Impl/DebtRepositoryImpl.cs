using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Data;
using debt_payment_backend.DebtService.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace debt_payment_backend.DebtService.Repository.Impl
{
    public class DebtRepositoryImpl : DebtRepository
    {
        private readonly ApplicationDbContext _context;

        public DebtRepositoryImpl(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<Debt> AddDebtAsync(Debt debt)
        {
            await _context.Debts.AddAsync(debt);
            return debt;
        }

        public async Task DeleteDebtAsync(Debt debt)
        {
            _context.Debts.Remove(debt);
            await Task.CompletedTask;
        }

        public async Task<IEnumerable<Debt>> GetAllDebtsByUserIdAsync(string userId)
        {
            return await _context.Debts
                .Where(d => d.UserId == userId && d.CurrentBalance > 0)
                .OrderBy(d => d.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task UpdateDebtAsync(Debt debt)
        {
            _context.Entry(debt).State = EntityState.Modified;
            await Task.CompletedTask;
        }

        public async Task<Debt?> GetDebtByIdAndUserIdAsync(int debtId, string userId)
        {
            return await _context.Debts.FirstOrDefaultAsync(d => d.DebtId == debtId && d.UserId == userId);
        }

        public async Task<int> GetTotalDebtCountByUserIdAsync(string userId)
        {
            return await _context.Debts
                .CountAsync(d => d.UserId == userId && d.CurrentBalance > 0);
        }

         public async Task<IEnumerable<Debt>> GetDebtsByUserIdAsync(string userId, int pageNumber, int pageSize)
        {
            return await _context.Debts
                .Where(d => d.UserId == userId && d.CurrentBalance > 0)
                .OrderByDescending(d => d.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Debt>> GetActiveDebtsByUserIdAsync(string userId)
        {
            return await _context.Debts
                .Where(d => d.UserId == userId && d.CurrentBalance > 0)
                .ToListAsync();
        }
    }
}