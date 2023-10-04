import {
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
} from '@angular/forms';
import * as moment from 'moment/moment';

export class RPT_APPT_RankwiseDailyAppointmentReportModel {

    public fromDate: string = "";
    public toDate: string = "";
    public Date: string = "";
    public PatientName: string = "";
    public AppointmentType: string = "";
    public Doctor_Name: string = "";
    public Rank: string = "";
    public Membership: string = ""; 
    public AppointmentStatus: string = "";
    public Ins_HasInsurance: boolean;
    public IsInsurancePatient: string = '';

    public DailyAppointmentValidator: FormGroup = null;

    constructor() {

        const _formBuilder = new FormBuilder();
        this.DailyAppointmentValidator = _formBuilder.group({
            //'FromDate': ['', Validators.compose([Validators.required])],
            'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
            'toDate': ['', Validators.compose([Validators.required, this.dateValidator])],

        });
    }

    dateValidator(control: FormControl): { [key: string]: boolean } {
        const currDate = moment().format('YYYY-MM-DD HH:mm');
        if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    }

    dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {

        //get current date, month and time
        const currDate = moment().format('YYYY-MM-DD');
        if (control.value) {
            //if positive then selected date is of future else it of the past
            if ((moment(control.value).diff(currDate) > 0) ||
                (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
                return { 'wrongDate': true };
        }


        else
            return { 'wrongDate': true };



    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DailyAppointmentValidator.dirty;
        else
            return this.DailyAppointmentValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.DailyAppointmentValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.DailyAppointmentValidator.valid;
        else
            return !(this.DailyAppointmentValidator.hasError(validator, fieldName));
    }

}
