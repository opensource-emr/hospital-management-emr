import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMGoodsReceiptItemsModel } from "./phrm-goods-receipt-items.model";
export class PHRMWriteOffItemModel {
    public WriteOffItemId: number = 0;
    public WriteOffId: number = 0;
    public DispensaryId: number;
    public GoodReceiptItemId: number = 0;
    public ItemId: number = 0;
    public BatchNo: string = null;
    public ItemPrice: number = 0;
    public WriteOffQuantity: number = 0;
    public TotalAmount: number = 0;
    public WriteOffItemRemark: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public ExpiryDate: string = null;
    public FreeQuantity: number = 0;
    public MRP: number = 0;
    public WriteOffItemValidator: FormGroup = null;

    ////Flag to Check Proper Item Selected From ItemList or NOT
    public checkSelectedItem: boolean = false;
    /////Only To Display and Calculation Purpose
    public tempBatchNo: string = null;
    public SelectedItem: null;
    public ItemName: string = "";
    public SubTotal: number = 0;
    public TotalAvailableQuantity: number = 0;
    public AvailableQuantity: number = 0;
    public DiscountPercentage: number = 0;
    public VATPercentage: number = 0;
    public DiscountedAmount: number = 0;
    public BatchNoList: any = [];
    public TempBatchNoList: any = [];
    public UserName: string = null; // only for diplay in client side
    public VATAmount: number = null; // only for use in client side
    public SelectedGRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
    constructor() {
        var _formBuilder = new FormBuilder();
        this.WriteOffItemValidator = _formBuilder.group({
            'ItemId': ['', Validators.compose([Validators.required])],
            'WriteOffQuantity': ['', Validators.compose([this.positiveNumberValdiator])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.WriteOffItemValidator.dirty;
        else
            return this.WriteOffItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.WriteOffItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.WriteOffItemValidator.valid;
        }
        else
            return !(this.WriteOffItemValidator.hasError(validator, fieldName));
    }

    positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
        if (control) {
            if (control.value <= 0)
                return { 'invalidNumber': true };
        }
    }

}