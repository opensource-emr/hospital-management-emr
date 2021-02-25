import { Component, ChangeDetectorRef } from "@angular/core";

import { ItemCategoryModel } from '../shared/item-category.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
@Component({
    selector: 'itemcategory-list',
    templateUrl: './item-category-list.html',
})
export class ItemCategoryListComponent {
    public itemcategoryList: Array<ItemCategoryModel> = new Array<ItemCategoryModel>();
    public showItemCategoryList: boolean = true;
    public itemcategoryGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItemCategory: ItemCategoryModel;
    public index: number;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
        this.itemcategoryGridColumns = GridColumnSettings.ItemCategoryList;
        this.getItemCategoryList();
    }
    public getItemCategoryList() {
        this.invSettingBL.GetItemCategory()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.itemcategoryList = res.Results;

                    this.showItemCategoryList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    ItemCategoryGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItemCategory = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItemCategory = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddItemCategory() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.itemcategoryList.push($event.itemcategory);
        if (this.index!=null)
            this.itemcategoryList.splice(this.index, 1);
        this.itemcategoryList = this.itemcategoryList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItemCategory = null;
        this.index = null;
    }


}
