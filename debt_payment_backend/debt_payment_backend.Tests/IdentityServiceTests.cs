using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Model.Dto;
using debt_payment_backend.IdentityService.Model.Entity;
using debt_payment_backend.IdentityService.Service.Impl;
using debt_payment_backend.IdentityService.Services;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace debt_payment_backend.Tests
{
    public class IdentityServiceTests
    {
        private readonly Mock<UserManager<User>> _mockUserManager;
        private readonly Mock<SignInManager<User>> _mockSignInManager;
        private readonly Mock<JwtService> _mockJwtService;
        private readonly AuthServiceImpl _sut;

        public IdentityServiceTests()
        {
            var userStoreMock = new Mock<IUserStore<User>>();
            _mockUserManager = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);
            _mockSignInManager = new Mock<SignInManager<User>>(
            _mockUserManager.Object,
            new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>().Object,
            new Mock<IUserClaimsPrincipalFactory<User>>().Object,
            null, null, null, null);
            _mockJwtService = new Mock<JwtService>();
            _sut = new AuthServiceImpl(
                _mockUserManager.Object,
                _mockSignInManager.Object,
                _mockJwtService.Object);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnSuccessfulAuthResult_WhenCredentialsAreValid()
        {
            var loginDto = new UserLoginDto { Email = "test@test.com", Password = "Password123!" };
            var user = new User { Email = "test@test.com", UserName = "test@test.com" };
            var token = "eyJf...token...3a";

            _mockUserManager.Setup(m => m.FindByEmailAsync(loginDto.Email))
                            .ReturnsAsync(user);

            _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, loginDto.Password, false))
                .ReturnsAsync(SignInResult.Success);

            _mockJwtService.Setup(s => s.CreateToken(user))
                           .Returns(token);

            var result = await _sut.LoginAsync(loginDto);

            Assert.True(result.IsSuccess);
            Assert.Equal(token, result.Token);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnFailedAuthResult_WhenUserNotFound()
        {
            var loginDto = new UserLoginDto { Email = "test@test.com", Password = "Password123!" };

            _mockUserManager.Setup(m => m.FindByEmailAsync(loginDto.Email))
                            .ReturnsAsync((User)null);

            var result = await _sut.LoginAsync(loginDto);
            Assert.False(result.IsSuccess);
            Assert.Empty(result.Token);
            Assert.Contains("COULD_NOT_FIND_EMAIL", result.Errors.ElementAt(0));
        }

        [Fact]
        public async Task LoginAsync_ShouldReturnFailedAuthResult_WhenPasswordIsInvalid()
        {
            var loginDto = new UserLoginDto { Email = "test@test.com", Password = "WrongPassword!" };
            var user = new User { Email = "test@test.com" };

            _mockUserManager.Setup(m => m.FindByEmailAsync(loginDto.Email))
                            .ReturnsAsync(user);

            _mockSignInManager.Setup(m => m.CheckPasswordSignInAsync(user, loginDto.Password, false))
                .ReturnsAsync(SignInResult.Failed);

            var result = await _sut.LoginAsync(loginDto);

            Assert.False(result.IsSuccess);
            Assert.Empty(result.Token);
            Assert.Contains("INVALID_PASSWORD", result.Errors.ElementAt(0));
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnSuccessfulAuthResult_WhenUserIsCreated()
        {
            var registerDto = new UserRegisterDto { Email = "test@test.com", Password = "Password123!" };

            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email
            };

            _mockUserManager.Setup(m => m.CreateAsync(It.IsAny<User>(), registerDto.Password))
                            .ReturnsAsync(IdentityResult.Success);

            var result = await _sut.RegisterAsync(registerDto);

            Assert.True(result.IsSuccess);
            Assert.Empty(result.Errors);

            _mockUserManager.Verify(m => m.CreateAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_ShouldReturnFailedAuthResult_WhenUserIsNotCreated()
        {
            var registerDto = new UserRegisterDto { Email = "test@test.com", Password = "Password123!" };

            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email
            };

            var errorMessage1 = "PasswordTooShort";
            var errorMessage2 = "InvalidEmail";

            var errors = new List<IdentityError>
            {
                new IdentityError { Code = "PasswordTooShort", Description = errorMessage1 },
                new IdentityError { Code = "InvalidEmail", Description = errorMessage2 }
            };
            var failedResult = IdentityResult.Failed(errors.ToArray());

            _mockUserManager.Setup(m => m.CreateAsync(It.IsAny<User>(), registerDto.Password))
                            .ReturnsAsync(failedResult);

            var result = await _sut.RegisterAsync(registerDto);

            Assert.False(result.IsSuccess);
            Assert.NotNull(result.Errors);
            Assert.Equal(2, result.Errors.Count());
            Assert.Contains(errorMessage1, result.Errors);
            Assert.Contains(errorMessage2, result.Errors);
        }
    }
}