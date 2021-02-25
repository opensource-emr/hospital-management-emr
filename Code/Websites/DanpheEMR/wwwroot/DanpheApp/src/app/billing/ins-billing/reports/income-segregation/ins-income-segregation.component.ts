import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import { DLService } from "../../../../shared/dl.service"


import * as moment from 'moment/moment';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../../shared/common.functions';

import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { RPT_BIL_IncomeSegregationModel } from '../../../../reporting/billing/income-segregation/income-segregation.model';
import { RPT_BIL_SalesDaybookModel } from '../../../../reporting/billing/sales-daybook/sales-daybook.model';
import { CoreService } from '../../../../core/shared/core.service';

@Component({
  selector:'ins-income-segregation',
  templateUrl: "./ins-income-segregation.html"
})

export class INSIncomeSegregationComponent {

  public fromDate: string = null;
  public toDate: string = null;

  public tot_Price: number = 0;
  public tot_Tax: number = 0;
  public tot_DiscntAmt: number = 0;
  public tot_TotalAmount: number = 0;
  public tot_ReturnAmount: number = 0;
  public tot_NetSales: number = 0;
  public tot_AdvanceSettlement: number = 0;
  public tot_AdvanceReceived: number = 0;
  public tot_CashCollection: number = 0;
  public tot_CreditReceived: number = 0;
  public tot_CreditSales: number = 0;
  public tot_NetCashCollection: number = 0;
  public tot_Receivable: number = 0;
  public tot_CancelTax: number = 0;
  public tot_CancelAmount: number = 0;

  public tot_accRecord_taxableIncome: number = 0;//sud: 21Mar'19--For Accounting Records, TaxableIncome/Net Sales
  public tot_accRecord_totalSales: number = 0;//sud: 21Mar'19--For Accounting Records, Total Sales.

  public currentIncomeSegregation: RPT_BIL_IncomeSegregationModel = new RPT_BIL_IncomeSegregationModel();
  public currentsalesdaybook: RPT_BIL_SalesDaybookModel = new RPT_BIL_SalesDaybookModel();

  IncomeSegregationColumns: Array<any> = null;
  IncomeSegregationData: Array<any> = new Array<any>();
  SalesDaybookData: Array<any> = new Array<RPT_BIL_SalesDaybookModel>();

  dynamicColumns: Array<string> = new Array<string>();
  dlService: DLService = null;
  public grandTotal: any;
  constructor(
    _dlService: DLService, public msgBoxServ: MessageboxService, public coreService: CoreService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentIncomeSegregation.fromDate = moment().format('YYYY-MM-DD');
    this.currentIncomeSegregation.toDate = moment().format('YYYY-MM-DD');
    this.currentsalesdaybook.fromDate = moment().format('YYYY-MM-DD');
    this.currentsalesdaybook.toDate = moment().format('YYYY-MM-DD');
  }
  gridExportOptions = {
    fileName: 'IncomeSegregation_' + moment().format('YYYY-MM-DD') + '.xls'

  };


