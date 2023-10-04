import { PatientInfo_DTO } from "../pharmacy-invoice-print/pharmacy-invoice-print.dto";
import { PharmacyProvisionalReturnReceiptItem_DTO } from "./pharmacy-provisional-return-receipt-item.dto";

export class PharmacyProvisionalReturnReceipt_DTO {
    PatientInfo: PatientInfo_DTO = new PatientInfo_DTO();
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
    ReturnDate: string = null;
    ProvisionalInvoiceItems: PharmacyProvisionalReturnReceiptItem_DTO[];
    CancellationReceiptNo: number = null;
}