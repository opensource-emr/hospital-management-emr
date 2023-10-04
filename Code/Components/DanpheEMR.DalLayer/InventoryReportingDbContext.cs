
using DanpheEMR.ServerModel.InventoryModels.InventoryReportModel;
using DanpheEMR.ServerModel.ReportingModels;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
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
        public DataTable INVPurchaseItemsReport(DateTime FromDate, DateTime ToDate, int FiscalYearId, int? ItemId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate),
                                                                new SqlParameter("@FiscalYearId",FiscalYearId),
                                                                new SqlParameter("@ItemId", ItemId),
                                                                    };
            DataTable purchaseItems = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_PurchaseItemsReport", paramList, this);
            return purchaseItems;
        }
        #endregion
        #region Purchase Order report
        public List<PurchaseOrderModel> PurchaseOrderReport(DateTime FromDate, DateTime ToDate, object StoreId)
        {
            //if (OrderNumber == 0)
            //{
            var Data = Database.SqlQuery<PurchaseOrderModel>("exec SP_Report_Inventory_PurchaseOrderSummeryReport @FromDate,@ToDate,@StoreId",
        new SqlParameter("@FromDate", FromDate),
        new SqlParameter("@ToDate", ToDate),
        new SqlParameter("@StoreId", (StoreId != null ? StoreId : DBNull.Value))
        ).ToList();
            return Data.ToList<PurchaseOrderModel>();
            //}
            //else
            //{
            //    var Data = Database.SqlQuery<PurchaseOrderModel>("exec SP_Report_Inventory_PurchaseOrderSummeryReport @FromDate,@ToDate,@OrderNumber",
            //    new SqlParameter("@FromDate", FromDate),
            //    new SqlParameter("@ToDate", ToDate),
            //    new SqlParameter("@OrderNumber", OrderNumber)
            //    ).ToList();
            //    return Data.ToList<PurchaseOrderModel>();
            //}

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
        public DataTable InventorySummaryReport(DateTime FromDate, DateTime ToDate, int FiscalYearId, int? StoreId)
        {


            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate),
                                                                new SqlParameter("@FiscalYearId", FiscalYearId),
                                                                new SqlParameter("@StoreId", StoreId),
                                                                    };
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

        #region Fixed Assets  Movement report
        public List<FixedAssetsMovementModel> FixedAssetsMovementReport(DateTime FromDate, DateTime ToDate, object EmployeeId, object DepartmentId, object ItemId, object ReferenceNumber)
        {
            var Data = Database.SqlQuery<FixedAssetsMovementModel>("exec SP_Report_Inventory_FixedAssetsMovement @FromDate,@ToDate,@EmployeeId,@DepartmentId,@ItemId,@ReferenceNumber",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@EmployeeId", (EmployeeId != null ? EmployeeId : DBNull.Value)),
            new SqlParameter("@DepartmentId", (DepartmentId != null ? DepartmentId : DBNull.Value)),
            new SqlParameter("@ItemId", (ItemId != null ? ItemId : DBNull.Value)),
            new SqlParameter("@ReferenceNumber", (ReferenceNumber != null ? ReferenceNumber : DBNull.Value))
            ).ToList();
            return Data.ToList<FixedAssetsMovementModel>();


        }
        #endregion

        #region Depatment Detail Stock Ledger Report
        public List<DetailStockLedgerModel> DepartmentDetailStockLedgerReport(DateTime FromDate, DateTime ToDate, int? ItemId, int selectedStoreId)
        {
            //var uptoDateTimeStr = UpToDate.ToString("yyyy-MM-dd");
            var Data = Database.SqlQuery<DetailStockLedgerModel>("exec SP_Report_Inventory_DetailedStockLedger @FromDate,@ToDate,@ItemId,@StoreId",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@ItemId", (Object)ItemId ?? DBNull.Value),
            new SqlParameter("@StoreId", selectedStoreId)
            ).ToList();

            return Data.ToList<DetailStockLedgerModel>();


        }
        #endregion

        #region Consumable Stock Ledger Report
        public ConsumableStockLedgerDetailFinalViewModel ConsumableStockLedgerReport(DateTime FromDate, DateTime ToDate, int ItemId, int selectedStoreId, int fiscalYearId, InventoryReportingDbContext invreportingDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@ItemId", ItemId),
            new SqlParameter("@StoreId", selectedStoreId),
            new SqlParameter("@FiscalYearId", fiscalYearId)
             };

            DataSet consumableStockDetails = DALFunctions.GetDatasetFromStoredProc("INV_SP_ConsumableStockLedgerReport", paramList, invreportingDbContext);

            DataTable stockValue = consumableStockDetails.Tables[0];
            DataTable stockDetail = consumableStockDetails.Tables[1];

            var consumableStockLedgerReportData = new ConsumableStockLedgerDetailFinalViewModel
            {
                consumableStockLedgerDetailViewModel = ConsumableStockLedgerDetailViewModel.MapDataTableToSingleObject(stockValue),
                consumableStockLegerViewModel = ConsumableStockLegerViewModel.MapDataTableToSingleObject(stockDetail)
            };

            return consumableStockLedgerReportData;

        }
        #endregion

        #region Capital Stock Ledger Report
        public CapitalStockLedgerDetailFinalViewModel CapitalStockLedgerReport(DateTime FromDate, DateTime ToDate, int ItemId, int selectedStoreId, int fiscalYearId, InventoryReportingDbContext invreportingDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@ItemId", ItemId),
            new SqlParameter("@StoreId", selectedStoreId),
            new SqlParameter("@FiscalYearId", fiscalYearId)
             };

            DataSet capitalStockDetails = DALFunctions.GetDatasetFromStoredProc("INV_SP_CapitalStockLedgerReport", paramList, invreportingDbContext);

            DataTable stockValue = capitalStockDetails.Tables[0];
            DataTable stockDetail = capitalStockDetails.Tables[1];

            var consumableStockLedgerReportData = new CapitalStockLedgerDetailFinalViewModel
            {
                capitalStockLedgerDetailViewModel = CapitalStockLegerDetailViewModel.MapDataTableToSingleObject(stockValue),
                capitalStockLegerViewModel = CapitalStockLedgerViewModel.MapDataTableToSingleObject(stockDetail)
            };

            return consumableStockLedgerReportData;

        }
        public List<IssuedItemViewModel> IssuedItemListReport(DateTime FromDate, DateTime ToDate, int FiscalYearId, int? ItemId, int? SubStoreId, int? MainStoreId, int? EmployeeId, int? SubCategoryId)
        {
            var Data = Database.SqlQuery<IssuedItemViewModel>("exec SP_Inventory_IssuedItemListReport @FromDate,@ToDate,@FiscalYearId,@ItemId,@SubStoreId,@MainStoreId,@EmployeeId,@SubCategoryId",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@FiscalYearId", FiscalYearId),
            new SqlParameter("@ItemId", (Object)ItemId ?? DBNull.Value),
            new SqlParameter("@SubStoreId", (Object)SubStoreId ?? DBNull.Value),
            new SqlParameter("@MainStoreId", MainStoreId),
            new SqlParameter("@EmployeeId", (Object)EmployeeId ?? DBNull.Value),
            new SqlParameter("@SubCategoryId", (Object)SubCategoryId ?? DBNull.Value)
           ).ToList();

            return Data.ToList<IssuedItemViewModel>();

        }
        #endregion

        #region Opening Stock Valuation Report
        public DataTable OpeningStockValuationReport(DateTime TillDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@TillDate",TillDate)
            };
            DataTable openingStockValuationReportData = DALFunctions.GetDataTableFromStoredProc("SP_Opening_Stock_Valuation_Report", paramList, this);
            return openingStockValuationReportData;
        }
        #endregion

        #region Quotion Rates report
        public DataTable QuotationRatesReport(int PurchaseOrderId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@PurchaseOrderId", PurchaseOrderId)
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            var Data = DALFunctions.GetDataTableFromStoredProc("SP_Report_Quotation_Rates", paramList, this);
            return Data;
        }
        #endregion

        public List<ApprovedMaterialStockRegisterModel> ApprovedMaterialStockRegisterReport(DateTime FromDate, DateTime ToDate)
        {
            var Data = Database.SqlQuery<ApprovedMaterialStockRegisterModel>("exec SP_Report_Inventory_FixedAssets @FromDate,@ToDate",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate)
            ).ToList();
            return Data.ToList<ApprovedMaterialStockRegisterModel>();
        }
        #region DispatchDetail
        public DataSet DispatchDetail(int dispatchId, int fiscalyearId, int RequisitionId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                 new SqlParameter("@DispatchId", dispatchId),
                new SqlParameter("@FiscalYearId", fiscalyearId),
                new SqlParameter("@RequisitionId", RequisitionId)
            };

            DataSet requisitionDispatchDetails = DALFunctions.GetDatasetFromStoredProc("SP_Report_Dispatch_Details", paramList, this);
            return requisitionDispatchDetails;
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
        public DataTable InvPurchaseSummaryReport(DateTime FromDate, DateTime ToDate, int VendorId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                                                                new SqlParameter("@FromDate", FromDate),
                                                                new SqlParameter("@ToDate", ToDate),
                                                                new SqlParameter("@VendorId",VendorId)
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

        #region inventory purchase return to supplier report 
        public List<ReturnToVendorItems> ReturnToSupplierReport(DateTime FromDate, DateTime ToDate, object VendorId, object ItemId, object batchNumber, object goodReceiptNumber, object creditNoteNumber)
        {
            var Data = Database.SqlQuery<ReturnToVendorItems>("exec SP_Report_Inventory_ReturnToSupplierReport @FromDate,@ToDate,@VendorId,@ItemId,@batchNumber,@goodReceiptNumber,@creditNoteNumber",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@VendorId", (VendorId != null ? VendorId : DBNull.Value)),
            new SqlParameter("@ItemId", (ItemId != null ? ItemId : DBNull.Value)),
            new SqlParameter("@batchNumber", (batchNumber != null ? batchNumber : DBNull.Value)),
            new SqlParameter("@goodReceiptNumber", (goodReceiptNumber != null ? goodReceiptNumber : DBNull.Value)),
            new SqlParameter("@creditNoteNumber", (creditNoteNumber != null ? creditNoteNumber : DBNull.Value))
            ).ToList();
            return Data.ToList<ReturnToVendorItems>();
        }
        #endregion

        #region Supplier Wise Stock
        public List<SupplierWiseStockModel> SupplierWiseStockReport(DateTime FromDate, DateTime ToDate, object VendorId, object StoreId, object ItemId)
        {
            var Data = Database.SqlQuery<SupplierWiseStockModel>("exec SP_Report_Inventory_SupplierWiseStock @FromDate,@ToDate,@VendorId,@StoreId,@ItemId",
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@VendorId", (VendorId != null ? VendorId : DBNull.Value)),
            new SqlParameter("@StoreId", (StoreId != null ? StoreId : DBNull.Value)),
            new SqlParameter("@ItemId", (ItemId != null ? ItemId : DBNull.Value))
            ).ToList();
            return Data.ToList<SupplierWiseStockModel>();
        }
        #endregion
        #region Expiry Item Report        
        public DataTable ExpiryItemReport(int? ItemId, int? StoreId, DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@ItemId", ItemId),
                 new SqlParameter("@StoreId", StoreId),
                  new SqlParameter("@FromDate", FromDate),
                   new SqlParameter("@ToDate", ToDate)
            };

            DataTable expiryItem = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_ExpiryItemReport", paramList, this);

            return expiryItem;
        }
        #endregion

        #region Supplier Information Report 
        public DataTable INVSupplierInformationReport()
        {
            DataTable doctorRevenue = DALFunctions.GetDataTableFromStoredProc("SP_INVReport_SupplierInfoReport", this);
            return doctorRevenue;
        }
        #endregion

        #region Substore Dispatch And ConsumptionReport
        public DataTable SubstoreDispatchAndConsumptionReport(int? StoreId, int? ItemId, int? SubCategoryId, DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                 new SqlParameter("@StoreId", StoreId),
                 new SqlParameter("@ItemId",ItemId),
                 new SqlParameter("@SubCategoryId",SubCategoryId),
                 new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate)
            };

            DataTable dispatchAndConsumptionReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_Inventory_SubstoreDispatchAndConsumptionReport", paramList, this);

            return dispatchAndConsumptionReportData;
        }
        #endregion

        #region Expirable Stock Report
        public ExpirableStockReportFinalViewModel ExpirableStockReport(DateTime FromDate, DateTime ToDate, int ItemId, int fiscalYearId, InventoryReportingDbContext invreportingDbContext)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
            new SqlParameter("@FromDate", FromDate),
            new SqlParameter("@ToDate", ToDate),
            new SqlParameter("@ItemId", ItemId),
            new SqlParameter("@FiscalYearId", fiscalYearId)
             };

            DataSet expirableStockDetails = DALFunctions.GetDatasetFromStoredProc("INV_RPT_ExpirableStockReport", paramList, invreportingDbContext);

            DataTable stockValue = expirableStockDetails.Tables[0];
            DataTable stockDetail = expirableStockDetails.Tables[1];

            var expirableStockLedgerReportData = new ExpirableStockReportFinalViewModel
            {
                expirableStockDetailViewModel = ExpirableStockDetailViewModel.MapDataTableToSingleObject(stockValue),
                expirableStockReportDataViewModel = ExpirableStockReportDataViewModel.MapDataTableToSingleObject(stockDetail)

            };

            return expirableStockLedgerReportData;

        }
        #endregion

        #region Substore Wise Summary Report
        public DataTable SubstoreWiseSummaryReport(int? StoreId, DateTime FromDate, DateTime ToDate, int FiscalYearId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                 new SqlParameter("@StoreId", StoreId),
                  new SqlParameter("@FromDate", FromDate),
                   new SqlParameter("@ToDate", ToDate),
                     new SqlParameter("@FiscalYearId", FiscalYearId)
            };

            DataTable SubstoreWiseSummaryReportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_SubstoreWiseSummaryReport", paramList, this);

            return SubstoreWiseSummaryReportData;
        }
        #endregion
    }

}
