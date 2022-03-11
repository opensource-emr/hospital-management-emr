import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';

@Injectable()
export class DispensaryEndpoint {
  baseUrl: string;
  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(public http: HttpClient) {
    this.baseUrl = '/api/Dispensary/';
  }

  GetAllDispensaryList() {
    return this.http.get<any>(this.baseUrl);
  }
  GetAllPharmacyStores() {
    return this.http.get<any>(`${this.baseUrl}GetAllPharmacyStores`);
  }
  GetDispensaryById(dispensaryId: number) {
    return this.http.get<any>(`${this.baseUrl}${dispensaryId}`)
  }
  AddDispensary(dispensary: PHRMStoreModel) {
    return this.http.post<any>(this.baseUrl, dispensary, this.options);
  }
  UpdateDispensary(dispensary: PHRMStoreModel) {
    return this.http.put<any>(this.baseUrl, dispensary, this.options);
  }
  ActivateDeactivateDispensary(dispensaryId: number) {
    return this.http.put<any>(`${this.baseUrl}${dispensaryId}`, this.options);
  }
}
