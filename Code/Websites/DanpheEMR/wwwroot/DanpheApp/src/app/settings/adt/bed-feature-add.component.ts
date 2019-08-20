import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../security/shared/security.service';
import { BedFeature } from '../../admission/shared/bedfeature.model';
import { Ward } from '../../admission/shared/ward.model';

import { SettingsBLService } from '../shared/settings.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
@Component({
    selector: "bed-feature-add",
    templateUrl: "./bed-feature-add.html" //"/app/settings/adt/bed-feature-add.html"

})
export class BedFeatureAddComponent {

    public CurrentBedFeature: BedFeature = new BedFeature();

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: BedFeature;
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
            this.CurrentBedFeature = Object.assign(this.CurrentBedFeature, this.selectedItem);
            this.CurrentBedFeature.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        else {
            this.CurrentBedFeature = new BedFeature();
            this.CurrentBedFeature.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

            this.update = false;
        }
    }

    Add() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentBedFeature.BedFeatureValidator.controls) {
            this.CurrentBedFeature.BedFeatureValidator.controls[i].markAsDirty();
            this.CurrentBedFeature.BedFeatureValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentBedFeature.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddBedFeature(this.CurrentBedFeature)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Bed Feature Added");
                        this.CallBackAddUpdate(res);
                        this.CurrentBedFeature = new BedFeature();
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentBedFeature.BedFeatureValidator.controls) {
            this.CurrentBedFeature.BedFeatureValidator.controls[i].markAsDirty();
            this.CurrentBedFeature.BedFeatureValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentBedFeature.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateBedFeature(this.CurrentBedFeature)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.showMessageBox("success", "Bed Details Updated");
                        this.CallBackAddUpdate(res)
                        this.CurrentBedFeature = new BedFeature();
                    } else {
                        this.showMessageBox("failed", "Bed Details cannot be updated now");
                    }                   
                    },
                    err => {
                        this.logError(err);
                    });
        }
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var bedFeature: any = {};
            bedFeature.BedFeatureId = res.Results.BedFeatureId;
            bedFeature.BedFeatureName = res.Results.BedFeatureName;
            bedFeature.BedFeatureFullName = res.Results.BedFeatureFullName;
            bedFeature.BedPrice = res.Results.BedPrice;
            bedFeature.IsActive = res.Results.IsActive;
            bedFeature.IsOccupied = res.Results.IsOccupied;
            bedFeature.CreatedOn = res.Results.CreatedOn;
            bedFeature.CreatedBy = res.Results.CreatedBy;
            bedFeature.TaxApplicable = res.Results.TaxApplicable; //yubraj 11 oct 2018
            for (let bfeature of this.wardList) {
                if (bfeature.WardId == res.Results.WardId) {
                    bedFeature.WardName = bfeature.WardName;
                    break;
                }
            };
            this.callbackAdd.emit({ bedFeature: bedFeature });
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