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

import {
  Component, EventEmitter, Output
} from "@angular/core";

@Component({
  selector: "voucher-edit-reusable",
  templateUrl: "./voucher-edit.component.html",
})
export class VoucherEditComponent {
  public showeditPage: boolean = true;
  @Output("callback-update")
  callbackUpdate: EventEmitter<Object> = new EventEmitter<Object>();
  public voucherNumber: string = "";
  public fiscalYearId: number = 0;

  public Close($event) {
    this.showeditPage = false;
    this.callbackUpdate.emit($event);
  }
  // public transaction: TransactionModel = new TransactionModel();

  // public itemList: Array<ItemModel> = null;
  // public voucherList: Array<Voucher> = new Array<Voucher>();
  // public fiscalYear: FiscalYearModel = new FiscalYearModel();
  // //for privious fiscal year date

  // public selVoucher: Voucher = new Voucher();

  // public todaysDate: string = null;
  // public TransactionDate: string = null;
  // public selectedBackDate: string = null;
  // public todaysDayName: string = null;

  // public selItem: Array<ItemModel> = null;
  // public selLedger: Array<LedgerModel> = null; //LedgerModel

  // // for edit manual voucher feature
  // public Ismanualvoucher: boolean = false;

  // public ledgerList: Array<LedgerModel> = [];
  // public enableReturnMode: boolean = false;
  // public isValidRefId: boolean = true;

  // public totalDebit: number = 0;
  // public totalCredit: number = 0;
  // public totalAmount: number = 0;
  // public isEqual: boolean = false;

  // public transactionId: number = null; //used as input for view transaction page.

  // public voucherNumber: string = null;
  // public voucherHeadList: Array<VoucherHeadModel> = new Array<
  //   VoucherHeadModel
  // >();
  // public selectedCostCenter = new CostCenterModel();
  // public isCreateLedger: boolean = false;
  // public nepaliDate: NepaliDate;
  // public IsBackDateEntry: boolean = false;
  // public showAddPage: boolean = false;
  // public sectionId: number = 4; //for manual voucher we are using section id=4 and name =Manual_Voucher
  // public DrCr: Array<string> = [];
  // public DrCrList: Array<any>;
  // public TempVoucherNumber: string = "";
  // public HideSavebtn: boolean = false;
  // public IsAllowDuplicateVoucherEntry: boolean;
  // public showledger: boolean = false;
  // public editVoucherNo: string;
  // public fiscalYearId: number;
  // //for save main voucher number
  // public mainvouchernumber: string;
  // public fiscalYId: any;
  // public showSubLedgerAddPopUp: boolean = false;
  // public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  // public LedgerwiseSubLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  // public subLedgers: Array<SubLedgerTransactionModel> = new Array<SubLedgerTransactionModel>();
  // public selectedSubLedger: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
  // public selectedItemIndex: number = 0;
  // public subLedgerAndCostCenterSetting = {
  //   "EnableSubLedger": false,
  //   "EnableCostCenter": false
  // };
  // public subLedgerDetail: Array<string> = new Array<string>();
  // public remainingAmount: number = 0;
  // public costCenterList = new Array<CostCenterModel>();

  // // public Isdefaultlist: Array<any> = new Array<any>();
  // constructor(
  //   public accountingBLService: AccountingBLService,
  //   public msgBoxServ: MessageboxService,

  //   //public npCalendarService: NepaliCalendarService,
  //   public changeDetectorRef: ChangeDetectorRef,
  //   private securityService: SecurityService,
  //   public coreService: CoreService,
  //   public accountingService: AccountingService,
  //   public router: Router,
  //   public routeFromService: RouteFromService,
  //   public accSettingBlService: AccountingSettingsBLService,
  //   public accountingSettingBlService: AccountingSettingsBLService

  // ) {
  //   this.DrCrList = [{ DrCr: "Dr" }, { DrCr: "Cr" }];
  //   this.DrCr[0] = "Dr";
  //   this.todaysDate = moment().format("YYYY-MM-DD");
  //   this.todaysDayName = moment().format("dddd");
  // }

  // @Output("callback-update")
  // callbackUpdate: EventEmitter<Object> = new EventEmitter<Object>();

  // @Input("FiscalYearId")
  // public set fiscalyear(_fiscalyearid) {
  //   if (_fiscalyearid) {
  //     this.fiscalYearId = _fiscalyearid;
  //   }
  // }

  // @Input("editvoucherNumber")
  // public set value(val: string) {
  //   if (!!val) {//mumbai-team-june2021-danphe-accounting-cache-change
  //     // this.Reset();
  //     // this.GetTxn(val);
  //     this.showeditPage = false;
  //     this.editVoucherNo = val;//mumbai-team-june2021-danphe-accounting-cache-change
  //     this.costCenterList = this.accountingService.accCacheData.CostCenters ? this.accountingService.accCacheData.CostCenters.filter(c => c.ParentCostCenterId === 0) : [];
  //     this.GetLedgerList();
  //     this.GetVoucher();
  //     this.GetVoucherHead();
  //     this.GetFiscalYearList();
  //     this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];

