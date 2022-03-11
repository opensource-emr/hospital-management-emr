import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { BillingPackage } from '../../../billing/shared/billing-package.model';
import { BillingPackageItem } from '../../../billing/shared/billing-package-item.model';
import { BillItemPriceModel } from '../../shared/bill-item-price.model';
import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from "../../../core/shared/core.service";
import { BillingService } from "../../../billing/shared/billing.service";
@Component({
  selector: "billingPackage-add",
  templateUrl: "./billing-package-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})
export class BillingPackageAddComponent {

  public CurrentBillingPackage: BillingPackage;

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: BillingPackage;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;
  public selectedServDepts: Array<any> = []; //added yub 24th sept 2018
  public srvdeptList: Array<ServiceDepartment> = new Array<ServiceDepartment>(); //service department list
  public billingItemList: Array<any> = [];
  public filteredItemList: Array<BillItemPriceModel> = new Array<BillItemPriceModel>();
  public packageItemList: Array<BillingPackageItem>;
  public selectedBillItems: Array<any> = [];
  public totalAmount: number = 0;
  public totalDiscount: number = 0;
  public initialAssign: boolean = false;
  public taxPercent: number = 0;
  public loading: boolean = false;

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService,
    public billingService: BillingService) {
    this.taxPercent = this.billingService.taxPercent;
    this.GetSrvDeptList();
    this.GetBillingItems();
       
  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    this.selectedBillItems = [];

    ////yubraj--2018 1st Oct
    //if (!this.update)
    //    this.selectedServDepts = [];

    this.CurrentBillingPackage = new BillingPackage();
    this.packageItemList = new Array<BillingPackageItem>();
    if (this.selectedItem) {
      this.update = true;
      this.CurrentBillingPackage = Object.assign(this.CurrentBillingPackage, this.selectedItem);
      this.CurrentBillingPackage.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentBillingPackage.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
      this.initialAssign = true;
      this.selectedBillItems = [];
      this.totalDiscount = CommonFunctions.parseAmount((Number(this.CurrentBillingPackage.TotalPrice) * Number(this.CurrentBillingPackage.DiscountPercent)) / 100);
      //this.totalDiscount = this.CurrentBillingPackage.TotalPrice * (this.CurrentBillingPackage.DiscountPercent / 100);
      this.AssignSelectedPackageItems();
    }
    else {
      this.CurrentBillingPackage.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentBillingPackage.CreatedOn = moment().format('YYYY-MM-DD HH:mm');

      this.AddRow(-1);
      this.update = false;
    }
    this.GoToNextInput("PackageName");
  }

  ngOnInit(){
    this.ItemsListFormatter = this.ItemsListFormatter.bind(this);
  }
  //getting service department list
  public GetSrvDeptList() {
    this.settingsBLService.GetBillingServDepartments()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.srvdeptList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Check log for error message."]);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage("Failed to get service departments", ["Check log for error message."]);
          this.logError(err.ErrorMessage);
        });
  }

  //Getting item list 
  public GetBillingItems() {
    this.settingsBLService.GetBillingItemList(true)
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.billingItemList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Check log for error message."]);
            this.logError(res.ErrorMessage);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage("Failed to get Billing Items.", ["Check log for details"]);
          this.logError(err.ErrorMessage);
        });
  }

  public AssignSelectedPackageItems() {
    var pkg: any = this.CurrentBillingPackage.BillingItemsXML;
    for (var i = 0; i < pkg.Items.length; i++) {
      this.AddRow(-1);
      this.packageItemList[i].ServiceDeptId = pkg.Items[i].ServiceDeptId;
      this.packageItemList[i].FilteredItemList = this.billingItemList.filter(a => Number(a.ServiceDepartmentId) == Number(this.packageItemList[i].ServiceDeptId));
      this.packageItemList[i].ItemId = pkg.Items[i].ItemId;
      this.packageItemList[i].Quantity = pkg.Items[i].Quantity;
      this.SetItemProperties(i);
      this.SetServiceDepartment(i);
    }
    //packagelist with a single item was object insted of an array with a single object.
    if (!pkg.Items.length) {
      this.AddRow(-1);
      this.packageItemList[0].ServiceDeptId = pkg.Items.ServiceDeptId;
      this.packageItemList[0].FilteredItemList = this.billingItemList.filter(a => Number(a.ServiceDepartmentId) == Number(this.packageItemList[0].ServiceDeptId));
      this.packageItemList[0].ItemId = pkg.Items.ItemId;
      this.packageItemList[0].Quantity = pkg.Items.Quantity;
      this.SetItemProperties(i);
      this.SetServiceDepartment(i);
    }
  }
  public SetItemProperties(index: number) {
    var item = this.packageItemList[index].FilteredItemList.find(item => Number(item.ItemId) == Number(this.packageItemList[index].ItemId));
    if (item) {
      this.selectedBillItems[index] = item;
      this.packageItemList[index].Price = item.Price;
      this.packageItemList[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;
      this.Calculation();
    }
  }
  public SetServiceDepartment(index: number) {
    var srvDept = this.srvdeptList.find(srv => Number(srv.ServiceDepartmentId) == Number(this.packageItemList[index].ServiceDeptId));
    if (srvDept) {
      this.selectedServDepts[index] = srvDept;
    }

  }
  public ClearSelectedItemProperties(index: number) {
    this.packageItemList[index].ItemId = null;
    this.packageItemList[index].Price = 0;
    this.packageItemList[index].TaxPercent = 0;
    this.selectedBillItems[index] = null;
    this.Calculation();
  }
  public AddRow(index) {
    let packageItem: BillingPackageItem = new BillingPackageItem();
    if (index >= 0)
      packageItem.ServiceDeptId = this.packageItemList[index].ServiceDeptId;
    packageItem.Quantity = 1;
    packageItem.FilteredItemList = this.billingItemList;
    this.packageItemList.push(packageItem);
  }

  public DeleteRow(index) {
    let itemId = this.packageItemList[index].ItemId;
    let srvDeptId = this.packageItemList[index].ServiceDeptId;
    this.packageItemList.splice(index, 1);
    this.selectedBillItems.splice(index, 1);
    this.selectedServDepts.splice(index, 1);
    //if (index == 0) {
    //    this.packageItemList[index].IsDuplicateItem = false;
    //}

    //finding duplicate item 
    let dupItem = this.packageItemList.find(item => item.ServiceDeptId == srvDeptId && item.ItemId == itemId);
    if (dupItem) {
      dupItem.IsDuplicateItem = false;
    }
    if (index == 0 && this.packageItemList.length == 0) {
      this.AddRow(-1);
      this.changeDetector.detectChanges();
    }
    this.Calculation();
  }
  public Calculation() {
    this.totalAmount = this.CurrentBillingPackage.TotalPrice;
    this.CurrentBillingPackage.DiscountPercent = (this.totalDiscount * 100) / (this.totalAmount);
    this.CurrentBillingPackage.DiscountPercent = Math.round(this.CurrentBillingPackage.DiscountPercent * 10000) / 10000;
    this.CurrentBillingPackage.TotalPrice = 0;
    //this.totalDiscount = 0;
    var rowDiscount = 0;
    var aggDiscountPercent = 0;
    this.totalAmount = 0;
    this.packageItemList.forEach(item => {
      var itemSubTotal = item.Price * item.Quantity;
      var itemDisocunt = (itemSubTotal * this.CurrentBillingPackage.DiscountPercent) / 100;
      item.Total = itemSubTotal - itemDisocunt;
      item.Tax = (this.taxPercent * item.Total) / 100;
      item.Total = CommonFunctions.parseAmount(item.Total + item.Tax);
      this.CurrentBillingPackage.TotalPrice += CommonFunctions.parseAmount(itemSubTotal);
      this.totalAmount += item.Total;
    });
    //this.totalDiscount = CommonFunctions.parseAmount((Number(this.CurrentBillingPackage.TotalPrice) * Number(this.CurrentBillingPackage.DiscountPercent)) / 100);
    this.totalAmount = CommonFunctions.parseAmount(this.CurrentBillingPackage.TotalPrice - this.totalDiscount);
  }
  public FilterBillItems(index) {
    //initalAssign: FilterBillItems was called after assinging all the values(used in ngModelChange in SelectDepartment)
    // and was assigning ItemId=null.So avoiding assignment null value to ItemId during inital assign.
    if (!this.initialAssign)
      this.ClearSelectedItemProperties(index);

    if (index == this.packageItemList.length - 1)
      this.initialAssign = false;

    this.packageItemList[index].FilteredItemList = this.billingItemList.filter(a => a.ServiceDepartmentId == this.packageItemList[index].ServiceDeptId);

  }

  //assigns service department id and filters item list
  ServiceDeptOnChange(index) {
    let srvDeptObj = null;
    // check if user has given proper input string for department name 
    //or has selected object properly from the dropdown list.
    if (typeof (this.selectedServDepts[index]) == 'string') {
      if (this.srvdeptList.length && this.selectedServDepts[index])
        srvDeptObj = this.srvdeptList.find(a => a.ServiceDepartmentName.toLowerCase() == this.selectedServDepts[index].toLowerCase());
    }
    else if (typeof (this.selectedServDepts[index]) == 'object')
      srvDeptObj = this.selectedServDepts[index];
    //if selection of department from string or selecting object from the list is true
    //then assign proper department name
    if (srvDeptObj) {
      if (srvDeptObj.ServiceDepartmentId != this.packageItemList[index].ServiceDeptId) {
        this.ResetSelectedRow(index);
        this.packageItemList[index].ServiceDeptId = srvDeptObj.ServiceDepartmentId;
        this.packageItemList[index].IsValidSelDepartment = true;
        this.FilterBillItems(index);
      }
    }
    else {
      this.packageItemList[index].FilteredItemList = this.billingItemList;
      this.packageItemList[index].IsValidSelDepartment = false;
    }
  }

  //reset Item Selected on service department change
  ResetSelectedRow(index) {
    this.selectedBillItems[index] = null;
    //        this.packageItemList[index] = this.NewBillingTransactionItem();
    this.Calculation();

  }

  //Changes made since ng autocomplete binds the selected object instead of a single selected property.
  public AssignSelectedBillItem(index) {
    let item = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedBillItems[index]) {
      if (this.selectedBillItems.length) {

        if (typeof (this.selectedBillItems[index]) == 'string' && this.packageItemList[index].FilteredItemList.length) {
          item = this.packageItemList[index].FilteredItemList.find(a => a.ItemName.toLowerCase() == this.selectedBillItems[index].toLowerCase());
        }
        else if (typeof (this.selectedBillItems[index]) == 'object')
          item = this.selectedBillItems[index];
        if (item) {
          this.packageItemList[index].ItemId = item.ItemId;
          this.packageItemList[index].Price = item.Price;
          this.packageItemList[index].TaxPercent = item.TaxApplicable ? this.taxPercent : 0;

          this.selectedServDepts[index] = item.ServiceDepartmentName;
          this.packageItemList[index].ServiceDeptId = item.ServiceDepartmentId;
          this.packageItemList[index].IsValidSelDepartment = true;
          //this.packageItemList.[index].ServiceDeptId = item.ServiceDeptId;
          let extItem = this.packageItemList.find(a => a.ItemId == item.ItemId && a.ServiceDeptId == item.ServiceDepartmentId);
          let extItemIndex = this.packageItemList.findIndex(a => a.ItemId == item.ItemId && a.ServiceDeptId == item.ServiceDepartmentId);

          //Yubraj: 1st August '19
          //Check for allowing duplicate inserting or not from the Parameterized value.
          let paramDupItm = this.coreService.AllowDuplicateItem();
          if (!paramDupItm) {
            if (extItem && index != extItemIndex) {
              this.msgBoxServ.showMessage("failed", [item.ItemName + " is already entered."]);
              this.changeDetector.detectChanges();
              this.packageItemList[index].IsDuplicateItem = true;
            }
            else {
              this.packageItemList[index].IsDuplicateItem = false;
            }
          }

          this.packageItemList[index].IsValidSelDepartment = true;
          this.packageItemList[index].IsValidSelItemName = true;
          this.packageItemList[index].FilteredItemList = this.billingItemList.filter(a => a.ServiceDepartmentId == this.packageItemList[index].ServiceDeptId);
          this.Calculation();
        }
        else {
          this.packageItemList[index].IsValidSelItemName = false;
        }
      }
    }
  }


  Submit(value: string) {
    this.loading = true;
    var isPackageValid: boolean;

    for (var i in this.CurrentBillingPackage.BillingPackageValidator.controls) {
      this.CurrentBillingPackage.BillingPackageValidator.controls[i].markAsDirty();
      this.CurrentBillingPackage.BillingPackageValidator.controls[i].updateValueAndValidity();
    }
    for (var packageItem of this.packageItemList) {
      for (var i in packageItem.BillingPackageItemValidator.controls) {
        packageItem.BillingPackageItemValidator.controls[i].markAsDirty();
        packageItem.BillingPackageItemValidator.controls[i].updateValueAndValidity();
      }
      if (packageItem.IsValidCheck(undefined, undefined)) {
        isPackageValid = true;
      }
      else {
        isPackageValid = false;
        break;
      }
    }
    if (this.CurrentBillingPackage.TotalPrice < this.totalDiscount) {
      isPackageValid = false;
      this.msgBoxServ.showMessage("failed", ["Discount amount should be less than total price."]);
    }
    if (this.CurrentBillingPackage.IsValidCheck(undefined, undefined) && isPackageValid && this.CheckSelectionFromAutoComplete()) {
      if (value == "add")
        this.Add();
      else
        this.Update();
    }
    this.loading = false;
  }

  Add() {
    if(this.totalDiscount == 0){
      this.CurrentBillingPackage.DiscountPercent = 0;
    }
    this.settingsBLService.AddBillingPackage(this.CurrentBillingPackage, this.packageItemList)
      .subscribe(
        res => {
          this.msgBoxServ.showMessage("success", ["Billing Package Added"]);
          this.CallBackAddUpdate(res);
          this.CurrentBillingPackage = new BillingPackage();
        },
        err => {
          this.logError(err);
        });
  }
  Update() {
    this.settingsBLService.UpdateBillingPackage(this.CurrentBillingPackage, this.packageItemList)
      .subscribe(
        res => {
          this.msgBoxServ.showMessage("success", ["Billing Package Updated"]);
          this.CallBackAddUpdate(res);
          this.CurrentBillingPackage = new BillingPackage();
        },
        err => {
          this.logError(err);

        });
  }


  //// validation check if the item is selected from the list
  //public CheckSelectedItems(): boolean {
  //    if (this.selectedBillItems.length) {
  //        for (let item of this.selectedBillItems) {
  //            if (!item || typeof (item) != 'object') {
  //                item = undefined;
  //                this.msgBoxServ.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
  //                return false;
  //            }
  //        }
  //        return true;
  //    }
  //}

  public CheckSelectionFromAutoComplete(): boolean {
    if (this.packageItemList.length) {
      for (let itm of this.packageItemList) {
        if (!itm.IsValidSelDepartment) {
          this.msgBoxServ.showMessage("failed", ["Invalid Department. Please select Department from the list."]);
          this.loading = false;
          return false;
        }
        if (this.selectedBillItems.length) {
          for (let item of this.selectedBillItems) {
            if (!item || typeof (item) != 'object') {
              item = undefined;
              this.msgBoxServ.showMessage("failed", ["Invalid Item Name. Please select Item from the list."]);
              return false;
            }
          }
        }
        if (itm.IsDuplicateItem) {
          this.msgBoxServ.showMessage("failed", ["Duplicate Item now allowed." + itm.ItemId + " is entered more than once"]);
          this.loading = false;
          return false;
        }

      }
      return true;
    }
  }
  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ packageItem: res.Results });
    }
    else {
      this.msgBoxServ.showMessage("Error", ["Check log for details"]);
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.selectedServDepts = [];
    this.selectedBillItems = [];
    this.selectedItem = null;
    this.update = false;
    this.showAddPage = false;
  }

  ServiceDeptListFormatter(data: any): string {
    return data["ServiceDepartmentName"];
  }

  ItemsListFormatter(data: any): string {
    let html: string = "";
    if (data.ServiceDepartmentName != "OPD") {
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
      html += "(<i>" + data["ServiceDepartmentName"] + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    }
    else {
      let docName = data.Doctor ? data.Doctor.DoctorName : "";
      html = data["ServiceDepartmentShortName"] + "-" + data["BillItemPriceId"] + "&nbsp;&nbsp;" + data["ItemName"] + "&nbsp;&nbsp;";
      html += "(<i>" + docName + "</i>)" + "&nbsp;&nbsp;" + this.coreService.currencyUnit + " " + data["Price"];
    }
    return html;
    // return data["ItemName"];
  }

  private GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event){
    if(event.keyCode == 27){ // For ESCAPE_KEY =>close pop up
      this.Close(); 
    }
  }
}
