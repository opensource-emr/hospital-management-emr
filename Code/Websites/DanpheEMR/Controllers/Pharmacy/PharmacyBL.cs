using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;//for entity-update.
using System.Data.Entity;
using DanpheEMR.ServerModel.PharmacyModels;
using System.Configuration;
using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using DanpheEMR.Utilities;
using System.Threading.Tasks;
using DanpheEMR.Core;
using System.Data.Entity.Migrations.Model;
using DanpheEMR.Core.Parameters;
using ParameterModel = DanpheEMR.Core.Parameters.ParameterModel;
using DanpheEMR.Enums;
using DanpheEMR.Services;
using System.Data.SqlClient;
using System.Data;
using System.Transactions;

namespace DanpheEMR.Controllers
{
    public class PharmacyBL
    {
        /// <summary>
        /// This Function is complete Transaction During Goods Receipt Generation
        /// 1. Add GR and GoodsReceiptItems        2. Update PO Quantity and PO Status
        /// 3. Add GRItems Txn to StockTransactionItems 
        /// 4. Add and Update Available Quantity of Item in Stock Table
        /// </summary>
        /// 
        public static PharmacyFiscalYear GetFiscalYear(string connString)
        {
            PharmacyDbContext phrmdbcontext = new PharmacyDbContext(connString);
            return GetFiscalYear(phrmdbcontext);
        }
        public static Boolean GoodReceiptTransaction(PHRMGoodsReceiptViewModel grViewModelData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    bool isGRCreatedFromPO = false;
                    isGRCreatedFromPO = (grViewModelData.purchaseOrder.PurchaseOrderId > 0) ? true : false;
                    if (isGRCreatedFromPO == true)
                    {
                        grViewModelData.goodReceipt.PurchaseOrderId = grViewModelData.purchaseOrder.PurchaseOrderId;
                        UpdatePOandPOItemsStatus(phrmdbcontext, grViewModelData);
                    }
                    else
                    {
                        grViewModelData.goodReceipt.PurchaseOrderId = null;
                    }

                    // Add goodsReceipt, so that we can save the goods receiptId
                    var goodsReceiptData = grViewModelData.goodReceipt;
                    var goodsReceiptItemData = grViewModelData.goodReceipt.GoodReceiptItem;
                    var mainStoreCategory = ENUM_StoreCategory.Store;
                    int StoreId = phrmdbcontext.PHRMStore.Where(s => s.Name == "Main Store" && s.Category == mainStoreCategory).Select(a => a.StoreId).FirstOrDefault();
                    goodsReceiptData.GoodReceiptItem = new List<PHRMGoodsReceiptItemsModel>();
                    goodsReceiptData.CreatedOn = currentDate;
                    var dispercentage = (decimal)0;
                    var vatpercentage = (decimal)0;
                    if (grViewModelData.goodReceipt.SubTotal > 0)
                    {
                        dispercentage = (decimal)(grViewModelData.goodReceipt.DiscountAmount * 100 / grViewModelData.goodReceipt.SubTotal);
                        vatpercentage = (decimal)(grViewModelData.goodReceipt.VATAmount * 100 / (grViewModelData.goodReceipt.SubTotal - grViewModelData.goodReceipt.DiscountAmount));
                    }
                    phrmdbcontext.PHRMGoodsReceipt.Add(goodsReceiptData);
                    phrmdbcontext.SaveChanges();

                    // Add gr items along with stock
                    goodsReceiptItemData.ForEach(gri =>
                    {
                        // TODO: Make StoreId Dynamic later, also add SubCategory
                        var mainStoreId = phrmdbcontext.PHRMStore.Where(a => a.Category == "store" && a.SubCategory == "pharmacy").Select(a => a.StoreId).FirstOrDefault();

                        // Add to stock master
                        var newStockMaster = new PHRMStockMaster(
                            itemId: gri.ItemId,
                            batchNo: gri.BatchNo,
                            expiryDate: gri.ExpiryDate,
                            costPrice: gri.GRItemPrice,
                            mRP: gri.MRP,
                            createdBy: currentUser.EmployeeId,
                            createdOn: currentDate);

                        // add the new barcode id
                        var barcodeService = new PharmacyStockBarcodeService(phrmdbcontext);
                        newStockMaster.UpdateBarcodeId(barcodeService.AddStockBarcode(
                           stock: newStockMaster,
                           createdBy: currentUser.EmployeeId
                            ));

                        phrmdbcontext.StockMasters.Add(newStockMaster);
                        phrmdbcontext.SaveChanges();

                        // Add stock first
                        var newStoreStock = new PHRMStoreStockModel(newStockMaster, mainStoreId, (gri.ReceivedQuantity + gri.FreeQuantity));
                        phrmdbcontext.StoreStocks.Add(newStoreStock);
                        phrmdbcontext.SaveChanges();

                        // Add GoodsReceiptItem
                        gri.GoodReceiptId = goodsReceiptData.GoodReceiptId;
                        gri.StockId = newStoreStock.StockId;
                        gri.StoreStockId = newStoreStock.StoreStockId.Value;
                        gri.CreatedBy = currentUser.EmployeeId;
                        gri.CreatedOn = currentDate;
                        gri.AvailableQuantity = gri.ReceivedQuantity + gri.FreeQuantity;
                        //below fields are used for accounting do not remove
                        if (gri.AvailableQuantity != 0)
                        {
                            gri.GrPerItemVATAmt = gri.VATAmount;
                            //(gri.SubTotal - (gri.SubTotal * dispercentage / 100)) / 100 * vatpercentage / (decimal)gri.ReceivedQuantity;
                            //gri.GrPerItemDisAmt = gri.SubTotal * Convert.ToDecimal(gri.DiscountPercentage) / 100 / (decimal)gri.ReceivedQuantity;            //cal per item discount     
                            gri.GrPerItemDisAmt = gri.DiscountAmount;
                        }
                        phrmdbcontext.PHRMGoodsReceiptItems.Add(gri);
                        phrmdbcontext.SaveChanges();

                        // Add stock txns
                        var newMainStockTxns = new PHRMStockTransactionModel(newStoreStock, ENUM_PHRM_StockTransactionType.PurchaseItem, goodsReceiptData.GoodReceiptDate, gri.GoodReceiptItemId, currentUser.EmployeeId, currentDate, goodsReceiptData.FiscalYearId);
                        newMainStockTxns.SetInOutQuantity(newStoreStock.AvailableQuantity, 0);
                        phrmdbcontext.StockTransactions.Add(newMainStockTxns);
                        phrmdbcontext.SaveChanges();

                        //Add StockHistoryMRP
                        var newStockHistoryMRP = new PHRMMRPHistoryModel()
                        {
                            StockId = newStockMaster.StockId ?? 0,
                            StartDate = currentDate,
                            MRP = newStockMaster.MRP,
                            CreatedBy = currentUser.EmployeeId,
                        };
                        phrmdbcontext.MRPHistories.Add(newStockHistoryMRP);
                        phrmdbcontext.SaveChanges();

                        //Add StockHistoryBatchAndExpiryDate
                        var newStockHistoryBatchAndExpiry = new PHRMExpiryDateBatchNoHistoryModel()
                        {
                            StockId = newStockMaster.StockId ?? 0,
                            StartDate = currentDate,
                            BatchNo = newStockMaster.BatchNo,
                            ExpiryDate = newStockMaster.ExpiryDate,
                            CreatedBy = currentUser.EmployeeId,
                        };
                        phrmdbcontext.ExpiryDateBatchNoHistories.Add(newStockHistoryBatchAndExpiry);
                        phrmdbcontext.SaveChanges();
                    });
                    //supplier ledger txn part;
                    var supplier = phrmdbcontext.PHRMSupplier.Find(goodsReceiptData.SupplierId);
                    bool isLedgerApplicable = supplier.IsLedgerRequired;
                    if (isLedgerApplicable == true)
                    {
                        //check the payment mode ie cash and credit mode;
                        //if mode is credit, update CreditAmount equals TotalGRAmount and DebitAmount equals 0:Also,BalanceAmount = CreditAmount- DebitAmount ie BalAnceAmount equals TotalGRAmount resp;
                        //if mode is cash, update CreditAmount and DebitAmount equals to TotalGRAmount and BalanceAmount is 0 since balanceAmt equals Credit - Debit;
                        if (goodsReceiptData.TransactionType == "Credit")
                        {
                            //find the supplierLedger to update amount;
                            var supplierLedger = phrmdbcontext.SupplierLedger.Where(s => s.SupplierId == goodsReceiptData.SupplierId).FirstOrDefault();
                            //update cr,db, and balance amount of that supplier in PHRMSupplierLedger table;
                            supplierLedger.CreditAmount += goodsReceiptData.TotalAmount;
                            supplierLedger.DebitAmount += 0;
                            supplierLedger.BalanceAmount += goodsReceiptData.TotalAmount;
                            phrmdbcontext.SaveChanges();

                            //Add Supplier Ledger txn;
                            var newSupplierLedgerTxn = new PHRMSupplierLedgerTransactionModel()
                            {
                                FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId,
                                LedgerId = supplierLedger.LedgerId,
                                SupplierId = supplierLedger.SupplierId,
                                CreditAmount = goodsReceiptData.TotalAmount,
                                DebitAmount = 0,
                                ReferenceNo = goodsReceiptData.GoodReceiptId,
                                TransactionType = ENUM_SupplierLedgerTransaction.GoodsReceipt,
                                Remarks = null,
                                IsActive = true,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now

                            };
                            phrmdbcontext.SupplierLedgerTransactions.Add(newSupplierLedgerTxn);
                            phrmdbcontext.SaveChanges();
                        }
                        else
                        {
                            //find the supplierLedger to update amount;
                            var supplierLedger = phrmdbcontext.SupplierLedger.Where(s => s.SupplierId == goodsReceiptData.SupplierId).FirstOrDefault();
                            //update cr,db, and balance amount of that supplier in PHRMSupplierLedger table;
                            supplierLedger.CreditAmount += goodsReceiptData.TotalAmount;
                            supplierLedger.DebitAmount += goodsReceiptData.TotalAmount;
                            supplierLedger.BalanceAmount += 0;
                            phrmdbcontext.SaveChanges();
                            //Add Supplier Ledger txn for adding CreditAmount;
                            var newSupplierLedgerTxnForCreditAmount = new PHRMSupplierLedgerTransactionModel()
                            {
                                FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId,
                                LedgerId = supplierLedger.LedgerId,
                                SupplierId = supplierLedger.SupplierId,
                                CreditAmount = goodsReceiptData.TotalAmount,
                                DebitAmount = 0,
                                ReferenceNo = goodsReceiptData.GoodReceiptId,
                                TransactionType = ENUM_SupplierLedgerTransaction.GoodsReceipt,
                                Remarks = null,
                                IsActive = true,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now

                            };
                            phrmdbcontext.SupplierLedgerTransactions.Add(newSupplierLedgerTxnForCreditAmount);
                            phrmdbcontext.SaveChanges();
                            //Add Supplier Ledger txn for adding DebitAmount;
                            var newSupplierLedgerTxnForDebitAmount = new PHRMSupplierLedgerTransactionModel()
                            {
                                FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId,
                                LedgerId = supplierLedger.LedgerId,
                                SupplierId = supplierLedger.SupplierId,
                                CreditAmount = 0,
                                DebitAmount = goodsReceiptData.TotalAmount,
                                ReferenceNo = goodsReceiptData.GoodReceiptId,
                                TransactionType = ENUM_SupplierLedgerTransaction.GoodsReceipt,
                                Remarks = null,
                                IsActive = true,
                                CreatedBy = currentUser.EmployeeId,
                                CreatedOn = DateTime.Now

                            };
                            phrmdbcontext.SupplierLedgerTransactions.Add(newSupplierLedgerTxnForDebitAmount);
                            phrmdbcontext.SaveChanges();

                        }
                    }


                    dbContextTransaction.Commit();//Commit Transaction
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public static PharmacyFiscalYear GetFiscalYear(PharmacyDbContext phrmdbcontext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return phrmdbcontext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault();
        }

        public static DataTable SearchPatient(string SearchText, bool IsInsurance, PharmacyDbContext phrmDBContext)
        {
            //var allPats = (from pat in phrmDBContext.PHRMPatient
            //               join visit in phrmDBContext.PHRMPatientVisit on pat.PatientId equals visit.PatientId into VisitGrouped
            //               join country in phrmDBContext.CountrySubDivision on pat.CountrySubDivisionId equals country.CountrySubDivisionId
            //               where pat.IsActive == true
            //               && (IsInsurance == false || (IsInsurance == true && pat.Ins_HasInsurance == true))
            //               && ((pat.ShortName + pat.PhoneNumber ?? "" + " " + pat.PatientCode + pat.Ins_NshiNumber ?? "").Contains(SearchText))
            //               let visitLJ = VisitGrouped.DefaultIfEmpty().OrderByDescending(a => a.VisitDate).FirstOrDefault()
            //               select new SearchPatientDTO
            //               {
            //                   PatientId = pat.PatientId,
            //                   PatientCode = pat.PatientCode,
            //                   ShortName = pat.ShortName,
            //                   FirstName = pat.FirstName,
            //                   LastName = pat.LastName,
            //                   MiddleName = pat.MiddleName,
            //                   Age = pat.Age,
            //                   Gender = pat.Gender,
            //                   PhoneNumber = pat.PhoneNumber,
            //                   DateOfBirth = pat.DateOfBirth,
            //                   Address = pat.Address,
            //                   IsOutdoorPat = pat.IsOutdoorPat,
            //                   CreatedOn = pat.CreatedOn,
            //                   CountryId = pat.CountryId,
            //                   CountrySubDivisionId = pat.CountrySubDivisionId,
            //                   CountrySubDivisionName = country.CountrySubDivisionName,
            //                   PANNumber = pat.PANNumber,
            //                   ClaimCode = pat.Ins_LatestClaimCode,
            //                   Ins_HasInsurance = pat.Ins_HasInsurance,
            //                   Ins_InsuranceBalance = pat.Ins_InsuranceBalance,
            //                   Ins_NshiNumber = pat.Ins_NshiNumber,
            //                   VisitDate = (visitLJ != null) ? visitLJ.VisitDate.ToString() : "",
            //                   ProviderId = (visitLJ != null) ? visitLJ.ProviderId : null,
            //               }).OrderByDescending(p => p.PatientId).AsQueryable();


            //if (CommonFunctions.GetCoreParameterBoolValue(coreDbContext, "Common", "ServerSideSearchComponent", "PatientSearchPatient") == true && SearchText == "")
            //{
            //    allPats = allPats.Take(CommonFunctions.GetCoreParameterIntValue(coreDbContext, "Common", "ServerSideSearchListLength"));
            //}
            //var finalResults = allPats.ToList();

            //sud:sanjit:9-Oct'21: Moving Search logic to StoredProc..
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@SearchTxt", SearchText),
                new SqlParameter("@IsInsurance", IsInsurance) };

            DataTable dtPhrmPatients = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GetPatientList", paramList, phrmDBContext);

            return dtPhrmPatients;

            //List<dynamic> finalResults = phrmDBContext.Database.SqlQuery<dynamic>("SP_PHRM_GetPatientList", paramList).ToList();
            //return finalResults;
        }

