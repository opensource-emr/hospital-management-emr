
import { Component, Directive, ViewChild } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core";

import { AdmissionBLService } from '../shared/admission.bl.service';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { PatientBedInfo } from '../shared/patient-bed-info.model';
import { Bed } from '../shared/bed.model';
import { Ward } from '../shared/ward.model';
import { BedFeature } from '../shared/bedfeature.model';
import * as moment from 'moment/moment';
import { NepaliDate } from "../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from '../../shared/common-models';
import { Department } from '../../settings/shared/department.model';

@Component({
    selector: "danphe-bed-upgrade",
    templateUrl: "./upgrade.html"
})
export class UpgradeComponent {
    public showUpgradePage: boolean = false;
    @Input("selectedBedInfo")
    public selectedBedInfo: { PatientAdmissionId, PatientId, PatientVisitId, MSIPAddressInfo, PatientCode, Name, BedInformation: { BedId,WardId, PatientBedInfoId, Ward, BedFeature, BedCode, BedNumber, BedFeatureId, AdmittedDate,StartedOn } };
    @Output("upgrade")

    upgrade: EventEmitter<Object> = new EventEmitter<Object>();
    public newBedInfo: PatientBedInfo = new PatientBedInfo();

    public wardList: Array<Ward> = new Array<Ward>();
    @Input("similarBedFeatures")
    public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();
    public bedList: Array<Bed> = new Array<Bed>();

    public showmsgbox: boolean = false;
    public status: string = null;
    public message: string = null;

    public loading: boolean = false;
    public disableBedType: boolean = true;
    public disableBed: boolean = true;
    public validDate: boolean = true;
    public upgradeDateNep: NepaliDate;

    public allDepartments: Array<Department> = [];

    constructor(public admissionBLService: AdmissionBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public npCalendarService: NepaliCalendarService) {
        this.LoadDepartments();
    }

    @Input("showUpgradePage")
    public set value(val: boolean) {
        if (val) {
            this.validDate = true;
            this.newBedInfo = new PatientBedInfo();
            this.newBedInfo.PatientId = this.selectedBedInfo.PatientId;
            this.newBedInfo.PatientVisitId = this.selectedBedInfo.PatientVisitId;
            this.newBedInfo.BedId = this.selectedBedInfo.BedInformation.BedId;
            this.newBedInfo.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.newBedInfo.StartedOn = moment().format('YYYY-MM-DDTHH:mm:ss');
            this.setBedPrice();
        }
        this.showUpgradePage = val;
    }

    public setBedPrice() {
        var newFeature = this.bedFeatureList.find(a => a.BedFeatureId == this.newBedInfo.BedFeatureId);
        if (newFeature)
            this.newBedInfo.BedPrice = newFeature.BedPrice;
    }
    Upgrade() {
        if (this.newBedInfo) {
            this.compareDate();
            this.newBedInfo.WardId = this.selectedBedInfo.BedInformation.WardId;
            for (var i in this.newBedInfo.PatientBedInfoValidator.controls) {
                this.newBedInfo.PatientBedInfoValidator.controls[i].markAsDirty();
                this.newBedInfo.PatientBedInfoValidator.controls[i].updateValueAndValidity();
            }
            if (this.newBedInfo.IsValidCheck(undefined, undefined) && this.validDate) {
                this.admissionBLService.UpgradeBedFeature(this.newBedInfo, this.selectedBedInfo.BedInformation.PatientBedInfoId)
                    .subscribe(res => {
                        if (res.Status == 'OK') {
                            this.newBedInfo = new PatientBedInfo();
                            this.msgBoxServ.showMessage("success", ["Patient upgraded to new bed."]);
                            this.upgrade.emit({ newBedInfo: res.Results });
                        }
                        else {
                            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
                    });
            }

        }
        else
            this.msgBoxServ.showMessage("failed", ["Select bed."]);

    }
    Close() {
        this.showUpgradePage = false;
    }

    public compareDate() {
        if ((moment(this.newBedInfo.StartedOn).diff(this.selectedBedInfo.BedInformation.StartedOn) < 0)
            || (moment(this.newBedInfo.StartedOn).diff(moment().add(10,'minutes').format('YYYY-MM-DD HH:mm')) > 0)
            || !this.newBedInfo.StartedOn)
            this.validDate = false;
        else
            this.validDate = true;
    }

    //convert nepali date to english date and assign to english calendar
    NepCalendarOnDateChange() {
        let engDate = this.npCalendarService.ConvertNepToEngDate(this.upgradeDateNep);
        this.newBedInfo.StartedOn = engDate;
    }
    //this method fire when english calendar date changed
    //convert english date to nepali date and assign to nepali canlendar
    EngCalendarOnDateChange() {
        if (this.newBedInfo.StartedOn) {
            let nepDate = this.npCalendarService.ConvertEngToNepDate(this.newBedInfo.StartedOn);
            this.upgradeDateNep = nepDate;
        }
    }


    //sud: 20Jun'18
    LoadDepartments() {
        this.admissionBLService.GetDepartments()
            .subscribe((res: DanpheHTTPResponse) => {
                this.allDepartments = res.Results;
            });
    }
}