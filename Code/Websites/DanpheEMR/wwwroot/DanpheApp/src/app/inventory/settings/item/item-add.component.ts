import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import { ItemModel } from '../shared/item.model';
import { ItemCategoryModel } from '../shared/item-category.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
//import { RouteFromService } from "../../../shared/routefrom.service";
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { CompanyModel } from "../shared/company/company.model";
import { CompanyService } from "../shared/company/company.service";
import { ItemSubCategoryListComponent } from "../itemsubcategory/item-subcategory-list";
import { ItemSubCategoryModel } from "../shared/item-subcategory.model";
@Component({
  selector: 'item-add',
  templateUrl: './item-add.html'
})
export class ItemAddComponent {

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: ItemModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;
  public CurrentItem: ItemModel;
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public GetAccountHeadList: Array<ItemModel> = new Array<ItemModel>();
  public GetPackagingTypeList: Array<ItemModel> = new Array<ItemModel>();
  public GetUnitOfMeasurementList: Array<ItemModel> = new Array<ItemModel>();
  public GetItemCategoryList: Array<ItemCategoryModel> = new Array<ItemCategoryModel>();
  public ItemSubCategoryList: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
  public filteredSubCategoryList: Array<ItemSubCategoryModel> = new Array<ItemSubCategoryModel>();
  public GetCompanyList: Array<CompanyModel> = new Array<CompanyModel>();

  //to track the change in subcategory. just in case subcategory changes and again same subcategory is selected.
  public trackSubCategoryId: number;
  public trackSubCategoryCode: string;

  public showAddCompanyPopUp: boolean = false;
  public showAddCategoryPopUp: boolean = false;
  public showAddAccountHeadPopUp: boolean = false;
  public showAddPackagingTypePopUp: boolean = false;
  public showAddUnitOfMeasurementPopUp: boolean = false;
  public showAddSubCategoryPopUp: boolean = false;

