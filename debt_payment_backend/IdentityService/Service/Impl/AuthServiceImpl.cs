using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Model.Dto;
using debt_payment_backend.IdentityService.Model.Entity;
using debt_payment_backend.IdentityService.Repository;
using debt_payment_backend.IdentityService.Services;
using Microsoft.AspNetCore.Identity;

namespace debt_payment_backend.IdentityService.Service.Impl
{
    public class AuthServiceImpl : AuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;

        public AuthServiceImpl(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        public async Task<AuthResponseDto> LoginAsync(UserLoginDto userLoginDto)
        {
            var user = await _userManager.FindByEmailAsync(userLoginDto.Email);
            if (user == null)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Errors = new[] {"COULD_NOT_FIND_EMAIL"}
                };
            }
            var result = await _signInManager.CheckPasswordSignInAsync(user, userLoginDto.Password, false);
            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Errors = new[] { "INVALID_PASSWORD" }
                };
            }
            string token = _jwtService.CreateToken(user);
            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = token
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(UserRegisterDto userRegisterDto)
        {
            var user = new User
            {
                UserName = userRegisterDto.Email,
                Email = userRegisterDto.Email
            };

            var result = await _userManager.CreateAsync(user, userRegisterDto.Password);

            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Errors = result.Errors.Select(e => e.Code)
                };
            }
            return new AuthResponseDto
            {
                IsSuccess = true
            };
        }
    }
}