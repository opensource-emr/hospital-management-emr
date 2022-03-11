import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

import { PHRMInvoiceReturnItemsModel } from './phrm-invoice-return-items.model'
import { PHRMNarcoticRecordModel } from './phrm-narcotic-record';
import { PHRMPatient } from "./phrm-patient.model";
export class PHRMInvoiceReturnModel {
    public InvoiceReturnId: number = 0;
    public InvoiceId: number = 0;
    public StoreId: number;
    public PatientId: number = null;
    public CounterId: number = null;
    public CreditNoteId: number = 0;
    public SubTotal: number = 0;
    public Tender: number = 0;
    public Change: number = 0;
    public DiscountAmount: number = 0;
    public DiscountPercentage: number = 0;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public PaidAmount: number = 0;
    public CreatedBy: number = 0;
    public CreatedOn: string = "";
    public Adjustment: number = 0;
    public PrintCount: number = 0;
    public InvoiceReturnItems: Array<PHRMInvoiceReturnItemsModel> = new Array<PHRMInvoiceReturnItemsModel>();
    public DepositDeductAmount: number = 0;
    public DepositAmount: number = 0;
    public DepositBalance: number = 0;
    public PaymentMode: string = "";
    public Remarks: string = "";
    //public InvoiceCode: string = "PHRM";
    public FiscalYearId: number;
    //only for read purpose
    public selectedPatient: PHRMPatient = new PHRMPatient();

    //only for show in list
    public PatientName: string = "";

    public InvoiceReturnValidator: FormGroup = null;
    public ClaimCode: number;
    // added for Manual Return
    IsManualReturn: boolean;
    ReferenceInvoiceNo: string;
    ReferenceInvoiceDate: string = moment().format('YYYY-MM-DD');
    VATPercentage: number = 0;
    TaxableAmount: number = 0;
    NonTaxableAmount: number = 0;

    CashDiscount: number = 0;
    SettlementId: number = null;
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.InvoiceReturnValidator = _formBuilder.group({
            'Remark': ['', Validators.compose([Validators.required])]
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InvoiceReturnValidator.dirty;
        else
            return this.InvoiceReturnValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean {
        if (this.InvoiceReturnValidator.valid) {
            return true;
        } else {
            return false;
        }
    }

    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.InvoiceReturnValidator.valid;
        else
            return !(this.InvoiceReturnValidator.hasError(validator, fieldName));
    }

    public EnableControl(formControlName: string, enabled: boolean) {
        let currCtrol = this.InvoiceReturnValidator.controls[formControlName];
        if (currCtrol) {
            if (enabled) {
                currCtrol.enable();
            }
            else {
                currCtrol.disable();
            }
        }
    }
}
