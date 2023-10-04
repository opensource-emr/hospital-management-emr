using System.ComponentModel.DataAnnotations;
using System;

namespace DanpheEMR.Services.Dispensary.DTOs
{
    public class PHRMDispensaryEmployeeCashTransaction_DTO
    {
        public string TransactionType { get; set; }
        public int? ReferenceNo { get; set; }
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
    }
}
