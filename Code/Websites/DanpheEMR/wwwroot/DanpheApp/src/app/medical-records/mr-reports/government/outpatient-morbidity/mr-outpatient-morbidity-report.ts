import { Component } from '@angular/core';
import { Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import * as moment from 'moment';
import { CoreService } from '../../../../core/shared/core.service';
import { ReportingService } from '../../../../reporting/shared/reporting-service';
import { SecurityService } from "../../../../security/shared/security.service";
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CommonFunctions } from '../../../../shared/common.functions';
import { DLService } from '../../../../shared/dl.service';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { MorbidityDiseaseGroupVM, MorbidityReportingGroupVM } from '../../../shared/MorbidityReportingGroupVM';

@Component({
  templateUrl: "./mr-outpatient-morbidity-report.html"
})
export class OutpatientMorbidityReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  // public selDiagnosis: any = "";
  public allDataList: any;
  public dlService: DLService = null;
  public ReportingGroupDiseaseList: Array<MorbidityReportingGroupVM> = new Array<MorbidityReportingGroupVM>();
  public TotalNewMaleOPDVisits: number;
  public TotalNewFemaleOPDVisits: number;
  public TotalMaleOldOPDVisits: number;
  public TotalFemaleOldOPDVisits: number;
  public showPrint: boolean;
  public Header: string;
  CurrentUser: string;
  headerProperties: any;
  filterByICD11: boolean = false;
  filteredReportingGroupDiseaseList: Array<MorbidityReportingGroupVM> = new Array<MorbidityReportingGroupVM>();

  constructor(public securityService: SecurityService, public router: Router, _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    private nepCalendarService: NepaliCalendarService,
    public coreservice: CoreService,) {
    this.dlService = _dlService;
    this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
    this.GetHeaderParameter();
  }

  public LoadOutpatientMorbidityList() {

    this.dlService.Read(`/Reporting/OutpatientMorbidityReport/${this.fromDate}/${this.toDate}`)
      .map(res => res)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allDataList = res.Results;
          this.filterByICD11 = false;
          let TotalVisitCount = JSON.parse(this.allDataList.TotalVisitCount);
          this.TotalNewMaleOPDVisits = TotalVisitCount[0].TotalMaleNewOPDVisits;
          this.TotalNewFemaleOPDVisits = TotalVisitCount[0].TotalFemaleNewOPDVisits;
          this.TotalMaleOldOPDVisits = TotalVisitCount[0].TotalMaleOldOPDVisits;
          this.TotalFemaleOldOPDVisits = TotalVisitCount[0].TotalFemaleOldOPDVisits;
          this.AssignReportingGroupData();
        }
      });
  }
  AssignReportingGroupData() {

    let otherICDTotal = JSON.parse(this.allDataList.OtherICDCount);
    let DiseaseGroupList: Array<MorbidityReportingGroupVM> = JSON.parse(this.allDataList.ReportingGroupCount);
    DiseaseGroupList.map(a => a.DiseasesGroup = JSON.parse(a.DiseasesGroup as string))
    let OtherGDICDFemale = otherICDTotal[0].FemaleCountOICD;
    let OtherGDICDMale = otherICDTotal[1].MaleCountOICD;
    let otherDiseaseGroup = DiseaseGroupList.find(a => a.ReportingGroupName == 'T Others');
    if (otherDiseaseGroup != null) {
      const diseases = otherDiseaseGroup.DiseasesGroup as MorbidityDiseaseGroupVM[];
      let otherDisease = diseases.find(a => a.ICDCode == 'R69');
      if (otherDisease != null) {
        otherDisease.NumberOfFemale += OtherGDICDFemale;
        otherDisease.NumberOfMale += OtherGDICDMale;
      }
    }
    this.filteredReportingGroupDiseaseList = this.ReportingGroupDiseaseList = DiseaseGroupList;

  }

  Back() {
    this.router.navigate(['Medical-records/ReportList']);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.LoadOutpatientMorbidityList();
  }
  FilterReport() {
    this.filterByICD11 = !this.filterByICD11;
    if (this.filterByICD11 == true) {
      this.filteredReportingGroupDiseaseList = this.ReportingGroupDiseaseList.filter(x => x.IcdVersion == "ICD-11");
    }
    else {
      this.filteredReportingGroupDiseaseList = this.ReportingGroupDiseaseList;
    }
  }
  Print() {
    let fromDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.fromDate, "YYYY-MM-DD");
    let toDate_string = this.nepCalendarService.ConvertEngToNepaliFormatted(this.toDate, "YYYY-MM-DD");

    let popupWindow;
    let printedDate: any = moment().format("YYYY-MM-DD");
    this.showPrint = true;
    var printContents = '<div style="text-align: center;">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">Outpatient Morbidity Report</div>' + '<br>';
    printContents += '<b style="float: left">Date Range (BS)' + ':  From: ' + fromDate_string + '  To: ' + toDate_string + '<b style="float: right"> Printed On:' + this.nepCalendarService.ConvertEngToNepaliFormatted(printedDate, "YYYY-MM-DD") + 'BS (' + printedDate + ')' + '</b><br>';
    printContents += '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += document.getElementById("dvPrintPage_OpMorbidityRpt").innerHTML;
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
    var customerHeaderparam = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if (customerHeaderparam != null) {
      var customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        this.headerProperties = JSON.parse(customerHeaderParamValue);

        this.Header = `
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:large;"><strong>${this.headerProperties.hospitalName}</strong></td><br>
      </tr>
       <tr>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="4" style="text-align:center;font-size:small;"><strong>${this.headerProperties.address}</strong></td>
      </tr>`;

      }
    }
  }

  public ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Outpatient Morbidity Report';
      let filename = 'OutpatientMorbidityReport';
      var Heading;
      var phoneNumber;
      var hospitalName;
      var address;
      if (this.headerProperties) {
        if (this.headerProperties.HeaderTitle) Heading = this.headerProperties.HeaderTitle;
        else Heading = 'Outpatient Morbidity Report';
        hospitalName = this.headerProperties.hospitalName;
        address = this.headerProperties.address;
        phoneNumber = this.headerProperties.tel;
      }

      var dateRange;
      let fromDateNp: any;
      let toDateNp = '';
      if (this.fromDate.length > 0 && this.toDate.length > 0) {
        fromDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.fromDate, '');
        toDateNp = NepaliCalendarService.ConvertEngToNepaliFormatted_static(this.toDate, '');
      }
      let nepaliExportDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(moment().format('YYYY-MM-DD'), '');
      dateRange = (this.fromDate.length > 0 && this.toDate.length > 0) ? `<tr><td><b>Date Range (BS): ${fromDateNp} To ${toDateNp}</b></td><td></td> <td ><b> Exported Date:${moment().format('YYYY-MM-DD')} (${nepaliExportDate} BS)<td></td><td></td><td><b> Exported By:${this.CurrentUser}</b></td></tr> <tr></tr>` : '';

      CommonFunctions.ConvertHTMLTableToExcelForMedicalRecord(tableId, dateRange, workSheetName,
        Heading, filename, hospitalName, address, phoneNumber);
    }
  }

}
