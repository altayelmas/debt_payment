using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Service;
using debt_payment_backend.IdentityService.Model.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace debt_payment_backend.IdentityService.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto userRegisterDto)
        {
            AuthResponseDto registerResponse = await _authService.RegisterAsync(userRegisterDto);
            if (!registerResponse.IsSuccess)
            {
                return BadRequest(registerResponse.Errors);
            }
            return Ok(registerResponse);

        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userLoginDto)
        {
            var result = await _authService.LoginAsync(userLoginDto);

            if (!result.IsSuccess)
            {
                return Unauthorized(new { errors = result.Errors });
            }

            return Ok(result);
        }
    }
}