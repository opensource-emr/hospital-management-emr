import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { DanpheChartsService } from '../../dashboards/shared/danphe-charts.service';
import * as moment from 'moment/moment';
import { DLService } from "../../shared/dl.service";
import { CoreService } from "../../core/shared/core.service";
import { CommonFunctions } from "../../shared/common.functions";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { RPT_BIL_SalesDaybookModel } from '../../reporting/billing/sales-daybook/sales-daybook.model';

@Component({
  templateUrl: "./billing-dashboard.html",
  styleUrls: ['./billing-dashboard.style.css']
})

export class BillingDashboardComponent {

  selectedDate: string = null;
  incomeSegFromDate: string = null;
  incomeSegToDate: string = null;
  //lastSelectedDate: string;//sud:25Nov'21--This is no longer required.
  salesDayBook: RPT_BIL_SalesDaybookModel = new RPT_BIL_SalesDaybookModel();  //;{ sales: 0, DiscountAmount: 0, ReturnAmount: 0, TaxCollection: 0, creditSales: 0, AdvanceReceived: 0, AdvanceSettlement: 0 };

  counterDayDate: string = null;
  counterDayCollection = [];
  userDayCollection = [];

  overallBills = { TotalProvisional: 0, TotalCredits: 0, DepositBalance: 0 };

  public showTaxLabels: boolean = true;

  constructor(public danpheCharts: DanpheChartsService,
    public dlService: DLService,
    public coreService: CoreService) {
    this.selectedDate = moment().format('YYYY-MM-DD');
    this.incomeSegFromDate = moment().format('YYYY-MM-DD');
    this.incomeSegToDate = moment().format('YYYY-MM-DD');
    this.counterDayDate = moment().format('YYYY-MM-DD');
    this.LoadSalesDayBook();
  }
  

  ngOnInit() {
    this.LoadIncomeSegregation();
    this.LoadDailyRevenue();
    this.LoadMonthlyBillingTrend();
    this.LoadCounterDayCollection();
    this.LoadOverallBillStatus();
  }

