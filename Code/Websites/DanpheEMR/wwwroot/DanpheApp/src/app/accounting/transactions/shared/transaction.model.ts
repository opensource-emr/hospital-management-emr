import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';
import * as moment from 'moment/moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';
import { BillingAccountingSyncModel } from './billing-accounting-sync.model';
import { TransactionItem } from './transaction-item.model';

export class TransactionModel {
    public TransactionId: number = 0;
    public VoucherId: number = 0;
    public FiscalYearId: number = 0;
    public TransactionDate: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public IsBackDateEntry: boolean = false;
    public Remarks: string = "";
    public PayeeName: string = "";
    public ChequeNumber: number = 0;
    //public ReferenceTransactionId: number = 0;
    public SectionId: number = 0;
    public VoucherNumber: string = "";
    public TotalAmount: number = 0;
    public TransactionItems: Array<TransactionItem> = new Array<TransactionItem>();
    //public TransactionLinks: Array<TransactionLink> = new Array<TransactionLink>();
    public BillSyncs: Array<BillingAccountingSyncModel> = new Array<BillingAccountingSyncModel>();
    public TransactionValidator: FormGroup = null;
    public BillingAccountingSyncIds: string = "";
    //only used in client side
    public RefTxnVoucherNumber: number = 0;
    // public CostCenterId: number = 0; //Dev : 26 Jan, 2023 Replaced VoucherHeadId to CostCenterId : DevN : 13th April 23 Costcenter is moved into item level...
    public TransactionType: string = "";
    public TUId: number = 0;
    public DayVoucherNumber: number = 0;

    public ModifiedBy: number = 0;
    public ModifiedOn: string = null;
    public Reason: string = null;
    public ChequeDate: string = null;
    public VoucherSerialNo: number = 0;
    public IsVoucherReversed: boolean = false;
    constructor() {
        this.TransactionDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
        var _formBuilder = new FormBuilder();
        this.TransactionValidator = _formBuilder.group({
            'VoucherId': ['', Validators.compose([])],
            'PayeeName': ['', Validators.required],
            'ChequeNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]+$')])],
            'Remarks': ['', Validators.compose([Validators.maxLength(500)])],
            'RefTxnVoucherNumber': ['', Validators.compose([])],
            //'CostCenter': ['', Validators.required],
            'TransactionDate': ['', Validators.compose([Validators.required, this.dateValidators])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TransactionValidator.dirty;
        else
            return this.TransactionValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.TransactionValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TransactionValidator.valid;

        }
        else
            return !(this.TransactionValidator.hasError(validator, fieldName));
    }

    dateValidators(control: FormControl): { [key: string]: boolean } {

        //get current date, month and time
        var currDate = moment().format('YYYY-MM-DD');

        //if positive then selected date is of future else it of the past
        if ((moment(control.value).diff(currDate) > 0) ||
            (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
            return { 'wrongDate': true };
    }
    public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
        let validator = null;
        if (validatorType == 'required' && onOff == "on") {
            validator = Validators.compose([Validators.required]);
        }
        else {
            validator = Validators.compose([]);
        }
        this.TransactionValidator.controls[formControlName].validator = validator;
        this.TransactionValidator.controls[formControlName].updateValueAndValidity();
    }

}
export class TransactionViewModel {
    public TransactionId: number = 0;
    public VoucherName: string = null;
    public FiscalYearName: string = null;
    public TransactionDate: string = null;
    public Remarks: string = null;
    public IsBackDateEntry: boolean = false;
    public VoucherType: string = null;
    public IsGroupTxn: boolean = true;
    public IsEditable: boolean = null;
    public VoucherNumber: number = 0;
    public IsVerified: boolean = false;
    public IsVoucherReversed: boolean = false;
    public VerifiedBy: string = "";
    public Preparedby: string = "";
    public IsAllowReverseVoucher: boolean = false;
    public ChequeNumber: string = "";
    public PayeeName: string = "";
    public FiscalYear: string = "";
    public TransactionItems: Array<{
        LedgerGroupName: string,
        LedgerName: string,
        Name: string,
        DrCr: boolean,
        Amount: number,
        Code: string,
        Details: any[],
        SupplierDetails: any[],
        TransactionType: any[],
        Remarks: string,
        VoucherNumber: any[],
        SubLedgers: any[]
        CostCenterId: number,
        CostCenterName: string,
        Description: string
    }> = []
    public HospitalId: number = 0;
}
//export class BillingItemsUpdateModel {
//    public BillingTransactionItemId: number = 0;
//    public IsTransferredToACC: number = 0;
//}