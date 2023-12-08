using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.Services.ClaimManagement.DTOs;
using System;
using System.Collections.Generic;

namespace DanpheEMR.Services.ClaimManagement
{
    public interface IClaimManagementService
    {
        #region Get
        List<CreditOrganizationDTO> GetInsuranceApplicableCreditOrganizations(ClaimManagementDbContext claimManagementDbContext);
        object GetBillForClaimReview(DateTime FromDate, DateTime ToDate, int CreditOrganizationId,ClaimManagementDbContext claimManagementDbContext);
        object CheckIsClaimCodeAvailable(Int64 ClaimCode, ClaimManagementDbContext claimManagementDbContext);
        object GetPendingClaims(int CreditOrganizationId,ClaimManagementDbContext claimManagementDbContext);
        object GetInvoicesByClaimId(int ClaimSubmissionId, ClaimManagementDbContext claimManagementDbContext);
        object GetDocumentForPreviewByFileId(int fileId, ClaimManagementDbContext claimManagementDbContext);
        object GetDocumentsByClaimCode(int ClaimCode, ClaimManagementDbContext claimManagementDbContext);
        object GetPaymentPendingClaims(int CreditOrganizationId, ClaimManagementDbContext claimManagementDbContext);
        object GetInsurancePayments(int ClaimSubmissionId, ClaimManagementDbContext claimManagementDbContext);
        object GetClaimDetailsForPreview(int ClaimSubmissionId, ClaimManagementDbContext _claimManagementgDbContext);
        object GetBillingCreditNotes(int BillingTransactionId, ClaimManagementDbContext claimManagementDbContext);
        object GetPharmacyCreditNotes(int InvoiceId, ClaimManagementDbContext claimManagementDbContext);
        object GetBillingCreditBillItems(int BillingTransactionId, ClaimManagementDbContext _claimManagementgDbContext);
        object GetPharmacyCreditBillItems(int PharmacyInvoiceId, ClaimManagementDbContext _claimManagementgDbContext);
        object GetApiIntegrationNameByOrganizationId(int OrganizationId, ClaimManagementDbContext _claimManagementgDbContext);
        object GetECHSPatientWithVisitInformation(string search, ClaimManagementDbContext _claimManagementgDbContext);
        #endregion

        #region POST
        object SaveClaimScrubbing(RbacUser currentUser, List<ClaimBillReviewDTO> bill, ClaimManagementDbContext claimManagementDbContext);
        object InsuranceClaimPayment(RbacUser currentUser, ClaimPaymentDTO paymentObject, ClaimManagementDbContext claimManagementDbContext);
        #endregion

        #region Put
        object UpdateClaimableStatus(RbacUser currentUser,Boolean claimableStatus, List<ClaimBillReviewDTO> bill, ClaimManagementDbContext claimManagementDbContext);
        object UpdateClaimableStatusOfClaimGeneratedInvoice(RbacUser currentUser, Boolean claimableStatus, ClaimBillReviewDTO bill, ClaimManagementDbContext _claimManagementgDbContext);
        object RevertInvoiceToBillPreview(RbacUser currentUser, ClaimBillReviewDTO bill, ClaimManagementDbContext _claimManagementgDbContext);
        object SubmitClaim(RbacUser currentUser, SubmitedClaimDTO claimDTO, Boolean IsForDraft, ClaimManagementDbContext claimManagementDbContext);
        object UpdateClaimCodeOfInvoices(RbacUser currentUser, Int64 claimCode, List<ClaimBillReviewDTO> bill, ClaimManagementDbContext claimManagementDbContext);
        object UpdateApprovedAndRejectedAmount(RbacUser currentUser, PendingClaimDTO claimObject, ClaimManagementDbContext _claimManagementgDbContext);
        object ConcludeClaim(RbacUser currentUser, int ClaimSubmissionId, ClaimManagementDbContext _claimManagementgDbContext);
        object RevertClaimToBackToClaimScrubbing(RbacUser currentUser, int ClaimSubmissionId, ClaimManagementDbContext _claimManagementDbContext);        
        object UpdateBillingCreditItemClaimableStatus(RbacUser currentUser, BillingCreditBillItemDTO BillingCreditBillItemDTO, ClaimManagementDbContext _claimManagementgDbContext);
        object UpdatePharmacyCreditItemClaimableStatus(RbacUser currentUser, PharmacyCreditBillItemDTO PharmacyCreditBillItemDTO, ClaimManagementDbContext _claimManagementgDbContext);
        object UpdateInsuranceClaimPayment(RbacUser currentUser, ClaimPaymentDTO paymentObject, ClaimManagementDbContext claimManagementDbContext);

        #endregion
    }
}
