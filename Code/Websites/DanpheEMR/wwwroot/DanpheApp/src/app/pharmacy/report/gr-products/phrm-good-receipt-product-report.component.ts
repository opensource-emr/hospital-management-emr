import { Component } from '@angular/core'
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from "../../../shared/messagebox/messagebox.service"
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import * as moment from 'moment/moment';
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { DLService } from "../../../shared/dl.service"
import { ReportingService } from "../../../reporting/shared/reporting-service"
import { PHRMItemMasterModel } from "../../shared/phrm-item-master.model"
import { PHRMGoodsReceiptModel } from "../../shared/phrm-goods-receipt.model"
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
    templateUrl: "./phrm-good-receipt-product-report.html"
})

export class PHRMGoodsReceiptProductReportComponent {
    public ItemListModel: PHRMItemMasterModel = new PHRMItemMasterModel();

    public phrmItemList: PHRMItemMasterModel = new PHRMItemMasterModel();

    public GoodsReceiptItem: PHRMGoodsReceiptModel = new PHRMGoodsReceiptModel();
    public itemList: Array<any> = new Array<any>();
    public selectedItem: any;
    public itemId: number = 0;
    PHRMGoodsReceiptProductReportColumn: Array<any> = null;
    PHRMGoodsReceiptProductReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    dlService: DLService = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange:string="";		
    public pharmacy:string = "pharmacy";
    
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService,
        _dlService: DLService,

    ) {
        this.PHRMGoodsReceiptProductReportColumn = PHRMReportsGridColumns.PHRMGoodsReceiptProductReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.dlService = _dlService;
        this.GetItemsListDetails();
        this.Load();
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyGoodReceiptProductReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    public GetItemsListDetails(): void {
        try {
            this.pharmacyBLService.GetItemsList()
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

    Load() {
        if (this.phrmReports.FromDate && this.phrmReports.ToDate) {
            this.pharmacyBLService.GetPHRMGoodsReceiptProductReport(this.phrmReports, this.itemId)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.PHRMGoodsReceiptProductReportData = res.Results;
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                });
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
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
        this.dateRange="<b>Date:</b>&nbsp;"+this.phrmReports.FromDate+"&nbsp;<b>To</b>&nbsp;"+this.phrmReports.ToDate;
    }
}