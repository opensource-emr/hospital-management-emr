import { Injectable, Directive } from '@angular/core';
import { FractionPercentEndPoint } from "./fraction-percent.endpoint";
import { FractionPercentModel } from './fraction-percent.model';

@Injectable()
export class FractionPercentService {

    constructor(public FractionPercentEndpoint: FractionPercentEndPoint) {

    }

    public GetFractionApplicableItemList() {
        return this.FractionPercentEndpoint.GetFractionApplicableList()
            .map(res => { return res });
    }

    public AddFractionPercent(CurrentFractionPercent: FractionPercentModel) {
        return this.FractionPercentEndpoint.AddFractionPercent(CurrentFractionPercent)
            .map(res => { return res });
    }

    public UpdateFractionPercent(id: number, CurrentFractionPercent: FractionPercentModel) {
        return this.FractionPercentEndpoint.UpdateFractionPercent(id, CurrentFractionPercent)
            .map(res => { return res });
    }

    public GetFractionPercent(id: number) {
        return this.FractionPercentEndpoint.GetFractionPercent(id)
            .map(res => { return res });
    }

    public GetFractionPercentByBillPriceId(id: number) {
        return this.FractionPercentEndpoint.GetFractionPercentByBillPriceId(id)
            .map(res => { return res });
    }
}