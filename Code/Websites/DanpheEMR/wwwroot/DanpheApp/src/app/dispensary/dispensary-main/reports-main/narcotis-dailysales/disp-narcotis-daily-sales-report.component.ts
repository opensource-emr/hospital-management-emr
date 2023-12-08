import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { CoreService } from '../../../../core/shared/core.service';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import PHRMGridColumns from '../../../../pharmacy/shared/phrm-grid-columns';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { GeneralFieldLabels } from '../../../../shared/DTOs/general-field-label.dto';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DLService } from '../../../../shared/dl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
    templateUrl: "./disp-narcotis-daily-sales-report.component.html"
})
export class DISPNarcoticsDailySalesReportComponent {

    ///Daily Sales Summary Report Columns variable
    NarcoticsDailySalesSummaryReportColumns: Array<any> = null;//DailySalesSummaryReportColumns
    ///Daily Stock Summary Report Data variable
    NarcoticsDailySalesSummaryReportData: Array<any> = new Array<any>();//DailySalesSummaryReportData

    public FromDate: string = null; public ItemName: string = "";
    public ToDate: string = null;
    public itemList: Array<any> = new Array<any>();
    public selectedItem: any;
    public itemId: number = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    currentDispensary: PHRMStoreModel;
    dispensaryList: Array<any>;
    selectedDispensary: any;
    StoreId: number;
    public loading: boolean = false;
    public GeneralFieldLabel = new GeneralFieldLabels();
    constructor(public coreservice: CoreService, public pharmacyBLService: PharmacyBLService, public dlService: DLService, public _dispensaryService: DispensaryService,
        public msgBoxServ: MessageboxService) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.NarcoticsDailySalesSummaryReportColumns = PHRMGridColumns.PHRMNarcoticsSalesitemList;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", false));
        this.GetNarcoticsItemsListDetails();
        this.GetActiveDispensarylist();
        this.currentDispensary = this._dispensaryService.activeDispensary;
        this.selectedDispensary = this.currentDispensary.Name;
        this.StoreId = this.currentDispensary.StoreId;
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
        this.NarcoticsDailySalesSummaryReportColumns[6].headerName = `${this.GeneralFieldLabel.NMCNo}`;
    }
    GetActiveDispensarylist() {
        this._dispensaryService.GetAllDispensaryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.dispensaryList = res.Results;
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
        let html = data["ItemName"];
        return html;
    }

    GetReportData() {
        if (this.FromDate == null || this.ToDate == null) {
            this.msgBoxServ.showMessage("Notice", ['Please select valid date.'])
            return;
        }
        else {
            this.loading = true;
            this.pharmacyBLService.GetNarcoticsDailySalesReport(this.FromDate, this.ToDate, this.itemId, this.StoreId).finally(() => {
                this.loading = false;
            }).subscribe(res => {
                if (res.Status == 'OK') {
                    this.NarcoticsDailySalesSummaryReportData = res.Results;
                } else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
        }
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        if ($event) {
            this.FromDate = $event.fromDate
            this.ToDate = $event.toDate;
        }
    }
}






