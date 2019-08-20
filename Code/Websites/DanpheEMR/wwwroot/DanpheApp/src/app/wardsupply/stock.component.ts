import { Component, ChangeDetectorRef, Input,Output,EventEmitter } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { WardStockModel } from './shared/ward-stock.model'
import WARDGridColumns from './shared/ward-grid-cloumns';
import { GridEmitModel } from "../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "./shared/wardsupply.bl.service";
import { MessageboxService } from "../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment'
import { DLService } from "../shared/dl.service";
import { WardModel } from "./shared/ward.model";
import { Router } from '@angular/router';
import { DanpheCache, MasterType } from '../shared/danphe-cache-service-utility/cache-services';



@Component({
  selector: "ward-stock",
  templateUrl: "../../app/view/ward-supply-view/Stock.html" // "/WardSupplyView/Stock"
})
export class StockComponent {

  @Input('isPharmacyStock')
  public showPharmacyStock: boolean = false;
  public stockDetailsGridColumns: Array<WARDGridColumns> = []
  public stockDetailsList: Array<WardStockModel> = []
  public pharmacyStockDetailsList: Array<WardStockModel> = []
  public rowIndex: number = null;
  loading: boolean = false;
  showWardStock: boolean = false;
  public WardId: any;
  public showStockList: boolean = true;
  public showStockTransfer: boolean = false;
  public showStockBreakage: boolean = false;
  public selectedItem: WardStockModel = new WardStockModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public wardList: Array<WardModel> = [];
  public availableWardList: Array<WardModel> = [];
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public wardSupplyBLService: WardSupplyBLService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.http = _http;
    this.dlService = _dlService;
    this.stockDetailsGridColumns = WARDGridColumns.WARDStockDetailsList;
    
    this.getPharmacyItemsStockDetailsList();
    this.GetwardList();

  }
  GetwardList() {
    try {
      this.wardSupplyBLService.GetWardList()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.wardList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("Failed", ["Ward List is not available."]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  gridExportOptions = {
    fileName: 'StockDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public getPharmacyItemsStockDetailsList() {
    try {
      this.wardSupplyBLService.GetAllWardItemsStockDetailsList()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.stockDetailsList = [];
              this.pharmacyStockDetailsList = res.Results;
              // this.AssignPharmacyStockDetails();  
              if (this.WardId > 0) {
                this.pharmacyStockDetailsList = this.pharmacyStockDetailsList.filter(a => a.WardId == this.WardId);
              }

            }
            else {
              this.msgBoxServ.showMessage("Empty", ["No stock Available."]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  

  onChange() {
    this.getPharmacyItemsStockDetailsList();
  }
  Cancel() {
    this.loading = true;
    try {
      this.selectedItem = new WardStockModel();
      this.showStockList = true;
      this.loading = false;
      this.rowIndex = null;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.msgBoxServ.showMessage("Error", ['Error, Please check console log for details'])
      this.showStockList = true;
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.loading = false;
    }
  }

  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "transfer-stock": {
        let x = $event.Action;
        this.rowIndex = this.pharmacyStockDetailsList.findIndex(stk => stk.StockId == $event.Data.StockId);
        this.TransferStock($event.Data);
        break;
      }
      case "breakage-stock": {
        let x = $event.Action;
        this.rowIndex = this.pharmacyStockDetailsList.findIndex(stk => stk.StockId == $event.Data.StockId);
        this.BreakageStock($event.Data);
        break;
      }
      default:
        break;
    }
  }

  TransferStock(data) {
    try {
      if (data) {
        this.selectedItem = new WardStockModel();
        this.selectedItem = Object.assign(this.selectedItem, data);
        this.selectedItem.Quantity = data.AvailableQuantity;
        //available wardlist
        this.availableWardList = new Array<WardModel>();
        for (let i = 0; i < this.wardList.length; i++) {
          if (this.selectedItem.WardName != this.wardList[i].WardName) {
            this.availableWardList.push(this.wardList[i]);
          }
        }
        this.showStockTransfer = true;
      }
    }
    catch (exception) {
      this.msgBoxServ.showMessage("Error", ['Error, Please check console log for details']);
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  BreakageStock(data) {
    try {
      if (data) {
        this.selectedItem = new WardStockModel();
        this.selectedItem = Object.assign(this.selectedItem, data);
        this.selectedItem.Quantity = data.AvailableQuantity;
        this.showStockBreakage = true;
      }
    }
    catch (exception) {
      this.msgBoxServ.showMessage("Error", ['Error, Please check console log for details']);
      let ex: Error = exception;
      console.log("Error Message =>" + ex.message);
      console.log("Stack Details =>" + ex.stack);
    }
  }

  Close(): void {
    this.selectedItem = new WardStockModel();
    this.showStockTransfer = false;
    this.showStockBreakage = false;
  }

  WardStockTransfer(): void {
    try {
      if (this.selectedItem && (this.selectedItem.DispachedQuantity <= this.selectedItem.AvailableQuantity) && (this.selectedItem.DispachedQuantity != 0) && (this.selectedItem.newWardId)) {
        //for (var b in this.selectedItem.StockManageValidator.controls) {
        //    this.selectedItem.StockManageValidator.controls[b].markAsDirty();
        //    this.selectedItem.StockManageValidator.controls[b].updateValueAndValidity();
        //}if ((this.selectedItem.IsValid(undefined, undefined) == true)) {
        this.loading = true;
        if (this.showWardStock) {
          this.selectedItem.StockType = "pharmacy";
        }
        this.wardSupplyBLService.PostManagedStockDetails(this.selectedItem).
          subscribe(res => {
            if (res.Status == 'OK') {
              if (res.Results) {
                this.msgBoxServ.showMessage("Success", ["Stock adjustment saved"]);
                this.changeDetector.detectChanges();
                let tempItm = this.pharmacyStockDetailsList[this.rowIndex];
                this.pharmacyStockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.DispachedQuantity;
                this.pharmacyStockDetailsList = this.pharmacyStockDetailsList.slice();
                this.Close();
              }
              this.Cancel();
            }
            else {
              this.msgBoxServ.showMessage("Failed", ['Failed, Please check log for details.']);
              console.log(res);
              this.Cancel();
              this.Close();
            }
          });
      } else {
        this.msgBoxServ.showMessage("Notice", ['Please see error message. Check Quantity']);
        this.loading = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  WardStockBreakage(): void {
    try {
      if (this.selectedItem && (this.selectedItem.DispachedQuantity <= this.selectedItem.AvailableQuantity) && (this.selectedItem.DispachedQuantity != 0)) {
        this.loading = true;
        this.wardSupplyBLService.PostBreakageStockDetails(this.selectedItem).
          subscribe(res => {
            if (res.Status == 'OK') {
              if (res.Results) {
                this.msgBoxServ.showMessage("Success", ["Stock Adjustment Saved"]);
                this.changeDetector.detectChanges();
                let tempItm = this.pharmacyStockDetailsList[this.rowIndex];
                this.pharmacyStockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.DispachedQuantity;
                this.pharmacyStockDetailsList = this.pharmacyStockDetailsList.slice();
                this.Close();
              }
              this.Cancel();
            }
            else {
              this.msgBoxServ.showMessage("Failed", ['Failed, Please check log for details.']);
              console.log(res);
              this.Cancel();
              this.Close();
            }
          });
      } else {
        this.msgBoxServ.showMessage("Notice", ['Please see error message. Check Quantity']);
        this.loading = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
}
