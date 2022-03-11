import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

import * as moment from 'moment/moment';

export class VaccinationPatient {
    public ShortName: string = null;
    public DateOfBirth: string = null;
    public Age: string = null;
    public AgeUnit: string = 'D';
    public Gender: string = 'Male';
    public FatherName: string;
    public MotherName: string;
    public EthnicGroup: string = null;
    public Address: string = null;
    public PhoneNumber: string = null;
    public VaccinationRegNo: number = 0;
    public CountryId: number = 0;
    public VaccinationFiscalYearId: number;
    public CountryName: string = null;
    public CountrySubDivisionId: number = null;
    public CountrySubDivisionName: string = null;
    public MunicipalityId: number = 0;

    public PatientValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.PatientValidator = _formBuilder.group({
            'Age': ['', Validators.compose([Validators.required])],
            'DateOfBirth': ['', Validators.compose([Validators.required, this.dateValidators]),],
            'Gender': ['', Validators.required],
            'MotherName': ['', Validators.required],
            //'ShortName': ['', Validators.required],
            'CountryId': ['', Validators.required],
            'CountrySubDivisionId': ['', Validators.required],
            'VaccinationRegNo': ['', Validators.required]
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.PatientValidator.dirty;
        }
        else {
            return this.PatientValidator.controls[fieldname].dirty;
        }

    }

    public IsValid(): boolean { if (this.PatientValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldname, validator): boolean {
        if (this.PatientValidator.valid) {
            return true;
        }

        if (fieldname == undefined) {
            return this.PatientValidator.valid;
        }
        else {

            return !(this.PatientValidator.hasError(validator, fieldname));
        }
    }


    dateValidators(control: FormControl): { [key: string]: boolean } {
        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');

        //if positive then selected date is of future else it of the past
        if ((moment(control.value).diff(currDate) > 0) ||
            (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
            return { 'wrongDate': true };
    }
}
