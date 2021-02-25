
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ReportingModels;
using System.Data.SqlClient;
using System.Data;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using DanpheEMR.ServerModel.InventoryModels.InventoryReportModel;

namespace DanpheEMR.DalLayer
{
    public class InventoryReportingDbContext : DbContext
    {
        private string connStr = null;
        public InventoryReportingDbContext(string Conn) : base(Conn)
        {
            connStr = Conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        #region Current Stock Level Report
        public List<CurrentStockLevel> CurrentStockLevelReport(string ItemName)
        {
            if (ItemName == null || ItemName == " ")
            {
                var Data = Database.SqlQuery<CurrentStockLevel>("exec SP_Report_Inventory_CurrentStockLevel @ItemName",
                  new SqlParameter("@ItemName", DBNull.Value)).ToList();
                return Data.ToList<CurrentStockLevel>();


            }
            else
            {
                var Data = Database.SqlQuery<CurrentStockLevel>("exec SP_Report_Inventory_CurrentStockLevel @ItemName",
                new SqlParameter("@ItemName", ItemName)).ToList();
                return Data.ToList<CurrentStockLevel>();
            }

        }
        #endregion

        #region Current Stock Level Report with Item Id
        public DataTable CurrentStockLevelReportByItemId(string storeIds)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@StoreIds", storeIds) };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable purchaseItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_INV_CurrentStockLevel", paramList, this);
            return purchaseItems;
        }
        #endregion
        #region Substore Dispatch and Consumption Report Details 
        public DataTable SubStoreDispatchAndConsumptionReport(string storeIds, DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@StoreIds", storeIds),
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
            };
            foreach(SqlParameter parameter in paramList)
            {
                if(parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable disconItems = DALFunctions.GetDataTableFromStoredProc("SP_INV_RPT_GetSubstoreDispConsumption_Summary", paramList, this);
            return disconItems;
        }
        #endregion
        #region Item level details of Substore Dispatch and Consumption Report
        public DataTable ItemDetailsForDispatchAndConsumptionReport(string storeIds, int ItemId, string fromdate, string todate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@StoreIds", storeIds),
                new SqlParameter("@ItemId", ItemId),
                new SqlParameter("@FromDate", fromdate),
                new SqlParameter("@ToDate", todate)
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable itemDetails = DALFunctions.GetDataTableFromStoredProc("SP_INV_RPT_GetSubstoreDispConsumption_Items", paramList, this);
            return itemDetails;
        }
        #endregion
        #region Current Stock Level Item Details with item id and store id
        public DataTable CurrentStockItemDetailsByStoreId(string storeIds, int ItemId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@StoreIds", storeIds),
                                                                      new SqlParameter("@ItemId", ItemId) };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable purchaseItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_INV_CurrentStockItemDetails_By_StoreId", paramList, this);
            return purchaseItems;
        }
        #endregion

        #region Write Off Report
        public List<CurrentWriteOff> CurrentWriteOffReport(int ItemId)
        {
            var Data = Database.SqlQuery<CurrentWriteOff>("exec SP_Report_Inventory_WriteOffReport @ItemId",
                new SqlParameter("@ItemId", ItemId)).ToList();
            return Data.ToList<CurrentWriteOff>();
        }
        #endregion

        #region Return To Vendor Report
        public List<ReturnToVendor> ReturnToVendorReport(int VendorId)
        {
            var Data = Database.SqlQuery<ReturnToVendor>("exec SP_Report_Inventory_ReturnToVendorReport @VendorId",
                new SqlParameter("@VendorId", VendorId)).ToList();
            return Data.ToList<ReturnToVendor>();
        }
        #endregion

