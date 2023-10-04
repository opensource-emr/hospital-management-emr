import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ItemCategoryModel } from "../shared/item-category.model";

@Injectable()
export class ItemCategoryDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) { }
    //GET
    public GetItemCategoryList() {
        return this.http.get<any>("/api/InventorySettings/Vendors");
    }
    public GetItemCategory() {
        return this.http.get<any>("/api/InventorySettings/ItemCategories");
    }



    //POST
    public PostItemCategory(CurrentItemCategory) {
        let data = JSON.stringify(CurrentItemCategory);
        return this.http.post<any>("/api/InventorySettings/ItemCategory", data, this.options);
    }

    //PUT
    public PutItemCategory(itemCategory) {
        let data = JSON.stringify(itemCategory);
        return this.http.put<any>("/api/InventorySettings/ItemCategory", itemCategory, this.options);
    }

}