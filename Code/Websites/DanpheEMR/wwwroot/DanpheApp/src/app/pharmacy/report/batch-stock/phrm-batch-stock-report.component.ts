import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
//import { ReportingService } from "../../reporting/shared/reporting-service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    selector: 'my-app',
    templateUrl: "./phrm-batch-stock-report.html"
})
export class PHRMBatchStockReportComponent {

    ///Batch Stock Report Columns variable
    PHRMBatchStockReportColumns: Array<any> = null;
    ///Batch Stock Report Data variable
    PHRMBatchStockReportData: Array<any> = new Array<any>();
    ////Variable to Bind Item Name
    public ItemName: string = "";

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.PHRMBatchStockReportColumns = PHRMReportsGridColumns.PHRMBatchStockReport;
    }


    //////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'BatchStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //////Function Call on Button Click of Report
    GetReportData() {
        this.pharmacyBLService.GetBatchStockReport(this.ItemName)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to PHRMBatchStockReportColumns
                    this.PHRMBatchStockReportColumns = PHRMReportsGridColumns.PHRMBatchStockReport;
                    ////Assign  Result to PHRMBatchStockReportData
                    this.PHRMBatchStockReportData = res.Results;
                    for (var i = 0; i < this.PHRMBatchStockReportData.length; i++)
                    {
                        this.PHRMBatchStockReportData[i].ExpiryDate = moment(this.PHRMBatchStockReportData[i].ExpiryDate).format("YYYY-MM-DD");
                    }

                }
                if (res.Status == 'OK' && res.Results.length == 0) {
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

    }






    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMBatchStockReport?ItemName=" + this.ItemName)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "BatchStockReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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






