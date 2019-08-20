import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { PurchaseOrderSummeryReport } from '../shared/purchase-order-summery-report.model'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
@Component({
    //selector: 'my-app',
    templateUrl: "../../../view/inventory-view/Reports/PurchaseOrderSummery.html"  //"/InventoryReports/PurchaseOrderSummery"

})
export class PurchaseOrderSummeryComponent {
    public FromDate: Date = null;
    public ToDate: Date = null;
    public OrderNumber: string = null;

    public CurrentPurchaseOrder: PurchaseOrderSummeryReport = new PurchaseOrderSummeryReport();

    PurchaseOrderReportColumns: Array<any> = null;
    PurchaseOrderReportData: Array<PurchaseOrderSummeryReport> = new Array<PurchaseOrderSummeryReport>();
    constructor(public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService
    ) {
        this.CurrentPurchaseOrder.FromDate = moment().format('YYYY-MM-DD');
        this.CurrentPurchaseOrder.ToDate = moment().format('YYYY-MM-DD');
       }
    gridExportOptions = {
        fileName: 'PurchaseOrderList' + moment().format('YYYY-MM-DD') + '.xls',
       // displayColumns: ['Date', 'Patient_Name', 'AppointmentType', 'Doctor_Name', 'AppointmentStatus']
    };

    ShowPurchaseOrderSummery() {

        this.inventoryBLService.ShowPurchaseOrder(this.CurrentPurchaseOrder)
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

            this.PurchaseOrderReportColumns = this.reportServ.reportGridCols.PurchaseOrderReport;
            this.PurchaseOrderReportData = res.Results;
            
      }
      else if (res.Status == "OK" && res.Results.length == 0) {
        this.msgBoxServ.showMessage("Error", ["There is no data available."]);
      }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

    }

}
