using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using DanpheEMR.Core.Configuration;
using DanpheEMR.Utilities;
using System.Data.SqlClient;
using Newtonsoft.Json;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers.ReportingNew
{
    public class ReportingNewController : Controller
    {
        private readonly string connString = null;
        public ReportingNewController(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;

        }
        //NBB- try this for test
        public FileContentResult ExportToExcelDoctorRevenue(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            try
            {
                ToDate = DateTime.Now;
                FromDate = (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue)) ? System.DateTime.Today : FromDate;
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                //get report result in datatabel                
                DataTable doctorrevenueReport = reportingDbContext.DoctorRevenue(FromDate, ToDate, ProviderName);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDoctorRevenue = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Doctor", ColDisplayName = "DoctorName", });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "USG", ColDisplayName = "USG", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "USGCOUNT", ColDisplayName = "USGNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ORTHOPROCEDURES", ColDisplayName = "ORTHO", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ORTHOPROCEDURESCOUNT", ColDisplayName = "ORTHONo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "CT", ColDisplayName = "CT", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "CTCOUNT", ColDisplayName = "CTNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "OPD", ColDisplayName = "OPD", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "OPDCOUNT", ColDisplayName = "OPDNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "GSURG", ColDisplayName = "GeneralSurgery", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "GSURGCOUNT", ColDisplayName = "GeneralSurgeryNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "GYNSURG", ColDisplayName = "GynoSurgery", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 13, ColName = "GYNSURGCOUNT", ColDisplayName = "GynoSurgeryNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 14, ColName = "ENT", ColDisplayName = "ENT", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 15, ColName = "ENTCOUNT", ColDisplayName = "ENTNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 16, ColName = "DENTAL", ColDisplayName = "DENTAL", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 17, ColName = "DENTALCOUNT", ColDisplayName = "DENTALNo", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 18, ColName = "OT", ColDisplayName = "OT", Formula = ColumnFormulas.Sum });
                columnamesForDoctorRevenue.Add(new ColumnMetaData() { DisplaySeq = 19, ColName = "OTCOUNT", ColDisplayName = "OTNo", Formula = ColumnFormulas.Sum });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDoctorRevenueInSorted = columnamesForDoctorRevenue.OrderBy(x => x.DisplaySeq).ToList();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForDoctorRevenueInSorted, doctorrevenueReport, "Doctor Revenue Report", false, true);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorRevenue.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDoctorReferral(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            try
            {



                ToDate = DateTime.Now;
                FromDate = (FromDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue) && ToDate < ((DateTime)System.Data.SqlTypes.SqlDateTime.MinValue)) ? System.DateTime.Today : FromDate;

                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable docReferralReport = reportingDbContext.DoctorReferral(FromDate, ToDate, ProviderName);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> colsForDoctorReferral = new List<ColumnMetaData>();
                colsForDoctorReferral.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "VisitDate", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                colsForDoctorReferral.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ProviderName", ColDisplayName = "DoctorName" });
                colsForDoctorReferral.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "TotalReferrals", ColDisplayName = "TotalReferrals", Formula = ColumnFormulas.Sum });
                colsForDoctorReferral.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "ReferralCount", ColDisplayName = "ReferralCount", Formula = ColumnFormulas.Sum });
                colsForDoctorReferral.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ReferralAmount", ColDisplayName = "ReferralAmount", Formula = ColumnFormulas.Sum });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDoctorRefInSorted = colsForDoctorReferral.OrderBy(x => x.DisplaySeq).ToList();

                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                //RemoveColName.Add("TotalReferrals");
                ///RemoveColName.Add("ReferralAmount");
                ////passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForDoctorRefInSorted, docReferralReport, "Doctor Referral Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorReferral.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelTotalItemsBill(DateTime FromDate, DateTime ToDate, string billingType, string ServiceDepartmentName, string ItemName, string SummaryData, string SummaryHeader)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable totalitembill = reportingDbContext.TotalItemsBill(FromDate, ToDate, billingType, ServiceDepartmentName, ItemName);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForTotalItemBill = new List<ColumnMetaData>();

                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "BillingDate", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "HospitalNumber", ColDisplayName = "Hospital Number", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientName", ColDisplayName = "Patient Name", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "InvoiceNumber", ColDisplayName = "ReceiptNo", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ServiceDepartmentName", ColDisplayName = "Department", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ItemName", ColDisplayName = "Item", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Price", ColDisplayName = "Price" });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "SubTotal", ColDisplayName = "SubTotal", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "DiscountAmount", ColDisplayName = "DiscountAmt", Formula = ColumnFormulas.Sum });
                //columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "Tax", ColDisplayName = "Tax", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "TotalAmount", ColDisplayName = "TotalAmt", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "ProviderName", ColDisplayName = "Doctor", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "BillStatus", ColDisplayName = "Status", });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForTotalItemInSorted = columnamesForTotalItemBill.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Total Item Report From: " + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForTotalItemInSorted, totalitembill, header, true, true, SummaryData: SummaryData, summaryHeader: SummaryHeader);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "TotalItemsBill.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , fileName);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelSalesDayBook(DateTime FromDate, DateTime ToDate, bool IsInsurance = false)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable salesdaybook = reportingDbContext.SalesDaybook(FromDate, ToDate, IsInsurance);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForSalesDayBook = new List<ColumnMetaData>();

                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "BillingDate", DisplaySeq = 0, ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "SubTotal", DisplaySeq = 1, ColDisplayName = "Sub Total", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "DiscountAmount", DisplaySeq = 2, ColDisplayName = "Discount Amt", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "TaxableAmount", DisplaySeq = 3, ColDisplayName = "Taxable Amt", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "TaxAmount", DisplaySeq = 4, ColDisplayName = "Tax Amt", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "TotalAmount", DisplaySeq = 5, ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "CashRet_TotalAmount", DisplaySeq = 6, ColDisplayName = "Return Amt", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "CrSales_TotalAmount", DisplaySeq = 7, ColDisplayName = "Credit Sales", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "CrReceived_TotalAmount", DisplaySeq = 8, ColDisplayName = "Credit Received", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "DepositReceived", DisplaySeq = 9, ColDisplayName = "Adv.Received", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "DepositReturn", DisplaySeq = 10, ColDisplayName = "Adv.Settlement", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "SettlDiscountAmount", DisplaySeq = 11, ColDisplayName = "Cash Discount", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "SettlDueAmount", DisplaySeq = 12, ColDisplayName = "Due", Formula = ColumnFormulas.Sum });
                columnamesForSalesDayBook.Add(new ColumnMetaData() { ColName = "CashCollection", DisplaySeq = 13, ColDisplayName = "Cash Collection", Formula = ColumnFormulas.Sum });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForSalesDayBookInSorted = columnamesForSalesDayBook.OrderBy(x => x.DisplaySeq).ToList();

                export.LoadFromDataTable(FinalColsForSalesDayBookInSorted, salesdaybook, "Sales Day Book Report", true, true);
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "SalesDayBook.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDoctorwiseIncomeSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate), new SqlParameter("@ProviderId", ProviderId) };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_DoctorWiseIncomeSummary_OPIP", paramList, reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForDrIncomeSummary = new List<ColumnMetaData>();

                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "DoctorName", DisplaySeq = 0, ColDisplayName = "Doctor Name" });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "OP_Collection", DisplaySeq = 1, ColDisplayName = "OP Collection", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "OP_Discount", DisplaySeq = 2, ColDisplayName = "OP Discount", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "OP_Refund", DisplaySeq = 3, ColDisplayName = "OP Refund", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "OP_NetTotal", DisplaySeq = 4, ColDisplayName = "OP NetTotal", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "IP_Collection", DisplaySeq = 5, ColDisplayName = "IP Collection", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "IP_Discount", DisplaySeq = 6, ColDisplayName = "IP Discount", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "IP_Refund", DisplaySeq = 7, ColDisplayName = "IP Refund", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "IP_NetTotal", DisplaySeq = 8, ColDisplayName = "IP NetTotal", Formula = ColumnFormulas.Sum });
                columnamesForDrIncomeSummary.Add(new ColumnMetaData() { ColName = "Grand_Total", DisplaySeq = 9, ColDisplayName = "Grand Total", Formula = ColumnFormulas.Sum });

                var FinalColsForDrIncomeSummaryInSorted = columnamesForDrIncomeSummary.OrderBy(x => x.DisplaySeq).ToList();
                string headerName = "Doctorwise Income Summary Report. From:" + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForDrIncomeSummaryInSorted, rData.Tables[0], headerName, true, true);
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorwiseIncomeSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDailyMISReport(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                //DataTable reportData = reportingDbContext.DailyMISReport(FromDate, ToDate);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
                DataTable reportData = DALFunctions.GetDataTableFromStoredProc("SP_Report_BILL_DailyMISReport", paramList, reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForDailyMISReport = new List<ColumnMetaData>();

                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "departmentName", DisplaySeq = 0, ColDisplayName = "Department" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "hospitalNo", DisplaySeq = 1, ColDisplayName = "Hospital No" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "patientName", DisplaySeq = 2, ColDisplayName = "Patient Name" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "BillingType", DisplaySeq = 3, ColDisplayName = "Billing Type" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "providerName", DisplaySeq = 4, ColDisplayName = "Doctor" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "itemName", DisplaySeq = 5, ColDisplayName = "Item Name" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "price", DisplaySeq = 6, ColDisplayName = "Price" });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "quantity", DisplaySeq = 7, ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "subTotal", DisplaySeq = 8, ColDisplayName = "Sub Total", Formula = ColumnFormulas.Sum });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "discount", DisplaySeq = 9, ColDisplayName = "Discount", Formula = ColumnFormulas.Sum });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "return", DisplaySeq = 10, ColDisplayName = "Return", Formula = ColumnFormulas.Sum });
                columnamesForDailyMISReport.Add(new ColumnMetaData() { ColName = "netTotal", DisplaySeq = 11, ColDisplayName = "Net Total", Formula = ColumnFormulas.Sum });

                var FinalColsForDailyMISInSorted = columnamesForDailyMISReport.OrderBy(x => x.DisplaySeq).ToList();
                string headerName = "Daily MIS Report. Date: " + FromDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForDailyMISInSorted, reportData, headerName, true, true, new List<string>() { "billStatus", "provisional" });
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DailyMISReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //Last revised by: sud-15Feb2019
        public FileContentResult ExportToExcelDailySales(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy, string SummaryData, string SummaryHeader, bool IsInsurance = false)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);

                List<SqlParameter> paramList = new List<SqlParameter>() {  new SqlParameter("@FromDate", FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@CounterId", CounterId),
                            new SqlParameter("@CreatedBy", CreatedBy == null ? string.Empty : CreatedBy),
                new SqlParameter("@IsInsurance", IsInsurance),};
                DataSet dataSet = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DailySales", paramList, reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDailySales = new List<ColumnMetaData>();

                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ReceiptNo", ColDisplayName = "ReceiptNo" });
                columnamesForDailySales.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "BillingType", ColDisplayName = "Type" });
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

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDailySalesInSorted = columnamesForDailySales.OrderBy(x => x.DisplaySeq).ToList();

                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("CounterId");
                RemoveColName.Add("TaxTotal");
                RemoveColName.Add("BillingDate");
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

        public FileContentResult ExportToExcelDiscountReport(DateTime FromDate, DateTime ToDate, string CounterId, string CreatedBy)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable discountreport = reportingDbContext.DiscountReport(FromDate, ToDate, CounterId, CreatedBy);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDiscountReport = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ReceiptNo", ColDisplayName = "ReceiptNo" });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "HospitalNo", ColDisplayName = "Hospital No", });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "Patient Name", });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "Price", ColDisplayName = "Price", Formula = ColumnFormulas.Sum });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "DiscountAmount", ColDisplayName = "DiscountAmount", Formula = ColumnFormulas.Sum });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Tax", ColDisplayName = "Tax", Formula = ColumnFormulas.Sum });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "TotalAmount", ColDisplayName = "TotalAmount", Formula = ColumnFormulas.Sum });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "CreatedBy", ColDisplayName = "Users" });
                columnamesForDiscountReport.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "CounterId", ColDisplayName = "Counter" });


                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDiscountReportInSorted = columnamesForDiscountReport.OrderBy(x => x.DisplaySeq).ToList();
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("CounterId");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForDiscountReportInSorted, discountreport, "Discount Report", true, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DiscountReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDepositBalance()
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable depositbalance = reportingDbContext.DepositBalanceReport();

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDepositBalance = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForDepositBalance.Add(new ColumnMetaData() { ColName = "SN", DisplaySeq = 0, ColDisplayName = "SR NO" });
                columnamesForDepositBalance.Add(new ColumnMetaData() { ColName = "PatientCode", DisplaySeq = 1, ColDisplayName = "Hospital Number", });
                columnamesForDepositBalance.Add(new ColumnMetaData() { ColName = "PatientName", DisplaySeq = 2, ColDisplayName = "Patient Name" });
                columnamesForDepositBalance.Add(new ColumnMetaData() { ColName = "DepositBalance", DisplaySeq = 3, ColDisplayName = "Deposit Amount", Formula = ColumnFormulas.Sum });
                //columnamesForDepositBalance.Add(new ColumnMetaData() { ColName = "Dates", DisplaySeq = 4, ColDisplayName = "Last Txn Date", Formula = ColumnFormulas.Date });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDepositBalanceInSorted = columnamesForDepositBalance.OrderBy(x => x.DisplaySeq).ToList();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForDepositBalanceInSorted, depositbalance, "Deposit Balance Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DepositBalance.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelCreditSummary(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable patientwiseCollection = reportingDbContext.BIL_PatientCreditSummary(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForCreditSummary = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "SN", DisplaySeq = 0, ColDisplayName = "SR NO" });
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "CreatedOn", DisplaySeq = 1, ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "PatientName", DisplaySeq = 2, ColDisplayName = "Patient Name" });
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "PatientCode", DisplaySeq = 3, ColDisplayName = "Hospital Number", });

                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "TotalAmount", DisplaySeq = 4, ColDisplayName = "Credit Amount", Formula = ColumnFormulas.Sum });
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "InvoiceNo", DisplaySeq = 5, ColDisplayName = "Invoice No" });
                columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "Remarks", DisplaySeq = 6, ColDisplayName = "Remarks" });
                //columnamesForCreditSummary.Add(new ColumnMetaData() { ColName = "LastTxnDate", DisplaySeq = 4, ColDisplayName = "Last Txn Date", Formula = ColumnFormulas.Date });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForCreditSummaryInSorted = columnamesForCreditSummary.OrderBy(x => x.DisplaySeq).ToList();
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("PatientId");


                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForCreditSummaryInSorted, patientwiseCollection, "Credit Summary Report", false, true, RemoveColName);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "CreditSummary.xlsx");


            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelReturnBills(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable billReturnData = reportingDbContext.BIL_ReturnReport(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForReturnBill = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "ReturnDate", Formula = ColumnFormulas.Date });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "RefInvoiceNo", ColDisplayName = "Receipt NO" });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientCode", ColDisplayName = "Hospital Number", });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "Patient Name" });
                //columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ServiceDepartmentName", ColDisplayName = "Department Name" });
                //columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ItemName", ColDisplayName = "Item Name" });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "CreditNoteNumber", ColDisplayName = "Credit Note Number", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "SubTotal", ColDisplayName = "Sub Total", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "DiscountAmount", ColDisplayName = "Disount Amount", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "TaxableAmount", ColDisplayName = "Taxable Amount", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "TaxTotal", ColDisplayName = "Tax Total", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "TotalAmount", ColDisplayName = "Return Amount", Formula = ColumnFormulas.Sum });
                columnamesForReturnBill.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "Remarks", ColDisplayName = "Return Remarks", });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForReturnBillInSorted = columnamesForReturnBill.OrderBy(x => x.DisplaySeq).ToList();
                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("User");
                RemoveColName.Add("BillingTransactionId");
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForReturnBillInSorted, billReturnData, "Return Bills Report", false, true, RemoveColName);
                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "ReturnBills.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelIncomeSegregation(DateTime FromDate, DateTime ToDate, string billingType)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable incomesegregation = reportingDbContext.Get_Bill_IncomeSegregationStaticReport(FromDate, ToDate, billingType);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForIncomeSegregation = new List<ColumnMetaData>();


                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ServDeptName", ColDisplayName = "Department", });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "CashSales", ColDisplayName = "Cash Sales", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "CashDiscount", ColDisplayName = "Cash Discount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "CreditSales", ColDisplayName = "Credit Sales", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "CreditDiscount", ColDisplayName = "Credit Discount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "GrossSales", ColDisplayName = "Gross Sales", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "TotalDiscount", ColDisplayName = "Total Discount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "ReturnCashSales", ColDisplayName = "Return CashSales", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "ReturnCashDiscount", ColDisplayName = "Return CashDiscount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "ReturnCreditSales", ColDisplayName = "Return Credit Sales", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "ReturnCreditDiscount", ColDisplayName = "Return CreditDiscount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "TotalSalesReturn", ColDisplayName = "Total Sales Return", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "TotalReturnDiscount", ColDisplayName = "Total Return Discount", Formula = ColumnFormulas.Sum });
                columnamesForIncomeSegregation.Add(new ColumnMetaData() { DisplaySeq = 13, ColName = "NetSales", ColDisplayName = "Net Sales", Formula = ColumnFormulas.Sum });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForIncomSegInSorted = columnamesForIncomeSegregation.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Income Segragation Report  From:" + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                List<string> RemoveColName = new List<string>();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForIncomSegInSorted, incomesegregation, header, true, true);


                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "IncomeSegragation.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelDocSummary(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
                DataSet excelData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "DoctorName", ColDisplayName = "Doctor" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Discount", ColDisplayName = "Discount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "Refund", ColDisplayName = "Refund", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "NetTotal", ColDisplayName = "Net Total", Formula = ColumnFormulas.Sum });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();


                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("DoctorId");

                string excelHeader = "Doctor Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, excelData.Tables[0], excelHeader, true, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelBilDeptSummary(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate)
                };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ServiceDepartment", ColDisplayName = "service Department" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "DiscountAmount", ColDisplayName = "Discount Amount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "TotalAmount", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ReturnAmount", ColDisplayName = "Return Amount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "NetSales", ColDisplayName = "Net Sales", Formula = ColumnFormulas.Sum });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();

                string excelHeader = "Department Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, rData.Tables[0], excelHeader, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DepartmentSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public FileContentResult ExportToExcelBilDocDeptItemSummary(DateTime FromDate, DateTime ToDate, int ProviderId, string SrvDeptName)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate),
                    new SqlParameter("@DoctorId", ProviderId),
                    new SqlParameter("@SrvDeptName", SrvDeptName)
                };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorDeptItemsSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Billing Date", Formula = ColumnFormulas.Date });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "DoctorName", ColDisplayName = "Doctor" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientCode", ColDisplayName = "Patient Code" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "Patient Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ServiceDepartmentName", ColDisplayName = "Service Department" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ItemName", ColDisplayName = "Item Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Price", ColDisplayName = "Price" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "DiscountAmount", ColDisplayName = "Discount Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "TotalAmount", ColDisplayName = "Total Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "ReturnAmount", ColDisplayName = "Return Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "NetAmount", ColDisplayName = "Net Amount", Formula = ColumnFormulas.Sum });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();

                string excelHeader = "Doctor Department Item Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, rData.Tables[0], excelHeader, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorDeptItemSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelRefSummary(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate) };
                DataSet excelData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_ReferralSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "ReferrerName", ColDisplayName = "Referred By" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Discount", ColDisplayName = "Discount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "Refund", ColDisplayName = "Refund", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "NetTotal", ColDisplayName = "Net Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "IsExtReferrer", ColDisplayName = "Is External" });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();


                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("ReferrerId");

                string excelHeader = "Referral Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, excelData.Tables[0], excelHeader, true, true, removeColNameList: RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "ReferralSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelBilRefItemSummary(DateTime FromDate, DateTime ToDate, int ProviderId, string SrvDeptName)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate),
                    new SqlParameter("@DoctorId", ProviderId),
                    new SqlParameter("@SrvDeptName", SrvDeptName)
                };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_ReferralItemsSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Billing Date", Formula = ColumnFormulas.Date });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "DoctorName", ColDisplayName = "Doctor" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientCode", ColDisplayName = "Patient Code" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "Patient Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ServiceDepartmentName", ColDisplayName = "Service Department" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ItemName", ColDisplayName = "Item Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Price", ColDisplayName = "Price" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "DiscountAmount", ColDisplayName = "Discount Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "TotalAmount", ColDisplayName = "Total Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "ReturnAmount", ColDisplayName = "Return Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "NetAmount", ColDisplayName = "Net Amount", Formula = ColumnFormulas.Sum });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();

                string excelHeader = "Referral Item Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, rData.Tables[0], excelHeader, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "ReferralItemSummaryReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public FileContentResult ExportToExcelBilDocDeptSummary(DateTime FromDate, DateTime ToDate, int ProviderId)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                new SqlParameter("@FromDate", FromDate),
                new SqlParameter("@ToDate", ToDate),
                new SqlParameter("@DoctorId", ProviderId)
                };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DoctorDeptSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "DoctorName", ColDisplayName = "Doctor" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ServiceDepartment", ColDisplayName = "Service Department" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "DiscountAmount", ColDisplayName = "Discount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "TotalAmount", ColDisplayName = "TotalAmount", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "ReturnAmount", ColDisplayName = "Return", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "NetSales", ColDisplayName = "Net Sales", Formula = ColumnFormulas.Sum });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();


                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("DoctorId");

                string excelHeader = "Doctor Department Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, rData.Tables[0], excelHeader, true, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorDepartmentSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelBilDeptItemSummary(DateTime FromDate, DateTime ToDate, string SrvDeptName)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate),
                    new SqlParameter("@SrvDeptName",SrvDeptName)
                };
                DataSet rData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BIL_DepartmentItemSummary", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForExcel = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Billing Date", Formula = ColumnFormulas.Date });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "DoctorName", ColDisplayName = "Doctor" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientCode", ColDisplayName = "Patient Code" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "Patient Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ServiceDepartmentName", ColDisplayName = "Service Department" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ItemName", ColDisplayName = "Item Name" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Price", ColDisplayName = "Price" });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "SubTotal", ColDisplayName = "Gross Total", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "DiscountAmount", ColDisplayName = "Discount Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "TotalAmount", ColDisplayName = "Total Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "ReturnAmount", ColDisplayName = "Return Amt", Formula = ColumnFormulas.Sum });
                columnamesForExcel.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "NetAmount", ColDisplayName = "Net Amount", Formula = ColumnFormulas.Sum });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForExcel = columnamesForExcel.OrderBy(x => x.DisplaySeq).ToList();


                string excelHeader = "Department Item Summary Report. From: " + FromDate.ToString("yyyy-MM-dd") + " To: " + ToDate.ToString("yyyy-MM-dd");

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForExcel, rData.Tables[0], excelHeader, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorDepartmentSummary.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public FileContentResult ExportToExcelCustomReport(DateTime FromDate, DateTime ToDate, string ReportName)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@FromDate", FromDate), new SqlParameter("@ToDate", ToDate), new SqlParameter("@ReportName", ReportName) };
                DataSet customReportData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_CustomReport", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForCustomReport = new List<ColumnMetaData>();
                columnamesForCustomReport.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Particulars", ColDisplayName = "Particulars" });
                columnamesForCustomReport.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "TotalNumber", ColDisplayName = "Counts", Formula = ColumnFormulas.Sum });
                columnamesForCustomReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "TotalIncome", ColDisplayName = "Amount", Formula = ColumnFormulas.Sum });

                var FinalColsForCustomReport = columnamesForCustomReport.OrderBy(x => x.DisplaySeq).ToList();
                string headerName = ReportName + " Report. From:" + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");

                export.LoadFromDataTable(FinalColsForCustomReport, customReportData.Tables[1], headerName, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "CustomReport.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelPatientCensus(DateTime FromDate, DateTime ToDate, int? ProviderId)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate),
                    new SqlParameter("@ProviderId", ProviderId)
                };
                DataSet patientCensusData = DALFunctions.GetDatasetFromStoredProc("SP_Report_BILL_PatientCensus", paramList, reportingDbContext);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForPatientCensus = new List<ColumnMetaData>();
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Provider", ColDisplayName = "Doctor" });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ServiceDepartmentName", ColDisplayName = "Service Department" });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "totC1", ColDisplayName = "No of Count", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "retC1", ColDisplayName = "No of Count(Returned)", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "totA1", ColDisplayName = "Amount", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "retA1", ColDisplayName = "Amount(returned)", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "totC2", ColDisplayName = "Unconfirmed Count", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "totA2", ColDisplayName = "Unconfirmed Amount", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "totC3", ColDisplayName = "Confirmed Count", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "retC3", ColDisplayName = "Confirmed Count(Returned)", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "totA3", ColDisplayName = "Confirmed Amount", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "retA3", ColDisplayName = "Confirmed Amount(Returned)", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "totTC", ColDisplayName = "Total Count", Formula = ColumnFormulas.Sum });
                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = 13, ColName = "totTA", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                //if (patientCensusData != null && patientCensusData.Tables.Count > 0)
                //{
                //    DataTable schemaTable = patientCensusData.Tables[0];
                //    if (schemaTable != null && schemaTable.Rows.Count > 0)
                //    {
                //        string colNamesCSV = schemaTable.Rows[0]["ColumnName"].ToString();
                //        List<string> colNameList = new List<string>();
                //        if (!string.IsNullOrEmpty(colNamesCSV))
                //        {
                //            colNameList = colNamesCSV.Split(',').ToList();
                //        }
                //        if (colNameList.Count > 0)
                //        {
                //            int i = 1;
                //            foreach (var colName in colNameList)
                //            {
                //                columnamesForPatientCensus.Add(new ColumnMetaData() { DisplaySeq = i, ColName = colName, ColDisplayName = colName, Formula = ColumnFormulas.Sum });
                //                i++;
                //            }
                //        }
                //    }
                //}
                var FinalColsForIncomSegInSorted = columnamesForPatientCensus.OrderBy(x => x.DisplaySeq).ToList();
                string headerName = "Patient Census Report. From:" + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");

                export.LoadFromDataTable(FinalColsForIncomSegInSorted, patientCensusData.Tables[0], headerName, true, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "PatientCensus.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDoctorReport(DateTime FromDate, DateTime ToDate, string ProviderName)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable doctorreport = reportingDbContext.DoctorReport(FromDate, ToDate, ProviderName);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDoctorReport = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Doctor", ColDisplayName = "DoctorName" });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "HospitalNo", ColDisplayName = "Hospital No" });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "PatientName", ColDisplayName = "PatientName" });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "Department", ColDisplayName = "Serv Dept Name", });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "Item", ColDisplayName = "ItemName" });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "Rate", ColDisplayName = "Price" });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Quantity", ColDisplayName = "Quantity", Formula = ColumnFormulas.Sum });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "SubTotal", ColDisplayName = "SubTotal", Formula = ColumnFormulas.Sum });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "Discount", ColDisplayName = "Discount Amount", Formula = ColumnFormulas.Sum });
                //columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "Tax", ColDisplayName = "Tax", Formula = ColumnFormulas.Sum });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "Total", ColDisplayName = "Total Amount", Formula = ColumnFormulas.Sum });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "ReturnAmount", ColDisplayName = "Return Amount", Formula = ColumnFormulas.Sum });
                //columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "ReturnTax", ColDisplayName = "Return Tax", Formula = ColumnFormulas.Sum });
                //columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "CancelTotal", ColDisplayName = "Cancel Amount", Formula = ColumnFormulas.Sum });
                //columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 12, ColName = "CancelTax", ColDisplayName = "Cancel Tax", Formula = ColumnFormulas.Sum });
                columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "NetAmount", ColDisplayName = "Net Amount", Formula = ColumnFormulas.Sum });
                ////columnamesForDoctorReport.Add(new ColumnMetaData() { DisplaySeq = 13, ColName = "BillingTransactionItemId", ColDisplayName = "BillingTransactionItemId" });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForDoctorReportInSorted = columnamesForDoctorReport.OrderBy(x => x.DisplaySeq).ToList();

                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                //RemoveColName.Add("BillingTransactionItemId");
                //RemoveColName.Add("Tax");
                //RemoveColName.Add("ReturnTax");
                //RemoveColName.Add("CancelTax");
                RemoveColName.Add("CancelTotal");
                //RemoveColName.Add("Date");

                string header = "Doctor Report    " + '(' + FromDate.ToString("MM/dd/yyyy") + '-' + ToDate.ToString("MM/dd/yyyy") + ')';
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForDoctorReportInSorted, doctorreport, header, true, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DoctorReport.xlsx");




            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelPackageSalesReport(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable packageSalesReport = reportingDbContext.PackageSalesDetail(FromDate, ToDate);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForPackageSales = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForPackageSales.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "BillingTransactionId", ColDisplayName = "BillingTransactionId" });
                columnamesForPackageSales.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "IssuedDate", ColDisplayName = "Issued Date", Formula = ColumnFormulas.Date });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForPackageSalesInSorted = columnamesForPackageSales.OrderBy(x => x.DisplaySeq).ToList();

                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("BillingTransactionId");

                string header = "Package Sales Report    " + '(' + FromDate.ToString("MM/dd/yyyy") + '-' + ToDate.ToString("MM/dd/yyyy") + ')';
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForPackageSalesInSorted, packageSalesReport, header, true, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "PackageSalesReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelCancelBills(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable billCancel = reportingDbContext.BIL_BillCancelSummary(FromDate, ToDate);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForCancelBills = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "HospitalNo", ColDisplayName = "Hospital Number", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "PatientName", ColDisplayName = "Patient Name" });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "ServiceDepartmentName", ColDisplayName = "ServiceDepartment Name", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ItemName", ColDisplayName = "Item Name", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "Quantity", ColDisplayName = "Quantity", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "TotalAmount", ColDisplayName = "Total Cancel Amount", Formula = ColumnFormulas.Sum });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "CreatedOn", ColDisplayName = "Bill Entry Date", Formula = ColumnFormulas.Date });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "CreatedBy", ColDisplayName = "Entered By", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "CancelledOn", ColDisplayName = "Cancelled Date", Formula = ColumnFormulas.Date });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 10, ColName = "CancelledBy", ColDisplayName = "Cancelled By", });
                columnamesForCancelBills.Add(new ColumnMetaData() { DisplaySeq = 11, ColName = "CancelRemarks", ColDisplayName = "Cancel Remark" });

                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForCancelBillInSorted = columnamesForCancelBills.OrderBy(x => x.DisplaySeq).ToList();

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(FinalColsForCancelBillInSorted, billCancel, "Cancel Bill Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "CancelBillsReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDailyAppointment(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentType)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable dailyappointment = reportingDbContext.DailyAppointmentReport(FromDate, ToDate, Doctor_Name, AppointmentType);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDailyAppointment = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Patient_Name", ColDisplayName = "Patient Name" });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "AppointmentType", ColDisplayName = "Appointment Type", });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "Doctor_Name", ColDisplayName = "Doctor Name" });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "VisitStatus", ColDisplayName = "Appointment Status" });

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(columnamesForDailyAppointment, dailyappointment, "Daily Appointment Report " + "(" + FromDate + "-" + ToDate + ')', false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DailyAppointmentReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelPhoneBookAppointment(DateTime FromDate, DateTime ToDate, string Doctor_Name, string AppointmentStatus)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable phonebookappointment = reportingDbContext.PhoneBookAppointmentReport(FromDate, ToDate, Doctor_Name, AppointmentStatus);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForPhoneBookAppointment = new List<ColumnMetaData>();
                // passing the name and the function we have to perform like sum,count etc 
                columnamesForPhoneBookAppointment.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Patient_Name", ColDisplayName = "Patient Name" });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "AppointmentType", ColDisplayName = "Appointment Type", });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "Doctor_Name", ColDisplayName = "Doctor Name" });
                //columnamesForDailyAppointment.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "VisitStatus", ColDisplayName = "Appointment Status" });

                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(columnamesForPhoneBookAppointment, phonebookappointment, "PhoneBook Appointment Report " + "(" + FromDate + "-" + ToDate + ')', false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "PhoneBookAppointmentReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // Diagnosis Wise Patient Report
        public FileContentResult ExportToExcelDiagnosisWisePatientReport(DateTime FromDate, DateTime ToDate, string Diagnosis)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable DiagnosisWisePatient = reportingDbContext.DiagnosisWisePatientReport(FromDate, ToDate, Diagnosis);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDailyDiagnosisWisePatient = new List<ColumnMetaData>();
                columnamesForDailyDiagnosisWisePatient.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "Date", ColDisplayName = "Date", Formula = ColumnFormulas.Date });
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(columnamesForDailyDiagnosisWisePatient, DiagnosisWisePatient, "DiagnosisWise Patient Report", false, true);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DiagnosisWisePatientReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public FileContentResult ExportToExcelDepartmentSales(DateTime FromDate, DateTime ToDate, bool IsInsurance)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable deptsalesdaybook = reportingDbContext.DepartmentSalesDaybook(FromDate, ToDate, IsInsurance);
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDepartmentSales = new List<ColumnMetaData>();

                // passing the name and the function we have to perform like sum,count etc 
                //columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "SN", ColDisplayName = "SR.No", });
                //columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "FromDate", ColDisplayName = "From Date", Formula = ColumnFormulas.Date });
                //columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ToDate", ColDisplayName = "To Date", Formula = ColumnFormulas.Date });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ServDeptName", ColDisplayName = "Department Name" });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Price", ColDisplayName = "Rate", Formula = ColumnFormulas.Sum });
                //columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "Tax", ColDisplayName = "Tax", Formula = ColumnFormulas.Sum });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "DiscountAmount", ColDisplayName = "DiscountAmt", Formula = ColumnFormulas.Sum });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "TotalAmount", ColDisplayName = "TotalAmt", Formula = ColumnFormulas.Sum });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "ReturnAmount", ColDisplayName = "Return Amt", Formula = ColumnFormulas.Sum });
                //columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "ReturnTax", ColDisplayName = "Return Tax", Formula = ColumnFormulas.Sum });
                columnamesForDepartmentSales.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "NetSales", ColDisplayName = "NetSales", Formula = ColumnFormulas.Sum });

                //If you want to remove some columns from datatable then run below function
                //first provide column name in list
                //column name must be same as dataTable column name
                //after removing columnName you cant create columnMetadata details for this column
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("FromDate");
                RemoveColName.Add("ToDate");
                RemoveColName.Add("CancelAmount");
                RemoveColName.Add("CancelTax");
                RemoveColName.Add("Tax");
                RemoveColName.Add("Quantity");
                RemoveColName.Add("ReturnTax");
                //passing the collection in exportExcelHelper 
                export.LoadFromDataTable(columnamesForDepartmentSales, deptsalesdaybook, "Department Sales Report" + '(' + FromDate.Date + '-' + ToDate.Date + ')', false, true, RemoveColName);

                //this used to export the package in excel...
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , "DepartmentSalesReport.xlsx");

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #region Export To Excel Function 
        public FileContentResult ExportToExcelTransferToAccount(DateTime FromDate, DateTime CurrentDate, string transactionData)
        {
            try
            {
                AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
                DataTable exportExcelstockItemsResult = (DataTable)JsonConvert.DeserializeObject(transactionData, (typeof(DataTable)));
                //DataTable exportExcelstockItemsResult = JsonStringToDataTable(transactionData);
                var voucherList = (from voucher in accountingDbContext.Vouchers select voucher).ToList();
                exportExcelstockItemsResult.Columns.Add("VoucherName", typeof(string));
                foreach (DataRow row in exportExcelstockItemsResult.Rows)
                {
                    row["VoucherName"] = voucherList.Find(v => v.VoucherId == Convert.ToInt32(row["VoucherId"])).VoucherName;
                }
                var dataFinal = exportExcelstockItemsResult;
                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                DataView view = new DataView(exportExcelstockItemsResult);
                DataTable selected = view.ToTable("Selected", false, "TransactionDate", "VoucherName", "IncomeLedgerName", "TaxAmount", "DiscountAmount", "SalesAmount", "TotalAmount", "TransactionType", "Remarks");

                List<ColumnMetaData> columnamesForTotalItemBill = new List<ColumnMetaData>();

                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "TransactionDate", ColDisplayName = "Txn Date", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "VoucherName", ColDisplayName = "Select Voucher", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "IncomeLedgerName", ColDisplayName = "Dept Name", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 3, ColName = "TaxAmount", ColDisplayName = "Tax Amt", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "DiscountAmount", ColDisplayName = "Discount Amt", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "SalesAmount", ColDisplayName = "Total Amt", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "TotalAmount", ColDisplayName = "Deposit Amt", Formula = ColumnFormulas.Sum });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "TransactionType", ColDisplayName = "Txn Type(Pay Mode)", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "Remarks", ColDisplayName = "Remarks", });

                var FinalColsForTotalItemInSorted = columnamesForTotalItemBill.OrderBy(x => x.DisplaySeq).ToList();
                //export.LoadFromDataTable(FinalColsForTotalItemInSorted, exportExcelstockItemsResult, header, true, true, SummaryData: "ABC", summaryHeader: "A");
                export.LoadFromDataTable(FinalColsForTotalItemInSorted, selected, "Transport To Account", true, true);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "TransferToAccount.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        public FileContentResult ExportToExcelCategoryWiseLabReport(DateTime FromDate, DateTime ToDate, String orderStatus)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable CategoryWiseLabReport = reportingDbContext.CategoryWiseLabReport(FromDate, ToDate ,orderStatus);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForCategoryWiseLabReport = new List<ColumnMetaData>();


                columnamesForCategoryWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "SN", ColDisplayName = "S.N.", });
                columnamesForCategoryWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Category", ColDisplayName = "Category" });
                columnamesForCategoryWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Count", ColDisplayName = "Count" });
                List<string> RemoveColName = new List<string>();


                var FinalColsForLabCategoryTests = columnamesForCategoryWiseLabReport.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Category Wise Lab Report From: " + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForLabCategoryTests, CategoryWiseLabReport, header, false, true, RemoveColName);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "CategoryWiseLabTest.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , fileName);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelDoctorWisePatientCountLabReport(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable DoctorWiseLabReport = reportingDbContext.DoctorWisePatientCountLabReport(FromDate, ToDate);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");

                //creating list for adding the column 
                List<ColumnMetaData> columnamesForDoctorWiseLabReport = new List<ColumnMetaData>();


                columnamesForDoctorWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "SN", ColDisplayName = "S.N.", });
                columnamesForDoctorWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "Doctor", ColDisplayName = "Doctor" });
                columnamesForDoctorWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "OP", ColDisplayName = "OP" });
                columnamesForDoctorWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "IP", ColDisplayName = "IP" });
                columnamesForDoctorWiseLabReport.Add(new ColumnMetaData() { DisplaySeq = 2, ColName = "Emergency", ColDisplayName = "ER" });
                List<string> RemoveColName = new List<string>();


                var FinalColsForDoctorWiseLabTests = columnamesForDoctorWiseLabReport.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Doctor Wise Patient Count Lab Report From: " + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForDoctorWiseLabTests, DoctorWiseLabReport, header, false, true, RemoveColName);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "DoctorWiseLabTest.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , fileName);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcel_INCTV_AllEmpItemsSettings()
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                DataTable reportData = DALFunctions.GetDataTableFromStoredProc("SP_Inctv_ExportAllEmpItemsSettings", reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Employee Items Settings");
                List<ColumnMetaData> columnamesForEmpItemsSettings = new List<ColumnMetaData>();

                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "EmployeeName", DisplaySeq = 0, ColDisplayName = "Employee Name" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "TDSPercent", DisplaySeq = 1, ColDisplayName = "TDS Percent" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "ServiceDepartmentName", DisplaySeq = 2, ColDisplayName = "Service Department Name" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "ItemName", DisplaySeq = 3, ColDisplayName = "ItemName" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "AssignedToPercent", DisplaySeq = 4, ColDisplayName = "AssignedToPercent" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "ReferredByPercent", DisplaySeq = 5, ColDisplayName = "ReferredByPercent" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "HasGroupDistribution", DisplaySeq = 6, ColDisplayName = "GroupDistribution?" });
                columnamesForEmpItemsSettings.Add(new ColumnMetaData() { ColName = "DistributionInfo", DisplaySeq = 7, ColDisplayName = "Group Distribution Detail" });

                var FinalColsForEmpItemsSettingSorted = columnamesForEmpItemsSettings.OrderBy(x => x.DisplaySeq).ToList();
                List<string> RemoveColName = new List<string>();
                RemoveColName.Add("EmployeeId");
                RemoveColName.Add("ServiceDepartmentId");
                RemoveColName.Add("ItemId");

                export.LoadFromDataTable(FinalColsForEmpItemsSettingSorted, reportData, "Employee Items Incentive Settings", false, true, RemoveColName);
                byte[] filecontent = export.package.GetAsByteArray();
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "INCTV_AllEmpItemsSettings.xlsx");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public FileContentResult ExportToExcelSubstoreDispConSummaryReport(DateTime FromDate, DateTime ToDate, string StoreIds, string SummaryData, string SummaryHeader)
        {
            try
            {
                ReportingDbContext reportingDbContext = new ReportingDbContext(connString);
                List<SqlParameter> paramList = new List<SqlParameter>() {
                           new SqlParameter("@StoreIds", StoreIds),
                           new SqlParameter("@FromDate", FromDate),
                           new SqlParameter("@ToDate", ToDate)

                };

                DataTable allData = DALFunctions.GetDataTableFromStoredProc("SP_INV_RPT_GetSubstoreDispConsumption_Summary", paramList, reportingDbContext);

                ExcelExportHelper export = new ExcelExportHelper("Sheet1");
                List<ColumnMetaData> columnamesForTotalItemBill = new List<ColumnMetaData>();

                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 0, ColName = "SubCategoryName", ColDisplayName = "Sub Category Name" });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 1, ColName = "ItemName", ColDisplayName = "ItemName", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 4, ColName = "ItemType", ColDisplayName = "ItemType", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 5, ColName = "Unit", ColDisplayName = "Unit", });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 6, ColName = "DispatchQuantity", ColDisplayName = "DispatchQuantity" });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 7, ColName = "DispatchValue", ColDisplayName = "DispatchValue" });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 8, ColName = "ConsumptionQuantity", ColDisplayName = "ConsumptionQuantity" });
                columnamesForTotalItemBill.Add(new ColumnMetaData() { DisplaySeq = 9, ColName = "ConsumptionValue", ColDisplayName = "Consumption Value" });
                ////Sorted ColMetadata in DisplaySequenceOrder 
                //////Its Required Because in LoadFromDataTable Function we Require ColMetadata in Sorted Form 
                var FinalColsForTotalItemInSorted = columnamesForTotalItemBill.OrderBy(x => x.DisplaySeq).ToList();
                string header = "Substore Dispatch and Consumption Report " + FromDate.ToString("yyyy-MM-dd") + " To:" + ToDate.ToString("yyyy-MM-dd");
                export.LoadFromDataTable(FinalColsForTotalItemInSorted, allData, header, true, true, SummaryData: SummaryData, summaryHeader: SummaryHeader);
                byte[] filecontent = export.package.GetAsByteArray();

                //check if filename could be set from server side, use above format if it can be set..
                string fileName = "SubstoreDispatchandConsumption.xlsx";
                return File(filecontent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                     , fileName);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}





