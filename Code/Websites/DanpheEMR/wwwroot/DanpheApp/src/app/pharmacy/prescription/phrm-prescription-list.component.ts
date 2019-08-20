
import { Component, Injectable, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PharmacyBLService } from "../shared/pharmacy.bl.service"

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PHRMPrescription } from "../shared/phrm-prescription.model";
import { PHRMPrescriptionItem } from "../shared/phrm-prescription-item.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PharmacyService } from "../shared/pharmacy.service";
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import { RouteFromService } from "../../shared/routefrom.service";

@Component({
    templateUrl: "../../view/pharmacy-view/Prescription/PHRMPrescriptionList.html" // "/PharmacyView/PHRMPrescriptionList"
})

export class PHRMPrescriptionListComponent {

    //It save prescriptionid with prescription itmes details for local data access
    public prescriptionListData = new Array<{ PrescriptionId: number, PrescriptionItems: Array<PHRMPrescriptionItem> }>();
    patient: Patient = new Patient();
    public prescriptionGridColumns: Array<any> = null;
    public showPreItemsPopup: boolean = false;
    constructor(
        public pharmacyService: PharmacyService,
        public patientService: PatientService,
        public routeFromService: RouteFromService,
        public router: Router,
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef
    ) {
        this.LoadPrescriptions();
        this.prescriptionGridColumns = PHRMGridColumns.PHRMPrescriptionList;
    }
    //Load prescription list
    LoadPrescriptions(): void {
        try {
            this.pharmacyBLService.GetPrescriptionList()
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.prescriptionListData = res.Results;
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

                });
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }
    //Grid actions fires this method
    PrescriptionGridActions($event: GridEmitModel) {
        try {
            switch ($event.Action) {
                case "dispatch": {
                    this.pharmacyService.PatientId = $event.Data.PatientId;
                    this.pharmacyService.ProviderId = $event.Data.ProviderId;
                    //get patient details by pat id and set to patient service for sale use
                    this.pharmacyBLService.GetPatientByPatId(this.pharmacyService.PatientId)
                        .subscribe(res => {
                            if (res.Status == 'OK') {
                                this.CallBackAfterPatGet(res.Results);
                            }
                            else {
                                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ["failed to get  patients"]);

                        });
                                                                            
                }
                    break;
                default:
                    break;
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    ////Method to get patient details by Patient Id for set value to patient service
    public CallBackAfterPatGet(results) {
        try {           
            this.SetPatServiceData(results);
            this.routeFromService.RouteFrom = "prescription";
            this.router.navigate(['/Pharmacy/Sale/New']);  
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    //Method for assign value to patient service
    public SetPatServiceData(selectedPatientData) {
        try {
            if (selectedPatientData) {
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
                globalPatient.Address = selectedPatientData.Address;
            }
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
     
    }
    //This function only for show catch messages
    ShowCatchErrMessage(exception) {
        try {
            if (exception) {
                let ex: Error = exception;
                console.log("Error Messsage =>  " + ex.message);
                console.log("Stack Details =>   " + ex.stack);
            }
        } catch (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }

}