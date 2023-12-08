import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ProvisionalDischarge_DTO } from '../ip-billing/shared/dto/provisional-discharge.dto';
import { BillItemRequisition } from './bill-item-requisition.model';
import { BillingDeposit } from './billing-deposit.model';
import { DiscardProvisionalItems_DTO } from './dto/bill-discard-provisional-items.dto';
import { BillNewSettlement_DTO } from './dto/bill-new-settlement.dto';
import { HandOverTransactionModel } from './hand-over-transaction.model';
import { IpBillingDiscountModel } from './ip-bill-discount.model';

@Injectable()
export class BillingDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public jsonOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient, public coreService: CoreService, public securityService: SecurityService) {
  }

  public GetServiceDepartments() {
    return this.http.get<any>('/api/billing/ServiceDepartments', this.options);
  }

  public GetMembershipType() {
    return this.http.get<any>('/api/billing/MembershipTypes', this.options);
  }

  //combine both of these functions into one..//sudarshan:15July2017
  // public GetPatientMembershipInfo(patientId: number) {
  //   return this.http.get<any>('/api/billing/PatientMembershipInfo?patientId=' + patientId, this.options);
  // }

  public GetServiceDepartmentItems(serviceDeptId: number) {
    return this.http.get<any>('/api/billing/ServiceDepartmentItems?serviceDepartmentId=' + serviceDeptId, this.options);
  }
  public GetBillItemList() {
    return this.http.get<any>('/api/billing/BillCfgItems', this.options);
  }

  public GetDoctorList() {
    return this.http.get<any>('/api/Billing/ListDoctors', this.options);
  }
  public GetInsuranceBillingItems() {
    return this.http.get<any>('/api/billInsurance?reqType=insurance-billing-items', this.options);
  }
  public GetOrganizationList() {
    return this.http.get<any>('/api/billing/BillingCreditOrganizations', this.options);
  }

  //remove one of below two functions as both of them are calling same-API with same parameters.:sudarshan:11June'17
  public GetPendingDoctorOrdersTotal() {
    return this.http.get<any>('/api/billing/PendingDoctorOrderTotal', this.options);
  }

  // public GetCounter() {
  //   return this.http.get<any>('/api/billing/GetCounter', this.options);
  // }



  // public GetBillItemForOPDVisit(patientvisitId: number) {
  //   //patientvisitid is requisitionid for opd-ticket

  //   return this.http.get<any>("/api/Billing/OpdRequisitionItem?requisitionId=" + patientvisitId, this.options);
  // }
  public GetDoctorOrdersFromAllDepartments(patientId: number) {

    return this.http.get<any>('/api/billing/DoctorOrdersFromAllDepartments?patientId=' + patientId, this.options);
  }

  public GetPendingRequisitionsByDepartment(patientId: number, srvDeptId: number) {
    return this.http
      .get<any>("/api/Billing/PatientPendingRequisitionsByDepartmentName?patientId=" + patientId
        + '&serviceDepartmentId=' + srvDeptId, this.options);
  }
  public GetUnpaidTotalBills() {
    return this.http.get<any>("/api/Billing/PatientsProvisionalInfo", this.options);
  }

  public LoadAllProvisionalBills(fromDate, toDate) {
    return this.http.get<any>("/api/Billing/PatientsProvisionaItems?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetUnpaidInsuranceTotalBills() {
    return this.http.get<any>("/api/Billing/InsurancePatientsProvisionalInfo", this.options);
  }

  public GetInvoiceDetailsForDuplicatebill(from, to) {
    return this.http.get<any>("/api/Billing/Invoices?FromDate=" + from + "&ToDate=" + to, this.options);
  }

  public GetInvoiceReturnDetailsForDuplicatebill(from, to) {
    return this.http.get<any>("/api/Billing/CreditNotes?FromDate=" + from + "&ToDate=" + to, this.options);
  }

  public GetProvisionalReceiptDetailsForDuplicatebill(searchTxt) {
    return this.http.get<any>("/api/Billing/DuplicatePrint/ProvisionalReceipts?search=" + searchTxt);
  }

  public GetProvisionalItemsByPatientId(patientId: number, schemeId: number) {
    return this.http.get<any>("/api/Billing/ProvisionalItemsByPatientId?patientId=" + patientId + '&schemeId=' + schemeId, this.options);
  }

  public GetInsuranceProvisionalItemsByPatientId(patientId: number) {
    return this.http.get<any>("/api/Billing/InsurancePatientProvisionalItems?patientId=" + patientId, this.options);
  }

  // //Inpatient Provisional Items List from Nursing Module
  // public GetProvItemsByPatIdAndVisitId(patientId: number, patientVisitId: number) {
  //   return this.http.get<any>("/api/Billing/InPatientProvisionalItemsByPatientIdAndVisitId?patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options);
  // }

  public GetInPatientProvisionalItemList(patientId, patientVisitId, module) {
    return this.http.get<any>("/api/Billing/InPatientProvisionalItems?patientId=" + patientId + "&patientVisitId=" + patientVisitId + "&module=" + module, this.options);
  }

  public GetCreditBalanceByPatientVisitId(patientVisitId: number) {
    return this.http.get<any>("/api/Billing/PatientVisitCreditBalance?patientVisitId=" + patientVisitId, this.options);
  }

  // public GetInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number, getVisitInfo: boolean, isInsuranceReceipt: boolean) {
  //   return this.http.get<any>("/api/Billing/DuplicateBillByReceiptId?invoiceNo=" + receiptNo + "&fiscalYearId=" + fiscalYrId + "&getVisitInfo=" + getVisitInfo + "&isInsuranceReceipt=" + isInsuranceReceipt, this.options);
  // }

  public GetCreditNoteByCreditNoteNo(CreditNoteNo: number, fiscalYrId: number) {
    return this.http.get<any>("/api/BillReturn/CreditNoteInfo?creditNoteNum=" + CreditNoteNo + "&fiscalYearId=" + fiscalYrId, this.options);
  }

  // public GetInPatientDetailForPartialBilling(patId: number, patVisitId: number) {
  //   return this.http.get<any>("/api/Billing/InPatientForPartialBilling?patientVisitId=" + patVisitId, this.options);
  // }

  // public GetProvInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number) {
  //   return this.http.get<any>("/api/Billing/DuplicateProvisionalBillsByReceiptId?receiptNo=" + receiptNo + "&fiscalYearId=" + fiscalYrId, this.options);
  // }
  //Gets the latest billing receipt no. (for disabling the next button)
  // public GetlatestBillingReceiptNo() {
  //   return this.http.get<any>("/api/Billing/GetLatestBillingInvoiceNo", this.options);
  // }


  //Requisition Cancellation

  // public GetUnpaidItemsForCancellationbyPatientId(patientId: number) {
  //   return this.http.get<any>("/api/Billing/PatientUnpaidBillsForCancellation?patientId=" + patientId, this.options);
  // }
  // //Credit Cancellation
  // public GetCreditForCancellationbyPatientIdonBillTxnItems(patientId: number) {
  //   return this.http.get<any>("/api/Billing/PatientUnpaidBillsForCreditCancellation?patientId=" + patientId, this.options);
  // }


  // Get Details txn Item
  public GetTxnItemsForEditDoctor(searchTxt) {
    return this.http.get<any>("/api/Billing/GetTxnItemsForEditDoctor?FromDate=" + "" + "&ToDate=" + "" + "&search=" + searchTxt);
  }

  public GetTxnItemsForEditDoctorRad(searchTxt) {
    return this.http.get<any>("/api/Billing/GetTxnItemsForEditDoctorRad?FromDate=" + null + "&ToDate=" + null + "&search=" + searchTxt);
  }

  //Sud/yub: 11Aug'19--to get txn items by date - duplicate implementation needed for date filter.
  public GetTxnItemsForEditDoctorByDate(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Billing/GetTxnItemsForEditDoctor?FromDate=" + fromDate + "&ToDate=" + toDate + "&search=" + "");
  }

  public GetTxnItemsForEditDoctorByDateRad(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Billing/GetTxnItemsForEditDoctorRad?FromDate=" + fromDate + "&ToDate=" + toDate + "&search=" + null);
  }

  //this will return only those doctors which have OPD available.
  // public GetOPDDoctorsList() {
  //   return this.http.get<any>("/api/Billing/OpdDoctorList", this.options);
  // }

  // Get Doctor List
  public GetProviderList() {
    return this.http.get<any>("/api/Billing/GetProviderList", this.options);
  }

  public GetFractionApplicableItems() {
    return this.http.get<any>("/api/Billing?reqType=FractionApplicableItemsList", this.options);
  }

  public GetDoctorsList() {
    return this.http.get<DanpheHTTPResponse>("/api/Billing/ListDoctors", this.options);
  }

  //billing-package
  public GetBillingPackageList() {
    return this.http.get<any>("/api/Billing/BillingPackages");
  }
  //insurance-packages
  public GetInsurancePackages() {
    return this.http.get<any>("/api/BillInsurance?reqType=insurance-packages");
  }

  public GetCurrentFiscalYear() {
    return this.http.get<any>("/api/Billing/CurrentFiscalYear");
  }

  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing/BillingFiscalYears");
  }
  public GetPatientBillHistoryDetail(patientId: number) {
    return this.http.get<any>("/api/Billing/PatientBillHistoryDetail?patientId=" + patientId);
  }

  public GetPatientReturnedReceiptList(patientId: number) {
    return this.http.get<any>("/api/Billing/PatientReturnedInvoices_Old?patientId=" + patientId);
  }

  public GetHandoverTransactionDetails() {
    return this.http.get<any>("/api/Billing/HandoverTransactions", this.options);
  }
  public GetHandoverReceivedReport(fromDate, toDate) {
    return this.http.get<any>("/api/Billing/Report/HandoverReceive?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetTransferHandoverReceivedReport(fromDate: string, toDate: string, status: string, handoverType: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/TransferHandoverReport?fromDate=${fromDate}&toDate=${toDate}&status=${status}&handoverType=${handoverType}`, this.options);
  }

  public GetDailyCollectionVsHandoverReport(fromDate, toDate) {
    return this.http.get<any>("/api/Billing/Report/DailyCollectionVsHandover?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetHandoverDetailReport(fromDate, toDate, employeeId) {
    return this.http.get<any>("/api/Billing/Report/HandoverDetail?FromDate=" + fromDate + "&ToDate=" + toDate + "&EmployeeId=" + employeeId, this.options);
  }
  public GetHandoverSummaryReport(fiscalYrId: number) {
    return this.http.get<any>("/api/Billing/Report/HandoverSummary?fiscalYearId=" + fiscalYrId, this.options);
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
    return this.http.get<any>("/api/Billing/LabBillCfgItems?departmentName=" + qryStr + "&labType=" + labType, this.options);
  }

  //ClaimInsurance
  public UpdateInsuranceClaimed(billingTransactionIdList: number, counterId: number) {
    let data = JSON.stringify(billingTransactionIdList);
    return this.http.put<any>("/api/BillInsurance?reqType=update-insurance-claim&counterId=" + counterId, data, this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Visit/PatientCurrentVisitContext?patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }
  //this function is being used by other modules as well--check the dependencies while changing it
  public PostBillingItemRequisition(items: Array<BillItemRequisition>) {
    //here procCode  and Price is fetching from BillItemPrice to the BillItemRequisition Table
    let data = JSON.stringify(items);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>('/api/Billing/SaveBillItemsRequisition', data, this.options);
  }

  public PostBillingTransactionItems(billTranItems) {
    let data = JSON.stringify(billTranItems);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing/SaveBillingTransactionItems", data, this.options);
    //return this.http.post("/api/Billing?reqType=billTxnItems", data, this.options);
  }

  //check if we can use strongly typed parameter in below function.
  public PayProvisional(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing/PayProvisionalBills", data, this.options);

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
    return this.http.post<any>("/api/IpBilling/PostBillTransaction_Unused", data, this.options);

  }

  public PostIpBillTransactionAndDischarge(billTxn, pharmacyPendingBillItems, pharmacyTotal) {
    // let data = JSON.stringify(billTxn);
    // return this.http.post<any>("/api/IpBilling/PostBillTransactionAndDischarge", data, this.options);
    let pendingBills = { BillingPendingItems: billTxn, PharmacyPendingItem: pharmacyPendingBillItems, PharmacyTotalAmount: pharmacyTotal }
    return this.http.post<any>("/api/DischargeBilling/PostBillingAndPharmacyTransactionAndDischarge", pendingBills, this.jsonOptions);
  }



  // updateBillItemReqStatus--returns the same list of requisitionids which are passed here.
  //this method is not being used anywhere as of now..
  public PutStatusOfBillItemReqisitions(billItemReqIds: number[], status: string) {
    let data = JSON.stringify(billItemReqIds);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.put<any>("/api/Billing/UpdateBillItemsReqsStatus?status=" + status, data, this.options);
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
    return this.http.put<any>("/api/Billing/UpdateBillStatusForCreditCancellation?status=' + billingStatus + '&remarks=' + remarks + '&CreatedBy=" + cancelledBy, data, this.options);
  }

  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.http.put<any>("/api/Billing/InvoicePrintCount?PrintCount=" + printCount + "&billingTransactionId=" + billingTransactionId, this.options);
  }

  // Hom 16 Jan '19 Updating bill transaction items i.e discount %, item price
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/IpBilling/PutIpBillingTxnItems", data, this.options);
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
  public PutAssignedToDoctor(BillTxnItemId: number, performerObj, prescriberObj) {
    let data = JSON.stringify(BillTxnItemId);
    let strPerformer = JSON.stringify(performerObj);
    let strPrescriber = JSON.stringify(prescriberObj);
    return this.http.put<any>("/api/Billing/BillTxnItemDoctors?PrescriberObj=" + strPrescriber + '&PerformerObj=' + strPerformer, data, this.options);
  }

  public PutAssignedToDoctorRad(BillTxnItemId: number, RequisitionId: number, performerObj, prescriberObj) {
    let data = JSON.stringify(BillTxnItemId);
    let reqId = JSON.stringify(RequisitionId);
    let strPerformer = JSON.stringify(performerObj);
    let strPrescriber = JSON.stringify(prescriberObj);
    return this.http.put<any>("/api/Billing/UpdateDoctorafterDoctorEditRadiology?PrescriberObj=" + strPrescriber + '&PerformerObj=' + strPerformer + '&RequisitionId=' + reqId, data, this.options);
  }

  public CloseInsurancePackage(patientInsurancePkgId: number) {
    return this.http.put<any>("/api/BillInsurance?reqType=close-insurance-package&patientInsurancePkgId=" + patientInsurancePkgId, this.options);
  }


  //activate billing counter
  public ActivateBillingCounter(counterId: number) {
    return this.http.put<any>("/api/Security/ActivateBillingCounter?counterId=" + counterId, this.options);
  }
  //activate billing counter
  public DeActivateBillingCounter() {
    return this.http.put<any>("/api/Security/DeactivateBillingCounter", this.options);
  }
  //Cancel Multiple BillingTransactions
  public CancelMultipleBillTxnItems(billTransactionItems) {
    let data = JSON.stringify(billTransactionItems);
    return this.http.put<any>("/api/Billing/CancelBillingTransactionItems", data, this.options);
  }

  //Gets both Credit and deposit balance, After this is tested remove those two methods: sud-13May'18.
  public GetPatientPastBillSummary(patientId: number, schemeId: number = null) {
    return this.http.get<any>("/api/Billing/PatientsPastBillSummary?patientId=" + patientId + '&schemeId=' + schemeId, this.options);
  }

  //Gets both Credit and Insurance balance
  public GetPatientPastInsuranceBillSummary(patientId: number) {
    return this.http.get<any>("/api/Billing/InsurancePatientPastBillSummary?patientId=" + patientId, this.options);
  }

  //Start: REGION: FOR BillSettlements APIS
  public PutSettlementPrintCount(settlmntId: number) {
    return this.http.put<any>("/api/BillSettlement/PrintCount?settlementId=" + settlmntId, this.options);
  }
  // public GetPatientPastBillSummaryForBillSettlements(patientId: number, IsPatientAdmitted: boolean) {
  //   return this.http.get<any>("/api/Billing/PatientPastBillSummaryForBillSettlement?patientId=" + patientId + "&IsPatientAdmitted=" + IsPatientAdmitted, this.options);
  // }
  //for unclaimed insurance
  public GetUnclaimedInvoices(fromDate: any, toDate: any) {
    return this.http.get<any>("/api/BillInsurance?reqType=unclaimed-insurance-bills&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  //sud: 18may'18'
  public GetAllSettlements() {
    return this.http.get<any>("/api/BillSettlement/Settlements", this.options);
  }

  public GetPendingBillsForSettlement(organizationId) {
    return this.http.get<any>("/api/BillSettlement/PendingSettlements?OrganizationId=" + organizationId, this.options);
  }

  //used only in bill-settlements
  //sud:11Jan'23--This api is not used by any page. so commenting it.
  // public GetCreditInvoicesByPatient(patientId: number) {
  //   return this.http.get<any>("/api/BillSettlement?reqType=unpaidInvoiceByPatientId" + "&patientId=" + patientId, this.options);
  // }
  //to get all billing info of patient for settlement.
  public GetBillingInfoOfPatientForSettlement(patientId: number, organizationId: number) {
    return this.http.get<any>("/api/BillSettlement/PatientBillingInfo?patientId=" + patientId + "&organizationId=" + organizationId, this.options);
  }
  public GetSettlementSingleInvoicePreview(billingTransactionId: number) {
    return this.http.get<any>("/api/BillSettlement/InvoiceInfo?billingTransactionId=" + billingTransactionId, this.options);
  }

  public GetSettlementSingleInvoicePreviewForPharmacy(invoiceId: number) {
    return this.http.get<any>("/api/PharmacySettlement/PreviewInvoice?invoiceId=" + invoiceId, this.options);
  }
  public PostBillSettlement(settlementInfo: BillNewSettlement_DTO) {
    return this.http.post<any>("/api/BillSettlement/NewSettlement", settlementInfo, this.jsonOptions);

  }


  public GetSettlementInfoBySettlmentId(settlementId: number) {
    return this.http.get<any>("/api/BillSettlement/SettlementInfo?settlementId=" + settlementId, this.options);
  }

  //END: REGION: FOR BillSettlements APIS

  //START: REGION: FOR BillingDeposit APIS
  public GetDepositList() {
    return this.http.get<any>("/api/BillingDeposit/Deposits");
  }

  public GetPastTestList(patientId) {
    return this.http.get<any>("/api/Billing/PatientPastBillITxntems?patientId=" + patientId, this.options);
  }

  public PostBillingDeposit(BillingDeposit: BillingDeposit) {
    let data = JSON.stringify(BillingDeposit);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/BillingDeposit/NewDeposit", data, this.options);
  }

  // public PostHandoverDetails(handover: HandOverModel) {
  //   let data = JSON.stringify(handover);
  //   //data = CommonFunctions.EncodeRequestDataString(data);
  //   return this.http.post<any>("/api/Billing/PostHandoverDenominationDetail", data, this.options);
  // }
  public PostHandoverTransactionDetails(handoverTransaction: HandOverTransactionModel) {
    let data = JSON.stringify(handoverTransaction);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Billing/HandoverTransactionDetail", data, this.options);
  }

  public GetPendingIncomingHandOver() {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/PendingIncomingUserHandover`, this.options);
  }

  public GetPendingOutgoingHandOver(handOverType: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/PendingOutgoingHandover?handOverType=${handOverType}`, this.options);
  }

  public UpdateHandOverStatus(handOverTransactionId: number) {
    return this.http.put<DanpheHTTPResponse>(`/api/Billing/HandoverStatus?handOverTransactionId=${handOverTransactionId}`, this.options);
  }

  public UpdateHandoverTransactionDetails(handoverTransaction: HandOverTransactionModel) {
    let data = JSON.stringify(handoverTransaction);
    return this.http.put<any>("/api/Billing/HandoverTransactionDetail", data, this.options);
  }

  // public GetPreviousAmount() {
  //   return this.http.get<any>("/api/Billing/GetPreviousHandoverAmounts", this.options);
  // }

  //Deposit Deduct
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/BillingDeposit/PatientDeposits?patientId=" + patientId, this.options);
  }
  public GetDepositHead() {
    return this.http.get<DanpheHTTPResponse>("/api/BillingDeposit/GetDepositHead", this.options);
  }

  public PutDepositPrintCount(depositId: number) {
    return this.http.put<any>("/api/BillingDeposit/PrintCount?depositId=" + depositId, this.options);
  }
  //END: REGION: FOR BillingDeposit APIS

  //sud: 20Jun'18
  public GetPatientBillingContext(patientId: number) {
    //           else if (reqType == "patient-billing-context")
    return this.http.get<any>("/api/Billing/PatientBillingContext?patientId=" + patientId);
  }

  //sud: 20Aug'18
  public GetAdmissionNDepositsInfoForDischarge(patientvisitId: number) {
    return this.http.get<any>("/api/Billing?reqType=admNdepositInfoForDischarge&" + '&visitId=' + patientvisitId, this.options);
  }

  //sud: 20Aug'18
  public GetAdditionalInfoForDischarge(patientvisitId: number, billingTxnId: number) {
    return this.http.get<any>("/api/IpBilling/DischargeReceiptAdditionalInfo?ipVisitId=" + patientvisitId + "&billingTxnId=" + billingTxnId, this.options);
  }

  //Hom: 18 Dec'18
  public GetBillItemsForIPReceipt(patientId: number, billingTxnId: number, billStatus) {
    return this.http.get<any>("/api/IpBilling/BillItemsForDischargeReceipt_Unused?patientId="
      + patientId
      + '&billingTxnId=' + billingTxnId
      + '&billStatus=' + billStatus
      , this.options);
  }

  public GetProvisionalItemsInfoForPrint(patientId: number, provFiscalYrId: number, provReceiptNo: number, visitType: string, schemeId: number) {
    //don't send visittype in query string to server if it's null or empty from client side.
    if (visitType) {
      return this.http.get<any>("/api/Billing/PatientProvisionalSlip?patientId="
        + patientId + '&fiscalYearId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo + '&visitType=' + visitType + '&schemeId=' + schemeId, this.options);
    }
    else {
      return this.http.get<any>("/api/Billing/PatientProvisionalSlip?patientId="
        + patientId + '&fiscalYearId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo + '&schemeId=' + schemeId, this.options);
    }
  }
  public GetDetailForCancellationReceipt(patientId: number, provisionalReturnItemId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/BillCancellationReceipt?patientId=${patientId}&provisionalReturnItemId=${provisionalReturnItemId}`);
  }
  public GetDetailForIpCancellationItems(patientId: number, patientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Billing/InpatientsCancelledItems?patientId=${patientId}&patientVisitId=${patientVisitId}`);
  }

  public GetInsuranceProvisionalInfoForPrint(patientId: number, provFiscalYrId: number, provReceiptNo: number, visitType: string) {
    //don't send visittype in query string to server if it's null or empty from client side.
    if (visitType) {
      return this.http.get<any>("/api/Billing/InsurancePatientProvisionalSlip?patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo + '&visitType=' + visitType, this.options);
    }
    else {
      return this.http.get<any>("/api/Billing/InsurancePatientProvisionalSlip?patientId="
        + patientId + '&fiscalYrId=' + provFiscalYrId + '&provReceiptNo=' + provReceiptNo, this.options);
    }
  }

  // public GetHealthCardBillItem() {
  //   return this.http.get<any>("/api/Billing/HealthCardBillItem", this.options);
  // }
  //ashim: 17Aug 2018
  public PostReturnReceipt(formData: any) {
    // let data = JSON.stringify(returnReceipt);
    return this.http.post<any>("/api/BillReturn/PostReturnInvoice_Old", formData);
  }

  //ashim: 17Aug2018 : to get bill transaction in case of transfer visit
  public GetBillTxnByRequisitionId(requisitionId: number, patientId: number, departmentName: string) {
    return this.http.get<any>("/api/Billing/BillingTransactionByRequisitionId?requisitionId=" + requisitionId + '&patientId=' + patientId + '&departmentName=' + departmentName);
  }


  //Update quantity price doctor etc of billingtransaction item.
  //Sud: 25Sept'18
  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let data = JSON.stringify(billTxnItem);
    return this.http.put<any>("/api/Billing/EditItemPriceQtyDiscAndProvider", data, this.options);
  }


  public PutBedDurationBillTxn(visitId: number) {
    return this.http.put<any>("/api/IpBilling/ReCalculateBedQuantity?patientVisitId=" + visitId, this.options);
  }
  //User List
  public GetUserList() {
    return this.http.get<any>("/api/Billing/ListUsers", this.options);
  }
  public GetEmpDueAmount() {
    return this.http.get<any>("/api/Billing/EmployeeDueAmount", this.options);
  }
  public GetBankList() {
    return this.http.get<any>("/api/Billing/Banks", this.options);
  }
  //start: Yubaraj: 18Jul'19--For Insurance Billing
  public GetInsurancePatients() {
    return this.http.get<any>("/api/BillInsurance?reqType=insurance-patients-list", this.options);
  }
  //end: Yubaraj: 18Jul'19--For Insurance Billing

  //sud:13Mar'20--below is copy of the same function from SettingsDlService
  public GetAllReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings/Referrers", this.options);
  }


  //sud:30Apr'20--Active Employee List for reusablilty
  public GetActiveEmployeesList() {
    return this.http.get<any>("/api/Employee/ActiveEmployees", this.options);
  }

  //Anjana: 19Aug-2020: cancel bill items
  public CancelItemRequest(data: string) {
    return this.http.put<any>("/api/Billing/CancelInpatientItemFromWard", data, this.options);
  }
  public CancelProvisionBill(data: string) {
    return this.http.post<any>("/api/Billing/CancelProvisionBill", data, this.jsonOptions);
  }

  public CancelBillRequest(data: string) {
    return this.http.put<any>("/api/Billing/CancelOutpatientProvisionalItem", data, this.options);
  }


  //Sud:1May'21--For Credit Note
  public GetInvoiceDetailsForCreditNote(invoiceNumber: number, fiscalYrId: number, getVisitInfo: boolean, isInsuranceReceipt: boolean) {
    return this.http.get<any>("/api/BillReturn/InvoiceDetailsForCreditNote?invoiceNumber=" + invoiceNumber + "&fiscalYearId=" + fiscalYrId, this.options);
  }


  //sud:1May'21--For Credit Note.
  public PostCreditNote(retInvObject) {
    let data = JSON.stringify(retInvObject);
    return this.http.post<any>("/api/BillReturn/CreditNote", data, this.options);
  }

  //Sud:18May'21--For Credit Note
  public GetInvoiceDetailsForDuplicatePrint(invoiceNumber: number, fiscalYrId: number, billingTxnId: number) {
    return this.http.get<any>("/api/Billing/InvoiceInfo?invoiceNo=" + invoiceNumber + "&fiscalYearId=" + fiscalYrId + "&billingTransactionId=" + billingTxnId, this.options);
  }
  //Krishna, 19th'JAN'22, This updates the Discount Scheme and Discount percent on the Admission table..
  public UpdateDiscount(ipBillingDiscountModel: IpBillingDiscountModel) {
    return this.http.put<any>("/api/IpBilling/UpdateDiscounts", ipBillingDiscountModel, this.options);
  }

  public GetPharmacyPendingAmount(patientId: number, patientVisitId: number) {
    //sud:2Feb'23: below pharmacysales API expects (int patientId, int? priceCategoryId, int? patientVisitId, string memberNo),
    //but we're passing only patientId, check if we can refactor this into separate one.
    return this.http.get<any>(`/api/PharmacySales/PatientBillingSummary?patientId=${patientId}&patientVisitId=${patientVisitId}`, this.options);

  }
  public LoadItemsPriceByPriceCategory(selectedPriceCategoryId: number) {
    return this.http.get<any>("/api/Billing/BillCfgItemsByPriceCategoryId?priceCategoryId=" + selectedPriceCategoryId, this.options);

  }

  public GetRank() {
    return this.http.get("/api/Visit/GetRank", this.options);
  }

  public GetAllBillingDashBoardDataCardSummary() {
    return this.http.get(`/Reporting/BillingDashboardCardSummary`, this.options);
  }

  public GetBillingDashboardRankWisePatientInvoice(fromDate: string, toDate: string) {
    return this.http.get(`/Reporting/BillingDashboardRankWisePatientInvoiceCount?FromDate=${fromDate}&ToDate=${toDate}`);
  }
  public GetBillingDashboardMembershipWisePatientInvoice(fromDate: string, toDate: string) {
    return this.http.get(`/Reporting/BillingDashboardMembershipWisePatientInvoiceCount?FromDate=${fromDate}&ToDate=${toDate}`);
  }
  public GetBillingDashboardInpatientCensusReport(fromDate: string, toDate: string) {
    const totalDischargedPatients = this.http.get(`/Reporting/DischargedPatient?FromDate=${fromDate}&ToDate=${toDate}`);
    const totalAdmittedPatients = this.http.get(`/Reporting/TotalAdmittedPatient?FromDate=${fromDate}&ToDate=${toDate}`);
    const inpatientCensusWardWise = this.http.get(`/Reporting/AllWardCountDetail?FromDate=${fromDate}&ToDate=${toDate}`);

    return forkJoin([totalDischargedPatients, totalAdmittedPatients, inpatientCensusWardWise]);
  }

  public IsClaimed(latestClaimCode: number, patientId: number) {
    return this.http.get<any>(`/api/SSF/CheckClaimStatusLocally?latestClaimCode=${latestClaimCode}&patientId=${patientId}`, this.options);
  }

  public LoadBilCfgItemsVsPriceCategoryMapping() {
    return this.http.get(`/api/Billing/BillCfgItemsVsPriceCategoryMaps`, this.options);
  }
  public GetMedicareMemberDetail(patientId: number) {
    return this.http.get(`/api/Medicare/MedicareMemberDetail?patientId=${patientId}`, this.options);
  }

  //!Krishna 31stMarch'23 Below methods are copied from EMR_V2.3.1_manipal for Discharge Statement
  public GetEstimatePharmacyBillDetails(patientId: number) {
    return this.http.get<any>("/api/IpBilling/EstimationPharmacyBill?patientId=" + patientId, this.options);
  }

  public GetDischargeStatementList(fromDate: string, toDate: string) {
    return this.http.get<any>(`/api/DischargeBilling/Statements?fromDate=${fromDate}&toDate=${toDate}`, this.options);
  }

  public GetDischargeStatement(PatientId: number, DischargeStatementId: number, PatientVisitId) {
    return this.http.get<any>(`/api/DischargeBilling/StatementInfo?patientId=${PatientId}&dischargeStatementId=${DischargeStatementId}&patientVisitId=${PatientVisitId}`, this.options);
  }

  public GetDischargeStatementSummary(PatientId: number, PatientVisitId: number, DischargeStatementId: number) {
    return this.http.get<any>(`/api/DischargeBilling/SummaryInfo?patientId=${PatientId}&patientVisitId=${PatientVisitId}&dischargeStatementId=${DischargeStatementId}`, this.options);
  }


  public GetEstimateBillDetails(patientId: number, patientvisitId: number) {
    return this.http.get<any>("/api/IpBilling/EstimationBill?patientId=" + patientId + "&ipVisitId=" + patientvisitId, this.options);
  }
  public GetOrganizationDepositLists() {
    return this.http.get<any>("/api/BillingDeposit/OrganizationDeposits", this.options);
  }
  public GetPatientDepositsList(patientId: number) {
    return this.http.get<any>("/api/BillingDeposit/PatientDepositsList?patientId=" + patientId, this.options);
  }
  public PostProvisionalDischarge(provisionalDischarge: ProvisionalDischarge_DTO) {
    return this.http.post<DanpheHTTPResponse>("/api/ProvisionalDischarge/Discharge", provisionalDischarge, this.jsonOptions);
  }
  public GetProvisionalDischargeList() {
    return this.http.get<DanpheHTTPResponse>("/api/ProvisionalDischarge/ProvisionalDischargeList", this.jsonOptions);
  }
  public GetProvisionalDischargeItems(patientId: number, schemeId: number, patientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/ProvisionalDischarge/ProvisionalDischargeItems?patientId=${patientId}&schemeId=${schemeId}&patientVisitId=${patientVisitId}`, this.jsonOptions);
  }
  public GetPatientVisitContextForProvisionalPayment(patientId: number, patientVisitId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Visit/PatientVisitContextForProvisionalPayment?patientId=${patientId}&patientVisitId=${patientVisitId}`, this.jsonOptions);
  }
  public DiscardProvisionalItems(discardProvisionalItems: DiscardProvisionalItems_DTO) {
    return this.http.put<DanpheHTTPResponse>(`/api/ProvisionalDischarge/DiscardAllItems`, discardProvisionalItems, this.jsonOptions);
  }
  public PayProvisionalForProvisionalDischarge(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/ProvisionalDischarge/PayProvisional", data, this.options);
  }

  public UpdateProvisionalItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/Billing/UpdateProvisionalBillingTxnItems", data, this.options);
  }
}








