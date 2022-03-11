import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ElementRef, ViewChild } from "@angular/core";

import { AccountingBLService } from "../shared/accounting.bl.service";
import { TransactionViewModel, TransactionModel } from "./shared/transaction.model";
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from "../../core/shared/core.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { AccountingService } from "../shared/accounting.service";
import { Router } from "@angular/router";
import { SecurityService } from "../../security/shared/security.service";

@Component({
  selector: 'transaction-view',
  templateUrl: './transaction-view.html',
  host: { '(window:keyup)': 'hotkeys($event)' },
})
export class TransactionViewComponent {
  public transaction: TransactionViewModel = new TransactionViewModel();
  public viewTxn: boolean = false;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public fromDate: string = null;
  public toDate: string = null;
  public voucherNumber: string = null;
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
  public userCashCollection: Array<{ UserName, SalesDr, SalesCr, DepositDr, DepositCr, Total }> = [];
  public sectionId: number = 0;
  public showExportbtn: boolean = false;
  // for edit manual voucher to show edit btn
  // public editmanualVoucher: boolean = false;
  public IsShowReceivedBy: boolean = false;
  public Iseditable : boolean = false;
  public showeditPage : boolean = false;
  public fiscalYearId:number;
  public fiscalYId : any;

  public editvoucherNumber: string = null;
  public showPrint: boolean = false;
  public printDetaiils:any;
  public IsReverse: boolean = false;
  public TempVoucherNumber: string = "";
  public txnDetails: any;
  public showPayeeAndCheque = false;
  public showVoucherHeadCol : boolean = false;
  constructor(public coreService: CoreService,
    public accBLService: AccountingBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public routeFrom: RouteFromService,
    public accountingService: AccountingService, public router: Router,
    public securityService: SecurityService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.showExport();
    this.showVoucherHead();
  }

  public showEditbtn:boolean=true;


  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();


