import { Component, ChangeDetectorRef } from "@angular/core";

import { PatientService } from "../../patients/shared/patient.service"
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PHRMPatient } from "../shared/phrm-patient.model"

@Component({
    selector: "outdoor-patient-registration",
    templateUrl: "../../view/pharmacy-view/Patient/PHRMPatient.html" // "/PharmacyView/PHRMPatient"
})
export class PHRMPatientComponent {
    //Constructor of class
    constructor(
        public securityService: SecurityService,
        public patientService: PatientService,
        public pharmacyBLService: PharmacyBLService,
        public messageboxService: MessageboxService) {
        this.checkPatDetails();
    }
    //All variable declaration
    public currentPatient: PHRMPatient = new PHRMPatient();
    public matchingPatientList: Array<PHRMPatient> = new Array<PHRMPatient>();
    public loading: boolean = false;
    public loading1: boolean = false;
    public showExstingPatientList: boolean = false;
    public divDisable: boolean = false;
    //Add Patient this method check patient is already registered or not
    RegisterPatient() {
        for (var i in this.currentPatient.PHRMPatientValidator.controls) {
            this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
            this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentPatient.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.pharmacyBLService.GetExistedMatchingPatientList(this.currentPatient.FirstName, this.currentPatient.LastName,
                this.currentPatient.PhoneNumber)
                .subscribe(res => {
                    if (res.Status == "OK" && res.Results.length > 0) {
                        this.matchingPatientList = res.Results;
                        this.matchingPatientList.forEach(pat => { pat.DateOfBirth = moment(pat.DateOfBirth).format('DD-MMM-YYYY'); });
                        this.showExstingPatientList = true;
                    } else if (res.Status == "Failed") {
                        this.loading = false;
                        this.messageboxService.showMessage("error", ['There is problem, please try again']);
                    } else {
                        this.PostPatientRegistration();
                    }
                },
                err => {
                    this.loading = false;
                    this.messageboxService.showMessage("Please, Try again . Error in Getting Existed Match patient list", [err.ErrorMessage]);
                });
        }
    }

    //Register Patient-Register as Outdoor new patient
    PostPatientRegistration() {
        for (var i in this.currentPatient.PHRMPatientValidator.controls) {
            this.currentPatient.PHRMPatientValidator.controls[i].markAsDirty();
            this.currentPatient.PHRMPatientValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentPatient.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.loading1 = true;
            this.currentPatient.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.currentPatient.Age = this.currentPatient.Age + this.currentPatient.AgeUnit;
            this.pharmacyBLService.PostPatientRegister(this.currentPatient)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.messageboxService.showMessage("success", ["Patient Register Successfully"]);                        
                        this.SetPatServiceData(res.Results);
                        this.divDisable = true;
                        this.loading = false;
                        this.loading1 = false;
                        this.showExstingPatientList = false;
                    }
                    else {
                        this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + res.ErrorMessage]);
                        this.loading = false;
                        this.loading1 = false;
                    }
                },
                err => {
                    this.messageboxService.showMessage("error", ["Patient Registration failed check error.." + err.ErrorMessage]);
                    this.loading = false;
                    this.loading1 = false;
                });
        }
    }

    //calculate DOB from age and ageUnit 
    CalculateDob() {
        if (this.currentPatient.Age && this.currentPatient.AgeUnit) {
            var age: number = Number(this.currentPatient.Age);
            var ageUnit: string = this.currentPatient.AgeUnit;
            this.currentPatient.DateOfBirth = this.patientService.CalculateDOB(age, ageUnit);
        }
    }
    //This method for close Existing Patient popup
    Close() {
        this.matchingPatientList = new Array<PHRMPatient>();
        this.showExstingPatientList = false;
        this.loading = false;
        this.loading1 = false;
    }

    //check patient details of patient service
    //If patient service has selected patient then assign details and only show details to user
    //user can't register patient when patient service has patient details
    //if want to register new patient then need to null patient service details
    checkPatDetails() {
        if (this.patientService.getGlobal().PatientId) {
            this.divDisable = true;
            this.currentPatient.Address = this.patientService.globalPatient.Address;
            this.currentPatient.Age = this.patientService.globalPatient.Age;
            this.currentPatient.AgeUnit = this.patientService.globalPatient.AgeUnit;
            this.currentPatient.FirstName = this.patientService.globalPatient.FirstName;
            this.currentPatient.MiddleName = this.patientService.globalPatient.MiddleName;
            this.currentPatient.LastName = this.patientService.globalPatient.LastName;
            this.currentPatient.PhoneNumber = this.patientService.globalPatient.PhoneNumber;
            this.currentPatient.Gender = this.patientService.globalPatient.Gender;
        }
        else {
            this.divDisable = false;
        }
    }

    public SetPatServiceData(selectedPatientData) {
        if (selectedPatientData) {            
            //this.patient = this.patients.find(pat => pat.PatientId == selectedPatientData.PatientId);
            var globalPatient = this.patientService.getGlobal();
            globalPatient.PatientId = selectedPatientData.PatientId;
            globalPatient.PatientCode = selectedPatientData.PatientCode;
            globalPatient.ShortName = selectedPatientData.ShortName;
            globalPatient.DateOfBirth = selectedPatientData.DateOfBirth;
            globalPatient.Gender = selectedPatientData.Gender;
            globalPatient.IsOutdoorPat = selectedPatientData.IsOutdoorPat;
            globalPatient.PhoneNumber = selectedPatientData.PhoneNumber;
            globalPatient.FirstName = selectedPatientData.FirstName;
            globalPatient.MiddleName = selectedPatientData.MiddleName;
            globalPatient.LastName = selectedPatientData.LastName;
            globalPatient.Age = selectedPatientData.Age;
            globalPatient.AgeUnit = selectedPatientData.AgeUnit;
            globalPatient.Address = selectedPatientData.Address;
        }
    }
}