import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PHRMStoreStockModel {
  public StoreStockId: number = 0;
  public StoreId: number = 0;
  public ItemId: number = 0;
  public BatchNo: string = "";
  public ExpiryDate: string = "";
  public Quantity: number = 0;
  public FreeQuantity: number = 0;
  public Price: number = 0;
  public DiscountPercentage: number = 0;
  public VATPercentage: number = 0;
  public CCCharge: number = 0;
  public SubTotal: number = 0;
  public TotalAmount: number = 0;
  public InOut: string = null;
  public RefernceNo: number = 0;
  public ReferenceItemCreatedOn: string = "";
  public TransactionType: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: Date = new Date();
  public ModifiedBy: number = 0;
  public ModifiedOn: Date = new Date();
  public MRP: number = 0;
  public GoodsReceiptItemId: number = 0;
  public GoodReceiptPrintId: number = 0;
  public Remark: string = "";
  public UpdatedQty: number = 0;
  public DispensaryId: number = 0;
  public IsActive: boolean = null;
  public StoreManageValidator: FormGroup = null;
  //Constructor of class
  constructor() {
    var _formBuilder = new FormBuilder();
    this.StoreManageValidator = _formBuilder.group({
      'UpdatedQty': ['', Validators.compose([this.positiveNumberValdiator,this.wholeNumberRequired])],
      //'Price': ['', Validators.compose([this.positiveNumberValdiator])]
      'Remark': ['', Validators.required],
      'InOut': ['', Validators.required]
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.StoreManageValidator.dirty;
    else
      return this.StoreManageValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.StoreManageValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined)
      return this.StoreManageValidator.valid;
    else
      return !(this.StoreManageValidator.hasError(validator, fieldName));
  }

  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value < 0)
        return { 'invalidNumber': true };
    }

  }
  wholeNumberRequired(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
        if (control.value % 1 != 0) return { 'wrongDecimalValue': true };
    }
    else
    return { 'wrongDecimalValue': true };
}


}
