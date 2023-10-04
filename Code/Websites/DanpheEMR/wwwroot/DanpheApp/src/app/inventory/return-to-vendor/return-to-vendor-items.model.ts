import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { ItemMaster } from '../../inventory/shared/item-master.model';

export class ReturnToVendorItem {
    public ReturnToVendorItemId: number = 0;
    public ReturnToVendorId: number = null;
    public VendorId: number = null;
    public ItemId: number = null;
    public VendorName: string = null;
    public ItemName: string = null;
    public GoodsReceiptItemId: number = null;
    public GoodsReceiptId: number = null;
    public GoodReceiptNo: number = null;
    public CreditNoteNo: number = null;
    public StockId: number = null;
    public Quantity: number = 0;
    public ItemRate: number = null;
    public TotalAmount: number = null;
    public VATAmount: number = null;
    public Remarks: string = null;
    public ReturnType: string = null;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ItemCode: string = null;
    public SupplierBillNo: string = null;
    public Item: ItemMaster = null;
    public VAT: number = 0;
    public BatchNo: string = null;
    public AvailableQuantity: number = null;
    public batchNoList: Array<{ BatchNo: string, AvailableQuantity: number, GoodsReceiptId: number }> = new Array<{ BatchNo: string, AvailableQuantity: number, GoodsReceiptId: number }>();
    public ReturnItemValidator: FormGroup = null;
    CreatedByName: string;
    ReturnItemRate: number = 0;
    DiscountAmount: number = 0;
    CCAmount: number = 0;
    SubTotal: number = 0;
    ReturnQuantity: number = 0;
  Remark: string = null;
   //This is net cost price during return formula= TotalReturnAmount/Total Ret Qty
    ReturnCostPrice: number = 0;
    constructor() {

        var _formBuilder = new FormBuilder();
        this.ReturnItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'Quantity': ['', [Validators.required, this.positiveNumberValdiator]],
            'BatchNo': ['', Validators.compose([Validators.required])],
            'GoodsReceiptNo': ['', Validators.compose([Validators.required])],
            //'CreditNoteNo': ['', Validators.compose([Validators.required])],
            'Remark': ['', Validators.compose([Validators.required])],
            'ReturnItemRate': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
            'DiscountAmount': ['', [Validators.required, this.positiveNumberValdiator]],
            'VATAmount': ['', [Validators.required, this.positiveNumberValdiator]],
            'CCAmount': ['', [Validators.required, this.positiveNumberValdiator]],
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnItemValidator.dirty;
        else
            return this.ReturnItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.ReturnItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnItemValidator.valid;
        }
        else
            return !(this.ReturnItemValidator.hasError(validator, fieldName));
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value < 0)
                return { 'positivenum': true };
        }
    }



}
