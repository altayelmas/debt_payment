using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Model.Entity;
using debt_payment_backend.DebtService.Model.Mapper;
using debt_payment_backend.DebtService.Repository;
using DebtService.Model.Dto;

namespace debt_payment_backend.DebtService.Service.Impl
{
    public class DebtsServiceImpl : DebtsService
    {
        private readonly DebtRepository _debtRepository;

        public DebtsServiceImpl(DebtRepository debtRepository)
        {
            _debtRepository = debtRepository;
        }
        public async Task<DebtDto> CreateDebtAsync(DebtCreateUpdateDto request, string userId)
        {
            var debt = new Debt
            {
                UserId = userId,
                Name = request.Name,
                CurrentBalance = request.CurrentBalance,
                InterestRate = request.InterestRate,
                MinPayment = Math.Min(request.MinPayment, request.CurrentBalance),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _debtRepository.AddDebtAsync(debt);
            await _debtRepository.SaveChangesAsync();

            return debt.MapDebtToDto();
        }

        public async Task<ServiceResultDto> DeleteDebtAsync(int debtId, string userId)
        {
            var debt = await _debtRepository.GetDebtByIdAndUserIdAsync(debtId, userId);
            if (debt == null)
            {
                return new ServiceResultDto
                {
                    NotFound = true,
                    Error = "Debt not found"
                };
            }
            try
            {
                await _debtRepository.DeleteDebtAsync(debt);
                await _debtRepository.SaveChangesAsync();
                return new ServiceResultDto
                {
                    IsSuccess = true
                };
            } catch (Exception e)
            {
                return new ServiceResultDto
                {
                    IsSuccess = false,
                    NotFound = false,
                    Error = $"Update Error: {e.Message}"
                };
            }
        }

        public async Task<IEnumerable<DebtDto>> GetAllDebtsForUserAsync(string userId)
        {
            var debts = await _debtRepository.GetAllDebtsByUserIdAsync(userId);
            return debts.Select(DebtMapper.MapDebtToDto);
        }

        public async Task<ServiceResultDto> UpdateDebtAsync(int debtId, DebtCreateUpdateDto request, string userId)
        {
            var debt = await _debtRepository.GetDebtByIdAndUserIdAsync(debtId, userId);
            if (debt == null)
            {
                return new ServiceResultDto
                {
                    NotFound = true,
                    Error = "Debt not found"
                };
            }
            try
            {
                debt.Name = request.Name;
                debt.CurrentBalance = request.CurrentBalance;
                debt.InterestRate = request.InterestRate;
                debt.MinPayment = request.MinPayment;
                debt.UpdatedAt = DateTime.UtcNow;

                await _debtRepository.UpdateDebtAsync(debt);

                await _debtRepository.SaveChangesAsync();

                return new ServiceResultDto
                {
                    IsSuccess = true
                };

            }
            catch (Exception e)
            {
                return new ServiceResultDto
                {
                    IsSuccess = false,
                    Error = $"Update Error: {e.Message}"
                };
            }
        }

        public async Task<DebtDto?> GetDebtByIdAsync(int id, string userId)
        {
            var debt = await _debtRepository.GetDebtByIdAndUserIdAsync(id, userId);
            if (debt == null)
            {
                return null;
            }
            return DebtMapper.MapDebtToDto(debt);
        }
        
        public async Task<PaginationDtos<DebtDto>> GetDebtsForUserAsync(string userId, int pageNumber, int pageSize)
        {
            var totalCount = await _debtRepository.GetTotalDebtCountByUserIdAsync(userId);
            
            var debts = await _debtRepository.GetDebtsByUserIdAsync(userId, pageNumber, pageSize);
            
            var debtDtos = debts.Select(DebtMapper.MapDebtToDto);

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var allDebts = await _debtRepository.GetAllDebtsByUserIdAsync(userId);

            decimal totalBalance = 0;
            decimal totalMonthlyMinPayment = 0;

            foreach (var debt in allDebts) {
                totalBalance += debt.CurrentBalance;
                totalMonthlyMinPayment += debt.MinPayment;
            }

            return new PaginationDtos<DebtDto>
            {
                Items = debtDtos,
                TotalCount = totalCount,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                TotalBalance = totalBalance,
                TotalMonthlyMinPayment = totalMonthlyMinPayment
            };
        }

        public async Task<decimal> GetTotalDebtAsync(string userId)
        {
            List<DebtDto> debts = (await GetAllDebtsForUserAsync(userId)).ToList();
            decimal totalDebt = 0;
            foreach (var debt in debts)
            {
                totalDebt += debt.CurrentBalance;
            }

            return totalDebt;
        }
    }
}