  constructor(
    public invSettingBL: InventorySettingBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public companyServ: CompanyService,
    public router: Router) {
    this.GetItemList();
    this.GetItemCategory();
    this.GetItemSubCategoryList();
    this.GetAccountHead();
    this.GetPackagingType();
    this.GetUnitOfMeasurement();
    this.GetCompany();
  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentItem = Object.assign(this.CurrentItem, this.selectedItem);
      this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.itemList = this.itemList.filter(item => (item.ItemId != this.selectedItem.ItemId));
      this.filterSubCategory();
      this.CurrentItem = Object.assign(this.CurrentItem, this.selectedItem);//to show the subcategoryId selected
      this.trackSubCategoryId = this.CurrentItem.SubCategoryId;
      this.trackSubCategoryCode = this.CurrentItem.Code;
    }
    else {
      this.CurrentItem = new ItemModel();
      this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
    }
  }
  GetItemList() {
    this.invSettingBL.GetItem()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.itemList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  GetCompany() {
    this.companyServ.GetCompanyList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetCompanyList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  GetAccountHead() {
    this.invSettingBL.GetAccountHead(true)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetAccountHeadList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  GetPackagingType() {
    this.invSettingBL.GetPackagingType()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetPackagingTypeList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  GetUnitOfMeasurement() {
    this.invSettingBL.GetUnitOfMeasurement()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetUnitOfMeasurementList = res.Results;
          //this.CurrentVendor.DefaultCurrencyId = 1;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }

      });
  }
  GetItemCategory() {
    this.invSettingBL.GetItemCategory()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetItemCategoryList = res.Results;
          //this.CurrentVendor.DefaultCurrencyId = 1;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  GetItemSubCategoryList() {
    this.invSettingBL.GetItemSubCategory()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.ItemSubCategoryList = res.Results;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  //adding new Item
  AddItem() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
      //adding ItemType hardcode for now, as discussed Ramavtar 17-Jan-18
      this.CurrentItem.ItemType = this.GetItemCategoryList.find(a => a.ItemCategoryId == this.CurrentItem.ItemCategoryId).ItemCategoryName;
      this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.invSettingBL.AddItem(this.CurrentItem)
        .subscribe(
          res => {
            this.showMessageBox("success", "Item Added");
            this.CurrentItem = new ItemModel();
            this.CallBackAddItem(res)
          },
          err => {
            this.logError(err);
          });
    }
  }
  //adding new Item
  Update() {
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
      this.CurrentItem.ItemType = this.GetItemCategoryList.find(a => a.ItemCategoryId == this.CurrentItem.ItemCategoryId).ItemCategoryName
      this.invSettingBL.UpdateItem(this.CurrentItem)
        .subscribe(
          res => {
            this.showMessageBox("success", "Item Updated");
            this.CurrentItem = new ItemModel();
            this.CallBackAddItem(res);
          },
          err => {
            this.logError(err);
          });
    }
  }

  Close() {
    this.selectedItem = null;
    this.update = false;
    this.filteredSubCategoryList = null;
    this.trackSubCategoryCode = "";
    this.trackSubCategoryId = 0;
    this.showAddPage = false;
  }
  //after adding Item is succesfully added  then this function is called.
  CallBackAddItem(res) {
    if (res.Status == "OK") {
      this.itemList.push(res.Results);
      this.callbackAdd.emit({ item: res.Results });
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
  //filter the subcategory once category is selected
  filterSubCategory() {
    var categoryName = this.GetItemCategoryList.find(a => a.ItemCategoryId == this.CurrentItem.ItemCategoryId).ItemCategoryName;
    if (this.CurrentItem.ItemCategoryId == 1) {
      this.filteredSubCategoryList = this.ItemSubCategoryList.filter(a => a.IsConsumable == false);
    }
    else {
      this.filteredSubCategoryList = this.ItemSubCategoryList.filter(a => a.IsConsumable == true);
    }
    this.CurrentItem.SubCategoryId = (this.CurrentItem.SubCategoryId == null) ? 0 : null; //this line of code stops the first subcategory in the fiteredSubCategoryList to be selected in html form.
  }
  //Assign AccountHead to CurrentItem once the SubCategory is selected
  AssignAccountHeadandItemCode() {
    var AccountHeadId = this.filteredSubCategoryList.find(a => a.SubCategoryId == this.CurrentItem.SubCategoryId).AccountHeadId;
    this.CurrentItem.AccountHeadId = AccountHeadId;
    if (this.CurrentItem.SubCategoryId != 0 || this.CurrentItem.SubCategoryId != null) {
      var filteredItemList = this.itemList.filter(a => a.SubCategoryId == this.CurrentItem.SubCategoryId);
      var num = filteredItemList.length + 1;
      var formattednumber = "000" + num;
      formattednumber = formattednumber.substr(formattednumber.length - 3);
      var subcategorycode = this.filteredSubCategoryList.find(a => a.SubCategoryId == this.CurrentItem.SubCategoryId).Code;
      formattednumber = subcategorycode + formattednumber;
      this.CurrentItem.Code = formattednumber;
    }
    if (this.CurrentItem.SubCategoryId == this.trackSubCategoryId && this.update == true) {
      this.CurrentItem.Code = this.trackSubCategoryCode;
    }
  }
  AddCompanyPopUp() {
    this.showAddCompanyPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddCompanyPopUp = true;
  }
  OnNewCompanyAdded($event) {
    this.showAddCompanyPopUp = false;
    var Company = $event.newCompany;
    this.GetCompanyList.push(Company);
    this.GetCompanyList.slice();
  }
  AddCategoryPopUp() {
    this.showAddCategoryPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddCategoryPopUp = true;
  }
  OnNewCategoryAdded($event) {
    this.showAddCategoryPopUp = false;
    var Category = $event.itemcategory;
    this.GetItemCategoryList.push(Category);
    this.GetItemCategoryList.slice();
  }
  AddSubCategoryPopUp() {
    this.showAddSubCategoryPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddSubCategoryPopUp = true;
  }
  OnNewSubCategoryAdded($event) {
    this.showAddSubCategoryPopUp = false;
    var SubCategory = $event.itemsubcategory;
    this.ItemSubCategoryList.push(SubCategory);
    this.ItemSubCategoryList.slice();
    this.filterSubCategory();
  }
  AddAccountHeadPopUp() {
    this.showAddAccountHeadPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddAccountHeadPopUp = true;
  }
  OnNewAccountHeadAdded($event) {
    this.showAddAccountHeadPopUp = false;
    var AccountHead = $event.accounthead;
    this.GetAccountHeadList.push(AccountHead);
    this.GetAccountHeadList.slice();
  }
  AddPackagingTypePopUp() {
    this.showAddPackagingTypePopUp = false;
    this.changeDetector.detectChanges();
    this.showAddPackagingTypePopUp = true;
  }
  OnNewPackagingTypeAdded($event) {
    this.showAddPackagingTypePopUp = false;
    var PackagingType = $event.itemcategory;
    this.GetPackagingTypeList.push(PackagingType);
    this.GetPackagingTypeList.slice();
  }
  AddUnitOfMeasurementPopUp() {
    this.showAddUnitOfMeasurementPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddUnitOfMeasurementPopUp = true;
  }
  OnNewUnitOfMeasurementAdded($event) {
    this.showAddUnitOfMeasurementPopUp = false;
    var UnitOfMeasurement = $event.unitofmeasurement;
    this.GetUnitOfMeasurementList.push(UnitOfMeasurement);
    this.GetUnitOfMeasurementList.slice();
  }
}
