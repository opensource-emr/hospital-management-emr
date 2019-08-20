import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { GoodsReceipt } from "../shared/goods-receipt.model"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { GoodReceiptService } from "../shared/good-receipt/good-receipt.service";
import { GoodsReceiptItems } from "../shared/goods-receipt-item.model";
import { RouteFromService } from "../../shared/routefrom.service";
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { ItemMaster } from "../shared/item-master.model";
import { InventoryService } from "../shared/inventory.service";
import { VendorMaster } from "../shared/vendor-master.model";
import { toArray } from "rxjs/operator/toArray";
import { CommonFunctions } from "../../shared/common.functions";
import { PHRMGoodsReceiptModel } from "../../pharmacy/shared/phrm-goods-receipt.model";
@Component({
  templateUrl: "./goods-receipt-add.html",
})
export class GoodsReceiptAddComponent implements OnInit {

  public goodsReceipt: GoodsReceipt = new GoodsReceipt();
  //public model: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();
  public purchaseOrderId: number = 0;
  public VendorName: string = "";
  public disableButton: boolean = false;
  public disableTextBox: boolean = false;
  loading: boolean = false;
  public ItemList: any[];
  public VendorList: any[];
  public receivedqty: number;
  public rowCount: number = 0;
  public SelectedVendor: VendorMaster = new VendorMaster();
  public checkIsItemPresent: boolean = false;
  public index: number = 0;
  public showAddItemPopUp: boolean = false;
  public showAddVendorPopUp: boolean = false;
  public purchaseOrder: any;
  public isGrFromPOMode: boolean = false;
  public TDSApplicable: boolean = false;
  public editGR: boolean = false;

