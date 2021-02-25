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

        public string CurrentStockLevelReportById(string StoreIds)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.CurrentStockLevelReportByItemId(StoreIds);
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string SubStoreDispatchAndConsumptionReport(string StoreIds, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext inventoryReportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = inventoryReportingDbContext.SubStoreDispatchAndConsumptionReport(StoreIds, FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch(Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public string ItemDetailsForDispatchAndConsumptionReport(string StoreIds, int ItemId, string FromDate, string ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext inventoryReportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = inventoryReportingDbContext.ItemDetailsForDispatchAndConsumptionReport(StoreIds, ItemId, FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        public string CurrentStockItemDetailsByStoreId(string StoreIds,int ItemId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.CurrentStockItemDetailsByStoreId(StoreIds, ItemId);
                responseData.Status = "OK";
                responseData.Results = result;
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

        public string DailyItemDispatchReport(DateTime FromDate, DateTime ToDate, int StoreId)
        {
            DanpheHTTPResponse<List<DailyItemDispatchModel>> responseData = new DanpheHTTPResponse<List<DailyItemDispatchModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<DailyItemDispatchModel> currentItemdispatchlevel = invreportingDbContext.DailyItemDispatchReport(FromDate, ToDate, StoreId);

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
        #region Inventory Purchase Items Report
        public string INVPurchaseItemsReport(DateTime FromDate, DateTime ToDate,int FiscalYearId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.INVPurchaseItemsReport(FromDate, ToDate,FiscalYearId);
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
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
        #region Cancelled PO and GR Reports
        public string CancelledPOandGRReport(DateTime FromDate, DateTime ToDate, string isGR)
        {
            DanpheHTTPResponse<List<GoodsReceiptModel>> responseData = new DanpheHTTPResponse<List<GoodsReceiptModel>>();
            try
            {
                bool GR = bool.Parse(isGR);
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<GoodsReceiptModel> dsbStats = invreportingDbContext.CancelledPOandGRReports(FromDate,ToDate,GR);

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
        #endregion

        #region Goods Receipt Evaluation Report
        public string GoodReceiptEvaluationReport(DateTime? FromDate, DateTime? ToDate, string TransactionType,int? GoodReceiptNo)
        {
            DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>> responseData = new DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>>();
            try
            {
                
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<GoodsReceiptEvaluationModel> dsbStats = invreportingDbContext.GoodReceiptEvaluationReport(FromDate,ToDate,TransactionType,GoodReceiptNo);

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
        #endregion

        #region Inventory Summary Report

        public string InventorySummaryReport(DateTime FromDate, DateTime ToDate, int FiscalYearId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.InventorySummaryReport(FromDate, ToDate, FiscalYearId);
                responseData.Status = "OK";
                responseData.Results = result;
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

        #region Vendor Transaction Report
        public string VendorTransactionReport(int fiscalYearId,int VendorId)
        {
            //DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>> responseData = new DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.VendorTransactionReport(fiscalYearId, VendorId);
                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region VendorTransactionReportData
        public string VendorTransactionReportData(int fiscalYearId, int VendorId)
        {
            //DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>> responseData = new DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>>();
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);

                DataTable result = invreportingDbContext.VendorTransactionReportData(fiscalYearId,VendorId);

                responseData.Status = "OK";
                responseData.Results = result;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region ItemMgmtDetail
        public string ItemMgmtDetailReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable dsbStats = invreportingDbContext.ItemMgmtDetail();

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
        #endregion
        #region Substore Report
        public string SubstoreStockReport(int StoreId,int ItemId)
        {
            DanpheHTTPResponse<SubstoreReportViewModel> responseData = new DanpheHTTPResponse<SubstoreReportViewModel>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                SubstoreReportViewModel substoreStock = invreportingDbContext.SubstoreStockReport(StoreId,ItemId);

                responseData.Status = "OK";
                responseData.Results = substoreStock;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Inventory Purchase summary report
        public string InvPurchaseSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            //DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                DataTable result = invreportingDbContext.InvPurchaseSummaryReport(FromDate, ToDate);
                var itmCategoryList = (from itmcat in inventoryDbContext.ItemCategoryMaster
                                       where itmcat.IsActive == true
                                       select itmcat).OrderByDescending(s => s.ItemCategoryId).ToList();                
                responseData.Status = "OK";
                responseData.Results = new {
                    PurchaeSummaryList=result,
                    GRCategoryList= itmCategoryList.Select(t => t.ItemCategoryName).ToList()
                };
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
