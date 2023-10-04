import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
  templateUrl: "./income-segregation.html"
})
export class RPT_BIL_IncomeSegregationComponent {

  public fromDate: string = null;
  public toDate: string = null;
  public selBillingTypeName: string = "all";
  public dateRange: string = "";
  //below variables are for calcuation of summary amounts.
  public tot_CashSales: number = 0;
  public tot_CashDiscount: number = 0;
  public tot_CreditSales: number = 0;
  public tot_CreditDiscount: number = 0;
  public tot_GrossSales: number = 0;
  public tot_TotalDiscount: number = 0;
  public tot_ReturnCashSales: number = 0;
  public tot_ReturnCashDiscount: number = 0;
  public tot_ReturnCreditSales: number = 0;
  public tot_ReturnCreditDiscount: number = 0;
  public tot_TotalSalesReturn: number = 0;
  public tot_TotalReturnDiscount: number = 0;
  public tot_NetSales: number = 0;

  public tot_SalesQty: number = 0;
  public tot_RetSalesQty: number = 0;
  public tot_NetQty: number = 0;

  //	CashSales	CashDiscount	CreditSales	CreditDiscount	GrossSales	TotalDiscount	ReturnCashSales	ReturnCashDiscount	
  //ReturnCreditSales	ReturnCreditDiscount	TotalSalesReturn	TotalReturnDiscount	NetSales

  IncomeSegregationColumns: Array<any> = null;

  //need rawData for Accurate Calculatition of Summary Records.
  //when we round-off many rows, then there is chance of mismatch between actual data and the Summary.
  incomeSegregationData: Array<any> = new Array<any>();
  //need formattedData to display in Grid. Formatting in grid is tedious. need to write a lot of functions for one single task.
  //incomeSeg_FormattedData: Array<any> = new Array<any>();

  dynamicColumns: Array<string> = new Array<string>();

  public grandTotal: any;
  public footerContent = '';//sud:24Aug'21--For Summary.

  constructor(
    public dlService: DLService, public msgBoxServ: MessageboxService, public coreService: CoreService, public reportServ: ReportingService) {
  }

  ngAfterViewChecked() {
    this.footerContent = document.getElementById("dvSummary_IncomeSegregationReport").innerHTML;
  }

  gridExportOptions = {
    fileName: 'IncomeSegregation_' + moment().format('YYYY-MM-DD') + '.xls'
  };

  public loading: boolean = false;
  
