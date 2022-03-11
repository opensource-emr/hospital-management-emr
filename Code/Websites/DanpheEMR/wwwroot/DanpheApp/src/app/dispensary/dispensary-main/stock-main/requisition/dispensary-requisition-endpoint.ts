import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DispensaryRequisitionEndpoint {
  baseUrl: string;
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(public http: HttpClient) {
    this.baseUrl = '/api/DispensaryRequisition';
  }

  GetAllRequisitionList(fromDate: string, toDate: string) {
    return this.http.get<any>(`${this.baseUrl}?FromDate=` + fromDate + "&ToDate=" + toDate, this.options);
  }
  GetAllRequisitionListByDispensaryId(dispensaryId: number, fromDate: string, toDate: string) {
    return this.http.get<any>(`${this.baseUrl}/Dispensary/${dispensaryId}?FromDate=` + fromDate + "&ToDate=" + toDate, this.options)
  }
  GetItemsForRequisition(isInsurance: boolean = false) {
    return this.http.get<any>(`${this.baseUrl}/GetItemsForRequisition/${isInsurance}`);
  }
  GetRequisitionView(requisitionId) {
    return this.http.get<any>(`${this.baseUrl}/${requisitionId}`);
  }
  GetDispatchListForItemReceive(requisitionId: number) {
    return this.http.get<any>(`${this.baseUrl}/GetDispatchListForItemReceive/${requisitionId}`);
  }
  AddRequisition(data: string) {
    return this.http.post<any>(`${this.baseUrl}`, data, this.options);
  }
  ReceiveDispatchedItems(dispatchId: number, receivedRemarks: string) {
    return this.http.put<any>(`${this.baseUrl}/ReceiveDispatchedItems/${dispatchId}`, receivedRemarks, this.options);
  }
  ApproveRequisition(requisitionId: number) {
    return this.http.put<any>(`${this.baseUrl}/ApproveRequisition/${requisitionId}`, this.options);
  }
  CancelRequisitionItems(requisition: any) {
    return this.http.put<any>(`${this.baseUrl}/CancelRequisitionItems`, requisition, this.options);
  }
}
