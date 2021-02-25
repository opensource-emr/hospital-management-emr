import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { RouteFromService } from "../../shared/routefrom.service"
import { Router } from '@angular/router';

import { PurchaseOrder } from "../shared/purchase-order.model"
import { PurchaseOrderItems } from "../shared/purchase-order-items.model"
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model"
import { GoodsReceipt } from "../shared/goods-receipt.model"

import { InventoryBLService } from "../shared/inventory.bl.service"
import { InventoryService } from '../shared/inventory.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import * as moment from 'moment/moment';

@Component({

  templateUrl: "../../view/inventory-view/GoodsReceiptItems.html"  //"/InventoryView/GoodsReceiptItems"

})
export class GoodsReceiptItemComponent {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  public goodsReceiptItem: GoodsReceiptItems = new GoodsReceiptItems();
  public model: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();

  public purchaseOrder: PurchaseOrder = new PurchaseOrder();
  public POForStatusUpdate: PurchaseOrder = new PurchaseOrder();
  public purchaseOrderId: number = 0;
  public vendorName: string = "";
  public disableButton: boolean = false;
  public disableTextBox: boolean = false;
  loading: boolean = false;

  constructor(public routeFrom: RouteFromService,
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public router: Router) {
    //this.Load(this.routeFrom.RouteFrom);
    this.Load(this.inventoryService.POId);//sud:3Mar'20-Property Rename in InventoryService
    this.disableTextBox = true;
    this.disableButton = true;
    this.goodsReceipt.GoodsReceiptDate = moment().format('YYYY-MM-DD');
  }

  //get all PO,POItems, vendor and Item data against PurchaseOrderId for Goods Receipt
  Load(purchaseOrderId: number) {
    if(purchaseOrderId > 0){
      this.InventoryBLService.GetPurchaseOrderItemsByPOId(Number(purchaseOrderId))
      .subscribe(res => this.LoadPurchaseItemsForGoodsReceipt(res));
    }
  }
  //Load Purchase Order Items as Goods Receipt Items
  LoadPurchaseItemsForGoodsReceipt(res) {
    this.purchaseOrder = res.Results;
    this.purchaseOrderId = this.purchaseOrder[0].PurchaseOrderId;
    this.vendorName = this.purchaseOrder[0].Vendor.VendorName;
    this.goodsReceipt.VendorId = this.purchaseOrder[0].VendorId;
    this.goodsReceipt.PurchaseOrderId = this.purchaseOrder[0].PurchaseOrderId;
    this.GetGrItemsFromPoItems();
  }

  //Metho  for transform POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.purchaseOrder[0].PurchaseOrderItems.length; i++) {
      var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
      currGRItem.ItemId = this.purchaseOrder[0].PurchaseOrderItems[i].ItemId;
      currGRItem.ExpiryDate = moment().format('YYYY-MM-DD');
      currGRItem.ItemName = this.purchaseOrder[0].PurchaseOrderItems[i].Item.ItemName;
      currGRItem.VAT = this.purchaseOrder[0].PurchaseOrderItems[i].Item.VAT;
      currGRItem.ItemRate = this.purchaseOrder[0].PurchaseOrderItems[i].StandardRate;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      if (this.purchaseOrder[0].PurchaseOrderItems[i].PendingQuantity == 0) {
        currGRItem.PendingQuantity = this.purchaseOrder[0].PurchaseOrderItems[i].Quantity;

      } else {
        currGRItem.PendingQuantity = this.purchaseOrder[0].PurchaseOrderItems[i].PendingQuantity;
      }

