import { Injectable, Directive } from '@angular/core';
import { DesignationEndPoint } from "./Designation.endpoint";
import { DesignationModel } from './Designation.model';

@Injectable()
export class DesignationService {

    constructor(public DesignationEndpoint: DesignationEndPoint) {

    }

    public GetDesignationList() {
        return this.DesignationEndpoint.GetDesignationList()
            .map(res => { return res });
    }

    public AddDesignation(CurrentDesignation: DesignationModel) {
        return this.DesignationEndpoint.AddDesignation(CurrentDesignation)
            .map(res => { return res });
    }

    public UpdateDesignation(id: number,CurrentDesignation: DesignationModel) {
        return this.DesignationEndpoint.UpdateDesignation(id, CurrentDesignation)
            .map(res => { return res});
    }

    public GetDesignation(id: number) {
        return this.DesignationEndpoint.GetDesignation(id)
            .map(res => { return res });
    }
}