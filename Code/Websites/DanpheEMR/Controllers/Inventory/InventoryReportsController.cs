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
        public string CurrentStockItemDetailsByStoreId(string StoreIds, int ItemId)
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
        public string INVPurchaseItemsReport(DateTime FromDate, DateTime ToDate, int FiscalYearId, string ItemIds )
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable result = invreportingDbContext.INVPurchaseItemsReport(FromDate, ToDate, FiscalYearId,ItemIds);
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

        public string PurchaseOrderReport(DateTime FromDate, DateTime ToDate, int? StoreId)
        {
            DanpheHTTPResponse<List<PurchaseOrderModel>> responseData = new DanpheHTTPResponse<List<PurchaseOrderModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<PurchaseOrderModel> currentPurchaseOrderlevel = invreportingDbContext.PurchaseOrderReport(FromDate, ToDate, StoreId);

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
                List<GoodsReceiptModel> dsbStats = invreportingDbContext.CancelledPOandGRReports(FromDate, ToDate, GR);

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
        public string GoodReceiptEvaluationReport(DateTime? FromDate, DateTime? ToDate, string TransactionType, int? GoodReceiptNo)
        {
            DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>> responseData = new DanpheHTTPResponse<List<GoodsReceiptEvaluationModel>>();
            try
            {

                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<GoodsReceiptEvaluationModel> dsbStats = invreportingDbContext.GoodReceiptEvaluationReport(FromDate, ToDate, TransactionType, GoodReceiptNo);

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

        #region Fixed Assets Movement Report

        public string FixedAssetsMovementReport(DateTime FromDate, DateTime ToDate, int? EmployeeId, int? DepartmentId, int? ItemId,string ReferenceNumber)
        {
            DanpheHTTPResponse<List<FixedAssetsMovementModel>> responseData = new DanpheHTTPResponse<List<FixedAssetsMovementModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<FixedAssetsMovementModel> currentFixedAssets = invreportingDbContext.FixedAssetsMovementReport(FromDate, ToDate, EmployeeId, DepartmentId, ItemId, ReferenceNumber);

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

        #region Detail Stock Ledger Model Report

        public string DepartmentDetailStockLedgerReport(DateTime FromDate, DateTime ToDate, int? ItemId, int selectedStoreId)
        {
            DanpheHTTPResponse<List<DetailStockLedgerModel>> responseData = new DanpheHTTPResponse<List<DetailStockLedgerModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<DetailStockLedgerModel> currentDetailStockLedger = invreportingDbContext.DepartmentDetailStockLedgerReport(FromDate, ToDate, ItemId, selectedStoreId);

                responseData.Status = "OK";
                responseData.Results = currentDetailStockLedger;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        public string ApprovedMaterialStockRegisterReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<List<ApprovedMaterialStockRegisterModel>> responseData = new DanpheHTTPResponse<List<ApprovedMaterialStockRegisterModel>>();
            try
            {

                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<ApprovedMaterialStockRegisterModel> currentFixedAssets = invreportingDbContext.ApprovedMaterialStockRegisterReport(FromDate, ToDate);

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

        #region Vendor Transaction Report
        public string VendorTransactionReport(int fiscalYearId, int VendorId)
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

                DataTable result = invreportingDbContext.VendorTransactionReportData(fiscalYearId, VendorId);

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
        public string SubstoreStockReport(int StoreId, int ItemId)
        {
            DanpheHTTPResponse<SubstoreReportViewModel> responseData = new DanpheHTTPResponse<SubstoreReportViewModel>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                SubstoreReportViewModel substoreStock = invreportingDbContext.SubstoreStockReport(StoreId, ItemId);

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
        public string InvPurchaseSummaryReport(DateTime FromDate, DateTime ToDate, int VendorId)
        {
            //DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
                DataTable result = invreportingDbContext.InvPurchaseSummaryReport(FromDate, ToDate,VendorId);
                var itmCategoryList = (from itmcat in inventoryDbContext.ItemCategoryMaster
                                       where itmcat.IsActive == true
                                       select itmcat.ItemCategoryName).ToList();
                responseData.Status = "OK";
                responseData.Results = new
                {
                    PurchaeSummaryList = result,
                    GRCategoryList = itmCategoryList
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
        #region Grid Data Function ExpiryItemReport
        public string ExpiryItemReport(int? ItemId, int? StoreId, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable expiryItemResult = invreportingDbContext.ExpiryItemReport(ItemId, StoreId, FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = expiryItemResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region SupplierWiseStock
        public string GetAllVendorList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                InventoryDbContext invreportingDbContext = new InventoryDbContext(connString);
                var result = (from ven in invreportingDbContext.Vendors
                              select new
                              {
                                  VendorId = ven.VendorId,
                                  VendorName = ven.VendorName
                              }).ToList();
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

        public string GetAllItemsList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                InventoryDbContext invreportingDbContext = new InventoryDbContext(connString);
                var result = (from itm in invreportingDbContext.Items
                              select new
                              {
                                  ItemId = itm.ItemId,
                                  ItemName = itm.ItemName
                              }).ToList();
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

        public string GetAllStoreList()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                InventoryDbContext invreportingDbContext = new InventoryDbContext(connString);
                var result = (from s in invreportingDbContext.StoreMasters
                              select new
                              {
                                  StoreId = s.StoreId,
                                  StoreName = s.Name
                              }).ToList();
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

        public string SupplierWiseStockReport(DateTime FromDate, DateTime ToDate, int? VendorId, int? StoreId, int? ItemId)
        {
            DanpheHTTPResponse<List<SupplierWiseStockModel>> responseData = new DanpheHTTPResponse<List<SupplierWiseStockModel>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<SupplierWiseStockModel> result = invreportingDbContext.SupplierWiseStockReport(FromDate, ToDate, VendorId, StoreId, ItemId);
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

        #region Inventory Purchase return to supplier report
        public string InvReturnToSupplierReport(DateTime FromDate, DateTime ToDate, int? VendorId, int? ItemId, string batchNumber, int? goodReceiptNumber, int? creditNoteNumber)
        {
            DanpheHTTPResponse<List<ReturnToVendorItems>> responseData = new DanpheHTTPResponse<List<ReturnToVendorItems>>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                List<ReturnToVendorItems> ReturnToSupplier = invreportingDbContext.ReturnToSupplierReport(FromDate, ToDate, VendorId, ItemId, batchNumber, goodReceiptNumber, creditNoteNumber);

                responseData.Status = "OK";
                responseData.Results = ReturnToSupplier;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        public string INVSupplierInformationReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                InventoryReportingDbContext invreportingDbContext = new InventoryReportingDbContext(connString);
                DataTable supplierInfoResult = invreportingDbContext.INVSupplierInformationReport();
                responseData.Status = "OK";
                responseData.Results = supplierInfoResult;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
    }
}