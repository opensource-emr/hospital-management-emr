import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { Employee } from "../../../employee/shared/employee.model";
import { Role } from "../../../security/shared/role.model";
import { Application } from "../../../security/shared/application.model";
import { Route } from "../../../security/shared/route.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
  selector: "role-add",
  templateUrl: "./role-add.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }

})
export class RoleAddComponent {

  public CurrentRole: Role = new Role();

  @Input("application-perm-list")
  public appList: Array<Application> = new Array<Application>();

  @Input("selectedItem")
  public selectedItem: Role;

  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

  public update: boolean = false;
  public showAddPage: boolean = false;
  //public appList: Array<Application> = new Array<Application>();
  public routeList: Array<Route> = new Array<Route>();
  @Input("roleList")
  public roleList: Array<Role> = new Array<Role>();

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
    // this.GetAppList();
    this.GetRouteList();
    this.GoToNextInput("RoleNameid");
  }

  //@Input("showAddPage")
  //public set value(val: boolean) {
  //  this.showAddPage = val;
  //  if (this.selectedItem) {
  //    this.update = true;
  //    this.CurrentRole = new Role();
  //    this.CurrentRole = Object.assign(this.CurrentRole, this.selectedItem);
  //    this.CurrentRole.ModifiedBy = this.securityService.GetLoggedInUser().UserId;
  //    this.CurrentRole.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
  //  }
  //  else {
  //    this.CurrentRole = new Role();
  //    this.CurrentRole.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //    this.CurrentRole.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
  //    this.update = false;
  //  }
  //}

  ngOnInit() {
    if (this.selectedItem) {
      this.update = true;
      this.CurrentRole = new Role();
      this.CurrentRole = Object.assign(this.CurrentRole, this.selectedItem);
      this.CurrentRole.ModifiedBy = this.securityService.GetLoggedInUser().UserId;
      this.CurrentRole.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    }
    else {
      this.CurrentRole = new Role();
      this.CurrentRole.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentRole.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.update = false;
    }

  }
  setautofocus() {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("RoleName");
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 900);
  }

  //public GetAppList() {
  //  this.settingsBLService.GetApplicationList()
  //    .subscribe(res => {
  //      if (res.Status == 'OK') {
  //        if (res.Results.length) {
  //          this.appList = res.Results;

  //        }
  //        else {
  //          this.msgBoxServ.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
  //        }
  //      }
  //    },
  //      err => {
  //        this.msgBoxServ.showMessage("error", ['Failed to get EmpRoleList ' + err.ErrorMessage]);
  //      });
  //}
  public GetRouteList() {
    this.settingsBLService.GetRouteList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            //show only parent level routes for now.
            //later change it so that we can redirect to inner routes.
            let allRoutes: Array<Route> = res.Results;

            if (allRoutes != null && allRoutes.length > 0) {
              this.routeList = allRoutes.filter(r => !r.ParentRouteId);
              ///unshift adds a new element to the start of the page.
              CommonFunctions.SortArrayOfObjects(this.routeList, "DisplayName");//this sorts the routeList by DisplayName.
              this.routeList.unshift({
                RouteId: null, DefaultShow: false, ParentRouteId: null, UrlFullPath: null, DisplayName: "--NONE--",
                PermissionId: null, RouterLink: null
              });

            }

          }

          else {
            this.msgBoxServ.showMessage("failed", ['Failed to get Employee List ' + res.ErrorMessage]);
          }
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get Employee RouteList ' + err.ErrorMessage]);
        });
  }

  Add() {
    for (var i in this.CurrentRole.RoleValidator.controls) {
      this.CurrentRole.RoleValidator.controls[i].markAsDirty();
      this.CurrentRole.RoleValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentRole.IsValidCheck(undefined, undefined) && !this.CheckRoleName()) {
      this.settingsBLService.AddRole(this.CurrentRole)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Role Added.']);
              this.CallBackAddUpdate(res);


            }
            else {
              this.msgBoxServ.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ['Some Error Occured ' + err.ErrorMessage]);
          });
    }
  }

  Update() {
    for (var i in this.CurrentRole.RoleValidator.controls) {
      this.CurrentRole.RoleValidator.controls[i].markAsDirty();
      this.CurrentRole.RoleValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentRole.IsValidCheck(undefined, undefined) && !this.CheckRoleName()) {
      this.settingsBLService.UpdateRole(this.CurrentRole)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", ['Role Details Updated. ']);
              this.CallBackAddUpdate(res);
            }
            else {
              this.msgBoxServ.showMessage("failed", ['Something Wrong ' + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ['Some Error occured ' + err.ErrorMessage]);

          });
    }
  }
  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      this.CurrentRole = new Role();
      var role: any = {};
      role.RoleId = res.Results.RoleId;
      role.RoleName = res.Results.RoleName;
      role.RoleDescription = res.Results.RoleDescription;
      role.ApplicationId = res.Results.ApplicationId;
      role.RolePriority = res.Results.RolePriority;
      role.DefaultRouteId = res.Results.DefaultRouteId;
      role.CreatedOn = res.Results.CreatedOn;
      role.CreatedBy = res.Results.CreatedBy;
      role.RoleType = res.Results.RoleType;
      for (let app of this.appList) {
        if (app.ApplicationId == res.Results.ApplicationId) {
          role.ApplicationName = app.ApplicationName;
          break;
        }
      };
      for (let route of this.routeList) {
        if (route.RouteId == res.Results.DefaultRouteId) {
          role.DisplayName = route.DisplayName;
        }
      };

      if (this.update) {
        this.callbackAdd.emit({ action: "update",  role: role });
      }
      else {//this is when new department is added.
        this.roleList.push(res.Results);
        this.callbackAdd.emit({ action: "add",  role: role });
      }

      this.callbackAdd.emit({ role: role });
    }
    else {
      this.msgBoxServ.showMessage("error", ['Some Error occured ' + res.ErrorMessage]);

    }
  }

  Close() {
    this.update = false;
    //this.showAddPage = false;
    this.callbackAdd.emit({ role: this.selectedItem });
  }

  CheckRoleName() {
    var matched = this.roleList.filter(role => (role.RoleName == this.CurrentRole.RoleName));
    if (matched.length) {
      if (this.update)
        if (this.CurrentRole.RoleName == this.selectedItem.RoleName)
          return false;
      this.msgBoxServ.showMessage("failed", ['RoleName already exists']);
      return true;
    }
  }
  GoToNextInput(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  KeysPressed(event) {
    if (event.keyCode == 27) { // For ESCAPE_KEY =>close pop up
      this.Close();
    }
  }
}

