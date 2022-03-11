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
                this.FocusElementById('UOMName');
            }
            default:
                break;
        }
    }
    AddUnitOfMeasurement() {
        this.showAddPage = false;
        this.FocusElementById('UOMName');
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        if ($event != null) {
            //find the index of currently added/updated unitofmeasurement in the list of all items (grid)
            let index = this.unitofmeasurementList.findIndex(a => a.UOMId == $event.unitofmeasurement.UOMId);
            //index will be -1 when this unitofmeasurement is currently added. 
            if (index < 0) {
                this.unitofmeasurementList.splice(0, 0, $event.unitofmeasurement);//this will add this unitofmeasurement to 0th index.
            }
            else {
                this.unitofmeasurementList.splice(index, 1, $event.unitofmeasurement);//this will replace one unitofmeasurement at particular index. 
            }
        }
        this.unitofmeasurementList = this.unitofmeasurementList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedUnitOfMeasurement = null;
        this.index = null;
    }
    FocusElementById(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }

}