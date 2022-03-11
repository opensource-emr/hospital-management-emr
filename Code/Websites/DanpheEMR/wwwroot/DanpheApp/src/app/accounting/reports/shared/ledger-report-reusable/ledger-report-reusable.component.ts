import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { AccountingReportsBLService } from '../../shared/accounting-reports.bl.service';
import GridColumnSettings from '../../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../../shared/common.functions";
import { AccountingService } from '../../../shared/accounting.service';

import { CoreService } from "../../../../core/shared/core.service";
import { FiscalYearModel } from "../../../../accounting/settings/shared/fiscalyear.model";
@Component({
  selector: 'ledger-report-reusable',
  templateUrl: './ledger-report-reusable.html',
  host: { '(window:keyup)': 'hotkeys($event)' },
})
export class LedgerReportResuableComponent {
  public ledgerResult: any;
  // public ledgerList: Array<{ LedgerId: number, LedgerName: string }> = [];
  public fiscalyearList: Array<FiscalYearModel> = new Array<FiscalYearModel>(); //mumbai-team-june2021-danphe-accounting-cache-change
  //public selLedger: { LedgerId, LedgerName } = null;
  public selFiscalYear: { FiscalYearId, FiscalYearName, StartDate, EndDate, IsActive } = null;
  public txnGridColumns: Array<any> = null;
  public IsOpeningBalance: boolean = false;
  public transactionId: number = null;
  public selectedFiscalYear: any;
  public IsActive: boolean = true;
  public IsDetailsView: boolean = true;
  public showLedgerDetail: boolean = false;
  public voucherNumber: string = null;
  public actionView: boolean = true;
  public todayDate: string = null;
  public fromDate: any;
  public toDate: any;
  public ledgerId: number;
  public ledgerName: string;
  public ledgerCode: string;
  public showTxnItemLevel: string = 'true'; //default value is true
  public showPrint: boolean = false;
  public printDetaiils: any;
  public fiscalYearId:number;
  public showExportbtn: boolean = false;
  @Input('ledgerId')
  public set setLedId(_ledId) {
    this.ledgerId = _ledId;
  }
  @Input('ledgerCode')
  public set setLedCode(_ledCode) {
    this.ledgerCode = _ledCode;
  }
  @Input('ledgerName')
  public set setledName(_ledName) {
    this.ledgerName = _ledName;
  }
  @Input('fromDate')
  public set setfromDate(_frmDate) {
    this.fromDate = _frmDate;
  }
  @Input('toDate')
  public set settoDate(_toDate) {
    this.toDate = _toDate;
  }
  @Input("FiscalYearId")
  public set fiscalyear(_fiscalyearid) {
    if(_fiscalyearid){
      this.fiscalYearId = _fiscalyearid;
    }
  }
  @Input('showLedgerDetail')
  public set showLedgerDetails(_showDetails) {
    this.showLedgerDetail = _showDetails;
    this.todayDate = moment().format('YYYY-MM-DD');
    if (this.showLedgerDetail) {
      this.GetTxnList();
    }
  }

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(
    public accReportBLService: AccountingReportsBLService,
    public accountingService: AccountingService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreservice: CoreService) {
    //this.fromDate = moment().format('YYYY-MM-DD');
    //this.toDate = moment().format('YYYY-MM-DD');
    //this.txnGridColumns = GridColumnSettings.LedgerTransactionList;
    //this.GetLedgers();
    this.AssignCoreParameterValue();
    this.GetFiscalYears();
    this.showExport();   
  }
  AssignCoreParameterValue() {
    var showTxnItemLevelPar = this.coreservice.Parameters.filter(p => p.ParameterGroupName.toLowerCase() == "accounting" && p.ParameterName == "ShowLedgerReportTxnItemLevel");
    this.showTxnItemLevel = (showTxnItemLevelPar.length > 0) ? showTxnItemLevelPar[0].ParameterValue : 'true';

  }
  //public GetLedgers() {
  //    this.accReportBLService.GetLedgers()
  //        .subscribe(res => {
  //            if (res.Status == "OK") {
  //                this.ledgerList = res.Results;
  //            }
  //            else {
  //                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //            }

  //        });
  //}

  public GetFiscalYears() {
    if (this.accountingService.accCacheData.FiscalYearList && this.accountingService.accCacheData.FiscalYearList.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
      this.fiscalyearList = this.accountingService.accCacheData.FiscalYearList; //mumbai-team-june2021-danphe-accounting-cache-change
      this.fiscalyearList = this.fiscalyearList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      this.selFiscalYear = this.fiscalyearList.find(x => x.IsActive == true);
    }
  }

