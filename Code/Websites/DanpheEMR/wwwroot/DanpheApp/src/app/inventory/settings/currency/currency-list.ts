
import { Component, ChangeDetectorRef } from "@angular/core";

import { CurrencyModel } from '../shared/currency.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'currency-list',
    templateUrl: './currency-list.html',
})
export class CurrencyListComponent {
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
                this.FocusElementById('CurrencyCode');
            }
            default:
                break;
        }
    }
    AddCurrency() {
        this.showAddPage = false;
        this.FocusElementById('CurrencyCode');
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        if ($event != null) {
            //find the index of currently added/updated currency in the list of all currencys (grid)
            let index = this.currencyList.findIndex(a => a.CurrencyID == $event.currency.CurrencyID);
            //index will be -1 when this currency is currently added. 
            if (index < 0) {
                this.currencyList.splice(0, 0, $event.currency);//this will add this currency to 0th index.
            }
            else {
                this.currencyList.splice(index, 1, $event.currency);//this will replace one currency at particular index. 
            }
        }
        this.currencyList = this.currencyList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedCurrency = null;
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