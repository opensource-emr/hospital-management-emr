import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NepaliReceiptEndpointService {

  baseUrl: string;
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(public http: HttpClient) {
    this.baseUrl = '/api/NepaliReceipt';
  }

  GetNepaliRequisitionView(RequisitionId: number, ModuleType: string) {
    return this.http.get<any>(`${this.baseUrl}/GetNepaliRequisitionView?RequisitionId=${RequisitionId}&ModuleType=${ModuleType}`);
  }
  GetNepaliDispatchView(DispatchId: number, ModuleType: string) {
    return this.http.get<any>(`${this.baseUrl}/GetNepaliDispatchView?DispatchId=${DispatchId}&ModuleType=${ModuleType}`);
  }
  GetDoncationGRView(goodsReceiptId: number) {
    return this.http.get<any>(`${this.baseUrl}/GetDonationGRView?GoodsReceiptId=${goodsReceiptId}`);
  }
}
