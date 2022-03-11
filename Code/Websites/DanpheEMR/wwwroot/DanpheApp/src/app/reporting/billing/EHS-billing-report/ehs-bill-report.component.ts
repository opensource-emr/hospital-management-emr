import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { ENUM_BillingStatus } from '../../../shared/shared-enums';
import { BillingBLService } from '../../../billing/shared/billing.bl.service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';

@Component({
    templateUrl: "./ehs-bill-report.html"
})
export class RPT_BIL_EHSBillReportComponent {
    public dlService: DLService = null;
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "";
    public billstatus: string = "";

    public servicedepartment: any;
    public itemname: any;
    public selectedItem: string = '';
    public selectedServDept: string = '';
    public serDeptList: Array<any> = [];
    public BillItemList: Array<any> = [];

    public selBillingTypeName: string = "all";
    public loading: boolean = false;//sud:22Sep'21--to handle multiple clicks on show report button.

    public userList = [];
    public selUser = null;

    public DoctorList = [];
    public selAssignedToDoctor = null;
    public selReferredByDoctor = null;
    public selDoctor: any = null;

    public EHSBillReportColumns: Array<any> = [];
    public EHSBillReporttData: Array<any> = [];

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
        public settingsBLService: SettingsBLService,
        public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('TransactionDate', false));
        this.loadDepartments();
        this.LoadAllBillingItems();
        this.LoadDoctorList();
        this.LoadUser();
        this.EHSBillReportColumns = this.reportServ.reportGridCols.EHSBillReport;
    }

    ngOnInit() {
        this.ItemListFormatter = this.ItemListFormatter.bind(this);//to use global variable in list formatter auto-complete

    }

    ngAfterViewChecked() {
        this.footerContent = document.getElementById("dvSummary_EHSBillReport").innerHTML;
    }

    gridExportOptions = {
        fileName: 'EHSBillingList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.loading = true;//disable button until response comes back from api.
        this.EHSBillReporttData = [];//empty the grid data after button is clicked..

        var servDept = this.servicedepartment ? this.servicedepartment.ServiceDepartmentName : '';
        var itemName = this.itemname ? this.itemname.ItemName : '';
        var assignedToDoctorId = this.selAssignedToDoctor ? this.selAssignedToDoctor.EmployeeId : null;
        var referredByDoctorId = this.selReferredByDoctor ? this.selReferredByDoctor.EmployeeId : null;
        var selUserId = this.selUser ? this.selUser.EmployeeId : null;
        this.dlService.Read("/BillingReports/EHSBillReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate
            + "&ServiceDepartmentName=" + this.selectedServDept + "&ItemName=" + this.selectedItem + "&AssignedToDoctorId=" + assignedToDoctorId + "&ReferredByDoctorId=" + referredByDoctorId + "&UserId=" + selUserId)
            .map(res => res)
            .finally(() => { this.loading = false })//re-enable button after response comes back.
            .subscribe(res => this.Success(res),
                res => this.Error(res));
    }

    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {

            this.EHSBillReporttData = res.Results;
            this.CalculateSummaryofDifferentColoumnForSum();
            this.footerContent = document.getElementById("dvSummary_EHSBillReport").innerHTML;
        }
        else if (res.Status == "OK" && res.Results.length == 0)
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different']);
        else
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }

    LoadDoctorList() {
        this.billingBlService.GetDoctorList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.DoctorList = res.Results;
                    CommonFunctions.SortArrayOfObjects(this.userList, "FullName");
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    DoctorListFormatter(data: any): string {
        return data["FullName"];
    }


    LoadUser() {
        this.settingsBLService.GetUserList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.userList = res.Results;
                    CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
                    //this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;

                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    UserListFormatter(data: any): string {
        return data["EmployeeName"];
    }

    CalculateSummaryofDifferentColoumnForSum() {
        this.summary_new.Cash = new BillSummaryFields();
        this.summary_new.CashReturn = new BillSummaryFields();
        this.summary_new.Credit = new BillSummaryFields();
        this.summary_new.CreditReturn = new BillSummaryFields();

        this.summary_new.GrossSales = this.summary_new.TotalDiscount = this.summary_new.TotalSalesReturn = this.summary_new.TotalReturnDiscount =
            this.summary_new.NetSales = this.summary_new.TotalSalesQty = this.summary_new.TotalReturnSalesQty = this.summary_new.NetQuantity = 0;


        if (this.EHSBillReporttData && this.EHSBillReporttData.length > 0) {

            this.EHSBillReporttData.forEach(itm => {
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
                    CommonFunctions.SortArrayOfObjects(this.serDeptList, "ServiceDepartmentName");//this sorts the serDeptList by ServiceDepartmentName.
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
        this.selectedServDept = this.servicedepartment ? this.servicedepartment.ServiceDepartmentName : "";
    }

    ItemNameChanged() {
        this.selectedItem = this.itemname ? this.itemname.ItemName : "";
    }

    public LoadAllBillingItems() {
        this.billingBlService.GetBillItemList()
            .map(res => res).subscribe(res => {
                if (res.Status == "OK") {
                    this.BillItemList = res.Results;
                    CommonFunctions.SortArrayOfObjects(this.BillItemList, "ItemName");
                }
            });
    }

    //sud:6June'20--reusable From-ToDate
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
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