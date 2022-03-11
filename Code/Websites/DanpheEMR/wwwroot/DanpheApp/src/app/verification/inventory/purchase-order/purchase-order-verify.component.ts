import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { SecurityService } from "../../../security/shared/security.service";
import { VerificationActor } from '../requisition-details/inventory-requisition-details.component';
import { PurchaseOrder } from '../../../inventory/shared/purchase-order.model';
import { PurchaseOrderItems } from '../../../inventory/shared/purchase-order-items.model';

@Component({
  templateUrl: './purchase-order-verify.html'
})
export class PurchaseOrderVerifyComponent implements OnInit, OnDestroy {

  public PurchaseOrder: PurchaseOrder;
  public PurchaseOrderVM: InventoryPurchaseOrderVM;
  public VerificationRemarks: string = "";
  public isVerificationAllowed: boolean = false;
  public loading: boolean = false;
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public nextVerifiersPermission: string = "";
  public CopyOfOrderedItemsQuantity: Array<{ OrderedItemId; Quantity; }> = [];
  public CopyOfOrderedItemsStandardRate: Array<{ OrderedItemId; StandardRate; }> = [];
  public CopyOfOrderedItemsPOItemSpecification: Array<{ OrderedItemId; POItemSpecification; }> = [];
  showQuotationRatesPopUp: boolean;
  PoUplodadedViewFiles: boolean;
  // PurchaseOrderId: number;
  constructor(
    public verificationService: VerificationService,
    public verificationBLService: VerificationBLService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef
  ) { this.GetInventoryBillingHeaderParameter(); }

  ngOnDestroy(): void {
    this.verificationService.PurchaseOrder = new PurchaseOrder();
    this.routeFromService.RouteFrom = "";
  }

