using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using debt_payment_backend.IdentityService.Model.Entity;
using System.Text;
using System.IdentityModel.Tokens.Jwt;


namespace debt_payment_backend.IdentityService.Services.Impl
{
    public class JwtServiceImpl : JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtServiceImpl(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("Jwt:Key").Value!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                issuer: _configuration.GetSection("Jwt:Issuer").Value,
                audience: _configuration.GetSection("Jwt:Audience").Value,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}