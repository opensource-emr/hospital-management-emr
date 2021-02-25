import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { StockModel } from "../shared/stock.model";
import { InventoryService } from '../shared/inventory.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "../../view/inventory-view/StockDetails.html" // "/InventoryView/StockDetails"
})
export class StockDetailsComponent {
  public stockdetailsList: Array<StockModel> = new Array<StockModel>();
  public stockdetailGridColumns: Array<any> = null;
  public itemId: number = null;
  public itemName: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public inventoryBLservice: InventoryBLService,
    public inventoryservice: InventoryService,
    public router: Router,
    public msgBoxServ: MessageboxService) {
    this.stockdetailGridColumns = GridColumnSettings.StockDetails;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('GoodsReceiptDate', false));
    this.loadStockDetails(this.inventoryservice.ItemId);
  }
  //load stock item detail using item id
  loadStockDetails(id: number) {
    if (id != null) {
      this.itemId = id;
      this.itemName = this.inventoryservice.ItemName;//sud:3Mar'20-Property Rename in InventoryService
      this.inventoryBLservice.GetStockDetailsByItemId(this.itemId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.stockdetailsList = res.Results;
          }
          else {
            this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + res.ErrorMessage]);
            this.routetoStockList();
          }
        },
          err => {
            this.msgBoxServ.showMessage("error", ["Failed to get details for selected Item. " + err.ErrorMessage]);
            this.routetoStockList();
          });
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ['Please, Select Stock-Item for Details.']);
      this.routetoStockList();
    }
  }
  //route to manage stock page, passing item id
  routetoStockManage() {
    this.inventoryservice.ItemId = this.itemId;//sud:3Mar'20-Property Rename in InventoryService
    this.inventoryservice.ItemName = this.itemName;//sud:3Mar'20-Property Rename in InventoryService
    this.router.navigate(['/Inventory/StockMain/StockManage']);
  }
  //route back to stock list page
  routetoStockList() {
    this.router.navigate(['/Inventory/StockMain/StockList']);
  }
}