  //     // this.LoadCalendarTypes();
  //     this.setParameterValues();
  //   }
  // }

  // // CostCenterChange(): void {
  // //   this.transaction.CostCenterId = this.selectedCostCenter.CostCenterId;
  // // }

  // setParameterValues() {
  //   let Parameter = this.coreService.Parameters;
  //   let IsAllowDuplicateVoucherEntryData = Parameter.filter(
  //     (parms) => parms.ParameterName == "IsAllowDuplicateVoucherEntry"
  //   );
  //   if (IsAllowDuplicateVoucherEntryData.length > 0) {
  //     this.IsAllowDuplicateVoucherEntry = JSON.parse(
  //       IsAllowDuplicateVoucherEntryData[0].ParameterValue
  //     );
  //   } else {
  //     this.IsAllowDuplicateVoucherEntry = true;
  //   }

  //   let subLedgerParma = Parameter.find(a => a.ParameterGroupName === `Accounting` && a.ParameterName === `SubLedgerAndCostCenter`);
  //   if (subLedgerParma) {
  //     this.subLedgerAndCostCenterSetting = JSON.parse(subLedgerParma.ParameterValue);
  //   }
  // }
  // //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  // // LoadCalendarTypes() {
  // //   let Parameter = this.coreService.Parameters;
  // //   Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
  // //   let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
  // //   //this.calType = calendarTypeObject.AccountingModule;
  // // }

  // GetVoucher() {
  //   try {
  //     if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherList = this.accountingService.accCacheData.VoucherType;//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.voucherList = this.voucherList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
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
  //   try {
  //     this.fiscalYear = this.securityService.AccHospitalInfo.CurrFiscalYear;

  //     // this.accountingBLService.GetFiscalYearList()
  //     //   .subscribe(res => {
  //     //     if (res.Results.length) {
  //     //       var data = res.Results;
  //     //       this.fiscalYear = data.find(a => a.IsActive == true);
  //     //       //  if()
  //     //       this.fiscalPYear = data.find(b => b.IsActive == false);
  //     //     }
  //     //   });
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // AssignVoucher() {
  //   try {
  //     var check: boolean = true;
  //     if (this.transaction.VoucherId) {
  //       check = confirm(
  //         "Changes will be discarded. Are you sure you want to change the Voucher Type?"
  //       );
  //     }
  //     if (check) {
  //       this.Reset(); // this reset  method set default voucher hade
  //       this.transaction.VoucherId = Number(this.selVoucher.VoucherId);
  //       this.transaction.FiscalYearId = this.fiscalYear.FiscalYearId;
  //       this.transaction.UpdateValidator(
  //         "off",
  //         "RefTxnVoucherNumber",
  //         "required"
  //       );
  //       this.AddNewTxnLedger();
  //       //this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId);
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // //get all Ledger
  // GetLedgerList() {
  //   try {
  //     if (!!this.accountingService.accCacheData.Ledgers.length && this.accountingService.accCacheData.Ledgers.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.ledgerList = this.accountingService.accCacheData.Ledgers;//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.ledgerList = this.ledgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
  //       this.GetVoucherDetailForEdit(this.editVoucherNo, this.fiscalYearId);
  //       this.ledgerList.forEach((a) => {
  //         if (a.ClosingBalance > 0) {
  //           a.ClosingBalwithDrCr = "Dr" + a.ClosingBalance;
  //         } else if (a.ClosingBalance == 0) {
  //           a.ClosingBalwithDrCr = "0";
  //         } else {
  //           a.ClosingBalwithDrCr = "Cr" + -a.ClosingBalance;
  //         }
  //       });
  //       this.isValidRefId = true;
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // AddNewTxnLedger() {
  //   try {
  //     this.showAddPage = false;
  //     this.isEqual = false;
  //     var currentTxnItem = new TransactionItem();
  //     if (this.totalDebit > this.totalCredit) {
  //       currentTxnItem.DrCr = false;
  //       var temp = this.totalDebit - this.totalCredit;
  //       if (temp <= 0) {
  //         temp = 0;
  //       }
  //       currentTxnItem.Amount = CommonFunctions.parseDecimal(temp);
  //     } else {
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
  //       currentTxnItem.TransactionItemValidator.get("CostCenter").setValue(defaultCostCenter.CostCenterId);
  //     }
  //     this.transaction.TransactionItems.push(currentTxnItem);
  //     //here we need to pass index of newly created ledger. Index will always be length-1
  //     this.DescriptionValChanged(this.transaction.TransactionItems.length - 1);
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // checkDateValidation() {
  //   if (!this.validDate) {
  //     this.msgBoxServ.showMessage("error", ["Select proper date"]);
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
  // Close() {
  //   try {
  //     this.showeditPage = false;
  //     this.changeDetectorRef.detectChanges();
  //     this.selectedCostCenter = new CostCenterModel();
  //     this.selLedger = [];
  //     this.selItem = [];
  //     this.totalDebit = 0;
  //     this.totalCredit = 0;
  //     this.transactionId = null;
  //     this.isEqual = false;
  //     this.routeFromService.RouteFrom = "";
  //     this.showledger = false;
  //     this.editVoucherNo = null;
  //     this.fiscalYearId;
  //     this.transaction = new TransactionModel();
  //     localStorage.removeItem("SectionId");
  //     this.accountingService.IsEditVoucher = null;
  //     this.IsBackDateEntry = false;
  //     this.TransactionDate = null;
  //     this.selectedBackDate = null;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // //POST the txn to Database
  // UpdateTransaction() {
  //   //for avoid validation error
  //   this.transaction.UpdateValidator("off", "PayeeName", "required");
  //   this.transaction.UpdateValidator("off", "ChequeNumber", "");
  //   this.HideSavebtn = true;
  //   // let check = confirm("Are you sure you want to save?");
  //   // if (check && this.transactionId == null) {
  //   if (this.transactionId == null) {
  //     try {
  //       let txnValidation = true;
  //       this.CalculateLedger();
  //       if (this.transaction.TransactionItems.length == 0) {
  //         this.msgBoxServ.showMessage("notice-message", [
  //           "Please enter some data...",
  //         ]);
  //         this.HideSavebtn = false;
  //         return;
  //       } else {
  //         this.CheckBackDateEntryValidation();
  //         for (var a in this.transaction.TransactionValidator.controls) {
  //           this.transaction.TransactionValidator.controls[a].markAsDirty();
  //           this.transaction.TransactionValidator.controls[
  //             a
  //           ].updateValueAndValidity();
  //         }
  //         if (
  //           this.transaction.IsValidCheck(undefined, undefined) &&
  //           this.isValidRefId
  //         ) {
  //           for (var txnItem of this.transaction.TransactionItems) {
  //             for (var b in txnItem.TransactionItemValidator.controls) {
  //               txnItem.TransactionItemValidator.controls[b].markAsDirty();
  //               txnItem.TransactionItemValidator.controls[
  //                 b
  //               ].updateValueAndValidity();
  //             }
  //             if (!txnItem.IsValidCheck(undefined, undefined)) {
  //               txnValidation = false;
  //               this.HideSavebtn = false;
  //               return;
  //             }
  //           }
  //         } else {
  //           txnValidation = false;
  //           this.HideSavebtn = false;
  //         }

