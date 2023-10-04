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
import { Component } from '@angular/core';
@Component({
  templateUrl: "./voucher-entry-old.html"
})
export class VoucherEntryComponent {
  // public transaction: TransactionModel = new TransactionModel();

  // public voucherTypeList: Array<Voucher> = new Array<Voucher>();//eg: JV, PV, SV, CN, etc. 

  // public fiscalYearList: Array<FiscalYearModel> = [];
  // public currFiscalYear: FiscalYearModel = new FiscalYearModel();

  // //Id of Currently Selected VoucherType. eg: JV, PV, SV, CN, etc.  default JV is set from function below.
  // public selVoucherTypeId: number = 0;
  // public todaysDate: string = null;
  // public TransactionDate: string = null;

  // public selLedgerArr: Array<any> = [];//this keeps tracks of seleted ledgers in this page only. we are forcefully declaring it's type as array of any.
  // public allLedgerList: Array<LedgerModel> = [];//these are all available ledgers for current hospital.

  // public totalDebit: number = 0;
  // public totalCredit: number = 0;
  // public totalAmount: number = 0;

  // public voucherNumber: string = null;//to pass to the Voucher-View (i.e: Transaction-View page)
  // public showVoucherPopup: boolean = false;//sud-nagesh: 20Jun'20 -- this is to show/hide VoucherView (i.e: Transactoin-view page.)

  // public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
  // public selectedCostCenter = new CostCenterModel();

  // public IsBackDateEntry: boolean = false;
  // public isCopyVoucher: boolean = false;
  // public CopyVoucherNumber: string = "";
  // public showAddNewLedgerPage: boolean = false;
  // public sectionId: number = 4;  //for manual voucher we are using section id=4 and name =Manual_Voucher
  // public selDrCrArray: Array<string> = [];
  // public DrCrList: Array<any>;
  // public TempVoucherNumber: string = "";
  // public HideSavebtn: boolean = false;
  // public IsAllowDuplicateVoucherEntry: boolean;
  // public curIndex: any;
  // public fiscalYId: any;
  // public showPayeeAndCheque = false;
  // public showPayeeName = false;
  // public showChequeNumber = false;
  // public voucherCodeEnum: typeof ENUM_ACC_VoucherCode = ENUM_ACC_VoucherCode;
  // public selectedVoucherCode: string = ENUM_ACC_VoucherCode.JournalVoucher;
  // public paymentORreciptLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  // public paymentORreciptSubLedgerList: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();

  // public extraTransactionItemForPaymentOrReceiptVoucher: TransactionItem = new TransactionItem();
  // public paymentModeList: typeof ENUM_ACC_PaymentMode = ENUM_ACC_PaymentMode;
  // public paymentMode: string = ENUM_ACC_PaymentMode.Cash;
  // public selectedExtraLedgerForPaymentOrReceipt: LedgerModel = new LedgerModel();
  // public selectedExtraSubLedgerForPaymentOrReceipt: SubLedger_DTO = new SubLedger_DTO();
  // public additionalPartyDetailForPaymentOrReceiptVoucher = {
  //   selectedLedgerCode: null,
  //   selectedLedger: null,
  //   selectedSubLedgerCode: null,
  //   selectedSubLedger: null
  // }
  // public disableDrCr: boolean = false;
  // public selectedLedgerCode: Array<any> = []; // Dev 9 Nov'22: We are using any here becasue use of exact type create data binding problem somewhere.
  // public calType: string = ENUM_CalanderType.NP;
  // //public selectedSubLedgerArray: Array<SubLedgerModel> = [];


  // public showSubLedgerAddPopUp: boolean = false;
  // public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  // public LedgerwiseSubLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  // public subLedgers: Array<SubLedgerTransactionModel> = new Array<SubLedgerTransactionModel>();
  // public selectedSubLedger: Array<any> = [];
  // public selectedItemIndex: number = 0;
  // public subLedgerAndCostCenterSetting = {
  //   "EnableSubLedger": false,
  //   "EnableCostCenter": false
  // };
  // public subLedgerDetail: Array<string> = new Array<string>();
  // public remainingAmount: number = 0;
  // public costCenterList = new Array<CostCenterModel>();
  // public voucherVerificationRequired = false;
  // public selSubLedgerCode: Array<any> = [];

  // constructor(
  //   public accountingBLService: AccountingBLService,
  //   public msgBoxServ: MessageboxService,
  //   public changeDetectorRef: ChangeDetectorRef, public coreService: CoreService, public accountingService: AccountingService,
  //   public router: Router, public routeFromService: RouteFromService, public securityService: SecurityService,
  //   public accountingSettingBlService: AccountingSettingsBLService) {
  //   this.setParameterValues();
  //   this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
  //   this.DrCrList = [{ 'DrCr': 'Dr' }, { 'DrCr': 'Cr' }];
  //   this.selDrCrArray[0] = "Dr";
  //   this.todaysDate = moment().format('YYYY-MM-DD');
  //   this.TransactionDate = moment().format('YYYY-MM-DD');
  //   // this.transaction.TransactionDate = moment().format('YYYY-MM-DD');
  //   this.costCenterList = this.accountingService.accCacheData.CostCenters ? this.accountingService.accCacheData.CostCenters.filter(c => c.ParentCostCenterId === 0) : [];
  //   this.GetVoucher();
  //   this.GetVoucherHead();
  //   this.GetFiscalYearList();
  //   this.GetLedgerList();
  //   // this.GetSubLedger();
  //   if (routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherReportCopy || routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
  //     this.CallBackCopyVoucher();
  //   }
  //   if (!!this.accountingService.accCacheData.CodeDetails && this.accountingService.accCacheData.CodeDetails.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //     this.coreService.SetCodeDetails(this.accountingService.accCacheData.CodeDetails);//mumbai-team-june2021-danphe-accounting-cache-change
  //   }
  //   if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //     this.coreService.SetFiscalYearList(this.accountingService.accCacheData.FiscalYearList);//mumbai-team-june2021-danphe-accounting-cache-change
  //   }
  // }

  // ngOnInit() {
  //   //console.log("voucher-entry- NgOnINIT called..");
  // }

  // ngAfterViewInit() {
  //   this.routeFromService.RouteFrom = "";
  // }

  // public validDate: boolean = true;
  // selectDate(event) {
  //   if (event) {
  //     this.TransactionDate = event.selectedDate;
  //     this.validDate = true;
  //     this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
  //   }
  //   else {
  //     this.validDate = false;
  //   }

  // }
  // // CostCenterChange(): void {
  // //   this.transaction.CostCenterId = this.selectedCostCenter.CostCenterId;
  // // }

  // setParameterValues() {
  //   let Parameter = this.coreService.Parameters;
  //   let param = Parameter.find(parms => parms.ParameterGroupName == "Accounting" && parms.ParameterName == "IsAllowDuplicateVoucherEntry");
  //   if (param) {
  //     this.IsAllowDuplicateVoucherEntry = JSON.parse(param.ParameterValue);
  //   }
  //   else {
  //     this.IsAllowDuplicateVoucherEntry = true;
  //   }

  //   let subLedgerParma = Parameter.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
  //   if (subLedgerParma) {
  //     this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
  //   }
  // }


  // //this function is hotkeys when pressed by user
  // hotkeys(event) {
  //   if (event.altKey) {
  //     switch (event.keyCode) {
  //       case 83: {//88='S'  => ALT+S comes here
  //         this.SaveVoucherToDb();
  //         break;
  //       }
  //       case 65: {//65='A'  => ALT+A comes here
  //         this.AddNewTxnLedger();
  //         break;
  //       }
  //       case 46: {//46='delete'  => ALT+delete comes here
  //         this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
  //         break;
  //       }
  //       case 88: {//88='X'  => ALT+X comes here
  //         this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
  //         break;
  //       }
  //       case 86: {//86='V'  => ALT+V comes here
  //         document.getElementById("voucher").focus();
  //         break;
  //       }
  //       case 13: {//13='ENTER'  => ALT+Enter comes here
  //         this.SaveVoucherToDb();
  //         break;
  //       }
  //       case 67: {//67='C'  => ALT+C comes here
  //         this.CreateNewLedgerOnClick(this.transaction.TransactionItems.length - 1);
  //         break;
  //       }
  //     }
  //   }

