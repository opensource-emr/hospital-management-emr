import { Component } from '@angular/core'
import { RouterOutlet, RouterModule } from '@angular/router';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { InventoryReportsBLService } from '../shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from '../shared/inventory-reports.dl.service';
import * as moment from 'moment/moment';
@Component({

  templateUrl: "../../../view/inventory-view/Reports/ItemMgmtDetail.html"  

})
export class ItemMgmtDetailComponent  {
  ItmMgmtDetailColumns: Array<any> = null;
  ItmMgmtDetailData: Array<any> = [];

  constructor(
      public inventoryBLService: InventoryReportsBLService,
      public inventoryDLService: InventoryReportsDLService,
      public msgBoxServ: MessageboxService,
      public reportServ: ReportingService) {
      this.ShowItemMgmtDetail();
  }

  gridExportOptions = {
      fileName: 'ItemMgmtReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  ShowItemMgmtDetail() {
      this.inventoryBLService. ShowItemmgmtReport()
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
          this.ItmMgmtDetailColumns = this.reportServ.reportGridCols.ItemMgmtDetailReport;
          this.ItmMgmtDetailData = res.Results;
      }
      else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      }
  }

}
