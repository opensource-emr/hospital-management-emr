
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { WardInventoryReturnItemsModel } from './ward-inventory-return-items.model';

//swapnil-2-april-2021 
export class WardInventoryReturnModel {
    public ReturnId: number = 0;
    public TargetStoreId: number = 0;
    public SourceStoreId: number = 0;
    public ItemId: number = 0;
    public ItemName: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public ModifiedBy: number = 0;
    public ModifiedOn: string = '';
    public Remarks: string = "";
    public ReturnDate: string = "";

    public ReturnStatus = '';
    public IssueNo = 0;
    public IsCancel = 0;
    public CancelRemarks = '';
    public RequisitionNo = '';
    public ReturnValidator: FormGroup = null;
    public ReturnItemsList: Array<WardInventoryReturnItemsModel> = new Array<WardInventoryReturnItemsModel>();
    public VerificationId = 0;
    public EmpFullName: string = '';
    IsActive: boolean = false;
    //for display purpose
    public SourceStoreName : string = "";
    public TargetStoreName : string = "";
    constructor() {

        var _formBuilder = new FormBuilder();
        this.ReturnValidator = _formBuilder.group({
            // 'StoreId': ['', Validators.compose([Validators.required])],
            // 'BarCodeNumber': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.ReturnValidator.dirty;
        else
            return this.ReturnValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.ReturnValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.ReturnValidator.valid;
        }
        else
            return !(this.ReturnValidator.hasError(validator, fieldName));
    }
}


export interface IReturnableAsset {
    BarCodeNumber: number;
    StockId: number;
}
export class MAP_Return_FixedAsset {

    ReturnItemId: number;
    FixedAssetStockId: number;
    constructor(fixedAssetStockId: number) {
        this.FixedAssetStockId = fixedAssetStockId;
    }
}