import { Injectable, Directive } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class DesignationEndPoint {

    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
    constructor(public http: HttpClient) {
    }

    //GET: list of companies
    public GetDesignationList() {
        return this.http.get<any>("/api/Designation", this.options);
    }

    // POST: add new Designation
    public AddDesignation(CurrentDesignation) {
        var temp = _.omit(CurrentDesignation, ['DesignationValidator']);
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/Designation", data, this.options);
    }

    // PUT: update Designation
    public UpdateDesignation(id, CurrentDesignation) {
        var temp = _.omit(CurrentDesignation, ['DesignationValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/Designation/" + id, data, this.options);
    }

    // Get: Designation By Id
    public GetDesignation(id: number) {
        return this.http.get<any>("/api/Designation/" + id, this.options);
    }
}