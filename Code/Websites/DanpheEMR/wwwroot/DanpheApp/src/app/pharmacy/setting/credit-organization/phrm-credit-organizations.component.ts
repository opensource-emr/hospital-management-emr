import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { CreditOrganization } from '../../shared/pharmacy-credit-organizations.model';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
@Component({
    selector: "phrm-credit-organizations",
    templateUrl: "./phrm-credit-organizations.html"
})
export class PHRMCreditOrganizationsComponent {

    public CurrentCreditOrganization: CreditOrganization = new CreditOrganization();

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: CreditOrganization;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    constructor(
        public pharmacyBLService: PharmacyBLService,
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
    }

    Add() {
        for (var i in this.CurrentCreditOrganization.CreditOrganizationValidator.controls) {
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].markAsDirty();
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCreditOrganization.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.AddCreditOrganization(this.CurrentCreditOrganization)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Organization Detail Added.");
                        this.CallBackAddUpdate(res)
                        this.CurrentCreditOrganization = new CreditOrganization();
                    },
                    err => {
                        this.logError(err);

                    });
        }
    }

    Update() {
        for (var i in this.CurrentCreditOrganization.CreditOrganizationValidator.controls) {
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].markAsDirty();
            this.CurrentCreditOrganization.CreditOrganizationValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCreditOrganization.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateCreditOrganization(this.CurrentCreditOrganization)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Organization Detail Updated.");
                        this.CallBackAddUpdate(res)
                        this.CurrentCreditOrganization = new CreditOrganization();
                    },
                    err => {
                        this.logError(err);

                    });
        }
    }
    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ creditOrganization: res.Results });
        }
        else {
            this.showMessageBox("error", "Check log for details");
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
