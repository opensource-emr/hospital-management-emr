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
import { IMRPUpdatedStock } from "../setting/mrp/phrm-update-mrp.component";
import { ENUM_StockLocations } from "../../shared/shared-enums";
import { SecurityService } from "../../security/shared/security.service";
@Component({
  selector: 'stock-details-list',
  templateUrl: "./phrm-stock-details-list.html"
})
export class PHRMStockDetailsListComponent {

  public stockDetailsGridColumns: Array<any> = null;
  public stockDetailsList: any;
  loading: boolean = false;
  public rowIndex: number = null;
  public showStockList: boolean = true;
  public selectedItem: PHRMStockManageModel = new PHRMStockManageModel();
  public showTransferPage: boolean = false;
  public storeList: Object = new Object();
  public selectedStore: any;
    totalstockvalue: any;
  public showUpdateMRPPopUpBox: boolean = false;
  public selectedStockForMRPUpdate: IMRPUpdatedStock;

  constructor(
    public pharmacyBLService: PharmacyBLService, public pharmacyService: PharmacyService,
    public changeDetector: ChangeDetectorRef, public router: Router,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {
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
          var phrmGridColumns = new PHRMGridColumns(this.securityService);
          this.stockDetailsGridColumns = phrmGridColumns.PHRMStockDetailsList;
            this.stockDetailsList = res.Results;
            this.totalstockvalue = this.stockDetailsList.map(c => c.Price).reduce((sum, current) => sum + current);
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
    this.pharmacyBLService.GetMainStore()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.storeList = res.Results;
          this.selectedStore = this.storeList;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get Store List." + res.ErrorMessage]);
        }
      }, err => {
        this.msgBoxServ.showMessage("error", ["Failed to get Store List." + err.ErrorMessage]);
      });
  }
  private FocusElementById(id: string) {
    window.setTimeout(function () {
      let element = document.getElementById(id);
      if (element) {
        element.focus();
      }
    }, 600);
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
          this.selectedItem.StockId = $event.Data.StockId;
          this.selectedItem.UpdatedQty = 0;
          this.selectedItem.GoodsReceiptItemId = $event.Data.GoodsReceiptItemId;
          this.selectedItem.Price = $event.Data.Price;
          this.selectedItem.InOut = null;
        }
        this.showTransferPage = true;
        this.FocusElementById("transfertoStoreQty");
        break;
      }
      case "update-mrp": {
        this.showUpdateMRPPopUpBox = true;
        this.selectedStockForMRPUpdate = null;
        this.selectedStockForMRPUpdate = { StockId: $event.Data.StockId, LocationId: ENUM_StockLocations.Dispensary, MRP: $event.Data.MRP ,oldMRP: $event.Data.MRP,StoreStockId:$event.Data.StoreStockId};
        break;
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
      else if (this.selectedItem.StockManageValidator.controls['UpdatedQty'].status == 'INVALID'){
        alert("Transfer Quantity format not proper");
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
  CallBackUpdateMRP($event) {
    this.showUpdateMRPPopUpBox = false;
    if ($event.event == 'update') {
      let updatedStock = $event.stock;
      var stockInClient = this.stockDetailsList.find(s => s.StockId == updatedStock.StockId);
      stockInClient.MRP = updatedStock.MRP;
      this.changeDetector.detectChanges();
      this.stockDetailsList = this.stockDetailsList.slice();
    }
  }
}



