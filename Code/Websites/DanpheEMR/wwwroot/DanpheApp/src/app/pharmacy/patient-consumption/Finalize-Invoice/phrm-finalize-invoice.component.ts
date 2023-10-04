import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from "moment";
import { CoreBLService } from "../../../core/shared/core.bl.service";
import { CoreService } from "../../../core/shared/core.service";
import { PaymentModes } from "../../../settings-new/shared/PaymentMode";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_BillPaymentMode, ENUM_BillingStatus, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_EmpCashTransactionType, ENUM_MessageBox_Status, ENUM_ModuleName, ENUM_Scheme_FieldSettingParamNames } from "../../../shared/shared-enums";
import { PHRMEmployeeCashTransaction } from "../../shared/pharmacy-employee-cash-transaction";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMPatientConsumptionItem } from "../shared/phrm-patient-consumption-item.model";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";
import { Scheme_DTO } from "../shared/scheme.dto";

@Component({
    selector: 'phrm-finalize-invoice',
    templateUrl: "./phrm-finalize-invoice.html",
})
export class PHRMFinalizeInvoiceComponent {
    masterPaymentModes: Array<PaymentModes> = new Array<PaymentModes>();
    PaymentMode: PaymentModes = new PaymentModes();
    @Input('currrentCounterId') public currrentCounterId: number = null;
    @Input('PatientConsumptionWithItems') public PatientConsumptionWithItems: Array<PHRMPatientConsumptionItem> = new Array<PHRMPatientConsumptionItem>();
    @Input('patient-consumption') public PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
    PatientConsumptionData: PHRMPatientConsumption = new PHRMPatientConsumption();
    @Output("Finalize-Popup-Close") public FinalizePopupClose: EventEmitter<Object> = new EventEmitter<Object>();
    isFinalizeInvoice: boolean = false;
    showSaleInvoice: boolean = false;
    InvoiceId: number = 0;
    @Input('store-id') StoreId: number = 0;
    IsAllAmountPaidByPatient: boolean = false;
    DisablePaymentModeDropDown: boolean = false;
    public patSummary = { IsLoaded: false, PatientId: 0, CreditAmount: 0, ProvisionalAmt: 0, TotalDue: 0, DepositBalance: 0, BalanceAmount: 0, GeneralCreditLimit: 0, IpCreditLimit: 0, OpCreditLimit: 0, OpBalance: 0, IpBalance: 0 };
    deductDeposit: boolean = false;
    newdepositBalance: number = 0;
    depositDeductAmount: number = 0;
    TempEmployeeCashTransaction: PHRMEmployeeCashTransaction[];
    phrmEmpCashTxn: PHRMEmployeeCashTransaction = new PHRMEmployeeCashTransaction();
    MstPaymentModes: any = [];
    loading: boolean = false;
    Remark: string = "";
    SchemePriceCategory: Scheme_DTO;
    DisableDiscountInputField: boolean = false;
    IsSchemeDetailLoaded: boolean = false;
    confirmationTitle: string = "Confirm !";
    confirmationMessage: string = "Are you sure you want to Proceed ?";
    IsDiscountPercentageChanged: boolean = false;


    constructor(public coreBlService: CoreBLService, public pharmacyBLService: PharmacyBLService, public messageboxService: MessageboxService, public routeFromService: RouteFromService, public coreService: CoreService) {
        this.MstPaymentModes = this.coreService.masterPaymentModes;
    }
    ngOnInit(): void {
        let patientConsumption = new PHRMPatientConsumption();
        this.PatientConsumptionData = Object.assign(patientConsumption, this.PatientConsumption);
        if (this.PatientConsumptionData && this.PatientConsumptionData.PatientId) {
            this.GetPatientDetails(this.PatientConsumptionData.PatientId);
        }
    }