  // }
  // UpdateVoucherChequeNoandPayeeName() {
  //   try {
  //     if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       if ((this.voucherTypeList.find(v => v.VoucherId == this.selVoucherTypeId).ShowPayeeName) == true) {
  //         this.showPayeeName = true;
  //       } else {
  //         this.showPayeeName = false;
  //       }
  //       if ((this.voucherTypeList.find(v => v.VoucherId == this.selVoucherTypeId).ShowChequeNumber == true)) {
  //         this.showChequeNumber = true;
  //       }
  //       else {
  //         this.showChequeNumber = false;
  //       }
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // GetVoucher() {
  //   try {
  //     if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherTypeList = this.accountingService.accCacheData.VoucherType;//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherTypeList = this.voucherTypeList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
  //       //JV (Journal Voucher) should always be there, so we can be 100% sure that this shouldn't crash.
  //       this.selVoucherTypeId = this.voucherTypeList.find(v => v.VoucherCode == "JV").VoucherId;
  //       this.UpdateVoucherChequeNoandPayeeName();
  //       this.AssignVoucher();
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // GetVoucherHead() {
  //   try {
  //     if (!!this.accountingService.accCacheData.VoucherHead && this.accountingService.accCacheData.VoucherHead.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherHeadList = this.accountingService.accCacheData.VoucherHead;//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherHeadList = this.voucherHeadList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // GetFiscalYearList() {
  //   if (!!this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //     this.fiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList; //mumbai-team-june2021-danphe-accounting-cache-change
  //     this.fiscalYearList = this.fiscalYearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
  //   }
  //   this.currFiscalYear = new FiscalYearModel();
  //   this.currFiscalYear = this.securityService.AccHospitalInfo.CurrFiscalYear;
  // }


  // AssignVoucher() {
  //   try {
  //     //if (check) {
  //     //this.Reset();// this reset  method set default voucher hade
  //     this.transaction = new TransactionModel();
  //     this.selectedCostCenter = new CostCenterModel();
  //     this.selLedgerArr = [];
  //     this.selectedSubLedger = [];
  //     this.selSubLedgerCode = [];
  //     this.totalDebit = 0;
  //     this.totalCredit = 0;
  //     this.ChangeFocus("voucher");
  //     this.transaction.VoucherId = this.selVoucherTypeId;
  //     this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
  //     this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
  //     this.AddNewTxnLedger();
  //     if (this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy)
  //       this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);

  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // //get all Ledger
  // GetLedgerList() {
  //   try {
  //     if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.allLedgerList = this.accountingService.accCacheData.Ledgers.filter(x => x.IsActive != false);//mumbai-team-june2021-danphe-accounting-cache-change          
  //       this.allLedgerList = this.allLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.allLedgerList.forEach(a => {
  //         if (a.ClosingBalance > 0) {
  //           a.ClosingBalwithDrCr = "Dr" + a.ClosingBalance;
  //         }
  //         else if (a.ClosingBalance == 0) {
  //           a.ClosingBalwithDrCr = "0";
  //         }
  //         else {
  //           a.ClosingBalwithDrCr = "Cr" + -a.ClosingBalance;
  //         }
  //       });
  //       //this.SetDefaultCostCenter();
  //       if (this.transaction.TransactionItems.length == 1) {
  //         if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //           this.ChangeFocus('SubLedger_Code_1');
  //         }
  //         else {
  //           this.ChangeFocus('Code_1');
  //         }
  //       }

  //       let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === (this.paymentMode === ENUM_ACC_PaymentMode.Cash ? '021' : '022') && a.Description === 'LedgerGroupName');
  //       if (codeDetail) {
  //         let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
  //         if (ledgerGroup) {
  //           this.paymentORreciptLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
  //           this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => this.paymentORreciptLedgerList.some(b => a.LedgerId === b.LedgerId));
  //         }
  //       }
  //       //this.paymentORreciptLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId == 6); // Dev 9 Nov'22 For Now we are hardcoding LedgerGroupId 6 means CashLedgerGroup.
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // AddNewTxnLedger() {
  //   try {
  //     this.showAddNewLedgerPage = false;
  //     var currentTxnItem = new TransactionItem();
  //     if (this.totalDebit > this.totalCredit) {
  //       currentTxnItem.DrCr = false;
  //       var temp = this.totalDebit - this.totalCredit;
  //       if (temp <= 0) {
  //         temp = 0;
  //       }
  //       currentTxnItem.Amount = CommonFunctions.parseDecimal(temp);
  //     }
  //     else {
  //       currentTxnItem.DrCr = true;
  //       var temp = this.totalCredit - this.totalDebit;
  //       if (temp <= 0) {
  //         temp = 0;
  //       }
  //       currentTxnItem.Amount = CommonFunctions.parseDecimal(temp);
  //     }
  //     let defaultCostCenter = this.costCenterList.find(a => a.IsDefault === true);
  //     if (defaultCostCenter) {
  //       currentTxnItem.CostCenterId = defaultCostCenter.CostCenterId;
  //     }
  //     this.transaction.TransactionItems.push(currentTxnItem);
  //     let index = this.transaction.TransactionItems.length;
  //     if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
  //       this.transaction.TransactionItems[index - 1].TransactionItemValidator.controls["DrCr"].disable();
  //       this.selDrCrArray[index - 1] = "Dr";
  //     }
  //     else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //       this.transaction.TransactionItems[index - 1].TransactionItemValidator.controls["DrCr"].disable();
  //       this.selDrCrArray[index - 1] = "Cr";
  //     }
  //     //here we need to pass index of newly created ledger. Index will always be length-1
  //     this.DescriptionValChanged(this.transaction.TransactionItems.length - 1);

  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // checkDateValidation() {
  //   if (!this.validDate) {
  //     this.msgBoxServ.showMessage("error", ['Select proper date']);
  //     return false;
  //   } else {
  //     return true;
  //   }


