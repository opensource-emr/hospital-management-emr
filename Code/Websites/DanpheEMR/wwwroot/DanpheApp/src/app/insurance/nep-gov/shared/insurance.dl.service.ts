import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BillingDeposit } from "../../../billing/shared/billing-deposit.model";
import { ImagingItemRequisition } from "../../../radiology/shared/imaging-item-requisition.model";
import { DischargeDetailBillingVM } from "../ins-ipd-billing/shared/discharge-bill.view.models";
@Injectable({
  providedIn: "root",
})
export class GovInsuranceDlService {
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    }),
  };
  constructor(public http: HttpClient) {

  }
  GetLatestVisitClaimCode(patientId) {
    return this.http.get<any>("/api/GovInsurance/LatestClaimCode?patientId=" + patientId, this.options);
  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode) {
    return this.http.get<any>("/api/GovInsurance/MatchingPatients?firstName=" + FirstName + "&lastName=" + LastName + "&phoneNumber=" + PhoneNumber +
      "&age=" + Age + "&gender=" + Gender,
      this.options);
  }
  public GetPatientsListByNshiNumber(Ins_NshiNumber: string) {
    return this.http.get<any>("/api/GovInsurance/PatientsByNshiNumber?nshiNumber=" + Ins_NshiNumber, this.options)
  }
  public GetInsuranceProviderList() {
    return this.http.get<any>("/api/GovInsurance/InsuranceProviders", this.options);
  }
  //posting the patient
  public PostGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>(
      "/api/GovInsurance/NewPatient",
      data,
      this.options
    );
  }

  public UpdateGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>(
      "/api/GovInsurance/Patient",
      data,
      this.options
    );
  }

  public UpdateInsuranceBalance(insBalObjString: string) {
    let data = insBalObjString;
    return this.http.put<any>(
      "/api/GovInsurance/Balance",
      data,
      this.options
    );
    //return this.http.put<any>("/api/GovInsurance?reqType=update-insurance-balance&patientId=" + patientId + "&insuranceProviderId=" + insuranceProviderId + "&updatedInsBalance=" + updatedInsBalance, this.options);
  }

  // public GetInsurancePatients() {
  //   return this.http.get<any>(
  //     "/api/GovInsurance?reqType=govinsurance-patients-list",
  //     this.options
  //   );
  // }

  //sud:10-Oct'21--Needed separate server side search in insurance module. 
  public SearchInsurancePatients(searchText) {
    return this.http.get<any>(
      "/api/GovInsurance/GovInsurancePatients?searchText=" + searchText,
      this.options
    );
  }

  public GetInsBalanceHistory(patientId) {

    return this.http.get<any>(
      "/api/GovInsurance/PatientBalanceHitstory?patientId=" + patientId, this.options);
  }
  public GetVisitsByStatus(status: string, maxdayslimit, searchTxt) {
    return this.http.get<any>(
      "/api/GovInsurance?&reqType=get-ins-patient-visit-list&status=" + status + "&dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options
    );
  }
  //get insurance patient visit list....
  public GetInsPatientVisits(maxdayslimit, searchTxt) {
    return this.http.get<any>(
      "/api/GovInsurance/PatientsVisits?dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options
    );
  }
  public GetPatientById(patientId) {
    return this.http.get<any>("/api/Patient/PatientById?patientId=" + patientId, this.options);
  }

  // new VISIT
  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.http.get<any>("/api/GovInsurance/DepartmentNewOpdBillingItems", this.options);
  }
  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.http.get<any>("/api/GovInsurance/DepartmentFollowupBillingItems", this.options);
  }
  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.http.get<any>("/api/GovInsurance/DoctorFollowupBillingItems", this.options);
  }
  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.http.get<any>("/api/GovInsurance/DoctorOldPatientBillingItems", this.options);
  }
  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.http.get<any>("/api/GovInsurance/DepartmentOldPatientBillingItems", this.options);
  }
  //gets all doctors who has AppointmentApplicable==true and IsActive==true.
  public GetVisitDoctors() {
    return this.http.get<any>("/api/GovInsurance/Doctors", this.options);
  }
  public GetBillItemList() {
    return this.http.get<any>("/api/GovInsurance/BillCfgItems", this.options);
  }
  public GetDoctorOpdPrices() {
    return this.http.get<any>("/api/GovInsurance/DoctorNewOpdBillingItems", this.options);

  }
  // getting the departmnet
  public GetDepartment() {
    return this.http.get<any>("/api/GovInsurance/AppointmentApplicableDepartments");
  }
  public GetPatHealthCardStatus(patientId: number) {
    return this.http.get<any>("/api/GovInsurance/PatientHealthCardWithBillInfo?patientId=" + patientId, this.options);
  }
  public GetPatientVisitList(patientId) {
    return this.http.get<any>("/api/Visit/PatientVisitHistory?patientId=" + patientId, this.options);
  }
  public GetOpdTicketInvoiceInfo(patientVisitId: number, patientId: number) {
    return this.http.get<any>("/api/GovInsurance/OpdTicketInvoiceInfo?patientId=" + patientId + '&patientVisitId=' + patientVisitId);
  }
  // public GetHealthCardBillItem() {
  //   return this.http.get<any>("/api/GovInsurance?reqType=GetHealthCardBillItem", this.options);
  // }
  public GetPatientBillingContext(patientId: number) {
    //           else if (reqType == "patient-billing-context")
    return this.http.get<any>("/api/GovInsurance/PatientBillingContext?patientId=" + patientId);
  }
  public GetOrganizationList() {
    return this.http.get<any>('/api/GovInsurance/CreditOrganizations', this.options);
  }
  public GetVisitList(claimCode: number, patId: number) {
    return this.http.get<any>("/api/GovInsurance/IsClaimCodeValid?claimCode=" + claimCode + "&patientId=" + patId, this.options);
  }
  public GetPatientVisitList_Today(patientId) {
    return this.http.get<any>("/api/GovInsurance/TodaysPatientVisit?patientId=" + patientId, this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Master/CountrySubDivisions?countryId=" + countryId, this.options);
  }

  public GetInPatientDetailForPartialBilling(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/GovInsurance/InPatientDetailForPartialBilling?+ patientId=" + patId + "&patVisitId=" + patVisitId, this.options);
  }
  public GetClaimCode() {
    return this.http.get<any>("/api/GovInsurance/NewClaimCode", this.options);
  }
  public GetOldClaimcode(patId) {
    return this.http.get<any>("/api/GovInsurance/OldClaimCode?patientId=" + patId, this.options);
  }
  public GetActiveEmployeesList() {
    return this.http.get<any>("/api/GovInsurance/ActiveEmployees", this.options);
  }
  public GetDoctorsList() {
    return this.http.get<any>("/api/GovInsurance/Doctors", this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/GovInsurance/PatientCurrentVisitContext?patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }
  public GetInsuranceBillingItems() {
    return this.http.get<any>('/api/GovInsurance/InsuranceApplicableBillCfgItems', this.options);
  }
  public GetPatientVisitsProviderWise(patientId) {
    return this.http.get<any>("/api/GovInsurance/PerformerWisePatientVisits?patientId=" + patientId, this.options);
  }
  //Deposit Deduct
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/GovInsurance/PatientDeposits?patientId=" + patientId, this.options);
  }
  //Gets both Credit and deposit balance, After this is tested remove those two methods: sud-13May'18.
  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<any>("/api/GovInsurance/PatientPastBillSummary?inputId=" + patientId, this.options);
  }
  // Get Doctor List
  public GetProviderList() {
    return this.http.get<any>("/api/GovInsurance/AppointmentApplicableEmployees", this.options);
  }
  //aniket: 30Mar'21 Discharge patient Info
  public GetAdditionalInfoForDischarge(patientvisitId: number, billingTxnId: number) {
    return this.http.get<any>("/api/GovInsurance/DischargeReceipt?ipVisitId=" + patientvisitId + "&billingTxnId=" + billingTxnId, this.options);
  }
  //POST:
  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostVisitToDB(patientVisitDataJSON: string) {
    //let data = JSON.stringify(patientVisitData);
    return this.http.post<any>("/api/GovInsurance/CreateVisit", patientVisitDataJSON, this.options);
  }
  public PostReturnReceipt(formData: any) {
    // let data = JSON.stringify(returnReceipt);
    return this.http.post<any>("/api/GovInsurance/PostReturnInvoice_Old", formData);
  }
  public PostVisitsFromBillingTransaction(visits: string) {
    return this.http.post<any>("/api/GovInsurance/CreateBillingVisit", visits, this.options);
  }
  public PostBillingTransactionItems(billTranItems) {
    let data = JSON.stringify(billTranItems);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/GovInsurance/BillingTransactionItems", data, this.options);
  }
  //posting the requisitions in requistion table
  public PostToRequisition(requisitionObjString: string) {
    let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
    return this.http.post<any>("/api/GovInsurance/Lab/Requisition", data, this.options);

  }
  //imaging-requistion-component
  //post all the requisition items
  public PostRequestItems(reqItemList: Array<ImagingItemRequisition>) {
    let data = JSON.stringify(reqItemList);
    return this.http.post<any>('/api/GovInsurance/Radiology/Requisition', data, this.options);
  }

  public PostFreeFollowupVisit(visitData) {
    let visJson = JSON.stringify(visitData);
    return this.http.post<any>("/api/GovInsurance/FreeFollowup", visJson, this.options);
  }
  public PostPaidFollowupVisit(fwupVisitDataJSON: string) {

    return this.http.post<any>("/api/GovInsurance/PaidFollowup", fwupVisitDataJSON, this.options);
  }
  public PostIpBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/GovInsurance?reqType=post-ins-dischargeBill", data, this.options);
  }
  public PostBillingDeposit(BillingDeposit: BillingDeposit) {
    let data = JSON.stringify(BillingDeposit);
    return this.http.post<any>("/api/GovInsurance/AddDeposit", data, this.options);
  }
  public PostBillingTransaction(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/GovInsurance/BillingTransaction", data, this.options);

  }

  public PostInsuranceOpBilling(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/GovInsurance/insurance-billing", data, this.options);

  }
  public PostInsuranceProvisional(billTxnModel) {
    let data = JSON.stringify(billTxnModel);
    return this.http.post<any>("/api/GovInsurance/insurance-provisional-billing", data, this.options);

  }

  //PUT:
  //update status of appointment using appointmentId
  public PutAppointmentStatus(appointmentId: number, status: string, performerId: number, performerName: string) {
    return this.http.put<any>("/api/GovInsurance/AppointmentStatus"
      + "&appointmentId=" + appointmentId
      + '&status=' + status
      + "&PerformerId=" + performerId
      + "&PerformerName=" + performerName, null);
  }
  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.http.put<any>("/api/GovInsurance/PrintCount?PrintCount=" + printCount + "&billingTransactionId=" + billingTransactionId, this.options);
  }
  // new visit 

  //Update ProcedureType in admission
  public UpdateProcedure(admissionPatId, ProcedureType) {
    return this.http.put<any>("/api/GovInsurance/Procedure?AdmissionPatientId=" + admissionPatId + "&ProcedureType=" + ProcedureType, this.options);
  }
  public PutBedDurationBillTxn(visitId: number) {
    return this.http.put<any>("/api/IpBilling/ReCalculateBedQuantity?patientVisitId=" + visitId, this.options);
  }

  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let data = JSON.stringify(billTxnItem);
    return this.http.put<any>("/api/GovInsurance/EditItemPriceQtyDiscAndProvider", data, this.options);
  }
  //used from IP billing.
  public DischargePatient(dischargeDetail: DischargeDetailBillingVM) {
    let data = JSON.stringify(dischargeDetail);
    return this.http.put<any>(
      "/api/GovInsurance/Discharge",
      data,
      this.options
    );
  }
  //Cancel Multiple BillingTransactions
  public CancelMultipleBillTxnItems(billTransactionItems) {
    let data = JSON.stringify(billTransactionItems);
    return this.http.put<any>("/api/GovInsurance/CancelBillingTransactionItems", data, this.options);
  }
  public PutBillTxnItems(modifiedItems) {
    let data = JSON.stringify(modifiedItems);
    return this.http.put<any>("/api/GovInsurance/BillingTransactionItems", data, this.options);
  }

  public DischargePatientWithZeroItem(data: string) {
    return this.http.post<any>(
      "/api/Admission/DischargeOnZeroItem", data,
      this.options
    );
  }

}
