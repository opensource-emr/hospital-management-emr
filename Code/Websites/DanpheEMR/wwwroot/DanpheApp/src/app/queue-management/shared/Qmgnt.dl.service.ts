import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class QueueManagementDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) {
  }
  public GetAllApptDepartment() {
    return this.http.get<any>("/api/QueueManagement/GetAllApptDepartment", this.options);
  }

  public GetAllAppointmentApplicableDoctor() {
    return this.http.get<any>("/api/QueueManagement/GetAllAppointmentApplicableDoctor", this.options);
  }

  public GetAppointmentData(deptId,doctorId,pendingOnly){
    return this.http.get<any>("/api/QueueManagement/GetAppointmentData?deptId="+deptId+"&doctorId="+doctorId+"&pendingOnly="+pendingOnly, this.options);
  }

  public updateQueueStatus(data,visitId){
    return this.http.put<any>("/api/QueueManagement/updateQueueStatus?data="+data+"&visitId="+visitId,this.options);
  }

}