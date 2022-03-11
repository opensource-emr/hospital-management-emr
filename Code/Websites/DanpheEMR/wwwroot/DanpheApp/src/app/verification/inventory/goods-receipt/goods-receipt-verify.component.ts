import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { SecurityService } from "../../../security/shared/security.service";
import { VerificationActor } from '../requisition-details/inventory-requisition-details.component';
import { GoodsReceipt } from '../../../inventory/shared/goods-receipt.model';
import { GoodsReceiptItems } from '../../../inventory/shared/goods-receipt-item.model';
import { CommonFunctions } from '../../../shared/common.functions';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: './goods-receipt-verify.html',
  styles: []
})
export class GoodsReceiptVerifyComponent implements OnInit, OnDestroy {

  public GoodsReceipt: GoodsReceipt;
  public GoodsReceiptVM: InventoryGoodsReceiptVM;
  public VerificationRemarks: string = "";
  public isVerificationAllowed: boolean = false;
  public loading: boolean = false;
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public nextVerifiersPermission: string = "";
  public CopyOfReceivedItemsQuantity: Array<{ ReceivedItemId; ReceivedQuantity; RejectedQuantity; }> = [];
  verificationForm = new FormGroup({ VerificationRemarks: new FormControl('', Validators.required) });
  showFreeQty: boolean = false;
  showCCCharge: boolean = false;
  showDiscount: boolean = false;

  constructor(
    public verificationService: VerificationService,
    public verificationBLService: VerificationBLService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef) {
    this.GetInventoryBillingHeaderParameter();
    this.checkGRCustomization();
  }

  ngOnDestroy(): void {
    this.verificationService.GoodsReceipt = new GoodsReceipt();
    this.routeFromService.RouteFrom = "";
  }

