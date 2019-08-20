import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { PatientService } from '../../patients/shared/patient.service';
import { AdmissionBLService } from '../shared/admission.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { Patient } from "../../patients/shared/patient.model";

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { ADTGridColumnSettings } from '../shared/adt-grid-column-settings';
import { APIsByType } from '../../shared/search.service';


@Component({
    templateUrl: "../../view/admission-view/AdmissionSearchPatient.html" //"/AdmissionView/AdmissionSearchPatient"
})

export class AdmissionSearchPatient {
    public patients: Array<Patient> = new Array<Patient>();
    public showmsgbox: boolean = false;
    public status: string = null;
    public message: string = null;
    public showProvisionalWarning: boolean = false;
    patientGridColumns: Array<any> = null;
    public patGirdDataApi:string="";
    public adtGriColumns: ADTGridColumnSettings = null;//sud: 10Jan'19-- to use parameterized grid-columns, we created separate class for ADT-Grid-Columns.


    constructor(
        public _patientservice: PatientService,
        public router: Router,
        public admissionBLService: AdmissionBLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService, public changeDetRef:ChangeDetectorRef ) {
        this.patGirdDataApi=APIsByType.PatByName
        this.Load();
        this.adtGriColumns = new ADTGridColumnSettings(this.coreService);
        this.patientGridColumns = this.adtGriColumns.AdmissionSearchPatient;
    }

    ngAfterViewChecked()
    {
    this.changeDetRef.detectChanges();
    }

    Load(): void {
        this.admissionBLService.GetPatients()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.patients = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                });
    }
    AdmissionGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "admit": {
                var data = $event.Data;
                this.AdmitPatient(data);
            }
                break;
            default:
                break;
        }
    }
    public AdmitPatient(data) {
        if (data) {
            //ramavtar: 06Nov'18 IsPatientAdmittedScenario is already covered, 
            //calling here api for checking if any provisional amt is pending on patient or not
            //this.admissionBLService.CheckPatProvisionalInfo(data.PatientId)
            //    .subscribe(res => {
            //        if (res.Status == "OK") {
            //            //this.msgBoxServ.showMessage("failed", ['<h4><b>Please clear provisional items before proceeding for admission.</b></h4>']);
            //            this.showProvisionalWarning = true;
            //            return;
            //        }
            //        else {
                        var globalPatient = this._patientservice.getGlobal();
                        globalPatient.PatientId = data.PatientId;
                        globalPatient.PatientCode = data.PatientCode;
                        globalPatient.PhoneNumber = data.PhoneNumber;
                        globalPatient.ShortName = data.ShortName;
                        globalPatient.DateOfBirth = data.DateOfBirth;
                        globalPatient.Gender = data.Gender;
                        this.router.navigate(["/ADTMain/CreateAdmission"]);
                //    }
                //},
                //err => {
                //    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                //    return true;
                //});
        }
    }

    public CloseWarningPopUp() {
        this.showProvisionalWarning = false;
    }
}