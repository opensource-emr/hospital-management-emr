using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace DanpheEMR.ServerModel.InventoryModels.InventoryReportModel
{
    public class ExpirableStockReportDataViewModel
    {
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public string GRItemSpecification { get; set; }
        public string FiscalYearName { get; set; }
        public string SubCategoryName { get; set; }
        public string RegisterPageNumber { get; set; }
        public string Code { get; set; }
        public string ItemCategory { get; set; }


        public static ExpirableStockReportDataViewModel MapDataTableToSingleObject(DataTable data)
        {
            ExpirableStockReportDataViewModel retObj = new ExpirableStockReportDataViewModel();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<ExpirableStockReportDataViewModel> expirableStockDetail = JsonConvert.DeserializeObject<List<ExpirableStockReportDataViewModel>>(strPatData);
                if (expirableStockDetail != null && expirableStockDetail.Count > 0)
                {
                    retObj = expirableStockDetail.First();
                }
            }
            return retObj;
        }


    }
    public class ExpirableStockDetailViewModel
    {
        public DateTime? ExpiryDate { get; set; }
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
        public static List<ExpirableStockDetailViewModel> MapDataTableToSingleObject(DataTable data)
        {
            List<ExpirableStockDetailViewModel> retObj = new List<ExpirableStockDetailViewModel>();
            if (data != null)
            {
                string strPatData = JsonConvert.SerializeObject(data);
                List<ExpirableStockDetailViewModel> expirableStockDetailData = JsonConvert.DeserializeObject<List<ExpirableStockDetailViewModel>>(strPatData);
                if (expirableStockDetailData != null && expirableStockDetailData.Count > 0)
                {
                    retObj = expirableStockDetailData;
                }
            }
            return retObj;
        }

    }
    public class ExpirableStockReportFinalViewModel
    {
        public List<ExpirableStockDetailViewModel> expirableStockDetailViewModel { get; set; }
        public ExpirableStockReportDataViewModel expirableStockReportDataViewModel { get; set; }

    }
}
