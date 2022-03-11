import { Component, Directive, ViewChild } from '@angular/core';
import * as moment from 'moment/moment';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { WardSupplyBLService } from '../../../../wardsupply/shared/wardsupply.bl.service';
import { GridEmitModel } from "../../../../shared/danphe-grid/grid-emit.model";
import { DLService } from '../../../../shared/dl.service';
@Component({
    templateUrl : "./supplier-information-report-component.html" 
})
export class INVSupplierInfoReportComponent {


    INVSupplierInformationReportColumns: Array<any> = null;
    INVSupplierInformationReportData: Array<any> = new Array<any>();
  
    public inventoryList:Array<PHRMStoreModel> = new Array<PHRMStoreModel>();
    public FromDate: string = null;
    public ToDate: string = null;
    public selectedInventory: number = null;
    public StoreId: number = null;
    public loading: boolean = false;
    constructor(private inventoryReportsBLService: InventoryReportsBLService,
        private reportService: ReportingService,
        public msgBoxServ: MessageboxService,
        public wardSupplyBLService: WardSupplyBLService,
        public dlService: DLService) {
        this.INVSupplierInformationReportColumns = this.reportService.reportGridCols.INVSupplierInfoReport;
        this.GetInventoryList();
        this.GetReportData();
    }
    GetInventoryList()
    { 
        this.inventoryReportsBLService.GetInventoryList().subscribe(res => {
            if (res.Status == "OK") {
              this.inventoryList = res.Results;
        }
        else {
            console.log(res);
            this.msgBoxServ.showMessage("Failed", ["Failed to load inventory list"]);
          }
        },
          err => console.log(err));
    }
    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'InventorySupplierInfoReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    GetReportData() {
        this.loading = true;
        this.inventoryReportsBLService.GetSupplierInformationReportList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.INVSupplierInformationReportColumns = this.reportService.reportGridCols.INVSupplierInfoReport;
                    this.INVSupplierInformationReportData = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });
            this.loading = false;
    }

    OnInventoryChange() {
        let inventory = null;
        if (!this.selectedInventory) {
            this.StoreId = null;
        }
        else if  (this.selectedInventory) {
            inventory = this.inventoryList.find(a => a.StoreId == this.selectedInventory);
        }
        else if (typeof (this.selectedInventory) == "object") {
            inventory = this.selectedInventory;
        }
        if (inventory) {
            this.StoreId = inventory.StoreId;

        }
        else {
            this.StoreId = null;
        }
    }

    //on click grid export button we are catching in component an event.. 
    //and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/InventoryReport/ExportToExcelINVSupplierInfoReport")
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "InventorySupplierInfoReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

            res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }
}






