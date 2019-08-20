import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class CostCenterItemModel {
    public CostCenterItemId: number = 0;
    public CostCenterItemName: string = "";
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public IsActive: boolean = true;
    
    public CostCenterItemValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.CostCenterItemValidator = _formBuilder.group({
            'CostCenterItemName': ['', Validators.compose([Validators.required])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CostCenterItemValidator.dirty;
        else
            return this.CostCenterItemValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.CostCenterItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CostCenterItemValidator.valid;

        }
        else
            return !(this.CostCenterItemValidator.hasError(validator, fieldName));
    }
}