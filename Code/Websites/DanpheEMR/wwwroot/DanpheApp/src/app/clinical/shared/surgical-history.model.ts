import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class SurgicalHistory {
    public SurgicalHistoryId: number = 0;
    public PatientId: number = 0;
    public SurgeryType: string = "";
    public ICD10Code: string = "";
    public ICD10Description: string = "";
    public SurgeryDate: string = "";
    public CreatedDate: string = "";
    public Note: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public SurgicalHistoryValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.SurgicalHistoryValidator = _formBuilder.group({
            'ICD10Code': ['', Validators.compose([Validators.required])],
            'SurgeryDate': ['', Validators.compose([Validators.required, this.dateValidator])],
            //'Note': ['', Validators.compose([Validators.required,Validators.maxLength(200)])],
            'SurgeryType': ['', Validators.compose([Validators.maxLength(30)])],
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

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SurgicalHistoryValidator.dirty;
        else
            return this.SurgicalHistoryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.SurgicalHistoryValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.SurgicalHistoryValidator.valid;
        else
            return !(this.SurgicalHistoryValidator.hasError(validator, fieldName));
    }
    
}