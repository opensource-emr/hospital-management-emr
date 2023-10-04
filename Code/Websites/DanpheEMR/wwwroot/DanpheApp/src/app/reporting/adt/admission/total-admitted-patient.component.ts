import { Component, Directive, ViewChild } from "@angular/core";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { RPT_ADT_TotalAdmittedPatientModel } from "../../shared/total-admitted-patient.model";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment/moment";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./total-admitted-patient.html",
})
export class RPT_ADT_TotalAdmittedPatientComponent {
  public dateRange : string = '';
  public fromDate: string = null;
  public toDate: string = null;
  TotalAdmittedPatientColumns: Array<any> = null;
  TotalAdmittedPatientData: Array<any> = new Array<
    RPT_ADT_TotalAdmittedPatientModel
  >();
  public currenttotalAdmittedPatient: RPT_ADT_TotalAdmittedPatientModel = new RPT_ADT_TotalAdmittedPatientModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService
  ) {
    this.http = _http;
    this.dlService = _dlService;
    this.currenttotalAdmittedPatient.fromDate = moment().format("YYYY-MM-DD");
    this.currenttotalAdmittedPatient.toDate = moment().format("YYYY-MM-DD");
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("AdmissionDate", true));
  }

  gridExportOptions = {
    fileName:
      "TotalAdmittedpatientList_" + moment().format("YYYY-MM-DD") + ".xls",
  };

  Load() {
    if (this.currenttotalAdmittedPatient.fromDate != null && this.currenttotalAdmittedPatient.toDate != null) {
      this.dlService
        .Read(
          "/Reporting/TotalAdmittedPatient?FromDate=" +
          this.currenttotalAdmittedPatient.fromDate +
          "&ToDate=" +
          this.currenttotalAdmittedPatient.toDate
        )
        .map((res) => res)
        .subscribe(
          (res) => this.Success(res),
          (res) => this.Error(res)
        );
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.TotalAdmittedPatient;
      this.TotalAdmittedPatientData = res.Results;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
      this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.TotalAdmittedPatient;
      this.TotalAdmittedPatientData = res.Results;
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currenttotalAdmittedPatient.fromDate = this.fromDate;
    this.currenttotalAdmittedPatient.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
