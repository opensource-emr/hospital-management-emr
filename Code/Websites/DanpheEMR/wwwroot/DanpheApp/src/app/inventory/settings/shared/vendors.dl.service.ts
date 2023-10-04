import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class VendorsDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) { }
    //GET
    public GetVendorsList() {
        return this.http.get<any>("/api/InventorySettings/Vendors");
    }
    // public GetVendors() {
    //     return this.http.get<any>("/api/InventorySettings/VendorsWithDefaultItems");
    // }

    public GetCurrencyCode() {
        return this.http.get<any>("/api/InventorySettings/CurrencyCodes");
    }

    //POST
    public PostVendor(CurrentVendor) {
        let data = JSON.stringify(CurrentVendor);
        return this.http.post<any>("/api/InventorySettings/Vendor", data, this.options);
    }

    //PUT
    public PutVendor(vendor) {
        let data = JSON.stringify(vendor);
        return this.http.put<any>("/api/InventorySettings/Vendor", vendor, this.options);
    }

}