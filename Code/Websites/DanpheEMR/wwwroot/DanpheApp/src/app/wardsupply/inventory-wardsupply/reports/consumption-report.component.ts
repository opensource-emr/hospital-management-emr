import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import WARDGridColumns from "../../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../../shared/ward-report.model';
import { SecurityService } from '../../../security/shared/security.service';
import { Router } from '@angular/router';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';


@Component({
  selector: 'my-app',

  templateUrl: "./consumption-report.html"

})
export class ConsumptionReportComponent {
  public CurrentStoreId: number = 0;
  ConsumptionReportColumn: Array<any> = null;
  ConsumptionReportData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();
  public dateRange: string = null;
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService, public securityService: SecurityService, public router: Router) {
    this.dateRange = 'last1Week';
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('Date', false));
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
        this.ConsumptionReportColumn = WARDGridColumns.ConsumptionReport;
        this.wardReports.FromDate = moment().format('YYYY-MM-DD');
        this.wardReports.ToDate = moment().format('YYYY-MM-DD');
        this.wardReports.StoreId = this.CurrentStoreId;
      }
    } catch (exception) {
      this.msgBoxServ.showMessage("Error", [exception]);
    }
  }
  onDateChange($event) {
    this.wardReports.FromDate = $event.fromDate;
    this.wardReports.ToDate = $event.toDate;
    if (this.wardReports.FromDate != null && this.wardReports.ToDate != null) {
      if (moment(this.wardReports.FromDate).isBefore(this.wardReports.ToDate) || moment(this.wardReports.FromDate).isSame(this.wardReports.ToDate)) {
        this.Load();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'ConsumptionReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.wardBLService.GetConsumptionReport(this.wardReports)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.ConsumptionReportData = res.Results;
        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });

  }
}
