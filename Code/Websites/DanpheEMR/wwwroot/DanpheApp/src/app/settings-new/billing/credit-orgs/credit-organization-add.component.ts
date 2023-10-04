import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";

import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { CreditOrganization } from "../../shared/creditOrganization.model";
import { SettingsBLService } from '../../shared/settings.bl.service';
@Component({
    selector: "credit-organization-add",
    templateUrl: "./credit-organization-add.html",
    host: { '(window:keydown)': 'KeysPressed($event)' }
})
export class CreditOrganizationAddComponent {

    public CurrentCreditOrganization: CreditOrganization = new CreditOrganization();

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: CreditOrganization;
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
            this.CurrentCreditOrganization = new CreditOrganization();
            this.CurrentCreditOrganization = Object.assign(this.CurrentCreditOrganization, this.selectedItem);
            this.CurrentCreditOrganization.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentCreditOrganization.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        }
        else {
            this.CurrentCreditOrganization = new CreditOrganization();
            this.CurrentCreditOrganization.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.CurrentCreditOrganization.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
            this.update = false;
        }
        this.GoToNextInput("OrganizationName");
    }

    Add() {
        for (var i in this.CurrentCreditOrganization.CreditOrganizationValidator.controls) {
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].markAsDirty();
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCreditOrganization.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddCreditOrganization(this.CurrentCreditOrganization)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Credit Organization Detail Added."]);
                            this.CallBackAddUpdate(res)
                            this.CurrentCreditOrganization = new CreditOrganization();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Add Invalid Data."]);
                            this.CurrentCreditOrganization = new CreditOrganization();
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to Add Credit Organization, Check log for error message."]);
                        this.logError(err.ErrorMessage);

                    });
        }
    }

    Update() {
        for (var i in this.CurrentCreditOrganization.CreditOrganizationValidator.controls) {
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].markAsDirty();
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCreditOrganization.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateCreditOrganization(this.CurrentCreditOrganization)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Credit Organization Detail Updated."]);
                            this.CallBackAddUpdate(res)
                            this.CurrentCreditOrganization = new CreditOrganization();
                        }
                        else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Cannot Update Invalid Data."]);
                            this.CurrentCreditOrganization = new CreditOrganization();
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Failed to  Update Credit Organization, Check log for error message."]);
                        this.logError(err.ErrorMessage);

                    });
        }
    }
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ creditOrganization: res.Results });
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
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

    Discard() {
        this.selectedItem = null;
        this.update = false;
        this.showAddPage = false;
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }
    private GoToNextInput(id: string) {
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