  ngOnInit() {
    this.GoodsReceipt = this.verificationService.GoodsReceipt;
    this.CheckForVerificationApplicable(); //even if this is false, we must show the details, but features like edit,cancel will not be available.
    this.GetInventoryGoodsReceiptDetails();
  }
  private GetInventoryGoodsReceiptDetails() {
    this.verificationBLService
      .GetInventoryGRDetails(this.GoodsReceipt.GoodsReceiptID)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.GoodsReceiptVM = res.Results;
          this.CopyReceivedItemsQuantity();
        }
        else {
          this.messageBoxService.showMessage("Failed", [
            "Something went wrong.",
            "Loading GR Failed."
          ]);
        }
      });
  }

  private CopyReceivedItemsQuantity() {
    this.GoodsReceiptVM.ReceivedItemList.forEach(item => {
      var CopyItem = { ReceivedItemId: item.GoodsReceiptItemId, ReceivedQuantity: item.ReceivedQuantity, RejectedQuantity: item.RejectedQuantity };
      this.CopyOfReceivedItemsQuantity.push(CopyItem);
    });
  }
  private CheckForVerificationApplicable() {
    if (this.GoodsReceipt.IsVerificationAllowed == true && this.GoodsReceipt.GRStatus == "pending") {
      this.isVerificationAllowed = true;
    }
    else if (this.GoodsReceipt.IsVerificationAllowed == false && this.GoodsReceipt.GRStatus == "pending") {
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
      if (this.GoodsReceiptVM.ReceivedItemList[index].IsEdited == true) {
        this.GoodsReceiptVM.ReceivedItemList[index].IsEdited = false;
        this.GoodsReceiptVM.ReceivedItemList[index].ReceivedQuantity = this.CopyOfReceivedItemsQuantity[index].ReceivedQuantity;
      } else {
        this.GoodsReceiptVM.ReceivedItemList[index].IsEdited = true;
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
      if (this.GoodsReceiptVM.ReceivedItemList[index].IsActive == true) {
        if (this.CheckForCancelItemsCondition()) {
          this.GoodsReceiptVM.ReceivedItemList[index].IsActive = false;
          this.GoodsReceiptVM.ReceivedItemList[index].IsEdited = false;
        }
        else {
          this.messageBoxService.showMessage("Failed", ["You can not cancel the last item. Use Reject All instead."])
        }
      }
      else if (this.GoodsReceiptVM.ReceivedItemList[index].CancelledBy != null) {
        this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
      }
      else {
        this.GoodsReceiptVM.ReceivedItemList[index].IsActive = true;
      }
    } else {
      this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
    }
  }
  CheckForCancelItemsCondition(): boolean {
    var lengthOfActiveItems = this.GoodsReceiptVM.ReceivedItemList.filter(RI => RI.IsActive == true).length;
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
  ApproveGoodsReceipt() {
    if (this.CheckForValidItemQuantity()) {
      for (var b in this.verificationForm.controls) {
        this.verificationForm.controls[b].markAsDirty();
        this.verificationForm.controls[b].updateValueAndValidity();
      }
      if (this.verificationForm.invalid) {
        this.messageBoxService.showMessage("Failed", ["Check all *mandatory fields."])
      }
      else {
        this.loading = true;
        this.GoodsReceipt.GoodsReceiptItem = this.GoodsReceiptVM.ReceivedItemList;
        this.GoodsReceipt.GoodsReceiptItem.forEach(gritem => { gritem.RejectedQuantity = this.CopyOfReceivedItemsQuantity.find(a => a.ReceivedItemId == gritem.GoodsReceiptItemId).ReceivedQuantity - gritem.ReceivedQuantity });
        this.GoodsReceipt.CurrentVerificationLevelCount++;
        this.VerificationRemarks = this.verificationForm.get("VerificationRemarks").value;
        this.verificationBLService.ApproveGR(this.GoodsReceipt, this.VerificationRemarks)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.messageBoxService.showMessage("Success", [`Goods Receipt ${this.GoodsReceipt.GoodsReceiptNo} is approved successfully.`])
              if (this.GoodsReceipt.CurrentVerificationLevelCount == this.GoodsReceipt.MaxVerificationLevel)
                this.messageBoxService.showMessage("Notice-Message", ["Stock added in Inventory."]);
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
  }
  private CheckForValidItemQuantity(): boolean {
    if (this.GoodsReceiptVM.ReceivedItemList.some(RI => RI.ReceivedQuantity < 1)) {
      this.messageBoxService.showMessage("Failed", ["One of the quantity is edited less that 1.", "Use item cancel button instead."]);
      return false;
    }
    return true;
  }

  RejectGoodsReceipt() {
    for (var b in this.verificationForm.controls) {
      this.verificationForm.controls[b].markAsDirty();
      this.verificationForm.controls[b].updateValueAndValidity();
    }
    if (this.verificationForm.invalid) {
      this.messageBoxService.showMessage("Failed", ["Check all *mandatory fields."])
    }
    else {
      this.loading = true;
      this.VerificationRemarks = this.verificationForm.get("VerificationRemarks").value;
      this.verificationBLService.RejectGR(this.GoodsReceipt.GoodsReceiptID, this.GoodsReceipt.CurrentVerificationLevel, this.GoodsReceipt.CurrentVerificationLevelCount + 1, this.GoodsReceipt.MaxVerificationLevel, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", [`Goods Receipt ${this.GoodsReceipt.GoodsReceiptNo} is rejected successfully.`])
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
            .img-responsive{ position: relative;left: -65px;top: 10px;}
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
          .billing-column td, .billing-column th {padding: 5px;}
          * {font-family: Arial, "sans-serif";font-size: 12px;font-weight: normal;margin:0;padding:0;}
        </style>
        <body onload="window.print()">` +
      printContents +
      "</html>"
    );
    popupWinindow.document.close();
  }
  Calculations() {
    this.GoodsReceipt.VATTotal = 0;
    this.GoodsReceipt.SubTotal = 0;
    this.GoodsReceipt.TDSAmount = 0;
    this.GoodsReceipt.TotalAmount = 0;
    this.GoodsReceipt.TotalWithTDS = 0;
    this.GoodsReceipt.CcCharge = 0;
    this.GoodsReceipt.Discount = 0;
    this.GoodsReceipt.DiscountAmount = 0;
    this.GoodsReceiptVM.ReceivedItemList.forEach(item => {

      let qty = item.ReceivedQuantity;

      let itemRate = item.ItemRate;
      let subtotal = qty * itemRate;

      let Discount = item.Discount / 100;
      let DiscountAmount = CommonFunctions.parseAmount(Discount * subtotal);

      item.DiscountAmount = DiscountAmount;

      let totalAmount = subtotal - DiscountAmount;

      if (this.GoodsReceipt.TDSAmount > 0) {
        let totalwithTDS = subtotal - DiscountAmount;
        let TDSAmount = CommonFunctions.parseAmount(totalAmount * (this.GoodsReceipt.TDSRate / 100));
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS - TDSAmount);

        let Vat1 = item.VAT / 100;
        let vatAmount1 = CommonFunctions.parseAmount(totalAmount * Vat1);
        totalwithTDS = CommonFunctions.parseAmount(totalwithTDS + vatAmount1);

        this.GoodsReceipt.TotalWithTDS += totalwithTDS;
        this.GoodsReceipt.TDSAmount += TDSAmount;
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

      this.GoodsReceipt.VATTotal += vatAmount;
      this.GoodsReceipt.CcCharge += CcAmount;
      this.GoodsReceipt.SubTotal += subtotal;
      this.GoodsReceipt.DiscountAmount += DiscountAmount;
      this.GoodsReceipt.TotalAmount += totalAmount;
    });
    this.GoodsReceipt.OtherCharges = this.GoodsReceipt.InsuranceCharge + this.GoodsReceipt.CarriageFreightCharge + this.GoodsReceipt.PackingCharge + this.GoodsReceipt.TransportCourierCharge + this.GoodsReceipt.OtherCharge;
    this.GoodsReceipt.TotalAmount += this.GoodsReceipt.OtherCharges;
  }
  checkGRCustomization() {
    let GRParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "GRFormCustomization" && p.ParameterGroupName == "Procurement");
    if (GRParameterStr != null) {
      let GRParameter = JSON.parse(GRParameterStr.ParameterValue);
      if (GRParameter.showFreeQuantity == true) {
        this.showFreeQty = true;
      }
      if (GRParameter.showCCCharge == true) {
        this.showCCCharge = true;
      }
      if (GRParameter.showDiscount == true) {
        this.showDiscount = true;
      }
    }
  }
}
export class InventoryGoodsReceiptVM {
  public ReceivedItemList: Array<GoodsReceiptItems>;
  public ReceivingUser: VerificationActor;
  public Verifiers: Array<VerificationActor>;
  public OrderDetails: VER_PODetailModel;
}
class VER_PODetailModel {
  publicurchaseOrderId: number;
  PoDate: string;
  VendorName: string;
  ContactAddress: string;
  ContactNo: string;
}
