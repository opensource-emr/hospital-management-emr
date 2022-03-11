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

using System.Data.SqlClient;
using DanpheEMR.ServerModel.ReportingModels;
using DanpheEMR.ServerModel.PharmacyModels;
using System.Transactions;
using System.Data.Entity;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    public class PharmacyReportController : Controller
    {
        private readonly string connString = null;
        private PharmacyDbContext db;
        public DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        public PharmacyReportController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);
        }
        #region Get Active Stores list

        [HttpGet("GetActiveStores")]
        [Route("~/api/PharmacyReport/GetActiveStores")]
        public IActionResult GetActiveStores()
        {
            var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;
            var storeCategory = Enums.ENUM_StoreCategory.Store;
            var storeList = db.PHRMStore.Where(d => d.Category == dispensaryCategory || (d.Category == storeCategory && d.SubCategory != "inventory")).ToList();
            responseData.Status = "OK";
            responseData.Results = storeList;
            return Ok(responseData);
        }
        #endregion

        #region Get User Details
        [HttpGet("getPharmacyUsersForReturnFromCustomerReport")]
        [Route("~/api/PharmacyReport/GetPharmacyUsersForReturnFromCustomerReport")]
        public IActionResult GetPharmacyUsersForReturnFromCustomerReport()
        {
            var userList = (from user in db.Users
                            join invretitems in db.PHRMInvoiceReturnItemsModel on user.EmployeeId equals invretitems.CreatedBy
                            select new
                            {
                                userId = user.EmployeeId,
                                userName = user.UserName
                            }).Distinct().ToList();
            responseData.Status = "OK";
            responseData.Results = userList;
            return Ok(responseData);
        }
        #endregion
        #region Get Only ItemName and Id 

        [HttpGet("GetOnlyItemNameList")]
        [Route("~/api/PharmacyReport/GetOnlyItemNameList")]
        public IActionResult GetOnlyItemName()
        {
            var itemList = (from item in db.PHRMItemMaster
                            select new
                            {
                                ItemId = item.ItemId,
                                ItemName = item.ItemName
                            }).ToList();
            responseData.Status = "OK";
            responseData.Results = itemList;
            return Ok(responseData);
        }
        #endregion


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
        public string PHRMUserwiseCollectionReport(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy, int? StoreId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                if (CounterId == "0")
                {
                    CounterId = "";
                }
                List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? string.Empty : CreatedBy),
                            new SqlParameter("@StoreId", StoreId)
                };

                DataSet dsUsrCollnDetail = DALFunctions.GetDatasetFromStoredProc("SP_PHRM_UserwiseCollectionReport", paramList, phrmreportingDbContext);
                responseData.Status = "OK";

                responseData.Results = new
                {
                    UserCollectionDetails = dsUsrCollnDetail.Tables[0],
                    SettlementSummary = PHRM_UserColln_SettlementSummaryVM.MapDataTableToSingleObject(dsUsrCollnDetail.Tables[1]),
                    UserCollectionSummary = dsUsrCollnDetail.Tables[2]
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

        #region PHRM Cash Collection Summary ReportFunction
        public string PHRMCashCollectionSummaryReport(DateTime FromDate, DateTime ToDate, int? StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMCashCollectionSummaryReport(FromDate, ToDate, StoreId);
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

        public string PHRMDailySalesReport(DateTime FromDate, DateTime ToDate, int itemId, int? storeId, int? CounterId, int? UserId)
        {
            //ramesh:19Jan'22--Adding Isolation level to read uncommitted so that this query doesn't wait for other transaction to complete.
            //changed this method to async
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted }))
            {
                var ToDateOnly = ToDate.AddDays(1);
                var dailysales = phrmdbcontext.PHRMInvoiceTransactionItems
                    .Join(phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.IsReturn == null), a => a.InvoiceId, b => b.InvoiceId, (invI, inv) => new { invI, inv })
                    .Join(phrmdbcontext.PHRMItemMaster, i => i.invI.ItemId, item => item.ItemId, (invI, itm) => new { invI.invI, invI.inv, itm.GenericId })
                    .Join(phrmdbcontext.PHRMGenericModel, i => i.GenericId, gen => gen.GenericId, (i, gen) => new { i.invI, i.inv, gen.GenericName })
                    .Join(phrmdbcontext.PHRMPatient, i => i.invI.PatientId, p => p.PatientId, (i, patient) => new { i.invI, i.inv, i.GenericName, patient })
                    .Join(phrmdbcontext.PHRMStore, i => i.invI.StoreId, s => s.StoreId, (i, store) => new { i.invI, i.inv, i.GenericName, i.patient, StoreName = store.Name })
                    .Join(phrmdbcontext.PHRMCounters, i => i.invI.CounterId, c => c.CounterId, (i, counter) => new { i.invI, i.inv, i.GenericName, i.patient, i.StoreName, counter.CounterName })
                    .Join(phrmdbcontext.Employees, i => i.invI.CreatedBy, e => e.EmployeeId, (i, employee) => new { i.invI, i.inv, i.GenericName, i.patient, i.StoreName, i.CounterName, CreatedByName = employee.FullName })
                    .Where(a => a.invI.CreatedOn > FromDate && a.invI.CreatedOn < ToDateOnly && (a.invI.ItemId == itemId || itemId == 0) && a.invI.Quantity > 0 && (a.invI.StoreId == storeId || storeId == null) && (a.invI.CounterId == CounterId || CounterId == null) && (a.invI.CreatedBy == UserId || UserId == null))
                    .ToList()
                    .Select(a => new PHRMDailySalesReportDto
                    {
                        InvoicePrintId = a.inv.InvoicePrintId,
                        InvoiceId = a.invI.InvoiceId,
                        PatientName = a.patient.FirstName + " " + (string.IsNullOrEmpty(a.patient.MiddleName) ? "" : a.patient.MiddleName + " ") + a.patient.LastName,
                        GenericName = a.GenericName,
                        ItemName = a.invI.ItemName,
                        BatchNo = a.invI.BatchNo,
                        ExpiryDate = a.invI.ExpiryDate,
                        Quantity = a.invI.Quantity,
                        Price = a.invI.Price,
                        MRP = a.invI.MRP,
                        StockValue = Convert.ToDouble(a.invI.Price) * a.invI.Quantity,
                        TotalAmount = a.invI.TotalAmount,
                        CreatedOn = a.invI.CreatedOn,
                        PaymentMode = a.inv.PaymentMode,
                        StoreName = a.StoreName,
                        CounterName = a.CounterName,
                        CreatedByName = a.CreatedByName
                    }).ToList();

                responseData.Status = "OK";
                responseData.Results = dailysales;
            }

            return DanpheJSONConvert.SerializeObject(responseData);

        }

        public string PHRMNarcoticsDailySalesReport(DateTime FromDate, DateTime ToDate, int itemId, int? storeId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);

            //var FromDateonly = FromDate.AddDays(-1);
            var ToDateOnly = ToDate.AddDays(1);
            var dailysale = (from invitem in phrmdbcontext.PHRMInvoiceTransactionItems
                             join itm in phrmdbcontext.PHRMItemMaster.AsEnumerable() on invitem.ItemId equals itm.ItemId
                             where itm.IsNarcotic == true
                             select new
                             {

                                 invitem.InvoiceId,
                                 invitem.ItemName,
                                 invitem.ItemId,
                                 invitem.StoreId,
                                 invitem.BatchNo,
                                 invitem.Quantity,
                                 invitem.Price,
                                 invitem.MRP,
                                 invitem.TotalAmount,
                                 invitem.CreatedOn,

                             }).ToList().OrderBy(a => a.ItemId);


            var dailysales = dailysale.

                Where(a => a.CreatedOn > FromDate && a.CreatedOn < ToDateOnly && (a.ItemId == itemId || itemId == 0) && a.Quantity > 0 && (a.StoreId == storeId || storeId == null)).ToList().

                Join(phrmdbcontext.PHRMInvoiceTransaction.Where(a => a.IsReturn == null).ToList(), a => a.InvoiceId, b => b.InvoiceId, (a, b) => new PHRMInvoiceTransactionItemsModel
                {
                    InvoicePrintId = b.InvoicePrintId,
                    InvoiceId = a.InvoiceId,
                    ItemName = a.ItemName,
                    ItemId = a.ItemId,
                    BatchNo = a.BatchNo,
                    Quantity = a.Quantity,
                    Price = a.Price,
                    MRP = a.MRP,
                    TotalAmount = a.TotalAmount,
                    CreatedOn = a.CreatedOn,
                    PatientName = (from pat in phrmdbcontext.PHRMPatient
                                   where pat.PatientId == b.PatientId
                                   select pat.ShortName).FirstOrDefault(),
                    DoctorName = (from doc in phrmdbcontext.Employees
                                  where doc.EmployeeId == b.ProviderId
                                  select doc.FullName).FirstOrDefault(),
                    NMCNumber = (from doc in phrmdbcontext.Employees
                                 where doc.EmployeeId == b.ProviderId
                                 select doc.MedCertificationNo).FirstOrDefault(),
                    CreatedOnNp = DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Year.ToString() + "-" + DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Month.ToString() + "-" +
                                     DanpheDateConvertor.ConvertEngToNepDate(a.CreatedOn.Value).Day.ToString()
                }
            );
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
                columnamesForCounterCollection.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
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
                columnamesForBreakageItem.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "UserName", ColDisplayName = "UserName" });
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

        #region PHRM Return To Store Report Function
        public string PHRMTransferToStoreReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMTransferToStoreReport(FromDate, ToDate);
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

        #region PHRM Return To Dispensary Report Function
        public string PHRMTransferToDispensaryReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMTransferToDispensaryReport(FromDate, ToDate);
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
        public string PHRMGoodsReceiptProductReport(DateTime FromDate, DateTime ToDate, int ItemId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMGoodReceiptProductReport(FromDate, ToDate, ItemId);
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

        #region PHRM  Dispensary Store Stock ReportFunction
        public string PHRMNarcoticsDispensaryStoreStockReport()
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable NarcoDispensaryStoreResult = phrmreportingDbContext.PHRMNarcoticsDispensaryStoreStockReport();
                responseData.Status = "OK";
                responseData.Results = NarcoDispensaryStoreResult;
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
                DataTable creditInOutPatResult = phrmreportingDbContext.PHRMCreditInOutPatReport(FromDate, ToDate, IsInOutPat, patientName);
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
                DataTable exportExcelCreditInOutObj = phrmreportingDbContext.PHRMCreditInOutPatReport(FromDate, ToDate, IsInOutPat, patientName);
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
        public string PHRMStockItemsReport(int itemId, int location)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            try
            {
                //if (location == 1)
                //{
                //    var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;
                //    var totalStock = (from stk in phrmdbcontext.DispensaryStocks.AsEnumerable()
                //                      join itm in phrmdbcontext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                //                      join dispensary in phrmdbcontext.PHRMStore.Where(s => s.Category == dispensaryCategory) on stk.StoreId equals dispensary.StoreId
                //                      where ((itemId == 0) ? true : stk.ItemId == itemId) && stk.AvailableQuantity > 0
                //                      select new StockItemsReportViewModel
                //                      {
                //                          ItemId = stk.ItemId,
                //                          BatchNo = stk.BatchNo,
                //                          ExpiryDate = stk.ExpiryDate,
                //                          ItemName = itm.ItemName,
                //                          AvailableQuantity = stk.AvailableQuantity,
                //                          MRP = stk.MRP,
                //                          IsActive = true,
                //                          MinStockQuantity = itm.MinStockQuantity,
                //                          Location = dispensary.Name
                //                      }).ToList();

                //    responseData.Status = "OK";
                //    responseData.Results = totalStock;
                //}
                //else if (location == 2) //for store
                //{
                //    var totalStock = phrmdbcontext.StockTransactions.Where(a => a.IsActive == true).ToList().
                //        GroupBy(a => new { a.ItemId, a.BatchNo, a.MRP, a.ExpiryDate, a.StockId, a.CostPrice }).
                //        Select(g => new
                //        {
                //            ItemId = g.Key.ItemId,
                //            BatchNo = g.Key.BatchNo,
                //            InQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                //            OutQuantity = g.Where(w => w.InOut == "out").Sum(q => q.Quantity),
                //            ExpiryDate = g.Key.ExpiryDate,
                //            MRP = g.Key.MRP,
                //            IsActive = g.FirstOrDefault().IsActive

                //        }).Where(a => (a.ItemId == itemId || itemId == 0)).
                //        GroupJoin(phrmdbcontext.PHRMItemMaster.ToList(), a => a.ItemId, b => b.ItemId,
                //        (a, b) => new StockItemsReportViewModel
                //        {
                //            ItemId = a.ItemId,
                //            BatchNo = a.BatchNo,
                //            ExpiryDate = a.ExpiryDate.Value.Date,
                //            ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                //            AvailableQuantity = a.InQuantity - a.OutQuantity,
                //            MRP = a.MRP.Value,
                //            IsActive = b.Select(s => s.IsActive).FirstOrDefault(),
                //            MinStockQuantity = b.Select(s => s.MinStockQuantity).FirstOrDefault(),

                //        }).Where(a => a.AvailableQuantity > 0).OrderBy(a => a.ItemName).ToList();

                //    responseData.Status = "OK";
                //    responseData.Results = totalStock;
                //}
                //else if (location == 3)
                //{
                //    var totalStock = (from wardstock in phrmdbcontext.WardStock
                //                      join ward in phrmdbcontext.WardModel on wardstock.WardId equals ward.WardId
                //                      join item in phrmdbcontext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                //                      where wardstock.StockType == "pharmacy" & (wardstock.ItemId == itemId || itemId == 0)
                //                      group new { wardstock, ward, item } by new { wardstock.ItemId, wardstock.StockId, wardstock.BatchNo, wardstock.MRP, wardstock.ExpiryDate } into x
                //                      select new StockItemsReportViewModel
                //                      {

                //                          ItemId = x.Key.ItemId,
                //                          ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                //                          BatchNo = x.Key.BatchNo,
                //                          AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                //                          ExpiryDate = x.Key.ExpiryDate,
                //                          MRP = (decimal)(((int)(x.Key.MRP * 100)) / 100),
                //                          Location = x.Select(a => a.ward.WardName).FirstOrDefault() + " Ward",
                //                          MinStockQuantity = x.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                //                          IsActive = true
                //                      }).ToList();
                //    responseData.Status = (totalStock == null) ? "Failed" : "OK";
                //    responseData.Results = totalStock;
                //}
                //else if (location == 0)
                //{
                //    var dispensaryCategory = Enums.ENUM_StoreCategory.Dispensary;

                //    var totalStock = new List<StockItemsReportViewModel>();
                //    var totalStock1 = (from stk in phrmdbcontext.DispensaryStocks.AsEnumerable()
                //                       join itm in phrmdbcontext.PHRMItemMaster on stk.ItemId equals itm.ItemId
                //                       join dispensary in phrmdbcontext.PHRMStore.Where(s => s.Category == dispensaryCategory) on stk.StoreId equals dispensary.StoreId
                //                       where ((itemId == 0) ? true : stk.ItemId == itemId) && stk.AvailableQuantity > 0
                //                       select new StockItemsReportViewModel
                //                       {
                //                           ItemId = stk.ItemId,
                //                           BatchNo = stk.BatchNo,
                //                           ExpiryDate = stk.ExpiryDate,
                //                           ItemName = itm.ItemName,
                //                           AvailableQuantity = stk.AvailableQuantity,
                //                           MRP = stk.MRP,
                //                           IsActive = true,
                //                           MinStockQuantity = itm.MinStockQuantity,
                //                           Location = dispensary.Name
                //                       }).ToList();
                //    var totalStock2 = phrmdbcontext.StockTransactions.Where(a => a.IsActive == true).ToList().
                //        GroupBy(a => new { a.ItemId, a.BatchNo, a.MRP, a.ExpiryDate }).
                //        Select(g => new
                //        {
                //            ItemId = g.Key.ItemId,
                //            BatchNo = g.Key.BatchNo,
                //            InQuantity = g.Where(w => w.InOut == "in").Sum(q => q.Quantity),
                //            OutQuantity = g.Where(w => w.InOut == "out").Sum(q => q.Quantity),
                //            ExpiryDate = g.Key.ExpiryDate,
                //            MRP = g.Key.MRP,
                //            IsActive = g.FirstOrDefault().IsActive

                //        }).Where(a => (a.ItemId == itemId || itemId == 0)).
                //        GroupJoin(phrmdbcontext.PHRMItemMaster.ToList(), a => a.ItemId, b => b.ItemId,
                //        (a, b) => new StockItemsReportViewModel
                //        {
                //            ItemId = a.ItemId,
                //            BatchNo = a.BatchNo,
                //            ExpiryDate = a.ExpiryDate.Value.Date,
                //            ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                //            AvailableQuantity = a.InQuantity - a.OutQuantity,
                //            MRP = a.MRP.Value,
                //            IsActive = b.Select(s => s.IsActive).FirstOrDefault(),
                //            MinStockQuantity = b.Select(s => s.MinStockQuantity).FirstOrDefault(),

                //        }).Where(a => a.AvailableQuantity > 0).OrderBy(a => a.ItemName).ToList();

                //    var totalStock3 = (from wardstock in phrmdbcontext.WardStock
                //                       join ward in phrmdbcontext.WardModel on wardstock.WardId equals ward.WardId
                //                       join item in phrmdbcontext.PHRMItemMaster on wardstock.ItemId equals item.ItemId
                //                       where wardstock.StockType == "pharmacy" & (wardstock.ItemId == itemId || itemId == 0)
                //                       group new { wardstock, ward, item } by new { wardstock.ItemId, wardstock.StockId, wardstock.BatchNo, wardstock.MRP, wardstock.ExpiryDate } into x
                //                       select new StockItemsReportViewModel
                //                       {

                //                           ItemId = x.Key.ItemId,
                //                           ItemName = x.Select(a => a.item.ItemName).FirstOrDefault(),
                //                           BatchNo = x.Key.BatchNo,
                //                           AvailableQuantity = x.Sum(a => a.wardstock.AvailableQuantity),
                //                           ExpiryDate = x.Key.ExpiryDate,
                //                           MRP = (decimal)(((int)(x.Key.MRP * 100)) / 100),
                //                           Location = x.Select(a => a.ward.WardName).FirstOrDefault() + " Ward",
                //                           MinStockQuantity = x.Select(a => a.item.MinStockQuantity).FirstOrDefault(),
                //                           IsActive = true
                //                       }).ToList();
                //    totalStock1.AddRange(totalStock2);
                //    totalStock1.AddRange(totalStock3);
                //    totalStock = totalStock1.OrderBy(a => a.ItemName).ToList();
                //    responseData.Status = "OK";
                //    responseData.Results = totalStock;
                //}

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
        public string PHRMExpiryStockReport(int? ItemId, int? StoreId, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable expiryStkResult = phrmreportingDbContext.PHRMExpiryReport(ItemId, StoreId, FromDate, ToDate);
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
        public FileContentResult ExportToExcelPHRMExpiryReport(int ItemId, int StoreId, DateTime FromDate, DateTime ToDate)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemId, StoreId, FromDate, ToDate);
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
        //public string PHRMDailySalesSummary(string ItemName)
        //{
        //    DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();

        //    try
        //    {
        //        PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
        //        DataTable expiryStkResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
        //        responseData.Status = "OK";
        //        responseData.Results = expiryStkResult;
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message;
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData);
        //}
        #endregion
        #region Export To Excel Function PHRMExpiryReport
        //public FileContentResult ExportToExcelPHRMDailySalesReport(string ItemName)
        //{
        //    try
        //    {
        //        PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
        //        DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
        //        ExcelExportHelper export = new ExcelExportHelper("Sheet1");

        //        //creating list for adding the column 
        //        List<ColumnMetaData> colForExpiryReport = new List<ColumnMetaData>();

        //        //passing the collection in exportExcelHelper 
        //        export.LoadFromDataTable(colForExpiryReport, excelExportExpiryReportResult, "Expiry Report", false, true);

        //        //this used to export the package in excel...
        //        byte[] filecontent = export.package.GetAsByteArray();
        //        return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        //            , "ExpiryReport_.xlsx");

        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //}
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
        //public FileContentResult ExportToExcelPHRMMinStockReport(string ItemName)
        //{
        //    try
        //    {
        //        PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
        //        DataTable excelExportExpiryReportResult = phrmreportingDbContext.PHRMExpiryReport(ItemName);
        //        ExcelExportHelper export = new ExcelExportHelper("Sheet1");

        //        //creating list for adding the column 
        //        List<ColumnMetaData> colForExpiryReport = new List<ColumnMetaData>();

        //        //passing the collection in exportExcelHelper 
        //        export.LoadFromDataTable(colForExpiryReport, excelExportExpiryReportResult, "Expiry Report", false, true);

        //        //this used to export the package in excel...
        //        byte[] filecontent = export.package.GetAsByteArray();
        //        return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        //             , "MinStockReport_.xlsx");

        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }

        //}
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
        public string PHRMSupplierStockReport(DateTime FromDate, DateTime ToDate, int SupplierId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable supplierStkResult = phrmreportingDbContext.PHRMSupplierStockReport(FromDate, ToDate, SupplierId);
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
        public FileContentResult ExportToExcelPHRMSupplierStockReport(DateTime FromDate, DateTime ToDate, int SupplierId)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable excelExportSuppStkResult = phrmreportingDbContext.PHRMSupplierStockReport(FromDate, ToDate, SupplierId);
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
                DataTable billingReportResult = phrmreportingDbContext.PHRMBillingReport(FromDate, ToDate, InvoiceNumber);
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

        #region Grid Data Function PHRMStockSummaryReport
        public string PHRMStockSummaryReport(DateTime FromDate, DateTime ToDate, int FiscalYearId, int? StoreId)
        {
            DanpheHTTPResponse<dynamic> responseData = new DanpheHTTPResponse<dynamic>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable StkSummaryReportResult = phrmreportingDbContext.PHRMStockSummaryReport(FromDate, ToDate, FiscalYearId, StoreId);
                List<StockSummaryDTO> StockTransations = DataTableToList.ConvertToList<StockSummaryDTO>(StkSummaryReportResult);

                var grandTotal = new StockSummaryDTO
                {
                    OpeningQty = StockTransations.Sum(s => s.OpeningQty),
                    OpeningValue = StockTransations.Sum(s => s.OpeningValue),
                    OpeningQty_WithProvisional = StockTransations.Sum(s => s.OpeningQty_WithProvisional),
                    OpeningValue_WithProvisional = StockTransations.Sum(s => s.OpeningValue_WithProvisional),
                    PurchaseQty = StockTransations.Sum(s => s.PurchaseQty),
                    PurchaseValue = StockTransations.Sum(s => s.PurchaseValue),
                    PurchaseReturnQty = StockTransations.Sum(s => s.PurchaseReturnQty),
                    PurchaseReturnValue = StockTransations.Sum(s => s.PurchaseReturnValue),
                    SalesQty = StockTransations.Sum(s => s.SalesQty),
                    SalesValue = StockTransations.Sum(S => S.SalesValue),
                    SaleReturnQty = StockTransations.Sum(s => s.SaleReturnQty),
                    SaleReturnValue = StockTransations.Sum(s => s.SaleReturnValue),
                    ProvisionalQty = StockTransations.Sum(s => s.ProvisionalQty),
                    ProvisionalValue = StockTransations.Sum(s => s.ProvisionalValue),
                    WriteOffQty = StockTransations.Sum(s => s.WriteOffQty),
                    WriteOffValue = StockTransations.Sum(s => s.WriteOffValue),
                    StockManageInQty = StockTransations.Sum(s => s.StockManageInQty),
                    StockManageInValue = StockTransations.Sum(s => s.StockManageInValue),
                    StockManageOutQty = StockTransations.Sum(s => s.StockManageOutQty),
                    StockManageOutValue = StockTransations.Sum(s => s.StockManageOutValue),
                    TransferInQty = StockTransations.Sum(s => s.TransferInQty),
                    TransferInValue = StockTransations.Sum(s => s.TransferInValue),
                    TransferOutQty = StockTransations.Sum(s => s.TransferOutQty),
                    TransferOutValue = StockTransations.Sum(s => s.TransferOutValue),
                    ConsumptionQty = StockTransations.Sum(s => s.ConsumptionQty),
                    ConsumptionValue = StockTransations.Sum(s => s.ConsumptionValue),
                    ClosingQty = StockTransations.Sum(s => s.ClosingQty),
                    ClosingValue = StockTransations.Sum(s => s.ClosingValue),
                    ClosingQty_WithProvisional = StockTransations.Sum(s => s.ClosingQty_WithProvisional),
                    ClosingValue_WithProvisional = StockTransations.Sum(s => s.ClosingValue_WithProvisional)
                };

                responseData.Status = "OK";
                responseData.Results = new { StkSummary = StockTransations, GrandTotal = grandTotal };

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Grid Data Function PHRMItemTxnSummaryReport
        public IActionResult PHRMItemTxnSummaryReport(DateTime FromDate, DateTime ToDate, int ItemId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable StkSummaryReportResult = phrmreportingDbContext.PHRMItemTxnSummaryReport(FromDate, ToDate, ItemId);

                responseData.Status = "OK";
                responseData.Results = StkSummaryReportResult;

            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return Ok(responseData);
        }
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

            var totalStock = phrmdbcontext.StockTransactions.
                Where(a => a.ExpiryDate >= DateTime.Now).ToList().
                GroupBy(a => new { a.ItemId, a.BatchNo }).
                Select(g => new
                {
                    ItemId = g.Key.ItemId,
                    BatchNo = g.Key.BatchNo,
                    Quantity = g.Sum(q => q.InQty) - g.Sum(o => o.OutQty),
                    FreeQuantity = g.Sum(q => q.InQty),
                    MRP = g.FirstOrDefault().MRP,
                    Price = g.FirstOrDefault().CostPrice,

                }).Where(a => (a.Quantity > 0 || a.Quantity == 0) && (a.ItemId == itemId || itemId == 0)).
                GroupJoin(phrmdbcontext.PHRMItemMaster.Where(a => a.IsActive == true).ToList(), a => a.ItemId, b => b.ItemId,
                (a, b) => new
                {
                    ItemId = a.ItemId,
                    BatchNo = a.BatchNo,
                    ItemName = b.Select(s => s.ItemName).FirstOrDefault(),
                    AvailableQuantity = a.Quantity,
                    MRP = a.MRP.Value,
                    GRItemPrice = a.Price.Value,
                    GenericId = b.Select(s => s.GenericId.Value).FirstOrDefault(),
                    MinStockQuantity = b.Select(s => s.MinStockQuantity).FirstOrDefault(),
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
                        MinStockQuantity = s.GoodReceiptItemsViewModel.MinStockQuantity,
                        TotalAmount = (s.GoodReceiptItemsViewModel.GRItemPrice) * Convert.ToDecimal(s.GoodReceiptItemsViewModel.AvailableQuantity),

                    });

            DataTable result = DALFunctions.LINQResultToDataTable(totalStock);
            return result;
        }

        #endregion
        #region PHRM Item Wise Purchase Report
        public string PHRMItemWisePurchaseReport(DateTime FromDate, DateTime ToDate, int? itemid, string invoiceNo, int? grNo, int? supplierId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dtResult = phrmreportingDbContext.PHRMItemWisePurchaseReport(FromDate, ToDate, itemid, invoiceNo, grNo, supplierId);
                responseData.Status = "OK";
                responseData.Results = dtResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

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

        #region Show UserCollectionDailyReport Excel
        public FileContentResult ExportToExcelPHRMDailySales(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy, string SummaryData, string SummaryHeader)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? string.Empty : CreatedBy),};
                DataSet dataSet = DALFunctions.GetDatasetFromStoredProc("SP_PHRM_UserwiseCollectionReport", paramList, reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDailySales = new List<ColumnMetaData>();

                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ReceiptNo", ColDisplayName = "ReceiptNo" });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "TransactionType", ColDisplayName = "Type" });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "HospitalNo", ColDisplayName = "Hospital No", });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 20, ColName = "PatientName", ColDisplayName = "Patient Name", });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 21, ColName = "SubTotal", ColDisplayName = "SubTotal", Formula = ColumnFormulas.Sum });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 22, ColName = "DiscountAmount", ColDisplayName = "Discount", Formula = ColumnFormulas.Sum });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 23, ColName = "TotalAmount", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 24, ColName = "CreditAmount", ColDisplayName = "Credit Sales", Formula = ColumnFormulas.Sum });

                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 25, ColName = "DepositReceived", ColDisplayName = "Deposit Received", Formula = ColumnFormulas.Sum });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 26, ColName = "DepositRefund", ColDisplayName = "Deposit Refund", Formula = ColumnFormulas.Sum });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 27, ColName = "CreditReceived", ColDisplayName = "Collection from Receivables", Formula = ColumnFormulas.Sum });

                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 28, ColName = "CashCollection", ColDisplayName = "CashCollection", Formula = ColumnFormulas.Sum });

                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 29, ColName = "CreatedBy", ColDisplayName = "User" });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 30, ColName = "Remarks", ColDisplayName = "Remark" });

                var FinalColsForDailySalesInSorted = columnamesForDailySales.OrderBy(x => x.DisplaySeq).ToList();
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("CounterId");
                RemoveColName.Add("VATAmount");
                RemoveColName.Add("Date");
                RemoveColName.Add("EmployeeId");
                //RemoveColName.Add("CreditReceived");

                //passing the collection in exportExcelHelper 
                string reportHeader = "User Collection Report " + '(' + FromDate.ToString("MM/dd/yyyy") + '-' + ToDate.ToString("MM/dd/yyyy") + ')';
                //showSummary=false since we're externally adding the summary into the excel.
                export.LoadFromDataTable(FinalColsForDailySalesInSorted, dataSet.Tables[0], reportHeader, false, true, RemoveColName, SummaryData, SummaryHeader);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DailySales.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Rack Stock Distribution Report
        public string PHRMRackStockDistributionReport(string RackIds, int LocationId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                var db = new PharmacyReportingDbContext(connString);
                //this stored proc returns two tables: 1. RequisitionItemsInfo and 2. Dispatch info.
                DataSet QueryResult = DALFunctions.GetDatasetFromStoredProc("SP_PHRMReport_RackStockDistribution", new List<SqlParameter>()
                {
                    new SqlParameter("@rackIds", RackIds),
                    new SqlParameter("@locationId", LocationId)
                }, db);
                // return anynomous type and handle further in clilent side.. 
                responseData.Status = "OK";
                responseData.Results = new
                {
                    StockList = QueryResult.Tables[0],
                    TotalEvaluation = QueryResult.Tables[1]
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

        #region Export To Excel Function PHRMRackStockDistribution
        public FileContentResult ExportToExcelPHRMRackStockDistributionReport(string RackIds, int LocationId)
        {
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataSet spResult = DALFunctions.GetDatasetFromStoredProc("SP_PHRMReport_RackStockDistribution", new List<SqlParameter>()
                {
                    new SqlParameter("@rackIds", RackIds),
                    new SqlParameter("@locationId", LocationId)
                }, phrmreportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colForSuppStockSummaryReport = new List<ColumnMetaData>();
                var SummaryHeader = "Total Valuation For Rack(s) selected";
                var SummaryData = DanpheJSONConvert.SerializeObject(spResult.Tables[1].Rows[0].Table);
                SummaryData = SummaryData.Substring(5, SummaryData.Length - 8);
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(colForSuppStockSummaryReport, spResult.Tables[0], "Rack Stock Distribution Report", false, true, null, SummaryData, SummaryHeader);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "RackStockDistributionReport_.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion

        #region PHRM Date Wise Purchase Report
        public string PHRMDateWisePurchaseReport(DateTime FromDate, DateTime ToDate, int? supplierId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable dateWisePurchaseResults = phrmreportingDbContext.PHRMDateWisePurchaseReport(FromDate, ToDate, supplierId);
                responseData.Status = "OK";
                responseData.Results = dateWisePurchaseResults;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Return From Customer
        public string ReturnFromCustomerReport(DateTime fromDate, DateTime toDate, int? userId, int? dispensaryId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable returnFromCustomerResult = phrmreportingDbContext.ReturnFromCustomerReport(fromDate, toDate, userId, dispensaryId);
                responseData.Status = "OK";
                responseData.Results = returnFromCustomerResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Sales Statement Report
        public string SalesStatementReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable returnFromCustomerResult = phrmreportingDbContext.SalesStatementReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = returnFromCustomerResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Sales Summary Report
        public string SalesSummaryReport(DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable returnFromCustomerResult = phrmreportingDbContext.SalesSummaryReport(FromDate, ToDate);
                responseData.Status = "OK";
                responseData.Results = returnFromCustomerResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Settlement Summary Report
        public string SetlementSummaryReport(DateTime FromDate, DateTime ToDate, int? storeId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable settlementSummaryResult = phrmreportingDbContext.SettlementSummaryReport(FromDate, ToDate, storeId);
                responseData.Status = "OK";
                responseData.Results = settlementSummaryResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Patient Wise Settlement Summary Report


        public string PatientWiseSettlementSummaryReport(DateTime FromDate, DateTime ToDate, int PatientId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            try
            {
                List<SqlParameter> paramList = new List<SqlParameter>()
            {
                new SqlParameter("@FromDate",FromDate),
                new SqlParameter("@ToDate",ToDate),
                new SqlParameter("@PatientId", PatientId)
            };

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataSet SettlementViewDetail = DALFunctions.GetDatasetFromStoredProc("SP_PHRM_GetSettlementDetailReportOfSelectedPatient", paramList, reportingDbContext);
                DataTable dtPatientInfo = SettlementViewDetail.Tables[0];
                DataTable dtSettlement = SettlementViewDetail.Tables[1];
                DataTable dtReturnedSettlement = SettlementViewDetail.Tables[2];
                DataTable dtCashDiscount = SettlementViewDetail.Tables[3];
                var settlementData = new
                {
                    PatientInfo = Settlement_PatientInfoVM.MapDataTableToSingleObject(dtPatientInfo),
                    Settlements = dtSettlement,
                    ReturnedSettlement = dtReturnedSettlement,
                    CashDiscount = dtCashDiscount,

                };
                responseData.Status = "OK";
                responseData.Results = settlementData;
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


        #region Purchase Summary Report
        public string PurchaseSummaryReport(DateTime FromDate, DateTime ToDate, int? StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable returnFromCustomerResult = phrmreportingDbContext.PurchaseSummaryReport(FromDate, ToDate, StoreId);
                responseData.Status = "OK";
                responseData.Results = returnFromCustomerResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Insurance Patient Bima Report
        public string InsurancePatientBimaReport(DateTime FromDate, DateTime ToDate, int? CounterId, int? UserId, Int64? ClaimCode, string NSHINumber)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable returnFromCustomerResult = phrmreportingDbContext.InsurancePatientBimaReport(FromDate, ToDate, CounterId, UserId, ClaimCode, NSHINumber);
                responseData.Status = "OK";
                responseData.Results = returnFromCustomerResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Patient Sales Detail Report
        public string PatientSalesDetailReport(DateTime FromDate, DateTime ToDate, int? PatientId, int? CounterId, int? UserId, int? StoreId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable patientSalesDetailReport = phrmreportingDbContext.PatientSalesDetailReport(FromDate, ToDate, PatientId, CounterId, UserId, StoreId);
                responseData.Status = "OK";
                responseData.Results = patientSalesDetailReport;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Stock Summary Report II
        public string StockSummarySecondReport(DateTime TillDate)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable stockSummarySecondResult = phrmreportingDbContext.StockSummarySecondReport(TillDate);
                responseData.Status = "OK";
                responseData.Results = stockSummarySecondResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region STOCK Transfers Report
        public string PHRMStockTransfersReport(DateTime FromDate, DateTime ToDate, int? itemId, int? sourceStoreId, int? targetStoreId, bool notReceivedStocks)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable stockTransfersResult = phrmreportingDbContext.PHRMStockTransfersReport(FromDate, ToDate, itemId, sourceStoreId, targetStoreId, notReceivedStocks);
                responseData.Status = "OK";
                responseData.Results = stockTransfersResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Supplier Wise Stock Report
        public string PHRMSupplierWiseStockReport(DateTime FromDate, DateTime ToDate, int? itemId, int? storeId, int? supplierId)
        {
            DanpheHTTPResponse<DataTable> responseData = new DanpheHTTPResponse<DataTable>();
            try
            {
                PharmacyReportingDbContext phrmreportingDbContext = new PharmacyReportingDbContext(connString);
                DataTable supplierWiseStockResult = phrmreportingDbContext.PHRMSupplierWiseStockReport(FromDate, ToDate, itemId, storeId, supplierId);
                responseData.Status = "OK";
                responseData.Results = supplierWiseStockResult;
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);
        }
        #endregion

        #region Models, Dtos
        internal class PHRMDailySalesReportDto
        {
            public int InvoicePrintId { get; set; }
            public int? InvoiceId { get; set; }
            public string GenericName { get; set; }
            public string ItemName { get; set; }
            public string BatchNo { get; set; }
            public DateTime? ExpiryDate { get; set; }
            public double? Quantity { get; set; }
            public decimal? Price { get; set; }
            public decimal? MRP { get; set; }
            public double? StockValue { get; set; }
            public decimal? TotalAmount { get; set; }
            public DateTime? CreatedOn { get; set; }
            public string PatientName { get; set; }
            public string PaymentMode { get; set; }
            public string StoreName { get; set; }
            public string CounterName { get; set; }
            public string CreatedByName { get; set; }
        }
        #endregion
    }
}
