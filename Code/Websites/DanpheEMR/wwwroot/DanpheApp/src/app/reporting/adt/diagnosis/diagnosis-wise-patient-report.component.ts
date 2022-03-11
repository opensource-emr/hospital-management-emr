import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_ADT_DiagnosisWisePatientReportModel } from "./diagnosis-wise-patient-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./diagnosis-wise-patient-report.html"
})
export class RPT_ADT_DiagnosisWisePatientReportComponent {
  public dateRange : string = '';
  public fromDate: string = null;
  public toDate: string = null;
  public selDiagnosis: any = "";
  public diagnosisList: any;
  public Diagnosis: string = "";
  DiagnosisWisePatientReportColumns: Array<any> = null;
  DiagnosisWisePatientReportData: Array<RPT_ADT_DiagnosisWisePatientReportModel> = new Array<RPT_ADT_DiagnosisWisePatientReportModel>();
  public currentdiagnosiswisepatient: RPT_ADT_DiagnosisWisePatientReportModel = new RPT_ADT_DiagnosisWisePatientReportModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;

  gridExportOptions = {
    fileName: 'DiagnosisWisePatientReport' + moment().format('YYYY-MM-DD') + '.xls',
  };

  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentdiagnosiswisepatient.fromDate = moment().format('YYYY-MM-DD');
    this.currentdiagnosiswisepatient.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.loadDiagnosisList();
  }

  Load() {
    if (this.currentdiagnosiswisepatient.fromDate != null && this.currentdiagnosiswisepatient.toDate != null) {
      this.dlService.Read("/Reporting/DiagnosisWisePatientReport?FromDate="
        + this.currentdiagnosiswisepatient.fromDate + "&ToDate=" + this.currentdiagnosiswisepatient.toDate
        + "&Diagnosis=" + this.currentdiagnosiswisepatient.Diagnosis)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DiagnosisWisePatientReportColumns = this.reportServ.reportGridCols.DiagnosisWisePatientReport;
      this.DiagnosisWisePatientReportData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameter ....Try Different'])
      this.DiagnosisWisePatientReportColumns = this.reportServ.reportGridCols.DiagnosisWisePatientReport;
      this.DiagnosisWisePatientReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelDiagnosisWisePatientReport?FromDate="
      + this.currentdiagnosiswisepatient.fromDate + "&ToDate=" + this.currentdiagnosiswisepatient.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "DiagnosisWisePatientReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  loadDiagnosisList() {
    this.dlService.Read("/Reporting/GetDiagnosisList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.diagnosisList = res.Results;
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["Diagnosis"];
    return html;
  }

  diagnosisChanged() {
    this.currentdiagnosiswisepatient.Diagnosis = this.selDiagnosis ? this.selDiagnosis.Diagnosis : "";
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdiagnosiswisepatient.fromDate = this.fromDate;
    this.currentdiagnosiswisepatient.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }

}
