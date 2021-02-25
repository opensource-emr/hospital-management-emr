import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class EmergencyDLService {
  public http: HttpClient;

  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public _http: HttpClient) {
    this.http = _http;
  }

  public GetERNumAndModeOfArrData() {
    return this.http.get<any>("/api/Emergency?reqType=latestERNumAndModeOfArrival", this.options);
  }
  public GetAllERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allERPatientList", this.options);
  }
  public GetAllTriagedPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allTriagedPatientList", this.options);
  }
  public GetAllLamaERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allLamaPatientList", this.options);
  }
  public GetAllAdmittedERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allAdmittedPatientList", this.options);
  }
  public GetAllDeathERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allDeathPatientList", this.options);
  }
  public GetAllTransferredERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allTransferredPatientList", this.options);
  }
  public GetAllDischargedERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allDischargedPatientList", this.options);
  }
  public GetAllDorERPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allDorPatientList", this.options);
  }
  public GetPatients() {
    return this.http.get<any>("/api/Emergency?reqType=allExistingPatients", this.options);
  }
  public GetAllCountries() {
    return this.http.get<any>("/api/Emergency?reqType=countryList", this.options);
  }
  public GetDoctorsList() {
    return this.http.get<any>("/api/Emergency?reqType=doctor-list", this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Emergency?reqType=GetCountrySubDivision&countryId=" + countryId, this.options);
  }
  public GetDischargeSummaryDetail(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Emergency?reqType=GetDischargeSummary&patientId=" + patientId + "&visitId=" + patientVisitId, this.options);
  }
  public GetMatchingPatientInER(firstName,lastName,dateOfBirth,phoneNumber) {
    return this.http.get<any>("/api/Emergency?reqType=findMatchingPatient&firstName=" + firstName + "&lastName=" + lastName
      + "&dateOfBirth=" + dateOfBirth + "&phoneNumber=" + phoneNumber, this.options);
  }

  public PostERPatient(ERPatient, existingPatient: boolean) {
    let data = JSON.stringify(ERPatient);
    return this.http.post<any>("/api/Emergency?reqType=addNewERPatient&selectedFromExisting=" + existingPatient, data, this.options);
  }

  public PostERDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.post<any>("/api/Emergency?reqType=addERDischargeSummary", data, this.options);
  }


  public UpdateERDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.put<any>("/api/Emergency?reqType=updateERDischargeSummary", data, this.options);
  }
  public UpdateERPatient(data) {
    return this.http.put<any>("/api/Emergency?reqType=updateERPatient", data, this.options);
  }
  public UpdateAssignedToDoctor(data) {
    return this.http.put<any>("/api/Emergency?reqType=updateProviderData", data, this.options);
  }
  public PutTriageCode(data) {
    return this.http.put<any>("/api/Emergency?reqType=updateTriageCode", data, this.options);
  }
  public UpdateLamaOfERPatient(data, action: string) {
    return this.http.put<any>("/api/Emergency?reqType=updateLama" + '&actionString=' + action, data, this.options);
  }
  public CancelRadRequest(data: string) {
    return this.http.put<any>("/api/Radiology?reqType=cancelInpatientRadRequest", data, this.options);
  }

  public CancelItemRequest(data:string){
    return this.http.put<any>("/api/Billing?reqType=cancelInpatientItemFromWard", data, this.options);
  }
  public CancelInpatientCurrentLabTest(data) {
    return this.http.put<any>('/api/Lab?reqType=cancelInpatientLabTest', data, this.options);
  }
  public CancelBillRequest(data: string) {
    return this.http.put<any>("/api/Billing?reqType=cancelInpatientBillRequest", data, this.options);
  }
  public UndoTriageOfERPatient(data) {
    return this.http.put<any>("/api/Emergency?reqType=undoTriageOfPatient", data, this.options);
  }
}
