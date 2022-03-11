import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CssdReportEndpointService {
  baseUrl: string;
  option = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
  optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(private _http: HttpClient) {
    this.baseUrl = '/api/CSSDReport';
  }
  getIntegratedCssdReport(fromDate: string, toDate: string) {
    return this._http.get<any>(`${this.baseUrl}/GetIntegratedCssdReport?FromDate=${fromDate}&ToDate=${toDate}`);
  }
}
