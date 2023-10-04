import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DonationModel } from './donation.model';

@Injectable()
export class DonationService {

  private baseUrl: string;
  option = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
  optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(
    private http: HttpClient) {
  }
  getAvailableStock(storeId: number) {
    return this.http.get<any>(`/api/Inventory/StocksForDonation?storeId=${storeId}`);

  }
  getAllVendorsThatReceiveDonation() {
    return this.http.get<any>(`/api/donation/GetAllVendorsThatReceiveDonation`);
  }

  GetDonationViewById(donationId: number) {
    return this.http.get<any>(`/api/donation/getDonationDetailsById/${donationId}`);
  }
  GetDonationById(donationId: number) {
    return this.http.get<any>(`/api/donation/getDonationById/${donationId}`);
  }

  SaveDonation(donations: DonationModel) {
    return this.http.post<any>(`/api/donation`, donations);
  }
  UpdateDonation(donations: DonationModel, DonationId: number) {
    return this.http.put<any>(`/api/donation/${DonationId}`, donations);
  }
  CancelDonation(DonationId: number, Remarks: string) {
    return this.http.put<any>(`/api/donation/cancel/${DonationId}`, Remarks);
  }
  GetAllDonationList(fromDate, toDate, StoreId) {
    return this.http.get<any>("/api/donation/getAllDonations/" + fromDate + "/" + toDate + "/" + StoreId);
  }

}
