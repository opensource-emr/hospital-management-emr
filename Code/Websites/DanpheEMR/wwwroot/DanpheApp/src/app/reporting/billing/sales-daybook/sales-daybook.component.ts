import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_SalesDaybookModel } from "./sales-daybook.model"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DLService } from "../../../shared/dl.service";
import { CommonFunctions } from '../../../shared/common.functions'
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
@Component({
  templateUrl: "./sales-daybook.html"

})
export class RPT_BIL_SalesDaybookComponent {

    public fromDate: Date = null;
    public toDate: Date = null;
    public tot_Sales: number = 0;
    public tot_DiscountAmount: number = 0;
    public tot_ReturnAmount: number = 0;
    public tot_GrossSales: number = 0;
    public tot_Tax: number = 0;
    public tot_CreditSalesTotal: number = 0;
    public tot_CreditCancel: number = 0;
    public tot_CreditTax: number = 0;
    public tot_NetSales: number = 0;
    public tot_AdvanceReceived: number = 0;
    public tot_AdvanceSettlement: number = 0;
    public tot_CashCollection: number = 0;
    SalesDaybookColumns: Array<any> = null;
  SalesDaybookData: Array<RPT_BIL_SalesDaybookModel> = new Array<RPT_BIL_SalesDaybookModel>();
  public currentsalesdaybook: RPT_BIL_SalesDaybookModel = new RPT_BIL_SalesDaybookModel();
    dlService: DLService = null;
    constructor(_dlService: DLService, public msgBoxServ: MessageboxService,
        public coreService: CoreService, public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.currentsalesdaybook.fromDate = moment().format('YYYY-MM-DD');
        this.currentsalesdaybook.toDate = moment().format('YYYY-MM-DD');
    }


    gridExportOptions = {
        fileName: 'SalesDayBookList_' + moment().format('YYYY-MM-DD') + '.xls',
    };


    Load() {
        //this is syntactic sugar code
        //Reset all Global variable to Zero 
        ///because during the sum of the value of Coloumn ....Last Sum value is remain present because we have declare variable globally therefor we have to reset all global variable to Zero
        this.tot_Sales = this.tot_DiscountAmount = this.tot_ReturnAmount = this.tot_GrossSales = this.tot_Tax = this.tot_CreditSalesTotal
            = this.tot_CreditCancel = this.tot_CreditTax = this.tot_NetSales = this.tot_AdvanceReceived = this.tot_AdvanceSettlement = this.tot_CashCollection = 0;


        this.dlService.Read("/BillingReports/SalesDaybook?FromDate="
            + this.currentsalesdaybook.fromDate + "&ToDate=" + this.currentsalesdaybook.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));


    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);

    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.SalesDaybookColumns = this.reportServ.reportGridCols.SalesDaybookReport;
            this.SalesDaybookData = res.Results;
            this.SalesDaybookData = this.SalesDaybookData.map(row => {
                row.SubTotal = CommonFunctions.parseAmount(row.SubTotal);
                row.DiscountAmount = CommonFunctions.parseAmount(row.DiscountAmount);
                row.TaxableAmount = CommonFunctions.parseAmount(row.TaxableAmount);
                row.TaxAmount = CommonFunctions.parseAmount(row.TaxAmount);
                row.TotalAmount = CommonFunctions.parseAmount(row.TotalAmount);
                row.CashRet_TotalAmount = CommonFunctions.parseAmount(row.CashRet_TotalAmount);
                row.CrSales_TotalAmount = CommonFunctions.parseAmount(row.CrSales_TotalAmount);
                row.CrReceived_TotalAmount = CommonFunctions.parseAmount(row.CrReceived_TotalAmount);
                row.DepositReceived = CommonFunctions.parseAmount(row.DepositReceived);
                row.DepositReturn = CommonFunctions.parseAmount(row.DepositReturn);
                row.CashCollection = CommonFunctions.parseAmount(row.CashCollection);
                row.SettlDueAmount = CommonFunctions.parseAmount(row.SettlDueAmount);
                row.SettlDiscountAmount = CommonFunctions.parseAmount(row.SettlDiscountAmount);
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
            this.tot_Sales += SumVariable.TotalAmount;
            this.tot_DiscountAmount += SumVariable.DiscountAmount;
            this.tot_ReturnAmount += SumVariable.CashRet_TotalAmount;
            //this.tot_GrossSales += SumVariable.GrossSales;
            this.tot_Tax += SumVariable.TaxAmount;
            this.tot_CreditSalesTotal += SumVariable.CrSales_TotalAmount;
            //this.tot_CreditCancel += SumVariable.CreditCancel;
            //this.tot_CreditTax += SumVariable.CreditTax;
            //this.tot_NetSales += SumVariable.NetSales;
            this.tot_AdvanceReceived += SumVariable.DepositReceived;
            this.tot_AdvanceSettlement += SumVariable.DepositReturn;
            this.tot_CashCollection += SumVariable.CashCollection;

        });
        this.tot_Sales = CommonFunctions.parseAmount(this.tot_Sales);
        this.tot_DiscountAmount = CommonFunctions.parseAmount(this.tot_DiscountAmount);
        this.tot_ReturnAmount = CommonFunctions.parseAmount(this.tot_ReturnAmount);
        this.tot_GrossSales = CommonFunctions.parseAmount(this.tot_GrossSales);
        this.tot_Tax = CommonFunctions.parseAmount(this.tot_Tax);
        this.tot_CreditSalesTotal = CommonFunctions.parseAmount(this.tot_CreditSalesTotal);
        this.tot_CreditCancel = CommonFunctions.parseAmount(this.tot_CreditCancel);
        this.tot_CreditTax = CommonFunctions.parseAmount(this.tot_CreditTax);
        this.tot_NetSales = CommonFunctions.parseAmount(this.tot_NetSales);
        this.tot_AdvanceReceived = CommonFunctions.parseAmount(this.tot_AdvanceReceived);
        this.tot_AdvanceSettlement = CommonFunctions.parseAmount(this.tot_AdvanceSettlement);
        this.tot_CashCollection = CommonFunctions.parseAmount(this.tot_CashCollection);

    }
}
