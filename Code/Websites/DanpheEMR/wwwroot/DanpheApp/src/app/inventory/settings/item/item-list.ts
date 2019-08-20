import { Component, ChangeDetectorRef } from "@angular/core";

import { ItemModel } from '../shared/item.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
    selector: 'item-list',
    templateUrl: './item-list.html',
})
export class ItemListComponent {
    public itemList: Array<ItemModel> = new Array<ItemModel>();
    public showitemList: boolean = true;
    public itemGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedItem: ItemModel;
    public index: number;

    constructor(
        public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.itemGridColumns = GridColumnSettings.ItemList;
        this.getItemList();
    }
    public getItemList() {
        this.invSettingBL.GetItem()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.itemList = res.Results;
                    this.showitemList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }
            });
    }

    ItemGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddItem() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.itemList.push($event.item);
        if (this.index!= null)
            this.itemList.splice(this.index, 1);
        this.itemList = this.itemList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        this.index = null;
    }
}