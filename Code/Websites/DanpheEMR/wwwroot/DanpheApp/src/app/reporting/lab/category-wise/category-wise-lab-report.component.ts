import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
  templateUrl: "./category-wise-lab-report.html"
})
export class RPT_LAB_CategoryWiseLabReportComponent {
    CategoryWiseLabReportColumns: Array<any> = null;
    CategoryWiseLabReportData: Array<any> = new Array<DynamicReport>();
    dynamicColumns: Array<string> = new Array<string>();
    SelectedImagingCategory: string = "All";
    public currentcategorywiselab: DynamicReport = new DynamicReport(); 
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange:string="";	
    public statusAbove:number =0;
    public orderStatus={statusList: ''};
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
    if (this.currentcategorywiselab.fromDate != null && this.currentcategorywiselab.toDate != null) {
      this.fromDate = this.currentcategorywiselab.fromDate;
      this.toDate = this.currentcategorywiselab.toDate;
      this.dlService.Read("/Reporting/CategoryWiseLabReport?FromDate="
        + this.fromDate + "&ToDate=" + this.toDate+
        "&orderStatus="+this.orderStatus.statusList)
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
            this.CategoryWiseLabReportColumns = this.reportServ.reportGridCols.CategoryWiseLabTest;
            this.CategoryWiseLabReportData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['No Data is Avaliable for Selected Parameters.....Try Different'])
            this.CategoryWiseLabReportColumns = this.reportServ.reportGridCols.CategoryWiseLabTest;
            this.CategoryWiseLabReportData = [];
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }

    OnGridExport($event: GridEmitModel) {
        let summaryHeader = "Category Wise Lab Report";
        this.dlService.ReadExcel("/ReportingNew/ExportToExcelCategoryWiseLabReport?FromDate="
            + this.fromDate + "&ToDate=" + this.toDate + "&SummaryHeader=" + summaryHeader
           )
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "CategoryWiseLabReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },
            res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }

    // This is the result for the Dynamic Query (included just for the reference )
    // Success(res: DanpheHTTPResponse) {
    //     if (res.Status == "OK" && res.Results.JsonData) {
    //         if (res.Results) {
    //             this.dynamicColumns = JSON.parse(res.Results.Schema).map(a => { return a.ColumnName });
    //             this.CategoryWiseLabReportColumns = this.reportServ.reportGridCols.GetColumnSettings(this.dynamicColumns);
    //             this.CategoryWiseLabReportData = JSON.parse(res.Results.JsonData);
    //         }
    //         else {
    //             this.CategoryWiseLabReportData = [];
    //             this.msgBoxServ.showMessage("notice-message",["No data available for this range."]);
    //         }
    //     }
    //     else if (res.Status == "OK" && res.Results.JsonData == null) {
    //         this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    //     }
    //     else {
    //         this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    //     }
    // }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentcategorywiselab.fromDate = this.fromDate;
    this.currentcategorywiselab.toDate = this.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }
}
