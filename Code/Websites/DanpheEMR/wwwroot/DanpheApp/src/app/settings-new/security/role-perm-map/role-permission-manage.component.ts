import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Role } from "../../../security/shared/role.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { Permission } from "../../../security/shared/permission.model";
import { Application } from "../../../security/shared/application.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DanpheHTTPResponse } from "../../../shared/common-models";
@Component({
  selector: 'permission-manage',
  templateUrl: "./role-permission-manage.html"
})
export class RolePermissionManageComponent {

  @Input("application-perm-list")
  public applicationList: Array<Application> = new Array<Application>();
  @Input("selectedRole")
  public selectedRole: Role;

  @Output("callback-manageRole")
  callbackManageRole: EventEmitter<Object> = new EventEmitter<Object>();

  public selectedRolePermissionList: Array<RolePermissionMap> = new Array<RolePermissionMap>();

  public selectedItem: Permission;
  public roleId: number;
  public allPermissionList: Array<Permission> = [];


  constructor(public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService) {
  }


  ngOnInit() {
    this.roleId = this.selectedRole.RoleId;
    this.GetRolePermissionList(this.roleId);
    this.LoadAllPermissionList();
  }

  LoadAllPermissionList() {
    if (this.applicationList) {
      this.applicationList.forEach(app => {
        this.allPermissionList = this.allPermissionList.concat(app.Permissions);
      });
    }
  }

  GetRolePermissionList(roleId: number) {
    this.settingsBLService.GetRolePermissionList(roleId)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.selectedRolePermissionList = res.Results;

          if (this.selectedRolePermissionList) {
            this.selectedRolePermissionList.forEach(p => {
              p.IsSelected = true;
            });
          }

          this.SetIsSelectedToApplicationPermissions();

        } else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

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
        //this.ChangeMainListSelectStatus(selectedItem.PermissionId, true);
      }
      else {
        this.msgBoxServ.showMessage("error", ["This item is already added"]);
      }
    }
  }



  public RolePermissionEventHandler(currItem) {

    if (currItem.IsSelected) {
      //this is needed for application select-all feature.
      let isPermAlreadyExist = this.selectedRolePermissionList.filter(p => p.PermissionId == currItem.PermissionId).length > 0;

      if (!isPermAlreadyExist) {
        //add item to selectedItemList or exisitingModifiedList depending on condition
        var rolePermission: RolePermissionMap = new RolePermissionMap();
        rolePermission.RoleId = this.roleId;
        rolePermission.PermissionId = currItem.PermissionId;
        rolePermission.PermissionName = currItem.PermissionName;
        rolePermission.ApplicationId = currItem.ApplicationId;
        rolePermission.IsSelected = true;
        rolePermission.IsActive = true;
        rolePermission.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        rolePermission.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        this.selectedRolePermissionList.push(rolePermission);
      }

    }
    //remove item from selectedList ofr exisitingModifiedList
    else {

      var index = this.selectedRolePermissionList.findIndex(x => x.PermissionId == currItem.PermissionId);
      this.selectedRolePermissionList.splice(index, 1);
    }
    let selApplication = this.applicationList.find(a => a.ApplicationId == currItem.ApplicationId);

    //when coming from right panel, we have to check/un-check that item from Application's Permission List as well. 
    let selAppnPermission = selApplication.Permissions.find(p => p.PermissionId == currItem.PermissionId);
    selAppnPermission.IsSelected = currItem.IsSelected;

    if (selApplication.Permissions.every(p => p.IsSelected)) {
      selApplication.IsApplicationNameSelected = true;
    }
    else {
      selApplication.IsApplicationNameSelected = false;
    }
  }
  
  //for initially selecting the items in main list existing item from the existingItemList
  SetIsSelectedToApplicationPermissions() {
    this.applicationList.forEach(app => {
      if (app.Permissions) {
        app.Permissions.forEach(perm => {
          let currPerm = this.selectedRolePermissionList.find(p => p.PermissionId == perm.PermissionId);
          if (currPerm) {
            perm.IsSelected = true;
          }
          else {
            perm.IsSelected = false;
          }
        });

        if (app.Permissions.every(p => p.IsSelected)) {
          app.IsApplicationNameSelected = true;
        }
        else {
          app.IsApplicationNameSelected = false;
        }
      }
    });
  }
  

  Submit() {
    //var addList: Array<RolePermissionMap>;
    this.settingsBLService.AddRolePermissions(this.selectedRolePermissionList, this.roleId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["Added and Updated RolePermissions"]);
          this.callbackManageRole.emit();
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to Add/Update RolePermissions. Please Check log details."], res.ErrorMessage);
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


  public OnApplicationNameSelected(changedApp: Application) {
    let currApp = this.applicationList.find(app => app.ApplicationId == changedApp.ApplicationId);

    if (currApp.IsApplicationNameSelected) {
      currApp.Permissions.forEach(perm => {
        perm.IsSelected = true;
        this.RolePermissionEventHandler(perm);
      });
    }
    else {
      currApp.Permissions.forEach(perm => {
        perm.IsSelected = false;
        this.RolePermissionEventHandler(perm);
      });

    }
  }

  public selectPermission($data){
    if($data.IsSelected == true){
      $data.IsSelected = false;
      this.RolePermissionEventHandler($data);
    }else{
      $data.IsSelected = true;
      this.RolePermissionEventHandler($data);
    }
  }
}
