using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMTransactionCreditBillItemStatusModel
    {
        [Key]
        public int PhrmCreditBillItemStatusId { get; set; }
        public int PhrmCreditBillStatusId { get; set; }
        public int InvoiceId { get; set; }
        public int InvoiceItemId { get; set; }
        public int ItemId { get; set; }
        public decimal NetTotalAmount { get; set; }
        public bool IsClaimable { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
    }
}
