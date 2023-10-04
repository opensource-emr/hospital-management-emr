import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';
import * as moment from 'moment';
import { ENUM_DateTimeFormat } from '../../../shared/shared-enums';
import { SubLedgerTransactionModel } from '../../settings/shared/sub-ledger.model';
import { TransactionItemDetailModel } from './transaction-item-detail.model';
import { TransactionLink } from './transaction-link.model';


export class TransactionItem {
    public TransactionItemId: number = 0;
    public TransactionId: number = 0;
    public LedgerId: number = 0;
    public DrCr: boolean = false;
    public Quantity: number = 1;
    public Amount: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public ChartOfAccountName: string = "";
    public LedgerGroupName: string = "";
    public TransactionItemValidator: FormGroup = null;
    //used only in client side
    public LedgerList: any = [];
    public LedgerName: string = "";
    public TransactionItemDetails: Array<TransactionItemDetailModel> = new Array<TransactionItemDetailModel>();
    public SupplierId: number = null;
    public VendorId: number = null;
    // used for grouping in client side
    public LedgerDr: number = 0;
    public LedgerCr: number = 0;
    public Description: string = "";
    public selLedger: any;
    //   public PatientId: number = null;
    //added for transaction details
    public IsTxnDetails: boolean = false;
    public Code: string = "";
    public SubLedgers: Array<SubLedgerTransactionModel> = new Array<SubLedgerTransactionModel>();
    public showSubledgerCreateButton: boolean = false;
    public CostCenterId: number = 1;
    public TransactionType: string = "";
    public TransactionLinks: Array<TransactionLink> = new Array<TransactionLink>();

    constructor() {
        this.CreatedOn = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute)
        var _formBuilder = new FormBuilder();
        this.TransactionItemValidator = _formBuilder.group({
            'LedgerId': [{}, Validators.compose([Validators.required])],
            'DrCr': ['', Validators.compose([Validators.required])],
            'Amount': ['', Validators.compose([this.numberValidator])],
            'CostCenter': ['', Validators.compose([Validators.required])],
            'SubLedgerId': [{}, Validators.compose([Validators.required])],
        });
    }
    public numberValidator(control: FormControl): { [key: string]: boolean } {
        if (control.value) {
            if (Number(control.value) < 0)
                return { 'invalidNumber': true };
        }
        else
            return { 'invalidNumber': true };

    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.TransactionItemValidator.dirty;
        else
            return this.TransactionItemValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean { if (this.TransactionItemValidator.valid) { return true; } else { return false; } }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined) {
            return this.TransactionItemValidator.valid;
        }
        else
            return !(this.TransactionItemValidator.hasError(validator, fieldName));
    }
}