import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_APPT_DistrictWiseAppointmentReportModel } from "./districtwise-appointment-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  templateUrl: "./districtwise-appointment-report.html"
})
export class RPT_APPT_DistrictWiseAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public distProvider: string = "";
  public doctorList: any;
  public dateRange : string = "";
  public footer='';
  DistrictWiseAppointmentReportColumns: Array<any> = null;
  DistrictWiseAppointmentReportData: Array<any> = new Array<RPT_APPT_DistrictWiseAppointmentReportModel>();
  dynamicColumns: Array<string> = new Array<string>();
  public districtwiseappointment: RPT_APPT_DistrictWiseAppointmentReportModel = new RPT_APPT_DistrictWiseAppointmentReportModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public summary = { tot_new: 0, tot_followup: 0, tot_referral: 0, tot_all: 0 };
  public selGenderName: string = "all";


  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    // this.DistrictWiseAppointmentReportColumns = ReportGridColumnSettings.DistrictWiseAppointmentReport;
    this.http = _http;
    this.dlService = _dlService;
    this.districtwiseappointment.fromDate = moment().format('YYYY-MM-DD');
    this.districtwiseappointment.toDate = moment().format('YYYY-MM-DD');
    this.DistrictWiseAppointmentReportColumns = this.reportServ.reportGridCols.RPT_APPT_DistrictWiseAppointmentCounts;

  }
  gridExportOptions = {
    fileName: 'DistrictwiseAppointmentList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };

  ngAfterViewChecked() {
    if (document.getElementById("dvDistApptSummary") != null)
      this.footer = document.getElementById("dvDistApptSummary").innerHTML;
  }

  Load() {
    if (this.districtwiseappointment.fromDate != null && this.districtwiseappointment.toDate != null) {

      this.summary.tot_all = this.summary.tot_new = this.summary.tot_followup = this.summary.tot_referral = 0;
      this.DistrictWiseAppointmentReportData = [];


      this.dlService.Read("/Reporting/DistrictwiseAppointmentReport?FromDate="
        + this.districtwiseappointment.fromDate + "&ToDate=" + this.districtwiseappointment.toDate + "&CountrySubDivisionName=" + this.districtwiseappointment.distProvider
        + "&gender=" + this.selGenderName)
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
    if (res.Status == "OK" && res.Results && res.Results.length > 0) {
     
      this.DistrictWiseAppointmentReportData = res.Results;

      if (this.DistrictWiseAppointmentReportData && this.DistrictWiseAppointmentReportData.length > 0) {
        this.DistrictWiseAppointmentReportData.forEach(appt => {
          this.summary.tot_new += appt.NewAppointment;
          this.summary.tot_followup += appt.Followup;
          this.summary.tot_referral += appt.Referral;
          this.summary.tot_all += appt.TotalAppointments;
        });
      }
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }

  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.districtwiseappointment.fromDate = this.fromDate;
    this.districtwiseappointment.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
