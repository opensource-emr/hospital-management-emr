import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UnitOfMeasurementModel } from "../shared/unit-of-measurement.model";

@Injectable()
export class UnitOfMeasurementDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
 constructor(public http: HttpClient) { }
    //GET
    public GetUnitOfMeasurementList() {
        return this.http.get<any>("/api/InventorySettings?reqType=UnitOfMeasurementList");
    }
    public GetUnitOfMeasurement() {
        return this.http.get<any>("/api/InventorySettings?reqType=GetUnitOfMeasurement");
    }



    //POST
    public PostUnitOfMeasurement(CurrentUnitOfMeasurement) {
        let data = JSON.stringify(CurrentUnitOfMeasurement);
        return this.http.post<any>("/api/InventorySettings?reqType=AddUnitOfMeasurement", data, this.options);
    }

    //PUT
    public PutUnitOfMeasurement(unitofmeasurement) {
        let data = JSON.stringify(unitofmeasurement);
        return this.http.put<any>("/api/InventorySettings?reqType=UpdateUnitOfMeasurement", unitofmeasurement, this.options);
    }

}