import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import WARDGridColumns from "../../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../../shared/ward-report.model';
import { SecurityService } from '../../../security/shared/security.service';
import { Router } from '@angular/router';


@Component({
  selector: 'my-app',

  templateUrl: "./requisition-dispatch-report.html"

})
export class RequisitionDispatchReportComponent {
  public CurrentStoreId: number = 0;
  RequisitionDispatchReportColumn: Array<any> = null;
  RequisitionDispatchReportData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService, public securityService: SecurityService, public router: Router) {
    this.CheckForSubstoreActivation();
  };

  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        this.RequisitionDispatchReportColumn = WARDGridColumns.RequisitionDispatchReport;
        this.wardReports.FromDate = moment().format('YYYY-MM-DD');
        this.wardReports.ToDate = moment().format('YYYY-MM-DD');
        this.wardReports.StoreId = this.CurrentStoreId;
        this.Load();
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'RequisitionDispatchReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.wardBLService.GetRequisitionDispatchReport(this.wardReports)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.RequisitionDispatchReportData = res.Results;
        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });

  }
}