  LoadSalesDayBook() {
    if (this.selectedDate) {
      this.dlService.Read("/BillingReports/SalesDaybook?FromDate="
        + this.selectedDate + "&ToDate=" + this.selectedDate)
        .map(res => res)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.salesDayBook = res.Results[0];
            //round off all the properties inside sales daybook.
            if (this.salesDayBook) {
              this.salesDayBook.SubTotal = CommonFunctions.parseAmount(this.salesDayBook.SubTotal);
              this.salesDayBook.DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.DiscountAmount);
              this.salesDayBook.TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.TaxableAmount);
              this.salesDayBook.TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.TaxAmount);
              this.salesDayBook.TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.TotalAmount);
              this.salesDayBook.CashCollection = CommonFunctions.parseAmount(this.salesDayBook.CashCollection);
              this.salesDayBook.Paid_SubTotal = CommonFunctions.parseAmount(this.salesDayBook.Paid_SubTotal);
              this.salesDayBook.Paid_DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.Paid_DiscountAmount);
              this.salesDayBook.Paid_TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.Paid_TaxableAmount);
              this.salesDayBook.Paid_TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.Paid_TaxAmount);
              this.salesDayBook.Paid_TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.Paid_SubTotal - this.salesDayBook.CashRet_TotalAmount);
              this.salesDayBook.CrSales_SubTotal = CommonFunctions.parseAmount(this.salesDayBook.CrSales_SubTotal);
              this.salesDayBook.CrSales_DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.CrSales_DiscountAmount);
              this.salesDayBook.CrSales_TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.CrSales_TaxableAmount);
              this.salesDayBook.CrSales_TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.CrSales_TaxAmount);
              this.salesDayBook.CrSales_TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.CrSales_SubTotal - this.salesDayBook.CrRet_TotalAmount);
              this.salesDayBook.CrReceived_SubTotal = CommonFunctions.parseAmount(this.salesDayBook.CrReceived_SubTotal);
              this.salesDayBook.CrReceived_DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.CrReceived_DiscountAmount)
              this.salesDayBook.CrReceived_TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.CrReceived_TaxableAmount);
              this.salesDayBook.CrReceived_TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.CrReceived_TaxAmount);
              this.salesDayBook.CrReceived_TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.CrReceived_TotalAmount);
              this.salesDayBook.DepositReceived = CommonFunctions.parseAmount(this.salesDayBook.DepositReceived);
              this.salesDayBook.DepositReturn = CommonFunctions.parseAmount(this.salesDayBook.DepositReturn);
              this.salesDayBook.SettlPaidAmount = CommonFunctions.parseAmount(this.salesDayBook.SettlPaidAmount);
              this.salesDayBook.SettlReturnAmount = CommonFunctions.parseAmount(this.salesDayBook.SettlReturnAmount);
              this.salesDayBook.SettlDiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.SettlDiscountAmount);
              this.salesDayBook.SettlDueAmount = CommonFunctions.parseAmount(this.salesDayBook.SettlDueAmount);
              this.salesDayBook.CashRet_SubTotal = CommonFunctions.parseAmount(this.salesDayBook.CashRet_SubTotal);
              this.salesDayBook.CashRet_DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.CashRet_DiscountAmount);
              this.salesDayBook.CashRet_TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.CashRet_TaxableAmount);
              this.salesDayBook.CashRet_TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.CashRet_TaxAmount);
              this.salesDayBook.CashRet_TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.CashRet_TotalAmount);
              this.salesDayBook.CrRet_SubTotal = CommonFunctions.parseAmount(this.salesDayBook.CrRet_SubTotal);
              this.salesDayBook.CrRet_DiscountAmount = CommonFunctions.parseAmount(this.salesDayBook.CrRet_DiscountAmount);
              this.salesDayBook.CrRet_TaxableAmount = CommonFunctions.parseAmount(this.salesDayBook.CrRet_TaxableAmount);
              this.salesDayBook.CrRet_TaxAmount = CommonFunctions.parseAmount(this.salesDayBook.CrRet_TaxAmount);
              this.salesDayBook.CrRet_TotalAmount = CommonFunctions.parseAmount(this.salesDayBook.CrRet_TotalAmount);
              this.salesDayBook.ReturnAmount = CommonFunctions.parseAmount(this.salesDayBook.TotalSalesReturn);
            }

          } else {
            console.log("---some error occured----");
            console.log(res.ErrorMessage);
          }

        },
          err => {
            alert(err.ErrorMessage);

          });

    }

  }

  LoadIncomeSegregation() {

    this.dlService.Read("/Reporting/IncomeSegregation?FromDate=" + this.incomeSegFromDate + "&ToDate=" + this.incomeSegToDate)
      .map(res => res)
      .subscribe(res => {


        if (res.Results && res.Results.JsonData) {
          let dataToParse = JSON.parse(res.Results.JsonData);// [{ "ServDeptName": "MRI", "Price": 100.0, "Tax": 5.0, "Discntmt": 0.0, "TotalAmount": 105.0 }, { "ServDeptName": "OPD", "Price": 3400.0, "Tax": 162.25, "Discntmt": 180.0, "TotalAmount": 3286.5 }, { "ServDeptName": "USG", "Price": 200.0, "Tax": 10.0, "Discntmt": 0.0, "TotalAmount": 210.0 }];

          if (dataToParse && dataToParse.length > 0) {
            let formattedData = dataToParse.map(d => {
              return { "srvDeptName": d.ServDeptName, "collection": d.Price, "Tax": d.Tax, "DISCNTAMT": d.Discntmt };
            });

            this.danpheCharts.Billing_Mix_IncomeSegregation("dvDeptIncomeSegregation", formattedData);
          }
        }
      },
        err => {
          alert(err.ErrorMessage);
        });
  }


  LoadDailyRevenue() {
    this.dlService.Read("/Reporting/DailyRevenueTrend")
      .map(res => res)
      .subscribe(res => {
        if (res.Results && res.Results.JsonData) {
          let dataToParse = JSON.parse(res.Results.JsonData);
          this.danpheCharts.Billing_Line_DailyRevTrend("dvDailyRevTrend", dataToParse);
        }
      },
        err => {
          alert(err.ErrorMessage);

        });

  }


  LoadMonthlyBillingTrend() {
    this.dlService.Read("/Reporting/MonthlyBillingTrend")
      .map(res => res)
      .subscribe(res => {
        if (res.Results.JsonData) {
          var dataToParse: Array<any> = JSON.parse(res.Results.JsonData);
        }

        //sud:4thFeb'19--formatting the amounts of Monthly BillingTrend
        if (dataToParse && dataToParse.length > 0) {
          dataToParse.forEach(d => {
            d.Paid = CommonFunctions.parseAmount(d.Paid);
            d.Unpaid = CommonFunctions.parseAmount(d.Unpaid);
            d.Tax = CommonFunctions.parseAmount(d.Tax);
          });
        }

        this.danpheCharts.Billing_Mix_MonthlyBilling("dvMonthlyBilling", dataToParse);
      },
        err => {
          alert(err.ErrorMessage);

        });
  }

  LoadCounterDayCollection() {
    if (this.counterDayDate && this.counterDayDate.length > 9) {

      this.dlService.Read("/Reporting/BILLDsbCntrUsrCollection?fromDate="
        + this.counterDayDate + "&toDate=" + this.counterDayDate)
        .map(res => res)
        .subscribe(res => {

          if (res.Results) {
            let dailyCollection = JSON.parse(res.Results.JsonData);

            this.userDayCollection = dailyCollection.UserCollection;
            this.counterDayCollection = dailyCollection.CounterCollection;
            //CounterId	CounterName	CounterCollection

            //this.danpheCharts.Billing_Mix_MonthlyBilling("dvMonthlyBilling", dataToParse);
          }
          //this.salesDayBook = res.Results[0];
          //this.lastSelectedDate = this.selectedDate;


        },
          err => {
            //alert(err.ErrorMessage);

          });
    }
  }


  //added: sud31May'18
  LoadOverallBillStatus() {
    this.dlService.Read("/Reporting/BILLDsbOverallBillStatus")
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.overallBills = res.Results;
          this.overallBills.TotalProvisional = CommonFunctions.parseAmount(this.overallBills.TotalProvisional);
          this.overallBills.TotalCredits = CommonFunctions.parseAmount(this.overallBills.TotalCredits);
          this.overallBills.DepositBalance = CommonFunctions.parseAmount(this.overallBills.DepositBalance);
        }
        else {
          console.log(res.ErrorMessage);
        }
      },
        err => {
          console.log

        });
  }
}
