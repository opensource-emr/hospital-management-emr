import { Component } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { CommonFunctions } from '../../../shared/common.functions';
import { Department } from '../../../settings-new/shared/department.model';

@Component({
  templateUrl: "./deptwise-appointment-report.html"
})

export class RPT_APPT_DeptWiseAppointmentReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public departmentName: any;
  //public doctorList: any;
  DepartmentWiseAppointmentReportColumns: Array<any> = null;
  DepartmentWiseAppointmentReportData: Array<any> = new Array<DynamicReport>();
  dynamicColumns: Array<string> = new Array<string>();
  public currentdepartmentappointment: DynamicReport = new DynamicReport();
  dlService: DLService = null;
  http: HttpClient = null;
  public departmentList: Array<Department>;
  public summary = { tot_new: 0, tot_followup: 0, tot_referral: 0, tot_all: 0 };
  public selGenderName: string = "all";
  // public summaryHtml: string = null;

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
    this.GetDepartments();
    this.DepartmentWiseAppointmentReportColumns = this.reportServ.reportGridCols.RPT_APPT_DepartmentWiseAppointmentCounts;
  }


  Load() {
    if (this.currentdepartmentappointment.fromDate != null && this.currentdepartmentappointment.toDate != null) {
      //reset all values to zero on button click.
      this.summary.tot_all = this.summary.tot_new = this.summary.tot_followup = this.summary.tot_referral = 0;
      this.DepartmentWiseAppointmentReportData = [];
      let deptId = 0;
      if (this.currentdepartmentappointment && this.currentdepartmentappointment.departmentName && this.currentdepartmentappointment.departmentName.DepartmentId) {
        deptId = this.currentdepartmentappointment.departmentName.DepartmentId;
      }


      this.dlService.Read("/Reporting/DepartmentWiseAppointmentReport?FromDate="
        + this.currentdepartmentappointment.fromDate + "&ToDate=" + this.currentdepartmentappointment.toDate + "&DepartmentId=" + deptId + "&gender=" + this.selGenderName)
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
    if (res.Status == "OK") {
    
      this.DepartmentWiseAppointmentReportData = res.Results;
      if (this.DepartmentWiseAppointmentReportData && this.DepartmentWiseAppointmentReportData.length > 0) {
        this.DepartmentWiseAppointmentReportData.forEach(appt => {
          this.summary.tot_new += appt.NewAppointment;
          this.summary.tot_followup += appt.Followup;
          this.summary.tot_referral += appt.Referral;
          this.summary.tot_all += appt.TotalAppointments;
        });
      }
      else {
        this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
      }
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

  public LoadDeptList() {
    // this.dlService.Read("/BillingReports/LoadDeptListFromFN")
    //     .map(res => res)
    //     .subscribe(res => {
    //         if (res.Status == "OK") {
    //           this.servDeptsList = res.Results;
    //           CommonFunctions.SortArrayOfObjects(this.servDeptsList, "ServiceDepartmentName");//this sorts the servDeptsList by ServiceDepartmentName.
    //         }
    //         else
    //             this.msgBoxServ.showMessage('notice-message', ["Failed to load Service departments"]);
    //     });
  }

  myListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  departmentChanged() {
    this.currentdepartmentappointment.departmentName = this.currentdepartmentappointment.departmentName ? this.currentdepartmentappointment.departmentName : "";
  }

  GetDepartments() {
    this.dlService.GetDepartment()
      .subscribe(res => {
        if (res.Status == "OK")
          this.departmentList = res.Results;
        CommonFunctions.SortArrayOfObjects(this.departmentList, "DepartmentName");
      });
  }

}









