import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IRack } from './Irack';

export class PhrmRackModel implements IRack {

    public RackId: number = 0;
    public RackNo: string = null;
    public ParentId: number = null;
    public ParentRackNo: string = null;
    public StoreId: number = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public RackValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.RackValidator = _formBuilder.group({
            'RackNo': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'StoreId': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.RackValidator.dirty;
        else
            return this.RackValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.RackValidator.valid) {
            return true;
        }
        else {
            return false;
        }
    } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.RackValidator.valid;
        }
        else
            return !(this.RackValidator.hasError(validator, fieldName));
    }


}





