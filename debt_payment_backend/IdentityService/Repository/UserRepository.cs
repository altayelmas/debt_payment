using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Model.Entity;

namespace debt_payment_backend.IdentityService.Repository
{
    public interface UserRepository
    {
        Task<User?> FindUserByEmail(String email);
    }
}