import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class TransactionInventoryItem {
    public TransactionInventoryItemId: number = 0;
    public TransactionItemId: number = 0;
    public ItemId: number = 0;
    public Amount: number = 0;
    public Quantity: number = 1;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public Remarks: string = "";
    public TxnInvItemValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.TxnInvItemValidator = _formBuilder.group({
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
            return this.TxnInvItemValidator.dirty;
        else
            return this.TxnInvItemValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.TxnInvItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TxnInvItemValidator.valid;
        }
        else
            return !(this.TxnInvItemValidator.hasError(validator, fieldName));
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
        this.TxnInvItemValidator.controls[formControlName].validator = validator;
        this.TxnInvItemValidator.controls[formControlName].updateValueAndValidity();
    }


}
