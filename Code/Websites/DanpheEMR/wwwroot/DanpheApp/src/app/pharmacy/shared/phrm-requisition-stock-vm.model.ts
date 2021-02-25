
import { PHRMStoreRequisition } from "../shared/phrm-store-requisition.model"
import { PHRMStoreDispatchItems } from "../shared/phrm-store-dispatch-items.model"
import { PHRMStoreStockModel } from "../shared/phrm-storestock.model"

export class PHRMRequisitionStockVMModel {    
    public stock: Array<any> = Array<any>();
      public dispatchItems: Array<PHRMStoreDispatchItems> = Array<PHRMStoreDispatchItems>();
      public stockTransactions: Array<PHRMStoreStockModel> = Array<PHRMStoreStockModel>();
      public requisition: PHRMStoreRequisition = new PHRMStoreRequisition();  
}
