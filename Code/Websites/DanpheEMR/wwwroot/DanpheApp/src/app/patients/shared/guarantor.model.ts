import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';


export class Guarantor {
    public PatientGurantorInfo: number = null;
    public PatientId: number = null;
    public GuarantorSelf: boolean = false;
    public PatientRelationship: string = null;
    public GuarantorName: string = null;
    public GuarantorGender: string = null;
    public GuarantorCountryId: number = 0;
    public GuarantorPhoneNumber: string = null;
    public GuarantorDateOfBirth: string = null;
    public GuarantorStreet1: string = null;
    public GuarantorStreet2: string = null;
    public GuarantorCountrySubDivisionId: number = null;
    public GuarantorCity: string = null;
    public GuarantorZIPCode: string = null;
    public GuarantorValidator: FormGroup = null;


    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.GuarantorValidator.dirty;
        }
        else {
            return this.GuarantorValidator.controls[fieldname].dirty;
        }
    }

    public IsValid():boolean{if(this.GuarantorValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        //if nothing's has changed in Gurantor then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.GuarantorValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.GuarantorValidator.valid;
        }
        else {

            return !(this.GuarantorValidator.hasError(validator, fieldname));
        }

    }


    constructor() {
        this.PatientId = 0;
        this.PatientGurantorInfo = 0;

        var _formBuilder = new FormBuilder();

        function dateValidators(control: FormControl): { [key: string]: boolean } {

            var currDate = moment().format('YYYY-MM-DD');

            //if positive then selected date is of future else it of the past
            if ((moment(control.value).diff(currDate) > 0)||
                (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past

                return { 'wrongDate': true };
        }
        this.GuarantorValidator = _formBuilder.group({
            'GuarantorName': [null, Validators.required,],
            'PatientRelationship': [null, Validators.required,],
            'GuarantorDateOfBirth': [null, dateValidators,],
            'GuarantorPhoneNumber': ['', Validators.pattern('^[0-9]{1,10}$')],
        });



    }



}
