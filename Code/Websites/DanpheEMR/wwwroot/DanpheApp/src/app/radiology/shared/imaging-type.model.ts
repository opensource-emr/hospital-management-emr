import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

import { ImagingItem } from './imaging-item.model';

export class ImagingType {
    public ImagingTypeId: number = 0;
    public ImagingTypeName : string = null;
    public ProcedureCoding: string = null;

    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;

    public CreatedOn: string = null;
    public ModifiedOn: string = null;

    public ImagingItems: Array<ImagingItem> = new Array<ImagingItem>();

    public ImagingTypeValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ImagingTypeValidator = _formBuilder.group({
            'ImagingTypeName': ['', Validators.compose([Validators.required])]
        });
    }
  
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ImagingTypeValidator.dirty;
        else
            return this.ImagingTypeValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ImagingTypeValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.ImagingTypeValidator.valid;
        else
            return !(this.ImagingTypeValidator.hasError(validator, fieldName));
    }
}  