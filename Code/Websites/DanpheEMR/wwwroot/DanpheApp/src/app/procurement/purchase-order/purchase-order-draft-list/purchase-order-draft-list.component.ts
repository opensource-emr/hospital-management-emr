import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrderDraft } from '../purchase-order-draft.model';

@Component({
    selector: 'purchase-order-draft-list',
    templateUrl: './purchase-order-draft-list.html',
    styles: []
})
export class PurchaseOrderDraftListComponent implements OnInit {
    public purchaseorderDraft: PurchaseOrderDraft = new PurchaseOrderDraft();
    public purchaseOrdersDraftGridColumns: Array<any> = null;
    public isPODraftDiscarded: boolean = false;
    public loading: boolean = true;
    public status: string = "InProgress";
    public purchaseOrderDraftList: Array<PurchaseOrderDraft> = new Array<PurchaseOrderDraft>();
    @Output('call-back-close')
    public callBackClose: EventEmitter<Object> = new EventEmitter<Object>();
    public showPurchaseOrderDraftAddEditPage: boolean = false;
    public showPurchaseOrderDraftViewPage: boolean = false;
    constructor(
        public procBLService: ProcurementBLService,
        public inventoryService: InventoryService,
        public router: Router,
        public invBlService: InventoryBLService,
        public messageBoxService: MessageboxService) {
        this.purchaseOrdersDraftGridColumns = ProcurementGridColumns.PODraftList;
        this.LoadPODraftListByStatus();
    }
    ngOnInit(): void {
    }

    LoadPODraftListByStatus() {
        if (this.isPODraftDiscarded == true) {
            this.status = "Discarded";
        }
        else {
            this.status = "InProgress";
        }
        this.procBLService.GetPurchaseOrderDraftList(this.status).finally(() => {
            this.loading = false;
        }).subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {
                this.purchaseOrderDraftList = res.Results;
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No Draft's to show"]);
                this.purchaseOrderDraftList = [];
            }
        });
    }
    PurchaseOrderDraftGridAction($event: GridEmitModel) {

        switch ($event.Action) {
            case "DiscardDraft":
                {
                    this.LoadPurchaseOrderDraftDetails($event.Data.DraftPurchaseOrderId);
                    break;
                }
            case "review":
                {
                    this.inventoryService.DraftPurchaseOrderId = $event.Data.DraftPurchaseOrderId;
                    this.showPurchaseOrderDraftAddEditPage = true;
                    break;
                }
            case "view":
                {
                    this.inventoryService.DraftPurchaseOrderId = $event.Data.DraftPurchaseOrderId;
                    this.showPurchaseOrderDraftViewPage = true;
                    break;
                }
            case 'CopyToPo':
                {
                    this.RouteToRecreatePO($event.Data.DraftPurchaseOrderId);
                    break;
                }
            default:
                break;

        }
    }
    CreatePurchaseOrder() {
        this.inventoryService.PurchaseRequestId = 0;
        this.inventoryService.POId = 0;
        this.inventoryService.POIdforCopy = 0;
        this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
    }//route to PurchaseOrderDraft Page
    CreateNewDraft() {
        this.inventoryService.PurchaseRequestId = 0;
        this.inventoryService.POId = 0;
        this.inventoryService.POIdforCopy = 0;
        this.showPurchaseOrderDraftAddEditPage = true;

    }
    //route to purchaseOrder Draft List
    ViewDraftList() {
        this.inventoryService.PurchaseRequestId = 0;
        this.inventoryService.POId = 0;
        this.inventoryService.POIdforCopy = 0;
        this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderDraftList']);
    }

    getGridExportOptions() {
        let gridExportOptions = {
            fileName: 'PurchaseOrderDraftList-' + moment().format('YYYY-MM-DD') + '.xls',
            displayColumns: ["DraftPurchaseOrderId", "CreatedOn", "DraftPurchaseOrderNo", "VendorName", "VendorContact", "TotalAmount", "Status"]
        };
        return gridExportOptions;
    }
    LoadPurchaseOrderDraftDetails(poDraftId: number) {
        if (poDraftId != null) {

            this.invBlService.GetPurchaseOrderDraftById(poDraftId)
                .subscribe(res => this.ShowPurchaseOrderDetails(res));
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select PurchaseOrder for Details.']);

        }
    }
    ShowPurchaseOrderDetails(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.purchaseorderDraft = res.Results.poDraftDetails;
            if (this.purchaseorderDraft.Status === "InProgress") {
                this.purchaseorderDraft.IsModificationAllowed = true;
            }
            this.purchaseorderDraft.CreatedOn = moment(this.purchaseorderDraft.CreatedOn).format('YYYY-MM-DD');
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no PurchaseOrder details !"]);
        }


    }

    CloseDiscardPopUP() {
        this.purchaseorderDraft.DiscardRemarks = '';
        this.purchaseorderDraft.DraftPurchaseOrderId = null;
        this.purchaseorderDraft.IsModificationAllowed = false;
    }
    WithdrawPODraft() {
        if (this.purchaseorderDraft.DiscardRemarks.trim() === '') {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Remarks is mandatory`]);
            return;
        }
        this.cancelPODraft(this.purchaseorderDraft.DraftPurchaseOrderId);
    }
    //Purchase Order Draft Discard Method
    cancelPODraft(PoFraftId: number) {
        this.procBLService.PostDiscardPurchaseOrderDraft(PoFraftId, this.purchaseorderDraft.DiscardRemarks)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.CloseDiscardPopUP();
                        this.LoadPODraftListByStatus();
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Purchase Order Draft Discarded`]);
                    } else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Purchase Order Draft Discard Failed"]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
                });
    }
    RouteToRecreatePO(poDraftId: number) {
        this.inventoryService.DraftPurchaseOrderId = poDraftId;
        this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
    }

    ClosePurchaseOrderDraftListPage() {
        this.callBackClose.emit();
    }
    ClosePurchaseOrderDraftAddEditPage() {
        this.showPurchaseOrderDraftAddEditPage = false;
        this.LoadPODraftListByStatus();
    }

    ClosePurchaseOrderDraftViewPage() {
        this.showPurchaseOrderDraftViewPage = false;
        this.LoadPODraftListByStatus();
    }
}