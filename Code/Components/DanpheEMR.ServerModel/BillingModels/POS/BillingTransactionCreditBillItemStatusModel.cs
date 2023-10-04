using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels.POS
{
    public class BillingTransactionCreditBillItemStatusModel
    {
        [Key]
        public int BillingCreditBillItemStatusId { get; set; }
        public int BillingCreditBillStatusId { get; set; }
        public int BillingTransactionId { get; set; }
        public int BillingTransactionItemId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int ServiceItemId { get; set; }
        public decimal NetTotalAmount { get; set; }
        public bool IsClaimable { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
