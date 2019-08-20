import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { DailyItemDispatchReport } from '../shared/daily-item-dispatch-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
@Component({
    //selector: 'my-app',
    templateUrl: "../../../view/inventory-view/Reports/DailyItemDispatch.html" // "/InventoryReports/DailyItemDispatch"

})
export class DailyItemDispatchComponent {
    public FromDate: Date = null;
    public ToDate: Date = null;
    public DepartmentName: string = null;

    public CurrentItemDispatch: DailyItemDispatchReport = new DailyItemDispatchReport();

    DailyItemDispatchReportColumns: Array<any> = null;
    DailyItemDispatchReportData: Array<DailyItemDispatchReport> = new Array<DailyItemDispatchReport>();
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService
    ) {
        this.CurrentItemDispatch.FromDate = moment().format('YYYY-MM-DD');
        this.CurrentItemDispatch.ToDate = moment().format('YYYY-MM-DD');
       }
    gridExportOptions = {
        fileName: 'ItemDispatchList' + moment().format('YYYY-MM-DD') + '.xls',
       // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
    };

    ShowDailyItemDispatch() {

        this.inventoryBLService.ShowDailyItemDispatch(this.CurrentItemDispatch)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("Error", [err]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {

            this.DailyItemDispatchReportColumns = this.reportServ.reportGridCols.DailyItemDispatchReport;
            this.DailyItemDispatchReportData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0){
          this.msgBoxServ.showMessage("Error", ["There is no data available."]);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

    }

}
