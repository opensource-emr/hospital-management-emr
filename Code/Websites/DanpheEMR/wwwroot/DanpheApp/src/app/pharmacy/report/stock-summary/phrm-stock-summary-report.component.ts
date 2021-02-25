import { ChangeDetectorRef, Component } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { PHRMReportsModel } from '../../shared/phrm-reports-model';
import { PHRMGrandStockTotalModel, PHRMStockSummaryReportModel } from '../../shared/Phrm-Stock-summary-report-model';

@Component({
    selector: 'stock-summary-report',
    templateUrl: "./phrm-stock-summary-report.html"
})
export class PHRMStockSummaryReportComponent {

    ///Stock Summary Report Columns variable
    StockSummaryReportColumns: Array<any> = null;
    ///Stock Summary Report Data variable
    StockSummaryReportData: Array<PHRMStockSummaryReportModel> = new Array<PHRMStockSummaryReportModel>();
    public GrandTotalReportData: PHRMGrandStockTotalModel = new PHRMGrandStockTotalModel();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public dynamicQtyColumList: Array<DynamicColumnModel> = new Array<DynamicColumnModel>();

    public showDataGrid: boolean = false;
    public showItemTxnDetail: boolean = false;

    public selectedItemId: number = null;
    public selectedItemName: string = '';

    public allItemList: any[] = [];

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public ref: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.phrmReports.FromDate = moment().format("YYYY-MM-DD");
        this.phrmReports.ToDate = moment().format("YYYY-MM-DD");
        this.AssignGridColDefaults();
        this.GetItemList();
        this.CreateDynamicColumnList()
        this.showDataGrid = true;
    }
    GetItemList() {
        this.pharmacyBLService.GetItemList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.allItemList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("Notice-Message", ["Failed to load item data."]);
                }
            }, () => {
                this.msgBoxServ.showMessage("Failed", ["Failed to load item data."]);
            });
    }
    public CreateDynamicColumnList() {
        this.dynamicQtyColumList.push({ headerName: "OpeningQty", field: "OpeningQuantity", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Purchase", field: "Purchase", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Return", field: "PurchaseReturn", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "StockManage IN", field: "StockManageIn", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Sale", field: "Sale", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "SaleReturn", field: "SaleReturn", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "StockManage OUT", field: "StockManageOut", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "ClosingQty", field: "ClosingQuantity", width: 70 });
    }
    onChangeColumnSelection($event) {
        this.showDataGrid = false;
        //remove all qty columns
        this.dynamicQtyColumList.forEach(element => {
            let startIndex = this.StockSummaryReportColumns.findIndex(s => s.field == element.field);
            if (startIndex != -1) {
                this.StockSummaryReportColumns.splice(startIndex, 1);
            }
        });
        //add only selected
        if ($event.length > 0) {
            let selectedColumns = new Array<DynamicColumnModel>()
            selectedColumns = $event;
            selectedColumns.forEach(col => {
                this.StockSummaryReportColumns.push(col);
            });
        }
        this.ref.detectChanges();
        this.showDataGrid = true;

    }
    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'StockSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    OnClickShowReport() {
        if (this.selectedItemId != null) {
            this.showItemTxnDetail = true;
        }
        else {
            this.GetReportData();
        }
    }
    //////Function Call on Button Click of Report
    GetReportData() {
        this.pharmacyBLService.GetStockSummaryReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.StkSummary.length > 0) {
                    ////Assign  Result to DailyStockSummaryReportData
                    this.StockSummaryReportData = res.Results.StkSummary;
                    this.GrandTotalReportData = res.Results.GrandTotal;
                }
                else if (res.Status == 'OK' && res.Results.length == 0) {
                    this.StockSummaryReportData = new Array<PHRMStockSummaryReportModel>();
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });
    }
    StockSummaryGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "itemTxnDetail": {
                this.selectedItemId = $event.Data.ItemId;
                this.selectedItemName = $event.Data.ItemName;
                this.showItemTxnDetail = true;
                break;
            }
            default:
                break;
        }
    }
    OnChangeItem($event) {
        //show item txn summary
        this.selectedItemId = $event.ItemId;
        this.selectedItemName = $event.ItemName;
    }
    HideItemTxnSummary() {
        this.selectedItemId = null;
        this.selectedItemName = null;
        this.showItemTxnDetail = false;
        this.ref.detectChanges();
    }

    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
    }
    ItemListFormatter(data: any): string {
        return data["ItemName"];
    }
    private AssignGridColDefaults() {
        this.StockSummaryReportColumns = [
            { headerName: "OpeningAmt", field: "OpeningAmount", width: 100 },
            { headerName: "Item Name", field: "ItemName", width: 150, cellRenderer: this.GetItemAction },
            { headerName: "Unit", field: "UOMName", width: 100 },
            { headerName: "Purchase Amt", field: "PurchaseAmount", width: 100 },
            { headerName: "Purchase Return Amt", field: "PurchaseReturnAmount", width: 150 },
            { headerName: "StockManage IN Amt", field: "StockManageInAmount", width: 150 },
            { headerName: "Sale Amt", field: "SaleAmount", width: 100 },
            { headerName: "SaleReturnAmount", field: "SaleReturnAmount", width: 150 },
            { headerName: "StockManage OUT Amt", field: "StockManageOutAmount", width: 180 },
            { headerName: "ClosingAmt", field: "ClosingAmount", width: 180 },
        ];
    }
    GetItemAction(params) {
        return `<a danphe-grid-action="itemTxnDetail">
                   ${params.data.ItemName}
                 </a>`;
    }
}

class DynamicColumnModel {
    public headerName: string = "";
    public field: string = "";
    public width: number = 70; //default width set to 70    
}
