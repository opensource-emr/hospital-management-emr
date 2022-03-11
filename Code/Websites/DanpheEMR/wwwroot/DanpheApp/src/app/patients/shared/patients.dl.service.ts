import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    return this.http.get<any>("/api/Patient?reqType=patient-search-by-text&search=" + searchTxt, this.options);
  }

  //getting registered patients
  public GetPatientsList(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.get<any>("/api/Patient?reqType=search-registered-patient&search=" + searchTxt, this.options);
  }
  
  //sud:10-Oct'21--Needed separate api for Patient search in New Visit--
  //other one was too heavy for frequently used module like new visit. 
  public GetPatientsListForNewVisit(searchTxt) {
    //return this.http.get<any>("/api/Patient", this.options); 
    return this.http.get<any>("/api/Patient?reqType=patient-search-for-new-visit&search=" + searchTxt, this.options);

  }

  // getting the patient
  public GetPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>("/api/Patient?reqType=patientsWithVisitsInfo&search=" + searchTxt, this.options);
  }


  public GetPatientBillHistory(patientCode: string) {
    return this.http.get<any>("/Reporting/PatientBillHistory?PatientCode=" + patientCode, this.options);
  }
  public GetPatientUplodedDocument(patientId: number) {
    return this.http.get<any>("/api/Patient?reqType=getPatientUplodedDocument&patientId=" + patientId, this.options);
  }

  public GetPatientById(patientId) {
    return this.http.get<any>("/api/Patient?reqType=getPatientByID&patientId=" + patientId, this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Master?type=GetCountrySubDivision&countryId=" + countryId, this.options);
  }
  public GetCountries() {
    return this.http.get<any>("/api/Master?type=get-countries", this.options);
  }

  public GetMembershipType() {
    return this.http.get<any>("/api/Patient?reqType=membership-types", this.options);
  }

  public GetLightPatientById(patientId) {
    return this.http.get<any>("/api/Patient?reqType=getLightPatientByPatId&patientId=" + patientId, this.options);
  }
  public GetInpatientList() {
    return this.http.get<any>("/api/Patient?reqType=inpatient-list", this.options);
  }

  public GetInsuranceProviderList() {
    return this.http.get<any>("/api/Patient?reqType=insurance-providers", this.options);
  }

  public GetDialysisCode() {
    return this.http.get<any>("/api/Patient?reqType=get-dialysis-code", this.options);
  }

  ////Getting Patient List excluding insurance patient..
  //public GetPatientList() {
  //  return this.http.get<any>("/api/BillInsurance?reqType=patient-list-excluding-ins-pat", this.options);
  //}

  //posting the patient
  public PostPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.
      post<any>("/api/Patient?reqType=patient", data, this.options);

  }

  //updating the patient
  public PutPatient(patientId: number, patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>("/api/Patient?patientId=" + patientId, data, this.options);

  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode) {
    return this.http.get<any>("/api/Patient?reqType=GetMatchingPatList&FirstName="
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
      return this.http.post<any>("/api/Patient?reqType=upload", formData);
    } catch (exception) {
      throw exception;
    }
  }

  public GetMembershipTypes() {
    return this.http.get<any>("/api/Patient?reqType=membership-types", this.options);
  }


  //posting the patient
  public PostGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>("/api/Patient?reqType=gov-insurance-patient", data, this.options);

  }

  public PostBillingOutPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>("/api/Patient?reqType=billing-out-patient", data, this.options);

  }

  //posting the patient
  public UpdateGovInsPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.put<any>("/api/Patient?reqType=update-gov-insurance-patient", data, this.options);

  }


  // Sud:20Feb'21-- needed separate function only for IPD-patient search.
  public GetIpdPatientsWithVisitsInfo(searchTxt) {
    return this.http.get<any>("/api/Patient?reqType=ipdPatientSearch&search=" + searchTxt, this.options);
  }


  public GetMunicipality(id: number) {
    return this.http.get<any>("/api/Master?type=get-municipalities&countrySubDivisionId=" + id, this.options);
  }

  public GetFileFromServer(id: number) {
    return this.http.get<any>("/api/Patient/DownloadFile?patientFileId=" + id, {
      responseType: 'blob' as 'json',
    });
  }

  public GetPatientLatestVisitContext(patientId: number) {
    return this.http.get<any>("/api/Patient?reqType=pat-last-visitcontext&patientId=" + patientId, this.options);
  }

}
