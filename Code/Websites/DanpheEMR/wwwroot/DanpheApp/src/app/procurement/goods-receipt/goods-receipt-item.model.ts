import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import * as moment from 'moment/moment';
import { CommonValidators } from "../../shared/common-validator";
import { GoodsReceiptOtherChargeModel, GROtherChargesItemModel } from './goods-receipt-other-charges.model';
export class GoodsReceiptItems {

  public GoodsReceiptItemId: number = 0;
  public GoodsReceiptId: number = 0;
  public ItemId: number = 0;
  public BatchNO: string = null;
  public ExpiryDate: string = "";
  public ArrivalQuantity: number = 0;
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
  public ItemName: string = "";
  public VAT: number = 0;
  public SubTotal: number = 0;
  public PendingQuantity: number = 0;
  public DiscountPercent: number = 0;
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
  public MSSNO: string = "";
  public UOMName: string = "";
  public GRItemSpecification: string = '';
  public Remarks: string = '';
  ItemCategory: string = '';
  filteredItemList: any[] = []; // added for item level filter for Capital and Consumable Goods
  StockId: any;
  PoItemId: number = null;//sud:6Sep'21--While coming 
  isItemDuplicate: boolean = false; // used in GR-Add UI for duplicate alert.

  public Specification: string = ""; // for UI part
  public Unit: string = ""; // for UI part added
  public OtherChargesModel: GoodsReceiptOtherChargeModel = new GoodsReceiptOtherChargeModel();
  public OtherChargesModelList: GROtherChargesItemModel[] = [];

  public GRItemCharges: GRItemChargesDTO[] = [];
  public CostPrice: number = 0;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.GoodsReceiptItemValidator = _formBuilder.group({
      'ReceivedQuantity': ['', Validators.compose([Validators.required, this.positiveNumber])],
      'ItemId': ['', Validators.compose([Validators.required])],
      'ItemRate': ['', Validators.compose([Validators.required, this.positiveNumber])],
      'ItemCategory': [this.ItemCategory, Validators.required],
      'OtherCharge': [0, [Validators.required, Validators.min(0)]],
      'FreeQuantity': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
      'CcCharge': ['', Validators.compose([Validators.required, this.positiveNumberValdiator])],
      'DiscountPercent': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'VAT': [0, [Validators.required, Validators.min(0), Validators.max(100)]]
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
  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value < 0)
        return { 'positivenum': true };
    }
  }
  //This is for ItemRate and Quantity (must be greater than 0)
  positiveNumber(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'positivenumber': true };
    }
  }
}

export class GRItemChargesDTO {
  public Id: number;
  public ChargeName: string = "";
  public TotalAmount: number;

}
