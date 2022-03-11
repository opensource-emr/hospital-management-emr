import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BillItemRequisition } from './bill-item-requisition.model';
import { BillingTransaction } from './billing-transaction.model';
import { BillingTransactionItem } from './billing-transaction-item.model';
import { BillingDeposit } from './billing-deposit.model';
import { CommonFunctions } from "../../shared/common.functions";
import * as _ from 'lodash';
import { BillInvoiceReturnModel } from './bill-invoice-return.model';
import { BedDurationTxnDetailsVM } from '../ip-billing/shared/discharge-bill.view.models';
import { HandOverModel } from './hand-over.model';
import { DenominationModel } from './denomination.model';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { HandOverTransactionModel } from './hand-over-transaction.model';
import { IpBillingDiscountModel } from './ip-bill-discount.model';

@Injectable()
export class BillingDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient, public coreService: CoreService, public securityService: SecurityService) {
  }

  public GetServiceDepartments() {
    return this.http.get<any>('/api/billing?reqType=allServiceDepts', this.options);
  }

  public GetMembershipType() {
    return this.http.get<any>('/api/billing?reqType=membership-types', this.options);
  }

  //combine both of these functions into one..//sudarshan:15July2017
  public GetPatientMembershipInfo(patientId: number) {
    return this.http.get<any>('/api/billing?reqType=getPatMembershipInfo' + '&inputId=' + patientId, this.options);
  }

  public GetServiceDepartmentItems(serviceDeptId: number) {
    return this.http.get<any>('/api/billing?reqType=serviceDeptItems' + '&serviceDeptId=' + serviceDeptId, this.options);
  }
  public GetBillItemList() {
    return this.http.get<any>('/api/billing?reqType=billItemList', this.options);
  }
  public GetDoctorList() {
    return this.http.get<any>('/api/Billing?reqType=doctor-list', this.options);
  }
  public GetInsuranceBillingItems() {
    return this.http.get<any>('/api/billInsurance?reqType=insurance-billing-items', this.options);
  }
  public GetOrganizationList() {
    return this.http.get<any>('/api/billing?reqType=get-credit-organization-list', this.options);
  }

  //remove one of below two functions as both of them are calling same-API with same parameters.:sudarshan:11June'17
  public GetPendingDoctorOrdersTotal() {
    return this.http.get<any>('/api/billing?reqType=pendingDoctorOrderTotal', this.options);
  }

  public GetCounter() {
    return this.http.get<any>('/api/billing?reqType=getCounter', this.options);
  }



  public GetBillItemForOPDVisit(patientvisitId: number) {
    //patientvisitid is requisitionid for opd-ticket

    return this.http.get<any>("/api/Billing?reqType=OPDRequisitionItem" + '&requisitionId=' + patientvisitId, this.options);
  }
  public GetDoctorOrdersFromAllDepartments(patientId: number) {

    return this.http.get<any>('/api/billing?reqType=DoctorOrdersFromAllDepartments' + '&patientId=' + patientId, this.options);
  }

  public GetPendingRequisitionsByDepartment(patientId: number, srvDeptId: number) {
    return this.http
      .get<any>("/api/Billing?reqType=pendingReqsByDeptname" + '&patientId=' + patientId
        + '&serviceDeptId=' + srvDeptId, this.options);
  }
  public GetUnpaidTotalBills() {
    return this.http.get<any>("/api/Billing?reqType=listpatientunpaidtotal", this.options);
  }

  public LoadAllProvisionalBills(fromDate, toDate) {
    return this.http.get<any>("/api/Billing?reqType=allProvisionalItems" + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetUnpaidInsuranceTotalBills() {
    return this.http.get<any>("/api/Billing?reqType=listPatientInsuranceProvisional", this.options);
  }

  public GetInvoiceDetailsForDuplicatebill(from, to) {
    return this.http.get<any>("/api/Billing?reqType=listinvoicewisebill&FromDate=" + from + "&ToDate=" + to, this.options);
  }

  public GetInvoiceReturnDetailsForDuplicatebill(from, to) {
    return this.http.get<any>("/api/Billing?reqType=credit-note-list&FromDate=" + from + "&ToDate=" + to, this.options);
  }

  public GetProvisionalReceiptDetailsForDuplicatebill(searchTxt) {
    return this.http.get<any>("/api/Billing?reqType=listprovisionalwisebill&search=" + searchTxt);
  }

  public GetProvisionalItemsByPatientId(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=provisionalItemsByPatientId" + "&inputId=" + patientId, this.options);
  }

  public GetInsuranceProvisionalItemsByPatientId(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=insuranceprovisionalItemsByPatientId" + "&inputId=" + patientId, this.options);
  }

  //Inpatient Provisional Items List from Nursing Module
  public GetProvItemsByPatIdAndVisitId(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Billing?reqType=inPatProvItemsByPatIdAndVisitId" + "&InputId=" + patientId + "&patVisitId=" + patientVisitId, this.options);
  }

  public GetInPatientProvisionalItemList(patientId, patientVisitId, module) {
    return this.http.get<any>("/api/Billing?reqType=inPatientProvisionalItemList&patientId=" + patientId + "&visitId=" + patientVisitId + "&module=" + module, this.options);
  }

  public GetCreditBalanceByPatientId(patientVisitId: number) {
    return this.http.get<any>("/api/Billing?reqType=creditbalanceByPatientId" + "&inputId=" + patientVisitId, this.options);
  }

  public GetInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number, getVisitInfo: boolean, isInsuranceReceipt: boolean) {
    return this.http.get<any>("/api/Billing?reqType=duplicateBillsByReceiptId" + "&inputId=" + receiptNo + "&fiscalYrId=" + fiscalYrId + "&getVisitInfo=" + getVisitInfo + "&isInsuranceReceipt=" + isInsuranceReceipt, this.options);
  }

  public GetCreditNoteByCreditNoteNo(CreditNoteNo: number, fiscalYrId: number) {
    return this.http.get<any>("/api/BillReturn?reqType=CreditNoteByCreditNoteNo" + "&CreditNoteNo=" + CreditNoteNo + "&fiscalYrId=" + fiscalYrId, this.options);
  }

  public GetInPatientDetailForPartialBilling(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Billing?reqType=InPatientDetailForPartialBilling" + "&patientId=" + patId + "&patVisitId=" + patVisitId, this.options);
  }

  public GetProvInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number) {
    return this.http.get<any>("/api/Billing?reqType=duplicateProvisionalBillsByReceiptId" + "&inputId=" + receiptNo + "&fiscalYrId=" + fiscalYrId, this.options);

  }
  //Gets the latest billing receipt no. (for disabling the next button)
  public GetlatestBillingReceiptNo() {
    return this.http.get<any>("/api/Billing?reqType=getLatestReceiptNo", this.options);
  }


  //Requisition Cancellation

  public GetUnpaidItemsForCancellationbyPatientId(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=unpaidBillsbyPatientIdForCancellation" + "&inputId=" + patientId, this.options);
  }
  //Credit Cancellation
  public GetCreditForCancellationbyPatientIdonBillTxnItems(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=unpaidBillsbyPatientIdForCreditCancellation" + "&inputId=" + patientId, this.options);
  }


  // Get Details txn Item
  public GetTxnItemsForEditDoctor(searchTxt) {
    return this.http.get<any>("/api/Billing?reqType=GetTxnItemsForEditDoctor&search=" + searchTxt);
  }

  public GetTxnItemsForEditDoctorRad(searchTxt) {
    return this.http.get<any>("/api/Billing?reqType=GetTxnItemsForEditDoctorRad&search=" + searchTxt);
  }

  //Sud/yub: 11Aug'19--to get txn items by date - duplicate implementation needed for date filter.
  public GetTxnItemsForEditDoctorByDate(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Billing?reqType=GetTxnItemsForEditDoctor&FromDate=" + fromDate + "&ToDate=" + toDate);
  }

  public GetTxnItemsForEditDoctorByDateRad(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Billing?reqType=GetTxnItemsForEditDoctorRad&FromDate=" + fromDate + "&ToDate=" + toDate);
  }

  //this will return only those doctors which have OPD available.
  public GetOPDDoctorsList() {
    return this.http.get<any>("/api/Billing?reqType=opd-doctors-list", this.options);
  }

  // Get Doctor List
  public GetProviderList() {
    return this.http.get<any>("/api/Billing?reqType=GetProviderList", this.options);
  }

  public GetFractionApplicableItems() {
    return this.http.get<any>("/api/Billing?reqType=FractionApplicableItemsList", this.options);
  }

  public GetDoctorsList() {
    return this.http.get<any>("/api/Billing?reqType=doctor-list", this.options);
  }

  //billing-package
  public GetBillingPackageList() {
    return this.http.get<any>("/api/Billing?reqType=billing-packageList");
  }
  //insurance-packages
  public GetInsurancePackages() {
    return this.http.get<any>("/api/BillInsurance?reqType=insurance-packages");
  }

  public GetCurrentFiscalYear() {
    return this.http.get<any>("/api/Billing?reqType=current-fiscalYear");
  }

  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing?reqType=all-fiscalYears");
  }
  public GetPatientBillHistoryDetail(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=patient-bill-history-detail&patientId=" + patientId);
  }

  public GetPatientReturnedReceiptList(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=returned-patient-invoices&patientId=" + patientId);
  }

  public GetHandoverTransactionDetails() {
    return this.http.get<any>("/api/Billing?reqType=get-all-handover-transaction");
  }
  public GetHandoverReceivedReport(fromDate, toDate) {
    return this.http.get<any>("/api/Billing?reqType=get-handover-recive-report" + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetDailyCollectionVsHandoverReport(fromDate, toDate) {
    return this.http.get<any>("/api/Billing?reqType=get-dailyCollection-vs-handover-report" + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetHandoverDetailReport(fromDate, toDate, employeeId) {
    return this.http.get<any>("/api/Billing?reqType=get-handover-detail-report" + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&EmployeeId=" + employeeId, this.options);
  }
  public GetHandoverSummaryReport(fiscalYrId: number) {
    return this.http.get<any>("/api/Billing?reqType=get-handover-summary-report" + "&fiscalYrId=" + fiscalYrId, this.options);
  }

  public UpdateInsuranceBalance(patientId: number, insuranceProviderId: number, updatedInsBalance: number) {
    return this.http.put<any>("/api/BillInsurance?reqType=update-insurance-balance&patientId=" + patientId + "&insuranceProviderId=" + insuranceProviderId + "&updatedInsBalance=" + updatedInsBalance, this.options);
  }

  public GetLabBillingItems() {
    var qryStr = this.coreService.GetQryStrToGetLabItems();
    var type = this.securityService.getActiveLab().LabTypeName;
    var labType;
    if (type == "ERLab") {
      labType = "er-lab";
    } else {
      labType = "op-lab";
    }
    return this.http.get<any>("/api/Billing?reqType=department-items&departmentName=" + qryStr + "&labType=" + labType, this.options);
  }

  //ClaimInsurance
  public UpdateInsuranceClaimed(billingTransactionIdList: number, counterId: number) {
    let data = JSON.stringify(billingTransactionIdList);
    return this.http.put<any>("/api/BillInsurance?reqType=update-insurance-claim&counterId=" + counterId, data, this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Visit?reqType=patientCurrentVisitContext&patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }
  //this function is being used by other modules as well--check the dependencies while changing it
  public PostBillingItemRequisition(items: Array<BillItemRequisition>) {
    //here procCode  and Price is fetching from BillItemPrice to the BillItemRequisition Table
    let data = JSON.stringify(items);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>('/api/Billing?reqType=billItemsRequisition', data, this.options);
  }

  public PostBillingTransactionItems(billTranItems) {
    let data = JSON.stringify(billTranItems);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing?reqType=post-billingTransactionItems", data, this.options);
    //return this.http.post("/api/Billing?reqType=billTxnItems", data, this.options);
  }

  //check if we can use strongly typed parameter in below function.
  public PostBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing?reqType=post-billingTransaction", data, this.options);

  }
  public PostInvoice(billTxnModel) {
     //let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/Billing/billing-transaction", billTxnModel, this.options);

  }
  //Posts to the 'provisional-billing' api..
  public ProceedToProvisionalBilling(billTxnModel) {
   return this.http.post<any>("/api/Billing/provisional-billing", billTxnModel, this.options);

 }
  //ashim: 10Sep2018 : Added for package billing
  public PostPackageBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/billing?reqType=postBillingTxnWithPackage", data, this.options);

  }

  public PostIpBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/IpBilling?reqType=postBillTransaction", data, this.options);

  }



  // updateBillItemReqStatus--returns the same list of requisitionids which are passed here.
  //this method is not being used anywhere as of now..
  public PutStatusOfBillItemReqisitions(billItemReqIds: number[], status: string) {
    let data = JSON.stringify(billItemReqIds);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.put<any>("/api/Billing?reqType=billItemReqsStatus" + '&status=' + status, data, this.options);
  }



  public PutBillTransactionIdOnDeposit(Deposit: BillingDeposit) {
    let data = JSON.stringify(Deposit);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.put<any>("/api/Billing?reqType=billTxnIdOnDeposit", data, this.options);
  }


  //Cancel Credit Bills
  public PutBillStatusOnBillTxnItemCancellation(billTxnItemId: number, billingStatus: string, remarks: string, cancelledBy: number) {
    let data = billTxnItemId;// JSON.stringify(BillTransactionItemIds);
    //remarks = CommonFunctions.EncodeRequestDataString(remarks);
    return this.http.put<any>("/api/Billing?reqType=UpdateBillStatusForCreditCancellation" + '&status=' + billingStatus + '&remarks=' + remarks + '&CreatedBy=' + cancelledBy, data, this.options);
  }

  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.http.put<any>("/api/Billing?reqType=UpdatePrintCountafterPrint" + "&PrintCount=" + printCount + "&billingTransactionId=" + billingTransactionId, this.options);
  }

  // Hom 16 Jan '19 Updating bill transaction items i.e discount %, item price
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/IpBilling?reqType=update-billtxnItem", data, this.options);
  }

  //Update ProcedureType in admission
  public UpdateProcedure(admissionPatId, ProcedureType) {
    return this.http.put<any>("/api/Admission?reqType=update-Procedure" + "&AdmissionPatientId=" + admissionPatId + "&ProcedureType=" + ProcedureType, this.options);
  }

  //// update doctor after doctor edit feature
  //public PutAssignedToDoctor(BillTxnItemId: number, ProviderName: string, ProviderId: number) {
  //  let data = JSON.stringify(BillTxnItemId);
  //  return this.http.put<any>("/api/Billing?reqType=UpdateDoctorafterDoctorEdit&ProviderId=" + ProviderId + '&ProviderName=' + ProviderName, data, this.options);
  //}

  // update doctor after doctor edit feature
  public PutAssignedToDoctor(BillTxnItemId: number, providerObj, referrerObj) {
    let data = JSON.stringify(BillTxnItemId);
    let strProvider = JSON.stringify(providerObj);
    let strReferrer = JSON.stringify(referrerObj);
    return this.http.put<any>("/api/Billing?reqType=UpdateDoctorafterDoctorEdit&ReferrerObj=" + strReferrer + '&ProviderObj=' + strProvider, data, this.options);
  }

  public PutAssignedToDoctorRad(BillTxnItemId: number, RequisitionId: number, providerObj, referrerObj) {
    let data = JSON.stringify(BillTxnItemId);
    let reqId = JSON.stringify(RequisitionId);
    let strProvider = JSON.stringify(providerObj);
    let strReferrer = JSON.stringify(referrerObj);
    return this.http.put<any>("/api/Billing?reqType=UpdateDoctorafterDoctorEditRadiology&ReferrerObj=" + strReferrer + '&ProviderObj=' + strProvider + '&RequisitionId=' + reqId, data, this.options);
  }

  public CloseInsurancePackage(patientInsurancePkgId: number) {
    return this.http.put<any>("/api/BillInsurance?reqType=close-insurance-package&patientInsurancePkgId=" + patientInsurancePkgId, this.options);
  }


  //activate billing counter
  public ActivateBillingCounter(counterId: number) {
    return this.http.put<any>("/api/Security?reqType=activateBillingCounter&counterId=" + counterId, this.options);
  }
  //activate billing counter
  public DeActivateBillingCounter() {
    return this.http.put<any>("/api/Security?reqType=deActivateBillingCounter", this.options);
  }
  //Cancel Multiple BillingTransactions
  public CancelMultipleBillTxnItems(billTransactionItems) {
    let data = JSON.stringify(billTransactionItems);
    return this.http.put<any>("/api/Billing?reqType=cancelBillTxnItems", data, this.options);
  }
  public GetCancelItemsForGenReceipt(PatientId) {
    return this.http.get<any>("/api/Billing?reqType=getCancelItems" + "&inputId=" + PatientId, this.options);
  }

  //Gets both Credit and deposit balance, After this is tested remove those two methods: sud-13May'18.
  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=patientPastBillSummary" + "&inputId=" + patientId, this.options);
  }

  //Gets both Credit and Insurance balance
  public GetPatientPastInsuranceBillSummary(patientId: number) {
    return this.http.get<any>("/api/Billing?reqType=patientPastInsuranceBillSummary" + "&inputId=" + patientId, this.options);
  }

  //Start: REGION: FOR BillSettlements APIS
  public PutSettlementPrintCount(settlmntId: number) {
    return this.http.put<any>("/api/BillSettlement?reqType=updateSettlementPrintCount&settlementId=" + settlmntId, this.options);
  }
  public GetPatientPastBillSummaryForBillSettlements(patientId: number, IsPatientAdmitted: boolean) {
    return this.http.get<any>("/api/Billing?reqType=patientPastBillSummaryForBillSettlements" + "&inputId=" + patientId + "&IsPatientAdmitted=" + IsPatientAdmitted, this.options);
  }
  //for unclaimed insurance
  public GetUnclaimedInvoices(fromDate: any, toDate: any) {
    return this.http.get<any>("/api/BillInsurance?reqType=unclaimed-insurance-bills&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  //sud: 18may'18'
  public GetAllSettlements() {
    return this.http.get<any>("/api/BillSettlement?reqType=allSettlementDetails", this.options);
  }

  public GetPendingBillsForSettlement() {
    return this.http.get<any>("/api/BillSettlement?reqType=allPendingSettlements", this.options);
  }

  //used only in bill-settlements
  public GetCreditInvoicesByPatient(patientId: number) {
    return this.http.get<any>("/api/BillSettlement?reqType=unpaidInvoiceByPatientId" + "&patientId=" + patientId, this.options);
  }
  //to get all billing info of patient for settlement.
  public GetBillingInfoOfPatientForSettlement(patientId: number) {
    return this.http.get<any>("/api/BillSettlement?reqType=getAllBillingInfoOfPatientForSettlement" + "&patientId=" + patientId, this.options);
  }
  public GetSettlementSingleInvoicePreview(billingTransactionId: number) {
    return this.http.get<any>("/api/BillSettlement?reqType=get-settlement-single-invoice-preview" + "&billingTransactionId=" + billingTransactionId, this.options);
  }

  public PostBillSettlement(settlementInfo) {
    let data = JSON.stringify(settlementInfo);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/BillSettlement?reqType=postSettlementInvoice", data, this.options);

  }


  public GetSettlementInfoBySettlmentId(settlementId: number) {
    return this.http.get<any>("/api/BillSettlement?reqType=settlementInfoBySettlmntId" + "&settlementId=" + settlementId, this.options);
  }

  //END: REGION: FOR BillSettlements APIS

  //START: REGION: FOR BillingDeposit APIS
  public GetDepositList() {
    return this.http.get<any>("/api/BillingDeposit?reqType=deposit-list");
  }

  public GetPastTestList(patientId) {
    return this.http.get<any>("/api/Billing?reqType=past-test-list&patientId=" + patientId, this.options);
  }

  public PostBillingDeposit(BillingDeposit: BillingDeposit) {
    let data = JSON.stringify(BillingDeposit);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/BillingDeposit?reqType=Deposit", data, this.options);
  }

  public PostHandoverDetails(handover: HandOverModel) {
    let data = JSON.stringify(handover);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing?reqType=post-handover-denomination-detail", data, this.options);
  }
  public PostHandoverTransactionDetails(handoverTransaction: HandOverTransactionModel) {
    let data = JSON.stringify(handoverTransaction);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing?reqType=post-handover-transaction-detail", data, this.options);
  }

  public UpdateHandoverTransactionDetails(handoverTransaction: HandOverTransactionModel) {
    let data = JSON.stringify(handoverTransaction);
    return this.http.put<any>("/api/Billing?reqType=update-handover-transaction-detail", data, this.options);
  }

  public GetPreviousAmount() {
    return this.http.get<any>("/api/Billing?reqType=get-previous-amount", this.options);
  }

  //Deposit Deduct
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/BillingDeposit?reqType=patAllDeposits" + "&patientId=" + patientId, this.options);
  }

  public PutDepositPrintCount(depositId: number) {
    return this.http.put<any>("/api/BillingDeposit?reqType=updateDepositPrintCount&depositId=" + depositId, this.options);
  }
  //END: REGION: FOR BillingDeposit APIS

  //sud: 20Jun'18
  public GetPatientBillingContext(patientId: number) {
    //           else if (reqType == "patient-billing-context")
    return this.http.get<any>("/api/Billing?reqType=patient-billing-context&patientId=" + patientId);
  }

  //sud: 20Aug'18
  public GetAdmissionNDepositsInfoForDischarge(patientvisitId: number) {
    return this.http.get<any>("/api/Billing?reqType=admNdepositInfoForDischarge&" + '&visitId=' + patientvisitId, this.options);
  }

  //sud: 20Aug'18
  public GetAdditionalInfoForDischarge(patientvisitId: number, billingTxnId: number) {
    return this.http.get<any>("/api/IpBilling?reqType=additional-info-discharge-receipt&ipVisitId=" + patientvisitId + "&billingTxnId=" + billingTxnId, this.options);
  }

  public GetEstimateBillDetails(patientId: number, patientvisitId: number) {
    return this.http.get<any>("/api/IpBilling?reqType=bill-items-for-estimateBill&patientId=" + patientId + "&ipVisitId=" + patientvisitId, this.options);
  }

  //Hom: 18 Dec'18
  public GetBillItemsForIPReceipt(patientId: number, billingTxnId: number, billStatus) {
    return this.http.get<any>("/api/IpBilling?reqType=pat-bill-items-for-receipt&patientId="
      + patientId
      + '&billingTxnId=' + billingTxnId
      + '&billStatus=' + billStatus
      , this.options);
  }

  public GetProvisionalItemsInfoForPrint(patientId: number, provFiscalYrId: number, provReceiptNo: number, visitType: string) {
    //don't send visittype in query string to server if it's null or empty from client side. 
    if (visitType) {
      return this.http.get<any>("/api/Billing?reqType=ProvisionalItemsInfoForPrint&patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo + '&visitType=' + visitType, this.options);
    }
    else {
      return this.http.get<any>("/api/Billing?reqType=ProvisionalItemsInfoForPrint&patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo, this.options);
    }
  }

  public GetInsuranceProvisionalInfoForPrint(patientId: number, provFiscalYrId: number, provReceiptNo: number, visitType: string) {
    //don't send visittype in query string to server if it's null or empty from client side. 
    if (visitType) {
      return this.http.get<any>("/api/Billing?reqType=InsuranceProvisionalItemsInfoForPrint&patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo + '&visitType=' + visitType, this.options);
    }
    else {
      return this.http.get<any>("/api/Billing?reqType=InsuranceProvisionalItemsInfoForPrint&patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo, this.options);
    }
  }

  public GetHealthCardBillItem() {
    return this.http.get<any>("/api/Billing?reqType=GetHealthCardBillItem", this.options);
  }
  //ashim: 17Aug 2018
  public PostReturnReceipt(formData: any) {
    // let data = JSON.stringify(returnReceipt);
    return this.http.post<any>("/api/BillReturn?reqType=returnInvoice", formData);
  }

  //ashim: 17Aug2018 : to get bill transaction in case of transfer visit
  public GetBillTxnByRequisitionId(requistionId: number, patientId: number, departmentName: string) {
    return this.http.get<any>("/api/Billing?reqType=billTxn-byRequisitioId&requisitionId=" + requistionId + '&patientId=' + patientId + '&departmentName=' + departmentName);
  }


  //Update quantity price doctor etc of billingtransaction item.
  //Sud: 25Sept'18
  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let data = JSON.stringify(billTxnItem);
    return this.http.put<any>("/api/Billing?reqType=EditItemPrice_Qty_Disc_Provider", data, this.options);
  }

  //older code
  // public PutBedDurationBillTxn(bedDurationDetail: Array<BedDurationTxnDetailsVM>) {
  //   let data = JSON.stringify(bedDurationDetail);
  //   return this.http.put<any>("/api/IpBilling?reqType=update-adtItems-duration", data, this.options);
  // }

  public PutBedDurationBillTxn(visitId: number) {
    return this.http.put<any>("/api/IpBilling?reqType=update-adtItems-duration&patientVisitId=" + visitId, this.options);
  }
  //User List
  public GetUserList() {
    return this.http.get<any>("/api/Billing?reqType=get-users-list", this.options);
  }
  public GetEmpDueAmount() {
    return this.http.get<any>("/api/Billing?reqType=get-DueAmount", this.options);
  }
  public GetBankList() {
    return this.http.get<any>("/api/Billing?reqType=get-bank-list", this.options);
  }
  //start: Yubaraj: 18Jul'19--For Insurance Billing
  public GetInsurancePatients() {
    return this.http.get<any>("/api/BillInsurance?reqType=insurance-patients-list", this.options);
  }
  //end: Yubaraj: 18Jul'19--For Insurance Billing

  //sud:13Mar'20--below is copy of the same function from SettingsDlService
  public GetAllReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-all-referrer-list", this.options);
  }


  //sud:30Apr'20--Active Employee List for reusablilty
  public GetActiveEmployeesList() {
    return this.http.get<any>("/api/Employee?reqType=get-active-employees-info", this.options);
  }

  //Anjana: 19Aug-2020: cancel bill items
  public CancelItemRequest(data: string) {
    return this.http.put<any>("/api/Billing?reqType=cancelInpatientItemFromWard", data, this.options);
  }

  public CancelBillRequest(data: string) {
    return this.http.put<any>(
      "/api/Billing?reqType=cancelInpatientBillRequest",
      data,
      this.options
    );
  }


  //Sud:1May'21--For Credit Note
  public GetInvoiceDetailsForCreditNote(invoiceNumber: number, fiscalYrId: number, getVisitInfo: boolean, isInsuranceReceipt: boolean) {
    return this.http.get<any>("/api/BillReturn?reqType=getInvoiceDetailsForCreditNote" + "&invoiceNumber=" + invoiceNumber + "&fiscalYrId=" + fiscalYrId + "&getVisitInfo=" + getVisitInfo + "&isInsuranceReceipt=" + isInsuranceReceipt, this.options);
  }


  //sud:1May'21--For Credit Note.
  public PostCreditNote(retInvObject) {
    let data = JSON.stringify(retInvObject);
    return this.http.post<any>("/api/BillReturn?reqType=post-creditnote", data, this.options);
  }

  //Sud:18May'21--For Credit Note
  public GetInvoiceDetailsForDuplicatePrint(invoiceNumber: number, fiscalYrId: number, billingTxnId: number) {
    return this.http.get<any>("/api/Billing?reqType=get-invoiceinfo-forprint" + "&invoiceNumber=" + invoiceNumber + "&fiscalYrId=" + fiscalYrId + "&billingTransactionId=" + billingTxnId, this.options);
  }
  //Krishna, 19th'JAN'22, This updates the Discount Scheme and Discount percent on the Admission table..
  public UpdateDiscount(ipBillingDiscountModel:IpBillingDiscountModel) {
    return this.http.put<any>("/api/IpBilling/UpdateDiscounts", ipBillingDiscountModel, this.options);
  }
}








