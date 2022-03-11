import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonFunctions } from '../../../shared/common.functions';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { TransactionViewModel } from '../../transactions/shared/transaction.model';
import { AccountingReportsBLService } from '../shared/accounting-reports.bl.service';
import { BankReconcliationModel } from '../bank-reconciliation/bank-reconciliation.model';
import { AccountingService } from '../../shared/accounting.service';
import {CoreService} from '../../../core/shared/core.service'

@Component({
  selector: 'app-bank-reconciliation',
  templateUrl: './bank-reconciliation.component.html',
  styleUrls: ['./bank-reconciliation.component.css']
})
export class BankReconciliationComponent implements OnInit {

  public fromDate: string = null;
  public toDate: string = null;
  public selectedDate: string = "";
  public fiscalYearId: number = null;
  public validDate: boolean = true;


  public ledgerList: Array<any> = new Array<any>();
  public selLedger: { LedgerId, LedgerName, Code } = null;
  public ledgerResult: any;
  public selLedgerName: string = "";

  //public bankReconcCategory = [{ CategoryId: 0, CategoryName: '', Description: '', CreatedOn: '', CreatedBy: 0, IsActive: 1 }];
public bankReconcCategory: any;
  public bankRecCategory: number;
  public bankrecList: Array<BankReconcliationModel> = new Array<BankReconcliationModel>();
  public disableViewBtn: boolean = true;
  public calType: string = '';
  public txnItems: any;
  
  public showSavePopup: boolean = false;
  public transaction: TransactionViewModel = new TransactionViewModel();
  public showDetails: boolean = false;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public depositdr: number = 0;
  public depositcr: number = 0;
  public selectedTxn: any;
  public remark: string = '';
  public showPrint: boolean = false;
  public printDetaiils: any;
  public categoriesList:any;
public catName:any;
public bankHistory:any;
public showDetailView :boolean=false;
public ledgerDetails:any;
public historyPopup :boolean=false;
public txnHistory:any;
  public showVoucherHeadCol : boolean = false;
  public dateRange: string = '';
  constructor(public accReportBLService: AccountingReportsBLService,public coreService: CoreService,
    public msgBoxServ: MessageboxService, public accBLService: AccountingBLService,
    public changeDetector: ChangeDetectorRef, private formBuilder: FormBuilder,
    public accountingService: AccountingService,) {
    this.calType = "en,np";
    this.GetLedgers();
    this.GetReconciliationCategory();
    this.showVoucherHead();
    this.accountingService.getCoreparameterValue();
  }

  ngOnInit() {
  }

