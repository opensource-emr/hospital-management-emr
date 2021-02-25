
import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Employee } from "../../../employee/shared/employee.model";

import * as moment from 'moment/moment';
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";

@Component({
  selector: 'employee-list',
  templateUrl: './employee-list.html',
})
export class EmployeeListComponent {
  public employeeList: Array<Employee> = new Array<Employee>();
  public showGrid: boolean = true;
  public employeeGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: Employee;
  // public index: number;
  public selectedID: null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.employeeGridColumns = this.settingsServ.settingsGridCols.EmployeeList;
    this.getEmpList();
  }
  public getEmpList() {
    // this.employeeList = DanpheCache.GetData(MasterType.Employee,null);
    //  this.showGrid = true;
    this.settingsBLService.GetEmployeeList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.employeeList = res.Results;
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
          console.log(res.ErrorMessage)
        }

      });
  }
  EmployeeGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        // this.index = $event.RowIndex;
        this.selectedID = $event.Data.EmployeeId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddEmployee() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if ($event.action == "add") {
      this.getEmpList();
    }

    // this.getEmpList();
    this.showAddPage = false;
    this.selectedItem = null;
    // this.index = null;
    this.selectedID = null;
  }
}
