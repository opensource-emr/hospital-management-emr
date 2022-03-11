import { Component } from '@angular/core';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RPT_GOVT_LaboratoryServicesModel } from './laboratory-services.model';
import { DLService } from "../../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { NepaliDate } from '../../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../../shared/calendar/np/nepali-calendar.service';
import { CoreService } from "../../../../core/shared/core.service"
import * as moment from 'moment/moment';
import { DynamicGovernmentReport } from '../../../../reporting/shared/dynamic-gov-report.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { SettingsBLService } from '../../../../settings-new/shared/settings.bl.service';

@Component({
  templateUrl: "./gov-laboratory-services-report.html",
  })
export class GovLaboratoryServicesReportComponent {

  public fromDateNepali: NepaliDate = null;
  public toDateNepali: NepaliDate = null;
  public displayReport: boolean = false;
  public displayPreviousReport: boolean = false;
  public calType: string = "";
  public HaematologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public HaematologyTable1: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public ImmunologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public ImmunologyTable1: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public BiochemistryTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public BiochemistryTable1: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public BacteriologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public CytologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public VirologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public ImmunohistochemistryTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public HistologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public ParasitologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public CardiacenzymesTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();
  public HormonesendocrinologyTable0: Array<RPT_GOVT_LaboratoryServicesModel> = new Array<RPT_GOVT_LaboratoryServicesModel>();

  public currentLaboratoryServices: DynamicGovernmentReport = new DynamicGovernmentReport();
  dlService: DLService = null;

  public hematology: Array<any> = [];
  public bacteriology: Array<any> = [];
  public biochemistry: Array<any> = [];
  public drugAnalysis: Array<any> = [];
  public histopathology: Array<any> = [];
  public hormone: Array<any> = [];
  public immunology: Array<any> = [];
  public parasitology: Array<any> = [];
  public virology: Array<any> = [];
  public immunoHistoChemistry: Array<any> = [];
  public CurrentUser = ''; 

