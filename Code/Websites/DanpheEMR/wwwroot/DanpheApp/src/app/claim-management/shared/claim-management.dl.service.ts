import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs-compat';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ClaimBillReviewDTO } from './DTOs/ClaimManagement_BillReview_DTO';
import { InsuranceClaimPayment } from './DTOs/ClaimManagement_ClaimPayment_DTO';
import { InsurancePendingClaim } from './DTOs/ClaimManagement_PendingClaims_DTO';
import { SubmittedClaimDTO } from './DTOs/ClaimManagement_SubmittedClaim_DTO';
import { BillingCreditBillItem_DTO } from './DTOs/billing-credit-bill-item.dto';
import { PharmacyCreditBillItem_DTO } from './DTOs/pharmacy-credit-bill-item.dto';

@Injectable()
export class ClaimManagementDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(
    public http: HttpClient,
    public coreService: CoreService,
    public securityService: SecurityService
  ) { }


  //#region Get APIs
  public GetInsuranceApplicableCreditOrganizations(): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>("/api/ClaimManagement/InsuranceApplicableCreditOrganizations", this.options);
  }

  public GetClaimReviewList(FromDate: string, ToDate: string, CreditOrganizationId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/BillReview?FromDate=${FromDate}&ToDate=${ToDate}&CreditOrganizationId=${CreditOrganizationId}`, this.options);
  }

  public CheckClaimCode(claimCode: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/IsClaimCodeAvailable?ClaimCode=${claimCode}`, this.options);
  }

  public GetClaimSubmissionPendingList(CreditOrganizationId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/PendingClaims?CreditOrganizationId=${CreditOrganizationId}`, this.options);
  }

  public GetInvoicesByClaimSubmissionId(ClaimSubmissionId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/Claim/Invoices?ClaimSubmissionId=${ClaimSubmissionId}`, this.options);
  }

  public GetDocumentForPreviewByFileId(FileId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/Claim/PreviewDocument?FileId=${FileId}`, this.options);
  }

  public GetDocumentsByClaimCode(ClaimCode: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/Claim/Documents?ClaimCode=${ClaimCode}`, this.options);
  }

  public GetPaymentPendingClaims(CreditOrganizationId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/PaymentPendingClaims?CreditOrganizationId=${CreditOrganizationId}`, this.options);
  }

  public GetInsurancePayments(claimSubmissionId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/InsurancePayments?ClaimSubmissionId=${claimSubmissionId}`, this.options);
  }

  public ClaimDetailsForPreview(claimSubmissionId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<any>(`/api/ClaimManagement/ClaimDetails?ClaimSubmissionId=${claimSubmissionId}`, this.options);
  }

  public GetBillingCreditNotesByBillingTransactionId(BillingTransactionId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/BillingCreditNotes?BillingTransactionId=${BillingTransactionId}`, this.options);
  }

  public GetPharmacyCreditNotesByInvoiceId(InvoiceId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ClaimManagement/PharmacyCreditNotes?InvoiceId=${InvoiceId}`, this.options);
  }

  public GetBillingCreditBillItems(BillingTransactionId: number) {
    return this.http.get<any>(`/api/ClaimManagement/BillingCreditBillItems?BillingTransactionId=${BillingTransactionId}`, this.options);
  }

  public GetPharmacyCreditBillItems(PharmacyInvoiceId: number) {
    return this.http.get<any>(`/api/ClaimManagement/PharmacyCreditBillItems?PharmacyInvoiceId=${PharmacyInvoiceId}`, this.options);
  }

  public GetApiIntegrationNameByOrganizationId(OrganizationId: number) {
    return this.http.get<any>(`/api/ClaimManagement/ApiIntegrationNameByOrganizationId?OrganizationId=${OrganizationId}`, this.options);
  }

  //Other Controller Get APIs

  public GetBankList(): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/Banks`, this.options);
  }

  // public GetInvoiceDetailsForDuplicatePrint(invoiceNumber: number, fiscalYrId: number, billingTxnId: number) {
  //     return this.http.get<any>("/api/Billing/InvoiceInfo?invoiceNo=" + invoiceNumber + "&fiscalYearId=" + fiscalYrId + "&billingTransactionId=" + billingTxnId, this.options);
  // }

  public GetInvoiceReceiptByInvoiceId(invoiceId: number) {
    return this.http.get<any>(`/api/PharmacySales/InvoiceReceiptByInvoiceId?InvoiceId=${invoiceId}`, this.options);
  }

  public GetPharmacySaleReturnInvoiceItemsByInvoiceId(invoiceId: number): Observable<DanpheHTTPResponse> {
    return this.http.get<any>("/api/PharmacySalesReturn/CreditNotesInfo?invoiceId=" + invoiceId, this.options);
  }

  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>(`/api/Patient/PatientWithVisitInfo?search=${searchTxt}&showIpPatinet=${true}`, this.options);
  }
  //#endregion


  //#region Post APIs
  public SendBillForClaimScrubbing(bills: Array<ClaimBillReviewDTO>): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>(`/api/ClaimManagement/InsuranceClaim`, bills, this.optionJson);
  }

  public SubmitClaim(claimDTO: SubmittedClaimDTO): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>(`/api/ClaimManagement/SubmitClaim`, claimDTO, this.optionJson);
  }

  public AddInsuranceClaimPayment(claimPaymentObject: InsuranceClaimPayment): Observable<DanpheHTTPResponse> {
    return this.http.post<DanpheHTTPResponse>(`/api/ClaimManagement/InsuranceClaimPayment`, claimPaymentObject, this.optionJson);
  }
  //#endregion


  //#region Put APIs
  public UpdateClaimableStatus(bills: Array<ClaimBillReviewDTO>, claimableStatus: boolean): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/ClaimableStatus?claimableStatus=${claimableStatus}`, bills, this.optionJson);
  }

  public UpdateClaimableStatusOfClaimedInvoice(bill: ClaimBillReviewDTO, claimableStatus: boolean): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/Claim/Invoice/ClaimableStatus?claimableStatus=${claimableStatus}`, bill, this.optionJson);
  }

  public RevertInvoiceBackToBillReview(bill: ClaimBillReviewDTO): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/RevertToBillReview`, bill, this.optionJson);
  }

  public SaveClaimAsDraft(claimDTO: SubmittedClaimDTO): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/SaveClaimAsDraft`, claimDTO, this.optionJson);
  }

  public UpdateClaimableCode(bills: Array<ClaimBillReviewDTO>, claimCode: number): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/ClaimCode?claimCode=${claimCode}`, bills, this.optionJson);
  }

  public UpdateApprovedAndRejectedAmount(claimDTO: InsurancePendingClaim): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/ClaimApprovedAndRejectedAmount`, claimDTO, this.optionJson);
  }

  public ConcludeClaim(claimSubmissionId: number): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/ConcludeClaim?ClaimSubmissionId=${claimSubmissionId}`, this.options);
  }

  public RevertClaimBackToClaimScrubbing(claimSubmissionId: number): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/RevertToClaimScrubbing?ClaimSubmissionId=${claimSubmissionId}`, this.options);
  }

  public UpdateBillingCreditItemClaimableStatus(BillingCreditBillItem: BillingCreditBillItem_DTO): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/BillingCreditItemClaimableStatus`, BillingCreditBillItem, this.optionJson);
  }

  public UpdatePharmacyCreditItemClaimableStatus(PharmacyCreditBillItem: PharmacyCreditBillItem_DTO): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/PharmacyCreditItemClaimableStatus`, PharmacyCreditBillItem, this.optionJson);
  }

  public UpdateInsuranceClaimPayment(claimPaymentObject: InsuranceClaimPayment): Observable<DanpheHTTPResponse> {
    return this.http.put<DanpheHTTPResponse>(`/api/ClaimManagement/InsuranceClaimPayment`, claimPaymentObject, this.optionJson);
  }
  //#endregion

  public GetECHSPatientWithVisitInformation(searchText: string) {
    return this.http.get<any>(`/api/ClaimManagement/ECHSPatientWithVisitInformation?search=${searchText}`, this.optionJson);
  }
}
