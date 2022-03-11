import { Component, Injectable, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';

import { PatientService } from '../../patients/shared/patient.service';
import { AppointmentService } from '../../appointments/shared/appointment.service';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { Patient } from "../../patients/shared/patient.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { APIsByType } from '../../shared/search.service';
import { CoreService } from '../../core/shared/core.service';
import { SSU_BLService } from '../shared/ssu.bl.service';
import { SSU_InformationModel } from '../shared/SSU_Information.model';

@Component({
  templateUrl: "./ssu-patient-list.html"
})

export class SSU_PatientListComponent {
  // binding logic

  public selectedExistingPatToEdit: any;
  patients: Array<Patient> = new Array<Patient>();
  patientsGridDataFiltered : Array<Patient> = new Array<Patient>();
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

  public showNeighbourCard: boolean = false;
  public patGirdDataApi: string = "";
  searchText: string = ' ';
  public enableServerSideSearch: boolean = false;
  public PatToEdit: Patient = new Patient();
  public EditSSUPatMode: boolean = false;
  public showAddPatientBox: boolean = false;
  public ssuPatientStatusFilter: string = "all";
  constructor(
    public _patientservice: PatientService,
    public appointmentService: AppointmentService,
    public router: Router, public ssuBLService: SSU_BLService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.hospitalHealthCard = this.coreService.GetHospitalNameForeHealthCard();
    this.getParamter();
    this.Load(" ");
    this._patientservice.CreateNewGlobal();
    this.appointmentService.CreateNewGlobal();
    this.patientGridColumns = GridColumnSettings.SSU_PatientSearch;
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
    // this.ssuBLService.GetPatients(searchTxt)
    this.ssuBLService.GetSsuPatients(searchTxt)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patients = res.Results;
          this.LoadPatientsListByStatus();
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

  LoadPatientsListByStatus() {
    switch (this.ssuPatientStatusFilter) {
      case "all": {
        this.patientsGridDataFiltered = this.patients;
        break;
      }
      case "active": {
        this.patientsGridDataFiltered = this.patients.filter(p => p.IsActive == true);
        break;
      }
      case "inactive": {
        this.patientsGridDataFiltered = this.patients.filter(p => p.IsActive == false);
        break;
      }
      default: {
        this.patientsGridDataFiltered = this.patients
      }
    }
  }

  SelectPatient(event, _patient) {
    var pat = this._patientservice.getGlobal();
    this.ssuBLService.GetPatientById(_patient.PatientId)
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

    switch ($event.Action) {
      case "edit":
        {
          this.EditSSUPatMode = true;
          this.PatToEdit = $event.Data;
          this.showAddPatientBox = true;
          // this.SelectPatient(null, $event.Data)
          //this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
        break;
        }
        case "activateDeactivatePatient": {
          this.PatToEdit = $event.Data;
            if(this.PatToEdit.IsActive){
              this.PatToEdit.IsActive = false;
            }
            else if(!this.PatToEdit.IsActive){
              this.PatToEdit.IsActive = true;
            }
          this.PutActivateDeactivateSsuPatient();
          break;
          }

      default:
        break;
    }
  }

  public PutActivateDeactivateSsuPatient() {
    this.ssuBLService.PutActivateDeactivateSsuPatient(this.PatToEdit)
      .subscribe(
        (res: any) => {
          if (res.Status == "OK" && res.Results) {
            if(res.Results.IsActive){
              this.msgBoxServ.showMessage("Success", ['SSU patient Activated!']);
            }
            else{
              this.msgBoxServ.showMessage("Success", ['SSU patient Deactivated!']);
            }
            this.Load("");
            this.PatToEdit = new Patient();
          }

        },
        err => {
          this.msgBoxServ.showMessage("Please, Try again . Error while Activating/Deactivating SSU patient", [err.ErrorMessage]);
        });
  }

  HidePatientHistory() {
    this.showPatientHistory = false;
    this.showPatientList = true;
  }
  HideUploadFile() {
    this.uploadFilesShow = false;
    this.showPatientList = true;
  }

  ShowNewPatientPopup() {
    this.PatToEdit = new Patient();
    this.showAddPatientBox = true;
  }

  CloseAddPatientPopup() {
    this.showAddPatientBox = false;
  }

  SsuCallBack(data) {
    this.EditSSUPatMode = false;
    this.showAddPatientBox = false;
    if (data == "Ok") {
      this.Load('');
    }
  }

  patientListFormatter(data: any): string {
    let html = "";

    if (data["SSU_InfoId"]) {
      html = "<b>(SSU) </b> ";
    }

    html += data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'];
    return html;
  }

  SearchPatientsByKey(keyword: any) {
    return "/api/SocialServiceUnit/get-all-patients-for-ssu?searchText=:dd";
  }
  public EditExistingPatientInfo() {

    if (this.selectedExistingPatToEdit) {
      this.PatToEdit = new Patient();
      this.PatToEdit = this.selectedExistingPatToEdit;
      if (this.PatToEdit && !(this.PatToEdit.SSU_Information)) {
        this.PatToEdit.SSU_Information = new SSU_InformationModel();
      }
      this.showAddPatientBox = true;
    }

  }

}
