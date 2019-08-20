
import { Component, ChangeDetectorRef } from "@angular/core";

import { ItemModel } from '../shared/item.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'item-list',
    templateUrl: './item-list.html',
})
export class ItemListComponent {
    public itemList: Array<ItemModel> = new Array<ItemModel>();
    public showItemList: boolean = true;
    public itemGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItem: ItemModel;
    public index: number;

    constructor(public acctMstBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.itemGridColumns = GridColumnSettings.itemList;
        this.getItemList();
    }
    public getItemList() {
        this.acctMstBLService.GetItems()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.itemList = res.Results;
                    for (var i = 0; i < this.itemList.length; i++)
                    {
                        if (this.itemList[i].AvailableQuantity == null)
                        {
                            this.itemList[i].AvailableQuantity = 0;
                        }
                    }
                    this.showItemList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    ItemGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "activateDeactivateBasedOnStatus": {
                this.selectedItem = null;
                this.index = $event.RowIndex;
                this.selectedItem = $event.Data;
                this.ActivateDeactivateItemStatus(this.selectedItem)
                this.showItemList = true;
                this.selectedItem = null;
            }
            default:
                break;
        }
    }

    ActivateDeactivateItemStatus(selectedItem: ItemModel) {
        if (selectedItem != null) {
            let status = selectedItem.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + selectedItem.ItemName + ' ?')) {

                selectedItem.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.acctMstBLService.UpdateItemStatus(selectedItem)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                            this.msgBox.showMessage("success", [res.Results.ItemName +' ' +responseMessage]);
                            //This for send to callbackadd function to update data in list
                            this.getItemList();
                        }
                        else {
                            this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                       }
                    },
                    err => {
                        this.logError(err);
                    });
            }

        }

    }
    AddItem() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        if ($event.item[0].AvailableQuantity == undefined)
        {
            $event.item[0].AvailableQuantity = 0;
        }
        this.itemList.push($event.item[0]);
        if (this.index)
            this.itemList.splice(this.index, 1);
        this.itemList = this.itemList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        this.index = null;
    }

    logError(err: any) {
        console.log(err);
    }

}