  Load() {
    //this is syntactic sugar code 
    //Reset all Global variable to Zero 
    ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
    this.tot_Price = this.tot_Tax = this.tot_DiscntAmt = this.tot_TotalAmount = this.tot_ReturnAmount =
      this.tot_NetSales = this.tot_CashCollection = this.tot_AdvanceSettlement = this.tot_AdvanceReceived =
      this.tot_CreditReceived = this.tot_CreditSales = this.tot_NetCashCollection = this.tot_Receivable =
      this.tot_CancelTax = this.tot_CancelAmount = 0;

    if (this.currentIncomeSegregation.fromDate != null && this.currentIncomeSegregation.toDate != null) {
      this.dlService.Read("/BillingReports/IncomeSegregationStaticReport?FromDate="
        + this.currentIncomeSegregation.fromDate + "&ToDate=" + this.currentIncomeSegregation.toDate + "&IsInsurance=true")
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.IncomeSegregationColumns = this.reportServ.reportGridCols.GetColumn_Billing_IncomeSegregation;
      this.IncomeSegregationData = res.Results;
      //this.CalculateSummaryofDifferentColoumnForSum();
      this.GetSalesDayBookData();
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ["No Data is Available For Selcted Parameter"]);
      this.IncomeSegregationColumns = this.reportServ.reportGridCols.GetColumn_Billing_IncomeSegregation;
      this.IncomeSegregationData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  GetSalesDayBookData() {

    this.dlService.Read("/BillingReports/SalesDaybook?FromDate="
      + this.currentIncomeSegregation.fromDate + "&ToDate=" + this.currentIncomeSegregation.toDate + "&IsInsurance=true")
      .map(res => res)
      .subscribe(res => this.SuccessSalesDayBook(res),
        res => this.Error(res));
  }

  SuccessSalesDayBook(res) {
    if (res.Status == "OK") {
      this.SalesDaybookData = res.Results;
      this.CalculateSummaryofDifferentColoumnForSum();
    }

  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelIncomeSegregation?FromDate="
      + this.currentIncomeSegregation.fromDate + "&ToDate=" + this.currentIncomeSegregation.toDate + "&IsInsurance=true")
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

  CalculateSummaryofDifferentColoumnForSum() {

    this.IncomeSegregationData.forEach(SumVariable => {

      //this.tot_Price += SumVariable.Price;

      //this.tot_Tax += SumVariable.Tax;
      //this.tot_DiscntAmt += SumVariable.DiscountAmount;
      this.tot_TotalAmount += SumVariable.TotalAmount;
      //this.tot_ReturnAmount += SumVariable.ReturnAmount;
      this.tot_CancelTax += SumVariable.CancelTax;
      this.tot_CancelAmount += SumVariable.CancelAmount;
    });
    //this.tot_Price = CommonFunctions.parseAmount(this.tot_Price);
    //this.tot_Tax = CommonFunctions.parseAmount(this.tot_Tax - this.tot_CancelTax);
    //this.tot_DiscntAmt = CommonFunctions.parseAmount(this.tot_DiscntAmt);
    this.tot_TotalAmount = CommonFunctions.parseAmount(this.tot_TotalAmount);
    //this.tot_ReturnAmount = CommonFunctions.parseAmount(this.tot_ReturnAmount);
    this.tot_CancelAmount = CommonFunctions.parseAmount(this.tot_CancelAmount);

    this.SalesDaybookData.forEach(SumVariable => {
      this.tot_Price += SumVariable.SubTotal;
      this.tot_DiscntAmt += SumVariable.DiscountAmount;
      this.tot_Tax += SumVariable.TaxAmount;
      this.tot_ReturnAmount += SumVariable.ReturnAmount;
      //this.tot_NetSales += SumVariable.NetSales;
      this.tot_NetSales += SumVariable.TotalAmount;
      this.tot_AdvanceReceived += SumVariable.DepositReceived;
      this.tot_AdvanceSettlement += SumVariable.DepositReturn;
      //this.tot_CashCollection += SumVariable.CashCollection;
      this.tot_CreditReceived += SumVariable.CrReceived_TotalAmount;
      this.tot_CreditSales += SumVariable.CrSales_TotalAmount;
      this.tot_NetCashCollection += SumVariable.CashCollection;
    });
    this.tot_ReturnAmount = CommonFunctions.parseAmount(this.tot_ReturnAmount);
    this.tot_Price = CommonFunctions.parseAmount(this.tot_Price);
    this.tot_DiscntAmt = CommonFunctions.parseAmount(this.tot_DiscntAmt);
    //this.tot_NetSales = CommonFunctions.parseAmount((this.tot_TotalAmount) - (this.tot_Tax));
    this.tot_Tax = CommonFunctions.parseAmount(this.tot_Tax);
    this.tot_NetSales = CommonFunctions.parseAmount(this.tot_NetSales);
    this.tot_AdvanceReceived = CommonFunctions.parseAmount(this.tot_AdvanceReceived);
    this.tot_AdvanceSettlement = CommonFunctions.parseAmount(this.tot_AdvanceSettlement);
    //this.tot_CashCollection = CommonFunctions.parseAmount(this.tot_CashCollection);
    this.tot_CreditReceived = CommonFunctions.parseAmount(this.tot_CreditReceived);
    this.tot_CreditSales = CommonFunctions.parseAmount(this.tot_CreditSales);
    this.tot_Receivable = CommonFunctions.parseAmount(this.tot_NetSales + this.tot_Tax + this.tot_AdvanceReceived - this.tot_AdvanceSettlement)
    //this.tot_NetCashCollection = CommonFunctions.parseAmount(this.tot_Receivable - this.tot_CreditSales + this.tot_CreditReceived);
    this.tot_NetCashCollection = CommonFunctions.parseAmount(this.tot_NetCashCollection);
    this.grandTotal = CommonFunctions.getGrandTotalData(this.IncomeSegregationData);


    //sud: below two values are copied from cshtml to apply .parseAmount function on them, calculation remains unchanged.
    this.tot_accRecord_taxableIncome = CommonFunctions.parseAmount(this.tot_Price - this.tot_DiscntAmt - this.tot_ReturnAmount);
    this.tot_accRecord_totalSales = CommonFunctions.parseAmount(this.tot_Price - this.tot_DiscntAmt + this.tot_Tax - this.tot_ReturnAmount);


    //sud:21Mar'19-- update decimal points of each values inside grandTotal..
    if (this.grandTotal && this.grandTotal.length > 0) {
      this.grandTotal.forEach(itm => {
        itm.CashSales = CommonFunctions.parseAmount(itm.CashSales);
        itm.CashDiscount = CommonFunctions.parseAmount(itm.CashDiscount);
        itm.CreditSales = CommonFunctions.parseAmount(itm.CreditSales);
        itm.CreditDiscount = CommonFunctions.parseAmount(itm.CreditDiscount);
        itm.ReturnAmount = CommonFunctions.parseAmount(itm.ReturnAmount);
        itm.ReturnDiscount = CommonFunctions.parseAmount(itm.ReturnDiscount);
        itm.GrossSales = CommonFunctions.parseAmount(itm.GrossSales);
        itm.Discount = CommonFunctions.parseAmount(itm.Discount);
        itm.NetSales = CommonFunctions.parseAmount(itm.NetSales);

      });
    }

  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentIncomeSegregation.fromDate = this.fromDate;
    this.currentIncomeSegregation.toDate = this.toDate;
  }
}
