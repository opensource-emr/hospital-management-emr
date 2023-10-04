import { ChangeDetectorRef, Component } from "@angular/core";
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DateFormat, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { AccountingSettingsBLService } from "../../settings/shared/accounting-settings.bl.service";
import { LedgerModel } from "../../settings/shared/ledger.model";
import { SubLedgerModel } from "../../settings/shared/sub-ledger.model";
import { AccountingService } from "../../shared/accounting.service";
import { Voucher } from "../../transactions/shared/voucher";
import { SubLedgerReportRequest_DTO } from "../shared/DTOs/subledger-report-request.dot";
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { CustomerHeader, SubLedgerDetailDataSubLedgerList, SubLedgerDetailDataVM, SubLedgerOpeningBalanceVM, SubLedgerSummaryDataVM, SubLedgerTxnDetailVM, SubLedgerTxnSummarVM } from "./subledger-report-vm";

@Component({
    selector: "subledger-report",
    templateUrl: "./subledger-report.html"
})
export class SubLedgerReportComponent {
    public fromDate: string = ``;
    public toDate: string = ``;
    public todayDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    public fiscalYearId: number = 0;
    public subLedgerIds: Array<number> = [];
    public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public voucerType: Array<Voucher> = new Array<Voucher>();
    public subLedgerList: Array<SubLedgerModel> = new Array<SubLedgerModel>();
    public filteredSubLedgerList: Array<SubLedgerModel> = new Array<SubLedgerModel>();
    public validDate: boolean = false;
    public showSubLedgerData: boolean = false;
    public viewMode: string = `summary`;
    public subLedgerTxnList: Array<SubLedgerTxnDetailVM> = new Array<SubLedgerTxnDetailVM>();
    public footerContent = ``;
    public printBy: string = ``;
    public dateRange: string = ``;
    public currDateFormatLabel: string = ENUM_DateFormat.BS;
    public headerContent = ``;
    public reportHeader: string = `Report Data`;
    public printTitle: string = ``;
    public headerDetail: CustomerHeader = new CustomerHeader();
    public actionView: boolean = true;
    public voucherNumber: string = ``;
    public openingData: Array<SubLedgerOpeningBalanceVM> = new Array<SubLedgerOpeningBalanceVM>();
    public summaryTxn: Array<SubLedgerTxnSummarVM> = new Array<SubLedgerTxnSummarVM>();
    public summaryView: Array<SubLedgerSummaryDataVM> = new Array<SubLedgerSummaryDataVM>();
    public detailTxn: Array<SubLedgerTxnDetailVM> = new Array<SubLedgerTxnDetailVM>();
    public detailView: Array<SubLedgerDetailDataVM> = new Array<SubLedgerDetailDataVM>();
    public loading: boolean = false;

    constructor(public accRptBLService: AccountingReportsBLService,
        public messageBoxService: MessageboxService,
        public accountingService: AccountingService,
        public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public coreService: CoreService,
        public routeFrom: RouteFromService,
        public changeDetector: ChangeDetectorRef,
        public nepaliCalendarServ: NepaliCalendarService) {
        this.GetSubLedgerList();
        this.ledgerList = this.accountingService.accCacheData.LedgersALL;
        this.voucerType = this.accountingService.accCacheData.VoucherType;
        this.ReadParam();
        this.accountingService.getCoreparameterValue();
    }

    ngOnInit() {

    }

