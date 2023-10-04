import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class AdditionalServiceItemModel {

    public AdditionalServiceItemId: number = 0;
    public GroupName: string = '';
    public ServiceItemId: number = 0;
    public PriceCategoryId: number = 0;
    public ItemName: string = '';
    public UseItemSelfPrice: boolean = false;
    public PercentageOfParentItemForSameDept: number = 0;
    public PercentageOfParentItemForDiffDept: number = 0;
    public MinimumChargeAmount: number = 0;
    public IsPreAnaesthesia: boolean = false;
    public WithPreAnaesthesia: boolean = false;
    public IsOpServiceItem: boolean = false;
    public IsIpServiceItem: boolean = false;
    public IsActive: boolean = true;
    public AdditionalServiceItemValidator: FormGroup = null;

    constructor() {
        const _formBuilder = new FormBuilder();
        this.AdditionalServiceItemValidator = _formBuilder.group({
            GroupName: ['', Validators.required],
            PriceCategoryId: ['', Validators.required],
            ItemName: ['', Validators.required],
            ServiceItemId: ['', Validators.required],
            MinimumChargeAmount: [0, [Validators.required, Validators.min(0)]],
            PercentageOfParentItemForSameDept: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            PercentageOfParentItemForDiffDept: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            IsOpServiceItem: [false,],
            WithPreAnaesthesia: [false,],
            IsIpServiceItem: [false,],
            UseItemSelfPrice: [false,],
            IsPreAnaesthesia: [false,],
            IsActive: [true,],
            AdditionalServiceItemId: [0]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.AdditionalServiceItemValidator.dirty;
        else
            return this.AdditionalServiceItemValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.AdditionalServiceItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.AdditionalServiceItemValidator.valid;
        }

        else
            return !(this.AdditionalServiceItemValidator.hasError(validator, fieldName));
    }
}

