import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class HomeMedication {
    public HomeMedicationId: number = 0;
    public PatientId: number = 0;
    public MedicationId: number = null;
    public MedicationName: string = null;
    public Dose: string = null;
    public Route: string = null;
    public LastTaken: string = null;
    public Comments: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public Frequency: number = null;
    public HomeMedicationValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.HomeMedicationValidator = _formBuilder.group({
            'MedicationId': ['', Validators.compose([Validators.required])],
            'Dose': ['', Validators.compose([Validators.required])],
            'Route': ['', Validators.compose([Validators.required])],
            'LastTaken': ['', Validators.compose([Validators.required, this.dateValidator])],
            'Comments': ['', Validators.compose([Validators.maxLength(200)])],
            'Frequency': ['', Validators.compose([Validators.required])]
        });
    }
    dateValidator(control: FormControl): { [key: string]: boolean } {

        var currDate = moment().format('YYYY-MM-DD');
        if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(currDate).diff(control.value, 'years') > 200)) //cannot make entry of 200 year before from today.
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.HomeMedicationValidator.dirty;
        else
            return this.HomeMedicationValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.HomeMedicationValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.HomeMedicationValidator.valid;
        else
            return !(this.HomeMedicationValidator.hasError(validator, fieldName));
    }
}