    private GetPatientDetails(PatientId: number) {
        this.pharmacyBLService.GetPatientByPatId(PatientId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.GetSchemeDetails(res.Results.SchemeId)
                }
            }
            );
    }

    PrintReceipt(): void {
        try {
            if (this.SchemePriceCategory.SchemeName !== ENUM_Scheme_FieldSettingParamNames.General.toUpperCase()) {
                this.PatientConsumptionData.PaymentMode = this.PatientConsumptionData.CoPaymentMode;
            }
            if (this.PatientConsumptionData.CoPaymentMode === ENUM_BillPaymentMode.credit || this.PatientConsumptionData.PaymentMode === ENUM_BillPaymentMode.credit) {
                if (!this.PatientConsumptionData.OrganizationId) {
                    return this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Credit Organization is mandatory for credit sale.']);
                }
                if (!this.Remark.trim().length) {
                    return this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Remarks is mandatory for credit sale.']);
                }
            }
            if (this.PatientConsumptionData.ReceivedAmount < 0) {
                return this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Received Amount cannot be less than 0!']);
            }
            if (this.PatientConsumptionData.ReceivedAmount > this.PatientConsumptionData.TotalAmount) {
                return this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Received Amount cannot be more than TotalAmount!']);
            }
            this.PatientConsumptionData.Remark = this.Remark;
            this.PatientConsumptionData.CounterId = this.currrentCounterId;
            this.PatientConsumptionData.StoreId = this.StoreId;
            this.PatientConsumptionData.PatientConsumptionItems.forEach(Item => {
                Item.Quantity = Item.RemainingQuantity;
                Item.CounterId = this.currrentCounterId
                Item.StoreId = this.StoreId;
            });
            this.loading = true;
            this.pharmacyBLService.PostPatientConsumptionInvoiceItems(this.PatientConsumptionData)
                .finally(() => this.loading = false)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.CallBackSaveSale(res);
                    }
                    else {
                        this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ['There is problem, please try again']);
                    }
                },
                    err => {
                        this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, [`Failed to save invoice. ${err.ErrorMessage}`]);
                    }
                );


        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    CallBackSaveSale(res) {
        try {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.showSaleInvoice = true;
                this.InvoiceId = res.Results;
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Success, ["Succesfully Finalized "]);
            }
            else {
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
        }
    }

    InitialCalculation() {
        let subTotal = 0;
        let discountPercentage = 0;
        let discountAmount = 0;
        let totalAmount = 0;
        let CoPaymentCashAmount = 0;
        let CoPaymentCreditAmount = 0;
        let ReceivedAmount = 0;

        subTotal = this.PatientConsumptionData.PatientConsumptionItems.reduce((acc, item) => acc + item.SubTotal, 0);
        discountAmount = this.PatientConsumptionData.PatientConsumptionItems.reduce((acc, item) => acc + item.DiscountAmount, 0);
        if (!this.IsDiscountPercentageChanged) {
            discountPercentage = discountAmount / subTotal * 100;
            this.PatientConsumptionData.DiscountPercentage = CommonFunctions.parseAmount(discountPercentage, 4);
        }
        totalAmount = subTotal - discountAmount;

        this.PatientConsumptionData.SubTotal = CommonFunctions.parseAmount(subTotal, 4);
        this.PatientConsumptionData.DiscountAmount = CommonFunctions.parseAmount(discountAmount, 4);
        this.PatientConsumptionData.TotalAmount = CommonFunctions.parseAmount(totalAmount, 4);

        if (this.PatientConsumptionData.CoPaymentMode === ENUM_BillPaymentMode.credit) {
            if (this.PatientConsumptionData.IsCoPayment && this.PatientConsumptionData.Copayment_CashPercent) {
                CoPaymentCashAmount = totalAmount * this.PatientConsumptionData.Copayment_CashPercent / 100;
                CoPaymentCreditAmount = totalAmount - CoPaymentCashAmount;
                ReceivedAmount = CommonFunctions.parseAmount(CoPaymentCashAmount, 4);

            }
            else
                ReceivedAmount = this.PatientConsumptionData.TotalAmount;
        }
        else {
            ReceivedAmount = this.PatientConsumptionData.TotalAmount;
        }
        this.PatientConsumptionData.CoPaymentCashAmount = CommonFunctions.parseAmount(CoPaymentCashAmount, 4);
        this.PatientConsumptionData.CoPaymentCreditAmount = CommonFunctions.parseAmount(CoPaymentCreditAmount, 4);
        this.PatientConsumptionData.ReceivedAmount = ReceivedAmount;
        this.PatientConsumptionData.PaidAmount = this.PatientConsumptionData.ReceivedAmount;
        this.PatientConsumptionData.Tender = this.PatientConsumptionData.PaidAmount;

    }

    OnDiscountChange(disAmt: number, disPer: number) {
        let discountAmount = 0;
        let discountPercentage = 0;
        discountAmount = disAmt ? disAmt : 0;
        discountPercentage = disPer ? disPer : 0;
        if (discountPercentage > 0 && discountAmount === 0) {
            this.IsDiscountPercentageChanged = true;
            this.PatientConsumptionData.PatientConsumptionItems.forEach(item => {
                item.DiscountPercentage = discountPercentage;
                let discountAmount = 0;
                discountAmount = item.SubTotal * discountPercentage / 100;
                item.DiscountAmount = CommonFunctions.parseAmount(discountAmount, 4);
                item.TotalAmount = CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount, 4);
            });
        }
        if (discountPercentage === 0 && discountAmount > 0) {
            this.IsDiscountPercentageChanged = false;
            let discountPercentage = 0;
            discountPercentage = discountAmount / this.PatientConsumptionData.SubTotal * 100;
            this.PatientConsumptionData.PatientConsumptionItems.forEach(item => {
                item.DiscountPercentage = CommonFunctions.parseAmount(discountPercentage, 4);
                let discountAmt = item.SubTotal * discountPercentage / 100;
                item.DiscountAmount = CommonFunctions.parseAmount(discountAmt, 4);
                item.TotalAmount = CommonFunctions.parseAmount(item.SubTotal - item.DiscountAmount, 4);
            });
        }
        this.InitialCalculation();
    }

    OnTenderChange() {
        if (this.PatientConsumptionData.Tender > 0) {
            if (this.deductDeposit) {
                this.PatientConsumptionData.Change = CommonFunctions.parseAmount(this.PatientConsumptionData.Tender + this.patSummary.DepositBalance - this.PatientConsumptionData.PaidAmount, 4);
            }
            else {
                this.PatientConsumptionData.Change = CommonFunctions.parseAmount(this.PatientConsumptionData.Tender - this.PatientConsumptionData.PaidAmount, 4);
            }
        }
        else {
            this.PatientConsumptionData.Tender = this.PatientConsumptionData.PaidAmount;
            this.PatientConsumptionData.Change = 0;
        }
    }
    OnInvoicePopUpClose() {
        this.showSaleInvoice = false;
        this.FinalizePopupClose.emit();
    }

    GetSchemeDetails(SchemeId: number) {
        this.pharmacyBLService.GetPharmacyIpBillingScheme(SchemeId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.SchemePriceCategory = res.Results;
                this.PatientConsumptionData.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
                this.PatientConsumptionData.Copayment_CashPercent = this.SchemePriceCategory.CoPaymentCashPercent;
                this.PatientConsumptionData.CoPaymentMode = this.SchemePriceCategory.DefaultPaymentMode;
                this.PatientConsumptionData.PriceCategoryId = this.SchemePriceCategory.DefaultPriceCategoryId;
                if (this.SchemePriceCategory.IsCreditOnlyScheme && !this.SchemePriceCategory.IsCoPayment) {
                    this.DisablePaymentModeDropDown = true;
                } else {
                    this.DisablePaymentModeDropDown = false;
                }
                this.PatientConsumptionData.IsCoPayment = this.SchemePriceCategory.IsCoPayment;
                this.PatientConsumptionData.IsDiscountApplicable = this.SchemePriceCategory.IsDiscountApplicable;

                if (this.SchemePriceCategory.IsCoPayment) {
                    this.PatientConsumptionData.PaymentMode = ENUM_BillPaymentMode.credit;
                    this.PatientConsumptionData.CoPaymentMode = ENUM_BillPaymentMode.credit;
                    this.PatientConsumptionData.Copayment_CashPercent = this.SchemePriceCategory.CoPaymentCashPercent;
                    this.PatientConsumptionData.Copayment_CreditPercent = this.SchemePriceCategory.CoPaymentCreditPercent;
                }
                this.IsSchemeDetailLoaded = true;
                setTimeout(() => {
                    this.InitialCalculation();
                }, 500);


                this.LoadPatientInvoiceSummary(this.PatientConsumptionData.PatientId, this.PatientConsumptionData.SchemeId, this.PatientConsumptionData.PatientVisitId);
            }
        })
    }
    ReceivedAmountChange() {
        if (this.CheckValidationForReceivedAmount()) {
            this.PatientConsumptionData.CoPaymentCashAmount = this.PatientConsumptionData.ReceivedAmount;
            this.PatientConsumptionData.CoPaymentCreditAmount = this.PatientConsumptionData.TotalAmount - this.PatientConsumptionData.ReceivedAmount;
            if (this.PatientConsumptionData.CoPaymentCreditAmount === 0) {
                this.PatientConsumptionData.CoPaymentMode = ENUM_BillPaymentMode.cash;
                this.IsAllAmountPaidByPatient = true;
            }
        }
    }

    CheckValidationForReceivedAmount() {
        let isValidAmount = true;
        let ReceivedAmount = this.PatientConsumptionData.ReceivedAmount;
        if (ReceivedAmount < 0) {
            isValidAmount = false;
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be less than 0!"]);
            return;
        }
        if (ReceivedAmount > this.PatientConsumptionData.TotalAmount) {
            isValidAmount = false;
            this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be more than TotalAmount!"]);
            return;
        }
        if (this.PatientConsumptionData.IsCoPayment) {
            let CoPaymentCashAmount = CommonFunctions.parsePhrmAmount(this.PatientConsumptionData.TotalAmount * this.PatientConsumptionData.Copayment_CashPercent / 100);
            if (ReceivedAmount < CoPaymentCashAmount) {
                isValidAmount = false;
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Notice, ["Cash cannot be less than CoPaymentCash Amount!"]);
                return;
            }
        }
        return isValidAmount;
    }

    OnPaymentModeChange() {
        if (this.PatientConsumptionData.PaymentMode.toLowerCase() === ENUM_BillPaymentMode.credit) {
            this.PatientConsumptionData.PaidAmount = 0;
            this.PatientConsumptionData.BillingStatus = ENUM_BillingStatus.unpaid;
            this.PatientConsumptionData.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
            this.PatientConsumptionData.Tender = 0;
        }
        else {
            this.PatientConsumptionData.PaidAmount = this.PatientConsumptionData.Tender - this.PatientConsumptionData.Change;
            this.PatientConsumptionData.BillingStatus = ENUM_BillingStatus.paid;

            if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && !this.deductDeposit) {
                let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.PatientConsumptionData.PaymentMode.toLocaleLowerCase());
                let empCashTxnObj = new PHRMEmployeeCashTransaction();
                empCashTxnObj.InAmount = this.PatientConsumptionData.ReceivedAmount;
                empCashTxnObj.OutAmount = 0;
                empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
                empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
                empCashTxnObj.TransactionType = ENUM_EmpCashTransactionType.CashSales;
                this.TempEmployeeCashTransaction.push(empCashTxnObj);
            }
            if (this.TempEmployeeCashTransaction && !this.TempEmployeeCashTransaction.length && this.deductDeposit) {
                let obj = this.MstPaymentModes.find(a => a.PaymentSubCategoryName.toLowerCase() == this.PatientConsumptionData.PaymentMode.toLocaleLowerCase());
                let empCashTxnObj = new PHRMEmployeeCashTransaction();
                empCashTxnObj.InAmount = this.PatientConsumptionData.DepositUsed;
                empCashTxnObj.OutAmount = 0;
                empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
                empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
                empCashTxnObj.TransactionType = ENUM_EmpCashTransactionType.DepositDeduct;
                this.TempEmployeeCashTransaction.push(empCashTxnObj);

                if ((this.PatientConsumptionData.TotalAmount - this.PatientConsumptionData.DepositUsed) > 0) {
                    let empCashTxnObj = new PHRMEmployeeCashTransaction();
                    let obj = this.MstPaymentModes[0];
                    empCashTxnObj.InAmount = this.PatientConsumptionData.ReceivedAmount - this.PatientConsumptionData.DepositUsed;
                    empCashTxnObj.OutAmount = 0;
                    empCashTxnObj.PaymentModeSubCategoryId = obj.PaymentSubcategoryId;
                    empCashTxnObj.ModuleName = ENUM_ModuleName.Dispensary;
                    this.TempEmployeeCashTransaction.push(empCashTxnObj);
                }
            }


        }
    }

    PaymentModeChange($event) {
        this.PatientConsumptionData.PaymentMode = $event.PaymentMode.toLowerCase();
        this.PatientConsumptionData.PaymentDetails = $event.PaymentDetails;
        this.OnPaymentModeChange();
    }


    CreditOrganizationChanges($event) {
        this.PatientConsumptionData.OrganizationId = $event.OrganizationId;
        this.PatientConsumptionData.CreditOrganizationName = $event.OrganizationName;
    }


    CalculateDepositBalance() {
        if (this.deductDeposit) {
            if (this.patSummary.DepositBalance > 0) {
                this.newdepositBalance = this.patSummary.DepositBalance - this.PatientConsumptionData.PaidAmount;
                this.newdepositBalance = CommonFunctions.parseAmount(this.newdepositBalance);
                if (this.newdepositBalance >= 0) {
                    this.depositDeductAmount = this.PatientConsumptionData.PaidAmount;
                    this.PatientConsumptionData.Tender = this.PatientConsumptionData.PaidAmount;
                    this.PatientConsumptionData.Change = 0;
                }
                else {
                    this.PatientConsumptionData.Tender = -(this.newdepositBalance);
                    this.depositDeductAmount = this.patSummary.DepositBalance;
                    this.newdepositBalance = 0;
                    this.PatientConsumptionData.Change = 0;
                }
                this.PatientConsumptionData.DepositDeductAmount = this.depositDeductAmount;
            }
            else {
                this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ["Deposit balance is zero, Please add deposit to use this feature."]);
                this.deductDeposit = !this.deductDeposit;
            }
        }
        else {
            this.PatientConsumptionData.Tender = this.PatientConsumptionData.TotalAmount;
            this.newdepositBalance = this.patSummary.DepositBalance;
            this.depositDeductAmount = 0;
            this.PatientConsumptionData.Change = 0;
        }
    }


    MultiplePaymentCallBack($event: any) {
        if ($event && $event.MultiPaymentDetail) {
            this.TempEmployeeCashTransaction = new Array<PHRMEmployeeCashTransaction>();
            if ((this.phrmEmpCashTxn != null || this.phrmEmpCashTxn != undefined) && this.phrmEmpCashTxn.PaymentModeSubCategoryId > 0) {
                this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
                this.TempEmployeeCashTransaction.push(this.phrmEmpCashTxn);
            } else {
                this.TempEmployeeCashTransaction = $event.MultiPaymentDetail;
            }
            var isDepositUsed = this.TempEmployeeCashTransaction.find(a => a.PaymentSubCategoryName.toLocaleLowerCase() === 'deposit');
            if (isDepositUsed) {
                this.deductDeposit = true;
                this.CalculateDepositBalance();
            }
            else {
                this.deductDeposit = false;
                this.CalculateDepositBalance();
            }
        }
        this.PatientConsumptionData.PaymentDetails = $event.PaymentDetail;
        this.PatientConsumptionData.PHRMEmployeeCashTransactions = $event.MultiPaymentDetail;
    }


    LoadPatientInvoiceSummary(patientId: number, SchemeId?: number, PatientVisitId?: number) {
        if (patientId > 0) {
            this.pharmacyBLService.GetPatientSummary(patientId, SchemeId, PatientVisitId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                        this.patSummary = res.Results;
                        this.patSummary.CreditAmount = CommonFunctions.parseAmount(this.patSummary.CreditAmount);
                        this.patSummary.ProvisionalAmt = CommonFunctions.parseAmount(this.patSummary.ProvisionalAmt);
                        this.patSummary.BalanceAmount = CommonFunctions.parseAmount(this.patSummary.BalanceAmount);
                        this.patSummary.DepositBalance = CommonFunctions.parseAmount(this.patSummary.DepositBalance);
                        this.patSummary.TotalDue = CommonFunctions.parseAmount(this.patSummary.TotalDue);
                        this.patSummary.GeneralCreditLimit = CommonFunctions.parseAmount(this.patSummary.GeneralCreditLimit);
                        this.patSummary.IpCreditLimit = CommonFunctions.parseAmount(this.patSummary.IpCreditLimit);
                        this.patSummary.OpCreditLimit = CommonFunctions.parseAmount(this.patSummary.OpCreditLimit);
                        this.patSummary.IsLoaded = true;
                    }
                    else {
                        this.messageboxService.showMessage("Select Patient", [res.ErrorMessage]);
                        this.loading = false;
                    }
                });
        }
    }
    handleConfirm() {
        this.PrintReceipt();
    }
    handleCancel() {
        this.loading = false;
    }

}