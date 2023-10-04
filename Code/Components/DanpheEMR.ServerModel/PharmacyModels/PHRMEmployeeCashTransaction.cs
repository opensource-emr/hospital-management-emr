using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMEmployeeCashTransaction
    {
        [Key]
        public int CashTxnId { get; set; }
        public string TransactionType { get; set; }
        public int? ReferenceNo { get; set; }
        public int EmployeeId { get; set; }
        public decimal InAmount { get; set; }
        public decimal OutAmount { get; set; }
        public string Description { get; set; }
        public DateTime? TransactionDate { get; set; }
        public bool IsActive { get; set; }
        public int CounterID { get; set; }
        public string ModuleName { get; set; }
        public int PatientId { get; set; }
        public int PaymentModeSubCategoryId { get; set; }
        public string Remarks { get; set; }
        public int FiscalYearId { get;set; }
        public bool IsTransferredToAcc { get;set; }
    }
}
