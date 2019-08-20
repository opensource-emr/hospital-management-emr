import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { Permission } from './permission.model';


export class Application {
    public ApplicationId : number = 0;
    public ApplicationCode: string = null;
    public ApplicationName: string = null;
    public Description: string = null;
    public IsActive: boolean = true;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;
    public Permissions: Array<Permission>;
    public IsApplicationNameSelected: boolean=false;

    public PermissionValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.PermissionValidator = _formBuilder.group({
            'PermissionName': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PermissionValidator.dirty;
        else
            return this.PermissionValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.PermissionValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PermissionValidator.valid;
        }
        else
            return !(this.PermissionValidator.hasError(validator, fieldName));
    }
}
