import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router'
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service"
import { RPT_ADT_DiagnosisWisePatientReportModel } from '../../reporting/adt/diagnosis/diagnosis-wise-patient-report.model';
import { DLService } from '../../shared/dl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ReportingService } from '../../reporting/shared/reporting-service';
import * as moment from 'moment/moment';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { RPT_GOVT_LaboratoryServicesModel } from '../../reporting/government/lab-services/laboratory-services.model';
import { CoreService } from '../../core/shared/core.service';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { HttpClient } from '@angular/common/http';
import { DynamicGovernmentReport } from '../../reporting/shared/dynamic-gov-report.model';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';

@Component({
  templateUrl: "./mr-labservices-report.html"
})
export class LabServicesReportComponent {

  public fromDateNepali: NepaliDate = null;
  public toDateNepali: NepaliDate = null;
  public displayReport: boolean = false;
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

  constructor(public http: HttpClient,
    public _dlService: DLService, public router: Router,
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

      if (CheckIsValid) {
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

      this.HaematologyTable0 = JSON.parse(res.Results.HaematologyModel0);
      this.HaematologyTable1 = JSON.parse(res.Results.HaematologyModel1);
      this.ImmunologyTable0 = JSON.parse(res.Results.ImmunologyModel0);
      this.ImmunologyTable1 = JSON.parse(res.Results.ImmunologyModel1);
      this.BiochemistryTable0 = JSON.parse(res.Results.BiochemistryModel0);
      this.BiochemistryTable1 = JSON.parse(res.Results.BiochemistryModel1);
      this.BacteriologyTable0 = JSON.parse(res.Results.BacteriologyModel0);
      this.CytologyTable0 = JSON.parse(res.Results.CytologyModel0);
      this.VirologyTable0 = JSON.parse(res.Results.VirologyModel0);
      this.ImmunohistochemistryTable0 = JSON.parse(res.Results.ImmunohistochemistryModel0);
      this.HistologyTable0 = JSON.parse(res.Results.HistologyModel0);
      this.ParasitologyTable0 = JSON.parse(res.Results.ParasitologyModel0);
      this.CardiacenzymesTable0 = JSON.parse(res.Results.CardiacenzymesModel0);
      this.HormonesendocrinologyTable0 = JSON.parse(res.Results.HormonesendocrinologyModel0);
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

  Back() {
    this.router.navigate(['Medical-records/ReportList']);
  }
}
