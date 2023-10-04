import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
export class GoodsReceiptOtherChargeModel {
    public TotalOtherCharge: number = 0;
    public OtherChargesItem: GROtherChargesItemModel[] = [];
}

export class GROtherChargesItemModel {
    public ChargeId: number = null;
    public ChargeName: string = null;
    public SelectedCharge: any;
    public Amount: number = 0;
    public VATAmount: number = 0;
    public VATPercentage: number = 0;
    public TotalAmount: number = 0;
    public VendorId: number = null;
    public VendorName: string = null;
    IsCancel: boolean = false;
    canUserDelete: boolean = true; //by default user must be able to delete an item.
    public ItemOtherChargeValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ItemOtherChargeValidator = _formBuilder.group({
            'ChargeId': ['', [Validators.required]],
            'Amount': ['', Validators.compose([this.positiveNumberValdiator])],
            'VATPercentage': ['', Validators.compose([this.positiveNumberValdiator])],
            'VATAmount': ['', Validators.compose([this.positiveNumberValdiator])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ItemOtherChargeValidator.dirty;
        else
            return this.ItemOtherChargeValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.ItemOtherChargeValidator.valid) {
            return true;
        } else { return false; }
    }
    public IsValidCheck(fieldName, validator): boolean {

        if (fieldName == undefined)
            return this.ItemOtherChargeValidator.valid;
        else
            return !(this.ItemOtherChargeValidator.hasError(validator, fieldName));
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'invalidNumber': true };
        }
    }
}