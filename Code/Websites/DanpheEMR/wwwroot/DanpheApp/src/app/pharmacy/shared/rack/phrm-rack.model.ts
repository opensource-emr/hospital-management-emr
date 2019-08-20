import {    NgForm, FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { IRack } from './Irack';

export class PhrmRackModel implements IRack {

    public RackId: number;
    public Name: string = null;
    public ParentId: number = 0;
    public Description: string = null;
    public CreatedBy: number = null;
    public CreatedOn: Date = null;

    public RackValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.RackValidator = _formBuilder.group({
            'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.RackValidator.dirty;
        else
            return this.RackValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.RackValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RackValidator.valid;
        }
        else
            return !(this.RackValidator.hasError(validator, fieldName));
    }


}





