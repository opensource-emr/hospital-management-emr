using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EmpCashTransactionModel
    {
        [Key]
        public int CashTxnId { get; set; }
        public string TransactionType { get; set; }
        public int? ReferenceNo { get; set; }
        public int EmployeeId { get; set; }
        public double? InAmount { get; set; }
        public double? OutAmount { get; set; }
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public bool IsActive { get; set; }

        public int? CounterID { get; set; }//sud:05May'21--to track countercollection.
    }
}
