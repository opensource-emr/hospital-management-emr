
import { Component, ChangeDetectorRef } from "@angular/core";

import { PackagingTypeModel } from '../shared/packaging-type.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'packagingtype-list',
    templateUrl: './packaging-type-list.html',
})
export class PackagingTypeListComponent {
    public packagingtypeList: Array<PackagingTypeModel> = new Array<PackagingTypeModel>();
    public showPackagingTypeList: boolean = true;
    public packagingtypeGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedPackagingType: PackagingTypeModel;
    public index: number;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.packagingtypeGridColumns = GridColumnSettings.PackagingTypeList;
        this.getPackagingTypeList();
    }
    public getPackagingTypeList() {
        this.invSettingBL.GetPackagingType()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.packagingtypeList = res.Results;

                    this.showPackagingTypeList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    PackagingTypeGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedPackagingType = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedPackagingType = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddPackagingType() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.packagingtypeList.push($event.itemcategory);
        if (this.index!=null)
            this.packagingtypeList.splice(this.index, 1);
        this.packagingtypeList = this.packagingtypeList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedPackagingType = null;
        this.index = null;
    }


}