  @Input("showEditVoucherBtn")
  public set valueBtn(val: boolean) {
    this.showEditbtn=val;
  }
  // Vikas : 27th Apr 2020: This method for autofocus print button.
  autofocus() {
    window.setTimeout(function () {
      document.getElementById('printbtn').focus();
    }, 0);
  }
  public GetTxn(transactionId: number) {
    try {
      this.accBLService.GetTransaction(transactionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.transaction = res.Results;
            this.Calculate(false);
            this.viewTxn = true;
            this.autofocus();
          }
          else {
            this.msgBoxServ.showMessage("failed", ['Invalid Transaction Id.']);
            console.log(res.ErrorMessage)
          }

        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public GetTxnbyVoucher(vouchernumber: string) {
    try {
      var paramData = this.coreService.Parameters.filter(a => a.ParameterName == "IsAllowGroupby" && a.ParameterGroupName == "Accounting");
      let isGroupBy = (paramData.length>0) ? JSON.parse(paramData[0].ParameterValue ) :true;
      //when route from edit manual voucher then edit btn is show
      // if (this.routeFrom.RouteFrom == "EditManualVoucher") {
      //   this.editmanualVoucher = true;
      // }

      this.accBLService.GetTransactionbyVoucher(vouchernumber, 0,this.fiscalYearId)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results != null ) {
            let data = res.Results;
            this.voucherNumber = vouchernumber;
            if (data.txnList !=null){
              if (data.txnList.IsEditable == true && this.showEditbtn==true){
                this.Iseditable = true;
              }
            
              //get parameters value for iscustom
              let Iscustom = this.coreService.Parameters.find(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "CustomSaleVoucher").ParameterValue;
              let iscust = (Iscustom != "false") ? "true" : "false";
              this.CheckForReceivedBy(data);
              if (vouchernumber.includes("SV") && data.SectionId == 2 && iscust == "true") {
                this.isSaleVoucher = (Iscustom != "false") ? true : false;
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
              }
              else {
                this.transaction = data.txnList;

                //for manual voucher IsGroupTxn will be false, other txn which values is null or true need group by method calling
                if(this.transaction.IsGroupTxn !=false){
                  this.GroupByLedgerData(this.transaction);
                }
                this.Calculate(false);
              }
              ////NageshBB: 02sep2020: we are showing 0 amount details in voucher page
              // for (var i = 0; i < this.transaction.TransactionItems.length; i++) {
              //   if (this.transaction.TransactionItems[i].Amount == 0) {
              //     this.transaction.TransactionItems.splice(i, 1);
              //     i--;
              //   }
              // }
              this.viewTxn = true;
              this.autofocus();
            }
            else{
              this.msgBoxServ.showMessage("failed", ['Invalid Voucher Number']);
            }
          }
          else {
            //  this.msgBoxServ.showMessage("failed", ['Invalid Voucher Number']);
            this.msgBoxServ.showMessage("Error", [res.ErrorMessage]);
            //  console.log(res.ErrorMessage)
          }

        });
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

        if (txnItm.Details && txnItm.Details.length > 0) {
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
      this.drTotal = CommonFunctions.parseDecimal(this.drTotal);
      this.crTotal =  CommonFunctions.parseDecimal(this.crTotal);
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
      this.totaldr =  CommonFunctions.parseDecimal(this.totaldr);
      this.totalcr =  CommonFunctions.parseDecimal(this.totalcr);
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  @Input("FiscalYearId")
  public set fiscalyear(_fiscalyearid) {
    if(_fiscalyearid){
      this.fiscalYearId = _fiscalyearid;
    }
  }

  @Input("voucherNumber")
  public set value(val: string) {
    if (val) {
      this.Reset();
      // this.GetTxn(val);
      if(val.includes('PMTV')){
        this.showPayeeAndCheque = true;
      }
      else{
        this.showPayeeAndCheque = false;
      }
      this.GetTxnbyVoucher(val);

    }
  }
  CallBackUpdate($event){
    if($event.reloadPage){
      let reloadPage=$event.reloadPage;
      this.callbackClose.emit({reloadPage});
    }
  }

  Close() {
    try {
      this.viewTxn = false;
      this.transaction = new TransactionViewModel();
      this.deposittransaction = new TransactionViewModel();
      this.returntransaction = new TransactionViewModel();
      localStorage.removeItem("SectionId");
      this.Reset();
      this.Iseditable = false;

      this.IsReverse = false;

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
    // this.accountingService.IsEditVoucher = false;
    // this.editmanualVoucher = false;
    this.Iseditable =false;
    this.IsShowReceivedBy = false;
  }
  Print() {
    try {
      //let popupWinindow;
      //var printContents = document.getElementById("printpageTransactionView").innerHTML;
      //popupWinindow = window.open('', '_blank', 'width=1200,height=1400,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      //popupWinindow.document.open();

      //let documentContent = "<html><head>";
      //// documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
      //// documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/PrintStyle.css"/>';
      //documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/PrintStyle.css"/>';
      //documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      //documentContent += '</head>';
      //documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
      //var htmlToPrint = '' + '<style type="text/css">' + '.table_data {' + 'border-spacing:0px' + '}' + '</style>';
      //htmlToPrint += documentContent;
      //popupWinindow.document.write(htmlToPrint);
      //popupWinindow.document.close();

      this.showPrint=false;
      this.printDetaiils=null;
      this.changeDetector.detectChanges();
      this.showPrint=true;
      this.printDetaiils = document.getElementById("printpageTransactionView");
      this.Close();

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

  public GroupByLedgerData(data) {
    var helper = {};
    var txnResult = data.TransactionItems.reduce(function (r, o) {
      var key = o.LedgerName + o.LedgerGroupName;

      if (!helper[key]) {
        helper[key] = Object.assign({}, o);
        r.push(helper[key]);
      }
      else {
        helper[key].LedgerName = o.LedgerName;
        helper[key].LedgerGroupName = o.LedgerGroupName;
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
    this.transaction.TransactionItems = txnResult;
  }

  // this method for transacton-view to voucher-edit page
  EditVoucher() {
    // if (this.routeFrom.RouteFrom == "EditManualVoucher") {
    //   var secId = parseInt(localStorage.getItem("SectionId"));
    //   this.accountingService.VoucherNumber = this.voucherNumber;
    //  // this.accountingService.IsEditVoucher = true;
    //   this.router.navigate(['/Accounting/Transaction/EditVoucher']);
    //   localStorage.setItem("SectionId", secId.toString());
    // }
    try {
      var secId = parseInt(localStorage.getItem("SectionId"));
      this.showeditPage =true;
      this.fiscalYId = this.fiscalYearId;//mumbai-team-june2021-danphe-accounting-cache-change
      this.changeDetector.detectChanges();//mumbai-team-june2021-danphe-accounting-cache-change
      this.editvoucherNumber = null;
      this.changeDetector.detectChanges();
      this.editvoucherNumber = this.voucherNumber;
      this.changeDetector.detectChanges();//mumbai-team-june2021-danphe-accounting-cache-change
      //this.accountingService.VoucherNumber = this.voucherNumber;
      // this.router.navigate(['/Accounting/Transaction/EditVoucher']);
      // this.showeditPage = true;
      this.Close();
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  showExport() {

    let exportshow = this.coreService.Parameters.find(a => a.ParameterName == "AllowSingleVoucherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
    if (exportshow == "true") {
      this.showExportbtn = true;
    }
    else {
      this.showExportbtn = false;
    }
  }

  CheckForReceivedBy(dataV) {
    if (!dataV) {
      return;
    }
    this.IsShowReceivedBy = false;
    var receivedByMappingDetail = [];
    let Parameter = this.coreService.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "ReceivedByInVoucher" && parms.ParameterGroupName == "Accounting");
    if (Parameter.length > 0) {
      let finalstr = '['+ Parameter[0].ParameterValue +']'
      receivedByMappingDetail = JSON.parse(finalstr);
    //   receivedByMappingDetail.forEach(element => {
    //   if((dataV.txnList.VoucherNumber.toLocaleLowerCase().includes(element.VoucherCode))==true && dataV.SectionId == element.SectionId)
    //   {
    //     this.changeDetector.detectChanges();
    //     this.IsShowReceivedBy=true;                      
    //   }
     
    //  });

    //for allow ReceivedBy to multiple voucher type 
    let j=0;
    for( let i= 0;i< receivedByMappingDetail.length; i++ )
    {
      for( j; j<receivedByMappingDetail[i].length; j++)      
    if((dataV.txnList.VoucherNumber.toLocaleLowerCase().includes(receivedByMappingDetail[i][j].VoucherCode))==true && dataV.SectionId == receivedByMappingDetail[i][j].SectionId)
      {
        this.changeDetector.detectChanges();
        this.IsShowReceivedBy=true;                      
      }
      
    }
    }
    //this.calType = calendarTypeObject.AccountingModule;

  }
  //this needs Renderer2 to inject in constructor
  //public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
  //globalListenFunc: Function;

  ngOnInit() {
    //  this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
    //    if (e.keyCode == this.ESCAPE_KEYCODE) {
    //      this.Close();
    //      //this.onClose.emit({ CloseWindow: true, EventName: "close" });
    //    }
    //  });
    //  //console.log("from edit item component.");
    //  //console.log(this.docDDLSource);
  }

  //ngOnDestroy() {
  //  // remove listener
  //  this.globalListenFunc();
  //}

  //this function is hotkeys when pressed by user
  hotkeys(event) {

    if (event) {
      if (event.keyCode == 27) {
        this.Close();
      }
    } //40 down, 38 up

  }
  // Reverse Voucher:20-Aug-2020
  reversevoucher() {

    this.txnDetails = this.transaction;
    var fiscalYearId = this.securityService.AccHospitalInfo.FiscalYearList.filter(f => f.FiscalYearName == this.txnDetails.FiscalYear)[0].FiscalYearId;
    var prevVoucherNumber = this.txnDetails.VoucherNumber;

    this.txnDetails.BillSyncs = [];
    this.txnDetails.TransactionLinks = [];
    this.txnDetails.IsActive = true;
    this.txnDetails.IsBackDateEntry = false;
    this.txnDetails.ModifiedBy = 0;
    this.txnDetails.FiscalYearId = fiscalYearId;
    this.txnDetails.IsAllowReverseVoucher = true
    this.txnDetails.TransactionDate = moment(this.securityService.AccHospitalInfo.TodaysDate).format('YYYY-MM-DD');    
    this.txnDetails.Remarks = "Reverse transaction on " + this.txnDetails.TransactionDate + " against voucher number " + prevVoucherNumber;
    this.txnDetails.VoucherNumber = this.GettempVoucherNumber(this.txnDetails.VoucherId, this.txnDetails.SectionId, this.txnDetails.TransactionDate);
    
    this.txnDetails.TransactionItems.forEach(t => {
      t.DrCr = (t.DrCr) ? false : true;
      t.IsActive = true;
    });    
    this.viewTxn = false;
    
    this.txnDetails.PrevTransactionId = this.transaction.TransactionId;
    this.txnDetails.IsReverseVoucher = true;
    this.txnDetails.HospitalId = this.transaction.HospitalId;
  }


  SaveReverseVoucher() {
    this.accBLService.PostToTransaction(this.txnDetails).
      subscribe(res => {
        if (res.Status == 'OK') {
          this.transaction.VoucherNumber= res.Results.VoucherNumber;
          this.IsReverse = false;
          this.viewTxn=true;
          this.msgBoxServ.showMessage("success", ["Reverse voucher saved"]);
          this.Close();//mumbai-team-june2021-danphe-accounting-cache-change
          //this.GetTxnbyVoucher(VoucherNumber);
        }
        else {
          this.msgBoxServ.showMessage("failed", ['failed to create transaction.']);
        }
      });
  }

  GettempVoucherNumber(voucherId: number, sectionId, transactionDate) {

    this.accBLService.GettempVoucherNumber(voucherId, sectionId, transactionDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.TempVoucherNumber = res.Results;
          this.IsReverse = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", ['failed to Get Provisional Voucher Number.']);

        }
      });

    //return this.TempVoucherNumber;
  }
  Closereverse() {
    this.IsReverse = false;
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
