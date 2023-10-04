using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Inventory.DTO.InventoryReports
{
    public class INV_RPT_InventorySummaryReport_DTO
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public int ItemId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string ItemType { get; set; }
        public string SubCategory { get; set; }
        public string Unit { get; set; }
        public decimal OpeningQty { get; set; }
        public decimal OpeningValue { get; set; }
        public decimal PurchaseQty { get; set; }
        public decimal PurchaseValue { get; set; }
        public decimal TransInQty { get; set; }
        public decimal TransInValue { get; set; }
        public decimal TransOutQty { get; set; }
        public decimal TransOutValue { get; set; }
        public decimal ConsumptionQty { get; set; }
        public decimal ConsumptionValue { get; set; }
        public decimal StockManageOutQty { get; set; }
        public decimal StockManageOutValue { get; set; }
        public decimal StockManageInQty { get; set; }
        public decimal StockManageInValue { get; set; }
        public decimal ClosingQty { get; set; }
        public decimal ClosingValue { get; set; }
        public static List<INV_RPT_InventorySummaryReport_DTO> MapDataTableToListObject(DataTable invSummary)
        {
            string invSummaryData = JsonConvert.SerializeObject(invSummary);
            List<INV_RPT_InventorySummaryReport_DTO> invList = JsonConvert.DeserializeObject<List<INV_RPT_InventorySummaryReport_DTO>>(invSummaryData);
            return invList;
        }
    }
}

