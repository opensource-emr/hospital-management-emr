using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class CapitalStockLedgerViewModel
    {
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string FiscalYearName { get; set; }
        public string SubCategoryName { get; set; }
        public string RegisterPageNumber { get; set; }

        public static CapitalStockLedgerViewModel MapDataTableToSingleObject(DataTable data)
        {
            CapitalStockLedgerViewModel retObj = new CapitalStockLedgerViewModel();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<CapitalStockLedgerViewModel> consumableStockDetail = JsonConvert.DeserializeObject<List<CapitalStockLedgerViewModel>>(strPatData);
                if (consumableStockDetail != null && consumableStockDetail.Count > 0)
                {
                    retObj = consumableStockDetail.First();
                }
            }
            return retObj;
        }
    }
    public class CapitalStockLegerDetailViewModel
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
        public string Specification { get; set; }
        public string Code { get; set; }
        public string VendorName { get; set; }
        public static List<CapitalStockLegerDetailViewModel> MapDataTableToSingleObject(DataTable data)
        {
            List<CapitalStockLegerDetailViewModel> retObj = new List<CapitalStockLegerDetailViewModel>();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<CapitalStockLegerDetailViewModel> consumableStockDetail = JsonConvert.DeserializeObject<List<CapitalStockLegerDetailViewModel>>(strPatData);
                if (consumableStockDetail != null && consumableStockDetail.Count > 0)
                {
                    retObj = consumableStockDetail;
                }
            }
            return retObj;
        }
    }
    public class CapitalStockLedgerDetailFinalViewModel
    {
        public List<CapitalStockLegerDetailViewModel> capitalStockLedgerDetailViewModel { get; set; }
        public CapitalStockLedgerViewModel capitalStockLegerViewModel { get; set; }

    }
}