  constructor(public routeFrom: RouteFromService,
    public goodReceiptService: GoodReceiptService,
    public securityService: SecurityService,
    public inventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public changeDetectorRef: ChangeDetectorRef,
    public messageBoxService: MessageboxService,
    public router: Router) {

    this.disableTextBox = true;
    this.disableButton = true;
  }
  ngOnInit() {
    this.goodsReceipt.GoodsReceiptDate = moment().format('YYYY-MM-DD');
    this.LoadItemList();
    this.LoadVendorList();
    if (this.inventoryService.POId > 0) {
      this.LoadPo(this.inventoryService.POId);
      this.isGrFromPOMode = true;
      this.inventoryService.POId = 0;
    }
    else if (this.inventoryService.Id > 0) {
      this.LoadGoodsReceiptDetails(this.inventoryService.Id);
      this.editGR = true;
      this.isGrFromPOMode = true;
      this.inventoryService.Id = 0;
    }
    else {
      this.goodsReceipt.GoodsReceiptItem.push(new GoodsReceiptItems());
      this.isGrFromPOMode = false;
      this.editGR = false;
    }
    this.goodsReceipt.PaymentMode = "Credit";
  }
  LoadGoodsReceiptDetails(id: number) {

    if (id != null) {
      //this.goodsreceiptID = id;
      this.inventoryBLService.GetGRItemsByGRId(id)
        .subscribe(res => this.ShowGoodsReceiptDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select GoodsReceipt for Details.']);
      this.goodsreceiptList();
    }
  }

  ShowGoodsReceiptDetails(res) {
    if (res.Status == "OK") {
      //for the edit options
      //to add the good receipt details 

      var goodsReceiptDetail: GoodsReceipt = res.Results.grDetails[0];
      goodsReceiptDetail.SelectedItem = this.VendorList.filter(s => s.VendorName == goodsReceiptDetail.VendorName)[0];
      this.goodsReceipt = Object.assign(this.goodsReceipt, goodsReceiptDetail);
      this.SelectedVendor = this.goodsReceipt.SelectedItem;
      this.VendorName = this.SelectedVendor.VendorName;


      //to add the goods receipt item since the validators are not passed from the controller
      var goodsReceiptItems: Array<any> = res.Results.grItems;
      this.changeDetectorRef.detectChanges();
      for (let i = 0; i < goodsReceiptItems.length; i++) {
        this.changeDetectorRef.detectChanges();
        var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
        currGRItem.ItemName = goodsReceiptItems[i].ItemName;
        currGRItem.BatchNO = goodsReceiptItems[i].BatchNo;
        currGRItem.ReceivedQuantity = goodsReceiptItems[i].ReveivedQuantity;
        currGRItem.ExpiryDate = goodsReceiptItems[i].ExpiryDate;
        currGRItem.FreeQuantity = goodsReceiptItems[i].FreeQuantity;
        currGRItem.ItemRate = goodsReceiptItems[i].GRItemRate;
        currGRItem.VATAmount = goodsReceiptItems[i].VATAmount;
        currGRItem.CcAmount = goodsReceiptItems[i].CcAmount;
        currGRItem.DiscountAmount = goodsReceiptItems[i].DiscountAmount;
        currGRItem.TotalAmount = goodsReceiptItems[i].ItemTotalAmount;
        currGRItem.OtherCharge = goodsReceiptItems[i].OtherCharge;
        currGRItem.GoodsReceiptItemId = goodsReceiptItems[i].GoodsReceiptItemId;
        currGRItem.GoodsReceiptId = goodsReceiptItems[i].GoodsReceiptId;
        currGRItem.SelectedItem = this.ItemList.find(i => i.ItemName == currGRItem.ItemName);

        this.goodsReceipt.GoodsReceiptItem.push(currGRItem);
        
      }


      if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
        this.goodsReceipt.GoodsReceiptItem.forEach(itm => {
          if (itm.ExpiryDate != null)
            itm.ExpiryDate = moment(itm.ExpiryDate).format('DD-MM-YYYY');
        });
        this.goodsReceipt.GoodsReceiptDate = moment(this.goodsReceipt.GoodsReceiptDate).format('YYYY-MM-DD');
        this.goodsReceipt.ReceivedDate = moment(this.goodsReceipt.ReceivedDate).format('YYYY-MM-DD');
        
        this.changeDetectorRef.detectChanges();

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected GoodsReceipt is without Items"]);
        this.goodsreceiptList();
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no GoodsReceipt details !"]);
      this.goodsreceiptList();
    }
  }
  //route to goods receipt list page
  goodsreceiptList() {
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptList']);
  }
  //for cancel button
  Cancel() {
    this.TDSApplicable = false;
    this.inventoryService.Id = 0;
    this.inventoryService.POId = 0;
    this.isGrFromPOMode = false;
    this.editGR = false;
    this.goodsreceiptList();
  }
  //get all PO,POItems, vendor and Item data against PurchaseOrderId for Goods Receipt
  LoadPo(purchaseOrderId: number) {
    this.inventoryBLService.GetPurchaseOrderItemsByPOId(Number(purchaseOrderId))
      .subscribe(res => this.LoadPurchaseItemsForGoodsReceipt(res));
  }
  //Load Purchase Order Items as Goods Receipt Items
  LoadPurchaseItemsForGoodsReceipt(res) {
    this.purchaseOrder = res.Results;
    this.changeDetectorRef.detectChanges();
    this.purchaseOrderId = this.purchaseOrder.PurchaseOrderId;
    this.VendorName = this.purchaseOrder.Vendor.VendorName;
    this.TDSApplicable = this.purchaseOrder.Vendor.IsTDSApplicable;
    this.goodsReceipt.VendorId = this.purchaseOrder.VendorId;
    this.goodsReceipt.PurchaseOrderId = this.purchaseOrder.PurchaseOrderId;

    this.goodsReceipt.SelectedItem = this.VendorList.filter(s => s.VendorId == this.goodsReceipt.VendorId)[0];
    this.SelectedVendor = this.goodsReceipt.SelectedItem;
    this.GetGrItemsFromPoItems();
  }
  //Metho  for transform POItems to GRItems
  GetGrItemsFromPoItems() {
    for (var i = 0; i < this.purchaseOrder.PurchaseOrderItems.length; i++) {
      this.changeDetectorRef.detectChanges();
      var currGRItem: GoodsReceiptItems = new GoodsReceiptItems();
      currGRItem.ItemId = this.purchaseOrder.PurchaseOrderItems[i].ItemId;
      currGRItem.ItemName = this.purchaseOrder.PurchaseOrderItems[i].Item.ItemName;
      currGRItem.VAT = this.purchaseOrder.PurchaseOrderItems[i].Item.VAT;
      currGRItem.ItemRate = this.purchaseOrder.PurchaseOrderItems[i].StandardRate;
      currGRItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      currGRItem.Quantity = this.purchaseOrder.PurchaseOrderItems[i].Quantity;
      currGRItem.SelectedItem = this.ItemList.filter(i => i.ItemId == currGRItem.ItemId)[0];

      this.goodsReceipt.GoodsReceiptItem.push(currGRItem);

    }
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["ItemName"];
    return html;
  }

  //used to format display vendro in ng-autocomplete
  myVendorListFormatter(data: any): string {
    let html = data["VendorName"];
    return html;
  }


  LoadItemList(): void {
    this.inventoryBLService.GetItemList()
      .subscribe(
        res =>
          this.CallBackGetItemList(res));
  }

  LoadVendorList(): void {
    this.goodReceiptService.GetVendorList()
      .subscribe(
        res => this.VendorList = res.Results
      );
  }

  CallBackGetItemList(res) {
    if (res.Status == 'OK') {
      this.ItemList = [];
      if (res && res.Results) {
        res.Results.forEach(a => {
          this.ItemList.push({
            "ItemId": a.ItemId, "ItemName": a.ItemName, StandardRate: a.StandardRate, VAT: a.VAT
          });
        });
      }
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
      }
    }
  }

