import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model";


@Component({
    selector: "phrm-rack-drug-list",
    templateUrl: "./phrm-rack-drug-list.html",
})
export class PhrmRackDrugListComponent {

    @Input("drug-list")
    public drugList: PHRMItemMasterModel;

    @Input("rack-name")
    public rackName: string;


    @Input("showDrugListPage")
    public showDrugListPage: boolean = false;

    constructor() {       
    }

    Close() {
        this.showDrugListPage = false;
    }
}