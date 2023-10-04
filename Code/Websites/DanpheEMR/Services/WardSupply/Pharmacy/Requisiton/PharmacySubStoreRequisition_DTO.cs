using DanpheEMR.ServerModel;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System;
using DanpheEMR.Services.Verification;

namespace DanpheEMR.Services.WardSupply.Pharmacy.Requisiton
{
    public class PharmacySubStoreRequisition_DTO
    {
        public int RequisitionId { get; set; }
        public int FiscalYearId { get; set; }
        public int RequisitionNo { get; set; }
        public int StoreId { get; set; }
        public DateTime RequisitionDate { get; set; }
        public string RequisitionStatus { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedOn { get; set; }
        public virtual List<PharmacySubStoreRequisitionItem_DTO> RequisitionItems { get; set; }
        public virtual List<Verifier_DTO> VerifierList { get; set; }
        public bool IsVerificationEnabled { get; set; }
        public string VerifierIds { get; set; }
        public int? VerificationId { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
    }
}
