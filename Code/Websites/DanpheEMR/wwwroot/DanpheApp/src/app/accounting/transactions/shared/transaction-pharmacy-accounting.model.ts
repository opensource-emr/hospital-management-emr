import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class TransactionPharmacyItem {
    public TransactionPharmacyItemId: number = 0;
    public TransactionItemId: number = 0;
    public ItemId: number = 0;
    public Amount: number = 0;
    public Quantity: number = 1;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public Remarks: string = "";
    public TxnPhmItemValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.TxnPhmItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([])],
            'Quantity': ['', Validators.compose([])],
            'Amount': ['', Validators.compose([])],
        });
    }
    public numberValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (Number(control.value) < 0)
                return { 'invalidNumber': true };
        }
        else
            return { 'invalidNumber': true };

    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TxnPhmItemValidator.dirty;
        else
            return this.TxnPhmItemValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.TxnPhmItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TxnPhmItemValidator.valid;
        }
        else
            return !(this.TxnPhmItemValidator.hasError(validator, fieldName));
    }

    public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
        let validator = null;
        if (validatorType == 'required' && onOff == "on") {
            validator = Validators.compose([Validators.required]);
        }
        else if (validatorType == 'number' && onOff == "on") {
            validator = Validators.compose([this.numberValidator]);
        }
        else {
            validator = Validators.compose([]);
        }
        this.TxnPhmItemValidator.controls[formControlName].validator = validator;
        this.TxnPhmItemValidator.controls[formControlName].updateValueAndValidity();
    }


}
