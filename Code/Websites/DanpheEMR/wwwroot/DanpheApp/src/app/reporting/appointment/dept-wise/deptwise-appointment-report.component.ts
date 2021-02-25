import { Component } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./deptwise-appointment-report.html"
})

export class RPT_APPT_DeptWiseAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public departmentName: string = null;
  //public doctorList: any;
  DepartmentWiseAppointmentReportColumns: Array<any> = null;
  DepartmentWiseAppointmentReportData: Array<any> = new Array<DynamicReport>();
  dynamicColumns: Array<string> = new Array<string>();
  public currentdepartmentappointment: DynamicReport = new DynamicReport();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;

  gridExportOptions = {
    fileName: 'DepartmentwiseAppointmentList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']

  };
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.http = _http;
    this.dlService = _dlService;
    this.currentdepartmentappointment.fromDate = moment().format('YYYY-MM-DD');
    this.currentdepartmentappointment.toDate = moment().format('YYYY-MM-DD');
   
  }

  Load() {
    if (this.currentdepartmentappointment.fromDate != null && this.currentdepartmentappointment.toDate != null) {

      this.NepaliDateInGridSettings = new NepaliDateInGridParams();

      this.dlService.Read("/Reporting/DepartmentWiseAppointmentReport?FromDate="
        + this.currentdepartmentappointment.fromDate + "&ToDate=" + this.currentdepartmentappointment.toDate + "&DepartmentName=" + this.currentdepartmentappointment.departmentName)
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
    if (res.Status == "OK" && res.Results.JsonData) {
      //res.Results.Schema is  the array of JSON data object
      //after parsing we can get the collection of object data with commas separated data and [0] is the bydefault object 
      // after that we can split the collection object data
      this.dynamicColumns = JSON.parse(res.Results.Schema)[0].ColumnName.split(',');
      this.DepartmentWiseAppointmentReportColumns = this.reportServ.reportGridCols.GetColumnSettings(this.dynamicColumns);
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Appointment Date", false));
      this.DepartmentWiseAppointmentReportData = JSON.parse(res.Results.JsonData);
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

    this.currentdepartmentappointment.fromDate = this.fromDate;
    this.currentdepartmentappointment.toDate = this.toDate;
  }
}









