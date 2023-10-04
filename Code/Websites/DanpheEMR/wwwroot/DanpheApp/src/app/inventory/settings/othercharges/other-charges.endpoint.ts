import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { OtherChargesMasterModel } from './other-charges.model';

@Injectable()
export class OtherChargesEndPoint {
    public options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
    public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    private baseUrl: string;
    constructor(public http: HttpClient) {
        this.baseUrl = '/api/InventorySettings';
    }
    public GetOtherChargesList() {
        return this.http.get<any>("/api/InventorySettings/OtherCharges", this.options);
    }
    createOtherCharges(form: OtherChargesMasterModel): Observable<DanpheHTTPResponse> {
        return this.http.post<any>("/api/InventorySettings/OtherCharge", form, this.options);
    }

    public UpdateOtherCharge(OtherCharge) {
        var temp = _.omit(OtherCharge, ['OtherChargeValidator']);
        let data = JSON.stringify(temp);
        return this.http.put<any>("/api/InventorySettings/OtherCharge", data, this.options);
    }

    public GetOtherCharge(chargeId: number) {
        return this.http.get<any>(`/api/InventorySettings/OtherCharge?chargeId=${chargeId}`, this.options);
    }
    public GetOtherCharges() {
        return this.http.get<any>("/api/InventorySettings/OtherCharges", this.options);
    }
}