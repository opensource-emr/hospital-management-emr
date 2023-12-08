import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { InventorySummaryReport } from '../shared/inventory-summary-report.model';

import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { ReportGridColumnSettings } from '../../../shared/danphe-grid/report-grid-column-settings.constant';
import { ENUM_DanpheHTTPResponseText } from '../../../shared/shared-enums';
import { INV_RPT_InventorySummaryReport_DTO } from '../dto/inv_rpt_inventory-summary-report.dto';
@Component({
    //selector: 'my-app',
    templateUrl: "../../../view/inventory-view/Reports/InventorySummary.html" // "/InventoryReports/InventorySummary"

})
export class InventorySummaryComponent implements OnInit, OnDestroy {
    public FromDate: string = null;
    public ToDate: string = null;
    public fiscalYearId: number = 0;
    public ItemName: string = null;
    public dynamicQtyColumList: Array<DynamicColumnModel> = new Array<DynamicColumnModel>();
    public CurrentInventorySummary: InventorySummaryReport = new InventorySummaryReport();
    public showDataGrid: boolean = true;
    InventorySummaryReportColumns: Array<any> = null;
    InvRptColumns: Array<any> = null;
    public ConsumptionOrDispatch: string = "";
    public storeList: Array<StoreModel> = new Array<StoreModel>();
    public InventorySummaryReportData: Array<INV_RPT_InventorySummaryReport_DTO> = new Array<INV_RPT_InventorySummaryReport_DTO>();
    public Store: StoreModel = { StoreId: null, StoreName: 'All' };
    public storeId: number = null;


