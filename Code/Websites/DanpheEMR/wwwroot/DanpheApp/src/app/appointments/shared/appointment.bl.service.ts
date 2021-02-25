import { Injectable, Directive } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

import { Appointment } from "../shared/appointment.model";
import { Patient } from "../../patients/shared/patient.model";

import { CallbackService } from '../../shared/callback.service';
import { AppointmentService } from '../shared/appointment.service';
import { AppointmentDLService } from './appointment.dl.service';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import * as _ from 'lodash';

@Injectable()
export class AppointmentBLService {
    public CurrentPatient: Patient = new Patient();

    constructor(public appointmentService: AppointmentService,
        public router: Router,
        public appointmentDLService: AppointmentDLService,
        public patientDLService: PatientsDLService,
        public callbackService: CallbackService) {
    }
    //get doctors list using department Id
    //createappointment.component
    public GenerateDoctorList(departmentId: number) {
        return this.appointmentDLService.GetDoctorFromDepartmentId(departmentId)
            .map(res => res);
    }

    //gets providers availablity using appointmentDate and ProviderId.
    public ShowProviderAvailability(selProviderId: number, appointmentDate: string) {
        if ((appointmentDate != "" && appointmentDate != null) && (selProviderId != 0 && selProviderId != null)) {
            return this.appointmentDLService.GetProviderAvailability(selProviderId, appointmentDate)
                .map(res => res);
        }
        else {
            alert("select correct date and/or provider.");
        }
    }

    // getting patients 
    public GetAppointmentProviderList(providerId: number, appointmentDate: string) {
        return this.appointmentDLService.GetAppointmentProviderList(providerId,appointmentDate)
            .map(res => { return res })

    }

    //gets selected patient's appointment list.
  public CheckForClashingAppointment(patientId: number, apptDate: string, providerId: number) {
    if (patientId) {
      return this.appointmentDLService.CheckForClashingAppointment(patientId, apptDate, providerId)
        .map(res => res);
    }
    else {
      return this.appointmentDLService.CheckForClashingAppointment(0, apptDate, providerId)
        .map(res => res);
    }
  }

    //gets list of all appointments with status ="new"
  public LoadAppointmentList(fromDate, toDate, providerid) {
        status = "new";
    return this.appointmentDLService.GetAppointmentList(fromDate, toDate, providerid, status)
            .map(res => res);
    }
    // getting the CountrySubDivision from dropdown
    public GetCountrySubDivision(countryId: number) {
        return this.patientDLService.GetCountrySubDivision(countryId)
            .map(res => { return res })

    }
    // getting patients 
    public GetPatients(searchTxt) {
        return this.patientDLService.GetPatients(searchTxt)
            .map(res => { return res })

    }

    // getting department list 
    public GetDepartment() {
        return this.appointmentDLService.GetDepartment()
            .map(res => { return res })

    }

    public GetPatientById(patientId: number) {
        return this.patientDLService.GetPatientById(patientId)
            .map(res => { return res })
    }
    //getting membership deatils by membershiptype id 
    public GetMembershipDeatilsByMembershipTyepId(membershipTypeId) {
        return this.appointmentDLService.GetMembershipDeatilsByMembershipTyepId(membershipTypeId)
            .map(res => { return res });

    }
    //getting total amoutn opd by doctorId
    public GetTotalAmountByProviderId(providerId) {
        return this.appointmentDLService.GetTotalAmountByProviderId(providerId)
            .map(res => { return res })

  }
  //pupdate  for  phonebook appointment
  public PutAppointment(currentAppointment) {
    var temp = _.omit(currentAppointment, ['AppointmentValidator']);
    return this.appointmentDLService.PutAppointment(temp)
      .map(res => res);

  }

    //post new appointment.
    public AddAppointment(currentAppointment: Appointment) {
        //setting the appointment status for a new appointment.
        //currentAppointment.AppointmentStatus = "Initiated";
        //currentAppointment.AppointmentType = "New";

        //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(currentAppointment, ['AppointmentValidator']);
        return this.appointmentDLService.PostAppointment(temp)
            .map(res => { return res });
    }

