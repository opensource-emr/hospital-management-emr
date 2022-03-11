import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { PurchaseRequestModel } from '../../../inventory/shared/purchase-request.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { InventoryPurchaseRequestVM } from '../../../verification/inventory/purchase-request/purchase-request-detail.component';
import { ProcurementBLService } from '../../shared/procurement.bl.service';

@Component({
    selector: 'app-purchase-request-views',
    templateUrl: './purchase-request-view.component.html',
    styles: []
})
export class PurchaseRequestViewComponent implements OnInit {
    public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
    public PurchaseRequestVM: PurchaseRequestVM = new PurchaseRequestVM();
    public isAddPOApplicable: boolean = false;
    printDetaiils: HTMLElement;
    showPrint: boolean;

    constructor(public inventoryService: InventoryService,
        public procBLService: ProcurementBLService, public coreService: CoreService,
        public router: Router, public routeFromService: RouteFromService,
        public messageBoxService: MessageboxService) {
        this.GetInventoryBillingHeaderParameter();
    }
    GetInventoryBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(
            a => a.ParameterName == "Inventory Receipt Header"
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
            this.procBLService.GetPurchaseRequestById(PRId)
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
                    if (allowPObeforeVerification == true || (typeof (allowPObeforeVerification) == "string" && allowPObeforeVerification == "true")) {
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
        this.router.navigate(["/ProcurementMain/PurchaseOrder/PurchaseOrderAdd"]);
    }
    RouteBack() {
        this.router.navigate([this.routeFromService.RouteFrom]);
    }
    print() {
        this.printDetaiils = document.getElementById("printpage");
        this.showPrint = true;
    }
    callBackPrint() {
        this.printDetaiils = null;
        this.showPrint = false;
    }
}
export class PurchaseRequestVM extends InventoryPurchaseRequestVM {
    PurchaseRequest: PurchaseRequestModel
}