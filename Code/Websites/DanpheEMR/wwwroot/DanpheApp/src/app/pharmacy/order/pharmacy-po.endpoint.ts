import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PharmacyPOEndpoint {
  baseUrl: string = '/api/PharmacyPO';
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(public http: HttpClient) { }

  GetItemsForPO() {
    return this.http.get<any>(this.baseUrl);
  }
}
