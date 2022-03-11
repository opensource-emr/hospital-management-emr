import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { StockModel } from "../shared/stock.model";
import { InventoryService } from "../shared/inventory.service";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../security/shared/security.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
@Component({
  templateUrl: "./stock-list.component.html"
})
export class StockListComponent {
  stockList: Array<StockModel> = new Array<StockModel>();
  public showStockWithZeroQty: boolean = false;
  stockListGridColumns: Array<any> = null;
  filteredStockList: StockModel[] = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


  constructor(public inventoryBLservice: InventoryBLService, public inventoryservice: InventoryService, public changeDetector: ChangeDetectorRef, public router: Router, public security: SecurityService, public msgBoxServ: MessageboxService) {
    this.stockListGridColumns = GridColumnSettings.StockList;
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('ExpiryDate', false));
    this.getStockDetailsList();
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
}
