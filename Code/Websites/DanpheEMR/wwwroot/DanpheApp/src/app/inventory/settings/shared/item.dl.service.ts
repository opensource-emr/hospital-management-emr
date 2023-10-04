import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ItemModel } from "../shared/item.model";

@Injectable()
export class ItemDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) { }
    //GET
    public GetItemList() {
        return this.http.get<any>("/api/InventorySettings?reqType=ItemList");
    }
    public GetItem() {
        return this.http.get<any>("/api/InventorySettings?reqType=GetItem");
    }

    public GetAccountHead() {
        return this.http.get<any>("/api/InventorySettings/AccountHeads");
    }
    public GetPackagingType() {
        return this.http.get<any>("/api/InventorySettings/PackagingTypes");
    }
    public GetUnitOfMeasurement() {
        return this.http.get<any>("/api/InventorySettings/UnitOfMeasurements");
    }
    public GetItemCategory() {
        return this.http.get<any>("/api/InventorySettings/ItemCategories");
    }

    //POST
    public PostItem(CurrentItem) {
        let data = JSON.stringify(CurrentItem);
        return this.http.post<any>("/api/InventorySettings/Item", data, this.options);
    }

    //PUT
    public PutItem(Item) {
        let data = JSON.stringify(Item);
        return this.http.put<any>("/api/InventorySettings/Item", Item, this.options);
    }

}