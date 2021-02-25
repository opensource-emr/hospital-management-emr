import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { CommonFunctions } from '../../../shared/common.functions';
import { DanpheCache } from '../../../shared/danphe-cache-service-utility/cache-services';
import { MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { DLService } from '../../../shared/dl.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
    templateUrl: "./phrm-userwise-collection-report.html"

})

export class PHRMUserwiseCollectionReportComponent {
    public viewMode: string = "Show Summary View";
    public IsSummaryViewMode: boolean = false;
    PHRMUserReportColumn: Array<any> = null;
    PHRMUserReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    dailySalesReportSummaryData: Array<any> = new Array<PHRMReportsModel>();
    public summaryFormatted = {
        GrossTotal_Sales: 0,
        Discount: 0,
        ReturnSubTotal: 0,
        ReturnDiscount: 0,
        ReturnAmount: 0,
        NetSales: 0,
        CreditAmount: 0,
        DepositReceived: 0,
        DepositDeduct: 0,
        DepositRefund: 0,
        CreditReceived: 0,
        CashDiscount: 0,
        TotalCash: 0
    }
    public counterlist: any;
    public summaryGrandTotal: any = [];
    public gridExportOptions: any;
    dlService: DLService = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    constructor(public pharmacyBLService: PharmacyBLService,
        _dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.dlService = _dlService
        this.PHRMUserReportColumn = PHRMReportsGridColumns.PHRMUserwiseCollectionReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.LoadExportOptions();
        this.LoadCounter();
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    };

