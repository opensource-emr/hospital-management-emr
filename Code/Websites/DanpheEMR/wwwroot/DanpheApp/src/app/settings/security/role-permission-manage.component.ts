import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Role } from "../../security/shared/role.model";
import { RolePermissionMap } from "../../security/shared/role-permission-map.model";
import { Permission } from "../../security/shared/permission.model";
import { Application } from "../../security/shared/application.model";

import { SettingsBLService } from '../shared/settings.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    selector: 'permission-manage',
    templateUrl: "./role-permission-manage.html"
})
export class RolePermissionManageComponent {

    public applicationList: Array<Application> = new Array<Application>();
    public permissionList: Array<Permission> = new Array<Permission>();

    public selectedRolePermissionList: Array<RolePermissionMap> = new Array<RolePermissionMap>();
    public existingRolePermissionList: Array<RolePermissionMap> = new Array<RolePermissionMap>();
    public existingModifiedRolePermissinList: Array<RolePermissionMap> = new Array<RolePermissionMap>();

    public selectedItem: Permission;
    public roleId: number;

    @Input("selectedRole")
    public selectedRole: Role;
    public showManagePermission: boolean = false;
    @Output("callback-manageRole")
    callbackManageRole: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {

        this.GetApplicationPermissionList();
        this.GetPermissionList();
    }

    @Input("showManagePermission")
    public set value(val: boolean) {
        if (this.selectedRole && val) {
            this.roleId = this.selectedRole.RoleId;
            this.GetRolePermissionList(this.roleId);
        }
        else
            this.showManagePermission = val;
    }

