using System;
using System.Collections.Generic;
using System.Linq;
//using MoreLinq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Utilities;
using DanpheEMR.CommonTypes;
using DanpheEMR.ServerModel;
using System.Data;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ServerModel.ReportingModels;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class PharmacyReportController : Controller
    {
        private readonly string connString = null;
        public PharmacyReportController(IOptions<MyConfiguration> _config)
        {

            connString = _config.Value.Connectionstring;
        }

        #region Pharmacy Main View
        public IActionResult ReportMain()
        {
            return View("~/Views/PharmacyView/Report/ReportMain.cshtml");
        }
        #endregion

        #region Pharmacy Main View
        public IActionResult PHRMPurchaseOrder()
        {
            return View("~/Views/PharmacyView/Report/PHRMPurchaseOrder.cshtml");
        }
        #endregion

        #region PHRM Purchase Order ReportFunction
        public string PHRMPurchaseOrderReport(DateTime FromDate, DateTime ToDate, string Status)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMPurchaseOrderReport(FromDate, ToDate, Status);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #endregion

        //Stock Manage Detail Report Function
        public string StockManageReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMStockManageDetailReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        //Deposit Balance Report Function
        public string DepositBalanceReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {

                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMDepositBalanceReport();
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }


        #region PHRM User Collection ReportFunction
        public string PHRMUserwiseCollectionReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMUserwiseCollectionReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region PHRM Sale Return ReportFunction
        public string PHRMSaleReturnReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMSaleReturnReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion
        #region PHRM Counter Collection ReportFunction
        public string PHRMCounterwiseCollectionReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMCunterwiseCollectionReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public string PHRMDailySalesReport(DateTime FromDate, DateTime ToDate, int itemId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);

            //var FromDateonly = FromDate.AddDays(-1);
            var ToDateOnly = ToDate.AddDays(1);
            var dailysales = phrmdbcontext.PHRMInvoiceTransactionItems.
                Where(a => a.CreatedOn > FromDate && a.CreatedOn < ToDateOnly && (a.ItemId == itemId || itemId == 0)).ToList().

                Join(phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.IsReturn == null).ToList(), a => a.InvoiceId, b => b.InvoiceId, (a, b) => new PHRMInvoiceTransactionItemsModel
                {
                    InvoicePrintId = b.InvoicePrintId,
                    InvoiceId = a.InvoiceId,
                    ItemName = a.ItemName,
                    BatchNo = a.BatchNo,
                    Quantity = a.Quantity,
                    Price = a.Price,
                    TotalAmount = a.TotalAmount,
                    CreatedOn = a.CreatedOn,
                    PatientName = (from pat in phrmdbcontext.PHRMPatient
                                   where pat.PatientId == b.PatientId select pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName).FirstOrDefault(),
                    CreatedOnNp= DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Year.ToString()+"-"+ DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Month.ToString() +"-"+
                                     DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Day.ToString()
                });
      
            responseData.Status = "OK";
            responseData.Results = dailysales;

            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public FileContentResult ExportToExcelPHRMCounterwiseCollectionReport(DateTime FromDate, DateTime ToDate)
        {

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                //get report result in datatabel                
                DataTable ExcelDbCounterCollectionReport = phrmreportingDbContext.PHRMCunterwiseCollectionReport(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForCounterCollection = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date" , Formula = ColumnFormulas.Date });
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "UserName", ColDisplayName = "User Name", });
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "CounterName", ColDisplayName = "Counter Name" });
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "TotalAmount", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "DiscountAmount", ColDisplayName = "DiscountAmount", Formula = ColumnFormulas.Sum });

                //  var FinalColsForDoctorRevenueInSorted = ExcelDbCounterCollectionReport.OrderBy(x => x.DisplaySeq).ToList();
                var FinalColsSorted = columnamesForCounterCollection.OrderBy(x => x.DisplaySeq).ToList();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsSorted, ExcelDbCounterCollectionReport, "Counter Collection Report", false, true);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "CounterCollectionReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion


        #region PHRM Breakage Items Report Function
        public string PHRMBreakageItemReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMBreakageItemReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public FileContentResult ExportToExcelPHRMBreakageItemReport(DateTime FromDate, DateTime ToDate)
        {

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                //get report result in datatabel                
                DataTable ExcelDbBreakageItemReport = phrmreportingDbContext.PHRMBreakageItemReport(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForBreakageItem = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForBreakageItem.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForBreakageItem.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "UserName", ColDisplayName = "UserName"});
                columnamesForBreakageItem.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ItemName", ColDisplayName = "ItemName", });
                columnamesForBreakageItem.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "TotalAmount", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });

                //  var FinalColsForDoctorRevenueInSorted = ExcelDbCounterCollectionReport.OrderBy(x => x.DisplaySeq).ToList();
                var FinalColsSorted = columnamesForBreakageItem.OrderBy(x => x.DisplaySeq).ToList();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsSorted, ExcelDbBreakageItemReport, "Pharmacy Breakage Items Report", false, true);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "BreakageItemsReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        #region PHRM Return To Supplier Report Function
        public string PHRMReturnToSupplierReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMReturnToSupplierReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        #endregion


        #region PHRM Goods Receipt Product Function
        public string PHRMGoodsReceiptProductReport(DateTime FromDate, DateTime ToDate,int ItemId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMGoodReceiptProductReport(FromDate, ToDate,ItemId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }
        #endregion

        #region Pharmacy PHRMItemWiseStock
        public IActionResult PHRMItemWiseStock()
        {
            return View("~/Views/PharmacyView/Report/PHRMItemWiseStock.cshtml");
        }
        #endregion


        #region PHRM ItemWise Stock Report Function
        public string PHRMItemWiseStockReport()
        {
            DanpheHTTPResponse<List<PHRMItemWiseStockReportModel>> responseData = new DanpheHTTPResponse<List<PHRMItemWiseStockReportModel>>();
            try
            {

                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                List<PHRMItemWiseStockReportModel> phrmItemWiseStock = phrmreportingDbContext.PHRMItemWiseStockReport();
                responseData.Status = "OK";
                responseData.Results = phrmItemWiseStock;
            }
            catch (Exception ex)
            {
                //Insert exception details into database table.
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region PHRM  Dispensary Store Stock ReportFunction
        public string PHRMDispensaryStoreStockReport(string Status)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable DispensaryStoreResult = phrmreportingDbContext.PHRMDispensaryStoreStockReport(Status);
                responseData.Status = "OK";
                responseData.Results = DispensaryStoreResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Main Pharmacy Supplier Information Report
        #region View PHRMSupplierInfo
        public IActionResult PHRMSupplierInfo()
        {
            return View("~/Views/PharmacyView/Report/PHRMSupplierInfo.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMSupplierInfo
        public string PHRMSupplierInformationReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable supplierInfoResult = phrmreportingDbContext.PHRMSupplierInformationReport();
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

        #endregion
        #region Export To Excel Function PHRMSupplierInfo
        public FileContentResult ExportToExcelPHRMSupplierInfoReport()
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable supplierInfoResult = phrmreportingDbContext.PHRMSupplierInformationReport();
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForSupplierInfoReport = new List<ColumnMetaData>();
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "SupplierName", DisplaySeq = 0, ColDisplayName = "Supplier Name" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "ContactNo", DisplaySeq = 1, ColDisplayName = "Contact Number", });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "City", DisplaySeq = 2, ColDisplayName = "City Name" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "Pin", DisplaySeq = 3, ColDisplayName = "Pin Code" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "ContactAddress", DisplaySeq = 4, ColDisplayName = "ContactAddress" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "Email", DisplaySeq = 5, ColDisplayName = "Email ID" });

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(columnamesForSupplierInfoReport, supplierInfoResult, "Supplier Info Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "PharmacySupplierInfoReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Credit IN/OUT Patient Report 
        #region View Function PharmacyCreditIN/OUTPatientReport
        public IActionResult PHRMCreditInOutPatient()
        {
            return View("~/Views/PharmacyView/Report/PHRMCreditInOutPatient.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMCreditInOutPatReport
        public string PHRMCreditInOutPatReport(DateTime FromDate, DateTime ToDate, bool IsInOutPat, string patientName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable creditInOutPatResult = phrmreportingDbContext.PHRMCreditInOutPatReport(FromDate,ToDate,IsInOutPat, patientName);
                responseData.Status = "OK";
                responseData.Results = creditInOutPatResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMCreditInOutPatReport
        public FileContentResult ExportToExcelPHRMCreditInOutPatientReport(DateTime FromDate, DateTime ToDate, bool IsInOutPat, string patientName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable exportExcelCreditInOutObj = phrmreportingDbContext.PHRMCreditInOutPatReport(FromDate, ToDate,IsInOutPat, patientName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForCreditInOutPatReport = new List<ColumnMetaData>();
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "SupplierName", DisplaySeq = 0, ColDisplayName = "Supplier Name" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "ContactNo", DisplaySeq = 1, ColDisplayName = "Contact Number", });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "City", DisplaySeq = 2, ColDisplayName = "City Name" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "Pin", DisplaySeq = 3, ColDisplayName = "Pin Code" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "ContactAddress", DisplaySeq = 4, ColDisplayName = "ContactAddress" });
                //columnamesForSupplierInfoReport.Add(new ColumnMetaData() { ColName = "Email", DisplaySeq = 5, ColDisplayName = "Email ID" });

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForCreditInOutPatReport, exportExcelCreditInOutObj, "Credit In/Out Patient Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "CreditIN_OUT_InfoReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Supplier Stock Summary Report 
        #region View Function PHRMSupplierStockSummaryReport
        public IActionResult PHRMSupplierStockSummary()
        {
            return View("~/Views/PharmacyView/Report/PHRMSupplierStockSummary.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMSupplierStockSummaryReport
        public string PHRMSupplierStockSummaryReport(string SupplierName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable suppStkSummaryResult = phrmreportingDbContext.PHRMSupplierStockSummaryReport(SupplierName);
                responseData.Status = "OK";
                responseData.Results = suppStkSummaryResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMCreditInOutPatReport
        public FileContentResult ExportToExcelPHRMSupplierStockSummaryReport(string SupplierName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportsuppStkSummaryResult = phrmreportingDbContext.PHRMSupplierStockSummaryReport(SupplierName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForSuppStockSummaryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForSuppStockSummaryReport, excelExportsuppStkSummaryResult, "Supplier Stock Summary Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "SupplierStockSummaryReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Stock Items Report 
        #region View Function PHRMStockItemsReport
        public IActionResult PHRMStockItems()
        {
            return View("~/Views/PharmacyView/Report/PHRMStockItems.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMStockItemsReport
        public string PHRMStockItemsReport(int itemId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);

            //try
            //{
                //    PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                //    DataTable stockItemsResult = phrmreportingDbContext.PHRMStockItemsReport(itemId);
                //    responseData.Status = "OK";
                //    responseData.Results = stockItemsResult;
                //}
                //catch (Exception ex)
                //{
                //    responseData.Status = "Failed";
                //    responseData.ErrorMessage = ex.Message;
                //}
                try {
                    //var totalStock = phrmdbcontext.PHRMStockTransactionModel.
                    //    Where(a => a.ExpiryDate >= DateTime.Now).ToList().
                    //    GroupBy(a => new { a.ItemId, a.BatchNo }).
                    //    Select(g => new PHRMStockTransactionItemsModel
                    //    {
                    //        ItemId = g.Key.ItemId,
                    //        BatchNo = g.Key.BatchNo,
                    //        Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) - g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out").Sum(o => o.Quantity),
                    //        FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                    //        ExpiryDate = g.FirstOrDefault().ExpiryDate,
                    //        MRP = g.FirstOrDefault().MRP,
                    //        Price = g.FirstOrDefault().Price,

                    //    }).Where(a => (a.Quantity > 0 || a.Quantity == 0) && (a.ItemId == itemId || itemId == 0)).
                    //    GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId,
                    //    (a, b) => new GoodReceiptItemsViewModel
                    //    {
                    //        ItemId = a.ItemId.Value,
                    //        BatchNo = a.BatchNo,
                    //        ExpiryDate = a.ExpiryDate.Value.Date,
                    //        ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    //        AvailableQuantity = a.Quantity,
                    //        MRP = a.MRP.Value,
                    //        GRItemPrice = a.Price.Value,
                    //        GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    //        IsActive = true,
                    //        MinStockQuantity= b.Select(s=>s.MinStockQuantity).FirstOrDefault(),


                    //    }
                    //        ).OrderBy(expDate => expDate.ExpiryDate).ToList().Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    //        { GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    //        .Select(s => new GoodReceiptItemsViewModel
                    //        {

                    //            ItemId = s.GoodReceiptItemsViewModel.ItemId,
                    //            BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                    //            ExpiryDate = s.GoodReceiptItemsViewModel.ExpiryDate.Date,
                    //            ItemName = s.GoodReceiptItemsViewModel.ItemName,
                    //            AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,
                    //            MRP = s.GoodReceiptItemsViewModel.MRP,
                    //            GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                    //            CategoryName = s.PHRMCategory.CategoryName,
                    //            TotalAmount= (s.GoodReceiptItemsViewModel.GRItemPrice) * Convert.ToDecimal(s.GoodReceiptItemsViewModel.AvailableQuantity),
                    //            IsActive = true,
                    //            MinStockQuantity=s.GoodReceiptItemsViewModel.MinStockQuantity,

                    //        });

                var totalStock = (from stk in phrmdbcontext.DispensaryStock.AsEnumerable()
                                  join itm in phrmdbcontext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                                  where stk.ItemId == itemId
                                  select new
                                  {
                                      ItemId = stk.ItemId,
                                      BatchNo = stk.BatchNo,
                                      ExpiryDate = stk.ExpiryDate,
                                      ItemName = itm.ItemName,
                                      AvailableQuantity = stk.AvailableQuantity,
                                      MRP = stk.MRP,
                                      GRItemPrice = stk.Price,
                                      TotalAmount = (stk.Price) * Convert.ToDecimal(stk.AvailableQuantity),
                                      IsActive = true,
                                      MinStockQuantity = itm.MinStockQuantity,
                                  }).ToList();
                responseData.Status = "OK";
                responseData.Results = totalStock;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMCreditInOutPatReport
        public FileContentResult ExportToExcelPHRMStockItemsReport(int ItemId, string SummaryData, string SummaryHeader)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable exportExcelstockItemsResult = StockItemsReport(ItemId);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForTotalItemBill = new List<ColumnMetaData>();

                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "TotalAmount", ColDisplayName = "NetAmount", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ItemName", ColDisplayName = "Item Name", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "BatchNo", ColDisplayName = "BatchNo", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "AvailableQuantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "GRItemPrice", ColDisplayName = "GRP", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "MRP", ColDisplayName = "MRP", });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForTotalItemInSorted = columnamesForTotalItemBill.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Stock Items Report";
                export.LoadFromDataTable(FinalColsForTotalItemInSorted, exportExcelstockItemsResult, header, true, true, SummaryData: SummaryData, summaryHeader: SummaryHeader);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "StockItemsReport.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , fileName);

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Stock Movement Report 
        #region View Function PHRMStockMovement Report
        public IActionResult PHRMStockMovement()
        {
            return View("~/Views/PharmacyView/Report/PHRMStockMovement.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMStockMovementReport
        public string PHRMStockMovementReport(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable stkMovementReportResult = phrmreportingDbContext.PHRMStockMovementReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = stkMovementReportResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMStockMovementReport
        public FileContentResult ExportToExcelPHRMStockMovementReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable exportExcelStkMovementReportResult = phrmreportingDbContext.PHRMStockMovementReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForStockMovementReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForStockMovementReport, exportExcelStkMovementReportResult, "Stock Movement Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "StockMovementReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Batch Stock Report 
        #region View Function PHRMBatchStock Report
        public IActionResult PHRMBatchStock()
        {
            return View("~/Views/PharmacyView/Report/PHRMBatchStock.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMBatchStockReport
        public string PHRMBatchStockReport(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable batchStkResult = phrmreportingDbContext.PHRMBatchStockReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = batchStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMBatchStockReport
        public FileContentResult ExportToExcelPHRMBatchStockReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportBatchStkResult = phrmreportingDbContext.PHRMBatchStockReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForBatchStockReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForBatchStockReport, excelExportBatchStkResult, "Batch Stock Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "BatchStockReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion
        #region Main Pharmacy PHRM Expiry Report
        #region View Function Pharmacy Expiry Report
        public IActionResult PHRMExpiryReport()
        {
            return View("~/Views/PharmacyView/Report/PHRMExpiryReport.cshtml");
        }
        #endregion

        #region Grid Data Function PHRMExpiryStockReport
        public string PHRMExpiryStockReport(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable expiryStkResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = expiryStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMExpiryReport
        public FileContentResult ExportToExcelPHRMExpiryReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForExpiryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForExpiryReport, excelExportExpiryReportResult, "Expiry Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "ExpiryReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion
        #region Main Pharmacy PHRM Daily Sales Report
        #region View Function Pharmacy Daily Sales Report
        public IActionResult PHRMDailySales()
        {
            return View("~/Views/PharmacyView/Report/PHRMDailySalesSummary.cshtml");
        }
        #endregion

        #region Grid Data Function PHRMDailySalesSummary
        public string PHRMDailySalesSummary(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable expiryStkResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = expiryStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMExpiryReport
        public FileContentResult ExportToExcelPHRMDailySalesReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForExpiryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForExpiryReport, excelExportExpiryReportResult, "Expiry Report", false, true);
 
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    , "ExpiryReport_.xlsx");
                
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion
        #region Main Pharmacy Minimum Stock Report
        #region View Function Pharmacy Minimun Stock Report
        public IActionResult PHRMMinStock()
        {
            return View("~/Views/PharmacyView/Report/PHRMMinStock.cshtml");
        }
        #endregion

        #region Grid Data Function PHRMMinStockReport
        public string PHRMMinStockReport(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable expiryStkResult = phrmreportingDbContext.PHRMMinStockReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = expiryStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMMinStockReport
        public FileContentResult ExportToExcelPHRMMinStockReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForExpiryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForExpiryReport, excelExportExpiryReportResult, "Expiry Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "MinStockReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion
        #region Main Pharmacy PHRM Supplier Stock Report 
        #region View Function PHRM Supplier Stock Report
        public IActionResult PHRMSupplierStock()
        {
            return View("~/Views/PharmacyView/Report/PHRMSupplierStock.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMSupplierStockReport
        public string PHRMSupplierStockReport(string SupplierName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable supplierStkResult = phrmreportingDbContext.PHRMSupplierStockReport(SupplierName);
                responseData.Status = "OK";
                responseData.Results = supplierStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMSupplierStockReport
        public FileContentResult ExportToExcelPHRMSupplierStockReport(string SupplierName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportSuppStkResult = phrmreportingDbContext.PHRMSupplierStockReport(SupplierName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForSupplStkReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForSupplStkReport, excelExportSuppStkResult, "Supplier Stock Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "SupplierStockReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy PHRM Ending Stock Summary Report 
        #region View Function PHRM Ending Stock Summary Report
        public IActionResult PHRMEndingStockSummary()
        {
            return View("~/Views/PharmacyView/Report/PHRMEndingStockSummary.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMEndingStockSummaryReport
        public string PHRMEndingStockSummaryReport(string ItemName)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable endingStkSummaryResult = phrmreportingDbContext.PHRMEndingStockSummaryReport(ItemName);
                responseData.Status = "OK";
                responseData.Results = endingStkSummaryResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function PHRMEndingStockSummary
        public FileContentResult ExportToExcelPHRMEndingStockSummaryReport(string ItemName)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportEndingStkSummaryResult = phrmreportingDbContext.PHRMEndingStockSummaryReport(ItemName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForEndingStkSummaryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForEndingStkSummaryReport, excelExportEndingStkSummaryResult, "Ending Stock Summary Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "EndingStockSummaryReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion

        #region Main Pharmacy Pharmacy Billing  Report 
            //#region View Function Pharmacy BillingReport Report
            //public IActionResult PharmacyBillingReport()
            //{
            //    return View("~/Views/PharmacyView/Report/PHRMBillingReport.cshtml");
            //}
            //#endregion
            #region Grid Data Function PHRMBillingReport
            public string PHRMBillingReport(DateTime FromDate, DateTime ToDate, int InvoiceNumber)
            {
                DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
                try
                {
                    PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                    DataTable billingReportResult = phrmreportingDbContext.PHRMBillingReport(FromDate, ToDate,InvoiceNumber);
                    responseData.Status = "OK";
                    responseData.Results = billingReportResult;
                }
                catch (Exception ex)
                {
                    responseData.Status = "Failed";
                    responseData.ErrorMessage = ex.Message;
                }
                return DanpheJSONConvert.SerializeObject(responseData);
            }
            #endregion
            #region Export To Excel Function PHRMBillingReport
            public FileContentResult ExportToExcelPHRMBillingReport(DateTime FromDate, DateTime ToDate, int InvoiceNumber)
            {
                try
                {
                    PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                    DataTable exportExcelBillingReportResult = phrmreportingDbContext.PHRMBillingReport(FromDate, ToDate, InvoiceNumber);
                    ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                    //creating list for adding the column 
                    List<ColumnMetaData> colForBillingReport = new List<ColumnMetaData>();

                    //passing the collection in exportExcelHelper 
                    export.LoadFromDataTable(colForBillingReport, exportExcelBillingReportResult, "Pharmacy Billing Report", false, true);

                    //this used to export the package in excel...
                    byte[] filecontent = export.package.GetAsByteArray();
                    return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                         , "PharmacyBillingReport_.xlsx");

                }
                catch (Exception ex)
                {
                    throw ex;
                }

            }
            #endregion
        #endregion

        #region Main Pharmacy PHRM Daily Stock Summary Report
        #region View Function Pharmacy Daily Stock Summary
        public IActionResult PHRMDailyStockSummary()
        {
            return View("~/Views/PharmacyView/Report/PHRMDailyStockSummary.cshtml");
        }
        #endregion
        #region Grid Data Function PHRMDailyStockSummaryReport
        public string PHRMDailyStockSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dailyStkSummaryReportResult = phrmreportingDbContext.PHRMDailyStockSummaryReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = dailyStkSummaryReportResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion
        #region Export To Excel Function Daily Stock Summary Report
        public FileContentResult ExportToExcelPHRMDailyStockSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportDailyStkRept = phrmreportingDbContext.PHRMDailyStockSummaryReport(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForDailyStkSummaryReport = new List<ColumnMetaData>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForDailyStkSummaryReport, excelExportDailyStkRept, "Pharmacy Opening/Ending Stock Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "PharmacyOpening/EndingStockReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #endregion
        public string PHRM_Daily_StockValue()
        {
            DanpheHTTPResponse<DynamicReport> responseData = new DanpheHTTPResponse<DynamicReport>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DynamicReport dailyRevenue = phrmreportingDbContext.PHRM_Daily_StockValue();
                responseData.Status = "OK";
                responseData.Results = dailyRevenue;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        #region

        public DataTable StockItemsReport(int itemId)
        {
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);

            var totalStock = phrmdbcontext.PHRMStockTransactionModel.
                Where(a => a.ExpiryDate >= DateTime.Now).ToList().
                GroupBy(a => new { a.ItemId, a.BatchNo }).
                Select(g => new
                {
                    ItemId = g.Key.ItemId,
                    BatchNo = g.Key.BatchNo,
                    Quantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity) - g.Where(w => w.InOut == "in").Sum(f => f.FreeQuantity).Value - g.Where(w => w.InOut == "out").Sum(o => o.Quantity),
                    FreeQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                    MRP = g.FirstOrDefault().MRP,
                    Price = g.FirstOrDefault().Price,

                }).Where(a => (a.Quantity > 0 || a.Quantity == 0) && (a.ItemId == itemId || itemId == 0)).
                GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId,
                (a, b) => new
                {
                    ItemId = a.ItemId.Value,
                    BatchNo = a.BatchNo,
                    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    AvailableQuantity = a.Quantity,
                    MRP = a.MRP.Value,
                    GRItemPrice = a.Price.Value,
                    GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    MinStockQuantity = b.Select(s=>s.MinStockQuantity).FirstOrDefault(),
                }
                    ).Join(phrmdbcontext.PHRMGenericModel.ToList(), a => a.GenericId, b => b.GenericId, (a, b) => new
                    { GoodReceiptItemsViewModel = a, PHRMGenericModel = b }).Join(phrmdbcontext.PHRMCategory.ToList(), a => a.PHRMGenericModel.CategoryId, b => b.CategoryId, (a, b) => new { a.GoodReceiptItemsViewModel, a.PHRMGenericModel, PHRMCategory = b })
                    .Select(s => new
                    {

                        //ItemId = s.GoodReceiptItemsViewModel.ItemId,
                        BatchNo = s.GoodReceiptItemsViewModel.BatchNo,
                        ItemName = s.GoodReceiptItemsViewModel.ItemName,
                        AvailableQuantity = s.GoodReceiptItemsViewModel.AvailableQuantity,
                        MRP = s.GoodReceiptItemsViewModel.MRP,
                        GRItemPrice = s.GoodReceiptItemsViewModel.GRItemPrice,
                        MinStockQuantity =s.GoodReceiptItemsViewModel.MinStockQuantity,
                        TotalAmount = (s.GoodReceiptItemsViewModel.GRItemPrice) * Convert.ToDecimal(s.GoodReceiptItemsViewModel.AvailableQuantity),

                    });

            DataTable result = DALFunctions.LINQResultToDataTable(totalStock);
            return result;
        }

        #endregion

        #region Grid Data Function PHRM ABC/VED Stock Report
        //[HttpGet("")]
        public string PHRMABCVEDStockReport(string Status)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable ABCVEDStkResult = phrmreportingDbContext.PHRMABCVEDStockReport(Status);
                responseData.Status = "OK";
                responseData.Results = ABCVEDStkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }

        public FileContentResult ExportToExcelPHRMABCVEDStockReport(string Status)
        {

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                //get report result in datatabel                
                DataTable ExcelDbABCVEDReport = phrmreportingDbContext.PHRMABCVEDStockReport(Status);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForABCVED = new List<ColumnMetaData>();
   

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForABCVED, ExcelDbABCVEDReport, "Pharmacy ABC/VED Stock Report", false, true);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "ABC/VEDStockReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Grid Data Function PHRM Store Stock
        public string PHRMStoreStock(String Status)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable StkResult = phrmreportingDbContext.PHRMStoreStock(Status);
                responseData.Status = "OK";
                responseData.Results = StkResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Grid Data Function PHRMDrugCategoryWiseReport
        public string PHRMDrugCategoryWiseReport(DateTime FromDate, DateTime ToDate, string category)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable DrugCategoryWiseReportResult = phrmreportingDbContext.PHRMDrugCategoryWiseReport(FromDate, ToDate, category);
                responseData.Status = "OK";
                responseData.Results = DrugCategoryWiseReportResult;
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
