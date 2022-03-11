import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { RPT_BIL_DialysisReportsModel } from './dialysis-patient.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./dialysis-patient-details.html"
})
export class RPT_BIL_DialysisPatientDetailsComponent {

  public FromDate: string = null;
  public ToDate: string = null;
  public dateRange:string="";	

  DialysisPatientDetailsColumns: Array<any> = null;
  DialysisPatientDetailsData: Array<any> = new Array<RPT_BIL_DialysisReportsModel>();
  public current: RPT_BIL_DialysisReportsModel = new RPT_BIL_DialysisReportsModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.current.FromDate = moment().format('YYYY-MM-DD');
    this.current.ToDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
  }


  gridExportOptions = {
    fileName: 'DialysisPatientDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    if (this.current.FromDate != null && this.current.ToDate != null) {
      this.dlService.Read("/BillingReports/DialysisPatientDetail?FromDate="
        + this.current.FromDate + "&ToDate=" + this.current.ToDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }


  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);


  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DialysisPatientDetailsColumns = this.reportServ.reportGridCols.DialysisPatientDetailsReport;
      this.DialysisPatientDetailsData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different'])
      this.DialysisPatientDetailsColumns = this.reportServ.reportGridCols.DialysisPatientDetailsReport;
      this.DialysisPatientDetailsData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelPatientNeighbourhoodCardDetails?FromDate="
      + this.current.FromDate + "&ToDate=" + this.current.ToDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DialysisPatientDetails_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;

    this.current.FromDate = this.FromDate;
    this.current.ToDate = this.ToDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.FromDate+"&nbsp;<b>To</b>&nbsp;"+this.ToDate;
  }
}
