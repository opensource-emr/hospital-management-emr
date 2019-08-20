import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";

@Component({
  templateUrl: "./category-wise-lab-report.html"
})
export class RPT_LAB_CategoryWiseLabReportComponent {
    CategoryWiseLabReportColumns: Array<any> = null;
    CategoryWiseLabReportData: Array<any> = new Array<DynamicReport>();
    dynamicColumns: Array<string> = new Array<string>();
    SelectedImagingCategory: string = "All";
    public currentcategorywiselab: DynamicReport = new DynamicReport();

    constructor(
        public dlService: DLService,
        public msgBoxServ: MessageboxService,
        public npCalendarService: NepaliCalendarService,
        public reportServ: ReportingService) {
        this.currentcategorywiselab.fromDate = moment().format('YYYY-MM-DD');
        this.currentcategorywiselab.toDate = moment().format('YYYY-MM-DD');
    }
    
    gridExportOptions = {
        fileName: 'CategoryWiseLabReportList_' + moment().format('YYYY-MM-DD') + '.xls',
        //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
    };

    Load() {
        this.dlService.Read("/Reporting/CategoryWiseLabReport?FromDate="
            + this.currentcategorywiselab.fromDate + "&ToDate=" + this.currentcategorywiselab.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            err => this.Error(err));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res: DanpheHTTPResponse) {
        if (res.Status == "OK" && res.Results.JsonData) {
            if (res.Results) {
                this.dynamicColumns = JSON.parse(res.Results.Schema).map(a => { return a.ColumnName });
                this.CategoryWiseLabReportColumns = this.reportServ.reportGridCols.GetColumnSettings(this.dynamicColumns);
                this.CategoryWiseLabReportData = JSON.parse(res.Results.JsonData);
            }
            else {
                this.CategoryWiseLabReportData = [];
                this.msgBoxServ.showMessage("notice-message",["No data available for this range."]);
            }
        }
        else if (res.Status == "OK" && res.Results.JsonData == null) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}
