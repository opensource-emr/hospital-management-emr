using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using DanpheEMR.Services.Verification;

namespace DanpheEMR.Services.Inventory.DTO.InventoryRequisition
{
    public class InventoryRequisition_DTO
    {
        public int RequisitionId { get; set; }
        public int RequestFromStoreId { get; set; }
        public int? RequestToStoreId { get; set; }
        public int? DepartmentId { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public int CreatedBy { get; set; }
        public string RequisitionStatus { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsCancel { get; set; }
        public string Remarks { get; set; }
        public string CancelRemarks { get; set; }
        public int RequisitionNo { get; set; }
        public int? IssueNo { get; set; }
        public virtual List<InventoryRequisitionItem_DTO> RequisitionItems { get; set; }
        public DateTime? MatIssueDate { get; set; }
        public string MatIssueTo { get; set; }
        public int? VerificationId { get; set; }
        public List<InventoryRequisitionItem_DTO> CancelledItems { get; set; }
        public List<int> PermissionIdList { get; set; }
        public int CurrentVerificationLevel { get; set; }
        public int CurrentVerificationLevelCount { get; set; }
        public int MaxVerificationLevel { get; set; }
        public string StoreName { get; set; }
        public bool isVerificationAllowed { get; set; }
        public string VerificationStatus { get; set; }
        public string ReceivedBy { get; set; }
        public bool NewDispatchAvailable { get; set; }
        public int? ReqDisGroupId { get; set; }
        public int FiscalYearId { get; set; }
        public bool EnableReceiveFeature { get; set; }
        public bool IsDirectDispatched { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public List<Verifier_DTO> VerifierList { get; set; }
    }

}
