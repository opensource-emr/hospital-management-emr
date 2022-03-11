import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import * as moment from 'moment/moment';
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DLService } from "../../shared/dl.service";
import { CoreService } from "../../core/shared/core.service";
import { CommonFunctions } from "../../shared/common.functions";
import { IncentiveBLService } from "../shared/incentive.bl.service";
import { INCTV_TXN_PaymentInfoModel } from "./incentive-paymentInfo.model";
import { LedgerModel } from "../../accounting/settings/shared/ledger.model";
import { LedgerEmployeeModel } from "../../accounting/settings/shared/ledger-emp.model";
import { TransactionModel } from "../../accounting/transactions/shared/transaction.model";
import { TransactionItem } from "../../accounting/transactions/shared/transaction-item.model";
import { SecurityService } from "../../security/shared/security.service";


@Component({
  selector: 'incentive-Payment-info',
  templateUrl: './incentive-payment-Info.html',
  styleUrls: ['./incentive-payment-info.css']
})
export class INCTV_BIL_IncentivePaymentInfoComponent {

  public FromDate: string = "";
  public ToDate: string = "";
  public calType: string = "";
  public headerDetail: any = null;
  public currentDate: string = ""
  public employeeId: number = 0;
  public showReport: boolean = false;
  public fiscalYearId: number = 0;
  public reportData: Array<INCTV_TXN_PaymentInfoModel> = [];
  public PaymentInfoDetail: INCTV_TXN_PaymentInfoModel = new INCTV_TXN_PaymentInfoModel();
  public allReportData: any = [];

  public allInctvFracIdToUpdate: Array<number> = [];

  public allDocterList: any = null;
  //public filteredDocterList: any = null;

  public showMakePaymentButton: boolean = false;
  public isSelectAll: boolean = false;

  public IsAllPaymentMade: boolean = false;
  public allLedgerList: Array<LedgerModel> = [];
  public selectedLedger: any;
  public allEmpLedgerList: Array<LedgerEmployeeModel> = [];
  public selectedEmpLedger: LedgerEmployeeModel = null;
  public showDocSelect: boolean = false;
  public loading: boolean = false;
  public totalAmt: number = 0;
  public narration: string = "";
  public transaction: TransactionModel = new TransactionModel();

  public selectedFromDate: string = "";
  public selectedToDate: string = "";
  //public IsPaymentMade: boolean = false;
  public voucherNumber: string = null;

  public showAddLedgerBox: boolean = false;
  public ledReferenceId: number = 0;
  public ledgerType: string = "";
  public summary = {
    tot_RefBilAmt: 0, tot_RefInctvAmt: 0, tot_RefTDSAmt: 0, tot_RefNetPayable: 0,
    tot_AssignBilAmt: 0, tot_AssignInctvAmt: 0, tot_AssignTDSAmt: 0, tot_AssignNetPayable: 0,
    tot_AdjBilAmt: 0, tot_AdjInctvAmt: 0, tot_AdjTDSAmt: 0, tot_AdjNetPayable: 0,
    tot_InctvAmt: 0, tot_NetPayable: 0, tot_TDSAmt: 0, tot_PreviousAdjAmt:0
  };

  public DocObj: any = { EmployeeId: null, FullName: '' };
  public adjustedAmount:number = 0;
  public totalVoucherAmount:number = 0;

  constructor(
    public msgBoxServ: MessageboxService,
    public dlService: DLService, public securityServ: SecurityService,
    public coreService: CoreService,
    public incentiveBLService: IncentiveBLService) {
    this.LoadCalenderTypes();
    this.FromDate = moment().format('YYYY-MM-DD');
    this.ToDate = moment().format('YYYY-MM-DD');
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.LoadDocterList();
    this.LoadAllEmployeeLedgerList();
    this.LoadAllLedgerList();
  }

  public LoadAllEmployeeLedgerList() {
    this.incentiveBLService.GetLedgerListOfEmployee().subscribe(res => {
      if (res.Status == "OK") {
        this.allEmpLedgerList = res.Results;
        this.showDocSelect = true;
      }
    });
  }

