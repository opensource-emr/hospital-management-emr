import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AccountHeadModel } from "../shared/account-head.model";

@Injectable()
export class AccountHeadDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) { }
    //GET
    public GetAccountHeadList() {
        return this.http.get<any>("/api/InventorySettings?reqType=AccountHeadList");
    }
    public GetAccountHead() {
        return this.http.get<any>("/api/InventorySettings/AccountHeads");
    }



    //POST
    public PostAccountHead(CurrentAccountHead) {
        let data = JSON.stringify(CurrentAccountHead);
        return this.http.post<any>("/api/InventorySettings/AccountHead", data, this.options);
    }



    //PUT
    public PutAccountHead(accounthead) {
        let data = JSON.stringify(accounthead);
        return this.http.put<any>("/api/InventorySettings/AccountHead", accounthead, this.options);
    }
}