import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { PHRMReportsModel } from '../../shared/phrm-reports-model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
    templateUrl: "./phrm-daily-stock-summary-report.html"
})
export class PHRMDailyStockSummaryReportComponent {

    ///Daily Stock Summary Report Columns variable
    DailyStockSummaryReportColumns: Array<any> = null;
    ///Daily Stock Summary Report Data variable
    DailyStockSummaryReportData: Array<any> = new Array<any>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    //public ItemName: string = "";
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.phrmReports.FromDate = moment().format("YYYY-MM-DD");
        this.phrmReports.ToDate = moment().format("YYYY-MM-DD");
        this.DailyStockSummaryReportColumns = PHRMReportsGridColumns.PHRMDailyStockSummaryReport;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("ExpiryDate", false));

    }


    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'Opening/EndingStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //////Function Call on Button Click of Report
    GetReportData() {
        //this.CurrentDate = moment().format("YYYY-MM-DD");
        //if (this.FromDate != "")
        //{
        this.pharmacyBLService.GetDailyStockSummaryReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK' && res.Results.length > 0) {
                    ////Assign report Column from GridConstant to DailyStockSummaryReportColumns
                    this.DailyStockSummaryReportColumns = PHRMReportsGridColumns.PHRMDailyStockSummaryReport;
                    ////Assign  Result to DailyStockSummaryReportData
                    this.DailyStockSummaryReportData = res.Results;
                    //for (var i = 0; i < this.DailyStockSummaryReportData.length; i++) {
                    //    this.DailyStockSummaryReportData[i].TxnDate = moment(this.DailyStockSummaryReportData[i].TxnDate).format("YYYY-MM-DD");
                    //}

                }
                else if (res.Status == 'OK' && res.Results.length == 0) {
                    this.DailyStockSummaryReportData = new Array<any>();
                    this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                }

            });

        //else
        //{
        //    this.msgBoxServ.showMessage("error",['Date Selection is Required'])
        //}


    }
    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMDailyStockSummaryReport?FromDate=" + this.phrmReports.FromDate + "&ToDate=" + this.phrmReports.ToDate)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "'Opening/EndingStockReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

                res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
    }
}






