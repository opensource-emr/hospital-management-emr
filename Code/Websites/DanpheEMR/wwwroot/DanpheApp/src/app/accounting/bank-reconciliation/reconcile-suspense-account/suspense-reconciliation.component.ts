import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { CommonFunctions } from "../../../shared/common.functions";
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import { ENUM_ACC_PaymentMode, ENUM_ACC_RouteFrom, ENUM_ACC_VoucherCode, ENUM_CalanderType, ENUM_DanpheHTTPResponseText, ENUM_Data_Type, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { AccountingSettingsBLService } from '../../settings/shared/accounting-settings.bl.service';
import { CostCenterModel } from '../../settings/shared/cost-center.model';
import { FiscalYearModel } from "../../settings/shared/fiscalyear.model";
import { LedgerModel } from '../../settings/shared/ledger.model';
import { SubLedgerTransactionModel } from '../../settings/shared/sub-ledger.model';
import { VoucherHeadModel } from '../../settings/shared/voucherhead.model';
import { MapBankAndSuspenseAccountReconciliation_DTO } from '../../shared/DTOs/map-bank-and-suspense-account-reconciliation.dto';
import { SuspenseAccountReconciliationDetail_DTO } from '../../shared/DTOs/suspense-account-reconciliation.dto';
import { SuspenseAccountTransaction_DTO } from '../../shared/DTOs/suspense-account-transaction.dto';
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { AccountingService } from '../../shared/accounting.service';
import { SubLedger_DTO } from '../../transactions/shared/DTOs/subledger-dto';
import { TransactionItem } from '../../transactions/shared/transaction-item.model';
import { TransactionModel } from '../../transactions/shared/transaction.model';
import { Voucher } from '../../transactions/shared/voucher';
@Component({
    selector: 'suspense-account-reconciliation',
    templateUrl: './suspense-reconciliation.component.html',
})
export class SuspenseAccountReconciliationComponent {
    public transaction: TransactionModel = new TransactionModel();
    public voucherTypeList: Array<Voucher> = new Array<Voucher>();
    public fiscalYearList: Array<FiscalYearModel> = [];
    public currFiscalYear: FiscalYearModel = new FiscalYearModel();
    public selVoucherTypeId: number = 0;
    public todaysDate: string = null;
    public TransactionDate: string = null;
    public selLedgerArr: Array<any> = [];
    public allLedgerList: Array<LedgerModel> = [];
    public totalDebit: number = 0;
    public totalCredit: number = 0;
    public totalAmount: number = 0;
    public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
    public selectedCostCenter = new CostCenterModel();
    public IsBackDateEntry: boolean = false;
    public sectionId: number = 4;
    public selDrCrArray: Array<string> = [];
    public DrCrList: Array<any>;
    public TempVoucherNumber: string = "";
    public HideSavebtn: boolean = false;
    public IsAllowDuplicateVoucherEntry: boolean;
    public fiscalYId: any;
    public voucherCodeEnum: typeof ENUM_ACC_VoucherCode = ENUM_ACC_VoucherCode;
    public selectedVoucherCode: string = ENUM_ACC_VoucherCode.JournalVoucher;
    public bankLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public selectedBankLedger: LedgerModel = new LedgerModel();
    public suspenseAccountLedger: LedgerModel = new LedgerModel();
    public paymentModeList: typeof ENUM_ACC_PaymentMode = ENUM_ACC_PaymentMode;
    public paymentMode: string = ENUM_ACC_PaymentMode.Cash;
    public selectedLedgerCode: Array<any> = []; // Dev 9 Nov'22: We are using any here becasue use of exact type create data binding problem somewhere.
    public calType: string = ENUM_CalanderType.NP;
    public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public selectedSubLedger: Array<any> = [];
    public voucherNumber: string = "";
    public showVoucherPopup: boolean = false;
    public subLedgerAndCostCenterSetting = {
        "EnableSubLedger": false,
        "EnableCostCenter": false
    };
    public costCenterList = new Array<CostCenterModel>();
    public selSubLedgerCode: Array<any> = [];
    @Output("callback-function")
    callBackFunction: EventEmitter<Object> = new EventEmitter<Object>();

    public ledgerWiseSubLedgerMaster: Array<Array<SubLedger_DTO>> = new Array<Array<SubLedger_DTO>>();
    public paymentOrReceiptPartyName: string = "";
    public paymentOrReceiptPartyNameLength: number = 0;
    public suspenseAccountRefVoucherDetail: Array<SuspenseAccountReconciliationDetail_DTO> = new Array<SuspenseAccountReconciliationDetail_DTO>();
    public selectedSuspenseAccountDetail: SuspenseAccountReconciliationDetail_DTO = new SuspenseAccountReconciliationDetail_DTO();
    public suspenseAccountReconciliationTransaction: SuspenseAccountTransaction_DTO = new SuspenseAccountTransaction_DTO();

    constructor(
        public accountingBLService: AccountingBLService,
        public msgBoxServ: MessageboxService,
        public changeDetectorRef: ChangeDetectorRef, public coreService: CoreService, public accountingService: AccountingService,
        public router: Router, public routeFromService: RouteFromService, public securityService: SecurityService,
        public accountingSettingBlService: AccountingSettingsBLService) {
        this.setParameterValues();
        this.subLedgerMaster = this.ledgerWiseSubLedgerMaster[0] = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
        this.DrCrList = [{ 'DrCr': 'Dr' }, { 'DrCr': 'Cr' }];
        this.selDrCrArray[0] = "Dr";
        this.todaysDate = moment().format('YYYY-MM-DD');
        this.TransactionDate = moment().format('YYYY-MM-DD');
        if (this.accountingService.accCacheData.CostCenters && accountingService.accCacheData.CostCenters.length) {

            this.costCenterList = this.accountingService.accCacheData.CostCenters.filter(c => c.IsActive);
        }
        this.GetVoucher();
        this.GetVoucherHead();
        this.GetFiscalYearList();
        this.GetLedgerList();
        if (!!this.accountingService.accCacheData.CodeDetails && this.accountingService.accCacheData.CodeDetails.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.coreService.SetCodeDetails(this.accountingService.accCacheData.CodeDetails);//mumbai-team-june2021-danphe-accounting-cache-change
        }
        if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.coreService.SetFiscalYearList(this.accountingService.accCacheData.FiscalYearList);//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.routeFromService.RouteFrom = "";
    }

    public validDate: boolean = true;
    selectDate(event) {
        if (event) {
            this.TransactionDate = event.selectedDate;
            this.validDate = true;
            this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
        }
        else {
            this.validDate = false;
        }

    }

    setParameterValues() {
        let Parameter = this.coreService.Parameters;
        let param = Parameter.find(parms => parms.ParameterGroupName == "Accounting" && parms.ParameterName == "IsAllowDuplicateVoucherEntry");
        if (param) {
            this.IsAllowDuplicateVoucherEntry = JSON.parse(param.ParameterValue);
        }
        else {
            this.IsAllowDuplicateVoucherEntry = true;
        }

        let subLedgerParma = Parameter.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
        if (subLedgerParma) {
            this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
        }
    }

    GetVoucher() {
        try {
            if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {
                this.voucherTypeList = this.accountingService.accCacheData.VoucherType;
                this.voucherTypeList = this.voucherTypeList.slice();
                this.selVoucherTypeId = this.voucherTypeList.find(v => v.VoucherCode == "JV").VoucherId;
                this.AssignVoucher();
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    GetVoucherHead() {
        try {
            if (!!this.accountingService.accCacheData.VoucherHead && this.accountingService.accCacheData.VoucherHead.length > 0) {
                this.voucherHeadList = this.accountingService.accCacheData.VoucherHead;
                this.voucherHeadList = this.voucherHeadList.slice();
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    GetFiscalYearList() {
        if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {
            this.fiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList;
            this.fiscalYearList = this.fiscalYearList.slice();
            this.currFiscalYear = new FiscalYearModel();
            this.currFiscalYear = this.securityService.AccHospitalInfo.CurrFiscalYear;
        }
    }


    AssignVoucher() {
        try {
            this.transaction = new TransactionModel();
            this.selectedCostCenter = new CostCenterModel();
            this.selLedgerArr = [];
            this.selectedSubLedger = [];
            this.selSubLedgerCode = [];
            this.totalDebit = 0;
            this.totalCredit = 0;
            this.ChangeFocus("bankLedger_for_suspenseA/C_reconciliation");
            this.transaction.VoucherId = this.selVoucherTypeId;
            this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
            this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
            this.AddNewTxnLedger();
            if (this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy)
                this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);

        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    //get all Ledger
    GetLedgerList() {
        try {
            if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length > 0) {
                this.allLedgerList = this.accountingService.accCacheData.Ledgers.filter(x => x.IsActive != false);
                this.allLedgerList = this.allLedgerList.slice();
                this.allLedgerList.forEach(a => {
                    if (a.ClosingBalance > 0) {
                        a.ClosingBalwithDrCr = "Dr" + a.ClosingBalance;
                    }
                    else if (a.ClosingBalance == 0) {
                        a.ClosingBalwithDrCr = "0";
                    }
                    else {
                        a.ClosingBalwithDrCr = "Cr" + -a.ClosingBalance;
                    }
                });
                this.ChangeFocus('bankLedger_for_suspenseA/C_reconciliation');
                let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === '022' && a.Description === 'LedgerGroupName');
                if (codeDetail) {
                    let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
                    if (ledgerGroup) {
                        this.bankLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
                    }
                }
                this.suspenseAccountLedger = this.allLedgerList.find(a => a.Name === 'LCL_SUSPENSE_A/C');
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    AddNewTxnLedger() {
        try {
            var currentTxnItem = new TransactionItem();
            if (this.totalDebit > this.totalCredit) {
                currentTxnItem.DrCr = false;
                var temp = this.totalDebit - this.totalCredit;
                if (temp <= 0) {
                    temp = 0;
                }
                currentTxnItem.Amount = CommonFunctions.parseDecimal(temp);
            }
            else {
                currentTxnItem.DrCr = true;
                var temp = this.totalCredit - this.totalDebit;
                if (temp <= 0) {
                    temp = 0;
                }
                currentTxnItem.Amount = CommonFunctions.parseDecimal(temp);
            }
            let defaultCostCenter = this.costCenterList.find(a => a.IsDefault === true);
            if (defaultCostCenter) {
                currentTxnItem.CostCenterId = defaultCostCenter.CostCenterId;
            }
            this.transaction.TransactionItems.push(currentTxnItem);
            let index = this.transaction.TransactionItems.length;
            this.selDrCrArray[index - 1] = this.selDrCrArray[0] === 'Dr' ? 'Cr' : 'Dr';
            this.DescriptionValChanged(this.transaction.TransactionItems.length - 1);
            this.ledgerWiseSubLedgerMaster[index - 1] = this.subLedgerMaster;

            this.transaction.TransactionItems[0].TransactionItemValidator.controls["DrCr"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["Amount"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["LedgerId"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["SubLedgerId"].disable();

        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    checkDateValidation() {
        if (!this.validDate) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Select proper date']);
            return false;
        } else {
            return true;
        }


    }

    ReconcileSuspenseAccount() {
        if (this.Validate()) {
            this.suspenseAccountReconciliationTransaction.Transaction = this.transaction;
            this.accountingBLService.PostSuspenseAccTransaction(this.suspenseAccountReconciliationTransaction).
                subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.HideSavebtn = false;
                        this.Reset();
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Voucher is successfully Saved."]);
                        this.AssignVoucher();
                        this.ViewTransactionDetails(res.Results);
                        this.LoadReferenceVoucherDetail();
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to create transaction.']);
                        this.logError(res.ErrorMessage);
                        this.HideSavebtn = false;
                    }
                });
        }
    }

    ViewTransactionDetails(resultdata) {
        try {
            localStorage.setItem("SectionId", this.sectionId.toString());
            this.voucherNumber = resultdata.VoucherNumber;
            this.fiscalYId = resultdata.FiscalyearId;
            this.showVoucherPopup = true;
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    public Validate(): boolean {
        let txnItems = this.transaction.TransactionItems.filter(a => a.DrCr == this.selectedSuspenseAccountDetail.DrCr);
        if (txnItems.length > 1) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Only ${this.suspenseAccountLedger.LedgerName} can be ${this.selectedSuspenseAccountDetail.DrCr ? 'Debit' : 'Credit'} for this transaction.`]);
            return false;
        }
        if (this.transaction.TransactionItems.length > 2) {
            this.transaction.TransactionItems = this.transaction.TransactionItems.filter(a => a.LedgerId > 0);
        }

        let defaultCostCenter = this.costCenterList.find(a => a.IsDefault === true);

        if (!this.subLedgerAndCostCenterSetting.EnableCostCenter) {
            this.transaction.TransactionItems.forEach(txnItem => {
                if (defaultCostCenter) {
                    txnItem.TransactionItemValidator.controls['CostCenter'].setValue(defaultCostCenter.CostCenterId);
                    txnItem.CostCenterId = defaultCostCenter.CostCenterId;
                } else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Default CostCenter not found.']);
                }
            });
        }

        this.transaction.UpdateValidator("off", "PayeeName", "required");
        this.transaction.UpdateValidator("off", "ChequeNumber", "");
        if (!this.CheckCalculations()) {
            return false;
        }
        this.HideSavebtn = true;
        try {
            let txnValidation = true;
            this.CalculateLedger();
            if (this.transaction.TransactionItems.length == 0) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Please enter some data..."]);
                this.HideSavebtn = false;
                return false;
            }
            else {
                this.CheckBackDateEntryValidation();
                for (var a in this.transaction.TransactionValidator.controls) {
                    this.transaction.TransactionValidator.controls[a].markAsDirty();
                    this.transaction.TransactionValidator.controls[a].updateValueAndValidity();
                }
                if (this.transaction.IsValidCheck(undefined, undefined)) {
                    for (var txnItem of this.transaction.TransactionItems) {
                        for (var b in txnItem.TransactionItemValidator.controls) {
                            txnItem.TransactionItemValidator.controls[b].markAsDirty();
                            txnItem.TransactionItemValidator.controls[b].updateValueAndValidity();
                        }
                        if (!txnItem.IsValidCheck(undefined, undefined)) {
                            txnValidation = false;
                            this.HideSavebtn = false;
                            return false;
                        }
                    };
                }

                else {
                    txnValidation = false;
                }
                this.HideSavebtn = false;
                if (txnValidation && this.CheckCalculations()) {
                    this.transaction.TotalAmount = this.totalDebit;
                    this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;

                    if (this.checkDateValidation()) {
                        if (this.IsBackDateEntry == false) {
                            this.transaction.IsBackDateEntry = false;
                            this.transaction.TransactionDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
                        }
                        else {
                            this.transaction.IsBackDateEntry = true;
                            this.transaction.TransactionDate = this.TransactionDate.concat(" 00:01:00");
                        }
                        let txnItems = _.cloneDeep(this.transaction.TransactionItems);
                        let groupedData = txnItems.reduce((acc, currVal) => {
                            if (acc.hasOwnProperty(currVal.CostCenterId.toString())) {
                                acc[currVal.CostCenterId.toString()].Amount += (currVal.DrCr ? currVal.Amount : -currVal.Amount);
                            } else {
                                currVal.Amount = currVal.DrCr ? currVal.Amount : -currVal.Amount;
                                acc[currVal.CostCenterId.toString()] = currVal;
                            }
                            return acc;
                        }, []);

                        if (groupedData) {
                            let groupedValues = Object.values(groupedData);
                            if (groupedValues.some(a => a["Amount"] > 0.01)) {
                                let msg = "| ";
                                groupedValues.forEach(a => {
                                    if (a["Amount"] !== 0) {
                                        let costCenter = this.costCenterList.find(c => c.CostCenterId == a["CostCenterId"]);
                                        msg += `${costCenter.CostCenterName} : ${Math.abs(a["Amount"])} ${a["Amount"] >= 0 ? '(DR)' : '(CR)'}  | `;
                                    }
                                });
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Cost-CenterWise Debit and Credit Amount Is Not Matched, Mismatched Entries:- ${msg}`]);
                                return false;
                            }
                        }
                        let check = confirm("Are you sure you want to save?");
                        return check ? true : false;
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Select Proper TransactionDate"]);
                        this.HideSavebtn = false;
                    }
                }

            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    public AssignSelectedLedger(index) {
        try {
            let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
            if (true) {
                if (typeof (this.selLedgerArr[index]) == 'object') {
                    if (this.IsAllowDuplicateVoucherEntry || this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                        this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
                        this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
                        this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
                        this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
                        this.selectedLedgerCode[index] = this.allLedgerList.find(a => a.LedgerId === this.selLedgerArr[index].LedgerId).Code;
                        this.ledgerWiseSubLedgerMaster[index] = this.subLedgerMaster.filter(a => a.LedgerId === this.selLedgerArr[index].LedgerId);
                        if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                            this.ChangeFocus(`SubLedger_Code_${index + 1}`);
                        }
                        else {
                            this.ChangeFocus(`Amount_${index + 1}`);
                        }
                    }
                    else {
                        let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
                        let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
                        if (extItem && extItemIndex != index) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Voucher for " + this.selLedgerArr[index].LedgerName + " already entered."]);
                            this.selLedgerArr[index] = null;
                            this.transaction.TransactionItems[index].ChartOfAccountName = "";
                            this.transaction.TransactionItems[index].Code = "";
                            this.transaction.TransactionItems[index].LedgerId = 0;
                            this.transaction.TransactionItems[index].LedgerName = "";
                            this.ChangeFocus("Ledger_" + (index + 1));
                        }
                        else {
                            this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
                            this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
                            this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
                            this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
                            this.selectedLedgerCode[index] = this.allLedgerList.find(a => a.LedgerId === this.selLedgerArr[index].LedgerId).Code;
                            this.ledgerWiseSubLedgerMaster[index] = this.subLedgerMaster.filter(a => a.LedgerId === this.selLedgerArr[index].LedgerId);
                            if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                                this.ChangeFocus(`SubLedger_Code_${index + 1}`);
                            }
                            else {
                                this.ChangeFocus(`Amount_${index + 1}`);
                            }
                        }
                    }
                    if (this.transaction.TransactionItems[index].SubLedgers.length > 0 && this.transaction.TransactionItems[index].SubLedgers[0].LedgerId !== this.selLedgerArr[index].LedgerId) {
                        this.transaction.TransactionItems[index].SubLedgers = [];
                        this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
                        this.selSubLedgerCode[index] = "";
                    }
                }
                else if (typeof this.selLedgerArr[index] === ENUM_Data_Type.String) {
                    let ledger = this.allLedgerList.find(a => a.LedgerName === this.selLedgerArr[index]);
                    if (!ledger || (ledger && ledger.LedgerId != oldLedgerId)) {
                        this.transaction.TransactionItems[index].LedgerId = 0;
                        this.transaction.TransactionItems[index].LedgerName = "";
                        this.transaction.TransactionItems[index].ChartOfAccountName = "";
                        this.transaction.TransactionItems[index].Code = "";
                        this.selSubLedgerCode[index] = "";
                        this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
                        this.ledgerWiseSubLedgerMaster[index] = this.subLedgerMaster;
                    }
                }
            }

        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    public CheckSelLedger(): boolean {
        try {
            if (this.selLedgerArr.length) {
                for (let item of this.selLedgerArr) {
                    if (!item || typeof (item) != 'object') {
                        item = undefined;
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Invalid itemList Name. Please select itemList from the list."]);
                        this.HideSavebtn = false;
                        return false;
                    }
                }
                return true;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }
    public CheckCalculations(): boolean {
        try {
            let valid = true;
            if (this.totalDebit && this.totalCredit) {
                if (this.totalDebit != this.totalCredit) {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Total Debit and Credit is not balanced."]);
                    valid = false;
                    this.HideSavebtn = false;
                }
            }
            else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Entered amounts for voucher are not balanced."]);
                valid = false;
                this.HideSavebtn = false;
            }
            return valid;
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }


    public Reset() {
        try {
            this.suspenseAccountReconciliationTransaction = new SuspenseAccountTransaction_DTO();
            this.transaction = new TransactionModel();
            this.selectedCostCenter = new CostCenterModel();
            this.selLedgerArr = [];
            this.totalDebit = 0;
            this.totalCredit = 0;
            this.ChangeFocus("bankLedger_for_suspenseA/C_reconciliation");
            this.routeFromService.RouteFrom = "";
            this.selectedLedgerCode = [];
            this.paymentOrReceiptPartyName = "";
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    CalculateLedger() {
        try {
            this.totalDebit = this.totalAmount = 0;
            this.totalCredit = 0;
            this.transaction.TransactionItems.forEach(a => {
                if (a.DrCr == true || a.DrCr.toString() == "true") {
                    this.totalDebit += a.Amount;
                }
                else {
                    this.totalCredit += a.Amount;
                }
                if (this.totalCredit == this.totalDebit) {
                    this.totalAmount = this.totalDebit;
                }
            });
            this.totalDebit = CommonFunctions.parseDecimal(this.totalDebit);
            this.totalCredit = CommonFunctions.parseDecimal(this.totalCredit);
            this.totalAmount = (this.totalDebit > 0) ? this.totalDebit : this.totalCredit;
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    DeleteTxnLedgerRow(index: number) {
        try {
            if (this.transaction.TransactionItems.length > 1) {
                this.transaction.TransactionItems.splice(index, 1);
                this.selLedgerArr.splice(index, 1);
                this.selSubLedgerCode.splice(index, 1);
                this.selDrCrArray.splice(index, 1);
                this.selectedSubLedger.splice(index, 1);
            }
            else if (this.transaction.TransactionItems.length === 1) {
                this.selSubLedgerCode[index] = "";
                this.selLedgerArr[index] = "";
                this.selectedSubLedger[index] = "";
            }
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["DrCr"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["Amount"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["LedgerId"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["SubLedgerId"].disable();
            this.CalculateLedger();
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    LedgerListFormatter(data: any): string {
        return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"] + " | Closing Bal- " + data["ClosingBalwithDrCr"];
    }
    DrCrListFormatter(data: any): string {
        return data["DrCr"];
    }
    VoucherHeadListFormatter(data: any): string {
        return data["VoucherHeadName"];
    }

    logError(err: any) {
        console.log(err);
    }

    public ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    CheckBackDateEntryValidation() {
        if (this.transaction.IsBackDateEntry == true) {
            this.transaction.UpdateValidator("on", "TransactionDate", "required");
        }
        else {
            this.transaction.UpdateValidator("off", "TransactionDate", "required");
        }
    }
    ChangeFocus(nextId) {
        if (nextId != null) {
            try {
                this.coreService.FocusInputById(nextId);
            } catch (ex) {
                console.log(ex);
            }
        }
    }

    onDrCrChange(i) {
        if (this.selDrCrArray[i] == "Dr") {
            this.transaction.TransactionItems[i].DrCr = true;
        }
        else if (this.selDrCrArray[i] == "Cr") {
            this.transaction.TransactionItems[i].DrCr = false;
        }
        this.CalculateLedger();
    }

    onVoucherTypeChange() {
        if (this.transaction.TransactionItems.length == 0) {
            this.AssignVoucher();
        } else {
            var check: boolean = true;
            let oldVoucherTypeId = this.transaction.VoucherId;
            check = confirm("Are you sure you want to change the Voucher Type?");
            if (check) {
                this.transaction.VoucherId = this.selVoucherTypeId;
                this.selectedVoucherCode = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId).VoucherCode;
                this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
            }
            else {
                this.changeDetectorRef.detectChanges();
                this.selVoucherTypeId = oldVoucherTypeId;
            }
        }

        setTimeout(() => {
            if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                this.ChangeFocus('SubLedger_Code_2');
            }
            else {
                this.ChangeFocus('Code_2');
            }
        }, 100);
        this.paymentOrReceiptPartyName = "";
        this.UpdateNarration();
        this.transaction.TransactionItems.forEach((a, index) => this.onDrCrChange(index));
    }

    CheckAndAddNewTxnLedger($event, index) {
        let i = index + 1;
        if ($event) {
            this.CalculateLedger();
            if (this.totalCredit == this.totalDebit) {
                this.ChangeFocus("narration");
            } else {
                this.AddNewTxnLedger();
                this.ChangeFocus("DrCr_" + (i + 1));
                if (this.transaction.TransactionItems[i].DrCr == false) {
                    this.selDrCrArray[i] = "Cr";
                }
                else {
                    this.transaction.TransactionItems[i].DrCr = true;
                    this.selDrCrArray[i] = "Dr";
                }
                let b = this.transaction.TransactionItems[index].Amount;
                if (this.selDrCrArray[i] != this.DrCrList[0]) {
                    this.DrCrList = this.DrCrList.reverse();
                }
            }

            let ind = this.transaction.TransactionItems.length;
            if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
                this.transaction.TransactionItems[ind - 1].TransactionItemValidator.controls["DrCr"].disable();
                this.selDrCrArray[ind - 1] = "Dr";
                if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                    this.ChangeFocus('SubLedger_Code_' + (i + 1));
                }
                else {
                    this.ChangeFocus('Code_' + (i + 1));
                }
            }
            else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
                this.transaction.TransactionItems[ind - 1].TransactionItemValidator.controls["DrCr"].disable();
                this.selDrCrArray[ind - 1] = "Cr";
                if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                    this.ChangeFocus('SubLedger_Code_' + (i + 1));
                }
                else {
                    this.ChangeFocus('Code_' + (i + 1));
                }
            }

        }
    }

    GettempVoucherNumber(voucherId: number, sectionId, transactionDate) {
        if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify || this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.EditVoucher) {
            return;
        }
        this.accountingBLService.GettempVoucherNumber(voucherId, sectionId, transactionDate)
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.TempVoucherNumber = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['failed to Get Provisional Voucher Number.']);
                    this.logError(res.ErrorMessage);
                }
            });
    }

    DescriptionValChanged(currLedIndex: number) {

        if (this.selVoucherTypeId && this.transaction.TransactionItems.length > 0) {
            let currVoucherType = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId);
            if (currVoucherType && currVoucherType.ISCopyDescription == true) {
                let firstDescription = this.transaction.TransactionItems[0].Description;
                this.transaction.TransactionItems[currLedIndex].Description = firstDescription;
            }
        }
    }


    Cancel() {
        this.Reset();
        this.AssignVoucher();
    }

    ChkBackDateEntryOnChange() {
        if (!this.IsBackDateEntry) {
            this.TransactionDate = this.todaysDate;
            this.transaction.TransactionDate = this.todaysDate;
            this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
        }
    }

    public async UpdateLedgers() {
        try {
            DanpheCache.clearDanpheCacheByType(MasterType.LedgersAll);
            await this.accountingService.RefreshAccCacheData();
        }
        catch (ex) {
            console.log(ex);
        }
    }

    LedgerCodeFormatter(data: LedgerModel): string {
        return data["Code"];
    }

    public AssignSelectedCode(index: number): void {
        try {
            if (this.selectedLedgerCode[index]) {
                let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
                if (typeof (this.selectedLedgerCode[index]) === ENUM_Data_Type.Object) {
                    if (this.IsAllowDuplicateVoucherEntry || this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                        this.transaction.TransactionItems[index].LedgerId = this.selectedLedgerCode[index].LedgerId;
                        this.transaction.TransactionItems[index].LedgerName = this.selectedLedgerCode[index].LedgerName;
                        this.transaction.TransactionItems[index].ChartOfAccountName = this.selectedLedgerCode[index].ChartOfAccountName;
                        this.transaction.TransactionItems[index].Code = this.selectedLedgerCode[index].Code;
                        this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedLedgerCode[index].LedgerId);
                        this.ChangeFocus("Ledger_" + (index + 1));
                    }
                    else {
                        let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selectedLedgerCode[index].LedgerId);
                        let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selectedLedgerCode[index].LedgerId);
                        if (extItem && extItemIndex != index) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Voucher for " + this.selectedLedgerCode[index].LedgerName + " already entered."]);
                            this.selectedLedgerCode[index] = null;
                            this.transaction.TransactionItems[index].ChartOfAccountName = "";
                            this.transaction.TransactionItems[index].Code = "";
                            this.ChangeFocus("Ledger_" + (index + 1));
                        }
                        else {
                            this.transaction.TransactionItems[index].LedgerId = this.selectedLedgerCode[index].LedgerId;
                            this.transaction.TransactionItems[index].LedgerName = this.selectedLedgerCode[index].LedgerName;
                            this.transaction.TransactionItems[index].ChartOfAccountName = this.selectedLedgerCode[index].ChartOfAccountName;
                            this.transaction.TransactionItems[index].Code = this.selectedLedgerCode[index].Code;
                            this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedLedgerCode[index].LedgerId);
                            this.ChangeFocus("Ledger_" + (index + 1));
                        }
                    }
                }
            }
        }
        catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
        return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
    }

    public AssignSubLedger(index: number) {
        let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
        let oldSubledgerId = this.transaction.TransactionItems[index] ? (this.transaction.TransactionItems[index].SubLedgers.length > 0 ? this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId : 0) : 0;
        if (typeof this.selectedSubLedger[index] === "object" && this.selectedSubLedger[index].SubLedgerId > 0) {
            let subLedgerExists = false;
            this.transaction.TransactionItems.forEach((item, position) => {
                let indx = item.SubLedgers.findIndex(sub => sub.SubLedgerId === this.selectedSubLedger[index].SubLedgerId);
                if (indx >= 0 && position != index) {
                    subLedgerExists = true;
                    return;
                }
            });
            if (subLedgerExists) {
                this.selectedSubLedger[index] = new SubLedger_DTO();
                this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["This subledger is already selected. Please select another subledger"]);
                this.ChangeFocus(`SubLedger_${index + 1}`);

            }
            else {
                this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedSubLedger[index].LedgerId);
                this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue(this.selLedgerArr[index].LedgerName);
                let subLedgerTransaction = new SubLedgerTransactionModel();
                this.selSubLedgerCode[index] = this.selectedSubLedger[index].SubLedgerCode;
                subLedgerTransaction.LedgerId = this.transaction.TransactionItems[index].LedgerId = this.selectedSubLedger[index].LedgerId;
                subLedgerTransaction.SubLedgerId = this.selectedSubLedger[index].SubLedgerId;

                if (this.transaction.TransactionItems[index].SubLedgers.length > 0 && this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerTransactionId > 0) {
                    this.transaction.TransactionItems[index].SubLedgers[0].LedgerId = subLedgerTransaction.LedgerId;
                    this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId = subLedgerTransaction.SubLedgerId;
                }
                else {
                    this.transaction.TransactionItems[index].SubLedgers = [];
                    this.transaction.TransactionItems[index].SubLedgers.push(subLedgerTransaction);
                }
                this.ChangeFocus(`Amount_${index + 1}`);

            }
        }
        else {
            this.selectedSubLedger[index] ? this.selectedSubLedger[index] = this.selectedSubLedger[index].trim() : true;
            let subledger = this.subLedgerMaster.find(a => a.LedgerId === oldLedgerId && (this.selectedSubLedger[index] ? a.SubLedgerName === this.selectedSubLedger[index] : true));
            if (!subledger || (subledger && (oldSubledgerId !== 0 && oldSubledgerId != subledger.SubLedgerId))) {
                this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
                this.selSubLedgerCode[index] = "";
            }
        }
    }

    public setFocusById(name: string, index: number): void {
        let htmlObj = document.getElementById(`${name}${index}`)
        if (htmlObj) {
            htmlObj.focus();
        }
    }

    public AssignSelectedSubLedgerCode(index: number) {
        let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
        let oldSubledgerId = this.transaction.TransactionItems[index] ? (this.transaction.TransactionItems[index].SubLedgers.length > 0 ? this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId : 0) : 0;
        if (typeof this.selSubLedgerCode[index] === ENUM_Data_Type.Object && this.selSubLedgerCode[index].SubLedgerId > 0) {
            let subLedgerExists = false;
            this.transaction.TransactionItems.forEach((item, position) => {
                let indx = item.SubLedgers.findIndex(sub => sub.SubLedgerId === this.selSubLedgerCode[index].SubLedgerId);
                if (indx >= 0 && position != index) {
                    subLedgerExists = true;
                    return;
                }
            });
            if (subLedgerExists) {
                this.selSubLedgerCode[index] = new SubLedger_DTO();
                this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
                this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["This subledger is already selected. Please select another subledger"]);
            }
            else {
                this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selSubLedgerCode[index].LedgerId);
                this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue(this.selLedgerArr[index].LedgerName);
                let subLedgerTransaction = new SubLedgerTransactionModel();
                this.selectedSubLedger[index] = this.subLedgerMaster.find(a => a.SubLedgerId === this.selSubLedgerCode[index].SubLedgerId);
                subLedgerTransaction.LedgerId = this.transaction.TransactionItems[index].LedgerId = this.selectedSubLedger[index].LedgerId;
                subLedgerTransaction.SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
                this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue(this.selSubLedgerCode[index].SubLedgerName)
                if (this.transaction.TransactionItems[index].SubLedgers.length > 0 && this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerTransactionId > 0) {
                    this.transaction.TransactionItems[index].SubLedgers[0].LedgerId = subLedgerTransaction.LedgerId;
                    this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId = subLedgerTransaction.SubLedgerId;
                }
                else {
                    this.transaction.TransactionItems[index].SubLedgers = [];
                    this.transaction.TransactionItems[index].SubLedgers.push(subLedgerTransaction);
                }
                this.ChangeFocus(`SubLedger_${index + 1}`);
            }
        }
        else {
            this.selSubLedgerCode[index] ? this.selSubLedgerCode[index] = this.selSubLedgerCode[index].trim() : true;
            let subledger = this.subLedgerMaster.find(a => a.LedgerId === oldLedgerId && (this.selSubLedgerCode[index] ? a.SubLedgerCode === this.selSubLedgerCode[index] : true));
            if (!subledger || (subledger && (oldSubledgerId !== 0 && subledger.SubLedgerId != oldSubledgerId))) {
                this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
                this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
                this.ChangeFocus(`SubLedger_Code+${index + 1}`);
            }
        }
    }

    public ChangeFocusFromDrCr(index: number) {
        if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
            this.ChangeFocus(`SubLedger_Code_${index + 1}`);
        }
        else {
            this.ChangeFocus(`Code_${index + 1}`);
        }
    }

    public UpdateNarration() {
        this.transaction.Remarks = this.paymentOrReceiptPartyName + this.transaction.Remarks.substring(this.paymentOrReceiptPartyNameLength, this.transaction.Remarks.length);
        this.paymentOrReceiptPartyNameLength = this.paymentOrReceiptPartyName.length;
    }

    public LoadReferenceVoucherDetail() {
        if (this.selectedBankLedger.LedgerId > 0) {
            this.Cancel();
            this.suspenseAccountRefVoucherDetail = new Array<SuspenseAccountReconciliationDetail_DTO>();
            this.accountingBLService.GetSuspenaseAccountReconciliationDetail(this.selectedBankLedger.LedgerId, this.suspenseAccountLedger.LedgerId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results && res.Results.length > 0) {
                        this.suspenseAccountRefVoucherDetail = res.Results;
                        this.ChangeFocus('suspenseAccount_reconciliation_referenceVoucherNumber');
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`No need to reconcile ${this.suspenseAccountLedger.LedgerName} for selected bank.`]);
                    }
                },
                    (err: DanpheHTTPResponse) => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`]);
                    }
                );
        }
    }

    public AssignSuspenseAccountTxnItem() {
        if (this.selectedSuspenseAccountDetail.LedgerId > 0) {
            let ledger = this.allLedgerList.find(a => a.LedgerId === this.selectedSuspenseAccountDetail.LedgerId);
            this.selLedgerArr[0] = ledger ? ledger.LedgerName : "";
            this.selDrCrArray[0] = this.selectedSuspenseAccountDetail.DrCr ? 'Dr' : 'Cr';
            this.selectedLedgerCode[0] = this.selLedgerArr[0].Code;
            this.transaction.TransactionItems[0].Amount = this.selectedSuspenseAccountDetail.Amount;
            this.transaction.TransactionItems[0].DrCr = this.selectedSuspenseAccountDetail.DrCr;
            this.transaction.TransactionItems[0].Code = ledger ? ledger.Code : "";
            this.transaction.TransactionItems[0].LedgerId = this.selectedSuspenseAccountDetail.LedgerId;
            this.transaction.TransactionItems[0].LedgerName = ledger ? ledger.LedgerName : "";
            let selectedSubLedger = this.subLedgerMaster.find(a => a.SubLedgerId === this.selectedSuspenseAccountDetail.SubLedgerId);
            this.selectedSubLedger[0] = selectedSubLedger ? selectedSubLedger.SubLedgerName : "";
            let subLedger = new SubLedgerTransactionModel();
            subLedger.LedgerId = this.selectedSuspenseAccountDetail.LedgerId;
            subLedger.SubLedgerId = this.selectedSuspenseAccountDetail.SubLedgerId;
            this.transaction.TransactionItems[0].SubLedgers.push(subLedger);
            this.selSubLedgerCode[0] = selectedSubLedger ? selectedSubLedger.SubLedgerCode : "";

            this.transaction.TransactionItems[0].TransactionItemValidator.controls["DrCr"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["Amount"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["LedgerId"].disable();
            this.transaction.TransactionItems[0].TransactionItemValidator.controls["SubLedgerId"].disable();
            this.transaction.TransactionItems.splice(1, this.transaction.TransactionItems.length - 1);
            this.selLedgerArr.splice(1, this.transaction.TransactionItems.length - 1);
            this.selectedSubLedger.splice(1, this.transaction.TransactionItems.length - 1);
            this.CalculateLedger();
            this.AddNewTxnLedger();
            let map = new MapBankAndSuspenseAccountReconciliation_DTO();
            map.BankLedgerId = this.selectedBankLedger.LedgerId;
            map.BankReconciliationVoucherNumber = this.selectedSuspenseAccountDetail.VoucherNumber;
            this.suspenseAccountReconciliationTransaction.ReconciliationMap = map;
            setTimeout(() => {
                if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                    this.ChangeFocus('SubLedger_Code_2');
                }
                else {
                    this.ChangeFocus('Code_2');
                }
            }, 100);
        }
    }

    public CallBackTransactionClose() {
        this.ChangeFocus("suspenseAccount_reconciliation_referenceVoucherNumber");
    }
}