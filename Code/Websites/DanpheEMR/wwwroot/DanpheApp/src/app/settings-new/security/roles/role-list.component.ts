
import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { Role } from "../../../security/shared/role.model";
import { Application } from "../../../security/shared/application.model";

@Component({
  selector: 'role-list',
  templateUrl: './role-list.html',
})
export class RoleListComponent {
  public roleList: Array<Role> = new Array<Role>();
  public showGrid: boolean = false;
  public showManagePermission: boolean = false;
  public roleGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public selectedItem: Role;
  //public index: number;
  public selectedID: null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef) {
    this.roleGridColumns = this.settingsServ.settingsGridCols.RoleList;
    this.getEmpList();
    this.GetAllApplicationsAndTheirPermissions();
  }

  public getEmpList() {
    this.settingsBLService.GetRoleList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.roleList = res.Results;
          this.CheckRoleType();
          this.showGrid = true;

        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  RoleGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "edit": {
        this.selectedItem = null;
        this.selectedID = $event.Data.RoleId;
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.selectedItem = $event.Data;
        this.showAddPage = true;
        break;
      }
      case "managePermission": {
        this.selectedItem = null;
        this.changeDetector.detectChanges();
        this.showManagePermission = false;
        this.selectedItem = $event.Data;
        this.showManagePermission = true;
        this.showGrid = false;
        break;
      }
      default:
        break;
    }
  }
  AddRole() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    // this.roleList.push($event.role);
    // if (this.selectedID != null) {
    //   let i = this.roleList.findIndex(a => a.RoleId == this.selectedID);

    //   this.roleList.splice(i, 1);
    // }
    // this.roleList = this.roleList.slice();

    if ($event.action == "add") {
      this.roleList.push($event.role);
    }
    else if ($event.action == "update") {
      let selrole = $event.role;
      let indx = this.roleList.findIndex(a => a.RoleId == selrole.RoleId);
      this.roleList.splice(indx, 1, selrole);
    }
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.selectedItem = null;
    this.selectedID = null;
  }

  HidePermissionManage($event) {
    this.showManagePermission = false;
    this.showGrid = true;
  }


  //start: pratik-13Dec'19--to reduce network call to get application permissions on each role manage call.
  public applicationList: Array<Application> = [];

  GetAllApplicationsAndTheirPermissions() {
    this.settingsBLService.GetApplicationList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.applicationList = res.Results;
        }

      });

  }

  //end: pratik-13Dec'19--to reduce network call to get application permissions on each role manage call.

  CheckRoleType() {
    //this.securityService.GetLoggedInUser().EmployeeId;
    this.roleList.forEach(a => {
      if (a.RoleType == 'system' && !a.IsSysAdmin) {
        this.roleList.splice(this.roleList.indexOf(a), 1);
      }
    });
  }
}
