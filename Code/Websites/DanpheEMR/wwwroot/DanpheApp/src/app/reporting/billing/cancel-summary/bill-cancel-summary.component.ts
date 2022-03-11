import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service"

import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CommonFunctions } from '../../../shared/common.functions';

import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./bill-cancel-summary.html"
})
export class RPT_BIL_BillCancelSummaryComponent {

  public TodayDate: string = null;

  billCancelSummaryColumns: Array<any> = null;
  billCancelSummaryData: Array<any> = new Array<any>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  dlService: DLService = null;

  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "";

  public loading: boolean = false;

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {

    this.dlService = _dlService;
    this.fromDate = this.toDate = this.TodayDate = moment().format('DD-MM-YYYY');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CreatedOn", true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("CancelledOn", true));
    //this.Load();
  }
  gridExportOptions = {
    fileName: 'BillCancelReport' + moment().format('YYYY-MM-DD') + '.xls'
  };


  Load() {
    this.dlService.Read("/BillingReports/BillCancelSummaryReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map(res => res)
      .finally(() => { this.loading = false; })
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK") {
      this.billCancelSummaryColumns = this.reportServ.reportGridCols.BillCancelSummaryColumns;
      this.billCancelSummaryData = res.Results;

    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }


  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelCancelBills?FromDate=" + this.fromDate + "&ToDate=" + this.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "CancelBillsReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;

  }

}
