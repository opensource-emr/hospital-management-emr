import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { SecurityService } from "../../../security/shared/security.service";
import { PurchaseRequestItemModel } from '../../../inventory/shared/purchase-request-item.model';
import { VerificationActor } from '../requisition-details/inventory-requisition-details.component';
import { PurchaseRequestModel } from '../../../inventory/shared/purchase-request.model';

@Component({
  templateUrl: './purchase-request-detail.html'
})
export class VER_INV_PurchaseRequestDetailComponent implements OnInit, OnDestroy {
  public PurchaseRequest: PurchaseRequestModel;
  public PurchaseRequestVM: InventoryPurchaseRequestVM;
  public VerificationRemarks: string = "";
  public isVerificationAllowed: boolean = false;
  public loading: boolean = false;
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public nextVerifiersPermission: string = "";
  public CopyOfRequisitionItemsQuantity: Array<{ RequisitionItemId; Quantity; }> = [];
  constructor(public verificationService: VerificationService, public verificationBLService: VerificationBLService, public coreService: CoreService, public securityService: SecurityService, public messageBoxService: MessageboxService, public router: Router, public routeFromService: RouteFromService, public changeDetector: ChangeDetectorRef) {
    this.GetInventoryBillingHeaderParameter();
  }
  ngOnDestroy(): void {
    this.verificationService.PurchaseRequest = new PurchaseRequestModel();
    this.routeFromService.RouteFrom = "";
  }
  ngOnInit() {
    this.PurchaseRequest = this.verificationService.PurchaseRequest;
    this.CheckForVerificationApplicable(); //even if this is false, we must show the details, but features like edit,cancel will not be available.
    this.GetInventoryPurchaseRequestDetails();
  }
  private GetInventoryPurchaseRequestDetails() {
    this.verificationBLService
      .GetInventoryPurchaseRequestDetails(this.PurchaseRequest.PurchaseRequestId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PurchaseRequestVM = res.Results;
          this.CopyRequestedItemsQuantity();
        }
        else {
          this.messageBoxService.showMessage("Failed", [
            "Something went wrong.",
            "Loading Requisition Failed."
          ]);
        }
      });
  }
  private CopyRequestedItemsQuantity() {
    this.PurchaseRequestVM.RequestedItemList.forEach(item => {
      var CopyItem = { RequisitionItemId: item.PurchaseRequestItemId, Quantity: item.RequestedQuantity };
      this.CopyOfRequisitionItemsQuantity.push(CopyItem);
    });
  }
  private CheckForVerificationApplicable() {
    if (this.PurchaseRequest.isVerificationAllowed == true && this.PurchaseRequest.RequestStatus == "active") {
      this.isVerificationAllowed = true;
    }
    else if (this.PurchaseRequest.isVerificationAllowed == false && this.PurchaseRequest.RequestStatus == "active") {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["You have verified this Request already."])
    }
    else {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["Verifying this Request is not allowed."]);
    }
  }
  EditItem(index) {
    if (this.isVerificationAllowed == true) {
      if (this.PurchaseRequestVM.RequestedItemList[index].IsEdited == true) {
        this.PurchaseRequestVM.RequestedItemList[index].IsEdited = false;
        this.PurchaseRequestVM.RequestedItemList[
          index
        ].RequestedQuantity = this.CopyOfRequisitionItemsQuantity[index].Quantity;
      } else {
        this.PurchaseRequestVM.RequestedItemList[index].IsEdited = true;
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
      this.messageBoxService.showMessage("Failed", ["Editing this requisition is forbidden."])
    }
  }
  CancelItem(index) {
    if (this.isVerificationAllowed == true) {
      if (this.PurchaseRequestVM.RequestedItemList[index].IsActive == true) {
        if (this.CheckForCancelItemsCondition()) {
          this.PurchaseRequestVM.RequestedItemList[index].RequestItemStatus = "cancelled";
          this.PurchaseRequestVM.RequestedItemList[index].IsActive = false;
          this.PurchaseRequestVM.RequestedItemList[index].IsEdited = false;
        }
        else {
          this.messageBoxService.showMessage("Failed", ["You can not cancel the last item. Use Reject All instead."])
        }
      }
      else if (this.PurchaseRequestVM.RequestedItemList[index].CancelledBy != null) {
        this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
      }
      else {
        this.PurchaseRequestVM.RequestedItemList[index].RequestItemStatus = "active";
        this.PurchaseRequestVM.RequestedItemList[index].IsActive = true;
      }
    } else {
      this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
    }
  }
  CheckForCancelItemsCondition(): boolean {
    var lengthOfActiveItems = this.PurchaseRequestVM.RequestedItemList.filter(RI => RI.IsActive == true).length;
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
  ApprovePurchaseRequest() {
    if (this.CheckForValidItemQuantity()) {
      this.loading = true;
      this.PurchaseRequest.PurchaseRequestItems = this.PurchaseRequestVM.RequestedItemList;
      this.PurchaseRequest.CurrentVerificationLevelCount++;
      this.verificationBLService.ApprovePurchaseRequest(this.PurchaseRequest, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Requisition " + this.PurchaseRequest.PRNumber + " is approved successfully."])
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
    if (this.PurchaseRequestVM.RequestedItemList.some(RI => RI.RequestedQuantity < 1)) {
      this.messageBoxService.showMessage("Failed", ["One of the quantity is edited less that 1.", "Use item cancel button instead."]);
      return false;
    }
    return true;
  }

  RejectPurchaseRequest() {
    if (!this.VerificationRemarks || this.VerificationRemarks.trim() == '') {
      this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for Cancellation"]);
    } else {
      this.loading = true;
      this.verificationBLService.RejectPurchaseRequest(this.PurchaseRequest.PurchaseRequestId, this.PurchaseRequest.CurrentVerificationLevel, this.PurchaseRequest.CurrentVerificationLevelCount + 1, this.PurchaseRequest.MaxVerificationLevel, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Requisition " + this.PurchaseRequest.PRNumber + " is rejeceted successfully."])
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
        </style>
        <body onload="window.print()">` +
      printContents +
      "</html>"
    );
    popupWinindow.document.close();
  }
}
export class InventoryPurchaseRequestVM {
  public RequestedItemList: Array<PurchaseRequestItemModel>;
  public RequestingUser: VerificationActor;
  public Verifiers: Array<VerificationActor>;
}
