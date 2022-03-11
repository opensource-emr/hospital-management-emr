import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { DLService } from "../../../shared/dl.service"
import { ReportingService } from "../../../reporting/shared/reporting-service"
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
    templateUrl: "./phrm-stock-manage-report.html"
})

export class PHRMStockManageReportComponent {
    PHRMStockManageReportColumn: Array<any> = null;
    PHRMStockManageReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    dlService: DLService = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public pharmacy:string = "pharmacy";
    
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService,
        _dlService: DLService,

    ) {
        this.PHRMStockManageReportColumn = PHRMReportsGridColumns.PHRMStockManageDetailReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.dlService = _dlService;
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));

    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyStockManageDetailReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMStockManageDetailReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {

                    this.PHRMStockManageReportColumn = PHRMReportsGridColumns.PHRMStockManageDetailReport;
                    this.PHRMStockManageReportData = res.Results;
                    for (var i = 0; i < this.PHRMStockManageReportData.length; i++) {
                        this.PHRMStockManageReportData[i].ExpiryDate = moment(this.PHRMStockManageReportData[i].ExpiryDate).format("YYYY-MM-DD");
                    }
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });

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
