import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import PHRMGridColumns from "../../shared/phrm-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
    templateUrl: "./phrm-narcotics-daily-sales-report.html"
})
export class PHRMNarcoticsDailySalesReportComponent {

    ///Daily Sales Summary Report Columns variable
    NarcoticsDailySalesSummaryReportColumns: Array<any> = null;//DailySalesSummaryReportColumns
    ///Daily Stock Summary Report Data variable
    NarcoticsDailySalesSummaryReportData: Array<any> = new Array<any>();//DailySalesSummaryReportData

    public FromDate: string = null; public ItemName: string = "";
    public ToDate: string = null;
    public itemList: Array<any> = new Array<any>();
    public selectedItem: any;
    public itemId: number = null;
    public storeId: number = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange: string = "";
    public pharmacy: string = "pharmacy";
    public loading: boolean = false;

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.NarcoticsDailySalesSummaryReportColumns = PHRMGridColumns.PHRMNarcoticsSalesitemList;
        this.GetNarcoticsItemsListDetails();
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", false));
    }

    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'NarcoticsDailySalesReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //////Function Call on Button Click of Report
    //get  Narcotics Sales report
    public GetNarcoticsItemsListDetails(): void {
        try {
            this.pharmacyBLService.GetNarcoticsStockDetailsList()
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
                    this.itemList = new Array<any>();//Narcotics Items
                    var narcoticItemList: Array<any> = res.Results;
                    this.itemList = narcoticItemList.reduce((acc: Array<any>, val) => {
                        if (acc.every(a => a.ItemId != val.ItemId)) { acc.push(val) }
                        return acc;
                    }, []);
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
        this.loading = true;
        if (this.FromDate && this.ToDate) {
            this.pharmacyBLService.GetNarcoticsDailySalesReport(this.FromDate, this.ToDate, this.itemId, this.storeId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.NarcoticsDailySalesSummaryReportData = res.Results;
                    } else {
                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                    this.loading = false;

                });
        }
    }


    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    // OnGridExport($event: GridEmitModel) {
    //     this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMDailySalesSummaryReport?FromDate=" + this.FromDate + "&ToDate=" + this.ToDate + "&ItemName=" + this.ItemName)
    //         .map(res => res)
    //         .subscribe(data => {
    //             let blob = data;
    //             let a = document.createElement("a");
    //             a.href = URL.createObjectURL(blob);
    //             a.download = "DailySalesSummaryReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
    //             document.body.appendChild(a);
    //             a.click();
    //         },

    //         res => this.ErrorMsg(res));
    // }
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






