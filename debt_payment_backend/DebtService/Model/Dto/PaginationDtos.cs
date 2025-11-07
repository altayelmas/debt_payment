using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using debt_payment_backend.DebtService.Model.Dto;

namespace DebtService.Model.Dto
{
    public class PaginationDtos<T>
    {
        public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}