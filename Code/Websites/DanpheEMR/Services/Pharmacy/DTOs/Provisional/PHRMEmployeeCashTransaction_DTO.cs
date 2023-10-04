using System;

namespace DanpheEMR.Services.Pharmacy.DTOs.Provisional
{
    public class PHRMEmployeeCashTransaction_DTO
    {
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
        public int FiscalYearId { get; set; }
        public bool IsTransferredToAcc { get; set; }
    }
}
