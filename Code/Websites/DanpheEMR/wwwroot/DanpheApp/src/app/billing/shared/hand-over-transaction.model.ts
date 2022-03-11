import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl
} from "@angular/forms";
import { DenominationModel } from "./denomination.model";

export class HandOverTransactionModel {
    public HandoverTxnId: number = 0;
    public HandoverByEmpId: number = null;
    public HandoverToEmpId: number = null;
    public CounterId: number = null;
    public HandoverType: string = null;
    public BankName: string = null;
    public VoucherNumber: string = null;
    public VoucherDate: string = null;
    public HandoverAmount: number = 0;
    public DueAmount: number = 0;
    public HandoverRemarks: string = null;
    public ReceivedById: number = null;
    public ReceivedOn: string =null;
    public ReceiveRemarks: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public IsActive: boolean = true;

    public HandoverTransactionValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.HandoverTransactionValidator = _formBuilder.group({
            'BankName': ['', Validators.compose([Validators.required])],
            //'VoucherNumber': ['', Validators.compose([Validators.required])],
            'HandoverAmount': ['', Validators.compose([this.positiveNumberValdiator,Validators.required])],
        });
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 1)
                return { 'invalidNumber': true };
        }

    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.HandoverTransactionValidator.dirty;
        else
            return this.HandoverTransactionValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean { if (this.HandoverTransactionValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.HandoverTransactionValidator.valid;
        }

        else
            return !(this.HandoverTransactionValidator.hasError(validator, fieldName));
    }
}
