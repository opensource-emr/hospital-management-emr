
import { Component, ChangeDetectorRef } from "@angular/core";

import { UnitOfMeasurementModel } from '../shared/unit-of-measurement.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'unitofmeasurement-list',
    templateUrl: './unit-of-measurement-list.html',
})
export class UnitOfMeasurementListComponent {
    public unitofmeasurementList: Array<UnitOfMeasurementModel> = new Array<UnitOfMeasurementModel>();
    public showUnitOfMeasurementList: boolean = true;
    public unitofmeasurementGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedUnitOfMeasurement: UnitOfMeasurementModel;
    public index: number;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.unitofmeasurementGridColumns = GridColumnSettings.UnitOfMeasurementList;
        this.getUnitOfMeasurementList();
    }
    public getUnitOfMeasurementList() {
        this.invSettingBL.GetUnitOfMeasurement()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.unitofmeasurementList = res.Results;

                    this.showUnitOfMeasurementList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    UnitOfMeasurementGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedUnitOfMeasurement = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedUnitOfMeasurement = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddUnitOfMeasurement() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.unitofmeasurementList.push($event.unitofmeasurement);
        if (this.index!=null)
            this.unitofmeasurementList.splice(this.index, 1);
        this.unitofmeasurementList = this.unitofmeasurementList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedUnitOfMeasurement = null;
        this.index = null;
    }


}