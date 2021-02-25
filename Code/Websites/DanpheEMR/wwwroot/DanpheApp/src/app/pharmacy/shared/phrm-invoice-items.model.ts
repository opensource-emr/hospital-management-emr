
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMItemMasterModel } from "./phrm-item-master.model";
import { PHRMGoodsReceiptItemsModel } from "./phrm-goods-receipt-items.model";
import { PHRMNarcoticRecordModel } from './phrm-narcotic-record';
export class PHRMInvoiceItemsModel {
  public InvoiceItemId: number = 0;
  public InvoiceId: number = 0;
  public CompanyId: number = null;
  public StockId: number = null;
  public ItemId: number = null;
  public ItemName: string = "";
  public BatchNo: string = "";
  public RequestedQuantity: number = 0;
  public Quantity: number = 0;
  public Price: number = null;
  public MRP: number = null;
  public GrItemPrice: number = null;
  public FreeQuantity: number = 0;
  public SubTotal: number = 0;
  public VATPercentage: number = 0;
  public DiscountPercentage: number = 0;
  public TotalDisAmt :number = 0;
  public TotalAmount: number = 0;
  public BilItemStatus: string = "";
  public Remark: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: string = "";
  public PrescriptionItemId: number = null;
  public ExpiryDate: string = null;
  public GoodReceiptItemId: number = 0;
  public GenericId: number = 0;
  public GenericName: string = null;
  public CounterId: number = 0;
  public RackNo: string = null;
  public NarcoticsRecord: PHRMNarcoticRecordModel = new PHRMNarcoticRecordModel();
  //for local usage
  public ItemTypeId: number = 0;
  public TotalQty: number = null;//for show total available quantity
  public Items: Array<PHRMItemMasterModel> = [];// new Array<PHRMItemMasterModel>();
  public selectedItem: any;// PHRMItemMasterModel ;// new PHRMItemMasterModel();
  public GRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  public SelectedGRItems: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  public CompanyName: string = "";
  public InvoiceItemsValidator: FormGroup = null;
  public enableItmSearch: boolean = true;
  public Dosage: string = null;
  public Frequency: number = 0;
  public Duration: number = 0;
  public PatientId: number = 0;
  public VisitType: string = "";
  public DiscountAmount: number = 0;//Rajesh22Aug : Only in client side
  public Tax: number = 0;//Rajesh22Aug : Only in client side
  public DiscountedAmount: number;
  public IsSelected: boolean = false;//sud: 4sept: Only for use in Client Side
  public CancelRemarks: string = null;//sud: 4Sept'18: For cancellation.
  public ReturnQty: number = 0;
  public ReturnedQty: number = 0;//for return invoice
  public DispatchQty: number = 0;
  public WardName: string = null; // only for use in client side

  public IsDuplicate: boolean = false;
  public  CreditNoteId:number; //for view only 


  //Constructor of class
  constructor() {
    var _formBuilder = new FormBuilder();
    this.InvoiceItemsValidator = _formBuilder.group({
      'ReturnQty': ['', Validators.compose([this.positiveNumberValdiator])],
      'Quantity': ['', Validators.compose([this.integerValidator,this.wholeNumberValidator])],
      'Price': ['', Validators.compose([this.positiveNumberValdiator])]
      // 'ItemTypeId': ['', Validators.required]               
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.InvoiceItemsValidator.dirty;
    else
      return this.InvoiceItemsValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.InvoiceItemsValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {

    if (fieldName == undefined)
      return this.InvoiceItemsValidator.valid;
    else
      return !(this.InvoiceItemsValidator.hasError(validator, fieldName));
  }
  public InvoiceItemsValidatortest() {
    var _formBuilder = new FormBuilder();
    _formBuilder.group({
      'Quantity': ['', Validators.compose([this.positiveNumberValdiatortest])]
    });
  }
  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }
  }
  wholeNumberValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      if(control.value % 1 != 0)
        return { 'wrongDecimalValue': true };
    }
    else
    return { 'wrongDecimalValue': true };
  }
  integerValidator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }
  }
  positiveNumberValdiatortest(control: FormControl): { [key: string]: boolean } {

    return { 'invalidNumber': true };
  }
}
