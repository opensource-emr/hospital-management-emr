
import { Component, Injectable, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';

import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PatientService } from "../../patients/shared/patient.service"
//import { PatientService } from '../../patients/shared/patient.service';

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { Patient } from "../../patients/shared/patient.model";
import { Guarantor } from "../../patients/shared/guarantor.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { APIsByType } from '../../shared/search.service';

@Component({
    templateUrl: "../../view/pharmacy-view/Patient/PHRMPatientList.html" // "/PharmacyView/PHRMPatientList"
})

export class PHRMPatientListComponent {
    patients: Array<Patient> = new Array<Patient>();
    patient: Patient = new Patient();
    patientGridColumns: Array<any> = null;
    public ShowDepositAdd: boolean = false;
    public selectedPatientData: Patient = new Patient();
    public patGirdDataApi:string="";
    constructor(
        public router: Router,
        public patientService: PatientService,
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef
    ) {
        this.Load();
        this.patientGridColumns = PHRMGridColumns.PHRMPatientList;
        this.patGirdDataApi=APIsByType.PatByName;
    }
    //Load patients
    Load(): void {
        this.pharmacyBLService.GetPatients()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.patients = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

            });
    }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }
    //Grid actions fires this method
    PatientGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "newPrescription": {
                var selectedPatientData = $event.Data;
                this.SetPatServiceData(selectedPatientData);
                this.router.navigate(["/Pharmacy/Prescription/New"]);
            }
                break;
            case "sale": {
                var selectedPatientData = $event.Data;
                this.SetPatServiceData(selectedPatientData);
                this.router.navigate(["/Pharmacy/Sale/New"]);
            }
                break;
            case "deposit": {
                this.selectedPatientData = $event.Data;
                this.ShowDepositAdd = true;
            }
                break;
            default:
                break;
        }
    }

    //Method for assign value to patient service
    public SetPatServiceData(selectedPatientData) {
        if (selectedPatientData) {
            this.patient = this.patients.find(pat => pat.PatientId == selectedPatientData.PatientId);
            var globalPatient = this.patientService.getGlobal();
            globalPatient.PatientId = selectedPatientData.PatientId;
            globalPatient.PatientCode = selectedPatientData.PatientCode;
            globalPatient.ShortName = selectedPatientData.ShortName;
            globalPatient.DateOfBirth = selectedPatientData.DateOfBirth;
            globalPatient.Gender = selectedPatientData.Gender;
            globalPatient.IsOutdoorPat = selectedPatientData.IsOutdoorPat;
            globalPatient.PhoneNumber = selectedPatientData.PhoneNumber;
            globalPatient.FirstName = this.patient.FirstName;
            globalPatient.MiddleName = this.patient.MiddleName;
            globalPatient.LastName = this.patient.LastName;
            globalPatient.Age = this.patient.Age;
            //globalPatient.AgeUnit = this.patient.AgeUnit;
            globalPatient.Address = this.patient.Address;
        }
    }
    //Method for navigate to New outdoor patient registration page
    public RegisterNewPatient() {
        this.router.navigate(["/Pharmacy/Patient/New"]);
    }   
    DepositAdd() {
        this.ShowDepositAdd = false;
    }
}