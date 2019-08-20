import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../shared/wardsupply.bl.service";
import WARDGridColumns from "../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../shared/ward-report.model';


@Component({
  selector: 'my-app',

  templateUrl: "./consumption-report.html" 

})
export class WardConsumptionReportComponent {
  WardConsumptionColumn: Array<any> = null;
  WardConsumptionData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();

    constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService) {
      this.WardConsumptionColumn = WARDGridColumns.WardConsumptionReport;
        this.wardReports.FromDate=moment().format('YYYY-MM-DD');   
        this.wardReports.ToDate=moment().format('YYYY-MM-DD');
    };

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'WardConsumptionReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

Load() {
  this.wardBLService.GetWardConsumptionReport(this.wardReports)
      .subscribe(res => {
          if (res.Status == 'OK') {                    
              this.WardConsumptionData = res.Results;
          }
          else {

              this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
          }
      });

  }

}
