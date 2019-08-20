import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { PackagingTypeModel } from "../shared/packaging-type.model";

@Injectable()
export class PackagingTypeDLService {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
	constructor(public http: HttpClient) { }
    //GET
    public GetPackagingTypeList() {
        return this.http.get<any>("/api/InventorySettings?reqType=PackagingTypeList");
    }
    public GetPackagingType() {
        return this.http.get<any>("/api/InventorySettings?reqType=GetPackagingType");
    }



    //POST
    public PostPackagingType(CurrentPackagingType) {
        let data = JSON.stringify(CurrentPackagingType);
        return this.http.post<any>("/api/InventorySettings?reqType=AddPackagingType", data, this.options);
    }

    //PUT
    public PutPackagingType(packagingtype) {
        let data = JSON.stringify(packagingtype);
        return this.http.put<any>("/api/InventorySettings?reqType=UpdatePackagingType", packagingtype, this.options);
    }

}