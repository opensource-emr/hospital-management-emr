import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { BedDurationTxnDetailsVM, DischargeDetailBillingVM } from "../ins-ipd-billing/shared/discharge-bill.view.models";
import { BillingDeposit } from "../../billing/shared/billing-deposit.model";
@Injectable({
  providedIn: "root",
})
export class InsuranceDlService {
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  constructor(public http: HttpClient) {

  }
  GetLatestVisitClaimCode(patientId) {
    return this.http.get<any>("/api/Insurance?reqType=get-latest-visit-claim-code&patientId="
      + patientId,
      this.options);
  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode) {
    return this.http.get<any>("/api/Insurance?reqType=GetMatchingPatList&FirstName="
      + FirstName +
      "&LastName=" + LastName +
      "&PhoneNumber=" + PhoneNumber +
      "&Age=" + Age +
      "&Gender=" + Gender +
      "&IsInsurance=" + IsInsurance +
      "&IMISCode=" + IMISCode,
      this.options);
  }
  public GetPatientsListByNshiNumber(Ins_NshiNumber: string) {
    return this.http.get<any>("/api/Insurance?reqType=getPatientsListByNshiNumber&Ins_NshiNumber="
      + Ins_NshiNumber, this.options)
  }
  public GetInsuranceProviderList() {
    return this.http.get<any>("/api/Insurance?reqType=insurance-providers", this.options);
  }
  //posting the patient
  public PostGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>(
      "/api/Insurance?reqType=gov-insurance-patient",
      data,
      this.options
    );
  }

  public UpdateGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>(
      "/api/Insurance?reqType=update-gov-insurance-patient",
      data,
      this.options
    );
  }

  public UpdateInsuranceBalance(insBalObjString: string) {
    let data = insBalObjString;
    return this.http.put<any>(
      "/api/Insurance?reqType=update-insurance-balance",
      data,
      this.options
    );
    //return this.http.put<any>("/api/Insurance?reqType=update-insurance-balance&patientId=" + patientId + "&insuranceProviderId=" + insuranceProviderId + "&updatedInsBalance=" + updatedInsBalance, this.options);
  }

  public GetInsurancePatients() {
    return this.http.get<any>(
      "/api/Insurance?reqType=govinsurance-patients-list",
      this.options
    );
  }

  //sud:10-Oct'21--Needed separate server side search in insurance module. 
   public SearchInsurancePatients(searchText) {
    return this.http.get<any>(
      "/api/Insurance?reqType=search-gov-ins-patient&searchText=" + searchText,
      this.options
    );
  }

  public GetInsBalanceHistory(patientId) {

    return this.http.get<any>(
      "/api/Insurance?reqType=insurance-upadte-balance-history&patientId=" + patientId,
      this.options
    );
  }
  public GetVisitsByStatus(status: string, maxdayslimit, searchTxt) {
    return this.http.get<any>(
      "/api/Insurance?&reqType=get-ins-patient-visit-list&status=" + status + "&dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options
    );
  }
  //get insurance patient visit list....
  public GetInsPatientVisits(maxdayslimit, searchTxt) {
    return this.http.get<any>(
      "/api/Insurance?&reqType=get-ins-patient-visit-list&dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options
    );
  }
  public GetPatientById(patientId) {
    return this.http.get<any>("/api/Patient?reqType=getPatientByID&patientId=" + patientId, this.options);
  }

  // new VISIT
  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.http.get<any>("/api/Insurance?&reqType=get-dept-opd-items", this.options);
  }
  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.http.get<any>("/api/Insurance?&reqType=get-dept-followup-items", this.options);
  }
  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.http.get<any>("/api/Insurance?&reqType=get-doc-followup-items", this.options);
  }
  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.http.get<any>("/api/Insurance?&reqType=get-doc-oldpatient-opd-items", this.options);
  }
  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.http.get<any>("/api/Insurance?&reqType=get-dept-oldpatient-opd-items", this.options);
  }
  //gets all doctors who has AppointmentApplicable==true and IsActive==true.
  public GetVisitDoctors() {
    return this.http.get<any>("/api/Insurance?&reqType=get-visit-doctors", this.options);
  }
  public GetBillItemList() {
    return this.http.get<any>("/api/Insurance?reqType=billItemList", this.options);
  }
  public GetDoctorOpdPrices() {
    return this.http.get<any>("/api/Insurance?&reqType=get-doc-opd-prices", this.options);

  }
  // getting the departmnet
  public GetDepartment() {
    return this.http.get<any>("/api/Insurance?reqType=department");
  }
  public GetPatHealthCardStatus(patientId: number) {
    return this.http.get<any>("/api/Insurance?reqType=getPatHealthCardStatus&patientId=" + patientId, this.options);
  }
  public GetPatientVisitList(patientId) {
    return this.http.get<any>("/api/Insurance?&reqType=patient-visitHistory&patientId=" + patientId, this.options);
  }
  public GetBillTxnByRequisitionId(requistionId: number, patientId: number, departmentName: string) {
    return this.http.get<any>("/api/Insurance?reqType=billTxn-byRequisitioId&requisitionId=" + requistionId + '&patientId=' + patientId + '&departmentName=' + departmentName);
  }
  public GetHealthCardBillItem() {
    return this.http.get<any>("/api/Insurance?reqType=GetHealthCardBillItem", this.options);
  }
  public GetPatientBillingContext(patientId: number) {
    //           else if (reqType == "patient-billing-context")
    return this.http.get<any>("/api/Insurance?reqType=patient-billing-context&patientId=" + patientId);
  }
  public GetOrganizationList() {
    return this.http.get<any>('/api/Insurance?reqType=get-credit-organization-list', this.options);
  }
  public GetVisitList(claimCode: number, patId: number) {
    return this.http.get<any>("/api/Insurance?&reqType=existingClaimCode-VisitList&claimCode=" + claimCode + "&patientId=" + patId, this.options);
  }
  public GetPatientVisitList_Today(patientId) {
    return this.http.get<any>("/api/Insurance?&reqType=patient-visitHistory-today&patientId=" + patientId, this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Master?type=GetCountrySubDivision&countryId=" + countryId, this.options);
  }

  public GetInPatientDetailForPartialBilling(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Insurance?reqType=InPatientDetailForPartialBilling" + "&patientId=" + patId + "&patVisitId=" + patVisitId, this.options);
  }
  public GetClaimCode() {
    return this.http.get<any>("/api/Insurance?reqType=get-new-claimCode", this.options);
  }
  public GetOldClaimcode(patId) {
    return this.http.get<any>("/api/Insurance?reqType=get-patient-old-claimCode&patientId=" + patId, this.options);
  }
  public GetActiveEmployeesList() {
    return this.http.get<any>("/api/Insurance?reqType=get-active-employees-info", this.options);
  }
  public GetDoctorsList() {
    return this.http.get<any>("/api/Insurance?reqType=doctor-list", this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Insurance?reqType=patientCurrentVisitContext&patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }
  public GetInsuranceBillingItems() {
    return this.http.get<any>('/api/Insurance?reqType=insurance-billing-items', this.options);
  }
  public GetPatientVisitsProviderWise(patientId) {
    return this.http.get<any>("/api/Insurance?&reqType=patient-visit-providerWise&patientId=" + patientId, this.options);
  }
  //Deposit Deduct
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/Insurance?reqType=patAllDeposits" + "&patientId=" + patientId, this.options);
  }
  //Gets both Credit and deposit balance, After this is tested remove those two methods: sud-13May'18.
  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<any>("/api/Insurance?reqType=patientPastBillSummary" + "&inputId=" + patientId, this.options);
  }
  // Get Doctor List
  public GetProviderList() {
    return this.http.get<any>("/api/Insurance?reqType=GetProviderList", this.options);
  }
  //aniket: 30Mar'21 Discharge patient Info
  public GetAdditionalInfoForDischarge(patientvisitId: number, billingTxnId: number) {
    return this.http.get<any>("/api/Insurance?reqType=additional-info-discharge-receipt&ipVisitId=" + patientvisitId + "&billingTxnId=" + billingTxnId, this.options);
  }
  //POST:
  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostVisitToDB(patientVisitDataJSON: string) {
    //let data = JSON.stringify(patientVisitData);
    return this.http.post<any>("/api/Insurance?reqType=patientVisitCreate", patientVisitDataJSON, this.options);
  }
  public PostReturnReceipt(formData: any) {
    // let data = JSON.stringify(returnReceipt);
    return this.http.post<any>("/api/Insurance?reqType=returnInvoice", formData);
  }
  public PostVisitsFromBillingTransaction(visits: string) {
    return this.http.post<any>("/api/Insurance?reqType=billing-visits", visits, this.options);
  }
  public PostBillingTransactionItems(billTranItems) {
    let data = JSON.stringify(billTranItems);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Insurance?reqType=post-billingTransactionItems", data, this.options);
  }
  //posting the requisitions in requistion table
  public PostToRequisition(requisitionObjString: string) {
    let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
    return this.http.post<any>("/api/Insurance?reqType=addNewRequisitions", data, this.options);

  }
  //imaging-requistion-component
  //post all the requisition items
  public PostRequestItems(reqItemList: Array<ImagingItemRequisition>) {
    let data = JSON.stringify(reqItemList);
    return this.http.post<any>('/api/Insurance?reqType=postRequestItems', data, this.options);
  }

  public PostFreeFollowupVisit(visitData) {
    let visJson = JSON.stringify(visitData);
    return this.http.post<any>("/api/Insurance?reqType=ins-free-followup-visit", visJson, this.options);
  }
  public PostPaidFollowupVisit(fwupVisitDataJSON: string) {

    return this.http.post<any>("/api/Insurance?reqType=ins-paid-followup-visit", fwupVisitDataJSON, this.options);
  }
  public PostIpBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/Insurance?reqType=postBillTransaction", data, this.options);
  }
  public PostBillingDeposit(BillingDeposit: BillingDeposit) {
    let data = JSON.stringify(BillingDeposit);
    return this.http.post<any>("/api/Insurance?reqType=Deposit", data, this.options);
  }
  public PostBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/Insurance?reqType=post-billingTransaction", data, this.options);

  }

  public PostInsuranceOpBilling(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/Insurance/insurance-billing", data, this.options);

  }
  public PostInsuranceProvisional(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/Insurance/insurance-provisional-billing", data, this.options);

  }

  //PUT:
  //update status of appointment using appointmentId
  public PutAppointmentStatus(appointmentId: number, status: string, providerId: number, providerName: string) {
    return this.http.put<any>("/api/Insurance?&reqType=updateAppStatus"
      + "&appointmentId=" + appointmentId
      + '&status=' + status
      + "&ProviderId=" + providerId
      + "&ProviderName=" + providerName, null);
  }
  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.http.put<any>("/api/Insurance?reqType=UpdatePrintCountafterPrint" + "&PrintCount=" + printCount + "&billingTransactionId=" + billingTransactionId, this.options);
  }
  // new visit 

  //Update ProcedureType in admission
  public UpdateProcedure(admissionPatId, ProcedureType) {
    return this.http.put<any>("/api/Insurance?reqType=update-Procedure" + "&AdmissionPatientId=" + admissionPatId + "&ProcedureType=" + ProcedureType, this.options);
  }
  //Older code
  // public PutBedDurationBillTxn(bedDurationDetail: Array<BedDurationTxnDetailsVM>) {
  //   let data = JSON.stringify(bedDurationDetail);
  //   return this.http.put<any>("/api/Insurance?reqType=update-adtItems-duration", data, this.options);
  // }

  public PutBedDurationBillTxn(visitId: number) {
    return this.http.put<any>("/api/IpBilling?reqType=update-adtItems-duration&patientVisitId=" + visitId, this.options);
  }

  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let data = JSON.stringify(billTxnItem);
    return this.http.put<any>("/api/Insurance?reqType=EditItemPrice_Qty_Disc_Provider", data, this.options);
  }
  //used from IP billing.
  public DischargePatient(dischargeDetail: DischargeDetailBillingVM) {
    let data = JSON.stringify(dischargeDetail);
    return this.http.put<any>(
      "/api/Insurance?reqType=discharge-frombilling",
      data,
      this.options
    );
  }
  //Cancel Multiple BillingTransactions
  public CancelMultipleBillTxnItems(billTransactionItems) {
    let data = JSON.stringify(billTransactionItems);
    return this.http.put<any>("/api/Insurance?reqType=cancelBillTxnItems", data, this.options);
  }
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/Insurance?reqType=update-billtxnItem", data, this.options);
  }

  public DischargePatientWithZeroItem(data: string) {
    return this.http.post<any>(
      "/api/Admission?reqType=discharge-zero-item", data,
      this.options
    );
  }

}
