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
  public accountHeadList: Array<any> = new Array<any>();
  public showItemSubCategoryList: boolean = true;
  public itemSubCategoryGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItemSubCategory: ItemSubCategoryModel;
  public index: number = null;

  constructor(public invSettingBL: InventorySettingBLService,
    public changeDetector: ChangeDetectorRef) {
    this.itemSubCategoryGridColumns = GridColumnSettings.ItemSubCategoryList;
    //this.getAccountHead();
    this.getMappedledgerlist();
    this.getItemSubCategoryList();

  }
  public getItemSubCategoryList() {
    this.invSettingBL.GetItemSubCategory()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.itemSubCategoryList = res.Results;
          if (this.itemSubCategoryList.length > 0) {
            //this.itemSubCategoryList.map(a => a.AccountHeadName = this.accountHeadList.find(b => b.AccountHeadId == a.AccountHeadId).AccountHeadName);
                  this.itemSubCategoryList.forEach(itm=>{
                        var led = this.accountHeadList.filter(b => b.LedgerReferenceId == itm.SubCategoryId);
                        itm.LedgerName = (led.length>0) ? led[0].LedgerName : null;
                        itm.LedgerId = (led.length>0) ? led[0].LedgerId : null;
                  })

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
              this.getItemSubCategoryList();
        }
      });
  }
  public getMappedledgerlist() {
    this.invSettingBL.getMappedledgerlist('inventorysubcategory')
          .subscribe(res => {
                if (res.Status == "OK") {
                      this.accountHeadList = res.Results;
                      this.getItemSubCategoryList();
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
        this.FocusElementById('ItemSubCategoryName');
      }
      default:
        break;
    }
  }
  AddItemSubCategory() {
    this.showAddPage = false;
    this.FocusElementById('ItemSubCategoryName');
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    // var itemsubcategory: ItemSubCategoryModel = $event.itemsubcategory;
    //itemsubcategory.AccountHeadName = this.accountHeadList.find(a => a.AccountHeadId == itemsubcategory.AccountHeadId).AccountHeadName;
    // if (this.index != null)
    // this.itemSubCategoryList.splice(this.index, 1);
    // this.itemSubCategoryList.splice(this.index, 0, itemsubcategory);
    // this.itemSubCategoryList = this.itemSubCategoryList.slice();
    this.getMappedledgerlist();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItemSubCategory = null;
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
