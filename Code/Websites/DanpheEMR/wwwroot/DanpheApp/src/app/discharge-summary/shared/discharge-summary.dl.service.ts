import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';

@Injectable()
export class DischargeSummaryDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(public http: HttpClient) {
  }


  public GetDischargeType() {
    return this.http.get<any>("/api/Admission/DischargeTypes", this.options);
  }
  public GetDischargeConditions() {
    return this.http.get<any>("/api/Admission/DischargeConditions", this.options);
  }
  public GetDeliveryType() {
    return this.http.get<any>("/api/Admission/DeliveryTypes", this.options);
  }
  public GetBabyBirthCondition() {
    return this.http.get<any>("/api/Admission/BirthConditions", this.options);
  }
  public GetCurrentFiscalYear() {
    return this.http.get<any>("/api/Admission/ActiveFiscalYear", this.options);
  }
  public GetCertificate(dischargeSummaryId: number, PatientId: number) {
    return this.http.get<any>("/api/Admission/PatientCertificate?dischargeSummaryId=" + dischargeSummaryId + "&patientId=" + PatientId, this.options);
  }
  public GetDeathType() {
    return this.http.get<any>("/api/Admission/DeathTypes", this.options);
  }
  public GetProviderList() {
    return this.http.get<any>("/api/Admission/AppointmentApplicableDoctors", this.options);
  }
  public GetAnasthetistsEmpList() {
    return this.http.get<any>("/api/Admission/Anaesthetists", this.options);
  }
  public GetICDList() {
    return this.http.get<any>("/api/Admission/ICD10", this.options);
  }

  public GetMedicationFrequency() {
    return this.http.get<any>("/api/Admission/MedicationFrequencies", this.options);
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.http.get<any>("/api/Admission/DischargeSummary?patientVisitId=" + patientVisitId, this.options);
  }
  public PostDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.post<any>("/api/Admission/DischargeSummary", data, this.options);
  }
  public PutDischargeSummary(dischargeSummary) {
    let data = JSON.stringify(dischargeSummary);
    return this.http.put<any>("/api/Admission/DischargeSummary", data, this.options);
  }
  public PostCertificate(patCertificate) {
    let data = JSON.stringify(patCertificate);
    return this.http.post<any>("/api/Admission/BirthCertificate", data, this.options);
  }
  public UpdateCertificate(patCertificate) {
    let data = JSON.stringify(patCertificate);
    return this.http.put<any>("/api/Admission/BirthCertificate", data, this.options);
  }
  public GetDischargeSummaryTemplates(TemplateTypeName: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/Templates?templateTypeName=${TemplateTypeName}`, this.optionJson);
  }
  public LoadTemplateFields(TemplateId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/TemplateFields?templateId=${TemplateId}`, this.optionJson)
  }
  public LoadTemplate(TemplateId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/TemplatePrintHtml?templateId=${TemplateId}`, this.optionJson);
  }
}








