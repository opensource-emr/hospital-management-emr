import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    templateUrl: "./phrm-stock-movement-report.html"
})
export class PHRMStockMovementReportComponent {

    /// Stock Movement Report Columns variable
    PHRMStockMovementReportColumns: Array<any> = null;
    /// Stock Movement Report Data variable
    PHRMStockMovementReportData: Array<any> = new Array<any>();
    ////Variable to Bind ItemName Name
    public ItemName: string = "";

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.PHRMStockMovementReportColumns = PHRMReportsGridColumns.PHRMStockMovementReport;
    }


    //////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'StockMovementReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //////Function Call on Button Click of Report
    GetReportData() {
        this.pharmacyBLService.GetStockMovementReport(this.ItemName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMStockMovementReportColumns
                    this.PHRMStockMovementReportColumns = PHRMReportsGridColumns.PHRMStockMovementReport;
                    ////Assign  Result to PHRMStockMovementReportData
                    this.PHRMStockMovementReportData = res.Results;

                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

    }






    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMStockMovementReport?ItemName=" + this.ItemName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "StockMovementReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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






