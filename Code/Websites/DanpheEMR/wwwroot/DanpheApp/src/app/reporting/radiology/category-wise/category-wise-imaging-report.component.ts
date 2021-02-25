import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { DynamicReport } from "../../shared/dynamic-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./category-wise-imaging-report.html"
})
export class RPT_RAD_CategoryWiseImagingReportComponent {

  public fromDate: string = null;
  public toDate: string = null;

  CategoryWiseImagingReportColumns: Array<any> = null;
  CategoryWiseImagingReportData: Array<any> = new Array<DynamicReport>();
  dynamicColumns: Array<string> = new Array<string>();
  SelectedImagingCategory: string = "All";
  public CurrentCategoryImaging: DynamicReport = new DynamicReport();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;
  constructor(_http: HttpClient, _dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
    //this.CategoryWiseImagingReportColumns = ReportGridColumnSettings.CategoryWiseImagingReport;
    this.http = _http;
    this.dlService = _dlService;
    this.CurrentCategoryImaging.fromDate = moment().format('YYYY-MM-DD');
    this.CurrentCategoryImaging.toDate = moment().format('YYYY-MM-DD');
    
  }


  gridExportOptions = {
    fileName: 'CategoryWiseImagingList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']

  };

  Load() {
    if (this.CurrentCategoryImaging.fromDate != null && this.CurrentCategoryImaging.toDate != null) {

      this.NepaliDateInGridSettings = new NepaliDateInGridParams();

      this.dlService.Read("/Reporting/CategoryWiseImagingReport?FromDate="
        + this.CurrentCategoryImaging.fromDate + "&ToDate=" + this.CurrentCategoryImaging.toDate)
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
    if (res.Status == "OK" && res.Results.JsonData) {
      //res.Results.Schema is  the array of JSON data object
      //after parsing we can get the collection of object data with commas separated data and [0] is the bydefault object 
      // after that we can split the collection object data
      this.dynamicColumns = JSON.parse(res.Results.Schema).map(a => { return a.ColumnName });
      this.CategoryWiseImagingReportColumns = this.reportServ.reportGridCols.GetColumnSettings(this.dynamicColumns);
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
      this.CategoryWiseImagingReportData = JSON.parse(res.Results.JsonData);
    }
    else if (res.Status == "OK" && res.Results.JsonData == null) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }


  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.CurrentCategoryImaging.fromDate = this.fromDate;
    this.CurrentCategoryImaging.toDate = this.toDate;
  }
}
