import { Component, Directive, ViewChild } from '@angular/core';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../shared/phrm-reports-model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";
import { ReportingService } from "./../../reporting/shared/reporting-service";

@Component({
    selector: "my-app",
    templateUrl: "../../view/pharmacy-view/Report/PHRMReturnToSupplierReport.html" 

})
export class PHRMReturnToSupplierReportComponent
{
    PHRMReturnToSupplierReportColumn: Array<any> = null;
    PHRMReturnToSupplierReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
      this.PHRMReturnToSupplierReportColumn = PHRMReportsGridColumns.PHRMReturnToSupplierReport;
        this.phrmReports.FromDate=moment().format('YYYY-MM-DD');   
        this.phrmReports.ToDate=moment().format('YYYY-MM-DD');
    };
       
 //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyReturnToSupplierReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMReturnToSupplierReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') { 
                    this.PHRMReturnToSupplierReportColumn = PHRMReportsGridColumns.PHRMReturnToSupplierReport;                   
                    this.PHRMReturnToSupplierReportData = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });
    }
}