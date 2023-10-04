import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { SecurityService } from "../../security/shared/security.service";
import { BanksModel } from "../../settings-new/shared/banks.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { InsuranceClaimPayment } from "../shared/DTOs/ClaimManagement_ClaimPayment_DTO";
import { InsurancePendingClaim } from "../shared/DTOs/ClaimManagement_PendingClaims_DTO";
import { ClaimManagementBLService } from "../shared/claim-management.bl.service";


@Component({
    selector: 'new-claim-payment',
    templateUrl: './new-payment.component.html'
})
export class NewInsurancePaymentComponent {

    @Input("Claim")
    public claimDetail: InsurancePendingClaim = new InsurancePendingClaim();
    @Output("CloseNewPaymentPopUp")
    public PopUpCloseEmitter: EventEmitter<Object> = new EventEmitter<Object>();
    public newPaymentDetail: InsuranceClaimPayment = new InsuranceClaimPayment();
    public insurancePayments: Array<InsuranceClaimPayment> = new Array<InsuranceClaimPayment>();
    public bankList: Array<BanksModel> = new Array<BanksModel>();
    public selectedBank: string = "";
    public totalReceivedAmount: number = 0;
    public totalServiceCommissionAmount: number = 0;
    public totalPendingAmount: number = 0;
    public loading: boolean = false;
    public confirmationTitle: string = "Confirm !";
    public confirmationMessageForSavePayment: string = "Are you sure you want to Save Payment ?";
    public confirmationMessageForUpdatePayment: string = "Are you sure you want to Update Payment ?";
    public isPaymentUpdate: boolean = false;

    constructor(
        private messageBoxService: MessageboxService,
        private claimManagementBlService: ClaimManagementBLService,
        public securityService: SecurityService
    ) {
        this.GetBankList();
    }

    ngOnInit() {
        this.GetEarlierPayments();
    }

    public CloseNewPaymentPopUp(): void {
        this.isPaymentUpdate = false;
        this.PopUpCloseEmitter.emit();
    }

    public GetEarlierPayments(): void {
        this.isPaymentUpdate = false;
        this.claimManagementBlService.GetInsurancePayments(this.claimDetail.ClaimSubmissionId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.insurancePayments = res.Results;
                        let payments = _.cloneDeep(this.insurancePayments);
                        this.totalReceivedAmount = payments.reduce((a, b) => a + b.ReceivedAmount, 0);
                        this.totalServiceCommissionAmount = payments.reduce((a, b) => a + b.ServiceCommission, 0);
                        this.totalPendingAmount = this.claimDetail.ApprovedAmount - this.totalReceivedAmount;
                    }
                    else {
                        this.totalReceivedAmount = 0;
                        this.totalServiceCommissionAmount = 0;
                        this.totalPendingAmount = this.claimDetail.ApprovedAmount - this.totalReceivedAmount;
                    }
                    this.newPaymentDetail.ReceivedAmount = this.totalPendingAmount;
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
                }
            );
    }

    public GetBankList(): void {
        this.claimManagementBlService.GetBankList()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.bankList = res.Results;
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`No Bank Detail Found.`]);
                    }
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
                }
            );
    }

    public AssignBankDetail(): void {
        if (this.selectedBank) {
            this.newPaymentDetail.BankName = this.selectedBank;
        }
    }

    public SaveClaimPayment(): void {
        if (this.newPaymentDetail.ReceivedAmount > 0 && this.newPaymentDetail.ServiceCommission >= 0) {
            if (this.newPaymentDetail.ReceivedAmount <= this.totalPendingAmount) {
                this.loading = true;
                this.newPaymentDetail.ClaimSubmissionId = this.claimDetail.ClaimSubmissionId;
                this.newPaymentDetail.CreditOrganizationId = this.claimDetail.CreditOrganizationId;
                this.newPaymentDetail.ClaimCode = this.claimDetail.ClaimCode;
                this.claimManagementBlService.AddInsuranceClaimPayment(this.newPaymentDetail)
                    .finally(() => {
                        this.loading = false;
                        this.newPaymentDetail = new InsuranceClaimPayment();
                        this.selectedBank = "";
                        this.GetEarlierPayments();
                    })
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            if (res.Results) {
                                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Claim Payment is successfully saved.`]);
                            }
                            else {
                                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Unable to save the claim payment detail.`]);
                            }
                        }
                    },
                        (err: DanpheHTTPResponse) => {
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
                        }
                    );
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Received Amount can not be greater than the Pending to be Received Amount.`]);
                this.loading = false;
            }
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Invalid Amounts is entered, Please check it once.`]);
            this.loading = false;
        }
    }

    public EditPayment(payment: InsuranceClaimPayment) {
        this.newPaymentDetail = _.cloneDeep(payment);
        this.selectedBank = payment.BankName;
        this.isPaymentUpdate = true;
    }

    public UpdateClaimPayment(): void {
        if (this.newPaymentDetail.ReceivedAmount > 0 && this.newPaymentDetail.ServiceCommission >= 0) {
            if (this.newPaymentDetail.ReceivedAmount <= this.totalPendingAmount) {
                this.loading = true;
                this.newPaymentDetail.ClaimSubmissionId = this.claimDetail.ClaimSubmissionId;
                this.newPaymentDetail.CreditOrganizationId = this.claimDetail.CreditOrganizationId;
                this.newPaymentDetail.ClaimCode = this.claimDetail.ClaimCode;
                this.claimManagementBlService.UpdateInsuranceClaimPayment(this.newPaymentDetail)
                    .finally(() => {
                        this.loading = false;
                        this.newPaymentDetail = new InsuranceClaimPayment();
                        this.selectedBank = "";
                        this.GetEarlierPayments();
                    })
                    .subscribe((res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            if (res.Results) {
                                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Claim Payment is successfully Updated.`]);
                            }
                            else {
                                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, [`Unable to update claim payment detail.`]);
                            }
                        }
                    },
                        (err: DanpheHTTPResponse) => {
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error : ${err.ErrorMessage}`]);
                        }
                    );
            }
            else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Received Amount can not be greater than the Pending to be Received Amount.`]);
                this.loading = false;
            }
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Invalid Amounts is entered, Please check it once.`]);
            this.loading = false;
        }
    }

    public HandleConfirmForSavePayment(): void {
        this.loading = true;
        this.SaveClaimPayment();
    }

    public HandleCancelForSavePayment(): void {
        this.loading = false;
    }
    public HandleConfirmForUpdatePayment(): void {
        this.loading = true;
        this.UpdateClaimPayment();
    }

    public HandleCancelForUpdatePayment(): void {
        this.loading = false;
    }

    public DiscardChanges() {
        this.newPaymentDetail = new InsuranceClaimPayment();
        this.selectedBank = "";
        this.isPaymentUpdate = false;
    }
}