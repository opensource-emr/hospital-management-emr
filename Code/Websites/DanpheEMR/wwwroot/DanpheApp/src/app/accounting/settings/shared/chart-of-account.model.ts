import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class ChartofAccountModel {
    public ChartOfAccountId: number = 0;
    public ChartOfAccountName: string = "";
    public PrimaryGroupId: number = 0;
    public COACode: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public ModifiedBy: number = 0;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public COAValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.COAValidator = _formBuilder.group({
            'COAName': ['', Validators.compose([Validators.required])],
            'primaryGroup': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.COAValidator.dirty;
        else
            return this.COAValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.COAValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.COAValidator.valid;

        }

        else
            return !(this.COAValidator.hasError(validator, fieldName));
    }
}