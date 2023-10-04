
import { Component, ChangeDetectorRef } from "@angular/core";

import { CurrencyModel } from '../shared/currency.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'mapping-list',
    templateUrl: './mapping-list.html',
})
export class MappingListComponent {
    public currencyList: Array<CurrencyModel> = new Array<CurrencyModel>();
    public showCurrencyList: boolean = true;
    public currencyGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedCurrency: CurrencyModel;
    public index: number;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.currencyGridColumns = GridColumnSettings.CurrencyList;
        this.getCurrencyList();
    }
    public getCurrencyList() {
        this.invSettingBL.GetCurrency()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.currencyList = res.Results;

                    this.showCurrencyList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    CurrencyGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedCurrency = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedCurrency = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddCurrency() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.currencyList.push($event.currency);
        if (this.index!= null)
            this.currencyList.splice(this.index, 1);
        this.currencyList = this.currencyList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedCurrency = null;
        this.index = null;
    }


}
