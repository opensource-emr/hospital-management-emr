import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
    selector: 'rpt-bill-dept-item-summary',
  templateUrl: './dept-item-summary-report.html'
})
export class RPT_BIL_BillDeptItemSummaryComponent {
    @Input("fromDate")
    public FromDate: string = "";
    @Input("toDate")
    public ToDate: string = "";
    @Input("serviceDepartment")
    public ServiceDepartment: string = "";
    @Input("showBackButton")
    public showBackBtn: boolean = false;
    public showItemLevelReport: boolean = false;
    public reportData: any = null;
    public summary: any = {
        tot_Quantity: 0, tot_SubTotal: 0, tot_Discount: 0, tot_Refund: 0, tot_TotalAmount: 0, tot_NetTotal: 0,
        tot_Provisional: 0, tot_Cancel: 0, tot_Credit: 0, tot_SalesTotal: 0, tot_CashCollection: 0
    };
    @Output("callBackDepts")
    callbackdept: EventEmitter<Object> = new EventEmitter<Object>();
    public currentDate: string = "";

    @Input("showDeptItemSummary")
    public set value(val: boolean) {
        if (val) {
            this.LoadDeptItemSummary();
        }
        else
            this.showItemLevelReport = false;
    }

    constructor(
        public msgBoxServ: MessageboxService,
        public dlService: DLService,
        public coreService: CoreService,
        public changeDetector: ChangeDetectorRef) {
        this.currentDate = moment().format('YYYY-MM-DD');
    }

    public LoadDeptItemSummary() {
        let srvDept = this.ServiceDepartment.replace(/&/g, '%26');
      this.dlService.Read("/BillingReports/BillDeptItemSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&SrvDeptName=" + srvDept)
            .map(res => res).subscribe(res => {
                if (res.Status == "OK") {
                    let data = JSON.parse(res.Results.JsonData);
                    if (data.ReportData.length > 0) {
                        this.reportData = data.ReportData;
                        this.CalculateSummaryAmounts(this.reportData);
                        this.summary.tot_Provisional = data.Summary[0].ProvisionalAmount;
                        this.summary.tot_Credit = data.Summary[0].CreditAmount;
                        this.summary.tot_Cancel = data.Summary[0].CancelledAmount;
                        this.summary.tot_SalesTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
                        this.summary.tot_CashCollection = CommonFunctions.parseAmount(this.summary.tot_NetTotal - this.summary.tot_Credit);
                        this.showItemLevelReport = true;
                    }
                    else {
                        this.msgBoxServ.showMessage("notice-message", ['No Data is Available for Selected Parameters...']);
                    }
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }

    public ExportToExcelBilDeptItemSummary() {
        let srvDept = this.ServiceDepartment.replace(/&/g, '%26');
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelBilDeptItemSummary?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&SrvDeptName=" + srvDept)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "BilDocDeptItemSummaryReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },
                err => this.ErrorMsg(err));
    }

    public ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    public CallBackDepts() {
        this.callbackdept.emit();
    }

    public CalculateSummaryAmounts(data) {
        //initailize to zero
        this.summary.tot_SubTotal = this.summary.tot_Discount = this.summary.tot_Refund = this.summary.tot_NetTotal = this.summary.tot_TotalAmount = this.summary.tot_Quantity = 0;

        data.forEach(a => {
            this.summary.tot_SubTotal += a.SubTotal;
            this.summary.tot_Discount += a.DiscountAmount;
            this.summary.tot_Refund += a.ReturnAmount;
            this.summary.tot_NetTotal += a.NetAmount;
            this.summary.tot_Quantity += a.Quantity;
            this.summary.tot_TotalAmount += a.TotalAmount;
        });

        this.summary.tot_SubTotal = CommonFunctions.parseAmount(this.summary.tot_SubTotal);
        this.summary.tot_Discount = CommonFunctions.parseAmount(this.summary.tot_Discount);
        this.summary.tot_Refund = CommonFunctions.parseAmount(this.summary.tot_Refund);
        this.summary.tot_NetTotal = CommonFunctions.parseAmount(this.summary.tot_NetTotal);
        this.summary.tot_Quantity = CommonFunctions.parseAmount(this.summary.tot_Quantity);
        this.summary.tot_TotalAmount = CommonFunctions.parseAmount(this.summary.tot_TotalAmount);
    }
}
