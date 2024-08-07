import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

export class PHRMCategoryModel {
    public CategoryId: number = 0;
    public CategoryName: string = '';
    public Description: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public IsActive: boolean = true;
    public CategoryValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.CategoryValidator = _formBuilder.group({
            'CategoryName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CategoryValidator.dirty;
        else
            return this.CategoryValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.CategoryValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CategoryValidator.valid;
        }
        else
            return !(this.CategoryValidator.hasError(validator, fieldName));
    }
}
