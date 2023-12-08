import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ClaimBillReviewDTO } from './DTOs/ClaimManagement_BillReview_DTO';
import { InsuranceClaimPayment } from './DTOs/ClaimManagement_ClaimPayment_DTO';
import { InsurancePendingClaim } from './DTOs/ClaimManagement_PendingClaims_DTO';
import { SubmittedClaimDTO } from './DTOs/ClaimManagement_SubmittedClaim_DTO';
import { BillingCreditBillItem_DTO } from './DTOs/billing-credit-bill-item.dto';
import { PharmacyCreditBillItem_DTO } from './DTOs/pharmacy-credit-bill-item.dto';
import { ClaimManagementDLService } from './claim-management.dl.service';

@Injectable()

export class ClaimManagementBLService {

  constructor(
    private claimManagementDLService: ClaimManagementDLService
  ) { }

  //#region Get
  public GetInsuranceApplicableCreditOrganizations() {
    return this.claimManagementDLService.GetInsuranceApplicableCreditOrganizations()
      .map(res => { return res })
  }

  public GetBillReviewList(FromDate: string, ToDate: string, CreditOrganizationId: number) {
    return this.claimManagementDLService.GetClaimReviewList(FromDate, ToDate, CreditOrganizationId)
      .map(res => { return res });
  }

  public CheckClaimCode(claimCode: number) {
    return this.claimManagementDLService.CheckClaimCode(claimCode)
      .map(res => { return res });
  }

  public GetClaimSubmissionPendingList(CreditOrganizationId: number) {
    return this.claimManagementDLService.GetClaimSubmissionPendingList(CreditOrganizationId)
      .map(res => { return res });
  }

  public GetInvoicesByClaimSubmissionId(ClaimSubmissionId: number) {
    return this.claimManagementDLService.GetInvoicesByClaimSubmissionId(ClaimSubmissionId)
      .map(res => { return res });
  }

  public GetDocumentForPreviewByFileId(FileId: number) {
    return this.claimManagementDLService.GetDocumentForPreviewByFileId(FileId)
      .map(res => { return res });
  }

  public GetDocumentsByClaimCode(ClaimCode: number) {
    return this.claimManagementDLService.GetDocumentsByClaimCode(ClaimCode)
      .map(res => { return res });
  }

  public GetPaymentPendingClaims(CreditOrganizationId: number) {
    return this.claimManagementDLService.GetPaymentPendingClaims(CreditOrganizationId)
      .map(res => { return res });
  }

  public GetInsurancePayments(claimSubmissionId: number) {
    return this.claimManagementDLService.GetInsurancePayments(claimSubmissionId)
      .map(res => { return res });
  }

  public ClaimDetailsForPreview(claimSubmissionId: number) {
    return this.claimManagementDLService.ClaimDetailsForPreview(claimSubmissionId)
      .map(res => { return res });
  }

  public GetBillingCreditNotesByBillingTransactionId(BillingTransactionId: number) {
    return this.claimManagementDLService.GetBillingCreditNotesByBillingTransactionId(BillingTransactionId)
      .map(res => { return res });
  }

  public GetPharmacyCreditNotesByInvoiceId(InvoiceId: number) {
    return this.claimManagementDLService.GetPharmacyCreditNotesByInvoiceId(InvoiceId)
      .map(res => { return res });
  }

  public GetBillingCreditBillItems(BillingTransactionId: number) {
    return this.claimManagementDLService.GetBillingCreditBillItems(BillingTransactionId)
      .map(res => res);
  }

  public GetPharmacyCreditBillItems(PharmacyInvoiceId: number) {
    return this.claimManagementDLService.GetPharmacyCreditBillItems(PharmacyInvoiceId)
      .map(res => res);
  }

  public GetApiIntegrationNameByOrganizationId(OrganizationId: number) {
    return this.claimManagementDLService.GetApiIntegrationNameByOrganizationId(OrganizationId)
      .map(res => res);
  }


  //Hitting Other Controller than Claim Management
  public GetBankList() {
    return this.claimManagementDLService.GetBankList()
      .map(res => { return res });
  }

