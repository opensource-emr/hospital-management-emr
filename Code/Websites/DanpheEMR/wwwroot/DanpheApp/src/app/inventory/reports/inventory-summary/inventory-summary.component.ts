import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { InventorySummaryReport } from '../shared/inventory-summary-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
@Component({
    //selector: 'my-app',
    templateUrl: "../../../view/inventory-view/Reports/InventorySummary.html" // "/InventoryReports/InventorySummary"

})
export class InventorySummaryComponent {
    public FromDate: Date = null;
    public ToDate: Date = null;
    public ItemName: string = null;

    public CurrentInventorySummary: InventorySummaryReport = new InventorySummaryReport();

    InventorySummaryReportColumns: Array<any> = null;
    InventorySummaryReportData: Array<InventorySummaryReport> = new Array<InventorySummaryReport>();
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService
    ) {
        this.CurrentInventorySummary.FromDate = moment().format('YYYY-MM-DD');
        this.CurrentInventorySummary.ToDate = moment().format('YYYY-MM-DD');
       }
    gridExportOptions = {
        fileName: 'InventorySummaryList' + moment().format('YYYY-MM-DD') + '.xls',
       // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
    };

    ShowInventorySummary() {

        this.inventoryBLService.ShowInventorySummary(this.CurrentInventorySummary)
            .map(res => res)
            .subscribe(
                        res => this.Success(res),
                        res => this.Error(res)
            );
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {

            this.InventorySummaryReportColumns = this.reportServ.reportGridCols.InventorySummaryReport;
            this.InventorySummaryReportData = res.Results;
            
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
          this.msgBoxServ.showMessage("Error", ["There is no data available."]);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

    }

}
