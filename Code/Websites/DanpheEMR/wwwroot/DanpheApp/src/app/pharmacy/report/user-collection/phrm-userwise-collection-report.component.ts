import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
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
import { DispensaryService } from '../../../dispensary/shared/dispensary.service';
import { CoreService } from '../../../core/shared/core.service';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { SecurityService } from '../../../security/shared/security.service';


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
        VATAmount: 0,
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
    public dispensaryList: Array<any>;
    selectedDispensary: any;
    storeWiseData: Array<any> = new Array<any>();
    public footerContent = '';
    public dateRange: string = "";
    printBtn: boolean;
    headerDetailParam: any;
    public loading: boolean = false;
    isItemLevelVATApplicable: boolean;
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
    showUserCollectionSummary: boolean = false;

    constructor(public pharmacyBLService: PharmacyBLService, public _dispensaryService: DispensaryService,
        public securityService: SecurityService, public coreService: CoreService, _dlService: DLService,
        private changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,
        public nepaliCalendarService: NepaliCalendarService
    ) {
        this.dlService = _dlService
        this.checkSalesCustomization();
        this.PHRMUserReportColumn = this.isItemLevelVATApplicable ? PHRMReportsGridColumns.PHRMUserwiseCollectionReportWithVAT : PHRMReportsGridColumns.PHRMUserwiseCollectionReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.LoadExportOptions();
        this.LoadCounter();
        this.GetActiveDispensarylist();
        this.getPharmacyHeader();
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    };
    checkSalesCustomization() {
        let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
        if (salesParameterString != null) {
            let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
            this.isItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);

        }
    }

    getPharmacyHeader() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName == "Pharmacy" && a.ParameterName == "Pharmacy Receipt Header").ParameterValue;
        if (paramValue)
            this.headerDetailParam = JSON.parse(paramValue);
        else
            this.msgBoxServ.showMessage("Failed", ["Error getting header parameters."]);
    }
    ngAfterViewChecked() {
        if (document.getElementById("print_summary") != null) {
            this.footerContent = document.getElementById("print_summary").innerHTML;
        }
    }
    //Export data grid options for excel file
    // gridExportOptions = {
    //     fileName: 'PharmacyUserwiseCollectionReport_' + moment().format('YYYY-MM-DD') + '.xls',
    // };
    GetActiveDispensarylist() {
        this._dispensaryService.GetAllDispensaryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.dispensaryList = JSON.parse(JSON.stringify(res.Results));
                    this.dispensaryList.unshift({ StoreId: null, Name: "All" })
                }
            })
    }
    DispensaryListFormatter(data: any): string {
        return data["Name"];
    }
    OnDispensaryChange() {
        let dispensary = null;
        if (!this.selectedDispensary) {
            this.phrmReports.StoreId = null;
        }
        else if (typeof (this.selectedDispensary) == 'string') {
            dispensary = this.dispensaryList.find(a => a.Name.toLowerCase() == this.selectedDispensary.toLowerCase());
        }
        else if (typeof (this.selectedDispensary) == "object") {
            dispensary = this.selectedDispensary;
        }
        if (dispensary) {
            this.phrmReports.StoreId = dispensary.StoreId;
        }
        else {
            this.phrmReports.StoreId = null;
        }
    }
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
        this.loading = true;
        this.storeWiseData = [];
        this.PHRMUserReportData = [];
        this.summaryFormatted = {
            GrossTotal_Sales: 0,
            Discount: 0,
            VATAmount: 0,
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
        };
        this.total_SummaryView = {
            CashSales_Amount: 0,
            CashSales_ReturnAmount: 0,
            Deposit_Received: 0,
            Deposit_Refund: 0,
            CollectionFromReceivables: 0,
            Sett_CashDiscount: 0,
            OtherPaymentsGiven: 0,
            NetCollection: 0,
        }
        this.pharmacyBLService.GetPHRMUserwiseCollectionReport(this.phrmReports)
            .subscribe(res =>
                this.Success(res),
                res => this.Error(res));
        this.pharmacyBLService.getSalesSummaryReport(this.phrmReports.FromDate, this.phrmReports.ToDate)
            .subscribe(result => {
                if (result.Status == "OK") {
                    this.storeWiseData = result.Results;
                    this.storeWiseData = this.storeWiseData.filter(x => x.StoreName != "Total");
                    this.changeDetector.detectChanges();
                }
            })
    }
    Success(res) {
        if (res.Status == "OK") {
            let data = res.Results;
            if (data.UserCollectionDetails.length > 0 || data.SettlementSummary.CollectionFromReceivables || data.UserCollectionSummary.length > 0) {
                this.IsSummaryViewMode = false;
                this.PHRMUserReportData = data.UserCollectionDetails;
                this.dailySalesReportSummaryData = data.UserCollectionSummary;
                if (data.UserCollectionSummary.length > 0) {
                    this.showUserCollectionSummary = true;
                }
                this.CalculateTotalAmountsForSummaryView(data.UserCollectionSummary);
                this.GetSalesFigures_Formatted(data.SettlementSummary);
                this.printBtn = true;
                this.changeDetector.detectChanges();
            }
            else {
                this.msgBoxServ.showMessage("notice-message", ['No Data is Available Between Selected Parameters...']);
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
        this.loading = false;
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
        this.loading = false;
    }
    CalculateTotalAmountsForSummaryView(collnSummaryList: Array<any>) {
        //reset summary data to Zero so that values doesn't add up on every reload.
        this.total_SummaryView.CashSales_Amount = this.total_SummaryView.CashSales_ReturnAmount = this.total_SummaryView.CollectionFromReceivables
            = this.total_SummaryView.Deposit_Received = this.total_SummaryView.Deposit_Refund
            = this.total_SummaryView.Sett_CashDiscount = this.total_SummaryView.NetCollection = 0;
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
    // LoadSummaryViewData(reportData, settlementData) {
    //     try {
    //         if (reportData) {
    //             var helper = {};
    //             var result1: Array<any> = reportData.reduce(function (r, o) {
    //                 var key = o.Date + '-' + o.CreatedBy;

    //                 o.SalesTotal = (o.TransactionType == "CashInvoice") ? o.SubTotal : 0;
    //                 o.SalesReturnTotal = (o.TransactionType == "CashInvoiceReturn") ? -o.SubTotal : 0;

    //                 if (!helper[key]) {
    //                     helper[key] = Object.assign({}, o); // create a copy of o
    //                     r.push(helper[key]);
    //                 } else {
    //                     helper[key].SalesTotal += o.SalesTotal;
    //                     helper[key].SalesReturnTotal += o.SalesReturnTotal;
    //                     helper[key].SubTotal += o.SubTotal;
    //                     helper[key].DiscountAmount += o.DiscountAmount;
    //                     helper[key].VATAmount += o.VATAmount;
    //                     //helper[key].ReturnedAmount += o.ReturnedAmount;
    //                     helper[key].DepositReceived += o.DepositReceived;
    //                     helper[key].DepositDeduct += o.DepositDeduct;
    //                     helper[key].DepositRefund += o.DepositRefund;
    //                     helper[key].TotalAmount += o.TotalAmount;
    //                     helper[key].CreditAmount += o.CreditAmount;
    //                     helper[key].CreditReceived += o.CreditReceived;
    //                     helper[key].CashCollection += o.CashCollection;
    //                 }

    //                 return r;
    //             }, []);

    //             result1.sort((a, b) => a.Date < b.Date ? -1 : a.Date > b.name ? 1 : 0);

    //             console.log(result1);

    //             if (result1 && result1.length > 0 && settlementData && settlementData.length > 0) {

    //                 result1.forEach(usr => {

    //                     let currUsrSettlDiscountAmt = settlementData.filter(s => s.EmployeeId == usr.EmployeeId)
    //                         .reduce(function (acc, obj) { return acc + obj.SettlDiscountAmount; }, 0);
    //                     usr.CashDiscount = currUsrSettlDiscountAmt;
    //                     usr.CashCollection = usr.CashCollection - usr.CashDiscount;
    //                 });

    //             }
    //             this.dailySalesReportSummaryData = result1;
    //             this.summaryGrandTotal = CommonFunctions.getGrandTotalData(result1);
    //         }
    //     } catch (exception) {
    //         console.log(exception);
    //     }
    // }
    GetSalesFigures_Formatted(settlementData) {
        //first list out all sales and return sales.. then do calculation on each type.
        let sales = this.PHRMUserReportData.filter(a => a.TransactionType == "CashInvoice" || a.TransactionType == "CreditInvoice");
        let returns = this.PHRMUserReportData.filter(a => a.TransactionType == "CashInvoiceReturn" || a.TransactionType == "CreditInvoiceReturn");
        this.summaryFormatted.GrossTotal_Sales = sales.reduce(function (acc, obj) { return acc + obj.SubTotal; }, 0);
        this.summaryFormatted.Discount = sales.reduce(function (acc, obj) { return acc + obj.DiscountAmount; }, 0);
        this.summaryFormatted.VATAmount = sales.reduce(function (acc, obj) { return acc + obj.VATAmount; }, 0);
        this.summaryFormatted.ReturnSubTotal = returns.reduce(function (acc, obj) { return acc + (-1 * obj.SubTotal); }, 0);
        this.summaryFormatted.ReturnDiscount = returns.reduce(function (acc, obj) { return acc + (-1 * obj.DiscountAmount); }, 0);
        this.summaryFormatted.ReturnAmount = this.summaryFormatted.ReturnSubTotal - this.summaryFormatted.ReturnDiscount;
        this.summaryFormatted.DepositReceived = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositReceived; }, 0);
        this.summaryFormatted.DepositDeduct = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositDeduct; }, 0);
        this.summaryFormatted.DepositRefund = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.DepositRefund; }, 0);
        this.summaryFormatted.NetSales = this.summaryFormatted.GrossTotal_Sales - this.summaryFormatted.Discount - this.summaryFormatted.ReturnAmount;
        this.summaryFormatted.CreditAmount = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.CreditAmount; }, 0);
        this.summaryFormatted.TotalCash = this.PHRMUserReportData.reduce(function (acc, obj) { return acc + obj.CashCollection; }, 0);


        this.summaryFormatted.GrossTotal_Sales = CommonFunctions.parseAmount(this.summaryFormatted.GrossTotal_Sales);
        this.summaryFormatted.Discount = CommonFunctions.parseAmount(this.summaryFormatted.Discount);
        this.summaryFormatted.VATAmount = CommonFunctions.parseAmount(this.summaryFormatted.VATAmount);
        this.summaryFormatted.ReturnSubTotal = CommonFunctions.parseAmount(this.summaryFormatted.ReturnSubTotal);
        this.summaryFormatted.ReturnDiscount = CommonFunctions.parseAmount(this.summaryFormatted.ReturnDiscount);
        this.summaryFormatted.ReturnAmount = CommonFunctions.parseAmount(this.summaryFormatted.ReturnAmount);
        this.summaryFormatted.DepositReceived = CommonFunctions.parseAmount(this.summaryFormatted.DepositReceived);
        this.summaryFormatted.DepositDeduct = CommonFunctions.parseAmount(this.summaryFormatted.DepositDeduct);
        this.summaryFormatted.DepositRefund = CommonFunctions.parseAmount(this.summaryFormatted.DepositRefund);
        this.summaryFormatted.NetSales = CommonFunctions.parseAmount(this.summaryFormatted.NetSales);
        this.summaryFormatted.CreditAmount = CommonFunctions.parseAmount(this.summaryFormatted.CreditAmount);
        this.summaryFormatted.TotalCash = CommonFunctions.parseAmount(this.summaryFormatted.TotalCash);

        if (settlementData) {
            this.summaryFormatted.CreditReceived = CommonFunctions.parseAmount(settlementData.CollectionFromReceivables);
            this.summaryFormatted.CashDiscount = CommonFunctions.parseAmount(settlementData.CashDiscountGiven - settlementData.CashDiscountReceived);
            this.summaryFormatted.TotalCash = CommonFunctions.parseAmount(this.summaryFormatted.TotalCash + this.summaryFormatted.CreditReceived - this.summaryFormatted.CashDiscount);
        }
    }
    GetSummaryFormatedForExportExcel(): string {
        let summary = this.summaryFormatted;

        let summaryFormatted = {
            "Gross Total Sales": summary.GrossTotal_Sales,
            "Discount": summary.Discount,
            "VATAmount": summary.VATAmount,
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
            if (this.PHRMUserReportData.length > 0 ||  this.showUserCollectionSummary) {
                let flag = (this.IsSummaryViewMode == true) ? false : true;
                this.IsSummaryViewMode = flag;
                this.viewMode = (this.IsSummaryViewMode) ? "Show Detailed" : "Show Summary";
            }
        } catch (exception) {
            console.log(exception);
        }
    }
    Print(idToBePrinted: string = "printPage") {
        var np_FromDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.phrmReports.FromDate);
        var np_ToDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.phrmReports.ToDate);
        let popupWinindow;
        let headerInnerHTML = document.getElementById("headerForPrint").innerHTML;
        var printContents = headerInnerHTML; // add header first and then append other content serially
        printContents += `<b style="display:grid; place-items:center;">User-wise Collection Summary Report</b>`;
        printContents += `<b style="display:grid; place-items:center;">${this.phrmReports.FromDate} - ${this.phrmReports.ToDate} AD (${np_FromDate} - ${np_ToDate} BS)</b>`;
        printContents += document.getElementById(idToBePrinted).innerHTML;
        printContents += `<div style="display: flex; justify-content: space-between;">
                            <div>Printed By: ${this.securityService.GetLoggedInUser().UserName}</div>
                            <div>Printed On: ${moment().format('YYYY-MM-DD HH:mm')}</div>
                          </div>`
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

            var np_FromDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.phrmReports.FromDate);
            var np_ToDate = this.nepaliCalendarService.ConvertEngToNepDateString(this.phrmReports.ToDate);


            let phrmReportHeaderString = `
                            <tr>
                              <td colspan="3"></td>
                              <td colspan="4" style="text-align:center;font-size:large;"><strong>${this.headerDetailParam.hospitalName}</strong></td>
                            </tr>
                             <tr>
                              <td colspan="3"></td>
                              <td colspan="4" style="text-align:center;font-size:small;"><strong>${this.headerDetailParam.address}</strong></td>
                            </tr>
                            <tr>
                                <td colspan="3"></td>
                                <td colspan="4" style="text-align:center;font-size:small;"><strong>Department Of Pharmacy</strong></td>
                                <td colspan="2" style="text-align:left;"> Exported By : ${this.securityService.GetLoggedInUser().UserName}</td>
                            </tr>
                            <tr>
                                <td colspan="3">Date Range: ${this.phrmReports.FromDate} - ${this.phrmReports.ToDate} AD (${np_FromDate} - ${np_ToDate} BS) </td>
                                <td colspan="4" style="text-align:center;font-size:small;"><strong>User Collection Summary</strong></td>
                                <td colspan="2" style="text-align:left;"> Exported On : ${moment().format('YYYY-MM-DD HH:mm')}</td>
                            </tr>`;
            this.ConvertHTMLTableToExcel(tableId, workSheetName, "PHRMUsercollectionsummary", phrmReportHeaderString);
        }
    }
    public ConvertHTMLTableToExcel(table: any, SheetName: string, FileName: string, Heading: string) {
        try {
            if (table) {
                let workSheetName = (SheetName.length > 0) ? SheetName : 'Sheet';

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
    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
    }

}
