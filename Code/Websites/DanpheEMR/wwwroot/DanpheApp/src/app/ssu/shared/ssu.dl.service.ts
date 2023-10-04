import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class SSU_DLService {
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
    return this.http.get<any>("/api/Patient/AdmittedPatientst", this.options);
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
  // public PostPatient(patientObjString: string) {
  //   let data = patientObjString;
  //   return this.http.
  //     post<any>("/api/Patient/PostPatient", data, this.options);

  // }

  //updating the patient
  public PutPatient(patientId: number, patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>("/api/Patient?patientId=" + patientId, data, this.options);

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

  public GetSsuPatients(search) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.get<any>('/api/SocialServiceUnit/GetAllSsuPatients?search=' + search);
  }

  public PostSsuPatient(data) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.post<any>('/api/SocialServiceUnit/post-ssu-patient-information', data, this.options);
  }

  public PutSsuPatient(data) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.put<any>('/api/SocialServiceUnit/put-ssu-patient-information', data);
  }

  public PutActivateDeactivateSsuPatient(data) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.put<any>('/api/SocialServiceUnit/put-activate-deactivate-ssu-patient', data);
  }

}