  //         if (
  //           txnValidation &&
  //           this.CheckCalculations() &&
  //           this.CheckSelLedger()
  //         ) {
  //           this.transaction.TotalAmount = this.totalDebit;
  //           this.transaction.FiscalYearId = this.fiscalYearId;
  //           if (this.checkDateValidation()) {
  //             if (this.IsBackDateEntry == false) {
  //               this.transaction.IsBackDateEntry = false;
  //               this.transaction.TransactionDate = this.TransactionDate;
  //             } else {
  //               this.transaction.IsBackDateEntry = true;
  //               this.transaction.TransactionDate = this.selectedBackDate;
  //             }
  //             let check = confirm("Are you sure you want to save?");
  //             if (check && this.transaction.TransactionId) {
  //               if (this.subLedgerAndCostCenterSetting.EnableSubLedger) {
  //                 this.transaction.TransactionItems.forEach(itm => {
  //                   let defaultSubLedger = this.subLedgerMaster.find(a => a.LedgerId === itm.LedgerId && a.IsDefault === true);
  //                   if (defaultSubLedger && itm.SubLedgers.length === 0) {
  //                     let subLedgerTxn = new SubLedgerTransactionModel();
  //                     subLedgerTxn.LedgerId = itm.LedgerId;
  //                     subLedgerTxn.SubLedgerId = defaultSubLedger.SubLedgerId;
  //                     subLedgerTxn.DrAmount = itm.DrCr ? itm.Amount : 0;
  //                     subLedgerTxn.CrAmount = itm.DrCr ? 0 : itm.Amount;
  //                     itm.SubLedgers.push(subLedgerTxn);
  //                   }
  //                 });
  //               }
  //               this.accountingBLService
  //                 .PutToTransaction(this.transaction)
  //                 .subscribe((res) => {
  //                   if (res.Status == "OK") {
  //                     this.HideSavebtn = false;
  //                     this.Reset();
  //                     this.msgBoxServ.showMessage("success", [
  //                       "Voucher Update.",
  //                     ]);

