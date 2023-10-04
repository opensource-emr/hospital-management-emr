import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

export class PackagingTypeModel {
    public PackagingTypeId: number = 0;
    public PackagingTypeName: string = "";
    public Description: string = "";
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public IsActive: boolean = true;
    public PackagingTypeValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.PackagingTypeValidator = _formBuilder.group({
            'PackagingTypeName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PackagingTypeValidator.dirty;
        else
            return this.PackagingTypeValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.PackagingTypeValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PackagingTypeValidator.valid;
        }
        else
            return !(this.PackagingTypeValidator.hasError(validator, fieldName));
    }
}