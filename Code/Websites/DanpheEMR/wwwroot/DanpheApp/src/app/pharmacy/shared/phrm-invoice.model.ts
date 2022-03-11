import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import * as moment from 'moment/moment';

import { PHRMInvoiceItemsModel } from './phrm-invoice-items.model';
import { PHRMNarcoticRecordModel } from './phrm-narcotic-record';
import { PHRMPatient } from "./phrm-patient.model";
export class PHRMInvoiceModel {
    public InvoiceId: number = 0;
    public StoreId: number;
    public InvoicePrintId: number = 0;
    public PatientId: number = null;
    public IsOutdoorPat: boolean = true;
    public PatientType: string = "";
    public CounterId: number = null;
    public TotalQuantity: number = null;
    public SubTotal: number = 0;
    public Tender: number = 0;
    public Change: number = 0;
    public DiscountAmount: number = 0;
    public DiscountPer: number = 0;
    public VATPercentage: number = 0;
    public VATAmount: number = 0;
    public TotalAmount: number = 0;
    public PaidAmount: number = 0;
    public BilStatus: string = "";
    public CreditAmount: number = 0;
    public Remark: string = "";
    public CreatedBy: number = 0;
    public CreateOn: string = "";
    public Adjustment: number = 0;
    public PrintCount: number = 0;
    public InvoiceItems: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public ProviderId: number = 0;
    public VisitType: string = "";
    public DepositDeductAmount: number = 0;
    public DepositAmount: number = 0;
    public DepositBalance: number = 0;
    public PaymentMode: string = "cash";
    public IsSelected: boolean = false; //Rajesh22Aug : Only in client side
    public InvoiceCode: string = "PHRM";
    public FiscalYear: string = "";
    public ProvisionalTotal: number = 0;
    public OrganizationId: number = null; //Shankar22May
    public CreditOrganizationName: string = null; //Shankar22May
    //only for read purpose
    public selectedPatient: PHRMPatient = new PHRMPatient();

    //only for show in list
    public PatientName: string = "";
    public payment: any;

    public InvoiceValidator: FormGroup = null;
    public ClaimCode: number;
    public ProviderName: string;
    public ProviderNMCNumber: string;
    public IsInsurancePatient: boolean;
    public Patient: any;
    public TaxableAmount: number = 0;
    public NonTaxableAmount: number = 0;
    public isSelected: boolean = true;
    public NetAmount: number = 0;

    public PHRMReturnIdsCSV:any[] = [];
    //Constructor of class
    constructor() {
        var _formBuilder = new FormBuilder();
        this.InvoiceValidator = _formBuilder.group({
            'Provider': ['', Validators.compose([Validators.required])],
            'VisitType': ['', Validators.compose([Validators.required])],
            'DiscountPer': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.InvoiceValidator.dirty;
        else
            return this.InvoiceValidator.controls[fieldName].dirty;
    }


    public IsValid(): boolean {
        if (this.InvoiceValidator.valid) {
            return true;
        } else {
            return false;
        }
    }

    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.InvoiceValidator.valid;
        else
            return !(this.InvoiceValidator.hasError(validator, fieldName));
    }

    public EnableControl(formControlName: string, enabled: boolean) {
        let currCtrol = this.InvoiceValidator.controls[formControlName];
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
