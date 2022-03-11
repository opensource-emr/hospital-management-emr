import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_LAB_ItemWiseFromLabModel } from "./item-wise-lab-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';

@Component({
  templateUrl: "./item-wise-lab-report.html"
})
export class RPT_LAB_ItemWiseLabReportComponent {
    ItemWiseFromLabColumns: Array<any> = null;
  ItemWiseFromLabData: Array<any> = new Array<RPT_LAB_ItemWiseFromLabModel>();
  public currentitemwise: RPT_LAB_ItemWiseFromLabModel = new RPT_LAB_ItemWiseFromLabModel();
    dlService: DLService = null;
    http: HttpClient = null;
    public dateRange:string="";	

    constructor(
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public npCalendarService: NepaliCalendarService,
        public reportServ: ReportingService) {
        this.dlService = _dlService;
        this.currentitemwise.fromDate = moment().format('YYYY-MM-DD');
        this.currentitemwise.toDate = moment().format('YYYY-MM-DD');
    }
    gridExportOptions = {
        fileName: 'ItemWiseFromLabList_' + moment().format('YYYY-MM-DD') + '.xls',
    };

  Load() {
    if (this.currentitemwise.fromDate != null && this.currentitemwise.toDate != null) {
      this.dlService.Read("/Reporting/ItemWiseFromLab?FromDate="
        + this.currentitemwise.fromDate + "&ToDate=" + this.currentitemwise.toDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          err => this.Error(err));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
        
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.ItemWiseFromLabColumns = this.reportServ.reportGridCols.ItemWiseFromLab;
            this.ItemWiseFromLabData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
            
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentitemwise.fromDate = $event.fromDate;
    this.currentitemwise.toDate = $event.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.currentitemwise.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.currentitemwise.toDate;
  }
}
