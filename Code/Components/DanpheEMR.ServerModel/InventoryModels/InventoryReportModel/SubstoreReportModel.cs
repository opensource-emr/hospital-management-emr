using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class SubstoreReportViewModel
    {
        public SubstoreGetAllModel InventoryTotal;
        public List<SubstoreGetAllBasedOnItemIdModel> InventoryItemTotal;
        public List<SubstoreGetAllBasedOnStoreIdModel> InventoryStoreTotal;
    }
    public class SubstoreGetAllModel
    {
        public Double TotalQuantity { get; set; }
        public Double TotalValue { get; set; }
        public Double ExpiryQuantity { get; set; }
        public Double ExpiryValue { get; set; }
    }
    public class SubstoreGetAllBasedOnItemIdModel
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public Double TotalQuantity { get; set; }
        public Double TotalValue { get; set; }
        public Double TotalConsumed { get; set; }
    }
    public class SubstoreGetAllBasedOnStoreIdModel
    {
        public int StoreId { get; set; }
        public string Name { get; set; }
        public Double TotalQuantity { get; set; }
        public Double TotalValue { get; set; }
        public Double TotalConsumed { get; set; }
    }

}