  // }
  // //POST the txn to Database 
  // SaveVoucherToDb() {
  //   if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //     if (this.selectedVoucherCode == ENUM_ACC_VoucherCode.PaymentVoucher) {
  //       let index = this.transaction.TransactionItems.findIndex(a => a.DrCr == false);
  //       if (index >= 0)
  //         this.transaction.TransactionItems.splice(index, 1);
  //       this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = false;
  //     }
  //     else {
  //       let index = this.transaction.TransactionItems.findIndex(a => a.DrCr == true);
  //       if (index >= 0)
  //         this.transaction.TransactionItems.splice(index, 1);
  //       this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = true;
  //     }
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = this.transaction.TransactionItems.reduce((a, b) => a + b.Amount, 0);
  //     if (this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId <= 0 || (this.subLedgerAndCostCenterSetting.EnableSubLedger && this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.length <= 0)) {
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Please select at least one ledger/sub-ledger for payment or receipt.`]);
  //       return;
  //     }
  //     this.transaction.TransactionItems.push(this.extraTransactionItemForPaymentOrReceiptVoucher);
  //     this.CalculateLedger();
  //   }
  //   if (this.transaction.TransactionItems.length > 2) {
  //     this.transaction.TransactionItems = this.transaction.TransactionItems.filter(a => a.LedgerId > 0);
  //   }
  //   this.transaction.UpdateValidator("off", "PayeeName", "required");
  //   this.transaction.UpdateValidator("off", "ChequeNumber", "");
  //   if (!this.CheckCalculations()) {
  //     if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //       this.transaction.TransactionItems.pop();
  //     }
  //     return;
  //   }
  //   this.HideSavebtn = true;
  //   let check = confirm("Are you sure you want to save?");
  //   if (check) {
  //     try {
  //       let txnValidation = true;
  //       this.CalculateLedger();
  //       if (this.transaction.TransactionItems.length == 0) {
  //         this.msgBoxServ.showMessage("notice-message", ["Please enter some data..."]);
  //         this.HideSavebtn = false;
  //         return;
  //       }
  //       else {
  //         this.CheckBackDateEntryValidation();
  //         for (var a in this.transaction.TransactionValidator.controls) {
  //           this.transaction.TransactionValidator.controls[a].markAsDirty();
  //           this.transaction.TransactionValidator.controls[a].updateValueAndValidity();
  //         }
  //         if (this.transaction.IsValidCheck(undefined, undefined)) {
  //           for (var txnItem of this.transaction.TransactionItems) {
  //             for (var b in txnItem.TransactionItemValidator.controls) {
  //               txnItem.TransactionItemValidator.controls[b].markAsDirty();
  //               txnItem.TransactionItemValidator.controls[b].updateValueAndValidity();
  //             }
  //             if (!txnItem.IsValidCheck(undefined, undefined)) {
  //               if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //                 if ((txnItem.Amount === this.extraTransactionItemForPaymentOrReceiptVoucher.Amount && txnItem.LedgerId === this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId && (this.subLedgerAndCostCenterSetting.EnableSubLedger && txnItem.SubLedgers && txnItem.SubLedgers.length > 0))) {
  //                   txnValidation = true;
  //                 }
  //                 else {
  //                   txnValidation = false;
  //                 }
  //                 this.HideSavebtn = true;
  //               }
  //               else {
  //                 txnValidation = false;
  //                 this.HideSavebtn = false;
  //                 return;
  //               }
  //             }
  //           };
  //         }

  //         else
  //           txnValidation = false;
  //         this.HideSavebtn = false;
  //         if (txnValidation && this.CheckCalculations()) {
  //           this.transaction.TotalAmount = this.totalDebit;
  //           this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;

  //           if (this.checkDateValidation()) {
  //             if (this.IsBackDateEntry == false) {
  //               this.transaction.IsBackDateEntry = false;
  //               this.transaction.TransactionDate = moment().format("YYYY-MM-DD HH:mm");
  //             }
  //             else {
  //               this.transaction.IsBackDateEntry = true;
  //               // this.transaction.TransactionDate =
  //               this.transaction.TransactionDate = this.TransactionDate.concat(" 00:01:00");
  //             }
  //             if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //               this.transaction.TransactionItems.forEach(itm => {
  //                 let defaultSubLedger = this.subLedgerMaster.find(a => a.LedgerId === itm.LedgerId && a.IsDefault === true);
  //                 if (defaultSubLedger && itm.SubLedgers.length === 0) {
  //                   let subLedgerTxn = new SubLedgerTransactionModel();
  //                   subLedgerTxn.LedgerId = itm.LedgerId;
  //                   subLedgerTxn.SubLedgerId = defaultSubLedger.SubLedgerId;
  //                   subLedgerTxn.DrAmount = itm.DrCr ? itm.Amount : 0;
  //                   subLedgerTxn.CrAmount = itm.DrCr ? 0 : itm.Amount;
  //                   itm.SubLedgers.push(subLedgerTxn);
  //                 }
  //               });
  //             }
  //             let txnItems = _.cloneDeep(this.transaction.TransactionItems);
  //             let groupedData = txnItems.reduce((acc, currVal) => {
  //               if (acc.hasOwnProperty(currVal.CostCenterId.toString())) {
  //                 acc[currVal.CostCenterId.toString()].Amount += (currVal.DrCr ? currVal.Amount : -currVal.Amount);
  //               } else {
  //                 currVal.Amount = currVal.DrCr ? currVal.Amount : -currVal.Amount;
  //                 acc[currVal.CostCenterId.toString()] = currVal;
  //               }
  //               return acc;
  //             }, []);

  //             if (groupedData) {
  //               let groupedValues = Object.values(groupedData);
  //               if (groupedValues.some(a => a["Amount"] !== 0)) {
  //                 let msg = "| ";
  //                 groupedValues.forEach(a => {
  //                   if (a["Amount"] !== 0) {
  //                     let costCenter = this.costCenterList.find(c => c.CostCenterId == a["CostCenterId"]);
  //                     msg += `${costCenter.CostCenterName} : ${Math.abs(a["Amount"])} ${a["Amount"] >= 0 ? '(DR)' : '(CR)'}  | `;
  //                   }
  //                 });
  //                 this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Cost-CenterWise Debit and Credit Amount Is Not Matched, Mismatched Entries:- ${msg}`]);
  //                 if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //                   this.transaction.TransactionItems.pop();
  //                 }
  //                 return;
  //               }
  //             }
  //             if (!this.transaction.TransactionId) {
  //               this.accountingBLService.PostToTransaction(this.transaction).
  //                 subscribe(res => {
  //                   if (res.Status == 'OK') {
  //                     this.HideSavebtn = false;
  //                     this.Reset();
  //                     this.msgBoxServ.showMessage("success", ["Voucher is Saved."]);
  //                     this.ViewTransactionDetails(res.Results);
  //                     this.AssignVoucher();
  //                     //this.SetDefaultCostCenter();
  //                     //this.transaction.TransactionValidator.get("CostCenter").setValue(this.selectedCostCenter.CostCenterId);
  //                     //this.transaction.CostCenterId = this.selectedCostCenter.CostCenterId;
  //                   }
  //                   else {
  //                     this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
  //                     this.logError(res.ErrorMessage);
  //                     this.HideSavebtn = false;
  //                   }
  //                 });
  //             }
  //             else {
  //               this.accountingBLService.PutToTransaction(this.transaction).
  //                 subscribe(res => {
  //                   if (res.Status == 'OK') {
  //                     this.HideSavebtn = false;
  //                     this.Reset();
  //                     this.msgBoxServ.showMessage("success", ["Voucher Created."]);
  //                     this.ViewTransactionDetails(res.Results);
  //                     this.AssignVoucher();
  //                     //this.SetDefaultCostCenter();
  //                     //this.transaction.TransactionValidator.get("CostCenter").setValue(this.selectedCostCenter.CostCenterId);
  //                   }
  //                   else {
  //                     this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
  //                     this.logError(res.ErrorMessage);
  //                     this.HideSavebtn = false;
  //                   }
  //                 });

  //             }
  //           }
  //           else {
  //             this.msgBoxServ.showMessage("failed", ["Select Proper TransactionDate"]);
  //             this.HideSavebtn = false;
  //           }
  //         }

  //       }
  //     } catch (ex) {
  //       this.ShowCatchErrMessage(ex);
  //     }
  //   }
  //   else {
  //     this.HideSavebtn = false;
  //   }
  // }

  // ViewTransactionDetails(resultdata) {
  //   try {
  //     localStorage.setItem("SectionId", this.sectionId.toString());
  //     //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //     this.voucherNumber = resultdata.VoucherNumber;
  //     this.fiscalYId = resultdata.FiscalyearId;    //pass fsYid with voucher number 
  //     this.showVoucherPopup = true;


  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // public AssignSelectedLedger(index) {
  //   try {
  //     let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
  //     if (true) {
  //       if (typeof (this.selLedgerArr[index]) == 'object') {
  //         if (this.IsAllowDuplicateVoucherEntry || this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //           this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
  //           this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
  //           this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
  //           this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
  //           this.selectedLedgerCode[index] = this.allLedgerList.find(a => a.LedgerId === this.selLedgerArr[index].LedgerId).Code;
  //           if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //             this.ChangeFocus(`SubLedger_${index + 1}`);
  //           }
  //           else {
  //             this.ChangeFocus(`Amount_${index + 1}`);
  //           }
  //         }
  //         else {
  //           let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
  //           let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
  //           if (extItem && extItemIndex != index) {
  //             this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selLedgerArr[index].LedgerName + " already entered."]);
  //             //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //             this.selLedgerArr[index] = null;
  //             this.transaction.TransactionItems[index].ChartOfAccountName = "";
  //             this.transaction.TransactionItems[index].Code = "";
  //             this.transaction.TransactionItems[index].LedgerId = 0;
  //             this.transaction.TransactionItems[index].LedgerName = "";
  //             this.ChangeFocus("Ledger_" + (index + 1));
  //           }
  //           else {
  //             this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
  //             this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
  //             this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
  //             this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
  //             this.selectedLedgerCode[index] = this.allLedgerList.find(a => a.LedgerId === this.selLedgerArr[index].LedgerId).Code;
  //             if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //               this.ChangeFocus(`SubLedger_${index + 1}`);
  //             }
  //             else {
  //               this.ChangeFocus(`Amount_${index + 1}`);
  //             }
  //           }
  //         }
  //         if (this.transaction.TransactionItems[index].SubLedgers.length > 0 && this.transaction.TransactionItems[index].SubLedgers[0].LedgerId !== this.selLedgerArr[index].LedgerId) {
  //           this.transaction.TransactionItems[index].SubLedgers = [];
  //           this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
  //           this.selSubLedgerCode[index] = "";
  //         }
  //       }
  //       else if (typeof this.selLedgerArr[index] === "string") {
  //         let ledger = this.allLedgerList.find(a => a.LedgerName === this.selLedgerArr[index]);
  //         if (!ledger || (ledger && ledger.LedgerId != oldLedgerId)) {
  //           this.transaction.TransactionItems[index].LedgerId = 0;
  //           this.transaction.TransactionItems[index].LedgerName = "";
  //           this.transaction.TransactionItems[index].ChartOfAccountName = "";
  //           this.transaction.TransactionItems[index].Code = "";
  //           this.selSubLedgerCode[index] = "";
  //           this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
  //         }
  //       }
  //     }
  //     // if (this.subLedgerAndCostCenterSetting.EnableSubLedger && oldLedgerId != this.transaction.TransactionItems[index].LedgerId) {
  //     //   this.ProcessSubLedger(index);
  //     // }
  //     // }

  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // public CheckSelLedger(): boolean {
  //   try {
  //     if (this.selLedgerArr.length) {
  //       for (let item of this.selLedgerArr) {
  //         if (!item || typeof (item) != 'object') {
  //           item = undefined;
  //           this.msgBoxServ.showMessage("failed", ["Invalid itemList Name. Please select itemList from the list."]);
  //           this.HideSavebtn = false;
  //           return false;
  //         }
  //       }
  //       return true;
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }

  // }
  // public CheckCalculations(): boolean {
  //   try {
  //     let valid = true;
  //     //parse to same format before comparison..
  //     // this.totalDebit = CommonFunctions.parseAmount(this.totalDebit);
  //     // this.totalCredit = CommonFunctions.parseAmount(this.totalCredit);

  //     if (this.totalDebit && this.totalCredit) {
  //       if (this.totalDebit != this.totalCredit) {
  //         this.msgBoxServ.showMessage("failed", ["Total Debit and Credit is not balanced."]);
  //         valid = false;
  //         this.HideSavebtn = false;
  //       }
  //     }
  //     else {
  //       this.msgBoxServ.showMessage("failed", ["Entered amounts for voucher are not balanced."]);
  //       valid = false;
  //       this.HideSavebtn = false;
  //     }
  //     return valid;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }


  // public Reset() {
  //   try {
  //     //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //     this.transaction = new TransactionModel();
  //     this.selectedCostCenter = new CostCenterModel();
  //     this.selLedgerArr = [];
  //     this.totalDebit = 0;
  //     this.totalCredit = 0;
  //     this.ChangeFocus("voucher");
  //     this.routeFromService.RouteFrom = "";
  //     this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
  //     this.SetDefaultCostCenterForExtraItem();
  //     this.selectedExtraLedgerForPaymentOrReceipt = null;
  //     this.selectedLedgerCode = [];
  //     this.voucherVerificationRequired = false;
  //     this.additionalPartyDetailForPaymentOrReceiptVoucher = {
  //       selectedLedgerCode: null,
  //       selectedLedger: null,
  //       selectedSubLedgerCode: null,
  //       selectedSubLedger: null
  //     };
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // CalculateLedger() {
  //   try {
  //     this.totalDebit = this.totalAmount = 0;
  //     this.totalCredit = 0;
  //     this.transaction.TransactionItems.forEach(a => {
  //       // a.Amount = CommonFunctions.parseAmount(a.Amount);
  //       if (a.DrCr === true || a.DrCr.toString() == "true") {
  //         this.totalDebit += a.Amount;
  //       }
  //       else {
  //         this.totalCredit += a.Amount;
  //       }
  //       if (this.totalCredit == this.totalDebit) {
  //         this.totalAmount = this.totalDebit;
  //       }
  //     });
  //     this.totalDebit = CommonFunctions.parseDecimal(this.totalDebit);
  //     this.totalCredit = CommonFunctions.parseDecimal(this.totalCredit);
  //     this.totalAmount = (this.totalDebit > 0) ? this.totalDebit : this.totalCredit;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // //create new Ledger 
  // CreateNewLedgerOnClick(i) {
  //   this.curIndex = i;
  //   let check = confirm("Do you want to create new Ledger?");
  //   if (check) {
  //     this.showAddNewLedgerPage = false;
  //     //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //     this.showAddNewLedgerPage = true;
  //   }
  // }

  // DeleteTxnLedgerRow(index: number) {
  //   try {
  //     if (this.transaction.TransactionItems.length > 1) {
  //       this.transaction.TransactionItems.splice(index, 1);
  //       this.selLedgerArr.splice(index, 1);
  //       this.selectedLedgerCode.splice(index, 1);
  //       this.selDrCrArray.splice(index, 1);
  //       this.selSubLedgerCode[index] = "";
  //       this.selLedgerArr[index] = "";
  //       this.selectedSubLedger[index] = "";
  //     }
  //     else if (this.transaction.TransactionItems.length === 1) {
  //       this.selSubLedgerCode[index] = "";
  //       this.selLedgerArr[index] = "";
  //       this.selectedSubLedger[index] = "";
  //     }
  //     this.CalculateLedger();
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // LedgerListFormatter(data: any): string {
  //   return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"] + " | Closing Bal- " + data["ClosingBalwithDrCr"];
  // }
  // DrCrListFormatter(data: any): string {
  //   return data["DrCr"];
  // }
  // VoucherHeadListFormatter(data: any): string {
  //   return data["VoucherHeadName"];
  // }

  // logError(err: any) {
  //   console.log(err);
  // }
  // showMessageBox(status: string, message: string) {
  //   this.msgBoxServ.showMessage(status, [message]);
  // }
  // //This function only for show catch messages
  // public ShowCatchErrMessage(exception) {
  //   if (exception) {
  //     let ex: Error = exception;
  //     this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
  //     console.log("Error Messsage =>  " + ex.message);
  //     console.log("Stack Details =>   " + ex.stack);
  //   }
  // }
  // CheckBackDateEntryValidation() {
  //   if (this.transaction.IsBackDateEntry == true) {
  //     this.transaction.UpdateValidator("on", "TransactionDate", "required");
  //   }
  //   else {
  //     //set validator off
  //     this.transaction.UpdateValidator("off", "TransactionDate", "required");
  //   }
  // }
  // ChangeFocus(nextId) {
  //   if (nextId != null) {
  //     try {
  //       this.coreService.FocusInputById(nextId);
  //     } catch (ex) {
  //       console.log(ex);
  //     }
  //   }
  // }

  // onDrCrChange(i) {
  //   if (this.selDrCrArray[i] == "Dr") {
  //     this.transaction.TransactionItems[i].DrCr = true;
  //   }
  //   else if (this.selDrCrArray[i] == "Cr") {
  //     this.transaction.TransactionItems[i].DrCr = false;
  //   }

  //   if (this.transaction.TransactionItems.filter(a => a.DrCr == true).length == this.transaction.TransactionItems.length
  //     && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy
  //     && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherVerify) {
  //     this.transaction.TransactionItems[i].Amount = 0;
  //   }
  //   else if (this.transaction.TransactionItems.filter(a => a.DrCr == false).length == this.transaction.TransactionItems.length
  //     && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy
  //     && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherVerify) {
  //     this.transaction.TransactionItems[i].Amount = 0;
  //   }
  //   //this.ProcessSubLedger(i);
  //   this.CalculateLedger();
  // }

  // onVoucherTypeChange() {
  //   this.UpdateVoucherChequeNoandPayeeName();
  //   //if no txn item then assign voucher, else confirm and change voucher type
  //   if (this.transaction.TransactionItems.length == 0) {
  //     this.AssignVoucher();
  //   } else {
  //     var check: boolean = true;
  //     let oldVoucherTypeId = this.transaction.VoucherId;
  //     check = confirm("Are you sure you want to change the Voucher Type?");
  //     if (check) {
  //       this.transaction.VoucherId = this.selVoucherTypeId;
  //       this.selectedVoucherCode = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId).VoucherCode;
  //       //this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
  //       this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
  //     }
  //     else { //set to old one if user chooses 'NO' from confirmbox.
  //       this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //       this.selVoucherTypeId = oldVoucherTypeId;//detect change should be above this else it won't work.. :(
  //     }
  //   }
  //   if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
  //     this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
  //     this.SetDefaultCostCenterForExtraItem();
  //     this.transaction.TransactionItems.forEach(a => {
  //       a.TransactionItemValidator.controls["DrCr"].disable();
  //     });
  //     this.selDrCrArray.fill(ENUM_ACC_DrCr.Dr);
  //     setTimeout(() => {
  //       this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
  //     }, 100);
  //   }
  //   else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //     this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
  //     this.SetDefaultCostCenterForExtraItem();
  //     this.transaction.TransactionItems.forEach(a => {
  //       a.TransactionItemValidator.controls["DrCr"].disable();
  //     });
  //     this.selDrCrArray.fill(ENUM_ACC_DrCr.Cr);
  //     setTimeout(() => {
  //       this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
  //     }, 100);
  //   }
  //   else {
  //     this.transaction.TransactionItems.forEach(a => {
  //       a.TransactionItemValidator.controls["DrCr"].enable();
  //     });
  //     setTimeout(() => {
  //       if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //         this.ChangeFocus('SubLedger_Code_1');
  //       }
  //       else {
  //         this.ChangeFocus('Code_1');
  //       }
  //     }, 100);
  //   }
  //   this.transaction.TransactionItems.forEach((a, index) => this.onDrCrChange(index));
  //   this.additionalPartyDetailForPaymentOrReceiptVoucher = {
  //     selectedLedgerCode: null,
  //     selectedLedger: null,
  //     selectedSubLedgerCode: null,
  //     selectedSubLedger: null
  //   }
  // }

  // //this is called from Description-> Enter Key
  // //this check the amount and adds new ledger if required.. else change the focus to Narration.
  // CheckAndAddNewTxnLedger($event, index) {
  //   if (this.voucherVerificationRequired) {
  //     return;
  //   }
  //   let i = index + 1;
  //   if ($event) {
  //     this.CalculateLedger();
  //     if (this.totalCredit == this.totalDebit) {
  //       this.ChangeFocus("narration");
  //     } else {
  //       this.AddNewTxnLedger();
  //       this.ChangeFocus("DrCr_" + (i + 1));
  //       //  this.transaction.TransactionItems[i].Amount = parseInt($event.target.value);
  //       if (this.transaction.TransactionItems[i].DrCr == false) {
  //         this.selDrCrArray[i] = "Cr";
  //       }
  //       else {
  //         this.transaction.TransactionItems[i].DrCr = true;
  //         this.selDrCrArray[i] = "Dr";
  //       }
  //       let b = this.transaction.TransactionItems[index].Amount;
  //       if (this.selDrCrArray[i] != this.DrCrList[0]) {
  //         this.DrCrList = this.DrCrList.reverse();
  //       }
  //     }

  //     let ind = this.transaction.TransactionItems.length;
  //     if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
  //       this.transaction.TransactionItems[ind - 1].TransactionItemValidator.controls["DrCr"].disable();
  //       this.selDrCrArray[ind - 1] = "Dr";
  //       if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //         this.ChangeFocus('SubLedger_Code_' + (i + 1));
  //       }
  //       else {
  //         this.ChangeFocus('Code_' + (i + 1));
  //       }
  //     }
  //     else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //       this.transaction.TransactionItems[ind - 1].TransactionItemValidator.controls["DrCr"].disable();
  //       this.selDrCrArray[ind - 1] = "Cr";
  //       if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //         this.ChangeFocus('SubLedger_Code_' + (i + 1));
  //       }
  //       else {
  //         this.ChangeFocus('Code_' + (i + 1));
  //       }
  //     }

  //   }
  // }

  // //this comes from add-new ledger popup
  // //modified: sud/nagesh: 21Jun'20--refactoring.
  // async CallBackAddNewLedger($event) {
  //   if ($event && $event.action == "add") {
  //     var temp = $event.data;
  //     //push newly created ledger to the list and slice it to refresh the Array object
  //     // this.allLedgerList.push(temp);
  //     // this.allLedgerList = this.allLedgerList.slice();

  //     await this.UpdateLedgers();
  //     ///to automatically assign newly created ledger, we've to assingn the name then call AssignSelectedLedgerFunction.
  //     //so that it can check by the name and assign object property from the list.
  //     this.selLedgerArr[this.curIndex] = temp.LedgerName;
  //     this.GetLedgerList();
  //     //this.AssignSelectedLedger(this.curIndex);
  //   }

  //   //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //   this.showAddNewLedgerPage = false;

  // }


  // SetDefaultCostCenterForExtraItem() {
  //   let defaultCostCenter = this.costCenterList.find(a => a.IsDefault === true);
  //   if (defaultCostCenter) {
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = defaultCostCenter.CostCenterId;
  //   }
  //   //this.changeDetectorRef.detectChanges(); //mumbai-team-june2021-danphe-accounting-cache-change
  //   // if (this.costCenterList && this.costCenterList.length > 0) {
  //   // this.selectedCostCenter = new CostCenterModel();
  //   // const costCenterNotApplicableId = -1;
  //   // this.selectedCostCenter.CostCenterId = costCenterNotApplicableId;
  //   // this.selectedCostCenter.CostCenterName = "--Not Applicable--";
  //   // this.transaction.TransactionValidator.get("CostCenter").setValue(this.selectedCostCenter.CostCenterId);
  //   //   var defaultCostCenter = this.costCenterList.filter(c => c.IsDefualt === true);
  //   //   if (defaultCostCenter.length > 0) {
  //   //     this.selectedCostCenter.CostCenterId = defaultCostCenter[0].CostCenterId;
  //   //     this.selectedCostCenter.CostCenterName = defaultCostCenter[0].CostCenterName;
  //   //   } else {
  //   //     this.selectedCostCenter.CostCenterId = this.costCenterList[0].CostCenterId;
  //   //     this.selectedCostCenter.CostCenterName = this.costCenterList[0].CostCenterName;
  //   //   }
  //   // }
  // }

  // //this method for get provisional Voucher number for curernt new created voucher
  // GettempVoucherNumber(voucherId: number, sectionId, transactionDate) {
  //   if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
  //     return;
  //   }
  //   this.accountingBLService.GettempVoucherNumber(voucherId, sectionId, transactionDate)
  //     .subscribe(res => {
  //       if (res.Status == "OK") {
  //         this.TempVoucherNumber = res.Results;
  //       }
  //       else {
  //         this.msgBoxServ.showMessage("failed", ['failed to Get Provisional Voucher Number.']);
  //         this.logError(res.ErrorMessage);
  //       }
  //     });
  // }

  // //for IsCopyDescription=true voucher types, copy the Description of First Ledger to the new ledger row
  // DescriptionValChanged(currLedIndex: number) {

  //   if (this.selVoucherTypeId && this.transaction.TransactionItems.length > 0) {
  //     let currVoucherType = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId);
  //     if (currVoucherType && currVoucherType.ISCopyDescription == true) {
  //       let firstDescription = this.transaction.TransactionItems[0].Description;
  //       //currLedIndex is the recently added row.
  //       this.transaction.TransactionItems[currLedIndex].Description = firstDescription;
  //     }
  //   }
  // }


  // Cancel() {
  //   this.Reset();
  //   this.AssignVoucher();
  //   //this.SetDefaultCostCenter();
  // }

  // ChkBackDateEntryOnChange() {
  //   if (!this.IsBackDateEntry) {
  //     this.TransactionDate = this.todaysDate;
  //     this.transaction.TransactionDate = this.todaysDate;
  //     this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId, this.TransactionDate);
  //   }
  //   //console.log(this.IsBackDateEntry);
  // }

  // public async UpdateLedgers() {
  //   try {
  //     DanpheCache.clearDanpheCacheByType(MasterType.LedgersAll);
  //     await this.accountingService.RefreshAccCacheData();
  //   }
  //   catch (ex) {
  //     console.log(ex);
  //   }
  // }

  // public CallBackCopyVoucher() {
  //   // this.routeFromService.RouteFrom = "";
  //   if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
  //     this.voucherVerificationRequired = true;
  //   }
  //   let data = this.accountingService.copyVoucherData;
  //   this.transaction = new TransactionModel();
  //   //this.transaction.TransactionValidator.get("CostCenter").setValue(this.selectedCostCenter.CostCenterId);
  //   this.transaction.VoucherId = this.selVoucherTypeId = this.voucherTypeList.find(a => a.VoucherName == data.VoucherType).VoucherId;
  //   let txnItems = data.TransactionItems;
  //   this.selectedVoucherCode = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId).VoucherCode;
  //   if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher) {
  //     let tempTxn = txnItems.find(a => a.DrCr == false);
  //     let ledger = tempTxn && this.allLedgerList.find(a => a.LedgerId === tempTxn.LedgerId);
  //     if (ledger) {
  //       let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.LedgerGroupId === ledger.LedgerGroupId);
  //       if (ledgerGroup) {
  //         let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Name === ledgerGroup.Name && a.Description === 'LedgerGroupName');
  //         if (codeDetail) {
  //           this.paymentMode = codeDetail.Code === '021' ? ENUM_ACC_PaymentMode.Cash : ENUM_ACC_PaymentMode.Bank;
  //           this.filterPaymentOrReceiptLedger();
  //         }
  //       }
  //     }
  //     //[this.extraTransactionItemForPaymentOrReceiptVoucher] = tempTxn;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = tempTxn.Amount;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = tempTxn.DrCr;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.Description = tempTxn.description;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = tempTxn.CostCenterId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId = tempTxn.TransactionItemId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionId = tempTxn.TransactionId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = tempTxn.SubLedgers;

  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = tempTxn.LedgerName;
  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode = tempTxn.Code;
  //     if (tempTxn.SubLedgers && tempTxn.SubLedgers.length > 0) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = tempTxn.SubLedgers[0].SubLedgerName;
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = tempTxn.SubLedgers[0].SubLedgerCode;
  //     }
  //     txnItems = txnItems.filter(a => a.DrCr == true);
  //   }
  //   else if (this.selectedVoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher) {
  //     let tempTxn = txnItems.find(a => a.DrCr == true);
  //     let ledger = tempTxn && this.allLedgerList.find(a => a.LedgerId === tempTxn.LedgerId);
  //     if (ledger) {
  //       let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.LedgerGroupId === ledger.LedgerGroupId);
  //       if (ledgerGroup) {
  //         let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Name === ledgerGroup.Name && a.Description === 'LedgerGroupName');
  //         if (codeDetail) {
  //           this.paymentMode = codeDetail.Code === '021' ? ENUM_ACC_PaymentMode.Cash : ENUM_ACC_PaymentMode.Bank;
  //           this.filterPaymentOrReceiptLedger();
  //         }
  //       }
  //     }
  //     //[this.extraTransactionItemForPaymentOrReceiptVoucher] = tempTxn;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.Amount = tempTxn.Amount;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.DrCr = tempTxn.DrCr;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.Description = tempTxn.description;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId = tempTxn.CostCenterId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId = tempTxn.TransactionItemId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionId = tempTxn.TransactionId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = tempTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = tempTxn.SubLedgers;

  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = tempTxn.LedgerName;
  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode = tempTxn.Code;
  //     if (tempTxn.SubLedgers && tempTxn.SubLedgers.length > 0) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = tempTxn.SubLedgers[0].SubLedgerName;
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = tempTxn.SubLedgers[0].SubLedgerCode;
  //     }
  //     txnItems = txnItems.filter(a => a.DrCr == false);
  //   }
  //   this.TempVoucherNumber = data.VoucherNumber;

  //   this.GettempVoucherNumber(this.transaction.VoucherId, data.SectionId, this.todaysDate);
  //   this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
  //   this.transaction.Remarks = data.Remarks;
  //   //this.paymentMode = data.VoucherId == 6 ? ENUM_ACC_PaymentMode.Cash : ENUM_ACC_PaymentMode.Bank;
  //   this.transaction.ChequeDate = data.ChequeDate;
  //   this.transaction.ChequeNumber = data.ChequeNumber;

  //   txnItems.forEach((element, index) => {
  //     this.AddNewTxnLedger();
  //     this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId == element.LedgerId);
  //     this.selDrCrArray[index] = this.DrCrList.find(a => a.DrCr == (element.DrCr ? 'Dr' : 'Cr'));
  //     this.selectedLedgerCode[index] = element.Code;
  //     this.transaction.TransactionItems[index].Amount = element.Amount;
  //     this.transaction.TransactionItems[index].DrCr = element.DrCr;
  //     this.transaction.TransactionItems[index].Code = element.Code;
  //     this.transaction.TransactionItems[index].LedgerId = element.LedgerId;
  //     this.transaction.TransactionItems[index].LedgerName = element.LedgerName;
  //     if (element.SubLedgers && element.SubLedgers.length > 0) {
  //       this.transaction.TransactionItems[index].SubLedgers = element.SubLedgers;
  //       this.selectedSubLedger[index] = this.subLedgerMaster.find(a => a.SubLedgerId === element.SubLedgers[0].SubLedgerId);
  //       this.selSubLedgerCode[index] = this.selectedSubLedger[index].SubLedgerCode;
  //     }
  //     this.transaction.TransactionItems[index].Description = element.Description;
  //     this.transaction.TransactionItems[index].CostCenterId = element.CostCenterId;
  //     this.transaction.TransactionItems[index].TransactionItemId = element.TransactionItemId;
  //     if (this.routeFromService.RouteFrom === ENUM_ACC_RouteFrom.VoucherVerify) {
  //       this.transaction.TransactionItems[index].TransactionItemValidator.controls["DrCr"].disable();
  //       this.transaction.TransactionItems[index].TransactionItemValidator.controls["Amount"].disable();
  //       this.transaction.TransactionItems[index].TransactionItemValidator.controls["LedgerId"].disable();
  //       this.transaction.TransactionItems[index].TransactionItemValidator.controls["SubLedgerId"].disable();
  //     }
  //     this.CalculateLedger();
  //     // if (this.transaction.TransactionItems[index] && this.transaction.TransactionItems[index].LedgerId > 0
  //     //   && this.transaction.TransactionItems[index].Amount > 0
  //     //   && this.transaction.TransactionItems[index].DrCr != null && this.transaction.TransactionItems[index].SubLedgers.length < 0) {
  //     //   this.transaction.TransactionItems[index].showSubledgerCreateButton = true;
  //     // }
  //     // else {
  //     //   this.transaction.TransactionItems[index].showSubledgerCreateButton = false;
  //     // }
  //     // this.subLedgerDetail[index] = "";
  //     // if (this.transaction.TransactionItems[index].SubLedgers && this.transaction.TransactionItems[index].SubLedgers.length > 0) {
  //     //   this.transaction.TransactionItems[index].SubLedgers.forEach(a => {
  //     //     this.subLedgerDetail[index] += `${this.subLedgerMaster.find(sub => sub.SubLedgerId === a.SubLedgerId).SubLedgerName} - ${this.transaction.TransactionItems[index].DrCr ? a.DrAmount : a.CrAmount}, `;
  //     //   });
  //     //   this.subLedgerDetail[index] = `(${this.subLedgerDetail[index].substring(0, this.subLedgerDetail[index].length - 2)})`;
  //     // }
  //   });

  //   // let costCenter = this.costCenterList.find(a => a.CostCenterId == data.CostCenterId);
  //   // const costCenterNotApplicableId = -1;
  //   // this.selectedCostCenter.CostCenterId = costCenter ? costCenter.CostCenterId : costCenterNotApplicableId;
  //   // this.selectedCostCenter.CostCenterName = costCenter ? costCenter.CostCenterName : `--Not Applicable--`;
  //   // this.transaction.CostCenterId = this.selectedCostCenter.CostCenterId;
  // }

  // public fiscalYearIdForCopyVoucher: number = 0;
  // public GetFiscalYearIdForCopyVoucher($event) {
  //   if ($event)
  //     this.fiscalYearIdForCopyVoucher = $event.fiscalYearId;
  // }
  // public getCopyVoucher() {
  //   this.voucherNumber = null;
  //   this.fiscalYId = null;
  //   this.changeDetectorRef.detectChanges();
  //   this.voucherNumber = this.CopyVoucherNumber;
  //   this.fiscalYId = this.fiscalYearIdForCopyVoucher;
  // }
  // public AssignExtraLedger(): void {
  //   if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger === ENUM_Data_Type.Object) {
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger.LedgerId;
  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = null;
  //     this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = null;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
  //     this.ChangeFocus("id_extraTransactionItemForPaymentOrReceiptVoucher_costCenterId_voucherEntry");
  //   }
  // }

  // public AssignExtraSubLedger(isCode: boolean) {
  //   if (isCode && typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode === ENUM_Data_Type.Object) {
  //     let subLedTxn = new SubLedgerTransactionModel();
  //     subLedTxn.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.LedgerId;
  //     subLedTxn.SubLedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.SubLedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = subLedTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.push(subLedTxn)
  //     let subLedger = this.subLedgerMaster.find(a => a.SubLedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.SubLedgerId);
  //     let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode.LedgerId);
  //     if (subLedger) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger = subLedger;
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = subLedger.SubLedgerCode;
  //     }
  //     if (Ledger) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
  //     }
  //   }
  //   else if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger === ENUM_Data_Type.Object) {
  //     let subLedTxn = new SubLedgerTransactionModel();
  //     subLedTxn.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.LedgerId;
  //     subLedTxn.SubLedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.SubLedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = subLedTxn.LedgerId;
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers = [];
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.SubLedgers.push(subLedTxn)
  //     let subLedger = this.subLedgerMaster.find(a => a.SubLedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.SubLedgerId);
  //     let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedger.LedgerId);
  //     if (subLedger) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedSubLedgerCode = subLedger.SubLedgerCode;
  //     }
  //     if (Ledger) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
  //     }
  //   }
  // }

  // public AssignExtraLedgerCode() {
  //   if (typeof this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode === ENUM_Data_Type.Object) {
  //     this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId = this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode.LedgerId;
  //     let Ledger = this.allLedgerList.find(a => a.LedgerId === this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedgerCode.LedgerId);
  //     if (Ledger) {
  //       this.additionalPartyDetailForPaymentOrReceiptVoucher.selectedLedger = Ledger.LedgerName;
  //     }
  //     this.ChangeFocus("extra_Ledger_for_PMTV_and_Receipt");
  //   }
  // }


  // public filterPaymentOrReceiptLedger(): void {
  //   this.extraTransactionItemForPaymentOrReceiptVoucher = new TransactionItem();
  //   this.additionalPartyDetailForPaymentOrReceiptVoucher = {
  //     selectedLedgerCode: null,
  //     selectedLedger: null,
  //     selectedSubLedgerCode: null,
  //     selectedSubLedger: null
  //   };
  //   this.SetDefaultCostCenterForExtraItem();
  //   let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === (this.paymentMode === ENUM_ACC_PaymentMode.Cash ? '021' : '022') && a.Description === 'LedgerGroupName');
  //   if (codeDetail) {
  //     let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
  //     if (ledgerGroup) {
  //       this.paymentORreciptLedgerList = this.allLedgerList.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
  //       this.paymentORreciptSubLedgerList = this.subLedgerMaster.filter(a => this.paymentORreciptLedgerList.some(b => a.LedgerId === b.LedgerId));
  //     }
  //   }
  //   this.subLedgerAndCostCenterSetting.EnableSubLedger ? this.ChangeFocus(`extra_SubLedger_Code_for_PMTV_and_Receipt`) : this.ChangeFocus(`extra_Ledger_Code_for_PMTV_and_Receipt`);
  // }

  // LedgerCodeFormatter(data: LedgerModel): string {
  //   return data["Code"];
  // }

  // public AssignSelectedCode(index: number): void {
  //   try {
  //     if (this.selectedLedgerCode[index]) {
  //       let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
  //       if (typeof (this.selectedLedgerCode[index]) === ENUM_Data_Type.Object) {
  //         // let obj = this.allLedgerList.find(a=> Number(a.Code) == this.selectedLedgerCode[index])
  //         if (this.IsAllowDuplicateVoucherEntry || this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //           this.transaction.TransactionItems[index].LedgerId = this.selectedLedgerCode[index].LedgerId;
  //           this.transaction.TransactionItems[index].LedgerName = this.selectedLedgerCode[index].LedgerName;
  //           this.transaction.TransactionItems[index].ChartOfAccountName = this.selectedLedgerCode[index].ChartOfAccountName;
  //           this.transaction.TransactionItems[index].Code = this.selectedLedgerCode[index].Code;
  //           this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedLedgerCode[index].LedgerId);
  //           this.ChangeFocus("Ledger_" + (index + 1));
  //         }
  //         else {
  //           let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selectedLedgerCode[index].LedgerId);
  //           let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selectedLedgerCode[index].LedgerId);
  //           if (extItem && extItemIndex != index) {
  //             this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selectedLedgerCode[index].LedgerName + " already entered."]);
  //             this.selectedLedgerCode[index] = null;
  //             this.transaction.TransactionItems[index].ChartOfAccountName = "";
  //             this.transaction.TransactionItems[index].Code = "";
  //             this.ChangeFocus("Ledger_" + (index + 1));
  //           }
  //           else {
  //             this.transaction.TransactionItems[index].LedgerId = this.selectedLedgerCode[index].LedgerId;
  //             this.transaction.TransactionItems[index].LedgerName = this.selectedLedgerCode[index].LedgerName;
  //             this.transaction.TransactionItems[index].ChartOfAccountName = this.selectedLedgerCode[index].ChartOfAccountName;
  //             this.transaction.TransactionItems[index].Code = this.selectedLedgerCode[index].Code;
  //             this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedLedgerCode[index].LedgerId);
  //             this.ChangeFocus("Ledger_" + (index + 1));
  //           }
  //         }
  //       }
  //       // if (this.subLedgerAndCostCenterSetting.EnableSubLedger && oldLedgerId != this.transaction.TransactionItems[index].LedgerId) {
  //       //   this.ProcessSubLedger(index);
  //       // }
  //     }
  //   }
  //   catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // setChequeDate(event) {
  //   if (event) {
  //     this.transaction.ChequeDate = event.selectedDate;
  //   }
  //   else {
  //     this.transaction.ChequeDate = null;
  //   }
  // }

  // public CloseSubLedgerAddPopUp() {
  //   this.showSubLedgerAddPopUp = false;
  // }

  // public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
  //   return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
  // }

  // public AssignSubLedger(index: number) {
  //   let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
  //   let oldSubledgerId = this.transaction.TransactionItems[index] ? (this.transaction.TransactionItems[index].SubLedgers.length > 0 ? this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId : 0) : 0;
  //   if (typeof this.selectedSubLedger[index] === "object" && this.selectedSubLedger[index].SubLedgerId > 0) {
  //     let subLedgerExists = false;
  //     this.transaction.TransactionItems.forEach((item, position) => {
  //       let indx = item.SubLedgers.findIndex(sub => sub.SubLedgerId === this.selectedSubLedger[index].SubLedgerId);
  //       if (indx >= 0 && position != index) {
  //         subLedgerExists = true;
  //         return;
  //       }
  //     });
  //     if (subLedgerExists) {
  //       this.selectedSubLedger[index] = new SubLedger_DTO();
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["This subledger is already selected. Please select another subledger"]);
  //       this.ChangeFocus(`SubLedger_${index + 1}`);

  //     }
  //     else {
  //       this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selectedSubLedger[index].LedgerId);
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue(this.selLedgerArr[index].LedgerName);
  //       let subLedgerTransaction = new SubLedgerTransactionModel();
  //       this.selSubLedgerCode[index] = this.selectedSubLedger[index].SubLedgerCode;
  //       subLedgerTransaction.LedgerId = this.transaction.TransactionItems[index].LedgerId = this.selectedSubLedger[index].LedgerId;
  //       subLedgerTransaction.SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
  //       this.transaction.TransactionItems[index].SubLedgers = [];
  //       this.transaction.TransactionItems[index].SubLedgers.push(subLedgerTransaction);
  //       this.ChangeFocus(`Amount_${index + 1}`);

  //     }
  //   }
  //   else {
  //     this.selectedSubLedger[index] ? this.selectedSubLedger[index] = this.selectedSubLedger[index].trim() : true;
  //     let subledger = this.subLedgerMaster.find(a => a.LedgerId === oldLedgerId && a.SubLedgerName === this.selectedSubLedger[index]);
  //     if (!subledger || (subledger && oldSubledgerId != subledger.SubLedgerId) || (this.selectedSubLedger[index] === "")) {
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
  //       this.selSubLedgerCode[index] = "";
  //     }
  //   }
  // }

  // public setFocusById(name: string, index: number): void {
  //   let htmlObj = document.getElementById(`${name}${index}`)
  //   if (htmlObj) {
  //     htmlObj.focus();
  //   }
  // }

  // public CalculateRemaingingAmount() {
  //   let sum = this.subLedgers.reduce((a, b) => a + (this.transaction.TransactionItems[this.selectedItemIndex].DrCr ? b.DrAmount : b.CrAmount), 0);
  //   this.remainingAmount = this.transaction.TransactionItems[this.selectedItemIndex].Amount - sum;
  //   // if(this.remainingAmount < 0){
  //   //   this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error,["Subledger amount can not be greater than ledger amount."]);
  //   // }
  //   // else if(this.remainingAmount > 0){
  //   //   this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error,["Subledger Amount should be equl to Ledger Amount."]);
  //   // }

  // }

  // public DeleteSubLedgerItem(index: number) {
  //   if (this.subLedgers.length === 1 && index === 0) {
  //     this.selectedSubLedger = [];
  //     this.subLedgers[index].CrAmount = 0;
  //     this.subLedgers[index].DrAmount = 0;
  //     this.subLedgers[index].SubLedgerId = 0;
  //     this.subLedgers[index].Description = "";
  //   }
  //   else {
  //     this.subLedgers.splice(index, 1);
  //     this.selectedSubLedger.splice(index, 1);
  //   }
  //   this.CalculateRemaingingAmount();
  // }

  // public AddSubLedgerItem() {
  //   if (this.remainingAmount !== 0) {
  //     this.subLedgers.push(new SubLedgerTransactionModel());
  //     setTimeout(() => {
  //       this.setFocusById("subLedgerName", this.subLedgers.length - 1);
  //       if (this.transaction.TransactionItems[this.selectedItemIndex].DrCr) {
  //         this.subLedgers[this.subLedgers.length - 1].DrAmount = this.remainingAmount >= 0 ? this.remainingAmount : 0;
  //       }
  //       else {
  //         this.subLedgers[this.subLedgers.length - 1].CrAmount = this.remainingAmount >= 0 ? this.remainingAmount : 0;
  //       }
  //       this.CalculateRemaingingAmount();
  //     }, 500);
  //   } else {
  //     let htmlObj = document.getElementById(`btn-add-subLedger`);
  //     htmlObj && htmlObj.focus();
  //   }
  // }

  // public SaveSubLedgerItem() {
  //   this.subLedgers = this.subLedgers.filter(a => a.SubLedgerId > 0 && (a.DrAmount > 0 || a.CrAmount > 0));
  //   this.CalculateRemaingingAmount();
  //   if (this.remainingAmount === 0) {
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers = this.subLedgers;
  //     this.subLedgerDetail[this.selectedItemIndex] = "";
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers.forEach(a => {
  //       this.subLedgerDetail[this.selectedItemIndex] += `${this.subLedgerMaster.find(sub => sub.SubLedgerId === a.SubLedgerId).SubLedgerName} - ${this.transaction.TransactionItems[this.selectedItemIndex].DrCr ? a.DrAmount : a.CrAmount}, `;
  //     });
  //     this.subLedgerDetail[this.selectedItemIndex] = `(${this.subLedgerDetail[this.selectedItemIndex].substring(0, this.subLedgerDetail[this.selectedItemIndex].length - 2)})`;
  //     this.showSubLedgerAddPopUp = false;
  //   }
  //   else if (this.subLedgers.length === 0 && this.remainingAmount != 0) {
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers = [];
  //     this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["No SubLedger selected for this Ledger."]);
  //     this.showSubLedgerAddPopUp = false;
  //   }
  //   else {
  //     this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Subledger Amount should be equal to Ledger Amount. Please correct your entry."]);
  //   }
  // }

  // public AddSubLedger(index: number) {
  //   if (this.voucherVerificationRequired) {
  //     return;
  //   }
  //   this.LedgerwiseSubLedgerMaster = this.subLedgerMaster.filter(a => a.LedgerId === this.transaction.TransactionItems[index].LedgerId);
  //   this.selectedItemIndex = index;
  //   this.subLedgers = [];
  //   this.selectedSubLedger = [];
  //   if (this.transaction.TransactionItems[index].SubLedgers.length === 0) {
  //     this.subLedgers.push(new SubLedgerTransactionModel());
  //     if (this.transaction.TransactionItems[index].DrCr) {
  //       this.subLedgers[0].DrAmount = this.transaction.TransactionItems[index].Amount;
  //     } else {
  //       this.subLedgers[0].CrAmount = this.transaction.TransactionItems[index].Amount;
  //     }
  //     setTimeout(() => {
  //       this.setFocusById("subLedgerName", this.subLedgers.length - 1);
  //     }, 500);
  //   }
  //   else {
  //     let obj = _.cloneDeep(this.transaction.TransactionItems[index].SubLedgers);
  //     this.subLedgers.push(...obj);
  //     this.subLedgers.forEach((sub, index) => {
  //       this.selectedSubLedger[index] = this.subLedgerMaster.find(a => a.SubLedgerId === sub.SubLedgerId);
  //     })
  //   }
  //   this.showSubLedgerAddPopUp = true;
  // }

  // public GetSubLedger() {
  //   this.accountingSettingBlService.GetSubLedger().subscribe((res: DanpheHTTPResponse) => {
  //     if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //       this.subLedgerMaster = res.Results;
  //       this.subLedgerMaster = this.subLedgerMaster.filter(a => a.IsActive === true);
  //     }
  //   },
  //     (err: DanpheHTTPResponse) => {
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get subLedger list."]);
  //     });
  // }

  // public ProcessSubLedger(index: number) {
  //   if (this.transaction.TransactionItems[index] && this.transaction.TransactionItems[index].LedgerId > 0 && this.transaction.TransactionItems[index].Amount > 0 && this.transaction.TransactionItems[index].DrCr != null) {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = true;
  //   }
  //   else {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = false;
  //   }
  //   if (this.transaction.TransactionItems[index].showSubledgerCreateButton) {
  //     if (this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherReportCopy && this.routeFromService.RouteFrom !== ENUM_ACC_RouteFrom.VoucherVerify) {
  //       this.transaction.TransactionItems[index].SubLedgers = [];
  //     }
  //   }
  // }

  // public VerifyVoucher() {
  //   this.HideSavebtn = true;

  //   let txnItems = _.cloneDeep(this.transaction.TransactionItems);
  //   txnItems.push(this.extraTransactionItemForPaymentOrReceiptVoucher);
  //   let groupedData = txnItems.reduce((acc, currVal) => {
  //     if (acc.hasOwnProperty(currVal.CostCenterId.toString())) {
  //       acc[currVal.CostCenterId.toString()].Amount += (currVal.DrCr ? currVal.Amount : -currVal.Amount);
  //     } else {
  //       currVal.Amount = currVal.DrCr ? currVal.Amount : -currVal.Amount;
  //       acc[currVal.CostCenterId.toString()] = currVal;
  //     }
  //     return acc;
  //   }, []);

  //   if (groupedData) {
  //     let groupedValues = Object.values(groupedData);
  //     if (groupedValues.some(a => a["Amount"] !== 0)) {
  //       let msg = "| ";
  //       groupedValues.forEach(a => {
  //         if (a["Amount"] !== 0) {
  //           let costCenter = this.costCenterList.find(c => c.CostCenterId == a["CostCenterId"]);
  //           msg += `${costCenter.CostCenterName} : ${Math.abs(a["Amount"])} ${a["Amount"] >= 0 ? '(DR)' : '(CR)'}  | `;
  //         }
  //       });
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Cost-CenterWise Debit and Credit Amount Is Not Matched, Mismatched Entries:- ${msg}`]);
  //       this.HideSavebtn = false;
  //       return;
  //     }
  //   }

  //   let voucherData = new VoucherVerify_DTO();
  //   voucherData.VoucherNumber = this.TempVoucherNumber;
  //   voucherData.Remarks = this.transaction.Remarks;
  //   voucherData.FiscalYearId = this.transaction.FiscalYearId;
  //   let items = Array<VoucherLedgerInfo_DTO>();

  //   this.transaction.TransactionItems.forEach(ledger => {
  //     let item = new VoucherLedgerInfo_DTO();
  //     item.LedgerId = ledger.LedgerId;
  //     item.Description = ledger.Description;
  //     item.CostCenterId = ledger.CostCenterId;
  //     item.TransactionItemId = ledger.TransactionItemId
  //     items.push(item);
  //   });

  //   let item = new VoucherLedgerInfo_DTO();
  //   item.LedgerId = this.extraTransactionItemForPaymentOrReceiptVoucher.LedgerId;
  //   item.Description = this.extraTransactionItemForPaymentOrReceiptVoucher.Description;
  //   item.CostCenterId = this.extraTransactionItemForPaymentOrReceiptVoucher.CostCenterId;
  //   item.TransactionItemId = this.extraTransactionItemForPaymentOrReceiptVoucher.TransactionItemId
  //   items.push(item);

  //   voucherData.Items = items;
  //   this.accountingBLService.VerifyVoucher(voucherData)
  //     .finally(() => {
  //       this.HideSavebtn = false;
  //       this.Cancel();
  //     })
  //     .subscribe((res: DanpheHTTPResponse) => {
  //       if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
  //         this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, [`Voucher is successfully verified.`]);
  //       }
  //       else {
  //         this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Unable to verify the voucer.`]);
  //       }
  //     },
  //       (err: DanpheHTTPResponse) => {
  //         this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Exception: ${err.ErrorMessage}`]);
  //       }
  //     );
  // }

  // public AssignSelectedSubLedgerCode(index: number) {
  //   let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
  //   let oldSubledgerId = this.transaction.TransactionItems[index] ? (this.transaction.TransactionItems[index].SubLedgers.length > 0 ? this.transaction.TransactionItems[index].SubLedgers[0].SubLedgerId : 0) : 0;
  //   if (typeof this.selSubLedgerCode[index] === ENUM_Data_Type.Object && this.selSubLedgerCode[index].SubLedgerId > 0) {
  //     let subLedgerExists = false;
  //     this.transaction.TransactionItems.forEach((item, position) => {
  //       let indx = item.SubLedgers.findIndex(sub => sub.SubLedgerId === this.selSubLedgerCode[index].SubLedgerId);
  //       if (indx >= 0 && position != index) {
  //         subLedgerExists = true;
  //         return;
  //       }
  //     });
  //     if (subLedgerExists) {
  //       this.selSubLedgerCode[index] = new SubLedger_DTO();
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["This subledger is already selected. Please select another subledger"]);
  //     }
  //     else {
  //       this.selLedgerArr[index] = this.allLedgerList.find(a => a.LedgerId === this.selSubLedgerCode[index].LedgerId);
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue(this.selLedgerArr[index].LedgerName);
  //       let subLedgerTransaction = new SubLedgerTransactionModel();
  //       this.selectedSubLedger[index] = this.subLedgerMaster.find(a => a.SubLedgerId === this.selSubLedgerCode[index].SubLedgerId);
  //       subLedgerTransaction.LedgerId = this.transaction.TransactionItems[index].LedgerId = this.selectedSubLedger[index].LedgerId;
  //       subLedgerTransaction.SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue(this.selSubLedgerCode[index].SubLedgerName)
  //       this.transaction.TransactionItems[index].SubLedgers = [];
  //       this.transaction.TransactionItems[index].SubLedgers.push(subLedgerTransaction);
  //       this.ChangeFocus(`SubLedger_${index + 1}`);
  //     }
  //   }
  //   else {
  //     this.selSubLedgerCode[index] ? this.selSubLedgerCode[index] = this.selSubLedgerCode[index].trim() : true;
  //     let subledger = this.subLedgerMaster.find(a => a.LedgerId === oldLedgerId && a.SubLedgerCode === this.selSubLedgerCode[index]);
  //     if (!subledger || (subledger && subledger.SubLedgerId != oldSubledgerId) || this.selSubLedgerCode[index] === "") {
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("LedgerId").setValue("");
  //       this.transaction.TransactionItems[index].TransactionItemValidator.get("SubLedgerId").setValue("");
  //       this.ChangeFocus(`SubLedger_Code+${index + 1}`);
  //     }
  //   }
  // }

  // public ChangeFocusFromDrCr(index: number) {
  //   if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //     this.ChangeFocus(`SubLedger_Code_${index + 1}`);
  //   }
  //   else {
  //     this.ChangeFocus(`Code_${index + 1}`);
  //   }
  // }
}
