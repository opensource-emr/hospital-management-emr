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
    templateUrl: "./phrm-transfer-to-store-report.html"

})
export class PHRMTransferToStoreReportComponent {
    PHRMTransferToStoreReportColumn: Array<any> = null;
    PHRMTransferToStoreReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public pharmacy:string = "pharmacy";

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
        this.PHRMTransferToStoreReportColumn = PHRMReportsGridColumns.PHRMTransferToStoreReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyTransferToStoreReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMTransferToStoreReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PHRMTransferToStoreReportColumn = PHRMReportsGridColumns.PHRMTransferToStoreReport;
                    this.PHRMTransferToStoreReportData = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });
    }

    OnFromToDateChange($event) {
        this.phrmReports.FromDate = $event ? $event.fromDate : this.phrmReports.FromDate;
        this.phrmReports.ToDate = $event ? $event.toDate : this.phrmReports.ToDate;
    }

}