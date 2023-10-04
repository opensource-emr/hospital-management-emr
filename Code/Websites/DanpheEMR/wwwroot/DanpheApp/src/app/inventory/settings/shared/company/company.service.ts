import { Injectable, Directive } from '@angular/core';
import { CompanyEndPoint } from "./company.endpoint";
import { CompanyModel } from './company.model';

@Injectable()
export class CompanyService {

    constructor(public CompanyEndpoint: CompanyEndPoint) {

    }

    public GetCompanyList() {
        return this.CompanyEndpoint.GetCompanyList()
            .map(res => { return res });
    }

    public AddCompany(CurrentCompany: CompanyModel) {
        return this.CompanyEndpoint.AddCompany(CurrentCompany)
            .map(res => { return res });
    }

    public UpdateCompany(id: number,CurrentCompany: CompanyModel) {
        return this.CompanyEndpoint.UpdateCompany(id, CurrentCompany)
            .map(res => { return res });
    }

    public GetCompany(id: number) {
        return this.CompanyEndpoint.GetCompany(id)
            .map(res => { return res });
    }
}