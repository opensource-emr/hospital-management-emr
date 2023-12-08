import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { PurchaseRequestModel } from '../../../inventory/shared/purchase-request.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { InventoryPurchaseRequestVM } from '../../../verification/inventory/purchase-request/purchase-request-detail.component';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
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

    public GeneralFieldLabel = new GeneralFieldLabels();

    constructor(public inventoryService: InventoryService,
        public procBLService: ProcurementBLService, public coreService: CoreService,
        public router: Router, public routeFromService: RouteFromService,
        public messageBoxService: MessageboxService) {
        this.GetInventoryBillingHeaderParameter();
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
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
        if (this.AllowPOFromPurchaseRequestWithoutVerification()) {
            if (this.PurchaseRequestVM.PurchaseRequest.RequestStatus != 'complete') {
                this.isAddPOApplicable = true;
            }
            return;
        }
        else {
            if (this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel == 0) {
                if (this.PurchaseRequestVM.PurchaseRequest.RequestStatus != 'complete') {
                    this.isAddPOApplicable = true;
                }
                else {
                    this.isAddPOApplicable = false;
                }
            }
            else {
                if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount < this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel) {
                    this.messageBoxService.showMessage("notice-message", ["Please Verify Purchase Request To Add Purchase Order."]);
                    this.isAddPOApplicable = false;
                }
                if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount == this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel) {
                    if (this.PurchaseRequestVM.PurchaseRequest.RequestStatus == 'pending' || this.PurchaseRequestVM.PurchaseRequest.RequestStatus == 'partial') {
                        this.isAddPOApplicable = true;
                    }
                    else {
                        this.isAddPOApplicable = false;
                    }
                }
            }

            return;
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
        const style = document.createElement('style');
        style.textContent = `<style>
            .printStyle {
              border: dotted 1px;
              margin: 10px 100px;
            }

            .print-border-top {
              border-top: dotted 1px;
            }

            .print-border-bottom {
              border-bottom: dotted 1px;
            }

            .print-border {
              border: dotted 1px;
            }

            .center-style {
              text-align: center;
            }

            .border-up-down {
              border-top: dotted 1px;
              border-bottom: dotted 1px;
            }


            .hidden {
              display: none !important;
              visibility: hidden !important;
            }
            @media print {
                .qr-code {
                    left: 100px;
                }
            }
            .logo {
              height: 80px;
              /*display: flex;*/
              /*justify-content: center;*/
              flex-direction: column;
            }
            .img-responsive {
                position: static;
              }
            .qr-code{
                align-content: flex-end;
            }
            table, th, td {
                border: 1px solid;
             }
             .space-between {
                display: flex;
                justify-content: space-between;
              }
          </style>`
        document.getElementById('printpage').appendChild(style)
        this.showPrint = true;
    }
    callBackPrint() {
        this.printDetaiils = null;
        this.showPrint = false;
    }

    AllowPOFromPurchaseRequestWithoutVerification() {
        var allowPObeforeVerification = this.coreService.Parameters.find(p => p.ParameterGroupName == "Inventory" && p.ParameterName == "AllowPOFromPurchaseRequestWithoutVerification").ParameterValue;
        if (allowPObeforeVerification == true || (typeof (allowPObeforeVerification) == "string" && allowPObeforeVerification == "true")) {
            return true;
        }
        else {
            return false;
        }
    }
}
export class PurchaseRequestVM extends InventoryPurchaseRequestVM {
    PurchaseRequest: PurchaseRequestModel
}