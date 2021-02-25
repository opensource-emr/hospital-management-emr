import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"
import { RPT_ADT_DiagnosisWisePatientReportModel } from '../../reporting/adt/diagnosis/diagnosis-wise-patient-report.model';
import { DLService } from '../../shared/dl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ReportingService } from '../../reporting/shared/reporting-service';
import * as moment from 'moment/moment';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';

@Component({
  templateUrl: "./mr-outpatient-services-report.html"
})
export class OutpatientServicesReportComponent {
  public fromDate: Date = null;
  public toDate: Date = null;
  public selDiagnosis: any = "";
  public diagnosisList: any;
  public Diagnosis: string = "";
  DiagnosisWisePatientReportColumns: Array<any> = null;
  DiagnosisWisePatientReportData: Array<RPT_ADT_DiagnosisWisePatientReportModel> = new Array<RPT_ADT_DiagnosisWisePatientReportModel>();
  public currentdiagnosiswisepatient: RPT_ADT_DiagnosisWisePatientReportModel = new RPT_ADT_DiagnosisWisePatientReportModel();
  dlService: DLService = null;

  constructor(public securityService: SecurityService, public router: Router, _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentdiagnosiswisepatient.fromDate = moment().format('YYYY-MM-DD');
    this.currentdiagnosiswisepatient.toDate = moment().format('YYYY-MM-DD');
    this.loadDiagnosisList();
  }



  gridExportOptions = {
    fileName: 'DiagnosisWisePatientReport' + moment().format('YYYY-MM-DD') + '.xls',
  };



  Load() {
    this.dlService.Read("/Reporting/DiagnosisWisePatientReport?FromDate="
      + this.currentdiagnosiswisepatient.fromDate + "&ToDate=" + this.currentdiagnosiswisepatient.toDate
      + "&Diagnosis=" + this.currentdiagnosiswisepatient.Diagnosis)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
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


  Back() {
    this.router.navigate(['Medical-records/ReportList']);
  }
}
