import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class RPT_BIL_DoctorReferralModel {

   // public Doctor: string = "";
   // public Department: string = "";
   // public Item: string = "";
   // public Rate: number = 0;
   // public Quantity: number = 0;
   // public Discount: number = 0;
   // public Tax: number = 0;
   // public Total: number = 0;
   // public Date: Date = null;
   //// public FromDate: Date = null;
   // //public ToDate: Date = null;

   public fromDate: string = "";
   public toDate: string = "";
   public ProviderName: string = "";
   public DoctorReferralValidator: FormGroup = null;
   //// public selProvider: string = "";
 


    constructor() {

        var _formBuilder = new FormBuilder();
        this.DoctorReferralValidator = _formBuilder.group({
            //'FromDate': ['', Validators.compose([Validators.required])],
            'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
            'toDate': ['', Validators.compose([Validators.required, this.dateValidator])],

        });
    }


    dateValidator(control: FormControl): { [key: string]: boolean } {
        var currDate = moment().format('YYYY-MM-DD HH:mm');
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
        var currDate = moment().format('YYYY-MM-DD');
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
            return this.DoctorReferralValidator.dirty;
        else
            return this.DoctorReferralValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.DoctorReferralValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.DoctorReferralValidator.valid;
        else
            return !(this.DoctorReferralValidator.hasError(validator, fieldName));
    }
}
