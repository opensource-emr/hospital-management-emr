import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Department } from '../../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { CommonFunctions } from '../../../shared/common.functions';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DynamicReport } from '../../shared/dynamic-report.model';
import { ReportingService } from '../../shared/reporting-service';

@Component({
  selector: 'app-daily-visit-report',
  templateUrl: './day-and-monthwise-visit-report.component.html',

})
export class RPT_ADT_DayAndMonthWiseVisitReportComponent implements OnInit {
  public fromDate: string = null;
  public toDate: string = null;
  public currentdepartmentappointment: DynamicReport = new DynamicReport();
  public departmentList: Array<Department>;
  public ReportType: string = "Day";
  DailyVisitReportColumns: Array<any> = null;
  MonthVisitReportColumn: Array<any> = null;
  DailyVisitReportData: Array<any> = new Array<DynamicReport>();
  MonthVisitReportData: Array<any> = new Array<DynamicReport>();
  public summary = { tot_new: 0, tot_followup: 0, tot_all: 0 };
  public dataLoaded: boolean = false;

  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService

  ) {
    this.currentdepartmentappointment.fromDate = moment().format('YYYY-MM-DD');
    this.currentdepartmentappointment.toDate = moment().format('YYYY-MM-DD');
    this.GetDepartments()
    this.DailyVisitReportColumns = this.reportServ.reportGridCols.RPT_ADT_DailyVisitReportColumn;
    this.MonthVisitReportColumn = this.reportServ.reportGridCols.RPT_ADT_MonthVisitReportColumn;

  }

  ngOnInit() {
  }
  Load() {
    if (this.currentdepartmentappointment.fromDate != null && this.currentdepartmentappointment.toDate != null) {
      //reset all values to zero on button click.
      this.summary.tot_all = this.summary.tot_new = this.summary.tot_followup = 0;
      this.DailyVisitReportData = [];
      this.MonthVisitReportData = [];
      let deptId = 0;
      if (this.currentdepartmentappointment && this.currentdepartmentappointment.departmentName && this.currentdepartmentappointment.departmentName.DepartmentId) {
        deptId = this.currentdepartmentappointment.departmentName.DepartmentId;
      }


      this.dlService.Read("/Reporting/DayAndMonthWiseVisitReport?FromDate="
        + this.currentdepartmentappointment.fromDate + "&ToDate=" + this.currentdepartmentappointment.toDate + "&DepartmentId=" + deptId + "&ReportType=" + this.ReportType)
        .map((res: DanpheHTTPResponse) => res)
        .subscribe((res: DanpheHTTPResponse) => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Dates Provided is not Proper']);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err]);
  }
  Success(res) {
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {

      this.DailyVisitReportData = res.Results;
      this.MonthVisitReportData = res.Results;
      this.SummaryTotal();

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
    }
  }
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentdepartmentappointment.fromDate = this.fromDate;
    this.currentdepartmentappointment.toDate = this.toDate;
  }
  myListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }
  departmentChanged() {
    this.currentdepartmentappointment.departmentName = this.currentdepartmentappointment.departmentName ? this.currentdepartmentappointment.departmentName : "";
  }
  gridExportOptions = {
    fileName: 'DailyVisitReport' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']

  };
  GetDepartments() {
    this.dlService.GetDepartment()
      .subscribe(res => {
        if (res.Status == "OK")
          this.departmentList = res.Results;
        CommonFunctions.SortArrayOfObjects(this.departmentList, "DepartmentName");
      });
  }
  SummaryTotal() {
    if (this.DailyVisitReportData && this.DailyVisitReportData.length > 0) {
      this.DailyVisitReportData.forEach(appt => {
        this.summary.tot_new += appt.NewTotal;
        this.summary.tot_followup += appt.FollowupTotal;
        this.summary.tot_all += appt.TotalVisit;
      });
      this.dataLoaded = true;
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
  }
}
