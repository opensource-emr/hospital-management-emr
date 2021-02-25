import { Component, Input, Output, EventEmitter } from "@angular/core";

import { User } from "../../../security/shared/user.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";
import { Role } from "../../../security/shared/role.model";
import { Application } from "../../../security/shared/application.model";

import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
  selector: 'user-role-map',
  templateUrl: "./user-role-map.html"
})
export class UserRoleMapComponent {

  public roleList: Array<Role> = new Array<Role>();

  public selectedUserRoleList: Array<UserRoleMap> = new Array<UserRoleMap>();
  public existingUserRoleList: Array<UserRoleMap> = new Array<UserRoleMap>();
  public existingModifiedUserPermissinList: Array<UserRoleMap> = new Array<UserRoleMap>();

  public selectedItem: Role;
  public userId: number;
  public showManageRole: boolean = false;

  @Input("selectedUser")
  public selectedUser: User;

  @Output("callback-manageRole")
  callbackManageUser: EventEmitter<Object> = new EventEmitter<Object>();

  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {

    this.GetRoleList();
  }

  //@Input("showManageRole")
  //public set value(val: boolean) {
  //    if (this.selectedUser && val) {
  //        this.userId = this.selectedUser.UserId;
  //        this.GetUserRoleList(this.userId);
  //    }
  //    else
  //        this.showManageRole = val;
  //}

  ngOnInit() {
    if (this.selectedUser) {
      this.userId = this.selectedUser.UserId;
      this.GetUserRoleList(this.userId);
    }
    else
      this.showManageRole = false;
  }

  GetRoleList() {
    this.settingsBLService.GetRoleList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.roleList = res.Results;
          this.CheckRoleType();
        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get role list.. please check log for details.'], err.ErrorMessage);
        });
  }
  GetUserRoleList(userId: number) {
    this.settingsBLService.GetUserRoleList(userId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.existingUserRoleList = res.Results;
          this.SelectExistingFromList();
          this.showManageRole = true;

        } else
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      },
        err => {
          this.msgBoxServ.showMessage("error", ['Failed to get application list.. please check log for details.'], err.ErrorMessage);
        });
  }

  /// for search box and calling the SelectImaging function
  SelectRoleSearchBox(selectedItem: Role) {
    if (typeof selectedItem === "object" && !Array.isArray(selectedItem) && selectedItem !== null) {
      //check if the item already exisit on the selected list.
      for (let sel of this.selectedUserRoleList) {
        if (sel.RoleId == selectedItem.RoleId) {
          var check = true;
          break;
        }
      }
      if (!check) {
        selectedItem.IsSelected = true;
        this.UserRoleEventHandler(selectedItem);
        this.ChangeMainListSelectStatus(selectedItem.RoleId, true);
      }
      else {
        this.msgBoxServ.showMessage("error", ["This item is already added"]);
      }
    }
    this.selectedItem = null;
  }
  public UserRoleEventHandler(currItem) {

    if (currItem.IsSelected) {
      //add item to selectedItemList or exisitingModifiedList depending on condition
      var userRole: UserRoleMap = new UserRoleMap();
      var IsExisting: boolean = false;
      for (let existingItem of this.existingUserRoleList) {
        if (existingItem.RoleId == currItem.RoleId) {
          userRole = existingItem;
          IsExisting = true;
          break;
        }
      }
      if (IsExisting) {
        //add item to exisitingModifiedList
        this.ModifyExistingUserRole(userRole, true);
      }
      else {
        //add item to selectedList
        userRole.UserId = this.userId;
        userRole.RoleId = currItem.RoleId;
        userRole.IsSelected = true;
        userRole.IsActive = true;
        userRole.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        userRole.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        for (let per of this.roleList)
          if (per.RoleId == userRole.RoleId) {
            userRole.RoleName = per.RoleName;
            break;
          }
      }
      //either modified or newly added item should be displayed on the selected list
      this.selectedUserRoleList.push(userRole);
    }
    //remove item from selectedList ofr exisitingModifiedList
    else {
      //for existing item add to exisitingModifiedList for update
      for (let userP of this.existingUserRoleList) {
        if (userP.RoleId == currItem.RoleId)
          this.ModifyExistingUserRole(userP, false);
      }
      //remove from selectedList
      var index = this.selectedUserRoleList.findIndex(x => x.RoleId == currItem.RoleId);
      this.selectedUserRoleList.splice(index, 1);
      this.ChangeMainListSelectStatus(currItem.RoleId, false);
    }
  }
  //change the IsActive Status of already exisiting item based on condition
  ModifyExistingUserRole(userRole: UserRoleMap, activeStatus: boolean) {
    userRole.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
    userRole.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    userRole.IsActive = activeStatus;
    userRole.IsSelected = activeStatus;
    var index = this.existingModifiedUserPermissinList.findIndex(x => x.RoleId == userRole.RoleId);
    if (index >= 0)
      this.existingModifiedUserPermissinList.splice(index, 1);
    else
      this.existingModifiedUserPermissinList.push(userRole);
  }
  //for initially selecting the items in main list existing item from the existingItemList
  SelectExistingFromList() {
    this.existingUserRoleList.forEach(ex => {
      if (ex.IsActive) {
        ex.IsSelected = ex.IsActive;
        this.selectedUserRoleList.push(ex);
        this.ChangeMainListSelectStatus(ex.RoleId, true)
      }
    });
  }
  ChangeMainListSelectStatus(roleId: number, val: boolean) {
    for (let role of this.roleList) {
      if (role.RoleId == roleId) {
        role.IsSelected = val;
        break;
      }
    }
  }

  Submit() {
    var addList: Array<UserRoleMap>;
    addList = this.selectedUserRoleList.filter(sel => (!sel.UserRoleMapId));
    if (addList.length || this.existingModifiedUserPermissinList.length) {
      if (addList.length) {
        this.settingsBLService.AddUserRoles(addList)
          .subscribe(res => {
            if (res.Status == 'OK') {
              if (this.existingModifiedUserPermissinList.length) {
                this.Update();
                this.msgBoxServ.showMessage("success", ["Added and Updated UserRoles"]);
              }
              else {
                this.callbackManageUser.emit();
                this.msgBoxServ.showMessage("success", ["Added UserRoles"]);
              }
            }
            else {
              this.msgBoxServ.showMessage("error", ["Failed to Add New UserRoles.Check log for error message."]);
              this.logError(res.ErrorMessage);
            }
          });
      }
      else if (this.existingModifiedUserPermissinList.length) {
        this.Update();
        this.msgBoxServ.showMessage("success", ["Updated UserRoles"]);
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ["Add or Remove Roles before submit."]);
    }

  }
  Update() {
    this.settingsBLService.UpdateUserRoles(this.existingModifiedUserPermissinList)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.callbackManageUser.emit();
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to Update Existing UserRoles.Check log for error message."]);
          this.logError(res.ErrorMessage);
        }
      });
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["RoleName"];
    return html;
  }
  logError(err: any) {
    console.log(err);
  }

  CheckRoleType() {
    //this.securityService.GetLoggedInUser().EmployeeId;
    this.roleList.forEach(a => {
      if (a.RoleType == 'system' && !a.IsSysAdmin) {
        this.roleList.splice(this.roleList.indexOf(a), 1);
      }
    });
  }

  selectRole($data){
    if($data.IsSelected == true){
      $data.IsSelected = false;
      this.UserRoleEventHandler($data);
    }else{
      $data.IsSelected = true;
      this.UserRoleEventHandler($data);      
    }
  }
}
