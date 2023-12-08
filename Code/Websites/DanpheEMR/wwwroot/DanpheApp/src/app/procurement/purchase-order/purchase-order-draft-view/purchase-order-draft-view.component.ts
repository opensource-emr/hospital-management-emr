
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryBLService } from '../../../inventory/shared/inventory.bl.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrderDraftItem } from '../purchase-order-draft-item.model';
import { PurchaseOrderDraft } from '../purchase-order-draft.model';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
@Component({
    selector: 'purchase-order-draft-view',
    templateUrl: './purchase-order-draft-view.html',
    styles: []
})
export class PurchaseOrderDraftViewComponent implements OnInit {
    public purchaseorderDraftItems: Array<PurchaseOrderDraftItem> = new Array<PurchaseOrderDraftItem>();
    public purchaseorderDraft: PurchaseOrderDraft = new PurchaseOrderDraft();
    public PODraftTime: string = "";
    public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
    @Output('call-back-close')
    public callBackClose: EventEmitter<Object> = new EventEmitter<Object>()
    public showPurchaseOrderDraftDiscardPopup: boolean = false;
    public showPurchaseOrderDraftAddEditPage: boolean = false;

    public GeneralFieldLabel = new GeneralFieldLabels();
    constructor(public inventoryService: InventoryService, public procBLService: ProcurementBLService, public messageBoxService: MessageboxService, public router: Router, public coreService: CoreService, public inventoryBlService: InventoryBLService) {
        this.GetInventoryBillingHeaderParameter();
        this.LoadPurchaseOrderDraftDetails(this.inventoryService.DraftPurchaseOrderId);
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }
    ngOnInit() {
    }
    LoadPurchaseOrderDraftDetails(poDraftId: number) {
        if (poDraftId != null) {
            this.inventoryBlService.GetPurchaseOrderDraftById(poDraftId)
                .subscribe(res => this.ShowPurchaseOrderDraftDetails(res));
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select PurchaseOrder for Details.']);
            this.BackToPurchaseOrderDraftList();
        }
    }
    BackToPurchaseOrderDraftList() {
        this.callBackClose.emit();
    }
    ShowPurchaseOrderDraftDetails(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.purchaseorderDraft = res.Results.poDraftDetails;
            this.purchaseorderDraft.PurchaseOrderDraftItems = res.Results.poDraftItems;
            if (this.purchaseorderDraft.Status === "InProgress") {
                this.purchaseorderDraft.IsModificationAllowed = true;
                this.purchaseorderDraft.PurchaseOrderDraftItems = this.purchaseorderDraft.PurchaseOrderDraftItems.filter(i => i.IsActive == true);
            }
            else {
                this.purchaseorderDraft.PurchaseOrderDraftItems = this.purchaseorderDraft.PurchaseOrderDraftItems.filter(i => i.IsActive == false && i.IsDiscarded == true);
            }
            this.PODraftTime = moment(this.purchaseorderDraft.CreatedOn).format('HH:mm');
            this.purchaseorderDraft.CreatedOn = moment(this.purchaseorderDraft.CreatedOn).format('YYYY-MM-DD');
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no PurchaseOrder Draft details !"]);
            this.BackToPurchaseOrderDraftList();
        }

    }
    WithdrawPODraft() {
        if (this.purchaseorderDraft.DiscardRemarks.trim() === '') {
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Remarks is required']);
        }
        this.cancelPODraft();
    }
    //Purchase Order Draft Discard Method
    cancelPODraft() {
        this.procBLService.PostDiscardPurchaseOrderDraft(this.inventoryService.DraftPurchaseOrderId, this.purchaseorderDraft.DiscardRemarks)
            .subscribe(
                res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.BackToPurchaseOrderDraftList();
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Purchase Order Draft ${this.purchaseorderDraft.DraftPurchaseOrderId} Discarded`]);
                    } else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Purchase Order Draft Discard Failed"]);
                    }
                },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
                });
    }
    GetInventoryBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Parameter not found"]);
    }
    EditPurchaseOrder(status) {
        if (status === "Discarded") {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Discarded Draft"]);
        }
        else {
            this.inventoryService.DraftPurchaseOrderId = this.purchaseorderDraft.DraftPurchaseOrderId;
            this.showPurchaseOrderDraftAddEditPage = true;
        }
    }
    CopyToPurchaseOrder() {
        this.inventoryService.DraftPurchaseOrderId = this.purchaseorderDraft.DraftPurchaseOrderId;
        this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
    }

    ClosePurchaseOrderDraftViewPage() {
        this.callBackClose.emit();
    }
    OpenWidthDrawPopUp() {
        this.showPurchaseOrderDraftDiscardPopup = true;
    }
    CloseDiscardPopUP() {
        this.showPurchaseOrderDraftDiscardPopup = false;
    }
    ClosePurchaseOrderDraftAddEditPage() {
        this.showPurchaseOrderDraftAddEditPage = false;
        this.callBackClose.emit();
    }
}