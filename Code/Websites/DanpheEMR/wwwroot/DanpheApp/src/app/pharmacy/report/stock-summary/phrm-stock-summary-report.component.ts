import { ChangeDetectorRef, Component } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { PHRMReportsModel } from '../../shared/phrm-reports-model';
import { PHRMStockSummaryReportModel } from '../../shared/Phrm-Stock-summary-report-model';

@Component({
    selector: 'stock-summary-report',
    templateUrl: "./phrm-stock-summary-report.html"
})
export class PHRMStockSummaryReportComponent {

    ///Stock Summary Report Columns variable
    StockSummaryReportColumns: Array<any> = null;
    ///Stock Summary Report Data variable
    StockSummaryReportData: Array<PHRMStockSummaryReportModel> = new Array<PHRMStockSummaryReportModel>();
    public GrandTotalReportData: PHRMStockSummaryReportModel = new PHRMStockSummaryReportModel();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public dynamicQtyColumList: Array<DynamicColumnModel> = new Array<DynamicColumnModel>();

    public showDataGrid: boolean = false;
    public showItemTxnDetail: boolean = false;

    public selectedItemId: number = null;
    public selectedItemName: string = '';
    public allItemList: any[] = [];
    public footerContent = '';
    public dateRange: string = "";
    public StoreList: any[] = [];
    StockSummaryReportList: Array<PHRMStockSummaryReportModel> = new Array<PHRMStockSummaryReportModel>();
    selectedStore: any;

    public pharmacy: string = "pharmacy";
    public loading: boolean = false;
    preselectedColList: any[] = [];

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public ref: ChangeDetectorRef, public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
        this.phrmReports.FromDate = moment().format("YYYY-MM-DD");
        this.phrmReports.ToDate = moment().format("YYYY-MM-DD");

        // get the provisional settings saved in the local storage
        var previouslySavedProvisionalSettingsJSON = localStorage.getItem("PHRM_StockSummary_IncludeProvisional");
        if (previouslySavedProvisionalSettingsJSON) {
            var previouslySavedProvisionalSettings: 0 | 1 = JSON.parse(previouslySavedProvisionalSettingsJSON);
            this.includeProvisionalSalesInReport = previouslySavedProvisionalSettings;
        }

