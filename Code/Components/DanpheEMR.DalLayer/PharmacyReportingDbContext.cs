using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using DanpheEMR.ServerModel;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using DanpheEMR.ServerModel.ReportingModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace DanpheEMR.DalLayer
{
    public class PharmacyReportingDbContext : DbContext
    {
        private string connStr = null;
        public PharmacyReportingDbContext(string Conn) : base(Conn)
        {
            connStr = Conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        #region Purchase Order Report
        public DataTable PHRMPurchaseOrderReport(DateTime FromDate, DateTime ToDate, string Status)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                 new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate),
                 new SqlParameter("@Status", Status)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_PurchaseOrderSummaryReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region stock manage detail report
        public DataTable PHRMStockManageDetailReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_StockManageDetailReport", paramList, this);
            return stockItems;
        }
        #endregion


        #region Deposit Balance Report
        public DataTable PHRMDepositBalanceReport()
        {     
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_DepositBalanceReport", this);
            return stockItems;
        }
        #endregion

        #region Dispensary Store Stock report
        public DataTable PHRMDispensaryStoreStockReport(string Status)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
               new SqlParameter("@Status", Status),
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";
                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_DispensaryStoreStockReport", paramList, this);
            return stockItems;
        }
        #endregion
        #region PHRM UserwiseCollection DataTable
        public DataTable PHRMUserwiseCollectionReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_UserwiseCollectionReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region PHRM Sale Return DataTable
        public DataTable PHRMSaleReturnReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_SaleReturnReport", paramList, this);
            return stockItems;
        }
        #endregion


        #region PHRM Counterwise Collection DataTable
        public DataTable PHRMCunterwiseCollectionReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_CounterCollectionReport", paramList, this);
            return stockItems;
        }
        #endregion
        
        #region PHRM Breakage Items DataTable
        public DataTable PHRMBreakageItemReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_BreakageItemReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region PHRM Return To Supplier DataTable
        public DataTable PHRMReturnToSupplierReport(DateTime FromDate, DateTime ToDate)
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
            DataTable returntosupplier = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_ReturnToSupplierReport", paramList, this);
            return returntosupplier;
        }
        #endregion

        #region PHRM Goods Receipt Product 
        public DataTable PHRMGoodReceiptProductReport(DateTime FromDate, DateTime ToDate,int ItemId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate),
                 new SqlParameter("@ItemId", ItemId)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GoodsReceiptProductReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region
        public List<PHRMItemWiseStockReportModel> PHRMItemWiseStockReport()
        {
            var data = Database.SqlQuery<PHRMItemWiseStockReportModel>("exec SP_PHRMReport_ItemWiseStockReport").ToList();

            return data.ToList<PHRMItemWiseStockReportModel>();
        }
        #endregion
      
        #region Doctor Revenue Report        
        public DataTable PHRMSupplierInformationReport()
        {
            DataTable doctorRevenue = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_SupplierInfoReport", this);
            return doctorRevenue;
        }
        #endregion


        #region PHRM Credit InOut Patient Report        
        public DataTable PHRMCreditInOutPatReport(DateTime FromDate, DateTime ToDate, bool IsInOutPat, string patientName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                 new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@IsInOutPat", IsInOutPat)
                //new SqlParameter("@patientName", patientName)
            };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable creditInOutPat = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_LedgerCredit_IndoorOutdoorPatient", paramList, this);
            return creditInOutPat;
        }
        #endregion


        #region PHRM Supplier Stock Summary Report        
        public DataTable PHRMSupplierStockSummaryReport(string SupplierName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@SupplierName", SupplierName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable supplierStkSummary = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_SupplierStockSummaryReport", paramList, this);
            return supplierStkSummary;
        }
        #endregion

        #region PHRM Stock Items Report        
        public DataTable PHRMStockItemsReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_StockItemsReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region PHRM Stock Movement Report        
        public DataTable PHRMStockMovementReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockMovement = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_StockMovementReport", paramList, this);
            return stockMovement;
        }
        #endregion

        #region PHRM Batch Stock Report        
        public DataTable PHRMBatchStockReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable batchStock = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_BatchStockReport", paramList, this);
            return batchStock;
        }
        #endregion

        #region PHRM Expiry Report        
        public DataTable PHRMExpiryReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable expiryStock = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_ExpiryReport", paramList, this);

            return expiryStock;
        }
        #endregion

        #region PHRM Minimum Report    
        public DataTable PHRMMinStockReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable expiryStock = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_MinStockReport", paramList, this);

            return expiryStock;
        }
        #endregion

        #region PHRM ABC/VED Stock Report    
        public DataTable PHRMABCVEDStockReport(string Status)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@Status", Status)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_ABC/VEDStockReport", paramList, this);

            return stockItems;
        }
        #endregion
        #region PHRM Supplier Stock Report        
        public DataTable PHRMSupplierStockReport(string SupplierName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@SupplierName", SupplierName)
            };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable supplierStock = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_SupplierStockReport", paramList, this);
            return supplierStock;
        }
        #endregion

        #region PHRM Ending Stock Summary Report        
        public DataTable PHRMEndingStockSummaryReport(string ItemName)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemName", ItemName) };


            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable endingStockSummary = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_EndingStockSummaryReport", paramList, this);
            return endingStockSummary;
        }
        #endregion

        #region PHRM Billing Report        
        public DataTable PHRMBillingReport(DateTime FromDate, DateTime ToDate, int InvoiceNumber)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@InvoiceNumber", InvoiceNumber) };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable billingreport = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_BillingReport", paramList, this);
            return billingreport;
        }
        #endregion

        #region PHRM Daily Stock Summary Report        
        public DataTable PHRMDailyStockSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
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
            DataTable dailyStkSummary = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_DailyStockSummaryReport", paramList, this);
            return dailyStkSummary;
        }
        #endregion

        #region Daily stock value report
        public DynamicReport PHRM_Daily_StockValue()
        {
            List<SqlParameter> paramsList = new List<SqlParameter>();
            ReportingDbContext reportingDbContext = new ReportingDbContext(this.connStr);
            DataSet dsDailyRev = DALFunctions.GetDatasetFromStoredProc("SP_Report_PHRM_Daily_StockValue", paramsList, reportingDbContext);

            DynamicReport dReport = new DynamicReport();

            dReport.Schema = null;//we have only one table returning from the database.. 
            //wee need datetime in yyyy-MM-dd format.
            dReport.JsonData = JsonConvert.SerializeObject(dsDailyRev.Tables[0],
                                         new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            return dReport;
        }
        #endregion

        #region pharmacy store stock
        public DataTable PHRMStoreStock(String Status)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@Status", Status)
            };

            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_PHRMStoreStock", paramList, this);

            return stockItems;
        }
        #endregion

        #region PHRM Drug Category Wise Report        
        public DataTable PHRMDrugCategoryWiseReport(DateTime FromDate, DateTime ToDate, string category)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@Category", category)
            };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable dailyStkSummary = DALFunctions.GetDataTableFromStoredProc("SP_PHRMReport_DrugCategoryWiseReport", paramList, this);
            return dailyStkSummary;
        }
        #endregion
    }
}
