
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
        public List<CurrentStockLevel> CurrentStockLevelReportByItemId(int ItemId)
        {
            var Data = Database.SqlQuery<CurrentStockLevel>("exec SP_Report_Inventory_CurrentStockLevel_ItemId @ItemId",
                new SqlParameter("@ItemId", ItemId)).ToList();
            return Data.ToList<CurrentStockLevel>();
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
        public List<DailyItemDispatchModel> DailyItemDispatchReport(DateTime FromDate, DateTime ToDate, string DepartmentName)
        {
            if (DepartmentName == null || DepartmentName == " ")
            {
                var Data = Database.SqlQuery<DailyItemDispatchModel>("exec SP_Report_Inventory_DailyItemsDispatchReport @FromDate,@ToDate",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate)
                ).ToList();
                return Data.ToList<DailyItemDispatchModel>();
            }
            else
            {
                var Data = Database.SqlQuery<DailyItemDispatchModel>("exec SP_Report_Inventory_DailyItemsDispatchReport @FromDate,@ToDate,@DepartmentName",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@DepartmentName", DepartmentName)
                ).ToList();
                return Data.ToList<DailyItemDispatchModel>();
            }

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



        #region Inventory Summary Report
        public List<InventorySummaryModel> InventorySummaryReport(DateTime FromDate, DateTime ToDate, string ItemName)
        {
            if (ItemName == null || ItemName == " ")
            {
                var Data = Database.SqlQuery<InventorySummaryModel>("exec SP_Report_Inventory_InventorySummaryReport @FromDate,@ToDate",
             new SqlParameter("@FromDate", FromDate),
             new SqlParameter("@ToDate", ToDate)

             ).ToList();
                return Data.ToList<InventorySummaryModel>();
            }
            else
            {
                var Data = Database.SqlQuery<InventorySummaryModel>("exec SP_Report_Inventory_InventorySummaryReport @FromDate,@ToDate,@ItemName",
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@ItemName", ItemName)
                ).ToList();
                return Data.ToList<InventorySummaryModel>();
            }

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
    }

}
