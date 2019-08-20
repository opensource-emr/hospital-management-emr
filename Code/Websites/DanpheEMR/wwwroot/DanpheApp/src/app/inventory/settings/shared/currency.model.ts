import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
export class CurrencyModel {

    public CurrencyID: number = 0;
    public CurrencyCode: string = null
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public CurrencyValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.CurrencyValidator = _formBuilder.group({
            'CurrencyCode': ['', Validators.compose([Validators.required, Validators.maxLength(10)])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CurrencyValidator.dirty;
        else
            return this.CurrencyValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.CurrencyValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CurrencyValidator.valid;
        }
        else
            return !(this.CurrencyValidator.hasError(validator, fieldName));
    }
}
