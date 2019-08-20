import {
  NgForm,
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

import { PHRMGoodsReceiptItemsModel } from './phrm-goods-receipt-items.model'
export class PHRMACCSuppliersModel  {

  public GoodReceiptId: number = 0;
  public GoodReceiptPrintId: number = 0;
  public PurchaseOrderId: number = 0;
  public SupplierId: number = 0;
  public GoodReceiptDate: string = "";
  public SubTotal: number = 0;
  public DiscountAmount: number = 0;
  public DiscountPercent: number = 0;
  public TotalAmount: number = 0;
  public Remarks: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: Date = null;
  public InvoiceNo: string = null;
  public Adjustment: number = 0;
  public IsCancel: boolean = false;
  public AgingDays: number = null;
  public TransactionType: string = "Credit";
  public StoreId: number = 0;
  public StoreName: string = "";
  public CreditPeriod: number = null;
  public Pin: number = 0;
  ////display purpose
  public VATAmount: number = 0;

  public GoodReceiptValidator: FormGroup = null;
  public GoodReceiptItem: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();

  constructor() {
    var _formBuilder = new FormBuilder();
    this.GoodReceiptValidator = _formBuilder.group({

      /// 'GoodReceiptDate': ['', Validators.compose([Validators.required, this.dateValidator])],

    }
    );
  }


  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.GoodReceiptValidator.dirty;
    else
      return this.GoodReceiptValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.GoodReceiptValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.GoodReceiptValidator.valid;
    }
    else
      return !(this.GoodReceiptValidator.hasError(validator, fieldName));
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    //if positive then selected date is of future else it of the past || selected year can't be of future
    if (control.value) {
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(control.value).diff(currDate, 'years') > 1))
        return { 'wrongDate': true };
    }


    else
      return { 'wrongDate': true };

  }
}


