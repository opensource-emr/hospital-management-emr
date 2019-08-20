
import { Component, ChangeDetectorRef } from "@angular/core";

import { VendorsModel } from '../shared/vendors.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'vendor-list',
    templateUrl: './vendor-list.html',
})
export class VendorListComponent {
    public vendorList: Array<VendorsModel> = new Array<VendorsModel>();
    public showVendorList: boolean = true;
    public vendorGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedVendor: VendorsModel;
    public index: number;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.vendorGridColumns = GridColumnSettings.vendorList;
        this.getVendorList();
    }
    public getVendorList() {
        this.invSettingBL.GetVendors()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.vendorList = res.Results;
                    
                    this.showVendorList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    VendorGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedVendor = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedVendor = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddVendor() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {      
        if (this.index!= null) {
            this.vendorList.splice(this.index, 1, $event.vendor);

        }
        else {
            this.vendorList.push($event.vendor);
            this.changeDetector.detectChanges();
        }
        this.vendorList = this.vendorList.slice();
        this.showAddPage = false;
        this.selectedVendor = null;
        this.index = null;
    }


}