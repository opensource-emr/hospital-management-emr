import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from 'lodash';
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { ReferralCommission_DTO } from "../../Shared/DTOs/referral-commission.dto";
import { ReferralParty_DTO } from "../../Shared/DTOs/referral-party.dto";
import { ReferralScheme_DTO } from "../../Shared/DTOs/referral-scheme.dto";
import { TransactionBillDetails_DTO } from "../../Shared/DTOs/referral-transaction-bill-details.dto";
import { MarketingReferralBLService } from "../../Shared/marketingreferral.bl.service";


@Component({
    selector: "mktreferral-transaction-Add",
    templateUrl: "./mktreferral-transaction-Add.component.html",
})
export class MarketingReferralAddTransactionComponent {
    @Output("callback-close")
    callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
    showIsInvoiceSelected: boolean;
    @Input("show-add-page")
    ShowAddPage: boolean;
    @Input() selectedRowData: any;
    public billDetails = new Array<TransactionBillDetails_DTO>();
    public referralSchemeList: ReferralScheme_DTO[] = [];
    public referringPartyList = new Array<ReferralParty_DTO>();
    public Amount: number;
    public ReferralEntryValidator: FormGroup = null;

    public selectedReferralScheme: ReferralScheme_DTO = new ReferralScheme_DTO();
    public selectedReferringPartyObj: ReferralParty_DTO = new ReferralParty_DTO();
    public selectedReferringParty: ReferralParty_DTO;
    public selectedRemarks: string = '';
    public loading: boolean = false;
    public referralCommissionObj: ReferralCommission_DTO = new ReferralCommission_DTO();
    public alreadyAddedCommission: Array<ReferralCommission_DTO> = new Array<ReferralCommission_DTO>();
    public alreadyAddedCommissionList: Array<ReferralCommission_DTO> = new Array<ReferralCommission_DTO>();
    public referralSchemeObj: ReferralScheme_DTO = new ReferralScheme_DTO();
    public MaximumReferralPercentagePerInvoice: number = 0;
    public ShowPercentageAndAmount = {
        ShowPercentage: false,
        ShowCommissionAmount: false
    };
    InvoiceDate: any;
    constructor(public messageBoxService: MessageboxService,
        public mktReferralBLService: MarketingReferralBLService,
        public coreService: CoreService,

    ) {
        var _formbuilder = new FormBuilder();
        this.ReferralEntryValidator = _formbuilder.group({
            'ReferralSchemeId': ['', Validators.required],
            'ReferringPartyId': ['', Validators.required],
        });
        this.ReadParameter();
    }
    ngOnInit() {
        const selectedRowData = this.selectedRowData;
        if (selectedRowData && selectedRowData.BillingTransactionId) {
            this.GetBillDetails(selectedRowData.BillingTransactionId);
            this.GetAlreadyAddedCommission(selectedRowData.BillingTransactionId);
        }
        this.GetReferralScheme();
        this.GetReferringParty();
    }
    ReadParameter() {
        let Parameter = this.coreService.Parameters;
        let param = Parameter.find(parms => parms.ParameterGroupName == "MarketingReferral" && parms.ParameterName == "MaxMarketingreferralPercentPerInvoice");
        if (param) {
            this.MaximumReferralPercentagePerInvoice = JSON.parse(param.ParameterValue);
        }

        let showPercentAndAmount = Parameter.find(a => a.ParameterGroupName === "MarketingReferral" && a.ParameterName === "MktReferralTransactionDisplaySettings");
        if (showPercentAndAmount) {
            this.ShowPercentageAndAmount = JSON.parse(showPercentAndAmount.ParameterValue);
        }
    }

    Close() {
        this.showIsInvoiceSelected = false;
        this.callbackClose.emit({ 'action': 'close' });
        this.Clear();
    }

    Clear() {
        this.showIsInvoiceSelected = true;
        this.selectedReferralScheme = new ReferralScheme_DTO();
        this.selectedReferringParty = null;
        this.selectedRemarks = "";
        this.selectedReferringPartyObj = new ReferralParty_DTO();
        this.Amount = null;
        this.referralSchemeObj = new ReferralScheme_DTO();
    }
    onReferralSchemeSelected(event: any) {
        const selectedValue = event.target.value;
        let selectedId;

        if (typeof selectedValue === 'object' && selectedValue !== null) {
            selectedId = selectedValue.id;
        } else {
            selectedId = parseInt(selectedValue.split(':')[0].trim(), 10);
        }
        this.selectedReferralScheme = this.referralSchemeList.find(scheme => scheme.ReferralSchemeId === selectedId);
        if (this.selectedReferralScheme) {
            this.referralSchemeObj.ReferralSchemeId = this.selectedReferralScheme.ReferralSchemeId;
            this.referralSchemeObj.ReferralPercentage = this.selectedReferralScheme.ReferralPercentage;
            this.calculateAmount();
        }

    }

