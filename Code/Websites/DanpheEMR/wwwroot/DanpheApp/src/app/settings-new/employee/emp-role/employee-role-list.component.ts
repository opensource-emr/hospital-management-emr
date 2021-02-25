import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { EmployeeRole } from "../../../employee/shared/employee-role.model";


@Component({
    selector: 'employee-role-list',
    templateUrl: './employee-role-list.html',
})
export class EmployeeRoleListComponent {
    public employeeRoleList: Array<EmployeeRole> = new Array<EmployeeRole>();
    public showGrid: boolean = false;
    public employeeRoleGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedItem: EmployeeRole;
 //   public index: number;
  public selectedID: null;

    constructor(public settingsBLService: SettingsBLService,
        public settingsServ: SettingsService,
        public changeDetector: ChangeDetectorRef) {
        this.employeeRoleGridColumns = this.settingsServ.settingsGridCols.EmployeeRoleList;
        this.getEmpRoleList();
    }
    public getEmpRoleList() {
        this.settingsBLService.GetEmployeeRoleList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.employeeRoleList = res.Results;
                    this.showGrid = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }
    EmployeeRoleGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
               // this.index = $event.RowIndex;
                this.selectedID = $event.Data.EmployeeRoleId;
                this.showAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.showAddPage = true;
            }
            default:
                break;
        }
    }
    AddEmployeeRole() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.employeeRoleList.push($event.employee);
        if (this.selectedID != null) {
            let i = this.employeeRoleList.findIndex(a => a.EmployeeRoleId == this.selectedID);
            this.employeeRoleList.splice(i, 1);
        }
        this.employeeRoleList = this.employeeRoleList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedItem = null;
        //  this.index = null;
        this.selectedID = null;

    }
}
