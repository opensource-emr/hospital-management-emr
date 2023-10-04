import { EmployeeCashTransaction } from "../billing-transaction.model";
import { PatientCreditInvoices_DTO } from "./bill-credit-invoice-details.dto";

export class BillNewSettlement_DTO {
    public SettlementId: number = 0;
    public SettlementType: string = "";
    public PatientId: number = 0;
    public PayableAmount: number = 0;
    public RefundableAmount: number = 0;
    public PaidAmount: number = 0;
    public ReturnedAmount: number = 0;
    public DepositDeducted: number = 0;
    public DueAmount: number = 0;
    public DiscountAmount: number = 0;
    public PaymentMode: string = "";
    public PaymentDetails: string = "";
    public CounterId: number = 0;
    public Remarks: string = "";
    public BillingTransactions = new Array<PatientCreditInvoices_DTO>();
    public PHRMInvoiceTransactionModels = new Array<PatientCreditInvoices_DTO>();
    public CollectionFromReceivable: number = 0;
    public DiscountReturnAmount: number = 0;
    public OrganizationId: number = null;
    public StoreId: number = null;
    public BillingUser: string = "";
    public BillReturnIdsCSV = new Array<any>();
    public empCashTransactionModel = new Array<EmployeeCashTransaction>();
}