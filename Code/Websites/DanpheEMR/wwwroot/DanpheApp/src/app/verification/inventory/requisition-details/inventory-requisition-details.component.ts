import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { VerificationService } from "../../shared/verification.service";
import { Requisition } from "../../../inventory/shared/requisition.model";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  selector: "app-inventory-requisition-details",
  templateUrl: "./inventory-requisition-details.html"
})
export class VER_INV_RequisitionDetailsComponent implements OnInit, OnDestroy {
  public Requisition: Requisition;
  public RequisitionVM: InventoryRequisitionVM;
  public VerificationRemarks: string = "";
  public isVerificationAllowed: boolean = false;
  public loading: boolean = false;
  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public nextVerifiersPermission: string = "";
  public CopyOfRequisitionItemsQuantity: Array<{
    RequisitionItemId;
    Quantity;
  }> = [];

  constructor(
    public verificationService: VerificationService,
    public verificationBLService: VerificationBLService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFromService: RouteFromService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.GetInventoryBillingHeaderParameter();
  }

  ngOnInit() {
    this.Requisition = this.verificationService.Requisition;
    this.CheckForVerificationApplicable(); //even if this is false, we must show the details, but features like edit,cancel will not be available.
    this.GetInventoryRequisitionDetails();
  }
  private GetInventoryRequisitionDetails() {
    this.verificationBLService
      .GetInventoryRequisitionDetails(this.Requisition.RequisitionId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.RequisitionVM = res.Results;
          this.CopyRequisitionItemsQuantity();
        }
        else {
          this.messageBoxService.showMessage("Failed", [
            "Something went wrong.",
            "Loading Requisition Failed."
          ]);
        }
      });
  }

  private CheckForVerificationApplicable() {
    if (this.Requisition.isVerificationAllowed == true && this.Requisition.RequisitionStatus == "active") {
      this.isVerificationAllowed = true;
    }
    else if (this.Requisition.isVerificationAllowed == false && this.Requisition.RequisitionStatus == "active") {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["You have verified this requisition already."])
    }
    else {
      this.isVerificationAllowed = false;
      this.messageBoxService.showMessage("notice-message", ["Verifying this requisition is not allowed."]);
    }
  }

  ngOnDestroy() {
    this.verificationService.Requisition = new Requisition();
    this.routeFromService.RouteFrom = "";
  }
  //Get Inventory Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == "Inventory Receipt Header").ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for BillingHeader"
      ]);
  }
  CopyRequisitionItemsQuantity() {
    this.RequisitionVM.RequisitionItemList.forEach(item => {
      var CopyItem = { RequisitionItemId: item.RequisitionItemId, Quantity: item.Quantity };
      this.CopyOfRequisitionItemsQuantity.push(CopyItem);
    });
  }
  EditItem(index) {
    if (this.isVerificationAllowed == true) {
      if (this.RequisitionVM.RequisitionItemList[index].IsEdited == true) {
        this.RequisitionVM.RequisitionItemList[index].IsEdited = false;
        this.RequisitionVM.RequisitionItemList[
          index
        ].Quantity = this.CopyOfRequisitionItemsQuantity[index].Quantity;
      } else {
        this.RequisitionVM.RequisitionItemList[index].IsEdited = true;
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
      if (this.RequisitionVM.RequisitionItemList[index].IsActive == true) {
        if (this.CheckForCancelItemsCondition()) {
          this.RequisitionVM.RequisitionItemList[index].RequisitionItemStatus =
            "cancelled";
          this.RequisitionVM.RequisitionItemList[index].IsActive = false;
          this.RequisitionVM.RequisitionItemList[index].IsEdited = false;
        }
        else {
          this.messageBoxService.showMessage("Failed", ["You can not cancel the last item. Use Reject All instead."])
        }
      }
      else if (this.RequisitionVM.RequisitionItemList[index].CancelBy != null) {
        this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
      }
      else {
        this.RequisitionVM.RequisitionItemList[index].RequisitionItemStatus =
          "active";
        this.RequisitionVM.RequisitionItemList[index].IsActive = true;
      }
    } else {
      this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
    }
  }
  CheckForCancelItemsCondition(): boolean {
    var lengthOfActiveItems = this.RequisitionVM.RequisitionItemList.filter(RI => RI.IsActive == true).length;
    if (lengthOfActiveItems > 1) {
      return true;
    }
    else {
      return false;
    }
  }
  RouteBack() {
    this.router.navigate([this.routeFromService.RouteFrom]);
  }
  ApproveRequest() {
    if (this.CheckForValidItemQuantity()) {
      this.loading = true;
      this.RequisitionVM.RequisitionItemList.forEach(req => req.PendingQuantity = req.Quantity);
      this.Requisition.RequisitionItems = this.RequisitionVM.RequisitionItemList;
      this.Requisition.CurrentVerificationLevelCount++;
      this.verificationBLService.ApproveRequisition(this.Requisition, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Requisition " + this.Requisition.RequisitionNo + " is approved successfully."])
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
    if (this.RequisitionVM.RequisitionItemList.some(RI => RI.Quantity < 1)) {
      this.messageBoxService.showMessage("Failed", ["One of the quantity is edited less that 1.", "Use item cancel button instead."]);
      return false;
    }
    return true;
  }

  RejectRequest() {
    if (!this.VerificationRemarks || this.VerificationRemarks.trim() == '') {
      this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for Cancellation"]);
    } else {
      this.loading = true;
      this.verificationBLService.RejectRequisition(this.Requisition.RequisitionId, this.Requisition.CurrentVerificationLevel, this.Requisition.CurrentVerificationLevelCount + 1, this.Requisition.MaxVerificationLevel, this.VerificationRemarks)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.messageBoxService.showMessage("Success", ["Requisition " + this.Requisition.RequisitionNo + " is rejeceted successfully."])
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

class InventoryRequisitionVM {
  public RequisitionItemList: Array<RequisitionItems>;
  public RequestingUser: VerificationActor;
  public Verifiers: Array<VerificationActor>;
  public Dispatchers: Array<VerificationActor>;
}
export class VerificationActor {
  Name: string = "";
  Status: string = "";
  Remarks: string = "";
  Date: Date = null;
}