  //                     this.ViewTransactionDetails(res.Results);
  //                     if (this.routeFromService.RouteFrom != "") {
  //                       if (this.routeFromService.RouteFrom == "LedgerReport") {
  //                         this.router.navigate([
  //                           "/Accounting/Reports/LedgerReport",
  //                         ]);
  //                       } else if (
  //                         this.routeFromService.RouteFrom == "VoucherReport"
  //                       ) {
  //                         this.router.navigate([
  //                           "/Accounting/Reports/VoucherReport",
  //                         ]);
  //                       }
  //                     } else {
  //                       this.ViewTransactionDetails(res.Results);
  //                     }
  //                     this.ViewTransactionDetails(res.Results);
  //                     this.showeditPage = false;
  //                     this.AssignVoucher();
  //                     this.Close();

  //                     let reloadPage = true;
  //                     this.callbackUpdate.emit({ reloadPage });
  //                   } else {
  //                     this.msgBoxServ.showMessage("failed", [
  //                       "failed to update transaction.",
  //                     ]);
  //                     this.logError(res.ErrorMessage);
  //                     this.HideSavebtn = false;
  //                   }
  //                 });
  //             } else {
  //               this.HideSavebtn = false;
  //               this.transaction.IsBackDateEntry = false;
  //             }
  //           } else {
  //             this.HideSavebtn = false;
  //           }
  //         }
  //       }
  //     } catch (ex) {
  //       this.ShowCatchErrMessage(ex);
  //     }
  //   } else {
  //     this.HideSavebtn = false;
  //   }
  // }

  // ViewTransactionDetails(resultdata) {
  //   try {
  //     localStorage.setItem("SectionId", this.sectionId.toString());
  //     this.transactionId = null;
  //     this.voucherNumber = null;
  //     this.changeDetectorRef.detectChanges();
  //     this.voucherNumber = resultdata.VoucherNumber;
  //     this.fiscalYId = resultdata.FiscalyearId;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // public AssignSelectedLedger(index) {
  //   try {
  //     let oldLedgerId = this.transaction.TransactionItems[index] ? this.transaction.TransactionItems[index].LedgerId : 0;
  //     if (this.selLedger[index]) {
  //       if (typeof this.selLedger[index] == "object") {
  //         if (this.IsAllowDuplicateVoucherEntry) {
  //           this.transaction.TransactionItems[index].LedgerId = this.selLedger[
  //             index
  //           ].LedgerId;
  //           this.transaction.TransactionItems[
  //             index
  //           ].LedgerName = this.selLedger[index].LedgerName;
  //           this.transaction.TransactionItems[
  //             index
  //           ].ChartOfAccountName = this.selLedger[index].ChartOfAccountName;
  //           this.ChangeFocus("Amount_" + (index + 1));
  //           this.transaction.TransactionItems[index].Code = this.selLedger[
  //             index
  //           ].Code;
  //         } else {
  //           let extItem = this.transaction.TransactionItems.find(
  //             (a) => a.LedgerId == this.selLedger[index].LedgerId
  //           );
  //           let extItemIndex = this.transaction.TransactionItems.findIndex(
  //             (a) => a.LedgerId == this.selLedger[index].LedgerId
  //           );
  //           if (extItem && extItemIndex != index) {
  //             this.msgBoxServ.showMessage("failed", [
  //               "Voucher for " +
  //               this.selLedger[index].LedgerName +
  //               " already entered.",
  //             ]);
  //             this.changeDetectorRef.detectChanges();
  //             this.selLedger[index] = null;
  //             this.transaction.TransactionItems[index].ChartOfAccountName = "";
  //             this.ChangeFocus("Ledger_" + (index + 1));
  //             this.transaction.TransactionItems[index].Code = "";
  //           } else {
  //             this.transaction.TransactionItems[
  //               index
  //             ].LedgerId = this.selLedger[index].LedgerId;
  //             this.transaction.TransactionItems[
  //               index
  //             ].LedgerName = this.selLedger[index].LedgerName;
  //             this.transaction.TransactionItems[
  //               index
  //             ].ChartOfAccountName = this.selLedger[index].ChartOfAccountName;
  //             this.ChangeFocus("Amount_" + (index + 1));
  //             this.transaction.TransactionItems[index].Code = this.selLedger[
  //               index
  //             ].Code;
  //           }
  //         }
  //       }
  //     }

  //     if (this.subLedgerAndCostCenterSetting.EnableSubLedger && oldLedgerId != this.transaction.TransactionItems[index].LedgerId) {
  //       this.ProcessSubLedger(index);
  //     }

  //     // }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // public CheckSelLedger(): boolean {
  //   try {
  //     if (this.selLedger.length) {
  //       for (let item of this.selLedger) {
  //         if (!item || typeof item != "object") {
  //           item = undefined;
  //           this.msgBoxServ.showMessage("failed", [
  //             "Invalid itemList Name. Please select itemList from the list.",
  //           ]);
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
  //     //this.totalDebit = CommonFunctions.parseAmount(this.totalDebit);
  //     //this.totalCredit = CommonFunctions.parseAmount(this.totalCredit);

