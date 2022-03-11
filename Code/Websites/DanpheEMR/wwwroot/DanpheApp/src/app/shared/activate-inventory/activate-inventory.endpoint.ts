import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ActivateInventoryEndpoint {
  baseUrl: string;
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(public http: HttpClient) {
    this.baseUrl = '/api/ActivateInventory/';
  }

  GetAllInventoryList() {
    return this.http.get<any>(this.baseUrl);
  }
  GetInventoryById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`)
  }
}
