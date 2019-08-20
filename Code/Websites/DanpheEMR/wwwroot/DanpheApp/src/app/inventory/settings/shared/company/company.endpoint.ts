import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class CompanyEndPoint {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
      constructor(public http: HttpClient) {

    }

    //GET: list of companies
    public GetCompanyList() {
        return this.http.get<any>("/api/InventoryCompany/", this.options);
    }

    // POST: add new company
    public AddCompany(CurrentCompany) {
        var temp = _.omit(CurrentCompany, ['CompanyValidator']);
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/InventoryCompany", data, this.options);
    }

    // PUT: update company
    public UpdateCompany(id, CurrentCompany) {
        var temp = _.omit(CurrentCompany, ['CompanyValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/InventoryCompany/" + id, data, this.options);
    }

    // Get: Company By Id
    public GetCompany(id: number) {
        return this.http.get<any>("/api/InventoryCompany/" + id, this.options);
    }
}