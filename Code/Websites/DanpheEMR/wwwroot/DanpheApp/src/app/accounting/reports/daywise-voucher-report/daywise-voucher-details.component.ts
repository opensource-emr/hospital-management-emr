import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import * as moment from 'moment/moment';
import { TransactionViewModel } from "../../transactions/shared/transaction.model";
import { AccountingReportsBLService } from "./../shared/accounting-reports.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { CoreService } from "../../../core/shared/core.service";
@Component({
  selector: 'voucher-report-details-view',
  templateUrl: './daywise-voucher-details.html',
})
export class DaywiseVoucherDetailsComponent {
  public transaction: TransactionViewModel = new TransactionViewModel();
  public viewTxn: boolean = false;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public fromDate: string = null;
  public toDate: string = null;
  public voucherNumber: number = 0;
  public voucherId: number = 0;
  public isSaleVoucher: boolean = false;
  public depositdr: number = 0;
  public depositcr: number = 0;
  public deposittransaction: TransactionViewModel = new TransactionViewModel();
  public returntransaction: TransactionViewModel = new TransactionViewModel();
  public salesTotalAmount: number = 0;
  public tradeAmount: number = 0;
  public receivableAmount: number = 0;
  public totalAmount: number = 0;
  public returnAmount: number = 0;
  public paymentamount: number = 0;
  public returnDiscount: number = 0;
  public totaldr: number = 0;
  public totalcr: number = 0;
  public voucherNum: number = 0;
  public voucherid: number = 0;
  public dayvoucherNumber: string = "";
  public showExportbtn : boolean=false;

  public userCashCollection: Array<{ UserName, SalesDr, SalesCr, DepositDr, DepositCr, Total }> = [];
  constructor(public accBLService: AccountingReportsBLService,
    public msgBoxServ: MessageboxService,
    public coreservice : CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.showExport();
  }
  // public GetTxn(transactionId: number) {
  //     try {
  //         this.accBLService.GetTransaction(transactionId)
  //             .subscribe(res => {
  //                 if (res.Status == "OK") {
  //                     this.transaction = res.Results;
  //                     this.Calculate(false);
  //                     this.viewTxn = true;
  //                 }
  //                 else {
  //                     this.msgBoxServ.showMessage("failed", ['Invalid Transaction Id.']);
  //                     console.log(res.ErrorMessage)
  //                 }

