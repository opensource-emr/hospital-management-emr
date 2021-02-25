import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { StockModel } from "../shared/stock.model";
import { InventoryService } from "../shared/inventory.service";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../security/shared/security.service";
@Component({
  templateUrl: "../../view/inventory-view/StockList.html" //"/InventoryView/StockList"
})
export class StockListComponent {
  public stockList: Array<StockModel> = new Array<StockModel>();
  public stockListGridColumns: Array<any> = null;

  constructor(
    public inventoryBLservice: InventoryBLService,
    public inventoryservice: InventoryService,
    public changeDetector: ChangeDetectorRef,
    public router: Router, public security: SecurityService,
    public msgBoxServ: MessageboxService) {
    this.stockListGridColumns = GridColumnSettings.StockList;
    this.getStockDetailsList();
  }
  //load stock list
  public getStockDetailsList() {
    this.inventoryBLservice.GetStockList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.stockList = res.Results;
          this.CanUserCanManageStock();
        }
        else {
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
}
