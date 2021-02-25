import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';

import { RPT_BIL_BilDocMainModel } from './bill-doc-main.model';

@Component({
  templateUrl: "./bill-doc-summary-main.html"
})
export class RPT_BIL_DoctorSummaryMainComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public calType: string = "";
  public doctorList: any;
  public showDocSummary: boolean = false;
  public showDocDeptSummary: boolean = false;
  public headerDetail: any = null;
  public selDoctor: any = "";
  public curDocReportMain: RPT_BIL_BilDocMainModel = new RPT_BIL_BilDocMainModel();
  public selDocReportMain: RPT_BIL_BilDocMainModel = new RPT_BIL_BilDocMainModel();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService, public changeDetector: ChangeDetectorRef) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadCalenderTypes();
    this.LoadDoctorList();
    this.curDocReportMain.fromDate = this.curDocReportMain.toDate = moment().format('YYYY-MM-DD');
  }

  Load() {
    this.showDocSummary = this.showDocDeptSummary = false;
    this.changeDetector.detectChanges();
    //for (var i in this.curDocReportMain.BilDocMainReportValidator.controls) {
    //    this.curDocReportMain.BilDocMainReportValidator.controls[i].markAsDirty();
    //    this.curDocReportMain.BilDocMainReportValidator.controls[i].updateValueAndValidity();
    //}
    //if (this.curDocReportMain.IsValidCheck(undefined, undefined)) {
    if (this.curDocReportMain.fromDate != null && this.curDocReportMain.toDate != null) {
      if (this.curDocReportMain.providerId >= 0 && this.curDocReportMain.providerId != null)
        this.selDocReportMain = this.curDocReportMain;
      else {
        this.curDocReportMain.providerId = null;
        this.selDocReportMain = this.curDocReportMain;
      }
      // check if providerId is defined by user or not,
      //if yes, showDeptDocDept=true;  else showDocSummary=true;
      if (this.selDocReportMain.providerId == null) {
        this.showDocSummary = true;
        this.showDocDeptSummary = false;
      }
      else if (this.selDocReportMain.providerId != null) {
        this.showDocDeptSummary = true;
        this.showDocSummary = false;
      }
      this.changeDetector.detectChanges();
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
    }
  }

  doctorChanged() {
    this.curDocReportMain.providerId = this.selDoctor ? this.selDoctor.EmployeeId : null;
  }

  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.DoctorSummary;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }

  LoadDoctorList() {
    this.dlService.Read("/BillingReports/GetDoctorList")
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.doctorList = res.Results;
          var noDoctor = { "EmployeeId": 0, "FullName": "No Doctor" };
          this.doctorList.splice(0, 0, noDoctor);
        }
      });
  }
  myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printPage").innerHTML;
    var HeaderContent = document.getElementById("headerForPrint").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head><style> .non-printable { visibility: hidden; }</style>';
    documentContent += '<body onload="window.print()">' + HeaderContent + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  //Anjana:10June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {

    this.curDocReportMain.fromDate = $event.fromDate;
    this.curDocReportMain.toDate = $event.toDate;

  }
}
