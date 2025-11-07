using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Model.Entity;

namespace debt_payment_backend.IdentityService.Services
{
    public interface JwtService
    {
        string CreateToken(User user);
    }
}