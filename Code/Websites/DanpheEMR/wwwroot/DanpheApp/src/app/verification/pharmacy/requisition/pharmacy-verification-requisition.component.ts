import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { CoreService } from "../../../core/shared/core.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { PharmacySubStoreRequisitionItemVerification_DTO } from "../shared/pharmacy-substore-requisition-item-verification.dto";
import { PharmacySubStoreRequisitionVerification_DTO } from "../shared/pharmacy-substore-requisition-verification.dto";

@Component({
    selector: 'pharmacy-verification-requisition',
    templateUrl: './pharmacy-verification-requisition.component.html'
})
export class PharmacyVerificationRequisitionComponent {
    isVerificationAllowed: boolean = false;
    headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
    @Input('requisition-id') RequisitionId: number = 0;
    @Input('is-verification-allowed') IsVerificationAllowed: boolean = false;
    @Input('current-verification-level') CurrentVerificationLevel: number = 0;
    @Input('current-verification-level-count') CurrentVerificationLevelCount: number = 0;
    @Input('max-verification-level') MaxVerificationLevel: number = 0;

    @Output('call-back-popup-close') callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();

    Requisition: PharmacySubStoreRequisitionVerification_DTO = new PharmacySubStoreRequisitionVerification_DTO();
    CopyOfRequisitionItems: PharmacySubStoreRequisitionItemVerification_DTO[] = [];
    loading: boolean = false;

    public GeneralFieldLabel = new GeneralFieldLabels();

    constructor(public coreService: CoreService, public verificationBLService: VerificationBLService, public messageBoxService: MessageboxService) {
        this.GetPharmacyBillingHeaderParameter();
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }

    ngOnInit() {
        if (this.RequisitionId) {
            this.GetRequisitionInfo(this.RequisitionId);
        }

    }

    GetPharmacyBillingHeaderParameter(): void {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
        if (paramValue) this.headerDetail = JSON.parse(paramValue);
    }

    GetRequisitionInfo(RequisitionId: number): void {
        this.verificationBLService.GetPharmacyRequisitionInfo(RequisitionId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.Requisition = res.Results.Requisition;
                this.Requisition.RequisitionItems = res.Results.RequisitionItems;
                this.Requisition.VerifierList = res.Results.VerifierList;
                this.CopyOfRequisitionItems = _.cloneDeep(this.Requisition.RequisitionItems);

                this.CheckForVerificationApplicable();
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get requisition details']);
            }
        }, err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get requisition details' + err.ErrorMessage]);
        })
    }

    private CheckForVerificationApplicable() {
        if (this.IsVerificationAllowed == true && this.Requisition.RequisitionStatus == "pending") {
            this.isVerificationAllowed = true;
        }
        else if (this.IsVerificationAllowed == false && this.Requisition.RequisitionStatus == "pending") {
            this.isVerificationAllowed = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["You have already verified this requisition."])
        }
        else {
            this.isVerificationAllowed = false;
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Verifying this Order is not allowed."]);
        }
    }

    EditItem(index: number): void {
        if (this.isVerificationAllowed === true) {
            if (this.Requisition.RequisitionItems[index].IsEdited == true) {
                this.Requisition.RequisitionItems[index].IsEdited = false;
                this.Requisition.RequisitionItems[index].Quantity = this.CopyOfRequisitionItems[index].Quantity;

            } else {
                this.Requisition.RequisitionItems[index].IsEdited = true;
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
            if (this.Requisition.RequisitionItems[index].IsActive == true) {
                this.Requisition.RequisitionItems[index].RequisitionItemStatus = "cancel";
                this.Requisition.RequisitionItems[index].IsActive = false;
                this.Requisition.RequisitionItems[index].IsEdited = false;
            }
            else if (this.Requisition.RequisitionItems[index].CancelledBy != null) {
                this.messageBoxService.showMessage("Failed", ["You can not undo this item cancellation."])
            }
            else {
                this.Requisition.RequisitionItems[index].RequisitionItemStatus = "active";
                this.Requisition.RequisitionItems[index].IsActive = true;
            }
        } else {
            this.messageBoxService.showMessage("Failed", ["Cancelling this item is forbidden."])
        }
    }



    ApproveRequisition() {
        if (this.Requisition.VerificationRemarks !== undefined && this.Requisition.VerificationRemarks.trim().length > 0) {
            this.Requisition.CurrentVerificationLevel = this.CurrentVerificationLevel;
            this.Requisition.CurrentVerificationLevelCount = this.CurrentVerificationLevelCount;
            this.Requisition.MaxVerificationLevel = this.MaxVerificationLevel;
            this.Requisition.TransactionType = 'requisition';
            if (this.Requisition.RequisitionItems.some(itm => itm.Quantity === 0 || itm.Quantity === null)) {
                return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Provide valid entry."]);
            }
            this.verificationBLService.ApprovePharmacyRequisition(this.Requisition).finally(() => this.loading = false)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition has been successfully approved."]);
                        this.callBackPopupClose.emit();
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Requisition has been failed to approved."]);
                    }
                },
                    err => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Requisition has been failed to approved." + err.ErrorMessage]);
                    });
        }
        else
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Enter Remarks"]);


    }

    RejectRequisition() {
        this.verificationBLService.RejectPharmacyRequisition(this.Requisition.RequisitionId, this.CurrentVerificationLevel, this.CurrentVerificationLevelCount, this.MaxVerificationLevel, this.Requisition.VerificationRemarks)
            .finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition has been successfully rejected."]);
                    this.callBackPopupClose.emit();
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Requisition to reject this purchase order."]);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Requisition to reject this purchase order."]);
                });
    }



}