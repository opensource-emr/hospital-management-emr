import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
export class PHRMSupplierModel {
    public SupplierId: number = 0;
    public SupplierName: string = "";
    public ContactNo: string = null;
    public Description: string = null;
    public City: string = null;
    public Pin: string = null;
    public ContactAddress: string = null;
    public Email: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public SupplierValidator: FormGroup = null;
    public CreditPeriod: number = null;
    
    constructor() {
        var _formBuilder = new FormBuilder();
        this.SupplierValidator = _formBuilder.group({
            'SupplierName': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            'ContactNo': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{10}$')])],
            'City': ['', Validators.required],
            'Pin': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,9}$')])],
            'ContactAddress': ['', Validators.required],
            'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SupplierValidator.dirty;
        else
            return this.SupplierValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.SupplierValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.SupplierValidator.valid;
        }
        else
            return !(this.SupplierValidator.hasError(validator, fieldName));
    }
}
