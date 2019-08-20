import { Component } from '@angular/core';
import { AppointmentService } from '../shared/appointment.service';
import { AppointmentBLService } from '../shared/appointment.bl.service';
import * as moment from 'moment/moment';
import { Appointment } from '../shared/appointment.model';
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';

@Component({
    templateUrl: "./list-appointment.html"
})
export class AppointmentListComponent {
    appointments: Array<Appointment> = new Array<Appointment>();
    searchAppointment: Appointment = new Appointment();
    appointmentGridColumns: Array<any> = null;
    selectedAppointment: Appointment = new Appointment();
    showReason: boolean = false;
    reason: string = null;
    constructor(public appointmentBLService: AppointmentBLService,
        public appointmentService: AppointmentService,
        public msgBoxServ: MessageboxService, public routeFromService: RouteFromService, public router: Router, public patientService: PatientService) {
        //needs to clear previously selected appointment
        this.appointmentService.CreateNewGlobal();
        this.LoadAppointmentList();
        this.appointmentGridColumns = GridColumnSettings.AppointmentSearch;
    }
    ngAfterViewInit() {
        document.getElementById('quickFilterInput').focus();
    }

    //loads all the list of appointment
    LoadAppointmentList(): void {
        this.appointmentBLService.LoadAppointmentList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.appointments = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    //alert("Failed ! " + res.ErrorMessage);
                }
            });
    }

    Close() {
        this.showReason = false;
        this.reason = null;
    }

    AddReason() {
        if (this.reason != null && this.reason != '') {
            this.selectedAppointment.CancelledRemarks = this.reason;
            var val = window.confirm("You're about to canel an appointment, are you sure ?");
            //if user clicks on OK  then a will be true. else it'll be false. 
            if (val) {
                this.selectedAppointment.AppointmentStatus = "cancelled";
                this.appointmentBLService.UpdateAppointmentStatus(this.selectedAppointment)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.showReason = false;
                            this.LoadAppointmentList();
                            this.msgBoxServ.showMessage("notification", ['You have cancelled an appointment']);
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

                        }
                    });
            }
            else {
                this.showReason = false;
            }
        } else {
            this.msgBoxServ.showMessage("failed", ['Please write reason to cancel']);
        }
    }

    AppointmentGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            //checkin is 'add visit'--for reference
            case "checkin":
                {
                    let selAppt = $event.Data;

                    var pat = this.patientService.CreateNewGlobal();

                    var aptPat = this.appointmentService.CreateNewGlobal();

                    aptPat.AppointmentId = $event.Data.AppointmentId;
                    aptPat.PatientId = $event.Data.PatientId ? $event.Data.PatientId : 0;
                    aptPat.FirstName = $event.Data.FirstName;
                    aptPat.LastName = $event.Data.LastName;
                    aptPat.Gender = $event.Data.Gender;
                    aptPat.ContactNumber = $event.Data.ContactNumber;
                    aptPat.AppointmentDate = $event.Data.AppointmentDate;
                    aptPat.AppointmentTime = $event.Data.AppointmentTime;
                    aptPat.ProviderId = $event.Data.ProviderId;
                    aptPat.ProviderName = $event.Data.ProviderName;
                    aptPat.AppointmentStatus = $event.Data.AppointmentStatus;
                    aptPat.AppointmentType = $event.Data.AppointmentType;
                    aptPat.Reason = $event.Data.Reason;
                    aptPat.DepartmentId = $event.Data.DepartmentId;




                    if (selAppt.PatientId) {
                        pat.Appointment = $event.Data;
                        this.appointmentBLService.GetPatientById(selAppt.PatientId)
                            .subscribe(res => {
                                if (res.Status == "OK") {

                                    let retPatient: Patient = res.Results;

                                    pat.PatientId = retPatient.PatientId;
                                    pat.PatientCode = retPatient.PatientCode;
                                    pat.FirstName = retPatient.FirstName;
                                    pat.LastName = retPatient.LastName;
                                    pat.MiddleName = retPatient.MiddleName;
                                    pat.DateOfBirth = moment(retPatient.DateOfBirth).format('YYYY-MM-DD');
                                    pat.CountrySubDivisionId = retPatient.CountrySubDivisionId;
                                    pat.Gender = retPatient.Gender;
                                    pat.Email = retPatient.Email;
                                    pat.PhoneNumber = retPatient.PhoneNumber;
                                    pat.ShortName = retPatient.ShortName;
                                    pat.Salutation = retPatient.Salutation;
                                    pat.CountryId = retPatient.CountryId;
                                    pat.IsDobVerified = retPatient.IsDobVerified;
                                    pat.Age = retPatient.Age;
                                    pat.MembershipTypeId = retPatient.MembershipTypeId;
                                    pat.Address = retPatient.Address;
                                }
                                this.router.navigate(['/Appointment/Visit']);
                            }
                                ,
                                err => {
                                    this.msgBoxServ.showMessage("error", ["failed to get selected patient"]);
                                    //alert('failed to get selected patient');

                                });
                    }
                    else {

                        pat.FirstName = selAppt.FirstName;
                        pat.LastName = selAppt.LastName;
                        pat.MiddleName = selAppt.MiddleName;
                        pat.Gender = selAppt.Gender;
                        pat.PhoneNumber = selAppt.ContactNumber;

                        this.router.navigate(['/Appointment/Visit']);
                    }



                    //assign appointment props to appt service
                    this.routeFromService.RouteFrom = "appointment";

                    //this.appointmentBLService.InitiateVisit($event.Data, '/Appointment/Visit');

                }
                break;

            //case "admit":
            //    {
            //        this.appointmentBLService.InitiateVisit($event.Data, '/Appointment/CreateAdmission');
            //    }
            //    break;

            case "cancel":
                {
                    this.selectedAppointment = $event.Data;
                    this.reason = null;
                    this.showReason = true;
                }
                break;

            default:
                break;
        }
    }
}
