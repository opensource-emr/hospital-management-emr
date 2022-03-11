import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_APPT_PhoneBookAppointmentReportModel } from "./phonebook-appointment-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./phonebook-appointment.html"
})
export class RPT_APPT_PhoneBookAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public selProvider: any = "";
  public doctorList: any;
  public AppointmentStatus: string = "";
  public Doctor_Name: string = "";
  PhoneBookAppointmentReportColumns: Array<any> = null;
  PhoneBookAppointmentReportData: Array<RPT_APPT_PhoneBookAppointmentReportModel> = new Array<RPT_APPT_PhoneBookAppointmentReportModel>();
  public currentphonebookappointment: RPT_APPT_PhoneBookAppointmentReportModel = new RPT_APPT_PhoneBookAppointmentReportModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  public dateRange:string="";	

  gridExportOptions = {
    fileName: 'PhoneBookAppointmentList' + moment().format('YYYY-MM-DD') + '.xls',
  };

  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentphonebookappointment.fromDate = moment().format('YYYY-MM-DD');
    this.currentphonebookappointment.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    this.loadDoctorsList();
  }

  Load() {
    if (this.currentphonebookappointment.fromDate != null && this.currentphonebookappointment.toDate != null) {
      this.dlService.Read("/Reporting/PhoneBookAppointmentReport?FromDate="
        + this.currentphonebookappointment.fromDate + "&ToDate=" + this.currentphonebookappointment.toDate
        + "&Doctor_Name=" + this.currentphonebookappointment.Doctor_Name + "&AppointmentStatus=" + this.currentphonebookappointment.AppointmentStatus)
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
      this.PhoneBookAppointmentReportColumns = this.reportServ.reportGridCols.PhoneBookAppointmentReport;
      this.PhoneBookAppointmentReportData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameter ....Try Different'])
      this.PhoneBookAppointmentReportColumns = this.reportServ.reportGridCols.PhoneBookAppointmentReport;
      this.PhoneBookAppointmentReportData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelPhoneBookAppointment?FromDate="
      + this.currentphonebookappointment.fromDate + "&ToDate=" + this.currentphonebookappointment.toDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "PhoneBookAppointment_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  loadDoctorsList() {
    this.dlService.Read("/Reporting/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
        }
      });
  }

  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  providerChanged() {
    this.currentphonebookappointment.Doctor_Name = this.selProvider ? this.selProvider.FullName : "";
  }


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentphonebookappointment.fromDate = this.fromDate;
    this.currentphonebookappointment.toDate = this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;

  }
}
