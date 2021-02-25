
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
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { CoreService } from '../../core/shared/core.service';

@Component({
    templateUrl: "./phrm-patient-list.html"
})

export class PHRMPatientListComponent {
    patients: Array<Patient> = new Array<Patient>();
    patient: Patient = new Patient();
    public currentCounterId: number = null;
    public currentCounterName: string = null;
    patientGridColumns: Array<any> = null;
    public ShowDepositAdd: boolean = false;
    public selectedPatientData: Patient = new Patient();
    public patGirdDataApi: string = "";
    searchText: string = '';
    public enableServerSideSearch: boolean = false;
    constructor(
        public router: Router,
        public patientService: PatientService,
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public callBackService: CallbackService,
        public routeFromService: RouteFromService,
        public messageboxService: MessageboxService, public coreService: CoreService
    ) {
        try {

            this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
            this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

            if (this.currentCounterId < 1) {
                this.callBackService.CallbackRoute = '/Pharmacy/Patient/List'
                this.router.navigate(['/Pharmacy/ActivateCounter']);
            }
            else {
                this.getParamter();
                this.Load("");
                this.patientGridColumns = PHRMGridColumns.PHRMPatientList;
                this.patGirdDataApi = APIsByType.PatByName;
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
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
    //Load patients
    Load(searchTxt): void {
        this.pharmacyBLService.GetPatients(searchTxt)
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
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.routeFromService.RouteFrom = null;
            this.messageboxService.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
        }
    }
}
