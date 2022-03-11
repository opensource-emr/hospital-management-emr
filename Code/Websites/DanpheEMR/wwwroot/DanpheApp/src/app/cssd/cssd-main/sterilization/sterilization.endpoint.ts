import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DanpheHTTPResponse } from '../../../shared/common-models';

@Injectable()
export class SterilizationEndpoint {
  baseUrl: string;
  option = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
  optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(private _http: HttpClient) {
    this.baseUrl = '/api/CSSDSterilization';
  }
  getAllPendingCSSDTransactions(fromDate, toDate): Observable<DanpheHTTPResponse> {
    return this._http.get<any>(`${this.baseUrl}/GetAllPendingCSSDTransactions?FromDate=${fromDate}&ToDate=${toDate}`);
  }
  getAllFinalizedCSSDTransactions(fromDate, toDate): Observable<DanpheHTTPResponse> {
    return this._http.get<any>(`${this.baseUrl}/GetAllFinalizedCSSDTransactions?FromDate=${fromDate}&ToDate=${toDate}`);
  }
  disinfectCSSDItem(cssdTxnId, disinfectantName, disinfectionRemarks): Observable<DanpheHTTPResponse> {
    return this._http.put<any>(`${this.baseUrl}/DisinfectCSSDItem?CssdTxnId=${cssdTxnId}&DisinfectantName=${disinfectantName}&DisinfectionRemarks=${disinfectionRemarks}`, this.option);
  }
  dispatchCSSDItem(cssdTxnId, dispatchRemarks): Observable<DanpheHTTPResponse> {
    return this._http.put<any>(`${this.baseUrl}/DispatchCSSDItem?CssdTxnId=${cssdTxnId}&DispatchRemarks=${dispatchRemarks}`, this.option);
  }

}
