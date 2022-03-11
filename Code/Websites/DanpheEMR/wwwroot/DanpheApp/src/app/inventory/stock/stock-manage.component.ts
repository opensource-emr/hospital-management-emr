import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { StockModel } from "../shared/stock.model";
import { InventoryService } from '../shared/inventory.service';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from "../../shared/common.functions"
import { SecurityService } from '../../security/shared/security.service';
import { throwToolbarMixedModesError } from '@angular/material';
import * as moment from 'moment';
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
  public zeroStockDetails: Array<any> = null;
  public tempList: Array<any> = [];
  public selected: StockModel = new StockModel();
  public stkUpdate: Array<StockModel> = new Array<StockModel>();
  showNepaliDate: boolean = true;
  showExpiryNepaliDate: boolean = true;
  StoreId: number;

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
            this.stockDetails = res.Results.stockDetails;
            this.zeroStockDetails = res.Results.zeroStockDetails;
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
    //adding to total from tempList 
    for (var j = 0; j < this.tempList.length; j++) {
      curQty = curQty + this.tempList[j].curQuantity;
      modQty = modQty + this.tempList[j].ModQuantity;
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
  //this will check if same batch number is already added or not
  SelectBatchNoFromSearchBox(btchNo, index) {
    let checkIsBatchPresent: boolean = false;
    for (var a = 0; a < this.tempList.length; a++) {
      if (this.tempList[a].BatchNo == btchNo && index != a) {
        checkIsBatchPresent = true;
      }
    }
    //if batch already present in list, it give message and clears the current field
    if (checkIsBatchPresent) {
      this.msgBoxServ.showMessage("notice-message", [btchNo + " is already present in list..Please Check!!"]);
      checkIsBatchPresent = false;
      this.tempList.splice(index, 1);
      this.tempList.push(new StockModel());
    }
    //if no match found, data is filled for current index
    else {
      for (var b = 0; b < this.zeroStockDetails.length; b++) {
        if (this.zeroStockDetails[b].BatchNo == btchNo) {
          this.tempList[index].StockId = this.zeroStockDetails[b].StockId;
          this.tempList[index].ReceivedQty = this.zeroStockDetails[b].ReceivedQty;
          this.tempList[index].curQuantity = this.zeroStockDetails[b].curQuantity;
          this.tempList[index].ModQuantity = this.zeroStockDetails[b].ModQuantity;
          break;
        }
      }
    }
  }
  /*
  this function will perform following operation on  both list
  1st: it will check that Modified Quantity should not be greater than Received Quantity.
  2nd: it will check if current quantity and modified quantity are same then it will remove that data from list.
  */
  ChecknSpliceList() {
    this.CheckValidQty = true;
    for (var i = 0; i < this.stockDetails.length; i++) {
      //checking if modified quantity is less than received quantity 
      if (this.stockDetails[i].ModQuantity > this.stockDetails[i].ReceivedQty) {
        this.CheckValidQty = false;
      }
      //removing stock item which has no-change between current Qty and modified Qty
      //keep this if loop at bottom of for loop coz it will splice the list and decrease i by 1
      if (this.stockDetails[i].curQuantity == this.stockDetails[i].ModQuantity) {
        this.stockDetails.splice(i, 1);
        i--;
      }
    }
    for (var i = 0; i < this.tempList.length; i++) {
      //checking if modified quantity is less than received quantity 
      if (this.tempList[i].ModQuantity > this.tempList[i].ReceivedQty) {
        this.CheckValidQty = false;
      }
      //removing stock item which has no-change between current Qty and modified Qty
      //keep this if loop at bottom of for loop coz it will splice the list and decrease i by 1
      if (this.tempList[i].curQuantity == this.tempList[i].ModQuantity) {
        this.tempList.splice(i, 1);
        i--;
      }
    }
  }
  //merging two list to one for passing in udpate function
  MergeList() {
    this.stkUpdate = [];
    var indx = 0;
    for (var j = 0; j < this.stockDetails.length; j++) {
      this.stkUpdate[indx] = new StockModel();
      this.stkUpdate[indx].StockId = this.stockDetails[j].StockId;
      this.stkUpdate[indx].AvailableQuantity = this.stockDetails[j].ModQuantity;
      this.stkUpdate[indx].curQuantity = this.stockDetails[j].curQuantity;
      indx++;
    }
    for (var j = 0; j < this.tempList.length; j++) {
      this.stkUpdate[indx] = new StockModel();
      this.stkUpdate[indx].StockId = this.tempList[j].StockId;
      this.stkUpdate[indx].AvailableQuantity = this.tempList[j].ModQuantity;
      indx++;
    }
  }
  UpdateStock() {
    this.ChecknSpliceList();
    this.MergeList();
    if (this.CheckValidQty && this.stkUpdate.length > 0) {
      this.inventoryBLservice.UpdateStock(this.stkUpdate)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ["Stock Update Successful."]);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["unable to update stock"]);
            }
          },
          err => {
            console.log(err);
          });
      this.routetoStockList();
    }
    else if (this.CheckValidQty == false) {
      this.msgBoxServ.showMessage("Enter Valid Stock Quantity", ["Modified Stock Quantity is greater than Received Quantity!!"]);
    }
    else {
      this.msgBoxServ.showMessage("No Stock Changes!!", ["Please Change Stock Quantity to Update."]);
      this.routetoStockList();
    }
  }
  //route back to stock list
  routetoStockList() {
    this.router.navigate(['/Inventory/StockMain/StockList']);
  }
}
