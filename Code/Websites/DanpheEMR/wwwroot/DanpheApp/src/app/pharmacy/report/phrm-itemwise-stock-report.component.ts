import { Component, Directive, ViewChild } from '@angular/core';


import { PHRMReportsModel } from "../shared/phrm-reports-model"

import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";

@Component({
    selector: 'my-app',    
    templateUrl: "../../view/pharmacy-view/Report/PHRMItemWiseStock.html" // "/PharmacyReport/PHRMItemWiseStock"
})
export class PHRMItemWiseStockReportComponent 
{
    PHRMItemWiseStockReportColumns: Array<any> = null;
    PHRMItemWiseStockReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) 
    {
        this.PHRMItemWiseStockReportColumns = PHRMReportsGridColumns.PHRMItemWiseStockReport;
        this.Load();
    }

 //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyItemWiseStockReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    Load() {
         this.pharmacyBLService.GetPHRMDispensaryStoreReport(this.phrmReports)
                .subscribe(res => {
                    if (res.Status == 'OK') {

                        this.PHRMItemWiseStockReportColumns = PHRMReportsGridColumns.PHRMItemWiseStockReport;
                        this.PHRMItemWiseStockReportData = res.Results;

                    }
                    else {

                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                });

    }
    

   
    


}






