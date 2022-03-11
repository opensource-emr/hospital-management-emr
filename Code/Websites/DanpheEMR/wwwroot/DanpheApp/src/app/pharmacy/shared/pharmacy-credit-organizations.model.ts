import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class CreditOrganization {
    public OrganizationId: number = 0;
    public OrganizationName: string = null;
    public IsActive: boolean = true;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public CreditOrganizationValidator: FormGroup = null;


    constructor() {

        var _formBuilder = new FormBuilder();
        this.CreditOrganizationValidator = _formBuilder.group({
            'OrganizationName': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CreditOrganizationValidator.dirty;
        else
            return this.CreditOrganizationValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.CreditOrganizationValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CreditOrganizationValidator.valid;
        }

        else
            return !(this.CreditOrganizationValidator.hasError(validator, fieldName));
    }

}





