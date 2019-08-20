import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class PhrmRackEndPoint {

    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
  
    constructor(public http: HttpClient) {

    }

    //GET: list of rack
    public GetRackList() {
        return this.http.get<any>("/api/PharmacyRack", this.options);
    }

    // POST: add new rack
    public AddRack(CurrentRack) {
        var temp = _.omit(CurrentRack, ['RackValidator']);
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/PharmacyRack", data, this.options);
    }

    public UpdateRack(id, CurrentRack) {
        var temp = _.omit(CurrentRack, ['RackValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/PharmacyRack/" + id, data, this.options);
    }

    // Get: Rack By Id
    public GetRack(id: number) {
        return this.http.get<any>("/api/PharmacyRack/" + id, this.options);
    }

    // GET: list parent rack
    public GetParentRackList() {
        return this.http.get<any>("/api/GetParentRack", this.options);
    }   

    public GetDrugList(rackId) {
        return this.http.get<any>("/api/GetDrugsList/" + rackId, this.options);
    }
}
