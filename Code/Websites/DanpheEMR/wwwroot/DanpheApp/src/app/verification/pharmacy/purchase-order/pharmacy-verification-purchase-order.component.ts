import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { VerificationService } from "../../shared/verification.service";
import { PharmacyPurchaseOrderItem_DTO } from "../shared/pharmacy-purchase-order-item.dto";
import { PharmacyPurchaseOrder_DTO } from "../shared/pharmacy-purchase-order.dto";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";

@Component({
    selector: 'pharmacy-verification-purchase-order',
    templateUrl: './pharmacy-verification-purchase-order.component.html',
})
export class PharmacyVerificationPurchaseOrderComponent {
    headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
    PurchaseOrder: PharmacyPurchaseOrder_DTO = new PharmacyPurchaseOrder_DTO();
    isVerificationAllowed: boolean = false;
    loading: boolean = false;
    @Input('purchase-order-id') PurchaseOrderId: number = 0;
    @Input('is-verification-allowed') IsVerificationAllowed: boolean = false;
    @Input('current-verification-level') CurrentVerificationLevel: number = 0;
    @Input('current-verification-level-count') CurrentVerificationLevelCount: number = 0;
    @Input('max-verification-level') MaxVerificationLevel: number = 0;
    @Output('call-back-popup-close') callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();
    CopyOfPurchaseOrderItems: PharmacyPurchaseOrderItem_DTO[] = [];

    public GeneralFieldLabel = new GeneralFieldLabels();
    constructor(public coreService: CoreService, public verificationBLService: VerificationBLService,
        public messageBoxService: MessageboxService, public verificationService: VerificationService,
        public changeDetectorRef: ChangeDetectorRef,
    ) {
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }

    ngOnInit() {
        this.GetPharmacyBillingHeaderParameter();
        if (this.PurchaseOrderId > 0) {
            this.GetPharmacyPurchaseOrderInfo(this.PurchaseOrderId);
        }
    }