  Load() {
    //this is syntactic sugar code 
    //Reset all Global variable to Zero 
    ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
    this.incomeSegregationData = [];

    if (this.fromDate != null && this.toDate != null) {
      this.dlService.Read("/BillingReports/IncomeSegregationStaticReport?FromDate="
        + this.fromDate + "&ToDate=" + this.toDate + "&billingType=" + this.selBillingTypeName)
        .map(res => res)
        .finally(() => { this.loading = false; })
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.IncomeSegregationColumns = this.reportServ.reportGridCols.GetColumn_Billing_IncomeSegregation;
      this.incomeSegregationData = res.Results;
      this.CalculateSummaryAmounts(this.incomeSegregationData);
      this.FormatAmountsForGrid(this.incomeSegregationData);//pass this data for formatting.
      this.footerContent = document.getElementById("dvSummary_IncomeSegregationReport").innerHTML;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ["No Data is Available For Selcted Parameter"]);
      this.IncomeSegregationColumns = this.reportServ.reportGridCols.GetColumn_Billing_IncomeSegregation;
      this.incomeSegregationData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //Function to parse each amount properites of the incomesegregation.
  public FormatAmountsForGrid(ipDataArr: Array<any>) {
    if (ipDataArr && ipDataArr.length) {
      ipDataArr.forEach(itm => {
        itm.CashSales = CommonFunctions.parseAmount(itm.CashSales);
        itm.CashDiscount = CommonFunctions.parseAmount(itm.CashDiscount);
        itm.CreditSales = CommonFunctions.parseAmount(itm.CreditSales);
        itm.CreditDiscount = CommonFunctions.parseAmount(itm.CreditDiscount);
        itm.GrossSales = CommonFunctions.parseAmount(itm.GrossSales);
        itm.TotalDiscount = CommonFunctions.parseAmount(itm.TotalDiscount);
        itm.ReturnCashSales = CommonFunctions.parseAmount(itm.ReturnCashSales);
        itm.ReturnCashDiscount = CommonFunctions.parseAmount(itm.ReturnCashDiscount);
        itm.ReturnCreditDiscount = CommonFunctions.parseAmount(itm.ReturnCreditDiscount);
        itm.TotalSalesReturn = CommonFunctions.parseAmount(itm.TotalSalesReturn);
        itm.TotalReturnDiscount = CommonFunctions.parseAmount(itm.TotalReturnDiscount);
        itm.NetSales = CommonFunctions.parseAmount(itm.NetSales);
        itm.TotalSaleQuantity = CommonFunctions.parseAmount(itm.TotalSaleQuantity);
        itm.TotalReturnQuantity = CommonFunctions.parseAmount(itm.TotalReturnQuantity);
        itm.NetQuantity = CommonFunctions.parseAmount(itm.NetQuantity);
      });
    }
  }

  public CalculateSummaryAmounts(ipDataArr: Array<any>) {
    //resetting all Sum variables to ZERO.
    this.tot_CashSales = this.tot_CashDiscount = this.tot_CreditSales = this.tot_CreditDiscount = this.tot_GrossSales = this.tot_TotalDiscount =
      this.tot_ReturnCashSales = this.tot_ReturnCashDiscount = this.tot_ReturnCreditSales = this.tot_ReturnCreditDiscount = this.tot_TotalSalesReturn =
      this.tot_TotalReturnDiscount = this.tot_NetSales = this.tot_SalesQty = this.tot_RetSalesQty = this.tot_NetQty = 0;


    if (ipDataArr && ipDataArr.length) {
      ipDataArr.forEach(itm => {
        this.tot_CashSales += itm.CashSales;
        this.tot_CashDiscount += itm.CashDiscount;
        this.tot_CreditSales += itm.CreditSales;
        this.tot_CreditDiscount += itm.CreditDiscount;
        this.tot_GrossSales += itm.GrossSales;
        this.tot_TotalDiscount += itm.TotalDiscount;
        this.tot_ReturnCashSales += itm.ReturnCashSales;
        this.tot_ReturnCashDiscount += itm.ReturnCashDiscount;
        this.tot_ReturnCreditSales += itm.ReturnCreditSales;
        this.tot_ReturnCreditDiscount += itm.ReturnCreditDiscount;
        this.tot_TotalSalesReturn += itm.TotalSalesReturn;
        this.tot_TotalReturnDiscount += itm.TotalReturnDiscount;
        this.tot_NetSales += itm.NetSales;

        this.tot_SalesQty += itm.TotalSaleQuantity;
        this.tot_RetSalesQty += itm.TotalReturnQuantity;
        this.tot_NetQty += itm.NetQuantity;
      });

      this.tot_CashSales = CommonFunctions.parseAmount(this.tot_CashSales);
      this.tot_CashDiscount = CommonFunctions.parseAmount(this.tot_CashDiscount);
      this.tot_CreditSales = CommonFunctions.parseAmount(this.tot_CreditSales);
      this.tot_CreditDiscount = CommonFunctions.parseAmount(this.tot_CreditDiscount);
      this.tot_GrossSales = CommonFunctions.parseAmount(this.tot_GrossSales);
      this.tot_TotalDiscount = CommonFunctions.parseAmount(this.tot_TotalDiscount);
      this.tot_ReturnCashSales = CommonFunctions.parseAmount(this.tot_ReturnCashSales);
      this.tot_ReturnCashDiscount = CommonFunctions.parseAmount(this.tot_ReturnCashDiscount);
      this.tot_ReturnCreditSales = CommonFunctions.parseAmount(this.tot_ReturnCreditSales);
      this.tot_ReturnCreditDiscount = CommonFunctions.parseAmount(this.tot_ReturnCreditDiscount);
      this.tot_TotalSalesReturn = CommonFunctions.parseAmount(this.tot_TotalSalesReturn);
      this.tot_TotalReturnDiscount = CommonFunctions.parseAmount(this.tot_TotalReturnDiscount);
      this.tot_NetSales = CommonFunctions.parseAmount(this.tot_NetSales);

      this.tot_SalesQty = CommonFunctions.parseAmount(this.tot_SalesQty);
      this.tot_RetSalesQty = CommonFunctions.parseAmount(this.tot_RetSalesQty);
      this.tot_NetQty = CommonFunctions.parseAmount(this.tot_NetQty);
    }


  }


  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelIncomeSegregation?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "IncomeSegregation_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

}