  DisplayParticular() {
    this.IsDetailsView = (this.IsDetailsView == true) ? false : true;
    //this.IsDetailsView = true;
  }
  ChangeFiscalYear() {
    this.selFiscalYear = this.fiscalyearList.find(x => x.FiscalYearId == parseInt(this.selectedFiscalYear));
  }
  public GetTxnList() {
    if (this.ledgerId > 0 && this.fromDate && this.toDate) {
      this.ledgerResult = null;
      this.accReportBLService.GetLedgerReport(this.ledgerId, this.fromDate, this.toDate,this.fiscalYearId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.result.length) {
              let CrTotalAmt = 0;
              let DrTotalAmt = 0;
              let OpeningBalanceAmt = 0;
              let OpeningBalanceDrAmt;
              let OpeningBalanceCrAmt;
              this.IsOpeningBalance = false;
              this.ledgerResult = res.Results.result;
              if (this.showTxnItemLevel != 'true') {
                this.GroupViewData(res.Results.result);
              }
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
              this.ledgerResult.DrTotalAmount = CommonFunctions.parseAmount(DrTotalAmt);
              this.ledgerResult.CrTotalAmount = CommonFunctions.parseAmount(CrTotalAmt);

              this.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
              this.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
              //this.ledgerResult.LedgerName = this.selLedger.LedgerName;

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

              this.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
              this.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
            }
            else if (res.Results.dataList.length) {
              this.ledgerResult = res.Results.dataList;
              this.IsOpeningBalance = true;
              let OpeningBalanceAmt = 0;
              let OpeningBalanceDrAmt;
              let OpeningBalanceCrAmt;
              this.ledgerResult.forEach(a => {
                OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
                (a.AmountDr >= a.AmountCr) ? OpeningBalanceDrAmt = a.AmountDr - a.AmountCr : OpeningBalanceCrAmt = a.AmountCr - a.AmountDr;
              });
              this.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
              this.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
              this.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
              this.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No Records for selected dates."]);
              this.ledgerResult = null;
              this.CallBack();
            }
            this.BalanceCalculation();
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("failed", ["Something Wrong!!."]);
      this.CallBack();
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
  //CheckSelLedger(): boolean {

  //    if (!this.selLedger || typeof (this.selLedger) != 'object') {
  //        this.selLedger = undefined;
  //        this.msgBoxServ.showMessage("failed", ["Select ledger from the list."]);
  //        return false;
  //    }
  //    else
  //        return true;
  //}
  checkValidFiscalYear() {
    let flag = true;
    let fromDate = moment(this.fromDate, "YYYY-MM-DD");
    let toDate = moment(this.toDate, "YYYY-MM-DD");
    let startDate = moment(this.selFiscalYear.StartDate, "YYYY-MM-DD");
    let endDate = moment(this.selFiscalYear.EndDate, "YYYY-MM-DD");

    if (!(fromDate.isSameOrAfter(startDate))) {
      flag = false;
    }
    if (!(toDate.isSameOrBefore(endDate))) {
      flag = false;
    }
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['From Date and To Date must be with in a fiscal year!']);
    }
    return flag;
  }
  ViewTransactionDetails(voucherNumber: string) {
    this.transactionId = null;
    this.voucherNumber = null;
    this.changeDetector.detectChanges();
    this.voucherNumber = voucherNumber;
  }
  LedgerListFormatter(data: any): string {
    return data["LedgerName"];
  }
  checkDateValidation() {
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }
  Print() {
    this.showPrint = false;
    this.printDetaiils = null;
    this.changeDetector.detectChanges();
    this.showPrint = true;
     this.printDetaiils = document.getElementById("printpage_reusableLedger");      
  }
  // Export report to Excelsheet
  ExportToExcel(tableId) {
    if (tableId) {
      this.actionView = false;
      this.changeDetector.detectChanges();
      let workSheetName = 'Ledger Report';
      //let Heading = 'Ledger Report';
      let Heading = "Ledger Report for: " + this.ledgerName.toUpperCase() + " (" + this.ledgerCode + ")";
      let filename = 'LedgerReport';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
    this.actionView = true;
    this.changeDetector.detectChanges();
  }
  CallBack() {
    this.showLedgerDetail = false;
    this.callbackAdd.emit({ item: null });
  }
  GroupViewData(Result) {
    try {
      if (Result) {

        var helper = {};
        var result1 = Result.reduce(function (r, o) {
          var key = o.TransactionDate + o.VoucherNumber;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            r.push(helper[key]);
          }
          else {
            helper[key].LedgerName = o.LedgerName;
            helper[key].Amount += o.Amount;
          }
          return r;
        }, []);

        var resultOriginal = Result;
        result1.forEach(itm => {
          itm.TransactionItems = [];
          var tempTxnItemList: any;
          if (resultOriginal.length > 0) {
            var matchingTxnItmList = resultOriginal.filter(it => it.VoucherNumber == itm.VoucherNumber && it.TransactionDate == itm.TransactionDate);
            matchingTxnItmList.forEach(data => {
              data.TransactionItems.forEach(dItm => {
                itm.TransactionItems.push(dItm);
              });

            });
          }

          var helper = {};
          var txnResult = itm.TransactionItems.reduce(function (r, o) {
            var key = o.LedgerName;

            if (!helper[key]) {
              helper[key] = Object.assign({}, o);
              r.push(helper[key]);
            }
            else {
              helper[key].LedgerName = o.LedgerName;
              helper[key].LedAmount += o.LedAmount;
            }
            return r;
          }, []);

          itm.TransactionItems = txnResult;

        });

        this.ledgerResult = result1;

      }
    } catch (exception) {
      console.log(exception);
    }
  }
  showExport() {
    let exportshow = this.coreservice.Parameters.find(a => a.ParameterName == "AllowOtherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
    if (exportshow == "true") {
      this.showExportbtn = true;
    }
    else {
      this.showExportbtn = false;
    }
  }

  //START: VIKAS: 6th April 2020: Added shorcut keys 
  public hotKeysEnabled: boolean = false;

  HotKeysOnOff(txnItm) {

    if (txnItm.IsHighlighted) {
      txnItm.IsHighlighted = false;
      this.hotKeysEnabled = false;
      return;
    }

    if (this.ledgerResult && this.ledgerResult.length > 0) {
      this.ledgerResult.forEach(a => {
        a.IsHighlighted = false;
      });
    }

    txnItm["IsHighlighted"] = !txnItm["IsHighlighted"];
    if (txnItm["IsHighlighted"]) {
      this.hotKeysEnabled = true;
    }

  }

  //this function is hotkeys when pressed by user
  hotkeys(event) {
    if (!this.hotKeysEnabled) {
      if (event.keyCode == 27) {
        this.CallBack();
      }
      return;
    }

    if (event) {

      if (event.keyCode == 38) {//up arrow
        if (this.ledgerResult && this.ledgerResult.length > 0 && this.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {

          let curIndx = this.ledgerResult.findIndex(a => a.IsHighlighted);
          this.ledgerResult[curIndx].IsHighlighted = false;

          if (curIndx > 0) {
            curIndx--;
          }
          //this will go to minimum zero.
          this.ledgerResult[curIndx].IsHighlighted = true;
        }
      }
      else if (event.keyCode == 40) {//down arrow
        if (this.ledgerResult && this.ledgerResult.length > 0 && this.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {
          let curIndx = this.ledgerResult.findIndex(a => a.IsHighlighted);
          this.ledgerResult[curIndx].IsHighlighted = false;
          if (curIndx < this.ledgerResult.length - 1) {
            curIndx++;
          }
          this.ledgerResult[curIndx].IsHighlighted = true;

        }
      }
      else if (event.keyCode == 13) {//enter.
        if (this.ledgerResult && this.ledgerResult.length > 0 && this.ledgerResult.findIndex(a => a.IsHighlighted) > -1) {
          let curIndx = this.ledgerResult.findIndex(a => a.IsHighlighted);
          if (curIndx > -1) {
            let curTxnItm = this.ledgerResult[curIndx];
            this.ViewTransactionDetails(curTxnItm.VoucherNumber);
          }

        }
      }
      else if (event.keyCode == 27) {
        this.CallBack();
      }
    } //40 down, 38 up

  }
  //END: VIKAS: 6th April 2020: Added shorcut keys 

  //this function will call after voucher details popup closed, we need to reload reports if value is true
  public OnPopupClose($event) {
    if ($event.reloadPage) {
      this.GetTxnList();
    }
  }
}
