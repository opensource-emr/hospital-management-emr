import { Component, OnInit, OnDestroy } from "@angular/core";
import { InventoryService } from "../../shared/inventory.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PurchaseRequestModel } from "../../shared/purchase-request.model";
import { CoreService } from "../../../core/shared/core.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { InventoryPurchaseRequestVM } from "../../../verification/inventory/purchase-request/purchase-request-detail.component";

@Component({
    templateUrl: 'purchase-request-detail.html',
})
export class PurchaseRequestDetailComponent implements OnInit, OnDestroy {
    public headerDetail: { hospitalName; address; email; PANno; tel; DDA };
    public PurchaseRequestVM: PurchaseRequestVM = new PurchaseRequestVM();
    public isAddPOApplicable: boolean = false;

    constructor(public inventoryService: InventoryService,
        public inventoryBLService: InventoryBLService, public coreService: CoreService,
        public router: Router, public routeFromService: RouteFromService,
        public messageBoxService: MessageboxService) {
        this.GetInventoryBillingHeaderParameter();
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
    ngOnDestroy(): void {
        this.routeFromService.RouteFrom = "";
    }
    ngOnInit(): void {
        this.LoadPurchaseRequest();
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
        if (this.PurchaseRequestVM.PurchaseRequest.IsPOCreated == true) {
            this.isAddPOApplicable = false;
        }
        else {
            if (this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel == 0) {
                this.isAddPOApplicable = true;
            }
            else {
                //conditions when verification exists.
                //if current verification level is less than max, then check for core cfg parameters and show result accordingly.
                if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount < this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel) {
                    //check the parameter and decide whether to reject add po or allow with mandatory remarks.
                    var allowPObeforeVerification = this.coreService.Parameters.find(p => p.ParameterGroupName == "Inventory" && p.ParameterName == "AllowPOFromPurchaseRequestWithoutVerification").ParameterValue;
                    if (allowPObeforeVerification == true || (typeof(allowPObeforeVerification) == "string" && allowPObeforeVerification == "true")) {
                        this.isAddPOApplicable = true;
                        this.messageBoxService.showMessage("notice-message", ["This request has not been verified."]);
                    }
                    else {
                        this.messageBoxService.showMessage("warning", ['This purchase request is not verified.', 'You cannot add Purchase Order.']);
                        this.isAddPOApplicable = false;
                    }
                }
                //if current verification level is equal to max, then allow add po
                if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount == this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel) {
                    this.isAddPOApplicable = true;
                }
            }
        }
    }
    AddPurchaseOrder() {
        this.inventoryService.PurchaseRequestId = this.PurchaseRequestVM.PurchaseRequest.PurchaseRequestId;
        this.inventoryService.POId = 0;
        this.inventoryService.POIdforCopy = 0;
        this.router.navigate(["/Inventory/ProcurementMain/PurchaseOrderItems"]);
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
export class PurchaseRequestVM extends InventoryPurchaseRequestVM {
    PurchaseRequest: PurchaseRequestModel
}