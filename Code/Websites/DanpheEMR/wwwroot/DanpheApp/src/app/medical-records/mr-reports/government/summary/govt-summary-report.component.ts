import { Component } from '@angular/core';
import { DLService } from "../../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CoreService } from "../../../../core/shared/core.service";
import { RPT_GOVT_GovtReportSummaryModel } from '../govt-report.models';
import { HospitalServiceSummaryReportModel } from './hospital-services-summary-report.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CommonFunctions } from '../../../../shared/common.functions';

@Component({
  templateUrl: "./govt-summary-report.html"
})
export class GovSummaryReportComponent {

  public fromDate: string = null;
  public toDate: string = null;
  GovTemplate1Data: RPT_GOVT_GovtReportSummaryModel;
  public hospitalName: string = "";
  //For displaying the Template only after the search click
  public displayReport: boolean = false;
  // CurrentGovData: GovernmentTemplate1 = new GovernmentTemplate1();
  diagServices: Array<any> = [];
  outPatientServices: Array<any> = [];
  freeServices: Array<any> = [];
  immunizationServices: Array<any> = [];
  totalPatientAdmitted: Array<any> = [];
  inpatientReferredOut: Array<any> = [];
  totalInpatientDays: Array<any> = [];
  public calType: string = "";
  public HospitalServiceSummaryReport: HospitalServiceSummaryReportModel = new HospitalServiceSummaryReportModel();
  printDetails: HTMLElement;
  showPrint: boolean;
  CurrentUser: string;
  public headerProperties: any;
  public TotlLabServiceProvidedPersonCount: any;

  constructor(
    public http: HttpClient,
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public securityService: SecurityService,
    private nepCalendarService: NepaliCalendarService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.LoadCalendarTypes();
    this.LoadNameForGovReport();
    this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
      this.GetHeaderParameter();
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
        let rptSummary: any = JSON.parse(res.Results.JsonData);

        if (rptSummary) {
          this.diagServices = rptSummary.DiagnosticService;
          this.outPatientServices = rptSummary.OutNEmergServices;
          this.freeServices = rptSummary.FreeServices;
          this.immunizationServices = rptSummary.ImmunizationServices;
          this.totalPatientAdmitted = rptSummary.TotalPatientAdmitted;
          // this.inpatientReferredOut = rptSummary.InpatientReferredOut;
          this.HospitalServiceSummaryReport.InpatientReferredOut = rptSummary.InpatientReferredOut;
          this.totalInpatientDays = rptSummary.TotalInpatientDays;
          this.TotlLabServiceProvidedPersonCount = rptSummary.TotlLabServiceProvidedPersonCount[0].TotlLabServiceProvidedPersonCount;

          this.displayReport = true;
        }
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
    let fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
    let toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");

    let popupWindow;
    let printedDate: any = moment().format("YYYY-MM-DD");
    var printContents = '<div style="text-align: center">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center"> Hospital Summary Report</div>' + '<br>';
    printContents += '<b style="float: left">Date Range (BS)' + ':  From: ' + fromDate_string + '  To: ' + toDate_string + '<b style="float: right"> Printed On:' + this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD") + 'BS (' + printedDate + ')' + '</b><br>';
    printContents += '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += document.getElementById("govReport").innerHTML;
    popupWindow = window.open('', '_blank', 'width=2600,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write(`
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" />
      </head>
      <style type="text/css">
        .Selected {border-collapse: collapse; border-spacing: 3px; border: 1px solid black;padding: 3px;}
        table tbody tr,
        table tbody td {
          border: 1px solid black;
          border-collapse: collapse;
        }
      </style>
      <body onload="window.print()">${printContents} 
      </body>
    </html>
    `);
    popupWindow.document.close();
  }


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.fromDate = $event ? $event.fromDate : this.fromDate;
    this.toDate = $event ? $event.toDate : this.toDate;

    //this.currentdepartmentsales.fromDate = this.fromDate;
    //this.currentdepartmentsales.toDate = this.toDate;
  }

  // Print() {
  //   this.printDetails = document.getElementById("govReport");
  //   this.showPrint = true;
  // }
  // callBackPrint() {
  //   this.printDetails = null;
  //   this.showPrint = false;
  // }


  public Header: string = '';

  GetHeaderParameter() {
    var customerHeaderparam = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if (customerHeaderparam != null) {
      var customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        var headerDetail = JSON.parse(customerHeaderParamValue);
        this.headerProperties = headerDetail;
        this.Header = `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:large;"><strong>${headerDetail.hospitalName}</strong></td>
      </tr>
       <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:small;"><strong>${headerDetail.address}</strong></td>
      </tr>`;

      }
    }
  }
  public ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Hospital Service Summary Report';
      let filename = 'HospitalServiceSummaryReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if (this.headerProperties.HeaderTitle != null) {
        Heading = this.headerProperties.HeaderTitle;
      } else {
        Heading = 'Hospital Service Summary Report';
      }
      hospitalName = this.headerProperties.hospitalName;
      address = this.headerProperties.address;
      phoneNumber = this.headerProperties.tel;
      CommonFunctions.ConvertHTMLMultipleTableToExcelForMR(tableId, this.fromDate, this.toDate, workSheetName,
        this.CurrentUser, Heading, filename, hospitalName, address, phoneNumber);
    }
  }
}
