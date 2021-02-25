import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
//import {PatientBillHistory} from "./patient-bill-history.model.model"
import { RPT_BIL_PaidBillHistory } from "./patient-bill-history.model"
import { RPT_BIL_UnpaidBillHistory } from "./patient-bill-history.model"
import { RPT_BIL_ReturnedBillHistory } from "./patient-bill-history.model"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
  templateUrl: "./patient-bill-history.html"

})
export class RPT_BIL_PatientBillHistoryComponent {
  //current UI binded properties
  public fromDate: string = null;
  public toDate: string = null;
  public patientCode: string = null;
  //selected properties for server-calling
  public selFromDate: string = null;
  public selToDate: string = null;
  public selPatientCode: string = null;
  //Grid Data
  PaidBillData: Array<any> = new Array<RPT_BIL_PaidBillHistory>();
  UnpaidBillData: Array<any> = new Array<RPT_BIL_UnpaidBillHistory>();
  ReturnedBillData: Array<any> = new Array<RPT_BIL_ReturnedBillHistory>();
  //Grid Columns
  PaidBillColumns: Array<any> = null;
  UnpaidBillColumns: Array<any> = null;
  ReturnedBillColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  dlService: DLService = null;
  http: HttpClient = null;

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.PaidBillColumns = this.reportServ.reportGridCols.PaidBillColumns;
    this.UnpaidBillColumns = this.reportServ.reportGridCols.UnpaidBillColumns;
    this.ReturnedBillColumns = this.reportServ.reportGridCols.ReturnedBillColumns;
    this.http = _http;
    this.dlService = _dlService;
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("PaidDate", false));
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
    //this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("ReturnDate", false));
  }

  gridExportOptions = {
    fileName: 'PatientBillHistoryList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };

  Load() {
    //assigning current properties to selected
    this.selFromDate = this.fromDate;
    this.selToDate = this.toDate;
    this.selPatientCode = this.patientCode;

    if (this.selFromDate != null && this.selToDate != null) {
      this.dlService.Read("/BillingReports/PatientBillHistory?FromDate=" + this.selFromDate
        + "&ToDate=" + this.selToDate + "&PatientCode=" + this.selPatientCode)
        .map(res => res)
        .subscribe(res => this.AssignBillHistoryData(res),
          err => this.Error(err));
    }
    else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }

  AssignBillHistoryData(res) {
    if (res.Status == "OK") {
      let billHistory = res.Results;

      //this.PaidBillColumns = ReportGridColumnSettings.PaidBillColumns;
      this.PaidBillData = billHistory.paidBill;
      //this.UnpaidBillColumns = ReportGridColumnSettings.UnpaidBillColumns;
      this.UnpaidBillData = billHistory.unpaidBill;
      //this.ReturnedBillColumns = ReportGridColumnSettings.ReturnedBillColumns;
      this.ReturnedBillData = billHistory.returnBill;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    //this.currentdepartmentsales.fromDate = this.fromDate;
    //this.currentdepartmentsales.toDate = this.toDate;
  }
}
