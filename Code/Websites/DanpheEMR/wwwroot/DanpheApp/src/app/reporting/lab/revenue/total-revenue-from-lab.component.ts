import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_LAB_TotalRevenueFromLabModel } from "./total-revenue-from-lab.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';

@Component({
  templateUrl: "./total-revenue-from-lab.html"
})
export class RPT_LAB_TotalRevenueFromLabComponent {
    TotalRevenueFromLabColumns: Array<any> = null;
  TotalRevenueFromLabData: Array<any> = new Array<RPT_LAB_TotalRevenueFromLabModel>();
  public currenttotalrevenue: RPT_LAB_TotalRevenueFromLabModel = new RPT_LAB_TotalRevenueFromLabModel();
    dlService: DLService = null;
    http: HttpClient = null;

    constructor(
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public npCalendarService: NepaliCalendarService,
        public reportServ: ReportingService) {
        //this.TotalRevenueFromLabColumns = ReportGridColumnSettings.TotalRevenueFromLab;
        this.dlService = _dlService;
        this.currenttotalrevenue.fromDate = moment().format('YYYY-MM-DD');
        this.currenttotalrevenue.toDate = moment().format('YYYY-MM-DD');
    }
    gridExportOptions = {
        fileName: 'RevenueFromLabList_' + moment().format('YYYY-MM-DD') + '.xls',
        //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
    };

    Load() {
        this.dlService.Read("/Reporting/TotalRevenueFromLab?FromDate="
            + this.currenttotalrevenue.fromDate + "&ToDate=" + this.currenttotalrevenue.toDate)
            .map(res => res)
            .subscribe(res => this.Success(res),
            err => this.Error(err));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.TotalRevenueFromLabColumns = this.reportServ.reportGridCols.TotalRevenueFromLab;
            this.TotalRevenueFromLabData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}
