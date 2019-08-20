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
@Component({
    templateUrl: "../../view/PatientView/SearchPatient.html" // "/PatientView/SearchPatient"
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
    public selectedReport: PatientFilesModel = new PatientFilesModel();

    public showNeighbourCard: boolean = false;
    public patGirdDataApi:string="";
    constructor(
        public _patientservice: PatientService,
        public appointmentService: AppointmentService,
        public router: Router, public patientBLService: PatientsBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef
    ) {
        
        this.Load();
        this._patientservice.CreateNewGlobal();
        this.appointmentService.CreateNewGlobal();
        this.patientGridColumns = GridColumnSettings.PatientSearch;
        this.patGirdDataApi=APIsByType.PatByName;
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

    Load(): void {
        this.patientBLService.GetPatients()
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
                    this.SelectPatient(null, $event.Data)
                    //this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
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
}