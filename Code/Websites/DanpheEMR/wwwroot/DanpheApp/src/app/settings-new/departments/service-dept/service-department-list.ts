
import { Component, ChangeDetectorRef } from "@angular/core";

import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../../security/shared/security.service";

@Component({
  selector: 'service-department-list',
  templateUrl: './service-department-list.html',
})
//testing 
export class ServiceDepartmentListComponent {
  public serviceDepartmentList: Array<ServiceDepartment> = new Array<ServiceDepartment>();
  public servDeptGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedServDepartment: ServiceDepartment;
  public index: number;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public securityService:SecurityService,
    public msgBoxServ: MessageboxService) {
    this.servDeptGridColumns = this.settingsServ.settingsGridCols.ServDeptList;
    this.getSrvDeptList();
  }
  public getSrvDeptList() {
    this.settingsBLService.GetServiceDepartments()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.serviceDepartmentList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  ServDeptGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedServDepartment = null;
        this.index = $event.RowIndex;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedServDepartment = $event.Data;
        this.showAddPage = true;
        break;
      }
      case "activateDeactivateServiceDept": {
        if ($event.Data != null) {
          this.selectedServDepartment = null;
          this.selectedServDepartment = $event.Data;
          this.ActivateDeactivateServiceDepartment(this.selectedServDepartment);
        }
        break;
      }
      default:
        break;
    }
  }
  AddServDepartment() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if ($event.action == "add") {
      this.serviceDepartmentList.push($event.servDepartment);
      this.serviceDepartmentList = this.serviceDepartmentList.slice();
      this.changeDetector.detectChanges();
      this.selectedServDepartment = null;
      this.index = null;
      this.getSrvDeptList();
    }
    else if ($event.action == "edit") {
      let updatedSrvDept = $event.servDepartment;
      let indx = this.serviceDepartmentList.findIndex(s => s.ServiceDepartmentId == updatedSrvDept.ServiceDepartmentId);
      if (indx > -1) {
        this.serviceDepartmentList.splice(indx, 1, updatedSrvDept);
        this.serviceDepartmentList = this.serviceDepartmentList.slice();
      }
      this.getSrvDeptList();
      this.selectedServDepartment = null;
    }else if($event.action == "close"){
      this.selectedServDepartment = null;
    }

    this.showAddPage = false;
  }
  ActivateDeactivateServiceDepartment(selectedServDepartment:ServiceDepartment){
    if (selectedServDepartment != null) {

      let proceed: boolean = true;

      if (selectedServDepartment.IsActive) {
        proceed = window.confirm("This will stop to show billing items of this service department in Billing-Search. Are you sure you want to proceed ?")
      }

      if (proceed) {
        let status = selectedServDepartment.IsActive == true ? false : true;
        selectedServDepartment.IsActive = status;
        this.settingsBLService.UpdateServiceDepartmentStatus(selectedServDepartment)
          .subscribe(
            (res: DanpheHTTPResponse) => {

              if (res.Status == "OK") {
                this.msgBoxServ.showMessage("success", ['Service Department Status updated successfully']);
                //This for send to callbackadd function
                let serviceDepartmentUpdated = { item: selectedServDepartment };
                this.CallBackStatusUpdate(serviceDepartmentUpdated);
              }
              else {
                this.msgBoxServ.showMessage("error", ['Something wrong, Please Try again..!']);
              }
            },
            err => {
              this.logError(err);
            });
      }
    }
  }

  CallBackStatusUpdate(serviceDepartmentUpdated:any){
    if(serviceDepartmentUpdated != null){
      this.getSrvDeptList();
    }

  }

  logError(err: any) {
    console.log(err);
    this.msgBoxServ.showMessage("error", [err]);
  }

}
