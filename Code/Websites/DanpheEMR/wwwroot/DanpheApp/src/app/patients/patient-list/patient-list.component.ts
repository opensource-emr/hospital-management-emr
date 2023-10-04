import { Component, Injectable, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';

import { PatientService } from '../shared/patient.service';
import { AppointmentService } from '../../appointments/shared/appointment.service';
import { PatientsBLService } from '../shared/patients.bl.service';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { Patient } from "../shared/patient.model";
import { Guarantor } from "../shared/guarantor.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientFilesModel } from '../shared/patient-files.model';
import { APIsByType } from '../../shared/search.service';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../../app/security/shared/security.service';
@Component({
  templateUrl: "./patient-list.html"
})

export class PatientListComponent {
  // binding logic

  public selectedPatient: Patient = new Patient();
  patients: Array<Patient> = new Array<Patient>();
  searchmodel: Patient = new Patient();
  public patientId: number = 0;
  public isShowUploadMode: boolean = false;
  public isShowListMode: boolean = false;
  //start: for angular-grid
  patientGridColumns: Array<any> = null;
  //start: for angular-grid

  public showPatientHistory: boolean = false;
  public showPatientList: boolean = true;
  public displayHealthcard: boolean = false;
  public uploadFilesShow: boolean = false;
  public hospitalHealthCard: string = "default";
  public selectedReport: PatientFilesModel = new PatientFilesModel();
  public showNeighbourCard: boolean = false;
  public patGirdDataApi: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  public showPatientSticker: boolean;
  constructor(
    public _patientservice: PatientService,
    public appointmentService: AppointmentService,
    public router: Router, public patientBLService: PatientsBLService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService
  ) {
    this.hospitalHealthCard = this.coreService.GetHospitalNameForeHealthCard();
    this.getParamter();
    this.Load("");
    this._patientservice.CreateNewGlobal();
    this.appointmentService.CreateNewGlobal();
    var colSettings = new GridColumnSettings(this.securityService);
    this.patientGridColumns = colSettings.PatientSearch;
    this.patGirdDataApi = APIsByType.PatByName;
    //this.TestCode();
  }
  //public TestCode() {
  //    this.msgBoxServ.showMessage("success", ["Welcome to messagebox service of Danphe.!"])
  //}
  //Test() {
  //    this.msgBoxServ.showMessage("success", ["Message box"])
  //}

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.Load(this.searchText);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["PatientSearchPatient"];
  }
  Load(searchTxt): void {
    this.patientBLService.GetPatientsList(searchTxt)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patients = res.Results;
        }
        else {
          //alert(res.ErrorMessage);
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

        }
      },
        err => {
          //alert('failed to get  patients');
          this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

        });
  }

  SelectPatient(event, _patient) {
    var pat = this._patientservice.getGlobal();
    this.patientBLService.GetPatientById(_patient.PatientId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          //patient Service has Common SetPatient method For Setting Pattient Deatils 
          //this common method is for Code reusability 
          this._patientservice.setGlobal(res.Results);
          //go to route if all the value are mapped with the patient service
          this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },

        err => {
          this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
        });
  }


  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }

  PatientGridActions($event: GridEmitModel) {
    if (document.getElementById("patientListGridHolder") && document.getElementById("patientListGridHolder").getElementsByClassName('ag-center-cols-container')) {
      let htNeeded = document.getElementById("patientListGridHolder").getElementsByClassName('ag-center-cols-container')[0].getElementsByClassName("ag-row").length * 35;
      let htmlClassArr = Array.from(document.getElementById("patientListGridHolder").getElementsByClassName('ag-center-cols-container') as HTMLCollectionOf<HTMLElement>);
      if (document.getElementById("patientListGridHolder").getElementsByClassName("open dropdown") && document.getElementById("patientListGridHolder").getElementsByClassName("open dropdown").length) {
        htmlClassArr[0].style.height = (htNeeded + 160 + 'px');
      } else {
        htmlClassArr[0].style.height = (htNeeded + 'px');
      }
    }

    switch ($event.Action) {
      case "appoint":
        {
          var data = $event.Data;
          var appointment = this.appointmentService.getGlobal();
          //mapping to prefill in Appointment Form
          appointment.PatientId = data.PatientId;
          appointment.FirstName = data.FirstName;
          appointment.LastName = data.LastName;
          appointment.ContactNumber = data.PhoneNumber;
          appointment.Gender = data.Gender;
          this.router.navigate(["/Appointment/CreateAppointment"]);
        }
        break;
      case "edit":
        {

          let param = this.coreService.Parameters.find(a => a.ParameterGroupName == "Patient" && a.ParameterName == "PatientEditRestrictAfterHrs");
          //above gives us number of hours after which patient edit is not allowed.
          //if Zero or null then allow to edit.
          //else if Patient created within given hours then allow to edit.
          //else Don't Allow to EDIT.
          if (param && param.ParameterValue && parseInt(param.ParameterValue)) {
            let restrictionAfterHours = parseInt(param.ParameterValue);
            let currDate = moment();
            //we compare patient's createdon datetime with current datetime.
            let hoursPassedAfterPatCreation = moment(currDate).diff(moment($event.Data.CreatedOn), 'hours');
            if (hoursPassedAfterPatCreation <= restrictionAfterHours) {
              this.SelectPatient(null, $event.Data);
            }
            else {
              this.msgBoxServ.showMessage("warning", ["Patient edit is not allowed after " + restrictionAfterHours + "Hours of registration"]);
            }
          } else {
            this.SelectPatient(null, $event.Data);
          }

        }
        break;
      case "showHistory":
        {
          this.selectedPatient = null;
          this.showPatientHistory = false;
          this.changeDetector.detectChanges();
          this.selectedPatient = $event.Data;
          this.showPatientList = false;
          this.showPatientHistory = true;
          break;
        }
      case "uploadfiles":
        {
          var data = $event.Data;
          //this.showUploadFiles = false;
          this.uploadFilesShow = false;
          this.selectedReport = new PatientFilesModel();
          this.changeDetector.detectChanges();
          this.selectedPatient = $event.Data;
          this.selectedReport.PatientId = this.selectedPatient.PatientId;
          this.showPatientList = false;
          this.showPatientHistory = false;
          this.isShowUploadMode = true;
          this.isShowListMode = true;
          this.patientId = this.selectedPatient.PatientId;
          this.uploadFilesShow = true;
        }
        break;
      case "showHealthCard":
        {
          this.displayHealthcard = false;
          this.changeDetector.detectChanges();
          this.selectedPatient = $event.Data;
          this.showNeighbourCard = false;
          this.displayHealthcard = true;
        }
        break;
      case "showNeighbourCard":
        {
          this.showNeighbourCard = false;
          this.changeDetector.detectChanges();
          this.selectedPatient = $event.Data;
          this.displayHealthcard = false;
          this.showNeighbourCard = true;
        }
        break;
      case "showPatientSticker":
        {
          this.showPatientSticker = false;
          this.changeDetector.detectChanges();
          this.selectedPatient = $event.Data.PatientId;
          this.displayHealthcard = false;
          this.showNeighbourCard = false;
          this.showPatientSticker = true;
        }  

      default:
        break;
    }
  }
  HidePatientHistory() {
    this.showPatientHistory = false;
    this.showPatientList = true;
  }
  HideUploadFile() {
    this.uploadFilesShow = false;
    this.showPatientList = true;
  }


  closePopup() {
    //this.showUploadFiles = false;
    this.showPatientList = true;
  }
  closeUploadFiles() {
    this.uploadFilesShow = false;
  }
  ClosePrintStickerPopup(){
    this.showPatientSticker = false;
  }
  AfterStickerPrint(event){
    if(event.showOpdSticker){
      this.showPatientSticker = false;
    }
  }
}
