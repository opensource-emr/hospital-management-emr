import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_ADT_TransferredPatientModel } from "./transferred-patient.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';

@Component({
  templateUrl: "transferred-patient.html"
})
export class RPT_ADT_TransferredPatientsComponent {
  public fromDate: Date = null;
  public toDate: Date = null;
  TransferredPatientColumns: Array<any> = null;
  TransferredPatientData: Array<any> = new Array<RPT_ADT_TransferredPatientModel>();
  public currenttransferPatient: RPT_ADT_TransferredPatientModel = new RPT_ADT_TransferredPatientModel();
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
    this.dlService.Read("/Reporting/TransferredPatient?FromDate="
      + this.currenttransferPatient.fromDate + "&ToDate=" + this.currenttransferPatient.toDate)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.TransferredPatientColumns = this.reportServ.reportGridCols.TransferredPatient;
      this.TransferredPatientData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);;;
    }
  }
}