        public static PharmacyFiscalYear GetFiscalYearGoodsReceipt(PharmacyDbContext phrmdbcontext, DateTime? DecidingDate = null)
        {
            DecidingDate = (DecidingDate == null) ? DateTime.Now.Date : DecidingDate;
            return phrmdbcontext.PharmacyFiscalYears.Where(fsc => fsc.StartDate <= DecidingDate && fsc.EndDate >= DecidingDate).FirstOrDefault();
        }


        public static int GetInvoiceNumber(PharmacyDbContext phrmdbcontext)
        {
            int fiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

            int invoiceNumber = (from txn in phrmdbcontext.PHRMInvoiceTransaction
                                 where txn.FiscalYearId == fiscalYearId
                                 select txn.InvoicePrintId).DefaultIfEmpty(0).Max();
            return invoiceNumber + 1;
        }
        public static int RegisterPatient(PHRMPatient patient, PharmacyDbContext db, PatientDbContext patientDb, CoreDbContext coreDb)
        {
            try
            {
                patient.CreatedOn = DateTime.Now;
                patient.PatientNo = GetLatestPatientNo(patientDb);
                patient.PatientCode = GetPatientCode((int)patient.PatientNo, patientDb, coreDb);
                patient.ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName;
                //Initially add MemberShip as General
                var membership = patientDb.MembershipTypes.Where(i => i.MembershipTypeName == "General").FirstOrDefault();
                patient.MembershipTypeId = membership.MembershipTypeId;
                db.PHRMPatient.Add(patient);
                db.SaveChanges();
                return patient.PatientId;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public static int GetLatestPatientNo(PatientDbContext patientDbContext)
        {
            try
            {
                int newPatNo = 0;
                var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                newPatNo = maxPatNo.Value + 1;
                return newPatNo;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public static string GetPatientCode(int patientNo, PatientDbContext patientDbContext, CoreDbContext coreDbContext)
        {
            try
            {
                NewPatientUniqueNumbersVM retValue = new NewPatientUniqueNumbersVM();
                int newPatNo = patientNo;
                string newPatCode = "";


                string patCodeFormat = "YYMM-PatNum";//this is default value.
                string hospitalCode = "";//default empty

                List<ParameterModel> allParams = coreDbContext.Parameters.ToList();


                ParameterModel patCodeFormatParam = allParams
                   .Where(a => a.ParameterGroupName == "Patient" && a.ParameterName == "PatientCodeFormat")
                   .FirstOrDefault<ParameterModel>();
                if (patCodeFormatParam != null)
                {
                    patCodeFormat = patCodeFormatParam.ParameterValue;
                }


                ParameterModel hospCodeParam = allParams
                    .Where(a => a.ParameterName == "HospitalCode")
                    .FirstOrDefault<ParameterModel>();
                if (hospCodeParam != null)
                {
                    hospitalCode = hospCodeParam.ParameterValue;
                }



                if (patCodeFormat == "YYMM-PatNum")
                {
                    newPatCode = DateTime.Now.ToString("yy") + DateTime.Now.ToString("MM") + String.Format("{0:D6}", newPatNo);
                }
                else if (patCodeFormat == "HospCode-PatNum")
                {
                    newPatCode = hospitalCode + newPatNo;
                }
                else if (patCodeFormat == "PatNum")
                {
                    newPatCode = newPatNo.ToString();
                }

                return newPatCode;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public static int GetGoodReceiptPrintNo(PharmacyDbContext phrmdbcontext, int fiscalYearId)
        {
            var goodreceiptprintnumber = (from goodrecp in phrmdbcontext.PHRMGoodsReceipt
                                          where goodrecp.FiscalYearId == fiscalYearId
                                          select goodrecp.GoodReceiptPrintId).DefaultIfEmpty(0).Max() ?? 0;
            return goodreceiptprintnumber + 1;
        }
        public static int GetPurchaseOrderNo(PharmacyDbContext phrmdbcontext, int fiscalYearId)
        {
            var purchseOrderno = (from po in phrmdbcontext.PHRMPurchaseOrder
                                  where po.FiscalYearId == fiscalYearId
                                  select po.PurchaseOrderNo).DefaultIfEmpty(0).Max() ?? 0;
            return purchseOrderno + 1;
        }

        public static string GetFiscalYearFormattedName(PharmacyDbContext phrmdbcontext, int? fiscalYearId)
        {
            if (fiscalYearId != null)
            {
                return phrmdbcontext.PharmacyFiscalYears.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearName;
            }
            else
            {
                return "";
            }

        }
        /// <summary>
        /// This is whole single transaction of Invoice
        /// From Client-Invoice,InvoiceItems, GRItems info
        /// Transactions as below
        /// 1. Save Invoice Details                     2.Save Invoice Items Details + Narcotic Details (if any)
        /// 3. Decrement Stocks from Dispensary         4.Save Dispensary Stock Transactions
        /// 5. Update if prescription item is selected.
        /// Note: if above five transaction done successfully then Invoice Post done, If any one fails will all operation rollback
        /// </summary>
        public static PHRMInvoiceTransactionModel InvoiceTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

                    //Find Invoice Print Id for this fiscal year with max+1 logic
                    invoiceDataFromClient.InvoicePrintId = GetInvoiceNumber(phrmdbcontext);
                    invoiceDataFromClient.FiscalYearId = currentFiscalYearId;
                    invoiceDataFromClient.CreateOn = currentDate;
                    invoiceDataFromClient.CreatedBy = currentUser.EmployeeId;
                    invoiceDataFromClient.Creditdate = invoiceDataFromClient.BilStatus == "unpaid" ? (DateTime?)currentDate : null;
                    //save invoice items into another object and clear the invoice items from original invoice data
                    //this is done to avoid multiple for loops
                    var invoiceItemFromClient = invoiceDataFromClient.InvoiceItems;
                    invoiceDataFromClient.InvoiceItems = null;
                    //save invoice to generate invoice id
                    phrmdbcontext.PHRMInvoiceTransaction.Add(invoiceDataFromClient);
                    phrmdbcontext.SaveChanges();
                    //Save Invoice And Invoice Items details and perform stock decrements in same for loop
                    invoiceItemFromClient.ForEach(item =>
                    {
                        // to calculate Total discount Amount,per item discount amount and price according to discount given  
                        item.InvoiceId = invoiceDataFromClient.InvoiceId;
                        //item.TotalDisAmt = invoiceDataFromClient.DiscountAmount / (decimal)item.Quantity;
                        //item.Price = item.Price - item.Price * (Convert.ToDecimal(item.DiscountPercentage / 100));
                        item.PerItemDisAmt = (decimal)(((item.SubTotal * Convert.ToDecimal(item.DiscountPercentage)) / 100) / (decimal)item.Quantity);
                        item.CreatedOn = currentDate;
                        item.CreatedBy = currentUser.EmployeeId;
                        item.PatientId = invoiceDataFromClient.PatientId;
                        item.BilItemStatus = invoiceDataFromClient.BilStatus;

                        //add narcotic record in-case of narcotic drugs
                        if (item.NarcoticsRecord.NMCNumber != null)
                        {
                            item.NarcoticsRecord.ItemId = item.ItemId;
                            item.NarcoticsRecord.InvoiceId = item.InvoiceId;
                            item.NarcoticsRecord.InvoiceItemId = item.InvoiceItemId;
                            phrmdbcontext.PHRMNarcoticRecord.Add(item.NarcoticsRecord);
                        }
                        //save invoice item
                        phrmdbcontext.PHRMInvoiceTransactionItems.Add(item);
                        phrmdbcontext.SaveChanges();

                        //find the stock list in dispensary to decrease
                        var dispensaryStockList = phrmdbcontext.StoreStocks.Include(s => s.StockMaster)
                                                                    .Where(s => s.StoreId == invoiceDataFromClient.StoreId &&
                                                                            s.ItemId == item.ItemId &&
                                                                            s.AvailableQuantity > 0 &&
                                                                            s.StockMaster.BatchNo == item.BatchNo &&
                                                                            s.StockMaster.ExpiryDate == item.ExpiryDate &&
                                                                            s.StockMaster.MRP == item.StockMRP &&
                                                                            s.StockMaster.CostPrice == item.Price &&
                                                                            s.IsActive == true)
                                                                    .ToList();
                        //If no stock found, stop the process
                        if (dispensaryStockList == null) throw new Exception($"Stock is not available for Item = {item.ItemName}, BatchNo ={item.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (dispensaryStockList.Sum(s => s.AvailableQuantity) < item.Quantity) throw new Exception($"Stock is not available for ItemName = {item.ItemName}, BatchNo ={item.BatchNo}");
                        //apply fifo to decrement multiple stocks found in dispensary
                        var totalRemainingQty = item.Quantity;
                        foreach (var dispensaryStock in dispensaryStockList)
                        {
                            //Add Txn in PHRM_StockTxnItems table
                            var dispensaryStockTxn = new PHRMStockTransactionModel(
                                stock: dispensaryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.SaleItem,
                                transactionDate: invoiceDataFromClient.PaidDate ?? currentDate,
                                referenceNo: item.InvoiceItemId,
                                createdBy: currentUser.CreatedBy,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );

                            if (dispensaryStock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= dispensaryStock.AvailableQuantity;
                                dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: dispensaryStock.AvailableQuantity);
                                dispensaryStock.UpdateAvailableQuantity(newQty: 0);
                            }
                            else
                            {
                                dispensaryStock.UpdateAvailableQuantity(newQty: dispensaryStock.AvailableQuantity - (totalRemainingQty ?? 0));
                                dispensaryStockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                                totalRemainingQty = 0;
                            }
                            phrmdbcontext.StockTransactions.Add(dispensaryStockTxn);
                            phrmdbcontext.SaveChanges();

                            if (totalRemainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    });

                    //update prescriptionItems status 
                    //if sale from prescription then do this
                    //NBB-now we checking if there prescriptionid >0 then it's from prescription to sale
                    if (invoiceDataFromClient.InvoiceItems[0].PrescriptionItemId > 0)
                    {
                        //get items for status update after sale prescription items
                        var preItems = (from pres in phrmdbcontext.PHRMPrescriptionItems.AsEnumerable()
                                        join sale in invoiceDataFromClient.InvoiceItems
                                        on pres.PrescriptionItemId equals sale.PrescriptionItemId
                                        select pres).ToList();
                        var updatePresItemsOrderStatus = UpdatePrescriptionItems(preItems, phrmdbcontext);
                    }


                    if (invoiceDataFromClient.IsInsurancePatient == true)
                    {
                        InsuranceModel insurance = phrmdbcontext.PatientInsurances.Where(ins => ins.PatientId == invoiceDataFromClient.PatientId).FirstOrDefault();
                        if (insurance == null) throw new Exception("Unable to update Insurance Balance. Detail: Insurance object is null.");
                        if (insurance.Ins_InsuranceBalance < Convert.ToDouble(invoiceDataFromClient.TotalAmount)) throw new Exception("Unable to update Insurance Balance. Detail: Balance is insufficient.");

                        insurance.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance - Convert.ToDouble(invoiceDataFromClient.TotalAmount);
                        insurance.ModifiedOn = invoiceDataFromClient.CreateOn;
                        insurance.ModifiedBy = invoiceDataFromClient.CreatedBy;

                        PHRMPatient patient = phrmdbcontext.PHRMPatient.Where(p => p.PatientId == invoiceDataFromClient.PatientId).FirstOrDefault();
                        if (patient == null) throw new Exception("Patient data not found");

                        patient.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance;

                        phrmdbcontext.SaveChanges();
                    }

                    dbContextTransaction.Commit();//Commit Transaction
                    return invoiceDataFromClient;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured 
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        /// <summary>
        /// Provisional Invoice 
        /// This is whole single transaction of Invoice
        /// From Client-Invoice,InvoiceItems, GRItems info
        /// Make - Stock, StockTransaction object and do below transaction
        /// Transactions as below
        /// 1. Save Invoice Details                     2.Save Invoice Items Details
        /// 3. Save Stock Transaction Items Details     4.Update GRItems (stock) details (available qty)
        /// 5. Update Stock Details (Available Quantity)
        /// Note: if above five transaction done successfully then Invoice Post done, If any one fails will all operation rollback
        /// </summary>
        /// 
        //Deposit receipt number in pharmacy
        public static int? GetDepositReceiptNo(string connString)
        {
            using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadUncommitted }))
            {
                int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
                DanpheEMR.DalLayer.PharmacyDbContext phrmDbContext = new DalLayer.PharmacyDbContext(connString);
                int? receiptNo = (from depTxn in phrmDbContext.DepositModel
                                  where depTxn.FiscalYearId == fiscalYearId
                                  select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();
                return receiptNo + 1;
            }


        }
        public static PHRMInvoiceTransactionModel ProvisionalTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    //check if Item Discount Is Applicable
                    var itmdis = (from dbc in phrmdbcontext.CFGParameters                       //get item level discount features detail.
                                  where dbc.ParameterGroupName.ToLower() == "Pharmacy" && dbc.ParameterName == "PharmacyItemlvlDiscount"
                                  select dbc.ParameterValue).FirstOrDefault();
                    if (itmdis == "false")                                                     //check item level discount features disable
                    {
                        //we applied general discount in client side on invoice but invoice not generated in provisional bill.
                        // and when item level discount features is disable then remove general discount total amt is = to subtotal.
                        // this code for only display total amt in provisional bill.
                        invoiceDataFromClient.TotalAmount = invoiceDataFromClient.SubTotal;
                        invoiceDataFromClient.DiscountAmount = 0;
                    }
                    invoiceDataFromClient.FiscalYearId = currentFiscalYearId;
                    //Save Invoice And Invoice Items details
                    invoiceDataFromClient.InvoiceItems.ForEach(item =>
                    {
                        // to calculate discount percent and price according to discount given  
                        item.InvoiceId = null;
                        item.BilItemStatus = "provisional";
                        item.VisitType = invoiceDataFromClient.VisitType;
                        item.PatientId = invoiceDataFromClient.PatientId;
                        item.PerItemDisAmt = (decimal)(item.SubTotal * Convert.ToDecimal(item.DiscountPercentage) / 100 / (decimal)item.Quantity);
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = currentDate;
                        //add narcotic record in-case of narcotic drugs
                        if (item.NarcoticsRecord.NMCNumber != null)
                        {
                            item.NarcoticsRecord.ItemId = item.ItemId;
                            item.NarcoticsRecord.InvoiceId = item.InvoiceId;
                            item.NarcoticsRecord.InvoiceItemId = item.InvoiceItemId;
                            phrmdbcontext.PHRMNarcoticRecord.Add(item.NarcoticsRecord);
                        }
                        phrmdbcontext.PHRMInvoiceTransactionItems.Add(item);
                        phrmdbcontext.SaveChanges();

                        //find the stock list in dispensary to decrease
                        var dispensaryStockz = phrmdbcontext.StoreStocks.Include(s => s.StockMaster)
                                                                    .Where(s => s.StoreId == invoiceDataFromClient.StoreId &&
                                                                            s.ItemId == item.ItemId &&
                                                                            s.AvailableQuantity > 0 &&
                                                                            s.StockMaster.CostPrice == item.Price &&
                                                                            s.StockMaster.BatchNo == item.BatchNo &&
                                                                            s.StockMaster.ExpiryDate == item.ExpiryDate &&
                                                                            s.IsActive == true)
                                                                    .ToList();
                        //If no stock found, stop the process
                        if (dispensaryStockz == null) throw new Exception($"Stock is not available for ItemId = {item.ItemId}, BatchNo ={item.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (dispensaryStockz.Sum(s => s.AvailableQuantity) < item.Quantity) throw new Exception($"Stock is not available for ItemId = {item.ItemId}, BatchNo ={item.BatchNo}");
                        //apply fifo to decrement multiple stocks found in dispensary
                        var totalRemainingQty = item.Quantity;
                        foreach (var stock in dispensaryStockz)
                        {
                            //Add Txn in PHRM_StockTxnItems table
                            var newStockTxn = new PHRMStockTransactionModel(
                                stock: stock,
                                transactionType: ENUM_PHRM_StockTransactionType.ProvisionalSaleItem,
                                transactionDate: invoiceDataFromClient.PaidDate ?? currentDate,
                                referenceNo: item.InvoiceItemId,
                                createdBy: currentUser.CreatedBy,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );

                            if (stock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= stock.AvailableQuantity;
                                newStockTxn.SetInOutQuantity(inQty: 0, outQty: stock.AvailableQuantity);
                                stock.UpdateAvailableQuantity(newQty: 0);
                            }
                            else
                            {
                                stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity - (totalRemainingQty ?? 0));
                                newStockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                                totalRemainingQty = 0;
                            }
                            phrmdbcontext.StockTransactions.Add(newStockTxn);
                            phrmdbcontext.SaveChanges();

                            if (totalRemainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    });
                    //if provisional was done by drug requisition
                    if (requisitionId > 0)
                    {
                        List<int> ItemId = invoiceDataFromClient.InvoiceItems.Select(a => a.InvoiceItemId).ToList();
                        string InvoiceItemIdList = string.Join(",", ItemId);
                        PHRMDrugsRequistionModel phrmDrugRequsition = phrmdbcontext.DrugRequistion.Find(requisitionId);
                        phrmDrugRequsition.ReferenceId = InvoiceItemIdList;
                        phrmDrugRequsition.Status = "completed";
                        phrmdbcontext.SaveChanges();
                    }
                    //update prescriptionItems status 
                    //if sale from prescription then do this
                    //NBB-now we checking if there prescriptionid >0 then it's from prescription to sale
                    if (invoiceDataFromClient.InvoiceItems[0].PrescriptionItemId > 0)
                    {
                        //get items for status update after sale prescription items
                        var preItems = (from pres in phrmdbcontext.PHRMPrescriptionItems.AsEnumerable()
                                        join sale in invoiceDataFromClient.InvoiceItems
                                        on pres.PrescriptionItemId equals sale.PrescriptionItemId
                                        select pres).ToList();
                        var updatePresItemsOrderStatus = UpdatePrescriptionItems(preItems, phrmdbcontext);
                    }
                    dbContextTransaction.Commit();//Commit Transaction
                    return invoiceDataFromClient;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured 
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }

        }

        // Ward Requisition Items Dispatch.
        public static WARDDispatchModel WardRequisitionItemsDispatch(WARDDispatchModel wardDispatch, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>();
                    //decrement in pharmacy dispensary stock happens here.
                    var saveRes = SaveWardRequisitionItems(wardDispatch, phrmdbcontext, currentUser, requisitionId);
                    flag.Add(saveRes);
                    //Make StockTransaction object data for post/save

                    List<WARDStockModel> wardStock = new List<WARDStockModel>();
                    List<WARDTransactionModel> wardStockTXN = new List<WARDTransactionModel>();
                    //var priceList = (from price in phrmdbcontext.PHRMStoreStock
                    //                select new
                    //                {
                    //                    Price = price.Price
                    //                }).ToList();
                    //List<int> priceList = stckprice.                   
                    var ward = (from wardReq in phrmdbcontext.WardRequisition
                                join wardReqItem in phrmdbcontext.WardRequisitionItem on wardReq.RequisitionId equals wardReqItem.RequisitionId
                                join wardModel in phrmdbcontext.WardModel on wardReq.WardId equals wardModel.WardId
                                join disp in phrmdbcontext.WardDisapatch on wardReqItem.RequisitionId equals disp.RequisitionId
                                where wardReq.RequisitionId == wardDispatch.RequisitionId
                                select new
                                {
                                    WardId = wardReq.WardId,
                                    WardName = wardModel.WardName
                                }).FirstOrDefault();

                    //loop RequisitionItems and make stock transaction object
                    for (int i = 0; i < wardDispatch.WardDispatchedItemsList.Count; i++)
                    {

                        var currQuantity = wardDispatch.WardDispatchedItemsList[i].Quantity;
                        var tempWardStock = new WARDStockModel();

                        tempWardStock.ItemId = wardDispatch.WardDispatchedItemsList[i].ItemId;
                        tempWardStock.StoreId = wardDispatch.StoreId;
                        tempWardStock.AvailableQuantity = wardDispatch.WardDispatchedItemsList[i].Quantity;
                        tempWardStock.MRP = Convert.ToDouble(wardDispatch.WardDispatchedItemsList[i].MRP);
                        tempWardStock.BatchNo = wardDispatch.WardDispatchedItemsList[i].BatchNo;
                        tempWardStock.ExpiryDate = wardDispatch.WardDispatchedItemsList[i].ExpiryDate;
                        tempWardStock.ItemName = wardDispatch.WardDispatchedItemsList[i].ItemName;
                        tempWardStock.DispachedQuantity = wardDispatch.WardDispatchedItemsList[i].Quantity;
                        tempWardStock.StockType = "pharmacy";
                        tempWardStock.Price = wardDispatch.WardDispatchedItemsList[i].Price;
                        wardStock.Add(tempWardStock);

                        var WardTxn = new WARDTransactionModel();
                        WardTxn.ItemId = tempWardStock.ItemId;
                        WardTxn.Quantity = tempWardStock.AvailableQuantity;
                        WardTxn.TransactionType = "Dispatched";
                        WardTxn.CreatedBy = currentUser.UserName;
                        WardTxn.CreatedOn = DateTime.Now;
                        WardTxn.Remarks = wardDispatch.Remark;
                        WardTxn.IsWard = true;
                        WardTxn.newWardId = 0;
                        WardTxn.ReceivedBy = wardDispatch.ReceivedBy;
                        WardTxn.StoreId = tempWardStock.StoreId;
                        WardTxn.Price = tempWardStock.Price;
                        wardStockTXN.Add(WardTxn);

                        if (currQuantity == 0)
                        {
                            break;
                        }
                    }
                    var StkTxnRes = AddWardStockItems(phrmdbcontext, wardStock, wardStockTXN);
                    flag.Add(StkTxnRes);

                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return wardDispatch;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        return wardDispatch;
                    }
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured 
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }

        }
        // Provisional data of drugs requst from nursing dept.
        public static List<PHRMDrugsRequistionItemsModel> ProvisionalItem(List<PHRMDrugsRequistionItemsModel> provisionalItem, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    return new List<PHRMDrugsRequistionItemsModel>(); //delete later
                                                                      //List<Boolean> flag = new List<bool>(); //for checking all transaction status       
                                                                      ////Save Invoice Items details
                                                                      //var saveRes = SaveProvisionInvoiceItems(provisionalItem, phrmdbcontext, currentUser);
                                                                      //flag.Add(saveRes);
                                                                      ////Make StockTransaction object data for post/save
                                                                      //List<PHRMDispensaryStockTransactionModel> phrmStockTxnItems = new List<PHRMDispensaryStockTransactionModel>();
                                                                      ////loop InvoiceItems and make stock transaction object
                                                                      //for (int i = 0; i < provisionalItem.Count; i++)
                                                                      //{
                                                                      //    List<string> BatchNoForInvoiceItems = new List<string>();
                                                                      //    //Quantity of InvoiceItems
                                                                      //    //var discPer = (provisionalItem.DiscountAmount/ provisionalItem.SubTotal)*100;
                                                                      //    //double discPerForCalcn = decimal.ToDouble(discPer.Value);
                                                                      //    var currQuantity = provisionalItem[i].Quantity.Value;
                                                                      //    var tempStockTxnItems = new PHRMDispensaryStockTransactionModel();
                                                                      //    tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                                                                      //    tempStockTxnItems.CreatedOn = DateTime.Now;
                                                                      //    //tempStockTxnItems.DiscountPercentage = discPerForCalcn;
                                                                      //    //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
                                                                      //    tempStockTxnItems.ExpiryDate = provisionalItem[i].ExpiryDate;
                                                                      //    //just to make insert work
                                                                      //    tempStockTxnItems.Quantity = provisionalItem[i].Quantity.Value;
                                                                      //    tempStockTxnItems.BatchNo = provisionalItem[i].BatchNo;
                                                                      //    tempStockTxnItems.InOut = "out";
                                                                      //    tempStockTxnItems.MRP = provisionalItem[i].MRP;
                                                                      //    tempStockTxnItems.CostPrice = provisionalItem[i].Price;
                                                                      //    tempStockTxnItems.TransactionType = "nurserequest";
                                                                      //    string avlbleQty = provisionalItem[i].AvailableQuantity.ToString();
                                                                      //    provisionalItem[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
                                                                      //    phrmStockTxnItems.Add(tempStockTxnItems);
                                                                      //    if (currQuantity == 0)
                                                                      //    {
                                                                      //        break;
                                                                      //    }
                                                                      //}

                    ////var StkTxnRes = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    ////flag.Add(StkTxnRes);

                    //if (CheckFlagList(flag))
                    //{
                    //    dbContextTransaction.Commit();//Commit Transaction
                    //    return provisionalItem;
                    //}
                    //else
                    //{
                    //    dbContextTransaction.Rollback();//Rollback transaction
                    //    ///invoiceDataFromClient = new PHRMInvoiceTransactionModel();
                    //    return provisionalItem;
                    //}
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured 
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }

        }
        /// <summary>
        /// Transactions as below
        /// 1. Save Return To Supplier Items                     2.Save Stock Transaction Items Details
        /// 3. Update GoodsRecieptItems AvailableQuantity        4.Update Stock Details (Available Quantity)
        /// Note: if above Four transaction done successfully then ReturnToSupplierItem Post done, If any one fails will all operation rollback
        /// System.Data.SqlClient.SqlCommand.ExecuteReader(CommandBehavior behavior, String method)
        /// </summary> 
        public static int ReturnItemsToSupplierTransaction(PHRMReturnToSupplierModel returnToSupplierObj, PharmacyDbContext phrmdbcontext)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalyearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    //find the GR an GRItem list
                    var returnedGR = phrmdbcontext.PHRMGoodsReceipt.Find(returnToSupplierObj.GoodReceiptId);
                    //var returnedGRItems = phrmdbcontext.PHRMGoodsReceiptItems.Find()
                    returnToSupplierObj.returnToSupplierItems.ForEach(item => item.CreatedOn = currentDate);
                    returnToSupplierObj.CreatedOn = currentDate;
                    //Add ReturnToSupplier to db
                    phrmdbcontext.PHRMReturnToSupplier.Add(returnToSupplierObj);
                    phrmdbcontext.SaveChanges();
                    //Save ReturnToSupplierId to all the items and save in the db.
                    returnToSupplierObj.returnToSupplierItems.ForEach(item => item.ReturnToSupplierId = returnToSupplierObj.ReturnToSupplierId);
                    phrmdbcontext.SaveChanges();

                    //Find Stock from Main Stock for each item and check if available quantity is greater than returned quantity, then decrease the stock and add to stock transaction
                    returnToSupplierObj.returnToSupplierItems.ForEach(RTSItem =>
                    {
                        //Find Stock from goods receipt item as return to supplier item model has GRItemId and GRItem has StockId
                        var stockToDecrease = (from S in phrmdbcontext.StoreStocks
                                               join GRI in phrmdbcontext.PHRMGoodsReceiptItems on S.StoreStockId equals GRI.StoreStockId
                                               where S.IsActive == true && GRI.GoodReceiptItemId == RTSItem.GoodReceiptItemId
                                               select S
                                               ).Include(s => s.StockMaster).FirstOrDefault();
                        //Check if stock exists
                        if (stockToDecrease == null) throw new Exception("Stock not found for ItemId = " + RTSItem.ItemId + " ,BatchNo = " + RTSItem.BatchNo);
                        //Check if returned quantity is available
                        if (stockToDecrease.AvailableQuantity < (RTSItem.Quantity + RTSItem.FreeQuantity)) throw new Exception("Returned quantity is greater than available stock with ItemId = " + RTSItem.ItemId + " ,BatchNo = " + RTSItem.BatchNo);
                        //Decrease the stock and update in db
                        stockToDecrease.UpdateAvailableQuantity(stockToDecrease.AvailableQuantity - (RTSItem.Quantity + RTSItem.FreeQuantity ?? 0));
                        phrmdbcontext.SaveChanges();
                        //Add stock transaction for the decrement of stock
                        var newStockTxn = new PHRMStockTransactionModel(
                            stock: stockToDecrease,
                            transactionType: ENUM_PHRM_StockTransactionType.PurchaseReturnedItem,
                            transactionDate: currentDate,
                            referenceNo: RTSItem.ReturnToSupplierItemId,
                            createdBy: RTSItem.CreatedBy,
                            createdOn: currentDate,
                            fiscalYearId: currentFiscalyearId
                            );
                        newStockTxn.SetInOutQuantity(inQty: 0, outQty: RTSItem.Quantity + RTSItem.FreeQuantity);
                        phrmdbcontext.StockTransactions.Add(newStockTxn);
                        phrmdbcontext.SaveChanges();
                        //if()
                        ////find the GoodsReceiptItems which are returned
                        //var grItems = phrmdbcontext.PHRMGoodsReceiptItems.Find(RTSItem.GoodReceiptItemId);
                        //gr = "returned";
                        //phrmdbcontext.SaveChanges();

                        ////Check if all the gr items for that particular goodsreceipt id is returned.
                        //var isGRItemReturned =  phrmdbcontext.PHRMGoodsReceiptItems.Where(s => s.GoodReceiptId == returnToSupplierObj.GoodReceiptId).All(r => r.GoodsReceiptItemStatus == "returned" );

                        //// if all goodReceiptItems are returned, update the GR isReturned flag to  true;
                        //if (isGRItemReturned)
                        //{
                        //    returnedGR.Retur.IsReturnedToSupplier = "true";
                        //    phrmdbcontext.SaveChanges();
                        //}
                    });

                    dbContextTransaction.Commit();
                    return returnToSupplierObj.ReturnToSupplierId;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        /// <summary>
        /// Umed-This is whole single transaction of WriteOff Transaction
        /// Transactions as below
        /// 1. Save WriteOff and WriteOffItems                     2.Save Stock Transaction Items Details
        /// 3. Update GoodsRecieptItems AvailableQuantity        4.Update Stock Details (Available Quantity)
        /// Note: if above Four transaction done successfully then WriteOffItem Post done, If any one fails will all operation rollback
        /// </summary>
        /// 
        //NBB-after logic change in pharmacy we are now updating stock table because we are not using stock table 
        //we don't want to update GoodsReceiptItems available quantity also
        //1-save to writeOff and WriteOffItems
        //2-Save stock transaction items details 
        //done it
        public static int WriteOffItemTransaction(PHRMWriteOffModel writeOffFromClient, PharmacyDbContext db, RbacUser currentUser)
        {
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;
                    var currentDate = DateTime.Now;
                    //Register the stocks in write-off and write-off item table
                    //create write-off number by max+1 logic
                    var newWriteOffNo = (from W in db.PHRMWriteOff select W.WriteOffNo).DefaultIfEmpty(0).Max() + 1;
                    writeOffFromClient.WriteOffNo = newWriteOffNo;
                    writeOffFromClient.CreatedOn = currentDate;
                    writeOffFromClient.phrmWriteOffItem.ForEach(item => { item.CreatedOn = currentDate; });
                    db.PHRMWriteOff.Add(writeOffFromClient);
                    db.SaveChanges();


                    //Find the stock list from ItemId, Batch, Expiry, CostPrice and MRP.
                    foreach (var writeoffItem in writeOffFromClient.phrmWriteOffItem)
                    {
                        var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(s => s.ItemId == writeoffItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == writeoffItem.BatchNo && s.StockMaster.ExpiryDate == writeoffItem.ExpiryDate && s.IsActive == true).ToList();
                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {writeoffItem.ItemId}, BatchNo ={writeoffItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < writeoffItem.WriteOffQuantity) throw new Exception($"Stock is not available for ItemId = {writeoffItem.ItemId}, BatchNo ={writeoffItem.BatchNo}");

                        //Run the fifo logic in stocklist based on Created On
                        var totalRemainingQty = writeoffItem.WriteOffQuantity;
                        foreach (var stock in stockList)
                        {
                            //Decrement the stock and add the stock transaction with Transaction Type = 'write-off-item'
                            var stockTxn = new PHRMStockTransactionModel(
                                stock: stock,
                                transactionType: ENUM_PHRM_StockTransactionType.WriteOffItem,
                                transactionDate: writeOffFromClient.WriteOffDate,
                                referenceNo: writeoffItem.WriteOffItemId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );
                            if (stock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= stock.AvailableQuantity;
                                stockTxn.SetInOutQuantity(inQty: 0, outQty: stock.AvailableQuantity);
                                stock.UpdateAvailableQuantity(newQty: 0);
                            }
                            else
                            {
                                stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity - totalRemainingQty);
                                stockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                                totalRemainingQty = 0;
                            }

                            db.StockTransactions.Add(stockTxn);
                            db.SaveChanges();

                            if (totalRemainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    }
                    dbContextTransaction.Commit();//Commit Transaction
                    return writeOffFromClient.WriteOffId;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        /// <summary>
        /// Umed-This is whole single transaction of Stock Manage Transaction
        /// Transactions as below
        /// 1. Update GoodsRecieptItems AvailableQuantity                     2.Update Stock Qty
        /// 3. Do Entry in Stock Transaction       
        /// Note: if above Four transaction done successfully then Stock Manage Transaction Post done, If any one fails will all operation rollback
        /// </summary>
        /// NBB-changed on 14 August 2018 as per hams req
        /// now we are posting into StockManage table and stockTxnItems table only 
        ///we are not updating any stop only posting because in hams we are calculating stock from stockTxnItems table on transactionType and InOut
        public static Boolean StockManageTransaction(PHRMStockManageModel stkManageFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    //List<Boolean> flag = new List<bool>(); //for checking all transaction status

                    //List<PHRMStoreStockModel> phrmDispensaryStockModels = new List<PHRMStoreStockModel>();
                    //var selecteddispensarystock = new PHRMStoreStockModel(stkManageFromClient.StockTxnItemId, stkManageFromClient.StoreId);

                    //selecteddispensarystock.ItemId = stkManageFromClient.ItemId;
                    //selecteddispensarystock.BatchNo = stkManageFromClient.BatchNo;
                    //selecteddispensarystock.ExpiryDate = stkManageFromClient.ExpiryDate;
                    //selecteddispensarystock.AvailableQuantity = Convert.ToDouble(stkManageFromClient.Quantity);
                    //selecteddispensarystock.CostPrice = stkManageFromClient.Price;
                    //selecteddispensarystock.MRP = stkManageFromClient.MRP;
                    //phrmDispensaryStockModels.Add(selecteddispensarystock);

                    //var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels);
                    //flag.Add(addUpdateDispensaryReslt);



                    //List<PHRMDispensaryStockTransactionModel> phrmStockTxnItems = new List<PHRMDispensaryStockTransactionModel>();

                    //var selectedstockTxnItm = new PHRMDispensaryStockTransactionModel();
                    //selectedstockTxnItm.ItemId = stkManageFromClient.ItemId;
                    //selectedstockTxnItm.BatchNo = stkManageFromClient.BatchNo;
                    //selectedstockTxnItm.ExpiryDate = stkManageFromClient.ExpiryDate;
                    //selectedstockTxnItm.Quantity = Convert.ToDouble(stkManageFromClient.Quantity);
                    //selectedstockTxnItm.CostPrice = stkManageFromClient.Price;
                    //selectedstockTxnItm.InOut = stkManageFromClient.InOut; ////take from client side
                    //selectedstockTxnItm.ReferenceNo = stkManageFromClient.StockManageId;
                    //selectedstockTxnItm.TransactionType = "stockmanage"; ///during GR Transaction Type is goodsreceipt
                    //selectedstockTxnItm.MRP = stkManageFromClient.MRP;
                    //selectedstockTxnItm.CreatedBy = currentUser.EmployeeId;
                    //phrmStockTxnItems.Add(selectedstockTxnItm);

                    //var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    //flag.Add(StckTxnItmReslt);
                    //if (CheckFlagList(flag))
                    //{
                    //    dbContextTransaction.Commit();//Commit Transaction
                    //    return true;
                    //}
                    //else
                    //{
                    //    dbContextTransaction.Rollback();//Rollback transaction
                    //    return false;
                    //}
                    return false;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public static Boolean StoreManageTransaction(PHRMStockTransactionModel strManageFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status

                    //strManageFromClient.CreatedOn = DateTime.Now;
                    //strManageFromClient.CreatedBy = currentUser.EmployeeId;
                    //strManageFromClient.TransactionType = "stockmanage";

                    var StckTxnItmReslt = AddStoreTransactionItems(phrmdbcontext, strManageFromClient);
                    flag.Add(StckTxnItmReslt);
                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return true;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        return false;
                    }
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public static Boolean TransferStoreStockToDispensary(PHRMStockTransactionModel storeStockData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            try
            {
                List<Boolean> flag = new List<bool>(); //for checking all transaction status

                //storeStockData.CreatedOn = DateTime.Now;
                //storeStockData.CreatedBy = currentUser.EmployeeId;
                //storeStockData.TransactionType = "Transfer To Dispensary";
                //storeStockData.IsActive = true;

                var StckTxnItmReslt = AddStoreTransactionItems(phrmdbcontext, storeStockData);
                flag.Add(StckTxnItmReslt);
                //# post to pharmacy despensary items table.
                List<PHRMStoreStockModel> phrmDispensaryStockModels = new List<PHRMStoreStockModel>();
                //var selecteddispensarystock = new PHRMStoreStockModel();

                //selecteddispensarystock.ItemId = storeStockData.ItemId;
                //selecteddispensarystock.BatchNo = storeStockData.BatchNo;
                //selecteddispensarystock.ExpiryDate = storeStockData.ExpiryDate;
                //selecteddispensarystock.AvailableQuantity = Convert.ToDouble(storeStockData.Quantity);
                //selecteddispensarystock.MRP = storeStockData.MRP;
                //phrmDispensaryStockModels.Add(selecteddispensarystock);

                //var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels, false);
                //flag.Add(addUpdateDispensaryReslt);


                //List<PHRMDispensaryStockTransactionModel> phrmStockTxnItems = new List<PHRMDispensaryStockTransactionModel>();
                //var StockTxnItem = new PHRMDispensaryStockTransactionModel();
                //StockTxnItem.ItemId = storeStockData.ItemId;
                //StockTxnItem.BatchNo = storeStockData.BatchNo;
                //StockTxnItem.ExpiryDate = storeStockData.ExpiryDate;
                //StockTxnItem.Quantity = storeStockData.Quantity;
                //StockTxnItem.InOut = "in";
                //StockTxnItem.ReferenceNo = storeStockData.ReferenceNo;
                //StockTxnItem.TransactionType = "Sent From Store";
                //StockTxnItem.CreatedBy = currentUser.EmployeeId;
                //StockTxnItem.MRP = storeStockData.MRP;
                //phrmStockTxnItems.Add(StockTxnItem);
                //var StockTxnResult = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                //flag.Add(StockTxnResult);

                if (CheckFlagList(flag))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }


        public static Boolean TransferDispensaryStockToStore(PHRMStockTransactionModel dispensaryStockData, int StoreId, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status
                    List<PHRMStockTransactionModel> phrmStockTxnItems = new List<PHRMStockTransactionModel>();

                    phrmStockTxnItems.Add(dispensaryStockData);
                    var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);

                    flag.Add(StckTxnItmReslt);
                    //# post to pharmacy despensary items table.
                    List<PHRMStoreStockModel> phrmDispensaryStockModels = new List<PHRMStoreStockModel>();
                    //var selecteddispensarystock = new PHRMStoreStockModel();

                    //phrmDispensaryStockModels.Add(selecteddispensarystock);

                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels);
                    flag.Add(addUpdateDispensaryReslt);


                    //var StoreTxnItem = new PHRMStockTransactionModel();
                    //StoreTxnItem.ItemId = dispensaryStockData.ItemId;
                    //StoreTxnItem.BatchNo = dispensaryStockData.BatchNo;
                    //StoreTxnItem.ExpiryDate = dispensaryStockData.ExpiryDate;
                    //StoreTxnItem.ReferenceNo = dispensaryStockData.ReferenceNo;
                    //StoreTxnItem.TransactionType = "Sent From Dispensary";
                    //StoreTxnItem.CreatedBy = currentUser.EmployeeId;
                    //var StockTxnResult = AddStoreTransactionItems(phrmdbcontext, StoreTxnItem);
                    //flag.Add(StockTxnResult);

                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return true;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        return false;
                    }
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        /// <summary>
        /// This transaction- when customer return invoice items to pharmacy
        /// 4 Transaction in this single transaction
        /// POST/PUT data to - 
        /// 1-ReturnInvoiceItems table, 
        /// 2-StockTxn table with txnType as salereturn,
        /// 3-Update GRItems available qty, 
        /// 4-Update stock Qty by ItemId        
        /// </summary>   
        public static void ReturnFromCustomerTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currFiscalYear = GetFiscalYear(phrmdbcontext);

                    PHRMSettlementModel settlement = new PHRMSettlementModel();

                    if (ClientData.CashDiscount.HasValue && ClientData.CashDiscount.Value > 0)
                    {
                        settlement.DiscountReturnAmount = ClientData.CashDiscount;
                        settlement.PatientId = (int)ClientData.PatientId;
                        settlement.SettlementReceiptNo = GetSettlementReceiptNo(phrmdbcontext);
                        settlement.CreatedOn = System.DateTime.Now;
                        settlement.SettlementDate = System.DateTime.Now;
                        settlement.FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId;
                        settlement.CreatedBy = currentUser.EmployeeId;
                        settlement.CounterId = ClientData.CounterId;
                        settlement.PaymentMode = ENUM_BillPaymentMode.cash;
                        settlement.StoreId = ClientData.StoreId;

                        phrmdbcontext.PHRMSettlements.Add(settlement);
                        phrmdbcontext.SaveChanges();
                    }

                    int? maxCreditNoteId = phrmdbcontext.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteId);
                    if (maxCreditNoteId == null || !maxCreditNoteId.HasValue)
                    {
                        maxCreditNoteId = 0;
                    }

                    int? maxCreditNoteNum = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteNumber);
                    if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
                    {
                        maxCreditNoteNum = 0;
                    }

                    int invid = (from txn in phrmdbcontext.PHRMInvoiceTransaction
                                 where txn.InvoicePrintId == ClientData.InvoiceId
                                 select txn.InvoiceId).DefaultIfEmpty(0).Max();

                    ClientData.InvoiceId = invid == 0 ? null : (int?)invid;
                    ClientData.FiscalYearId = currFiscalYear.FiscalYearId;
                    ClientData.CreditNoteId = maxCreditNoteId + 1;
                    ClientData.CreatedOn = currentDate;
                    ClientData.CreatedBy = currentUser.EmployeeId;
                    var settlementId = settlement.SettlementId > 0 ? (int?)settlement.SettlementId : null;
                    ClientData.SettlementId = settlementId;
                    ClientData.InvoiceReturnItems.ForEach(returnedItem =>
                    {
                        //register returned items in the table
                        returnedItem.CreatedOn = currentDate;
                        returnedItem.CreatedBy = currentUser.EmployeeId;
                        returnedItem.FiscalYearId = currFiscalYear.FiscalYearId;
                        returnedItem.CreditNoteNumber = maxCreditNoteNum + 1;
                    });
                    phrmdbcontext.PHRMInvoiceReturnModel.Add(ClientData);
                    phrmdbcontext.SaveChanges();

                    ClientData.InvoiceReturnItems.ForEach(returnedItem =>
                    {

                        // perform the stock manipulation operation here
                        // perform validation check to avoid concurrent user issue or stale data issue
                        // find all previously returned InvoiceReturnItemId
                        List<int> previouslyReturnedInvRetItemId = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(i => i.InvoiceItemId == returnedItem.InvoiceItemId).Select(a => a.InvoiceReturnItemId).ToList();

                        var SaleTxn = ENUM_PHRM_StockTransactionType.SaleItem;
                        var SaleReturnTxn = ENUM_PHRM_StockTransactionType.SaleReturnedItem;
                        // find the total sold stock, substract with total returned stock
                        var allStockTxnsForThisInvoiceItem = phrmdbcontext.StockTransactions
                                                                        .Where(s => (s.ReferenceNo == returnedItem.InvoiceItemId && s.TransactionType == SaleTxn)
                                                                        || (previouslyReturnedInvRetItemId.Contains(s.ReferenceNo ?? 0) && s.TransactionType == SaleReturnTxn)).ToList();
                        // if no stock was returned previously, do not go further
                        if (previouslyReturnedInvRetItemId != null || previouslyReturnedInvRetItemId.Count > 0)
                        {
                            double totalSoldQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == SaleTxn).Sum(b => b.OutQty);
                            double? totalReturnedQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == SaleReturnTxn).Sum(b => b.InQty);

                            double totalReturnableQtyForThisItem = totalSoldQtyForThisItem - (totalReturnedQtyForThisItem ?? 0);

                            //if total returnable quantity for the item is less than returned quantity from client side, throw exception
                            if (totalReturnableQtyForThisItem < returnedItem.ReturnedQty) throw new Exception($"{totalReturnableQtyForThisItem} qty is already returned for {returnedItem.ItemName} with Batch : {returnedItem.BatchNo} ");
                        }
                        //Find the stock that was sold
                        var stockIdList = allStockTxnsForThisInvoiceItem.Select(s => s.StockId).Distinct().ToList();
                        var soldByStoreId = allStockTxnsForThisInvoiceItem[0].StoreId;
                        var stockList = phrmdbcontext.StoreStocks.Include(s => s.StockMaster).Where(s => stockIdList.Contains(s.StockId) && s.StoreId == soldByStoreId).ToList();

                        //use fifo to return the items into dispensary stock
                        //at first, total remaining returned quantity will be the total quantity returned from the client-side, later deducted with every iteration
                        var remainingReturnedQuantity = returnedItem.ReturnedQty;

                        foreach (var stock in stockList)
                        {
                            double soldQuantityForThisStock = allStockTxnsForThisInvoiceItem.Where(s => s.StockId == stock.StockId).Sum(s => s.OutQty);
                            double? previouslyReturnedQuantityForThisStock = allStockTxnsForThisInvoiceItem.Where(s => s.StockId == stock.StockId).Sum(s => s.InQty);
                            double totalReturnableQtyForThisStock = soldQuantityForThisStock - (previouslyReturnedQuantityForThisStock ?? 0);
                            //since we are modifying stock, we need to store the record in transaction
                            PHRMStockTransactionModel newStockTxn = null;
                            if (totalReturnableQtyForThisStock == 0)
                            {
                                continue;
                            }
                            if (totalReturnableQtyForThisStock < remainingReturnedQuantity)
                            {
                                //Check if the sold store and returning store are same
                                if (stock.StoreId == returnedItem.StoreId)
                                {
                                    stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + totalReturnableQtyForThisStock);

                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        stock: stock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                        transactionDate: currentDate,
                                                        referenceNo: returnedItem.InvoiceReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currFiscalYear.FiscalYearId
                                                        );
                                }
                                //If store is not same, then find the stock for the returning store
                                else
                                {
                                    var returningStoreStock = phrmdbcontext.StoreStocks.Include(a => a.StockMaster).FirstOrDefault(s => s.StockId == stock.StockId && s.StoreId == returnedItem.StoreId);
                                    if (returningStoreStock != null)
                                    {
                                        //If stock found, update the available quantity
                                        returningStoreStock.UpdateAvailableQuantity(returningStoreStock.AvailableQuantity + totalReturnableQtyForThisStock);
                                    }
                                    else
                                    {
                                        // If stock not found, create a new stock for this store
                                        returningStoreStock = new PHRMStoreStockModel(
                                            stockMaster: stock.StockMaster,
                                            storeId: returnedItem.StoreId,
                                            quantity: totalReturnableQtyForThisStock
                                            );

                                        phrmdbcontext.StoreStocks.Add(returningStoreStock);
                                        phrmdbcontext.SaveChanges();
                                    }
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        stock: returningStoreStock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                        transactionDate: currentDate,
                                                        referenceNo: returnedItem.InvoiceReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currFiscalYear.FiscalYearId
                                                        );
                                }
                                newStockTxn.SetInOutQuantity(inQty: totalReturnableQtyForThisStock, outQty: 0);
                                remainingReturnedQuantity -= totalReturnableQtyForThisStock;
                            }
                            else
                            {
                                //Check if the sold store and returning store are same
                                if (stock.StoreId == returnedItem.StoreId)
                                {
                                    stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + remainingReturnedQuantity ?? 0);
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        stock: stock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                        transactionDate: currentDate,
                                                        referenceNo: returnedItem.InvoiceReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currFiscalYear.FiscalYearId
                                                        );
                                }
                                //If store is not same, then find the stock for the returning store
                                else
                                {
                                    var returningStoreStock = phrmdbcontext.StoreStocks.Include(a => a.StockMaster).FirstOrDefault(s => s.StoreStockId == stock.StoreStockId && s.StoreId == returnedItem.StoreId);
                                    if (returningStoreStock != null)
                                    {
                                        //If stock found, update the available quantity
                                        returningStoreStock.UpdateAvailableQuantity(newQty: returningStoreStock.AvailableQuantity + (remainingReturnedQuantity ?? 0));
                                    }
                                    else
                                    {
                                        // If stock not found, create a new stock for this store
                                        returningStoreStock = new PHRMStoreStockModel(
                                            stockMaster: stock.StockMaster,
                                            storeId: returnedItem.StoreId,
                                            quantity: remainingReturnedQuantity ?? 0
                                            );
                                        phrmdbcontext.StoreStocks.Add(returningStoreStock);
                                        phrmdbcontext.SaveChanges();
                                    }
                                    // create new txn for this store
                                    newStockTxn = new PHRMStockTransactionModel(
                                                        stock: returningStoreStock,
                                                        transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                        transactionDate: currentDate,
                                                        referenceNo: returnedItem.InvoiceReturnItemId,
                                                        createdBy: currentUser.EmployeeId,
                                                        createdOn: currentDate,
                                                        fiscalYearId: currFiscalYear.FiscalYearId
                                                        );
                                }
                                newStockTxn.SetInOutQuantity(inQty: remainingReturnedQuantity ?? 0, outQty: 0);
                                remainingReturnedQuantity = 0;
                            }
                            //add txn to dispensary stock txn and then check if fifo is completed.
                            phrmdbcontext.StockTransactions.Add(newStockTxn);
                            phrmdbcontext.SaveChanges();

