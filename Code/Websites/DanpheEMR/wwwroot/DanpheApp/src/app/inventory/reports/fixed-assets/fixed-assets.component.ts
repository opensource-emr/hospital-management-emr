import { Component, OnInit } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import * as moment from 'moment/moment';
import { InventoryBLService } from '../../shared/inventory.bl.service';
import { FixedAssetsReportModel } from '../shared/fixed-assets-report.model';
@Component({
  //selector: 'my-app',
  templateUrl: "../../../view/inventory-view/Reports/FixedAssets.html"  //"/InventoryReports/StockLevel"

})
export class FixedAssetsComponent {
 
  public invReport: FixedAssetsReportModel = new FixedAssetsReportModel();
  FixedAssetsColumn: Array<any> = null;
  FixedAssetsData: Array<any> = new Array<FixedAssetsReportModel>();

  constructor(public inventoryBLService: InventoryReportsBLService,
    public inventoryDLService: InventoryReportsDLService,
    public inventoryService: InventoryBLService,
    public reportServ: ReportingService,
    public msgBoxServ: MessageboxService) {
    this.invReport.FromDate = moment().format('YYYY-MM-DD');
    this.invReport.ToDate = moment().format('YYYY-MM-DD');
    this.FixedAssetsColumn = this.reportServ.reportGridCols.FixedAssetsReport;  
  }

   //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'FixedAssetsList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  
  Load() {
    this.inventoryBLService.ShowFixedAssets(this.invReport)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("Error", [err]);
  }

  Success(res) {
    this.FixedAssetsData = new Array<FixedAssetsReportModel>();
    if (res.Status == "OK" && res.Results.length > 0) {
     
      this.FixedAssetsColumn = this.reportServ.reportGridCols.FixedAssetsReport;
      this.FixedAssetsData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("Error", ["There is no data available."]);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

}
