import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../shared/phrm-reports-model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";


@Component({
    selector: "my-app",
    templateUrl: "../../view/pharmacy-view/Report/PHRMUserwiseCollectionReport.html" //"/PharmacyView/UserwiseCollectionReport"

})

export class PHRMUserwiseCollectionReportComponent
{

    PHRMUserReportColumn: Array<any> = null;
    PHRMUserReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
      this.PHRMUserReportColumn = PHRMReportsGridColumns.PHRMUserwiseCollectionReport;
        this.phrmReports.FromDate=moment().format('YYYY-MM-DD');   
        this.phrmReports.ToDate=moment().format('YYYY-MM-DD');
    };
       
 //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyUserwiseCollectionReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMUserwiseCollectionReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {                    
                    this.PHRMUserReportData = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });

    }



}