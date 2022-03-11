
import { Component, ChangeDetectorRef } from "@angular/core";
import { SettingsBLService } from '../../shared/settings.bl.service';

import { SettingsService } from '../../shared/settings-service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { User } from "../../../security/shared/user.model";

import * as moment from 'moment/moment';
@Component({
  selector: 'user-list',
  templateUrl: './user-list.html',
})
export class UserListComponent {
  public userList: Array<User> = new Array<User>();
  public showGrid: boolean = false;
  public userGridColumns: Array<any> = null;
  public showManageRole: boolean = false;
  public selectedItem: User = null;
  public showAddPage: boolean = false;


  public selectedActivateDeactivate: User = null;
  public index: number;

  public showResetPassPage: boolean = false;
  public selectedResetPassItem: User = null;

  constructor(public settingsBLService: SettingsBLService,
    public settingsServ: SettingsService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
    this.userGridColumns = this.settingsServ.settingsGridCols.UserList;
    this.selectedItem = new User();
    this.selectedResetPassItem = new User();
    this.selectedActivateDeactivate = new User();
    this.getUserList();
  }
  public getUserList() {
    this.settingsBLService.GetUserList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.userList = res.Results;
          this.showGrid = true;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  UserGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "activateDeactivateUser": {
        if ($event.Data != null) {
          this.selectedActivateDeactivate = null;
          this.selectedActivateDeactivate = $event.Data;
          this.ActivateDeactivateUserStatus(this.selectedActivateDeactivate);
          this.showGrid = true;
          this.selectedItem = null;
        }
        break;

      }
      case "resetPassword": {
        this.selectedResetPassItem = null;
        this.index = $event.RowIndex;
        this.showResetPassPage = false;
        this.changeDetector.detectChanges();
        $event.Data.Password = "";
        this.selectedResetPassItem = $event.Data;
        this.showResetPassPage = true;

        break;
      }
      case "manageRole": {
        this.selectedItem = null;
        this.changeDetector.detectChanges();
        this.showManageRole = false;
        this.selectedItem = $event.Data;
        this.showManageRole = true;
        this.showGrid = false;

        break;
      }
      default:
        break;
    }
  }
  AddUser() {
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    if($event.user){
      this.userList.push($event.user);
    }
    // if (this.index != null){
    //   this.userList.splice(this.index, 1);
    // }
    this.userList=this.userList.slice();
    this.changeDetector.detectChanges();
    this.showAddPage = false;
    this.showResetPassPage = false;
    this.selectedItem = null;
    this.index = null; 
  }
  HideRoleManage() {
    this.showManageRole = false;
    this.showGrid = true;
  }

  //Update User status- Activate or Deactivate user status
  ActivateDeactivateUserStatus(currUser: User) {
    if (currUser != null) {
      let status = currUser.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + currUser.UserName + ' ?')) {

        currUser.IsActive = status;
        //we want to update the ISActive property in table there for this call is necessry
        this.settingsBLService.Security_DeactivateUser(currUser)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "User is now activated." : "User is now Deactivated.";
                this.msgBoxServ.showMessage("success", [responseMessage]);
                let userUpdated = { item: currUser };
                //This for send to callbackadd function to update data in list
                this.getUserList();
              }
              else {
                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                let userUpdated = { item: currUser };

              }
            },
            err => {
              this.logError(err);
            });
      }

    }

  }

  logError(err: any) {
    console.log(err);
    this.msgBoxServ.showMessage("error", [err]);
  }
}
