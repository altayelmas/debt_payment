using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.IdentityService.Data;
using debt_payment_backend.IdentityService.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace debt_payment_backend.IdentityService.Repository.Impl
{
    public class UserRepositoryImpl : UserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepositoryImpl(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> FindUserByEmail(String email) 
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

    }
}