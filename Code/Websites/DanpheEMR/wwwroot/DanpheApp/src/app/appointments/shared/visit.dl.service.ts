import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

//IMPORTANT !!--move the visit logic to some other layer--kept to separate it out from billing--sudarshan-23feb'17
import { VisitService } from './visit.service';

@Injectable()
export class VisitDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {
  }

  public GetApptForDeptOnSelectedDate(deptId, selectedDate, patientId) {
    return this.http.get<any>("/api/Visit?reqType=CheckIfApptExistForDepartmentOnDate&departmentId=" + deptId + "&requestDate=" + selectedDate + "&patientId=" + patientId, this.options);
  }

  //gets the list of visit using visitstatus
  public GetVisitsByStatus(status: string, maxdayslimit, searchTxt) {
    return this.http.get<any>("/api/Visit?status=" + status + "&dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options);
  }
  public GetVisits(maxdayslimit, searchTxt) {
    return this.http.get<any>("/api/Visit?&reqType=list-visit&dayslimit=" + maxdayslimit + "&search="+ searchTxt, this.options);
  }

  public GetPatientVisitList(patientId) {
    return this.http.get<any>("/api/Visit?&reqType=patient-visitHistory&patientId=" + patientId, this.options);
  }

  public GetPatientVisitEarlierList(patientId, followup) {
    return this.http.get<any>("/api/Visit?&reqType=patient-visitHistorylist&patientId=" + patientId + "&followup=" + followup, this.options);
  }

  public GetPatientVisitList_Today(patientId) {
    return this.http.get<any>("/api/Visit?&reqType=patient-visitHistory-today&patientId=" + patientId, this.options);
  }


  public GetVisitList(claimCode: number, patId: number) {
    return this.http.get<any>("/api/Insurance?&reqType=existingClaimCode-VisitList&claimCode=" + claimCode + "&patientId=" + patId, this.options);
  }

  public GetPatientVisitsProviderWise(patientId) {
    return this.http.get<any>("/api/Visit?&reqType=patient-visit-providerWise&patientId=" + patientId, this.options);
  }

  public GetAdditionalBillingItems() {
    return this.http.get<any>("/api/Visit?&reqType=get-additional-billItems", this.options);
  }
  public GetDepartmentList() {
    return this.http.get<any>("/api/Master?type=department&reqType=appointment", this.options);
  }
  public GetDepartmentByEmployeeId(employeeId: number) {
    return this.http.get<any>("/api/Master?type=departmentByEmployeeId&employeeId=" + employeeId, this.options);
  }
  public GetPastVisits(fromDate, toDate, searchTxt) { //fromDate: string, toDate: string
    // return this.http.get<any>("/api/Visit?reqType=pastVisitList&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
    return this.http.get<any>("/api/Visit?reqType=pastVisitList&FromDate=" + fromDate + "&ToDate=" + toDate + "&search=" + searchTxt, this.options);
  }

  //posts new visit
  public PostVisit(currentVisit) {
    let data = JSON.stringify(currentVisit);
    return this.http.post<any>("/api/Visit", data, this.options);
  }
  ////updates visit status
  //public PutPatientVisitStatus(patientVisitId: number, status: string) {
  //    return this.http.put<any>("/api/Visit?PatientVisitId=" + patientVisitId + '&status=' + status, this.options);
  //}

  //update the visit status
  //not used for now
  public PutPatientVisitStatus(patientVisitIds: number[], status: string) {
    let data = JSON.stringify(patientVisitIds);
    return this.http.put<any>('/api/Visit?reqType=updateVisitStatus&billingStatus=' + status, data, this.options)
  }

  public GetVisitInfoforStickerPrint(visitId: number) {
    //let data = JSON.stringify(visitId);
    return this.http.get<any>('/api/Visit?reqType=getVisitInfoforStickerPrint' + '&visitId=' + visitId, this.options);
  }

  //update the billing status of visits
  public PutVisitsBillingStatus(patientVisitIds: number[], billingStatus: string) {
    let data = JSON.stringify(patientVisitIds);
    return this.http.put<any>('/api/Visit?reqType=updateBillStatus&billingStatus=' + billingStatus, data, this.options)
  }

  //get request from employees table using department id
  public GetDoctorFromDepartmentId(departmentId: number) {
    return this.http.get<any>("/api/Master?type=departmentemployee&reqType=appointment&inputValue=" + departmentId, this.options);
  }
  //getting membership deatils by membershiptype id
  public GetMembershipDeatilsByMembershipTyepId(membershipId) {
    return this.http.get<any>("/api/Visit?&reqType=GetMembershipDeatils&membershipTypeId=" + membershipId, this.options);
  }
  //get provider availablity using date and providerid
  //public GetProviderAvailability(selProviderId: number, visitDate: string) {
  //    return this.http.get<any>("/api/Visit?'&reqType=doctorschedule"
  //        + "&inputProviderId=" + selProviderId
  //        + '&requestDate=' + visitDate, this.options);
  //}

  //getting total ammount opd by doctorId
  public GetTotalAmountByProviderId(providerId) {
    return this.http.get<any>("/api/Visit?&reqType=GetTotalAmountByProviderId&inputProviderId=" + providerId, this.options);

  }
  public GetDoctorOpdPrices() {
    return this.http.get<any>("/api/Visit?&reqType=get-doc-opd-prices", this.options);

  }
  public GetPatHealthCardStatus(patientId: number) {
    return this.http.get<any>("/api/Visit?reqType=getPatHealthCardStatus&patientId=" + patientId, this.options);
  }

  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostVisitToDB(patientVisitDataJSON: string) {
    //let data = JSON.stringify(patientVisitData);
    return this.http.post<any>("/api/Visit?reqType=patientVisitCreate", patientVisitDataJSON, this.options);
  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber) {
    return this.http.get<any>("/api/Visit?reqType=GetMatchingPatList&FirstName="
      + FirstName +
      "&LastName=" + LastName +
      "&PhoneNumber=" + PhoneNumber,
      this.options);
  }

  //ashim: 23Sep2018 : Visit from billing transaction
  public PostVisitsFromBillingTransaction(visits: string) {
    return this.http.post<any>("/api/Visit?reqType=billing-visits", visits, this.options);
  }


  //sud:4June'19-- For Free Referral visits.
  public PostFreeReferralVisit(visitData) {
    return this.http.post<any>("/api/Visit?reqType=free-referral-visit", visitData, this.options);
  }

  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.http.get<any>("/api/Visit?&reqType=get-dept-opd-items", this.options);
  }

  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.http.get<any>("/api/Visit?&reqType=get-dept-followup-items", this.options);
  }

  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.http.get<any>("/api/Visit?&reqType=get-doc-followup-items", this.options);
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.http.get<any>("/api/Visit?&reqType=get-doc-oldpatient-opd-items", this.options);
  }
  // getting the departmnet
  public GetDepartment() {
    return this.http.get<any>("/api/Appointment?reqType=department");
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.http.get<any>("/api/Visit?reqType=get-dept-oldpatient-opd-items", this.options);
  }


  //gets all doctors who has AppointmentApplicable==true and IsActive==true.
  public GetVisitDoctors() {
    return this.http.get<any>("/api/Visit?reqType=get-visit-doctors", this.options);
  }

  public GetRequestingDepartmentByVisitId(visitId: number) {
    return this.http.get<any>("/api/Visit?reqType=get-requesting-department&visitId=" + visitId, this.options);
  }

  public GetBillItemList(srvDeptIdList = "", itemIdList = "") {
    return this.http.get<any>("/api/billing?reqType=billItemList&srvDeptIdListStr=" + srvDeptIdList + "&itemIdListStr=" + itemIdList, this.options);
  }

  //sud:26June'19-- For Free-Followup Visits.
  public PostFreeFollowupVisit(visitData) {
    let visJson = JSON.stringify(visitData);
    return this.http.post<any>("/api/Visit?reqType=free-followup-visit", visJson, this.options);
  }


  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostPaidFollowupVisit(fwupVisitDataJSON: string) {

    return this.http.post<any>("/api/Visit?reqType=paid-followup-visit", fwupVisitDataJSON, this.options);
  }


}
