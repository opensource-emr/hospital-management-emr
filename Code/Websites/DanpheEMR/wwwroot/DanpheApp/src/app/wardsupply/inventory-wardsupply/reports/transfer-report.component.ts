import { Component, Directive, ViewChild } from '@angular/core';
import { FormControlName } from '@angular/forms';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { WardSupplyBLService } from "../../shared/wardsupply.bl.service";
import WARDGridColumns from "../../shared/ward-grid-cloumns";
import { WARDReportsModel } from '../../shared/ward-report.model';


@Component({
  selector: 'my-app',

  templateUrl: "./transfer-report.html"

})
export class TransferReportComponent {
  TransferReportColumn: Array<any> = null;
  TransferReportData: Array<any> = new Array<WARDReportsModel>();
  public wardReports: WARDReportsModel = new WARDReportsModel();

  constructor(public wardBLService: WardSupplyBLService, public msgBoxServ: MessageboxService) {
    this.TransferReportColumn = WARDGridColumns.TransferReport;
    this.wardReports.FromDate = moment().format('YYYY-MM-DD');
    this.wardReports.ToDate = moment().format('YYYY-MM-DD');
    this.Load();
  };

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'TransferReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.wardBLService.GetTransferReport(this.wardReports)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.TransferReportData = res.Results;
        }
        else {

          this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
        }
      });

  }
}
