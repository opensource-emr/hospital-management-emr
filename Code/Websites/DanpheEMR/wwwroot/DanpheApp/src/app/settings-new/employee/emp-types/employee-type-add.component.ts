import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { EmployeeType } from "../../../employee/shared/employee-type.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
  selector: "employee-type-add",
  templateUrl: "./employee-type-add.html",
  host: { '(window:keyup)': 'hotkeys($event)' }

})
export class EmployeeTypeAddComponent {

  public CurrentEmployeeType: EmployeeType = new EmployeeType();

  public showAddPage: boolean = false;
  @Input("selectedItem")
  public selectedItem: EmployeeType;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  public update: boolean = false;

  constructor(
    public settingsBLService: SettingsBLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef) {
  }
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    if (this.selectedItem) {
      this.update = true;
      this.CurrentEmployeeType = new EmployeeType();
      this.CurrentEmployeeType = Object.assign(this.CurrentEmployeeType, this.selectedItem);
      this.CurrentEmployeeType.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployeeType.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
    }
    else {
      this.CurrentEmployeeType = new EmployeeType();
      this.CurrentEmployeeType.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.CurrentEmployeeType.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      this.update = false;
    }
    this.FocusElementById('Type');
  }

  Add() {
    for (var i in this.CurrentEmployeeType.EmployeeTypeValidator.controls) {
      this.CurrentEmployeeType.EmployeeTypeValidator.controls[i].markAsDirty();
      this.CurrentEmployeeType.EmployeeTypeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployeeType.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.AddEmployeeType(this.CurrentEmployeeType)
        .subscribe(
          res => {
            this.showMessageBox("Success", "Employee Type Added.");
            this.CallBackAddUpdate(res)
            this.CurrentEmployeeType = new EmployeeType();
          },
          err => {
            this.logError(err);

          });
    }
  }

  Update() {
    for (var i in this.CurrentEmployeeType.EmployeeTypeValidator.controls) {
      this.CurrentEmployeeType.EmployeeTypeValidator.controls[i].markAsDirty();
      this.CurrentEmployeeType.EmployeeTypeValidator.controls[i].updateValueAndValidity();
    }
    if (this.CurrentEmployeeType.IsValidCheck(undefined, undefined)) {
      this.settingsBLService.UpdateEmployeeType(this.CurrentEmployeeType)
        .subscribe(
          res => {
            this.showMessageBox("Success", "Employee Type Updated.");
            this.CallBackAddUpdate(res)
            this.CurrentEmployeeType = new EmployeeType();
          },
          err => {
            this.logError(err);

          });
    }
  }
  CallBackAddUpdate(res) {
    if (res.Status == "OK") {
      this.callbackAdd.emit({ employee: res.Results });
    }
    else {
      this.showMessageBox("Error", "Check log for details");
      console.log(res.ErrorMessage);
    }
  }
  logError(err: any) {
    console.log(err);
  }
  Close() {
    this.selectedItem = null;
    this.update = false;
    this.showAddPage = false;
  }
  showMessageBox(status: string, message: string) {
    this.msgBoxServ.showMessage(status, [message]);
  }
  
  FocusElementById(id: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(id);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }
  hotkeys(event){
    if(event.keyCode==27){
        this.Close()
    }
}

}
