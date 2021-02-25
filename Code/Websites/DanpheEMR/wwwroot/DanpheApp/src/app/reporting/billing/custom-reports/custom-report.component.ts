import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from '../../../core/shared/core.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { RPT_BIL_CustomReportModel } from './custom-report.model';

@Component({
  templateUrl: "./custom-report.html"
})
export class RPT_BIL_CustomReportComponent {
  public dlService: DLService = null;
  public http: HttpClient = null;
  public fromDate: string = null;
  public toDate: string = null;
  //sud: 30Aug'18--this is hardcoded for now, get it from reports array as soon as we have more than one Custom Reports.
  public reportHeaderText: string = "Health Camp Report (100% Discount on OPD)";
  public reportName: string = "";
  public currentDate: string = "";
  public calType: string = "";
  public showReport: boolean = false;
  public headerDetail: any = null;
  public customReportColumns: Array<any> = new Array<any>();
  public ReportData: Array<any> = new Array<any>();
  public currentCustomReport: RPT_BIL_CustomReportModel = new RPT_BIL_CustomReportModel();

  constructor(
    _http: HttpClient,
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService) {
    this.http = _http;
    this.dlService = _dlService;
    this.LoadHeaderDetailsCalenderTypes();
    this.currentCustomReport.fromDate = moment().format('YYYY-MM-DD');
    this.currentCustomReport.toDate = moment().format('YYYY-MM-DD');
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  Load() {
    for (var i in this.currentCustomReport.CustomReportValidator.controls) {
      this.currentCustomReport.CustomReportValidator.controls[i].markAsDirty();
      this.currentCustomReport.CustomReportValidator.controls[i].updateValueAndValidity();
    }
    if (this.currentCustomReport.fromDate != null && this.currentCustomReport.toDate != null) {
      this.fromDate = this.currentCustomReport.fromDate;
      this.toDate = this.currentCustomReport.toDate;
      this.reportName = this.currentCustomReport.reportName;
      this.dlService.Read("/BillingReports/CustomReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&ReportName=" + this.reportName)
        .map(res => res)
        .subscribe(res => this.Success(res),
          err => this.Error(err));
    }
    else {
      this.msgBoxServ.showMessage("notice-message", ["dates are not proper."]);
    }
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.JsonData) {
      let data = JSON.parse(res.Results.JsonData);
      if (data.Data.length > 0) {
        this.ReportData = data;
        this.showReport = true;
      }
      else
        this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else if (res.Status == "OK") {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates']);
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  LoadHeaderDetailsCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.CustomReport;
      }
      let HeaderParms = allParams.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
      if (HeaderParms) {
        this.headerDetail = JSON.parse(HeaderParms.ParameterValue);
      }
    }
  }

  Print() {
    let popupWinindow;
    var printContents = document.getElementById("printPage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  ExportToExcel() {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelCustomReport?FromDate=" + this.fromDate + "&ToDate=" + this.toDate + "&ReportName=" + this.reportName)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "CustomReport_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },
        err => this.ErrorMsg(err));
  }

  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    this.currentCustomReport.fromDate = this.fromDate;
    this.currentCustomReport.toDate = this.toDate;
  }
}
