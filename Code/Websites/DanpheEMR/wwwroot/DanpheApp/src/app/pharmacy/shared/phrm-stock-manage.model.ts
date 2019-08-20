
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PHRMStockManageModel {
  public StockManageId: number = 0;
  public ItemId: number = null;
  public ItemName: string = "";
  public BatchNo: string = "";
  public Quantity: number = 0;
  public UpdatedQty: number = 0;
  public Price: number = null;
  public MRP: number = null;
  public SubTotal: number = 0;
  public VATPercentage: number = 0;
  public DiscountPercentage: number = 0;
  public TotalAmount: number = 0;
  public Remark: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: string = "";
  public InOut: string = null;
  public ExpiryDate: string = null;
  public GoodsReceiptItemId: number = 0;
  public StockManageValidator: FormGroup = null;
  //Constructor of class
  constructor() {
    var _formBuilder = new FormBuilder();
    this.StockManageValidator = _formBuilder.group({
      'UpdatedQty': ['', Validators.compose([this.positiveNumberValdiator])],
      //'Price': ['', Validators.compose([this.positiveNumberValdiator])]
      'Remark': ['', Validators.required],
      'InOut': ['', Validators.required]
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.StockManageValidator.dirty;
    else
      return this.StockManageValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.StockManageValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined)
      return this.StockManageValidator.valid;
    else
      return !(this.StockManageValidator.hasError(validator, fieldName));
  }

  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value < 0)
        return { 'invalidNumber': true };
    }

  }

}
