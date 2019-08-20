import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_ADT_TotalAdmittedPatientModel } from "./total-admitted-patient.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';

@Component({
  templateUrl: "./total-admitted-patient.html"

})
export class RPT_ADT_TotalAdmittedPatientComponent {
    public fromDate: Date = null;
    public toDate: Date = null;
    TotalAdmittedPatientColumns: Array<any> = null;
  TotalAdmittedPatientData: Array<any> = new Array<RPT_ADT_TotalAdmittedPatientModel>();
  public currenttotalAdmittedPatient: RPT_ADT_TotalAdmittedPatientModel = new RPT_ADT_TotalAdmittedPatientModel();
    dlService: DLService = null;
    http: HttpClient = null;

    constructor(
        _http: HttpClient,
        _dlService: DLService,
        public msgBoxServ: MessageboxService,
        public reportServ: ReportingService) {
        this.http = _http;
        this.dlService = _dlService;
        this.currenttotalAdmittedPatient.fromDate = moment().format('YYYY-MM-DD');
        this.currenttotalAdmittedPatient.toDate = moment().format('YYYY-MM-DD');
        this.Load();
    }
    
    gridExportOptions = {
        fileName: 'TotalAdmittedpatientList_' + moment().format('YYYY-MM-DD') + '.xls',

    };

    Load() {
        this.dlService.Read("/Reporting/TotalAdmittedPatient")
            .map(res => res)
            .subscribe(res => this.Success(res),
            res => this.Error(res));
    }
    Error(err) {
        this.msgBoxServ.showMessage("error", [err]);
    }
    Success(res) {
        if (res.Status == "OK" && res.Results.length > 0) {
            this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.TotalAdmittedPatient;
            this.TotalAdmittedPatientData = res.Results;
        }
        else if (res.Status == "OK" && res.Results.length == 0) {
            this.msgBoxServ.showMessage("notice-message", ['No Data is Avaliable for Selected Parameters.....Try Different'])
            this.TotalAdmittedPatientColumns = this.reportServ.reportGridCols.TotalAdmittedPatient;
            this.TotalAdmittedPatientData = res.Results;
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }
}
