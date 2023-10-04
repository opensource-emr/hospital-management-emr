import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';


export class PHRMPackingTypeModel {
    public PackingTypeId: number = 0;
    public PackingName: string = '';
    public PackingQuantity: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;

    public PackingTypeValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.PackingTypeValidator = _formBuilder.group({
            'PackingName': ['', Validators.required]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PackingTypeValidator.dirty;
        else
            return this.PackingTypeValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.PackingTypeValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.PackingTypeValidator.valid;
        else
            return !(this.PackingTypeValidator.hasError(validator, fieldName));
    }
}