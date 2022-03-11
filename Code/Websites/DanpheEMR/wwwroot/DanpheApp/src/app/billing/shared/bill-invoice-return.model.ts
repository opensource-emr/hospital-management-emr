
import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms'
import { BillInvoiceReturnItemsModel } from './bill-invoice-return-items.model';
import { BillingTransactionItem } from './billing-transaction-item.model';

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
    public Tender: number = null;
    public ReturnedItems: Array<BillingTransactionItem> = [];//Rajesh:7Aug19 -- this can be removed after removing partial return 
    public ReturnInvoiceItems: Array<BillInvoiceReturnItemsModel> = [];//Sud-1May'21 for Credit Note

    public PaymentMode: string = null;
    public IsInsuranceBilling: boolean = false;
    public InsuranceProviderId: number = null;
    public BillStatus: string = null;
    public DiscountReturnAmount:number = 0;
    public DiscountFromSettlement:number = 0;

}