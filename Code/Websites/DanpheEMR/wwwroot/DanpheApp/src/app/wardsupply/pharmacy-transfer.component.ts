import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WardSupplyBLService } from "./shared/wardsupply.bl.service";
import { MessageboxService } from "../shared/messagebox/messagebox.service";
import * as moment from 'moment/moment'
import { DLService } from "../shared/dl.service";

import WARDGridColumns from './shared/ward-grid-cloumns';
import { WardModel } from "./shared/ward.model";
import { WardStockModel } from './shared/ward-stock.model';
import { SecurityService } from '../security/shared/security.service';

@Component({
  templateUrl: "./pharmacy-transfer.html"
})
export class PharmacyTransferComponent {

  public medicineGridColumns: Array<WARDGridColumns> = [];
  public medicineList: Array<WardStockModel> = new Array<WardStockModel>();
  public returnItems: any = [];
  public ReceivedBy: string = "";
  public TransferId: number = 0;
  public loading: boolean = false;
  public selectAllItems: boolean = false;
  public CurrentStoreId: number = 0;
  public WardId: any;
  public dlService: DLService = null;
  public http: HttpClient = null;
  public showNormalTransfer: boolean = false;
  public showExpiryTransfer: boolean = false;
  public showConfirmation: boolean = false;
  public wardList: Array<WardModel> = [];

  constructor(_http: HttpClient,
    _dlService: DLService,
    public wardSupplyBLService: WardSupplyBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.http = _http;
    this.dlService = _dlService;
    try {
      this.CurrentStoreId = this.securityService.getActiveStore().StoreId
      if (!this.CurrentStoreId) {
        this.LoadSubStoreSelectionPage()
      }
      else {
        this.medicineGridColumns = WARDGridColumns.WARDStockDetailsList;
        this.GetwardList();
        this.getAllItemsStockDetailsList();
      }
    }
    catch (ex) {
      this.msgBoxServ.showMessage("Error", [ex.ErrorMessage]);
    }
  }

  gridExportOptions = {
    fileName: 'StockDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  LoadSubStoreSelectionPage() {
    this.router.navigate(['/WardSupply']);
  }

  GetwardList() {
    try {
      this.wardSupplyBLService.GetWardList(this.CurrentStoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.wardList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("Empty", ["Ward List is not available."]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  public getAllItemsStockDetailsList() {
    try {
      this.wardSupplyBLService.GetAvailableWardItemsStockDetailsList(this.CurrentStoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.medicineList = [];
              this.medicineList = res.Results;
              this.medicineList.forEach(itm => { itm.DispachedQuantity = 0; });
              if (this.WardId > 0) {
                this.medicineList = this.medicineList.filter(a => a.WardId == this.WardId);
              }
            }
            else {
              this.msgBoxServ.showMessage("Empty", ["No stock is available."]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  onChange(transferId: any) {
    this.TransferId = transferId;
    switch (transferId) {
      case "1": {
        this.getAllItemsStockDetailsList();
        this.showNormalTransfer = true;
        this.selectAllItems = false;
        this.SelectAllChkOnChange();
        break;
      }
      case "2": {
        let date = new Date();
        let datethreemonth = date.getMonth() + 3;

        this.medicineList = this.medicineList.filter(itm => new Date(itm.ExpiryDate).getFullYear() < date.getFullYear() || (new Date(itm.ExpiryDate).getMonth() <= datethreemonth && new Date(itm.ExpiryDate).getFullYear() == date.getFullYear()));
        this.showNormalTransfer = true;
        this.selectAllItems = false;
        this.SelectAllChkOnChange();
        break;
      }
      default:
        break;
    }
  }
  SelectAllChkOnChange() {
    if (this.medicineList && this.medicineList.length) {
      if (this.selectAllItems) {
        this.medicineList.forEach(itm => {
          itm.IsSelected = true;
          if (itm.DispachedQuantity == 0) { itm.DispachedQuantity = 1; itm.Quantity = itm.AvailableQuantity - itm.DispachedQuantity; }
        });
        //push all CreditItems to CurrentSaleItems when Select All is clicked.
        this.returnItems = this.medicineList.map(itm => {
          return itm;
        })
      }
      else {
        this.medicineList.forEach(itm => {
          itm.IsSelected = false;
          itm.DispachedQuantity = 0;
          itm.Quantity = itm.AvailableQuantity - itm.DispachedQuantity;
        });
        this.medicineList = this.medicineList.slice();
        //reset
        this.returnItems = [];
      }
    }
  }

  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  SelectItemChkOnChange(item: WardStockModel) {
    this.selectAllItems = false;
    if ((this.medicineList.every(a => a.IsSelected == true))) {
      this.selectAllItems = true;
    }
    else {
      this.selectAllItems = false;
    }
    if (item.DispachedQuantity == 0) { item.DispachedQuantity = 1; item.Quantity = item.AvailableQuantity - item.DispachedQuantity; }
    else { item.DispachedQuantity = 0; item.Quantity = item.AvailableQuantity - item.DispachedQuantity; }
    this.returnItems = this.medicineList.filter(itm => itm.IsSelected);
  }

  ValueChanged(index, item: WardStockModel) {
    try {
      item.Quantity = item.AvailableQuantity - item.DispachedQuantity;
      if (item.DispachedQuantity == 0) { item.IsSelected = false; }
      else {
        item.IsSelected = true;
      }
      this.returnItems = this.medicineList.filter(itm => itm.IsSelected);
    } catch (ex) {

    }
  }

  PharmacyTransfer() {
    if (this.returnItems.length) {
      this.showConfirmation = true;
    }
    else {
      this.msgBoxServ.showMessage("Failed", ["No items to return"]);
    }
  }
  ConfirmTransfer() {
    if (this.ReceivedBy.length) {
      this.wardSupplyBLService.PostReturnStock(this.returnItems, this.ReceivedBy)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("Success", ["Items Received By Pharmacy"]);
            this.getAllItemsStockDetailsList();
          }
          else {
            this.msgBoxServ.showMessage("Failed", ["Failed  to update Stock"]);
            console.log(res.Errors);
          }
        });
      this.showConfirmation = false;
      this.onChange(this.TransferId);
    }
    else {
      this.msgBoxServ.showMessage("Failed", ["Received By is compulsory"]);
    }
  }
  Close() {
    this.returnItems = [];
    this.ReceivedBy = "";
    this.showConfirmation = false;
  }

  ////This function only for show catch messages in console 
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.msgBoxServ.showMessage("error", ['error please check console lo for details']);
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.loading = false;
    }
  }
}