    calculateAmount() {
        const NetAmount = this.selectedRowData.NetAmount;
        const percent = this.selectedReferralScheme.ReferralPercentage;
        this.Amount = NetAmount * (percent / 100);
    }
    onReferringPartySelected(event: any) {
        if (event) {
            if (typeof (event) === ENUM_Data_Type.Object) {
                const selectedReferringPartyId = event.ReferringPartyId;
                if (selectedReferringPartyId) {
                    // if referring party does not exist then proceed further assign its value 

                    const selectedReferringParty = this.referringPartyList.find(p => p.ReferringPartyId === selectedReferringPartyId);
                    if (selectedReferringParty) {

                        this.selectedReferringPartyObj.ReferringPartyName = selectedReferringParty.ReferringPartyName;
                        this.selectedReferringPartyObj.VehicleNumber = selectedReferringParty.VehicleNumber;
                        this.selectedReferringPartyObj.AreaCode = selectedReferringParty.AreaCode;
                        this.selectedReferringPartyObj.GroupName = selectedReferringParty.GroupName;
                        this.selectedReferringPartyObj.ReferringOrganizationName = selectedReferringParty.ReferringOrganizationName;
                        this.selectedReferringPartyObj.ReferringPartyId = selectedReferringParty.ReferringPartyId;
                    }

                }
            }
            else {
                this.selectedReferringPartyObj = new ReferralParty_DTO();
            }
        }
    }
    AssignValueToSave(): boolean {
        this.referralCommissionObj.ReferralSchemeId = this.referralSchemeObj.ReferralSchemeId;
        this.referralCommissionObj.ReferringPartyId = this.selectedReferringPartyObj.ReferringPartyId;
        this.referralCommissionObj.ReferringPartyName = this.selectedReferringPartyObj.ReferringPartyName;
        this.referralCommissionObj.VehicleNumber = this.selectedReferringPartyObj.VehicleNumber;
        this.referralCommissionObj.AreaCode = this.selectedReferringPartyObj.AreaCode;
        this.referralCommissionObj.ReferringPartyGroupName = this.selectedReferringPartyObj.GroupName;
        this.referralCommissionObj.ReferringOrganizationName = this.selectedReferringPartyObj.ReferringOrganizationName;
        this.referralCommissionObj.Remarks = this.selectedRemarks;
        this.referralCommissionObj.ReferralAmount = this.Amount;
        this.referralCommissionObj.Percentage = this.referralSchemeObj.ReferralPercentage;
        this.referralCommissionObj.ReferringOrganizationName = this.selectedReferringPartyObj.ReferringOrganizationName;
        this.referralCommissionObj.BillingTransactionId = this.selectedRowData.BillingTransactionId;
        this.referralCommissionObj.InvoiceNoFormatted = this.selectedRowData.InvoiceNoFormatted;
        this.referralCommissionObj.InvoiceDate = this.selectedRowData.CreatedOn;
        this.referralCommissionObj.PatientId = this.selectedRowData.PatientId;
        this.referralCommissionObj.PatientVisitId = this.selectedRowData.PatientVisitId;
        this.referralCommissionObj.InvoiceTotalAmount = this.selectedRowData.TotalAmount;
        this.referralCommissionObj.ReturnAmount = this.selectedRowData.ReturnCashAmount;
        this.referralCommissionObj.InvoiceNetAmount = this.selectedRowData.NetAmount;
        this.referralCommissionObj.FiscalYearId = this.selectedRowData.FiscalYearId;
        return this.CheckExistingMapping();
    }

