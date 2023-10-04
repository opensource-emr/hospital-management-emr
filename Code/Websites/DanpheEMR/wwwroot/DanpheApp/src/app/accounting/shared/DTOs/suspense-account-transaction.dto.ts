import { TransactionModel } from "../../transactions/shared/transaction.model";
import { MapBankAndSuspenseAccountReconciliation_DTO } from "./map-bank-and-suspense-account-reconciliation.dto";

export class SuspenseAccountTransaction_DTO {
    public Transaction: TransactionModel = new TransactionModel();
    public ReconciliationMap: MapBankAndSuspenseAccountReconciliation_DTO = new MapBankAndSuspenseAccountReconciliation_DTO();
}
