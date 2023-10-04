import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class EmployeeRole {
    public EmployeeRoleId: number = 0;
    public EmployeeRoleName: string = null;
    public Description: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public EmployeeRoleValidator: FormGroup = null;


    constructor() {

        var _formBuilder = new FormBuilder();
        this.EmployeeRoleValidator = _formBuilder.group({
            'EmployeeRoleName': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.EmployeeRoleValidator.dirty;
        else
            return this.EmployeeRoleValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.EmployeeRoleValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.EmployeeRoleValidator.valid;
        }

        else
            return !(this.EmployeeRoleValidator.hasError(validator, fieldName));
    }

}