  ngOnInit() {
    this.PurchaseOrder = this.verificationService.PurchaseOrder;
    this.CheckForVerificationApplicable(); //even if this is false, we must show the details, but features like edit,cancel will not be available.
    this.GetInventoryPurchaseOrderDetails();
  }
  private GetInventoryPurchaseOrderDetails() {
    this.verificationBLService
      .GetInventoryPurchaseOrderDetails(this.PurchaseOrder.PurchaseOrderId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PurchaseOrderVM = res.Results;
          this.CopyOrderedItemsQuantity();
        }
        else {
          this.messageBoxService.showMessage("Failed", [
            "Something went wrong.",
            "Loading PO Failed."
          ]);
        }
      });
  }

  private CopyOrderedItemsQuantity() {
    this.PurchaseOrderVM.OrderedItemList.forEach(item => {
      var CopyItem = { OrderedItemId: item.PurchaseOrderItemId, Quantity: item.Quantity };
      this.CopyOfOrderedItemsQuantity.push(CopyItem);
    });
  }
  private CheckForVerificationApplicable() {
    if (this.PurchaseOrder.IsVerificationAllowed == true && this.PurchaseOrder.POStatus == "pending") {
      this.isVerificationAllowed = true;
    }
    else if (this.PurchaseOrder.IsVerificationAllowed == false && this.PurchaseOrder.POStatus == "pending") {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["You have verified this Order already."])
    }
    else {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["Verifying this Order is not allowed."]);
    }
  }
  EditItem(index) {
    if (this.isVerificationAllowed == true) {
      if (this.PurchaseOrderVM.OrderedItemList[index].IsEdited == true) {
        this.PurchaseOrderVM.OrderedItemList[index].IsEdited = false;
        this.PurchaseOrderVM.OrderedItemList[index].Quantity = this.CopyOfOrderedItemsQuantity[index].Quantity;
      } else {
        this.PurchaseOrderVM.OrderedItemList[index].IsEdited = true;
        var timer = setTimeout(() => {
          this.changeDetector.detectChanges();
          var element = document.getElementById("rqRowEditQty" + index);
          if (element != null) {
            element.click();
            clearInterval(timer);
          }
        }, 500);
      }
    } else {
      this.messageBoxService.showMessage("Failed", ["Editing this PO is forbidden."])
    }
  }
  CancelItem(index) {
    if (this.isVerificationAllowed == true) {
      if (this.PurchaseOrderVM.OrderedItemList[index].IsActive == true) {
        if (this.CheckForCancelItemsCondition()) {
          this.PurchaseOrderVM.OrderedItemList[index].POItemStatus = "cancelled";
          this.PurchaseOrderVM.OrderedItemList[index].IsActive = false;
          this.PurchaseOrderVM.OrderedItemList[index].IsEdited = false;
        }
        else {
          this.messageBoxService.showMessage("Failed", ["You can not cancel the last item. Use Reject All instead."])
        }
      }
      else if (this.PurchaseOrderVM.OrderedItemList[index].CancelledBy != null) {
        this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
      }
      else {
        this.PurchaseOrderVM.OrderedItemList[index].POItemStatus = "active";
        this.PurchaseOrderVM.OrderedItemList[index].IsActive = true;
      }
    } else {
      this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
    }
  }
  CheckForCancelItemsCondition(): boolean {
    var lengthOfActiveItems = this.PurchaseOrderVM.OrderedItemList.filter(RI => RI.IsActive == true).length;
    if (lengthOfActiveItems > 1) {
      return true;
    }
    else {
      return false;
    }
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == "Inventory Receipt Header").ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for BillingHeader"
      ]);
  }

  RouteBack() {
    this.router.navigate([this.routeFromService.RouteFrom]);
  }
  ApprovePurchaseOrder() {
    if (this.CheckForValidItemQuantity()) {
      this.loading = true;
      this.PurchaseOrder.PurchaseOrderItems = this.PurchaseOrderVM.OrderedItemList;
      this.PurchaseOrder.CurrentVerificationLevelCount++;
      this.verificationBLService.ApprovePurchaseOrder(this.PurchaseOrder, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Purchase Order " + this.PurchaseOrder.PurchaseOrderId + " is approved successfully."])
            this.RouteBack();
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          }
          this.loading = false;
        }, err => {
          this.messageBoxService.showMessage("Error", ["Something went wrong..."]);
          this.loading = false;
        })
    }
  }
  private CheckForValidItemQuantity(): boolean {
    if (this.PurchaseOrderVM.OrderedItemList.some(RI => RI.Quantity < 1)) {
      this.messageBoxService.showMessage("Failed", ["One of the quantity is edited less that 1.", "Use item cancel button instead."]);
      return false;
    }
    return true;
  }

  RejectPurchaseOrder() {
    if (!this.VerificationRemarks || this.VerificationRemarks.trim() == '') {
      this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for Cancellation"]);
    } else {
      this.loading = true;
      this.verificationBLService.RejectPurchaseOrder(this.PurchaseOrder.PurchaseOrderId, this.PurchaseOrder.CurrentVerificationLevel, this.PurchaseOrder.CurrentVerificationLevelCount + 1, this.PurchaseOrder.MaxVerificationLevel, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Purchase Order " + this.PurchaseOrder.PurchaseOrderId + " is rejeceted successfully."])
            this.RouteBack();
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          }
          this.loading = false;
        }, err => {
          this.messageBoxService.showMessage("Error", ["Something went wrong..."]);
          this.loading = false;
        });
    }
  }

  ShowQuotationRates() {
    this.showQuotationRatesPopUp = true;
  }
  OnQuotationRatesClose() {
    this.showQuotationRatesPopUp = false;
  }


  PoUplodadedviewFiles() {
    this.PoUplodadedViewFiles = true;

  }
  OnUplodadedviewFiles() {
    this.PoUplodadedViewFiles = false;

  }
  //this calculation is for the whole PO
  CalculationForPO() {
    this.PurchaseOrder.SubTotal = 0;
    this.PurchaseOrder.VAT = 0;
    this.PurchaseOrder.TotalAmount = 0;

    for (var i = 0; i < this.PurchaseOrderVM.OrderedItemList.length; i++) {
      try {
        this.PurchaseOrder.SubTotal += (this.PurchaseOrderVM.OrderedItemList[i].StandardRate * this.PurchaseOrderVM.OrderedItemList[i].Quantity);
        this.PurchaseOrderVM.OrderedItemList[i].VATAmount = this.PurchaseOrderVM.OrderedItemList[i].StandardRate * this.PurchaseOrderVM.OrderedItemList[i].Quantity * this.PurchaseOrderVM.OrderedItemList[i].VatPercentage / 100;
        this.PurchaseOrder.VAT += this.PurchaseOrderVM.OrderedItemList[i].VATAmount;
        this.PurchaseOrderVM.OrderedItemList[i].TotalAmount = (this.PurchaseOrderVM.OrderedItemList[i].StandardRate * this.PurchaseOrderVM.OrderedItemList[i].Quantity) + this.PurchaseOrderVM.OrderedItemList[i].VATAmount;
        this.PurchaseOrder.TotalAmount += this.PurchaseOrderVM.OrderedItemList[i].TotalAmount;
      }
      catch (ex) {
        console.log("Some value is missing.");
      }
    }
   // this.PurchaseOrder.TotalAmount += this.PurchaseOrder.Insurance + this.PurchaseOrder.FreightAndPacking - this.PurchaseOrder.Discount;
  }
  Print() {
    //this is used to print the receipt

    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    popupWinindow.document.write(
      `<html>
      <head>
        <style>
          .img-responsive{ position: static;left: -65px;top: 10px;}
          .qr-code{position: absolute; left: 1001px;top: 9px;}
        </style>
        <link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />
      </head>
      <style>
        .printStyle {border: dotted 1px;margin: 10px 100px;}
        .print-border-top {border-top: dotted 1px;}
        .print-border-bottom {border-bottom: dotted 1px;}
        .print-border {border: dotted 1px;}.center-style {text-align: center;}
        .border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}
        .hidden-in-print { display:none !important}
        table th, table td {
            border: 1px solid #ccc;
        }
        .print-header .row {
            display: flex;
        }
        .print-header .col-md-3 {
            width: 25% 
        }
        .print-header .col-md-6 {
            width: 50%
        }
        .print-header .logo {
            padding: 20px 0 !important;
        }
      </style>
      <body onload="window.print()">` +
      printContents +
      "</html>"
    );
    popupWinindow.document.close();
  }
}
export class InventoryPurchaseOrderVM {
  public OrderedItemList: Array<PurchaseOrderItems>;
  public OrderingUser: VerificationActor;
  public Verifiers: Array<VerificationActor>;
}