      this.model.push(currGRItem);

    }
  }

  // Calculation for Goods Receipt Item
  CalculationForGoodsReceiptItem(row: GoodsReceiptItems, index) {

    if (this.model[index].SubTotal != null
      && this.model[index].ReceivedQuantity != null
      && this.model[index].FreeQuantity != null
      && this.model[index].ItemRate != null) {
      this.model[index].SubTotal = (row.ReceivedQuantity - row.FreeQuantity) * row.ItemRate;
      this.model[index].VATAmount = (row.VAT * this.model[index].SubTotal) / 100;
      this.model[index].TotalAmount = this.model[index].SubTotal + this.model[index].VATAmount;
      this.model[index].ItemRate = this.model[index].ItemRate;
      //this.goodsReceipt;

      this.CaculationForGoodsReceipt();
    }
  }

  CaculationForGoodsReceipt() {
    let STotal: number = 0;

    let TAmount: number = 0;

    for (var i = 0; i < this.model.length; i++) {
      if (this.model[i].SubTotal! != null
        && this.model[i].TotalAmount != null) {
        STotal = STotal + this.model[i].SubTotal;
        TAmount = TAmount + this.model[i].TotalAmount;
      }
    }
    this.goodsReceipt.SubTotal = STotal;
    this.goodsReceipt.TotalAmount = TAmount;
    this.goodsReceipt.VATTotal = this.goodsReceipt.TotalAmount - this.goodsReceipt.SubTotal;
  }

  //Save data to database
  SaveGoodsReceipt() {


    if (this.model != null) {
      let CheckIsValid = true;
      // for loop is used to show GoodsReceiptValidator message ..if required  field is not filled
      for (var a in this.goodsReceipt.GoodsReceiptValidator.controls) {
        this.goodsReceipt.GoodsReceiptValidator.controls[a].markAsDirty();
        this.goodsReceipt.GoodsReceiptValidator.controls[a].updateValueAndValidity();
        if (this.goodsReceipt.IsValidCheck(undefined, undefined) == false) { CheckIsValid = false }
      }
      //Nagesh- On 16-Jun-2017 If Below 'X' one Validaiton checking working then remove It
      // for loop 'N'
      for (var b in this.goodsReceiptItem.GoodsReceiptItemValidator.controls) {
        this.goodsReceiptItem.GoodsReceiptItemValidator.controls[b].markAsDirty();
        this.goodsReceiptItem.GoodsReceiptItemValidator.controls[b].updateValueAndValidity();
      }
      this.goodsReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      //Nagesh:- on 16-Jun-2017 CreatedBy assigned above check It's working and then remove it
      //for (var i = 0; i < this.model.length; i++) {
      //    this.model[i].CreatedBy = this.securityService.getLoggedInUser().EmployeeId;
      //}

      //for loop 'X' If it's working then remove 'N' above
      for (var i = 0; i < this.model.length; i++) {
        for (var x in this.model[i].GoodsReceiptItemValidator.controls) {
          this.model[i].GoodsReceiptItemValidator.controls[x].markAsDirty();
          this.model[i].GoodsReceiptItemValidator.controls[x].updateValueAndValidity();
        }

        if (this.model[i].IsValidCheck(undefined, undefined) == false) { CheckIsValid = false; }
      }
      if (CheckIsValid) {
        for (let k = 0; k < this.model.length; k++) {
          this.goodsReceipt.GoodsReceiptItem[k] = this.model[k];
        }
        for (let index = 0; index < this.goodsReceipt.GoodsReceiptItem.length; index++) {
          if (this.goodsReceipt.GoodsReceiptItem[index].ReceivedQuantity == 0) {
            this.goodsReceipt.GoodsReceiptItem.splice(index, 1);
            index--;
          }
        }
        if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
          this.loading = true;
          this.InventoryBLService.PostToGoodsReceipt(this.goodsReceipt)
            .subscribe(
              res => {
                this.CallBackAddGoodsReceipt(res),
                  this.loading = false;
              },
              err => {
                this.loading = false,
                  this.logError(err);
              });
        }
        else {
          this.messageBoxService.showMessage("notice-message", ['Please fill received quantity']);
        }
      }
      else {
        this.messageBoxService.showMessage("notice-message", ['Please Enter valid quantity']);
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
    }
  }

  //call after Goods Receipt saved
  CallBackAddGoodsReceipt(res) {
    if (res.Status == "OK") {
      this.messageBoxService.showMessage("success", ["Goods Receipt is Generated and Saved."]);
      this.ChangePOAndPOItemsStatus();

    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
        this.logError(err.ErrorMessage);
      }
    }
  }
  //After Goods Receipt Generation Set status of Each PO Item and also PO
  ChangePOAndPOItemsStatus() {

    //Set the Received and Pending Quantity for Each Purchaser Order Item
    for (var i = 0; i < this.purchaseOrder[0].PurchaseOrderItems.length; i++) {

      this.purchaseOrder[0].PurchaseOrderItems[i].ReceivedQuantity = (this.model[i].ReceivedQuantity - this.model[i].FreeQuantity) + this.purchaseOrder[0].PurchaseOrderItems[i].ReceivedQuantity;
      let pending = this.purchaseOrder[0].PurchaseOrderItems[i].Quantity - this.purchaseOrder[0].PurchaseOrderItems[i].ReceivedQuantity;

      if (pending > 0) {
        this.purchaseOrder[0].PurchaseOrderItems[i].PendingQuantity = pending;
      }
      else {
        this.purchaseOrder[0].PurchaseOrderItems[i].PendingQuantity = 0;
      }

    }
    let POStatus = true;
    //Update Status of Every Purchase Order Item related this Purchase Order or Goods Receipt
    for (var i = 0; i < this.purchaseOrder[0].PurchaseOrderItems.length; i++) {
      if (this.purchaseOrder[0].PurchaseOrderItems[i].ReceivedQuantity > 0 && this.purchaseOrder[0].PurchaseOrderItems[i].PendingQuantity == 0) {
        this.purchaseOrder[0].PurchaseOrderItems[i].POItemStatus = 'complete';
      }
      else {
        this.purchaseOrder[0].PurchaseOrderItems[i].POItemStatus = 'partial';
        POStatus = false;
      }


    }
    //Update Purchase Order Status
    if (POStatus) {
      this.purchaseOrder[0].POStatus = 'complete';
    }

    this.POForStatusUpdate = this.purchaseOrder[0];
    this.POForStatusUpdate.Vendor = null;
    this.InventoryBLService.UpdatePOAndPOItemStatus(this.POForStatusUpdate).
      subscribe(res => {
        if (res.Status == 'OK') {
          //this function for navigate to POList page
          this.CallRoute();
        }
        else {
          err => {
            this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
            this.logError(err.ErrorMessage);
          }
        }
      });


  }
  logError(err: any) {
    console.log(err);
  }
  //Cancel Goods receipt and  navigate to Purchase Order List page
  Cancel() {
    this.goodsReceipt = new GoodsReceipt();
    this.purchaseOrder = new PurchaseOrder();
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderList']);
  }

  //Navigate ro Purchase Order List 
  CallRoute() {
    this.router.navigate(['/Inventory/ProcurementMain/PurchaseOrderList']);
  }

}



