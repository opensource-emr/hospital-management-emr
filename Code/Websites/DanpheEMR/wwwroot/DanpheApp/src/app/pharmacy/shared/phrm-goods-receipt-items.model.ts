import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { PHRMItemMasterModel } from './phrm-item-master.model';
import { PHRMPackingTypeModel } from './phrm-packing-type.model';

export class PHRMGoodsReceiptItemsModel {

    public GoodReceiptItemId: number = 0;
    public GoodReceiptId: number = 0;
    public CompanyName: string = null;
    public CategoryName: string = null;
    public SupplierName: string = null;
    public ItemId: number = 0;
    public GenericName: string = null;
    public ItemName: string = null;
    public BatchNo: string = "";
    public update: boolean;
    //public ExpiryDate: Date = null;
    public ExpiryDate: string = "";
    //public ManufactureDate: string = "";
    public PackingQty: number = 0;
    public ItemQTy: number = 0;
    public VATAmt: number;
    public ReceivedQuantity: number = 0;
    public FreeQuantity: number = 0;
    public RejectedQuantity: number = 0;
    public UOMName: string = null;
    public SellingPrice: number = 0;
    public GRItemPrice: number = 0;
    public FreeGoodsAmount: number = 0;
    public SubTotal: number = 0;
    public VATPercentage: number = 0;
    public CCCharge: number = 0;
    public DiscountPercentage: number = 0;
    public TotalAmount: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: Date = null;
    public ModifiedBy: number = 0;
    public ModifiedOn: Date = null;
    public MRP: number = 0;
    public AvailableQuantity: number = 0;
    public TotalQuantity: number = 0; //rohit: for display purpose only.As per mediplus requirement, if free qty is enabled then totalqty should be shown with sum of itemqty and freeqty;
    public PendingQuantity: number = 0;
    public modQuantity: number = 0;
    public curtQuantity: number = 0;
    public QtyDiffCount: number = 0;
    public StkManageInOut: string = "";
    public GoodReceiptItemValidator: FormGroup = null;
    public SelectedItem: any;
    public CounterId: number = 0;
    public GrTotalDisAmt: number = 0;
    //for local use only
    public Margin: number = 0; // use in calculation logic
    public AdjustedMargin: number = 0; // use only for display purpose
    public VATAmount: any;
    public DiscountAmount: any;
    public PackingName: any;
    public StripRate: number = 0;
    public StripQty: number = 0;
    public IndexOnEdit: number;
    public StockId: number;
    public Packing: PHRMPackingTypeModel = null;
    IsItemDiscountApplicable: boolean;
    StripMRP: any;
    FreeStripQuantity: any;
    IsPacking: boolean;
    public IsCancel: boolean = false;
    public PackingTypeId: number;
    StoreStockId: number;
    public ItemRateHistory: Array<null> = new Array<null>();
    public ItemMRPHistory: Array<null> = new Array<null>();
    public IsItemAltered: boolean; // used as if that GR done item is already dispatched or sent to other store Or posted to Accouting.


    constructor() {

        var _formBuilder = new FormBuilder();
        this.GoodReceiptItemValidator = _formBuilder.group({
            'ItemName': ['', Validators.compose([Validators.required])],
            //'PackingQuantity': ['', Validators.compose([Validators.required])],
            'ItemQTy': ['', Validators.compose([this.positiveValueRequired, this.wholeNumberRequired])],
            //'ReceivedQuantity': ['', Validators.compose([Validators.required, this.positiveValueRequired, this.wholeNumberRequired])],
            //'ManufactureDate': ['', Validators.compose([Validators.required, this.pastDateValidator])],
            'ExpiryDate': ['', Validators.compose([Validators.required, this.dateValidator])],
            //'FreeQuantity': ['', Validators.compose([Validators.required])],
            'GRItemPrice': ['', Validators.compose([Validators.required, this.positiveValueRequired])],
            'MRP': ['', Validators.compose([Validators.required])],
            'BatchNo': ['', Validators.compose([Validators.required])],
            'AdjustedMargin': ['', Validators.compose([Validators.required, this.positiveOrZeroValueRequired])]
        });
    }


    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.GoodReceiptItemValidator.dirty;
        else
            return this.GoodReceiptItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.GoodReceiptItemValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.GoodReceiptItemValidator.valid;
        }
        else
            return !(this.GoodReceiptItemValidator.hasError(validator, fieldName));
    }
    positiveValueRequired(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value <= 0) {
                return { 'wrongValue': true };
            }
        }
        else {
            return { 'wrongValue': true };
        }
    }
    positiveOrZeroValueRequired(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value <= 0) {
                return { 'wrongValue': true };
            }
        }
        else {
            return null;
        }
    }
    wholeNumberRequired(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (control.value % 1 != 0) return { 'wrongDecimalValue': true };
        }
        else
            return { 'wrongDecimalValue': true };
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
        else
            return { 'wrongDate': true };
    }

    pastDateValidator(control: FormControl): { [key: string]: boolean } {

        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');
        //if positive then selected date is  of the past else selected date is of Future || selected year can't be of future
        if (control.value) {
            if ((moment(control.value).diff(currDate) > 0)
                || (moment(control.value).diff(currDate, 'years') > 1))
                return { 'wrongDate': true };
        }
        else
            return { 'wrongDate': true };
    }

    validExpireDate(control: any): boolean {
        var expDate = moment(control);
        //var currDate = moment();
        var daysDiff = moment(expDate).diff(moment(), 'days');
        if ((control && daysDiff > 180) || daysDiff < 0 || isNaN(daysDiff)) {
            return true;
        } else { return false; }
    }


}
