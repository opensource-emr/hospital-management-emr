import { ChangeDetectorRef, Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import PHRMGridColumns from "../../shared/phrm-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DispensaryService } from '../../../dispensary/shared/dispensary.service';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
@Component({
    selector: 'my-app',
    templateUrl: "./phrm-daily-sales-summary.html"
})
export class PHRMDailySalesSummaryComponent {

    ///Daily Sales Summary Report Columns variable
    DailySalesSummaryReportColumns: Array<any> = null;
    ///Daily Stock Summary Report Data variable
    DailySalesSummaryReportData: Array<any> = new Array<any>();

    public FromDate: string = null; public ItemName: string = "";
    public ToDate: string = null;
    public itemList: Array<any> = new Array<any>();
    public selectedItem: any;
    public itemId: number = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public StoreId: number = null;
    dispensaryList: any[] = [];
    selectedDispensary: any = { StoreId: null, Name: 'All' };
    counterlist: any[] = [];
    userList: any[] = [];
    selectedUser: any = { EmployeeId: null, EmployeeName: 'All' };
    UserId: any = null;
    counterId: any = null;
    grandTotal: any = { totalSalesQty: 0, totalStockValue: 0, totalSalesValue: 0 };
    public footerContent = '';
    public dateRange: string = "";
    public pharmacy: string = "pharmacy";

    public loading: boolean = false;
    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public _dispensaryService: DispensaryService, public msgBoxServ: MessageboxService, public settingBLService: SettingsBLService, public changeDetector: ChangeDetectorRef) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.DailySalesSummaryReportColumns = PHRMGridColumns.PHRMSalesitemList;
        this.getOnlyItemNameList();
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", false));
        this.LoadCounter();
        this.LoadUser();
        this.GetActiveDispensarylist();
    }

    ngAfterViewChecked() {
        this.footerContent = document.getElementById("print_summary").innerHTML;
    }
    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'ItemwiseSalesReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    GetActiveDispensarylist() {
        this._dispensaryService.GetAllDispensaryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.dispensaryList = JSON.parse(JSON.stringify(res.Results)); //Since, we have filter the dispensary list in client side.
                    this.dispensaryList.unshift({ StoreId: null, Name: 'All' });
                }
            })
    }
    DispensaryListFormatter(data: any): string {
        return data["Name"];
    }
    OnDispensaryChange() {
        let dispensary = null;
        if (!this.selectedDispensary) {
            this.StoreId = null;
        }
        else if (typeof (this.selectedDispensary) == 'string') {
            dispensary = this.dispensaryList.find(a => a.Name.toLowerCase() == this.selectedDispensary.toLowerCase());
        }
        else if (typeof (this.selectedDispensary) == "object") {
            dispensary = this.selectedDispensary;
        }
        if (dispensary) {
            this.StoreId = dispensary.StoreId;
        }
        else {
            this.StoreId = null;
        }
    }
    LoadCounter(): void {
        this.counterlist = DanpheCache.GetData(MasterType.PhrmCounter, null);
    }

    LoadUser() {

        this.settingBLService.GetUserList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.userList = res.Results;
                    this.userList.unshift({ EmployeeId: null, EmployeeName: 'All' })
                    CommonFunctions.SortArrayOfObjects(this.userList, "EmployeeName");
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    UserListFormatter(data: any): string {
        return data["EmployeeName"];
    }
    OnUserChange() {
        let user = null;
        if (!this.selectedUser) {
            this.UserId = null;
        }
        else if (typeof (this.selectedUser) == 'string') {
            user = this.userList.find(a => a.EmployeeName.toLowerCase() == this.selectedUser.toLowerCase());
        }
        else if (typeof (this.selectedUser) == "object") {
            user = this.selectedUser;
        }
        if (user) {
            this.UserId = user.EmployeeId;
        }
        else {
            this.UserId = null;
        }
    }
    //////Function Call on Button Click of Report

    public getOnlyItemNameList(): void {
        try {
            this.pharmacyBLService.getOnlyItemNameList()
                .subscribe(res => this.CallBackGetItemTypeList(res));
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    CallBackGetItemTypeList(res) {
        try {
            if (res.Status == 'OK') {
                if (res.Results) {
                    this.itemList = new Array<any>();
                    this.itemList = res.Results;
                }
            }
            else {
                err => {
                    this.msgBoxServ.showMessage("failed", ['failed to get items..']);
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    onChangeItem($event) {
        try {
            if ($event.ItemId > 0) {
                this.itemId = this.selectedItem.ItemId;
            }
            else {
                this.itemId = 0;
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    CheckProperSelectedItem() {
        try {
            if ((typeof this.selectedItem !== 'object') || (typeof this.selectedItem === "undefined") || (typeof this.selectedItem === null)) {
                this.selectedItem = null;
                this.itemId = 0;
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    myItemListFormatter(data: any): string {
        let html = data["ItemName"];//+ " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
        return html;
    }

    GetReportData() {
        
        if (this.FromDate && this.ToDate) {
            if(!this.selectedItem){
                this.msgBoxServ.showMessage("failed", ["Please select an Item from the List."]);
                return;
            }
            this.loading = true;
            this.pharmacyBLService.GetDailySalesSummaryReport(this.FromDate, this.ToDate, this.itemId, this.StoreId, this.counterId, this.UserId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        ////Assign report Column from GridConstant to DailyStockSummaryReportColumns
                        this.DailySalesSummaryReportData = PHRMReportsGridColumns.DailySalesSummaryReportColumns;
                        ////Assign  Result to DailyStockSummaryReportData
                        this.DailySalesSummaryReportData = res.Results;

                        this.grandTotal.totalSalesQty = this.DailySalesSummaryReportData.reduce((a, b) => a + b.Quantity, 0);
                        this.grandTotal.totalSalesValue = this.DailySalesSummaryReportData.reduce((a, b) => a + b.TotalAmount, 0);
                        this.grandTotal.totalStockValue = this.DailySalesSummaryReportData.reduce((a, b) => a + b.StockValue, 0);
                        this.changeDetector.detectChanges();
                        this.footerContent = document.getElementById("print_summary").innerHTML;
                    } else {
                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                    this.loading = false;

                });
        }
    }


    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMDailySalesSummaryReport?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&ItemName=" + this.ItemName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "DailySalesSummaryReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

                res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        this.FromDate = $event ? $event.fromDate : this.FromDate;
        this.ToDate = $event ? $event.toDate : this.ToDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
    }
}






