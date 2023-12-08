/*
File: transaction-create.component.ts
description: Contains all the transaction logic of accounting

- Accounting Businesss Knowledge.
   Sales Voucher:
   Dr. Buyers name (if on credit(Sundry Debtors)
   Dr. Cash (if in cash)
   Dr. Bank (Bank name if txn from bank)
   Cr. Sales Revenue  

   Purchase Voucher:
   In case of purchase
   Dr.    Purchase account (and items field if goods are purchased)
   Cr. Suppliers account ( Sundry Creditors),if purchased on credit )
   Cr. Cash (if cash is paid)
   Cr. Bank (Bank name if txn from bank)
  (and there should be fields for items if goods sold,
  but cr. service revenue and no items field  if only service is sold)
-------------------------------------------------------------------
change history:
-------------------------------------------------------------------
S.No     UpdatedBy/Date             description           remarks
-------------------------------------------------------------------
1.       ashim/26Feb2018           modified               Sales/Purchase Flow with Transaction Inventory Items.Added Validations.
                                                    
-------------------------------------------------------------------
*/
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
import { ENUM_ACC_DrCr, ENUM_ACC_PaymentMode, ENUM_ACC_RouteFrom, ENUM_ACC_VoucherCode, ENUM_CalanderType, ENUM_DanpheHTTPResponseText, ENUM_Data_Type, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { AccountingSettingsBLService } from '../../settings/shared/accounting-settings.bl.service';
import { CostCenterModel } from '../../settings/shared/cost-center.model';
import { FiscalYearModel } from "../../settings/shared/fiscalyear.model";
import { LedgerModel } from '../../settings/shared/ledger.model';
import { SubLedgerTransactionModel } from '../../settings/shared/sub-ledger.model';
import { VoucherHeadModel } from '../../settings/shared/voucherhead.model';
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { AccountingService } from '../../shared/accounting.service';
import { SubLedger_DTO } from './../shared/DTOs/subledger-dto';
import { VoucherLedgerInfo_DTO, VoucherVerify_DTO } from './../shared/DTOs/voucher-verify.DTO';
import { TransactionItem } from './../shared/transaction-item.model';
import { TransactionModel } from './../shared/transaction.model';
import { Voucher } from './../shared/voucher';
@Component({
    selector: 'new-voucher-entry',
    templateUrl: "./new-voucher-entry.component.html"
})
export class VoucherEntryNewComponent {
    public transaction: TransactionModel = new TransactionModel();

    public voucherTypeList: Array<Voucher> = new Array<Voucher>();//eg: JV, PV, SV, CN, etc. 

    public fiscalYearList: Array<FiscalYearModel> = [];
    public currFiscalYear: FiscalYearModel = new FiscalYearModel();

    //Id of Currently Selected VoucherType. eg: JV, PV, SV, CN, etc.  default JV is set from function below.
    public selVoucherTypeId: number = 0;
    public todaysDate: string = null;
    public TransactionDate: string = null;

    public selLedgerArr: Array<any> = [];//this keeps tracks of seleted ledgers in this page only. we are forcefully declaring it's type as array of any.
    public allLedgerList: Array<LedgerModel> = [];//these are all available ledgers for current hospital.

    public totalDebit: number = 0;
    public totalCredit: number = 0;
    public totalAmount: number = 0;

    public voucherNumber: string = null;//to pass to the Voucher-View (i.e: Transaction-View page)
    public showVoucherPopup: boolean = false;//sud-nagesh: 20Jun'20 -- this is to show/hide VoucherView (i.e: Transactoin-view page.)

    public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
    public selectedCostCenter = new CostCenterModel();

    public IsBackDateEntry: boolean = false;
    public isCopyVoucher: boolean = false;
    public CopyVoucherNumber: string = "";
    public showAddNewLedgerPage: boolean = false;
    public sectionId: number = 4;  //for manual voucher we are using section id=4 and name =Manual_Voucher
    public selDrCrArray: Array<string> = [];
    public DrCrList: Array<any>;
    public TempVoucherNumber: string = "";
    public HideSavebtn: boolean = false;
    public IsAllowDuplicateVoucherEntry: boolean;
    public curIndex: any;
    public fiscalYId: any;
    public showPayeeAndCheque = false;
    public showPayeeName = false;
    public showChequeNumber = false;
    public voucherCodeEnum: typeof ENUM_ACC_VoucherCode = ENUM_ACC_VoucherCode;
    public selectedVoucherCode: string = ENUM_ACC_VoucherCode.JournalVoucher;
    public paymentORreciptLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public paymentORreciptSubLedgerList: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();

    public extraTransactionItemForPaymentOrReceiptVoucher: TransactionItem = new TransactionItem();
    public paymentModeList: typeof ENUM_ACC_PaymentMode = ENUM_ACC_PaymentMode;
    public paymentMode: string = ENUM_ACC_PaymentMode.Cash;
    public additionalPartyDetailForPaymentOrReceiptVoucher = {
        selectedLedgerCode: null,
        selectedLedger: null,
        selectedSubLedgerCode: null,
        selectedSubLedger: null
    }
    public selectedLedgerCode: Array<any> = []; // Dev 9 Nov'22: We are using any here becasue use of exact type create data binding problem somewhere.
    public calType: string = ENUM_CalanderType.NP;
    public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public selectedSubLedger: Array<any> = [];
    public subLedgerAndCostCenterSetting = {
        "EnableSubLedger": false,
        "EnableCostCenter": false
    };
    public costCenterList = new Array<CostCenterModel>();
    public voucherVerificationRequired = false;
    public isEditVoucher = false;
    public selSubLedgerCode: Array<any> = [];
    @Output("callback-function")
    callBackFunction: EventEmitter<Object> = new EventEmitter<Object>();

    public ledgerWiseSubLedgerMaster: Array<Array<SubLedger_DTO>> = new Array<Array<SubLedger_DTO>>();
    public paymentOrReceiptPartyName: string = "";
    public paymentOrReceiptPartyNameLength: number = 0;
    public SelectedFiscalYearId: number = 0;

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
        this.todaysDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
        this.TransactionDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
        if (this.accountingService.accCacheData.CostCenters && accountingService.accCacheData.CostCenters.length) {

            this.costCenterList = this.accountingService.accCacheData.CostCenters.filter(c => c.IsActive);
        }
        this.GetVoucher();
        this.GetVoucherHead();
        this.GetFiscalYearList();
        this.GetLedgerList();
        if (routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherReportCopy || routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify || routeFromService.RouteFrom === ENUM_ACC_RouteFrom.EditVoucher) {
            this.AssignSelectedTransaction();
        }
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
            this.SelectedFiscalYearId = event.fiscalYearId;
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


    //this function is hotkeys when pressed by user
    hotkeys(event) {
        if (event.altKey) {
            switch (event.keyCode) {
                case 83: {//88='S'  => ALT+S comes here
                    this.SaveVoucherToDb();
                    break;
                }
                case 65: {//65='A'  => ALT+A comes here
                    this.AddNewTxnLedger();
                    break;
                }
                case 46: {//46='delete'  => ALT+delete comes here
                    this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
                    break;
                }
                case 88: {//88='X'  => ALT+X comes here
                    this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
                    break;
                }
                case 86: {//86='V'  => ALT+V comes here
                    document.getElementById("voucher").focus();
                    break;
                }
                case 13: {//13='ENTER'  => ALT+Enter comes here
                    this.SaveVoucherToDb();
                    break;
                }
                case 67: {//67='C'  => ALT+C comes here
                    this.CreateNewLedgerOnClick(this.transaction.TransactionItems.length - 1);
                    break;
                }
            }
        }

    }
    UpdateVoucherChequeNoandPayeeName() {
        try {
            if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                if ((this.voucherTypeList.find(v => v.VoucherId == this.selVoucherTypeId).ShowPayeeName) == true) {
                    this.showPayeeName = true;
                } else {
                    this.showPayeeName = false;
                }
                if ((this.voucherTypeList.find(v => v.VoucherId == this.selVoucherTypeId).ShowChequeNumber == true)) {
                    this.showChequeNumber = true;
                }
                else {
                    this.showChequeNumber = false;
                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    GetVoucher() {
        try {
            if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherTypeList = this.accountingService.accCacheData.VoucherType;//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherTypeList = this.voucherTypeList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
                //JV (Journal Voucher) should always be there, so we can be 100% sure that this shouldn't crash.
                this.selVoucherTypeId = this.voucherTypeList.find(v => v.VoucherCode == "JV").VoucherId;
                this.UpdateVoucherChequeNoandPayeeName();
                this.AssignVoucher();
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    GetVoucherHead() {
        try {
            if (!!this.accountingService.accCacheData.VoucherHead && this.accountingService.accCacheData.VoucherHead.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherHeadList = this.accountingService.accCacheData.VoucherHead;//mumbai-team-june2021-danphe-accounting-cache-change
                this.voucherHeadList = this.voucherHeadList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    GetFiscalYearList() {
        if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.fiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList; //mumbai-team-june2021-danphe-accounting-cache-change
            this.fiscalYearList = this.fiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
        this.currFiscalYear = new FiscalYearModel();
        this.currFiscalYear = this.securityService.AccHospitalInfo.CurrFiscalYear;
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
            this.ChangeFocus("voucher");
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
            if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
                this.allLedgerList = this.accountingService.accCacheData.Ledgers.filter(x => x.IsActive != false);//mumbai-team-june2021-danphe-accounting-cache-change          
                this.allLedgerList = this.allLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
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
                if (this.transaction.TransactionItems.length == 1) {
                    if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                        this.ChangeFocus('SubLedger_Code_1');
                    }
                    else {
                        this.ChangeFocus('Code_1');
                    }
                }

                let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === (this.paymentMode === ENUM_ACC_PaymentMode.Cash ? '021' : '022') && a.Description === 'LedgerGroupName');
                if (codeDetail) {
                    let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
                    if (ledgerGroup) {
                        this.paymentORreciptLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
                        this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => this.paymentORreciptLedgerList.some(b => a.LedgerId === b.LedgerId));
                    }
                }
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    AddNewTxnLedger() {
        try {
            this.showAddNewLedgerPage = false;
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
            if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
                this.transaction.TransactionItems[index - 1].TransactionItemValidator.controls["DrCr"].disable();
                this.selDrCrArray[index - 1] = "Dr";
            }
            else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
                this.transaction.TransactionItems[index - 1].TransactionItemValidator.controls["DrCr"].disable();
                this.selDrCrArray[index - 1] = "Cr";
            }
            this.DescriptionValChanged(this.transaction.TransactionItems.length - 1);
            this.ledgerWiseSubLedgerMaster[index - 1] = this.subLedgerMaster;

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
    //POST the txn to Database 
    SaveVoucherToDb() {
        if (this.Validate()) {
            this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
            if (this.IsBackDateEntry == false) {
                this.transaction.IsBackDateEntry = false;
                this.transaction.TransactionDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
            }
            else {
                this.transaction.IsBackDateEntry = true;
                this.transaction.TransactionDate = this.TransactionDate.concat(" 00:01:00");
            }
            this.accountingBLService.PostToTransaction(this.transaction).
                subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.HideSavebtn = false;
                        this.Reset();
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Voucher is successfully Saved."]);
                        this.ViewTransactionDetails(res.Results);
                        this.AssignVoucher();
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to create transaction.']);
                        this.logError(res.ErrorMessage);
                        this.HideSavebtn = false;
                    }
                });
        }
        else {
            if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
                let index = this.transaction.TransactionItems.findIndex(a => a.LedgerId === this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId);
                if (index >= 0) {
                    this.transaction.TransactionItems.splice(index, 1);
                }
            }
        }
    }

    public Validate(): boolean {
        if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
            if (this.selectedVoucherCode == ENUM_ACC_VoucherCode.PaymentVoucher) {
                let index = this.transaction.TransactionItems.findIndex(a => a.DrCr == false);
                if (index >= 0)
                    this.transaction.TransactionItems.splice(index, 1);
                this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = false;
            }
            else {
                let index = this.transaction.TransactionItems.findIndex(a => a.DrCr == true);
                if (index >= 0)
                    this.transaction.TransactionItems.splice(index, 1);
                this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = true;
            }
            this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = this.transaction.TransactionItems.reduce((a, b) => a + b.Amount, 0);
            if (this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId <= 0 || (this.subLedgerAndCostCenterSetting.EnableSubLedger && this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.length <= 0)) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Please select at least one ledger/sub-ledger for payment or receipt.`]);
                return false;
            }
            this.transaction.TransactionItems.push(this.extraTransactionItemForPaymentOrReceiptVoucher);
            this.CalculateLedger();
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
                            if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || ENUM_ACC_VoucherCode.ReceiptVoucher) {
                                if ((txnItem.Amount === this.extraTransactionItemForPaymentOrReceiptVoucher.Amount && txnItem.LedgerId === this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId &&
                                    ((this.subLedgerAndCostCenterSetting.EnableSubLedger && txnItem.SubLedgers && txnItem.SubLedgers.length > 0) || !this.subLedgerAndCostCenterSetting.EnableSubLedger))) {
                                    txnValidation = true;
                                }
                                else {
                                    txnValidation = false;
                                }
                                this.HideSavebtn = true;
                            }
                            else {
                                txnValidation = false;
                                this.HideSavebtn = false;
                                return false;
                            }
                        }
                    };
                }

                else {
                    txnValidation = false;
                }
                this.HideSavebtn = false;
                if (txnValidation && this.CheckCalculations()) {
                    this.transaction.TotalAmount = this.totalDebit;
                    if (this.checkDateValidation()) {

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

    ViewTransactionDetails(resultdata) {
        try {
            localStorage.setItem("SectionId", this.sectionId.toString());
            this.voucherNumber = resultdata.VoucherNumber;
            this.fiscalYId = resultdata.FiscalyearId;    //pass fsYid with voucher number 
            this.showVoucherPopup = true;
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
                            this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selLedgerArr[index].LedgerName + " already entered."]);
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
                else if (typeof this.selLedgerArr[index] === "string") {
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
                        this.msgBoxServ.showMessage("failed", ["Invalid itemList Name. Please select itemList from the list."]);
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
            this.transaction = new TransactionModel();
            this.selectedCostCenter = new CostCenterModel();
            this.selLedgerArr = [];
            this.totalDebit = 0;
            this.totalCredit = 0;
            this.ChangeFocus("voucher");
            this.routeFromService.RouteFrom = "";
            this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
            this.SetDefaultCostCenterForExtraItem();
            this.selectedLedgerCode = [];
            this.voucherVerificationRequired = false;
            this.isEditVoucher = false;
            this.additionalPartyDetailForPaymentOrReceiptVoucher = {
                selectedLedgerCode: null,
                selectedLedger: null,
                selectedSubLedgerCode: null,
                selectedSubLedger: null
            };
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
                if (a.DrCr === true || a.DrCr.toString() == "true") {
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

    //create new Ledger 
    CreateNewLedgerOnClick(i) {
        this.curIndex = i;
        let check = confirm("Do you want to create new Ledger?");
        if (check) {
            this.showAddNewLedgerPage = false;
            this.showAddNewLedgerPage = true;
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
                this.selectedLedgerCode.splice(index, 1);
            }
            else if (this.transaction.TransactionItems.length === 1) {
                this.selSubLedgerCode[index] = "";
                this.selLedgerArr[index] = "";
                this.selectedSubLedger[index] = "";
                this.selectedLedgerCode[index] = "";
                this.transaction.TransactionItems[index].Amount = null;
                this.transaction.TransactionItems[index].Description = null;
            }
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
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }
    //This function only for show catch messages
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
            //set validator off
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

        if (this.transaction.TransactionItems.filter(a => a.DrCr == true).length == this.transaction.TransactionItems.length
            && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy
            && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherVerify && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.EditVoucher) {
            this.transaction.TransactionItems[i].Amount = 0;
        }
        else if (this.transaction.TransactionItems.filter(a => a.DrCr == false).length == this.transaction.TransactionItems.length
            && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy
            && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherVerify && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.EditVoucher) {
            this.transaction.TransactionItems[i].Amount = 0;
        }
        this.CalculateLedger();
    }

    onVoucherTypeChange() {
        this.UpdateVoucherChequeNoandPayeeName();
        //if no txn item then assign voucher, else confirm and change voucher type
        if (this.transaction.TransactionItems.length == 0) {
            this.AssignVoucher();
        } else {
            var check: boolean = true;
            let oldVoucherTypeId = this.transaction.VoucherId;
            check = confirm("Are you sure you want to change the Voucher Type?");
            if (check) {
                this.transaction.VoucherId = this.selVoucherTypeId;
                this.selectedVoucherCode = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId).VoucherCode;
                //this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
                this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
            }
            else { //set to old one if user chooses 'NO' from confirmbox.
                this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
                this.selVoucherTypeId = oldVoucherTypeId;//detect change should be above this else it won't work.. :(
            }
        }
        if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
            this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
            this.SetDefaultCostCenterForExtraItem();
            this.transaction.TransactionItems.forEach(a => {
                a.TransactionItemValidator.controls["DrCr"].disable();
            });
            this.selDrCrArray.fill(ENUM_ACC_DrCr.Dr);
            setTimeout(() => {
                this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
            }, 100);
        }
        else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
            this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
            this.SetDefaultCostCenterForExtraItem();
            this.transaction.TransactionItems.forEach(a => {
                a.TransactionItemValidator.controls["DrCr"].disable();
            });
            this.selDrCrArray.fill(ENUM_ACC_DrCr.Cr);
            setTimeout(() => {
                this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
            }, 100);
        }
        else {
            this.transaction.TransactionItems.forEach(a => {
                a.TransactionItemValidator.controls["DrCr"].enable();
            });
            setTimeout(() => {
                if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                    this.ChangeFocus('SubLedger_Code_1');
                }
                else {
                    this.ChangeFocus('Code_1');
                }
            }, 100);
            this.paymentOrReceiptPartyName = "";
            this.UpdateNarration();
        }
        this.transaction.TransactionItems.forEach((a, index) => this.onDrCrChange(index));
        this.additionalPartyDetailForPaymentOrReceiptVoucher = {
            selectedLedgerCode: null,
            selectedLedger: null,
            selectedSubLedgerCode: null,
            selectedSubLedger: null
        }
    }

    CheckAndAddNewTxnLedger($event, index) {
        if (this.voucherVerificationRequired) {
            return;
        }
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

    async CallBackAddNewLedger($event) {
        if ($event && $event.action == "add") {
            var temp = $event.data;
            await this.UpdateLedgers();
            this.selLedgerArr[this.curIndex] = temp.LedgerName;
            this.GetLedgerList();
        }
        this.showAddNewLedgerPage = false;

    }


    SetDefaultCostCenterForExtraItem() {
        let defaultCostCenter = this.costCenterList.find(a => a.IsDefault === true);
        if (defaultCostCenter) {
            this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = defaultCostCenter.CostCenterId;
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
        if (this.isEditVoucher) {
            this.callBackFunction.emit();
        }
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

    public AssignSelectedTransaction() {
        let data = this.accountingService.copyVoucherData;
        this.transaction = new TransactionModel();
        if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
            this.voucherVerificationRequired = true;
            this.transaction.FiscalYearId = data.FiscalYearId;
            this.TransactionDate = data.TransactionDate;
        }
        else if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.EditVoucher) {
            this.isEditVoucher = true;
            this.TransactionDate = data.TransactionDate;
            this.transaction.FiscalYearId = data.FiscalYearId;
        }
        else {
            this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
            this.TransactionDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
        }
        this.transaction.TransactionDate = this.TransactionDate;
        this.transaction.VoucherNumber = data.VoucherNumber;
        this.transaction.VoucherId = this.selVoucherTypeId = this.voucherTypeList.find(a => a.VoucherName == data.VoucherType).VoucherId;
        this.transaction.TransactionId = data.TransactionId;
        let txnItems = data.TransactionItems;
        this.selectedVoucherCode = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId).VoucherCode;
        if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
            let tempTxn = txnItems.find(a => a.DrCr == false);
            let ledger = tempTxn && this.allLedgerList.find(a => a.LedgerId === tempTxn.LedgerId);
            if (ledger) {
                let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.LedgerGroupId === ledger.LedgerGroupId);
                if (ledgerGroup) {
                    let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Name === ledgerGroup.Name && a.Description === 'LedgerGroupName');
                    if (codeDetail) {
                        this.paymentMode = codeDetail.Code === '021' ? ENUM_ACC_PaymentMode.Cash : ENUM_ACC_PaymentMode.Bank;
                        this.filterPaymentOrReceiptLedger();
                    }
                }
            }
            this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = tempTxn.Amount;
            this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = tempTxn.DrCr;
            this.extraTransactionItemForPaymentOrReceiptVoucher.Description = tempTxn.Description;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = tempTxn.CostCenterId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId = tempTxn.TransactionItemId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionId = tempTxn.TransactionId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = tempTxn.SubLedgers;

            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = tempTxn.LedgerName;
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode = tempTxn.Code;
            if (tempTxn.SubLedgers && tempTxn.SubLedgers.length > 0) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = tempTxn.SubLedgers[0].SubLedgerName;
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = tempTxn.SubLedgers[0].SubLedgerCode;
            }
            txnItems = txnItems.filter(a => a.DrCr == true);
        }
        else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
            let tempTxn = txnItems.find(a => a.DrCr == true);
            let ledger = tempTxn && this.allLedgerList.find(a => a.LedgerId === tempTxn.LedgerId);
            if (ledger) {
                let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.LedgerGroupId === ledger.LedgerGroupId);
                if (ledgerGroup) {
                    let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Name === ledgerGroup.Name && a.Description === 'LedgerGroupName');
                    if (codeDetail) {
                        this.paymentMode = codeDetail.Code === '021' ? ENUM_ACC_PaymentMode.Cash : ENUM_ACC_PaymentMode.Bank;
                        this.filterPaymentOrReceiptLedger();
                    }
                }
            }
            this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = tempTxn.Amount;
            this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = tempTxn.DrCr;
            this.extraTransactionItemForPaymentOrReceiptVoucher.Description = tempTxn.Description;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = tempTxn.CostCenterId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId = tempTxn.TransactionItemId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionId = tempTxn.TransactionId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = tempTxn.SubLedgers;

            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = tempTxn.LedgerName;
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode = tempTxn.Code;
            if (tempTxn.SubLedgers && tempTxn.SubLedgers.length > 0) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = tempTxn.SubLedgers[0].SubLedgerName;
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = tempTxn.SubLedgers[0].SubLedgerCode;
            }
            txnItems = txnItems.filter(a => a.DrCr == false);
        }
        this.TempVoucherNumber = data.VoucherNumber;

        this.GettempVoucherNumber(this.transaction.VoucherId, data.SectionId, this.todaysDate);
        this.transaction.Remarks = data.Remarks;
        this.transaction.ChequeDate = data.ChequeDate;
        this.transaction.ChequeNumber = data.ChequeNumber;

        txnItems.forEach((element, index) => {
            this.AddNewTxnLedger();
            this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId == element.LedgerId);
            this.selDrCrArray[index] = this.DrCrList.find(a => a.DrCr == (element.DrCr ? 'Dr' : 'Cr'));
            this.selectedLedgerCode[index] = element.Code;
            this.transaction.TransactionItems[index].Amount = element.Amount;
            this.transaction.TransactionItems[index].DrCr = element.DrCr;
            this.transaction.TransactionItems[index].Code = element.Code;
            this.transaction.TransactionItems[index].LedgerId = element.LedgerId;
            this.transaction.TransactionItems[index].LedgerName = element.LedgerName;
            if (element.SubLedgers && element.SubLedgers.length > 0) {
                this.transaction.TransactionItems[index].SubLedgers = element.SubLedgers;
                this.selectedSubLedger[index] = this.subLedgerMaster.find(a => a.SubLedgerId === element.SubLedgers[0].SubLedgerId);
                this.selSubLedgerCode[index] = this.selectedSubLedger[index].SubLedgerCode;
            }
            this.transaction.TransactionItems[index].Description = element.Description;
            this.transaction.TransactionItems[index].CostCenterId = element.CostCenterId;
            this.transaction.TransactionItems[index].TransactionItemId = element.TransactionItemId;
            if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
                this.transaction.TransactionItems[index].TransactionItemValidator.controls["DrCr"].disable();
                this.transaction.TransactionItems[index].TransactionItemValidator.controls["Amount"].disable();
                this.transaction.TransactionItems[index].TransactionItemValidator.controls["LedgerId"].disable();
                this.transaction.TransactionItems[index].TransactionItemValidator.controls["SubLedgerId"].disable();
            }
            this.CalculateLedger();
        });
    }

    public fiscalYearIdForCopyVoucher: number = 0;
    public GetFiscalYearIdForCopyVoucher($event) {
        if ($event)
            this.fiscalYearIdForCopyVoucher = $event.fiscalYearId;
    }
    public getCopyVoucher() {
        this.voucherNumber = null;
        this.fiscalYId = null;
        this.changeDetectorRef.detectChanges();
        this.voucherNumber = this.CopyVoucherNumber;
        this.fiscalYId = this.fiscalYearIdForCopyVoucher;
    }
    public AssignExtraLedger(): void {
        if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger === ENUM_Data_Type.Object && this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger) {
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger.LedgerId;
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = null;
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = null;
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger.LedgerId).Code;
            this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger.LedgerId);
            if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                this.ChangeFocus("extra_SubLedger_Code_for_PMTV_and_Receipt");
            }
            else if (this.subLedgerAndCostCenterSetting.EnableCostCenter) {
                this.ChangeFocus("id_extraTransactionItemForPaymentOrReceiptVoucher_costCenterId_voucherEntry");
            }
            else if (this.paymentMode !== this.paymentModeList.Bank && !this.subLedgerAndCostCenterSetting.EnableCostCenter && !this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                this.ChangeFocus("extra_Narration_for_PMTV_and_Receipt")
            }
            else if (this.paymentMode == this.paymentModeList.Bank && !this.subLedgerAndCostCenterSetting.EnableCostCenter && !this.subLedgerAndCostCenterSetting.EnableSubLedger) {
                this.ChangeFocus("input_voucherEntry_chequeNumber")
            }
        }
        else {
            this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger ? this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger.trim() : true;
            let ledger = this.paymentORreciptLedgerList.find(a => a.LedgerName === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger);
            if (this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger === "" || (ledger && ledger.LedgerId !== this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId))
                this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => this.paymentORreciptLedgerList.some(b => a.LedgerId === b.LedgerId));
        }
    }

    public AssignExtraSubLedger(isCode: boolean) {
        if (isCode && typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode === ENUM_Data_Type.Object) {
            let subLedTxn = new SubLedgerTransactionModel();
            subLedTxn.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.LedgerId;
            subLedTxn.SubLedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.SubLedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = subLedTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.push(subLedTxn)
            let subLedger = this.subLedgerMaster.find(a => a.SubLedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.SubLedgerId);
            let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.LedgerId);
            if (subLedger) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = subLedger;
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = subLedger.SubLedgerCode;
            }
            if (Ledger) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
            }
        }
        else if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger === ENUM_Data_Type.Object) {
            let subLedTxn = new SubLedgerTransactionModel();
            subLedTxn.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.LedgerId;
            subLedTxn.SubLedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.SubLedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = subLedTxn.LedgerId;
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
            this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.push(subLedTxn)
            let subLedger = this.subLedgerMaster.find(a => a.SubLedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.SubLedgerId);
            let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.LedgerId);
            if (subLedger) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = subLedger.SubLedgerCode;
            }
            if (Ledger) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
            }
        }
    }

    public AssignExtraLedgerCode() {
        if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode === ENUM_Data_Type.Object) {
            this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode.LedgerId;
            let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode.LedgerId);
            if (Ledger) {
                this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
            }
            this.ChangeFocus("extra_Ledger_for_PMTV_and_Receipt");
        }
    }


    public filterPaymentOrReceiptLedger(): void {
        this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
        this.additionalPartyDetailForPaymentOrReceiptVoucher = {
            selectedLedgerCode: null,
            selectedLedger: null,
            selectedSubLedgerCode: null,
            selectedSubLedger: null
        };
        this.SetDefaultCostCenterForExtraItem();
        let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === (this.paymentMode === ENUM_ACC_PaymentMode.Cash ? '021' : '022') && a.Description === 'LedgerGroupName');
        if (codeDetail) {
            let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
            if (ledgerGroup) {
                this.paymentORreciptLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
                this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => this.paymentORreciptLedgerList.some(b => a.LedgerId === b.LedgerId));
            }
        }
        this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
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
                            this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selectedLedgerCode[index].LedgerName + " already entered."]);
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

    setChequeDate(event) {
        if (event) {
            this.transaction.ChequeDate = event.selectedDate;
        }
        else {
            this.transaction.ChequeDate = null;
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

    public GetSubLedger() {
        this.accountingSettingBlService.GetSubLedger().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.subLedgerMaster = res.Results;
                this.subLedgerMaster = this.subLedgerMaster.filter(a => a.IsActive === true);
            }
        },
            (err: DanpheHTTPResponse) => {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get subLedger list."]);
            });
    }

    public VerifyVoucher() {
        this.HideSavebtn = true;

        let txnItems = _.cloneDeep(this.transaction.TransactionItems);
        let extraItem = _.cloneDeep(this.extraTransactionItemForPaymentOrReceiptVoucher);
        txnItems.push(extraItem);
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
                this.HideSavebtn = false;
                return;
            }
        }

        let voucherData = new VoucherVerify_DTO();
        voucherData.VoucherNumber = this.TempVoucherNumber;
        voucherData.Remarks = this.transaction.Remarks;
        voucherData.FiscalYearId = this.transaction.FiscalYearId;
        let items = Array<VoucherLedgerInfo_DTO>();

        this.transaction.TransactionItems.forEach(ledger => {
            let item = new VoucherLedgerInfo_DTO();
            item.LedgerId = ledger.LedgerId;
            item.Description = ledger.Description;
            item.CostCenterId = ledger.CostCenterId;
            item.TransactionItemId = ledger.TransactionItemId
            items.push(item);
        });

        let item = new VoucherLedgerInfo_DTO();
        item.LedgerId = this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId;
        item.Description = this.extraTransactionItemForPaymentOrReceiptVoucher.Description;
        item.CostCenterId = this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId;
        item.TransactionItemId = this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId
        items.push(item);

        voucherData.Items = items;
        this.accountingBLService.VerifyVoucher(voucherData)
            .finally(() => {
                this.HideSavebtn = false;
                this.Cancel();
            })
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.ViewTransactionDetails(res.Results);
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Voucher is successfully verified.`]);
                    this.Cancel();
                    this.accountingService.voucherTxnData.VoucherNumber = res.Results.VoucherNumber;
                    this.accountingService.voucherTxnData.FiscalyearId = res.Results.FiscalyearId;
                    this.router.navigate(['/Accounting/VoucherVerification']);
                }
                else {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Unable to verify the voucher.`]);
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
                }
            );
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

    public UpdateTransaction() {
        if (this.Validate()) {
            if (this.transaction.TransactionId > 0) {
                this.transaction.TransactionDate = this.TransactionDate;
                if (this.SelectedFiscalYearId > 0)
                    this.transaction.FiscalYearId = this.SelectedFiscalYearId;
                this.accountingBLService
                    .PutToTransaction(this.transaction)
                    .subscribe((res) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            this.HideSavebtn = false;
                            this.Reset();
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Voucher is successfully update."]);
                            this.AssignVoucher();
                            this.callBackFunction.emit(res.Results);
                        } else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to update transaction."]);
                            this.logError(res.ErrorMessage);
                            this.HideSavebtn = false;
                        }
                    });
            }
        }
        else {
            if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
                let index = this.transaction.TransactionItems.findIndex(a => a.LedgerId === this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId);
                if (index >= 0) {
                    this.transaction.TransactionItems.splice(index, 1);
                }
            }
        }
    }

    public UpdateNarration() {
        this.transaction.Remarks = this.paymentOrReceiptPartyName + this.transaction.Remarks.substring(this.paymentOrReceiptPartyNameLength, this.transaction.Remarks.length);
        this.paymentOrReceiptPartyNameLength = this.paymentOrReceiptPartyName.length;
    }

    public PushNarration() {
        this.transaction.TransactionItems.forEach(item => {
            item.Description = this.transaction.Remarks;
        });
        this.extraTransactionItemForPaymentOrReceiptVoucher.Description = this.transaction.Remarks;
    }
}