    public ReadParam(): void {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterGroupName === `Common` && a.ParameterName === `CustomerHeader`).ParameterValue;
        if (paramValue) {
            this.headerDetail = JSON.parse(paramValue);
        }
    }

    public GetSubLedgerList(): void {
        this.accountingSettingsBLService.GetSubLedger()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.subLedgerList = res.Results;
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error Occurred Detail:${err.ErrorMessage}`]);
                })
    }

    selectDate(event): void {
        if (event) {
            this.fromDate = event.fromDate;
            this.toDate = event.toDate;
            this.fiscalYearId = event.fiscalYearId;
            this.validDate = true;
            this.dateRange = `&nbsp;${this.fromDate}&nbsp;<b>To</b>&nbsp;${this.toDate}`;
        }
        else {
            this.validDate = false;
        }
    }

    public GetSubLedgerReport(): void {
        if (this.subLedgerIds.length) {
            this.loading = true;
            let postData = new SubLedgerReportRequest_DTO();
            postData.SubLedgerIds = this.subLedgerIds;
            postData.FromDate = this.fromDate;
            postData.ToDate = this.toDate;
            postData.FiscalYearId = this.fiscalYearId;

            this.accRptBLService.GetSubLedgerReport(postData)
                .finally(() => { this.loading = false; })
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.openingData = res.Results.OpeningData;
                        this.subLedgerTxnList = res.Results.TransactionData;
                        this.CalculateSubLedgerBalance();
                    }
                },
                    (err: DanpheHTTPResponse) => {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error Occurred Detail:${err.ErrorMessage}`]);
                    })
        }
        else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Please Select at least one SubLedger from the list.`]);
        }
    }

    public CalculateSubLedgerBalance(): void {
        this.summaryTxn = [];
        this.summaryView = [];
        this.detailTxn = [];
        this.detailView = [];
        const uniqueLedgerId = this.openingData.map(a => a.LedgerId).filter((value, index, self) => self.indexOf(value) === index);
        this.openingData.forEach(txn => {
            let summary = new SubLedgerTxnSummarVM();
            summary.LedgerId = txn.LedgerId;
            summary.SubLedgerId = txn.SubLedgerId;
            let subLedgerObj = this.subLedgerList.find(a => a.SubLedgerId === txn.SubLedgerId);
            summary.SubLedgerName = subLedgerObj ? subLedgerObj.SubLedgerName : "";
            summary.OpeningDrAmount = txn.OpeningBalance >= 0 ? txn.OpeningBalance : 0;
            summary.OpeningCrAmount = txn.OpeningBalance < 0 ? txn.OpeningBalance : 0;
            let obj = this.subLedgerTxnList.filter(a => a.SubLedgerId === txn.SubLedgerId);
            summary.TxnDrAmount = obj ? obj.reduce((a, b) => a + b.DrAmount, 0) : 0
            summary.TxnCrAmount = obj ? obj.reduce((a, b) => a + b.CrAmount, 0) : 0
            let accumulatedBalance = (summary.OpeningDrAmount + summary.TxnDrAmount + summary.OpeningCrAmount - summary.TxnCrAmount);
            summary.ClosingDrAmount = accumulatedBalance >= 0 ? accumulatedBalance : 0;
            summary.ClosingCrAmount = accumulatedBalance < 0 ? accumulatedBalance : 0;
            this.summaryTxn.push(summary);
        });
        uniqueLedgerId.forEach(ledId => {
            let summaryVM = new SubLedgerSummaryDataVM();
            let led = this.ledgerList.find(led => led.LedgerId === ledId);
            summaryVM.LedgerName = led ? led.LedgerName : ``;
            summaryVM.SubLedgerData = this.summaryTxn.filter(b => b.LedgerId === ledId);
            this.summaryView.push(summaryVM);

            let detailVM = new SubLedgerDetailDataVM();
            let subLedTxn = this.subLedgerTxnList.filter(subLed => subLed.LedgerId === ledId);
            if (subLedTxn.length > 0) {
                const uniqueSubLedgerId = subLedTxn.map(a => a.SubLedgerId).filter((value, index, self) => self.indexOf(value) === index);
                detailVM.LedgerName = led ? led.LedgerName : ``;
                var subLedgerList = new Array<SubLedgerDetailDataSubLedgerList>();
                uniqueSubLedgerId.forEach(subLedId => {
                    let subLed = new SubLedgerDetailDataSubLedgerList();
                    let summaryTxnObj = this.summaryTxn.find(a => a.SubLedgerId === subLedId);
                    subLed.OpeningDrAmount = summaryTxnObj ? summaryTxnObj.OpeningDrAmount : 0;
                    subLed.OpeningCrAmount = summaryTxnObj ? summaryTxnObj.OpeningCrAmount : 0;
                    subLed.SubLedgerName = summaryTxnObj ? summaryTxnObj.SubLedgerName : ``;

                    let items = subLedTxn.filter(item => item.SubLedgerId === subLedId);
                    items.sort((a, b) => {
                        if (a.TransactionDate > b.TransactionDate) return 1;
                        if (a.TransactionDate < b.TransactionDate) return -1;
                        return 0;
                    });

                    let listOfItem = new Array<SubLedgerTxnDetailVM>();
                    items.forEach((item, index) => {
                        let txnItem = new SubLedgerTxnDetailVM();
                        txnItem = item;
                        txnItem.AccumulatedBalance = 0;
                        let voucherTypeObj = this.voucerType.find(voucher => voucher.VoucherId === txnItem.VoucherId);
                        txnItem.VoucerTypeName = voucherTypeObj ? voucherTypeObj.VoucherName : `N/A`;
                        txnItem.AccumulatedBalance += (index === 0) ? (subLed.OpeningDrAmount + subLed.OpeningCrAmount + txnItem.DrAmount - txnItem.CrAmount) : (listOfItem[index - 1].AccumulatedBalance + txnItem.DrAmount - txnItem.CrAmount);
                        listOfItem.push(txnItem);
                    });
                    subLed.SubLedgerDetailTxn = listOfItem;
                    let closingBalance = items[items.length - 1].AccumulatedBalance;
                    subLed.ClosingDrAmount = closingBalance >= 0 ? closingBalance : 0;
                    subLed.ClosingCrAmount = closingBalance < 0 ? closingBalance : 0;
                    subLedgerList.push(subLed);
                });
                detailVM.SubLedgerData = subLedgerList;
                this.detailView.push(detailVM);
            }
            else {
                let subLedgersFromOpening = this.openingData.filter(openingData => openingData.LedgerId === ledId);
                const uniqueSubLedgerId = subLedgersFromOpening.map(a => a.SubLedgerId).filter((value, index, self) => self.indexOf(value) === index);
                detailVM.LedgerName = led ? led.LedgerName : ``;
                let subLedgerDetail = new Array<SubLedgerDetailDataSubLedgerList>();
                uniqueSubLedgerId.forEach(subLedId => {
                    let subLed = new SubLedgerDetailDataSubLedgerList();
                    let summaryTxnObj = this.summaryTxn.find(a => a.SubLedgerId === subLedId);
                    subLed.OpeningDrAmount = summaryTxnObj ? summaryTxnObj.OpeningDrAmount : 0;
                    subLed.OpeningCrAmount = summaryTxnObj ? summaryTxnObj.OpeningCrAmount : 0;
                    subLed.SubLedgerName = summaryTxnObj ? summaryTxnObj.SubLedgerName : ``;
                    subLed.ClosingDrAmount = subLed.OpeningDrAmount;
                    subLed.ClosingCrAmount = subLed.OpeningCrAmount;;
                    subLedgerDetail.push(subLed);
                });
                detailVM.SubLedgerData = subLedgerDetail;
                this.detailView.push(detailVM);
            }
        });
        this.currDateFormatLabel = ENUM_DateFormat.BS;
        this.ChangeDate();
        this.showSubLedgerData = true;
    }

    public OnSubLedgerSelected($event): void {
        if ($event) {
            this.subLedgerIds = [];
            if ($event && $event.length) {
                $event.forEach(v => {
                    this.subLedgerIds.push(v.SubLedgerId);
                })
            }
        }
    }

    public OnLedgerSelected($event): void {
        if ($event) {
            this.filteredSubLedgerList = [];
            this.subLedgerIds = [];
            if ($event && $event.length) {
                $event.forEach(v => {
                    this.filteredSubLedgerList.push(...this.subLedgerList.filter(a => a.LedgerId === v.LedgerId));
                })
            }
            // else {
            //     this.filteredSubLedgerList = this.subLedgerList;
            // }
            this.showSubLedgerData = false;
        }
    }

    public ExportToExcel(tableId: string): void {
        try {
            let Footer = JSON.parse(JSON.stringify(this.footerContent));
            let date = JSON.parse(JSON.stringify(this.dateRange));
            date = date.replace(`To`, ` To:`);
            this.printBy = this.securityService.loggedInUser.Employee.FullName;
            let printBy = JSON.parse(JSON.stringify(this.printBy));
            let printByMessage = '';
            var hospitalName;
            var address;
            let filename;
            let workSheetName;
            filename = workSheetName = this.accountingService.paramExportToExcelData.HeaderTitle;
            if (!!this.accountingService.paramExportToExcelData) {
                if (!!this.accountingService.paramExportToExcelData.HeaderTitle) {
                    if (this.accountingService.paramExportToExcelData.HeaderTitle) {
                        var headerTitle = `SubLedger Report`;
                    }

                    if (this.accountingService.paramExportToExcelData.ShowPrintBy) {
                        if (!printBy.includes(`PrintBy`)) {
                            printByMessage = `Exported By:`
                        } else {
                            printByMessage = ``
                        }
                    } else {
                        printBy = ``;
                    }
                    if (!this.accountingService.paramExportToExcelData.ShowDateRange) {
                        date = ``
                    } else {
                        date
                    }
                    if (this.accountingService.paramExportToExcelData.ShowHeader === true) {
                        hospitalName = this.headerDetail.hospitalName;
                        address = this.headerDetail.address;
                    } else {
                        hospitalName = null;
                        address = null;
                    }
                    if (!this.accountingService.paramExportToExcelData.ShowFooter) {
                        Footer = null;
                    }
                }
            } else {
                Footer = ``;
                printBy = ``;
                date = ``;
                printByMessage = ``;

            }
            CommonFunctions.ConvertHTMLTableToExcelForAccounting(tableId, workSheetName, date,
                headerTitle, filename, hospitalName, address, printByMessage, this.accountingService.paramExportToExcelData.ShowPrintBy, this.accountingService.paramExportToExcelData.ShowHeader,
                this.accountingService.paramExportToExcelData.ShowDateRange, printBy, this.accountingService.paramExportToExcelData.ShowFooter, Footer)

        } catch (ex) {
            console.log(ex);
        }
    }

    public Print(tableId: string): void {
        let date = JSON.parse(JSON.stringify(this.dateRange));
        var printDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        this.printBy = this.securityService.loggedInUser.Employee.FullName;
        let printBy = JSON.parse(JSON.stringify(this.printBy));
        let popupWinindow;
        if (this.accountingService.paramData) {
            if (!this.printBy.includes("Printed")) {
                var currDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
                var nepCurrDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(currDate, ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
                var printedBy = (this.accountingService.paramData.ShowPrintBy) ? `<b>Printed By:</b>&nbsp; ${this.printBy}` : ``;
                this.printBy = printedBy;
            }
            this.dateRange = (this.accountingService.paramData.ShowDateRange) ? date : date = '';
            var Header = document.getElementById("headerForPrint").innerHTML;
            var printContents = `<div>
                              <p class='alignleft'>${this.reportHeader}</p>
                              <p class='alignleft'><b>For the period:</b>
                              ${this.dateRange}<br/></p>
                              <p class='alignright'>
                                ${this.printBy}<br /> 
                                <b>Printed On:</b> (AD)${printDate}<br /> 
                              </p>
                            </div>`
            printContents += `<style> table { border-collapse: collapse; border-color: black;font-size: 11px; background-color: none; } th { color:black; background-color: #599be0;}.ADBS_btn {display:none;padding:0px ;} .tr { color:black; background-color: none;} `
            printContents += `.alignleft {float:left;width:33.33333%;text-align:left;}.aligncenter {float: left;width:33.33333%;text-align:center;}.alignright {float: left;width:33.33333%;text-align:right;}​</style>`;

            printContents += document.getElementById(tableId).innerHTML
            popupWinindow = window.open(
                ``,
                `_blank`,
                `width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no, ADBS_btn=null`
            );
            popupWinindow.document.open();
            let documentContent = `<html><head>`;
            documentContent +=
                `<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>`;
            documentContent +=
                `<link rel="stylesheet" type="text/css" href="../../../themes/theme-default//DanpheStyle.css"/>`;
            documentContent += `</head>`;
            if (this.accountingService.paramData) {
                this.printTitle = this.accountingService.paramData.HeaderTitle;
                this.headerContent = Header;
                printContents = (this.accountingService.paramData.ShowHeader) ? this.headerContent + printContents : printContents;
                printContents = (this.accountingService.paramData.ShowFooter) ? printContents + this.footerContent : printContents;
            }
            documentContent +=
                `<body onload="window.print()"> ${printContents} </body></html>`;
            popupWinindow.document.write(documentContent);
            popupWinindow.document.close();
        }
    }
    ViewTransactionDetails(voucherNumber: string): void {
        this.voucherNumber = null;
        this.changeDetector.detectChanges();
        this.voucherNumber = voucherNumber;
        this.routeFrom.RouteFrom = `SubLedgerReport`;
    }

    public GetNumberView(amount: number): number {
        return Math.abs(amount);
    }

    public ChangeDate(): void {
        for (let detail of this.detailView) {
            for (let subledger of detail.SubLedgerData) {
                for (let txn of subledger.SubLedgerDetailTxn) {
                    if (this.currDateFormatLabel == ENUM_DateFormat.BS) {
                        txn[`TransactionDate`] = this.nepaliCalendarServ.ConvertEngToNepaliFormatted(txn[`TransactionDate`], ENUM_DateTimeFormat.Year_Month_Day);
                    }
                    else {
                        txn[`TransactionDate`] = this.nepaliCalendarServ.ConvertNepStringToEngString(txn[`TransactionDate`]);
                    }
                }
            }
        }
        this.currDateFormatLabel = this.currDateFormatLabel === ENUM_DateFormat.BS ? ENUM_DateFormat.AD : ENUM_DateFormat.BS;
    }
}