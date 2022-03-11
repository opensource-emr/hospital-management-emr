
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { CommonValidators } from "../../shared/common-validator";
export class GoodsReceiptItems {

  public GoodsReceiptItemId: number = 0;
  public GoodsReceiptId: number = 0;
  public ItemId: number = 0;
  public ItemCategory: string = "";
  public BatchNO: string = "";
  public ExpiryDate: string = "";
  public InvoiceQuantity: number = 0;
  public ReceivedQuantity: number = 0;
  public FreeQuantity: number = 0;
  public RejectedQuantity: number = 0;
  public ItemRate: number = 0;
  public VATAmount: number = 0;
  public TotalAmount: number = 0;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public IsTransferredToACC: boolean = false;
  //Only for display purpose
  public ItemCode: string = "";
  public ItemName: string = "";
  public VAT: number = 0;
  public SubTotal: number = 0;
  public PendingQuantity: number = 0;
  public Discount: number = 0;
  public DiscountAmount: number = 0;
  public MRP: number = 0;
  public CcCharge: number = 0;
  public CcAmount: number = 0;
  public OtherCharge: number = 0;
  public CounterId: number = 0;
  public SelectedItem: any = "";
  public GoodsReceiptItemValidator: FormGroup = null;
  public Quantity: number = 0;
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;
  //for display purpose
  public itemPriceHistory: Array<any> = [];
  public IsEdited: boolean;
  public IsActive: boolean = true;
  public CancelledBy: any;
  //for Donations purpose tilganga hospital
  public DonationId: number = 0;

  public ManufactureDate: Date = null;
  public SamplingDate: Date = null;
  public NoOfBoxes: number = 0;
  public SamplingQuantity: number = 0;
  public IdentificationLabel: string = "";
  public SamplingBoxes: string = "";
  public IsSamplingLabel: string = "";
  public SampleRemoved: number = 0;
  public MaterialNO: string = "";
  public RegisterPageNumber:number=null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.GoodsReceiptItemValidator = _formBuilder.group({
      'ReceivedQuantity': ['', Validators.compose([Validators.required, CommonValidators.positivenum])],
      'ItemId': ['', Validators.compose([Validators.required])],
      'FreeQuantity': ['', Validators.compose([Validators.required])],
      'ItemRate': ['', Validators.compose([Validators.required, CommonValidators.positivenum])],
      //'VAT': ['', Validators.compose([Validators.required])],
      //'CcCharge': ['', Validators.compose([Validators.required])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.GoodsReceiptItemValidator.dirty;
    else
      return this.GoodsReceiptItemValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.GoodsReceiptItemValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.GoodsReceiptItemValidator.valid;
    }
    else
      return !(this.GoodsReceiptItemValidator.hasError(validator, fieldName));
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');
    //if positive then selected date is of future else it of the past || selected year can't be of future
    if (control.value) {
      if ((moment(control.value).diff(currDate) < 0)
        || (moment(control.value).diff(currDate, 'years') > 10)) //can make appointent upto 10 year from today only.
        return { 'wrongDate': true };
    }
    //else
    //    return { 'wrongDate': true };
  }
}
