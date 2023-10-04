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
        return this.http.get<any>("/api/Master/DepartmentEmployees?departmentId=" + departmentId);
    }
    // //get provider availablity using date and providerid
    // public GetProviderAvailability(selProviderId: number, appointmentDate: string) {
    //     return this.http.get<any>("/api/Appointment?'&reqType=doctorschedule"
    //         + "&providerId=" + selProviderId
    //         + '&requestDate=' + appointmentDate);
    // }

    //get appointment list using status.
    public GetAppointmentList(fromDate, toDate, performerId, status: string) {
        return this.http.get<any>("/api/Appointment/Appointments?FromDate=" + fromDate + "&ToDate=" + toDate + "&performerId=" + performerId
            + "&status=" + status, this.options);
    }
    // getting the departmnet
    public GetDepartment() {
        return this.http.get<any>("/api/Appointment/AppointmentApplicableDepartments");
    }
    //get the appointment list using patientId
    public CheckForClashingAppointment(patientId: number, apptDate: string, performerId: number) {
        return this.http.get<any>("/api/Appointment/CheckClashingAppointment?patientId=" + patientId + '&requestDate=' + apptDate + '&performerId=' + performerId);
    }
    // getting the appointment list of given providerId
    public GetAppointmentProviderList(performerId: number, appointmentDate: string) {
        return this.http.get<any>("/api/Appointment/PatientsWithAppointments?performerId=" + performerId + '&requestDate=' + appointmentDate, this.options);
    }

    //getting membership deatils by membershiptype id
    public GetMembershipDeatilsByMembershipTyepId(membershipId) {
        return this.http.get<any>("/api/Appointment/MembershipDetail?membershipTypeId=" + membershipId);
    }

    //getting total amount opd by doctorId
    // public GetTotalAmountByProviderId(providerId) {
    //     return this.http.get<any>("/api/Appointment?&reqType=GetTotalAmountByProviderId&providerId=" + providerId);

    // }

    // update existing appointment 
    public PutAppointment(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.put<any>("/api/Appointment/UpdateAppointment", data);

    }
    //add new appointment
    public PostAppointment(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.post<any>("/api/Appointment/AddAppointment", data);
    }

    //update status of appointment using appointmentId
    public PutAppointmentStatus(appointmentId: number, status: string, performerId: number, performerName: string) {
        return this.http.put<any>("/api/Appointment/AppointmentStatus?appointmentId=" + appointmentId
            + '&status=' + status
            + "&PerformerId=" + performerId
            + "&PerformerName=" + performerName, null);
    }
    //update status of appointments---REVISION NEEDED--sudarshan-23feb--this shouldn't be called from billing.
    public PutAppointmentsStatus(appointmentIds: Array<number>, status: string) {
        //getting only the first appointmentid for now, change the controller to accept array.
        let appointmentId = appointmentIds[0];
        return this.http.put<any>("/api/Appointment/AppointmentStatus?appointmentId=" + appointmentId
            + '&status=' + status, null);
    }

    public PutAppointmentPatientId(appointmentId: number, patientId: number) {
        return this.http.put<any>("/api/Appointment/UpdatePatientInAppointment?appointmentId=" + appointmentId
            + "&patientId=" + patientId, null);
    }

    public PostQuickAppointmentTemp(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.post<any>("/api/Appointment?reqType=quickAppointment", data);
    }

    public UpdateAppointmentStatus(currentAppointment) {
        let data = JSON.stringify(currentAppointment);
        return this.http.put<any>("/api/Appointment/AppointmentInformation", data);
    }

    public getOnlineAppointmentData(url, fromDate, toDate) {
        var fullUrl = url + 'api/doctor';
        var reqHeader = new HttpHeaders({
            'Authorization': 'Bearer ' + (sessionStorage.getItem('TELEMED_Token'))
        });
        return this.http.get<any>(`${fullUrl}/getPatientListByAdmin/${fromDate}/${toDate}`, { headers: reqHeader });
    }

    public updateVisitStatusInTelemedicine(url, visitId, visitStatus) {
        var fullUrl = url + 'api/patient';
        var reqHeader = new HttpHeaders({
            'Authorization': 'Bearer ' + sessionStorage.getItem('TELEMED_Token')
        });
        return this.http.put<any>(`${fullUrl}/UpdateVisitStatus/${visitId}/${visitStatus}`, null, { headers: reqHeader });
    }

    public updatePaymentStatus(url, visitId) {
        var fullUrl = url + 'api/patient';
        var reqHeader = new HttpHeaders({
            'Authorization': 'Bearer ' + sessionStorage.getItem('TELEMED_Token')
        });
        return this.http.put<any>(`${fullUrl}/UpdatePaidStatus/${visitId}`, null, { headers: reqHeader });
    }

}