    public summary = {
        OpeningValue: 0, OpeningQuantity: 0, PurchaseValue: 0, PurchaseQuantity: 0, StockManageInValue: 0, StockManageInQuantity: 0, StockManageOutValue: 0,
        StockManageOutQuantity: 0, DispatchValue_Capital: 0, DispatchQuantity_Capital: 0, DispatchValue_Consumables: 0, DispatchQuantity_Consumables: 0,
        ClosingValue: 0, ClosingQuantity: 0, ConsumptionValue: 0, ConsumptionQuantity: 0, TransInQty: 0, TransInValue: 0, TransOutQty: 0, TransOutValue: 0
    };
    public loading: boolean = false;
    dateRange: string;
    FilterParameters: IGridFilterParameter[] = [];
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService,
        public reportServ: ReportingService, public changeDetector: ChangeDetectorRef
    ) {
        this.CreateDynamicColumnList();
        this.GetAllStoreList();
    }
    gridExportOptions = {
        fileName: 'InventorySummaryList' + moment().format('YYYY-MM-DD') + '.xls',
    };

    ngOnInit() {
        //decide inventory from consumption or dispath        
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'ConsumptionOrDispatchForReports' && a.ParameterGroupName == 'Inventory').ParameterValue;
        if (paramValue) {
            this.ConsumptionOrDispatch = paramValue;
            if (this.ConsumptionOrDispatch == "consumption") {
                this.reportServ.reportGridCols.InventorySummaryReport.push({ headerName: "Consumption Value", field: "ConsumptionValue", width: 70 });
            }
            this.reportServ.reportGridCols.InventorySummaryReport.push({ headerName: "Closing Value", field: "ClosingValue", width: 70 });
        }
        this.InventorySummaryReportColumns = this.reportServ.reportGridCols.InventorySummaryReport;
    }
    ngOnDestroy() {

        this.reportServ.reportGridCols = new ReportGridColumnSettings(this.coreService.taxLabel, this.coreService);
    }
    ngAfterViewChecked() {
        this.dateRange = "<b>From:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.ToDate;
    }
    private GetAllStoreList() {
        this.inventoryBLService.GetAllSubStores().subscribe(res => {
            if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
                this.storeList = res.Results;
                this.storeList.unshift({ StoreId: null, StoreName: 'All' });

            }
            else {
                this.msgBoxServ.showMessage("Notice-Message", ["Failed to load Store list."]);
            }
        }, err => {
            console.log(err);
            this.msgBoxServ.showMessage("Failed", ["Failed to load Store list."]);
        });
    }
    public CreateDynamicColumnList() {
        this.dynamicQtyColumList.push({ headerName: "Opening Qty", field: "OpeningQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Qty", field: "PurchaseQty", width: 70 });
        if (this.ConsumptionOrDispatch == "consumption") {
            this.dynamicQtyColumList.push({ headerName: "Consumption Qty", field: "ConsumptionQty", width: 70 });
        }
        this.dynamicQtyColumList.push({ headerName: "TransInQty", field: "TransInQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "TransOutQty", field: "TransOutQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "StockManage-Out Qty", field: "StockManageOutQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "StockManage-In Qty", field: "StockManageInQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Closing Qty", field: "ClosingQty", width: 70 });
    }
    onChangeColumnSelection($event) {
        //remove all qty columns
        this.dynamicQtyColumList.forEach(element => {
            let startIndex = this.reportServ.reportGridCols.InventorySummaryReport.findIndex(s => s.field == element.field);
            if (startIndex != -1) {
                this.reportServ.reportGridCols.InventorySummaryReport.splice(startIndex, 1);
            }
        });
        //add only selected
        if ($event.length > 0) {
            let selectedColumns = new Array<DynamicColumnModel>()
            selectedColumns = $event;
            selectedColumns.forEach(col => {
                this.reportServ.reportGridCols.InventorySummaryReport.push(col);
            });
        }
        this.showDataGrid = false;
        this.changeDetector.detectChanges();
        this.InventorySummaryReportColumns = [];
        this.InventorySummaryReportColumns = this.reportServ.reportGridCols.InventorySummaryReport;
        this.showDataGrid = true;

    }

    public validDate: boolean = true;
    selectDate(event) {
        if (event) {
            this.FromDate = event.fromDate;
            this.ToDate = event.toDate;
            this.fiscalYearId = event.fiscalYearId;
            this.validDate = true;
        }
        else {
            this.validDate = false;
        }
    }
    ShowInventorySummary() {
        this.FilterParameters = [
            { DisplayName: "DateRange:", Value: this.dateRange }
        ]
        this.loading = true;
        this.inventoryBLService.ShowInventorySummary(this.FromDate, this.ToDate, this.fiscalYearId, this.storeId).finally(() => {
            this.loading = false;
        })
            .map(res => res)
            .subscribe(
                res => this.Success(res),
                res => this.Error(res)
            );
        // this.loading = false;
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
        this.loading = false;
    }
    Success(res) {
        if (res.Status == ENUM_DanpheHTTPResponseText.OK && res.Results.length > 0) {

            this.CalculateSummaryData(res.Results);

            //Format the Value seen in Grid upto 2-3 decimal (whichiver common function provides.)
            res.Results.forEach(i => {
                i.OpeningQty = CommonFunctions.parseAmount(i.OpeningQty);
                i.PurchaseQty = CommonFunctions.parseAmount(i.PurchaseQty);
                i.ConsumptionQty = CommonFunctions.parseAmount(i.ConsumptionQty);
                i.ConsumptionValue = CommonFunctions.parseAmount(i.ConsumptionValue);
                i.StockManageOutQty = CommonFunctions.parseAmount(i.StockManageOutQty);
                i.StockManageInQty = CommonFunctions.parseAmount(i.StockManageInQty);
                i.ClosingQty = CommonFunctions.parseAmount(i.ClosingQty);
                i.ClosingValue = CommonFunctions.parseAmount(i.ClosingValue);
                i.TransInQty = CommonFunctions.parseAmount(i.TransInQty);
                i.TransInValue = CommonFunctions.parseAmount(i.TransInValue);
                i.TransOutQty = CommonFunctions.parseAmount(i.TransOutQty);
                i.TransOutValue = CommonFunctions.parseAmount(i.TransOutValue);

            });
            this.InventorySummaryReportData = res.Results;
            //this.TotalSummary(this.InventorySummaryReportData);

        }
        else if (res.Status == ENUM_DanpheHTTPResponseText.OK && res.Results.length == 0) {
            this.msgBoxServ.showMessage("Error", ["There is no data available."]);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
        this.loading = false;

    }
    StoreListFormatter(data: any): string {
        return data["StoreName"];
    }
    onStoreModelChanged() {
        this.storeId = this.Store.StoreId != null ? this.Store.StoreId : null;
    }
    CalculateSummaryData(data: Array<any>) {
        //Reset All Values to Zero 
        this.summary.OpeningValue = this.summary.OpeningQuantity = this.summary.PurchaseValue = this.summary.PurchaseQuantity = this.summary.StockManageInValue
            = this.summary.StockManageInQuantity = this.summary.StockManageOutValue
            = this.summary.StockManageOutQuantity = this.summary.DispatchValue_Capital = this.summary.DispatchQuantity_Capital = this.summary.DispatchValue_Consumables
            = this.summary.DispatchQuantity_Consumables = this.summary.ClosingValue = this.summary.ClosingQuantity
            = this.summary.ConsumptionValue = this.summary.ConsumptionQuantity = this.summary.StockManageInValue = 0;

        if (data && data.length > 0) {
            data.forEach(row => {
                this.summary.OpeningQuantity += row.OpeningQty;
                this.summary.OpeningValue += row.OpeningValue;
                this.summary.PurchaseQuantity += row.PurchaseQty;
                this.summary.PurchaseValue += row.PurchaseValue;
                this.summary.StockManageOutQuantity += row.StockManageOutQty;
                this.summary.StockManageOutValue += row.StockManageOutValue;
                this.summary.StockManageInQuantity += row.StockManageInQty;
                this.summary.StockManageInValue += row.StockManageInValue;
                this.summary.ClosingQuantity += row.ClosingQty;
                this.summary.ClosingValue += row.ClosingValue;
                this.summary.TransInQty += row.TransInQty;
                this.summary.TransInValue += row.TransInValue;
                this.summary.TransOutQty += row.TransOutQty;
                this.summary.TransOutValue += row.TransOutValue;
                if (this.ConsumptionOrDispatch == "dispatch") {
                    //Need to add Capital and Consumables into Different Variables.
                    if (row.ItemType.toLowerCase() == "consumables") {
                        this.summary.DispatchQuantity_Consumables += row.DispatchQty;
                        this.summary.DispatchValue_Consumables += row.DispatchValue;
                    }
                    else {
                        this.summary.DispatchQuantity_Capital += row.DispatchQty;
                        this.summary.DispatchValue_Capital += row.DispatchValue;
                    }
                }
                if (this.ConsumptionOrDispatch == "consumption") {
                    //Here consumable item are only considered for consumption.
                    this.summary.ConsumptionQuantity += row.ConsumptionQty;
                    this.summary.ConsumptionValue += row.ConsumptionValue;
                }
            });

        }
    }
}
class DynamicColumnModel {
    public headerName: string = "";
    public field: string = "";
    public width: number = 70; //default width set to 70    
}
class StoreModel {
    public StoreId: number = null;
    public StoreName: string = "";
}

