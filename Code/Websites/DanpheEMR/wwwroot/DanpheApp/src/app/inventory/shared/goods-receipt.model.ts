import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms'
import { GoodsReceiptItems } from "./goods-receipt-item.model"
import { ENUM_GRItemCategory } from "../../shared/shared-enums";
import * as moment from 'moment/moment';
export class GoodsReceipt {
  public GoodsReceiptValidator: FormGroup = null;
  public VendorName: string = "";
  public VendorNo: string = "";
  public ContactAddress: string = "";
  public GRCategory: string = ENUM_GRItemCategory.Consumables;
  public IsCancel: boolean = false;
  AgingDays: number;
  SupplierId: number;
  length: number;
  public FromDate: string = "";
  public ToDate: string = "";
  public CancelRemarks: string = "";
  //added for Verification
  public IsVerificationEnabled: boolean = false;
  public VerifierList: any[] = [];
  public VerifierIds: string;
  public CurrentVerificationLevel: number;
  public CurrentVerificationLevelCount: any;
  public MaxVerificationLevel: any;
  public IsVerificationAllowed: boolean;
  public VerificationStatus: string;
  public GRStatus: string;
  public GoodsArrivalFiscalYearFormatted: string;
  public GoodsArrivalNo: number;
  public GoodsArrivalDate : string;
  public IMIRNo: number;
  public IMIRDate : string;
  constructor() {

    var _formBuilder = new FormBuilder();
    this.GoodsReceiptValidator = _formBuilder.group({
      //sanjit: 2Apr'20: GoodsReceiptDate somehow throws validation error when use with danphe-date-picker, so it is commented. 
      // 'GoodsReceiptDate': ['', Validators.compose([Validators.required])],
      'BillNo': ['', Validators.compose([Validators.required])],
      // 'DonationId': ['', Validators.compose([Validators.required])],
      'VendorId': ['', Validators.compose([Validators.required])],
      'PaymentMode': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.GoodsReceiptValidator.dirty;
    else
      return this.GoodsReceiptValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.GoodsReceiptValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.GoodsReceiptValidator.valid;
    }
    else
      return !(this.GoodsReceiptValidator.hasError(validator, fieldName));
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
  public GoodsReceiptID: number = 0;
  public GoodsReceiptNo: number = 0;
  public GoodsReceiptDate: string = moment().format('YYYY-MM-DD');
  public VendorBillDate: string = moment().format('YYYY-MM-DD');
  public PurchaseOrderId: number = null;
  public TotalAmount: number = 0;
  public Remarks: string = "";
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public VendorId: number = 0;
  public FiscalYearId: number = 0;
  public CurrentFiscalYear: string = "";
  public BillNo: string = null;
  public ReceivedDate: string = moment().format('YYYY-MM-DD HH:MM:ss');
  public ReceiptNo: string = null;
  public OrderDate: string = null;

  //SubTotal and VATTotal only for caculation and show purpose
  public SubTotal: number = 0;
  public VATTotal: number = 0;
  public CcCharge: number = 0;
  public Discount: number = 0;
  public DiscountAmount: number = 0;
  public TDSRate: number = 0;
  public TDSAmount: number = 0;
  public TotalWithTDS: number = 0;
  public PrintCount: number = 0;
  //public SelectedItem: any = null;//sud:11Apr'20-- this was misused.. hence removing.
  public CreditPeriod: number = 0;
  public PaymentMode: string;
  public OtherCharges: number = 0;
  public GoodsReceiptItem: Array<GoodsReceiptItems> = new Array<GoodsReceiptItems>();

  //for other charges
  public InsuranceCharge: number = 0;
  public CarriageFreightCharge: number = 0;
  public PackingCharge: number = 0;
  public TransportCourierCharge: number = 0;
  public OtherCharge: number = 0;

  //for edit option
  public IsTransferredToACC: boolean = false;
  public ModifiedBy: number = null;
  public ModifiedOn: Date = null;

  //for Donations purpose tilganga hospital in INV_TXN_FixedAssetStock table 
  public DonationId: any;
}
