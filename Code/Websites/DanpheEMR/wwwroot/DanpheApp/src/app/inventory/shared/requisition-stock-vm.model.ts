import { StockModel } from "./stock.model"
import { Requisition } from "./requisition.model"
import { DispatchItems } from "./dispatch-items.model"
import { StockTransaction } from "./stock-transaction.model"

export class RequisitionStockVMModel {    
    public stock: Array<StockModel> = Array<StockModel>();
    public dispatchItems: Array<DispatchItems> = Array<DispatchItems>();
    public stockTransactions: Array<StockTransaction> = Array<StockTransaction>();
    public requisition: Requisition = new Requisition();  
}