  //     if (this.totalDebit && this.totalCredit) {
  //       if (this.totalDebit != this.totalCredit) {
  //         this.msgBoxServ.showMessage("failed", [
  //           "Total Debit and Credit is not balanced.",
  //         ]);
  //         valid = false;
  //         this.HideSavebtn = false;
  //       }
  //     } else {
  //       this.msgBoxServ.showMessage("failed", [
  //         "Entered amounts for voucher are not balanced.",
  //       ]);
  //       valid = false;
  //       this.HideSavebtn = false;
  //     }
  //     return valid;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // //check and get transaction details in case of debit/credit note
  // CheckTransaction() {
  //   try {
  //     let voucherId = null;
  //     if (this.selVoucher.VoucherCode == "CN")
  //       voucherId = this.voucherList.find(
  //         (a) => a.VoucherName == "Sales Voucher"
  //       ).VoucherId;
  //     else if (this.selVoucher.VoucherName == "Debit Note")
  //       voucherId = this.voucherList.find(
  //         (a) => a.VoucherName == "Purchase Voucher"
  //       ).VoucherId;
  //     if (voucherId && this.transaction.RefTxnVoucherNumber) {
  //       this.accountingBLService
  //         .CheckTransaction(this.transaction.RefTxnVoucherNumber, voucherId)
  //         .subscribe((res) => {
  //           if (res.Status == "OK") {
  //             // this.transaction.ReferenceTransactionId = res.Results.TransactionId;
  //             this.isValidRefId = true;
  //           } else {
  //             //this.transaction.ReferenceTransactionId = null;
  //             this.isValidRefId = false;
  //           }
  //         });
  //     }
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // public Reset() {
  //   try {
  //     this.changeDetectorRef.detectChanges();
  //     this.transaction = new TransactionModel();
  //     this.selectedCostCenter = new CostCenterModel();
  //     this.selLedger = [];
  //     this.selItem = [];
  //     this.totalDebit = 0;
  //     this.totalCredit = 0;
  //     this.transactionId = null;
  //     this.isEqual = false;
  //     this.mainvouchernumber = null;
  //     this.ChangeFocus("voucher");
  //     // this.routeFromService.RouteFrom = "";
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // CalculateLedger() {
  //   try {
  //     this.totalDebit = this.totalAmount = 0;
  //     this.totalCredit = 0;
  //     this.transaction.TransactionItems.forEach((a) => {
  //       //a.Amount = CommonFunctions.parseAmount(a.Amount);
  //       if (a.DrCr === true || a.DrCr.toString() == "true") {
  //         this.totalDebit += a.Amount;
  //       } else {
  //         this.totalCredit += a.Amount;
  //       }
  //       if (this.totalCredit == this.totalDebit) {
  //         this.isEqual = true;
  //         this.totalAmount = this.totalDebit;
  //       }
  //     });
  //     this.totalDebit = CommonFunctions.parseDecimal(this.totalDebit);
  //     this.totalCredit = CommonFunctions.parseDecimal(this.totalCredit);
  //     this.totalAmount = this.totalDebit;
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }

  // DeleteTxnLedgerRow(index: number) {
  //   try {
  //     if (this.transaction.TransactionItems.length > 1) {
  //       this.transaction.TransactionItems.splice(index, 1);
  //       this.selLedger.splice(index, 1);
  //     }
  //     this.CalculateLedger();
  //   } catch (ex) {
  //     this.ShowCatchErrMessage(ex);
  //   }
  // }
  // LedgerListFormatter(data: any): string {
  //   return (
  //     data["Code"] +
  //     "-" +
  //     data["LedgerName"] +
  //     " | " +
  //     data["PrimaryGroup"] +
  //     " -> " +
  //     data["LedgerGroupName"] +
  //     " | Closing Bal- " +
  //     data["ClosingBalwithDrCr"]
  //   );
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
  //     this.HideSavebtn = false;
  //     console.log("Error Messsage =>  " + ex.message);
  //     console.log("Stack Details =>   " + ex.stack);
  //   }
  // }
  // CheckBackDateEntryValidation() {
  //   if (this.transaction.IsBackDateEntry == true) {
  //     this.transaction.UpdateValidator("on", "TransactionDate", "required");
  //   } else {
  //     //set validator off
  //     this.transaction.UpdateValidator("off", "TransactionDate", "required");
  //   }
  // }
  // ChangeFocus(nextId) {
  //   if (nextId != null) {
  //     try {
  //       // window.setTimeout(function () {
  //       //   document.getElementById(nextId).focus();
  //       // }, 0);
  //     } catch (ex) {
  //       console.log(ex);
  //     }
  //   }
  // }
  // onDrCrChange(i) {
  //   if (this.DrCr[i] == "Dr") {
  //     this.transaction.TransactionItems[i].DrCr = true;
  //   } else {
  //     this.transaction.TransactionItems[i].DrCr = false;
  //   }
  //   this.CalculateLedger();
  //   this.subLedgerAndCostCenterSetting.EnableSubLedger && this.ProcessSubLedger(i);
  // }

  // AddNewLedger($event, index) {
  //   let i = index + 1;
  //   if ($event) {
  //     this.CalculateLedger();
  //     if (this.totalCredit == this.totalDebit) {
  //       this.ChangeFocus("narration");
  //     } else {
  //       this.AddNewTxnLedger();
  //       this.ChangeFocus("DrCr_" + (i + 1));
  //       if (this.transaction.TransactionItems[i].DrCr == false) {
  //         this.DrCr[i] = "Cr";
  //       } else {
  //         this.transaction.TransactionItems[i].DrCr = true;
  //         this.DrCr[i] = "Dr";
  //       }
  //       let b = this.transaction.TransactionItems[index].Amount;
  //       if (this.DrCr[i] != this.DrCrList[0]) {
  //         this.DrCrList = this.DrCrList.reverse();
  //       }
  //     }
  //   }
  // }

  // //this method will get manual voucher details for edit manual voucher feature

  // GetVoucherDetailForEdit(GetVoucherDetailForEdit, FsYId) {
  //   var secId = parseInt(localStorage.getItem("SectionId"));
  //   this.accountingBLService
  //     .GetVoucherforedit(GetVoucherDetailForEdit, secId, FsYId)
  //     .subscribe((res) => {
  //       if ((res.Status === ENUM_DanpheHTTPResponseText.OK)) {
  //         let td = new TransactionModel();
  //         td = res.Results;
  //         this.selVoucher.VoucherId = td.VoucherId;
  //         // let costCenterObj = this.costCenterList.find((cc) => cc.CostCenterId == td.CostCenterId);
  //         // const costCenterNotApplicableId = -1;
  //         // this.selectedCostCenter.CostCenterId = costCenterObj ? costCenterObj.CostCenterId : costCenterNotApplicableId;
  //         // this.selectedCostCenter.CostCenterName = td.CostCenterId > 0 ? costCenterObj ? costCenterObj.CostCenterName : `` : ``;
  //         // this.transaction.CostCenterId = td.CostCenterId;
  //         this.TransactionDate = moment(td.TransactionDate).format(
  //           "YYYY-MM-DD"
  //         );
  //         this.transaction.TransactionId = td.TransactionId;
  //         this.transaction.VoucherId = td.VoucherId;
  //         this.transaction.TransactionDate = this.TransactionDate;
  //         this.transaction.CreatedBy = td.CreatedBy;
  //         this.transaction.CreatedOn = td.CreatedOn;
  //         this.transaction.IsActive = td.IsActive;
  //         this.transaction.Remarks = td.Remarks;
  //         this.transaction.VoucherNumber = td.VoucherNumber;
  //         // set voucher number if is not backdate entry
  //         this.mainvouchernumber = this.transaction.VoucherNumber;
  //         this.transaction.TransactionType = td.TransactionType;
  //         this.transaction.DayVoucherNumber = td.DayVoucherNumber;
  //         for (let i = 0; i < td.TransactionItems.length; i++) {
  //           var txnItmsLength = this.transaction.TransactionItems.length;
  //           if (txnItmsLength < td.TransactionItems.length) {
  //             this.AddNewTxnLedger();
  //           }
  //         }
  //         for (let i = 0; i < td.TransactionItems.length; i++) {
  //           if (td.TransactionItems[i].DrCr == true) {
  //             this.DrCr[i] = "Dr";
  //           } else if (td.TransactionItems[i].DrCr == false) {
  //             this.DrCr[i] = "Cr";
  //           }
  //           this.selLedger[i] = this.ledgerList.find(
  //             (l) => l.LedgerId == td.TransactionItems[i].LedgerId
  //           );
  //           this.transaction.TransactionItems[i].TransactionItemId =
  //             td.TransactionItems[i].TransactionItemId;
  //           this.transaction.TransactionItems[i].Amount =
  //             td.TransactionItems[i].Amount;
  //           this.transaction.TransactionItems[i].Description =
  //             td.TransactionItems[i].Description;
  //           this.transaction.TransactionItems[i].LedgerId = this.selLedger[
  //             i
  //           ].LedgerId;
  //           this.transaction.TransactionItems[i].LedgerName = this.selLedger[
  //             i
  //           ].LedgerName;
  //           this.transaction.TransactionItems[
  //             i
  //           ].ChartOfAccountName = this.selLedger[i].ChartOfAccountName;
  //           this.transaction.TransactionItems[i].SubLedgers = td.TransactionItems[i].SubLedgers;
  //           this.subLedgerDetail[i] = ``;
  //           this.transaction.TransactionItems[i].SubLedgers.forEach(a => {
  //             let detailObj = this.subLedgerMaster.find(sub => sub.SubLedgerId === a.SubLedgerId);
  //             this.subLedgerDetail[i] += `${detailObj ? detailObj.SubLedgerName : ``} - ${td.TransactionItems[i].DrCr ? a.DrAmount : a.CrAmount}, `;
  //           });
  //           this.subLedgerDetail[i] = `(${this.subLedgerDetail[i].substring(0, this.subLedgerDetail[i].length - 2)})`;
  //           this.transaction.TransactionItems[i].CostCenterId = td.TransactionItems[i].CostCenterId;
  //           this.transaction.TransactionItems[i].TransactionItemValidator.get("CostCenter").setValue(td.TransactionItems[i].CostCenterId);
  //         }
  //         this.showledger = true;
  //         this.showeditPage = true;
  //       } else {
  //         this.msgBoxServ.showMessage("failed", [
  //           "voucher number is not valid (in manual voucher entry), please check and try again",
  //         ]);
  //         console.log(res.ErrorMessage);
  //       }
  //       (err) => {
  //         this.msgBoxServ.showMessage("Failed", [err.message]);
  //         console.log(err.ErrorMessage);
  //       };
  //     });
  // }

  // public validDate: boolean = true;
  // selectDate(event) {
  //   if (event) {
  //     if (this.IsBackDateEntry) {
  //       this.selectedBackDate = event.selectedDate;
  //       if (this.selectedBackDate > this.fiscalYear.StartDate) {
  //         this.transaction.VoucherNumber = this.mainvouchernumber
  //       }
  //       else {
  //         this.GetVoucherNumber(this.transaction.VoucherId, this.sectionId, this.selectedBackDate);
  //       }
  //     }
  //     this.validDate = true;
  //   } else {
  //     this.validDate = false;
  //   }
  // }

  // //for IsCopyDescription=true voucher types, copy the Description of First Ledger to the new ledger row
  // DescriptionValChanged(currLedIndex: number) {
  //   if (
  //     this.selVoucher.VoucherId &&
  //     this.transaction.TransactionItems.length > 0
  //   ) {
  //     let currVoucherType = this.voucherList.find(
  //       (a) => a.VoucherId == this.selVoucher.VoucherId
  //     );
  //     if (currVoucherType && currVoucherType.ISCopyDescription == true) {
  //       let firstDescription = this.transaction.TransactionItems[0].Description;
  //       //currLedIndex is the recently added row.
  //       this.transaction.TransactionItems[
  //         currLedIndex
  //       ].Description = firstDescription;
  //     }
  //   }
  // }

  // Cancel() {
  //   this.Close();
  //   // this.SetDefaultVoucherHead();
  // }
  // // if is previous year back date entry then need new voucher number 
  // GetVoucherNumber(voucherId: number, sectionId, transactionDate) {
  //   this.accountingBLService.GettempVoucherNumber(voucherId, sectionId, transactionDate)
  //     .subscribe(res => {
  //       if (res.Status == "OK") {
  //         this.transaction.VoucherNumber = res.Results;
  //       }
  //       else {
  //         this.msgBoxServ.showMessage("failed", ['failed to Get Voucher Number.']);
  //         this.logError(res.ErrorMessage);
  //       }
  //     });
  // }

  // ChkBackDateEntryOnChange() {
  //   if (!this.IsBackDateEntry) {
  //     this.transaction.VoucherNumber = this.mainvouchernumber;
  //   }
  //   //console.log(this.IsBackDateEntry);
  // }


  // public CloseSubLedgerAddPopUp(): void {
  //   this.showSubLedgerAddPopUp = false;
  // }

  // public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
  //   return `${subLedger[`SubLedgerName`]}`;
  // }

  // public onSubLedgerChange(index: number): void {
  //   if (typeof this.selectedSubLedger[index] === `object` && this.selectedSubLedger[index].SubLedgerId > 0) {
  //     let indx = this.subLedgers.findIndex(sub => sub.SubLedgerId === this.selectedSubLedger[index].SubLedgerId);
  //     if (indx >= 0 && this.subLedgers[index].SubLedgerId !== this.selectedSubLedger[index].SubLedgerId) {
  //       this.selectedSubLedger[index] = new SubLedger_DTO();
  //       this.setFocusById(`subLedgerName`, this.subLedgers.length - 1);
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`This subledger is already selected. Please select another subledger`]);
  //     }
  //     else {
  //       this.subLedgers[index].LedgerId = this.selectedSubLedger[index].LedgerId;
  //       this.subLedgers[index].SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
  //       this.setFocusById(this.transaction.TransactionItems[this.selectedItemIndex].DrCr ? 'DrAmount' : 'CrAmount', this.subLedgers.length - 1);
  //     }
  //   }
  //   else {
  //     this.subLedgers[index].SubLedgerId = 0;
  //   }
  // }

  // public setFocusById(name: string, index: number): void {
  //   let htmlObj = document.getElementById(`${name}${index}`)
  //   if (htmlObj) {
  //     htmlObj.focus();
  //   }
  // }

  // public CalculateRemaingingAmount(): void {
  //   let sum = this.subLedgers.reduce((a, b) => a + (this.transaction.TransactionItems[this.selectedItemIndex].DrCr ? b.DrAmount : b.CrAmount), 0);
  //   this.remainingAmount = this.transaction.TransactionItems[this.selectedItemIndex].Amount - sum;
  // }

  // public DeleteSubLedgerItem(index: number): void {
  //   if (this.subLedgers.length === 1 && index === 0) {
  //     this.selectedSubLedger = [];
  //     this.subLedgers[index].CrAmount = 0;
  //     this.subLedgers[index].DrAmount = 0;
  //     this.subLedgers[index].SubLedgerId = 0;
  //     this.subLedgers[index].Description = ``;
  //   }
  //   else {
  //     this.subLedgers.splice(index, 1);
  //     this.selectedSubLedger.splice(index, 1);
  //   }
  //   this.CalculateRemaingingAmount();
  // }

  // public AddSubLedgerItem(): void {
  //   if (this.remainingAmount !== 0) {
  //     this.subLedgers.push(new SubLedgerTransactionModel());
  //     setTimeout(() => {
  //       this.setFocusById(`subLedgerName`, this.subLedgers.length - 1);
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

  // public SaveSubLedgerItem(): void {
  //   this.subLedgers = this.subLedgers.filter(a => a.SubLedgerId > 0 && (a.DrAmount > 0 || a.CrAmount > 0));
  //   this.CalculateRemaingingAmount();
  //   if (this.remainingAmount === 0) {
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers = this.subLedgers;
  //     this.subLedgerDetail[this.selectedItemIndex] = "";
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers.forEach(a => {
  //       let detailObj = this.subLedgerMaster.find(sub => sub.SubLedgerId === a.SubLedgerId);
  //       this.subLedgerDetail[this.selectedItemIndex] += `${detailObj ? detailObj.SubLedgerName : ``} - ${this.transaction.TransactionItems[this.selectedItemIndex].DrCr ? a.DrAmount : a.CrAmount}, `;
  //     });
  //     this.subLedgerDetail[this.selectedItemIndex] = `(${this.subLedgerDetail[this.selectedItemIndex].substring(0, this.subLedgerDetail[this.selectedItemIndex].length - 2)})`;
  //     this.showSubLedgerAddPopUp = false;
  //   }
  //   else if (this.subLedgers.length === 0 && this.remainingAmount != 0) {
  //     this.transaction.TransactionItems[this.selectedItemIndex].SubLedgers = [];
  //     this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`No SubLedger selected for this Ledger.`]);
  //     this.showSubLedgerAddPopUp = false;
  //   }
  //   else {
  //     this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Subledger Amount should be equal to Ledger Amount. Please correct your entry.`]);
  //   }
  // }

  // public AddSubLedger(index: number): void {
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
  //       this.setFocusById(`subLedgerName`, this.subLedgers.length - 1);
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
  //       this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [`Unable to get subLedger list.`]);
  //     });
  // }

  // public ProcessSubLedger(index: number): void {
  //   if (this.transaction.TransactionItems[index] && this.transaction.TransactionItems[index].LedgerId > 0 && this.transaction.TransactionItems[index].Amount > 0 && this.transaction.TransactionItems[index].DrCr != null) {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = true;
  //   }
  //   else {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = false;
  //   }
  //   if (this.transaction.TransactionItems[index].showSubledgerCreateButton && this.routeFromService.RouteFrom == "") {
  //     this.transaction.TransactionItems[index].SubLedgers = [];
  //   }
  // }

  // public HandleAmountChange(index: number) {
  //   if (this.transaction.TransactionItems[index] && this.transaction.TransactionItems[index].LedgerId > 0 && this.transaction.TransactionItems[index].Amount > 0 && this.transaction.TransactionItems[index].DrCr != null) {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = true;
  //   }
  //   else {
  //     this.transaction.TransactionItems[index].showSubledgerCreateButton = false;
  //   }
  //   if (this.transaction.TransactionItems[index].showSubledgerCreateButton) {
  //     this.transaction.TransactionItems[index].SubLedgers = [];
  //   }
  //   this.CalculateLedger();
  // }

  // ngAfterViewInit(): void {
  //   this.routeFromService.RouteFrom = "";
  // }
}
