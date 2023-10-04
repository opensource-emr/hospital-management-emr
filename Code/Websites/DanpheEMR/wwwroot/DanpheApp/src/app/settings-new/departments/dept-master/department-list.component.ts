
import { Component, ChangeDetectorRef } from "@angular/core";

import { Department } from '../../shared/department.model';
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
//testing
@Component({
  selector: 'department-list',
  templateUrl: './department-list.html',
})
export class DepartmentListComponent {
  public departmentList: Array<Department> = new Array<Department>();
  public showDepartmentList: boolean = true;
  public deptGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedDepartment: Department;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.deptGridColumns = this.settingsServ.settingsGridCols.DeptList;
    this.getDepartmentList();
  }
  public getDepartmentList() {
    this.settingsBLService.GetDepartments()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.departmentList = res.Results;
          this.departmentList.forEach(dept => {
            //needs review to get parent department name
            this.departmentList.forEach(parDept => {
              if (dept.ParentDepartmentId == parDept.DepartmentId)
                dept.ParentDepartmentName = parDept.DepartmentName;
            });
          });
          this.showDepartmentList = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  DeptGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedDepartment = null;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedDepartment = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddDepartment() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {

    if ($event.action == "add") {
      this.departmentList.push($event.department);
    }
    else if ($event.action == "update") {
      let selDept = $event.department;
      let indx = this.departmentList.findIndex(a => a.DepartmentId == selDept.DepartmentId);
      this.departmentList.splice(indx, 1, selDept);
    }

    this.departmentList = this.departmentList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedDepartment = null;
  }


}
