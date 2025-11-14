using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;
using debt_payment_backend.DebtService.Model.Entity;
using debt_payment_backend.DebtService.Repository;
using debt_payment_backend.DebtService.Service.Impl;
using DebtService.Model.Dto;
using Moq;

namespace debt_payment_backend.Tests
{
    public class DebtServiceTests
    {
        private readonly Mock<DebtRepository> _mockRepo;
        private readonly DebtsServiceImpl _sut;

        public DebtServiceTests()
        {
            _mockRepo = new Mock<DebtRepository>();
            _sut = new DebtsServiceImpl(_mockRepo.Object);
        }

        [Fact]
        public async Task GetDebtsForUserAsync_ShouldReturnPagedDebts_WhenDebtsExist()
        {
            var userId = "user-123";
            var page = 1;
            var pageSize = 5;

            var debts = new List<Debt>
            {
                new Debt { DebtId = 1, Name = "Debt 1", CurrentBalance = 100 },
                new Debt { DebtId = 2, Name = "Debt 2", CurrentBalance = 200 }
            };

            _mockRepo.Setup(repo => repo.GetDebtsByUserIdAsync(userId, page, pageSize))
                     .ReturnsAsync(debts);
            _mockRepo.Setup(repo => repo.GetTotalDebtCountByUserIdAsync(userId))
                     .ReturnsAsync(2);
            _mockRepo.Setup(repo => repo.GetAllDebtsByUserIdAsync(userId))
                     .ReturnsAsync(debts);

            var result = await _sut.GetDebtsForUserAsync(userId, page, pageSize);

            Assert.NotNull(result);
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.Items.Count());
            Assert.Equal("Debt 1", result.Items.First().Name);
            Assert.Equal(300, result.TotalBalance);
        }

        [Fact]
        public async Task GetDebtsForUserAsync_ShouldReturnPagedDebts_WhenDebtDoesNotExist()
        {
            var userId = "user-123";
            var page = 1;
            var pageSize = 5;

            _mockRepo.Setup(repo => repo.GetDebtsByUserIdAsync(userId, page, pageSize))
                     .ReturnsAsync(new List<Debt>());
            _mockRepo.Setup(repo => repo.GetTotalDebtCountByUserIdAsync(userId))
                     .ReturnsAsync(0);

            var result = await _sut.GetDebtsForUserAsync(userId, page, pageSize);

            Assert.NotNull(result);
            Assert.Equal(0, result.TotalCount);
            Assert.Empty(result.Items);
            Assert.Equal(0, result.TotalBalance);
            Assert.Equal(0, result.TotalMonthlyMinPayment);
        }

        [Fact]
        public async Task CreateDebtAsync_ShouldReturnDebtDto_WhenDebtIsCreated()
        {
            var userId = "user-123";
            var debtCreateUpdateDto = new DebtCreateUpdateDto
            {
                Name = "new debt",
                CurrentBalance = 100000,
                InterestRate = 50,
                MinPayment = 10000
            };

            var debt = new Debt
            {
                UserId = userId,
                Name = debtCreateUpdateDto.Name,
                CurrentBalance = debtCreateUpdateDto.CurrentBalance,
                InterestRate = debtCreateUpdateDto.InterestRate,
                MinPayment = debtCreateUpdateDto.MinPayment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockRepo.Setup(repo => repo.AddDebtAsync(It.IsAny<Debt>()))
                      .ReturnsAsync(debt);
            _mockRepo.Setup(repo => repo.SaveChangesAsync())
                      .ReturnsAsync(true);

            var result = await _sut.CreateDebtAsync(debtCreateUpdateDto, userId);

            Assert.Equal(debtCreateUpdateDto.Name, result.Name);
            Assert.Equal(debtCreateUpdateDto.CurrentBalance, result.CurrentBalance);
            Assert.Equal(debtCreateUpdateDto.InterestRate, result.InterestRate);
            Assert.Equal(debtCreateUpdateDto.MinPayment, result.MinPayment);

            _mockRepo.Verify(repo => repo.AddDebtAsync(It.IsAny<Debt>()), Times.Once);
            _mockRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteDebtAsync_ShouldReturnNotFound_WhenDebtDoesNotExist()
        {
            var debtId = 99;
            var userId = "user-123";

            _mockRepo.Setup(repo => repo.GetDebtByIdAndUserIdAsync(debtId, userId))
                     .ReturnsAsync((Debt)null);

            var result = await _sut.DeleteDebtAsync(debtId, userId);

            Assert.False(result.IsSuccess);
            Assert.True(result.NotFound);

            _mockRepo.Verify(repo => repo.DeleteDebtAsync(It.IsAny<Debt>()), Times.Never);
        }

        [Fact]
        public async Task DeleteDebtAsync_ShouldReturnSuccess_WhenDebtExists()
        {
            var debtId = 1;
            var userId = "user-123";
            var debt = new Debt { DebtId = debtId, UserId = userId };

            _mockRepo.Setup(repo => repo.GetDebtByIdAndUserIdAsync(debtId, userId))
                      .ReturnsAsync(debt);

            var result = await _sut.DeleteDebtAsync(debtId, userId);

            Assert.True(result.IsSuccess);

            _mockRepo.Verify(repo => repo.DeleteDebtAsync(debt), Times.Once);
            _mockRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteDebtAsync_ShouldThrowException_WhenDeleteFails()
        {
            var debtId = 1;
            var userId = "user-123";
            var debt = new Debt { DebtId = debtId, UserId = userId };

            var expectedErrorMessage = "Database transaction failed";

            _mockRepo.Setup(repo => repo.GetDebtByIdAndUserIdAsync(debtId, userId))
                      .ReturnsAsync(debt);

            _mockRepo.Setup(repo => repo.DeleteDebtAsync(debt))
                      .ThrowsAsync(new Exception(expectedErrorMessage));

            var result = await _sut.DeleteDebtAsync(debtId, userId);

            Assert.False(result.IsSuccess);
            Assert.False(result.NotFound);

            Assert.False(string.IsNullOrEmpty(result.Error));
            Assert.Contains(expectedErrorMessage, result.Error);
            _mockRepo.Verify(repo => repo.DeleteDebtAsync(It.IsAny<Debt>()), Times.Once);
            _mockRepo.Verify(repo => repo.SaveChangesAsync(), Times.Never);
        }

        [Fact]
        public async Task DeleteDebtAsync_ShouldThrowException_WhenSaveFails()
        {
            var debtId = 1;
            var userId = "user-123";
            var debt = new Debt { DebtId = debtId, UserId = userId };

            var expectedErrorMessage = "Database transaction failed";

            _mockRepo.Setup(repo => repo.GetDebtByIdAndUserIdAsync(debtId, userId))
                      .ReturnsAsync(debt);

            _mockRepo.Setup(repo => repo.SaveChangesAsync())
                      .ThrowsAsync(new Exception(expectedErrorMessage));

            var result = await _sut.DeleteDebtAsync(debtId, userId);

            Assert.False(result.IsSuccess);
            Assert.False(result.NotFound);

            Assert.False(string.IsNullOrEmpty(result.Error));
            Assert.Contains(expectedErrorMessage, result.Error);
            _mockRepo.Verify(repo => repo.DeleteDebtAsync(It.IsAny<Debt>()), Times.Once);
            _mockRepo.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }
    }
}