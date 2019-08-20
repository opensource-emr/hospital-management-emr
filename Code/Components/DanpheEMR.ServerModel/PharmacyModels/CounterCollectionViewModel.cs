using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class TotalCollectionViewModel
    {
        public decimal TotalSale { get; set; }
        public decimal TotalReturn { get; set; }
        public decimal NetSale { get; set; }
        public double TotalDeposit { get; set; }
        public double DepositReturned { get; set; }
        public virtual IEnumerable<CounterCollectionViewModel> CounterCollection { get; set; }
        public virtual IEnumerable<UserCollectionViewModel> UserCollection { get; set; }
    }
    public class CounterCollectionViewModel
    {
        public int CounterId { get; set; }
        public decimal CounterSale { get; set; }
        public string CounterName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal UserSale { get; set; }
        public decimal TotalSale { get; set; }
    }
    public class UserCollectionViewModel
    {
        public int CounterId { get; set; }
        public decimal CounterSale { get; set; }
        public string CounterName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal UserSale { get; set; }
        public decimal TotalSale { get; set; }
    }



}
