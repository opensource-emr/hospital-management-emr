using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class ManageStockItem
    {
        public int ItemId { get; set; }
        public int StockId { get; set; }
        public string BatchNo { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string InOut { get; set; }
        public string Remark { get; set; }
        public double UpdatedQty { get; set; }
        public decimal CostPrice { get; set; }
        public int StoreId { get; set; }
    }
}
