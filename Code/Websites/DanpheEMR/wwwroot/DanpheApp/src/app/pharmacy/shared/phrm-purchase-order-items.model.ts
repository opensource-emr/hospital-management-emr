import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMItemTypeModel } from "./phrm-item-type.model"

export class PHRMPurchaseOrderItems {
    public PurchaseOrderItemId: number = 0;
    public ItemId: number = 0;
    public PurchaseOrderId: number = 0;
    public Quantity: number = 0;
    public StandaredPrice: number = 0;
    public ReceivedQuantity: number = 0;
    public PendingQuantity: number = 0;
    public SubTotal: number = 0;
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


    //to get the data ...and use it for calculation
    public VatPercentage: number = 0;
    public ItemName: string = null;
    public SellingPrice: number = 0;
    public DiscountPercentage: number = 0;
    public CompanyName: string = null;
    public UOMName: string = null;
    ////to make the instance ItemMaster with new row
    public SelectedItem: PHRMItemMasterModel = null;
    public ItemListByItemType: any = [];
    public PHRMItemMaster: PHRMItemMasterModel = new PHRMItemMasterModel();

    public Item: PHRMItemMasterModel = null;
    public ItemType: PHRMItemTypeModel = null;
    public PurchaseOrderItemValidator: FormGroup = null;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.PurchaseOrderItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'Quantity': ['', Validators.compose([Validators.required, this.wholeNumberRequired])],
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
            if (control.value % 1 != 0) return { 'wrongDecimalValue': true };
        }
        else
            return { 'wrongDecimalValue': true };
    }

}