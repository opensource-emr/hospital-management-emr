import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import * as moment from "moment";

export class PHRMPatientConsumptionItem {
    public PatientConsumptionItemId: number = 0;
    public PatientConsumptionId: number = 0;
    public PatientId: number = 0;
    public PatientvisitId: number = 0;
    public VisitType: string = "";
    public ItemId: number = 0;
    public ItemName: string = "";
    public IsNarcotic: boolean = false;
    public GenericId: number = 0;
    public GenericName: string = "";
    public BatchNo: string = "";
    public ExpiryDate: string = "";
    public Quantity: number = 0;
    public SalePrice: number = 0;
    public NormalSalePrice: number = 0;
    public FreeQuantity: number = 0;
    public SubTotal: number = 0;
    public DiscountPercentage: number = 0;
    public DiscountAmount: number = 0;
    public VatPercentage: number = 0;
    public VatAmount: number = 0;
    public TotalAmount: number = 0;
    public Remarks: string = "";
    public CounterId: number = 0;
    public StoreId: number = 0;
    public PrescriberId: number = 0;
    public PriceCategoryId: number = 1;
    public SchemeId: number = 1;
    public CreatedBy: number = 0;
    public CreatedOn: string = moment().format('YYYY-MM-DD');
    public IsActive: boolean = false;
    public IsChecked: boolean = false;
    public ConsumptionReceiptNo: number = 0;
    public ReturnedQuantity: number = 0;
    public ReturningQuantity: number = 0;
    public RemainingQuantity: number = 0;
    public StoreName: string = '';
    public UserName: string = '';
    public IsFinalize: boolean = false;
    public ConsumptionReturnItemIds: Array<number> = new Array<number>();
    public PatientConsumptionValidator: FormGroup = null;
    public AvailableQuantity: number = 0;
    public FinalizedQty: number = 0;
    ReturningStoreId: number = 0;
    IsInvalidQuantity: boolean = false;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.PatientConsumptionValidator = _formBuilder.group({
            'GenericName': ['', Validators.compose([Validators.required])],
            'ItemName': ['', Validators.compose([Validators.required, this.ItemNameValidator()])],
            'Quantity': ['', Validators.compose([Validators.required, this.integerValidator, this.wholeNumberValidator])],
            'AvailableQuantity': [{ value: 0, disabled: true }, Validators.compose([Validators.required])],
        }
        );
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PatientConsumptionValidator.dirty;
        else
            return this.PatientConsumptionValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean {
        if (this.PatientConsumptionValidator.valid) {
            return true;
        } else {
            return false;
        }
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.PatientConsumptionValidator.valid;
        else
            return !(this.PatientConsumptionValidator.hasError(validator, fieldName));
    }
    wholeNumberValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value % 1 != 0)
                return { 'wrongDecimalValue': true };
        }
        else
            return { 'wrongDecimalValue': true };
    }
    integerValidator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }
    }
    ItemNameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {

            const value = control.value;

            if (typeof (value) == "object") {
                return null;
            }
            return { 'invalidItem': true };
        }
    }
}


