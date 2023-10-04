import { InvoiceItemDetailToBeReturn } from "./invoice-item-detail-tobe-return.model";

export class InvoiceDetailToBeReturn {
    InvoiceReturnId: number = 0;
    SubTotal: number = 0;
    DiscountAmount: number = 0;
    DiscountPercentage: number = 0;
    VATPercentage: number = 0;
    VATAmount: number = 0;
    TotalAmount: number = 0;
    FiscalYearName: string = '';
    FiscalYearId: number = 0;
    CounterId: number = 0;
    PatientId: number = 0;
    BilStatus: string = null;
    Remarks: string = null;
    PaymentMode: string = null;
    StoreId: number = null;
    ReturnCashAmount: number = 0;
    ReturnCreditAmount: number = 0;
    ReferenceInvoiceNumber: string = null;
    ClaimCode: number = null;
    InvoiceReturnItems: Array<InvoiceItemDetailToBeReturn> = new Array<InvoiceItemDetailToBeReturn>();
    TaxableAmount: number = 0;
    NonTaxableAmount: number = 0;
    PaidAmount: number = 0;
    Tender: number = 0;
    Change: number = 0;
    Checked: boolean = false;
    PriceCategoryId: number = 0;
    OrganizationId: number = null;//these are Nullable Foreign Keys in DB so Can't set them as ZERO
    PrintCount: number = 0;
    InvoiceNo: string = '';
    SettlementId: number = null;//these are Nullable Foreign Keys in DB so Can't set them as ZERO
    VisitType: string = null;
    SchemeId: number = null;
    IsCoPayment: boolean = false;
    InvoiceId: number = null;
}
