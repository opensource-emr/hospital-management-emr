import { Component, ChangeDetectorRef } from '@angular/core'
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { WardStockModel } from '../../shared/ward-stock.model'
import WARDGridColumns from '../../shared/ward-grid-cloumns';
import { Router } from '@angular/router';
import * as moment from 'moment/moment'
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { SecurityService } from '../../../security/shared/security.service';
@Component({
  templateUrl: "./inventory-ward-stock.html" // "/WardSupplyView/Stock"
})
export class WardInventoryStockComponent {
  public inventoryStockGridColumns: Array<WARDGridColumns> = []
  public inventoryStockDetailsList: Array<WardStockModel> = []
  public DepartmentId: number = 0;
  public CurrentStoreId: number = 0;
  public rowIndex: number = null;
  public selectedStock: WardStockModel = new WardStockModel();
  public showStockTransfer: boolean = false;
  public departmentList: Array<any> = new Array<any>();
  public availableDepartmentList: Array<any> = new Array<any>();
  public transferBackToInventory: boolean = false;

  constructor(public securityService: SecurityService,
    public wardSupplyBLService: WardSupplyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public router: Router) {
    this.CheckForSubstoreActivation();
  }

  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.inventoryStockGridColumns = WARDGridColumns.WARDInventoryStockDetailsList;
        this.GetInventoryStockDetailsList();
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }

  gridExportOptions = {
    fileName: 'StockDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ////Grid Action Method
  StockDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "transfer-inventory-stock": {
        let x = $event.Action;
        this.rowIndex = this.inventoryStockDetailsList.findIndex(stk => stk.StockId == $event.Data.StockId);
        let data = $event.Data;
        this.transferStock(data);
        break;
      }
      default:
        break;
    }
  }
  GetInventoryStockDetailsList() {
    try {
      this.wardSupplyBLService.GetInventoryStockByStoreId(this.CurrentStoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.inventoryStockDetailsList = [];
              this.inventoryStockDetailsList = res.Results;
              this.inventoryStockDetailsList = this.inventoryStockDetailsList.filter(a => a.Quantity > 0);
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
  transferStock(StockData) {
    this.selectedStock.DepartmentId = StockData.DepartmentId;
    this.selectedStock.DepartmentName = StockData.DepartmentName;
    this.selectedStock.ItemId = StockData.ItemId;
    this.selectedStock.ItemName = StockData.ItemName;
    this.selectedStock.Quantity = StockData.Quantity;
    this.selectedStock.AvailableQuantity = StockData.Quantity;
    this.selectedStock.StockId = StockData.StockId;
    this.selectedStock.ExpiryDate = StockData.ExpiryDate;
    this.selectedStock.BatchNo = StockData.BatchNo;
    this.selectedStock.MRP = StockData.MRP;
    this.availableDepartmentList = this.departmentList.filter(a => a.DepartmentId != StockData.DepartmentId);
    this.showStockTransfer = true;
  }
  //cancelbutton
  Close(): void {
    this.selectedStock = new WardStockModel();
    this.showStockTransfer = false;
    this.transferBackToInventory = false;
  }
  WardStockTransfer(): void {
    switch (this.transferBackToInventory) {
      case false: {
        try {
          if (this.selectedStock && (this.selectedStock.DispachedQuantity <= this.selectedStock.Quantity) && (this.selectedStock.DispachedQuantity != 0) && (this.selectedStock.newWardId)) {
            //for (var b in this.selectedItem.StockManageValidator.controls) {
            //    this.selectedItem.StockManageValidator.controls[b].markAsDirty();
            //    this.selectedItem.StockManageValidator.controls[b].updateValueAndValidity();
            //}if ((this.selectedItem.IsValid(undefined, undefined) == true)) {
            this.wardSupplyBLService.PostInventoryStockTransfer(this.selectedStock).
              subscribe(res => {
                if (res.Status == 'OK') {
                  if (res.Results) {
                    this.msgBoxServ.showMessage("Success", ["Stock adjustment saved"]);
                    this.changeDetector.detectChanges();
                    this.GetInventoryStockDetailsList();
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
          }
        } catch (ex) {
          this.ShowCatchErrMessage(ex);
        }
        break;
      }
      case true: {
        try {
          if (this.selectedStock && (this.selectedStock.DispachedQuantity <= this.selectedStock.Quantity) && (this.selectedStock.DispachedQuantity != 0)) {
            //for (var b in this.selectedItem.StockManageValidator.controls) {
            //    this.selectedItem.StockManageValidator.controls[b].markAsDirty();
            //    this.selectedItem.StockManageValidator.controls[b].updateValueAndValidity();
            //}if ((this.selectedItem.IsValid(undefined, undefined) == true)) {
            this.wardSupplyBLService.PostBackToInventory(this.selectedStock).
              subscribe(res => {
                if (res.Status == 'OK') {
                  if (res.Results) {
                    this.msgBoxServ.showMessage("Success", ["Stock adjustment saved"]);
                    this.changeDetector.detectChanges();
                    this.GetInventoryStockDetailsList();
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
          }
        } catch (ex) {
          this.ShowCatchErrMessage(ex);
        }
        break;
      }
    }

  }

  Cancel() {
    try {
      this.selectedStock = new WardStockModel();
      this.transferBackToInventory = false;
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
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
}
