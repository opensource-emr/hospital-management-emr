using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    /// <summary>
    /// this is GoodsReceiptViewModel contain GoodsreceiptModel and PurchaseOrderModel
    /// </summary>
   public class PHRMGoodsReceiptViewModel
    {
        public PHRMGoodsReceiptModel goodReceipt = new PHRMGoodsReceiptModel();
        public  PHRMPurchaseOrderModel purchaseOrder = new PHRMPurchaseOrderModel();
    }
}
    