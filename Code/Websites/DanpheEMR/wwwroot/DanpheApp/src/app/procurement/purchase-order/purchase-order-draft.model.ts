import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { PurchaseOrderDraftItem } from "./purchase-order-draft-item.model";

export class PurchaseOrderDraft {
    DraftPurchaseOrderId: number = 0;
    DraftPurchaseOrderNo: number = 0;
    FiscalYearId: number = 0;
    VendorId: number = 0;
    Status: string = "";
    SubTotal: number = 0;
    DiscountAmount: number = 0;
    VATAmount: number = 0;
    TotalAmount: number = 0;
    CreatedBy: number = 0;
    CreatedOn: string = "";
    DeliveryAddress: string = "";
    CurrencyId: number = 0;
    Remarks: string = "";
    ModifiedBy: number = null;
    ModifiedOn: string = null;
    DeliveryDate: string = null;
    PODGroupId: number = 0;
    InvoicingAddress: string = "";
    ContactPersonName: string = "";
    ContactPersonEmail: string = "";
    IsActive: boolean = true;
    DiscardedOn: string = null;
    DiscardRemarks: string = "";
    ReferenceNo: string = "";
    VendorName: string = "";
    VendorCode: string = "";
    VendorContact: string = "";
    DraftCreatedBy: string = "";
    LastUpdateBy: string = "";
    LastUpdateOn: string = "";
    CurrencyCode: string = "";
    VendorPANNumber: string = "";
    VendorEmail: string = "";
    BankDetails: string = "";
    VendorAddress: string = "";
    IsModificationAllowed: boolean = false;
    PurchaseOrderDraftItems: Array<PurchaseOrderDraftItem> = new Array<PurchaseOrderDraftItem>();
    public PurchaseOrderDraftValidator: FormGroup = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.PurchaseOrderDraftValidator = _formBuilder.group({
            'VendorId': ['', [Validators.required, this.registeredVendorValidator]],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.PurchaseOrderDraftValidator.dirty;
        else
            return this.PurchaseOrderDraftValidator.controls[fieldName].dirty;
    }
    public IsValid(): boolean { if (this.PurchaseOrderDraftValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.PurchaseOrderDraftValidator.valid;
        }
        else
            return !(this.PurchaseOrderDraftValidator.hasError(validator, fieldName));
    }
    registeredVendorValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value && typeof (control.value) == "object" && control.value.VendorId > 0)
            return;
        else
            return { 'notRegisteredVendor': true };
    }
}