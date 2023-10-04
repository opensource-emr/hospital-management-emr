import { Component } from "@angular/core";
import * as moment from "moment";
import { ActivateInventoryService } from "../../../../shared/activate-inventory/activate-inventory.service";
import { ItemModel } from "../../../../accounting/settings/shared/item.model";
import { ReportingService } from "../../../../reporting/shared/reporting-service";
import { SettingsBLService } from "../../../../settings-new/shared/settings.bl.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { DetailStockLedger } from "../../../shared/detail-stock-ledger.model";
import { InventoryBLService } from "../../../shared/inventory.bl.service";
import { InventoryReportsBLService } from "../../shared/inventory-reports.bl.service";
import { InventoryReportsDLService } from "../../shared/inventory-reports.dl.service";
import { IGridFilterParameter } from "../../../../shared/danphe-grid/grid-filter-parameter.interface";



@Component({

    templateUrl: "./detail-stock-ledger.html"

})
export class DetailStockLedgerComponent {
    public invReport: DetailStockLedger = new DetailStockLedger();
    DetailStockLedgerColumn: Array<any> = null;
    DetailStockLedgerData: Array<any> = new Array<DetailStockLedger>();
    public itemList: Array<ItemModel> = new Array<ItemModel>();
    public selecteditem: any = null;
    public selectedStoreId: any;
    public FromDate: string = null;
    public ToDate: string = null;
    public loading: boolean = false;
    FilterParameters: IGridFilterParameter[] = [];
    dateRange: string;
    ItemName: any;
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public inventoryService: InventoryBLService,
        public settingsBLService: SettingsBLService,
        public reportServ: ReportingService,
        public msgBoxServ: MessageboxService,
        public ainvService: ActivateInventoryService) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.DetailStockLedgerColumn = this.reportServ.reportGridCols.DetailStockLedgerReport;
        this.GetItem();
        if (this.ainvService.activeInventory && this.ainvService.activeInventory.StoreId) {
            this.selectedStoreId = this.ainvService.activeInventory.StoreId;
        }
    }
    GetItem() {
        this.inventoryBLService.GetItem()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.itemList = res.Results.filter(a => a.IsActive == true);
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }

            });
    }

    ItemListFormatter(data: any): string {
        return data["ItemName"] + (data["Description"] == null || data["Description"] == "" ?"" : "|" + data["Description"]);
    }
    GetReportData() {
        if (this.invReport.ItemId == null) {
            this.msgBoxServ.showMessage("Notification", ["Please select Item First."]);
            return;
        }
        this.FilterParameters = [
            { DisplayName: "ItemName", Value: this.ItemName != null ? this.ItemName : 'All' },
            { DisplayName: "DateRange", Value: this.dateRange }
        ];
        this.loading = true;
        this.inventoryBLService.ShowDetailStockLedger(this.invReport, this.selectedStoreId)
            .map(res => res)
            .subscribe(res => this.Success(res),
                res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("Error", [err]);
        this.loading = false;
    }

    Success(res) {
        this.DetailStockLedgerData = new Array<DetailStockLedger>();
        if (res.Status == "OK" && res.Results.length > 0) {

            this.DetailStockLedgerColumn = this.reportServ.reportGridCols.DetailStockLedgerReport;
            this.DetailStockLedgerData = res.Results;
            // this.invReport.ItemId = null;
            // this.selecteditem = null;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("Error", ["There is no data available."]);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
        this.loading = false;

    }
    onItemChange() {
        let item = null;
        if (!this.selecteditem) {
            this.invReport.ItemId = null;
        }
        else if (typeof (this.selecteditem) == 'string') {
            item = this.itemList.find(a => a.ItemName.toLowerCase() == this.selecteditem.toLowerCase());

        }
        else if (typeof (this.selecteditem == "object")) {
            item = this.selecteditem;

        }
        if (item) {
            this.invReport.ItemId = item.ItemId;
            this.ItemName = this.selecteditem.ItemName;
        }
        else {
            this.invReport.ItemId = null;
        }
    }
    OnFromToDateChange($event) {
        this.invReport.FromDate = $event ? $event.fromDate : this.FromDate;
        this.invReport.ToDate = $event ? $event.toDate : this.ToDate;
    }
    ngAfterViewChecked() {
        this.dateRange = "<b>From:</b>&nbsp;" + this.invReport.FromDate + "&nbsp;<b>To:</b>&nbsp;" + this.invReport.ToDate;
    }



    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'DetailStockLedgerReport' + moment().format('YYYY-MM-DD') + '.xls',
    };
}
