using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Model.Entity;
using DebtService.Model.Dto;

namespace debt_payment_backend.DebtService.Service.Impl
{
    public interface DebtsService
    {
        Task<IEnumerable<DebtDto>> GetAllDebtsForUserAsync(string userId);
        Task<DebtDto> CreateDebtAsync(DebtCreateUpdateDto request, string userId);
        Task<ServiceResultDto> UpdateDebtAsync(int debtId, DebtCreateUpdateDto request, string userId);
        Task<ServiceResultDto> DeleteDebtAsync(int debtId, string userId);
        Task<DebtDto?> GetDebtByIdAsync(int id, string userId);
        Task<PaginationDtos<DebtDto>> GetDebtsForUserAsync(string userId, int pageNumber, int pageSize);

    }
}