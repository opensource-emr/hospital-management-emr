import { Component } from '@angular/core';
import * as moment from 'moment/moment';
import { CoreService } from '../../../../core/shared/core.service';
import { SecurityService } from '../../../../security/shared/security.service';
import { GeneralFieldLabels } from '../../../../shared/DTOs/general-field-label.dto';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { CommonFunctions } from '../../../../shared/common.functions';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../../shared/shared-enums';
import { EthnicGroupStatisticsInpatient_DTO, EthnicGroupStatisticsOutpatient_DTO } from '../../../shared/ethnic-group-statics-data.model';
import { MR_BLService } from '../../../shared/mr.bl.service';

@Component({
  selector: 'app-ethnic-group-statistics',
  templateUrl: './ethnic-group-statistics.component.html',
})
export class EthnicGroupStatisticsReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public displayReport: boolean = false;
  public showPrint: boolean = false;
  public OutPatientEthnicGroupStaticsData: EthnicGroupStatisticsOutpatient_DTO[];
  public InPatientEthnicGroupStaticsData: EthnicGroupStatisticsInpatient_DTO[];
  public Header: string = '';
  public CurrentUser = '';
  public headerProperties: { HeaderTitle: "", hospitalName: "", address: "", tel: "" };
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(
    private medicalRecordsBLService: MR_BLService,
    private msgBoxServ: MessageboxService,
    private nepCalendarService: NepaliCalendarService,
    public securityService: SecurityService,
    public coreservice: CoreService
  ) {
    this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
    this.GetHeaderParameter();
    this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
  }

  public OnFromToDateChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  public GetEthnicGroupStatisticsData() {
    this.displayReport = false;
    this.medicalRecordsBLService.GetEthnicGroupStatisticsData(this.fromDate, this.toDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        if (res.Results) {
          this.displayReport = true;
          this.InPatientEthnicGroupStaticsData = res.Results.InPatientEthnicGroupStatisticsReports;
          this.OutPatientEthnicGroupStaticsData = res.Results.OutPatientEthnicGroupStatisticsReports;


        }
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Error Occured while getting EthnicGroup wise patients statistics data. Please Try again Later']);
      }
    });

  }

  Print() {
    let fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
    let toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");

    let popupWindow;
    let printedDate: any = moment().format("YYYY-MM-DD");
    this.showPrint = true;
    let printContents = '<div style="text-align: center;">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">{{GeneralFieldLabel.Caste}} Group Statistics Report</div>' + '<br>';
    printContents += '<b style="float: left">Date Range (BS)' + ':  From: ' + fromDate_string + '  To: ' + toDate_string + '<b style="float: right"> Printed On:' + this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD") + 'BS (' + printedDate + ')' + '</b>';
    printContents += '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += document.getElementById("PrintPage_EthnicGroupWiseStatisticsReport").innerHTML;
    popupWindow = window.open('', '_blank', 'width=600,heigth=800,scrollbars=no, menubar=no,toolbar=no, location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write(`<html><head>
    <link rel="stylesheet" type="text/css" href="../../../assets-dph/external/global/plugins/bootstrap/css/theme-default/Danphe_ui_style.css" />
    <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/Danphe_ui_style.css" />
    <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanphePrintStyle.css" />
    </head>
    <style type="text/css">.dv-table-wrapper{max-height: inherit !important; overflow: auto !important;} .Selected {border-collapse: collapse;}  .no-print{display: none;} @media print{@page {size: landscape}}</style>
    <body>`
      + printContents + `</body></html>`);
    popupWindow.document.close();
    let tmr = setTimeout(function () {
      popupWindow.print();
      popupWindow.close();
    }, 400);
  }
  GetHeaderParameter() {
    let customerHeaderparam = this.coreservice.Parameters.find(a => a.ParameterGroupName === "Common" && a.ParameterName === "CustomerHeader");
    if (customerHeaderparam !== null) {
      let customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        this.headerProperties = JSON.parse(customerHeaderParamValue);
        this.Header = `
      <tr>
        <td></td>
        <td colspan="3" style="text-align:center;font-size:large;"><strong>${this.headerProperties.hospitalName}</strong></td>
      </tr>
       <tr>
        <td></td>
        <td colspan="3" style="text-align:center;font-size:small;"><strong>${this.headerProperties.address}</strong></td>
      </tr>`;

      }
    }
  }

  public ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Ethnic Group Statistics Report';
      let filename = 'EthnicGroupStatisticsReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;

      if (this.headerProperties) {
        if (this.headerProperties.HeaderTitle) {
          Heading = this.headerProperties.HeaderTitle;
        } else {
          Heading = 'Ethnic Group Statistics Report';
        }
        hospitalName = this.headerProperties.hospitalName;
        address = this.headerProperties.address;
        phoneNumber = this.headerProperties.tel;
      }


      let dateRange;
      let fromDateNp: any;
      let toDateNp = '';
      if (this.fromDate.length > 0 && this.toDate.length > 0) {
        fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.fromDate, '');
        toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.toDate, '');
      }
      let nepaliExportDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(moment().format('YYYY-MM-DD'), '');

      dateRange = (this.fromDate.length > 0 && this.toDate.length > 0) ? `<tr><td><b>Date Range (BS): ${fromDateNp} To ${toDateNp}</b></td><td></td><td ><b> Exported Date:${moment().format('YYYY-MM-DD')} (${nepaliExportDate} BS) <td></td><td><b> Exported By:${this.CurrentUser}</b></td></tr>` : '';


      CommonFunctions.ConvertHTMLTableToExcelForMedicalRecord(tableId, dateRange, workSheetName,
        Heading, filename, hospitalName, address, phoneNumber);
    }
  }

}
