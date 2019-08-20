import { Component, ChangeDetectorRef } from "@angular/core";

import { ItemSubCategoryModel } from '../shared/item-SubCategory.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { AccountHeadModel } from "../shared/account-head.model";
@Component({
    selector: 'itemSubCategory-list',
    templateUrl: './item-SubCategory-list.html',
})
export class ItemSubCategoryListComponent {
  public itemSubCategoryList: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
  public accountHeadList: Array<AccountHeadModel> = new Array<AccountHeadModel>();
    public showItemSubCategoryList: boolean = true;
    public itemSubCategoryGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItemSubCategory: ItemSubCategoryModel;
  public index: number = null;

    constructor(public invSettingBL: InventorySettingBLService,
        public changeDetector: ChangeDetectorRef) {
      this.itemSubCategoryGridColumns = GridColumnSettings.ItemSubCategoryList;
      this.getAccountHead();
      this.getItemSubCategoryList();
    }
    public getItemSubCategoryList() {
        this.invSettingBL.GetItemSubCategory()
            .subscribe(res => {
              if (res.Status == "OK") {
                this.itemSubCategoryList = res.Results;
                if (this.itemSubCategoryList.length > 0) {
                  this.itemSubCategoryList.map(a => a.AccountHeadName = this.accountHeadList.find(b => b.AccountHeadId == a.AccountHeadId).AccountHeadName);
                }
                    this.showItemSubCategoryList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
  }
  getAccountHead() {
    this.invSettingBL.GetAccountHead(true)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.accountHeadList = res.Results;
        }
      });
  }
    ItemSubCategoryGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItemSubCategory = null;
                this.index = $event.RowIndex;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItemSubCategory = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddItemSubCategory() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.itemSubCategoryList.push($event.itemsubcategory);
        if (this.index!=null)
            this.itemSubCategoryList.splice(this.index, 1);
        this.itemSubCategoryList = this.itemSubCategoryList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItemSubCategory = null;
        this.index = null;
    }


}
