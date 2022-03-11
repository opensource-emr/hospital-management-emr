import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { WardInventoryConsumptionModel } from '../../shared/ward-inventory-consumption.model';
import { SecurityService } from '../../../security/shared/security.service';
import { CallbackService } from '../../../shared/callback.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import * as moment from 'moment';
import { Observable } from 'rxjs-compat/Observable';
import { InvPatientConsumptionModel } from './inv-patient-consumption.model';


@Component({
  templateUrl: "./inventory-ward-patient-consumption.html" // "/Inventory/Consumption"
})
export class InventoryPatientConsumptionComponent {
  public CurrentStoreId: number = 0;
  public ConsumptionDate: string = moment().format('YYYY-MM-DD HH:mm:ss');
  public ItemTypeListWithItems: Array<any> = [];
  public SelecetdItemList: Array<WardInventoryConsumptionModel> = new Array<WardInventoryConsumptionModel>();
  public IsShowConsumption: boolean = true;
  public TotalConsumption: any;
  public WardConsumption: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
  public loading: boolean = false;
  //public currentCounterId: number = 0;

  public ValidPatient: boolean = true;
  public SelectedPatient: any;
  public PatientConsumptionReceipt: InvPatientConsumptionModel = new InvPatientConsumptionModel();
  constructor(
    public wardBLService: WardSupplyBLService,
    public messageboxService: MessageboxService,
    public securityService: SecurityService,
    public router: Router,
    public callBackService: CallbackService,
    public inventoryService: InventoryService
  ) {
    this.CheckForSubstoreActivation();
    this.FocusElementById('srch_PatientList')
  }
  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        this.GetInventoryStockDetailsList();
        this.SelecetdItemList = new Array<WardInventoryConsumptionModel>();
        this.PatientConsumptionReceipt = new InvPatientConsumptionModel();
        this.AddRow();
        //write whatever is need to be initialise in constructor here.
      }
    } catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  //get wardsupply stock list - sanjit 17feb2019
  public GetInventoryStockDetailsList() {
    try {
      this.wardBLService.GetInventoryItemsForPatConsumptionByStoreId(this.CurrentStoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.ItemTypeListWithItems = [];
              this.ItemTypeListWithItems = res.Results;
              this.ItemTypeListWithItems = this.ItemTypeListWithItems.filter(item => item.Quantity > 0 && item.ItemType == "Consumables");
              if (this.ItemTypeListWithItems.length == 0) { this.messageboxService.showMessage("Failed", ["No Stock Available. Please Add Stock."]); }
            }
            else {
              this.messageboxService.showMessage("Failed", ["No Stock Available. Please Add Stock."]);
            }
          }
        });

    } catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  GetAvailableQuantity(itm) {
    try {
      return this.ItemTypeListWithItems.find(a => a.ItemId == itm.ItemId).Quantity;
    }
    catch (ex) {
      this.messageboxService.showMessage("Error", ['Quantity not available!!']);
      return 0;
    }
  }
  //used to format display of item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = data["ItemName"] + '|Qty:' + data["Quantity"];
    return html;
  }
  onChangeItem($event, index) {
    var checkIsItemPresent = false;
    if (this.SelecetdItemList.find(a => a.ItemId == $event.ItemId)) {
      checkIsItemPresent = true;
    }
    if (checkIsItemPresent == false) {
      this.SelecetdItemList[index].ItemId = $event.ItemId;
      this.SelecetdItemList[index].Quantity = this.GetAvailableQuantity(this.SelecetdItemList[index]);
      this.SelecetdItemList[index].ItemName = $event.ItemName;
      this.SelecetdItemList[index].Code = $event.Code;
      this.SelecetdItemList[index].UOMName = $event.UOMName;
      this.SelecetdItemList[index].DepartmentName = $event.DepartmentName;
      this.SelecetdItemList[index].UsedBy = this.securityService.GetLoggedInUser().UserName;
    }
    else {
      this.messageboxService.showMessage("Error", ["Item is already present in the list"]);
      this.AddRow(index);
      this.FocusElementById("itemName" + index);
    }
  }
  DeleteRow(index) {
    try {
      this.SelecetdItemList.splice(index, 1);
      if (this.SelecetdItemList.length == 0) {
        this.AddRow();
      }
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
  AddRow(index?) {
    try {
      var tempSale: WardInventoryConsumptionModel = new WardInventoryConsumptionModel();
      if (index == null) {
        this.SelecetdItemList.push(tempSale);
      }
      else {
        this.SelecetdItemList.splice(index, 1, tempSale);
      }

      let len = this.SelecetdItemList.length - 1;
      this.FocusElementById("itemName" + len);
    }
    catch (exception) {
      this.messageboxService.showMessage("Error", [exception]);
    }
  }
   FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  Save() {
    let check = true;
    // if(this.IsConsumptionDateValid() == false){
    //   check = false;
    //   alert("Invalid Fiscal Year Date Assigned to Consumption Date.")
    // }
    if (typeof (this.SelectedPatient) == 'string' || !this.SelectedPatient) {
      this.messageboxService.showMessage("Warning", ["Select Patient First! Its required!"]);
      this.ValidPatient = false;
      return;
    }

    for (var j = 0; j < this.SelecetdItemList.length; j++) {
      if (this.SelecetdItemList[j].ConsumeQuantity > this.SelecetdItemList[j].Quantity) {
        check = false;
        alert("Consume Quantity is greater than Available Quantity.")
        break;
      }
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
        this.SelecetdItemList[j].StoreId = this.CurrentStoreId;
        this.SelecetdItemList[j].ConsumptionDate = this.ConsumptionDate;
        // this.SelecetdItemList[j].Remark = this.WardConsumption.Remark;
        this.SelecetdItemList[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      }
      this.AssignPatConsumptionReceipt();
      this.wardBLService.PostInventoryPatConsumptionData(this.PatientConsumptionReceipt)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results != null) {
            this.messageboxService.showMessage("Success", ['Consumption completed']);
            this.loading = false;
            this.DiscardChanges();
          }
          else if (res.Status == "Failed") {
            this.loading = false;
            this.messageboxService.showMessage("Error", ['There is problem, please try again']);

          }
        },
          err => {
            this.loading = false;
            this.messageboxService.showMessage("Error", [err.error.ErrorMessage]);
          });
    }
  }
  DiscardChanges() {
    this.IsShowConsumption = false;
    this.WardConsumption = new WardInventoryConsumptionModel();
    this.ShowConsumptionPage();
  }
  ShowConsumptionPage() {
    this.router.navigate(['/WardSupply/Inventory/PatientConsumption']);
  }
  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }


  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

    return this.wardBLService.GetAllPatients(keyword);

  }

  public PatientInfoChanged() {
    this.ValidPatient = true;
  }

  public AssignPatConsumptionReceipt() {
    this.PatientConsumptionReceipt.PatientId = this.SelectedPatient.PatientId;
    this.PatientConsumptionReceipt.StoreId = this.CurrentStoreId;
    this.PatientConsumptionReceipt.ConsumptionList = this.SelecetdItemList;
  }
  // public IsConsumptionDateValid() : boolean{
  //   return this.inventoryService.allFiscalYearList.some( fy => (fy.IsClosed == null || fy.IsClosed == false) && moment(this.ConsumptionDate).isBetween(fy.StartDate,fy.EndDate));
  // }
  OnPressedEnterKeyInItemField(index) {
    if (this.SelecetdItemList[index].SelectedItem != null && this.SelecetdItemList[index].ItemId != 0) {
        this.FocusElementById(`qtyip${index}`);
    }
    else {
      if (this.SelecetdItemList.length == 1) {
        this.FocusElementById('itemName0')
    }
    else {
      this.SelecetdItemList.splice(index, 1);
      this.FocusElementById('save');
    }
    }
  }
}
