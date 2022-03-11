import {FormGroup,FormBuilder,Validators} from '@angular/forms'
import { WardSupplyAssetReturnItemsModel } from './wardsupply-asset-returnItems.model';
  //swapnil-2-april-2021 
export class WardSupplyAssetReturnModel {
    public ReturnId: number = 0;
    public SubStoreId: number = 0;
    public StoreId: number = 0;
    public ItemId: number = 0;
    public ItemName: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public ModifiedBy: number = 0;
    public ModifiedOn: string = '';
    public Remarks: string = "";
    public ReturnDate: string = "";

    public ReturnStatus = '';
    public IssueNo =0; 
    public IsCancel = 0;
    public CancelRemarks = '';
    public RequisitionNo = '';
    public ReturnValidator: FormGroup = null;
    public ReturnItemsList: Array<WardSupplyAssetReturnItemsModel> = new Array<WardSupplyAssetReturnItemsModel>();
    public VerificationId = 0;
    public EmpFullName:string='';
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