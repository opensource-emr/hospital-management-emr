import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_ACC_VoucherCode, ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { AccountingReportsBLService } from '../../reports/shared/accounting-reports.bl.service';
import { BankReconciliationAdditionalTransaction_DTO } from '../../settings/shared/dto/bank-reconciliation-additional-txn.dto';
import { LedgerModel } from '../../settings/shared/ledger.model';
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { AccountingService } from '../../shared/accounting.service';
import { Voucher } from '../../transactions/shared/voucher';
import { BankReconciliationCategory, BankReconcliationModelNew } from './bank-reconciliation.model';

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
  public selLedger: LedgerModel = new LedgerModel();
  public ledgerResult: Array<BankReconcliationModelNew> = new Array<BankReconcliationModelNew>();
  public originalLedgerResult: Array<BankReconcliationModelNew> = new Array<BankReconcliationModelNew>();
  public voucherTypeList: Array<Voucher> = new Array<Voucher>();
  public selectedVoucher: Voucher = new Voucher();
  public reconcile_Status_Open: boolean = true;
  public reconcile_Status_Close: boolean = false;
  public enum_Reconcile_Status: typeof ENUM_Reconcile_Status = ENUM_Reconcile_Status;
  public extraTransactions: Array<BankReconciliationAdditionalTransaction_DTO> = new Array<BankReconciliationAdditionalTransaction_DTO>();
  public bankReconcCategory: Array<BankReconciliationCategory> = new Array<BankReconciliationCategory>();
  public bankrecList: Array<BankReconcliationModelNew> = new Array<BankReconcliationModelNew>();
  public disableViewBtn: boolean = true;
  public calType: string = '';
  public txnItems: any;
  public showSavePopup: boolean = false;
  public showDetails: boolean = false;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public selectedTxn: any;
  public remark: string = '';
  public showPrint: boolean = false;
  public printDetaiils: any;
  public bankHistory: any;
  public showDetailView: boolean = false;
  public historyPopup: boolean = false;
  public txnHistory: any;
  public showVoucherHeadCol: boolean = false;
  public dateRange: string = '';

  public openingBalance = {
    ReconcileOpening: 0
  }
  public bank_Opening_Balance: number = 0;
  public bank_Closing_Balance: number = 0;
  public txn_Sum: number = 0;
  public showAdditionalTxnPopUp: boolean = false;
  public bankReconciliationAdditionalTxn: BankReconciliationAdditionalTransaction_DTO = new BankReconciliationAdditionalTransaction_DTO();
  public selectedBankReconciliationCategory: BankReconciliationCategory = new BankReconciliationCategory();

  constructor(public accReportBLService: AccountingReportsBLService, public coreService: CoreService,
    public msgBoxServ: MessageboxService, public accBLService: AccountingBLService,
    public changeDetector: ChangeDetectorRef, private formBuilder: FormBuilder,
    public accountingService: AccountingService,) {
    this.calType = "en,np";
    this.GetLedgers();
    this.GetReconciliationCategory();
    this.showVoucherHead();
    this.accountingService.getCoreparameterValue();
    this.voucherTypeList = this.accountingService.accCacheData.VoucherType.filter(a => a.VoucherCode === ENUM_ACC_VoucherCode.PaymentVoucher || a.VoucherCode === ENUM_ACC_VoucherCode.ReceiptVoucher || a.VoucherCode === ENUM_ACC_VoucherCode.ContraVoucher);
  }

  ngOnInit() {
  }

  public GetLedgers() {
    if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length > 0) {
      let codeDetail = this.accountingService.accCacheData.CodeDetails.find(a => a.Code === '022' && a.Description === 'LedgerGroupName');
      if (codeDetail) {
        let ledgerGroup = this.accountingService.accCacheData.LedgerGroups.find(a => a.Name === codeDetail.Name);
        if (ledgerGroup) {
          this.ledgerList = this.accountingService.accCacheData.Ledgers.filter(a => a.LedgerGroupId === ledgerGroup.LedgerGroupId);
        }
      }
      this.ledgerList = this.ledgerList.slice();
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

    if (!this.selLedger || typeof (this.selLedger) !== ENUM_Data_Type.Object || this.selLedger.LedgerId <= 0) {
      this.selLedger = undefined;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select at least one bank ledger."]);
      return false;
    }
    else
      return true;
  }
  checkDateValidation() {
    let flag = true;
    if (!this.validDate) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ['Please select valid date range.']);
      flag = false;
    }
    return flag;
  }

  public GetTxnList() {
    this.ledgerResult = null;
    try {
      if (this.CheckSelLedger() && this.checkDateValidation()) {
        let num = this.FilterReconcileData();
        this.accReportBLService.GetBankReconcillationReport(Number(this.selLedger.LedgerId), this.fromDate, this.toDate, this.fiscalYearId, this.selectedVoucher.VoucherId, num)
          .subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.openingBalance.ReconcileOpening = res.Results.ReconcileOpening[0].ReconcileOpeningBalance;
              this.ledgerResult = this.originalLedgerResult = res.Results.TransactionData;
              if (this.ledgerResult.length <= 0) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["There is no transactions related to this bank in selected date range."]);
              }
              // if (res.Results.VouchersWithReconciliation.length) {
              //   let CrTotalAmt = 0;
              //   let DrTotalAmt = 0;
              //   let OpeningBalanceAmt = 0;
              //   let OpeningBalanceDrAmt;
              //   let OpeningBalanceCrAmt;
              //   // this.IsOpeningBalance = false;
              //   this.ledgerResult = res.Results.VouchersWithReconciliation;
              //   this.bankHistory=JSON.parse(JSON.stringify(this.ledgerResult));
              //    let categoriesList = this.bankReconcCategory;


              //   this.ledgerResult.forEach(function (e) {
              //     if (typeof e === "object") {
              //       e["BankBalance"] = (e.BankReconciliationTxn== null)? null: e.BankReconciliationTxn.BankBalance;
              //       e["CategoryId"] = (e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.CategoryId;
              //       if(e.CategoryId>0){
              //           e["CategoryName"] = categoriesList.find(a=> a.CategoryId == e.BankReconciliationTxn.CategoryId).CategoryName;

              //       }
              //       e["Difference"] =(e.BankReconciliationTxn== null)? null: e.BankReconciliationTxn.Difference;
              //       e["BankTransactionDate"] = e.BankTransactionDate;
              //       e['TransactionDateBsAd'] = e.TransactionDate;
              //       e["bankBalanceType"] = e.DrCr;
              //       e["VoucherNumber"] = e.VoucherNumber;
              //       e["BankTransactionDate"] = e.BankTransactionDate;
              //       e["DrCr"]= (e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.DrCr
              //       e["Remark"]=(e.BankReconciliationTxn== null)? null:e.BankReconciliationTxn.Remark
              //       e["LedgerDr"]= e.LedgerDr ;
              //       e["LedgerCr"]=e.LedgerCr;
              //       }

              //   });

              // this.ledgerResult.forEach(a => {
              //     a.DrCr ? DrTotalAmt += a.Amount : CrTotalAmt += a.Amount;
              //     OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
              //     a.OpeningBalanceType ? OpeningBalanceDrAmt = a.OpeningBalance + a.AmountDr - a.AmountCr : OpeningBalanceCrAmt = a.OpeningBalance + a.AmountCr - a.AmountDr;
              //   })
              //   if (OpeningBalanceDrAmt < 0) {
              //     OpeningBalanceCrAmt = -OpeningBalanceDrAmt;
              //     OpeningBalanceDrAmt = null;
              //   }
              //   if (OpeningBalanceCrAmt < 0) {
              //     OpeningBalanceDrAmt = -OpeningBalanceCrAmt;
              //     OpeningBalanceCrAmt = null;
              //   }
              //   this.ledgerResult.DrTotalAmount = DrTotalAmt;
              //   this.ledgerResult.CrTotalAmount = CrTotalAmt;

              //   this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
              //   this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;

              //   // Calculating Debit total amount and credit total amount
              //   if (this.ledgerResult.DrTotalAmount > this.ledgerResult.CrTotalAmount) {
              //     if (this.ledgerResult.OpeningBalanceDrAmount > this.ledgerResult.OpeningBalanceCrAmount) {
              //       this.ledgerResult.DrNetAmount = this.ledgerResult.DrTotalAmount - this.ledgerResult.CrTotalAmount + this.ledgerResult.OpeningBalanceDrAmount;
              //     }
              //     else {
              //       this.ledgerResult.DrNetAmount = this.ledgerResult.DrTotalAmount - this.ledgerResult.CrTotalAmount - this.ledgerResult.OpeningBalanceCrAmount;
              //     }
              //     if (this.ledgerResult.DrNetAmount < 0) {
              //       this.ledgerResult.CrNetAmount = - this.ledgerResult.DrNetAmount;
              //       this.ledgerResult.DrNetAmount = null;
              //     }
              //   }
              //   else {
              //     if (this.ledgerResult.OpeningBalanceDrAmount < this.ledgerResult.OpeningBalanceCrAmount) {
              //       this.ledgerResult.CrNetAmount = this.ledgerResult.CrTotalAmount - this.ledgerResult.DrTotalAmount + this.ledgerResult.OpeningBalanceCrAmount;
              //     }
              //     else {
              //       this.ledgerResult.CrNetAmount = this.ledgerResult.CrTotalAmount - this.ledgerResult.DrTotalAmount - this.ledgerResult.OpeningBalanceDrAmount;
              //     }
              //     if (this.ledgerResult.CrNetAmount < 0) {
              //       this.ledgerResult.DrNetAmount = - this.ledgerResult.CrNetAmount;
              //       this.ledgerResult.CrNetAmount = null;
              //     }
              //   }

              //   this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
              //   this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;
              // }
              // else if (res.Results.dataList.length) {
              //   // this.ledgerResult = res.Results.dataList;
              //   // // this.IsOpeningBalance = true;
              //   // let OpeningBalanceAmt = 0;
              //   // let OpeningBalanceDrAmt;
              //   // let OpeningBalanceCrAmt;
              //   // this.ledgerResult.forEach(a => {
              //   //   OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
              //   //   (a.AmountDr >= a.AmountCr) ? OpeningBalanceDrAmt = a.AmountDr - a.AmountCr : OpeningBalanceCrAmt = a.AmountCr - a.AmountDr;
              //   // });
              //   // this.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
              //   // this.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
              //   // this.ledgerResult.OpeningBalanceDrAmount = OpeningBalanceDrAmt;
              //   // this.ledgerResult.OpeningBalanceCrAmount = OpeningBalanceCrAmt;
              //   this.msgBoxServ.showMessage("failed", ["don't have voucher details"]);
              //   this.ledgerResult = null;
              // }
              // else {
              //   this.msgBoxServ.showMessage("failed", ["No Records for selected dates."]);
              //   this.ledgerResult = null;

              // }
              // this.BalanceCalculation();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
            }
          });

      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  BalanceCalculation() {
    // if (this.ledgerResult && this.ledgerResult.length > 0) {

    //   //this sort is for TransactionDate ASCENDING..
    //   this.ledgerResult.sort(function (a, b) {
    //     if (a.TransactionDate > b.TransactionDate) return 1;
    //     if (a.TransactionDate < b.TransactionDate) return -1;
    //     return 0;
    //   });
    //   var openingBal = (this.ledgerResult.OpeningBalanceDrAmount > 0) ? this.ledgerResult.OpeningBalanceDrAmount : this.ledgerResult.OpeningBalanceCrAmount;
    //   var balanceType = (this.ledgerResult.OpeningBalanceDrAmount > 0) ? "DR" : (this.ledgerResult.OpeningBalanceCrAmount > 0) ? "CR" : "NA";

    //   var lastBalance = openingBal;
    //   var lastTypeDr = balanceType;
    //   for (var i = 0; i < this.ledgerResult.length; i++) {
    //     if (lastTypeDr == "NA") {//if opening balance DR and CR same (i.e. both zero, both same amount) then drcr may be clitical to define
    //       if (this.ledgerResult[i].DrCr == true) {
    //         lastBalance = lastBalance + this.ledgerResult[i].Amount;
    //         this.ledgerResult[i].Balance = lastBalance;
    //         lastTypeDr = "DR";
    //         this.ledgerResult[i].BalanceType = true;
    //       }
    //       else {
    //         this.ledgerResult[i].Balance = (lastBalance > this.ledgerResult[i].Amount) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
    //         lastTypeDr = (lastBalance > this.ledgerResult[i].LedgerCr) ? lastTypeDr : "CR";
    //         lastBalance = this.ledgerResult[i].Balance;
    //         this.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;

    //       }
    //     }
    //     else if (lastTypeDr == "DR") {//debit record transaction
    //       if (this.ledgerResult[i].DrCr == true) {
    //         lastBalance = lastBalance + this.ledgerResult[i].Amount;
    //         this.ledgerResult[i].Balance = lastBalance;
    //         lastTypeDr = "DR";
    //         this.ledgerResult[i].BalanceType = true;
    //       }
    //       else {
    //         this.ledgerResult[i].Balance = (lastBalance > this.ledgerResult[i].Amount) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
    //         lastTypeDr = (lastBalance > this.ledgerResult[i].Amount) ? lastTypeDr : "CR";
    //         lastBalance = this.ledgerResult[i].Balance;
    //         this.ledgerResult[i].BalanceType = (lastTypeDr == "CR") ? false : true;
    //       }
    //     }
    //     else if (lastTypeDr == "CR") {///Credit record calculation here
    //       if (this.ledgerResult[i].DrCr == false) {
    //         lastBalance = lastBalance + this.ledgerResult[i].Amount;
    //         this.ledgerResult[i].Balance = lastBalance;
    //         lastTypeDr = "CR";
    //         this.ledgerResult[i].BalanceType == false;
    //       } else if (this.ledgerResult[i].DrCr == true) {
    //         var ll = (this.ledgerResult[i].Amount < lastBalance) ? lastBalance - this.ledgerResult[i].Amount : this.ledgerResult[i].Amount - lastBalance;
    //         lastTypeDr = (this.ledgerResult[i].Amount > lastBalance) ? "DR" : lastTypeDr;
    //         lastBalance = ll;
    //         this.ledgerResult[i].Balance = lastBalance;
    //         this.ledgerResult[i].BalanceType = (lastTypeDr == "DR") ? true : false;

    //       }
    //     }

    //     let flag = (lastTypeDr == "DR") ? true : false;
    //     this.ledgerResult[i].BalanceType = flag;
    //   }

    // }
  }
  public GetReconciliationCategory() {
    try {
      this.accReportBLService.GetReconciliationCategory()
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.bankReconcCategory = res.Results;
            this.bankReconcCategory.forEach(con => {
              con.IsSelected = false;
            });
            this.bankReconcCategory = this.bankReconcCategory.filter(a => a.MappedLedgerId !== null);
          }
        });
    }
    catch (ex) {

    }
  }
  onbalanceTypeChange(value, i) {
    this.ledgerResult[i].DrCr = value;
    this.calculateDifference(i);
  }

  calculateDifference(i) {
    // let diff;
    // let bankBalance =  +this.ledgerResult[i].BankBalance.toString().replace(/,/g, ''); 

    // if (bankBalance > this.ledgerResult[i].Balance) {
    //   diff = bankBalance - this.ledgerResult[i].Balance;
    // }
    // else {
    //   diff = (bankBalance == this.ledgerResult[i].Balance) ? 0 : this.ledgerResult[i].Balance - bankBalance;
    // }

    // this.ledgerResult[i].Difference = (diff > 0) ? diff : 0;
    // this.ledgerResult[i].Difference=(bankBalance>0) ? diff:null;

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
      this.ledgerResult[i].IsVerified = true;
      // this.bankHistory[i].IsVerified = true;
      // this.disableViewBtn = false;
    }
    else {
      this.ledgerResult[i].IsVerified = false;
      // this.bankHistory[i].IsVerified = false;
      // this.disableViewBtn = true;
    }

  }

  public submitted: boolean = false;
  Save() {
    this.submitted = true;
    let data = this.ledgerResult.filter(l => l.IsVerified == true);
    if (data.length == 0) {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Please select at least one transaction.']);
    }
    else {
      if (this.openingBalance.ReconcileOpening !== this.bank_Opening_Balance) {
        this.submitted = false;
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please review Opening Balance of Book and Bank, It should be matched before reconciliation."]);
        return;
      }

      let sum = 0;
      if (this.extraTransactions.length > 0) {
        sum = this.extraTransactions.reduce((a, b) => a + (b.DrCr == true ? b.Amount : -b.Amount), 0);
      }
      sum += data.reduce((a, b) => a + (b.DrCr == true ? b.LedgerDr : -b.LedgerCr), 0);

      if (this.bank_Opening_Balance + sum !== this.bank_Closing_Balance) {
        this.submitted = false;
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please review Closing Balance of Book and Bank, It should be matched before reconciliation."]);
        return;
      }
      if (this.submitted) {
        this.ledgerResult.forEach(ele => {
          if (ele.IsVerified) {
            // var his = this.bankHistory.filter(a => a.HospitalId == ele.HospitalId && a.LedgerId == ele.LedgerId && a.IsVerified == true);
            // if(!!his && ele.BankReconciliationTxn){
            //   var sameRec = his.find(a => a.BankReconciliationTxn.CategoryId == ele.CategoryId && a.BankReconciliationTxn.BankBalance==ele.BankBalance
            //     && a.BankReconciliationTxn.Difference==ele.Difference)
            //     if(!!sameRec){
            //       this.showSavePopup = false;
            //     }
            //     // else{
            //     this.bankrecList.push(ele);
            //     this.showSavePopup = true;
            //     // }
            // }
            // else{
            this.bankrecList.push(ele);
            this.showSavePopup = true;
            // }
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

        let postData = {
          BankReconciliation: this.bankrecList,
          AdditionalTransaction: this.extraTransactions
        }
        this.accReportBLService.PostReconciliation(postData)
          .subscribe(res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.closesavePopup();
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Bank Reconciliation Is Saved.']);
              this.bank_Opening_Balance = 0;
              this.bank_Closing_Balance = 0;
              this.extraTransactions = [];
              this.CloseAdditionalTxnPopUp();
              this.GetTxnList();
            }
            else {
              this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Something wrong']);
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
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ['Please enter remark']);
    }
  }

  public GetTxnItem(i) {
    try {
      let txn = this.ledgerResult[i];

      this.accBLService.GetTransactionbyVoucher(txn.VoucherNumber, txn.SectionId, txn.FiscalYearId)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.txnItems = res.Results.txnList;
            this.selectedTxn = this.ledgerResult[i];
            this.selectedTxn.BankBalance = +this.ledgerResult[i].BankBalance;
            this.showDetails = true;
          }
          else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Invalid Transaction Id.']);
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
    this.showDetailView = false;
    this.historyPopup = false;
  }

  CloseAdditionalTxnPopUp() {
    this.bankReconcCategory.forEach(a => {
      a.IsSelected = false;
      a.Amount = 0;
    });
    this.showAdditionalTxnPopUp = false;
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
    this.accountingService.Print(tableId, this.dateRange);
  }


  ExportToExcel(tableId) {
    // if (tableId) {
    //   let workSheetName = 'Bank Reconciliation Report';
    //   let Heading = this.selLedger.LedgerName + ' Report';
    //   let filename = 'Bank_Reconciliation_Report';
    //   CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName, Heading, filename);
    // }
    this.accountingService.ExportToExcel(tableId, this.dateRange);
  }

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  public reconciliationDetails: any;
  ViewDetails() {
    this.txn_Sum = 0;
    this.showDetailView = true;
    let data = this.reconciliationDetails = this.ledgerResult.filter(r => r.IsVerified == true);
    this.txn_Sum = data.reduce((a, b) => a + (b.DrCr == true ? b.LedgerDr : -b.LedgerCr), 0);
    if (this.extraTransactions.length > 0) {
      this.txn_Sum += this.extraTransactions.reduce((a, b) => a + (b.DrCr == true ? b.Amount : -b.Amount), 0);
    }
  }

  public ShowAdditionalTransactions() {
    this.showAdditionalTxnPopUp = false;
    this.changeDetector.detectChanges();
    this.showAdditionalTxnPopUp = true;
    this.FocusOnInputField("additional_txn_DrCr");
  }

  public voucherNo: string;
  GetReconciliationHistory(i) {
    let bank = this.bankHistory[i];
    this.accReportBLService.GetReconciliationHistory(bank.VoucherNumber, bank.SectionId, bank.FiscalYearId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {

          this.txnHistory = res.Results;
          if (this.txnHistory.length > 0) {
            this.voucherNo = this.txnHistory[0].VoucherNumber
          }
          this.historyPopup = true;
          this.changeDetector.detectChanges();
          let categoriesList = this.bankReconcCategory;
          this.txnHistory.forEach(function (e) {
            if (typeof e === "object") {
              e["VoucherNumber"] = e.VoucherNumber;
              e["CategoryId"] = e.CategoryId;
              if (e.CategoryId > 0) {
                e["CategoryName"] = categoriesList.find(a => a.CategoryId == e.CategoryId).CategoryName;
              }
            }
          });
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
          console.log(res.ErrorMessage);
          this.historyPopup = false;
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

  public VoucherListFormatter(data: Voucher): string {
    return data["VoucherName"];
  }

  public ProcessEnterKeySequence(index: number) {
    if (this.ledgerResult[index].BankRefNumber) {
      this.ledgerResult[index].IsVerified = (this.ledgerResult[index].Status === this.enum_Reconcile_Status.Open) ? true : false;
      if (this.ledgerResult && this.ledgerResult.length > index) {
        let ind = this.ledgerResult.findIndex(a => a.Status === this.enum_Reconcile_Status.Open && a.IsVerified == false);
        if (ind >= 0) {
          this.coreService.FocusInputById(`Bank_Ref_No_${ind}`);
        }
        else {
          this.coreService.FocusInputById(`btn_BankReconcilliation_Preview`);
        }
      }
    }
  }

  public HandleBankRefNumber(index: number) {
    if (!this.ledgerResult[index].BankRefNumber) {
      this.ledgerResult[index].IsVerified = false;
    }
  }

  public FilterReconcileData(): number {
    if (this.reconcile_Status_Open && this.reconcile_Status_Close) {
      return 0;
    }
    else if (this.reconcile_Status_Open) {
      return 1;
    }
    else if (this.reconcile_Status_Close) {
      return 2;
    }
    else {
      return -1;
    }
  }

  public SaveAdditionalTxn() {
    this.showAdditionalTxnPopUp = false;
  }

  public ProcessAdditionlTxnEnterKeySequence(index: number) {
    if (this.bankReconcCategory[index].Amount) {
      this.bankReconcCategory[index].IsSelected = true;
      if (this.bankReconcCategory && this.bankReconcCategory.length > index) {
        let ind = this.bankReconcCategory.findIndex(a => a.IsSelected == false);
        if (ind >= 0) {
          this.coreService.FocusInputById(`additionTxn_Amount_${ind + 1}`);
        }
        else {
          this.coreService.FocusInputById(`btn_BankReconcilliation_SaveAdditionalTxn`);
        }
      }
    }
  }

  public HandleAdditionalAmountNumber(index: number) {
    if (!this.bankReconcCategory[index].Amount) {
      this.bankReconcCategory[index].IsSelected = false;
    }
  }

  public AddAdditionalTxn() {
    if (this.selectedBankReconciliationCategory && this.selectedBankReconciliationCategory.CategoryId > 0 && this.bankReconciliationAdditionalTxn.Amount > 0) {
      this.bankReconciliationAdditionalTxn.CategoryName = this.selectedBankReconciliationCategory.CategoryName;
      this.bankReconciliationAdditionalTxn.LedgerId = this.selectedBankReconciliationCategory.MappedLedgerId;
      this.bankReconciliationAdditionalTxn.SubLedgerId = this.selectedBankReconciliationCategory.SubLedgerId;
      this.extraTransactions.push(this.bankReconciliationAdditionalTxn);
      this.bankReconciliationAdditionalTxn = new BankReconciliationAdditionalTransaction_DTO();
      this.selectedBankReconciliationCategory = new BankReconciliationCategory();
      this.FocusOnInputField("additional_txn_DrCr");
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, [`Please select bank reconciliation category and provide valid transaction amount.`]);
    }
  }

  public DiscardAdditionalTxn() {
    this.extraTransactions = [];
    this.CloseAdditionalTxnPopUp();
  }

  public FocusOnInputField(id: string) {
    this.coreService.FocusInputById(id);
  }

  public RemoveExtraTransaction(index: number) {
    this.extraTransactions.splice(index, 1);
  }
}

export enum ENUM_Reconcile_Status {
  Open = "open",
  Close = "close"
}
