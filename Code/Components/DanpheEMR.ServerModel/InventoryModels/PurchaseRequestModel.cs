using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PurchaseRequestModel
    {
        [Key]
        public int PurchaseRequestId { get; set; }
        public int? PRNumber { get; set; } //max+1 logic
        public int? VendorId { get; set; }
        public DateTime RequestDate { get; set; }
        public string RequestStatus { get; set; } // active,withdrawn,cancelled,pending,complete
        public int? VerificationId { get; set; } //always references the latest verification id
        public string Remarks { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public Boolean IsActive { get; set; }
        public Boolean IsPOCreated { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual List<PurchaseRequestItemModel> PurchaseRequestItems { get; set; }
        [NotMapped]
        public string RequestedByName { get; set; }
        [NotMapped]
        public string VendorName { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        [NotMapped]
        public int CurrentVerificationLevelCount { get; set; }
        [NotMapped]
        public int CurrentVerificationLevel { get; set; }
        [NotMapped]
        public List<int> PermissionIdList { get; set; }
        [NotMapped]
        public bool isVerificationAllowed { get; set; }
        [NotMapped]
        public string VerificationStatus { get; set; }
    }
}
