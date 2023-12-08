import { Component } from '@angular/core';
import * as moment from 'moment';
import { VisitBLService } from '../../../appointments/shared/visit.bl.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { IGridFilterParameter } from '../../../shared/danphe-grid/grid-filter-parameter.interface';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DoctorsList_DTO } from '../../shared/doctor-list.dto';
import { DoctorwiseStatisticsReport_DTO } from '../../shared/doctor-wise-statistics-report.dto';
import { DynamicReport } from '../../shared/dynamic-report.model';
import { ReportingService } from '../../shared/reporting-service';

@Component({
    templateUrl: "./doctorwise-stat-report.component.html"
})
export class RPT_APPT_DoctortwiseStatisticsReportComponent {

    public selGenderName: string = 'All';
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "";

    public doctors: DoctorsList_DTO = new DoctorsList_DTO();
    public doctorList: DoctorsList_DTO[] = [];
    public selectedDepartmentwiseStatParameter: DynamicReport = new DynamicReport();
    public DoctorWiseStatisticsReportColumns: Array<any> = null;
    public FilterParameters: IGridFilterParameter[] = [];
    public DoctorName: string = '';
    public Gender: string = '';
    public footer: string = "";

    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public DoctorWiseStatisticsReportData: DoctorwiseStatisticsReport_DTO[] = [];
    public summary = {
        tot_AdultNew: 0, tot_ChildNew: 0, tot_NewVisitPatients: 0, tot_Old_Adult: 0, tot_Old_Child: 0,
        tot_Old_Patients: 0, tot_RegisteredVisitPatients: 0
    };
    ;
    constructor(
        public dlService: DLService,
        public reportServ: ReportingService,
        public visitBLService: VisitBLService,
        public visitService: VisitService,
        public msgBoxServ: MessageboxService,
    ) {
        this.selectedDepartmentwiseStatParameter.fromDate = moment().format('YYYY-MM-DD');
        this.selectedDepartmentwiseStatParameter.toDate = moment().format('YYYY-MM-DD');
        this.DoctorWiseStatisticsReportColumns = this.reportServ.reportGridCols.RPT_APPT_DoctorWiseStatisticsCounts;
        this.doctorList = new Array<DoctorsList_DTO>();
        this.loadDoctorsList();

    }
    ngAfterViewChecked() {
        if (document.getElementById("id-doctorwise-stat-summaryFooter") !== null)
            this.footer = document.getElementById("id-doctorwise-stat-summaryFooter").innerHTML;
    }

    OnFromToDateChange($event) {
        this.fromDate = $event ? $event.fromDate : this.fromDate;
        this.toDate = $event ? $event.toDate : this.toDate;
        this.selectedDepartmentwiseStatParameter.fromDate = this.fromDate;
        this.selectedDepartmentwiseStatParameter.toDate = this.toDate;
        this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;

    }

    loadDoctorsList() {
        this.visitBLService.GetVisitDoctors()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                    this.visitService.ApptApplicableDoctorsList = res.Results;
                    this.doctorList = this.visitService.ApptApplicableDoctorsList;
                }
            });
    }
    DoctorListFormatter(data: any): string {
        let html = data["PerformerName"];
        return html;
    }

    AssignSelectedDoctor(event) {
        if (event) {
            if (typeof event === 'object' && event !== null) {
                const performerId = Number(event.PerformerId);
                if (!isNaN(performerId)) {
                    this.doctors = event;
                    this.doctors.EmployeeId = performerId;
                } else {
                    console.error('PerformerId is not a valid number:', event.PerformerId);
                }
            }
        }
    }

    gridExportOptions = {
        fileName: 'DoctorwisewiseStatisticsReport_' + moment().format('YYYY-MM-DD') + '.xls',
    }
    Load() {
        this.FilterParameters = [
            { DisplayName: "DoctorName", Value: this.doctors.FullName !== '' ? this.doctors.FullName : 'All' },
            { DisplayName: "Gender", Value: this.Gender !== '' ? this.Gender : 'All' },
            { DisplayName: "DateRange", Value: `<b>From:</b>&nbsp;${this.fromDate}&nbsp;<b>To:</b>&nbsp;${this.toDate}` },
        ]
        if (this.selectedDepartmentwiseStatParameter.fromDate != null && this.selectedDepartmentwiseStatParameter.toDate != null) {
            this.summary.tot_AdultNew = this.summary.tot_ChildNew = this.summary.tot_NewVisitPatients = this.summary.tot_Old_Adult = this.summary.tot_Old_Child
                = this.summary.tot_Old_Patients = this.summary.tot_RegisteredVisitPatients = 0;
            this.DoctorWiseStatisticsReportData = [];

            this.dlService.Read("/Reporting/DoctorWiseStatisticReport?FromDate="
                + this.selectedDepartmentwiseStatParameter.fromDate + "&ToDate=" + this.selectedDepartmentwiseStatParameter.toDate + "&EmployeeId=" + this.doctors.EmployeeId + "&gender=" + this.selGenderName)
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
            this.DoctorWiseStatisticsReportData = null;
            this.DoctorWiseStatisticsReportData = res.Results;
            this.SummaryCalculation();
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
        }
    }
    SummaryCalculation() {
        if (this.DoctorWiseStatisticsReportData != null) {
            this.DoctorWiseStatisticsReportData.forEach(appt => {
                this.summary.tot_AdultNew += appt.NewMaleAdult + appt.NewFemaleAdult;
                this.summary.tot_ChildNew += appt.NewFemaleChild + appt.NewMaleChild;
                this.summary.tot_NewVisitPatients += appt.NewMaleAdult + appt.NewFemaleAdult + appt.NewFemaleChild + appt.NewMaleChild;
                this.summary.tot_Old_Adult += appt.OldFemaleAdult + appt.OldMaleAdult;
                this.summary.tot_Old_Child += appt.OldFemaleChild + appt.OldMaleChild;
                this.summary.tot_Old_Patients += appt.OldFemaleAdult + appt.OldMaleAdult + appt.OldFemaleChild + appt.OldMaleChild;
                this.summary.tot_RegisteredVisitPatients += appt.Total;
            });
        }
    }
}