import { Payment } from "../../payment/account-payment.model";
import { TransactionModel } from "../transaction.model";

export class MakePayment_DTO {

    public Payment: Payment = new Payment();
    public Transaction: TransactionModel = new TransactionModel();
}