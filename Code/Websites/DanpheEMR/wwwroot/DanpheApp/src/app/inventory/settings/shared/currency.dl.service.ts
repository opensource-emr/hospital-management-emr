import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CurrencyModel } from "../shared/currency.model";

@Injectable()
export class CurrencyDLService {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
   constructor(public http: HttpClient) { }
    //GET
    public GetCurrencyCode() {
        return this.http.get<any>("/api/InventorySettings?reqType=GetCurrencyCodeList", this.options);
    }
    //POST
    public PostCurrency(CurrentCurrency) {
        let data = JSON.stringify(CurrentCurrency);
        return this.http.post<any>("/api/InventorySettings?reqType=AddCurrency", data, this.options);
    }

    //PUT
    public PutCurrency(currency) {
        let data = JSON.stringify(currency);
        return this.http.put<any>("/api/InventorySettings?reqType=UpdateCurrency", currency, this.options);
    }

}