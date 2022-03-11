import {
      NgForm,
      FormGroup,
      FormControl,
      Validators,
      FormBuilder,
      ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

import { PHRMGoodsReceiptItemsModel } from './phrm-goods-receipt-items.model'
export class PHRMGoodsReceiptModel {

      public GoodReceiptId: number = 0;
      public GoodReceiptPrintId: number = 0;
      public PurchaseOrderId: number = 0;
      public SupplierId: number = 0;
      public SupplierBillDate: string = moment().format("YYYY-MM-DD");
      public GoodReceiptDate: string = moment().format("YYYY-MM-DD");
      public SubTotal: number = 0;
      public TaxableSubTotal: number = 0;
      public NonTaxableSubTotal: number = 0;
      public DiscountAmount: number = 0;
      public DiscountPercentage: number = 0;
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
      public IsTransferredToACC: boolean = null;
      ////display purpose
      public VATAmount: number = 0;
      public FiscalYearId: number = 0;
      public CurrentFiscalYear: string = "";

      public UserName: any; //for UI view of username who created gr 
      public Time: any;      //for UI view of time of created gr
      public GoodReceiptValidator: FormGroup = null;
      public GoodReceiptItem: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
      IsPacking: boolean;
      IsItemDiscountApplicable: boolean;
      public PaymentStatus: string = "pending";

      constructor() {
            var _formBuilder = new FormBuilder();
            this.GoodReceiptValidator = _formBuilder.group({
                  'SubTotal': [],
                  'DiscountPercent': [],
                  'DiscountAmount': [],
                  'VATAmount': [],
                  'Adjustment': [],
                  'TotalAmount': []
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
