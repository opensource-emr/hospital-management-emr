import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
export class SocialHistory {
    public SocialHistoryId: number = 0;
    public PatientId: number = 0;
    public SmokingHistory: string = null;
    public AlcoholHistory: string = null;
    public DrugHistory: string = null;
    public Occupation: string = "";
    public FamilySupport: string = "";
    public CreatedDate: string = "";
    public Note: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public SocialHistoryValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.SocialHistoryValidator = _formBuilder.group({
            //'Note': ['', Validators.compose([Validators.required,Validators.maxLength(200)])],
            //'Occupation': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SocialHistoryValidator.dirty;
        else
            return this.SocialHistoryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.SocialHistoryValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.SocialHistoryValidator.valid;
        else
            return !(this.SocialHistoryValidator.hasError(validator, fieldName));
    }
    
}