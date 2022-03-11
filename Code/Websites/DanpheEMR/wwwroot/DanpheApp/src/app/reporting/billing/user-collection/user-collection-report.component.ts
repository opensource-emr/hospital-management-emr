import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { CommonFunctions } from '../../../shared/common.functions';
import { RPT_BIL_UserCollectionReportModel } from "./user-collection-report.model";

import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreBLService } from "../../../core/shared/core.bl.service"
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { User } from '../../../security/shared/user.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { SecurityService } from '../../../security/shared/security.service';
@Component({
  templateUrl: "./user-collection-report.html"
})
export class RPT_BIL_UserCollectionReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";
  public viewMode: string = "Show Summary View";
  public IsSummaryViewMode: boolean = false;
  public CounterId: number = 0;
  public CreatedBy: string = "";
  public currentDate: string = null;
  public summaryGrandTotal: any = [];
  DailySalesReportColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  DailySalesReportData: Array<any> = new Array<RPT_BIL_UserCollectionReportModel>();
  dailySalesReportSummaryData: Array<any> = new Array<RPT_BIL_UserCollectionReportModel>();
  dynamicColumns: Array<string> = new Array<string>();
  public currentdailysales: RPT_BIL_UserCollectionReportModel = new RPT_BIL_UserCollectionReportModel();
  public counterlist: any;
  dlService: DLService = null;


  public total_DetailedView = {
    GrossTotal_Sales: 0,
    Discount: 0,
    ReturnSubTotal: 0,
    ReturnDiscount: 0,
    ReturnAmount: 0,
    NetSales: 0,
    CreditAmount: 0,
    DepositReceived: 0,
    DepositRefund: 0,
    CreditReceived: 0,
    CashDiscount: 0,//sud:7Aug'19--To deduct Settlement Discount Amount.
    OtherPayments: 0,
    TotalCash: 0
  }

  public total_SummaryView = {
    CashSales_Amount: 0,
    CashSales_ReturnAmount: 0,
    Deposit_Received: 0,
    Deposit_Refund: 0,
    CollectionFromReceivables: 0,
    Sett_CashDiscount: 0,
    OtherPaymentsGiven: 0,
    NetCollection: 0,
  }



  public gridExportOptions: any;
  public footerContent = '';
  public loading: boolean = false;//sud:22Sep'21--to handle multiple clicks on show report button.

  public isReportDataLoaded: boolean = false; //we need to show/hide some sections only after report is loaded. need this field to show/hide all the sections 
  public otherPaymentsLabelSettingsValue : any;
  public showOtherPayment : boolean = true;
  public selectedUser : any = "";
  constructor(
    _dlService: DLService,
    public settingsBLService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public coreBlService: CoreBLService,
    public nepCalendarService: NepaliCalendarService) {

    this.dlService = _dlService;
    this.currentdailysales.fromDate = this.currentDate = moment().format('YYYY-MM-DD');
    this.currentdailysales.toDate = moment().format('YYYY-MM-DD');
    this.LoadExportOptions();
    this.LoadCounter();
    this.LoadUser();  //pratik:12Dec'19
    this.GetHeaderParameter();
  }

  public CurrentUser = '';
  ngOnInit() {

  }


  ngAfterViewChecked() {
    if (document.getElementById("print_netCashCollection") != null)
      this.footerContent = document.getElementById("print_netCashCollection").innerHTML;
  }

  Load() {
    this.loading = true;//disable button until response comes back from api.
    this.isReportDataLoaded = false;//this will hide summary section and grid until data is loaded.
    //this is syntactic sugar code 
    //Reset all Global variable to Zero 
    ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
    //this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.dep_Received = this.summary.dep_Settled = this.summary.tot_Credit = this.summary.tot_CreditReceived = 0;
    //this.summary.tot_CashCollection = this.summary.tot_Receivables = 0;

    this.DailySalesReportData = new Array<RPT_BIL_UserCollectionReportModel>();//sud:15Mr'19--reset grid on reload..

    this.dlService.Read("/BillingReports/DailySalesReport?FromDate="
      + this.currentdailysales.fromDate + "&ToDate=" + this.currentdailysales.toDate
      + "&CounterId=" + this.currentdailysales.CounterId + "&CreatedBy=" + this.currentdailysales.EmployeeId)
      .map(res => res)
      .finally(() => { this.loading = false; this.isReportDataLoaded = true; })//re-enable button after response comes back. Also Show the summary and other sections after that.
      .subscribe(res => this.Success(res),
        res => this.Error(res));


  }
  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.BillingCounter, null);
  }
  Success(res) {
    if (res.Status == "OK") {
      let data = res.Results;
      // if (data.UserCollectionDetails.length > 0) {
      this.DailySalesReportColumns = this.reportServ.reportGridCols.DailySalesReport;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('BillingDate', false));
      this.viewMode = "Show Summary";
      this.IsSummaryViewMode = false;
      this.DailySalesReportData = data.UserCollectionDetails;
      this.dailySalesReportSummaryData = data.UserCollectionSummary;
      this.CalculateTotalAmountsForDetailedView(data.UserCollectionDetails, data.SettlementSummary, data.Total_OtherPaymentsGiven);
      this.CalculateTotalAmountsForSummaryView(data.UserCollectionSummary);
      this.LoadExportOptions();
      // }
      // else {
      //   this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
      // }
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  LoadExportOptions() {

    this.gridExportOptions = {
      fileName: 'DailySalesReportList_' + moment().format('YYYY-MM-DD') + '.xls',
      //customHeader: "FromDate: " + this.currentdailysales.fromDate + "--ToDate:" + this.currentdailysales.toDate
      //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
    };
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    //let jsonStrSummary = JSON.stringify(this.summary);
    let jsonStrSummary = this.GetSummaryFormatedForExportExcel();

    let summaryHeader = "Calculation Summary";

    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDailySales?FromDate="
      + this.currentdailysales.fromDate + "&ToDate=" + this.currentdailysales.toDate
      + "&CounterId=" + this.currentdailysales.CounterId + "&CreatedBy=" + this.currentdailysales.CreatedBy
      + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "UserCollection_" + moment().format("DD-MMM-YYYY_HHmm") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }

  //sud:4Feb'19--we need different Display name for variables used in the code.
  GetSummaryFormatedForExportExcel(): string {
    let summary = this.total_DetailedView;

    let summaryFormatted = {
      "Gross Total Sales": summary.GrossTotal_Sales,
      "Discount": summary.Discount,
      "Return SubTotal": summary.ReturnSubTotal,
      "Return Discount": summary.ReturnDiscount,
      "Return Amount": summary.ReturnAmount,
      "Net Sales": summary.NetSales,
      "Less Credit Amount": summary.CreditAmount,
      "Add Deposit Received": summary.DepositReceived,
      "Less Deposit Refund": summary.DepositRefund,
      "Add Collection From Receivables": summary.CreditReceived,
      "Less Cash Discount": summary.CashDiscount,
      "Total Cash Collection": summary.TotalCash
    };

    return JSON.stringify(summaryFormatted);
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
  SwitchViews() {
    try {
      if (this.DailySalesReportData.length > 0) {
        let flag = (this.IsSummaryViewMode == true) ? false : true;
        this.IsSummaryViewMode = flag;
        this.viewMode = (this.IsSummaryViewMode) ? "Show Detailed" : "Show Summary";
      }
    } catch (exception) {
      console.log(exception);
    }
  }


  // LoadSummaryViewData_Old(reportData) {
  //   try {
  //     if (reportData) {
  //       var helper = {};
  //       var result1: Array<any> = reportData.reduce(function (r, o) {
  //         var key = o.BillingDate + '-' + o.CreatedBy;
  //         if (!helper[key]) {
  //           helper[key] = Object.assign({}, o); // create a copy of o
  //           r.push(helper[key]);
  //         } else {
  //           helper[key].SubTotal += o.SubTotal;
  //           helper[key].DiscountAmount += o.DiscountAmount;
  //           //helper[key].ReturnedAmount += o.ReturnedAmount;
  //           helper[key].DepositReceived += o.DepositReceived;
  //           helper[key].DepositRefund += o.DepositRefund;
  //           helper[key].TotalAmount += o.TotalAmount;
  //           helper[key].CreditAmount += o.CreditAmount;
  //           helper[key].CreditReceived += o.CreditReceived;
  //           helper[key].CashCollection += o.CashCollection;
  //         }
  //         return r;
  //       }, []);
  //       result1.sort((a, b) => a.Date < b.Date ? -1 : a.Date > b.name ? 1 : 0);
  //       //console.log(result1);
  //       //add settlement discount amount etc in this function.
  //       if (result1 && result1.length > 0 && settlementData && settlementData.length > 0) {
  //         result1.forEach(usr => {
  //           let currUsrSettlDiscountAmt = settlementData.filter(s => s.EmployeeId == usr.EmployeeId)
  //             .reduce(function (acc, obj) { return acc + obj.SettlDiscountAmount; }, 0);
  //           usr.CashDiscount = currUsrSettlDiscountAmt;
  //           usr.CashCollection = usr.CashCollection - usr.CashDiscount;
  //         });
  //       }
  //       this.dailySalesReportSummaryData = result1;
  //       this.summaryGrandTotal = CommonFunctions.getGrandTotalData(result1);
  //     }
  //   } catch (exception) {
  //     console.log(exception);
  //   }
  // }
  //we may not need this function afterwards.. [sud:15Feb'19]
  // CalculateSummaryofDifferentColoumnForSum(settlementData) {
  //   //this.CalculateDepositTransactions(this.DailySalesReportData);
  //   this.DailySalesReportData.forEach(SumVariable => {
  //     this.summary.tot_SubTotal += SumVariable.SubTotal;
  //     this.summary.tot_Discount += SumVariable.DiscountAmount;
  //     this.summary.tot_NetTotal += SumVariable.TotalAmount;
  //     this.summary.tot_CreditReceived += SumVariable.CreditReceived;
  //     this.summary.tot_CashCollection += SumVariable.CashCollection;
  //     this.summary.tot_Receivables += SumVariable.Receivables;
  //     this.summary.tot_Credit += SumVariable.CreditAmount;
  //     this.summary.dep_Received += SumVariable.DepositReceived;
  //     this.summary.dep_Settled += SumVariable.DepositRefund;
  //   });

  //   this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
  //   this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
  //   this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
  //   this.summary.dep_Received = CommonFunctions.parseAmount(this.summary.dep_Received);
  //   this.summary.dep_Settled = CommonFunctions.parseAmount(this.summary.dep_Settled);
  //   this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
  //   this.summary.tot_CreditReceived = CommonFunctions.parseAmount(this.summary.tot_CreditReceived);
  //   this.summary.tot_Credit = CommonFunctions.parseAmount(this.summary.tot_Credit);
  //   this.summary.tot_Receivables = CommonFunctions.parseAmount(this.summary.tot_Receivables);
  //   this.summary.dep_Received = CommonFunctions.parseAmount(this.summary.dep_Received);
  //   this.summary.dep_Settled = CommonFunctions.parseAmount(this.summary.dep_Settled);


  //   // this.summaryFormatted.CreditAmount = CommonFunctions.parseAmount(this.summary.tot_Credit);
  //   //this.summaryFormatted.GrossTotal_Sales = 
  //   this.GetSalesFigures_Formatted(settlementData);

  // }

  CalculateTotalAmountsForDetailedView(userCollnDetails, settlementSummary, otherPmtAmount: number) {

    //first list out all sales and return sales.. then do calculation on each type.
    let sales = this.DailySalesReportData.filter(a => a.BillingType == "CashSales" || a.BillingType == "CreditSales");
    let returns = this.DailySalesReportData.filter(a => a.BillingType == "CashReturn" || a.BillingType == "CreditReturn");

    //reduce function usage: acc -> accumulator, initial value=0, obj -> loop variable (object in this case).
    this.total_DetailedView.GrossTotal_Sales = sales.reduce(function (acc, obj) { return acc + obj.SubTotal; }, 0);
    this.total_DetailedView.Discount = sales.reduce(function (acc, obj) { return acc + obj.DiscountAmount; }, 0);
    //since return subtotal and discount comes in negative, we've to multiply it by -1
    this.total_DetailedView.ReturnSubTotal = returns.reduce(function (acc, obj) { return acc + (-1 * obj.SubTotal); }, 0);
    this.total_DetailedView.ReturnDiscount = returns.reduce(function (acc, obj) { return acc + (-1 * obj.DiscountAmount); }, 0);
    this.total_DetailedView.ReturnAmount = this.total_DetailedView.ReturnSubTotal - this.total_DetailedView.ReturnDiscount;
    this.total_DetailedView.DepositReceived = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.DepositReceived; }, 0);
    this.total_DetailedView.DepositRefund = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.DepositRefund; }, 0);
    this.total_DetailedView.NetSales = this.total_DetailedView.GrossTotal_Sales - this.total_DetailedView.Discount - this.total_DetailedView.ReturnAmount;
    this.total_DetailedView.CreditAmount = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.CreditAmount; }, 0);
    this.total_DetailedView.TotalCash = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.CashCollection; }, 0);

    this.total_DetailedView.GrossTotal_Sales = CommonFunctions.parseAmount(this.total_DetailedView.GrossTotal_Sales);
    this.total_DetailedView.Discount = CommonFunctions.parseAmount(this.total_DetailedView.Discount);
    this.total_DetailedView.ReturnSubTotal = CommonFunctions.parseAmount(this.total_DetailedView.ReturnSubTotal);
    this.total_DetailedView.ReturnDiscount = CommonFunctions.parseAmount(this.total_DetailedView.ReturnDiscount);
    this.total_DetailedView.DepositReceived = CommonFunctions.parseAmount(this.total_DetailedView.DepositReceived);
    this.total_DetailedView.DepositRefund = CommonFunctions.parseAmount(this.total_DetailedView.DepositRefund);
    this.total_DetailedView.NetSales = CommonFunctions.parseAmount(this.total_DetailedView.NetSales);
    this.total_DetailedView.CreditAmount = CommonFunctions.parseAmount(this.total_DetailedView.CreditAmount);

    this.total_DetailedView.TotalCash = CommonFunctions.parseAmount(this.total_DetailedView.TotalCash);
    this.total_DetailedView.OtherPayments = otherPmtAmount ? otherPmtAmount : 0;//sud:26Nov'21--For Maternity Payment handling..

    if (settlementSummary) {
      this.total_DetailedView.CreditReceived = settlementSummary.CollectionFromReceivables ? settlementSummary.CollectionFromReceivables : 0;
      this.total_DetailedView.CashDiscount = settlementSummary.CashDiscountGiven - settlementSummary.CashDiscountReceived;
      this.total_DetailedView.TotalCash = this.total_DetailedView.TotalCash + this.total_DetailedView.CreditReceived - this.total_DetailedView.CashDiscount;
    }

    //other payment given by User shall be deducted from the total cash collection..
    if (otherPmtAmount) {
      this.total_DetailedView.TotalCash = this.total_DetailedView.TotalCash - otherPmtAmount;
    }
  }



  CalculateTotalAmountsForSummaryView(collnSummaryList: Array<any>) {
    //reset summary data to Zero so that values doesn't add up on every reload.
    this.total_SummaryView.CashSales_Amount = this.total_SummaryView.CashSales_ReturnAmount = this.total_SummaryView.CollectionFromReceivables
      = this.total_SummaryView.Deposit_Received = this.total_SummaryView.Deposit_Refund
      = this.total_SummaryView.Sett_CashDiscount = this.total_SummaryView.NetCollection = this.total_SummaryView.OtherPaymentsGiven = 0;
    if (collnSummaryList && collnSummaryList.length > 0) {
      collnSummaryList.forEach(row => {
        this.total_SummaryView.CashSales_Amount += row.CashSales_Amount;
        this.total_SummaryView.CashSales_ReturnAmount += row.CashSales_ReturnAmount;
        this.total_SummaryView.CollectionFromReceivables += row.CollectionFromReceivables;
        this.total_SummaryView.Deposit_Received += row.Deposit_Received;
        this.total_SummaryView.Deposit_Refund += row.Deposit_Refund;
        this.total_SummaryView.Sett_CashDiscount += row.Sett_CashDiscount;
        this.total_SummaryView.OtherPaymentsGiven += row.OtherPaymentsGiven;
        this.total_SummaryView.NetCollection += row.NetCollection;
      });
    }
  }



  public datePreference: string = "np";


  Print(printId: string) {

    this.datePreference = this.coreService.DatePreference;
    let fromDate_string: string = "";
    let toDate_string: string = "";
    let printedDate: any = moment().format("YYYY-MM-DD HH:mm");
    let printedDate_string: string = "";
    let calendarType: string = "BS";
    if (this.datePreference == "en") {
      fromDate_string = moment(this.fromDate).format("YYYY-MM-DD");
      toDate_string = moment(this.toDate).format("YYYY-MM-DD");
      printedDate_string = printedDate;
      calendarType = "(AD)";
    }
    else {
      fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
      toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");
      printedDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD HH:mm");
      calendarType = "(BS)";
    }

    let popupWinindow;
    var printContents = '<div style="text-align: center">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">User Collection Report (Summary)</div>' + '<br>';
    printContents += '<b style="float: left">Date Range' + calendarType + ':  From:' + fromDate_string + '  To:' + toDate_string + '</b>' + '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += '<b style="float: right"> Printed On :' + printedDate_string + '</b>';
    printContents += document.getElementById(printId).innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }


  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'User Collection Summary Report';
      let Heading = 'user collection summary';
      //let Heading = this.headerDetail;
      let filename = 'usercollectionsummary';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      this.ConvertHTMLTableToExcel(tableId, workSheetName, filename);
    }
  }

  public ConvertHTMLTableToExcel(table: any, SheetName: string, FileName: string) {
    try {
      if (table) {
        let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';
        this.datePreference = this.coreService.DatePreference;
        let fromDate_string: string = "";
        let toDate_string: string = "";
        let printedDate: any = moment().format("YYYY-MM-DD HH:mm");
        let printedDate_string: string = "";
        let calendarType: string = "BS";
        if (this.datePreference == "en") {
          fromDate_string = moment(this.fromDate).format("YYYY-MM-DD");
          toDate_string = moment(this.toDate).format("YYYY-MM-DD");
          printedDate_string = printedDate;
          calendarType = "(AD)";
        }
        else {
          fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
          toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");
          printedDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD HH:mm");
          calendarType = "(BS)";
        }

        let Heading = this.Header + '<tr><td></td><td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>' + 'User Collection Report (Summary)' + '</strong></td></tr><br/>' +
          '<tr></tr><tr></tr><td  colspan="4" style="text-align:center;font-size:small;">' + '<b style="float: left">Date Range' + calendarType + ':  From:' + fromDate_string + '  To:' + toDate_string + '</b>' + '</td><td></td><td></td><td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>' + '<b style="float: right"> Exported By :' + this.CurrentUser + '</b><br>' + '</strong></td></tr>';
        Heading += '<tr><td  colspan="4"></td><td></td><td></td><td></td><td></td><td colspan="4" style="text-align:center;font-size:small;"><strong>' + '<b style="float: right"> Exported On :' + printedDate_string + '</b><br>' + '</strong></td></tr><br/>';

        let filename = (FileName.length > 0) ? FileName : 'Exported_Excel_File';
        filename = filename + '_' + moment().format('YYYYMMMDHHmmss') + '.xls';

        let uri = 'data:application/vnd.ms-excel;base64,'
          , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{Heading}{table}</table></body></html>'
          , base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))) }
          , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = { worksheet: workSheetName, table: table.innerHTML, Heading: Heading }
        //return window.location.href = uri + base64(format(template, ctx))             
        var link = document.createElement('a');
        link.href = uri + base64(format(template, ctx));
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  public Header: string = '';

  GetHeaderParameter() {
    var customerHeaderparam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if (customerHeaderparam != null) {
      var customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        var headerDetail = JSON.parse(customerHeaderParamValue);

        this.Header = `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:large;"><strong>${headerDetail.hospitalName}</strong></td>
      </tr>
       <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:small;"><strong>${headerDetail.address}</strong></td>
      </tr>`;

      }
    }
    var param = this.coreService.Parameters.find(a => a.ParameterGroupName == "BillingReport" && a.ParameterName == "UserCollectionOtherPaymentsLabelSettings");
    if(param !=null){
      var data = param.ParameterValue;
      if(data){
        this.otherPaymentsLabelSettingsValue = JSON.parse(data);
        this.showOtherPayment = JSON.parse(this.otherPaymentsLabelSettingsValue.Show);
      }
    }
  }

  public userList: Array<User> = new Array<User>();

  LoadUser() {
    this.settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
          this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  userChanged(){
    this.currentdailysales.EmployeeId = this.selectedUser.EmployeeId ? this.selectedUser.EmployeeId : null;
  }
  UserListFormatter(data: any): string {
    return data["EmployeeName"];
  }

  //sud:6June'20--reusable From-ToDate
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdailysales.fromDate = this.fromDate;
    this.currentdailysales.toDate = this.toDate;

    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

  public IsLocalDate = true;
  ChangeDateFormate() {
    this.IsLocalDate = !this.IsLocalDate;
  }
}
