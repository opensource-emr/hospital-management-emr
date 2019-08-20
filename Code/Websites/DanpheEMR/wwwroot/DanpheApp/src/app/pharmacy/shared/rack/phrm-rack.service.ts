import { Injectable, Directive } from '@angular/core';
import { PhrmRackEndPoint } from "./phrm-rack.endpoint";
import { PhrmRackModel } from './phrm-rack.model';

@Injectable()
export class PhrmRackService {

    constructor(public phrmRackEndpoint: PhrmRackEndPoint) {

    }

    public GetRackList() {
        return this.phrmRackEndpoint.GetRackList()
            .map(res => { return res });
    }

    public AddRack(CurrentRack: PhrmRackModel) {
        return this.phrmRackEndpoint.AddRack(CurrentRack)
            .map(res => { return res });
    }

    public UpdateRack(id: number,CurrentRack: PhrmRackModel) {
        return this.phrmRackEndpoint.UpdateRack(id, CurrentRack)
            .map(res => { return res });
    }

    public GetParentRackList() {
        return this.phrmRackEndpoint.GetParentRackList()
            .map(res => {
                return res;
            });
    }

    public GetRack(id: number) {
        return this.phrmRackEndpoint.GetRack(id)
            .map(res => { return res });
    }

    public GetDrugList(rackId) {
        return this.phrmRackEndpoint.GetDrugList(rackId)
            .map(res => {
                return res;
            });
    }
}