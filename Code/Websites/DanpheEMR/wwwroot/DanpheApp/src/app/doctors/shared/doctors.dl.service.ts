import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders} from '@angular/common/http';

@Injectable()
export class DoctorsDLService {

public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {
    }

    GetTodaysVisits() {
        return this.http.get<any>("/api/Doctors?status=initiated&reqType=providertodaysvisit", this.options);
    }

    GetTodaysVisitsList(today: string){
        return this.http.get<any>("/api/Doctors?reqType=providertodaysvisit&toDate=" + today, this.options);
    }
    GetPastVisits(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/Doctors?reqType=providerpastvisits&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
    }
    GetDepartMent(employeeid : number){
        return this.http.get<any>("/api/Doctors?reqType=departmentByEmployeeId&employeeId=" + employeeid, this.options);
    }
    GetVisitType(){
        return this.http.get<any>("/api/Doctors?reqType=patientVisitType", this.options);
    }
    GetDocDeptVisits(fromDate: string, toDate: string) {
        return this.http.get<any>("/api/Doctors?reqType=providerDeptVisits&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
    }
    
    GetPatientPreview(patientId: number, patientVisitId: number) {
        return this.http.get<any>("/api/Doctors?reqType=patientOverview&patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
    }

    GetPatientOtherRequests(patientId: number, patientVisitId: number){
        return this.http.get<any>("/api/Doctors?reqType=otherRequestsOfPatient&patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
    }
    //re-assign provider id for given patient visit.
    SetReassignedProvider(data) {
        return this.http.put<any>("/api/Doctors?reqType=reassignProvider", data, this.options);
    }
    ChangeProvider(data){
        return this.http.put<any>("/api/Doctors?reqType=changeProvider", data, this.options);
    }
    ConcludeVisit(data){
        return this.http.post<any>("/api/Doctors?reqType=concludeVisit", data, this.options);
    }
}