    //map selected appointment data to global appointment
    public InitiateVisit(_selAppointment: Appointment, _callbackRoute: string) {

        //assigning to globalAppointment from the selected appointment
        //later used to pre-fill the fields in create patient and visit page
        var appointment: Appointment = this.appointmentService.getGlobal();
        appointment.AppointmentId = _selAppointment.AppointmentId;
        appointment.AppointmentDate = _selAppointment.AppointmentDate;
        appointment.AppointmentTime = _selAppointment.AppointmentTime;
        appointment.AppointmentType = _selAppointment.AppointmentType;
        appointment.ProviderName = _selAppointment.ProviderName;
        appointment.ProviderId = _selAppointment.ProviderId;
        appointment.FirstName = _selAppointment.FirstName;
        appointment.LastName = _selAppointment.LastName;
        appointment.Gender = _selAppointment.Gender;
        appointment.PatientId = _selAppointment.PatientId;
        appointment.ContactNumber = _selAppointment.ContactNumber;

        //Ashim 07July2017 Probably not used after quick appointment is used
        if (!_selAppointment.PatientId) {
            //routes to the create patient page.
            //callback route is set from the ListAppointment Page.
            this.callbackService.CallbackRoute = _callbackRoute;
            this.router.navigate(['/Patient/RegisterPatient/BasicInfo']);
        }
        else {
            //routes to visit page
            //callback route is set from the ListAppointment Page.
            this.router.navigate([_callbackRoute]);
        }
    }

    //--quickappt-addpatient--this features/functions is not used: removed since this is not useful and has some defects..--sudarshan: 6May'16
    //for quick registration patient..mapping the appoint data with patient
    //AddPatient(CurrentAppiontment: Appointment) {
    //    this.CurrentPatient.FirstName = CurrentAppiontment.FirstName;
    //    this.CurrentPatient.LastName = CurrentAppiontment.LastName;
    //    this.CurrentPatient.Gender = CurrentAppiontment.Gender;
    //    this.CurrentPatient.DateOfBirth = CurrentAppiontment.DateOfBirth;
    //    this.CurrentPatient.CountryId = CurrentAppiontment.CountryId;
    //    this.CurrentPatient.CountrySubDivisionId = CurrentAppiontment.CountrySubDivisionId;
    //    this.CurrentPatient.PhoneNumber = CurrentAppiontment.ContactNumber;
    //    ////ommitting all validators, before sending to server.
    //    ////BUT, guarantorValidator is behaving differently so we've created this work-around to 
    //    //// assign it back to the patientobject -- needs better approach later.. --sudarshan-27feb'17
    //    //let guarValidator = this.CurrentPatient.Guarantor.GuarantorValidator;
    //    var temp = _.omit(this.CurrentPatient, ['PatientValidator',
    //        'Addresses[0].AddressValidator',
    //        'Addresses[1].AddressValidator',
    //        'Insurances[0].InsuranceValidator',
    //        'Insurances[1].InsuranceValidator',
    //        'KinEmergencyContacts[0].KinValidator',
    //        'KinEmergencyContacts[1].KinValidator',
    //        'Guarantor.GuarantorValidator']);


    //    let data = JSON.stringify(temp);
    //    //this.CurrentPatient.Guarantor.GuarantorValidator = guarValidator;
    //    return this.patientDLService.PostPatient(data)
    //        .map(res => { return res })


    //}

    // for temporary purpose, make it proper later on..
    public PostQuickAppointmentTemp(currentAppointment) {

        var temp = _.omit(currentAppointment, ['QuickAppointmentValidator', 'Patient.PatientValidator',
            'Patient.Guarantor',
            'Appointment.AppointmentValidator',
            'BillingTransaction.BillingTransactionItems[0].BillingTransactionItemValidator',
            'BillingTransaction.BillingTransactionItems[0].Patient'
        ]);

        return this.appointmentDLService.PostQuickAppointmentTemp(temp)
            .map(res => res);
    }

    public UpdateAppointmentStatus(currentAppointment: Appointment) {
        var temp = _.omit(currentAppointment, ['AppointmentValidator']);
        return this.appointmentDLService.UpdateAppointmentStatus(temp)
            .map(res => res);
    }
}
