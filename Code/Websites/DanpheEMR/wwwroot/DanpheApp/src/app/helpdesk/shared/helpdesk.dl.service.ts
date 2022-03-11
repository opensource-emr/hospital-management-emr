import { Injectable, Directive } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
@Injectable()
export class HelpDeskDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) { }

  //get Bedinfo using status.
  public GetBedinfo(status: string) {
    return this.http.get<any>("/api/Helpdesk?&reqType=getBedinfo"
      + "&status=" + status, this.options);
  }
  //get Employeeinfo using status.
  public GetEmployeeinfo(status: string) {
    return this.http.get<any>("/api/Helpdesk?&reqType=getHelpdesk"
      + "&status=" + status, this.options);
  }
  //get Wardinfo using status.
  public GetWardinfo(status: string) {
    return this.http.get<any>("/api/Helpdesk?&reqType=getWardinfo"
      + "&status=" + status, this.options);
  }



  GetBedPatientInfo() {
    return this.http.get<any>('/api/Helpdesk?&reqType=getBedPatientInfo', this.options);
  }

  //sud:16Sept'21---Needed new function to get ward occupancies 
  GetBedOccupancyOfWards() {
    return this.http.get<any>('/api/Helpdesk?&reqType=get-bedoccupancy-of-wards', this.options);
  }

  //sud:16Sept'21---Needed new function to get all beds with their patient information(if occupied)
  GetAllBedsWithPatInfo() {
    return this.http.get<any>('/api/Helpdesk?&reqType=get-allbeds-with-patientsinfo', this.options);
  }

  public GetAppointmentData(deptId,doctorId,pendingOnly){
    return this.http.get<any>("/api/QueueManagement/GetAppointmentData?deptId="+deptId+"&doctorId="+doctorId+"&pendingOnly="+pendingOnly, this.options);
  }
  public GetAllApptDepartment() {
    return this.http.get<any>("/api/QueueManagement/GetAllApptDepartment", this.options);
  }

  public GetAllAppointmentApplicableDoctor() {
    return this.http.get<any>("/api/QueueManagement/GetAllAppointmentApplicableDoctor", this.options);
  }
}
