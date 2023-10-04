import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class Allergy {
    public PatientAllergyId: number = 0;
    public PatientId: number = null;
    public AllergenAdvRecId: number = null;
    public AllergenAdvRecName: string = null;
    //public Others: string = null;
    public AllergyType: string = null;
    public Severity: string = null;
    public Verified: boolean = false;
    public Reaction: string = null;
    public Comments: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public AllergyValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.AllergyValidator = _formBuilder.group({
          'AllergyType': ['', Validators.compose([Validators.required])],
            'Reaction': ['', Validators.compose([Validators.required])],
            'Comments': ['', Validators.compose([Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.AllergyValidator.dirty;
        else
            return this.AllergyValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.AllergyValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.AllergyValidator.valid;
        else
            return !(this.AllergyValidator.hasError(validator, fieldName));
    }
}
