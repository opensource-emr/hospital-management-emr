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
    public class WardReportingDbContext : DbContext
    {
        private string connStr = null;
        public WardReportingDbContext(string Conn) : base(Conn)
        {
            connStr = Conn;
            this.Configuration.LazyLoadingEnabled = true;
            this.Configuration.ProxyCreationEnabled = false;
        }

        #region WARD Stock Items Report        
        public DataTable WARDStockItemsReport(int ItemId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@ItemId", ItemId) };
            foreach (SqlParameter parameter in paramList)
            {
                if (parameter.Value == null)
                {
                    parameter.Value = "";

                }
            }
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardReport_StockReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Requisition DataTable
        public DataTable WARDRequisitionReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardReport_RequisitionReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Breakage DataTable
        public DataTable WARDBreakageReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardReport_BreakageReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Consumption DataTable
        public DataTable WARDConsumptionReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardReport_ConsumptionReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Transfer DataTable
        public DataTable WARDTransferReport(DateTime FromDate, DateTime ToDate, int Status)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardReport_TransferReport", paramList, this);
            return stockItems;
        }
        #endregion

        ///WARD INVENTORY REPORT
        #region WARD Inventory Requisition and Dispatch Report
        public DataTable RequisitionDispatchReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardInv_Report_RequisitionDispatchReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Inventory Transfer Report
        public DataTable TransferReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardInv_Report_TransferReport", paramList, this);
            return stockItems;
        }
        #endregion

        #region WARD Inventory Consumption Report
        public DataTable ConsumptionReport(DateTime FromDate, DateTime ToDate)
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
            DataTable stockItems = DALFunctions.GetDataTableFromStoredProc("SP_WardInv_Report_ConsumptionReport", paramList, this);
            return stockItems;
        }
        #endregion
    }
}
