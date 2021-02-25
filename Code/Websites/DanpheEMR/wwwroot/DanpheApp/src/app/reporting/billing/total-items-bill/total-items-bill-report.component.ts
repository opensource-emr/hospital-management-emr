import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_TotalItemsBillModel } from "./total-items-bill-report.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { ENUM_BillingStatus } from '../../../shared/shared-enums';

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

    public summary: any = {
        tot_SubTotal: 0, tot_Quantity: 0, tot_Discount: 0, tot_TotalAmount: 0,
        tot_PaidAmt: 0, tot_UnPaidAmt: 0, tot_CancelAmt: 0, tot_ReturnAmt: 0, tot_ProvisionalAmt: 0
    };

    public summary_new = {
        Paid: new BillSummaryFields(),
        Unpaid: new BillSummaryFields(),
        Return: new BillSummaryFields(),
        Provisional: new BillSummaryFields(),
        Cancelled: new BillSummaryFields(),
    }

    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();//sud:7June'20
    constructor(
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('BillingDate', false));
        this.loadDepartments();

    }

    gridExportOptions = {
        fileName: 'TotalItemBillList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.dlService.Read("/BillingReports/TotalItemsBill?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
            + "&BillStatus=" + this.CurrentTotalItem.billstatus + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
            "&ItemName=" + this.CurrentTotalItem.itemname)
            .map(res => res)
            .subscribe(res => this.Success(res),
                res => this.Error(res));
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.TotalItemsBillReportColumns = this.reportServ.reportGridCols.TotalItemsBillReport;
            this.TotalItemsBillReporttData = res.Results;
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
        let jsonStrSummary = JSON.stringify(this.summary_new);//this.summary
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
        this.summary_new.Paid = new BillSummaryFields();
        this.summary_new.Unpaid = new BillSummaryFields();
        this.summary_new.Return = new BillSummaryFields();
        this.summary_new.Provisional = new BillSummaryFields();
        this.summary_new.Cancelled = new BillSummaryFields();

       if(this.TotalItemsBillReporttData && this.TotalItemsBillReporttData.length>0){

        this.TotalItemsBillReporttData.forEach(itm => {
            switch (itm.BillStatus) {
                case "paid": {
                    this.summary_new.Paid.TotalQty += itm.Quantity;
                    this.summary_new.Paid.SubTotal += itm.SubTotal;
                    this.summary_new.Paid.Discount += itm.DiscountAmount;
                    this.summary_new.Paid.TotalAmount += itm.TotalAmount;
                    break;
                }
                case "unpaid": {
                    this.summary_new.Unpaid.TotalQty += itm.Quantity;
                    this.summary_new.Unpaid.SubTotal += itm.SubTotal;
                    this.summary_new.Unpaid.Discount += itm.DiscountAmount;
                    this.summary_new.Unpaid.TotalAmount += itm.TotalAmount;
                    break;
                }
                case "return": {
                    this.summary_new.Return.TotalQty += itm.Quantity;
                    this.summary_new.Return.SubTotal += itm.SubTotal;
                    this.summary_new.Return.Discount += itm.DiscountAmount;
                    this.summary_new.Return.TotalAmount += itm.TotalAmount;
                    break;
                }
                case "provisional": {
                    this.summary_new.Provisional.TotalQty += itm.Quantity;
                    this.summary_new.Provisional.SubTotal += itm.SubTotal;
                    this.summary_new.Provisional.Discount += itm.DiscountAmount;
                    this.summary_new.Provisional.TotalAmount += itm.TotalAmount;
                    break;
                }
                case "cancel": {
                    this.summary_new.Cancelled.TotalQty += itm.Quantity;
                    this.summary_new.Cancelled.SubTotal += itm.SubTotal;
                    this.summary_new.Cancelled.Discount += itm.DiscountAmount;
                    this.summary_new.Cancelled.TotalAmount += itm.TotalAmount;
                    break;
                }
                default:
                    break;
            }
        });
       }
       
    }

    loadDepartments() {
        this.dlService.Read("/BillingReports/GetServiceDeptList")
            .map(res => res).subscribe(res => {
                if (res.Status == "OK") {
                    this.serDeptList = res.Results;
                    CommonFunctions.SortArrayOfObjects(this.serDeptList, "ServiceDepartmentName");//this sorts the empRoleList by EmployeeRoleName.
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


    //sud:6June'20--reusable From-ToDate
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
    }

}

//for internal use (inside this report) only.
//sud:10Aug'20
export class BillSummaryFields {
    TotalQty: number = 0;
    SubTotal: number = 0;
    Discount: number = 0;
    TotalAmount: number = 0;
}