import { Component, Directive, ViewChild } from '@angular/core';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
    templateUrl: "./phrm-return-to-supplier-report.html"

})
export class PHRMReturnToSupplierReportComponent {
    PHRMReturnToSupplierReportColumn: Array<any> = null;
    PHRMReturnToSupplierReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange: string = "";
    public pharmacy: string = "pharmacy";
    public loading: boolean;

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
        this.PHRMReturnToSupplierReportColumn = PHRMReportsGridColumns.PHRMReturnToSupplierReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));

    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyReturnToSupplierReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.loading = true;
        this.pharmacyBLService.GetPHRMReturnToSupplierReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PHRMReturnToSupplierReportColumn = PHRMReportsGridColumns.PHRMReturnToSupplierReport;
                    this.PHRMReturnToSupplierReportData = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
                this.loading = false;
            });
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.phrmReports.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.phrmReports.ToDate;
    }
}