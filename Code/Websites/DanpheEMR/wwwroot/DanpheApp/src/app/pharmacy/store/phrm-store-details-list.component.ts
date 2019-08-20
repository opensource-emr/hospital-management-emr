import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PharmacyBLService } from "../shared/pharmacy.bl.service"

import { PharmacyService } from "../shared/pharmacy.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../shared/common.functions"
import * as moment from 'moment/moment';
import { Router } from '@angular/router';
import { PHRMStoreStockModel } from "../shared/phrm-storestock.model";
import { PHRMReportsModel } from "../shared/phrm-reports-model";
import { PHRMDispensaryModel } from "../shared/phrm-dispensary.model";
@Component({
  selector: 'store-details-list',
  templateUrl: '../../view/pharmacy-view/Store/PHRMStoreDetails.html' //"/PharmacyView/PHRMStoreDetails"
})
export class PHRMStoreDetailsListComponent {

  public stockDetailsGridColumns: Array<any> = null;
  public stockDetailsList: Array<any> = new Array<any>();
  loading: boolean = false;
  public rowIndex: number = null;
  public showStockList: boolean = true;
  public selectedItem: PHRMStoreStockModel = new PHRMStoreStockModel();
  public Status: string = "";
  public showTransferPage: boolean = false;

  public dispensaryList: Array<any> = new Array<any>();
  public currentDispensary:PHRMDispensaryModel = new PHRMDispensaryModel();

  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public msgBoxServ: MessageboxService) {
    this.stockDetailsGridColumns = PHRMGridColumns.StoreRequestItemsList;
    this.GetStockDetailsList();
    this.GetDispensaryList();
  }
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list    
  //get all items list with 0 or more than 0 stock qty for manage stock items
  GetStockDetailsList() {
    this.pharmacyBLService.GetStoreRequestedItemList(this.Status)
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.stockDetailsGridColumns = PHRMGridColumns.StoreRequestItemsList;
          this.stockDetailsList = res.Results;
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["No data is available"]);
        }
      });
  }
  //get all the available Dispensary
  GetDispensaryList() {
    this.pharmacyBLService.GetDispensaryList()
      .subscribe(res => {
        if (res.Status == 'OK' && res.Results.length > 0) {
          this.dispensaryList = res.Results;
          this.dispensaryList = this.dispensaryList.filter(a => a.IsActive == true);
        }
        if (res.Status == 'OK' && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["Dispensary is not available."]);
        }
      });
  }

  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "manage-store": {
        // let x = $event.Action;
        this.rowIndex = $event.RowIndex;
        this.ManageStock($event.Data);
        break;
      }
      case "transfer": {
        this.rowIndex = $event.RowIndex;
        this.selectedItem = Object.assign(this.selectedItem, $event.Data);
        this.showTransferPage = true;
        this.selectedItem.Quantity = $event.Data.AvailableQty;
        this.selectedItem.UpdatedQty = 0;
        this.selectedItem.ItemId = $event.Data.ItemId;
        this.selectedItem.GoodsReceiptItemId = $event.Data.GoodsReceiptItemId;
        this.selectedItem.StoreId = $event.Data.StoreId;
        this.selectedItem.Price = $event.Data.Price;
        this.selectedItem.InOut = null;
        this.selectedItem.GoodReceiptPrintId = $event.Data.GoodsReceiptItemId;
        break;
      }
      default:
        break;
    }
  }

  ManageStock(data) {
    try {
      if (data) {
        this.selectedItem = new PHRMStoreStockModel();
        this.selectedItem = Object.assign(this.selectedItem, data);
        this.selectedItem.Quantity = data.AvailableQty;
        this.selectedItem.UpdatedQty = 0;
        this.selectedItem.ItemId = data.ItemId;
        this.selectedItem.GoodsReceiptItemId = data.GoodsReceiptItemId;
        this.selectedItem.StoreId = data.StoreId;
        //this.selectedItem.Price = data.Price;
        this.selectedItem.InOut = null;
        //this.selectedItem.GoodReceiptPrintId = data.GoodReceiptPrintId;
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
        for (var b in this.selectedItem.StoreManageValidator.controls) {
          this.selectedItem.StoreManageValidator.controls[b].markAsDirty();
          this.selectedItem.StoreManageValidator.controls[b].updateValueAndValidity();
        }
        let flag = (this.selectedItem.InOut == "out") ? (this.selectedItem.Quantity < this.selectedItem.UpdatedQty) ? false : true : true;
        if ((this.selectedItem.IsValidCheck(undefined, undefined) == true) && flag) {
          this.loading = true;
          this.pharmacyBLService.PostManagedStoreDetails(this.selectedItem).
            subscribe(res => {
              if (res.Status == 'OK') {
                if (res.Results) {
                  this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
                  this.changeDetector.detectChanges();
                  let tempItm = this.stockDetailsList[this.rowIndex];
                  if (this.selectedItem.InOut == 'in') {
                    this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty + this.selectedItem.UpdatedQty;
                  } else if (this.selectedItem.InOut == 'out') {
                    this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty - this.selectedItem.UpdatedQty;
                  }
                  this.GetStockDetailsList();
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


  Cancel() {
    this.loading = true;
    try {
      this.selectedItem = new PHRMStoreStockModel();
      this.showStockList = true;
      this.loading = false;
      this.rowIndex = null;
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //tranfer to dispensary
  transferToDispensary() {
    this.selectedItem.DispensaryId = this.currentDispensary.DispensaryId;
    if (this.selectedItem.UpdatedQty <= 0) {
      alert("Transfer Quantity is not valid.");
    }
    else if (this.selectedItem.UpdatedQty > this.selectedItem.Quantity) {
      alert("Transfer Quantity is greater than Available Quantity.")
    }
    else {
      this.selectedItem.InOut = "out";
      this.loading = true;
      this.pharmacyBLService.TransferToDispensary(this.selectedItem).
        subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results) {
              this.msgBoxServ.showMessage("success", ["stock adjustment saved"]);
              this.changeDetector.detectChanges();
              let tempItm = this.stockDetailsList[this.rowIndex];
              this.stockDetailsList[this.rowIndex].AvailableQty = tempItm.AvailableQty - this.selectedItem.UpdatedQty;
              //this.stockDetailsList = this.stockDetailsList.filter(a => a.AvailableQty != 0);
              this.stockDetailsList = this.stockDetailsList.slice();
              this.GetStockDetailsList();
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
  //close transfer page
  Close() {
    this.showTransferPage = false;
  } 

  myDispensaryListFormatter(data: any): string {
    let html = data["Name"];
    return html;
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
}



