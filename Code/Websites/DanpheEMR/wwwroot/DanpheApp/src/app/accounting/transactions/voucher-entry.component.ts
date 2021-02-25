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
import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import * as moment from 'moment/moment';
import { AccountingBLService } from '../shared/accounting.bl.service';
import { LedgerModel } from '../settings/shared/ledger.model';
import { TransactionModel } from './shared/transaction.model';
import { TransactionItem } from './shared/transaction-item.model';
import { Voucher } from './shared/voucher'
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { CommonFunctions } from "../../shared/common.functions";
import { VoucherHeadModel } from '../settings/shared/voucherhead.model';
import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service";
import { Router } from '@angular/router';
import { AccountingService } from '../shared/accounting.service';
import { RouteFromService } from '../../shared/routefrom.service';
import * as _ from 'lodash';
import { VoucherHead } from './shared/VoucherHead';
import { SecurityService } from '../../security/shared/security.service';
@Component({
  host: { '(window:keydown)': 'hotkeys($event)' },
  templateUrl: "./voucher-entry.html"
})
export class VoucherEntryComponent {
  public transaction: TransactionModel = new TransactionModel();

  public voucherTypeList: Array<Voucher> = new Array<Voucher>();//eg: JV, PV, SV, CN, etc. 

  public fiscalYearList: Array<FiscalYearModel> = [];
  public currFiscalYear: FiscalYearModel = new FiscalYearModel();

  //Id of Currently Selected VoucherType. eg: JV, PV, SV, CN, etc.  default JV is set from function below.
  public selVoucherTypeId: number = 0;
  public todaysDate: string = null;
  public TransactionDate: string = null;

  public selLedgerArr: Array<LedgerModel> = null;//this keeps tracks of seleted ledgers in this page only.
  public allLedgerList: Array<LedgerModel> = [];//these are all available ledgers for current hospital.

  public totalDebit: number = 0;
  public totalCredit: number = 0;
  public totalAmount: number = 0;

  public voucherNumber: string = null;//to pass to the Voucher-View (i.e: Transaction-View page)
  public showVoucherPopup: boolean = false;//sud-nagesh: 20Jun'20 -- this is to show/hide VoucherView (i.e: Transactoin-view page.)

  public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
  public selectedVoucherHead: VoucherHead = new VoucherHead();

  public IsBackDateEntry: boolean = false;
  public showAddNewLedgerPage: boolean = false;
  public sectionId: number = 4;  //for manual voucher we are using section id=4 and name =Manual_Voucher
  public selDrCrArray: Array<string> = [];
  public DrCrList: Array<any>;
  public TempVoucherNumber: string = "";
  public HideSavebtn: boolean = false;
  public IsAllowDuplicateVoucherEntry: boolean;
  public curIndex: any;
  public fiscalYId: any;

  constructor(
    public accountingBLService: AccountingBLService,
    public msgBoxServ: MessageboxService,
    //public npCalendarService: NepaliCalendarService,
    public changeDetectorRef: ChangeDetectorRef, public coreService: CoreService, public accountingService: AccountingService,
    public router: Router, public routeFromService: RouteFromService, public securityService: SecurityService) {
    this.DrCrList = [{ 'DrCr': 'Dr' }, { 'DrCr': 'Cr' }];
    this.selDrCrArray[0] = "Dr";
    this.todaysDate = moment().format('YYYY-MM-DD');
     this.TransactionDate = moment().format('YYYY-MM-DD');
    // this.transaction.TransactionDate = moment().format('YYYY-MM-DD');
    this.GetVoucher();
    this.GetVoucherHead();
    this.GetFiscalYearList();
    this.GetLedgerList();
    this.setParameterValues();
    this.coreService.GetCodeDetails().subscribe(res => {      
      this.coreService.SetCodeDetails(res);
    });
   
    this.coreService.GetFiscalYearList().subscribe(res => {      
      this.coreService.SetFiscalYearList(res);
    });
  }