    CheckExistingMapping(): boolean {
        if (this.referralCommissionObj.ReferralSchemeId && this.referralCommissionObj.ReferringPartyId) {
            let tempReferralComissionObj = _.cloneDeep(this.alreadyAddedCommissionList);
            let sumOfReferralCommisionPercent = tempReferralComissionObj.reduce((a, b) => a + b.Percentage, 0);
            if (sumOfReferralCommisionPercent + this.referralCommissionObj.Percentage > this.MaximumReferralPercentagePerInvoice) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Sum of Referral Comission Percentage cannot be more than ${this.MaximumReferralPercentagePerInvoice}`])
                return false;
            }
            const isSameSchemeExists = this.alreadyAddedCommissionList.some(a =>
                a.ReferralSchemeId === this.referralCommissionObj.ReferralSchemeId &&
                a.ReferringPartyId !== this.referralCommissionObj.ReferringPartyId

            );
            if (isSameSchemeExists) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Referral Scheme already exists, Please try with different Referral Scheme.']);
                return false;
            }
            const isSamePartyExists = this.alreadyAddedCommissionList.some(a =>
                a.ReferralSchemeId !== this.referralCommissionObj.ReferralSchemeId &&
                a.ReferringPartyId === this.referralCommissionObj.ReferringPartyId);
            if (isSamePartyExists) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Referring Party already exists, Please try with different Referring Party.']);
                return false;
            }
            const isSameSchemeAndreferringPartyExists = this.alreadyAddedCommissionList.some(a =>
                a.ReferralSchemeId === this.referralCommissionObj.ReferralSchemeId &&
                a.ReferringPartyId === this.referralCommissionObj.ReferringPartyId
            );
            if (isSameSchemeAndreferringPartyExists) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Referral Scheme and Referring Party already exists,Please try with different referral Scheme and Referring Party.']);
                return false;
            }

            else {
                return true;
            }
        } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['Please, Enter Mandatory fields']);
        }
    }
    SaveNewReferral() {
        this.loading = true;
        if (this.AssignValueToSave()) {
            for (var i in this.ReferralEntryValidator.controls) {
                this.ReferralEntryValidator.controls[i].markAsDirty();
                this.ReferralEntryValidator.controls[i].updateValueAndValidity();
            }
            if (this.IsValidCheck(undefined, undefined)) {
                this.mktReferralBLService
                    .SaveNewReferral(this.referralCommissionObj)
                    .subscribe(
                        (res: DanpheHTTPResponse) => {
                            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                                if (res.Results) {
                                    this.messageBoxService.showMessage(
                                        ENUM_MessageBox_Status.Success,
                                        [`Successfully Saved`]
                                    );
                                    this.loading = false;
                                    this.Clear();
                                    this.GetAlreadyAddedCommission(res.Results.billTransactionId);
                                }
                            } else {
                                this.loading = false;
                                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                                    `Error: ${res.ErrorMessage}`,
                                ]);
                                this.loading = false;
                            }
                        },
                        (err: DanpheHTTPResponse) => {
                            this.loading = false;
                            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                                `Error: ${err.ErrorMessage}`,
                            ]);
                        }
                    );
            }
        }
    }
    confirmDelete(referralCommissionId: number) {
        const result = window.confirm("Are you sure you want to delete this Referral commission?");

        if (result) {
            this.DeleteReferralCommission(referralCommissionId);
        } else {

        }
    }

    DeleteReferralCommission(ReferralCommissionId: number) {
        this.mktReferralBLService.DeleteReferralCommission(ReferralCommissionId).subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {

                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Commission Deleted Successfully']);
                    let index = this.alreadyAddedCommissionList.findIndex(a => a.ReferralCommissionId === ReferralCommissionId);
                    this.alreadyAddedCommissionList.splice(index, 1);
                    this.Clear();

                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }

    GetBillDetails(BillingTransactionId: number) {
        this.mktReferralBLService.GetBillDetails(this.selectedRowData.BillingTransactionId).subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.billDetails = res.Results;
                    } else {
                        this.billDetails = [];
                    }
                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }
    GetReferralScheme() {
        this.mktReferralBLService.GetReferralScheme().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referralSchemeList = res.Results;
                    } else {
                        this.referralSchemeList = [];
                    }
                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }
    GetReferringParty() {
        this.mktReferralBLService.GetReferringParty().subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.referringPartyList = res.Results.filter(p => p.IsActive === true);
                    } else {
                        this.referringPartyList = [];
                    }
                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }
    GetAlreadyAddedCommission(BillingTransactionId: number) {
        this.mktReferralBLService.GetAlreadyAddedCommission(this.selectedRowData.BillingTransactionId).subscribe(
            (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    if (res.Results && res.Results.length > 0) {
                        this.alreadyAddedCommission = res.Results;
                        this.alreadyAddedCommissionList = this.alreadyAddedCommission;
                    }
                } else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                        `Error: ${res.ErrorMessage}`,
                    ]);
                }
            },
            (err: DanpheHTTPResponse) => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
                    `Error: ${err.ErrorMessage}`,
                ]);
            }
        );
    }
    // ReferringPartiesListFormatter(data: any): string {
    //     let html = data["ReferringPartyName"];
    //     return html;
    // }
    ReferringPartiesListFormatter(data: any): string {
        let html: string = "";
        html = "<font color='blue'; size=02 >" + data["ReferringPartyName"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["GroupName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
        html += "(" + data["VehicleNumber"] + ")" + "&nbsp;&nbsp;" + data["ReferringOrganizationName"] + "&nbsp;&nbsp;";
        return html;
    }
    public IsValid(): boolean {
        if (this.ReferralEntryValidator.valid) { return true; }
        else { return false; }
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReferralEntryValidator.valid;
        }
        else
            return !(this.ReferralEntryValidator.hasError(validator, fieldName));
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReferralEntryValidator.dirty;
        else
            return this.ReferralEntryValidator.controls[fieldName].dirty;
    }

}