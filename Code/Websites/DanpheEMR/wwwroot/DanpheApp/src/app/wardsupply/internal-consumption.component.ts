import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Array } from 'core-js';
import WARDGridColumns from './shared/ward-grid-cloumns';
import * as moment from 'moment/moment';
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { MessageboxService } from '../shared/messagebox/messagebox.service';
import { WardStockModel } from './shared/ward-stock.model';
import { WardInternalConsumption } from './shared/ward-internal-consumption.model';
import { SecurityService } from '../security/shared/security.service';
import { WardInternalConsumptionItems } from './shared/ward-internal-consumption-items.model';
import { PharmacyService } from '../pharmacy/shared/pharmacy.service';
import { CoreService } from "../core/shared/core.service";

@Component({
  templateUrl: "./internal-consumption.html"
})

export class InternalConsumptionComponent {
    public consumptionListDetailsGridColumns: Array<WARDGridColumns> = [];
    public consumptioninternalColumns: Array<any> = []; 
    public DepartmentId: number = 0;
    public TotalConsumption: any;
    public IsShowConsumption: boolean = false;
    public DepartmentList: Array<any> = [];
    public consumptionLists: Array<WardInternalConsumption> = [];
  public pharmacyStockDetailsList: Array<WardStockModel> = [];

  public WardInternalConsumption: WardInternalConsumption = new WardInternalConsumption();
  public WardInternalConsumptionItems: Array<WardInternalConsumptionItems> = [];
  public selectedItem: WardInternalConsumptionItems = new WardInternalConsumptionItems();
  public CurrentStoreId: number = 0;

    public rowIndex: number = null;
   // public SelectedItemLis: Array<WardInternalConsumption> = [];
   // public SelectedItem: WardInternalConsumption = new WardInternalConsumption();
    public loading: boolean = false;
    public showDetail: boolean = false;
    public consumptionId: number = 0;

  constructor(
    public router: Router,
    public wardBLService: WardSupplyBLService,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public coreService: CoreService
  ) {
    try {
      this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
      if (!this.CurrentStoreId) {
        this.LoadSubStoreSelectionPage();
      }
      else {
        this.consumptioninternalColumns = WARDGridColumns.InternalConsumptionList;
        this.GetDepartmentList();
        this.getPharmacyItemsStockDetailsList();

        this.AddRow();
      }
    } catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
    // this.WardInternalConsumptionItems.push(new WardInternalConsumption());
  }

  LoadSubStoreSelectionPage() {
    this.router.navigate(['/WardSupply']);
  }
  GetDepartmentList() {
    try {
      this.wardBLService.GetDepartments()
        .subscribe(res => {
          if (res.Status = 'OK') {
            this.DepartmentList = [];
            this.DepartmentList = res.Results;
          }
        });
    } catch (exceptions) {
      this.messageBoxService.showMessage("Error!", [exceptions]);
    }
  }

  GetAvailableQuantity(itm) {
    try {
      return this.pharmacyStockDetailsList.find(a => a.ItemId == itm.ItemId && a.MRP == itm.MRP && a.BatchNo == itm.BatchNo && a.ExpiryDate == itm.ExpiryDate).AvailableQuantity;
    }
    catch (ex) {
      // this.messageBoxService.showMessage("Error", ['Quantity not available!!']);
      return 0;
    }
  }

  //used to format display of item in ng-autocomplete
  ItemListFormatter(data: any): string {
    let html = "<font color='blue'; size=03 >" + data["ItemName"] + "</font>(" + data["GenericName"] + ") B-<b>" + data["BatchNo"] + "</b>"+this.coreService.currencyUnit+"<b>" + data["MRP"] + "</b> <font color='red'>Qty " + data["AvailableQuantity"] + "</font>";
    return html;
  }

  onChangeItem($event, index) {
    this.WardInternalConsumptionItems[index].ItemId = $event.ItemId;
    this.WardInternalConsumptionItems[index].WardId = $event.WardId;
    this.WardInternalConsumptionItems[index].StockId = $event.StockId;
    this.WardInternalConsumptionItems[index].ExpiryDate = $event.ExpiryDate;
    this.WardInternalConsumptionItems[index].BatchNo = $event.BatchNo;
    this.WardInternalConsumptionItems[index].MRP = $event.MRP;
    this.WardInternalConsumptionItems[index].AvailableQuantity = $event.AvailableQuantity;
    this.WardInternalConsumptionItems[index].ItemName = $event.ItemName;
    this.WardInternalConsumptionItems[index].Price =$event.MRP;
    // this.WardInternalConsumptionItems[index].Remarks = $event.Remarks;
  }




