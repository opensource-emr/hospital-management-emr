import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PHRMUnitOfMeasurementModel {
    public UOMId: number = 0;
    public UOMName: string = "";
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public UnitOfMeasurementValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.UnitOfMeasurementValidator = _formBuilder.group({
            'UOMName': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.UnitOfMeasurementValidator.dirty;
        else
            return this.UnitOfMeasurementValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.UnitOfMeasurementValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.UnitOfMeasurementValidator.valid;
        }
        else
            return !(this.UnitOfMeasurementValidator.hasError(validator, fieldName));
    }
}
