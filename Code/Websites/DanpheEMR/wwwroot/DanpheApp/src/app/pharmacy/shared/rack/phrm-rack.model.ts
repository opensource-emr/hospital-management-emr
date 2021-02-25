import {    NgForm, FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { IRack } from './Irack';

export class PhrmRackModel implements IRack {

    public RackId: number = 0;
    public Name: string = null;
    public ParentId: number = null;
    public LocationId : number = 1; //by default Rack For Dispensary.
    public Description: string = null;
    public CreatedBy: number = null;
    public CreatedOn: Date = null;

    public RackValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.RackValidator = _formBuilder.group({
            'Name': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'LocationId': ['', Validators.compose([Validators.required])]
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





