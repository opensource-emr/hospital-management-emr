
import { Component, ChangeDetectorRef } from "@angular/core";

import { ServiceDepartment } from '../../shared/service-department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';

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
    public changeDetector: ChangeDetectorRef) {
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


}
