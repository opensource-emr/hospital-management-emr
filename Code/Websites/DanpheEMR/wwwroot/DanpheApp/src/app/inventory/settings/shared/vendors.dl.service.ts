import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class VendorsDLService {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
	constructor(public http: HttpClient) { }
    //GET
    public GetVendorsList() {
        return this.http.get<any>("/api/InventorySettings?reqType=VendorsList");
    }
    public GetVendors() {
        return this.http.get<any>("/api/InventorySettings?reqType=GetVendors");
    }

    public GetCurrencyCode()
    {
        return this.http.get<any>("/api/InventorySettings?reqType=GetCurrencyCodeList");
    }

    //POST
    public PostVendor(CurrentVendor) {
        let data = JSON.stringify(CurrentVendor);
        return this.http.post<any>("/api/InventorySettings?reqType=AddVendors", data, this.options);
    }

    //PUT
    public PutVendor(vendor) {
        let data = JSON.stringify(vendor);
        return this.http.put<any>("/api/InventorySettings?reqType=UpdateVendors", vendor, this.options);
    }
   
}