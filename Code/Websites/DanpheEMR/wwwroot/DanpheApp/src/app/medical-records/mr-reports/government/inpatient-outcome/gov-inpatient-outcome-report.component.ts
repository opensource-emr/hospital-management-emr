import { Component } from '@angular/core';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';

import { RPT_GOVT_InpatientOutcomeModel } from './Inpatient-outcome.model';
import { DLService } from "../../../../shared/dl.service";
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment/moment';
import { DynamicGovernmentReport } from '../../../../reporting/shared/dynamic-gov-report.model';
import { InpatientServiceReportModel } from './inpatient-service-report.model';
import { CoreService } from '../../../../core/shared/core.service';
import { SecurityService } from '../../../../security/shared/security.service';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';
// import { NepaliDatePipe } from '../../../../shared/pipes/nepali-date.pipe';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CommonFunctions } from '../../../../shared/common.functions';
@Component({
  templateUrl: "./gov-inpatient-outcome-report.html",
  // providers: [
  //   NepaliDatePipe
  // ],
})
export class GovInpatientOutcomeReportComponent {

  public displayReport: boolean = false;

  public InpatientOutcomeTable: Array<RPT_GOVT_InpatientOutcomeModel> = new Array<RPT_GOVT_InpatientOutcomeModel>();

  public InpatientServiceSummary: InpatientServiceReportModel = new InpatientServiceReportModel()

  public currentInpatientOutcome: DynamicGovernmentReport = new DynamicGovernmentReport();
  public showPrint: boolean;

  public CurrentUser: any;
  public headerProperties: any;

  constructor(public http: HttpClient, public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public coreservice: CoreService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService,
    // private nepDate: NepaliDatePipe,
    private nepCalendarService: NepaliCalendarService) {
    this.currentInpatientOutcome.fromDate = moment().format('YYYY-MM-DD');
    this.currentInpatientOutcome.toDate = moment().format('YYYY-MM-DD');
    this.GetHeaderParameter();

    if (this.securityService.loggedInUser.Employee) {
      this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
    }
  }

  gridExportOptions = {
    fileName: 'InpatientOutcome' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };

  // Print() {
  //   let popupWindow;
  //   var printContents = document.getElementById("printpage").innerHTML;
  //   popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
  //   popupWindow.document.open();
  //   popupWindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /></head><style type="text/css">.Selected {border-collapse: collapse; border-spacing: 5px; border: 1px solid black;padding: 5px;}</style><body onload="window.print()">' + printContents + '</body></html>');
  //   popupWindow.document.close();
  // }

  Load() {
    if (this.currentInpatientOutcome.fromDate != null && this.currentInpatientOutcome.toDate != null) {
      this.dlService.Read("/GovernmentReporting/GetInpatientOutcome?FromDate="
        + this.currentInpatientOutcome.fromDate + "&ToDate=" + this.currentInpatientOutcome.toDate)
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
    if (res.Status == "OK") {
      // this.InpatientOutcomeTable = JSON.parse(res.Results.InpatientoutcomeModel);
      if (res.Results) {
        this.InpatientServiceSummary.InpatientOutcome = JSON.parse(res.Results.InpatientOutcome);
        this.InpatientServiceSummary.GestationalWeek_Gravda = JSON.parse(res.Results.GestationalWeek_Gravda);
        this.InpatientServiceSummary.GestationalWeek_MaternalAge = JSON.parse(res.Results.GestationalWeek_MaternalAge);
        this.InpatientServiceSummary.FreeHealthServiceSummary = JSON.parse(res.Results.FreeHealthServiceSummary);
        this.InpatientServiceSummary.FreeHealthServiceSummary_SSP = JSON.parse(res.Results.FreeHealthServiceSummary_SSP);
        this.InpatientServiceSummary.DeathSummary = JSON.parse(res.Results.DeathSummary);
        this.InpatientServiceSummary.SurgerySummary = JSON.parse(res.Results.SurgerySummary);
        this.displayReport = true;
      } else {
        this.msgBoxServ.showMessage("Information", ["No Data Received!"]);
      }

    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentInpatientOutcome.fromDate = $event.fromDate;
    this.currentInpatientOutcome.toDate = $event.toDate;

  }
  //this is used to print the Report
  Print() {
    let fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.currentInpatientOutcome.fromDate, "YYYY-MM-DD");
    let toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.currentInpatientOutcome.toDate, "YYYY-MM-DD");

    let popupWindow;
    let printedDate: any = moment().format("YYYY-MM-DD");
    this.showPrint = true;
    var printContents = '<div style="text-align: center">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">Inpatient Service Report</div>' + '<br>';
    printContents += '<b style="float: left">Date Range (BS)' + ':  From: ' + fromDate_string + '  To: ' + toDate_string + '<b style="float: right"> Printed On:' + this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD") + 'BS (' + printedDate + ')' + '</b><br>';
    printContents += '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += document.getElementById("PrintPage").innerHTML;
    popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write(`<html><head>
      <link rel="stylesheet" type="text/css" href="../../../assets-dph/external/global/plugins/bootstrap/css/theme-default/Danphe_ui_style.css" />
      <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/Danphe_ui_style.css" />
      <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanphePrintStyle.css" />
      </head>
      <style type="text/css">
        .Selected {border-collapse: collapse;} 
        .no-print{display: none;} 
        @media print{@page {size: landscape}}
        td { padding: 0.2rem;}
      </style>
      <body>`
      + printContents + `</body></html>`);
    popupWindow.document.close();
    let tmr = setTimeout(function () {
      popupWindow.print();
      popupWindow.close();
    }, 300);

  }
  callBackPrint() {
    // this.printDetails = null;
    this.showPrint = false;
  }
  public Header: string = '';
  GetHeaderParameter() {
    var customerHeaderparam = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if (customerHeaderparam != null) {
      var customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        var headerDetail = JSON.parse(customerHeaderParamValue);
        this.headerProperties = headerDetail
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
      let workSheetName = 'Inpatient Service Report';
      let filename = 'InpatientServiceReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if (this.headerProperties.HeaderTitle != null) {
        Heading = this.headerProperties.HeaderTitle;
      } else {
        Heading = 'Inpatient Service Report';
      }
      hospitalName = this.headerProperties.hospitalName;
      address = this.headerProperties.address;
      phoneNumber = this.headerProperties.tel;
      CommonFunctions.ConvertHTMLMultipleTableToExcelForMR(tableId, this.currentInpatientOutcome.fromDate, this.currentInpatientOutcome.toDate, workSheetName,
        this.CurrentUser, Heading, filename, hospitalName, address, phoneNumber);

    }
  }

}