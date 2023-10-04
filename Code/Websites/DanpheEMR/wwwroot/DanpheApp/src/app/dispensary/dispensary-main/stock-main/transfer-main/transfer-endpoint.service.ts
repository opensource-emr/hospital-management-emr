import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class TransferEndpointService {
  baseUrl: string;
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(public http: HttpClient) {
    this.baseUrl = '/api/DispensaryTransfer';
  }

  GetAllStores() {
    return this.http.get<any>(`${this.baseUrl}/GetAllStoresForTransfer`);
  }
  GetAllTransferRecordById(StoreId: number) {
    return this.http.get<any>(`${this.baseUrl}/${StoreId}`);
  }
  GetDispensariesStock(DispensaryId: number) {
    return this.http.get<any>(`${this.baseUrl}/GetDispensariesStock/${DispensaryId}`);
  }
  PostStockTransfer(stockTransfer: any[]) {
    return this.http.post<any>(this.baseUrl, stockTransfer, this.options);
  }
}




