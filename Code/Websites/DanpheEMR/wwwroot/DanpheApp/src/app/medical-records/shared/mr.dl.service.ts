import { Injectable } from "@angular/core";
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class MR_DLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService, public http: HttpClient) {

  }

  public GetAllMasterDataForMR() {
    return this.http.get<any>("/api/MedicalRecords?reqType=getMasterDataForMREntry", this.options);
  }
  public GetAllTestsByPatIdAndVisitId(patId,visitId) {
    return this.http.get<any>("/api/MedicalRecords?reqType=pat-tests&patientId=" + patId + "&patientVisitId=" + visitId, this.options);
  }
  public GetPatientMRDetailWithMasterData(medicalRecordId, patVisitId) {
    return this.http.get<any>("/api/MedicalRecords?reqType=pat-mr-with-masterdata&medicalRecordId=" + medicalRecordId + "&patientVisitId=" + patVisitId, this.options);
  }
  public GetBirthList(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords?reqType=birth-list&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetDeathList(fromDate, toDate) {
    return this.http.get<any>("/api/MedicalRecords?reqType=death-list&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetBirthDetailForCertificate(babyBirthDetailId) {
    return this.http.get<any>("/api/MedicalRecords?reqType=birth-certificate-detail&birthDetailId=" + babyBirthDetailId, this.options);
  }
  public GetDeathDetailForCertificate(babyBirthDetailId) {
    return this.http.get<any>("/api/MedicalRecords?reqType=death-certificate-detail&deathDetailId=" + babyBirthDetailId, this.options);
  }

  public PostMRofPatient(mrOfPat: string) {
    let data = mrOfPat;
    return this.http.post<any>("/api/MedicalRecords?reqType=post-patient-medicalrecord", data, this.options);
  }

  public PutMedicalRecord(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-patient-medicalrecord", data, this.options);
  }

  public PutBirthDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-birthdetail", data, this.options);
  }

  public PutBirthCertificateReportDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-birth-certificate-detail", data, this.options);
  }

  public PutDeathCertificateReportDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-death-certificate-detail", data, this.options);
  }

  public PutBirthCertificatePrintDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-birth-cert-printcount", data, this.options);
  }

  public PutDeathCertificatePrintDetail(data: string) {
    return this.http.put<any>("/api/MedicalRecords?reqType=update-death-cert-printcount", data, this.options);
  }

}
