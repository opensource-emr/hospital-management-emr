
import { Component, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PatientService } from '../../patients/shared/patient.service';
import { AppointmentService } from '../../appointments/shared/appointment.service';
import { AppointmentBLService } from '../shared/appointment.bl.service';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { Patient } from "../../patients/shared/patient.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { APIsByType } from '../../shared/search.service';
import { CoreService } from '../../core/shared/core.service';
import { VisitService } from '../shared/visit.service';

@Component({
    templateUrl: "./search-patient.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})

export class PatientSearchComponent {

    patients: Array<Patient> = new Array<Patient>();
    searchmodel: Patient = new Patient();
    public patGirdDataApi: string = "";
    //start: for angular-grid
    AppointmentpatientGridColumns: Array<any> = null;
    //start: for angular-grid
    searchText: string = '';
    public showInpatientMessage: boolean = false;
    public enableServerSideSearch: boolean = false;
    public wardBedInfo: any = null;


    constructor(
        public _patientservice: PatientService,
        public appointmentService: AppointmentService,
        public router: Router, public appointmentBLService: AppointmentBLService,
        public msgBoxServ: MessageboxService, public coreService: CoreService, public visitService: VisitService,
    ) {
        this.getParamter();
        this.Load("");
        this._patientservice.CreateNewGlobal();
        this.appointmentService.CreateNewGlobal();
        this.AppointmentpatientGridColumns = GridColumnSettings.AppointmentPatientSearch;
        this.patGirdDataApi = APIsByType.PatientListForRegNewVisit
    }

    ngAfterViewInit() {
        // document.getElementById('quickFilterInput').focus();
        let btnObj = document.getElementById('btnNewPatient');
        if (btnObj) {
            btnObj.focus();
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
    Load(searchText): void {
        this.appointmentBLService.GetPatientsListForNewVisit(searchText)
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
    //ashim: 22Aug2018 : Removed unnecessary server call to get patient details
    SelectPatient(event, _patient) {
        let pat = this._patientservice.getGlobal();
        Object.keys(_patient).forEach(property => {
            if (property in pat) {
                pat[property] = _patient[property];
            }
        });
        pat.DateOfBirth = moment(pat.DateOfBirth).format('YYYY-MM-DD');
        //sud:6Sept'21--Pls don't remove below (appointmenttype)--it causes issue during refer/followup.
        this.visitService.appointmentType = "New";
        this.router.navigate(["/Appointment/Visit"]);
        //var pat = this._patientservice.getGlobal();
        //this.appointmentBLService.GetPatientById(_patient.PatientId)
        //    .subscribe(res =>
        //        this.CallBackSelected(res),
        //    err => {
        //        this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
        //        //alert('failed to get selected patient');

        //    });
    }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }

    AppointmentPatientGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "appoint":
                {
                    //this.wardBedInfo = { WardName: null, BedCode: null, Date: null };
                    if ($event.Data.IsAdmitted) {
                       // this.wardBedInfo = { WardName:  $event.Data.WardName, BedCode: $event.Data.BedCode, Date: null };
                        this.showInpatientMessage = true;
                    } else {
                        this.SelectPatient(null, $event.Data)
                    }
                }
                break;
            default:
                break;
        }

        // alert($event.Action);
    }
    NewPatientAppointment() {

        //sud:6Sept'21--Pls don't remove below (appointmenttype)--it causes issue during referral...
        this.visitService.appointmentType = "New";
        this.router.navigate(["/Appointment/Visit"]);
    }

    //this function is hotkeys when pressed by user
    hotkeys(event) {
        if (event.altKey) {
            switch (event.keyCode) {
                case 78: {// => ALT+N comes here
                    this.NewPatientAppointment();
                    break;
                }
                default:
                    break;
            }
        }

    }

    //

}
