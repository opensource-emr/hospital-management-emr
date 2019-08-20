import { Component } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
  templateUrl: "./deptwise-appointment-report.html"
})

export class RPT_APPT_DeptWiseAppointmentReportComponent {
    public fromDate: Date = null;
    public toDate: Date = null;
    public departmentName: string = null;
    //public doctorList: any;
    DepartmentWiseAppointmentReportColumns: Array<any> = null;
    DepartmentWiseAppointmentReportData: Array<any> = new Array<DynamicReport>();
    dynamicColumns: Array<string> = new Array<string>();
    public currentdepartmentappointment: DynamicReport = new DynamicReport();
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
        this.dlService.Read("/Reporting/DepartmentWiseAppointmentReport?FromDate="
            + this.currentdepartmentappointment.fromDate + "&ToDate=" + this.currentdepartmentappointment.toDate + "&DepartmentName=" + this.currentdepartmentappointment.departmentName)
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
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
            this.DepartmentWiseAppointmentReportData = JSON.parse(res.Results.JsonData);
        }
        else if (res.Status == "OK" && res.Results.JsonData == null) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}









