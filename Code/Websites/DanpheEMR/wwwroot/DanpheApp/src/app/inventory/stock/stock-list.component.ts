import { Component, ChangeDetectorRef, ElementRef, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { StockModel } from "../shared/stock.model";
import { InventoryService } from "../shared/inventory.service";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../security/shared/security.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { ActivateInventoryService } from "../../shared/activate-inventory/activate-inventory.service";
import { CoreService } from "../../core/shared/core.service";
import { AsyncValidator } from "@angular/forms";
import * as moment from "moment";
import { IGridFilterParameter } from "../../shared/danphe-grid/grid-filter-parameter.interface";
@Component({
  templateUrl: "./stock-list.component.html"
})
export class StockListComponent {
  stockList: Array<StockModel> = new Array<StockModel>();
  stockListForManage: Array<StockModel> = new Array<StockModel>();
  public showStockWithZeroQty: boolean = false;
  stockListGridColumns: Array<any> = null;
  filteredStockList: StockModel[] = [];
  public IsFixedAssets: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  StoreId: number = null;
  showManageButton: boolean;
  loadingStock: boolean = false;
  stockReconciliationPopupOpen: boolean = false;
  public selectedSubCategory: any;
  public SubCategoryList: any[] = [];
  FilterParameters: IGridFilterParameter[] = [];




  constructor(public inventoryBLservice: InventoryBLService, public inventoryservice: InventoryService, public changeDetector: ChangeDetectorRef, public router: Router, public security: SecurityService, public msgBoxServ: MessageboxService, public securityService: SecurityService, private _activeInvService: ActivateInventoryService, public coreService: CoreService) {
    this.stockListGridColumns = GridColumnSettings.StockList;
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ExpiryDate', false));
    this.StoreId = this._activeInvService.activeInventory.StoreId;
    this.getStockDetailsList();
    this.getStockDetailsListForStockManage(); //For stock manage part
    this.StockManageButtonSetting();
    this.getSubCategoryList();
  }
  //load stock list
  public getStockDetailsList() {
    this.inventoryBLservice.GetStockList()
      .subscribe(res => {
        if (res.Status == "OK" && res.Results && res.Results.length > 0) {
          this.stockList = res.Results;
          this.filteredStockList = this.stockList;
          this.CanUserCanManageStock();
          this.FilterStockListForZeroQty();
        }
        else {
          if (res.Results && res.Results.length == 0) {
            this.stockList = [];
            return;
          }
          this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + err.ErrorMessage]);
        });
  }
  // This part is for Stock Manage to check the if the file is latest --Rohit
  public getStockDetailsListForStockManage() {
    this.loadingStock = false;
    this.inventoryBLservice.GetStockListForManage().finally(() => { this.loadingStock = true; })
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results && res.Results.length > 0) {
            this.stockListForManage = res.Results;
          }
          else {
            console.log("No data found");

          }
        }
        else {
          console.log(res.ErrorMessage);
        }
      },
        err => {
          console.log(err.ErrorMessage);
        });
  }
  public getSubCategoryList() {
    this.inventoryBLservice.GetSubCategoryList().subscribe(res => {
      if (res.Status == "OK" && res.Results && res.Results.length > 0) {
        this.SubCategoryList = res.Results;
        this.SubCategoryList.unshift({ SubCategoryName: "All", Code: '-', IsConsumable: true });
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
  public CanUserCanManageStock() {
    var canUserManageStock = this.security.HasPermission('inventory-stock-manage-button');
    this.stockList.forEach(a => a.canUserManageStock = canUserManageStock);
  }
  FilterStockListForZeroQty() {
    if (this.showStockWithZeroQty) {
      this.filteredStockList = this.stockList.filter(a => a.AvailQuantity < 1);
    }
    else {
      this.filteredStockList = this.stockList.filter(a => a.AvailQuantity > 0);
    }
  }
  FilterFixedAssets() {
    if (this.IsFixedAssets == true) {
      this.filteredStockList = this.stockList.filter(x => x.IsFixedAssets == true);
    }
    else {
      this.filteredStockList = this.stockList;
    }
  }
  //grid actions
  StockListGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        this.RouteToViewDetails($event.Data);
        break;
      }
      case "manageStock": {
        this.RouteToManageStock($event.Data);
        break;
      }
      default:
        break;
    }
  }
  //route to view stock item details, passing item id, item name
  RouteToViewDetails(data) {
    this.inventoryservice.ItemId = data.ItemId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryservice.ItemName = data.ItemName;//sud:3Mar'20-Property Rename in InventoryService
    this.router.navigate(['/Inventory/StockMain/StockDetails']);
  }
  //route to stock manage, passing item id
  RouteToManageStock(data) {
    this.inventoryservice.ItemId = data.ItemId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryservice.ItemName = data.ItemName;//sud:3Mar'20-Property Rename in InventoryService
    this.router.navigate(['/Inventory/StockMain/StockManage']);
  }

  OnChangeShowColdStorageCheckbox($event) {
    if ($event.target.checked) {
      this.filteredStockList = this.stockList.filter(a => a.IsColdStorageApplicable == true)
    }
    else {
      this.filteredStockList = this.stockList;
    }
  }
  onSubCategoryChange(event) {
    this.FilterParameters = [
      { DisplayName: "SubCategoryName:", Value: event.SubCategoryName }
    ]
    let subCategoryName = event.SubCategoryName;
    if (subCategoryName == 'All') {
      this.filteredStockList = this.stockList.filter(a => a.AvailQuantity > 0);
    }
    else {
      this.filteredStockList = this.stockList.filter(a => a.SubCategoryName == subCategoryName && a.AvailQuantity > 0);
    }
  }
  SubCategoryListFormatter(data: any): string {
    return data["SubCategoryName"];

  }
  StockReconciliationPopupOpen() {
    this.stockReconciliationPopupOpen = true;
  }

  StockReconciliationPopupClose() {
    this.stockReconciliationPopupOpen = false;
    this.getStockDetailsList();
    this.getStockDetailsListForStockManage();
  }

  StockManageButtonSetting() {
    let manageBtnSetting = this.coreService.Parameters.find(lang => lang.ParameterName == 'ManageStockButton' && lang.ParameterGroupName == 'Common');
    if (manageBtnSetting) {
      let jsonValue = JSON.parse(manageBtnSetting.ParameterValue).Inventory;
      this.showManageButton = jsonValue.DisplayManageStockButton;

    } else {
      this.msgBoxServ.showMessage("warning", ["Failed to load the parameter value"]);
      return null;
    }
  }

  public gridExportOptions = {
    fileName: 'SubCategoryWiseStockDetails' + moment().format('YYYY-MM-DD') + '.xls',
  };
}
