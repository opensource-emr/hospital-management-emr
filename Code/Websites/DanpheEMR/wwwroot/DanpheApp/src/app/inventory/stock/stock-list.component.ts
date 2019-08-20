import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { StockModel } from "../shared/stock.model";
import { InventoryService } from "../shared/inventory.service";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
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
        public router: Router,
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
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get StockDetailsList. " + err.ErrorMessage]);
            });
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
        this.inventoryservice.Id = data.ItemId;
        this.inventoryservice.Name = data.ItemName;
        this.router.navigate(['/Inventory/StockMain/StockDetails']);
    }
    //route to stock manage, passing item id
    RouteToManageStock(data) {
        this.inventoryservice.Id = data.ItemId;
        this.inventoryservice.Name = data.ItemName;
        this.router.navigate(['/Inventory/StockMain/StockManage']);
    }
}