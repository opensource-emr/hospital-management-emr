using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PurchaseOrderModel
    {
        [Key]
        public int PurchaseOrderId { get; set; }
        public int? RequisitionId { get; set; }
        public int VendorId { get; set; }
        public DateTime? PoDate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal VAT { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string PORemark { get; set; }
        public string TermsConditions { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public bool? IsCancel { get; set; }
        public int? InvoiceHeaderId { get; set; }
        public virtual List<PurchaseOrderItemsModel> PurchaseOrderItems { get; set; }
        public VendorMasterModel Vendor { get; set; }
        [NotMapped]
        public string VendorName { get; set; }
        [NotMapped]
        public List<POVerifier> VerifierList { get; set; }
        public string VerifierIds { get; set; }
        public bool? IsVerificationEnabled { get; set; }
        public int? VerificationId { get; set; }
        [NotMapped]
        public int CurrentVerificationLevel { get; set; }
        [NotMapped]
        public int CurrentVerificationLevelCount { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        [NotMapped]
        public string VerificationStatus { get; set; }
        [NotMapped]
        public bool IsVerificationAllowed { get; set; }
        [NotMapped]
        public string VendorContact { get; set; }
        [NotMapped]
        public int? PRNumber { get; set; }
    }
    public class POVerifier
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
    }
}