        this.AssignGridColDefaults();
        this.GetItemList();
        this.GetActiveStore();
        this.CreateDynamicColumnList()
        this.showDataGrid = true;
    }
    ngAfterViewChecked() {
        this.footerContent = document.getElementById("print_summary").innerHTML;
    }
    GetActiveStore() {
        this.pharmacyBLService.GetActiveStore()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.StoreList = res.Results;
                    this.StoreList.unshift({ StoreId: null, 'Name': 'All' })
                }
                else {
                    this.msgBoxServ.showMessage("Notice-Message", ["Failed to load stores."]);
                }
            }, () => {
                this.msgBoxServ.showMessage("Failed", ["Failed to load stores."]);
            });
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
    public CreateDynamicColumnList(includeProvisional = true, overwriteSavedCols: boolean = false) {
        if (includeProvisional == true) {
            this.dynamicQtyColumList.push({ headerName: "Opening Qty", field: "OpeningQty_WithProvisional", width: 150 });
            this.dynamicQtyColumList.push({ headerName: "Opening Value", field: "OpeningValue_WithProvisional", width: 150 });
        }
        else {
            this.dynamicQtyColumList.push({ headerName: "Opening Qty", field: "OpeningQty", width: 150 });
            this.dynamicQtyColumList.push({ headerName: "Opening Value", field: "OpeningValue", width: 150 });
        }
        this.dynamicQtyColumList.push({ headerName: "Purchase Qty", field: "PurchaseQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Value", field: "PurchaseValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Return Qty", field: "PurchaseReturnQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Return Value", field: "PurchaseReturnValue", width: 200 });
        this.dynamicQtyColumList.push({ headerName: "Sales Qty", field: "SalesQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Sales Value", field: "SalesValue", width: 150 });
        if (includeProvisional == true) {
            this.dynamicQtyColumList.push({ headerName: "Provisonal Qty", field: "ProvisionalQty", width: 150 });
            this.dynamicQtyColumList.push({ headerName: "Provisonal Value", field: "ProvisionalValue", width: 150 });
        }
        this.dynamicQtyColumList.push({ headerName: "SaleReturn Qty", field: "SaleReturnQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "SaleReturn Value", field: "SaleReturnValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Consumption Qty", field: "ConsumptionQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Consumption Value", field: "ConsumptionValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Write-off Qty", field: "WriteOffQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "Write-off Value", field: "WriteOffValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "StockManageIn Qty", field: "StockManageInQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "StockManageIn Value", field: "StockManageInValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "StockManageOut Qty", field: "StockManageOutQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "StockManageOut Value", field: "StockManageOutValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "TransferIn Value", field: "TransferInValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "TransferIn Qty", field: "TransferInQty", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "TransferOut Value", field: "TransferOutValue", width: 150 });
        this.dynamicQtyColumList.push({ headerName: "TransferOut Qty", field: "TransferOutQty", width: 150 });
        if (includeProvisional == true) {
            this.dynamicQtyColumList.push({ headerName: "Closing Value", field: "ClosingValue_WithProvisional", width: 150 });
            this.dynamicQtyColumList.push({ headerName: "Closing Qty", field: "ClosingQty_WithProvisional", width: 150 });
        }
        else {
            this.dynamicQtyColumList.push({ headerName: "Closing Value", field: "ClosingValue", width: 150 });
            this.dynamicQtyColumList.push({ headerName: "Closing Qty", field: "ClosingQty", width: 150 });
        }


        // preselected column list

        // get the columns saved in the local storage
        var previouslySavedColsJSON = localStorage.getItem("PHRM_StockSummary_SelectedColumns");
        if (previouslySavedColsJSON && !overwriteSavedCols) {
            var previouslySavedCols: any[] = JSON.parse(previouslySavedColsJSON);
            this.preselectedColList.push(...previouslySavedCols);
        }
        else {

            if (includeProvisional == true) {
                this.preselectedColList.push({ headerName: "Opening Value", field: "OpeningValue_WithProvisional", width: 150 });
            } else {
                this.preselectedColList.push({ headerName: "Opening Value", field: "OpeningValue", width: 150 });

            }
            this.preselectedColList.push({ headerName: "Purchase Value", field: "PurchaseValue", width: 150 });
            this.preselectedColList.push({ headerName: "Purchase Return Value", field: "PurchaseReturnValue", width: 200 });
            this.preselectedColList.push({ headerName: "Sales Value", field: "SalesValue", width: 150 });
            if (includeProvisional == true) {
                this.preselectedColList.push({ headerName: "Provisonal Value", field: "ProvisionalValue", width: 150 });
            }
            this.preselectedColList.push({ headerName: "SaleReturn Value", field: "SaleReturnValue", width: 150 });
            this.preselectedColList.push({ headerName: "Write-off Value", field: "WriteOffValue", width: 150 });
            this.preselectedColList.push({ headerName: "Consumption Value", field: "ConsumptionValue", width: 150 });
            if (includeProvisional == true) {
                this.preselectedColList.push({ headerName: "Closing Value", field: "ClosingValue_WithProvisional", width: 150 });
            }
            else {
                this.preselectedColList.push({ headerName: "Closing Value", field: "ClosingValue", width: 150 });
            }
        }
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

        // save the columns to local storage
        localStorage.setItem("PHRM_StockSummary_SelectedColumns", JSON.stringify($event));
        localStorage.setItem("PHRM_StockSummary_IncludeProvisional", this.includeProvisionalSalesInReport.toString());

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
        this.loading = true;
        this.StockSummaryReportList = [];
        this.StockSummaryReportData = [];
        this.GrandTotalReportData = new PHRMStockSummaryReportModel();
        this.pharmacyBLService.GetStockSummaryReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.StkSummary.length > 0) {
                    ////Assign  Result to DailyStockSummaryReportData
                    this.StockSummaryReportList = res.Results.StkSummary;
                    this.StockSummaryReportData = res.Results.StkSummary;
                    this.GrandTotalReportData = res.Results.GrandTotal;
                    this.changeDetector.detectChanges();
                    this.footerContent = document.getElementById("print_summary").innerHTML;
                }
                else if (res.Status == 'OK' && res.Results.length == 0) {
                    this.StockSummaryReportData = new Array<PHRMStockSummaryReportModel>();
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }
                this.loading = false;
                this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
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

    onChangeStore() {
        let store = null;
        if (!this.selectedStore) {
            this.phrmReports.StoreId = null;
        }
        else if (typeof (this.selectedStore) == 'string') {
            store = this.StoreList.find(a => a.Name.toLowerCase() == this.selectedStore.toLowerCase());
        }
        else if (typeof (this.selectedStore) == "object") {
            store = this.selectedStore;
        }
        if (store) {
            this.phrmReports.StoreId = store.StoreId;
        }
        else {
            this.phrmReports.StoreId = null;
        }
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
    validDate: boolean = true;
    selectDate(event) {
        if (event) {
            this.phrmReports.FromDate = event.fromDate;
            this.phrmReports.ToDate = event.toDate;
            this.phrmReports.FiscalYearId = event.fiscalYearId;
            this.validDate = true;
        }
        else {
            this.validDate = false;
        }
        this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
    }
    ItemListFormatter(data: any): string {
        return data["ItemName"];
    }

    StoreListFormatter(data: any): string {
        return data["Name"];
    }
    private AssignGridColDefaults(includeProvisional = true, overwriteSavedCols: boolean = false) {

        this.StockSummaryReportColumns = [
            { headerName: "Store", field: "StoreName", width: 150 },
            { headerName: "Item Name", field: "ItemName", width: 150, cellRenderer: this.GetItemAction },
            { headerName: "Unit", field: "UOMName", width: 150 },
            { headerName: "Batch", field: "BatchNo", width: 150 },
            { headerName: "Expiry", field: "ExpiryDate", width: 150, cellRenderer: this.DateOfExpiry },
            { headerName: "CP", field: "CostPrice", width: 100 },
            { headerName: "SP", field: "MRP", width: 100 },
        ]

        // get the columns saved in the local storage
        var previouslySavedColsJSON = localStorage.getItem("PHRM_StockSummary_SelectedColumns");
        if (previouslySavedColsJSON && !overwriteSavedCols) {
            var previouslySavedCols: any[] = JSON.parse(previouslySavedColsJSON);
            this.StockSummaryReportColumns.push(...previouslySavedCols);
        }
        else {
            if (includeProvisional) {
                this.StockSummaryReportColumns.push({ headerName: "Opening Value", field: "OpeningValue_WithProvisional", width: 150 });
            }
            else {
                this.StockSummaryReportColumns.push({ headerName: "Opening Value", field: "OpeningValue", width: 150 });
            }
            this.StockSummaryReportColumns.push(...
                [
                    { headerName: "Purchase Value", field: "PurchaseValue", width: 150 },
                    { headerName: "Purchase Return Value", field: "PurchaseReturnValue", width: 200 },
                    { headerName: "Sales Value", field: "SalesValue", width: 150 }
                ]);
            if (includeProvisional == true)
                this.StockSummaryReportColumns.push({ headerName: "Provisonal Value", field: "ProvisionalValue", width: 150 });
            this.StockSummaryReportColumns.push(...[
                { headerName: "SaleReturn Value", field: "SaleReturnValue", width: 150 },
                { headerName: "Write-off Value", field: "WriteOffValue", width: 150 },
                { headerName: "Consumption Value", field: "ConsumptionValue", width: 150 }]);
            if (includeProvisional == true) {
                this.StockSummaryReportColumns.push({ headerName: "Closing Value", field: "ClosingValue_WithProvisional", width: 150 });
            }
            else {
                this.StockSummaryReportColumns.push({ headerName: "Closing Value", field: "ClosingValue", width: 150 });
            }
        }
    }
    GetItemAction(params) {
        return `<a danphe-grid-action="itemTxnDetail">
                   ${params.data.ItemName}
                 </a>`;
    }
    DateOfExpiry(params) {
        let expiryDate: Date = params.data.ExpiryDate;
        let expiryDate1 = new Date(params.data.ExpiryDate)
        let date = new Date();
        let datenow = date.setMonth(date.getMonth() + 0);
        let datethreemonth = date.setMonth(date.getMonth() + 3);
        let expDate = expiryDate1.setMonth(expiryDate1.getMonth() + 0);

        if (expDate <= datenow) {
            return "<span style='background-color:red;color:white'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "Exp" + ")"; //Without moment it seperate Date and Time with Letter T
        }
        if (expDate < datethreemonth && expDate > datenow) {

            return "<span style='background-color:yellow;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "(" + "N. Exp" + ")";
        }
        if (expDate > datethreemonth) {

            return "<span style='background-color:white;color:black'>" + moment(expiryDate).format('YYYY-MM-DD') + "</span>";
        }


    }
    /**
     * Boolean value that decides to include provisional sales qty and value in grid and summary. 
     * By default, provisional sale is included
     * @description created by Sanjit
     */
    includeProvisionalSalesInReport: 0 | 1 = 1;
    onIncludeProvisionalSettingsChanged() {
        if (this.includeProvisionalSalesInReport) {
            // add to the grid
            this.AssignGridColDefaults(true, true);
            this.CreateDynamicColumnList(true, true);
            this.ref.detectChanges();

            // add to the summary
            // show opening/closing quantity and value which includes provisional
            // summary part will be handled by ngIf condition, instead from here.

        }
        else {
            // remove from the grid
            this.AssignGridColDefaults(false, true);
            this.CreateDynamicColumnList(false, true);
            this.ref.detectChanges();

            // remove from the summary
            // show opening/closing quantity and value which does not include provisional
            // summary part will be handled by ngIf condition, instead from here.

        }

        // save the columns to local storage
        localStorage.setItem("PHRM_StockSummary_SelectedColumns", JSON.stringify(this.StockSummaryReportColumns));
        localStorage.setItem("PHRM_StockSummary_IncludeProvisional", this.includeProvisionalSalesInReport.toString());
    }
}

class DynamicColumnModel {
    public headerName: string = "";
    public field: string = "";
    public width: number = 70; //default width set to 70    
}
