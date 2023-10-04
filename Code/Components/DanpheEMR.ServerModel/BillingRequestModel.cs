using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class BillingRequestModel 
    {
        [Key]
        public int Id { get; set; }
        public int BillId { get; set; }
        public int BatchId { get; set; }
        public int PatientId { get; set; }
        public string PatientDepartment { get; set; }
        public int OrderId { get; set; }
        public int ItemId { get; set; }
        public int DepartId { get; set; }
        public decimal Amount { get; set; }
        public int PatientCategoryId { get; set; }
        public string DiscountType { get; set; }
        public decimal DiscountPercent { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal HstAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public float Quantity { get; set; }
        public int Status { get; set; }
        public int DiscountId { get; set; }
        public DateTime PaidDate { get; set; }
        public int BranchId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ReturnStatus { get; set; }
        public string PatientType { get; set; }
        public string CancelReason { get; set; }
        public int DoctorId { get; set; }
        public int ReferredDoctorId { get; set; }
        public string ReferredDoctorType { get; set; }
        public string Department { get; set; }
        public string Doctor { get; set; }
        public string Particulars { get; set; }
        public string BasicPrice { get; set; }
        public DateTime BillingDate { get; set; }
        public int HST { get; set; }
        public string Total { get; set; }
    }
}
