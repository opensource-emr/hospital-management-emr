import { Component, Directive } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";

import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { RPT_GOVT_GovtReportSummaryModel } from '../govt-report.models';

@Component({
  templateUrl: "./govt-reports-summary.html"
})
export class RPT_GOVT_GovReportSummaryComponent {

  public fromDate: string = null;
  public toDate: string = null;
  GovTemplate1Data: RPT_GOVT_GovtReportSummaryModel;
  public hospitalName: string = "";
  //For displaying the Template only after the search click
  public displayReport: boolean = false;
  // CurrentGovData: GovernmentTemplate1 = new GovernmentTemplate1();
  diagServices: Array<any> = [];
  outPatientServices: Array<any> = [];
  public calType: string = "";

  constructor(
    public http: HttpClient,
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.LoadCalendarTypes();
    this.LoadNameForGovReport();
  }

  Load() {
    this.dlService.Read("/GovernmentReporting/GetSummaryReport?FromDate="
      + this.fromDate + "&ToDate=" + this.toDate).map(res => res)
      .subscribe(res => {
        this.Success(res),
          res => this.Error(res)
      });
  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  Success(res) {
    if (res.Status == "OK") {
      if (res.Results) {
        let rptSummary = JSON.parse(res.Results.JsonData);

        this.diagServices = rptSummary.DiagnosticService;
        this.outPatientServices = rptSummary.OutNEmergServices;
        this.displayReport = true;
        //CounterId	CounterName	CounterCollection

        //this.danpheCharts.Billing_Mix_MonthlyBilling("dvMonthlyBilling", dataToParse);
      }

      this.GovTemplate1Data = res.Results;
      this.GovTemplate1Data.hospitalName = this.hospitalName;

      //this.diagServices = this.GovTemplate1Data.DiagnosticServices;
      //this.outPatientServices = this.GovTemplate1Data.OutpatientServices;
      //For displaying the Template only after the search click
      this.displayReport = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }
  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes() {
    let Parameter = this.coreservice.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
    let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
    this.calType = calendarTypeObject.GovReportSummary;
  }

  LoadNameForGovReport() {
    let Parameter = this.coreservice.Parameters;
    Parameter = Parameter.filter(parms => parms.ParameterName == "HospitalName");
    this.hospitalName = Parameter[0].ParameterValue;
  }

  Print() {
    let popupWindow;
    var printContents = document.getElementById("govReport").innerHTML;
    popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /></head><style type="text/css">.Selected {border-collapse: collapse; border-spacing: 5px; border: 1px solid black;padding: 5px;}</style><body onload="window.print()">' + printContents + '</body></html>');
    popupWindow.document.close();
  }


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    //this.currentdepartmentsales.fromDate = this.fromDate;
    //this.currentdepartmentsales.toDate = this.toDate;
  }
}