  constructor(public http: HttpClient,
    public _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public coreservice: CoreService,
    public securityService: SecurityService,
    public settingsBLService: SettingsBLService) {
    this.dlService = _dlService;
    this.LoadCalendarTypes();
    this.currentLaboratoryServices.fromDate = moment().format('YYYY-MM-DD');
    this.currentLaboratoryServices.toDate = moment().format('YYYY-MM-DD');
    if(this.securityService.loggedInUser.Employee){
      this.CurrentUser = this.securityService.loggedInUser.Employee.FullName;
    }

    this.GetHeaderParameter();
  }
  gridExportOptions = {
    fileName: 'LaboratoryServices' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };
  Print() {
    let fromDate_string = this.npCalendarService.ConvertEngToNepaliFormatted(this.currentLaboratoryServices.fromDate, "YYYY-MM-DD");
    let toDate_string = this.npCalendarService.ConvertEngToNepaliFormatted(this.currentLaboratoryServices.toDate, "YYYY-MM-DD");

    let printedDate: any = moment().format("YYYY-MM-DD HH:mm");
    let popupWindow;
    var printContents = '<div style="text-align: center">' + this.Header + ' </div>' + '<br>';
    printContents += '<div style="text-align: center">Lab Report</div>' + '<br>';
    printContents +=  '<b style="float: left">Date Range (BS)' + ':  From: ' + fromDate_string + '  To: ' + toDate_string +  '<b style="float: right"> Printed On:' +this.npCalendarService.ConvertEngToNepaliFormatted(printedDate,  "YYYY-MM-DD") + 'BS ('+  printedDate +')'+'</b><br>';
    printContents += '<b style="float: right"> Printed By :' + this.CurrentUser + '</b><br>';
    printContents += document.getElementById("printpageForLabReport").innerHTML;
    popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write(`<html><head>
    <link rel="stylesheet" type="text/css" href="../../../assets-dph/external/global/plugins/bootstrap/css/theme-default/Danphe_ui_style.css" />
    <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/Danphe_ui_style.css" />
    <link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanphePrintStyle.css" />
    </head>
    <style type="text/css">.Selected {border-collapse: collapse;} .no-print{display: none;} @media print{@page {size: landscape}}</style>
    <body>`
      + printContents + `</body></html>`);
    popupWindow.document.close();
    let tmr = setTimeout(function () {
      popupWindow.print();
      popupWindow.close();
    }, 300);
  }
  Load() {
    //validation check
    let CheckIsValid = true;
    for (var x in this.currentLaboratoryServices.DyanamicValidator.controls) {
      this.currentLaboratoryServices.DyanamicValidator.controls[x].markAsDirty();
      this.currentLaboratoryServices.DyanamicValidator.controls[x].updateValueAndValidity();
      if (this.currentLaboratoryServices.IsValidCheck(undefined, undefined) == false) {
        CheckIsValid = false;
      }
    }
    if ((moment(this.currentLaboratoryServices.fromDate).diff(this.currentLaboratoryServices.toDate)) <= 0)

      if (this.currentLaboratoryServices.fromDate != null && this.currentLaboratoryServices.toDate != null) {
        this.dlService.Read("/GovernmentReporting/GetLaboratoryServices?FromDate="
          + this.currentLaboratoryServices.fromDate + "&ToDate=" + this.currentLaboratoryServices.toDate)
          .map(res => res)
          .subscribe(res => this.Success(res),
            err => this.Error(err));
      }
      else {
        this.msgBoxServ.showMessage('notice', ["date is in-valid."])
      }
    else {
      this.msgBoxServ.showMessage('notice', ["FromDate must be earlier than ToDate."])
    }

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }
  Success(res) { 
    if (res.Status == "OK") {
      // let data = JSON.parse(res.Results.JsonData);
      console.log(res.Results);
      this.hematology = Object.entries(res.Results.Hematology);
      this.bacteriology = Object.entries(res.Results.Bacteriology);
      this.drugAnalysis = Object.entries(res.Results.Drug_Analysis);
      this.immunoHistoChemistry = Object.entries(res.Results["Immuno-Histo_Chemistry"]);
      this.immunology = Object.entries(res.Results.Immunology);
      this.parasitology = Object.entries(res.Results.Parasitology);
      this.virology = Object.entries(res.Results.Virology);
      this.histopathology = Object.entries(res.Results["Histopathology/Cytology"]);
      this.hormone = Object.entries(res.Results["Hormone/Endocrine"]);
      this.biochemistry = Object.entries(res.Results.Biochemistry);
      // console.log(this.histopathology);
      // console.log(this.hematology);
      //this.HaematologyTable0 = res.Results.Hematology;
      //console.log(this.HaematologyTable0)
      //this.HaematologyTable1 = JSON.parse(res.Results.HaematologyModel1);
      //this.ImmunologyTable0 = JSON.parse(res.Results.ImmunologyModel0);
      //this.ImmunologyTable1 = JSON.parse(res.Results.ImmunologyModel1);
      //this.BiochemistryTable0 = JSON.parse(res.Results.BiochemistryModel0);
      //this.BiochemistryTable1 = JSON.parse(res.Results.BiochemistryModel1);
      //this.BacteriologyTable0 = JSON.parse(res.Results.BacteriologyModel0);
      //this.CytologyTable0 = JSON.parse(res.Results.CytologyModel0);
      //this.VirologyTable0 = JSON.parse(res.Results.VirologyModel0);
      //this.ImmunohistochemistryTable0 = JSON.parse(res.Results.ImmunohistochemistryModel0);
      //this.HistologyTable0 = JSON.parse(res.Results.HistologyModel0);
      //this.ParasitologyTable0 = JSON.parse(res.Results.ParasitologyModel0);
      //this.CardiacenzymesTable0 = JSON.parse(res.Results.CardiacenzymesModel0);
      //this.HormonesendocrinologyTable0 = JSON.parse(res.Results.HormonesendocrinologyModel0);
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
    this.calType = calendarTypeObject.LaboratoryServices;
  }
  //LoadDateByDefault() {
  //    let npDateToday = this.npCalendarService.GetTodaysNepDate();
  //    this.fromDateNepali = npDateToday;
  //    this.toDateNepali = npDateToday;
  //    this.NepCalendarOnDateChange();

  //}

  //NepCalendarOnDateChange() {
  //    this.currentLaboratoryServices.fromDate = this.npCalendarService.ConvertNepToEngDate(this.fromDateNepali);
  //    this.currentLaboratoryServices.toDate = this.npCalendarService.ConvertNepToEngDate(this.toDateNepali);
  //}
  //EngCalendarOnDateChange() {
  //    this.fromDateNepali = this.npCalendarService.ConvertEngToNepDate(this.currentLaboratoryServices.fromDate);
  //    this.toDateNepali = this.npCalendarService.ConvertEngToNepDate(this.currentLaboratoryServices.toDate);
  //}
  //returnFromDate($event) {
  //    this.currentLaboratoryServices.fromDate = $event.enDate;
  //}
  //returnToDate($event) {
  //    this.currentLaboratoryServices.toDate = $event.enDate;
  //}

  public Header: string = '';

  GetHeaderParameter() {
    var customerHeaderparam = this.coreservice.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == "CustomerHeader");
    if (customerHeaderparam != null) {
      var customerHeaderParamValue = customerHeaderparam.ParameterValue;
      if (customerHeaderParamValue) {
        var headerDetail = JSON.parse(customerHeaderParamValue);

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
  
  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentLaboratoryServices.fromDate = $event.fromDate;
    this.currentLaboratoryServices.toDate = $event.toDate;

  }

}