  public getPharmacyItemsStockDetailsList() {
    try {

      this.wardBLService.GetAllWardItemsStockDetailsList(this.CurrentStoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.pharmacyStockDetailsList = [];
              this.pharmacyStockDetailsList = res.Results;
              // this.WardInternalConsumptionItems = this.pharmacyStockDetailsList;

            }
            else {
              this.messageBoxService.showMessage("Failed", ["No stock available."]);
              //console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.messageBoxService.showMessage("Error!", ["Error, Please check console log for details."]);
      let ex: Error = exception;
      console.log("Error Message =>" + ex.message);
      console.log("Stack Details =>" + ex.stack);
    }
  }

  Cancel() {
    this.WardInternalConsumption = new WardInternalConsumption();
  }

  AddRow() {
    try {

      var tempSale: WardInternalConsumptionItems = new WardInternalConsumptionItems();
      this.WardInternalConsumptionItems.push(tempSale);
    } catch (exception) {
      this.messageBoxService.showMessage("Error!", [exception]);
    }
  }

  DeleteRow(index) {
    try {
      this.WardInternalConsumptionItems.splice(index, 1);
      if (this.WardInternalConsumptionItems.length == 0) {
        this.AddRow();
      }
    } catch (exception) {
      this.messageBoxService.showMessage("Error!", [exception]);
    }
  }

  onDepartmentChange() {
    this.IsShowConsumption = true;
  }

  ShowConsumptionPage() {
    this.router.navigate(['/WardSupply/Pharmacy/InternalConsumptionList']);
  }

    ShowConsumptionDetailsPage(ConsumptionId) {
        this.consumptionId = ConsumptionId;
        this.showDetail = true;
    }

    QuantityChanged(index) {
        if (this.WardInternalConsumptionItems[index].Quantity > this.WardInternalConsumptionItems[index].AvailableQuantity) {
            this.messageBoxService.showMessage("Error", ['Quantity must be less than available quantity']);
        } else {
            this.WardInternalConsumptionItems[index].SubTotal = this.WardInternalConsumptionItems[index].Quantity * this.WardInternalConsumptionItems[index].MRP;
        }
        this.TotalConsumption = 0;
        this.WardInternalConsumptionItems.forEach(a => this.TotalConsumption += a.SubTotal);
    }

  Save() {

    let check = true;
    for (var j = 0; j < this.WardInternalConsumptionItems.length; j++) {
      for (var i in this.WardInternalConsumptionItems[j].InternalConsumptionItemsValidator.controls) {
        this.WardInternalConsumptionItems[j].InternalConsumptionItemsValidator.controls[i].markAsDirty();
        this.WardInternalConsumptionItems[j].InternalConsumptionItemsValidator.controls[i].updateValueAndValidity();
      }
      if (!this.WardInternalConsumptionItems[j].IsValid(undefined, undefined)) {
        check = false;
        break;
      }
    }
      if (check) {
      
      this.loading = true;
      this.WardInternalConsumption.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.WardInternalConsumption.CreatedOn = new Date();
      this.WardInternalConsumption.TotalAmount = this.TotalConsumption;
      this.WardInternalConsumption.SubstoreId = this.CurrentStoreId;
      for (var j = 0; j < this.WardInternalConsumptionItems.length; j++) {
        this.WardInternalConsumptionItems[j].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
          this.WardInternalConsumptionItems[j].CreatedOn = new Date();
        this.WardInternalConsumptionItems[j].SubStoreId = this.CurrentStoreId;
       // this.WardInternalConsumptionItems[j].Price = 
        this.WardInternalConsumption.WardInternalConsumptionItemsList.push(this.WardInternalConsumptionItems[j]);

      }
      this.wardBLService.PostInternalConsumptionData(this.WardInternalConsumption)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results != null) {
            this.messageBoxService.showMessage("Success", ['Consumption completed']);
            this.loading = false;
            this.Cancel();
              this.ShowConsumptionDetailsPage(res.Results);
          }
          else if (res.Status == "Failed") {
            this.loading = false;
            this.messageBoxService.showMessage("Error", ['There is problem, please try again']);

          }
        },
          err => {
            this.loading = false;
            this.messageBoxService.showMessage("Error", [err.ErrorMessage]);
          });
    }
    // this.IsShowConsumption = false;
  }
}
