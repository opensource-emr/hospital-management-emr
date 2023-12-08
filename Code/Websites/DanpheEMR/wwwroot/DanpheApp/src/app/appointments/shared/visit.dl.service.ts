import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

//IMPORTANT !!--move the visit logic to some other layer--kept to separate it out from billing--sudarshan-23feb'17
import { ClaimBookingRoot_DTO } from '../../claim-management/shared/SSF-Models';
import { ClaimRoot } from '../../insurance/ssf/shared/SSF-Models';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { RouteFromService } from '../../shared/routefrom.service';
import { APFPatientData } from './APFPatientData.model';

@Injectable()
export class VisitDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public jsonOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient, public RouteFromService: RouteFromService) {
  }

  public GetApptForDeptOnSelectedDate(deptId, doctorId, selectedDate, patientId) {
    return this.http.get<any>("/api/Visit/CheckExistingAppointment?departmentId=" + deptId + "&inputProviderId=" + doctorId + "&requestDate=" + selectedDate + "&patientId=" + patientId, this.options);
  }

  //gets the list of visit using visitstatus
  // public GetVisitsByStatus(status: string, maxdayslimit, searchTxt) {
  //   return this.http.get<any>("/api/Visit/VisitsByStatus?status=" + status + "&dayslimit=" + maxdayslimit + "&search=" + searchTxt, this.options);
  // }
  public GetVisits(maxdayslimit, searchTxt, IsHospitalNoSearch, IsIdCardNoSearch) {
    return this.http.get<any>("/api/Visit/ListVisits?dayslimit=" + maxdayslimit + "&search=" + searchTxt + "&SearchPatientUsingHospitalNo=" + IsHospitalNoSearch + "&SearchPatientUsingIdCardNo=" + IsIdCardNoSearch, this.options);
  }

  public GetPatientVisitList(patientId) {
    return this.http.get<any>("/api/Visit/PatientVisitHistory?patientId=" + patientId, this.options);
  }

  // public GetPatientVisitEarlierList(patientId, followup) {
  //   return this.http.get<any>("/api/Visit/PatientVisitListHistory?patientId=" + patientId + "&followup=" + followup, this.options);
  // }

  public GetPatientVisitList_Today(patientId) {
    return this.http.get<any>("/api/Visit/PatientTodaysVisits?&patientId=" + patientId, this.options);
  }


  // public GetVisitList(claimCode: number, patId: number) {
  //   return this.http.get<any>("/api/GovInsurance?&reqType=existingClaimCode-VisitList&claimCode=" + claimCode + "&patientId=" + patId, this.options);
  // }

  public GetPatientVisitsProviderWise(patientId) {
    return this.http.get<any>("/api/Visit/PatientVisitsWithDoctors?patientId=" + patientId, this.options);
  }

  // public GetAdditionalBillingItems() {
  //   return this.http.get<any>("/api/Visit/GetAdditionBillingItem", this.options);
  // }
  public GetDepartmentList() {
    return this.http.get<any>("/api/Master/AppointmentApplicableDepartments", this.options);
  }
  public GetDepartmentByEmployeeId(employeeId: number) {
    return this.http.get<any>("/api/Master/EmployeeDepartment?employeeId=" + employeeId, this.options);
  }
  // public GetPastVisits(fromDate, toDate, searchTxt) { //fromDate: string, toDate: string
  //   // return this.http.get<any>("/api/Visit/PatientVisitList?&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  //   return this.http.get<any>("/api/Visit/PatientVisitList?&FromDate=" + fromDate + "&ToDate=" + toDate + "&search=" + searchTxt, this.options);
  // }

  //posts new visit
  public PostTransferVisit(currentVisit) {
    let data = JSON.stringify(currentVisit);
    return this.http.post<any>("/api/Visit/TransferVisit", data, this.options);
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
    return this.http.get<any>('/api/Visit/PatientVisitStickerInfo?' + 'visitId=' + visitId, this.options);
  }

  //update the billing status of visits
  public PutVisitsBillingStatus(patientVisitIds: number[], billingStatus: string) {
    let data = JSON.stringify(patientVisitIds);
    return this.http.put<any>('/api/Visit/UpdateBillStatus?billingStatus=' + billingStatus, data, this.options)
  }

  //get request from employees table using department id
  public GetDoctorFromDepartmentId(departmentId: number) {
    return this.http.get<any>("/api/Master/DepartmentEmployees?departmentId=" + departmentId, this.options);
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
  // public GetTotalAmountByProviderId(providerId) {
  //   return this.http.get<any>("/api/Visit/GetPriceForDoctorOPDItem?inputProviderId=" + providerId, this.options);

  // }
  public GetDoctorOpdPrices() {
    return this.http.get<any>("/api/Visit/DoctorNewOpdBillingItems", this.options);

  }
  public GetPatHealthCardStatus(patientId: number) {
    return this.http.get<any>("/api/Visit/PatientHealthCardWithBillInfo?patientId=" + patientId, this.options);
  }

  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostVisitToDB(patientVisitDataJSON: string) {
    //let data = JSON.stringify(patientVisitData);
    if (this.RouteFromService.RouteFrom == "onlineappointment") {
      return this.http.post<any>("/api/Visit/VisitFromOnlineAppointment", patientVisitDataJSON, this.options);
    }
    else
      return this.http.post<any>("/api/Visit/NewVisit", patientVisitDataJSON, this.options);
  }

  // //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  // public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber) {
  //   return this.http.get<any>("/api/Visit/GetMatchingPatientList?FirstName="
  //     + FirstName +
  //     "&LastName=" + LastName +
  //     "&PhoneNumber=" + PhoneNumber,
  //     this.options);
  // }

  //ashim: 23Sep2018 : Visit from billing transaction
  public PostVisitsFromBillingTransaction(visits: string) {
    return this.http.post<any>("/api/Visit/VisitFromBilling", visits, this.options);
  }


  //sud:4June'19-- For Free Referral visits.
  public PostFreeReferralVisit(visitData) {
    return this.http.post<any>("/api/Visit/VisitForFreeReferral", visitData, this.options);
  }

  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.http.get<any>("/api/Visit/DepartmentNewOpdBillingItems", this.options);
  }

  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.http.get<any>("/api/Visit/DepartmentFollowupBillingItems", this.options);
  }

  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.http.get<any>("/api/Visit/DoctorFollowupBillingItems", this.options);
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.http.get<any>("/api/Visit/DoctorOldPatientBillingItems", this.options);
  }
  public GetDoctorReferralPatientPrices() {
    return this.http.get<any>("/api/Visit/DoctorOpdReferralBillingItems", this.options);
  }
  // getting the departmnet
  public GetDepartment() {
    return this.http.get<any>("/api/Appointment/AppointmentApplicableDepartments");
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.http.get<any>("/api/Visit/DepartmentOldPatientBillingItems", this.options);
  }


  //gets all doctors who has AppointmentApplicable==true and IsActive==true.
  public GetVisitDoctors() {
    return this.http.get<any>("/api/Visit/AppointmentApplicableDoctors", this.options);
  }

  public GetRequestingDepartmentByVisitId(visitId: number) {
    return this.http.get<any>("/api/Visit/DepartmentOfIpdVisit?visitId=" + visitId, this.options);
  }

  public GetBillItemList(srvDeptIdList = "", itemIdList = "") {
    return this.http.get<any>("/api/billing/BillCfgItems?srvDeptIdListStr=" + srvDeptIdList + "&itemIdListStr=" + itemIdList, this.options);
  }

  //sud:26June'19-- For Free-Followup Visits.
  public PostFreeFollowupVisit(visitData) {
    let visJson = JSON.stringify(visitData);
    return this.http.post<any>("/api/Visit/VisitForFreeFollowup", visJson, this.options);
  }


  //Post Visit Data to database with Patient, Visit, BillTransaction,BillTransactionItems details
  public PostPaidFollowupVisit(fwupVisitDataJSON: string) {

    return this.http.post<any>("/api/Visit/VisitForPaidFollowup", fwupVisitDataJSON, this.options);
  }

  public GetAPIPatientDetail(url, IDCardNumber) {
    return this.http.get<APFPatientData>(url + '?id=' + IDCardNumber);
  }

  public GetDependentIdDetail(dependentId: string) {
    return this.http.get<any>("/api/Visit/Getdependentiddetails?dependentId=" + dependentId, this.options);

  }
  public UpdateDependentId(dependentId: string, patientId: number) {
    return this.http.put<any>("/api/Visit/UpdateDendentId?dependentId=" + dependentId + "&patientId=" + patientId, this.options);

  }

  public GetSSFPatientDetail(PatientId: string) {
    return this.http.get<any>("/api/SSF/GetSSFPatientData?PatientId=" + PatientId, this.options);
  }

  public CheckEligibility(PatientId: string, VisitDate: string) {
    return this.http.post<any>("/api/SSF/CheckSSFEligibility?PatientId=" + PatientId + "&VisitDate=" + VisitDate, this.options);
  }

  public GetSSFEmployerDetail(SSFPatientGUID: string) {
    return this.http.get<any>("/api/SSF/GetEmployerList?SSFPatientUUID=" + SSFPatientGUID, this.options);
  }

  public GetSSFInvoiceDetail(fromDate: string, toDate: string, patientType: string) {
    return this.http.get<any>("/api/Billing/SsfInvoices?FromDate=" + fromDate + "&toDate=" + toDate + "&patientType=" + patientType, this.options);
  }
  public SubmitClaim(ClaimRoot: ClaimRoot) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    return this.http.post<any>("/api/SSF/SubmitClaim", ClaimRoot, httpOptions);
  }

  public GetClaimBookingDetails(claimCode: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    return this.http.get<any>("/api/SSF/GetClaimBookingDetail?claimCode=" + claimCode, httpOptions);
  }
  public BookClaim(claimBookingObj: ClaimBookingRoot_DTO) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    return this.http.post<any>("/api/SSF/BookClaim", claimBookingObj, httpOptions);
  }
  public GetRank() {
    return this.http.get<any>("/api/Visit/GetRank", this.options);
  }
  public PostRank(RankName: string) {
    return this.http.post<any>("/api/Visit/PostRank", { Rank: RankName }, this.jsonOptions);
  }

  public IsClaimed(latestClaimCode: number, patientId: number) {
    return this.http.get<any>(`/api/SSF/CheckClaimStatusLocally?latestClaimCode=${latestClaimCode}&patientId=${patientId}`, this.jsonOptions);
  }
  public getSSFPatientDetailLocally(patientId: number, schemeId: number) {
    return this.http.get<any>(`/api/SSF/GetSSFPatientDetailLocally?patientId=${patientId}&schemeId=${schemeId}`, this.jsonOptions);
  }

  public getMedicareMemberDetail(patientId: number) {
    return this.http.get<any>(`/api/Medicare/MedicareMemberDetail?patientId=${patientId}`, this.jsonOptions);
  }

  public getSSFPatientDetailAndCheckSSFEligibilityFromSsfServer(policyNo: string, currentDate: string) {
    const ssfPatientDetail = this.http.get<any>("/api/SSF/GetSSFPatientData?PatientId=" + policyNo, this.options);
    const eligibility = this.http.post<any>("/api/SSF/CheckSSFEligibility?PatientId=" + policyNo + "&VisitDate=" + currentDate, this.options);

    return forkJoin([ssfPatientDetail, eligibility]);
  }
  public getMemberInfoByScheme(schemeId: number, patientId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Visit/GetMemberInformationByScheme?schemeId=${schemeId}&patientId=${patientId}`);
  }
  public GetPatientCreditLimitsByScheme(schemeId: number, patientId: number, serviceBillingContext: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/Visit/GetPatientCreditLimitsByScheme?schemeId=${schemeId}&patientId=${patientId}&serviceBillingContext=${serviceBillingContext}`);
  }
  public GetLatestClaimCodeForAutoGeneratedClaimCodes(schemeId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/Visit/GetLatestClaimCode?schemeId=${schemeId}`);
  }
}