    GetPharmacyPurchaseOrderInfo(PurchaseOrderId: number): void {
        this.verificationBLService.GetPharmacyPurchaseOrderInfo(PurchaseOrderId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.PurchaseOrder = res.Results.Order;
                    this.PurchaseOrder.VerifierList = res.Results.VerifierList;
                    this.PurchaseOrder.PurchaseOrderItems = res.Results.OrderItems;
                    this.CopyOfPurchaseOrderItems = _.cloneDeep(this.PurchaseOrder.PurchaseOrderItems);
                    this.CheckForVerificationApplicable();
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to purchase order details: ' + err.message]);
                });
    }

    GetPharmacyBillingHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
        if (paramValue) this.headerDetail = JSON.parse(paramValue);
    }

    CalculationForPOItem(i: number): void {

        const purchaseOrderItem = this.PurchaseOrder.PurchaseOrderItems[i];
        if (purchaseOrderItem.Quantity > 0 && purchaseOrderItem.StandardRate > 0 && purchaseOrderItem.FreeQuantity > -1) {

            purchaseOrderItem.SubTotal = CommonFunctions.parseAmount(purchaseOrderItem.Quantity * purchaseOrderItem.StandardRate, 4);
            purchaseOrderItem.DiscountAmount = CommonFunctions.parseAmount(purchaseOrderItem.SubTotal * purchaseOrderItem.DiscountPercentage / 100, 4);
            purchaseOrderItem.VATAmount = CommonFunctions.parseAmount((purchaseOrderItem.SubTotal - purchaseOrderItem.DiscountAmount) * purchaseOrderItem.VATPercentage / 100, 4);
            purchaseOrderItem.CCChargeApplicableAmount = CommonFunctions.parseAmount((purchaseOrderItem.FreeQuantity * purchaseOrderItem.StandardRate), 4)
            purchaseOrderItem.CCChargeAmount = CommonFunctions.parseAmount((purchaseOrderItem.FreeQuantity * purchaseOrderItem.StandardRate) * purchaseOrderItem.CCChargePercentage / 100, 4);
            purchaseOrderItem.TotalAmount = CommonFunctions.parseAmount(purchaseOrderItem.SubTotal - purchaseOrderItem.DiscountAmount + purchaseOrderItem.VATAmount + purchaseOrderItem.CCChargeAmount, 4);

            this.CalculationForPO();
        }
    }

    private CalculationForPO() {
        const purchaseOrderItems = this.PurchaseOrder.PurchaseOrderItems;
        this.PurchaseOrder.SubTotal = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.SubTotal, 0), 4);
        this.PurchaseOrder.DiscountAmount = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.DiscountAmount, 0), 4);
        this.PurchaseOrder.DiscountPercentage = CommonFunctions.parseAmount(this.PurchaseOrder.DiscountAmount / this.PurchaseOrder.SubTotal * 100, 4);
        this.PurchaseOrder.NonTaxableAmount = CommonFunctions.parseAmount(this.PurchaseOrder.SubTotal - this.PurchaseOrder.DiscountAmount, 4);
        this.PurchaseOrder.VATAmount = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.VATAmount, 0), 4);
        this.PurchaseOrder.VATPercentage = CommonFunctions.parseAmount(this.PurchaseOrder.VATAmount / this.PurchaseOrder.TaxableAmount * 100, 4);
        this.PurchaseOrder.TaxableAmount = this.PurchaseOrder.VATAmount;
        this.PurchaseOrder.CCChargeApplicableAmount = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.CCChargeApplicableAmount, 0), 4);
        this.PurchaseOrder.CCChargeAmount = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.CCChargeAmount, 0), 4);
        this.PurchaseOrder.CCChargePercentage = CommonFunctions.parseAmount(this.PurchaseOrder.CCChargeAmount / (this.PurchaseOrder.CCChargeApplicableAmount) * 100, 4);
        this.PurchaseOrder.TotalAmount = CommonFunctions.parseAmount(purchaseOrderItems.reduce((sum, item) => sum + item.TotalAmount, 0), 4);
    }

    EditItem(index: number): void {
        if (this.isVerificationAllowed === true) {
            if (this.PurchaseOrder.PurchaseOrderItems[index].IsEdited == true) {
                this.PurchaseOrder.PurchaseOrderItems[index].IsEdited = false;
                this.PurchaseOrder.PurchaseOrderItems[index].Quantity = this.CopyOfPurchaseOrderItems[index].Quantity;
                this.PurchaseOrder.PurchaseOrderItems[index].FreeQuantity = this.CopyOfPurchaseOrderItems[index].FreeQuantity;
                this.PurchaseOrder.PurchaseOrderItems[index].StandardRate = this.CopyOfPurchaseOrderItems[index].StandardRate;
                this.CalculationForPOItem(index);

            } else {
                this.PurchaseOrder.PurchaseOrderItems[index].IsEdited = true;
                var timer = setTimeout(() => {
                    var element = document.getElementById("rqRowEditQty" + index);
                    if (element != null) {
                        element.click();
                        clearInterval(timer);
                    }
                }, 500);
            }
        } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Editing this PO is forbidden."])
        }
    }

    CancelItem(index) {
        if (this.isVerificationAllowed == true) {
            if (this.PurchaseOrder.PurchaseOrderItems[index].IsActive == true) {
                this.PurchaseOrder.PurchaseOrderItems[index].POItemStatus = "cancel";
                this.PurchaseOrder.PurchaseOrderItems[index].IsActive = false;
                this.PurchaseOrder.PurchaseOrderItems[index].IsEdited = false;
                this.PurchaseOrder.PurchaseOrderItems[index].IsCancel = true;
            }
            else if (this.PurchaseOrder.PurchaseOrderItems[index].CancelledBy != null) {
                this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
            }
            else {
                this.PurchaseOrder.PurchaseOrderItems[index].POItemStatus = "active";
                this.PurchaseOrder.PurchaseOrderItems[index].IsActive = true;
            }
        } else {
            this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
        }
    }

    private CheckForVerificationApplicable() {
        if (this.IsVerificationAllowed == true && this.PurchaseOrder.POStatus == "pending") {
            this.isVerificationAllowed = true;
        }
        else if (this.IsVerificationAllowed == false && this.PurchaseOrder.POStatus == "pending") {
            this.isVerificationAllowed = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["You have verified this Order already."])
        }
        else {
            this.isVerificationAllowed = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Verifying this Order is not allowed."]);
        }
    }

    ApprovePurchaseOrder() {
        this.PurchaseOrder.CurrentVerificationLevel = this.CurrentVerificationLevel;
        this.PurchaseOrder.CurrentVerificationLevelCount = this.CurrentVerificationLevelCount;
        this.PurchaseOrder.MaxVerificationLevel = this.MaxVerificationLevel;
        this.PurchaseOrder.TransactionType = 'purchase-order';
        if (this.PurchaseOrder.PurchaseOrderItems.some(itm => itm.Quantity === 0 || itm.StandardRate === 0)) {
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Provide valid entry."]);
        }
        this.verificationBLService.ApprovePharmacyPurchaseOrder(this.PurchaseOrder).finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Order has been successfully approved."]);
                    this.callBackPopupClose.emit();
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Order has been failed to approved."]);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Order has been failed to approved." + err.ErrorMessage]);
                });

    }

    RejectPurchaseOrder() {
        this.verificationBLService.RejectPharmacyPurchaseOrder(this.PurchaseOrder.PurchaseOrderId, this.CurrentVerificationLevel, this.CurrentVerificationLevelCount, this.MaxVerificationLevel, this.PurchaseOrder.VerificationRemarks)
            .finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Order has been successfully rejected."]);
                    this.callBackPopupClose.emit();
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to reject this purchase order."]);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to reject this purchase order."]);
                });

    }




}