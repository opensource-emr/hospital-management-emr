using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class WARDSupplyAssetRequisitionModel
    {
        [Key]
        public int RequisitionId { get; set; }
        public DateTime RequisitionDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string RequisitionStatus { get; set; }
        public int? IssueNo { get; set; }
        public int? StoreId { get; set; }
        public int? SubStoreId { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int ModifiedBy { get; set; }
        public bool? IsCancel { get; set; }
        public string CancelRemarks { get; set; }
        public int? RequisitionNo { get; set; }
        public string Remarks { get; set; }
        public bool? IsDirectDispatch { get; set; }        

        [NotMapped]
        public virtual List<WARDSupplyAssetRequisitionItemsModel> RequisitionItemsList { get; set; }
        [NotMapped]
        public int MaxVerificationLevel { get; set; }
        [NotMapped]
        public string StoreName { get; set; }
        [NotMapped]
        public int? VerificationId { get; set; }
    }
}
