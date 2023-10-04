import * as moment from "moment";
import { ENUM_DateFormats } from "../../../shared/shared-enums";

export class InsuranceClaimPayment {
    public ClaimPaymentId: number = 0;
    public ClaimSubmissionId: number = 0;
    public ClaimCode: number = 0;
    public CreditOrganizationId: number = 0;
    public ReceivedAmount: number = 0;
    public ServiceCommission: number = 0;
    public ReceivedBy: number = 0;
    public ReceivedOn: string = moment().format(ENUM_DateFormats.Year_Month_Day);
    public ChequeNumber: string = "";
    public PaymentDetails: string = "";
    public BankName: string = "";
    public Remarks: string = "";
}