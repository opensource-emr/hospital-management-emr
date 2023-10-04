import { Component, ChangeDetectorRef } from '@angular/core'
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { WARDInventoryStockModel } from '../../shared/ward-inventory-stock.model';
import WARDGridColumns from '../../shared/ward-grid-cloumns';
import { Router } from '@angular/router';
import * as moment from 'moment/moment'
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { SecurityService } from '../../../security/shared/security.service';
import { PHRMStoreModel } from '../../../pharmacy/shared/phrm-store.model';
import { wardsupplyService } from '../../shared/wardsupply.service';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
@Component({
  templateUrl: "./inventory-ward-stock.html" // "/WardSupplyView/Stock"
})
export class WardInventoryStockComponent {
  public inventoryStockGridColumns: Array<WARDGridColumns> = []
  public inventoryStockDetailsList: Array<WARDInventoryStockModel> = []
  public DepartmentId: number = 0;
  public CurrentStoreId: number = 0;
  public rowIndex: number = null;
  public selectedStock: WARDInventoryStockModel = new WARDInventoryStockModel();
  public showStockTransfer: boolean = false;
  public departmentList: Array<any> = new Array<any>();
  public availableDepartmentList: Array<any> = new Array<any>();
  public transferBackToInventory: boolean = false;
  public inventoryList: PHRMStoreModel[] = [];
  public selectedInventoryId: number = null;
  filterSubstoreStockList: WARDInventoryStockModel[] = [];
  showManageButton: boolean;
  loadingStock: boolean = false;
  stockReconciliationPopupOpen: boolean = false;
  loadingScreen: boolean = false;
  SubCategoryList: ItemSubCategory[] = [];
  selectedSubCategoryId: number = 0;

  constructor(public securityService: SecurityService,
    public wardSupplyBLService: WardSupplyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public wardSupplyService: wardsupplyService,
    public inventoryBLService: InventoryBLService,
    public router: Router, public coreService: CoreService) {
    this.CheckForSubstoreActivation();
    this.StockManageButtonSetting();
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
        this.GetAllInventory();
        this.GetInventoryStockDetailsList();
        this.getSubCategoryList();
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }

  gridExportOptions = {
    fileName: 'StockDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  private GetAllInventory() {
    this.wardSupplyBLService.GetInventoryList().subscribe(res => {
      if (res.Status == "OK") {
        this.inventoryList = res.Results;
      }
      else {
        console.log(res);
        this.msgBoxServ.showMessage("Failed", ["Failed to load inventory list"]);
      }
    }, err => {
      console.log(err);
      this.msgBoxServ.showMessage("Failed", ["Failed to load inventory list"]);
    });
  }

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
      this.loadingStock = false;
      this.loadingScreen = true;
      this.wardSupplyBLService.GetInventoryStockByStoreId(this.CurrentStoreId)
        .finally(() => {
          this.loadingStock = true;
          this.loadingScreen = false;
        })
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length > 0) {
              this.inventoryStockDetailsList = [];
              this.inventoryStockDetailsList = res.Results;
              this.wardSupplyService.inventoryStockList = res.Results;
              this.filterStockByInventory();
              this.filterStockBySubCategory();
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
  filterByStoreIdAndSubCategoryId(selectedInventoryId: number, selectedSubCategoryId: number) {
    if (this.selectedInventoryId == null && selectedSubCategoryId == null) {
      this.filterSubstoreStockList = this.inventoryStockDetailsList;
    }
    else if (this.selectedInventoryId == null && selectedSubCategoryId == 0) {
      this.filterSubstoreStockList = this.inventoryStockDetailsList;

    }
    else if (selectedInventoryId == null && selectedSubCategoryId !== null && selectedSubCategoryId !== 0) {
      this.filterSubstoreStockList = this.inventoryStockDetailsList.filter(a => a.SubCategoryId == selectedSubCategoryId);
    }
    else if (selectedInventoryId !== null && selectedSubCategoryId == null) {
      this.filterSubstoreStockList = this.inventoryStockDetailsList.filter(a => a.StoreId == selectedInventoryId);

    }
    else {
      this.filterSubstoreStockList = this.inventoryStockDetailsList.filter(a => a.SubCategoryId == selectedSubCategoryId && a.StoreId == selectedInventoryId);
    }
  }
  filterStockByInventory() {
    this.filterByStoreIdAndSubCategoryId(this.selectedInventoryId, this.selectedSubCategoryId);
  }
  filterStockBySubCategory() {
    this.filterByStoreIdAndSubCategoryId(this.selectedInventoryId, this.selectedSubCategoryId);
  }
  transferStock(StockData) {
    this.selectedStock.DepartmentId = StockData.DepartmentId;
    this.selectedStock.ItemId = StockData.ItemId;
    this.selectedStock.ItemName = StockData.ItemName;
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
    this.selectedStock = new WARDInventoryStockModel();
    this.showStockTransfer = false;
    this.transferBackToInventory = false;
  }
  WardStockTransfer(): void {
    switch (this.transferBackToInventory) {
      case false: {
        try {
          if (this.selectedStock && (this.selectedStock.DispachedQuantity <= this.selectedStock.AvailableQuantity) && (this.selectedStock.DispachedQuantity != 0)) {
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
          if (this.selectedStock && (this.selectedStock.DispachedQuantity <= this.selectedStock.AvailableQuantity) && (this.selectedStock.DispachedQuantity != 0)) {
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
      this.selectedStock = new WARDInventoryStockModel();
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

  StockManageButtonSetting() {
    let manageBtnSetting = this.coreService.Parameters.find(lang => lang.ParameterName == 'ManageStockButton' && lang.ParameterGroupName == 'Common');
    if (manageBtnSetting) {
      let jsonValue = JSON.parse(manageBtnSetting.ParameterValue).SubStore;
      this.showManageButton = jsonValue.DisplayManageStockButton;

    } else {
      this.msgBoxServ.showMessage("warning", ["Failed to load the parameter value"]);
      return null;
    }
  }
  StockReconciliationPopupOpen() {
    this.stockReconciliationPopupOpen = true;
  }

  StockReconciliationPopupClose() {
    this.stockReconciliationPopupOpen = false;
    this.GetInventoryStockDetailsList();
  }
  public getSubCategoryList() {
    this.inventoryBLService.GetSubCategoryList().subscribe(res => {
      if (res.Status == "OK" && res.Results && res.Results.length > 0) {
        this.SubCategoryList = res.Results;
        // this.SubCategoryList.unshift({ SubCategoryName: "All", SubCategoryId: null });
      }
      else {
        if (res.Results && res.Results.length == 0) {
          this.msgBoxServ.showMessage("error", ["SubCategory Not Found. "]);
        }
      }
    },
      err => {
        this.msgBoxServ.showMessage("error", ["Failed to get SubCategoryList. " + err.ErrorMessage]);
      })
  }
}
export class ItemSubCategory {
  SubCategoryName: string;
  SubCategoryId: number;
}
