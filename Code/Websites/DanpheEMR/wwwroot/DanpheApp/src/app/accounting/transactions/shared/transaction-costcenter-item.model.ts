import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class TransactionCostCenterItem {
    public TransactionCostCenterItemId: number = 0;
    public TransactionItemId: number = 0;
    public CostCenterItemId: number = 0;
    public Amount: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public TxnCstItemValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.TxnCstItemValidator = _formBuilder.group({
            'CostCenterItemId': ['', Validators.compose([])],
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
            return this.TxnCstItemValidator.dirty;
        else
            return this.TxnCstItemValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.TxnCstItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TxnCstItemValidator.valid;
        }
        else
            return !(this.TxnCstItemValidator.hasError(validator, fieldName));
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
        this.TxnCstItemValidator.controls[formControlName].validator = validator;
        this.TxnCstItemValidator.controls[formControlName].updateValueAndValidity();
    }


}
