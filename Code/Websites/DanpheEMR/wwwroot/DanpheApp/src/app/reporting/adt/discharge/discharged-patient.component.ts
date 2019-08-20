import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_ADT_DischargedPatientModel } from "./discharged-patient.model"
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { Patient } from "../../../patients/shared/patient.model";

@Component({
  templateUrl: "./discharged-patient.html"
})
export class RPT_ADT_DischargedPatientComponent {

  public fromDate: Date = null;
  public toDate: Date = null;
  DischargedPatientColumns: Array<any> = null;
  DischargedPatientData: Array<any> = new Array<any>();
  public currentdischargepatient: RPT_ADT_DischargedPatientModel = new RPT_ADT_DischargedPatientModel();
  public dischargedPat: RPT_ADT_DischargedPatientModel = new RPT_ADT_DischargedPatientModel();
  dlService: DLService = null;
  http: HttpClient = null;
  public showDischargeBillBreakup = false;
  public visitId: any;
  public eventData: any;


  constructor(
    _http: HttpClient, public changeDetector: ChangeDetectorRef,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService) {
    this.http = _http;
    this.dlService = _dlService;
    this.currentdischargepatient.fromDate = moment().format('YYYY-MM-DD');
    this.currentdischargepatient.toDate = moment().format('YYYY-MM-DD');
  }

  gridExportOptions = {
    fileName: 'DischargedPatientList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    this.dlService.Read("/Reporting/DischargedPatient?FromDate="
      + this.currentdischargepatient.fromDate + "&ToDate=" + this.currentdischargepatient.toDate)
      .map(res => res)
      .subscribe(res => this.Success(res),
        res => this.Error(res));
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.DischargedPatientColumns = this.reportServ.reportGridCols.DischargedPatient;
      this.DischargedPatientData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  public DischargeBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "bill-summary":
        {
          this.dischargedPat = new RPT_ADT_DischargedPatientModel();
          this.showDischargeBillBreakup = false;
          this.changeDetector.detectChanges();
          this.dischargedPat = $event.Data;
          this.showDischargeBillBreakup = true;
        }
        break;
      default:
        break;
    }
  }


}
