import { FiscalYearModel } from "./fiscalyear.model";
import { TransactionModel } from "../../transactions/shared/transaction.model";




export class AccountClosureViewModel {
    public nextFiscalYear: FiscalYearModel = new FiscalYearModel();
    public TnxModel: TransactionModel = new TransactionModel();

}