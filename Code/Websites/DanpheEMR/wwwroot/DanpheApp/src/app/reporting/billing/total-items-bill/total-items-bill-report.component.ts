import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_TotalItemsBillModel } from "./total-items-bill-report.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./total-items-bill-report.html"
})
export class RPT_BIL_TotalItemsBillComponent {
    public dlService: DLService = null;
    public fromDate: string = null;
    public toDate: string = null;
    public billstatus: string = "";
    public servicedepartment: any = "";
    public itemname: string = "";
    public TotalItemsBillReportColumns: Array<any> = null;
  public TotalItemsBillReporttData: Array<any> = new Array<RPT_BIL_TotalItemsBillModel>();
  public CurrentTotalItem: RPT_BIL_TotalItemsBillModel = new RPT_BIL_TotalItemsBillModel();
    public serDeptList: any;
    public summary: any = { tot_SubTotal: 0, tot_Quantity: 0, tot_Discount: 0, tot_TotalAmount: 0,
        tot_PaidAmt: 0, tot_UnPaidAmt: 0, tot_CancelAmt: 0, tot_ReturnAmt: 0, tot_ProvisionalAmt: 0 };

    constructor(
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.CurrentTotalItem.fromDate = moment().format('YYYY-MM-DD');
        this.CurrentTotalItem.toDate = moment().format('YYYY-MM-DD');
        this.loadDepartments();
    }

    gridExportOptions = {
        fileName: 'TotalItemBillList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        for (var i in this.CurrentTotalItem.TotalItemBillValidator.controls) {
            this.CurrentTotalItem.TotalItemBillValidator.controls[i].markAsDirty();
            this.CurrentTotalItem.TotalItemBillValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentTotalItem.IsValidCheck(undefined, undefined)) {
            this.fromDate = this.CurrentTotalItem.fromDate;
            this.toDate = this.CurrentTotalItem.toDate;
            this.dlService.Read("/BillingReports/TotalItemsBill?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
                + "&BillStatus=" + this.CurrentTotalItem.billstatus + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
                "&ItemName=" + this.CurrentTotalItem.itemname)
                .map(res => res)
                .subscribe(res => this.Success(res),
                res => this.Error(res));
        }
        else {
            this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
        }
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.TotalItemsBillReportColumns = this.reportServ.reportGridCols.TotalItemsBillReport;
            this.TotalItemsBillReporttData = res.Results;
            this.InitializeVariables();
            this.CalculateSummaryofDifferentColoumnForSum();
        }
        else if (res.Status == "OK" && res.Results.length == 0)
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
        else
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    OnGridExport($event: GridEmitModel) {
        let jsonStrSummary = JSON.stringify(this.summary);
        let summaryHeader = "Total Items Bill Report Summary";
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelTotalItemsBill?FromDate="
            + this.fromDate + "&ToDate=" + this.toDate
            + "&BillStatus=" + this.CurrentTotalItem.billstatus + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
            "&ItemName=" + this.CurrentTotalItem.itemname + "&SummaryData=" + jsonStrSummary + "&SummaryHeader=" + summaryHeader)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "TotalItemsBill_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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
        this.TotalItemsBillReporttData.forEach(SumVariable => {
            this.summary.tot_Quantity += SumVariable.Quantity;
            this.summary.tot_SubTotal += SumVariable.SubTotal;
            this.summary.tot_Discount += SumVariable.DiscountAmount;
            this.summary.tot_TotalAmount += SumVariable.TotalAmount;
            if (SumVariable.BillStatus == "paid")
                this.summary.tot_PaidAmt += SumVariable.TotalAmount;
            else if (SumVariable.BillStatus == "unpaid")
                this.summary.tot_UnPaidAmt += SumVariable.TotalAmount;
            else if (SumVariable.BillStatus == "cancel")
                this.summary.tot_CancelAmt += SumVariable.TotalAmount;
            else if (SumVariable.BillStatus == "provisional")
                this.summary.tot_ProvisionalAmt += SumVariable.TotalAmount;
            else if (SumVariable.BillStatus == "return")
                this.summary.tot_ReturnAmt += SumVariable.TotalAmount;
            //this.summary += SumVariable.;
        });
        this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
        //this.tot_Total = CommonFunctions.parseAmount(this.tot_Total);
    }

    loadDepartments() {
        this.dlService.Read("/BillingReports/GetServiceDeptList")
            .map(res => res).subscribe(res => {
                if (res.Status == "OK") {
                    this.serDeptList = res.Results;
                }
            });
    }

    myListFormatter(data: any): string {
        let html = data["ServiceDepartmentName"];
        return html;
    }

    departmentChanged() {
        this.CurrentTotalItem.servicedepartment = this.servicedepartment ? this.servicedepartment.ServiceDepartmentName : "";
    }

    InitializeVariables() {
        //initializing every variable to zero
        this.summary.tot_CancelAmt = 0;
        this.summary.tot_Discount = 0;
        this.summary.tot_PaidAmt = 0;
        this.summary.tot_ProvisionalAmt = 0;
        this.summary.tot_Quantity = 0;
        this.summary.tot_ReturnAmt = 0;
        this.summary.tot_SubTotal = 0;
        this.summary.tot_TotalAmount = 0;
        this.summary.tot_UnPaidAmt = 0;
    }
}
