
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { VendorsModel } from '../shared/vendors.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ItemMaster } from "../../shared/item-master.model";
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import { isNumeric } from "rxjs/internal-compatibility";
import { CoreService } from "../../../core/shared/core.service";
import { InventoryService } from "../../shared/inventory.service";
import { ItemModel } from "../shared/item.model";
import { trigger, transition, style, animate } from "@angular/animations";
@Component({
  selector: 'vendor-add',
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
  templateUrl: './vendor-add.html',
  host: { '(window:keyup)': 'hotkeys($event)' }

})
export class VendorsAddComponent {
  public showAddPage: boolean = false;
  @Input("selectedVendor")
  public selectedVendor: VendorsModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;
  public Countries: Array<any> = new Array<any>();
  public CurrentVendor: VendorsModel;
  public selectedItem: ItemModel;
  public completevendorsList: Array<VendorsModel> = new Array<VendorsModel>();
  public vendorList: Array<VendorsModel> = new Array<VendorsModel>();
  public itemList: Array<ItemModel> = new Array<ItemModel>();
  public filteredItemList: Array<ItemModel> = new Array<ItemModel>();
  public defaultItemList: Array<ItemModel> = new Array<ItemModel>();
  public GetCurrencyCodeList: Array<VendorsModel> = new Array<VendorsModel>();
  public showAddCurrencyCodePopUp: boolean = false;
  public isEditItem: boolean = false;
  public loading: boolean = false;
  public vendorDisplayParameter:any=null;
  constructor(public invSettingBL: InventorySettingBLService, public inventoryService: InventoryService,
    public securityService: SecurityService, public coreService: CoreService,
    public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
    //this.GetVendors();
    this.GetCurrencyCode();
    this.GetItemList();  
    this.FocusElementById('txtVendorName');//sud:20Sept'21--Focus on ItemCategory dropdown by default.

  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    this.vendorDisplayParameter=null;
    this.vendorDisplayParameter= this.GetInvVendorAddDisplaySettings();
    if (this.selectedVendor) {
      this.update = true;
      this.CurrentVendor = Object.assign(this.CurrentVendor, this.selectedVendor);
      this.CurrentVendor.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      if (this.CurrentVendor.GovtRegDate != null) {
        this.CurrentVendor.GovtRegDate = moment(this.CurrentVendor.GovtRegDate).format("YYYY-MM-DD");
      }
      this.vendorList = this.vendorList.filter(vendor => (vendor.VendorId != this.selectedVendor.VendorId));
      this.ArrangeSelectedItemList();
    }
    else {
      this.CurrentVendor = new VendorsModel();
      this.CurrentVendor.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.update = false;
      this.GetCountry();
      this.GetVendorList();
    }
  }

  //Sud:25Sept'21:  we're now generating vendorCode in server side itself..below logic is used only within the client side..
  CreateVendorCode() {
    var num: number = 0;
    if ((this.CurrentVendor.VendorCode == null || this.CurrentVendor.VendorCode == "") && !!this.CurrentVendor.VendorName) {
      if (this.vendorList.length > 0) {
        var vendorWithMaxVendorCode = this.vendorList.reduce((p, v) => {
          return ((isNumeric(p.VendorCode) ? Number.parseInt(p.VendorCode) : 0) > (isNumeric(v.VendorCode) ? Number.parseInt(v.VendorCode) : 0) ? p : v);
        });
        if (isNumeric(vendorWithMaxVendorCode.VendorCode)) {
          num = Number.parseInt(vendorWithMaxVendorCode.VendorCode);
        }
      }
      num = num + 1;
      var formattednumber = "0000" + num;
      formattednumber = formattednumber.substr(formattednumber.length - 5);
      this.CurrentVendor.VendorCode = formattednumber;
    }
  }

  GetCountry() {
    this.Countries = DanpheCache.GetData(MasterType.Country, null);
    this.CurrentVendor.CountryId = this.Countries[0].CountryId;
  }

  GetVendorList() {
    try {
      this.vendorList = this.inventoryService.allVendorList;
      if (this.vendorList.length == 0) {
        this.msgBoxServ.showMessage("Failed", ["Failed to load the vendor list."]);
      }
    } catch (ex) {
      this.msgBoxServ.showMessage("Failed", ["Something went wrong while loading vendor list."]);
    }
  }

