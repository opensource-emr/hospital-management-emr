import { Injectable, Directive } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HelpDeskDLService } from './helpdesk.dl.service';
import * as _ from 'lodash';
@Injectable()
export class HelpDeskBLService {
  constructor(public router: Router, public helpdeskDLService: HelpDeskDLService) {
  }
  public LoadBedInfo() {
    let status = "new";
    return this.helpdeskDLService.GetBedinfo(status)
      .map(res => res);
  }
  public LoadEmployeeInfo() {
    let status = "new";
    return this.helpdeskDLService.GetEmployeeinfo(status)
      .map(res => res);
  }
  public LoadWardInfo() {
    let status = "new";
    return this.helpdeskDLService.GetWardinfo(status)
      .map(res => res);
  }



  LoadBedPatientInfo() {
    return this.helpdeskDLService.GetBedPatientInfo().map(res => res);
  }
  //sud:16Sep'21
  GetBedOccupancyOfWards() {
    return this.helpdeskDLService.GetBedOccupancyOfWards().map(res => res);
  }

  //sud:16Sep'21
  GetAllBedsWithPatInfo() {
    return this.helpdeskDLService.GetAllBedsWithPatInfo().map(res => res);
  }
  public GetAppointmentData(deptId:number,doctorId:number,pendingOnly:boolean){
    return this.helpdeskDLService.GetAppointmentData(deptId,doctorId,pendingOnly).map((res) =>{
      return res;
    })
  }
  public GetAllApptDepartment() {
    return this.helpdeskDLService.GetAllApptDepartment().map((res) => {
      return res;
    });
  }

  public GetAllAppointmentApplicableDoctor() {
    return this.helpdeskDLService.GetAllAppointmentApplicableDoctor().map((res) => {
      return res;
    });
  }
}
