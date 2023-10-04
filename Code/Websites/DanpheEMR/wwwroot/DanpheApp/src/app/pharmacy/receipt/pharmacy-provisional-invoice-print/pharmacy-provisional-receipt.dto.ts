import { PatientInfo_DTO } from "../pharmacy-invoice-print/pharmacy-invoice-print.dto";
import { PharmacyProvisionalReceiptItem_DTO } from "./pharmacy-provisional-receipt-item.dto";

export class PharmacyProvisionalReceipt_DTO {
    PatientInfo: PatientInfo_DTO;
    ProviderNMCNumber: string = '';
    ProviderName: string = '';
    UserName: string = '';
    ClaimCode: number = null;
    PolicyNo: string = '';
    SubTotal: number = 0;
    DiscountAmount: number = 0;
    VATAmount: number = 0;
    CoPaymentCashAmount: number = 0;
    CoPaymentCreditAmount: number = 0;
    TotalAmount: number = 0;
    InvoiceDate: string = null;
    ProvisionalInvoiceItems: PharmacyProvisionalReceiptItem_DTO[];
    CancellationReceiptNo: number = null;
    ReceiptNo: number = 0; // add this receipt no due to prod build issue: Rusha 11th july 2023
}