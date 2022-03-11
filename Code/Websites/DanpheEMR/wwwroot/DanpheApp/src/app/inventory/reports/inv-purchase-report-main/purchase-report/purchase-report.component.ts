import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../../shared/inventory-reports.dl.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "./PurchaseReport.html"
})

export class PurchaseReport {
    PurRepColumns: Array<any> = null;
    PurRepData: Array<any> = [];

    constructor(
        public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService) {
        this.ShowValuation();
    }

    gridExportOptions = {
        fileName: 'PurchaseReport' + moment().format('YYYY-MM-DD') + '.xls',
    };

    ShowValuation() {
        this.inventoryBLService.ShowPurchaseReports()
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
        if (res.Status == "OK") {
            this.PurRepColumns = this.reportServ.reportGridCols.PurchaseReport;
            this.PurRepData = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}