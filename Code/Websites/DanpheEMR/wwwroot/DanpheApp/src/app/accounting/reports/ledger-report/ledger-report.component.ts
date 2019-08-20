import { Component, ChangeDetectorRef } from "@angular/core";
import { AccountingReportsBLService } from '../shared/accounting-reports.bl.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";

@Component({
  selector: 'ledger-report',
  templateUrl: './ledger-report.html',
})
export class LedgerReportComponent {
  public ledgerResult: any;
  public IsOpeningBalance: boolean = false;
  public ledgerList: Array<{ LedgerId: number, LedgerName: string }> = [];
  public fiscalyearList: Array<{ FiscalYearId: number, FiscalYearName: string, StartDate: Date, EndDate: Date, IsActive: boolean }> = [];
  public selLedger: { LedgerId, LedgerName } = null;
  public selFiscalYear: { FiscalYearId, FiscalYearName, StartDate, EndDate, IsActive } = null;
  public txnGridColumns: Array<any> = null;
  public transactionId: number = null;
  public fromDate: string = null;
  public toDate: string = null;
  public selectedFiscalYear: any;
  public IsActive: boolean = true;
  public IsDetailsView: boolean = true;
  public voucherNumber: string = null;
  public actionView: boolean = true;

  constructor(
    public accReportBLService: AccountingReportsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    //this.txnGridColumns = GridColumnSettings.LedgerTransactionList;
    this.GetLedgers();
    this.GetFiscalYears();
  }
  public GetLedgers() {
    this.accReportBLService.GetLedgers()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ledgerList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

      });
  }

  public GetFiscalYears() {
    this.accReportBLService.GetFiscalYearsList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.fiscalyearList = res.Results;
          this.selFiscalYear = this.fiscalyearList.find(x => x.IsActive == true);
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

      });
  }

  DisplayParticular() {
    this.IsDetailsView = (this.IsDetailsView == true) ? false : true;
    //this.IsDetailsView = true;
  }
  ChangeFiscalYear() {
    this.selFiscalYear = this.fiscalyearList.find(x => x.FiscalYearId == parseInt(this.selectedFiscalYear));
  }
  public GetTxnList() {
    if (this.CheckSelLedger() && this.checkValidFiscalYear() && this.checkDateValidation()) {
      this.accReportBLService.GetLedgerReport(Number(this.selLedger.LedgerId), this.fromDate, this.toDate)
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
              this.GroupViewData(res.Results.result);
              this.ledgerResult.forEach(a => {
                //if (a.Amount >= 0) {
                //    a.DrCr = true
                //} else {
                //    a.DrCr = false;
                //    a.Amount = -a.Amount;
                //}
                // a.DrCr ? DrTotalAmt += a.Amount : CrTotalAmt += a.Amount;
                DrTotalAmt += a.LedgerDr;
                CrTotalAmt += a.LedgerCr;
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
              this.ledgerResult.LedgerName = this.selLedger.LedgerName;

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
            else if(res.Results.dataList.length){
              this.ledgerResult = res.Results.dataList;
              this.IsOpeningBalance = true;
              let OpeningBalanceAmt = 0;
              let OpeningBalanceDrAmt;
              let OpeningBalanceCrAmt;
              this.ledgerResult.forEach(a => {
                OpeningBalanceCrAmt = 0; OpeningBalanceDrAmt = 0;
                (a.AmountDr >= a.AmountCr) ? OpeningBalanceDrAmt= a.AmountDr - a.AmountCr :  OpeningBalanceCrAmt = a.AmountCr - a.AmountDr;
              });
              this.ledgerResult.DrNetAmount = OpeningBalanceDrAmt;
              this.ledgerResult.CrNetAmount = OpeningBalanceCrAmt;
              this.ledgerResult.OpeningBalanceDrAmount = CommonFunctions.parseAmount(OpeningBalanceDrAmt);
              this.ledgerResult.OpeningBalanceCrAmount = CommonFunctions.parseAmount(OpeningBalanceCrAmt);
            }
            else {
              this.msgBoxServ.showMessage("failed", ["No Records found."]);
              this.ledgerResult = null;
            }
          }
          else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          }
        });
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
  checkValidFiscalYear() {
    var frmdate = moment(this.fromDate, "YYYY-MM-DD");
    var tdate = moment(this.toDate, "YYYY-MM-DD");
    var flag = false;
    this.fiscalyearList.forEach(a => {
      if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
        flag = true;
      }
    });
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['Selected dates must be with in a fiscal year']);
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
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    var htmlToPrint = '' + '<style type="text/css"> .table_data { border-spacing:0px } th { color:black; background-color: #599be0; } </style>';
    htmlToPrint += documentContent;
    popupWinindow.document.write(htmlToPrint);
    popupWinindow.document.close();
  }
  // Export report to Excelsheet
  ExportToExcel(tableId) {
    if (tableId) {
      this.actionView = false;
      this.changeDetector.detectChanges();
      let workSheetName = 'Ledger Report';
      let Heading = 'Ledger Report';
      let filename = 'LedgerReport';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
    this.actionView = true;
    this.changeDetector.detectChanges();
  }
  GroupViewData(Result) {
    try {
      if (Result) {

        var helper = {};
        var result1 = Result.reduce(function (r, o) {
          var key = o.TransactionDate + o.VoucherNumber;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            if (helper[key].DrCr != true) {
              helper[key].LedgerCr = helper[key].Amount;
            }
            else {
              helper[key].LedgerDr = helper[key].Amount;
            }
            //if (helper[key].DrCr != true) {
            //    helper[key].Amount = - helper[key].Amount;
            //}
            r.push(helper[key]);
          }
          else {
            helper[key].LedgerName = o.LedgerName;
            // helper[key].Amount += o.Amount;
            if (o.DrCr) {
              helper[key].LedgerDr += o.Amount;
            }
            else {
              helper[key].LedgerCr += o.Amount;
            }
            //if (o.DrCr) {
            //    helper[key].Amount += o.Amount;
            //}
            //else {
            //    helper[key].Amount -= o.Amount;
            //}
          }
          return r;
        }, []);
        //grouping for transaction items 
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
            var key = o.LedgerName + o.DrCr;

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
}