    //Export data grid options for excel file
    // gridExportOptions = {
    //     fileName: 'PharmacyUserwiseCollectionReport_' + moment().format('YYYY-MM-DD') + '.xls',
    // };
    LoadCounter(): void {
        this.counterlist = DanpheCache.GetData(MasterType.PhrmCounter, null);
    }
    OnGridExport($event: GridEmitModel) {
        let jsonStrSummary = this.GetSummaryFormatedForExportExcel();

        let summaryHeader = "Calculation Summary";

        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMDailySales?FromDate="
            + this.phrmReports.FromDate + "&ToDate=" + this.phrmReports.ToDate
            + "&CounterId=" + this.phrmReports.CounterId + "&CreatedBy=" + this.phrmReports.CreatedBy
            + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "PharmacyUserwiseCollectionReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

                res => this.Error(res));
    }
    LoadExportOptions() {

        this.gridExportOptions = {
            fileName: 'PharmacyUserwiseCollectionReport_' + moment().format('YYYY-MM-DD') + '.xls',
            customHeader: "FromDate: " + this.phrmReports.FromDate + "--ToDate:" + this.phrmReports.ToDate
        };
    }
    Load() {
        this.pharmacyBLService.GetPHRMUserwiseCollectionReport(this.phrmReports)
            .subscribe(res =>
                this.Success(res),
                res => this.Error(res));
    }
    Success(res) {
        if (res.Status == "OK") {
            let data = JSON.parse(res.Results.JsonData);
            if (data.SalesData.length > 0) {
                this.IsSummaryViewMode = false;
                this.PHRMUserReportData = data.SalesData;
                this.LoadSummaryViewData(data.SalesData, data.SettlementData);
                this.GetSalesFigures_Formatted(data.SettlementData);
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
    LoadSummaryViewData(reportData, settlementData) {
        try {
            if (reportData) {
                var helper = {};
                var result1: Array<any> = reportData.reduce(function (r, o) {
                    var key = o.Date + '-' + o.CreatedBy;

                    if (!helper[key]) {
                        helper[key] = Object.assign({}, o); // create a copy of o
                        r.push(helper[key]);
                    } else {
                        helper[key].SubTotal += o.SubTotal;
                        helper[key].DiscountAmount += o.DiscountAmount;
                        //helper[key].ReturnedAmount += o.ReturnedAmount;
                        helper[key].DepositReceived += o.DepositReceived;
                        helper[key].DepositDeduct += o.DepositDeduct;
                        helper[key].DepositRefund += o.DepositRefund;
                        helper[key].TotalAmount += o.TotalAmount;
                        helper[key].CreditAmount += o.CreditAmount;
                        helper[key].CreditReceived += o.CreditReceived;
                        helper[key].CashCollection += o.CashCollection;
                    }

                    return r;
                }, []);

                result1.sort((a, b) => a.Date < b.Date ? -1 : a.Date > b.name ? 1 : 0);

                console.log(result1);

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
    GetSalesFigures_Formatted(settlementData) {
        //first list out all sales and return sales.. then do calculation on each type.
        let sales = this.PHRMUserReportData.filter(a => a.TransactionType == "CashInvoice" || a.TransactionType == "CreditInvoice");
        let returns = this.PHRMUserReportData.filter(a => a.TransactionType == "CashInvoiceReturn" || a.TransactionType == "CreditInvoiceReturn");
        this.summaryFormatted.GrossTotal_Sales = sales.reduce(function (acc, obj) { return acc + obj.SubTotal; }, 0);
        this.summaryFormatted.Discount = sales.reduce(function (acc, obj) { return acc + obj.DiscountAmount; }, 0);
        this.summaryFormatted.ReturnSubTotal = returns.reduce(function (acc, obj) { return acc + (-1 * obj.SubTotal); }, 0);
        this.summaryFormatted.ReturnDiscount = returns.reduce(function (acc, obj) { return acc + (-1 * obj.DiscountAmount); }, 0);
        this.summaryFormatted.ReturnAmount = this.summaryFormatted.ReturnSubTotal - this.summaryFormatted.ReturnDiscount;
        this.summaryFormatted.DepositReceived = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositReceived; }, 0);
        this.summaryFormatted.DepositDeduct = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositDeduct; }, 0);
        this.summaryFormatted.DepositRefund = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositRefund; }, 0);
        this.summaryFormatted.NetSales = this.summaryFormatted.GrossTotal_Sales - this.summaryFormatted.Discount - this.summaryFormatted.ReturnAmount;
        this.summaryFormatted.CreditAmount = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.CreditAmount; }, 0);
        this.summaryFormatted.CreditReceived = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.CreditReceived; }, 0);
        this.summaryFormatted.TotalCash = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.CashCollection; }, 0);


        this.summaryFormatted.GrossTotal_Sales = CommonFunctions.parseAmount(this.summaryFormatted.GrossTotal_Sales);
        this.summaryFormatted.Discount = CommonFunctions.parseAmount(this.summaryFormatted.Discount);
        this.summaryFormatted.ReturnSubTotal = CommonFunctions.parseAmount(this.summaryFormatted.ReturnSubTotal);
        this.summaryFormatted.ReturnDiscount = CommonFunctions.parseAmount(this.summaryFormatted.ReturnDiscount);
        this.summaryFormatted.DepositReceived = CommonFunctions.parseAmount(this.summaryFormatted.DepositReceived);
        this.summaryFormatted.DepositDeduct = CommonFunctions.parseAmount(this.summaryFormatted.DepositDeduct);
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
            "Deposit Deducted": summary.DepositDeduct,
            "Less Deposit Refund": summary.DepositRefund,
            "Add Collection From Receivables": summary.CreditReceived,
            "Less Cash Discount": summary.CashDiscount,
            "Total Cash Collection": summary.TotalCash
        };

        return JSON.stringify(summaryFormatted);
    }
    SwitchViews() {
        try {
            if (this.PHRMUserReportData.length > 0) {
                let flag = (this.IsSummaryViewMode == true) ? false : true;
                this.IsSummaryViewMode = flag;
                this.viewMode = (this.IsSummaryViewMode) ? "Show Detailed" : "Show Summary";
            }
        } catch (exception) {
            console.log(exception);
        }
    }
    Print() {
        let popupWinindow;
        var printContents = '<b>Report Date Range: ' + this.phrmReports.FromDate + ' To ' + this.phrmReports.ToDate + '</b>';
        printContents += document.getElementById("printPage").innerHTML;
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
            CommonFunctions.ConvertHTMLTableToExcel(tableId, this.phrmReports.FromDate, this.phrmReports.ToDate, workSheetName,
                Heading, filename);
        }
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
    }
}
