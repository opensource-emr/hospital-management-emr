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
import { BillingBLService } from '../../../billing/shared/billing.bl.service';

@Component({
    templateUrl: "./total-items-bill-report.html"
})
export class RPT_BIL_TotalItemsBillComponent {
    public dlService: DLService = null;
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "";
    public billstatus: string = "";
    public servicedepartment: any = "";
    public itemname: string = "";
    public TotalItemsBillReportColumns: Array<any> = null;
    public TotalItemsBillReporttData: Array<any> = new Array<RPT_BIL_TotalItemsBillModel>();
    public CurrentTotalItem: RPT_BIL_TotalItemsBillModel = new RPT_BIL_TotalItemsBillModel();
    public serDeptList: any;
    public BillItemList: any;

    public selBillingTypeName: string = "all";
    public loading: boolean = false;//sud:22Sep'21--to handle multiple clicks on show report button.

    public summary_new = {
        Cash: new BillSummaryFields(),
        CashReturn: new BillSummaryFields(),
        Credit: new BillSummaryFields(),
        CreditReturn: new BillSummaryFields(),
        GrossSales: 0,
        TotalDiscount: 0,
        TotalSalesReturn: 0,
        TotalReturnDiscount: 0,
        NetSales: 0,
        TotalSalesQty: 0,
        TotalReturnSalesQty: 0,
        NetQuantity: 0
    }



    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();//sud:7June'20

    public footerContent = '';//sud:24Aug'21--For Summary.
    constructor(
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService,
        public billingBlService: BillingBLService,
        public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
        this.loadDepartments();
        this.LoadAllBillingItems();
        this.TotalItemsBillReportColumns = this.reportServ.reportGridCols.TotalItemsBillReport;
    }

    ngOnInit() {
        this.ItemListFormatter = this.ItemListFormatter.bind(this);//to use global variable in list formatter auto-complete

    }

    ngAfterViewChecked() {
        this.footerContent = document.getElementById("dvSummary_TotalItemBills").innerHTML;
    }

    gridExportOptions = {
        fileName: 'TotalItemBillList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.loading=true;//disable button until response comes back from api.
        this.TotalItemsBillReporttData = [];//empty the grid data after button is clicked..
        this.dlService.Read("/BillingReports/TotalItemsBill?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
            + "&billingType=" + this.selBillingTypeName + "&ServiceDepartmentName=" + this.CurrentTotalItem.servicedepartment +
            "&ItemName=" + this.CurrentTotalItem.itemname)
            .map(res => res)
            .finally(() => { this.loading = false })//re-enable button after response comes back.
            .subscribe(res => this.Success(res),
                res => this.Error(res));
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            
            this.TotalItemsBillReporttData = res.Results;
            this.CalculateSummaryofDifferentColoumnForSum();
            this.footerContent = document.getElementById("dvSummary_TotalItemBills").innerHTML;
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
        this.summary_new.Cash = new BillSummaryFields();
        this.summary_new.CashReturn = new BillSummaryFields();
        this.summary_new.Credit = new BillSummaryFields();
        this.summary_new.CreditReturn = new BillSummaryFields();

        this.summary_new.GrossSales = this.summary_new.TotalDiscount = this.summary_new.TotalSalesReturn = this.summary_new.TotalReturnDiscount =
            this.summary_new.NetSales = this.summary_new.TotalSalesQty = this.summary_new.TotalReturnSalesQty = this.summary_new.NetQuantity = 0;


        if (this.TotalItemsBillReporttData && this.TotalItemsBillReporttData.length > 0) {

            this.TotalItemsBillReporttData.forEach(itm => {
                switch (itm.BillingType) {
                    case "CashSales": {
                        this.summary_new.Cash.TotalQty += itm.Quantity;
                        this.summary_new.Cash.SubTotal += itm.SubTotal;
                        this.summary_new.Cash.Discount += itm.DiscountAmount;
                        this.summary_new.Cash.TotalAmount += itm.TotalAmount;
                        break;
                    }
                    case "ReturnCashSales": {
                        this.summary_new.CashReturn.TotalQty += itm.Quantity;
                        this.summary_new.CashReturn.SubTotal += itm.SubTotal;
                        this.summary_new.CashReturn.Discount += itm.DiscountAmount;
                        this.summary_new.CashReturn.TotalAmount += itm.TotalAmount;
                        break;
                    }
                    case "CreditSales": {
                        this.summary_new.Credit.TotalQty += itm.Quantity;
                        this.summary_new.Credit.SubTotal += itm.SubTotal;
                        this.summary_new.Credit.Discount += itm.DiscountAmount;
                        this.summary_new.Credit.TotalAmount += itm.TotalAmount;
                        break;
                    }
                    case "ReturnCreditSales": {
                        this.summary_new.CreditReturn.TotalQty += itm.Quantity;
                        this.summary_new.CreditReturn.SubTotal += itm.SubTotal;
                        this.summary_new.CreditReturn.Discount += itm.DiscountAmount;
                        this.summary_new.CreditReturn.TotalAmount += itm.TotalAmount;
                        break;
                    }
                    default:
                        break;
                }
            });

            this.summary_new.GrossSales = this.summary_new.Cash.SubTotal + this.summary_new.Credit.SubTotal;
            this.summary_new.TotalDiscount = this.summary_new.Cash.Discount + this.summary_new.Credit.Discount;
            this.summary_new.TotalSalesReturn = this.summary_new.CashReturn.SubTotal + this.summary_new.CreditReturn.SubTotal;
            this.summary_new.TotalReturnDiscount = this.summary_new.CashReturn.Discount + this.summary_new.CreditReturn.Discount;
            this.summary_new.TotalSalesQty = this.summary_new.Cash.TotalQty + this.summary_new.Credit.TotalQty;
            this.summary_new.TotalReturnSalesQty = this.summary_new.CashReturn.TotalQty + this.summary_new.CreditReturn.TotalQty;
            this.summary_new.NetQuantity = this.summary_new.TotalSalesQty - this.summary_new.TotalReturnSalesQty;
            this.summary_new.NetSales = this.summary_new.GrossSales - this.summary_new.TotalDiscount - this.summary_new.TotalSalesReturn + this.summary_new.TotalReturnDiscount;
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

    ServiceDepartmentListFormatter(data: any): string {
        let html = data["ServiceDepartmentName"];
        return html;
    }

    ItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }

    departmentChanged() {
        this.CurrentTotalItem.servicedepartment = this.servicedepartment ? this.servicedepartment.ServiceDepartmentName : "";
    }

    ItemNameChanged() {
        this.CurrentTotalItem.itemname = this.itemname;
    }

    //sud:6June'20--reusable From-ToDate
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
    }

    public LoadAllBillingItems() {
        this.billingBlService.GetBillItemList()
            .subscribe((res) => {
                if (res.Status == "OK") {
                    this.BillItemList = res.Results;
                }
            });
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