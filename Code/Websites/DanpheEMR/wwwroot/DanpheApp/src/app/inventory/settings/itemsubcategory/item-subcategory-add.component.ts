
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { ItemSubCategoryModel } from '../shared/item-subcategory.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountHeadModel } from "../shared/account-head.model";
import { isNumber } from "util";
import { isNumeric } from "rxjs/internal-compatibility";


@Component({
  selector: 'itemsubcategory-add',
  templateUrl: './item-subcategory-add.html'

})
export class ItemSubCategoryAddComponent {
  public showAddPage: boolean = false;
  @Input("selectedItemSubCategory")
  public selectedItemSubCategory: ItemSubCategoryModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  public currentItemSubCategory: ItemSubCategoryModel;
  public itemsubcategorylist: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
  public accountHeadList: Array<AccountHeadModel> = new Array<AccountHeadModel>();
  public showAddAccountHeadPopUp: boolean = false;

  constructor(
    public invSettingBL: InventorySettingBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
    this.GetAccountHead();
    this.getItemSubCategoryList();
  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItemSubCategory) {
      this.update = true;
      this.currentItemSubCategory = Object.assign(this.currentItemSubCategory, this.selectedItemSubCategory);
      this.currentItemSubCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    }
    else {
      this.currentItemSubCategory = new ItemSubCategoryModel();
      this.currentItemSubCategory.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.currentItemSubCategory.Code = null;
      this.update = false;
    }
  }
  //get subcategorylist
  public getItemSubCategoryList() {
    this.invSettingBL.GetItemSubCategory()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.itemsubcategorylist = res.Results;
          if (this.itemsubcategorylist.length > 0) {
            this.itemsubcategorylist.map(a => a.AccountHeadName = this.accountHeadList.find(b => b.AccountHeadId == a.AccountHeadId).AccountHeadName);
          }
        }
        else {
          this.msgBoxServ.showMessage("Failed ! " , [res.ErrorMessage]);
        }

      });
  }
  //Get Account Head List
  public GetAccountHead() {
    this.invSettingBL.GetAccountHead(true)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.accountHeadList = res.Results;
        }
      });
  }
  //to check for numeric
  public static  isNumeric( strNum:string):boolean {
    try {
      var d = Number.parseInt(strNum);
    } catch (ex) {
      return false;
    }
    return true;
  }
  CreateSubCategoryCode() {
    var num: number = 0;
    if ((this.currentItemSubCategory.Code == null || this.currentItemSubCategory.Code == "") && this.currentItemSubCategory.SubCategoryName.length > 0) {
      this.itemsubcategorylist.map(a => {
        if (isNumeric(a.Code)) {
          num = Number.parseInt(a.Code);
        }
      });
      num = num + 1;
      var formattednumber = "000" + num;
      formattednumber = formattednumber.substr(formattednumber.length - 4);
      this.currentItemSubCategory.Code = formattednumber;
    }
  }
  //adding new department
  AddItemSubCategory() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.currentItemSubCategory.ItemSubCategoryValidator.controls) {
      this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].markAsDirty();
      this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentItemSubCategory.IsValidCheck(undefined, undefined)) {
      //logic to create SubCategoryCode if left blank.
      if (this.currentItemSubCategory.Code == null) {
        this.CreateSubCategoryCode();
      }
      this.invSettingBL.AddItemSubCategory(this.currentItemSubCategory)
        .subscribe(
          res => {
            this.showMessageBox("success", "Item SubCategory Added");
            this.currentItemSubCategory = new ItemSubCategoryModel();
            this.CallBackAddItemCategory(res)
          },
          err => {
            this.logError(err);
          });
    }
  }
  //adding new department
  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.currentItemSubCategory.ItemSubCategoryValidator.controls) {
      this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].markAsDirty();
      this.currentItemSubCategory.ItemSubCategoryValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentItemSubCategory.IsValidCheck(undefined, undefined)) {
      this.invSettingBL.UpdateItemSubCategory(this.currentItemSubCategory)
        .subscribe(
          res => {
            this.showMessageBox("success", "Item SubCategory List Updated");
            this.currentItemSubCategory = new ItemSubCategoryModel();
            this.CallBackAddItemCategory(res)
          },
          err => {
            this.logError(err);
          });
    }
  }

  Close() {
    this.selectedItemSubCategory = null;
    this.update = false;
    this.showAddPage = false;
  }

  //after adding Vendor is succesfully added  then this function is called.
  CallBackAddItemCategory(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ itemsubcategory: res.Results });
    }
    else {
      this.showMessageBox("error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }

  AddAccountHeadPopUp() {
    this.showAddAccountHeadPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddAccountHeadPopUp = true;
  }
  OnNewAccountHeadAdded($event) {
    this.showAddAccountHeadPopUp = false;
    var AccountHead = $event.accounthead;
    this.accountHeadList.push(AccountHead);
    this.accountHeadList.slice();
  }
}
