import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ItemMaster } from "../../inventory/shared/item-master.model";

export class PurchaseOrderDraftItem {
    DraftPurchaseOrderItemId: number = 0;
    DraftPurchaseOrderId: number = 0;
    ItemCategory: string = "Consumables";
    ItemId: number = 0;
    Quantity: number = 0;
    ItemRate: number = 0;
    SubTotal: number = 0;
    VATPercentage: number = 0;
    VATAmount: number = 0;
    TotalAmount: number = 0;
    Remarks: string = "";
    ItemSpecification: string = "";
    VendorItemCode: string = null;
    CreatedBy: number = 0;
    CreatedOn: string = "";
    ModifiedBy: number = null;
    ModifiedOn: string = null;
    IsActive: boolean = true;
    SelectedItem: ItemMaster = new ItemMaster();
    Code: string = "";
    UOMName: string = "";
    isItemDuplicate: boolean = false;
    ItemName: string = "";
    IsDiscarded: boolean = false;
    public PurchaseOrderDraftItemValidator: FormGroup = null;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.PurchaseOrderDraftItemValidator = _formBuilder.group({
            'ItemId': ['', [Validators.required, this.registeredItemValidator]],
            'Quantity': ['', [Validators.required, this.positiveNumberItemValdiator]],
            'ItemRate': ['', [Validators.required, this.positiveNumberValdiator]],
            'VATPercentage': [0, [Validators.required, this.positiveNumberValdiator]]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PurchaseOrderDraftItemValidator.dirty;
        else
            return this.PurchaseOrderDraftItemValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean { if (this.PurchaseOrderDraftItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PurchaseOrderDraftItemValidator.valid;
        }
        else
            return !(this.PurchaseOrderDraftItemValidator.hasError(validator, fieldName));
    }
    registeredItemValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value && typeof (control.value) == "object" && control.value.ItemId > 0)
            return;
        else
            return { 'notRegisteredItem': true };
    }
    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'positivenum': true };
        }
    }
    positiveNumberItemValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'positivenum': true };
        }
    }
}