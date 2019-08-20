import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class FractionCalculationEndPoint {
    public http: HttpClient;
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
    constructor(_http: HttpClient) {
        this.http = _http;
    }

    //GET: list of companies
    public GetFractionApplicableTxnItemList() {
        return this.http.get<any>("/api/GetFractionTxnList", this.options);
    }
    public GetFractionReportByItemList() {
        return this.http.get<any>("/api/GetFractionReportByItemList", this.options);
    }
    
    public GetFractionReportByDoctorList(FromDate: string, ToDate: string) {
        return this.http.get<any>("/api/GetFractionReportByDoctorList/"+ FromDate + "/" + ToDate, this.options);
    }
    //GET: list of companies
    public GetFractionCalculationList() {
        return this.http.get<any>("/api/FractionCalculation", this.options);
    }

    // POST: add new FractionCalculation
    public AddFractionCalculation(CurrentFractionCalculation) {

        var temp = CurrentFractionCalculation.map(frac => {
            //FractionCalculationValidator
            return _.omit(frac, ['FractionCalculationValidator', 'filteredDocList','selectedDoctor']);
        });
    
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/FractionCalculation", data, this.options);
    }

    // PUT: update FractionCalculation
    public UpdateFractionCalculation(id, CurrentFractionCalculation) {
        var temp = _.omit(CurrentFractionCalculation, ['FractionCalculationValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/FractionCalculation/" + id, data, this.options);
    }

    // Get: FractionCalculation By BillTxnId
    public GetFractionCalculation(id: number) {
        return this.http.get<any>("/api/FractionCalculation/" + id, this.options);
    }
}