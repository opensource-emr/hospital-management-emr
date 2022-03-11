import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class OperationTheatreDLService {
  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public _http: HttpClient) {
    this.http = _http;
  }

  public GetEmployeeList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-employee");
  }

  public GetIcdList() {
    return this.http.get<any>("/api/Admission?reqType=get-icd10-list");
  }

  public GetAllOTBookingDetails() {
    return this.http.get<any>("/api/OperationTheatre?reqType=getAllOtBookingInfo")
  }

  public PostNewBookingDetails(d) {
    let data = JSON.stringify(d);
    return this.http.post<any>("/api/OperationTheatre?reqType=addNewOtBookingDetails", data, this.options);
  }

  public PutBookingDetails(data) {
    let strData = JSON.stringify(data);
    return this.http.put<any>("/api/OperationTheatre?reqType=UpdateOtDetails", strData, this.options);
  }
}