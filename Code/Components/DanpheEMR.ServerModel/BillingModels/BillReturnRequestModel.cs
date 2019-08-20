using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class BillReturnRequestModel
    {
        [Key]
        public int BillingReturnId { get; set; }
        public int BillingTransactionId { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int CounterId { get; set; }
        public int PatientId { get; set; }
        public int ItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public double? Price { get; set; }
        public double? SubTotal { get; set; }
        public double? DiscountAmount { get; set; }
        public double? Quantity { get; set; }
        public double? Tax { get; set; }
        public double? TotalAmount { get; set; }
        public DateTime ReturnDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ReturnRemarks { get; set; }
        //this will be employeeid of the current user..
        public int? CreatedBy { get; set; }
        public int? ProviderId { get; set; }
    }
}
