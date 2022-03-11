import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../../shared/phrm-reports-model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
    selector: "my-app",
    templateUrl: "./phrm-cashcollection-summary-report.html"

})

export class PHRMCashCollectionSummaryReportComponent
{

    PHRMUserReportColumn: Array<any> = null;
    PHRMUserReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public pharmacy:string = "pharmacy";

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
      this.PHRMUserReportColumn = PHRMReportsGridColumns.PHRMCashCollectionSummaryReport;
        this.phrmReports.FromDate=moment().format('YYYY-MM-DD');   
        this.phrmReports.ToDate=moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    };
       
 //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyCashCollectionSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMCashCollectionSummaryReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {                    
                    this.PHRMUserReportData = res.Results;
                    if (res.Status == 'OK'  &&  res.Results.length=='') 
                    {
                        this.msgBoxServ.showMessage("notice", ["no record found."]);           
                    }
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