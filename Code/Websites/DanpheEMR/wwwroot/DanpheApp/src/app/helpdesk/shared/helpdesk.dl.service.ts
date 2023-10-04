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
  public GetBedinfo() {
    return this.http.get<any>("/api/Helpdesk/BedsInfo", this.options);
  }
  //get Employeeinfo using status.
  public GetEmployeeinfo() {
    return this.http.get<any>("/api/Helpdesk/EmployeesInfo", this.options);
  }
  //get Wardinfo using status.
  public GetWardinfo() {
    return this.http.get<any>("/api/Helpdesk/WardsInfo", this.options);
  }



  GetBedPatientInfo() {
    return this.http.get<any>('/api/Helpdesk/BedPatientInfos_Old', this.options);
  }

  //sud:16Sept'21---Needed new function to get ward occupancies 
  GetBedOccupancyOfWards() {
    return this.http.get<any>('/api/Helpdesk/BedOccupancyOfWards', this.options);
  }

  //sud:16Sept'21---Needed new function to get all beds with their patient information(if occupied)
  GetAllBedsWithPatInfo() {
    return this.http.get<any>('/api/Helpdesk/BedsWithPatientsInfo', this.options);
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
