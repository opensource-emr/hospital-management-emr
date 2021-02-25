import { Injectable, Directive } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http'
import { Appointment } from "../shared/appointment.model";
@Injectable()
export class AppointmentDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) { }

    //get request from employees table using department id
    public GetDoctorFromDepartmentId(departmentId: number) {
        return this.http.get<any>("/api/Master?type=departmentemployee&reqType=appointment&inputValue=" + departmentId);
    }
    //get provider availablity using date and providerid
    public GetProviderAvailability(selProviderId: number, appointmentDate: string) {
        return this.http.get<any>("/api/Appointment?'&reqType=doctorschedule"
            + "&providerId=" + selProviderId
            + '&requestDate=' + appointmentDate);
    }

    //get appointment list using status.
  public GetAppointmentList(fromDate, toDate, providerid, status: string) {
    return this.http.get<any>("/api/Appointment?&reqType=getAppointments&FromDate=" + fromDate + "&ToDate=" + toDate + "&providerid=" + providerid
      + "&status=" + status, this.options);
    }
    // getting the departmnet
    public GetDepartment() {
        return this.http.get<any>("/api/Appointment?reqType=department");
    }
    //get the appointment list using patientId
  public CheckForClashingAppointment(patientId: number, apptDate: string, providerId: number) {
    return this.http.get<any>("/api/Appointment?&reqType=checkForClashingAppointment"
      + '&patientId=' + patientId + '&requestDate=' + apptDate + '&providerId=' + providerId);
  }
    // getting the appointment list of given providerId
    public GetAppointmentProviderList(providerId: number, appointmentDate: string) {
        return this.http.get<any>("/api/Appointment?reqType=get-appointment-list&providerId=" + providerId + '&requestDate=' + appointmentDate, this.options);
    }
    
    //getting membership deatils by membershiptype id
    public GetMembershipDeatilsByMembershipTyepId(membershipId) {
        return this.http.get<any>("/api/Appointment?&reqType=GetMembershipDeatils&membershipTypeId=" + membershipId);
    }

    //getting total amount opd by doctorId
    public GetTotalAmountByProviderId(providerId) {
        return this.http.get<any>("/api/Appointment?&reqType=GetTotalAmountByProviderId&providerId=" + providerId);

  }

  // update existing appointment 
  public PutAppointment(currentAppointment) {
    let data = JSON.stringify(currentAppointment);
     return this.http.put<any>("/api/Appointment?&reqType=PutAppointment",data);

  }
    //add new appointment
    public PostAppointment(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.post<any>("/api/Appointment", data);
    }

    //update status of appointment using appointmentId
    public PutAppointmentStatus(appointmentId: number, status: string, providerId:number, providerName:string) {
        return this.http.put<any>("/api/Appointment?&reqType=updateAppStatus"
            + "&appointmentId=" + appointmentId
            + '&status=' + status
            + "&ProviderId=" +providerId
            +"&ProviderName="+ providerName, null);
    }
    //update status of appointments---REVISION NEEDED--sudarshan-23feb--this shouldn't be called from billing.
    public PutAppointmentsStatus(appointmentIds: Array<number>, status: string) {
        //getting only the first appointmentid for now, change the controller to accept array.
        let appointmentId = appointmentIds[0];
        return this.http.put<any>("/api/Appointment?&reqType=updateAppStatus"
            + "&appointmentId=" + appointmentId
            + '&status=' + status, null);
    }

    public PutAppointmentPatientId(appointmentId: number, patientId: number) {
        return this.http.put<any>("/api/Appointment?reqType=updatePatientId"
            + "&appointmentId=" + appointmentId
            + "&patientId=" + patientId, null);
    }

    public PostQuickAppointmentTemp(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.post<any>("/api/Appointment?reqType=quickAppointment", data);
    }

    public UpdateAppointmentStatus(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.put<any>("/api/Appointment?reqType=updateAppointmentStatus", data);
    }

}
