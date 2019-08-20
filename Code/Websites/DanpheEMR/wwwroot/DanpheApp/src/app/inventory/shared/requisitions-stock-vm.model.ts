import { StockModel } from "./stock.model";
import { Requisition } from "./requisition.model";
import { DispatchItems } from "./dispatch-items.model";
import { StockTransaction } from "./stock-transaction.model";

export class RequisitionsStockVMModel {
    public stocks: Array<StockModel> = Array<StockModel>();
    public requisitions: Array<Requisition> = Array<Requisition>();
    public dispatchItems: Array<DispatchItems> = Array<DispatchItems>();
    public stockTransactions: Array<StockTransaction> = Array<StockTransaction>();
}