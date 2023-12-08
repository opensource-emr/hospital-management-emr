import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";

@Injectable()
export class MR_DLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService, public http: HttpClient) {

  }

  public GetAllMasterDataForMR() {
    return this.http.get<any>("/api/MedicalRecords/MRMasterData", this.options);
  }
  public GetAllTestsByPatIdAndVisitId(patId, visitId) {
    return this.http.get<any>("/api/MedicalRecords/PatientTests?patientId=" + patId + "&patientVisitId=" + visitId, this.options);
  }
  public GetPatientMRDetailWithMasterData(medicalRecordId, patVisitId) {
    return this.http.get<any>("/api/MedicalRecords/PatientMrDetails?medicalRecordId=" + medicalRecordId + "&patientVisitId=" + patVisitId, this.options);
  }
  public GetBirthList(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords/Births?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetDeathList(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords/DeathPatients?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetBirthDetailForCertificate(babyBirthDetailId) {
    return this.http.get<any>("/api/MedicalRecords/BirthCertificateDetail?birthDetailId=" + babyBirthDetailId, this.options);
  }
  public GetDeathDetailForCertificate(babyBirthDetailId) {
    return this.http.get<any>("/api/MedicalRecords/DeathCertificateDetail?deathDetailId=" + babyBirthDetailId, this.options);
  }

  public PostMRofPatient(mrOfPat: string) {
    let data = mrOfPat;
    return this.http.post<any>("/api/MedicalRecords/PatientMedicalRecord", data, this.options);
  }

  public PutMedicalRecord(data: string) {
    return this.http.put<any>("/api/MedicalRecords/MedicalRecord", data, this.options);
  }

  public PutBirthDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords/Birthdetail", data, this.options);
  }

  public PutBirthCertificateReportDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords/BirthCertificateDetail", data, this.options);
  }

  public PutDeathCertificateReportDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords/DeathCertificateDetail", data, this.options);
  }

  public PutBirthCertificatePrintDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords/BirthCertificatePrintCount", data, this.options);
  }

  public PutDeathCertificatePrintDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords/DeathCertificatePrintCount", data, this.options);
  }

  public PostBirthCertificateDetail(data: string) {
    return this.http.post<any>("/api/MedicalRecords/BirthDetails", data, this.options);
  }

  public PostDeathDetails(data: string) {
    return this.http.post<any>("/api/MedicalRecords/AddDeathDetails", data, this.options);
  }

  //GET: Get AllPatients
  public GetAllPatients(searchTxt) {
    return this.http.get<any>(`/api/MedicalRecords/SearchDeadPatient/${searchTxt}`);
  }

  //GET: Get All Female Patients
  public GetAllFemalePatients(searchTxt) {
    return this.http.get<any>(`/api/MedicalRecords/FemalePatientsVisitDetails/${searchTxt}`);
  }

  public GetAllDeadPatient() {
    return this.http.get<any>('/api/medicalRecords/DeadPatients');
  }

  public GetPatientDeathDetailsById(PatId) {
    return this.http.get<any>(`/api/medicalRecords/PatientDeathDetail/${PatId}`);
  }

  public GetAllBirthRecord() {

  }
  public PutDeathDetails(data: string) {
    return this.http.put<any>("/api/MedicalRecords/DeathDetail", data, this.options);
  }

  public GetAllOutpatientListWithVisitInfo(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords/OutPatientsVisitInfo?fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  // Bikash,24thMay'21: getting all ICD10 reporting groups (i.e. Department wise ICD10 categorization)
  public GetICD10ReportingGroup() {
    return this.http.get<any>("/api/MedicalRecords/ICD10ReportingGroup");
  }

  // Bikash,24thMay'21: getting all ICD10 Disease groups (i.e. Disease wise ICD10 categorization)
  public GetICD10DiseaseGroup() {
    return this.http.get<any>("/api/MedicalRecords/ICD10DiseaseGroup");
  }

  public GetICDList() {
    return this.http.get<any>("/api/MedicalRecords/ICD10List");
  }
  public GetAllBirthCertificateNumbers() {
    return this.http.get<any>("/api/MedicalRecords/BirthCertificateNumbers");
  }

  public GetAllMRFileNumbers() {
    return this.http.get<any>("/api/MedicalRecords/MRFileNumbers");
  }

  public GetAllDeathCertificateNumbers() {

    return this.http.get<any>("/api/MedicalRecords/DeathCertificatesNumbers")
  }

  public GetOutpatientDiagnosisByVisitId(patId, patVisitId) {
    return this.http.get<any>(`/api/MedicalRecords/OutpatientDiagnosis/${patId}/${patVisitId}`)
  }

  public PostFinalDiagnosis(data) {
    return this.http.post<any>("/api/MedicalRecords/FinalDiagnosis", data);
  }
  public GetBabyDetailsListByMotherPatientId(patientId) {
    return this.http.get<any>("/api/MedicalRecords/BabyDetails/" + patientId);
  }
  public GetLatestDeathCertificateNumber() {
    return this.http.get<any>("/api/MedicalRecords/LatestDeathCertificateNumber");
  }

  public GetAllEmergencypatientListWithVisitInfo(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords/EmergencyPatientsListWithVisitInfo/" + fromDate + "/" + toDate, this.options);
  }

  public GetICDReportingGroupForEmergency() {
    return this.http.get<any>("/api/MedicalRecords/ICDReportingGroupForEmergencyPatient");
  }

  public GetICDDiseaseGroupForEmergency() {
    return this.http.get<any>("/api/MedicalRecords/ICDDiseaseGroupForEmergencyPatient");
  }
  public GetEmergencypatientDiagnosisByVisitId(patId, patVisitId) {
    return this.http.get<any>(`/api/MedicalRecords/EmergencyPatientDiagnosisDetail/${patId}/${patVisitId}`)
  }
  public PostFinalDiagnosisForEmergencyPatient(data) {
    return this.http.post<any>("/api/MedicalRecords/PostEmergencyFinalDiagnosis", data);
  }

  public GetDischargedPatientsList(fromDate: string, toDate: string) {
    return this.http.get<any>(`/api/MedicalRecords/DischargedPatients?fromDate=${fromDate}&toDate=${toDate}`);
  }
  public GetEthnicGroupStatisticsData(fromDate: string, toDate: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/MedicalRecords/EthnicGroupStatisticsReports?fromDate=${fromDate}&toDate=${toDate}`);
  }

}
