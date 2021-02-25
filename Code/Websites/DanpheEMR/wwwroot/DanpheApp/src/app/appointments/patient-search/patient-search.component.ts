
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

@Component({
    templateUrl: "./search-patient.html"
})

export class PatientSearchComponent {
    // binding logic

    public selectedpatient: Patient = new Patient();
    patients: Array<Patient> = new Array<Patient>();
    searchmodel: Patient = new Patient();
    public patGirdDataApi:string="";
    //start: for angular-grid
    AppointmentpatientGridColumns: Array<any> = null;
    //start: for angular-grid
    searchText:string='';
    public showInpatientMessage: boolean = false;
    public enableServerSideSearch:boolean=false;
    public wardBedInfo: string = null;
    constructor(
        public _patientservice: PatientService,
        public appointmentService: AppointmentService,
        public router: Router, public appointmentBLService: AppointmentBLService,
        public msgBoxServ: MessageboxService,public coreService:CoreService
    ) {
        this.getParamter();
        this.Load("");
        this._patientservice.CreateNewGlobal();
        this.appointmentService.CreateNewGlobal();
        this.AppointmentpatientGridColumns = GridColumnSettings.AppointmentPatientSearch;
        this.patGirdDataApi=APIsByType.PatByName

    }

    ngAfterViewInit() {
        document.getElementById('quickFilterInput').focus();
    }

    serverSearchTxt(searchTxt) {
        this.searchText = searchTxt;
        this.Load(this.searchText);
    }
    getParamter(){
        let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
        var data= JSON.parse(parameterData);
        this.enableServerSideSearch = data["PatientSearchPatient"];
      }
    Load(searchText): void {
        this.appointmentBLService.GetPatients(searchText)
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

    //CallBackSelected(res) {
    //    if (res.Status == 'OK') {

    //        var pat = this._patientservice.getGlobal();


    //        pat.PatientId = res.Results.PatientId;
    //        pat.PatientCode = res.Results.PatientCode;
    //        pat.FirstName = res.Results.FirstName;
    //        pat.LastName = res.Results.LastName;
    //        pat.MiddleName = res.Results.MiddleName;
    //        pat.DateOfBirth = moment(res.Results.DateOfBirth).format('YYYY-MM-DD');
    //        pat.CountrySubDivisionId = res.Results.CountrySubDivisionId;
    //        pat.Gender = res.Results.Gender;
    //        pat.Email = res.Results.Email;
    //        pat.PhoneNumber = res.Results.PhoneNumber;
    //        pat.ShortName = res.Results.ShortName;

    //        pat.Salutation = res.Results.Salutation;
    //        pat.CountryId = res.Results.CountryId;
    //        pat.IsDobVerified = res.Results.IsDobVerified;
    //        pat.Age = res.Results.Age;
    //        pat.MembershipTypeId = res.Results.MembershipTypeId;
    //        pat.Address = res.Results.Address;
    //        pat.CountrySubDivision = res.Results.CountrySubDivision;
    //        this.router.navigate(["/Appointment/Visit"]);
    //    }
    //}

    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }

    AppointmentPatientGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "appoint":
                {
                    if($event.Data.IsAdmitted){
                        this.wardBedInfo = $event.Data.WardBedInfo;
                        this.showInpatientMessage = true;
                    }else{
                        this.SelectPatient(null, $event.Data)
                    }
                    
                }
                break;
            //case "edit":
            //    {
            //        this.SelectPatient(null, $event.Data)
            //        //this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
            //    }
            //    break;
            default:
                break;
        }

        // alert($event.Action);
    }
    NewPatientAppointment() {
        this.router.navigate(["/Appointment/Visit"]);
    }
}
