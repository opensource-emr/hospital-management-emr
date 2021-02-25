import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RPT_GOVT_LaboratoryServicesModel } from './laboratory-services.model';
import { DynamicGovernmentReport } from "../../shared/dynamic-gov-report.model"
import { DLService } from "../../../shared/dl.service"
import { HttpClient } from '@angular/common/http';
import { NepaliDate } from '../../../shared/calendar/np/nepali-dates';
import { NepaliCalendarService } from '../../../shared/calendar/np/nepali-calendar.service';
import { CoreService } from "../../../core/shared/core.service"
import * as moment from 'moment/moment';
import { KeyValue } from '@angular/common';

@Component({
  templateUrl: "./laboratory-services.html"
})
export class RPT_GOVT_LaboratoryServicesComponent {

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

  constructor(public http: HttpClient,
    public _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public coreservice: CoreService) {
    this.dlService = _dlService;
    this.LoadCalendarTypes();
    this.currentLaboratoryServices.fromDate = moment().format('YYYY-MM-DD');
    this.currentLaboratoryServices.toDate = moment().format('YYYY-MM-DD');
    //this.LoadDateByDefault();
  }

  gridExportOptions = {
    fileName: 'LaboratoryServices' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };
  Print() {
    let popupWindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWindow = window.open('', '_blank', 'width=800,heigth=600,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWindow.document.open();
    popupWindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css" /></head><style type="text/css">.Selected {border-collapse: collapse;}</style><body onload="window.print()">' + printContents + '</body></html>');
    popupWindow.document.close();
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


  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentLaboratoryServices.fromDate = $event.fromDate;
    this.currentLaboratoryServices.toDate = $event.toDate;

  }
  
}
