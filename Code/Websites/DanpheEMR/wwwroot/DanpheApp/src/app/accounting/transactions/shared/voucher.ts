import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'


export class Voucher { 
    public VoucherId: number = 0;
    public VoucherName: string = null;
    public Description: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public ShowPayeeName: boolean = false;
    public ShowChequeNumber: boolean = false;
    public VoucherCode: string = null;
    public ISCopyDescription:boolean=false;
    public ValidatorVoucher: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.ValidatorVoucher = _formBuilder.group({
            // 'VoucherName': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
            'VoucherCode': ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
            // 'Description': ['', Validators.compose([Validators.required, Validators.maxLength(200)])],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ValidatorVoucher.dirty;
        else
            return this.ValidatorVoucher.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.ValidatorVoucher.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ValidatorVoucher.valid;
            
        }

        else
            return !(this.ValidatorVoucher.hasError(validator, fieldName));
    }
}
