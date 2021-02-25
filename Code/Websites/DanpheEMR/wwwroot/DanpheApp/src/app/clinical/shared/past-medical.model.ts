import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

import * as moment from 'moment/moment';
export class PastMedical {
    public PatientId: number = 0;
    public PatientProblemId: number = 0;
    public ICD10Code: string = null;
    public ICD10Description: string = null;
    public CurrentStatus: string = "";
    public OnSetDate: string = null;
    public ResolvedDate: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public Note: string = null;
    public PastMedicalValidator: FormGroup = null;
    public PrincipleProblem: boolean = false;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.PastMedicalValidator = _formBuilder.group({
            //we dont want this Required Validation on OnSet date and ResolvedSet date ...as mentioned by santosh sir in doc_santosh list and bug no 5 and 6
            'ICD10Code': ['',  Validators.compose([Validators.required])],
            //validation on onsate date and resolve date is not mandatory
            'OnSetDate': ['', Validators.compose([this.dateValidator])],  
            //'ResolvedDate': ['', Validators.compose([this.dateValidator])],
            //'Note': ['', Validators.compose([Validators.required,Validators.maxLength(200)])],
        });
    }

    dateValidator(control: FormControl): { [key: string]: boolean } {
        var currDate = moment().format('YYYY-MM-DD HH:mm');
        if (control.value != null) // if the date is not empty then perform this operation
        {
           // gets empty string for invalid date such as 30th Feb or 31st Nov)
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
                return { 'wrongDate': true };
    
        }
}
    //Resolved date cannot be before OnSet date
    public IsValidResolvedDate(): boolean {
        if (this.PastMedicalValidator.controls["OnSetDate"].value != null) //resolved dated is checked only when onsetdate is not empty
        {
            let _onsetdate = this.PastMedicalValidator.controls["OnSetDate"].value;
            let _resolveddate = this.PastMedicalValidator.controls["ResolvedDate"].value;
            var _currDate = moment().format('YYYY-MM-DD HH:mm');

            //if positive then selected time is of future else it of the past
            if (moment(_onsetdate).diff(_resolveddate) <= 0)
                return true;
            else
                return false;
        }
    }


    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PastMedicalValidator.dirty;
        else
            return this.PastMedicalValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.PastMedicalValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            if (this.IsValidResolvedDate)
                return this.PastMedicalValidator.valid;
            else
                return false;
        }
        else
            return !(this.PastMedicalValidator.hasError(validator, fieldName));
    }
}