  GetItemList() {
    try {
      this.itemList = this.inventoryService.allItemList;
      if (this.itemList.length > 0) {
        this.filteredItemList = Object.assign(this.filteredItemList, this.itemList);
      }
      else {
        this.msgBoxServ.showMessage("Failed", ["Item List Not Found."]);
      }
    } catch (ex) {
      this.msgBoxServ.showMessage("Failed", ["Something went wrong while loading the items"]);
    }
  }
  GetCurrencyCode() {

    this.invSettingBL.GetCurrencyCode()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.GetCurrencyCodeList = res.Results.filter(a => a.IsActive == true);
          //this.CurrentVendor.DefaultCurrencyId = 1;
        } else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }

      });
  }
  //adding new vendor
  AddVendor() {
    if (this.loading == false) return;
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentVendor.VendorsValidator.controls) {
      this.CurrentVendor.VendorsValidator.controls[i].markAsDirty();
      this.CurrentVendor.VendorsValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentVendor.IsValidCheck(undefined, undefined)) {
      //Vendor Code creation
      if (this.CurrentVendor.VendorCode == null) {
        this.CreateVendorCode();
      }
      this.CurrentVendor.DefaultItemJSON = JSON.stringify(this.CurrentVendor.DefaultItem);
      this.invSettingBL.AddVendor(this.CurrentVendor)
        .finally(() => this.loading = false)
        .subscribe(
          res => {
            this.showMessageBox("success", "Vendor Added");
            this.CurrentVendor = new VendorsModel();
            this.CallBackAddVendor(res)
          },
          err => {
            this.logError(err);
            this.FocusElementById('txtVendorName');
          });
    }
    else {
      this.loading = false;
    }
    this.FocusElementById('txtVendorName');
  }
  //adding new department
  Update() {
    if (this.loading == false) return;
    //for checking validations, marking all the fields as dirty and checking the validity.
    for (var i in this.CurrentVendor.VendorsValidator.controls) {
      this.CurrentVendor.VendorsValidator.controls[i].markAsDirty();
      this.CurrentVendor.VendorsValidator.controls[i].updateValueAndValidity();
    }

    if (this.CurrentVendor.IsValidCheck(undefined, undefined)) {
      this.CurrentVendor.DefaultItemJSON = JSON.stringify(this.CurrentVendor.DefaultItem);
      this.invSettingBL.UpdateVendor(this.CurrentVendor)
        .finally(() => this.loading = false)
        .subscribe(
          res => {
            this.showMessageBox("success", "Vendor Updated");
            this.CurrentVendor = new VendorsModel();
            this.CallBackAddVendor(res);

          },
          err => {
            this.logError(err);
            this.FocusElementById('txtVendorName');
          });
    }
    else {
      this.loading = false;
    }
    this.FocusElementById('txtVendorName');
  }
  AssignItemIdToVendor() {
    if (this.selectedItem != null) {
      var selectedItemId = this.selectedItem.ItemId;
      if (!this.CurrentVendor.DefaultItem.includes(selectedItemId) && selectedItemId != 0) {
        this.CurrentVendor.DefaultItem.push(selectedItemId);
        this.ArrangeSelectedItemList();
      }
    }
  }
  ArrangeSelectedItemList() {
    //for each item id in default item, filter it from item master and put it in defaultitemlist.
    this.defaultItemList = new Array<ItemModel>();
    this.filteredItemList = Object.assign(this.filteredItemList, this.itemList);
    this.CurrentVendor.DefaultItem.forEach(a => { this.defaultItemList.push(this.itemList.find(b => b.ItemId == a)) });
    for (var i = 0; i < this.CurrentVendor.DefaultItem.length; i++) {
      var index = this.filteredItemList.findIndex(a => a.ItemId == this.CurrentVendor.DefaultItem[i]);
      if (index >= 0) {
        this.filteredItemList.splice(index, 1);
      }
    }
    this.selectedItem = null;
  }
  deleteItem(itemId: number) {
    this.CurrentVendor.DefaultItem = this.CurrentVendor.DefaultItem.filter(a => a != itemId);
    this.ArrangeSelectedItemList();
  }
  EditItemId() {
    this.isEditItem = !this.isEditItem;
  }
  Close() {
    this.selectedVendor = null;
    this.CurrentVendor = null;
    this.defaultItemList = new Array<ItemModel>();
    this.update = false;
    this.vendorList = this.completevendorsList;
    this.showAddPage = false;
    this.isEditItem = false;
  }
  //after adding Vendor is succesfully added  then this function is called.
  CallBackAddVendor(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ vendor: res.Results });
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
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"] + "<i>(" + data["Code"] + ")</i>";
    return html;
  }
  AddCurrencyCodePopUp() {
    this.showAddCurrencyCodePopUp = false;
    this.changeDetector.detectChanges();
    this.showAddCurrencyCodePopUp = true;
  }
  OnNewCurrencyCodeAdded($event) {
    this.showAddCurrencyCodePopUp = false;
    var CurrencyCode = $event.currency;
    this.GetCurrencyCodeList.push(CurrencyCode);
    this.GetCurrencyCodeList.slice();
  }
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 200);
  }
  hotkeys(event) {
    if (event.keyCode == 27) {
      this.Close()
    }
  }
  public GetInvVendorAddDisplaySettings() {
    var param = this.coreService.Parameters.find(
      (val) =>
        val.ParameterName == "VendorAddDisplaySettings" &&
        val.ParameterGroupName.toLowerCase() == "inventory"
    );
    if (param) {
      return JSON.parse(param.ParameterValue);
    } else {
      this.msgBoxServ.showMessage("warning", [
        "Please set VendorAddDisplaySettings for vendor add in parameters",
      ]);
      return null;
    }
  }
}
