import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
export class PHRMCompanyModel {
    public CompanyId: number = 0;
    public CompanyName: string = '';
    public ContactNo: string = '';
    public Description: string = '';
    public ContactAddress: string = '';
    public Email: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public IsActive: boolean = true;

    public CompanyValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.CompanyValidator = _formBuilder.group({
            'CompanyName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            /*   'ContactNo': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])],*/
            'ContactNo': ['', Validators.pattern('^[0-9]{10}$')],
            'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.CompanyValidator.dirty;
        else
            return this.CompanyValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.CompanyValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.CompanyValidator.valid;
        }
        else
            return !(this.CompanyValidator.hasError(validator, fieldName));
    }
}
