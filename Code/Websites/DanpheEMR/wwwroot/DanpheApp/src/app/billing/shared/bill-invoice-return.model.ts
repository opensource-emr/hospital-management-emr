
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'

export class BillInvoiceReturnModel {
    public BillReturnId: number = 0;
    public CreditNoteNumber: number = null;
    public RefInvoiceNum: number = null;
    public PatientId: number = null;
    public FiscalYearId: number = null;
    public FiscalYear: string = null;
    public BillingTransactionId: number = null;
    public SubTotal: number = null;
    public DiscountAmount: number = null;
    public TaxableAmount: number = null;
    public TaxTotal: number = null;
    public TotalAmount: number = null;
    public Remarks: string = null;
    public CounterId: number = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public IsActive: boolean = true;
    public IsRemoteSynced: boolean = false;
    public TaxId: number = null;
    public InvoiceCode: string = null;
}