  //LoadDocterList() {
  //this.dlService.Read("/BillingReports/GetDoctorList")
  //  .map(res => res)
  //  .subscribe(res => {
  //    if (res.Status == "OK") {
  //      this.allDocterList = res.Results;
  //      //this.filteredDocterList = this.allDocterList;
  //    }
  //  });GetIncentiveApplicableDocterList()
  //}

  LoadDocterList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDocterList = res.Results;
        }
      });
  }

  LoadAllLedgerList() {
    this.incentiveBLService.GetAllLedgerList().subscribe(res => {
      if (res.Status == "OK") {
        this.allLedgerList = res.Results;
      } else {
        this.msgBoxServ.showMessage("error", ['Cannot Get the Ledger List']);
      }
    });
  }

  //LoadDocItemSummary() { console.log(this.employeeId); }
  public IsDateValid: boolean = true;
  LoadDocItemSummary() {
    this.DateValidCheck();

    if (this.IsDateValid) {
      this.allReportData = [];
      //let srvDept = this.ServDeptName.replace(/&/g, '%26');//this is URL-Encoded value for character  '&'    --see: URL Encoding in Google for details.
      if (this.employeeId && this.employeeId != 0) {
        this.dlService.Read("/BillingReports/INCTV_DocterItemSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&employeeId=" + this.employeeId)
          .map(res => res)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.selectedFromDate = this.FromDate;
              this.selectedToDate = this.ToDate;
              let data = JSON.parse(res.Results.JsonData);
              if (data && data.Table1 && data.Table1[0]) {
                this.allReportData = data.Table1.filter(a => a.IsPaymentProcessed == false);
                //this.allReportData = data.Table1;
                if (this.allReportData.length == 0) {
                  this.msgBoxServ.showMessage("notice-message", ['Docter payment is already made for Selected Date.']);
                }
                this.Initialize();
                this.CalculateSummaryAmounts(this.allReportData);
                this.showReport = true;
                this.IsAllPaymentMade = this.allReportData.every(a => a.IsPaymentMade == true);
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data Not Available for Selected Parameters...']);
              }
            }
          });
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['Select Docter for the payment']);
      }
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ['Invalid Date!!!']);
    }
  }

  public Initialize() {
    this.selectedLedger = "";
    this.totalAmt = 0;
    this.allInctvFracIdToUpdate = [];
    this.narration = '';
  }

  public CalculateSummaryAmounts(data) {
    //initailize to zero
    this.adjustedAmount = this.totalVoucherAmount = 0;
    this.summary.tot_RefBilAmt = this.summary.tot_RefInctvAmt = this.summary.tot_RefTDSAmt = this.summary.tot_RefNetPayable = 0;
    this.summary.tot_AssignBilAmt = this.summary.tot_AssignInctvAmt = this.summary.tot_AssignTDSAmt = this.summary.tot_AssignNetPayable = 0;
    this.summary.tot_AdjBilAmt = this.summary.tot_AdjInctvAmt = this.summary.tot_AdjTDSAmt = this.summary.tot_AdjNetPayable = 0;
    //previous Adjusted Amount
    if(!!data && data.length>0){
      this.summary.tot_PreviousAdjAmt = data[0].PreviousAdjustedAmount;
    }
    data.forEach(a => {
      this.allInctvFracIdToUpdate.push(a.InctvTxnItemId);
      if (a.IncomeType == 'assigned') {
        this.summary.tot_AssignBilAmt += a.TotalAmount;
        this.summary.tot_AssignInctvAmt += a.IncentiveAmount;
        this.summary.tot_AssignTDSAmt += a.TDSAmount;
        this.summary.tot_AssignNetPayable += a.NetPayableAmt;
      }
      else if (a.IncomeType == 'referral') {
        this.summary.tot_RefBilAmt += a.TotalAmount;
        this.summary.tot_RefInctvAmt += a.IncentiveAmount;
        this.summary.tot_RefTDSAmt += a.TDSAmount;
        this.summary.tot_RefNetPayable += a.NetPayableAmt;
      }
      else if (a.IncomeType == 'adjustment') {
        this.summary.tot_AdjBilAmt += a.TotalAmount;
        this.summary.tot_AdjInctvAmt += a.IncentiveAmount;
        this.summary.tot_AdjTDSAmt += a.TDSAmount;
        this.summary.tot_AdjNetPayable += a.NetPayableAmt;
      }
    });

    this.summary.tot_AssignBilAmt = CommonFunctions.parseAmount(this.summary.tot_AssignBilAmt);
    this.summary.tot_AssignInctvAmt = CommonFunctions.parseAmount(this.summary.tot_AssignInctvAmt);
    this.summary.tot_AssignTDSAmt = CommonFunctions.parseAmount(this.summary.tot_AssignTDSAmt);
    this.summary.tot_AssignNetPayable = CommonFunctions.parseAmount(this.summary.tot_AssignNetPayable);

    this.summary.tot_RefBilAmt = CommonFunctions.parseAmount(this.summary.tot_RefBilAmt);
    this.summary.tot_RefInctvAmt = CommonFunctions.parseAmount(this.summary.tot_RefInctvAmt);
    this.summary.tot_RefTDSAmt = CommonFunctions.parseAmount(this.summary.tot_RefTDSAmt);
    this.summary.tot_RefNetPayable = CommonFunctions.parseAmount(this.summary.tot_RefNetPayable);

    this.summary.tot_AdjBilAmt = CommonFunctions.parseAmount(this.summary.tot_AdjBilAmt);
    this.summary.tot_AdjInctvAmt = CommonFunctions.parseAmount(this.summary.tot_AdjInctvAmt);
    this.summary.tot_AdjTDSAmt = CommonFunctions.parseAmount(this.summary.tot_AdjTDSAmt);
    this.summary.tot_AdjNetPayable = CommonFunctions.parseAmount(this.summary.tot_AdjNetPayable);
    this.summary.tot_PreviousAdjAmt = CommonFunctions.parseAmount(this.summary.tot_PreviousAdjAmt);

    this.summary.tot_InctvAmt = this.summary.tot_AssignInctvAmt + this.summary.tot_RefInctvAmt + this.summary.tot_AdjInctvAmt;
    this.summary.tot_NetPayable =  this.summary.tot_AssignNetPayable + this.summary.tot_RefNetPayable + this.summary.tot_AdjNetPayable;
    this.totalVoucherAmount = this.summary.tot_NetPayable - this.summary.tot_PreviousAdjAmt;//previous adjusted Amount
    this.totalAmt = this.totalVoucherAmount;
    this.summary.tot_TDSAmt = this.summary.tot_AssignTDSAmt + this.summary.tot_RefTDSAmt + this.summary.tot_AdjTDSAmt;

  }

  OnVoucherAmountChange(){
    this.adjustedAmount = this.totalAmt - this.totalVoucherAmount;
  }

  LoadCalenderTypes() {
    let allParams = this.coreService.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }

  //SelectAllChkOnChange() {
  //  if (this.isSelectAll) {
  //    this.allReportData.forEach(a => {
  //      a.IsSelected = true;
  //    });
  //  }
  //  else {
  //    this.allReportData.forEach(a => {
  //      a.IsSelected = false;
  //    });
  //  }

  //  this.ShowSaveButtonOnCkboxChange(this.allReportData);
  //}


  //ShowSaveButtonOnCkboxChange(row) {

  //  this.showMakePaymentButton = this.allReportData.filter(a => a.IsSelected == true).length > 0;
  //  this.isSelectAll = this.allReportData.every(a => a.IsSelected == true);

  //  this.CalculateAmountsForPayment(row);
  //}

  public CalculateAmountsForPayment(data) {
    if (Array.isArray(data)) {
      data.forEach(a => {
        if (!a.IsPaymentProcessed) {
          this.allInctvFracIdToUpdate.push(a.InctvTxnItemId);
          this.reportData.push(a);
        }
        else {
          let index = this.reportData.indexOf(a);
          this.reportData.splice(index, 1);
          this.allInctvFracIdToUpdate.splice(index, 1);
        }
      });
    }
    else if (typeof (data) == 'object') {
      if (data && !data.IsPaymentProcessed) {
        this.allInctvFracIdToUpdate.push(data.InctvTxnItemId);
        this.reportData.push(data);
      }
      else {
        let index = this.reportData.indexOf(data);
        this.reportData.splice(index, 1);
        this.allInctvFracIdToUpdate.splice(index, 1);
      }
    }

    this.CalculateSummaryAmounts(this.reportData);
  }

  public MakePaymentToDoc() {

  }

  //public paidOrNot: boolean = false;

  public getLedgInfoByEmpId() {
    this.showReport = false;
    this.totalAmt = 0;
    this.selectedEmpLedger = new LedgerEmployeeModel();
    if (this.employeeId && this.employeeId > 0) {
      this.selectedEmpLedger = this.allEmpLedgerList.find(l => l.EmployeeId == this.employeeId);
      if (!this.selectedEmpLedger || !this.selectedEmpLedger.LedgerId) {
        this.msgBoxServ.showMessage("notice-message", ["Ledger of this employee is not created. Please create this employee Ledger."]);
      }
    }
  }

  LedgerListFormatter(data: any): string {
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }

  public MakePayment() {
    if (!this.selectedEmpLedger || !this.selectedEmpLedger.LedgerId) {
      this.msgBoxServ.showMessage("notice-message", ["Ledger of this employee is not created. Please create this employee Ledger."]);
      return;
    }
    // if (this.totalAmt < 1) {
    //   this.msgBoxServ.showMessage("failed", ["Voucher Amount is zer or less then zero. Please enter valid voucher amount."]);
    //   return;
    // }
    this.PaymentInfoDetail = new INCTV_TXN_PaymentInfoModel();
    this.PaymentInfoDetail.PaymentDate = this.currentDate;
    this.PaymentInfoDetail.ReceiverId = this.employeeId;
    this.PaymentInfoDetail.TotalAmount = CommonFunctions.parseAmount(this.totalAmt);
    this.PaymentInfoDetail.TDSAmount = CommonFunctions.parseAmount(this.summary.tot_RefTDSAmt + this.summary.tot_AssignTDSAmt);
    this.PaymentInfoDetail.NetPayAmount = CommonFunctions.parseAmount(this.summary.tot_AssignNetPayable + this.summary.tot_RefNetPayable);
    this.PaymentInfoDetail.AdjustedAmount = CommonFunctions.parseAmount(this.adjustedAmount);

    this.PaymentInfoDetail.FromDate = this.selectedFromDate;
    this.PaymentInfoDetail.ToDate = this.selectedToDate;
    this.PaymentInfoDetail.EmployeeId = this.employeeId;

    this.PaymentInfoDetail.CreatedBy = this.securityServ.loggedInUser.EmployeeId;
    this.PaymentInfoDetail.IsActive = true;

    this.transaction = new TransactionModel();
    this.transaction.TransactionItems = [];
    this.transaction.FiscalYearId = 0// NageshBB- add fiscal YearId at server side //this.fiscalYear.FiscalYearId; 
    this.transaction.VoucherId = 0;
    this.transaction.Remarks = (this.narration && this.narration.length) ? this.narration.trim() : '';
    let drTransactionItem: TransactionItem = new TransactionItem();
    let crTransactionItem: TransactionItem = new TransactionItem();
    drTransactionItem.Amount = crTransactionItem.Amount = this.totalAmt;
    drTransactionItem.DrCr = true;
    drTransactionItem.LedgerId = this.selectedEmpLedger.LedgerId;

    crTransactionItem.LedgerId = this.selectedLedger.LedgerId;
    crTransactionItem.DrCr = false;

    this.transaction.TransactionItems.push(crTransactionItem);
    this.transaction.TransactionItems.push(drTransactionItem);

    this.transaction.CreatedBy = this.securityServ.loggedInUser.EmployeeId;

    if (this.selectedLedger && this.selectedLedger.LedgerId && this.transaction.Remarks.trim().length > 0 && this.loading
      && this.PaymentInfoDetail.EmployeeId && this.PaymentInfoDetail.EmployeeId > 0) {
      this.incentiveBLService.PostToIncentiveTransaction(this.PaymentInfoDetail, this.transaction)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.msgBoxServ.showMessage("success", ["Your voucher is posted"]);
            this.employeeId = 0;
            this.Initialize();
            this.showReport = false;
            this.selectedEmpLedger = null;
            this.FromDate = moment().format('YYYY-MM-DD');
            this.ToDate = moment().format('YYYY-MM-DD');
            this.PaymentInfoDetail = new INCTV_TXN_PaymentInfoModel();
            this.currentDate = moment().format('YYYY-MM-DD');
            this.loading = false;
            if (res.Results) {
              this.fiscalYearId = res.Results.FiscalYearId;
              this.voucherNumber = res.Results.VoucherNumber;
            }
          }
        });
    } else {
      this.loading = false;
      this.msgBoxServ.showMessage("error", ["You must enter Narration and Ledger Name"]);
    }

  }

  DateValidCheck() {
    if (this.ToDate && this.FromDate) {
      //get current date, month and time
      var currDate = moment().format('YYYY-MM-DD');

      if ((moment(this.ToDate).diff(currDate) > 0) ||
        (moment(this.ToDate) < moment(this.FromDate))) {
        this.IsDateValid = false;
      }
      else {
        this.IsDateValid = true;
      }
    }
  }
  //This function will create new ledger for selected doctor and will assign value
  public CreateNewLedger() {
    this.showReport = false;
    this.totalAmt = 0;

    this.selectedEmpLedger = new LedgerEmployeeModel();
    if (this.employeeId && this.employeeId > 0) {
      this.ledReferenceId = this.employeeId;
      this.showAddLedgerBox = true;
      this.ledgerType = "consultant";

    } else {
      this.showAddLedgerBox = false;
      this.msgBoxServ.showMessage("notice-message", ["Please select employee for create ledger"]);
    }
  }
  OnNewLedgerAdded($event) {
    this.showAddLedgerBox = false;
    var p = { LedgerId: $event.ledger.LedgerId, EmployeeId: $event.ledger.LedgerReferenceId, LedgerName: $event.ledger.LedgerName, LedgerCode: $event.ledger.Code, LedgerGroupName: $event.ledger.LedgerGroupName };
    if ($event.ledger.LedgerId) {
      this.allEmpLedgerList.push(p);
    }
    this.showReport = false;
    this.totalAmt = 0;
    this.selectedEmpLedger = new LedgerEmployeeModel();
    if (this.employeeId && this.employeeId > 0) {
      this.selectedEmpLedger = this.allEmpLedgerList.find(l => l.EmployeeId == this.employeeId);
      if (!this.selectedEmpLedger || !this.selectedEmpLedger.LedgerId) {
        this.msgBoxServ.showMessage("notice-message", ["Ledger of this employee is not created. Please create this employee Ledger."]);
      }
    }
  }

  //used to format the display of item in ng-autocomplete.
  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  ChangeDocter(docObj) {
    this.employeeId = docObj.EmployeeId;
    this.getLedgInfoByEmpId();
  }

  //sud:28May'20--For Reusable From-Date-To-Date component
  OnDateRangeChange($event) {
    if ($event) {
      this.FromDate = $event.fromDate;
      this.ToDate = $event.toDate;
    }
  }
}


//export class INCTV_TXN_PaymentInfoVM {

//  public PaymentDate: string = '';
//  public ReceiverId: number = 0;
//  public TotalAmount: number = 0;
//  public TDSAmount: number = 0;
//  public NetPayAmount: number = 0;
//  public IsPostedToAccounting: boolean = false;
//  public AccountingPostedDate: string = '';

//}
