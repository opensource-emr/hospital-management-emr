import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class FamilyHistory {
    public FamilyProblemId: number = 0;
    public PatientId: number = 0;
    public ICD10Code: string = null;
    public ICD10Description: string = null;
    public Relationship: string = null;
    public Note: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public FamilyHistoryValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.FamilyHistoryValidator = _formBuilder.group({
            'ICD10Code': ['', Validators.compose([Validators.required])],
            'Relationship': ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
            //'Note': ['', Validators.compose([Validators.maxLength(200)])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.FamilyHistoryValidator.dirty;
        else
            return this.FamilyHistoryValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.FamilyHistoryValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.FamilyHistoryValidator.valid;
        else
            return !(this.FamilyHistoryValidator.hasError(validator, fieldName));
    }
}