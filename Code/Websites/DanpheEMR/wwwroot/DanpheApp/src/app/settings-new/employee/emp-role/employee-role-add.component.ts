import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { EmployeeRole } from "../../../employee/shared/employee-role.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
@Component({
    selector: "employee-role-add",
    templateUrl: "./employee-role-add.html"

})
export class EmployeeRoleAddComponent {

    public CurrentEmployeeRole: EmployeeRole = new EmployeeRole();

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: EmployeeRole;
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
            this.CurrentEmployeeRole = new EmployeeRole();
            this.CurrentEmployeeRole = Object.assign(this.CurrentEmployeeRole, this.selectedItem);
            this.CurrentEmployeeRole.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentEmployeeRole.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        }
        else {
            this.CurrentEmployeeRole = new EmployeeRole();
            this.CurrentEmployeeRole.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentEmployeeRole.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
            this.update = false;
        }
    }
    
    Add() {
        for (var i in this.CurrentEmployeeRole.EmployeeRoleValidator.controls) {
            this.CurrentEmployeeRole.EmployeeRoleValidator.controls[i].markAsDirty();
            this.CurrentEmployeeRole.EmployeeRoleValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentEmployeeRole.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddEmployeeRole(this.CurrentEmployeeRole)
                .subscribe(
                res => {
                    this.showMessageBox("Success", "Employee Role Added.");
                    this.CallBackAddUpdate(res)
                    this.CurrentEmployeeRole = new EmployeeRole();
                },
                err => {
                    this.logError(err);

                });
        }
    }

    Update() {
        for (var i in this.CurrentEmployeeRole.EmployeeRoleValidator.controls) {
            this.CurrentEmployeeRole.EmployeeRoleValidator.controls[i].markAsDirty();
            this.CurrentEmployeeRole.EmployeeRoleValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentEmployeeRole.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateEmployeeRole(this.CurrentEmployeeRole)
                .subscribe(
                res => {
                    this.showMessageBox("Success", "Employee Role Updated.");
                    this.CallBackAddUpdate(res)
                    this.CurrentEmployeeRole = new EmployeeRole();
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

}
