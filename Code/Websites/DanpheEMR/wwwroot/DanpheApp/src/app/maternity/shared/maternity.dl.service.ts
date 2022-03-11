import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CommonFunctions } from "../../shared/common.functions";

@Injectable()
export class MaternityDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) {
  }

  public GetDataForEdit() {
    return this.http.get<any>("/api/Maternity/GetDatForEditSearch?searchText=:dd", this.options);
  }

  public GetPatientDetails() {
    return this.http.get<any>("/api/Maternity/GetPatientDetails", this.options);
  }

  public GetAllActiveMaternityPatientList(showAll, fromDate, toDate) {
    return this.http.get<any>("/api/Maternity/GetAllActiveMaternityPatientList?showAll=" + showAll + "&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  public GetFileFromServer(id: number) {
    return this.http.get<any>("/api/Maternity/DownloadFile?matPatientFileId=" + id, {
      responseType: 'blob' as 'json',
    });
  }

  public AddMaternityPatient(data) {
    return this.http.post<any>("/api/Maternity/AddMaternityPatient", data, this.options);
  }

  public AddMaternityPatientPayment(data) {
    return this.http.post<any>("/api/Maternity/AddMaternityPatientPayment", data, this.options);
  }

  public UpdateMaternityPatient(data) {
    return this.http.post<any>("/api/Maternity/UpdateMaternityPatient", data, this.options);
  }

  public GetPatientDetailById(id: number) {
    return this.http.get<any>("/api/Maternity/GetPatientDetailById?id=" + id, this.options);
  }
  public GetPatientPaymentDetailById(id: number) {
    return this.http.get<any>("/api/Maternity/GetPatientPaymentDetailById?id=" + id, this.options);
  }
  public GetPatientPaymentDetailByPaymentId(id: number) {
    return this.http.get<any>("/api/Maternity/GetPatientPaymentDetailByPaymentId?id=" + id, this.options);
  }
  public GetAllDosesNumber(doseNeeded: boolean) {
    return this.http.get<any>("/api/Maternity/GetAllDosesNumber?doseNeeded=" + doseNeeded, this.options);
  }

  public GetAllANCByMaternityPatientId(id: number) {
    return this.http.get<any>("/api/Maternity/GetAllANCByMaternityPatId?id=" + id, this.options);
  }

  public GetMaternityFileUploadList(id: number) {
    return this.http.get<any>("/api/Maternity/GetAllFilesUploadedbyMaternityPatId?id=" + id, this.options);
  }
  public GetAllChildList(matId: number, patId: number) {
    return this.http.get<any>("/api/Maternity/GetAllBabyDetailsByMaternityPatId?matId=" + matId + "&patId=" + patId, this.options);
  }

  public GetMaternityAllowanceReportList(fromDate, toDate) {
    return this.http.get<any>("/api/Maternity/GetMaternityAllowanceReportList?&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  public AddUpdateMaternityANC(data) {
    return this.http.post<any>("/api/Maternity/AddUpdateMaternityANC", data, this.options);
  }

  public RegisterMaternity(data) {
    return this.http.post<any>("/api/Maternity/RegisterMaternity", data, this.options);
  }

  public PostMaternityPatientFiles(data: any) {
    try {
      return this.http.post<any>("/api/Maternity/UploadMaternityPatientFiles", data);
    } catch (exception) {
      throw exception;
    }
  }

  public UpdateChildInfo(data) {
    return this.http.post<any>("/api/Maternity/UpdateChildInfo", data, this.options);
  }

  public UpdateMotherInfo(data){
    return this.http.post<any>("/api/Maternity/UpdateMotherInfo", data, this.options);
  }

  public DeleteMaternityPatient(id: number) {
    return this.http.delete<any>("/api/Maternity/DeleteMaternityPatient?id=" + id, this.options);
  }

  public ConcludeMaternityPatient(id: number) {
    return this.http.delete<any>("/api/Maternity/Conclude?id=" + id, this.options);
  }

  public DeleteMaternityPatientANC(id: number) {
    return this.http.delete<any>("/api/Maternity/DeleteMaternityPatientANC?id=" + id, this.options);
  }

  public DeleteMaternityPatientFile(id: number) {
    return this.http.delete<any>("/api/Maternity/DeleteMaternityPatientFile?id=" + id, this.options);
  }
  public DeleteChild(id: number) {
    return this.http.delete<any>("/api/Maternity/RemoveChild?id=" + id, this.options);
  }
  public SearchPatListForAllowance(searchText,isSearchAll) {
    return this.http.get<any>("/api/Maternity/SearchPatListForAllowance?searchText=" + searchText + "&IsSearchAll=" + isSearchAll,this.options);
  }
}
