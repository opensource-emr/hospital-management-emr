using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
   public class RequisitionStockVM
    {
        //public List<StoreStockModel> stock = new List<StoreStockModel>();
        public RequisitionModel requisition = new RequisitionModel();
        public List<DispatchItemsModel> dispatchItems = new List<DispatchItemsModel>();
        //public List<StockTransactionModel> stockTransactions = new List<StockTransactionModel>();
        //public List<WARDStockModel> wardInventory = new List<WARDStockModel>();
    }
}
