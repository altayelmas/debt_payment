using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Entity;

namespace debt_payment_backend.DebtService.Repository
{
    public interface DebtRepository
    {
        Task<IEnumerable<Debt>> GetAllDebtsByUserIdAsync(string userId);
        Task<Debt> AddDebtAsync(Debt debt);
        Task UpdateDebtAsync(Debt debt);
        Task DeleteDebtAsync(Debt debt);
        Task<bool> SaveChangesAsync();
        Task<Debt?> GetDebtByIdAndUserIdAsync(int debtId, string userId);
        Task<IEnumerable<Debt>> GetDebtsByUserIdAsync(string userId, int pageNumber, int pageSize);
        Task<int> GetTotalDebtCountByUserIdAsync(string userId);
        Task<List<Debt>> GetActiveDebtsByUserIdAsync(string userId);

    }
}