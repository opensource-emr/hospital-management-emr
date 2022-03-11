import { FormGroup, Validators, FormBuilder } from '@angular/forms'
import { PHRMGoodsReceiptItemsModel } from "./phrm-goods-receipt-items.model";
export class PHRMReturnToSupplierItemModel {


    public ReturnToSupplierItemId: number = 0;
    public ReturnToSupplierId: number = 0;
    public ItemId: number = 0;
    public BatchNo: string = null;
    public Quantity: number = 0;
    public OldItemPrice: number = 0;
    public ItemPrice: number = 0;
    public SubTotal: number = 0;
    public DiscountPercentage: number = 0;
    public VATPercentage: number = 0;
    public TotalAmount: number = 0;
    public ExpiryDate: string = null;
    public ReturnRemarks: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public GoodReceiptItemId: number = 0;
    public ReturnToSupplierItemValidator: FormGroup = null;
    ////get and display
    public SelectedItem: null;
    public ItemName: string = "";
    public TotalAvailableQuantity: number = 0;
    public BatchWiseAvailableQuantity: number = 0;
    public ReceivedQuantity: number = 0;
    public FreeQuantity: number = 0;
    public FreeQuantityReturn: number = 0;
    public FreeAmount: number = 0;
    public FreeAmountReturn: number = 0;
    public FreeRate: number = 0;
    public DiscountedAmount: number = 0;
    public MRP: number = 0;
    public BatchNoList: any = [];
    public TempBatchNoList: any = [];
    public CCCharge: any;
    public CheckQty: boolean = false;
    public checked: boolean;// for checking and uncheck item row in UI
    public SelectedGRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    constructor() {
        var _formBuilder = new FormBuilder();
        this.ReturnToSupplierItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            // 'TotalAvailableQuantity': ['', Validators.compose([Validators.required])],
            'Quantity': ['', Validators.compose([Validators.required])]
            // 'Checked':['',Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnToSupplierItemValidator.dirty;
        else
            return this.ReturnToSupplierItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.ReturnToSupplierItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnToSupplierItemValidator.valid;
        }
        else
            return !(this.ReturnToSupplierItemValidator.hasError(validator, fieldName));
    }

}
