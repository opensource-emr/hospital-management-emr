import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../security/shared/security.service';
import { Ward } from '../../admission/shared/ward.model';

import { SettingsBLService } from '../shared/settings.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
@Component({
    selector: "ward-add",
    templateUrl: "./ward-add.html"

})
export class WardAddComponent {

    public CurrentWard: Ward = new Ward();

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: Ward;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public wardList: Array<Ward> = new Array<Ward>();

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
            this.CurrentWard = Object.assign(this.CurrentWard, this.selectedItem);
            this.CurrentWard.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        else {
            this.CurrentWard = new Ward();
            this.CurrentWard.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

            this.update = false;
        }
    }
    Add() {
        for (var i in this.CurrentWard.WardValidator.controls) {
            this.CurrentWard.WardValidator.controls[i].markAsDirty();
            this.CurrentWard.WardValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentWard.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddWard(this.CurrentWard)
                .subscribe(
                res => {
                    this.showMessageBox("Success", "Ward Added");
                    this.CallBackAddUpdate(res)
                    this.CurrentWard = new Ward();
                },
                err => {
                    this.logError(err);
                });
        }
    }

    Update() {
        for (var i in this.CurrentWard.WardValidator.controls) {
            this.CurrentWard.WardValidator.controls[i].markAsDirty();
            this.CurrentWard.WardValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentWard.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateWard(this.CurrentWard)
                .subscribe(
                res => {
                    this.showMessageBox("Success", "Ward Details Updated");
                    this.CallBackAddUpdate(res)
                    this.CurrentWard = new Ward();
                },
                err => {
                    this.logError(err);
                });
        }
    }


    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var ward: any = {};
            ward.WardId = res.Results.WardId;
            ward.WardName = res.Results.WardName;
            ward.WardCode = res.Results.WardCode;
            ward.WardLocation = res.Results.WardLocation;
            ward.IsActive = res.Results.IsActive;
            ward.CreatedOn = res.Results.CreatedOn;
            ward.CreatedBy = res.Results.CreatedBy;
            this.callbackAdd.emit({ ward: ward });
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