import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { InventorySummaryReport } from '../shared/inventory-summary-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { CommonFunctions } from '../../../shared/common.functions';
import { CoreService } from '../../../core/shared/core.service';
import { ReportGridColumnSettings } from '../../../shared/danphe-grid/report-grid-column-settings.constant';
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
    InventorySummaryReportData: Array<InventorySummaryReport> = new Array<InventorySummaryReport>();
    public ConsumptionOrDispatch: string = "";
    public summary = {
        OpeningValue: 0, OpeningQuantity: 0, PurchaseValue: 0, PurchaseQuantity: 0, StockManageInValue: 0, StockManageInQuantity: 0, StockManageOutValue: 0,
        StockManageOutQuantity: 0, DispatchValue: 0, DispatchQuantity: 0, ClosingValue: 0, ClosingQuantity: 0, ConsumptionValue: 0, ConsumptionQuantity: 0,
    };
    public loading: boolean = false;
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService,
        public reportServ: ReportingService, public changeDetector: ChangeDetectorRef
    ) {
        this.CreateDynamicColumnList()
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
            if (this.ConsumptionOrDispatch == "dispatch") {
                this.reportServ.reportGridCols.InventorySummaryReport.push({ headerName: "Dispatch Value", field: "DispatchValue", width: 70 });
            }
            this.reportServ.reportGridCols.InventorySummaryReport.push({ headerName: "Closing Value", field: "ClosingValue", width: 70 });
        }
        this.InventorySummaryReportColumns = this.reportServ.reportGridCols.InventorySummaryReport;

    }
    ngOnDestroy() {

        this.reportServ.reportGridCols = new ReportGridColumnSettings(this.coreService.taxLabel);
    }

    public CreateDynamicColumnList() {
        this.dynamicQtyColumList.push({ headerName: "Opening Qty", field: "OpeningQty", width: 70 });
        this.dynamicQtyColumList.push({ headerName: "Purchase Qty", field: "PurchaseQty", width: 70 });
        if (this.ConsumptionOrDispatch == "consumption") {
            this.dynamicQtyColumList.push({ headerName: "Consumption Qty", field: "ConsumptionQty", width: 70 });
            // this.dynamicQtyColumList.push({ headerName: "Consumption Value", field: "ConsumptionValue", width: 70});
        }
        if (this.ConsumptionOrDispatch == "dispatch") {
            this.dynamicQtyColumList.push({ headerName: "Dispatch Qty", field: "DispatchQty", width: 70 });
            // this.dynamicQtyColumList.push( { headerName: "Dispatch Value", field: "DispatchValue", width: 70});
        }

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
        this.loading = true;
        this.inventoryBLService.ShowInventorySummary(this.FromDate, this.ToDate, this.fiscalYearId)
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
        if (res.Status == "OK" && res.Results.length > 0) {

            res.Results.forEach(i => {
                i.OpeningQty = CommonFunctions.parseAmount(i.OpeningQty);
                i.PurchaseQty = CommonFunctions.parseAmount(i.PurchaseQty);
                i.DispatchQty = CommonFunctions.parseAmount(i.DispatchQty);
                i.DispatchValue = CommonFunctions.parseAmount(i.DispatchValue);
                i.ConsumptionQty = CommonFunctions.parseAmount(i.ConsumptionQty);
                i.ConsumptionValue = CommonFunctions.parseAmount(i.ConsumptionValue);
                i.StockManageOutQty = CommonFunctions.parseAmount(i.StockManageOutQty);
                i.StockManageInQty = CommonFunctions.parseAmount(i.StockManageInQty);
                i.ClosingQty = CommonFunctions.parseAmount(i.ClosingQty);
                i.ClosingQty1 = CommonFunctions.parseAmount(i.ClosingQty1);
                i.ClosingValue = CommonFunctions.parseAmount(i.ClosingValue);

            });
            this.InventorySummaryReportData = res.Results;

            this.TotalSummary(this.InventorySummaryReportData);

        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("Error", ["There is no data available."]);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
        this.loading = false;

    }

    TotalSummary(data) {
        let grandTotal = CommonFunctions.getGrandTotalData(this.InventorySummaryReportData);

        this.summary.OpeningValue = grandTotal[0].OpeningValue;
        this.summary.PurchaseValue = grandTotal[0].PurchaseValue;
        this.summary.StockManageInValue = grandTotal[0].StockManageInValue;
        this.summary.StockManageOutValue = grandTotal[0].StockManageOutValue;
        this.summary.DispatchValue = grandTotal[0].DispatchValue;
        this.summary.ConsumptionValue = grandTotal[0].ConsumptionValue;

        this.summary.OpeningQuantity = grandTotal[0].OpeningQty;
        this.summary.PurchaseQuantity = grandTotal[0].PurchaseQty;
        this.summary.StockManageInQuantity = grandTotal[0].StockManageInQty;
        this.summary.StockManageOutQuantity = grandTotal[0].StockManageOutQty;
        this.summary.DispatchQuantity = grandTotal[0].DispatchQty;
        this.summary.ConsumptionQuantity = grandTotal[0].ConsumptionQty;

        var closeValue = 0;
        var closeQty = 0;
        if (this.ConsumptionOrDispatch == "consumption") {
            closeValue = grandTotal[0].ConsumptionValue
            closeQty = grandTotal[0].ConsumptionQty
        }
        else if (this.ConsumptionOrDispatch == "dispatch") {
            closeValue = grandTotal[0].DispatchValue;
            closeQty = grandTotal[0].DispatchQty;
        }

        this.summary.ClosingValue = (this.summary.OpeningValue + this.summary.PurchaseValue + this.summary.StockManageInValue - this.summary.StockManageOutValue) - (closeValue);
        this.summary.ClosingQuantity = (this.summary.OpeningQuantity + this.summary.PurchaseQuantity + this.summary.StockManageInQuantity - this.summary.StockManageOutQuantity) - (closeQty);

    }

}
class DynamicColumnModel {
    public headerName: string = "";
    public field: string = "";
    public width: number = 70; //default width set to 70    
}
