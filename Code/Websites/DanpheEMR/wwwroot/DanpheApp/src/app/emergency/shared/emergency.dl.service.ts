import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    return this.http.get<any>("/api/Emergency/LatestEmergencyNumberAndModeOfArrival", this.options);
  }
  public GetAllERPatients(caseId: number) {
    if (!caseId) { caseId = 0; }
    return this.http.get<any>("/api/Emergency/EmergencyPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllTriagedPatients(caseid: number) {
    return this.http.get<any>("/api/Emergency/TriagedPatients?selectedCase=" + caseid, this.options);
  }
  public GetAllLamaERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/LamaPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllAdmittedERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/AdmittedPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllDeathERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/DeadPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllTransferredERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/TransferredPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllDischargedERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/DischargedPatients?selectedCase=" + caseId, this.options);
  }
  public GetAllDorERPatients(caseId: number) {
    return this.http.get<any>("/api/Emergency/DischargeOnRequestPatients?selectedCase=" + caseId, this.options);
  }
  public GetPatients() {
    return this.http.get<any>("/api/Emergency/ExistingPatients", this.options);
  }
  public GetAllCountries() {
    return this.http.get<any>("/api/Emergency/Countries", this.options);
  }
  public GetDoctorsList() {
    return this.http.get<any>("/api/Emergency/Doctors", this.options);
  }
  // getting the  GetCountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.http.get<any>("/api/Emergency/CountrySubDivisions?countryId=" + countryId, this.options);
  }
  public GetDischargeSummaryDetail(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Emergency/DischargeSummary?patientId=" + patientId + "&visitId=" + patientVisitId, this.options);
  }
  public GetMatchingPatientInER(firstName, lastName, dateOfBirth, phoneNumber) {
    return this.http.get<any>("/api/Emergency/MatchingPatient?firstName=" + firstName + "&lastName=" + lastName
      + "&dateOfBirth=" + dateOfBirth + "&phoneNumber=" + phoneNumber, this.options);
  }

  public PostERPatient(ERPatient, existingPatient: boolean) {
    let data = JSON.stringify(ERPatient);
    return this.http.post<any>("/api/Emergency/RegisterPatient?selectedFromExisting=" + existingPatient, data, this.options);
  }

  public PostERDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.post<any>("/api/Emergency/DischargeSummary", data, this.options);
  }


  public UpdateERDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.put<any>("/api/Emergency/ERDischargeSummary", data, this.options);
  }
  public UpdateERPatient(data) {
    return this.http.put<any>("/api/Emergency/Patient", data, this.options);
  }
  public UpdateAssignedToDoctor(data) {
    return this.http.put<any>("/api/Emergency/PerformerDetail", data, this.options);
  }
  public PutTriageCode(data) {
    return this.http.put<any>("/api/Emergency/TriagedCode", data, this.options);
  }
  public UpdateLamaOfERPatient(data, action: string) {
    return this.http.put<any>("/api/Emergency/LeaveAgainstMedicalAdvice?actionString=" + action, data, this.options);
  }
  public CancelRadRequest(data: string) {
    return this.http.put<any>("/api/Radiology/CancelInpatientRequisitions", data, this.options);
  }

  public CancelItemRequest(data: string) {
    return this.http.put<any>("/api/Billing/CancelInpatientItemFromWard", data, this.options);
  }
  public CancelInpatientCurrentLabTest(data) {
    return this.http.put<any>('/api/Lab/CancelInpatientLabTest', data, this.options);
  }
  public CancelBillRequest(data: string) {
    return this.http.put<any>("/api/Billing/CancelOutpatientProvisionalItem", data, this.options);
  }
  public UndoTriageOfERPatient(data) {
    return this.http.put<any>("/api/Emergency/UndoTriageOfPatient", data, this.options);
  }
  public GetConsentFormUploadList(id: number) {
    return this.http.get<any>("/api/Emergency/ConsentForm?patientId=" + id, this.options);
  }
  public PostConsentForm(data: any) {
    try {
      return this.http.post<any>("/api/Emergency/UploadPatientConsentForm", data);
    } catch (exception) {
      throw exception;
    }
  }
  public DeleteFile(id: number) {
    return this.http.put<any>("/api/Emergency/CosentForm?id=" + id, this.options);
  }
  public GetFileFromServer(id: number) {
    return this.http.get<any>("/api/Emergency/DownloadFile?FileId=" + id, {
      responseType: 'blob' as 'json',
    });
  }
}
