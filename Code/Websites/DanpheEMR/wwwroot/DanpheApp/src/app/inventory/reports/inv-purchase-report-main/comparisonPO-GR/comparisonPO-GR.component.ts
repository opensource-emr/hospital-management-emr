import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../../shared/inventory-reports.dl.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "./ComparisonPOGR.html"  //"/InventoryReports/ComparisonPOGR"
})

export class ComparisonPOGR {
    PoGrComparisonsColumns: Array<any> = null;
    PoGrComparisonsData: Array<any> = [];

    constructor(
        public inventoryBLService: InventoryReportsBLService,
        public inventoryDLService: InventoryReportsDLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService) {
        this.ShowValuation();
    }

    gridExportOptions = {
        fileName: 'ComparisonReport' + moment().format('YYYY-MM-DD') + '.xls',
    };

    ShowValuation() {
        this.inventoryBLService.ShowComporisonReports()
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
            this.PoGrComparisonsColumns = this.reportServ.reportGridCols.ComparisonPoGrReport;
            this.PoGrComparisonsData = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}