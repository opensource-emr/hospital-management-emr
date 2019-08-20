using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.CommonTypes;
using DanpheEMR.Utilities;
using System.Data;
using DanpheEMR.ServerModel.InventoryModels.InventoryReportModel;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.Reporting
{
    public class InventoryReportsController : Controller
    {
        readonly string connString = null;
        public InventoryReportsController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
        }

        public IActionResult ReportsMain()
        {
            return View("~/Views/InventoryView/Reports/ReportsMain.cshtml");
        }




        #region Current Stock Level Report

        public string CurrentStockLevelReport(string ItemName)
        {
            DanpheHTTPResponse<List<CurrentStockLevel>> responseData = new DanpheHTTPResponse<List<CurrentStockLevel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<CurrentStockLevel> currentstocklevel = invreportingDbContext.CurrentStockLevelReport(ItemName);

                responseData.Status = "OK";
                responseData.Results = currentstocklevel;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string CurrentStockLevelReportById(int ItemId)
        {
            DanpheHTTPResponse<List<CurrentStockLevel>> responseData = new DanpheHTTPResponse<List<CurrentStockLevel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<CurrentStockLevel> currentstocklevel = invreportingDbContext.CurrentStockLevelReportByItemId(ItemId);

                responseData.Status = "OK";
                responseData.Results = currentstocklevel;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult StockLevel()
        {
            return View("~/Views/InventoryView/Reports/StockLevel.cshtml");
        }

        #endregion

        #region Write Off Report

        public string CurrentWriteOffReport(int ItemId)
        {
            DanpheHTTPResponse<List<CurrentWriteOff>> responseData = new DanpheHTTPResponse<List<CurrentWriteOff>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<CurrentWriteOff> currentwriteoff = invreportingDbContext.CurrentWriteOffReport(ItemId);

                responseData.Status = "OK";
                responseData.Results = currentwriteoff;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion

        #region Return To Vendor Report

        public string ReturnToVendorReport(int VendorId)
        {
            DanpheHTTPResponse<List<ReturnToVendor>> responseData = new DanpheHTTPResponse<List<ReturnToVendor>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<ReturnToVendor> currentwriteoff = invreportingDbContext.ReturnToVendorReport(VendorId);

                responseData.Status = "OK";
                responseData.Results = currentwriteoff;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #endregion



        #region Daily Item Dispatch Report

        public string DailyItemDispatchReport(DateTime FromDate, DateTime ToDate, string DepartmentName)
        {
            DanpheHTTPResponse<List<DailyItemDispatchModel>> responseData = new DanpheHTTPResponse<List<DailyItemDispatchModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<DailyItemDispatchModel> currentItemdispatchlevel = invreportingDbContext.DailyItemDispatchReport(FromDate, ToDate, DepartmentName);

                responseData.Status = "OK";
                responseData.Results = currentItemdispatchlevel;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult DailyItemDispatch()
        {
            return View("~/Views/InventoryView/Reports/DailyItemDispatch.cshtml");
        }

        #endregion

        #region Purchase Order Report

        public string PurchaseOrderReport(DateTime FromDate, DateTime ToDate, int OrderNumber)
        {
            DanpheHTTPResponse<List<PurchaseOrderModel>> responseData = new DanpheHTTPResponse<List<PurchaseOrderModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<PurchaseOrderModel> currentPurchaseOrderlevel = invreportingDbContext.PurchaseOrderReport(FromDate, ToDate, OrderNumber);

                responseData.Status = "OK";
                responseData.Results = currentPurchaseOrderlevel;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult PurchaseOrderSummery()
        {
            return View("~/Views/InventoryView/Reports/PurchaseOrderSummery.cshtml");
        }

        #endregion


        #region Inventory Summary Report

        public string InventorySummaryReport(DateTime FromDate, DateTime ToDate, string ItemName)
        {
            DanpheHTTPResponse<List<InventorySummaryModel>> responseData = new DanpheHTTPResponse<List<InventorySummaryModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<InventorySummaryModel> allInventorySummaryData = invreportingDbContext.InventorySummaryReport(FromDate, ToDate, ItemName);

                responseData.Status = "OK";
                responseData.Results = allInventorySummaryData;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult InventorySummary()
        {
            return View("~/Views/InventoryView/Reports/InventorySummary.cshtml");
        }

        #endregion

        #region Inventory Valuation

        public string InventoryValuationReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable dsbStats = invreportingDbContext.InventoryValuation();

                responseData.Status = "OK";
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult InventoryValuation()
        {
            return View("~/Views/InventoryView/Reports/InventoryValuation.cshtml");
        }
        #endregion

        #region ComparisonPOGR
        public string ComparisonPoGrReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable dsbStats = invreportingDbContext.ComparisonPOGR();

                responseData.Status = "OK";
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult ComparisonPOGR()
        {
            return View("~/Views/InventoryView/Reports/ComparisonPOGR.cshtml");
        }
        #endregion

        #region PurchaseReport
        public string PurchaseReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable dsbStats = invreportingDbContext.PurchaseReports();

                responseData.Status = "OK";
                responseData.Results = dsbStats;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public IActionResult IPurchaseReport()
        {
            return View("~/Views/InventoryView/Reports/PurchaseReport.cshtml");
        }
        #endregion

        #region Fixed Assets Report

        public string FixedAssetsReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<List<FixedAssetsModel>> responseData = new DanpheHTTPResponse<List<FixedAssetsModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<FixedAssetsModel> currentFixedAssets = invreportingDbContext.FixedAssetsReport(FromDate, ToDate);

                responseData.Status = "OK";
                responseData.Results = currentFixedAssets;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion


    }
}
