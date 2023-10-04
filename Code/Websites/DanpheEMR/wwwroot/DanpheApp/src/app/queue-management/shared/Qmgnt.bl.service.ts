import { Injectable } from "@angular/core";
import { CoreDLService } from "../../core/shared/core.dl.service";
import { QueueManagementDLService } from "./Qmgnt.dl.service";

@Injectable()
export class QueueManagementBLService {
  constructor(public queueManagementDlService : QueueManagementDLService, public coreDlService:CoreDLService) { }

  public GetAllApptDepartment() {
    return this.queueManagementDlService.GetAllApptDepartment().map((res) => {
      return res;
    });
  }

  public GetAllAppointmentApplicableDoctor() {
    return this.queueManagementDlService.GetAllAppointmentApplicableDoctor().map((res) => {
      return res;
    });
  }

  public GetAppointmentData(deptId:number,doctorId:number,pendingOnly:boolean){
    return this.queueManagementDlService.GetAppointmentData(deptId,doctorId,pendingOnly).map((res) =>{
      return res;
    })
  }
  public updateQueueStatus(data:string, visitId:number){
    return this.queueManagementDlService.updateQueueStatus(data,visitId).map((res)=>{
      return res;
    })
  }
}
