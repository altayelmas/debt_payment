using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Model.Dto;
using debt_payment_backend.IdentityService.Model.Entity;

namespace debt_payment_backend.IdentityService.Service
{
    public interface AuthService
    {
        Task<AuthResponseDto> RegisterAsync(UserRegisterDto userRegisterDto);
        Task<AuthResponseDto> LoginAsync(UserLoginDto userLoginDto);
    
    }
}