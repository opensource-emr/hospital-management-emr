import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import * as moment from 'moment/moment';
import { Bed } from './bed.model';
export class RoleManagement {
    public RoleId: number = 0;
    public RoleName: string = null;
    public RoleDescription: string = null;
    public ApplicationId: number = 0;
    public IsSysAdmin: boolean = false;
    public IsActive: boolean = true; 
    public RolePriority: number = 0;
    public DefaultRouteId: number = 0;
    //public RouteId: number = 0;
    public beds: Array<Bed> = new Array<Bed>();

   
    public RoleManagementValidator: FormGroup = null;

    constructor() {
        var _formbuilder = new FormBuilder();
        this.RoleManagementValidator = _formbuilder.group({
            'RoleName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'ApplicationId': ['', Validators.compose([Validators.required])],
            'DefaultRouteId': ['', Validators.compose([Validators.required])],
            'RoleDescription': ['', Validators.compose([Validators.maxLength(50)])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.RoleManagementValidator.dirty;
        else
            return this.RoleManagementValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.RoleManagementValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RoleManagementValidator.valid;
            
        }

        else
            return !(this.RoleManagementValidator.hasError(validator, fieldName));
    }

}