    GetApplicationPermissionList() {
        this.settingsBLService.GetApplicationList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.applicationList = res.Results;
                    this.applicationList.forEach(a => {
                        a.Permissions.sort(function (a, b) {
                            if (a.PermissionName < b.PermissionName) return -1;
                            if (a.PermissionName > b.PermissionName) return 1;
                            return 0;
                        });
                    });
                    this.SelectExistingFromList();
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get application list.. please check log for details.'], err.ErrorMessage);
            });
    }
    GetPermissionList() {
        this.settingsBLService.GetPermissionList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.permissionList = res.Results;
                } else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get permission list.. please check log for details.'], err.ErrorMessage);
            });
    }
    GetRolePermissionList(roleId: number) {
        this.settingsBLService.GetRolePermissionList(roleId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.existingRolePermissionList = res.Results;
                    this.SelectExistingFromList();
                    this.showManagePermission = true;

                } else
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            },
            err => {
                this.msgBoxServ.showMessage("error", ['Failed to get application list.. please check log for details.'], err.ErrorMessage);
            });
    }

    /// for search box and calling the SelectImaging function
    SelectPermissionSearchBox(selectedItem: Permission) {
        if (typeof selectedItem === "object" && !Array.isArray(selectedItem) && selectedItem !== null) {
            //check if the item already exisit on the selected list.
            for (let sel of this.selectedRolePermissionList) {
                if (sel.PermissionId == selectedItem.PermissionId) {
                    var check = true;
                    break;
                }   
            }
            if (!check) {
                selectedItem.IsSelected = true;
                this.RolePermissionEventHandler(selectedItem);
                this.ChangeMainListSelectStatus(selectedItem.PermissionId, true);
            }
            else {
                this.msgBoxServ.showMessage("error", ["This item is already added"]);
            }
        }
    }
    public RolePermissionEventHandler(currItem) {
       
        if (currItem.IsSelected) {
            //add item to selectedItemList or exisitingModifiedList depending on condition
            var rolePermission: RolePermissionMap = new RolePermissionMap();
            var IsExisting: boolean = false;
            for (let existingItem of this.existingRolePermissionList) {
                if (existingItem.PermissionId == currItem.PermissionId) {
                    rolePermission = existingItem;
                    IsExisting = true;
                    break;
                }
            }

            //check current item is in permission list or not
            var tempRolePermissionList = this.selectedRolePermissionList.find(a => a.PermissionId == currItem.PermissionId);
            if (tempRolePermissionList == undefined) {
                if (IsExisting) {
                    //add item to exisitingModifiedList
                    this.ModifyExistingRolePermission(rolePermission, true);
                }
                else {
                    //add item to selectedList
                    rolePermission.RoleId = this.roleId;
                    rolePermission.PermissionId = currItem.PermissionId;
                    rolePermission.IsSelected = true;
                    rolePermission.IsActive = true;
                    rolePermission.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    rolePermission.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
                    for (let per of this.permissionList)
                        if (per.PermissionId == rolePermission.PermissionId) {
                            rolePermission.PermissionName = per.PermissionName;
                            break;
                        }
                }
                //either modified or newly added item should be displayed on the selected list
                this.selectedRolePermissionList.push(rolePermission);
                this.ChangeApplicationNameSelectStatus();
            }
        }
        //remove item from selectedList ofr exisitingModifiedList
        else {
            //for existing item add to exisitingModifiedList for update
            for (let roleP of this.existingRolePermissionList) {
                if (roleP.PermissionId == currItem.PermissionId)
                    this.ModifyExistingRolePermission(roleP, false);
            }
            //remove from selectedList
            var index = this.selectedRolePermissionList.findIndex(x => x.PermissionId == currItem.PermissionId);
            this.selectedRolePermissionList.splice(index, 1);
            this.ChangeMainListSelectStatus(currItem.PermissionId, false);
        }
    }
    //change the IsActive Status of already exisiting item based on condition
    ModifyExistingRolePermission(rolePermission: RolePermissionMap, activeStatus: boolean) {
        rolePermission.ModifiedBy = this.securityService.GetLoggedInUser().UserId;
        rolePermission.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        rolePermission.IsActive = activeStatus;
        rolePermission.IsSelected = activeStatus;
        var index = this.existingModifiedRolePermissinList.findIndex(x => x.PermissionId == rolePermission.PermissionId);
        if (index >= 0)
            this.existingModifiedRolePermissinList.splice(index, 1);
        else
            this.existingModifiedRolePermissinList.push(rolePermission);
    }
    //for initially selecting the items in main list existing item from the existingItemList
    SelectExistingFromList() {
        this.existingRolePermissionList.forEach(ex => {
            if (ex.IsActive) {
                ex.IsSelected = ex.IsActive;
                this.selectedRolePermissionList.push(ex);
                this.ChangeMainListSelectStatus(ex.PermissionId, true)
            }
        });
    }
    ChangeMainListSelectStatus(permissionId: number, val: boolean) {
        for (let app of this.applicationList) {
            for (let per of app.Permissions) {
                if (per.PermissionId == permissionId) {
                    per.IsSelected = val;
                    break;
                }
            }
        }
        this.ChangeApplicationNameSelectStatus();
    }
    ChangeApplicationNameSelectStatus() {
        //if all permission are checked/unchecked for single application then select/deselect application name
        this.applicationList.forEach(a => {
            var flag = true;
            a.Permissions.forEach(b => {
                this.selectedRolePermissionList.forEach(c => {
                    if (b.PermissionId == c.PermissionId) {
                        if(!c.IsSelected)
                            flag = false;
                    }
                });
            });
            if (flag) {
                a.IsApplicationNameSelected = true;
            }
        });
    }

    Submit() {
        var addList: Array<RolePermissionMap>;
        addList = this.selectedRolePermissionList.filter(sel => (!sel.RolePermissionMapId));
        if (addList.length || this.existingModifiedRolePermissinList.length) {
            if (addList.length) {
                this.settingsBLService.AddRolePermissions(addList)
                    .subscribe(res => {
                        if (res.Status == 'OK') {
                            if (this.existingModifiedRolePermissinList.length) {
                                this.Update();
                                this.msgBoxServ.showMessage("success", ["Added and Updated RolePermissions"]);
                            }
                            else {
                                this.callbackManageRole.emit();
                                this.msgBoxServ.showMessage("success", ["Added RolePermissions"]);
                            }
                        }
                        else {
                            this.msgBoxServ.showMessage("error",["Failed to Add New RolePermissions.Check log for error message."]);
                            this.logError(res.ErrorMessage);
                        }
                    });
            }
            else if (this.existingModifiedRolePermissinList.length) {
                this.Update();
                this.msgBoxServ.showMessage("success", ["Updated RolePermissions"]);
            }
        }
        else {
            this.msgBoxServ.showMessage("error", ["Add or Remove Permissions before submit."]);
        }

    }
    Update() {
        this.settingsBLService.UpdateRolePermissions(this.existingModifiedRolePermissinList)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.callbackManageRole.emit();
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to Update Existing RolePermissions.Check log for error message."]);
                    this.logError(res.ErrorMessage);
                }
            });
    }
    //used to format display item in ng-autocomplete
    myListFormatter(data: any): string {
        let html = data["PermissionName"];
        return html;
    }
    logError(err: any) {
        console.log(err);
    }


    public OnApplicationNameSelected(currentApp) {

        //add all permission of a selected application
        this.applicationList.forEach(a => {
            var rolePermission: RolePermissionMap = new RolePermissionMap();
            if (currentApp == a) {
                a.Permissions.forEach(b => {
                    if (currentApp.IsApplicationNameSelected) {
                        b.IsSelected = true;
                    } else {
                        b.IsSelected = false;
                    }
                    this.RolePermissionEventHandler(b);
                });
            }
        });
    }
}
