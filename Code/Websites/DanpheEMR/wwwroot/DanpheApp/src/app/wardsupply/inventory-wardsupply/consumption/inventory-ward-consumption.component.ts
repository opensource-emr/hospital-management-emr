import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { WardInventoryConsumptionModel } from '../../shared/ward-inventory-consumption.model';
import { WardStockModel } from '../../shared/ward-stock.model';
import { WardModel } from '../../shared/ward.model';
import { Array } from 'core-js';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import * as moment from 'moment/moment';


@Component({
  templateUrl: "./inventory-ward-consumption.html" // "/Inventory/Consumption"
})
export class InventoryConsumptionComponent {

  public ItemTypeListWithItems: Array<any>;
  public SelecetdItemList: Array<WardInventoryConsumptionModel> = [];
  public WardStockList: Array<WardStockModel> = [];
  public DepartmentList: Array<any> = [];
  public DepartmentId: number = 0;
  public IsShowConsumption: boolean = false;
  public TotalConsumption: any;
  public WardConsumption: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
  public loading: boolean = false;
  //public currentCounterId: number = 0;

  constructor(
    public wardBLService: WardSupplyBLService,
    public messageboxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router,
    public callBackService: CallbackService
  ) {
    //this.GetDepartmentList();
    //this.GetPatientList();
    //try {
    //    this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;

    //    if (this.currentCounterId < 1) {
    //        this.callBackService.CallbackRoute = '/WardSupply/Consumption'
    //        this.router.navigate(['/Pharmacy/ActivateCounter']);
    //    }
    //    else {
    this.GetDepartmentList();
    //    }
    //} catch (exception) {
    //  this.messageboxService.showMessage("Error", [exception]);
    //}
  }
  //get ward list
  GetDepartmentList() {
    try {
      this.wardBLService.GetDepartments()
        .subscribe(res => {
          if (res.Status = 'OK') {
            this.DepartmentList = [];
            this.DepartmentList = res.Results;
          }
        });
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  onDepartmentChange() {
    //this.LoadItemTypeList();
    this.GetInventoryStockDetailsList();
    this.GetWardStockDetail();
    this.SelecetdItemList = [];
    //if (this.PatientRefinedList.length) {
    //    this.PatientRefinedList = [];
    //}
    //for (let i = 0; i < this.PatientList.length; i++) {
    //    if (this.WardId == this.PatientList[i].WardId) {
    //        this.PatientRefinedList.push(this.PatientList[i]);
    //    }
    //}
    this.AddRow();
    this.IsShowConsumption = true;
  }
  //get wardsupply stock list - sanjit 17feb2019
  public GetInventoryStockDetailsList() {
    try {
      this.wardBLService.GetInventoryStockDetailsList()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.ItemTypeListWithItems = [];
              this.ItemTypeListWithItems = res.Results;
              if (this.DepartmentId > 0) {
                this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(a => a.DepartmentId == this.DepartmentId && a.ItemType != 'Capital Goods');
              }
            }
            else {
              this.messageboxService.showMessage("Failed", ["No Any Data Available"]);
              //console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  //get ward stock list
  GetWardStockDetail() {
    try {
      this.wardBLService.GetWardStockList()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.WardStockList = [];
            this.WardStockList = res.Results;
            //filtering record per ward
            this.WardStockList = this.WardStockList.filter(a => a.DepartmentId == this.DepartmentId);
          }
        });
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  GetAvailableQuantity(itm) {
    try {
      return this.WardStockList.find(a => a.ItemId == itm.ItemId).AvailableQuantity;
    }
    catch (ex) {
      this.messageboxService.showMessage("Error", ['Quantity not available!!']);
      return 0;
    }
  }
  //used to format display of item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }
  onChangeItem($event, index) {
    this.SelecetdItemList[index].ItemId = $event.ItemId;
    this.SelecetdItemList[index].Quantity = this.GetAvailableQuantity(this.SelecetdItemList[index]);
    this.SelecetdItemList[index].ItemName = $event.ItemName;
    this.SelecetdItemList[index].DepartmentId = this.DepartmentId;
    this.SelecetdItemList[index].DepartmentName = $event.DepartmentName;
    this.SelecetdItemList[index].UsedBy = this.securityService.GetLoggedInUser().UserName;
  }
  DeleteRow(index) {
    try {
      this.SelecetdItemList.splice(index, 1);
      if (this.SelecetdItemList.length == 0) {
        this.AddRow();
      }
      //window.setTimeout(function () {
      //    document.getElementById('item-box' + (index+1)).focus();
      //}, 0);
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  AddRow() {
    try {
      var tempSale: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
      this.SelecetdItemList.push(tempSale);
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  Save() {
    let check = true;
    for (var j = 0; j < this.SelecetdItemList.length; j++) {
      for (var i in this.SelecetdItemList[j].ConsumptionValidator.controls) {
        this.SelecetdItemList[j].ConsumptionValidator.controls[i].markAsDirty();
        this.SelecetdItemList[j].ConsumptionValidator.controls[i].updateValueAndValidity();
      }
      if (!this.SelecetdItemList[j].IsValid(undefined, undefined)) {
        check = false;
        break;
      }
      if (this.SelecetdItemList[j].ItemId == 0 || this.SelecetdItemList == null) {
        check = false;
        alert("Select Item.");
        break;
      }
    }
    if (check) {
      this.loading = true;
      for (var j = 0; j < this.SelecetdItemList.length; j++) {
        this.SelecetdItemList[j].Remark = this.WardConsumption.Remark;
        this.SelecetdItemList[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //this.SelecetdItemList[j].CounterId = this.currentCounterId;
      }
      this.wardBLService.PostInventoryConsumptionData(this.SelecetdItemList)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results != null) {
            this.messageboxService.showMessage("Success", ['Consumption completed']);
            this.loading = false;
            this.Cancel();
          }
          else if (res.Status == "Failed") {
            this.loading = false;
            this.messageboxService.showMessage("Error", ['There is problem, please try again']);

          }
        },
          err => {
            this.loading = false;
            this.messageboxService.showMessage("Error", [err.ErrorMessage]);
          });
    }
  }
  Cancel() {
    this.IsShowConsumption = false;
    this.DepartmentList = [];
    this.DepartmentId = 0;
    this.WardConsumption = new WardInventoryConsumptionModel();
    this.GetDepartmentList();
  }
  ShowConsumptionPage() {
    this.router.navigate(['/WardSupply/Inventory/Consumption']);
  }
}
