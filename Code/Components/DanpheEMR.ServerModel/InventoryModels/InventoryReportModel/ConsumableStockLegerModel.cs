using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class ConsumableStockLegerViewModel
    {
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string GRItemSpecification { get; set; }
        public string FiscalYearName { get; set; }
        public string SubCategoryName { get; set; }
        public string RegisterPageNumber { get; set; }

        public static ConsumableStockLegerViewModel MapDataTableToSingleObject(DataTable data)
        {
            ConsumableStockLegerViewModel retObj = new ConsumableStockLegerViewModel();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<ConsumableStockLegerViewModel> consumableStockDetail = JsonConvert.DeserializeObject<List<ConsumableStockLegerViewModel>>(strPatData);
                if (consumableStockDetail != null && consumableStockDetail.Count > 0)
                {
                    retObj = consumableStockDetail.First();
                }
            }
            return retObj;
        }
    }

    public class ConsumableStockLedgerDetailViewModel
    {
        public DateTime? TransactionDate { get; set; }
        public double? ReceiptQty { get; set; }
        public decimal? ReceiptRate { get; set; }
        public double? ReceiptAmount { get; set; }
        public double? IssueQty { get; set; }
        public decimal? IssueRate { get; set; }
        public double? IssueAmount { get; set; }
        public double? BalanceQty { get; set; }
        public decimal? BalanceRate { get; set; }
        public decimal? BalanceAmount { get; set; }
        public int? ReferenceNo { get; set; }
        public string Store { get; set; }
        public string Username { get; set; }
        public string Remarks { get; set; }
        public static List<ConsumableStockLedgerDetailViewModel> MapDataTableToSingleObject(DataTable data)
        {
            List<ConsumableStockLedgerDetailViewModel> retObj = new List<ConsumableStockLedgerDetailViewModel>();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<ConsumableStockLedgerDetailViewModel> consumableStockDetail = JsonConvert.DeserializeObject<List<ConsumableStockLedgerDetailViewModel>>(strPatData);
                if (consumableStockDetail != null && consumableStockDetail.Count > 0)
                {
                    retObj = consumableStockDetail;
                }
            }
            return retObj;
        }
    }

    public class ConsumableStockLedgerDetailFinalViewModel
    {
        public List<ConsumableStockLedgerDetailViewModel> consumableStockLedgerDetailViewModel { get; set; }
        public ConsumableStockLegerViewModel consumableStockLegerViewModel { get; set; }    

    }
}
