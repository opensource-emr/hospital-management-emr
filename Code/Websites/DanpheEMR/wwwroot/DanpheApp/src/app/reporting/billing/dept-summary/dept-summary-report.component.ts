import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { RPT_BIL_DepartmentSummaryReportModel } from './dept-summary-report.model';
import { CommonFunctions } from '../../../shared/common.functions';
@Component({
  templateUrl: "./dept-summary-report.html"
})
export class RPT_BIL_DepartmentSummaryComponent {
    public dlService: DLService = null;
    public http: HttpClient = null;
    public calType: string = "";
    public showAllDeptSummary: boolean = false;
    public showDeptSummary: boolean = false;
    public headerDetails: any = null;
    public reportData: Array<any> = [];
    public servDeptsList: any = null;
    public selServDept: any = null;
    public showBackBtn: boolean = false;
    public currentDate: string = "";
    public summary = {
        tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_Provisional: 0,
        tot_Cancel: 0, tot_Credit: 0, tot_NetTotal: 0, tot_SalesTotal: 0, tot_CashCollection: 0,
        tot_Quantity: 0, tot_TotalAmount: 0, tot_CreditReceived: 0, tot_DepositReceived: 0, tot_DepositRefund: 0
    };
    
  public currentModel: RPT_BIL_DepartmentSummaryReportModel = new RPT_BIL_DepartmentSummaryReportModel();
  public selectedModel: RPT_BIL_DepartmentSummaryReportModel = new RPT_BIL_DepartmentSummaryReportModel();

    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public coreservice: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.dlService = _dlService;
        this.LoadHeaderCalenderDetails();
        this.LoadDeptList();
        this.currentModel.fromDate = this.currentModel.toDate = this.currentDate = moment().format('YYYY-MM-DD');
    }

    Load() {
        this.showAllDeptSummary = this.showDeptSummary = false;
        this.changeDetector.detectChanges();
        for (var i in this.currentModel.BillDeptSummaryValidator.controls) {
            this.currentModel.BillDeptSummaryValidator.controls[i].markAsDirty();
            this.currentModel.BillDeptSummaryValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentModel.IsValidCheck(undefined, undefined)) {
            //assigning selectedmodel values with currentmodel values
            this.selectedModel.fromDate = this.currentModel.fromDate;
            this.selectedModel.toDate = this.currentModel.toDate;
            this.selectedModel.ServiceDepartmentName = this.currentModel.ServiceDepartmentName;
            //checking if servDeptName is given by user or not (taking call accordingly)
            if (this.selectedModel.ServiceDepartmentName.length > 0) {
                this.showBackBtn = false;
                this.showDeptSummary = true;
            }
            else {
                this.dlService.Read("/BillingReports/BillDepartmentSummary?FromDate=" + this.selectedModel.fromDate
                    + "&ToDate=" + this.selectedModel.toDate)
                    .map(res => res)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            let data = JSON.parse(res.Results.JsonData);
                            if (data.ReportData.length > 0) {
                                this.reportData = data.ReportData;
                                this.reportData.forEach(rpt => {
                                    rpt.SubTotal = CommonFunctions.parseAmount(rpt.SubTotal);
                                    rpt.DiscountAmount = CommonFunctions.parseAmount(rpt.DiscountAmount);
                                    rpt.ReturnAmount = CommonFunctions.parseAmount(rpt.ReturnAmount);
                                    rpt.NetSales = CommonFunctions.parseAmount(rpt.NetSales);
                                    rpt.Quantity = CommonFunctions.parseAmount(rpt.Quantity);
                                    rpt.TotalAmount = CommonFunctions.parseAmount(rpt.TotalAmount);
                                });
                                this.CalculateSummaryAmounts(this.reportData);
                                this.summary.tot_Provisional = data.Summary[0].ProvisionalAmount;
                                //this.summary.tot_Credit = data.Summary[0].CreditAmount;//this comes in each row, so we'll get it from CalculateSummaryAmounts
                                this.summary.tot_Cancel = data.Summary[0].CancelledAmount;

                                this.summary.tot_DepositReceived = CommonFunctions.parseAmount(data.Summary[0].AdvanceReceived);
                              this.summary.tot_DepositRefund = CommonFunctions.parseAmount(data.Summary[0].AdvanceSettled);
                              this.summary.tot_CreditReceived = CommonFunctions.parseAmount(data.Summary[0].CreditReceivedAmount);

                                this.summary.tot_SalesTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
                                //this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal + data.Summary[0].AdvanceReceived - data.Summary[0].AdvanceSettled - this.summary.tot_Credit);
                                this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal + data.Summary[0].AdvanceReceived - data.Summary[0].AdvanceSettled - this.summary.tot_Credit + this.summary.tot_CreditReceived);

                                this.showAllDeptSummary = true;
                            }
                            else {
                                this.msgBoxServ.showMessage("notice-message", ['No Data is Available for Selected Parameters...']);
                            }
                        }
                        else {
                            this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
                        }
                    });
            }
        }
    }

    public ExportToExcelBilDeptSummary() {
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelBilDeptSummary?FromDate=" + this.selectedModel.fromDate
            + "&ToDate=" + this.selectedModel.toDate)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "BilDeptSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },
                err => this.ErrorMsg(err));
    }

    public ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    //calendertypes and header from parameter table
    public LoadHeaderCalenderDetails() {
        let allParams = this.coreservice.Parameters;
        if (allParams.length) {
            let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
            if (CalParms) {
                let Obj = JSON.parse(CalParms.ParameterValue);
                this.calType = Obj.DepartmentSummary;
            }
            let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
            if (HeaderParms) {
                this.headerDetails = JSON.parse(HeaderParms.ParameterValue);
            }
        }
    }
    //getting service departments name from FN_BIL_GetTxnItemsInfoWithDateSeparation
    public LoadDeptList() {
        this.dlService.Read("/BillingReports/LoadDeptListFromFN")
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.servDeptsList = res.Results;
                }
                else
                    this.msgBoxServ.showMessage('notice-message', ["Failed to load Service departments"]);
            });
    }

    myListFormatter(data: any): string {
        let html = data["ServiceDepartmentName"];
        return html;
    }

    public ServDeptChanged() {
        this.currentModel.ServiceDepartmentName = this.selServDept ? this.selServDept.ServiceDepartmentName : "";
    }

    public CallBackFromDeptItem() {
        this.showDeptSummary = false;
        this.showAllDeptSummary = true;
        this.changeDetector.detectChanges();
    }

    public LoadDeptItems(row) {
        this.selectedModel.ServiceDepartmentName = row.ServiceDepartment;
        this.showAllDeptSummary = false;
        this.showBackBtn = true;
        this.showDeptSummary = true;
        this.changeDetector.detectChanges();
    }

    public CalculateSummaryAmounts(data) {
        //initailize to zero
        this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_TotalAmount = this.summary.tot_Quantity = this.summary.tot_Cancel = this.summary.tot_Credit = this.summary.tot_Provisional = 0;

        data.forEach(a => {
            this.summary.tot_SubTotal += a.SubTotal;
            this.summary.tot_Discount += a.DiscountAmount;
            this.summary.tot_Refund += a.ReturnAmount;
            this.summary.tot_NetTotal += a.NetSales;
            this.summary.tot_Quantity += a.Quantity;
            this.summary.tot_TotalAmount += a.TotalAmount;
            this.summary.tot_Credit += a.CreditAmount;
            this.summary.tot_CreditReceived += a.CreditReceivedAmount;


        });

        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
        this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
        this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
        this.summary.tot_Credit = CommonFunctions.parseAmount(this.summary.tot_Credit);
        this.summary.tot_CreditReceived = CommonFunctions.parseAmount(this.summary.tot_CreditReceived);
    }

    Print() {
        let popupWinindow;
        var printContents = document.getElementById("printPage").innerHTML;
        var HeaderContent = document.getElementById("headerForPrint").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head><style> .non-printable { visibility: hidden; }</style>';
        documentContent += '<body onload="window.print()">' + HeaderContent + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    }
}
