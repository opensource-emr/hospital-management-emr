import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_SalesDaybookModel } from "./sales-daybook.model"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DLService } from "../../../shared/dl.service";
import { CommonFunctions } from '../../../shared/common.functions'
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./sales-daybook.html"

})
export class RPT_BIL_SalesDaybookComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public tot_CashSales: number = 0;
  public tot_CashDiscount: number = 0;
  public tot_ReturnCashSales: number = 0;
  public tot_ReturnCashDiscount: number = 0;
  public tot_CreditSales: number = 0;
  public tot_CreditDiscount: number = 0;
  public tot_ReturnCreditSales: number = 0;
  public tot_ReturnCreditDiscount: number = 0;
  public tot_GrossSales: number = 0;
  public tot_TotalDiscount: number = 0;
  public tot_TotalSalesReturn: number = 0;
  public tot_TotalReturnDiscount: number = 0;
  public tot_NetSales: number = 0;
  public tot_DepositReceived: number = 0;
  public tot_DepositDeducted: number = 0;
  public tot_DepositRefund : number = 0;
  public tot_NetCashCollection: number = 0;
  SalesDaybookColumns: Array<any> = null;
  SalesDaybookData: Array<RPT_BIL_SalesDaybookModel> = new Array<RPT_BIL_SalesDaybookModel>();
  public currentsalesdaybook: RPT_BIL_SalesDaybookModel = new RPT_BIL_SalesDaybookModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public footerContent='';
  public dateRange:string="";	
  dlService: DLService = null;
  constructor(_dlService: DLService, public msgBoxServ: MessageboxService,
    public coreService: CoreService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentsalesdaybook.fromDate = moment().format('YYYY-MM-DD');
    this.currentsalesdaybook.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("BillingDate", false));
  }


  gridExportOptions = {
    fileName: 'SalesDayBookList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ngAfterViewChecked(){
    if(document.getElementById("dailySalesSummary")!=null)
    this.footerContent=document.getElementById("dailySalesSummary").innerHTML;  
  }

  Load() {
    //this is syntactic sugar code
    //Reset all Global variable to Zero 
    ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
    if (this.currentsalesdaybook.fromDate != null && this.currentsalesdaybook.toDate != null) {
      this.tot_CashSales = this.tot_CashDiscount = this.tot_ReturnCashSales = this.tot_ReturnCashDiscount = 
      this.tot_CreditSales = this.tot_CreditDiscount= this.tot_ReturnCreditSales = this.tot_ReturnCreditDiscount=
      this.tot_GrossSales =  this.tot_TotalDiscount  = this.tot_TotalSalesReturn = this.tot_TotalReturnDiscount =
      this.tot_NetSales = this.tot_DepositReceived = this.tot_DepositDeducted = this.tot_DepositRefund = 
      this.tot_NetCashCollection = 0;

      this.dlService.Read("/BillingReports/SalesDaybook?FromDate="
        + this.currentsalesdaybook.fromDate + "&ToDate=" + this.currentsalesdaybook.toDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);

  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.SalesDaybookColumns = this.reportServ.reportGridCols.SalesDaybookReport;
      this.SalesDaybookData = res.Results;
      this.SalesDaybookData = this.SalesDaybookData.map(row => {
        row.Paid_SubTotal= CommonFunctions.parseAmount(row.Paid_SubTotal);
        row.Paid_DiscountAmount = CommonFunctions.parseAmount(row.Paid_DiscountAmount);
        row.CashRet_SubTotal = CommonFunctions.parseAmount(row.CashRet_SubTotal);
        row.CashRet_DiscountAmount = CommonFunctions.parseAmount(row.CashRet_DiscountAmount);
        row.CrSales_SubTotal = CommonFunctions.parseAmount(row.CrSales_SubTotal);
        row.CrSales_DiscountAmount = CommonFunctions.parseAmount(row.CrSales_DiscountAmount);
        row.CrRet_SubTotal = CommonFunctions.parseAmount(row.CrRet_SubTotal);
        row.CrRet_DiscountAmount = CommonFunctions.parseAmount(row.CrRet_DiscountAmount);
        row.SubTotal = CommonFunctions.parseAmount(row.SubTotal);
        row.DiscountAmount = CommonFunctions.parseAmount(row.DiscountAmount);
        row.TotalSalesReturn = CommonFunctions.parseAmount(row.TotalSalesReturn);
        row.TotalReturnDiscount = CommonFunctions.parseAmount(row.TotalReturnDiscount);
        row.TotalAmount = CommonFunctions.parseAmount(row.TotalAmount);
        row.DepositReceived = CommonFunctions.parseAmount(row.DepositReceived);
        row.DepositDeducted = CommonFunctions.parseAmount(row.DepositDeducted);
        row.DepositRefund = CommonFunctions.parseAmount(row.DepositRefund);
        row.CashCollection = CommonFunctions.parseAmount(row.CashCollection);
        return row;
      })
      this.CalculateSummaryofDifferentColoumnForSum();
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different'])
      this.SalesDaybookColumns = this.reportServ.reportGridCols.SalesDaybookReport;
      this.SalesDaybookData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  FormatAmounts(reportList: Array<RPT_BIL_SalesDaybookModel>) {

    //let formattedList = reportList.map(rep => {
    //    rep.SubTotal = CommonFunctions.parseAmount(rep.SubTotal);
    //    return rep;
    //});

  }

  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelSalesDayBook?FromDate="
      + this.currentsalesdaybook.fromDate + "&ToDate=" + this.currentsalesdaybook.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "SalesDayBook_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
  CalculateSummaryofDifferentColoumnForSum() {

    //commentd: sud; 27May-- correct it after report's data fields are finalized.
    this.SalesDaybookData.forEach(SumVariable => {
      this.tot_CashSales += SumVariable.Paid_SubTotal;
      this.tot_CashDiscount += SumVariable.Paid_DiscountAmount;
      this.tot_ReturnCashSales += SumVariable.CashRet_SubTotal;
      this.tot_ReturnCashDiscount += SumVariable.CashRet_DiscountAmount;
      this.tot_CreditSales += SumVariable.CrSales_SubTotal;
      this.tot_CreditDiscount += SumVariable.CrSales_DiscountAmount;
      this.tot_ReturnCreditSales += SumVariable.CrRet_SubTotal;
      this.tot_ReturnCreditDiscount += SumVariable.CrRet_DiscountAmount;
      this.tot_GrossSales += SumVariable.SubTotal;
      this.tot_TotalDiscount += SumVariable.DiscountAmount;
      this.tot_TotalSalesReturn += SumVariable.TotalSalesReturn;
      this.tot_TotalReturnDiscount += SumVariable.TotalReturnDiscount;
      this.tot_NetSales += SumVariable.TotalAmount;
      this.tot_DepositReceived += SumVariable.DepositReceived;
      this.tot_DepositDeducted += SumVariable.DepositDeducted;
      this.tot_DepositRefund += SumVariable.DepositRefund;
      this.tot_NetCashCollection += SumVariable.CashCollection;

    });

  }
  //Anjana:10June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentsalesdaybook.fromDate = this.fromDate;
    this.currentsalesdaybook.toDate = this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
}
