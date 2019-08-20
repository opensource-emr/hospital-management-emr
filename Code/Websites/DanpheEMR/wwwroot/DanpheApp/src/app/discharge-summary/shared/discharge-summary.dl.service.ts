import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DischargeDetailBillingVM } from '../../billing/ip-billing/shared/discharge-bill.view.models';

@Injectable()
export class DischargeSummaryDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {
  }


  public GetDischargeType() {
    return this.http.get<any>("/api/Admission?reqType=discharge-type", this.options);
  }
  public GetDischargeConditions() {
    return this.http.get<any>("/api/Admission?reqType=get-discharge-condition-type", this.options);
  }
  public GetDeliveryType() {
    return this.http.get<any>("/api/Admission?reqType=get-delivery-type", this.options);
  }
  public GetBabyBirthCondition() {
    return this.http.get<any>("/api/Admission?reqType=get-baby-birth-condition", this.options);
  }
  public GetCurrentFiscalYear(){
    return this.http.get<any>("/api/Admission?reqType=get-active-FiscalYear", this.options);
  }
  public GetCertificate(dischargeSummaryId : number, PatientId: number){
    return this.http.get<any>("/api/Admission?reqType=get-Certificate&dischargeSummaryId=" + dischargeSummaryId + "&patientId=" + PatientId, this.options);
  }
  public GetDeathType(){
    return this.http.get<any>("/api/Admission?reqType=get-death-type", this.options);
  }
  public GetProviderList() {
    return this.http.get<any>("/api/Admission?reqType=provider-list", this.options);
  }
  public GetAnasthetistsEmpList() {
    return this.http.get<any>("/api/Admission?reqType=anasthetists-employee-list", this.options);
  }
  public GetICDList() {
    return this.http.get<any>("/api/Admission?reqType=get-icd10-list", this.options);
  }

  public GetMedicationFrequency() {
    return this.http.get<any>("/api/Admission?reqType=get-medication-frequency", this.options);
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.http.get<any>("/api/Admission?reqType=discharge-summary-patientVisit&patientVisitId=" + patientVisitId, this.options);
  }
  public PostDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.post<any>("/api/Admission?reqType=discharge-summary", data, this.options);
  }
  public PutDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.put<any>("/api/Admission?reqType=discharge-summary", data, this.options);
  }
public PostCertificate(patCertificate){
  let data = JSON.stringify(patCertificate);
  return this.http.post<any>("/api/Admission?reqType=patient-birth-certificate", data, this.options);
}
public UpdateCertificate(patCertificate){
  let data = JSON.stringify(patCertificate);
  return this.http.put<any>("/api/Admission?reqType=update-birth-certificate", data, this.options);
}

}








