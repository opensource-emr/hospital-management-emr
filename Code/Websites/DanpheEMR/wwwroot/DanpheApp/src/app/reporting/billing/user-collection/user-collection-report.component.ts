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
@Component({
  templateUrl: "./user-collection-report.html"
})
export class RPT_BIL_UserCollectionReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
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
  //sud:31Jan'18--added credit received field 
  public summary = {
    tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_Provisonal: 0, tot_Credit: 0, tot_CreditReceived: 0,
    dep_Received: 0, dep_Settled: 0, tot_NetTotal: 0, tot_TotalSales: 0, tot_CashCollection: 0, tot_Receivables: 0
  };

  public summaryFormatted = {
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
    TotalCash: 0
  }

  //    GrossTotal Sales
  //    Discount
  //    Return SubTotal
  //    Return Discount
  //    Return Amount
  //    Net Sales

  //    Less Credit Amount
  //    Add Deposit Received
  //    Less Deposit Refund
  //    Add Collection from Receivables
  //Total Cash Collection


  public gridExportOptions: any;
  constructor(
    _dlService: DLService,
    public settingsBLService: SettingsBLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreService: CoreService,
    public coreBlService: CoreBLService, public nepCalendarService: NepaliCalendarService) {
    this.dlService = _dlService;
    this.currentdailysales.fromDate = this.currentDate = moment().format('YYYY-MM-DD');
    this.currentdailysales.toDate = moment().format('YYYY-MM-DD');
    this.LoadExportOptions();
    this.LoadCounter();
    this.LoadUser();  //pratik:12Dec'19
  }


  Load() {
    //this is syntactic sugar code 
    //Reset all Global variable to Zero 
    ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
    this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.dep_Received = this.summary.dep_Settled = this.summary.tot_Credit = this.summary.tot_CreditReceived = 0;
    this.summary.tot_CashCollection = this.summary.tot_Receivables = 0;

    this.DailySalesReportData = new Array<RPT_BIL_UserCollectionReportModel>();//sud:15Mr'19--reset grid on reload..

    this.dlService.Read("/BillingReports/DailySalesReport?FromDate="
      + this.currentdailysales.fromDate + "&ToDate=" + this.currentdailysales.toDate
      + "&CounterId=" + this.currentdailysales.CounterId + "&CreatedBy=" + this.currentdailysales.CreatedBy)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));


  }
  LoadCounter(): void {
    this.counterlist = DanpheCache.GetData(MasterType.BillingCounter, null);
  }
  Success(res) {
    if (res.Status == "OK") {
      let data = JSON.parse(res.Results.JsonData);
      if (data.SalesData.length > 0) {
        this.DailySalesReportColumns = this.reportServ.reportGridCols.DailySalesReport;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('BillingDate', false));
        this.viewMode = "Show Summary";
        this.IsSummaryViewMode = false;
        this.DailySalesReportData = data.SalesData;
        //this.DailySalesReportData = this.DailySalesReportData.filter(a => a.TotalAmount != 0);
        this.LoadSummaryViewData(data.SalesData, data.SettlementData);
        this.LoadExportOptions();
        this.CalculateSummaryofDifferentColoumnForSum(data.SettlementData);
        //this.summary.dep_Received = CommonFunctions.parseAmount(data.Summary[0].AdvanceReceived);
        //this.summary.dep_Settled = CommonFunctions.parseAmount(data.Summary[0].AdvanceSettled);
        //this.summary.tot_Credit = CommonFunctions.parseAmount(data.Summary[0].CreditAmount);
        this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_CashCollection); //netTotal and cash collection are same here


        //this.summary.tot_TotalSales = CommonFunctions.parseAmount(this.summary.tot_NetTotal - (this.summary.dep_Received - this.summary.dep_Settled) + this.summary.tot_Credit);
        //sud:31Jan'18 -- Credit Received isn't sales, so subtracting it..
        //this.summary.tot_TotalSales = CommonFunctions.parseAmount(this.summary.tot_TotalSales - this.summary.tot_CreditReceived);

      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
      }
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
      customHeader: "FromDate: " + this.currentdailysales.fromDate + "--ToDate:" + this.currentdailysales.toDate
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
        a.download = "UserCollection_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }

  //sud:4Feb'19--we need different Display name for variables used in the code.
  GetSummaryFormatedForExportExcel(): string {
    let summary = this.summaryFormatted;

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

  //sud: 15Feb'19-- renamed by sud.. check below one.. we can remove it if other starts working properly..
  LoadSummaryViewData_Old(reportData) {
    try {
      if (reportData) {
        var helper = {};
        var result1 = reportData.reduce(function (r, o) {
          var key = o.BillingDate + '-' + o.CreatedBy;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o
            r.push(helper[key]);
          } else {
            helper[key].Price += o.SubTotal;
            helper[key].DiscountAmount += o.DiscountAmount;
            helper[key].ReturnedAmount += o.ReturnedAmount;
            helper[key].AdvanceReceived += o.AdvanceReceived;
            helper[key].AdvanceSettlement += o.AdvanceSettlement;
            helper[key].TotalAmount += o.TotalAmount;
          }

          return r;
        }, []);

        result1.sort((a, b) => a.Date < b.Date ? -1 : a.Date > b.name ? 1 : 0);
        this.dailySalesReportSummaryData = result1;
        this.summaryGrandTotal = CommonFunctions.getGrandTotalData(result1);
      }
    } catch (exception) {
      console.log(exception);
    }
  }


  LoadSummaryViewData(reportData, settlementData) {
    try {
      if (reportData) {
        var helper = {};
        var result1: Array<any> = reportData.reduce(function (r, o) {
          var key = o.BillingDate + '-' + o.CreatedBy;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o
            r.push(helper[key]);
          } else {
            helper[key].SubTotal += o.SubTotal;
            helper[key].DiscountAmount += o.DiscountAmount;
            //helper[key].ReturnedAmount += o.ReturnedAmount;
            helper[key].DepositReceived += o.DepositReceived;
            helper[key].DepositRefund += o.DepositRefund;
            helper[key].TotalAmount += o.TotalAmount;
            helper[key].CreditAmount += o.CreditAmount;
            helper[key].CreditReceived += o.CreditReceived;
            helper[key].CashCollection += o.CashCollection;
          }

          return r;
        }, []);

        result1.sort((a, b) => a.Date < b.Date ? -1 : a.Date > b.name ? 1 : 0);

        //console.log(result1);

        //add settlement discount amount etc in this function.
        if (result1 && result1.length > 0 && settlementData && settlementData.length > 0) {

          result1.forEach(usr => {

            let currUsrSettlDiscountAmt = settlementData.filter(s => s.EmployeeId == usr.EmployeeId)
              .reduce(function (acc, obj) { return acc + obj.SettlDiscountAmount; }, 0);
            usr.CashDiscount = currUsrSettlDiscountAmt;
            usr.CashCollection = usr.CashCollection - usr.CashDiscount;
          });

        }


        this.dailySalesReportSummaryData = result1;

        this.summaryGrandTotal = CommonFunctions.getGrandTotalData(result1);
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  //we may not need this function afterwards.. [sud:15Feb'19]
  CalculateSummaryofDifferentColoumnForSum(settlementData) {
    //this.CalculateDepositTransactions(this.DailySalesReportData);


    this.DailySalesReportData.forEach(SumVariable => {
      this.summary.tot_SubTotal += SumVariable.SubTotal;
      this.summary.tot_Discount += SumVariable.DiscountAmount;
      this.summary.tot_NetTotal += SumVariable.TotalAmount;
      this.summary.tot_CreditReceived += SumVariable.CreditReceived;
      this.summary.tot_CashCollection += SumVariable.CashCollection;
      this.summary.tot_Receivables += SumVariable.Receivables;
      this.summary.tot_Credit += SumVariable.CreditAmount;
      this.summary.dep_Received += SumVariable.DepositReceived;
      this.summary.dep_Settled += SumVariable.DepositRefund;
    });

    this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
    this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
    this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
    this.summary.dep_Received = CommonFunctions.parseAmount(this.summary.dep_Received);
    this.summary.dep_Settled = CommonFunctions.parseAmount(this.summary.dep_Settled);
    this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
    this.summary.tot_CreditReceived = CommonFunctions.parseAmount(this.summary.tot_CreditReceived);
    this.summary.tot_Credit = CommonFunctions.parseAmount(this.summary.tot_Credit);
    this.summary.tot_Receivables = CommonFunctions.parseAmount(this.summary.tot_Receivables);
    this.summary.dep_Received = CommonFunctions.parseAmount(this.summary.dep_Received);
    this.summary.dep_Settled = CommonFunctions.parseAmount(this.summary.dep_Settled);


    // this.summaryFormatted.CreditAmount = CommonFunctions.parseAmount(this.summary.tot_Credit);
    //this.summaryFormatted.GrossTotal_Sales = 
    this.GetSalesFigures_Formatted(settlementData);

  }

  GetSalesFigures_Formatted(settlementData) {
    //first list out all sales and return sales.. then do calculation on each type.
    let sales = this.DailySalesReportData.filter(a => a.BillingType == "CashSales" || a.BillingType == "CreditSales");
    let returns = this.DailySalesReportData.filter(a => a.BillingType == "CashReturn" || a.BillingType == "CreditReturn");
    //reduce function usage: acc -> accumulator, initial value=0, obj -> loop variable (object in this case).
    this.summaryFormatted.GrossTotal_Sales = sales.reduce(function (acc, obj) { return acc + obj.SubTotal; }, 0);
    this.summaryFormatted.Discount = sales.reduce(function (acc, obj) { return acc + obj.DiscountAmount; }, 0);
    //since return subtotal and discount comes in negative, we've to multiply it by -1
    this.summaryFormatted.ReturnSubTotal = returns.reduce(function (acc, obj) { return acc + (-1 * obj.SubTotal); }, 0);
    this.summaryFormatted.ReturnDiscount = returns.reduce(function (acc, obj) { return acc + (-1 * obj.DiscountAmount); }, 0);
    this.summaryFormatted.ReturnAmount = this.summaryFormatted.ReturnSubTotal - this.summaryFormatted.ReturnDiscount;
    this.summaryFormatted.DepositReceived = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.DepositReceived; }, 0);
    this.summaryFormatted.DepositRefund = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.DepositRefund; }, 0);
    this.summaryFormatted.NetSales = this.summaryFormatted.GrossTotal_Sales - this.summaryFormatted.Discount - this.summaryFormatted.ReturnAmount;
    this.summaryFormatted.CreditAmount = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.CreditAmount; }, 0);
    this.summaryFormatted.CreditReceived = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.CreditReceived; }, 0);
    this.summaryFormatted.TotalCash = this.DailySalesReportData.reduce(function (acc, obj) { return acc + obj.CashCollection; }, 0);


    this.summaryFormatted.GrossTotal_Sales = CommonFunctions.parseAmount(this.summaryFormatted.GrossTotal_Sales);
    this.summaryFormatted.Discount = CommonFunctions.parseAmount(this.summaryFormatted.Discount);
    this.summaryFormatted.ReturnSubTotal = CommonFunctions.parseAmount(this.summaryFormatted.ReturnSubTotal);
    this.summaryFormatted.ReturnDiscount = CommonFunctions.parseAmount(this.summaryFormatted.ReturnDiscount);
    this.summaryFormatted.DepositReceived = CommonFunctions.parseAmount(this.summaryFormatted.DepositReceived);
    this.summaryFormatted.DepositRefund = CommonFunctions.parseAmount(this.summaryFormatted.DepositRefund);
    this.summaryFormatted.NetSales = CommonFunctions.parseAmount(this.summaryFormatted.NetSales);
    this.summaryFormatted.CreditAmount = CommonFunctions.parseAmount(this.summaryFormatted.CreditAmount);
    this.summaryFormatted.CreditReceived = CommonFunctions.parseAmount(this.summaryFormatted.CreditReceived);
    this.summaryFormatted.TotalCash = CommonFunctions.parseAmount(this.summaryFormatted.TotalCash);


    if (settlementData && settlementData.length > 0) {
      let totCashDiscount = settlementData.reduce(function (acc, obj) { return acc + obj.SettlDiscountAmount; }, 0);
      if (totCashDiscount) {
        this.summaryFormatted.CashDiscount = CommonFunctions.parseAmount(totCashDiscount);
        this.summaryFormatted.TotalCash = CommonFunctions.parseAmount(this.summaryFormatted.TotalCash - totCashDiscount)
      }
    }


  }

  public datePreference: string = "np";


  Print(printId: string) {

    this.datePreference = this.coreService.DatePreference;
    let fromDate_string: string = "";
    let toDate_string: string = "";
    let calendarType: string = "BS";
    if (this.datePreference == "en") {
      fromDate_string = moment(this.fromDate).format("YYYY-MM-DD");
      toDate_string = moment(this.toDate).format("YYYY-MM-DD");
      calendarType = "(AD)";
    }
    else {
      fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
      toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
      calendarType = "(BS)";
    }

    let popupWinindow;
    var printContents = '<b>Date Range' + calendarType + ':  From:' + fromDate_string + '  To:' + toDate_string + '</b>';
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
      let filename = 'usercollectionsummary';
      //NBB-send all parameters for now 
      //need enhancement in this function 
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.currentdailysales.fromDate, this.currentdailysales.toDate, workSheetName,
        Heading, filename);
    }
  }

  public userList: Array<User> = new Array<User>();

  LoadUser() {

    this.settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
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
  }

  public IsLocalDate = true;
  ChangeDateFormate() {
    this.IsLocalDate = !this.IsLocalDate;
  }
}
