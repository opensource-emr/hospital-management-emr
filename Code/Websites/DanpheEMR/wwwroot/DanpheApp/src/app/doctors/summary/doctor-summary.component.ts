import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../shared/dl.service"
import * as moment from 'moment/moment';
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from "../../security/shared/security.service";
import { DoctorSummary } from "../shared/doctor-summary.model";
@Component({
    selector: 'doctor-summary',
    templateUrl: "./doctor-summary.html"

})
export class DoctorRevenueComponent {

    public fromDate: Date = null;
    public toDate: Date = null;
    //day wise detail
    public docSummaryDetail: any = [];
    //overall summary
    public docSummary: DoctorSummary = new DoctorSummary();
    public DateValidator: FormGroup = null;
    public dateRange: string = null;
    public currentUser: number = null;
    public docSummaryGridColumns: Array<any> = null;
    constructor(
        public dlService: DLService,
        public msgBoxServ: MessageboxService,
        public securityService: SecurityService ) {

        this.currentUser = this.securityService.GetLoggedInUser().EmployeeId;
        var _formBuilder = new FormBuilder();
        this.DateValidator = _formBuilder.group({
            'fromDate': [this.fromDate, Validators.compose([Validators.required, this.dateValidators])],
            'toDate': [this.toDate, Validators.compose([Validators.required, this.dateValidators])],
        });
        this.dateRange = "lastWeek";
    }

    gridExportOptions = {
        fileName: 'DoctorSummaryList_' + moment().format('YYYY-MM-DD') + '.xls',

    };
    Load() {
        for (var i in this.DateValidator.controls) {
            this.DateValidator.controls[i].markAsDirty();
            this.DateValidator.controls[i].updateValueAndValidity();
        }
        if (this.IsValidCheck(undefined, undefined)) {
            this.dlService.Read("/Reporting/DoctorSummary?FromDate="
                + this.fromDate + "&ToDate=" + this.toDate + "&ProviderId=" + this.currentUser)
                .map(res => res)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.docSummaryDetail = res.Results;
                        this.docSummary = new DoctorSummary();
                        this.docSummaryDetail.forEach(a => {
                            this.docSummary.OPD += a.OPD;
                            this.docSummary.Referral += a.Referral;
                            this.docSummary.FollowUp += a.FollowUp;
                            this.docSummary.USG += a.USG;
                            this.docSummary.OrthoProcedures += a.OrthoProcedures;
                            this.docSummary.CT += a.CT;
                            this.docSummary.GeneralSurgery += a.GeneralSurgery;
                            this.docSummary.GynSurgery += a.GynSurgery;
                            this.docSummary.ENT += a.ENT;
                            this.docSummary.Dental += a.Dental;
                            this.docSummary.OT += a.OT;
                        });

                    }
                    else {

                        this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                    }
                },
                res => this.ErrorMsg(res));
        }
        else {
            this.msgBoxServ.showMessage("failed", ["Please enter valid date range."]);
        }
    }

    //event onDateChange
    onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        this.DateValidator.controls["fromDate"].setValue(this.fromDate);
        this.DateValidator.controls["toDate"].setValue(this.toDate);
        this.DateValidator.updateValueAndValidity();
        this.Load();
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Cannot load summary. Check log for error."]);
        console.log(err.ErrorMessage);
    }
    dateValidators(control: FormControl): { [key: string]: boolean } {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD 23:59');

        //if positive then selected date is of future else it of the past
        if ((moment(control.value).diff(currDate) > 0) ||
            (moment(control.value).diff(currDate, 'years') < -10)) // this will not allow the age diff more than 10 is past
            return { 'wrongDate': true };
    }
    //to check it whether the value of the textbox is valid or not ...
    public IsValidCheck(fieldname, validator): boolean {
        // this is used to check for patient form is valid or not 
        if (!this.DateValidator.dirty) {
            return true;
        }
        if (fieldname == undefined) {
            return this.DateValidator.valid;
        }
        else {
            return !(this.DateValidator.hasError(validator, fieldname));
        }
    }
}






