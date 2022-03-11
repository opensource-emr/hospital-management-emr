import {FormGroup,FormBuilder,Validators} from '@angular/forms'
import { WardSupplyAssetRequisitionItemsModel } from './wardsupply-asset-requisitionItems.model';

export class WardSupplyAssetRequisitionModel {
    public RequisitionId: number = 0;
    public RequisitionDate: string = '';
    public CreatedBy: number = 0;
    public CreatedOn: string = '';
    public RequisitionStatus = '';
    public IssueNo =0; 
    public StoreId = 0;
    public SubStoreId = 0;
    public ModifiedOn = '';
    public ModifiedBy = 0;
    public IsCancel = 0;
    public CancelRemarks = '';
    public RequisitionNo = '';
    public Remarks = '';
    public RequisitionValidator: FormGroup = null;
    public RequisitionItemsList: Array<WardSupplyAssetRequisitionItemsModel> = new Array<WardSupplyAssetRequisitionItemsModel>();
    public VerificationId = 0;
    public EmpFullName:string='';
    constructor() {

        var _formBuilder = new FormBuilder();
        this.RequisitionValidator = _formBuilder.group({
          'StoreId': ['', Validators.compose([Validators.required])]
        });
      }
    
      public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
          return this.RequisitionValidator.dirty;
        else
          return this.RequisitionValidator.controls[fieldName].dirty;
      }
    
    
      public IsValid(): boolean { if (this.RequisitionValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
          return this.RequisitionValidator.valid;
        }
        else
          return !(this.RequisitionValidator.hasError(validator, fieldName));
      }
}   