import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export class DesignationModel {

    public DesignationId: number = 0;
    public DesignationName: string = null
    public CreatedBy: number = 0;
    public CreatedDate: string = null;
    public Description: string = null;

    public DesignationValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.DesignationValidator = _formBuilder.group({
            'DesignationName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            //'Email': ['', Validators.compose([Validators.email])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DesignationValidator.dirty;
        else
            return this.DesignationValidator.controls[fieldName].dirty;
    }

    public IsValid(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.DesignationValidator.valid;
        }
        else
            return !(this.DesignationValidator.hasError(validator, fieldName));
    }
}