import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export class CompanyModel {

    public CompanyId: number = 0;
    public CompanyName: string = null
    public Code: string = null
    public Email: string = null;
    public ContactAddress: string = null;
    public ContactNo: string = "";
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedDate: string = null;
    public IsActive: boolean = true;

    public CompanyValidator: FormGroup = null;


    constructor() {
        var _formBuilder = new FormBuilder();
        this.CompanyValidator = _formBuilder.group({
          'CompanyName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
          'ContactNo': ['', Validators.compose([Validators.pattern('^[0-9]{1,10}$')])],
            //'Email': ['', Validators.compose([Validators.email])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CompanyValidator.dirty;
        else
            return this.CompanyValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.CompanyValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CompanyValidator.valid;
        }
        else
            return !(this.CompanyValidator.hasError(validator, fieldName));
    }
}
