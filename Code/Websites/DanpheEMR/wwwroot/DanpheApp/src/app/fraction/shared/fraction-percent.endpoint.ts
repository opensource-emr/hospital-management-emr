import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class FractionPercentEndPoint {

    public http: HttpClient;
    public options =  {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
    constructor(_http: HttpClient) {
        this.http = _http;
    }

    //GET: list of fraction applicable items
    public GetFractionApplicableList() {
        return this.http.get<any>("/api/FractionPercent", this.options);
    }

    // POST: add new FractionPercent
    public AddFractionPercent(CurrentFractionPercent) {
        var temp = _.omit(CurrentFractionPercent, ['FractionPercentValidator']);
        let data = JSON.stringify(temp);
        return this.http.post<any>("/api/FractionPercent", data, this.options);
    }

    // PUT: update FractionPercent
    public UpdateFractionPercent(id, CurrentFractionPercent) {
        var temp = _.omit(CurrentFractionPercent, ['FractionPercentValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/FractionPercent/" + id, data, this.options);
    }

    // Get: FractionPercent By Id
    public GetFractionPercent(id: number) {
        return this.http.get<any>("/api/FractionPercent/" + id, this.options);
    }

    // Get: FractionPercent By Id
    public GetFractionPercentByBillPriceId(id: number) {
        return this.http.get<any>("/api/FractionPercentByPriceId/" + id, this.options);
    }
}
