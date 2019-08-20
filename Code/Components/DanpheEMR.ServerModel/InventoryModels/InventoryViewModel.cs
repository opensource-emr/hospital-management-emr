using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class RequisiteDeptpair
    {
        public RequisitionModel req = new RequisitionModel();
        public DepartmentModel dept = new DepartmentModel();
    }
    public class RequisitionsStockVM
    {
        public List<StockModel> stocks = new List<StockModel>();
        public List<RequisitionModel> requisitions = new List<RequisitionModel>();
        public List<DispatchItemsModel> dispatchItems = new List<DispatchItemsModel>();
        public List<StockTransactionModel> stockTransactions = new List<StockTransactionModel>();

        //for view
        public List<RequisiteDeptpair> reqDeptList = new List<RequisiteDeptpair>();
    }
    
}