  SelectItemFromSearchBox(Item: ItemMaster, index) {
    //if proper item is selected then the below code runs ..othewise it goes out side the function
    //if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
    //    //this for loop with if conditon is to check whether the  item is already present in the array or not 
    //    //means to avoid duplication of item
    //    for (var i = 0; i < this.goodsReceipt.GoodsReceiptItem.length; i++) {
    //        if (this.goodsReceipt.GoodsReceiptItem[i].ItemId == Item.ItemId) {
    //            this.checkIsItemPresent = true;

    //        }
    //    }
    //    //id item is present the it show alert otherwise it assign the value
    //    if (this.checkIsItemPresent == true) {
    //        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already added.Please Check!!!"]);
    //        this.checkIsItemPresent = false;
    //        this.changeDetectorRef.detectChanges();
    //        this.goodsReceipt.GoodsReceiptItem.splice(index, 1);
    //        //this.goodsReceiptItem = new GoodsReceiptItems();
    //        //this.goodsReceiptItem.ReceivedQuantity = 1;
    //        this.goodsReceipt.GoodsReceiptItem.push(new GoodsReceiptItems());

    //    } else {
    //        this.goodsReceipt.GoodsReceiptItem[i].ItemId = Item.ItemId
    //    }

    //}

    this.goodsReceipt.GoodsReceiptItem[index].ItemId = Item.ItemId

  }

  SelectVendorFromSearchBox(Vendor: VendorMaster) {
    this.goodsReceipt.VendorId = Vendor.VendorId;
    this.goodsReceipt.VendorName = Vendor.VendorName;
    this.goodsReceipt.CreditPeriod = Vendor.CreditPeriod;
    this.TDSApplicable = Vendor.IsTDSApplicable;
  }

