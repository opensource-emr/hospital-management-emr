import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

import * as moment from "moment";
 //swapnil-2-april-2021 
export class FixedAssetDispatchItems {
  public FixedAssetStockId:number=0;
  public DispatchItemId: number = 0;
  public DispatchId: number = 0;
  public RequisitionItemId: number = 0;
  public ItemId: number = 0;
  public ItemName: string = "";
  public BatchNo: string="";
  public ExpiryDate: string="";
  public BarCodeNumber: string="";
  public MRP: number;
  public Price: number;
  public SubTotal:number;
  public Remark: string;
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public TotalQty:number;
  public RequestedQuantity: number | null;
  public PendingQuantity: number | null;
  public ReceivedQuantity: number | null;
  public CancelQuantity: number | null;
  public AvailableQuantity: number | null;
  

  public SourceStoreId: number;
  public TargetStoreId: number;
  public RequisitionId: number = 0;
 
  public DispatchedQuantity: number = 0;
  public ReceivedBy: string = "";
  //ony for Display
  public DispatchedDate: string = moment().format();
   //ony for Display
  public selectedBarCode: any;

  public Code: string;
  public UOMName: string;
  public RequiredQuantity: number = 0;
  public IsDisQtyValid: boolean = true;
  public StoreRackName: string;
  public CostPrice: number;
  public StandardRate: number;
  public ItemRemarks: string;
  public ReceivedRemarks: string;
  public SelectedItem: any;

  
  public RequisitionItemValidator: FormGroup = null;
  constructor() {

      var _formBuilder = new FormBuilder();
      this.RequisitionItemValidator = _formBuilder.group({
        'ItemId': ['', Validators.compose([Validators.required])],
        
      });
    }
  
    public IsDirty(fieldName): boolean {
      if (fieldName == undefined)
        return this.RequisitionItemValidator.dirty;
      else
        return this.RequisitionItemValidator.controls[fieldName].dirty;
    }
  
  
    public IsValid(): boolean { if (this.RequisitionItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
      if (fieldName == undefined) {
        return this.RequisitionItemValidator.valid;
      }
      else
        return !(this.RequisitionItemValidator.hasError(validator, fieldName));
    }
  
    positiveNumberValidator(control: FormControl): { [key: string]: boolean } {
      if (control) {
        if (control.value <= 0)
          return { 'invalidNumber': true };
      }
  
    }

}
