import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    templateUrl: "./phrm-ending-stock-summary-report.html"
})
export class PHRMEndingStockSummaryReportComponent {

    /// Ending Stock Summary Report Columns variable
    PHRMEndingStockSummaryReportColumns: Array<any> = null;
    /// Ending Stock Summary Report Data variable
    PHRMEndingStockSummaryReportData: Array<any> = new Array<any>();
    ////Variable to Bind ItemName Name
    public ItemName: string = "";

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.PHRMEndingStockSummaryReportColumns = PHRMReportsGridColumns.PHRMEndingStockSummaryReport;
    }


    //////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'EndingStockSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    ////Function Call on Button Click of Report
    GetReportData() {
        this.pharmacyBLService.GetEndingStockSummaryReport(this.ItemName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMEndingStockSummaryReportColumns
                    this.PHRMEndingStockSummaryReportColumns = PHRMReportsGridColumns.PHRMEndingStockSummaryReport;
                    ////Assign  Result to PHRMEndingStockSummaryReportData
                    this.PHRMEndingStockSummaryReportData = res.Results;

                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

    }






    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMEndingStockSummaryReport?ItemName=" + this.ItemName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "EndingStockSummaryReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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