  ngOnInit() {
    //console.log("voucher-entry- NgOnINIT called..");
  }
  public validDate:boolean=true;
	selectDate(event){
    if(event){
      this.TransactionDate = event.selectedDate;
      this.validDate =true;
      this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId,this.TransactionDate);
    }
    else{
      this.validDate =false;
    }
   
	}
  ChangedVoucherHead() {
    this.transaction.VoucherHeadId = this.selectedVoucherHead.VoucherHeadId;
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

  GetVoucher() {
    try {
      this.accountingBLService.GetVoucher()
        .subscribe(res => {
          this.voucherTypeList = res.Results;
          //JV (Journal Voucher) should always be there, so we can be 100% sure that this shouldn't crash.
          this.selVoucherTypeId = this.voucherTypeList.find(v => v.VoucherCode == "JV").VoucherId;


          this.AssignVoucher();
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  GetVoucherHead() {
    try {
      this.accountingBLService.GetVoucherHead()
        .subscribe(res => {
          this.voucherHeadList = res.Results;
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  GetFiscalYearList() {
    this.fiscalYearList = this.securityService.AccHospitalInfo.FiscalYearList;    
    this.currFiscalYear = new FiscalYearModel();
    this.currFiscalYear=this.securityService.AccHospitalInfo.CurrFiscalYear;
  }


  AssignVoucher() {
    try {
      //if (check) {
      this.Reset();// this reset  method set default voucher hade
      this.transaction.VoucherId = this.selVoucherTypeId;
      this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;
      this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
      this.AddNewTxnLedger();
      this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId,this.TransactionDate);

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  //get all Ledger
  GetLedgerList() {
    try {
      this.accountingBLService.GetLedgers()
        .subscribe(res => {
          if (res.Results) {
            this.allLedgerList = res.Results;
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
            this.SetDefaultVoucherHead();
            if (this.transaction.TransactionItems.length == 1) {
              this.ChangeFocus("Ledger_" + 1);
            }

          }
        });
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
        currentTxnItem.Amount = temp;
      }
      else {
        currentTxnItem.DrCr = true;
        var temp = this.totalCredit - this.totalDebit
        if (temp <= 0) {
          temp = 0;
        }
        currentTxnItem.Amount = temp;
      }
      this.transaction.TransactionItems.push(currentTxnItem);
      //here we need to pass index of newly created ledger. Index will always be length-1
      this.DescriptionValChanged(this.transaction.TransactionItems.length - 1);

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  checkDateValidation() {
    if(!this.validDate){
      this.msgBoxServ.showMessage("error", ['Select proper date']);
      return false;
    }else 
    {
      return true;
    }
    

  }
  //POST the txn to Database 
  SaveVoucherToDb() {
    if (!this.CheckCalculations()) {
      return;
    }
    this.HideSavebtn = true;
    let check = confirm("Are you sure you want to save?");
    if (check) {
      try {
        let txnValidation = true;
        this.CalculateLedger();
        if (this.transaction.TransactionItems.length == 0) {
          this.msgBoxServ.showMessage("notice-message", ["Please enter some data..."]);
          this.HideSavebtn = false;
          return;
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
                return;
              }
            };
          }


          else
            txnValidation = false;
          this.HideSavebtn = false;
          if (txnValidation && this.CheckCalculations() && this.CheckSelLedger()) {
            this.transaction.TotalAmount = this.totalDebit;
            this.transaction.FiscalYearId = this.currFiscalYear.FiscalYearId;

            if (this.checkDateValidation()) {
              if (this.IsBackDateEntry == false) {
                this.transaction.IsBackDateEntry = false;
                this.transaction.TransactionDate = moment().format("YYYY-MM-DD HH:mm");
              }
              else {
                this.transaction.IsBackDateEntry = true;
                // this.transaction.TransactionDate =
                this.transaction.TransactionDate = this.TransactionDate.concat(" 00:01:00");
              }

              if (!this.transaction.TransactionId) {
                this.accountingBLService.PostToTransaction(this.transaction).
                  subscribe(res => {
                    if (res.Status == 'OK') {
                      this.HideSavebtn = false;
                      this.Reset();
                      this.msgBoxServ.showMessage("success", ["Voucher is Saved."]);
                      this.ViewTransactionDetails(res.Results);
                      this.AssignVoucher();
                      this.SetDefaultVoucherHead();

                    }
                    else {
                      this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
                      this.logError(res.ErrorMessage);
                      this.HideSavebtn = false;
                    }
                  });
              }
              else {
                this.accountingBLService.PutToTransaction(this.transaction).
                  subscribe(res => {
                    if (res.Status == 'OK') {
                      this.HideSavebtn = false;
                      this.Reset();
                      this.msgBoxServ.showMessage("success", ["Voucher Created."]);
                      this.ViewTransactionDetails(res.Results);
                      this.AssignVoucher();
                      this.SetDefaultVoucherHead();
                    }
                    else {
                      this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
                      this.logError(res.ErrorMessage);
                      this.HideSavebtn = false;
                    }
                  });

              }
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Select Proper TransactionDate"]);
              this.HideSavebtn = false;
            }
          }

        }
      } catch (ex) {
        this.ShowCatchErrMessage(ex);
      }
    }
    else {
      this.HideSavebtn = false;
    }
  }
 
  ViewTransactionDetails(resultdata) {
    try {
      localStorage.setItem("SectionId", this.sectionId.toString());
      this.changeDetectorRef.detectChanges();
      this.voucherNumber = resultdata.VoucherNumber;
      this.fiscalYId =resultdata.FiscalyearId;    //pass fsYid with voucher number 
      this.showVoucherPopup = true;


    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public AssignSelectedLedger(index) {
    try {
      if (this.selLedgerArr[index]) {

        // let currSelLedgerName: any = this.selLedgerArr[index];//when coming from new page, we have name in string format
        // //if selLedger has string value then check if it's there in the allLedgerList and replace that with correct ledger object
        // if (typeof (this.selLedgerArr[index]) == 'string') {
        //   let ledObj = this.allLedgerList.find(led => led.LedgerName.toLowerCase() == currSelLedgerName.toLowerCase());
        //   if (ledObj) {
        //     this.selLedgerArr[index] = ledObj;

        //   }
        // }

        if (typeof (this.selLedgerArr[index]) == 'object') {
          if (this.IsAllowDuplicateVoucherEntry) {
            this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
            this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
            this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
            this.ChangeFocus("Amount_" + (index + 1));
            this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
          }
          else {
            let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
            let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selLedgerArr[index].LedgerId);
            if (extItem && extItemIndex != index) {
              this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selLedgerArr[index].LedgerName + " already entered."]);
              this.changeDetectorRef.detectChanges();
              this.selLedgerArr[index] = null;
              this.transaction.TransactionItems[index].ChartOfAccountName = "";
              this.ChangeFocus("Ledger_" + (index + 1));
              this.transaction.TransactionItems[index].Code = "";
            }
            else {
              this.transaction.TransactionItems[index].LedgerId = this.selLedgerArr[index].LedgerId;
              this.transaction.TransactionItems[index].LedgerName = this.selLedgerArr[index].LedgerName;
              this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedgerArr[index].ChartOfAccountName;
              this.ChangeFocus("Amount_" + (index + 1));
              this.transaction.TransactionItems[index].Code = this.selLedgerArr[index].Code;
            }
          }
        }
      }

      // }

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
      //parse to same format before comparison..
      this.totalDebit = CommonFunctions.parseAmount(this.totalDebit);
      this.totalCredit = CommonFunctions.parseAmount(this.totalCredit);

      if (this.totalDebit && this.totalCredit) {
        if (this.totalDebit != this.totalCredit) {
          this.msgBoxServ.showMessage("failed", ["Total Debit and Credit is not balanced."]);
          valid = false;
          this.HideSavebtn = false;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Entered amounts for voucher are not balanced."]);
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
      this.changeDetectorRef.detectChanges();
      this.transaction = new TransactionModel();
      this.selectedVoucherHead = new VoucherHead();
      this.selLedgerArr = [];
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.ChangeFocus("voucher");
      this.routeFromService.RouteFrom = "";

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  CalculateLedger() {
    try {
      this.totalDebit = this.totalAmount = 0;
      this.totalCredit = 0;
      this.transaction.TransactionItems.forEach(a => {
        a.Amount = CommonFunctions.parseAmount(a.Amount);
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
      this.changeDetectorRef.detectChanges();
      this.showAddNewLedgerPage = true;
    }
  }

  DeleteTxnLedgerRow(index: number) {
    try {
      if (this.transaction.TransactionItems.length > 1) {
        this.transaction.TransactionItems.splice(index, 1);
        this.selLedgerArr.splice(index, 1);
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
        window.setTimeout(function () {
          document.getElementById(nextId).focus();
        }, 0);
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

    if (this.transaction.TransactionItems.filter(a => a.DrCr == true).length == this.transaction.TransactionItems.length) {
      this.transaction.TransactionItems[i].Amount = 0;
    }
    else if (this.transaction.TransactionItems.filter(a => a.DrCr == false).length == this.transaction.TransactionItems.length) {
      this.transaction.TransactionItems[i].Amount = 0;
    }
    this.CalculateLedger();
  }

  onVoucherTypeChange() {
    //if no txn item then assign voucher, else confirm and change voucher type
    if (this.transaction.TransactionItems.length == 0) {
      this.AssignVoucher();
    } else {
      var check: boolean = true;
      let oldVoucherTypeId = this.transaction.VoucherId;
      check = confirm("Are you sure you want to change the Voucher Type?");
      if (check) {
        this.transaction.VoucherId = this.selVoucherTypeId;
        //this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
        this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId,this.TransactionDate);
      }
      else { //set to old one if user chooses 'NO' from confirmbox.
        this.changeDetectorRef.detectChanges();
        this.selVoucherTypeId = oldVoucherTypeId;//detect change should be above this else it won't work.. :(
      }
    }

  }

  //this is called from Description-> Enter Key
  //this check the amount and adds new ledger if required.. else change the focus to Narration.
  CheckAndAddNewTxnLedger($event, index) {
    let i = index + 1;
    if ($event) {
      this.CalculateLedger();
      if (this.totalCredit == this.totalDebit) {
        this.ChangeFocus("narration");
      } else {
        this.AddNewTxnLedger();
        this.ChangeFocus("DrCr_" + (i + 1));
        //  this.transaction.TransactionItems[i].Amount = parseInt($event.target.value);
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

    }
  }

  //this comes from add-new ledger popup
  //modified: sud/nagesh: 21Jun'20--refactoring.
  CallBackAddNewLedger($event) {
    if ($event && $event.action == "add") {
      var temp = $event.data;
      //push newly created ledger to the list and slice it to refresh the Array object
      this.allLedgerList.push(temp);
      this.allLedgerList = this.allLedgerList.slice();
      ///to automatically assign newly created ledger, we've to assingn the name then call AssignSelectedLedgerFunction.
      //so that it can check by the name and assign object property from the list.
      this.selLedgerArr[this.curIndex] = temp.LedgerName;
      this.AssignSelectedLedger(this.curIndex);
    }

    this.changeDetectorRef.detectChanges();
    this.showAddNewLedgerPage = false;

  }


  SetDefaultVoucherHead() {
    this.changeDetectorRef.detectChanges();
    if (this.voucherHeadList && this.voucherHeadList.length > 0) {
      this.selectedVoucherHead = new VoucherHead();
      var defaultVH = this.voucherHeadList.filter(vh => vh.IsDefault == true);
      if (defaultVH.length > 0) {
        this.selectedVoucherHead.VoucherHeadId = defaultVH[0].VoucherHeadId;
        this.selectedVoucherHead.VoucherHeadName = defaultVH[0].VoucherHeadName;
      } else {
        this.selectedVoucherHead.VoucherHeadId = this.voucherHeadList[0].VoucherHeadId;
        this.selectedVoucherHead.VoucherHeadName = this.voucherHeadList[0].VoucherHeadName;
      }
    }
  }

  //this method for get provisional Voucher number for curernt new created voucher
  GettempVoucherNumber(voucherId: number, sectionId ,transactionDate) {
    this.accountingBLService.GettempVoucherNumber(voucherId, sectionId,transactionDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.TempVoucherNumber = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", ['failed to Get Provisional Voucher Number.']);
          this.logError(res.ErrorMessage);
        }
      });
  }

  //for IsCopyDescription=true voucher types, copy the Description of First Ledger to the new ledger row
  DescriptionValChanged(currLedIndex: number) {

    if (this.selVoucherTypeId && this.transaction.TransactionItems.length > 0) {
      let currVoucherType = this.voucherTypeList.find(a => a.VoucherId == this.selVoucherTypeId);
      if (currVoucherType && currVoucherType.ISCopyDescription == true) {
        let firstDescription = this.transaction.TransactionItems[0].Description;
        //currLedIndex is the recently added row.
        this.transaction.TransactionItems[currLedIndex].Description = firstDescription;
      }
    }
  }


  Cancel() {
    this.Reset();
    this.AssignVoucher();
    this.SetDefaultVoucherHead();
  }

  ChkBackDateEntryOnChange() {
    if (!this.IsBackDateEntry) {
      this.TransactionDate = this.todaysDate;
      this.transaction.TransactionDate = this.todaysDate;
      this.GettempVoucherNumber(this.transaction.VoucherId, this.sectionId,this.TransactionDate);
    }
    //console.log(this.IsBackDateEntry);
  }

}
