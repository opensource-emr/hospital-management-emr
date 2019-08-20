
import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { PHRMReportsModel } from "../shared/phrm-reports-model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";


@Component({
    selector: 'my-app',
    
    templateUrl: "../../view/pharmacy-view/Report/PHRMPurchaseOrder.html" //"/PharmacyReport/PHRMPurchaseOrder"

})
export class PHRMPurchaseOrderReportComponent {
    
    public calType: string = "";
    
    public Status: string = "";
    PHRMPurchaseOrderReportColumns: Array<any> = null;
    PHRMPurchaseOrderReportData: Array<any> = new Array<PHRMReportsModel>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();

    constructor(public pharmacyBLService: PharmacyBLService, public msgBoxServ: MessageboxService) {
        this.PHRMPurchaseOrderReportColumns = PHRMReportsGridColumns.PHRMPurchaseOrderReport;
        this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
        this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
    };
    
 //Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacyPurchaseOrderReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    Load() {
      this.pharmacyBLService.GetPHRMPurchaseOrderReport(this.phrmReports)
                .subscribe(res => {
                    if (res.Status == 'OK') {

                      this.PHRMPurchaseOrderReportColumns = PHRMReportsGridColumns.PHRMPurchaseOrderReport;
                      this.PHRMPurchaseOrderReportData = res.Results;

                    }
                    else {

                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                });

    }
    

   
    


}






