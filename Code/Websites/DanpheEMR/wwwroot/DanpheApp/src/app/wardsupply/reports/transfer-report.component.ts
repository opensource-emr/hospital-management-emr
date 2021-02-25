import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../shared/wardsupply.bl.service";
import WARDGridColumns from "../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../shared/ward-report.model';
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';


@Component({
  selector: 'my-app',

  templateUrl: "./transfer-report.html" 

})
export class WardTransferReportComponent {

  public calType: string = "";
  public status: string = "";
  public CurrentStoreId: number = 0;
  WardTransferReportColumn: Array<any> = null;
  WardTransferData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService,
    public router: Router, public securityService: SecurityService) {
    try {
      this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
      if (!this.CurrentStoreId) {
        this.LoadSubStoreSelectionPage();
      }
      else {
        this.WardTransferReportColumn = WARDGridColumns.WardTransferReport;
        this.wardReports.FromDate = moment().format('YYYY-MM-DD');
        this.wardReports.ToDate = moment().format('YYYY-MM-DD');
        this.wardReports.StoreId = this.CurrentStoreId;
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  };

  LoadSubStoreSelectionPage() {
    this.router.navigate(['/WardSupply/Pharmacy']);
  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'WardTransferReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

Load() {
  this.wardBLService.GetWardTransferReport(this.wardReports)
      .subscribe(res => {
          if (res.Status == 'OK') {                    
              this.WardTransferData = res.Results;
          }
          else {

              this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
          }
      });

  }

}
