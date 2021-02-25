import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../reporting/shared/reporting-service";
import { DynamicReport } from "../shared/dynamic-report.model"
import { DLService } from "../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { RPT_BIL_DoctorReport } from '../billing/doc-report/doctor-report.model';
import { CommonFunctions } from '../../shared/common.functions';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./docwise-encounter-patient-report.html"
})

export class RPT_DOC_DoctorWiseEncounterPatientReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public providerName: string = null;
  public selProvider: any = "";
  public doctorList: any;
  DoctorWisePatientReportColumns: Array<any> = null;
  DoctorWisePatientReportData: Array<any> = new Array<DynamicReport>();
  dynamicColumns: Array<string> = new Array<string>();
  public CurrentDoctorEncounterPatient: DynamicReport = new DynamicReport();
  public currentdoctorreport: RPT_BIL_DoctorReport = new RPT_BIL_DoctorReport();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    // this.DoctorWisePatientReportColumns = ReportGridColumnSettings.DoctorWisePatientReport;
    this.http = _http;
    this.dlService = _dlService;
    this.loadDoctorsList();
    this.CurrentDoctorEncounterPatient.fromDate = moment().format('YYYY-MM-DD');
    this.CurrentDoctorEncounterPatient.toDate = moment().format('YYYY-MM-DD');
  }

  gridExportOptions = {
    fileName: 'DoctorwisePatientAppointmentList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['EMPI', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };
  loadDoctorsList() {
    this.dlService.Read("/BillingReports/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;

        }
      });
  }
  Load() {
    if (this.CurrentDoctorEncounterPatient.fromDate != null && this.CurrentDoctorEncounterPatient.toDate != null) {

      this.NepaliDateInGridSettings = new NepaliDateInGridParams();

      this.dlService.Read("/Reporting/DoctorWisePatientReport?FromDate="
        + this.CurrentDoctorEncounterPatient.fromDate + "&ToDate=" + this.CurrentDoctorEncounterPatient.toDate + "&ProviderName=" + this.CurrentDoctorEncounterPatient.providerName)
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

  providerChanged() {
    //this.CurrentDoctorEncounterPatient.providerName = this.selProvider ? this.selProvider.FirstName + ' ' + this.selProvider.LastName : "";
    this.CurrentDoctorEncounterPatient.providerName = this.selProvider ? this.selProvider.FullName : "";

  }
  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.JsonData) {
      //res.Results.Schema is  the array of JSON data object
      //after parsing we can get the collection of object data with commas separated data and [0] is the bydefault object 
      // after that we can split the collection object data
      this.dynamicColumns = JSON.parse(res.Results.Schema)[0].ColumnName.split(',');
      this.DoctorWisePatientReportColumns = this.reportServ.reportGridCols.GetColumnSettings(this.dynamicColumns);
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Appointment Date", false));
      this.DoctorWisePatientReportData = JSON.parse(res.Results.JsonData);
    }
    else if (res.Status == "OK" && res.Results.JsonData == null) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.CurrentDoctorEncounterPatient.fromDate = this.fromDate;
    this.CurrentDoctorEncounterPatient.toDate = this.toDate;
  }
}