  Calculations() {
    this.goodsReceipt.VATTotal = 0;
    this.goodsReceipt.SubTotal = 0;
    this.goodsReceipt.TDSAmount = 0;
    this.goodsReceipt.TotalAmount = 0;
    this.goodsReceipt.TotalWithTDS = 0;
    this.goodsReceipt.CcCharge = 0;
    this.goodsReceipt.Discount = 0;
    this.goodsReceipt.DiscountAmount = 0;
    this.goodsReceipt.GoodsReceiptItem.forEach(item => {

      let qty = item.ReceivedQuantity;

      let itemRate = item.ItemRate;
      let subtotal = qty * itemRate;

      let Discount = item.Discount / 100;
      let DiscountAmount = CommonFunctions.parseAmount(Discount * subtotal);

      item.DiscountAmount = DiscountAmount;

      let totalAmount = subtotal - DiscountAmount;

      if (this.TDSApplicable) {
        let totalwithTDS = subtotal - DiscountAmount;
        let TDSAmount = CommonFunctions.parseAmount(totalAmount * (this.goodsReceipt.TDSRate / 100));
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS - TDSAmount);

        let Vat1 = item.VAT / 100;
        let vatAmount1 = CommonFunctions.parseAmount(totalwithTDS * Vat1);
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS + vatAmount1);

        this.goodsReceipt.TotalWithTDS += totalwithTDS;
        this.goodsReceipt.TDSAmount += TDSAmount;
      }

      let CcCharge = item.CcCharge / 100;
      let CcAmount = CommonFunctions.parseAmount(totalAmount * CcCharge);

      item.CcAmount = CcAmount;

      totalAmount = totalAmount + CcAmount;

      let Vat = item.VAT / 100;
      let vatAmount = CommonFunctions.parseAmount(totalAmount * Vat);

      item.VATAmount = vatAmount;

      item.SubTotal = subtotal;

      totalAmount = CommonFunctions.parseAmount(totalAmount + vatAmount);


      item.TotalAmount = totalAmount;

      this.goodsReceipt.VATTotal += vatAmount;
      this.goodsReceipt.CcCharge += CcAmount;
      this.goodsReceipt.SubTotal += subtotal;
      this.goodsReceipt.DiscountAmount += DiscountAmount;
      this.goodsReceipt.TotalAmount += totalAmount;
    });
    this.goodsReceipt.OtherCharges = this.goodsReceipt.InsuranceCharge + this.goodsReceipt.CarriageFreightCharge + this.goodsReceipt.PackingCharge + this.goodsReceipt.TransportCourierCharge + this.goodsReceipt.OtherCharge;
    this.goodsReceipt.TotalAmount += this.goodsReceipt.OtherCharges;
  }

  //add a new row 
  AddRowRequest() {
    var goodItem = new GoodsReceiptItems();
    this.goodsReceipt.GoodsReceiptItem.push(goodItem);
  }

  //to delete the row
  DeleteRow(index) {
    //to stop rowCount value going negative
    if (this.rowCount > 0) {
      this.rowCount--;
    }

    //this will remove the data from the array
    this.goodsReceipt.GoodsReceiptItem.splice(index, 1);

    if (index == 0) {
      this.goodsReceipt.GoodsReceiptItem.push(new GoodsReceiptItems());

      //this.Calculationforall(this.BillingTransactionItems[index]);
      this.Calculations();
      this.changeDetectorRef.detectChanges();

    }
    else {
      this.Calculations();
      this.changeDetectorRef.detectChanges();
    }
  }

  //CalculationForGR() {
  //  this.goodsReceipt.SubTotal = 0;
  //  this.goodsReceipt.VATTotal = 0;
  //  this.goodsReceipt.TotalAmount = 0;

  //  for (var i = 0; i < this.goodsReceipt.GoodsReceiptItem.length; i++) {
  //    //this.goodsReceipt.SubTotal = this.goodsReceipt.SubTotal + (this.goodsReceipt.GoodsReceiptItem[i].)
  //    let qty = this.goodsReceipt.GoodsReceiptItem[i].ReceivedQuantity;
  //    let price = this.goodsReceipt.GoodsReceiptItem[i].ItemRate;
  //    let vat = this.goodsReceipt.GoodsReceiptItem[i].VAT / 100;
  //    this.goodsReceipt.GoodsReceiptItem[i].TotalAmount = (qty * price) + vat;
  //    //this.goodsReceipt.VATTotal = (Math.round(this.goodsReceipt.VATTotal + this.goodsReceipt.GoodsReceiptItem[i].VATAmount));
  //    this.goodsReceipt.TotalAmount = (Math.round((this.goodsReceipt.TotalAmount + this.goodsReceipt.GoodsReceiptItem[i].TotalAmount) * 100) / 100);
  //  }

  //}

  //Save data to database
  SaveGoodsReceipt() {
    if (this.editGR) { this.isGrFromPOMode = false };
    if (this.goodsReceipt != null) {

      let CheckIsValid = true;
      for (var a in this.goodsReceipt.GoodsReceiptValidator.controls) {
        this.goodsReceipt.GoodsReceiptValidator.controls[a].markAsDirty();
        this.goodsReceipt.GoodsReceiptValidator.controls[a].updateValueAndValidity();
      }
      if (this.goodsReceipt.IsValidCheck(undefined, undefined) == false) { CheckIsValid = false }
      this.goodsReceipt.GoodsReceiptItem.forEach(item => {
        item.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        for (var b in item.GoodsReceiptItemValidator.controls) {
          item.GoodsReceiptItemValidator.controls[b].markAsDirty();
          item.GoodsReceiptItemValidator.controls[b].updateValueAndValidity();
        }
        if (item.IsValidCheck(undefined, undefined) == false) { CheckIsValid = false }
      });

      this.goodsReceipt.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      if (CheckIsValid) {

        for (let index = 0; index < this.goodsReceipt.GoodsReceiptItem.length; index++) {
          if (this.goodsReceipt.GoodsReceiptItem[index].ReceivedQuantity == 0) {
            this.goodsReceipt.GoodsReceiptItem.splice(index, 1);
            index--;
          }
        }
        this.goodsReceipt.GoodsReceiptItem.forEach(item => {
          item.OtherCharge = (item.TotalAmount * this.goodsReceipt.OtherCharges) / (this.goodsReceipt.SubTotal);
        });
        if (this.goodsReceipt.GoodsReceiptItem.length > 0) {
          this.loading = true;
          if (this.editGR) {
            this.UpdateGoodsReceipt();
          }
          else {
            this.goodReceiptService.AddGoodReceipt(this.goodsReceipt)
              .subscribe(
                res => {
                  if (res.Status == 'OK') {
                    //this function for navigate to POList page
                    this.RouteToViewDetails(res.Results);
                  }
                  else {
                    this.loading = false;
                    this.messageBoxService.showMessage("failed", ["failed to add result.. please check log for details."]);
                  }
                });
          }
        }
        else {
          this.messageBoxService.showMessage("notice-message", ['Please fill received quantity']);
        }
      }
      else {
        this.messageBoxService.showMessage("error-message", ['Please enter all the required field']);
      }
    }
    else {
      this.messageBoxService.showMessage("notice-message", ["Add Item ...Before Requesting"]);
    }
  }
  UpdateGoodsReceipt() {
    this.goodsReceipt.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    this.goodsReceipt.ModifiedOn = new Date();
    this.goodsReceipt.GoodsReceiptItem.map(a => {
      a.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      a.ModifiedOn = new Date();
    });
    this.goodReceiptService.UpdateGoodReceipt(this.goodsReceipt)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.editGR = false;
          this.inventoryService.Id = 0;
          this.messageBoxService.showMessage("success", ["Good Receipt has been saved."]);
          this.goodsreceiptList();
        }
      });
  }

  RouteToViewDetails(id) {
    this.inventoryService.Id = id;
    this.inventoryService.POId = null;
    this.isGrFromPOMode = false;
    this.router.navigate(['/Inventory/ProcurementMain/GoodsReceiptDetails']);
  }
  //for item add popup
  AddItemPopUp(i) {
    this.showAddItemPopUp = false;
    this.index = i;
    this.changeDetectorRef.detectChanges();
    this.showAddItemPopUp = true;
  }
  //post item add function
  OnNewItemAdded($event) {
    this.showAddItemPopUp = false;
    var item = $event.item;
    this.ItemList.push({
      "ItemId": item.ItemId, "ItemName": item.ItemName, StandardRate: item.StandardRate, VAT: item.VAT
    });
    let currentGRItem = new GoodsReceiptItems();
    currentGRItem.ReceivedQuantity = 1;
    this.goodsReceipt.GoodsReceiptItem.splice(this.index, 1, currentGRItem);
    this.goodsReceipt.GoodsReceiptItem[this.index].ItemId = item.ItemId;
    this.goodsReceipt.GoodsReceiptItem[this.index].ItemName = item.ItemName;
  }
  //for supplier add popup
  AddSupplierPopUp() {
    this.showAddVendorPopUp = false;
    this.changeDetectorRef.detectChanges();
    this.showAddVendorPopUp = true;
  }
  OnNewSupplierAdded($event) {
    this.showAddVendorPopUp = false;
    var supplier = $event.vendor;
    this.VendorList.push(supplier);
    this.VendorList.slice();
  }
}