        #region Daily item dispatch report
        public List<DailyItemDispatchModel> DailyItemDispatchReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            if (StoreId == 0)
            {
                var Data = Database.SqlQuery<DailyItemDispatchModel>("exec SP_Report_Inventory_DailyItemsDispatchReport @FromDate,@ToDate",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
                ).ToList();
                return Data.ToList<DailyItemDispatchModel>();
            }
            else
            {
                var Data = Database.SqlQuery<DailyItemDispatchModel>("exec SP_Report_Inventory_DailyItemsDispatchReport @FromDate,@ToDate,@StoreId",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@StoreId", StoreId)
                ).ToList();
                return Data.ToList<DailyItemDispatchModel>();
            }

        }
        #endregion

        #region INV Purchase Items Report
        public DataTable INVPurchaseItemsReport(DateTime FromDate, DateTime ToDate, int FiscalYearId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate),
                                                                new SqlParameter("@FiscalYearId",FiscalYearId)
                                                                    };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable purchaseItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_PurchaseItemsReport", paramList, this);
            return purchaseItems;
        }
        #endregion
        #region Purchase Order report
        public List<PurchaseOrderModel> PurchaseOrderReport(DateTime FromDate, DateTime ToDate, int OrderNumber)
        {
            if (OrderNumber == 0)
            {
                var Data = Database.SqlQuery<PurchaseOrderModel>("exec SP_Report_Inventory_PurchaseOrderSummeryReport @FromDate,@ToDate",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate)

            ).ToList();
                return Data.ToList<PurchaseOrderModel>();
            }
            else
            {
                var Data = Database.SqlQuery<PurchaseOrderModel>("exec SP_Report_Inventory_PurchaseOrderSummeryReport @FromDate,@ToDate,@OrderNumber",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@OrderNumber", OrderNumber)
                ).ToList();
                return Data.ToList<PurchaseOrderModel>();
            }

        }
        #endregion

        #region CancelledPOandGRReports
        public List<GoodsReceiptModel> CancelledPOandGRReports(DateTime FromDate, DateTime ToDate, bool isGR)
        {
            if (isGR == true)
            {
                var Data = Database.SqlQuery<GoodsReceiptModel>("exec SP_Report_Inventory_CancelGoodsReceiptReport @FromDate, @ToDate",
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate)
                    ).ToList();
                return Data.ToList<GoodsReceiptModel>();
            }
            else
            {
                var Data = Database.SqlQuery<GoodsReceiptModel>("exec SP_Report_Inventory_CancelPurchaseOrderReport @FromDate, @ToDate",
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate)
                    ).ToList();
                return Data.ToList<GoodsReceiptModel>();
            }
        }
        #endregion
        #region GoodReceipt Evaluation
        public List<GoodsReceiptEvaluationModel> GoodReceiptEvaluationReport(DateTime? FromDate, DateTime? ToDate, string TransactionType, int? GoodReceiptNo)
        {
            var Data = Database.SqlQuery<GoodsReceiptEvaluationModel>("exec SP_Report_Inventory_GoodReceiptEvaluation @GoodReceiptNo, @FromDate, @ToDate, @TransactionType",
                new SqlParameter("@GoodReceiptNo", (object)GoodReceiptNo ?? DBNull.Value),
                new SqlParameter("@FromDate", (object)FromDate ?? DBNull.Value),
                new SqlParameter("@ToDate", (object)ToDate ?? DBNull.Value),
                new SqlParameter("@TransactionType", (object)TransactionType ?? DBNull.Value)
                ).ToList();
            return Data.ToList<GoodsReceiptEvaluationModel>();
        }
        #endregion

        #region Inventory Summary Report
        public DataTable InventorySummaryReport(DateTime FromDate, DateTime ToDate, int FiscalYearId)
        {


            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate),
                                                                new SqlParameter("@FiscalYearId", FiscalYearId)
                                                                    };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable purchaseItems = DALFunctions.GetDataTableFromStoredProc("SP_INV_RPT_GetInventorySummary", paramList, this);
            return purchaseItems;

        }
        #endregion

        #region Inventory Valuation
        public DataTable InventoryValuation()
        {
            DataTable invValuationData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_InventoryValuation", this);
            return invValuationData;
        }
        #endregion

        #region Comparison Purchaseorder & GoodsReceipt
        public DataTable ComparisonPOGR()
        {
            DataTable cmpPOGR = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_ComparePoAndGR", this);
            return cmpPOGR;
        }
        #endregion

        #region PurchaseReport
        public DataTable PurchaseReports()
        {
            DataTable PurRep = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_Purchase", this);
            return PurRep;
        }
        #endregion
        #region Fixed Assets report
        public List<FixedAssetsModel> FixedAssetsReport(DateTime FromDate, DateTime ToDate)
        {

            var Data = Database.SqlQuery<FixedAssetsModel>("exec SP_Report_Inventory_FixedAssets @FromDate,@ToDate",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate)
            ).ToList();
            return Data.ToList<FixedAssetsModel>();


        }
        #endregion
        #region DispatchDetail
        public List<DispatchDetailModel> DispatchDetail(int dispatchId)
        {
            var Data = Database.SqlQuery<DispatchDetailModel>("exec SP_Report_Dispatch_Details @DispatchId",
                new SqlParameter("@DispatchId", dispatchId)).ToList();
            return Data.ToList();
        }
        #endregion

        #region  Vendor Transaction Report
        public DataTable VendorTransactionReport(int? fiscalYearId, int VendorId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                 new SqlParameter("@fiscalYearId", fiscalYearId),
                new SqlParameter("@VendorId", VendorId),
                 //new SqlParameter("@Status", Status)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_VendorTransactionReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region  Vendor Transaction Details
        public DataTable VendorTransactionReportData(int? fiscalYearId, int VendorId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@fiscalYearId", fiscalYearId),
                new SqlParameter("@VendorId", VendorId),
                 //new SqlParameter("@Status", Status)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_VendorTransactionDetails", paramList, this);
            return stockItems;
        }
        #endregion

        #region Item Management Detail Report
        public DataTable ItemMgmtDetail()
        {
            DataTable ItmMgmt = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_ItemMgmtDetail", this);
            return ItmMgmt;
        }
        #endregion
        #region SubstoreStockReport
        public SubstoreReportViewModel SubstoreStockReport(int StoreId, int ItemId)
        {
            SubstoreReportViewModel SubstoreStockReport = new SubstoreReportViewModel();

            SubstoreStockReport.InventoryTotal = Database.SqlQuery<SubstoreGetAllModel>("exec SP_Report_Inventory_SubstoreGetAll @StoreId,@ItemId",
               new SqlParameter("@StoreId", StoreId),
                new SqlParameter("@ItemId", ItemId)).FirstOrDefault();
            SubstoreStockReport.InventoryItemTotal = Database.SqlQuery<SubstoreGetAllBasedOnItemIdModel>("exec SP_Report_Inventory_SubstoreGetAllBasedOnItemId @StoreId,@ItemId",
               new SqlParameter("@StoreId", StoreId),
                new SqlParameter("@ItemId", ItemId)).ToList();
            SubstoreStockReport.InventoryStoreTotal = Database.SqlQuery<SubstoreGetAllBasedOnStoreIdModel>("exec SP_Report_Inventory_SubstoreGetAllBasedOnStoreId @StoreId,@ItemId",
               new SqlParameter("@StoreId", StoreId),
                new SqlParameter("@ItemId", ItemId)).ToList();
            return SubstoreStockReport;
        }
        #endregion
        #region inventory purchase summary report 
        public DataTable InvPurchaseSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate)
                                                                   };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable purchaseSummaryTbl = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_PurchaseSummary", paramList, this);
            return purchaseSummaryTbl;

        }
        #endregion
    }

}
