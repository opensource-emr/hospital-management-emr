import { Injectable, Directive } from '@angular/core';
import { OtherChargesEndPoint } from './other-charges.endpoint';
import { OtherChargesMasterModel } from './other-charges.model';

@Injectable()
export class OtherChargesService {

    constructor(public OtherChargesEndPoint: OtherChargesEndPoint) {

    }

    public GetOtherChargesList() {
        return this.OtherChargesEndPoint.GetOtherChargesList()
            .map(res => { return res });
    }

    public createOtherCharges(OtherCharge: OtherChargesMasterModel) {
        return this.OtherChargesEndPoint.createOtherCharges(OtherCharge)
            .map(res => { return res });
    }

    public UpdateOtherCharge(OtherCharge: OtherChargesMasterModel) {
        return this.OtherChargesEndPoint.UpdateOtherCharge(OtherCharge)
            .map(res => { return res });
    }

    public GetOtherCharge(id: number) {
        return this.OtherChargesEndPoint.GetOtherCharge(id)
            .map(res => { return res });
    }
    public GetOtherCharges() {
        return this.OtherChargesEndPoint.GetOtherCharges()
            .map(res => { return res });
    }
}