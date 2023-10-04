import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { StockModel } from "../shared/stock.model";
import { InventoryService } from '../shared/inventory.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
@Component({
  templateUrl: "./stock-manage.component.html"
})
export class StockManageComponent {
  public currQuantity: number = 0;
  public moddQuantity: number = 0;
  public itemId: number = null;
  public itemName: string = null;
  public CheckValidQty: boolean = null;
  public stockDetails: Array<any> = null;
  public tempList: Array<any> = [];
  public selected: StockModel = new StockModel();
  public stkUpdate: Array<StockModel> = new Array<StockModel>();
  showNepaliDate: boolean = true;
  showExpiryNepaliDate: boolean = true;
  StoreId: number;
  public selectAllItems: boolean = false;
  public loading: boolean = false;

  constructor(public security: SecurityService,
    public inventoryBLservice: InventoryBLService,
    public inventoryservice: InventoryService,
    public router: Router, public _activateInventoryService: ActivateInventoryService,
    public msgBoxServ: MessageboxService) {
    if (this.security.HasPermission('inventory-stock-manage-button')) {
      this.loadStockDetails(this.inventoryservice.ItemId);//sud:3Mar'20-Property Rename in InventoryService
    }
    else {
      this.msgBoxServ.showMessage("Warning", ["You are not allowed to edit this stock."]);
    }
  }
  //load stock details for manage
  loadStockDetails(itmId: number) {
    if (itmId != null) {
      this.itemId = itmId;
      this.StoreId = this._activateInventoryService.activeInventory.StoreId;
      this.itemName = this.inventoryservice.ItemName;//sud:3Mar'20-Property Rename in InventoryService
      this.inventoryBLservice.GetStockManageByItemId(this.itemId, this.StoreId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.stockDetails = res.Results;
            this.stockDetails.map(itm => itm.IsSelected = false);
            this.CalculationAll();
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
      this.msgBoxServ.showMessage("notice-message", ['Please, Select Stock-Item for manage.']);
      this.routetoStockList();
    }
  }
  //Calculating total stock quantities for view
  CalculationAll() {
    let curQty = 0;
    let modQty = 0;
    //adding to total from stockDetails list
    for (var i = 0; i < this.stockDetails.length; i++) {
      curQty = curQty + this.stockDetails[i].curQuantity;
      modQty = modQty + this.stockDetails[i].ModQuantity;
    }
    this.currQuantity = curQty;
    this.moddQuantity = modQty;
  }
  //add new row
  AddRow() {
    this.selected = new StockModel();
    this.selected.BatchNo = "";
    this.selected.ReceivedQty = 0;
    this.selected.curQuantity = 0;
    this.selected.ModQuantity = 0;
    this.tempList.push(this.selected);
  }
  DeleteRow(index) {
    //this will remove the data from array
    this.tempList.splice(index, 1);
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["BatchNo"];
    return html;
  }
  CheckValidityOfQty() {
    this.CheckValidQty = true;
    for (var i = 0; i < this.stockDetails.length; i++) {
      //Check if modified Quantity is greater than curAvailalble Qty when Adjustment Type is 'out'
      if (this.stockDetails[i].InOut == 'out') {
        if (this.stockDetails[i].ModQuantity > this.stockDetails[i].curQuantity) {
          this.CheckValidQty = false;
        }
      }
    }
  }
  AssignStockDetails() {
    this.stkUpdate = [];
    var indx = 0;

    for (var j = 0; j < this.stockDetails.length; j++) {
      this.stkUpdate[indx] = new StockModel();
      this.stkUpdate[indx].ItemId = this.stockDetails[j].ItemId;
      this.stkUpdate[indx].StockId = this.stockDetails[j].StockId;
      this.stkUpdate[indx].AvailableQuantity = this.stockDetails[j].ModQuantity;
      this.stkUpdate[indx].curQuantity = this.stockDetails[j].curQuantity;
      this.stkUpdate[indx].StoreId = this.stockDetails[j].StoreId;
      this.stkUpdate[indx].BatchNo = this.stockDetails[j].BatchNo;
      this.stkUpdate[indx].ExpiryDate = this.stockDetails[j].ExpiryDate;
      this.stkUpdate[indx].CostPrice = this.stockDetails[j].CostPrice;
      this.stkUpdate[indx].InOut = this.stockDetails[j].InOut;
      this.stkUpdate[indx].ModQuantity = this.stockDetails[j].ModQuantity;
      this.stkUpdate[indx].IsSelected = this.stockDetails[j].IsSelected;
      indx++;
    }
  }
  UpdateStock() {
    this.CheckValidityOfQty();
    this.AssignStockDetails();
    if (this.CheckValidQty && this.stkUpdate.length > 0) {
      this.stkUpdate = this.stkUpdate.filter(itm => itm.IsSelected == true);
      if (this.stkUpdate.length == 0) {
        this.msgBoxServ.showMessage('Failed', ['Please Check Atleast 1 Item.']);
        return false;
      }
      if (this.stkUpdate.some(itm => itm.InOut == null || itm.InOut == undefined)) {
        this.msgBoxServ.showMessage('Failed', ['Please Check Adjustment Type .']);
        return false;
      }
      if (this.stkUpdate.some(itm => itm.ModQuantity <= 0)) {
        this.msgBoxServ.showMessage('Failed', ['Modified Qty Must Greater Than Zero.']);
        return false;
      }

      this.loading = true;
      this.inventoryBLservice.UpdateStock(this.stkUpdate).finally(() => {
        this.loading = false;
      }).subscribe(
        res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Stock Update Successful."]);
            this.routetoStockList();
          }
          else {
            this.msgBoxServ.showMessage("failed", ["unable to update stock"]);
          }
        },
        err => {
          console.log(err);
        });
    }
    else if (this.CheckValidQty == false) {
      this.msgBoxServ.showMessage("Enter Valid Stock Quantity", ["For Out Adjustment, No Quantity Is Available "]);
    }
    else {
      this.msgBoxServ.showMessage("No Stock Changes!!", ["Please Change Stock Quantity to Update."]);
    }
  }
  //route back to stock list
  routetoStockList() {
    this.router.navigate(['/Inventory/StockMain/StockList']);
  }
  OnCheckBoxChange(i) {
    if (this.stockDetails[i].InOut != null) {
      this.stockDetails[i].IsSelected = true;
      this.selectAllItems = this.stockDetails.every(item => item.IsSelected == true);
    }
  }
  SelectAllChkOnChange(event) {
    const checked = event.target.checked;
    this.stockDetails.forEach(item => item.IsSelected = checked);
    if (!checked)
      this.stockDetails.forEach(item => item.InOut = null);

  }
  SelectItemChkOnChange(item, index) {
    this.selectAllItems = this.stockDetails.every(item => item.IsSelected == true);
    if (this.stockDetails[index].IsSelected == false) {
      this.stockDetails[index].InOut = null;
    }
  }
}
