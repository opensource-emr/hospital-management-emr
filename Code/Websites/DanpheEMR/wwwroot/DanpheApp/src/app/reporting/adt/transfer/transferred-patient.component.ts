import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_ADT_TransferredPatientModel } from "./transferred-patient.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "transferred-patient.html"
})
export class RPT_ADT_TransferredPatientsComponent {
  public fromDate: string = null;
  public toDate: string = null;
  TransferredPatientColumns: Array<any> = null;
  TransferredPatientData: Array<any> = new Array<RPT_ADT_TransferredPatientModel>();
  public currenttransferPatient: RPT_ADT_TransferredPatientModel = new RPT_ADT_TransferredPatientModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  dlService: DLService = null;
  http: HttpClient = null;
  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    // this.TransferredPatientColumns = ReportGridColumnSettings.TransferredPatient;
    this.http = _http;
    this.dlService = _dlService;
    this.currenttransferPatient.fromDate = moment().format('YYYY-MM-DD');
    this.currenttransferPatient.toDate = moment().format('YYYY-MM-DD');
  }

  gridExportOptions = {
    fileName: 'TransferredPatientList_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };

  Load() {
    if (this.currenttransferPatient.fromDate != null && this.currenttransferPatient.toDate != null) {

      this.NepaliDateInGridSettings = new NepaliDateInGridParams();

      this.dlService.Read("/Reporting/TransferredPatient?FromDate="
        + this.currenttransferPatient.fromDate + "&ToDate=" + this.currenttransferPatient.toDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }
    
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TransferredPatientColumns = this.reportServ.reportGridCols.TransferredPatient;
      this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("Date", false));
      this.TransferredPatientData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);;;
    }
  }
  public dateRange : string = '';
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currenttransferPatient.fromDate = this.fromDate;
    this.currenttransferPatient.toDate = this.toDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To</b>&nbsp;" + this.toDate;
  }
}
