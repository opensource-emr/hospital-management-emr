import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import * as moment from 'moment';
import { Department } from '../../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DepartmentwiseStatReport_DTO } from '../../shared/depertment-wise-stat-report.dto';
import { DynamicReport } from '../../shared/dynamic-report.model';
import { ReportingService } from '../../shared/reporting-service';

@Component({
    templateUrl: "./departmentwise-stat-report.component.html"
})
export class RPT_APPT_DepartmentwiseStatReportComponent {

    public selGenderName: string = 'All';
    public fromDate: string = null;
    public toDate: string = null;
    public selectedDepartmentwiseStatParameter: DynamicReport = new DynamicReport();
    public departmentList: Array<Department>;
    public http: HttpClient = null;
    public DepartmentWiseStatReportColumns: Array<any> = null;
    public DepartmentWiseStatReportData: Array<DepartmentwiseStatReport_DTO> = new Array<DepartmentwiseStatReport_DTO>();
    public summary = {
        tot_AdultNew: 0, tot_ChildNew: 0, tot_NewVisitPatients: 0, tot_AdultFollowup: 0, tot_ChildFollowup: 0,
        tot_FollowupPatients: 0, tot_RegisteredVisitPatients: 0
    };
    public department: Department = new Department();
    ;
    public deptId: number = null;
    constructor(
        public dlService: DLService,
        public reportServ: ReportingService,
        public msgBoxServ: MessageboxService,
    ) {
        this.selectedDepartmentwiseStatParameter.fromDate = moment().format('YYYY-MM-DD');
        this.selectedDepartmentwiseStatParameter.toDate = moment().format('YYYY-MM-DD');
        this.GetDepartments();
        this.DepartmentWiseStatReportColumns = this.reportServ.reportGridCols.RPT_APPT_DepartmentWiseStatCounts;

    }

    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.selectedDepartmentwiseStatParameter.fromDate = this.fromDate;
        this.selectedDepartmentwiseStatParameter.toDate = this.toDate;
    }
    GetDepartments() {
        this.dlService.GetDepartment()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK)
                    this.departmentList = res.Results;
            });
    }
    DepartmentListFormatter(data: any): string {
        let html = data["DepartmentName"];
        return html;
    }

    AssignSelectedDepartment(event) {
        this.department = event;
        this.deptId = event.DepartmentId;
    }
    gridExportOptions = {
        fileName: 'DepartmentwiseStatReport_' + moment().format('YYYY-MM-DD') + '.xls',
    }
    Load() {
        if (this.selectedDepartmentwiseStatParameter.fromDate != null && this.selectedDepartmentwiseStatParameter.toDate != null) {
            this.summary.tot_AdultNew = this.summary.tot_ChildNew = this.summary.tot_NewVisitPatients = this.summary.tot_AdultFollowup = this.summary.tot_ChildFollowup
                = this.summary.tot_FollowupPatients = this.summary.tot_RegisteredVisitPatients = 0;
            this.DepartmentWiseStatReportData = [];

            this.dlService.Read("/Reporting/DepartmentWiseStatReport?FromDate="
                + this.selectedDepartmentwiseStatParameter.fromDate + "&ToDate=" + this.selectedDepartmentwiseStatParameter.toDate + "&DepartmentId=" + this.deptId + "&gender=" + this.selGenderName)
                .map((res: DanpheHTTPResponse) => res)
                .subscribe(res => this.Success(res),
                    res => this.Error(res));
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Dates Provided is not Proper']);
        }

    }
    Error(err) {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [err]);
    }

    Success(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.DepartmentWiseStatReportData = null;
            this.DepartmentWiseStatReportData = res.Results;
            this.SummaryCalculation();
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
        }
    }
    SummaryCalculation() {
        if (this.DepartmentWiseStatReportData != null) {
            this.DepartmentWiseStatReportData.forEach(appt => {
                this.summary.tot_AdultNew += appt.NewMaleAdult + appt.NewFemaleAdult;
                this.summary.tot_ChildNew += appt.NewFemaleChild + appt.NewMaleChild;
                this.summary.tot_NewVisitPatients += appt.NewMaleAdult + appt.NewFemaleAdult + appt.NewFemaleChild + appt.NewMaleChild;
                this.summary.tot_AdultFollowup += appt.FollowupFemaleAdult + appt.FollowupMaleAdult;
                this.summary.tot_ChildFollowup += appt.FollowupFemaleChild + appt.FollowupMaleAdult;
                this.summary.tot_FollowupPatients += appt.FollowupFemaleAdult + appt.FollowupMaleAdult + appt.FollowupFemaleChild + appt.FollowupMaleAdult;
                this.summary.tot_RegisteredVisitPatients += appt.Total;
            });
        }
    }
}