import { Component, OnInit, OnDestroy } from "@angular/core";
import { InventoryService } from "../../shared/inventory.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from "../../../core/shared/core.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { PurchaseRequestVM } from "../../procurement/purchase-request/purchase-request-detail.component";

@Component({
  selector: 'app-internalmain-purchase-request-detail',
  templateUrl: './internalmain-purchase-request-detail.component.html',
  styles: []
})
export class InternalmainPurchaseRequestDetailComponent implements OnInit, OnDestroy {


  public headerDetail: { hospitalName; address; email; PANno; tel; DDA };
  public PurchaseRequestVM: PurchaseRequestVM = new PurchaseRequestVM();
  public isModificationApplicable: boolean = false;

  constructor(public inventoryService: InventoryService,
    public inventoryBLService: InventoryBLService, public coreService: CoreService,
    public router: Router, public routeFromService: RouteFromService,
    public messageBoxService: MessageboxService) {
    this.GetInventoryBillingHeaderParameter();
  }
  ngOnDestroy(): void {
    this.routeFromService.RouteFrom = "";
  }
  ngOnInit(): void {
    this.LoadPurchaseRequest();
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      a => a.ParameterName == "Inventory BillingHeader"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for BillingHeader"
      ]);
  }

  LoadPurchaseRequest() {
    if (this.inventoryService.PurchaseRequestId > 0) {
      var PRId = this.inventoryService.PurchaseRequestId;
      this.inventoryBLService.GetPurchaseRequestById(PRId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.PurchaseRequestVM = res.Results;
            this.CheckForActionsAvailable();
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Cannot show the view"]);
          }
        })
    }
  }
  private CheckForActionsAvailable() {
    if (this.PurchaseRequestVM.PurchaseRequest.IsPOCreated == true || this.PurchaseRequestVM.PurchaseRequest.RequestStatus == 'withdrawn') {
      this.isModificationApplicable = false;
    }
    else {
      if (this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel == 0) {
        this.isModificationApplicable = true;
      }
      else {
        //conditions when verification exists.
        // if verification has been done once, disable modification.
        if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount == 0) {
          this.isModificationApplicable = true;
        }
      }
    }
  }

  EditRequest() {
    this.inventoryService.PurchaseRequestId = this.PurchaseRequestVM.PurchaseRequest.PurchaseRequestId;
    this.router.navigate(["/Inventory/InternalMain/PurchaseRequest/PurchaseRequestAdd"])
  }
  WithdrawPurchaseRequest() {
    this.inventoryBLService.WithdrawPurchaseRequestById(this.PurchaseRequestVM.PurchaseRequest.PurchaseRequestId, this.PurchaseRequestVM.PurchaseRequest.CancelRemarks)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.messageBoxService.showMessage("Success", ["Purchase Request " + this.PurchaseRequestVM.PurchaseRequest.PRNumber + " is successfully withdrawn."]);
        }
        else {
          this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          console.log(res.ErrorMessage);
        }
      });
    this.RouteBack();
  }
  RouteBack() {
    this.router.navigate([this.routeFromService.RouteFrom]);
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