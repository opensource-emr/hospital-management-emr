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
import { Component, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment/moment';
import { AccountingBLService } from '../shared/accounting.bl.service';
import { LedgerModel } from '../settings/shared/ledger.model';
import { TransactionModel } from './shared/transaction.model';
import { ItemModel } from '../settings/shared/item.model';
import { TransactionItem } from './shared/transaction-item.model';
import { TransactionInventoryItem } from './shared/transaction-inventory-item.model';
import { TransactionCostCenterItem } from './shared/transaction-costcenter-item.model'
import { Voucher } from './shared/voucher'
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { CommonFunctions } from "../../shared/common.functions";
import { VoucherHeadModel } from '../settings/shared/voucherhead.model';
import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { CoreService } from "../../core/shared/core.service"
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { element, template } from '@angular/core/src/render3';

@Component({
  host: { '(window:keyup)': 'hotkeys($event)' },
  templateUrl: "./voucher-entry.html"
})
export class VoucherEntryComponent {
  public transaction: TransactionModel = new TransactionModel();

  public itemList: Array<ItemModel> = null;
  public voucherList: Array<Voucher> = new Array<Voucher>();
  public fiscalYear: FiscalYearModel = new FiscalYearModel();
  public selVoucher: Voucher = new Voucher();

  public todaysDate: string = null;
  public TransactionDate: string = null;
  public todaysDayName: string = null;

  public selItem: Array<ItemModel> = null;
  public selLedger: Array<LedgerModel> = null;

  public ledgerList: Array<LedgerModel> = [];
  public enableReturnMode: boolean = false;
  public isValidRefId: boolean = true;

  public totalDebit: number = 0;
  public totalCredit: number = 0;
  public totalAmount: number = 0;
  public isEqual: boolean = false;

  public transactionId: number = null; //used as input for view transaction page.
  public voucherNumber: string = null;

  public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
  public selectedVoucherHead: any;
  public isCreateLedger: boolean = false;

  public calType: string = "";
  //public nepaliDateClass: NepaliDate;
  public nepaliDate: NepaliDate;
  public IsBackDateEntry: boolean = false;
  public showAddPage: boolean = false;

  public DrCr: Array<string> = [];
  public DrCrList: Array<any>;
  constructor(
    public accountingBLService: AccountingBLService,
    public msgBoxServ: MessageboxService,
    //public coreService: CoreService,
    //public npCalendarService: NepaliCalendarService,
    public changeDetectorRef: ChangeDetectorRef,
    public router: Router) {
    this.DrCrList = [{ 'DrCr': 'Dr' }, { 'DrCr': 'Cr' }];
    this.DrCr[0] = "Dr";
    this.todaysDate = moment().format('YYYY-MM-DD');
    this.todaysDayName = moment().format('dddd');
    this.TransactionDate = moment().format('YYYY-MM-DD');
    this.transaction.TransactionDate = moment().format('YYYY-MM-DD');
    this.GetVoucher();
    this.GetVoucherHead();
    this.GetFiscalYearList();
    this.GetLedgerList();
  }
  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (event.altKey) {
      switch (event.keyCode) {
        case 83: {
          this.AddTransaction();
          break;
        } case 65: {
          this.AddNewTxnLedger();
          break;
        }
        case 46: {
          this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
          break;
        }
        case 88: {
          this.DeleteTxnLedgerRow(this.transaction.TransactionItems.length - 1);
          break;
        }
        case 86: {
          document.getElementById("voucher").focus();
          break;
        }
        case 13: {
          this.AddTransaction();
          break;
        }
        case 67: {
          this.CreateNewLedger();
          break;
        }
      }
    }

  }
  GetVoucher() {
    try {
      this.accountingBLService.GetVoucher()
        .subscribe(res => {
          this.voucherList = res.Results;
          this.selVoucher = Object.assign(this.selVoucher, this.voucherList.find(v => v.VoucherName == "Journal Voucher"));//most used voucher
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
          //this.selectedVoucherHead = Object.assign(this.selectedVoucherHead, this.voucherHeadList.find(x => x.VoucherHeadName == "Hospital"));//most used voucherhead
          this.selectedVoucherHead = "Hospital";
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  GetFiscalYearList() {
    try {
      this.accountingBLService.GetFiscalYearList()
        .subscribe(res => {
          if (res.Results.length) {
            var data = res.Results;
            this.fiscalYear = data.find(a => a.IsActive == true);
          }
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  AssignVoucher() {
    try {
      var check: boolean = true;
      if (this.transaction.VoucherId) {
        check = confirm("Changes will be discarded. Are you sure you want to change the Voucher Type?");
      }
      if (check) {
        this.Reset();
        this.transaction.VoucherId = Number(this.selVoucher.VoucherId);
        this.transaction.FiscalYearId = this.fiscalYear.FiscalYearId;
        this.transaction.UpdateValidator("off", "RefTxnVoucherNumber", "required");
        this.AddNewTxnLedger();
      }
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
            this.ledgerList = res.Results;
            this.ledgerList.forEach(a => {
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
            this.isValidRefId = true;
          }
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  AddNewTxnLedger() {
    try {
      this.showAddPage = false;
      this.isEqual = false;
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
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  checkDateValidation() {
    let flag = true;
    flag = moment(this.TransactionDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.todaysDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.TransactionDate <= this.todaysDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper transaction date']);
    }
    return flag;
  }

  //POST the txn to Database 
  AddTransaction() {
    let check = confirm("Are you sure you want to save?");
    if (check && this.transactionId == null) {
      try {
        let txnValidation = true;
        this.CalculateLedger();
        if (this.transaction.TransactionItems.length == 0) {
          this.msgBoxServ.showMessage("notice-message", ["Please enter some data..."]);
          return;
        }
        else {
          this.CheckBackDateEntryValidation();
          for (var a in this.transaction.TransactionValidator.controls) {
            this.transaction.TransactionValidator.controls[a].markAsDirty();
            this.transaction.TransactionValidator.controls[a].updateValueAndValidity();
          }
          if (this.transaction.IsValidCheck(undefined, undefined) && this.isValidRefId) {
            for (var txnItem of this.transaction.TransactionItems) {
              for (var b in txnItem.TransactionItemValidator.controls) {
                txnItem.TransactionItemValidator.controls[b].markAsDirty();
                txnItem.TransactionItemValidator.controls[b].updateValueAndValidity();
              }
              if (!txnItem.IsValidCheck(undefined, undefined)) {
                txnValidation = false;
                return;
              }
            };
          }


          else
            txnValidation = false;
          if (txnValidation && this.CheckCalculations() && this.CheckSelLedger()) {
            this.transaction.TotalAmount = this.totalDebit;
            this.transaction.FiscalYearId = this.fiscalYear.FiscalYearId;
            //if (this.IsBackDateEntry == false) {
            //    this.transaction.IsBackDateEntry = false;
            //    this.transaction.TransactionDate = moment().format("YYYY-MM-DD HH:mm");
            //}
            //else {
            //    this.transaction.IsBackDateEntry = true;
            //    this.transaction.TransactionDate = this.transaction.TransactionDate.concat(" 00:01:00");
            //}
            if (this.checkDateValidation()) {
              if (this.IsBackDateEntry == false) {
                this.transaction.IsBackDateEntry = false;
                this.transaction.TransactionDate = moment().format("YYYY-MM-DD HH:mm");
              }
              else {
                this.transaction.IsBackDateEntry = true;
                this.transaction.TransactionDate = this.TransactionDate.concat(" 00:01:00");
              }
              if (this.selectedVoucherHead == "Hospital") {
                this.selectedVoucherHead = new VoucherHeadModel();
                this.selectedVoucherHead.VoucherHeadId = this.voucherHeadList.find(x => x.VoucherHeadName == "Hospital").VoucherHeadId;
              }
              this.transaction.VoucherHeadId = this.selectedVoucherHead.VoucherHeadId;
              this.accountingBLService.PostToTransaction(this.transaction).
                subscribe(res => {
                  if (res.Status == 'OK') {
                    this.Reset();
                    this.msgBoxServ.showMessage("success", ["Voucher Created."]);
                    this.ViewTransactionDetails(res.Results);
                    this.AssignVoucher();
                  }
                  else {
                    this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
                    this.logError(res.ErrorMessage);
                  }
                });
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Select Proper TransactionDate"]);
            }
          }

        }
      } catch (ex) {
        this.ShowCatchErrMessage(ex);
      }
    }
  }
  ViewTransactionDetails(voucherNumber: string) {
    try {
      this.transactionId = null;
      this.voucherNumber = null;
      this.changeDetectorRef.detectChanges();
      this.voucherNumber = voucherNumber;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public AssignSelectedLedger(index) {
    try {
      if (this.selLedger[index]) {
        if (typeof (this.selLedger[index]) == 'object') {
          let extItem = this.transaction.TransactionItems.find(a => a.LedgerId == this.selLedger[index].LedgerId);
          let extItemIndex = this.transaction.TransactionItems.findIndex(a => a.LedgerId == this.selLedger[index].LedgerId);
          if (extItem && extItemIndex != index) {
            this.msgBoxServ.showMessage("failed", ["Voucher for " + this.selLedger[index].LedgerName + " already entered."]);
            this.changeDetectorRef.detectChanges();
            this.selLedger[index] = null;
            this.transaction.TransactionItems[index].ChartOfAccountName = "";
            this.ChangeFocus("Ledger_" + (index + 1));
          }
          else {
            this.transaction.TransactionItems[index].LedgerId = this.selLedger[index].LedgerId;
            this.transaction.TransactionItems[index].LedgerName = this.selLedger[index].LedgerName;
            this.transaction.TransactionItems[index].ChartOfAccountName = this.selLedger[index].ChartOfAccountName;
            this.ChangeFocus("Amount_" + (index + 1));
          }
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public CheckSelLedger(): boolean {
    try {
      if (this.selLedger.length) {
        for (let item of this.selLedger) {
          if (!item || typeof (item) != 'object') {
            item = undefined;
            this.msgBoxServ.showMessage("failed", ["Invalid itemList Name. Please select itemList from the list."]);
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
          this.msgBoxServ.showMessage("failed", ["Total Debit and Credit is not balanced."]);
          valid = false;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ["Entered amounts for voucher are not balanced."]);
        valid = false;
      }
      return valid;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //check and get transaction details in case of debit/credit note
  CheckTransaction() {
    try {
      let voucherId = null;
      if (this.selVoucher.VoucherName == "Credit Note")
        voucherId = this.voucherList.find(a => a.VoucherName == "Sales Voucher").VoucherId;
      else if (this.selVoucher.VoucherName == "Debit Note")
        voucherId = this.voucherList.find(a => a.VoucherName == "Purchase Voucher").VoucherId;
      if (voucherId && this.transaction.RefTxnVoucherNumber) {
        this.accountingBLService.CheckTransaction(this.transaction.RefTxnVoucherNumber, voucherId)
          .subscribe(res => {
            if (res.Status == "OK") {
              // this.transaction.ReferenceTransactionId = res.Results.TransactionId;
              this.isValidRefId = true;
            }
            else {
              //this.transaction.ReferenceTransactionId = null;
              this.isValidRefId = false;
            }
          });
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }

  }

  public Reset() {
    try {
      this.changeDetectorRef.detectChanges();
      this.transaction = new TransactionModel();
      this.selLedger = [];
      this.selItem = [];
      this.totalDebit = 0;
      this.totalCredit = 0;
      this.transactionId = null;
      this.isEqual = false;
      this.ChangeFocus("voucher");
      this.selectedVoucherHead = "Hospital";
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
          this.isEqual = true;
          this.totalAmount = this.totalDebit;
        }
      });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  //create new Ledger 
  CreateNewLedger() {
    let check = confirm("Do you want to create new Ledger?");
    if (check) {
      // this.router.navigate(['/AddLedger']);
      this.showAddPage = false;
      this.changeDetectorRef.detectChanges();
      this.showAddPage = true;
      //  this.isCreateLedger = true;
      check = false;
    }
  }
  DeleteTxnLedgerRow(index: number) {
    try {
      if (this.transaction.TransactionItems.length > 1) {
        this.transaction.TransactionItems.splice(index, 1);
        this.selLedger.splice(index, 1);
      }
      this.CalculateLedger();
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  LedgerListFormatter(data: any): string {
    return data["LedgerName"] + " | " + data["PrimaryGroup"] + " | Closing Bal- " + data["ClosingBalwithDrCr"];
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
    if (this.DrCr[i] == "Dr") {
      this.transaction.TransactionItems[i].DrCr = true;
    }
    if (this.DrCr[i] == "Cr") {
      this.transaction.TransactionItems[i].DrCr = false;
    }
    if (this.transaction.TransactionItems.filter(a => a.DrCr == true).length == this.transaction.TransactionItems.length) {
      this.transaction.TransactionItems[i].Amount = 0;
    } else if (this.transaction.TransactionItems.filter(a => a.DrCr == false).length == this.transaction.TransactionItems.length) {
      this.transaction.TransactionItems[i].Amount = 0;
    }
    this.CalculateLedger();
    //this.ChangeFocus("Ledger_"+index);
  }
  onVoucherTypeChange() {
    this.AssignVoucher();
    this.ChangeFocus("voucherhead");
  }
  AddNewLedger($event, index) {
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
          this.DrCr[i] = "Cr";
        }
        else {
          this.transaction.TransactionItems[i].DrCr = true;
          this.DrCr[i] = "Dr";
        }
        let b = this.transaction.TransactionItems[index].Amount;
        if (this.DrCr[i] != this.DrCrList[0]) {
          this.DrCrList = this.DrCrList.reverse();
        }
      }
    }
  }
  CallBackAdd($event) {
    var temp = $event.ledger;
    this.changeDetectorRef.detectChanges();
    // this.ledgerList.push(temp);
    this.GetLedgerList();
  }
}