  public GetInvoiceReceiptByInvoiceId(invoiceId: number) {
    return this.claimManagementDLService.GetInvoiceReceiptByInvoiceId(invoiceId).map(res => res);
  }

  public GetPharmacySaleReturnInvoiceItemsByInvoiceId(invoiceId: number) {
    return this.claimManagementDLService.GetPharmacySaleReturnInvoiceItemsByInvoiceId(invoiceId)
      .map(res => { return res });
  }

  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.claimManagementDLService.GetPatientsWithVisitsInfo(searchTxt)
      .map(res => res);
  }
  //#endregion


  //#region Post
  public SendBillForClaimScrubbing(bills: Array<ClaimBillReviewDTO>) {
    return this.claimManagementDLService.SendBillForClaimScrubbing(bills)
      .map(res => { return res });
  }

  public SubmitClaim(claimDTO: SubmittedClaimDTO) {
    return this.claimManagementDLService.SubmitClaim(claimDTO)
      .map(res => { return res });
  }

  public AddInsuranceClaimPayment(claimPaymentObject: InsuranceClaimPayment) {
    return this.claimManagementDLService.AddInsuranceClaimPayment(claimPaymentObject)
      .map(res => { return res });
  }
  //#endregion


  //#region Put
  public UpdateClaimableStatus(bills: Array<ClaimBillReviewDTO>, claimableStatus: boolean) {
    return this.claimManagementDLService.UpdateClaimableStatus(bills, claimableStatus)
      .map(res => { return res });
  }

  public UpdateClaimableStatusOfClaimedInvoice(bill: ClaimBillReviewDTO, claimableStatus: boolean) {
    return this.claimManagementDLService.UpdateClaimableStatusOfClaimedInvoice(bill, claimableStatus)
      .map(res => { return res });
  }

  public RevertInvoiceBackToBillReview(bill: ClaimBillReviewDTO) {
    return this.claimManagementDLService.RevertInvoiceBackToBillReview(bill)
      .map(res => { return res });
  }

  public SaveClaimAsDraft(claimDTO: SubmittedClaimDTO) {
    return this.claimManagementDLService.SaveClaimAsDraft(claimDTO)
      .map(res => { return res });
  }

  public UpdateClaimableCode(bills: Array<ClaimBillReviewDTO>, claimCode: number) {
    return this.claimManagementDLService.UpdateClaimableCode(bills, claimCode)
      .map(res => { return res });
  }

  public UpdateApprovedAndRejectedAmount(claimDTO: InsurancePendingClaim) {
    return this.claimManagementDLService.UpdateApprovedAndRejectedAmount(claimDTO)
      .map(res => { return res });
  }

  public ConcludeClaim(claimSubmissionId: number) {
    return this.claimManagementDLService.ConcludeClaim(claimSubmissionId)
      .map(res => { return res });
  }

  public RevertClaimBackToClaimScrubbing(claimSubmissionId: number) {
    return this.claimManagementDLService.RevertClaimBackToClaimScrubbing(claimSubmissionId)
      .map(res => { return res });
  }

  public UpdateBillingCreditItemClaimableStatus(BillingCreditBillItem: BillingCreditBillItem_DTO) {
    let temp = _.omit(BillingCreditBillItem, ['ItemName', 'Quantity', 'TotalAmount']);
    return this.claimManagementDLService.UpdateBillingCreditItemClaimableStatus(temp)
      .map(res => res);
  }

  public UpdatePharmacyCreditItemClaimableStatus(PharmacyCreditBillItem: PharmacyCreditBillItem_DTO) {
    let temp = _.omit(PharmacyCreditBillItem, ['ItemName', 'Quantity', 'TotalAmount']);
    return this.claimManagementDLService.UpdatePharmacyCreditItemClaimableStatus(temp)
      .map(res => res);
  }

  public UpdateInsuranceClaimPayment(claimPaymentObject: InsuranceClaimPayment) {
    return this.claimManagementDLService.UpdateInsuranceClaimPayment(claimPaymentObject)
      .map(res => { return res });
  }
  //#endregion
  public GetECHSPatientWithVisitInformation(searchTxt) {
    return this.claimManagementDLService.GetECHSPatientWithVisitInformation(searchTxt)
      .map(res => res);
  }

}
