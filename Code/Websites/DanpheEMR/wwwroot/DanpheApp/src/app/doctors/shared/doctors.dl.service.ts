import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';

@Injectable()
export class DoctorsDLService {

public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }

    GetTodaysVisits() {
        let status='initiated'
        return this.http.get<any>("/api/Doctors/TodaysVisits?status=" +status, this.options);
    }

    GetTodaysVisitsList(today: string){
        return this.http.get<any>("/api/Doctors/TodaysVisits?toDate=" + today, this.options);
    }
    GetPastVisits(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/Doctors/PastVisits?fromDate=" + fromDate + "&toDate=" + toDate, this.options);
    }
    GetDepartMent(employeeid : number){
        return this.http.get<any>("/api/Doctors/EmployeeDepartment?employeeId=" + employeeid, this.options);
    }
    GetVisitType(){
        return this.http.get<any>("/api/Doctors/PatientVisitTypes", this.options);
    }
    GetDocDeptVisits(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/Doctors/DepartmentVisits?fromDate=" + fromDate + "&toDate=" + toDate, this.options);
    }
    
    GetPatientPreview(patientId: number, patientVisitId: number) {
        return this.http.get<any>("/api/Doctors/PatientOverview?patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
    }

    GetPatientOtherRequests(patientId: number, patientVisitId: number){
        return this.http.get<any>("/api/Doctors/OtherRequestsOfPatient?patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
    }
    //re-assign provider id for given patient visit.
    SetReassignedProvider(data) {
        return this.http.put<any>("/api/Doctors/ReassignProvider", data, this.options);
    }
    ChangeProvider(data){
        return this.http.put<any>("/api/Doctors/ChangeProvider", data, this.options);
    }
    ConcludeVisit(data){
        return this.http.post<any>("/api/Doctors/ConcludeVisit", data, this.options);
    }
}
