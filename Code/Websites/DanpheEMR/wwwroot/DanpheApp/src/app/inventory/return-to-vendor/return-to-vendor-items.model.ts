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
    public CreditNoteNo: number = null;
    public StockId: number = null;
    public Quantity: number = null;
    public ItemRate: number = null;
    public TotalAmount: number = null;
    public VATAmount: number = null;
    public Remark: string = null;
    public ReturnType : string = null;
    public CreatedOn : string = null;
    public CreatedBy: number = null;
    public ItemCode: string = null;
    public SupplierBillNo: string = null;
    public Item: ItemMaster = null;
    public VAT: number = null;
    public BatchNo: string = null;
    public AvailableQuantity: number = null;
    public batchNoList: Array<{ BatchNo: string, AvailableQuantity: number,GoodsReceiptId:number }> = new Array<{ BatchNo: string, AvailableQuantity: number,GoodsReceiptId:number }>();
    public ReturnItemValidator: FormGroup = null;
    CreatedByName: string;

    constructor() {

        var _formBuilder = new FormBuilder();
        this.ReturnItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'Quantity': ['', Validators.compose([Validators.required])],
            'BatchNo': ['', Validators.compose([Validators.required])],
            'GoodsReceiptId': ['', Validators.compose([Validators.required])],
            //'CreditNoteNo': ['', Validators.compose([Validators.required])],
            'Remark': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnItemValidator.dirty;
        else
            return this.ReturnItemValidator.controls[fieldName].dirty;
    }


    public IsValid():boolean{if(this.ReturnItemValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnItemValidator.valid;
        }
        else
            return !(this.ReturnItemValidator.hasError(validator, fieldName));
    }


}
