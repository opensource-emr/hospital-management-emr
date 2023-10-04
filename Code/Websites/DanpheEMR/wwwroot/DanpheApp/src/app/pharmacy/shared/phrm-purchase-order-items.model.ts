import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PHRMGenericModel } from './phrm-generic.model';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMItemTypeModel } from "./phrm-item-type.model";

export class PHRMPurchaseOrderItems {
    public PurchaseOrderItemId: number = 0;
    public ItemId: number = 0;
    public GenericId: number = 0;
    public GenericName: string = '';
    public PurchaseOrderId: number = 0;
    public Quantity: number = 0;
    public FreeQuantity: number = 0;
    public TotalQuantity: number = 0;
    public StandardRate: number = 0;
    public ReceivedQuantity: number = 0;
    public PendingQuantity: number = 0;
    public SubTotal: number = 0;
    public CCChargePercentage: number = 0;
    public DiscountPercentage: number = 0;
    public VATPercentage: number = 0;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public DeliveryDays: number = 0;
    public AuthorizedRemark: string = null;
    public Remarks: string = null;
    public POItemStatus: string = null;
    public AuthorizedBy: number = 0;
    public AuthorizedOn: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public ItemName: string = null;
    public SellingPrice: number = 0;
    public CompanyName: string = null;
    public UOMName: string = null;
    ////to make the instance ItemMaster with new row
    public SelectedItem: PHRMItemMasterModel = null;
    public SelectedGeneric: PHRMGenericModel = null;
    public ItemListByItemType: any = [];
    public PHRMItemMaster: PHRMItemMasterModel = new PHRMItemMasterModel();

    public Item: PHRMItemMasterModel = null;
    public ItemType: PHRMItemTypeModel = null;
    public PurchaseOrderItemValidator: FormGroup = null;
    DiscountAmount: number = 0;
    CCChargeAmount: number = 0;
    PendingFreeQuantity: number = 0;
    IsCancel: boolean;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.PurchaseOrderItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
            //'GenericId': ['', Validators.compose([Validators.required])],
            'Quantity': [0, Validators.compose([Validators.required, this.wholeNumberRequired, this.positiveNumberValdiator])],
            'FreeQuantity': [0, Validators.compose([Validators.required, this.NonNegativeNumberValdiator])],
            'StandardRate': [0, Validators.compose([Validators.required, this.wholeNumberRequired, this.positiveNumberValdiator])],
            'CCChargePercentage': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            'DiscountPercentage': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            'VATPercentage': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PurchaseOrderItemValidator.dirty;
        else
            return this.PurchaseOrderItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.PurchaseOrderItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PurchaseOrderItemValidator.valid;
        }
        else
            return !(this.PurchaseOrderItemValidator.hasError(validator, fieldName));
    }
    wholeNumberRequired(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value % 1 != 0 && control.value <= 0) return { 'wrongDecimalValue': true };
        }
        else
            return { 'wrongDecimalValue': true };
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }
    }
    NonNegativeNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'negativeNumber': true };
        }
    }
    registeredItemValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value && typeof (control.value) == "object" && control.value.ItemId > 0)
            return;
        else
            return { 'notRegisteredItem': true };
    }

}