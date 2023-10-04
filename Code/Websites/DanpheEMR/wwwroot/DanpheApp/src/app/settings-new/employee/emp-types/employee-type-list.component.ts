import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { EmployeeType } from "../../../employee/shared/employee-type.model";

@Component({
  selector: 'employee-type-list',
  templateUrl: './employee-type-list.html',
})
export class EmployeeTypeListComponent {
  public employeeTypeList: Array<EmployeeType> = new Array<EmployeeType>();
  public showGrid: boolean = true;
  public employeeTypeGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: EmployeeType;
  //  public index: number;
  public selectedID: null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.employeeTypeGridColumns = this.settingsServ.settingsGridCols.EmployeeTypeList;
    this.getEmpTypeList();
  }
  public getEmpTypeList() {
    //passing null boolean value in order to get all the list with IsActive true and false --Yubraj 27th march 2019
    this.settingsBLService.GetEmployeeTypeList(null)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.employeeTypeList = res.Results;
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  EmployeeTypeGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        // this.index = $event.RowIndex;
        this.selectedID = $event.Data.EmployeeTypeId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
      }
      default:
        break;
    }
  }
  AddEmployeeType() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    this.employeeTypeList.push($event.employee);
    if (this.selectedID != null) {
      let i = this.employeeTypeList.findIndex(a => a.EmployeeTypeId == this.selectedID);
      this.employeeTypeList.splice(i, 1);
    }
    this.employeeTypeList = this.employeeTypeList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    // this.index = null;
    this.selectedID = null;
  }
}
