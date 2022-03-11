import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PHRMPurchaseOrder } from '../shared/phrm-purchase-order.model';

@Injectable()
export class PharmacyPOEndpoint {
  baseUrl: string = '/api/PharmacyPO';
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(public http: HttpClient) { }

  GetItemsForPO() {
    return this.http.get<any>(this.baseUrl);
  }
  findPurchaseOrder(POId: number) {
    return this.http.get<any>(`${this.baseUrl}/${POId}`);
  }
  UpdatePurchaseOrder(currentPOObjString: string) {
    let data = currentPOObjString;
    return this.http.put<any>(this.baseUrl, data, this.options);
  }

}
