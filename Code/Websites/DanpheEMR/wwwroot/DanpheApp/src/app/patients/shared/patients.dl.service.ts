import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PatientsDLService {
  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(_http: HttpClient) {
    this.http = _http;
  }
  // getting the patient
  public GetPatients(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>("/api/Patient/SearchPatient?search=" + searchTxt, this.options);
  }

  //getting registered patients
  public GetPatientsList(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>("/api/Patient/SearchRegisteredPatient?search=" + searchTxt, this.options);
  }

  //sud:10-Oct'21--Needed separate api for Patient search in New Visit--
  //other one was too heavy for frequently used module like new visit.
  public GetPatientsListForNewVisit(searchTxt, searchUsingHospitalNo, searchUsingIdCardNo) {
    //return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>("/api/Patient/SearchPatientForNewVisit?search=" + searchTxt + "&searchUsingHospitalNo=" + searchUsingHospitalNo + "&searchUsingIdCardNo=" + searchUsingIdCardNo, this.options);

  }

  // getting the patient
  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>("/api/Patient/PatientWithVisitInfo?search=" + searchTxt, this.options);
  }


  public GetPatientBillHistory(patientCode: string) {
    return this.http.get<any>("/Reporting/PatientBillHistory?PatientCode=" + patientCode, this.options);
  }
  public GetPatientUplodedDocument(patientId: number) {
    return this.http.get<any>("/api/Patient/PatientDocuments?patientId=" + patientId, this.options);
  }

  public GetPatientById(patientId) {
    return this.http.get<any>("/api/Patient/PatientById?patientId=" + patientId, this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Master/CountrySubDivisions?countryId=" + countryId, this.options);
  }
  public GetCountries() {
    return this.http.get<any>("/api/Master/Countries", this.options);
  }

  public GetMembershipType() {
    return this.http.get<any>("/api/Patient/MembershipTypes", this.options);
  }

  public GetLightPatientById(patientId) {
    return this.http.get<any>(`/api/Patient/LightPatientById?patientId=${patientId}`, this.options);
  }
  public GetInpatientList() {
    return this.http.get<any>("/api/Patient/AdmittedPatients", this.options);
  }

  public GetInsuranceProviderList() {
    return this.http.get<any>("/api/Patient/InsuranceProviders", this.options);
  }

  public GetDialysisCode() {
    return this.http.get<any>("/api/Patient/NewDialysicCode", this.options);
  }

  ////Getting Patient List excluding insurance patient..
  //public GetPatientList() {
  //  return this.http.get<any>("/api/BillInsurance?reqType=patient-list-excluding-ins-pat", this.options);
  //}

  //posting the patient
  public PostPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.
      post<any>("/api/Patient/PostPatient", data, this.options);

  }

  //updating the patient
  public PutPatient(patientId: number, patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>("/api/Patient/PutPatient?patientId=" + patientId, data, this.options);

  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode) {
    return this.http.get<any>("/api/Patient/MatchingPatients?FirstName="
      + FirstName +
      "&LastName=" + LastName +
      "&PhoneNumber=" + PhoneNumber +
      "&Age=" + Age +
      "&Gender=" + Gender +
      "&IsInsurance=" + IsInsurance +
      "&IMISCode=" + IMISCode,
      this.options);
  }
  public PostPatientFiles(formData: any) {
    try {
      return this.http.post<any>("/api/Patient/PatientFiles", formData);
    } catch (exception) {
      throw exception;
    }
  }

  public GetMembershipTypes() {
    return this.http.get<any>("/api/Patient/MembershipTypes", this.options);
  }


  //posting the patient
  public PostGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>("/api/Patient/GovInsurancePatient", data, this.options);

  }

  public PostBillingOutPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>("/api/Patient/BillingOutPatient", data, this.options);

  }

  //posting the patient
  public UpdateGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>("/api/Patient/GovInsurancePatient", data, this.options);

  }


  // Sud:20Feb'21-- needed separate function only for IPD-patient search.
  public GetIpdPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>("/api/Patient/IPDPatientSearch?search=" + searchTxt, this.options);
  }


  public GetMunicipality(id: number) {
    return this.http.get<any>("/api/Master/Municipalities?countrySubDivisionId=" + id, this.options);
  }

  public GetFileFromServer(id: number) {
    return this.http.get<any>("/api/Patient/DownloadFile?patientFileId=" + id, {
      responseType: 'blob' as 'json',
    });
  }

  public GetPatientLatestVisitContext(patientId: number) {
    return this.http.get<any>("/api/Patient/PatientLastVisitContext?patientId=" + patientId, this.options);
  }

  public GetPatientByGUID(GUID) {
    return this.http.get<any>("/api/Patient/GetPatientByGUID?patientGUID=" + GUID, this.options);
  }

  public GetPatientCurrentSchemeMap(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Patient/GetPatientCurrentSchemeMap?patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options);
  }
  public GetPatientDashboardCardSummaryCalculation(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetPatientDashboardCardSummaryCalculation?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }
  }
  public GetPatientCountByDay(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetPatientCountByDay?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }
  }
  public GetAverageTreatmentCostbyAgeGroup(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetAverageTreatmentCostbyAgeGroup?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }
  }
  public GetDepartmentWiseAppointment(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetDepartmentWiseAppointment?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }
  }
  public GetPAtVisitByMembership(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetPAtVisitByMembership?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  public GetPatientDistributionBasedOnRank(FromDate, ToDate, DepartmentId: number) {
    try {
      return this.http.get<any>("/PatientDashboard/GetPatientDistributionBasedOnRank?FromDate=" + FromDate + "&ToDate=" + ToDate + "&DepartmentId=" + DepartmentId, this.options);
    }
    catch (ex) { throw ex; }
  }

  public GetCastEthnicGroupList() {
    return this.http.get("/api/Patient/GetCastEthnicGroupList", this.options);
  }


  public GetHospitalManagement(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PatientDashboard/GetHospitalManagement?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }
  }
  public GetDepartment() {
    try {
      return this.http.get("/api/Appointment/AppointmentApplicableDepartments");
    }
    catch (ex) {
      throw ex;
    }
  }
}


