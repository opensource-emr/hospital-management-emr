import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PharmacyBLService } from "../shared/pharmacy.bl.service"

import { PharmacyService } from "../shared/pharmacy.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../shared/common.functions"
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { PHRMStockManageModel } from "../shared/phrm-stock-manage.model";
@Component({
  selector: 'stock-details-list',
  templateUrl: '../../view/pharmacy-view/Stock/PHRMStockDetails.html' //"/PharmacyView/PHRMStockDetails"
})
export class PHRMStockDetailsListComponent {

  public stockDetailsGridColumns: Array<any> = null;
  public stockDetailsList: any;
  loading: boolean = false;
  public rowIndex: number = null;
  public showStockList: boolean = true;
  public selectedItem: PHRMStockManageModel = new PHRMStockManageModel();
  public showTransferPage: boolean = false;
  public storeList: Array<any> = new Array<any>();
  public selectedStore: any;

  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.stockDetailsGridColumns = PHRMGridColumns.PHRMStockDetailsList;
    this.getAllItemsStockDetailsList();
    this.getStoreList();
  }
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list    
  //get all items list with 0 or more than 0 stock qty for manage stock items
  public getAllItemsStockDetailsList() {
    this.pharmacyBLService.GetAllItemsStockDetailsList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.stockDetailsList = res.Results;
          for (var i = 0; i < this.stockDetailsList.length; i++) {
            this.stockDetailsList[i].ExpiryDate = moment(this.stockDetailsList[i].ExpiryDate).format("YYYY-MM-DD");
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + err.ErrorMessage]);
        });
  }

  getStoreList() {
    this.pharmacyBLService.GetStoreList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.storeList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Store List." + res.ErrorMessage]);
        }
      }, err => {
        this.msgBoxServ.showMessage("error", ["Failed to get Store List." + err.ErrorMessage]);
      });
  }

  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "manage-stock": {
        // let x = $event.Action;
        this.rowIndex = $event.RowIndex;
        this.ManageStock($event.Data);
        break;
      }
      case "transfer-store": {
        this.rowIndex = $event.RowIndex;
        if ($event.Data) {
          this.selectedItem = new PHRMStockManageModel();
          this.selectedItem = Object.assign(this.selectedItem, $event.Data);
          this.selectedItem.Quantity = $event.Data.AvailableQuantity;
          this.selectedItem.UpdatedQty = 0;
          this.selectedItem.GoodsReceiptItemId = $event.Data.GoodsReceiptItemId;
          this.selectedItem.Price = $event.Data.Price;
          this.selectedItem.InOut = null;
        }
        this.showTransferPage = true;
      }
      default:
        break;
    }
  }

  ManageStock(data) {
    try {
      if (data) {
        this.selectedItem = new PHRMStockManageModel();
        this.selectedItem = Object.assign(this.selectedItem, data);
        this.selectedItem.Quantity = data.AvailableQuantity;
        this.selectedItem.UpdatedQty = 0;
        this.selectedItem.InOut = null;
        this.selectedItem.GoodsReceiptItemId = data.GoodsReceiptItemId;
        this.selectedItem.Price = data.Price;
        this.showStockList = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  //update stockManage transaction
  //Post to StockManage table and post to stockTxnItem table 
  SaveManagedStock() {
    try {
      if (this.selectedItem) {
        for (var b in this.selectedItem.StockManageValidator.controls) {
          this.selectedItem.StockManageValidator.controls[b].markAsDirty();
          this.selectedItem.StockManageValidator.controls[b].updateValueAndValidity();
        }
        let flag = (this.selectedItem.InOut == "out") ? (this.selectedItem.Quantity < this.selectedItem.UpdatedQty) ? false : true : true;
        if ((this.selectedItem.IsValidCheck(undefined, undefined) == true) && flag) {
          this.loading = true;
          this.pharmacyBLService.PostManagedStockDetails(this.selectedItem).
            subscribe(res => {
              if (res.Status == 'OK') {
                if (res.Results) {
                  this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
                  this.changeDetector.detectChanges();
                  let tempItm = this.stockDetailsList[this.rowIndex];
                  if (this.selectedItem.InOut == 'in') {
                    this.stockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity + this.selectedItem.UpdatedQty;
                  } else if (this.selectedItem.InOut == 'out') {
                    this.stockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.UpdatedQty;
                   }
                  this.getAllItemsStockDetailsList();
                  this.Cancel();
                }
              }
              else {
                this.msgBoxServ.showMessage("failed", ['failed ,please check log for details.']);
                console.log(res);
                this.Cancel();
              }
            });
        } else {
          this.msgBoxServ.showMessage("notice", ['please see error message']);
          this.loading = false;

        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  transferToStore() {
    var StoreId = this.selectedStore.StoreId;
      if (this.selectedItem.UpdatedQty <= 0) {
        alert("Transfer Quantity is not valid.");
      }
      else if (this.selectedItem.UpdatedQty > this.selectedItem.Quantity) {
        alert("Transfer Quantity is greater than Available Quantity.")
      }
      else {
        this.selectedItem.InOut = "out";
        this.loading = true;
        this.pharmacyBLService.TransferToStore(this.selectedItem,StoreId).
          subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
                this.changeDetector.detectChanges();
                let tempItm = this.stockDetailsList[this.rowIndex];
                this.stockDetailsList[this.rowIndex].AvailableQuantity = tempItm.AvailableQuantity - this.selectedItem.UpdatedQty;
                this.stockDetailsList = this.stockDetailsList.slice();
                this.selectedItem = new PHRMStockManageModel();
                this.selectedStore = null;
                this.getAllItemsStockDetailsList();
              }
              this.Cancel();
            }
            else {
              this.msgBoxServ.showMessage("Failed", ["Stock adjustment Failed"]);
              this.Cancel();
            }
          });
        this.showTransferPage = false;
        this.loading = false;
      }

  }
  Close() {
    this.selectedItem = new PHRMStockManageModel();
    this.selectedStore = null;
    this.showTransferPage = false;
  }
  Cancel() {
    this.loading = true;
    try {
      this.selectedItem = new PHRMStockManageModel();
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
      this.msgBoxServ.showMessage("error", ['error please check console log for details'])
      this.showStockList = true;
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.loading = false;
    }
  }

  myStoreListFormatter(data: any): string {
    let html = data["Name"];
    return html;
  }
}



