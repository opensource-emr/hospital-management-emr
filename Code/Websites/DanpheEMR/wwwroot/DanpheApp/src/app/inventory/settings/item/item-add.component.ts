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
import { InventoryService } from "../../shared/inventory.service";
import { CoreService } from "../../../core/shared/core.service";
import { trigger, transition, style, animate } from "@angular/animations";
import { UnitOfMeasurementModel } from "../shared/unit-of-measurement.model";
@Component({
  selector: 'item-add',
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(10%)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 0 }))
      ])
    ]
    )
  ],
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
  public UOMList: Array<UnitOfMeasurementModel> = new Array<UnitOfMeasurementModel>();
  public ItemCategoryList: Array<ItemCategoryModel> = new Array<ItemCategoryModel>();
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
  public VATPercent: number = 0;
  public loading: boolean = false;

  constructor(
    public invSettingBL: InventorySettingBLService,
    public inventoryService: InventoryService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public companyServ: CompanyService,
    public coreService: CoreService,
    public router: Router) {
    this.GetItemList();
    this.GetItemCategory();
    this.GetItemSubCategoryList();
    //this.GetAccountHead();
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
      this.CurrentItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
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
    try {
      this.itemList = this.inventoryService.allItemList;
      if (this.itemList.length == 0) {
        this.msgBoxServ.showMessage("Failed", ["No items found."])
      }
    } catch (ex) {
      this.msgBoxServ.showMessage("Failed", ["Something went wrong while loading the item list."])
    }
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
          this.GetAccountHeadList = res.Results.filter(a=> a.IsActive == true);
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  //Get Account ledger List
  public getMappedledgerlist() {
    this.invSettingBL.getMappedledgerlist('inventorysubcategory')
      .subscribe(res => {
        if (res.Status == "OK") {
          this.GetAccountHeadList = res.Results;
        }
      });
  }
  GetPackagingType() {
    this.invSettingBL.GetPackagingType()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetPackagingTypeList = res.Results.filter(a=> a.IsActive == true);
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
          this.UOMList = res.Results.filter(a=> a.IsActive == true);
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
          this.ItemCategoryList = res.Results;
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
          this.ItemSubCategoryList = res.Results.filter(a => a.IsActive);
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      });
  }
  //adding new Item
  AddItem() {
    var checkIsValid = true;
    if (this.CurrentItem.IsVATApplicable == true && this.CurrentItem.VAT == null) {
      this.showMessageBox("Warning", "VAT is required.");
      checkIsValid = false;
    }
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined) && checkIsValid) {
      this.loading = true;
      //adding ItemType hardcode for now, as discussed Ramavtar 17-Jan-18
      this.CurrentItem.ItemType = this.ItemCategoryList.find(a => a.ItemCategoryId == this.CurrentItem.ItemCategoryId).ItemCategoryName;
      this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //this.CurrentItem.ModifiedBy =null;
      this.CurrentItem.ModifiedOn = null;
      this.invSettingBL.AddItem(this.CurrentItem)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.showMessageBox("success", "Item Added");
              this.CurrentItem = new ItemModel();
              this.CallBackAddItem(res)
            }
            else {
              this.showMessageBox("Failed", "Item Add Failed.");
            }
            this.loading = false;
          },
          err => {
            this.logError(err);
            this.loading = false;
          });
    }
  }
  //adding new Item
  Update() {
    var checkIsValid = true;
    if (this.CurrentItem.IsVATApplicable == true && this.CurrentItem.VAT == null) {
      this.showMessageBox("Warning", "VAT is required.");
      checkIsValid = false;
    }
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentItem.ItemValidator.controls) {
      this.CurrentItem.ItemValidator.controls[i].markAsDirty();
      this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentItem.IsValidCheck(undefined, undefined) && checkIsValid) {
      this.loading = true;
      this.CurrentItem.ItemType = this.ItemCategoryList.find(a => a.ItemCategoryId == this.CurrentItem.ItemCategoryId).ItemCategoryName
      this.CurrentItem.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.invSettingBL.UpdateItem(this.CurrentItem)
        .subscribe(
          res => {
            this.showMessageBox("success", "Item Updated");
            this.CurrentItem = new ItemModel();
            this.CallBackAddItem(res);
            this.loading = false;
          },
          err => {
            this.logError(err);
            this.loading = false;
          });
    }
  }

  Close() {
    this.selectedItem = null;
    this.update = false;
    this.filteredSubCategoryList = null;
    this.trackSubCategoryCode = "";
    this.trackSubCategoryId = null;
    this.showAddPage = false;
  }
  //after adding Item is succesfully added  then this function is called.
  CallBackAddItem(res) {
    if (res.Status == "OK") {
      // this.inventoryService.allItemList.push(res.Results);
      ////since itemList is already referencing to the allItemList, it automatically pushed newly added item to allItemList.
      var item: ItemModel = res.Results;
      item.UOMName = this.UOMList.find(uom => uom.UOMId == item.UnitOfMeasurementId).UOMName;
      //find the index of currently added/updated item in the list of all items (grid)
      this.AddtoGlobalItemList(item);
      this.callbackAdd.emit({ item: item });
    }
    else {
      this.showMessageBox("error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }
  public AddtoGlobalItemList(item: ItemModel) {
    let index = this.itemList.findIndex(a => a.ItemId == item.ItemId);
    //index will be -1 when this item is currently added. 
    if (index < 0) {
      this.itemList.splice(0, 0, item); //this will add this item to 0th index.
    }
    else {
      this.itemList.splice(index, 1, item);
    }
    this.itemList = this.itemList.slice();
    this.inventoryService.LoadAllItemList(this.itemList);
  }

  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }

  logError(err: any) {
    console.log(err);
  }
  //filter the subcategory once category is selected
  filterSubCategory() {
    if (this.CurrentItem.ItemCategoryId == 1) {
      this.filteredSubCategoryList = this.ItemSubCategoryList.filter(a => a.IsConsumable == false);
    }
    else {
      this.filteredSubCategoryList = this.ItemSubCategoryList.filter(a => a.IsConsumable == true);
    }
    this.CurrentItem.SubCategoryId = (this.update == false) ? null : this.CurrentItem.SubCategoryId;
  }
  //Assign AccountHead to CurrentItem once the SubCategory is selected
  AssignItemCode() {
    // var AccountHeadId = this.filteredSubCategoryList.find(a => a.SubCategoryId == this.CurrentItem.SubCategoryId).AccountHeadId;
    // this.CurrentItem.AccountHeadId = AccountHeadId;
    if (this.CurrentItem.SubCategoryId != null && this.CurrentItem.SubCategoryId > 0) {
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

  GetVatValue(event) {

    if (event.currentTarget.checked) {
      this.VATPercent = this.coreService.Parameters.find(p => p.ParameterName == "DefaultVATPercentage" && p.ParameterGroupName == "Inventory").ParameterValue;
      this.CurrentItem.VAT = this.VATPercent;
    }
    else {
      this.VATPercent = 0;
      this.CurrentItem.VAT = 0;
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
    this.CurrentItem.CompanyId = Company.CompanyId;
  }
  AddCategoryPopUp() {
    this.showAddCategoryPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddCategoryPopUp = true;
  }
  OnNewCategoryAdded($event) {
    this.showAddCategoryPopUp = false;
    var Category = $event.itemcategory;
    this.ItemCategoryList.push(Category);
    this.ItemCategoryList.slice();
    this.CurrentItem.ItemCategoryId = Category.ItemCategoryId;
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
    this.CurrentItem.SubCategoryId = SubCategory.SubCategoryId;
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
    var PackagingType = $event.packagingtype;
    this.GetPackagingTypeList.push(PackagingType);
    this.GetPackagingTypeList.slice();
    this.CurrentItem.PackagingTypeId = PackagingType.PackagingTypeId;
  }
  AddUnitOfMeasurementPopUp() {
    this.showAddUnitOfMeasurementPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddUnitOfMeasurementPopUp = true;
  }
  OnNewUnitOfMeasurementAdded($event) {
    this.showAddUnitOfMeasurementPopUp = false;
    var UnitOfMeasurement = $event.unitofmeasurement;
    this.UOMList.push(UnitOfMeasurement);
    this.UOMList = this.UOMList.slice();
    this.CurrentItem.UnitOfMeasurementId = UnitOfMeasurement.UOMId;
  }
}
