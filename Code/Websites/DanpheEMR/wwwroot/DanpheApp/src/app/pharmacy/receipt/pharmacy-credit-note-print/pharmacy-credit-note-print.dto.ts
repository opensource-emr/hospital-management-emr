import { PatientInfo_DTO, PaymentMode } from "../pharmacy-invoice-print/pharmacy-invoice-print.dto";

export class PharmacyCreditNotePrint_DTO {
    InvoiceReturnId: number = null;
    InvoiceCode: string = '';
    ReceiptDate: string = '';
    ProviderName: string = '';
    ProviderNMCNumber: string = '';
    PrintCount: number = 0;
    CurrentFiscalYearName: string = '';
    CreditNoteNo: number = null;
    ReferenceInvoiceNo: string = '';
    ClaimCode: number = null;
    PolicyNo: number = null;
    PaymentMode: string = '';
    SubTotal: number = 0;
    DiscountPercentage: number = 0;
    DiscountAmount: number = 0;
    VATPercentage: number = 0;
    VATAmount: number = 0;
    CashAmount: number = 0;
    CreditAmount: number = 0;
    TaxableAmount: number = 0;
    NonTaxableAmount: number = 0;
    TotalAmount: number = 0;
    Tender: number = 0;
    Change: number = 0;
    CreditOrganizationName: string = '';
    Remarks: string = null;
    BillingUser: string = '';
    IsReturned: boolean = false;
    StoreId: number = 0;
    LocalReceiptDate: string = '';
    InvoiceItems: PharmacyCreditNotePrintItem_DTO[] = [];
    PaymentModeDetails: Array<PaymentMode> = new Array<PaymentMode>();
    PatientInfo: PatientInfo_DTO = new PatientInfo_DTO();
    StoreName: string = '';
    ReferenceInvoiceDate: string = '';

}

export class PharmacyCreditNotePrintItem_DTO {
    ItemName: string = '';
    GenericName: string = '';
    ItemDisplayName: string = '';
    Quantity: number = 0;
    ReturnedQty: number = 0;
    ExpiryDate: string = '';
    BatchNo: string = '';
    RackNo: string = '';
    SalePrice: number = 0;
    SubTotal: number = 0;
    DiscountAmount: number = 0;
    VATAmount: number = 0;
    TotalAmount: number = 0;
}