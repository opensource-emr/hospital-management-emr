import { Component } from '@angular/core';
import * as moment from 'moment';
import { DynamicReportComponent } from '../../../dynamic-report/dynamic-report.component';
import { Department } from '../../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DynamicReport } from '../../shared/dynamic-report.model';

@Component({
    templateUrl: "./age-classified-op-stats-report.component.html"
})
export class RPT_APPT_AgeClassifiedOPStatsReportComponent {


    public selectedAgeClassifiedOPStatsParameter: DynamicReport = new DynamicReport();
    public fromDate: string = null;
    public toDate: string = null;
    public department: Department = new Department();
    public departmentList: Array<Department>;
    public deptId: number = 0;
    public AgeClassifiedOPStatsReportData: Array<any> = new Array<any>();
    public ReportColumns: Array<any> = new Array<any>();
    constructor(
        public dlService: DLService,
        public msgBoxServ: MessageboxService,
    ) {
        this.selectedAgeClassifiedOPStatsParameter.fromDate = moment().format('YYYY-MM-DD');
        this.selectedAgeClassifiedOPStatsParameter.toDate = moment().format('YYYY-MM-DD');
        this.GetDepartments();
    }
    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.selectedAgeClassifiedOPStatsParameter.fromDate = this.fromDate;
        this.selectedAgeClassifiedOPStatsParameter.toDate = this.toDate;
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
        this.deptId = this.department.DepartmentId;
    }
    gridExportOptions = {
        fileName: 'AgeClassifiedOPStatsReport' + moment().format('YYYY-MM-DD') + '.xls',
    }

    Load() {
        if (this.selectedAgeClassifiedOPStatsParameter.fromDate != null && this.selectedAgeClassifiedOPStatsParameter.toDate != null) {


            this.dlService.Read("/Reporting/AgeClassifiedOPStatsReport?FromDate="
                + this.selectedAgeClassifiedOPStatsParameter.fromDate +
                "&ToDate=" + this.selectedAgeClassifiedOPStatsParameter.toDate +
                "&DepartmentId=" + this.deptId)
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

    public dynamicHeaders = [];
    Success(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            if (Array.isArray(res.Results)) {
                this.AgeClassifiedOPStatsReportData = res.Results;
            } else {
                this.AgeClassifiedOPStatsReportData = [res.Results || {}];
            }

            this.DynamicHeadersForGrid(res);
            this.dynamicHeaders = Object.keys(this.AgeClassifiedOPStatsReportData[0] || {}).slice(1);

            for (let i = 0; i < this.AgeClassifiedOPStatsReportData.length; i++) {
                const rowData = this.AgeClassifiedOPStatsReportData[i];
                for (const key in rowData) {
                    if (rowData[key] === null) {
                        rowData[key] = 0;
                    }
                }
            }
        } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
        }
    }



    calculateColumnSum(header) {
        return this.AgeClassifiedOPStatsReportData.reduce((sum, row) => sum + row[header], 0);
    }

    DynamicHeadersForGrid(res) {
        this.AgeClassifiedOPStatsReportData = null;
        this.AgeClassifiedOPStatsReportData = res.Results;
        let Columns = [];
        let ReportColumns = [];
        for (let key in this.AgeClassifiedOPStatsReportData[0]) {
            Columns.push(key);
        }
        for (let column of Columns) {
            let obj = null;
            if (column.toLowerCase().includes('date')) {
                obj = { headerName: column, field: column, width: 150, cellRenderer: DynamicReportComponent.DateFormatter }
            }
            else {
                obj = { headerName: column, field: column, width: 150 }
            }
            ReportColumns.push(obj);
        }
        this.ReportColumns = ReportColumns;
        this.AgeClassifiedOPStatsReportData = res.Results;
    }

}

