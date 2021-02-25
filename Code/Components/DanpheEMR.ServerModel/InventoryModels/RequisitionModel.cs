using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
     public class RequisitionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public int StoreId { get; set; } //foreign key refering to PHRM_MST_Store
        public int? DepartmentId { get; set; } //since the stock is unique according to storeId not Department Id, so it is made nullable.
        public DateTime? RequisitionDate { get; set; }
        public int CreatedBy { get; set; }
        public string  RequisitionStatus { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsCancel { get; set; }
        public string Remarks { get; set; }     //created for direct dispatch
        public string CancelRemarks { get; set; }
        public int RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public virtual List<RequisitionItemsModel> RequisitionItems { get; set; }
        public int? VerificationId { get; set; }
        [NotMapped]
        public  List<RequisitionItemsModel> CancelledItems { get; set; }
        [NotMapped]
        public List<int> PermissionIdList { get; set; }
        [NotMapped]
        public int CurrentVerificationLevel { get; set; }
        [NotMapped]
        public int CurrentVerificationLevelCount { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        [NotMapped]
        public string StoreName { get; set; }
        [NotMapped]
        public bool isVerificationAllowed { get; set; }
        [NotMapped]
        public string VerificationStatus { get; set; }
        [NotMapped]
        public string ReceivedBy { get; set; } //created for direct dispatch
        //[NotMapped] //This is removed because level 2 verifier can verify before level 1 verifier.
        //public string NextVerifiersPermissionName { get; set; } //This is not necessary as per the requirement. sanjit: 6 April,2020
        [NotMapped]
        public bool NewDispatchAvailable { get; set; }
    }
}
