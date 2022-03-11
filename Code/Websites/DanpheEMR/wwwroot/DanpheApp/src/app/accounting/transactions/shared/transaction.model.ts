import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';
import { TransactionItem } from './transaction-item.model';
import { TransactionLink } from "./transaction-link.model";
import { BillingAccountingSyncModel } from './billing-accounting-sync.model';

export class TransactionModel {
    public TransactionId: number = 0;
    public VoucherId: number = null;
    public FiscalYearId: number = 0;
    public TransactionDate: string = null;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public IsBackDateEntry: boolean = false;
    public Remarks: string = "";
    public PayeeName: string = "";
    public ChequeNumber: number = null;
    //public ReferenceTransactionId: number = 0;
    public SectionId: number = null;
    public VoucherNumber: string = "";
    public TotalAmount: number = 0;
    public TransactionItems: Array<TransactionItem> = new Array<TransactionItem>();
    public TransactionLinks: Array<TransactionLink> = new Array<TransactionLink>();
    public BillSyncs: Array<BillingAccountingSyncModel> = new Array<BillingAccountingSyncModel>();
    public TransactionValidator: FormGroup = null;
    public BillingAccountingSyncIds: string = "";
    //only used in client side
    public RefTxnVoucherNumber: number = null;
    public VoucherHeadId: number;
    public TransactionType: string = "";
    public TUId: number = null;
    public DayVoucherNumber:number=null;

    public ModifiedBy: number = 0;
    public ModifiedOn: string = null;
    public Reason: string = null;
    constructor() {
        var _formBuilder = new FormBuilder();
        this.TransactionValidator = _formBuilder.group({
            'VoucherId': ['', Validators.compose([])],
            'PayeeName' : ['', Validators.required],
            'ChequeNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]+$')])],
            'Remarks': ['', Validators.compose([Validators.maxLength(500)])],
            'RefTxnVoucherNumber': ['', Validators.compose([])],
            'VoucherHead': ['', Validators.required],
            'TransactionDate': ['', Validators.compose([Validators.required, this.dateValidators])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TransactionValidator.dirty;
        else
            return this.TransactionValidator.controls[fieldName].dirty;
    }

  public IsValid(): boolean{ if (this.TransactionValidator.valid) { return true; } else { return false; } }
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
    public IsEditable:boolean=null;  
    public VoucherNumber:number=0;
    public TransactionItems: Array<{
        LedgerGroupName: string,
        LedgerName: string,
        Name: string,
        DrCr: boolean,
        Amount: number,
        Details: any[],
        SupplierDetails: any[],
        TransactionType: any[],
        Remarks: string,
        VoucherNumber: any[],
    }> = []
    public HospitalId : number = 0;
}
//export class BillingItemsUpdateModel {
//    public BillingTransactionItemId: number = 0;
//    public IsTransferredToACC: number = 0;
//}