  public GetLedgers() {
    if(!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length>0){ //mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.accountingService.accCacheData.Ledgers; //mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.ledgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    
    
    LedgerListFormatter(data: any): string {
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }
  selectDate(event) {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
      this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }
    else {
      this.validDate = false;
    }
  }
  CheckSelLedger(): boolean {

    if (!this.selLedger || typeof (this.selLedger) != 'object') {
      this.selLedger = undefined;
      this.msgBoxServ.showMessage("failed", ["Select ledger from the list."]);
      return false;
    }
    else
      return true;
  }
  checkDateValidation() {
    let flag = true;
    if (!this.validDate) {
      this.msgBoxServ.showMessage("error", ['Select proper date.']);
      let flag = false;
    }

    return flag;
  }
  public GetTxnList() {
    this.ledgerResult = null;
    try {
      if (this.CheckSelLedger() && this.checkDateValidation()) {
        this.accReportBLService.GetBankReconcillationReport(Number(this.selLedger.LedgerId), this.fromDate, this.toDate, this.fiscalYearId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results.VouchersWithReconciliation.length) {
                let CrTotalAmt = 0;
                let DrTotalAmt = 0;
                let OpeningBalanceAmt = 0;
                let OpeningBalanceDrAmt;
                let OpeningBalanceCrAmt;
                // this.IsOpeningBalance = false;
                this.ledgerResult = res.Results.VouchersWithReconciliation;
                this.bankHistory=JSON.parse(JSON.stringify(this.ledgerResult));
                 let categoriesList = this.bankReconcCategory;
                
               
                this.ledgerResult.forEach(function (e) {
                  if (typeof e === "object") {
                    e["BankBalance"] = (e.BankReconciliationTxn== null)? null: e.BankReconciliationTxn.BankBalance;
                    e["CategoryId"] = (e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.CategoryId;
                    if(e.CategoryId>0){
                        e["CategoryName"] = categoriesList.find(a=> a.CategoryId == e.BankReconciliationTxn.CategoryId).CategoryName;
               
                    }
                    e["Difference"] =(e.BankReconciliationTxn== null)? null: e.BankReconciliationTxn.Difference;
                    e["BankTransactionDate"] = e.BankTransactionDate;
                    e['TransactionDateBsAd'] = e.TransactionDate;
                    e["bankBalanceType"] = e.DrCr;
                    e["VoucherNumber"] = e.VoucherNumber;
                    e["BankTransactionDate"] = e.BankTransactionDate;
                    e["DrCr"]= (e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.DrCr
                    e["Remark"]=(e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.Remark
                    e["LedgerDr"]= e.LedgerDr ;
                    e["LedgerCr"]=e.LedgerCr;
                    }
                  
                });

              this.ledgerResult.forEach(a => {
                  a.DrCr ? DrTotalAmt += a.Amount : CrTotalAmt += a.Amount;
                  OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
                  a.OpeningBalanceType ? OpeningBalanceDrAmt = a.OpeningBalance + a.AmountDr - a.AmountCr : OpeningBalanceCrAmt = a.OpeningBalance + a.AmountCr - a.AmountDr;
                })
                if (OpeningBalanceDrAmt < 0) {
                  OpeningBalanceCrAmt = -OpeningBalanceDrAmt;
                  OpeningBalanceDrAmt = null;
                }
                if (OpeningBalanceCrAmt < 0) {
                  OpeningBalanceDrAmt = -OpeningBalanceCrAmt;
                  OpeningBalanceCrAmt = null;
                }
                this.ledgerResult.DrTotalAmount = DrTotalAmt;
                this.ledgerResult.CrTotalAmount = CrTotalAmt;

                this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
                this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;

                // Calculating Debit total amount and credit total amount
                if (this.ledgerResult.DrTotalAmount > this.ledgerResult.CrTotalAmount) {
                  if (this.ledgerResult.OpeningBalanceDrAmount > this.ledgerResult.OpeningBalanceCrAmount) {
                    this.ledgerResult.DrNetAmount = this.ledgerResult.DrTotalAmount - this.ledgerResult.CrTotalAmount + this.ledgerResult.OpeningBalanceDrAmount;
                  }
                  else {
                    this.ledgerResult.DrNetAmount = this.ledgerResult.DrTotalAmount - this.ledgerResult.CrTotalAmount - this.ledgerResult.OpeningBalanceCrAmount;
                  }
                  if (this.ledgerResult.DrNetAmount < 0) {
                    this.ledgerResult.CrNetAmount = - this.ledgerResult.DrNetAmount;
                    this.ledgerResult.DrNetAmount = null;
                  }
                }
                else {
                  if (this.ledgerResult.OpeningBalanceDrAmount < this.ledgerResult.OpeningBalanceCrAmount) {
                    this.ledgerResult.CrNetAmount = this.ledgerResult.CrTotalAmount - this.ledgerResult.DrTotalAmount + this.ledgerResult.OpeningBalanceCrAmount;
                  }
                  else {
                    this.ledgerResult.CrNetAmount = this.ledgerResult.CrTotalAmount - this.ledgerResult.DrTotalAmount - this.ledgerResult.OpeningBalanceDrAmount;
                  }
                  if (this.ledgerResult.CrNetAmount < 0) {
                    this.ledgerResult.DrNetAmount = - this.ledgerResult.CrNetAmount;
                    this.ledgerResult.CrNetAmount = null;
                  }
                }

                this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
                this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;
              }
              else if (res.Results.dataList.length) {
                // this.ledgerResult = res.Results.dataList;
                // // this.IsOpeningBalance = true;
                // let OpeningBalanceAmt = 0;
                // let OpeningBalanceDrAmt;
                // let OpeningBalanceCrAmt;
                // this.ledgerResult.forEach(a => {
                //   OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
                //   (a.AmountDr >= a.AmountCr) ? OpeningBalanceDrAmt = a.AmountDr - a.AmountCr : OpeningBalanceCrAmt = a.AmountCr - a.AmountDr;
                // });
                // this.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
                // this.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
                // this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
                // this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;
                this.msgBoxServ.showMessage("failed", ["don't have voucher details"]);
                this.ledgerResult = null;
              }
              else {
                this.msgBoxServ.showMessage("failed", ["No Records for selected dates."]);
                this.ledgerResult = null;

              }
              this.BalanceCalculation();
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            }
          });

      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  
  BalanceCalculation() {
    if (this.ledgerResult && this.ledgerResult.length > 0) {

      //this sort is for TransactionDate ASCENDING..
      this.ledgerResult.sort(function (a, b) {
        if (a.TransactionDate > b.TransactionDate) return 1;
        if (a.TransactionDate < b.TransactionDate) return -1;
        return 0;
      });
      var openingBal = (this.ledgerResult.OpeningBalanceDrAmount > 0) ? this.ledgerResult.OpeningBalanceDrAmount : this.ledgerResult.OpeningBalanceCrAmount;
      var balanceType = (this.ledgerResult.OpeningBalanceDrAmount > 0) ? "DR" : (this.ledgerResult.OpeningBalanceCrAmount > 0) ? "CR" : "NA";

      var lastBalance = openingBal;
      var lastTypeDr = balanceType;
      for (var i = 0; i < this.ledgerResult.length; i++) {
        if (lastTypeDr == "NA") {//if opening balance DR and CR same (i.e. both zero, both same amount) then drcr may be clitical to define
          if (this.ledgerResult[i].DrCr == true) {
            lastBalance = lastBalance + this.ledgerResult[i].Amount;
            this.ledgerResult[i].Balance = lastBalance;
            lastTypeDr = "DR";
            this.ledgerResult[i].BalanceType = true;
          }
          else {
            this.ledgerResult[i].Balance = (lastBalance > this.ledgerResult[i].Amount) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
            lastTypeDr = (lastBalance > this.ledgerResult[i].LedgerCr) ? lastTypeDr : "CR";
            lastBalance = this.ledgerResult[i].Balance;
            this.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;

          }
        }
        else if (lastTypeDr == "DR") {//debit record transaction
          if (this.ledgerResult[i].DrCr == true) {
            lastBalance = lastBalance + this.ledgerResult[i].Amount;
            this.ledgerResult[i].Balance = lastBalance;
            lastTypeDr = "DR";
            this.ledgerResult[i].BalanceType = true;
          }
          else {
            this.ledgerResult[i].Balance = (lastBalance > this.ledgerResult[i].Amount) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
            lastTypeDr = (lastBalance > this.ledgerResult[i].Amount) ? lastTypeDr : "CR";
            lastBalance = this.ledgerResult[i].Balance;
            this.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;
          }
        }
        else if (lastTypeDr == "CR") {///Credit record calculation here
          if (this.ledgerResult[i].DrCr == false) {
            lastBalance = lastBalance + this.ledgerResult[i].Amount;
            this.ledgerResult[i].Balance = lastBalance;
            lastTypeDr = "CR";
            this.ledgerResult[i].BalanceType == false;
          } else if (this.ledgerResult[i].DrCr == true) {
            var ll = (this.ledgerResult[i].Amount < lastBalance) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
            lastTypeDr = (this.ledgerResult[i].Amount > lastBalance) ? "DR" : lastTypeDr;
            lastBalance = ll;
            this.ledgerResult[i].Balance = lastBalance;
            this.ledgerResult[i].BalanceType = (lastTypeDr == "DR") ? true : false;

          }
        }

        let flag = (lastTypeDr == "DR") ? true : false;
        this.ledgerResult[i].BalanceType = flag;
      }

    }
  }
  public GetReconciliationCategory() {
            try {
      this.accReportBLService.GetReconciliationCategory()
        .subscribe(res => {
          if (res.Status == "OK") {
            this.bankReconcCategory = res.Results;
          }
        });
    }
    catch (ex) {

    }
  }
  onbalanceTypeChange(value, i) {
    this.ledgerResult[i].DrCr =value;
    this.calculateDifference(i);
  }

  calculateDifference(i) {
    let diff;
    let bankBalance =  +this.ledgerResult[i].BankBalance.toString().replace(/,/g, ''); 

    if (bankBalance > this.ledgerResult[i].Balance) {
      diff = bankBalance - this.ledgerResult[i].Balance;
    }
    else {
      diff = (bankBalance == this.ledgerResult[i].Balance) ? 0 : this.ledgerResult[i].Balance - bankBalance;
    }

    this.ledgerResult[i].Difference = (diff > 0) ? diff : 0;
    this.ledgerResult[i].Difference=(bankBalance>0) ? diff:null;

  }

  onCategoryChange(value, i) {
    this.ledgerResult[i].CategoryId = +value;
  }

  changeDate(event, i) {
    this.ledgerResult[i].BankTransactionDate = event.target.value;
  }
  dateChanged(selecteddate, i) {
    this.ledgerResult[i].BankTransactionDate = selecteddate;
  }
  checkValue(event: any, i) {
    if (event.currentTarget.checked) {
      this.ledgerResult.IsVerified = true;
      this.bankHistory[i].IsVerified = true;
      this.disableViewBtn = false;
    }
    else {
      this.ledgerResult.IsVerified = false;
      this.bankHistory[i].IsVerified = false;
      this.disableViewBtn = true;
    }

  }

  public submitted:boolean= false;
  Save() {
    this.submitted = true;

    let data = this.ledgerResult.filter(l => l.IsVerified == true);
    if (data.length == 0) {
      this.msgBoxServ.showMessage('Error', ['Select txn first to save']);
    }
    else {
      data.forEach(itm => {
        if (itm.BankBalance == null || itm.BankBalance == 0) {
          this.submitted = false;
          return;
        }
      });
      if (this.submitted) {
        this.ledgerResult.forEach(ele => {
          if(ele.IsVerified){
              var his = this.bankHistory.filter(a => a.HospitalId == ele.HospitalId && a.LedgerId == ele.LedgerId && a.IsVerified == true);
              if(!!his && ele.BankReconciliationTxn){
                var sameRec = his.find(a => a.BankReconciliationTxn.CategoryId == ele.CategoryId && a.BankReconciliationTxn.BankBalance==ele.BankBalance
                  && a.BankReconciliationTxn.Difference==ele.Difference)
                  if(!!sameRec){
                    this.showSavePopup = false;
                  }
                  else{
                  this.bankrecList.push(ele);
                  this.showSavePopup = true;
                  }
              }
              else{
                this.bankrecList.push(ele);
                this.showSavePopup = true;
              }
          }
         
        })
      }
    }
  }

  closesavePopup() {
    this.showSavePopup = false;
    this.remark = '';
  }
  saveReconcilation() {
    if (this.remark.length > 0) {


      try {
        this.bankrecList = this.ledgerResult.filter(led => led.IsVerified);
        this.bankrecList.forEach(itm => {
          itm.Remark = this.remark;
        });
                this.accReportBLService.PostReconciliation(this.bankrecList)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.closesavePopup();
              this.msgBoxServ.showMessage('Success', ['Saved']);
              this.GetTxnList();
            }
            else {
              this.msgBoxServ.showMessage('Error', ['Something wrong']);
              this.closesavePopup();
            }
          });
  
        }
      catch (ex) {
        this.ShowCatchErrMessage(ex);
        this.closesavePopup();
      }

    }
    else {
      this.msgBoxServ.showMessage('Warning', ['Please enter remark']);
    }
  }

  public GetTxnItem(i) {
    try {
      let txn = this.ledgerResult[i];

      this.accBLService.GetTransactionbyVoucher(txn.VoucherNumber, txn.SectionId, txn.FiscalYearId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.txnItems = res.Results.txnList;
            this.selectedTxn = this.ledgerResult[i];
            this.selectedTxn.BankBalance = +this.ledgerResult[i].BankBalance;
            this.showDetails = true;
          }
          else {
            this.msgBoxServ.showMessage("failed", ['Invalid Transaction Id.']);
            console.log(res.ErrorMessage)
            this.showDetails = false;
          }

        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
      this.showDetails = false;
    }
  }

  ClosetxnDetails() {
    this.showDetails = false;
    this.selectedTxn = null;
    this.showDetailView =false;
    this.historyPopup = false;
  }

  PrintTxnView() {
    try {
      this.showPrint = false;
      this.printDetaiils = null;
      this.changeDetector.detectChanges();
      this.showPrint = true;
      this.printDetaiils = document.getElementById("excelTransactionView");
      //this.ClosetxnDetails();

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  PrintTxnTable(tableId) {
    // try {
    //   this.showPrint = false;
    //   this.printDetaiils = null;
    //   this.changeDetector.detectChanges();
    //   this.showPrint = true;
    //   this.printDetaiils = document.getElementById("printpage");

    // } catch (ex) {
    //   this.ShowCatchErrMessage(ex);
    // }
    this.accountingService.Print(tableId,this.dateRange);
  }


  ExportToExcel(tableId) {
    // if (tableId) {
    //   let workSheetName = 'Bank Reconciliation Report';
    //   let Heading = this.selLedger.LedgerName + ' Report';
    //   let filename = 'Bank_Reconciliation_Report';
    //   CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName, Heading, filename);
    // }
    this.accountingService.ExportToExcel(tableId,this.dateRange);
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
  public reconciliationDetails:any;
  ViewDetails(){
    this.showDetailView=true;
    this.reconciliationDetails= this.ledgerResult.filter(r => r.BankReconciliationTxn !=null)
   
  }
  public voucherNo:string;
  GetReconciliationHistory(i){
    let bank = this.bankHistory[i];
    this.accReportBLService.GetReconciliationHistory(bank.VoucherNumber,bank.SectionId, bank.FiscalYearId )
    .subscribe(res => {
      if (res.Status == "OK") {
       
        this.txnHistory = res.Results;
       if(this.txnHistory.length>0){
        this.voucherNo = this.txnHistory[0].VoucherNumber
       }
        this.historyPopup=true;
        this.changeDetector.detectChanges();
        let categoriesList = this.bankReconcCategory;
                this.txnHistory.forEach(function (e) {
                  if (typeof e === "object") {
                    e["VoucherNumber"] =e.VoucherNumber;
                    e["CategoryId"] = e.CategoryId;
                    if(e.CategoryId>0){
                        e["CategoryName"] = categoriesList.find(a=> a.CategoryId == e.CategoryId).CategoryName;
               
                    }

                    }
                  
                });

      }
      else {
        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        console.log(res.ErrorMessage);

        this.historyPopup=false;
      }
    });  
  }

  showVoucherHead() {
    let Accountheadshow = this.coreService.Parameters.find(a => a.ParameterName == "ShowAccountHeadInVoucher" && a.ParameterGroupName == "Accounting").ParameterValue;
    if (Accountheadshow == "true") {
      this.showVoucherHeadCol = true;
    }
    else {
      this.showVoucherHeadCol = false;
    }
  }
}