                            if (remainingReturnedQuantity == 0)
                            {
                                break;
                            }
                        }
                        phrmdbcontext.SaveChanges();
                    });

                    //UPDATE INSURANCE BALANCE FOR THAT PARTICULAR PATIENT IF RETURNED FROM INSURANCE
                    if (ClientData.ClaimCode != null)
                    {
                        InsuranceModel insurance = phrmdbcontext.PatientInsurances.Where(ins => ins.PatientId == ClientData.PatientId).FirstOrDefault();
                        if (insurance == null) throw new Exception("Unable to update Insurance Balance. Detail: Insurance object is null.");

                        insurance.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance + Convert.ToDouble(ClientData.TotalAmount);
                        insurance.ModifiedOn = ClientData.CreatedOn;
                        insurance.ModifiedBy = ClientData.CreatedBy;

                        PHRMPatient patient = phrmdbcontext.PHRMPatient.Where(p => p.PatientId == ClientData.PatientId).FirstOrDefault();
                        if (patient == null) throw new Exception("Patient data not found");

                        patient.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance;

                        phrmdbcontext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        public async static Task ManualReturnTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext db, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currFiscalYear = GetFiscalYear(db);

                    int maxCreditNoteId = (int)await db.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Select(a => a.CreditNoteId).DefaultIfEmpty(0).MaxAsync();
                    int maxCreditNoteNum = (int)await db.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Select(a => a.CreditNoteNumber).DefaultIfEmpty(0).MaxAsync();

                    ClientData.FiscalYearId = currFiscalYear.FiscalYearId;
                    ClientData.CreditNoteId = maxCreditNoteId + 1;
                    ClientData.CreatedOn = currentDate;
                    ClientData.CreatedBy = currentUser.EmployeeId;

                    foreach (var returnedItem in ClientData.InvoiceReturnItems)
                    {
                        //register returned items in the table
                        returnedItem.CreatedOn = currentDate;
                        returnedItem.CreatedBy = currentUser.EmployeeId;
                        returnedItem.FiscalYearId = currFiscalYear.FiscalYearId;
                        returnedItem.CreditNoteNumber = maxCreditNoteNum + 1;
                    }

                    db.PHRMInvoiceReturnModel.Add(ClientData);
                    db.SaveChanges();

                    foreach (var returnedItem in ClientData.InvoiceReturnItems)
                    {
                        // Find if stock with returned item batchno, expiry and mrp is available in main store
                        PHRMStockMaster masterStock = await db.StockMasters.Where(a => a.ItemId == returnedItem.ItemId && a.IsActive == true && a.BatchNo == returnedItem.BatchNo && a.ExpiryDate == returnedItem.ExpiryDate && a.MRP == returnedItem.MRP).FirstOrDefaultAsync();

                        // If available, add new stock with stockId found in master stock, else add new master stock in both main store and dispensary stock table
                        if (masterStock == null)
                        {
                            masterStock = new PHRMStockMaster(
                                itemId: returnedItem.ItemId,
                                batchNo: returnedItem.BatchNo,
                                expiryDate: returnedItem.ExpiryDate,
                                costPrice: 0, // must be corrected later
                                mRP: returnedItem.MRP,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDate);

                            // add the new barcode id
                            var barcodeService = new PharmacyStockBarcodeService(db);
                            masterStock.UpdateBarcodeId(barcodeService.AddStockBarcode(
                               stock: masterStock,
                               createdBy: currentUser.EmployeeId
                                ));

                            db.StockMasters.Add(masterStock);
                            await db.SaveChangesAsync();
                        }

                        //add to dispensary stock
                        var newDispensaryStock = new PHRMStoreStockModel(
                            stockMaster: masterStock,
                            storeId: returnedItem.StoreId,
                            quantity: returnedItem.ReturnedQty
                            );
                        db.StoreStocks.Add(newDispensaryStock);
                        await db.SaveChangesAsync();

                        //add to dispensary stock transaction
                        var newDispensaryStockTxn = new PHRMStockTransactionModel(
                            stock: newDispensaryStock,
                            transactionType: ENUM_PHRM_StockTransactionType.ManualSaleReturnedItem,
                            transactionDate: currentDate,
                            referenceNo: returnedItem.InvoiceReturnItemId,
                            createdBy: currentUser.EmployeeId,
                            createdOn: currentDate,
                            fiscalYearId: currFiscalYear.FiscalYearId
                            );
                        newDispensaryStockTxn.SetInOutQuantity(inQty: returnedItem.ReturnedQty, outQty: 0);
                        db.StockTransactions.Add(newDispensaryStockTxn);
                        await db.SaveChangesAsync();
                    }

                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        #region Update PO and POItems Status
        public static Boolean UpdatePOandPOItemsStatus(PharmacyDbContext phrmdbcontext, PHRMGoodsReceiptViewModel grViewModelData)
        {

            try
            {
                var poid = grViewModelData.purchaseOrder.PurchaseOrderId;

                foreach (var POItems in grViewModelData.purchaseOrder.PHRMPurchaseOrderItems)
                {

                    if (POItems.ReceivedQuantity > 0 && POItems.PendingQuantity == 0)
                    {
                        POItems.POItemStatus = "complete";
                    }
                    else
                    {
                        POItems.POItemStatus = "partial";
                    }
                }


                if (poid != 0 && poid > 0 && grViewModelData.purchaseOrder != null)
                {

                    grViewModelData.purchaseOrder.POStatus = "partial";
                    phrmdbcontext.UpdateGraph(grViewModelData.purchaseOrder, map => map.OwnedCollection(a => a.PHRMPurchaseOrderItems));

                    int i = phrmdbcontext.SaveChanges();

                    if (phrmdbcontext.PHRMPurchaseOrderItems.AsNoTracking().Where(a => a.PurchaseOrderId == poid).All(a => a.POItemStatus == "complete" || a.POItemStatus == "cancelled"))
                    {
                        grViewModelData.purchaseOrder.POStatus = "complete";
                        phrmdbcontext.UpdateGraph(grViewModelData.purchaseOrder, map => map.OwnedCollection(a => a.PHRMPurchaseOrderItems));
                        i = phrmdbcontext.SaveChanges();
                    }
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add Store Stock Transaction Items By Passing Reference ID
        public static Boolean AddStoreStockTransactionItems(PharmacyDbContext phrmdbcontext, List<PHRMStockTransactionModel> phrmStockTxnItems)
        {
            try
            {
                var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                for (int i = 0; i < phrmStockTxnItems.Count; i++)
                {
                    //phrmStockTxnItems[i].FiscalYearId = currentFiscalYearId;
                    //phrmStockTxnItems[i].CreatedOn = DateTime.Now;
                    //phrmdbcontext.StockTransactions.Add(phrmStockTxnItems[i]);
                }

                int j = phrmdbcontext.SaveChanges();
                return (j > 0) ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add Stock Transaction Items By Passing Reference ID
        public static Boolean AddStockTransactionItems(PharmacyDbContext phrmdbcontext, List<PHRMStockTransactionModel> phrmStockTxnItems)
        {
            try
            {
                for (int i = 0; i < phrmStockTxnItems.Count; i++)
                {
                    //phrmStockTxnItems[i].CreatedOn = DateTime.Now;
                    phrmdbcontext.StockTransactions.Add(phrmStockTxnItems[i]);
                }

                int j = phrmdbcontext.SaveChanges();
                return (j > 0) ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Add Stock Transaction Items By Passing Reference ID
        public static Boolean AddStoreTransactionItems(PharmacyDbContext phrmdbcontext, PHRMStockTransactionModel phrmStoreTxnItems)
        {
            try
            {
                //phrmStoreTxnItems.CreatedOn = DateTime.Now;
                phrmdbcontext.StockTransactions.Add(phrmStoreTxnItems);

                int j = phrmdbcontext.SaveChanges();
                return (j > 0) ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region
        public static Boolean AddWardStockItems(PharmacyDbContext phrmdbcontext, List<WARDStockModel> wardStockTxnItems, List<WARDTransactionModel> wardStockTXN)
        {
            try
            {
                for (int i = 0; i < wardStockTxnItems.Count; i++)
                {
                    WARDStockModel stockToAdd = wardStockTxnItems[i];
                    var exisitingStock = phrmdbcontext.WardStock.Where(a => a.StoreId == stockToAdd.StoreId && a.ItemId == stockToAdd.ItemId && a.BatchNo == stockToAdd.BatchNo && a.ExpiryDate == stockToAdd.ExpiryDate && a.MRP == stockToAdd.MRP).FirstOrDefault();
                    if (exisitingStock != null)
                    {
                        phrmdbcontext.WardStock.Attach(exisitingStock);
                        exisitingStock.AvailableQuantity += stockToAdd.AvailableQuantity;
                        phrmdbcontext.Entry(exisitingStock).State = EntityState.Modified;
                        phrmdbcontext.Entry(exisitingStock).Property(x => x.AvailableQuantity).IsModified = true;
                        phrmdbcontext.SaveChanges();
                        wardStockTxnItems[i].StockId = exisitingStock.StockId;
                    }
                    else
                    {
                        phrmdbcontext.WardStock.Add(wardStockTxnItems[i]);
                        phrmdbcontext.SaveChanges();
                    }
                    wardStockTXN[i].StockId = wardStockTxnItems[i].StockId;
                    phrmdbcontext.WardTransactionModel.Add(wardStockTXN[i]);

                }

                int j = phrmdbcontext.SaveChanges();
                return (j > 0) ? true : false;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Get Stock Item details By ItemId
        public static PHRMStoreStockModel GetStockItemsByItemId(int itemId, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                PHRMStoreStockModel stockItems = (from stock in phrmdbcontext.StoreStocks
                                                  where stock.ItemId == itemId
                                                  select stock).FirstOrDefault();
                return stockItems;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Save Ward Requisition Items details to database        
        public static Boolean SaveWardRequisitionItems(WARDDispatchModel wardDispatchedItems, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            try
            {
                //if (wardDispatchedItems != null && wardDispatchedItems.WardDispatchedItemsList != null)
                //{
                //    List<int> ItemId = new List<int>();
                //    Boolean RequisitionFulfilled = true; //to check whether the request is fulfilled or not
                //    var countCompare = phrmdbcontext.WardRequisitionItem.Where(a => a.RequisitionId == wardDispatchedItems.RequisitionId && a.DispatchedQty < a.Quantity).ToList().Count;
                //    if (countCompare > wardDispatchedItems.WardDispatchedItemsList.Count)
                //    {
                //        RequisitionFulfilled = false;
                //    }
                //    wardDispatchedItems.CreatedOn = DateTime.Now;
                //    wardDispatchedItems.CreatedBy = currentUser.EmployeeId;
                //    wardDispatchedItems.RequisitionId = wardDispatchedItems.RequisitionId;
                //    phrmdbcontext.WardDisapatch.Add(wardDispatchedItems);
                //    phrmdbcontext.SaveChanges();
                //    wardDispatchedItems.WardDispatchedItemsList.ForEach(item =>
                //    {
                //        item.DispatchId = wardDispatchedItems.DispatchId;
                //        item.SubTotal = item.Quantity * (Convert.ToDecimal(item.MRP));
                //        item.CreatedOn = DateTime.Now;
                //        item.CreatedBy = currentUser.EmployeeId;
                //        phrmdbcontext.WardDispatchItems.Add(item);

                //        //decrement from store
                //        var StoreStock = phrmdbcontext.StockTransactions.Where(a => a.IsActive == true && a.ItemId == item.ItemId && a.BatchNo == item.BatchNo && a.ExpiryDate == item.ExpiryDate).
                //        GroupBy(a => new { a.ItemId, a.ExpiryDate, a.BatchNo }).Select(a => new
                //        {
                //            InQuantity = a.Where(w => w.InOut == "in").Sum(s => s.Quantity),
                //            OutQuantity = a.Where(w => w.InOut == "out").Sum(s => s.Quantity),
                //        }).Select(a => new
                //        {
                //            Quantity = a.InQuantity - a.OutQuantity
                //        }).FirstOrDefault();
                //        if (StoreStock.Quantity < item.Quantity)
                //        {
                //            Exception ex = new Exception("Quantity has been changed.");
                //            throw ex;
                //        }
                //        var UpdatedStock = phrmdbcontext.StockTransactions.Where(a => a.IsActive == true && a.ItemId == item.ItemId && a.BatchNo == item.BatchNo && a.ExpiryDate == item.ExpiryDate).FirstOrDefault();
                //        UpdatedStock.InOut = "out";
                //        UpdatedStock.Quantity = item.Quantity;
                //        UpdatedStock.ReferenceNo = item.DispatchId;
                //        UpdatedStock.CreatedBy = currentUser.EmployeeId;
                //        UpdatedStock.CreatedOn = DateTime.Now;
                //        UpdatedStock.TransactionType = "Substore Dispatch";
                //        item.Price = UpdatedStock.CostPrice;
                //        phrmdbcontext.StockTransactions.Add(UpdatedStock);
                //        phrmdbcontext.SaveChanges();
                //        //update requisition item table
                //        var requisitionItem = phrmdbcontext.WardRequisitionItem.Where(a => a.RequisitionItemId == item.RequisitionItemId).FirstOrDefault();
                //        requisitionItem.DispatchedQty += item.Quantity;
                //        if (requisitionItem.DispatchedQty < requisitionItem.Quantity)
                //        {
                //            RequisitionFulfilled = false;
                //        }

                //    });
                //    decimal total = wardDispatchedItems.WardDispatchedItemsList.Where(a => a.DispatchId == wardDispatchedItems.DispatchId).Sum(item => item.SubTotal);
                //    wardDispatchedItems.SubTotal = total;
                //    int i = phrmdbcontext.SaveChanges();

                //    if (wardDispatchedItems.RequisitionId > 0)
                //    {
                //        string RequistionItemIdList = string.Join(",", ItemId);
                //        WARDRequisitionModel phrmwardRequisition = phrmdbcontext.WardRequisition.Find(wardDispatchedItems.RequisitionId);
                //        phrmwardRequisition.ReferenceId = RequistionItemIdList;
                //        if (RequisitionFulfilled)
                //        {
                //            phrmwardRequisition.Status = "complete";
                //        }
                //        else
                //        {
                //            phrmwardRequisition.Status = "partial";
                //        }
                //        phrmdbcontext.WardRequisition.Attach(phrmwardRequisition);
                //        phrmdbcontext.Entry(phrmwardRequisition).State = EntityState.Modified;
                //        phrmdbcontext.Entry(phrmwardRequisition).Property(x => x.Status).IsModified = true;
                //        phrmdbcontext.Entry(phrmwardRequisition).Property(x => x.ReferenceId).IsModified = true;
                //    }


                //    return (i > 0) ? true : false;
                //}
                //else
                //{
                //    return false;
                //}
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return false; //delete later
        }
        #endregion

        public static Boolean SaveProvisionInvoiceItems(List<PHRMDrugsRequistionItemsModel> provisionalItem, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            try
            {
                if (provisionalItem != null)
                {

                    for (int i = 0; i < provisionalItem.Count; i++)
                    {

                        var item = new PHRMInvoiceTransactionItemsModel();
                        item.InvoiceId = null;
                        item.BilItemStatus = "provisional";
                        item.PatientId = provisionalItem[i].PatientId;
                        item.ItemId = provisionalItem[i].ItemId;
                        item.ItemName = provisionalItem[i].ItemName;
                        item.BatchNo = provisionalItem[i].BatchNo;
                        item.Quantity = provisionalItem[i].Quantity;
                        item.Price = provisionalItem[i].Price;
                        item.MRP = provisionalItem[i].MRP;
                        item.CreatedOn = DateTime.Now;
                        item.CreatedBy = currentUser.EmployeeId;

                        phrmdbcontext.PHRMInvoiceTransactionItems.Add(item);

                    }

                    int j = phrmdbcontext.SaveChanges();
                    return (j > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        #region Update List of  Goods ReceiptItems Available Quantity -when sale is done, ...
        public static Boolean UpdateGoodsRecieptItemsAvailableQuantity(List<PHRMGoodsReceiptItemsModel> goodsReceiptItems, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                if (goodsReceiptItems != null)
                {
                    goodsReceiptItems.ForEach(grItm =>
                    {

                        phrmdbcontext.PHRMGoodsReceiptItems.Attach(grItm);
                        phrmdbcontext.Entry(grItm).State = EntityState.Modified;
                        phrmdbcontext.Entry(grItm).Property(x => x.AvailableQuantity).IsModified = true;

                        //////Note : For Invoice(Sale) Nagesh Sir is Passing All Items of GRItemModel So we Require IsModified true on AvailableQuantity only
                        ///Note: For Return To Supplier I am Passing only Available Quantity of GRItsmModel and all other property is Null so that Here we require to make IsModified false on all other property
                        phrmdbcontext.Entry(grItm).Property(x => x.ExpiryDate).IsModified = false;
                        //  phrmdbcontext.Entry(grItm).Property(x => x.ManufactureDate).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.BatchNo).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.CompanyName).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.DiscountPercentage).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.FreeQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.GoodReceiptId).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.GRItemPrice).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ItemId).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ItemName).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.MRP).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ReceivedQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.RejectedQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SellingPrice).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SubTotal).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SupplierName).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.TotalAmount).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.UOMName).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.VATPercentage).IsModified = false;

                    });
                    int i = phrmdbcontext.SaveChanges();
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
        #region Save Return from customer invoice items to db
        public static Boolean SaveReturnInvoiceItems(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            var currFiscalYear = GetFiscalYear(phrmdbcontext);
            int? maxCreditNoteId = phrmdbcontext.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteId);
            if (maxCreditNoteId == null || !maxCreditNoteId.HasValue)
            {
                maxCreditNoteId = 0;
            }

            int? maxCreditNoteNum = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteNumber);
            if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
            {
                maxCreditNoteNum = 0;
            }

            try
            {
                List<PHRMInvoiceReturnItemsModel> returnInvClientData = ClientData.InvoiceReturnItems;
                if (returnInvClientData.Count > 0 && ClientData != null)
                {
                    returnInvClientData.ForEach(invItm =>
                    {
                        invItm.CreatedOn = System.DateTime.Now;
                        invItm.CreatedBy = currentUser.EmployeeId;
                        invItm.FiscalYearId = currFiscalYear.FiscalYearId;
                        invItm.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                        // phrmdbcontext.PHRMInvoiceReturnItemsModel.Add(invItm);

                    });
                    ClientData.CreatedOn = System.DateTime.Now;
                    ClientData.CreatedBy = currentUser.EmployeeId;
                    int invid = (from txn in phrmdbcontext.PHRMInvoiceTransaction
                                 where txn.InvoicePrintId == ClientData.InvoiceId
                                 select txn.InvoiceId).DefaultIfEmpty(0).Max();
                    if (invid == 0)
                    {
                        ClientData.InvoiceId = null;
                    }
                    else
                    {
                        ClientData.InvoiceId = invid;
                    }
                    ClientData.FiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    ClientData.CreditNoteId = (int?)(maxCreditNoteId + 1);
                    phrmdbcontext.PHRMInvoiceReturnModel.Add(ClientData);
                    int i = phrmdbcontext.SaveChanges();
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update Invoice IsReturn status after return from customer

        private static Boolean UpdateInvoiceReturnStatus(int? invoiceId, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                if (invoiceId > 0)
                {
                    var res = (from inv in phrmdbcontext.PHRMInvoiceTransaction
                               where inv.InvoiceId == invoiceId
                               select inv).FirstOrDefault();
                    int i = 0;
                    if (res != null)
                    {
                        res.IsReturn = true;

                        phrmdbcontext.PHRMInvoiceTransaction.Attach(res);
                        phrmdbcontext.Entry(res).Property(x => x.IsReturn).IsModified = true;

                        i = phrmdbcontext.SaveChanges();

                    }
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update Prescription Items Order Status
        public static Boolean UpdatePrescriptionItems(List<PHRMPrescriptionItemModel> presItems, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                if (presItems != null)
                {
                    presItems.ForEach(itm =>
                    {
                        itm.OrderStatus = "final";
                        phrmdbcontext.PHRMPrescriptionItems.Attach(itm);
                        // phrmdbcontext.Entry(grItm).State = EntityState.Modified;                       
                        phrmdbcontext.Entry(itm).Property(x => x.OrderStatus).IsModified = true;
                    });
                    int i = phrmdbcontext.SaveChanges();
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion

        #region Method for check all flag from flaglist
        public static Boolean CheckFlagList(List<Boolean> flagList)
        {
            try
            {
                Boolean flag = true;
                if (flagList.Count <= 0)
                {
                    return false;
                }
                for (int i = 0; i < flagList.Count; i++)
                {
                    if (flagList[i] == false)
                    {
                        flag = false;
                        break;
                    }
                }
                return (flag == true) ? true : false;

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion

        #region POST Po with POItems, send PO with POItems and db context
        internal static bool PostPOWithPOItems(PHRMPurchaseOrderModel poFromClient, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                poFromClient.PHRMPurchaseOrderItems.ForEach(item =>
                {
                    item.CreatedOn = DateTime.Now;
                    item.AuthorizedOn = DateTime.Now;
                    item.PendingQuantity = item.Quantity;
                });
                poFromClient.CreatedOn = DateTime.Now;
                poFromClient.PODate = DateTime.Now;
                poFromClient.FiscalYearId = PharmacyBL.GetFiscalYear(phrmdbcontext).FiscalYearId;
                poFromClient.PurchaseOrderNo = PharmacyBL.GetPurchaseOrderNo(phrmdbcontext, poFromClient.FiscalYearId);
                phrmdbcontext.PHRMPurchaseOrder.Add(poFromClient);
                phrmdbcontext.SaveChanges();
                int i = phrmdbcontext.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        public static void CancelGoodsReceipt(PharmacyDbContext phrmdbcontext, int goodReceiptId, RbacUser currentUser, string cancelRemarks)
        {
            using (var dbResource = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

                    //Find all the items of that goods receipt table
                    var grItems = phrmdbcontext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == goodReceiptId && a.IsCancel == false).ToList();

                    //Perform a loop for each item for cancellation
                    foreach (var grItem in grItems)
                    {

                        grItem.AvailableQuantity = grItem.ReceivedQuantity + grItem.FreeQuantity;

                        //find Store Stock for the particular Gr items;
                        var storeStock = phrmdbcontext.StoreStocks.Include(a => a.StockMaster).Where(s => s.StoreStockId == grItem.StoreStockId).FirstOrDefault();

                        //If stock is unavailabe, throw exception
                        if (grItem.AvailableQuantity != storeStock.AvailableQuantity) throw new Exception($"The quantity of the stock has been modified for Item = {grItem.ItemName}, Batch = {grItem.BatchNo}.");

                        //If stock is available, proceed cancel

                        //Update the stock quantity to 0
                        storeStock.UpdateAvailableQuantity(0);

                        //Add transaction data in stock transaction table
                        var stockTxn = new PHRMStockTransactionModel(
                             stock: storeStock,
                             transactionType: ENUM_PHRM_StockTransactionType.CancelledGR,
                             transactionDate: currentDate,
                             referenceNo: grItem.GoodReceiptItemId,
                             createdBy: currentUser.EmployeeId,
                             createdOn: currentDate,
                             fiscalYearId: currentFiscalYearId);
                        stockTxn.SetInOutQuantity(inQty: 0, outQty: grItem.AvailableQuantity);
                        phrmdbcontext.StockTransactions.Add(stockTxn);

                        //Update the cancel status in good receipt item table.
                        grItem.IsCancel = true;
                        phrmdbcontext.SaveChanges();
                    }
                    //Find the good receipt in db and change the status to cancel
                    var gr = phrmdbcontext.PHRMGoodsReceipt.Find(goodReceiptId);
                    gr.IsCancel = true;
                    gr.CancelBy = currentUser.EmployeeId;
                    gr.CancelOn = currentDate;
                    gr.CancelRemarks = cancelRemarks;
                    phrmdbcontext.SaveChanges();

                    dbResource.Commit();
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
        }


        public static void SyncPHRMBillInvoiceToRemoteServer(object billToPost, string billType, PharmacyDbContext dbContext)
        {
            IRDLogModel irdLog = new IRDLogModel();
            if (billType == "phrm-invoice")
            {

                string responseMsg = null;
                PHRMInvoiceTransactionModel invoiceTxn = (PHRMInvoiceTransactionModel)billToPost;
                try
                {
                    invoiceTxn.PANNumber = GetPANNumber(dbContext, invoiceTxn.PatientId);
                    invoiceTxn.ShortName = GetShortName(dbContext, invoiceTxn.PatientId);
                    invoiceTxn.FiscalYear = GetFiscalYearNameById(dbContext, invoiceTxn.FiscalYearId);
                    IRD_PHRMBillSaleViewModel invoicebill = IRD_PHRMBillSaleViewModel.GetMappedInvoiceForIRD(invoiceTxn, true);
                    irdLog.JsonData = JsonConvert.SerializeObject(invoicebill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceToIRD(invoicebill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PHRMInvoiceTransaction.Attach(invoiceTxn);
                if (responseMsg == "200")
                {
                    invoiceTxn.IsRealtime = true;
                    invoiceTxn.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    invoiceTxn.IsRealtime = false;
                    invoiceTxn.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(invoiceTxn).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(invoiceTxn).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();

                irdLog.BillType = billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
            else if (billType == "phrm-invoice-return")
            {
                PHRMInvoiceTransactionModel invoiceRet = (PHRMInvoiceTransactionModel)billToPost;

                string responseMsg = null;
                try
                {
                    invoiceRet.PANNumber = GetPANNumber(dbContext, invoiceRet.PatientId);
                    invoiceRet.ShortName = GetShortName(dbContext, invoiceRet.PatientId);
                    invoiceRet.FiscalYear = GetFiscalYearNameById(dbContext, invoiceRet.FiscalYearId);
                    IRD_PHRMBillSaleReturnViewModel salesRetBill = IRD_PHRMBillSaleReturnViewModel.GetMappedPhrmSalesReturnBillForIRD(invoiceRet, true);
                    salesRetBill.credit_note_number = GetCreditNoteNumberByInvoiceId(dbContext, invoiceRet.InvoiceId).ToString();
                    irdLog.JsonData = JsonConvert.SerializeObject(salesRetBill);
                    responseMsg = DanpheEMR.Sync.IRDNepal.APIs.PostPhrmInvoiceReturnToIRD(salesRetBill);
                }
                catch (Exception ex)
                {
                    responseMsg = "0";
                    irdLog.ErrorMessage = GetInnerMostException(ex);
                    irdLog.Status = "failed";
                }

                dbContext.PHRMInvoiceTransaction.Attach(invoiceRet);
                if (responseMsg == "200")
                {

                    invoiceRet.IsRealtime = true;
                    invoiceRet.IsRemoteSynced = true;
                    irdLog.Status = "success";
                }
                else
                {
                    invoiceRet.IsRealtime = false;
                    invoiceRet.IsRemoteSynced = false;
                    irdLog.Status = "failed";
                }

                dbContext.Entry(invoiceRet).Property(x => x.IsRealtime).IsModified = true;
                dbContext.Entry(invoiceRet).Property(x => x.IsRemoteSynced).IsModified = true;
                dbContext.SaveChanges();
                irdLog.BillType = billType;
                irdLog.ResponseMessage = responseMsg;
                PostIRDLog(irdLog, dbContext);
            }
        }

        public static string GetInnerMostException(Exception ex)
        {
            Exception currentEx = ex;
            while (currentEx.InnerException != null)
            {
                currentEx = currentEx.InnerException;
            }
            return currentEx.Message;
        }

        public static void PostIRDLog(IRDLogModel irdLogdata, PharmacyDbContext dbContext)
        {
            try
            {
                irdLogdata.CreatedOn = DateTime.Now;

                string url_IRDNepal = ConfigurationManager.AppSettings["url_IRDNepal"];
                switch (irdLogdata.BillType)
                {
                    case "phrm-invoice":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }
                    case "phrm-invoice-return":
                        {
                            string api_SalesIRDNepal = ConfigurationManager.AppSettings["api_SalesReturnIRDNepal"];
                            irdLogdata.UrlInfo = url_IRDNepal + "/" + api_SalesIRDNepal;
                            break;
                        }

                }
                dbContext.IRDLog.Add(irdLogdata);
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {

            }
        }


        //public static BillingFiscalYear GetFiscalYear(PharmacyDbContext phrmDbContext)
        //{            
        //    DateTime currentDate = DateTime.Now.Date;
        //    return phrmDbContext.BillingFiscalYear.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();

        //}
        public static string GetFiscalYearNameById(PharmacyDbContext phrmDbContext, int? fiscalYearId)
        {
            return phrmDbContext.PharmacyFiscalYears.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearName;
        }

        private static string GetPANNumber(PharmacyDbContext dbContext, int? PatientId)
        {
            try
            {
                return dbContext.PHRMPatient.Where(s => s.PatientId == PatientId).FirstOrDefault().PANNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static string GetShortName(PharmacyDbContext dbContext, int? PatientId)
        {
            try
            {
                var pat = dbContext.PHRMPatient.Where(s => s.PatientId == PatientId).FirstOrDefault();
                return pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private static int GetCreditNoteNumberByInvoiceId(PharmacyDbContext dbContext, int? InvoiceId)
        {
            try
            {
                return (int)dbContext.PHRMInvoiceReturnItemsModel.Where(s => s.InvoiceId == InvoiceId).FirstOrDefault().CreditNoteNumber;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static string GetStoreRackNameByItemId(int itemId, PharmacyDbContext db)
        {
            var rackId = db.PHRMItemMaster.Where(item => item.ItemId == itemId).Select(item => item.StoreRackId).FirstOrDefault();
            return db.PHRMRack.Where(rack => rack.RackId == rackId).Select(rack => rack.Name).FirstOrDefault() ?? "N/A";
        }
        #region Add or update dispensary Stock List in PHRM_DispensaryStock table
        /// <summary>
        /// Add or Update Dispensary Stock Based On ItemId,Batch,ExpiryDate,MRP,Price,StockId.
        /// </summary>
        /// <param name="phrmdbcontext"> Db Context to be used.</param>
        /// <param name="Stock">Stock Model to be updated.</param>
        /// <param name="matchStockId">default is true, bypasses stockId if false.</param>
        /// <returns></returns>
        /// 
        public static Boolean AddUpdateDispensaryStock(PharmacyDbContext phrmdbcontext, List<PHRMStoreStockModel> Stock, bool? matchStockId = true)
        {
            try
            {
                if (Stock.Count > 0)
                {
                    foreach (var stkItm in Stock)
                    {
                        var rec = (from ss in phrmdbcontext.StoreStocks
                                   where (ss.StockId == stkItm.StockId || matchStockId == false)
                                   select ss).FirstOrDefault();

                        if (rec != null)
                        {
                            if (rec.AvailableQuantity < stkItm.AvailableQuantity)
                            {
                                var ex = new Exception("Quantity is not available");
                                throw ex;
                            }

                            phrmdbcontext.Entry(rec).State = EntityState.Modified;
                            phrmdbcontext.Entry(rec).Property(x => x.AvailableQuantity).IsModified = true;
                        }
                        else
                        {
                            phrmdbcontext.StoreStocks.Add(stkItm);
                        }
                    }

                    int i = phrmdbcontext.SaveChanges();
                    return (i > 0) ? true : false;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        //validate whether stock is available 
        public static bool SalesValidation(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext)
        {
            var invoiceItems = invoiceDataFromClient.InvoiceItems;

            bool isStockAvailable = true;
            PHRMInvoiceTransactionModel testmodel = new PHRMInvoiceTransactionModel();
            //var totalItem = phrmdbcontext.DispensaryStocks.ToList();
            //foreach (var totItm in totalItem)
            //{
            //    foreach (var invItm in invoiceItems)
            //    {
            //        if (totItm.StockId == invItm.StockId && totItm.AvailableQuantity < invItm.Quantity)
            //        {
            //            isStockAvailable = false;
            //        }
            //    }

            //}
            return isStockAvailable;
        }
        #region UPDATE MRP IN MAIN STORE

        public static async Task<PHRMUpdatedStockVM> UpdateMRPForAllStock(PHRMUpdatedStockVM mrpUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var masterStocks = await db.StockMasters.Where(SS => SS.ItemId == mrpUpdatedStock.ItemId && SS.ExpiryDate == mrpUpdatedStock.ExpiryDate && SS.BatchNo == mrpUpdatedStock.BatchNo && SS.MRP == mrpUpdatedStock.OldMRP && SS.CostPrice == mrpUpdatedStock.CostPrice).ToListAsync();

                    if (masterStocks == null) throw new Exception("Stock Not Found");
                    foreach (var stock in masterStocks)
                    {
                        //Update mrp of master stock
                        stock.UpdateMRP(mrpUpdatedStock.MRP, currentUser.EmployeeId);


                        //Update history table for old mrp end-date
                        var oldStockMRPHistory = await db.MRPHistories.FirstOrDefaultAsync(s => s.StockId == stock.StockId && s.EndDate == null);
                        if (oldStockMRPHistory != null)
                        {
                            oldStockMRPHistory.EndDate = currentDate;
                        }
                        //Create New History for new MRP
                        var newStockMRPHistory = new PHRMMRPHistoryModel()
                        {
                            StockId = stock.StockId.Value,
                            MRP = mrpUpdatedStock.MRP,
                            CreatedBy = currentUser.EmployeeId,
                            StartDate = currentDate,
                        };
                        db.MRPHistories.Add(newStockMRPHistory);
                        await db.SaveChangesAsync();
                    }
                    dbTransaction.Commit();
                }
                catch (Exception)
                {
                    dbTransaction.Rollback();
                    throw;
                }
            }
            return mrpUpdatedStock;
        }
        #endregion
        #region  UPDATE EXPIRY DATE AND BATCHNO IN STORE
        public static async Task<PHRMUpdatedStockVM> UpdateStockExpiryDateandBatchNoForAllStock(PHRMUpdatedStockVM expbatchUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var stockMasters = await db.StockMasters.Where(SS => SS.ItemId == expbatchUpdatedStock.ItemId && SS.ExpiryDate == expbatchUpdatedStock.OldExpiryDate && SS.BatchNo == expbatchUpdatedStock.OldBatchNo && SS.MRP == expbatchUpdatedStock.MRP && SS.CostPrice == expbatchUpdatedStock.CostPrice).ToListAsync();

                    if (stockMasters == null) throw new Exception("Stock Not Found");
                    foreach (var stock in stockMasters)
                    {
                        //Update batch and expiry of master stock
                        stock.UpdateBatch(expbatchUpdatedStock.BatchNo, currentUser.EmployeeId);
                        stock.UpdateExpiry(expbatchUpdatedStock.ExpiryDate, currentUser.EmployeeId);



                        //Update history table for old batch and expiry end-date
                        var oldStockBatchAndExpiryHistory = await db.ExpiryDateBatchNoHistories.FirstOrDefaultAsync(s => s.StockId == stock.StockId && s.EndDate == null);
                        if (oldStockBatchAndExpiryHistory != null)
                        {
                            oldStockBatchAndExpiryHistory.EndDate = currentDate;
                        }
                        //Create New History for new Batch and Epxiry
                        var newStockBatchAndExpiryHistory = new PHRMExpiryDateBatchNoHistoryModel()
                        {
                            StockId = stock.StockId.Value,
                            BatchNo = expbatchUpdatedStock.BatchNo,
                            ExpiryDate = expbatchUpdatedStock.ExpiryDate,
                            CreatedBy = currentUser.EmployeeId,
                            StartDate = currentDate
                        };
                        db.ExpiryDateBatchNoHistories.Add(newStockBatchAndExpiryHistory);
                        await db.SaveChangesAsync();
                    }
                    dbTransaction.Commit();
                }
                catch (Exception)
                {
                    dbTransaction.Rollback();
                    throw;
                }
            }
            return expbatchUpdatedStock;
        }
        #endregion

        public static async Task<int> DirectDispatch(List<PHRMDispatchItemsModel> dispatchedItems, PharmacyDbContext db, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDateTime = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;
                    var mainStoreCategory = ENUM_StoreCategory.Store;
                    var mainStoreId = db.PHRMStore.Where(s => s.Name == "Main Store" && s.Category == mainStoreCategory).Select(s => s.StoreId).FirstOrDefault();
                    //create requisition number by max+1 logic
                    var newRequisitionNo = (from R in db.StoreRequisition where R.FiscalYearId == currentFiscalYearId select R.RequisitionNo).DefaultIfEmpty(0).Max() + 1;
                    //Create Requisition and Requisition item Based on Dispatch Items
                    var requisition = new PHRMStoreRequisitionModel()
                    {
                        RequisitionNo = newRequisitionNo,
                        CreatedBy = currentUser.EmployeeId,
                        CreatedOn = currentDateTime,
                        StoreId = dispatchedItems[0].TargetStoreId,
                        RequisitionDate = currentDateTime,
                        RequisitionStatus = "complete",
                        FiscalYearId = currentFiscalYearId,
                        RequisitionItems = dispatchedItems.Select(di => new PHRMStoreRequisitionItemsModel
                        {
                            AuthorizedBy = currentUser.EmployeeId,
                            AuthorizedOn = currentDateTime,
                            CreatedBy = currentUser.EmployeeId,
                            CreatedOn = currentDateTime,
                            ItemId = di.ItemId,
                            PendingQuantity = 0,
                            Quantity = di.DispatchedQuantity,
                            ReceivedQuantity = di.DispatchedQuantity,
                            RequisitionItemStatus = "complete",
                            Remark = "Autogenerated by Direct Dispatch"
                        }).ToList()
                    };
                    db.StoreRequisition.Add(requisition);
                    await db.SaveChangesAsync();
                    requisition.RequisitionItems.ForEach(item => item.RequisitionId = requisition.RequisitionId);
                    await db.SaveChangesAsync();

                    //Add data in store dispatchItem table
                    int dispatchId = (from D in db.StoreDispatchItems
                                      select D.DispatchId).DefaultIfEmpty(0).Max() ?? 0;
                    dispatchId++;

                    for (int i = 0; i < dispatchedItems.Count(); i++)
                    {
                        dispatchedItems[i].SourceStoreId = mainStoreId;
                        dispatchedItems[i].CreatedBy = currentUser.EmployeeId;
                        dispatchedItems[i].CreatedOn = currentDateTime;
                        dispatchedItems[i].DispatchId = dispatchId;
                        dispatchedItems[i].RequisitionId = requisition.RequisitionId;
                        dispatchedItems[i].RequisitionItemId = requisition.RequisitionItems[i].RequisitionItemId;
                        db.StoreDispatchItems.Add(dispatchedItems[i]);
                    }
                    //Save Dispatch Items
                    await db.SaveChangesAsync();

                    //Find the stock to be decreased for each dispatched item
                    foreach (var dispatchItem in dispatchedItems)
                    {
                        var stockList = await db.StoreStocks.Include(s => s.StockMaster).Where(s => s.StoreId == dispatchItem.SourceStoreId && s.ItemId == dispatchItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == dispatchItem.BatchNo && s.StockMaster.ExpiryDate == dispatchItem.ExpiryDate && s.StockMaster.CostPrice == dispatchItem.CostPrice && s.StockMaster.MRP == dispatchItem.MRP && s.IsActive == true).ToListAsync();                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                        var totalRemainingQty = dispatchItem.DispatchedQuantity;
                        foreach (var mainStoreStock in stockList)
                        {
                            var stockTxn = new PHRMStockTransactionModel(
                                stock: mainStoreStock,
                                transactionType: ENUM_PHRM_StockTransactionType.DispatchedItem,
                                transactionDate: dispatchItem.DispatchedDate ?? currentDateTime,
                                referenceNo: dispatchItem.DispatchItemsId,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDateTime,
                                fiscalYearId: currentFiscalYearId
                                );

                            //Increase Stock in PHRM_DispensaryStock
                            //Find if the stock is available in dispensary
                            var dispensaryStock = await db.StoreStocks.FirstOrDefaultAsync(s => s.StockId == mainStoreStock.StockId && s.StoreId == dispatchItem.TargetStoreId && s.IsActive == true);
                            // check if receive feature is enabled, to decide whether to increase in stock or increase unconfirmed quantity
                            var isReceiveFeatureEnabled = db.CFGParameters
                                                            .Where(param => param.ParameterGroupName == "Pharmacy" && param.ParameterName == "EnableReceiveItemsInDispensary")
                                                            .Select(param => param.ParameterValue == "true" ? true : false)
                                                            .FirstOrDefault();
                            //If stock is not found, then add new stock
                            if (dispensaryStock == null)
                            {
                                dispensaryStock = new PHRMStoreStockModel(
                                                                stockMaster: mainStoreStock.StockMaster,
                                                                storeId: dispatchItem.TargetStoreId,
                                                                quantity: 0);
                                db.StoreStocks.Add(dispensaryStock);
                                await db.SaveChangesAsync();
                            }
                            //Add Txn in PHRM_StockTxnItems table
                            var dispensaryStockTxn = new PHRMStockTransactionModel(dispensaryStock, ENUM_PHRM_StockTransactionType.DispatchedItemReceivingSide, dispatchItem.DispatchedDate ?? currentDateTime, dispatchItem.DispatchItemsId, currentUser.EmployeeId, currentDateTime, currentFiscalYearId);


                            if (mainStoreStock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= mainStoreStock.AvailableQuantity;
                                stockTxn.SetInOutQuantity(inQty: 0, outQty: mainStoreStock.AvailableQuantity);
                                if (isReceiveFeatureEnabled == true)
                                {
                                    mainStoreStock.IncreaseUnconfirmedQty(inQty: 0, outQty: mainStoreStock.AvailableQuantity);
                                    dispensaryStock.IncreaseUnconfirmedQty(inQty: mainStoreStock.AvailableQuantity, outQty: 0);
                                }
                                else
                                {
                                    dispensaryStock.UpdateAvailableQuantity(dispensaryStock.AvailableQuantity + mainStoreStock.AvailableQuantity);
                                }
                                dispensaryStockTxn.SetInOutQuantity(inQty: mainStoreStock.AvailableQuantity, outQty: 0);
                                mainStoreStock.UpdateAvailableQuantity(newQty: 0);

                            }
                            else
                            {
                                mainStoreStock.UpdateAvailableQuantity(newQty: mainStoreStock.AvailableQuantity - totalRemainingQty);
                                stockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                                if (isReceiveFeatureEnabled == true)
                                {
                                    mainStoreStock.IncreaseUnconfirmedQty(inQty: 0, outQty: totalRemainingQty);
                                    dispensaryStock.IncreaseUnconfirmedQty(inQty: totalRemainingQty, outQty: 0);
                                }
                                else
                                {
                                    dispensaryStock.UpdateAvailableQuantity(dispensaryStock.AvailableQuantity + totalRemainingQty);
                                }
                                dispensaryStockTxn.SetInOutQuantity(inQty: totalRemainingQty, outQty: 0);
                                totalRemainingQty = 0;
                            }

                            db.StockTransactions.Add(stockTxn);
                            db.StockTransactions.Add(dispensaryStockTxn);
                            await db.SaveChangesAsync();

                            if (totalRemainingQty == 0)
                            {
                                break; //it takes out of the foreach loop. line : foreach (var stock in stockList)
                            }
                        }
                    }
                    dbResource.Commit();
                }
                catch (Exception ex)
                {
                    dbResource.Rollback();
                    throw ex;
                }
            }
            return dispatchedItems[0].DispatchId ?? 1;
        }
        private static int GetSettlementReceiptNo(PharmacyDbContext dbContext)
        {
            int? currSettlmntNo = dbContext.PHRMSettlements.Max(a => a.SettlementReceiptNo);
            if (!currSettlmntNo.HasValue)
            {
                currSettlmntNo = 0;
            }

            return currSettlmntNo.Value + 1;
        }
    }

    #region ViewModel, DTO
    public class SearchPatientDTO
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public string ShortName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MiddleName { get; set; }
        public string Age { get; set; }
        public string Gender { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Address { get; set; }
        public bool? IsOutdoorPat { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CountryId { get; set; }
        public int? CountrySubDivisionId { get; set; }
        public string CountrySubDivisionName { get; set; }
        public string PANNumber { get; set; }

        //sud:1-Oct'21--Changing Claimcode from String to Int64-- to use Incremental logic (max+1)
        //need nullable since ClaimCode is Non-Mandatory for normal visits.
        public Int64? ClaimCode { get; set; }
        public bool? Ins_HasInsurance { get; set; }
        public double? Ins_InsuranceBalance { get; set; }
        public string Ins_NshiNumber { get; set; }
        public string VisitDate { get; set; }
        public int? ProviderId { get; set; }
    }
    #endregion

}