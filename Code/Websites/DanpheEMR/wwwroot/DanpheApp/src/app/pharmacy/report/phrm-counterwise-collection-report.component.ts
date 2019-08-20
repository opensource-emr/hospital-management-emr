import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../shared/phrm-reports-model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";
import { DLService } from "../../shared/dl.service"
import {ReportingService} from "./../../reporting/shared/reporting-service"
@Component({
    selector: "my-app",
    templateUrl: "../../view/pharmacy-view/Report/PHRMCounterwiseCollectionReport.html" //"/PharmacyView/CounterwiseCollectionReport"

})


export class PHRMCounterwiseCollectionReportComponent {

    PHRMCountercollectionReportColumn: Array<any> = null;
    PHRMCounterwiseReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();
    dlService: DLService = null;
   


    constructor(
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService,
        _dlService: DLService,
        
        ) {
        this.PHRMCountercollectionReportColumn = PHRMReportsGridColumns.PHRMCounterwiseCollectionReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
        this.dlService = _dlService;
       
    };

    //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyCounterwiseCollectionReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
        this.pharmacyBLService.GetPHRMCounterwiseCollectionReport(this.phrmReports)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PHRMCounterwiseReportData = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });

    }

 OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMCounterwiseCollectionReport?FromDate="
            + this.phrmReports.FromDate + "&ToDate=" + this.phrmReports.ToDate)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "PharmacyCounterCollection_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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