  //             });
  //     } catch (ex) {
  //         this.ShowCatchErrMessage(ex);
  //     }
  // }
  public GetTxnbyVoucher() {
    try {
      let vouchernumber = this.voucherNum;
      let voucher = this.voucherid;
      var secId = parseInt(localStorage.getItem("SectionId"));
      if (voucher > 0) {
        this.accBLService.GetDaywiseVoucherDetailsbyDayVoucherNo(vouchernumber, voucher,secId)
          .subscribe(res => {
            if (res.Status == "OK") {
              let data = res.Results;
              if (this.voucherid == 2 && data.SectionId == 2) { //vouchernumber.includes("SV")
                //only for billing sales voucher
                let depositdata = new TransactionViewModel();
                let transactiondata = new TransactionViewModel();
                let temptxn = new TransactionViewModel();
                //below is for cash ledger, trade discount and receivable
                let allvoucherdata = new TransactionViewModel();
                //data seperation here daposit data is seperated from other data
                data.txnList.TransactionItems.forEach(row => {
                  let flag = true;
                  row.TransactionType.forEach(trow => {
                    if (trow.includes('Deposit')) {
                      flag = false;
                    }
                  });
                  //getting data of cash ledger,receivables ledger and trade discount ledger
                  if (row.Name == 'ACA_CASH_IN_HAND_CASH' || row.Name == 'ACA_SUNDRY_DEBTORS_RECEIVABLES' || row.Name == 'EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT') {
                    allvoucherdata.TransactionItems.push(row);
                  } else {
                    //getting data of credit note voucher
                    if (row.VoucherNumber.includes('CN'))
                      this.returntransaction.TransactionItems.push(row);
                  }
                  if (flag) {
                    transactiondata.TransactionItems.push(row);
                  } else {
                    if (row.Name != 'ACA_CASH_IN_HAND_CASH') {
                      depositdata.TransactionItems.push(row);
                    } else {
                      temptxn.TransactionItems.push(row);
                    }
                  }
                });
                this.returntransaction.TransactionItems = this.GroupViewData(this.returntransaction);
                //setting depositdata to transaction for calculation
                this.transaction = new TransactionViewModel();
                this.transaction.TransactionItems = depositdata.TransactionItems.filter(a => a.VoucherNumber.includes('SV'));
                this.Calculate(true);//true for only deposit
                this.transaction.TransactionItems = this.GroupViewData(this.transaction);
                this.deposittransaction = new TransactionViewModel();
                //for display deposit data
                this.deposittransaction = this.transaction;
                //below code for calculation for data exclude deposit data
                this.transaction = new TransactionViewModel();
                this.transaction = data.txnList;
                this.transaction.TransactionItems = transactiondata.TransactionItems.filter(a => a.VoucherNumber.includes('SV'));
                this.transaction.TransactionItems = this.GroupViewData(this.transaction);
                this.Calculate(false);
                allvoucherdata.TransactionItems = this.GroupViewData(allvoucherdata);
                for (let i = 0; i < this.transaction.TransactionItems.length; i++) {
                  let dramt = 0, cramt = 0, flag = false;
                  allvoucherdata.TransactionItems.forEach(a => {
                    if (this.transaction.TransactionItems[i].Name == a.Name && this.transaction.TransactionItems[i].DrCr == a.DrCr) {
                      flag = true;
                      if (a.DrCr) {
                        dramt += a.Amount;
                      } else {
                        cramt -= a.Amount;
                      }
                    }
                  });
                  if (flag) {
                    if (dramt >= cramt) {
                      this.transaction.TransactionItems[i].DrCr = true;
                      this.transaction.TransactionItems[i].Amount = dramt - cramt;
                    } else {
                      this.transaction.TransactionItems[i].DrCr = false;
                      this.transaction.TransactionItems[i].Amount = cramt - dramt;
                    }
                  }
                }
                this.isSaleVoucher = true;
                //getting trade discount amount
                let trade = this.transaction.TransactionItems.filter(a => a.Name == 'EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT');
                this.tradeAmount = 0;
                if (trade) {
                  trade.forEach(t => {
                    if (t.DrCr) {
                      this.tradeAmount += t.Amount
                    } else {
                      this.tradeAmount -= t.Amount
                    }
                  });
                }
                this.returnAmount = data.Amounts.ReturnAmount;
                this.paymentamount = data.Amounts.PaymentAmount;
                this.returnDiscount = data.Amounts.RetrunDiscount;
                this.receivableAmount = data.Amounts.ReceivableAmount;
                //calculation for net sales amount
                this.salesTotalAmount = this.drTotal - this.tradeAmount - this.returnAmount;
                //calculation for cash collection
                this.totalAmount = this.salesTotalAmount - this.receivableAmount + this.depositcr - this.depositdr;
                this.userCashCollection = data.UserCashCollection;
                //calculation for userCollectionTotal for each user
                if (this.userCashCollection.length > 0) {
                  for (let i = 0; i < this.userCashCollection.length; i++) {
                    this.userCashCollection[i].Total = this.userCashCollection[i].DepositDr
                      + this.userCashCollection[i].SalesDr
                      - this.userCashCollection[i].DepositCr
                      - this.userCashCollection[i].SalesCr;
                  }
                }
                this.CalculateTotal(this.transaction);
                this.CalculateTotal(this.returntransaction);
                this.CalculateTotal(this.deposittransaction);
              } else {
                this.transaction = data.txnList;
                
                this.Calculate(false);
              }
              this.viewTxn = true;
            }
            else {
              this.msgBoxServ.showMessage("failed", ['Invalid Transaction Id.']);
              console.log(res.ErrorMessage)
            }

          });
      }
      else {
        this.msgBoxServ.showMessage("error", ["Not getting voucherId!"]);
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  Calculate(flag) {
    //here flag is true only for deposit data
    try {
      let dr = 0, cr = 0;
      this.transaction.TransactionItems.forEach(txnItm => {
        if (txnItm.DrCr) {
          dr += txnItm.Amount;
        }
        else {
          cr += txnItm.Amount;
        }
        if (txnItm.Details.length > 0) {
          txnItm.SupplierDetails = txnItm.Details
          for (let i = 0; i < txnItm.SupplierDetails.length; i++) {
            if (txnItm.SupplierDetails[i].Dr >= txnItm.SupplierDetails[i].Cr) {
              txnItm.SupplierDetails[i].Dr = txnItm.SupplierDetails[i].Dr - txnItm.SupplierDetails[i].Cr;
              txnItm.SupplierDetails[i].Cr = 0;
            }
            else {
              txnItm.SupplierDetails[i].Cr = txnItm.SupplierDetails[i].Cr - txnItm.SupplierDetails[i].Dr;
              txnItm.SupplierDetails[i].Dr = 0;
            }
          }
          txnItm.Details = txnItm.SupplierDetails;
        }
      });
      if (flag) {
        this.depositdr = dr;
        this.depositcr = cr;
      } else {
        this.crTotal = cr;
        this.drTotal = dr;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  CalculateTotal(data) {
    try {
      data.TransactionItems.forEach(txnItm => {
        if (txnItm.DrCr) {
          this.totaldr += txnItm.Amount;
        }
        else {
          this.totalcr += txnItm.Amount;
        }
      });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  @Input("voucherNumber")
  public set value(val: number) {
    if (val) {
      this.Reset();
      // this.GetTxn(val);
      this.voucherNum = val;
      this.dayvoucherNumber= this.LeadingZeroDayVoucherNumber(this.voucherNum);
    }
  }

  @Input("voucherId")
  public set voucher(val: number) {
    if (val) {
      this.Reset();
      this.voucherid = val;
      this.GetTxnbyVoucher();
    }
  }

  Close() {
    try {
      this.viewTxn = false;
      this.transaction = new TransactionViewModel();
      this.deposittransaction = new TransactionViewModel();
      this.returntransaction = new TransactionViewModel();
      this.voucherNum = 0;
      this.voucherid = 0;
      this.changeDetector.detectChanges();
      this.Reset();
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  Reset() {
    this.drTotal = 0;
    this.crTotal = 0;
    this.depositcr = 0;
    this.depositdr = 0;
    this.isSaleVoucher = false;
    this.totaldr = 0;
    this.totalcr = 0;
  }
  Print() {
    try {
      let popupWinindow;
      var printContents = document.getElementById("printpageTransactionView").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=1200,height=1400,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();

      let documentContent = "<html><head>";
    //  documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
      // documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/PrintStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      documentContent += '</head>';
      documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
      var htmlToPrint = '' + '<style type="text/css">' + '.table_data {' + 'border-spacing:0px' + '}' + '</style>';
      htmlToPrint += documentContent;
      popupWinindow.document.write(htmlToPrint);
      popupWinindow.document.close();
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Voucher Report';
      let Heading = this.transaction.VoucherType + ' Report';
      let filename = 'voucherReport';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
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
  GroupViewData(data) {
    try {
      let dramt = 0, cramt = 0;
      if (this.transaction) {

        var helper = {};
        var res = data.TransactionItems.reduce(function (r, o) {
          var key = o.Name;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            r.push(helper[key]);
          }
          else {
            helper[key].LedgerName = o.LedgerName;
            helper[key].Name = o.Name;
            helper[key].Details = helper[key].Details.concat(o.Details);
            if (o.DrCr) {
              if (helper[key].DrCr == true) {
                helper[key].Amount = helper[key].Amount + o.Amount;
              } else {
                helper[key].Amount = helper[key].Amount - o.Amount;
                helper[key].DrCr = (helper[key].Amount < 0) ? false : true;
                helper[key].Amount = (helper[key].Amount < 0) ? (0 - helper[key].Amount) : (helper[key].Amount);
              }
            }
            else {
              if (helper[key].DrCr == true) {
                helper[key].Amount = helper[key].Amount - o.Amount;
                helper[key].DrCr = (helper[key].Amount < 0) ? false : true;
                helper[key].Amount = (helper[key].Amount < 0) ? (0 - helper[key].Amount) : (helper[key].Amount);
              } else {
                helper[key].Amount = helper[key].Amount + o.Amount;
              }
            }
          }
          return r;
        }, []);
        return res;
      }
    } catch (exception) {
      console.log(exception);
    }
    return new TransactionViewModel();
  }

  public LeadingZeroDayVoucherNumber(voucherNo) {
    if (voucherNo)
      return ("00000" + voucherNo).slice(-6)
    else
      return "";
  }
  showExport(){

    let exportshow = this.coreservice.Parameters.find(a => a.ParameterName =="AllowSingleVoucherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
        if ( exportshow== "true"){
          this.showExportbtn =true;     
        }
        else{
            this.showExportbtn = false;
        }
      }
}
