import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';

export class ActiveMedical {
    public PatientId: number = 0;
    public PatientProblemId: number = 0;
    public ICD10Code: string = null;
    public ICD10Description: string = null;
    public CurrentStatus: string = null;
    public OnSetDate: string = null;
    public IsResolved: boolean = false;
    public ResolvedDate: string = null;
    public Note: string = null;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public ActiveMedicalValidator: FormGroup = null;
    public PrincipleProblem: boolean = false;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ActiveMedicalValidator = _formBuilder.group({
            'ICD10Code': ['', Validators.compose([Validators.required])],
            'OnSetDate': ['', Validators.compose([Validators.required, this.dateValidator])],
            'Note': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
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
            return this.ActiveMedicalValidator.dirty;
        else
            return this.ActiveMedicalValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.ActiveMedicalValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.ActiveMedicalValidator.valid;
        else
            return !(this.ActiveMedicalValidator.hasError(validator, fieldName));
    }

    public OffNoteValidator(formControlName: string) {
        let validator = null;
        validator = Validators.compose([Validators.required]);
        validator = Validators.compose([]);
        this.ActiveMedicalValidator.controls[formControlName].validator = validator;
        this.ActiveMedicalValidator.controls[formControlName].updateValueAndValidity();

    }
}