
using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.Services.ClaimManagement;
using DanpheEMR.Services.ClaimManagement.DTOs;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace DanpheEMR.Controllers.ClaimManagement
{
    public class ClaimManagementController : CommonController
    {
        public readonly IClaimManagementService _IClaimManagementService; 
        private readonly ClaimManagementDbContext _claimManagementgDbContext;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public ClaimManagementController(IClaimManagementService iClaimManagementService, IOptions<MyConfiguration> _config) : base(_config)
        {
            _IClaimManagementService = iClaimManagementService;
            _claimManagementgDbContext = new ClaimManagementDbContext(connString);  
        }

        #region Get APIs
        [HttpGet]
        [Route("InsuranceApplicableCreditOrganizations")]
        public IActionResult InsuranceApplicableCreditOrganizations()
        {
            Func<object> func = () => _IClaimManagementService.GetInsuranceApplicableCreditOrganizations(_claimManagementgDbContext); 
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillReview")]
        public IActionResult GetBillForReview(DateTime FromDate, DateTime ToDate, int CreditOrganizationId)
        {
            Func<object> func = () => _IClaimManagementService.GetBillForClaimReview(FromDate,ToDate,CreditOrganizationId,_claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("IsClaimCodeAvailable")]
        public IActionResult IsClaimCodeAvailable(Int64 ClaimCode)
        {
            Func<object> func = () => _IClaimManagementService.CheckIsClaimCodeAvailable(ClaimCode, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PendingClaims")]
        public IActionResult GetPendingClaims(int CreditOrganizationId)
        {
            Func<object> func = () => _IClaimManagementService.GetPendingClaims(CreditOrganizationId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Claim/Invoices")]
        public IActionResult GetInvoicesByClaimId(int ClaimSubmissionId)
        {
            Func<object> func = () => _IClaimManagementService.GetInvoicesByClaimId(ClaimSubmissionId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Claim/PreviewDocument")]
        public IActionResult GetDocumentForPreviewByFileId(int fileId)
        {
            Func<object> func = () => _IClaimManagementService.GetDocumentForPreviewByFileId(fileId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("Claim/Documents")]
        public IActionResult GetDocumentsByClaimId(int ClaimCode)
        {
            Func<object> func = () => _IClaimManagementService.GetDocumentsByClaimCode(ClaimCode, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PaymentPendingClaims")]
        public IActionResult GetPaymentPendingClaims(int CreditOrganizationId)
        {
            Func<object> func = () => _IClaimManagementService.GetPaymentPendingClaims(CreditOrganizationId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("InsurancePayments")]
        public IActionResult GetInsurancePayments(int ClaimSubmissionId)
        {
            Func<object> func = () => _IClaimManagementService.GetInsurancePayments(ClaimSubmissionId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("ClaimDetails")]
        public IActionResult ClaimDetailsForPreview(int ClaimSubmissionId)
        {
            Func<object> func = () => _IClaimManagementService.GetClaimDetailsForPreview(ClaimSubmissionId, _claimManagementgDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("BillingCreditNotes")]
        public IActionResult BillingCreditNotes(int BillingTransactionId)
        {
            Func<object> func = () => _IClaimManagementService.GetBillingCreditNotes(BillingTransactionId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PharmacyCreditNotes")]
        public IActionResult PharmacyCreditNotes(int InvoiceId)
        {
            Func<object> func = () => _IClaimManagementService.GetPharmacyCreditNotes(InvoiceId, _claimManagementgDbContext);
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("BillingCreditBillItems")]
        public IActionResult BillingCreditBillItems(int BillingTransactionId)
        {
            Func<object> func = () => _IClaimManagementService.GetBillingCreditBillItems(BillingTransactionId, _claimManagementgDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("PharmacyCreditBillItems")]
        public IActionResult PharmacyCreditBillItems(int PharmacyInvoiceId)
        {
            Func<object> func = () => _IClaimManagementService.GetPharmacyCreditBillItems(PharmacyInvoiceId, _claimManagementgDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ApiIntegrationNameByOrganizationId")]
        public IActionResult ApiIntegrationNameByOrganizationId(int OrganizationId)
        {
            Func<object> func = () => _IClaimManagementService.GetApiIntegrationNameByOrganizationId(OrganizationId, _claimManagementgDbContext);
            return InvokeHttpGetFunction<object>(func);
        }

        [HttpGet]
        [Route("ECHSPatientWithVisitInformation")]
        public ActionResult ECHSPatientWithVisitInformation(string search)
        {
            Func<object> func = () => _IClaimManagementService.GetECHSPatientWithVisitInformation(search, _claimManagementgDbContext);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Post APIs
        [HttpPost]
        [Route("InsuranceClaim")]
        public IActionResult SendClaimForScrubbing([FromBody] List<ClaimBillReviewDTO> bill)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.SaveClaimScrubbing(currentUser, bill, _claimManagementgDbContext);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("SubmitClaim")]
        public IActionResult SubmitClaim([FromBody] SubmitedClaimDTO claimDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.SubmitClaim(currentUser, claimDTO, false, _claimManagementgDbContext);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("InsuranceClaimPayment")]
        public IActionResult InsuranceClaimPayment([FromBody] ClaimPaymentDTO paymentObject)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.InsuranceClaimPayment(currentUser, paymentObject, _claimManagementgDbContext);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Put APIs
        [HttpPut]
        [Route("ClaimableStatus")]
        public IActionResult ChangeClaimableStatus(Boolean claimableStatus,[FromBody] List<ClaimBillReviewDTO> bill)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateClaimableStatus(currentUser, claimableStatus, bill, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("Claim/Invoice/ClaimableStatus")]
        public IActionResult UpdateClaimableStatusOfClaimedInvoice(Boolean claimableStatus, [FromBody] ClaimBillReviewDTO bill)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateClaimableStatusOfClaimGeneratedInvoice(currentUser, claimableStatus, bill, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("RevertToBillReview")]
        public IActionResult RevertInvoiceBackToBillReview([FromBody] ClaimBillReviewDTO bill)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.RevertInvoiceToBillPreview(currentUser, bill, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("SaveClaimAsDraft")]
        public IActionResult SaveClaimAsDraft([FromBody] SubmitedClaimDTO claimDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.SubmitClaim(currentUser, claimDTO, true, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ClaimCode")]
        public IActionResult UpdateClaimCode(Int64 claimCode, [FromBody] List<ClaimBillReviewDTO> bill)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateClaimCodeOfInvoices(currentUser, claimCode, bill, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ClaimApprovedAndRejectedAmount")]
        public IActionResult UpdateApprovedAndRejectedAmount([FromBody] PendingClaimDTO claimDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateApprovedAndRejectedAmount(currentUser, claimDTO, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("ConcludeClaim")]
        public IActionResult ConcludeClaim(int ClaimSubmissionId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.ConcludeClaim(currentUser, ClaimSubmissionId, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }
        
        [HttpPut]
        [Route("RevertToClaimScrubbing")]
        public IActionResult RevertClaimToBackToClaimScrubbing(int ClaimSubmissionId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.RevertClaimToBackToClaimScrubbing(currentUser, ClaimSubmissionId, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("BillingCreditItemClaimableStatus")]
        public IActionResult BillingCreditItemClaimableStatus([FromBody] BillingCreditBillItemDTO BillingCreditBillItemDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateBillingCreditItemClaimableStatus(currentUser, BillingCreditBillItemDTO, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("PharmacyCreditItemClaimableStatus")]
        public IActionResult PharmacyCreditItemClaimableStatus([FromBody] PharmacyCreditBillItemDTO PharmacyCreditBillItemDTO)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdatePharmacyCreditItemClaimableStatus(currentUser, PharmacyCreditBillItemDTO, _claimManagementgDbContext);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("InsuranceClaimPayment")]
        public IActionResult UpdateInsuranceClaimPayment([FromBody] ClaimPaymentDTO paymentObject)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => _IClaimManagementService.UpdateInsuranceClaimPayment(currentUser, paymentObject, _claimManagementgDbContext);
            return InvokeHttpPostFunction(func);
        }
        #endregion

    }
}
