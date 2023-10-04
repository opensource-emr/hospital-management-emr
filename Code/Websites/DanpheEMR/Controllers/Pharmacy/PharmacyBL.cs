using AutoMapper;
using DanpheEMR.Core;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.MasterModels;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services;
using DanpheEMR.Services.Dispensary.DTOs.PharmacyInvoiceReceipt;
using DanpheEMR.Services.Dispensary.DTOs.PharmacyProvisional;
using DanpheEMR.Services.Pharmacy.DTOs.PurchaseOrder;
using DanpheEMR.Sync.IRDNepal.Models;
using DanpheEMR.Utilities;
using DanpheEMR.ViewModel.Pharmacy;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;
using RefactorThis.GraphDiff;//for entity-update.
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using ParameterModel = DanpheEMR.Core.Parameters.ParameterModel;

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
                    goodsReceiptData.GoodReceiptItem = new List<PHRMGoodsReceiptItemsModel>();
                    goodsReceiptData.CreatedOn = currentDate;
                    var dispercentage = (decimal)0;
                    var vatpercentage = (decimal)0;
                    if (grViewModelData.goodReceipt.SubTotal > 0)
                    {
                        dispercentage = (decimal)(grViewModelData.goodReceipt.DiscountAmount * 100 / grViewModelData.goodReceipt.SubTotal);
                        if (grViewModelData.goodReceipt.SubTotal - grViewModelData.goodReceipt.DiscountAmount > 0)
                        {
                            vatpercentage = (decimal)(grViewModelData.goodReceipt.VATAmount * 100 / (grViewModelData.goodReceipt.SubTotal - grViewModelData.goodReceipt.DiscountAmount));
                        }
                    }
                    phrmdbcontext.PHRMGoodsReceipt.Add(goodsReceiptData);
                    phrmdbcontext.SaveChanges();

                    var mainStoreObj = phrmdbcontext.PHRMStore.Where(s => s.Category == ENUM_StoreCategory.Store && s.SubCategory == ENUM_StoreSubCategory.Pharmacy).FirstOrDefault();

                    if (mainStoreObj == null)
                    {
                        throw new Exception("Main Store not found");
                    }
                    // Add gr items along with stock
                    goodsReceiptItemData.ForEach(gri =>
                    {
                        // TODO: Make StoreId Dynamic later, also add SubCategory
                        //var mainStoreId = phrmdbcontext.PHRMStore.Where(a => a.Category == "store" && a.SubCategory == "pharmacy").Select(a => a.StoreId).FirstOrDefault();

                        // Add to stock master
                        var newStockMaster = new PHRMStockMaster(
                            itemId: gri.ItemId,
                            batchNo: gri.BatchNo,
                            expiryDate: gri.ExpiryDate,
                            //costPrice: gri.GRItemPrice     //Changed: coz we need to store the actual cost price.
                            costPrice: (decimal)gri.CostPrice,
                            salePrice: gri.SalePrice,
                            createdBy: currentUser.EmployeeId,
                            createdOn: currentDate,
                            mrp: gri.MRP);

                        // add the new barcode id
                        var barcodeService = new PharmacyStockBarcodeService(phrmdbcontext);
                        newStockMaster.UpdateBarcodeId(barcodeService.AddStockBarcode(
                           stock: newStockMaster,
                           createdBy: currentUser.EmployeeId
                            ));

                        phrmdbcontext.StockMasters.Add(newStockMaster);
                        phrmdbcontext.SaveChanges();

                        // Add stock first
                        var newStoreStock = new PHRMStoreStockModel(newStockMaster, mainStoreObj.StoreId, (gri.ReceivedQuantity + gri.FreeQuantity), (decimal)gri.CostPrice, gri.SalePrice);
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
                            SalePrice = newStockMaster.SalePrice,
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
            List<SqlParameter> paramList = new List<SqlParameter>() {
                new SqlParameter("@SearchTxt", SearchText),
                new SqlParameter("@IsInsurance", IsInsurance) };

            DataTable dtPhrmPatients = DALFunctions.GetDataTableFromStoredProc("SP_PHRM_GetPatientList", paramList, phrmDBContext);
            return dtPhrmPatients;
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
                patient.ShortName = patient.FirstName + " " + (string.IsNullOrEmpty(patient.MiddleName) ? "" : patient.MiddleName + " ") + patient.LastName;
                //Initially add MemberShip as General
                var membership = patientDb.Schemes.Where(i => i.SchemeName == ENUM_SchemeName.General).FirstOrDefault();
                patient.MembershipTypeId = membership.SchemeId;
                patient.Ins_HasInsurance = false;
                patient.Ins_InsuranceBalance = 0;
                patient.IsSSUPatient = false;
                patient.SSU_IsActive = false;
                patient.IsVaccinationPatient = false;
                patient.IsVaccinationActive = false;
                db.PHRMPatient.Add(patient);
                patient = CreatePharmacyPatientAndSave(db, patientDb, patient, coreDb);  //Krishna,18th,Jul'22 , This function will register a patient(handling duplictae PatientNo i.e. It will be recursive until the unique PatientNo is received.)
                return patient.PatientId;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        private static PHRMPatient CreatePharmacyPatientAndSave(PharmacyDbContext db, PatientDbContext patientDb, PHRMPatient patient, CoreDbContext coreDb)
        {
            try
            {
                patient.PatientNo = GetLatestPatientNo(patientDb);
                patient.PatientCode = GetPatientCode((int)patient.PatientNo, patientDb, coreDb);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            CreatePharmacyPatientAndSave(db, patientDb, patient, coreDb);
                        }
                        else
                        {
                            throw;
                        }
                    }
                    else throw;
                }
                else throw;
            }
            return patient;
        }

        public static int GetLatestPatientNo(PatientDbContext patientDbContext)
        {
            try
            {
                int newPatNo = 0;
                var maxPatNo = patientDbContext.Patients.DefaultIfEmpty().Max(p => p == null ? 0 : p.PatientNo);
                newPatNo = maxPatNo + 1;
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
        public static PHRMInvoiceTransactionModel InvoiceTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, MasterDbContext masterDbContext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<PHRMInvoiceTransactionItemsModel> invoiceItemFromClient = new List<PHRMInvoiceTransactionItemsModel>();
                    List<PHRMEmployeeCashTransaction> invoiceCashTransaction = new List<PHRMEmployeeCashTransaction>();
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    int? PatientVisitId = invoiceDataFromClient.PatientVisitId;


                    ExtractInvoiceInfoOnlyFromInvoiceDataFromClient(invoiceDataFromClient, out invoiceItemFromClient, out invoiceCashTransaction);

                    SaveInvoice(invoiceDataFromClient, phrmdbcontext, currentUser, currentDate, currentFiscalYearId);

                    SaveInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser, currentDate, invoiceItemFromClient, currentFiscalYearId);

                    if (invoiceDataFromClient.PaymentMode == ENUM_BillPaymentMode.credit)
                    {
                        SaveCreditBillStatus(invoiceDataFromClient, phrmdbcontext, currentUser, currentDate);
                    }

                    MapEmployeeCashTransaction(invoiceDataFromClient, currentUser, currentDate, currentFiscalYearId, invoiceCashTransaction, phrmdbcontext);

                    if (invoiceDataFromClient.DepositDeductAmount > 0)
                    {
                        HandleDeposit(invoiceDataFromClient, phrmdbcontext, masterDbContext, currentUser, currentDate, currentFiscalYearId);
                    }

                    //update prescriptionItems status  if sale from prescription then do this NBB-now we checking if there prescriptionid >0 then it's from prescription to sale
                    if (invoiceDataFromClient.InvoiceItems[0].PrescriptionItemId != null)
                    {
                        UpdatePrescriptionItemStatus(invoiceDataFromClient, phrmdbcontext);
                    }
                    if (invoiceDataFromClient.IsInsurancePatient == true)
                    {
                        UpdateInsuranceBalance(invoiceDataFromClient, phrmdbcontext);
                    }
                    if (invoiceDataFromClient.SchemeId > 0)
                    {
                        UpdateSchemeCreditLimit(invoiceDataFromClient, phrmdbcontext, PatientVisitId);
                    }

                    UpdateStock(invoiceDataFromClient, phrmdbcontext, currentUser, currentDate, currentFiscalYearId, invoiceItemFromClient);

                    dbContextTransaction.Commit();
                    return invoiceDataFromClient;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private static int? GetDepositReceiptNo(PharmacyDbContext phrmdbcontext, int fiscalYearId)
        {
            int? receiptNo = (from depTxn in phrmdbcontext.BillingDepositModel
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();
            return receiptNo + 1;
        }

        private static void UpdateStock(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId, List<PHRMInvoiceTransactionItemsModel> invoiceItemFromClient)
        {
            invoiceItemFromClient.ForEach(item =>
            {
                //find the stock list in dispensary to decrease
                var dispensaryStockList = phrmdbcontext.StoreStocks.Include(s => s.StockMaster)
                                                            .Where(s => s.StoreId == invoiceDataFromClient.StoreId &&
                                                                    s.ItemId == item.ItemId &&
                                                                    s.AvailableQuantity > 0 &&
                                                                    s.StockMaster.BatchNo == item.BatchNo &&
                                                                    s.StockMaster.ExpiryDate == item.ExpiryDate &&
                                                                    s.StockMaster.SalePrice == item.NormalSalePrice &&
                                                                    s.StockMaster.CostPrice == item.Price &&
                                                                    s.IsActive == true)
                                                            .ToList();
                //If no stock found, stop the process
                if (dispensaryStockList.Count() == 0) throw new Exception($"Stock is not available for Item = {item.ItemName}, BatchNo ={item.BatchNo}");
                //If total available quantity is less than the required/dispatched quantity, then stop the process
                double totalAvailableQty = dispensaryStockList.Sum(s => s.AvailableQuantity);

                if (totalAvailableQty < item.Quantity)
                {
                    throw new Exception($"Stock is not available for Item with BatchNo = {item.BatchNo} ,ItemName = {item.ItemName},  Available Quantity = {totalAvailableQty}");
                }
                //apply fifo to decrement multiple stocks found in dispensary
                var totalRemainingQty = item.Quantity;
                foreach (var dispensaryStock in dispensaryStockList)
                {
                    //Add Txn in PHRM_StockTxnItems table
                    var dispensaryStockTxn = new PHRMStockTransactionModel(
                        storeStock: dispensaryStock,
                        transactionType: ENUM_PHRM_StockTransactionType.SaleItem,
                        transactionDate: invoiceDataFromClient.PaidDate ?? currentDate,
                        referenceNo: item.InvoiceItemId,
                        createdBy: currentUser.EmployeeId,
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
                        dispensaryStock.UpdateAvailableQuantity(newQty: dispensaryStock.AvailableQuantity - (totalRemainingQty));
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
        }

        private static void UpdateSchemeCreditLimit(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, int? PatientVisitId)
        {
            if (invoiceDataFromClient.PatientId > 0)
            {
                int? SchemeId = invoiceDataFromClient?.SchemeId;

                if (SchemeId != null)
                {
                    var patientCreditLimitData = phrmdbcontext.PatientSchemeMaps.Where(p => p.PatientId == invoiceDataFromClient.PatientId && p.SchemeId == SchemeId && p.LatestPatientVisitId == PatientVisitId).FirstOrDefault();
                    if (patientCreditLimitData != null)
                    {
                        if (invoiceDataFromClient.SelectedPatient.IsAdmitted)
                        {
                            //If credit limit is greater than 0 then the credit amount shoud be reduce in PatientMapPriceCategory
                            if (patientCreditLimitData.IpCreditLimit > 0 && patientCreditLimitData.IpCreditLimit >= invoiceDataFromClient.TotalAmount)
                            {
                                patientCreditLimitData.IpCreditLimit = patientCreditLimitData.IpCreditLimit - invoiceDataFromClient.TotalAmount;
                                phrmdbcontext.SaveChanges();
                            }
                        }
                        else
                        {
                            if (patientCreditLimitData.OpCreditLimit > 0 && patientCreditLimitData.OpCreditLimit >= invoiceDataFromClient.TotalAmount)
                            {
                                patientCreditLimitData.OpCreditLimit = patientCreditLimitData.OpCreditLimit - invoiceDataFromClient.TotalAmount;
                                phrmdbcontext.SaveChanges();
                            }
                        }

                        if (patientCreditLimitData.IpCreditLimit == 0 && patientCreditLimitData.OpCreditLimit == 0 && patientCreditLimitData.GeneralCreditLimit > 0 && patientCreditLimitData.GeneralCreditLimit >= invoiceDataFromClient.TotalAmount)
                        {
                            patientCreditLimitData.GeneralCreditLimit = patientCreditLimitData.GeneralCreditLimit - invoiceDataFromClient.TotalAmount;
                            phrmdbcontext.SaveChanges();
                        }
                    }
                    var scheme = phrmdbcontext.Schemes.FirstOrDefault(a => a.SchemeId == SchemeId);
                    if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                    {
                        var medicareMemberDetail = phrmdbcontext.MedicareMembers.Where(mm => mm.PatientId == invoiceDataFromClient.PatientId).FirstOrDefault();
                        if (medicareMemberDetail != null)
                        {
                            UpdateMedicareBalance(invoiceDataFromClient, phrmdbcontext, medicareMemberDetail);
                        }

                    }
                }
            }
        }

        private static void UpdatePrescriptionItemStatus(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext)
        {
            //get items for status update after sale prescription items
            var preItems = (from pres in phrmdbcontext.PHRMPrescriptionItems.AsEnumerable()
                            join sale in invoiceDataFromClient.InvoiceItems
                            on pres.PrescriptionItemId equals sale.PrescriptionItemId
                            select pres).ToList();
            var updatePresItemsOrderStatus = UpdatePrescriptionItems(preItems, phrmdbcontext);
        }

        private static void UpdateInsuranceBalance(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext)
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

        private static void UpdateMedicareBalance(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, MedicareMember medicareMemberDetail)
        {
            MedicareMemberBalance medicareMemberBalance = new MedicareMemberBalance();

            if (medicareMemberDetail != null)
            {
                if (!medicareMemberDetail.IsDependent)
                {
                    medicareMemberBalance = phrmdbcontext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.MedicareMemberId).FirstOrDefault();
                }
                else
                {
                    medicareMemberBalance = phrmdbcontext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.ParentMedicareMemberId).FirstOrDefault();
                }
                if (invoiceDataFromClient.SelectedPatient.IsAdmitted)
                {
                    DeductMedicareIPBalance(invoiceDataFromClient.CoPaymentCreditAmount, phrmdbcontext, medicareMemberBalance);
                }
                else
                {
                    DeductMedicareOPBalance(invoiceDataFromClient.CoPaymentCreditAmount, phrmdbcontext, medicareMemberBalance);
                }
            }
        }

        private static void DeductMedicareOPBalance(decimal CoPaymentCreditAmount, PharmacyDbContext phrmdbcontext, MedicareMemberBalance medicareMemberBalance)
        {
            if (medicareMemberBalance.OpBalance > 0 && medicareMemberBalance.OpBalance >= CoPaymentCreditAmount)
            {
                medicareMemberBalance.OpBalance = medicareMemberBalance.OpBalance - CoPaymentCreditAmount;
                medicareMemberBalance.OpUsedAmount = medicareMemberBalance.OpUsedAmount + CoPaymentCreditAmount;
                phrmdbcontext.SaveChanges();
            }
        }

        private static void DeductMedicareIPBalance(decimal CoPaymentCreditAmount, PharmacyDbContext phrmdbcontext, MedicareMemberBalance medicareMemberBalance)
        {
            if (medicareMemberBalance.IpBalance > 0 && medicareMemberBalance.IpBalance >= CoPaymentCreditAmount)
            {
                medicareMemberBalance.IpBalance = medicareMemberBalance.IpBalance - CoPaymentCreditAmount;
                medicareMemberBalance.IpUsedAmount = medicareMemberBalance.IpUsedAmount + CoPaymentCreditAmount;
                phrmdbcontext.SaveChanges();
            }
        }

        private static void HandleDeposit(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, MasterDbContext masterDbContext, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId)
        {
            var DefaultDepositHead = phrmdbcontext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
            var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;

            var depositDetails = phrmdbcontext.BillingDepositModel.Where(d => d.PatientId == invoiceDataFromClient.PatientId && d.PatientVisitId == invoiceDataFromClient.PatientVisitId).OrderByDescending(d => d.CreatedOn).FirstOrDefault();

            if (depositDetails != null)
            {
                BillingDepositModel dep = new BillingDepositModel()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,
                    ModuleName = ENUM_ModuleNames.Dispensary,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    DepositHeadId = DepositHeadId,
                    IsActive = true,
                    FiscalYearId = invoiceDataFromClient.FiscalYearId,
                    Remarks = "deposit used for transactionid:" + "PH" + invoiceDataFromClient.InvoicePrintId + " on " + DateTime.Now.Date,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = (int)invoiceDataFromClient.CounterId,
                    PatientVisitId = invoiceDataFromClient.PatientVisitId,
                    PatientId = invoiceDataFromClient.PatientId,
                    OutAmount = invoiceDataFromClient.DepositDeductAmount,
                    DepositBalance = depositDetails.DepositBalance - invoiceDataFromClient.DepositDeductAmount,
                    PaymentMode = ENUM_BillPaymentMode.cash,
                    ReceiptNo = GetDepositReceiptNo(phrmdbcontext, invoiceDataFromClient.FiscalYearId),
                    VisitType = invoiceDataFromClient.VisitType
                };
                phrmdbcontext.BillingDepositModel.Add(dep);
                phrmdbcontext.SaveChanges();

                //Save deposit deduct details on Employee Cash Transaction table.
                List<PHRMEmployeeCashTransaction> empCashTxns = new List<PHRMEmployeeCashTransaction>();
                PHRMEmployeeCashTransaction empCashTxn = new PHRMEmployeeCashTransaction();
                PaymentModes MstPaymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit").FirstOrDefault();
                empCashTxn.ReferenceNo = dep.DepositId;
                empCashTxn.InAmount = 0;
                empCashTxn.OutAmount = invoiceDataFromClient.DepositDeductAmount;
                empCashTxn.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;
                empCashTxn.PatientId = invoiceDataFromClient.PatientId;
                empCashTxn.EmployeeId = currentUser.EmployeeId;
                empCashTxn.CounterID = invoiceDataFromClient.CounterId;
                empCashTxn.TransactionDate = currentDate;
                empCashTxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.DepositDeduct;
                empCashTxn.ModuleName = ENUM_ModuleNames.Pharmacy;
                empCashTxn.Remarks = "deduct from deposit";
                empCashTxn.IsActive = true;
                empCashTxn.FiscalYearId = currentFiscalYearId;
                empCashTxns.Add(empCashTxn);
                SaveEmployeeCashTransaction(empCashTxns, phrmdbcontext);
            }

        }

        private static void SaveEmployeeCashTransaction(List<PHRMEmployeeCashTransaction> empCashTxn, PharmacyDbContext pharmacyDbContext)
        {
            pharmacyDbContext.phrmEmployeeCashTransaction.AddRange(empCashTxn);
            pharmacyDbContext.SaveChanges();
        }


        private static void MapEmployeeCashTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId, List<PHRMEmployeeCashTransaction> invoiceCashTransaction, PharmacyDbContext pharmacyDbContext)
        {
            List<PHRMEmployeeCashTransaction> empCashTxns = new List<PHRMEmployeeCashTransaction>();
            if (invoiceDataFromClient.PaymentMode == "cash")
            {
                invoiceCashTransaction.ForEach(cashTxn =>
                {
                    cashTxn.ReferenceNo = invoiceDataFromClient.InvoiceId;
                    cashTxn.PatientId = invoiceDataFromClient.PatientId;
                    cashTxn.EmployeeId = currentUser.EmployeeId;
                    cashTxn.CounterID = invoiceDataFromClient.CounterId;
                    cashTxn.TransactionDate = currentDate;
                    cashTxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.CashSales;
                    cashTxn.IsActive = true;
                    cashTxn.FiscalYearId = currentFiscalYearId;
                    empCashTxns.Add(cashTxn);

                });
            }
            // To save Employee Cash Transaction if Co-Payment is done with cash (with different payment method)
            if (invoiceDataFromClient.PaymentMode == ENUM_BillPaymentMode.credit && invoiceDataFromClient.IsCopayment)
            {
                invoiceCashTransaction.ForEach(cashTxn =>
                {
                    cashTxn.ReferenceNo = invoiceDataFromClient.InvoiceId;
                    cashTxn.PatientId = invoiceDataFromClient.PatientId;
                    cashTxn.EmployeeId = currentUser.EmployeeId;
                    cashTxn.CounterID = invoiceDataFromClient.CounterId;
                    cashTxn.TransactionDate = currentDate;
                    cashTxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.CashSales;
                    cashTxn.IsActive = true;
                    cashTxn.FiscalYearId = currentFiscalYearId;
                    empCashTxns.Add(cashTxn);

                });
            }
            SaveEmployeeCashTransaction(empCashTxns, pharmacyDbContext);
        }

        private static void SaveInvoiceItems(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, List<PHRMInvoiceTransactionItemsModel> invoiceItemFromClient, int fiscalYearId)
        {
            invoiceItemFromClient.ForEach(item =>
            {
                item.InvoiceId = invoiceDataFromClient.InvoiceId;
                item.PerItemDisAmt = (decimal)(((item.SubTotal * Convert.ToDecimal(item.DiscountPercentage)) / 100) / (decimal)item.Quantity);
                item.CreatedOn = currentDate;
                item.CreatedBy = currentUser.EmployeeId;
                item.PatientId = invoiceDataFromClient.PatientId;
                item.PatientVisitId = invoiceDataFromClient.PatientVisitId;
                item.BilItemStatus = invoiceDataFromClient.BilStatus;
                item.VisitType = invoiceDataFromClient.VisitType;
                item.FiscalYearId = fiscalYearId;
                if (item.NarcoticsRecord.NMCNumber != null)
                {
                    item.NarcoticsRecord.ItemId = item.ItemId;
                    item.NarcoticsRecord.InvoiceId = item.InvoiceId;
                    item.NarcoticsRecord.InvoiceItemId = item.InvoiceItemId;
                    phrmdbcontext.PHRMNarcoticRecord.Add(item.NarcoticsRecord);
                }
                phrmdbcontext.PHRMInvoiceTransactionItems.Add(item);
                phrmdbcontext.SaveChanges();
            });
        }

        private static void SaveInvoice(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, int currentFiscalYearId)
        {
            invoiceDataFromClient.InvoicePrintId = GetInvoiceNumber(phrmdbcontext);
            invoiceDataFromClient.FiscalYearId = currentFiscalYearId;
            invoiceDataFromClient.CreateOn = currentDate;
            invoiceDataFromClient.CreatedBy = currentUser.EmployeeId;
            invoiceDataFromClient.Creditdate = invoiceDataFromClient.BilStatus == "unpaid" ? (DateTime?)currentDate : null;
            phrmdbcontext.PHRMInvoiceTransaction.Add(invoiceDataFromClient);
            phrmdbcontext.SaveChanges();
        }

        private static void ExtractInvoiceInfoOnlyFromInvoiceDataFromClient(PHRMInvoiceTransactionModel invoiceDataFromClient, out List<PHRMInvoiceTransactionItemsModel> invoiceItemFromClient, out List<PHRMEmployeeCashTransaction> invoiceCashTransaction)
        {
            invoiceItemFromClient = invoiceDataFromClient.InvoiceItems;
            invoiceDataFromClient.InvoiceItems = null;
            invoiceDataFromClient.CreditBillStatus = null;
            invoiceCashTransaction = invoiceDataFromClient.PHRMEmployeeCashTransactions;
            invoiceDataFromClient.PHRMEmployeeCashTransactions = null;
        }

        private static void SaveCreditBillStatus(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate)
        {
            PHRMTransactionCreditBillStatus transactionCreditBillStatus = new PHRMTransactionCreditBillStatus();

            var fiscalYear = GetFiscalYear(phrmdbcontext);

            transactionCreditBillStatus.InvoiceId = invoiceDataFromClient.InvoiceId;
            transactionCreditBillStatus.InvoiceNoFormatted = fiscalYear.FiscalYearName + "-PH" + invoiceDataFromClient.InvoicePrintId.ToString();
            transactionCreditBillStatus.CreditOrganizationId = invoiceDataFromClient.OrganizationId > 0 ? (int)invoiceDataFromClient.OrganizationId : 0;
            transactionCreditBillStatus.PatientId = (int)invoiceDataFromClient.PatientId;
            transactionCreditBillStatus.CreatedBy = currentUser.EmployeeId;
            transactionCreditBillStatus.CreatedOn = currentDate;
            transactionCreditBillStatus.InvoiceDate = currentDate;
            transactionCreditBillStatus.LiableParty = "Organization";
            transactionCreditBillStatus.SalesTotalBillAmount = invoiceDataFromClient.TotalAmount;
            transactionCreditBillStatus.CoPayReceivedAmount = invoiceDataFromClient.IsCopayment ? (invoiceDataFromClient.TotalAmount - invoiceDataFromClient.CoPaymentCreditAmount) : 0;
            transactionCreditBillStatus.ReturnTotalBillAmount = 0;
            transactionCreditBillStatus.CoPayReturnAmount = 0;
            transactionCreditBillStatus.NetReceivableAmount = transactionCreditBillStatus.SalesTotalBillAmount - transactionCreditBillStatus.CoPayReceivedAmount - (transactionCreditBillStatus.ReturnTotalBillAmount - transactionCreditBillStatus.CoPayReturnAmount);
            transactionCreditBillStatus.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Pending;
            transactionCreditBillStatus.IsClaimable = true;
            transactionCreditBillStatus.IsActive = true;
            transactionCreditBillStatus.FiscalYearId = fiscalYear.FiscalYearId;
            transactionCreditBillStatus.PatientVisitId = invoiceDataFromClient.PatientVisitId;
            transactionCreditBillStatus.SchemeId = invoiceDataFromClient.SchemeId;
            transactionCreditBillStatus.MemberNo = invoiceDataFromClient.PolicyNo;
            phrmdbcontext.PHRMTransactionCreditBillStatus.Add(transactionCreditBillStatus);
            phrmdbcontext.SaveChanges();
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
        public static PharmacyProvisionalSale_DTO SaveProvisionalInvoice(List<PHRMInvoiceTransactionItemsModel> invoiceItems, RbacUser currentUser, PharmacyDbContext pharmacyDbContext)
        {
            var currentDate = DateTime.Now;
            var currentFiscalYearId = GetFiscalYear(pharmacyDbContext).FiscalYearId;

            using (var dbContextTransaction = pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {
                    SaveProvisionalInvoiceItems(invoiceItems, currentUser, pharmacyDbContext, currentDate, currentFiscalYearId);
                    UpdateStock(invoiceItems, currentUser, pharmacyDbContext, currentDate, currentFiscalYearId);
                    dbContextTransaction.Commit();
                    return ProvisionalInvoiceForReceiptView(invoiceItems, pharmacyDbContext);
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        public static int GetProvisionalReceiptNumber(PharmacyDbContext phrmdbcontext)
        {
            int fiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

            int provisionalReceiptNo = (from txn in phrmdbcontext.PHRMInvoiceTransactionItems
                                 where txn.FiscalYearId == fiscalYearId
                                 select txn.ReceiptNo ?? 0).DefaultIfEmpty(0).Max();
            return provisionalReceiptNo + 1;
        }

        private static PharmacyProvisionalSale_DTO ProvisionalInvoiceForReceiptView(List<PHRMInvoiceTransactionItemsModel> invoiceItems, PharmacyDbContext pharmacyDbContext)
        {
            int PatientId = invoiceItems[0].PatientId;
            int CreatedBy = invoiceItems[0].CreatedBy;
            DateTime InvoiceDate = invoiceItems[0].CreatedOn;
            int? PrescriberId = invoiceItems[0].PrescriberId;
            int? PatientVisitId = invoiceItems[0].PatientVisitId;
            int ReceiptNo = (int)invoiceItems[0].ReceiptNo;

            var PatientInfo = (from pat in pharmacyDbContext.PHRMPatient.Where(p => p.PatientId == PatientId)
                               join consub in pharmacyDbContext.CountrySubDivision on pat.CountrySubDivisionId equals consub.CountrySubDivisionId
                               select new PatientInfo_DTO
                               {
                                   PatientId = pat.PatientId,
                                   PatientCode = pat.PatientCode,
                                   ShortName = pat.ShortName,
                                   Address = pat.Address,
                                   CountrySubDivisionName = consub.CountrySubDivisionName,
                                   Gender = pat.Gender,
                                   Age = pat.Age,
                                   DateOfBirth = pat.DateOfBirth,
                                   PhoneNumber = pat.PhoneNumber,
                                   PANNumber = pat.PANNumber
                               }).FirstOrDefault();

            var UserName = pharmacyDbContext.Employees.Where(emp => emp.EmployeeId == CreatedBy).FirstOrDefault().FullName;
            var prescriberDetail = pharmacyDbContext.Employees.Where(e => e.EmployeeId == PrescriberId).FirstOrDefault();
            var SchemDetail = pharmacyDbContext.PatientSchemeMaps.Where(pm => pm.LatestPatientVisitId == PatientVisitId).FirstOrDefault();


            var provisionalInvoice = new PharmacyProvisionalSale_DTO()
            {
                PatientInfo = PatientInfo,
                UserName=UserName,
                ProvisionalInvoiceItems = DanpheJSONConvert.DeserializeObject<List<PharmacyProvisionalSaleItem_DTO>>(DanpheJSONConvert.SerializeObject(invoiceItems)),
                InvoiceDate = InvoiceDate,
                ProviderNMCNumber = prescriberDetail != null ? prescriberDetail.MedCertificationNo : "N/A",
                ProviderName = prescriberDetail != null ? prescriberDetail.FullName : "ANONYMOUS DOCTOR",
                ClaimCode = SchemDetail != null ? SchemDetail.LatestClaimCode : null,
                PolicyNo = SchemDetail != null ? SchemDetail.PolicyNo : null,
                SubTotal=invoiceItems.Sum(a=>a.SubTotal),
                DiscountAmount = invoiceItems.Sum(a => a.TotalDisAmt),
                VATAmount = invoiceItems.Sum(a => a.VATAmount),
                TotalAmount = invoiceItems.Sum(a => a.TotalAmount),
                CoPaymentCashAmount = invoiceItems.Sum(a => a.CoPaymentCashAmount),
                CoPaymentCreditAmount = invoiceItems.Sum(a => a.CoPaymentCreditAmount),
                ReceiptNo =ReceiptNo
            };
            return provisionalInvoice;
        }

        private static void UpdateStock(List<PHRMInvoiceTransactionItemsModel> invoiceItems, RbacUser currentUser, PharmacyDbContext pharmacyDbContext, DateTime currentDate, int currentFiscalYearId)
        {
            invoiceItems.ForEach(invitm =>
            {
                var dispensaryStockz = pharmacyDbContext.StoreStocks.Include(s => s.StockMaster)
                                                            .Where(s => s.StoreId == invitm.StoreId &&
                                                                    s.ItemId == invitm.ItemId &&
                                                                    s.AvailableQuantity > 0 &&
                                                                    s.StockMaster.CostPrice == invitm.Price &&
                                                                    s.StockMaster.BatchNo == invitm.BatchNo &&
                                                                    s.StockMaster.ExpiryDate == invitm.ExpiryDate &&
                                                                    s.IsActive == true)
                                                            .ToList();

                if (dispensaryStockz == null) throw new Exception($"Stock is not available for ItemName = {invitm.ItemName}, BatchNo ={invitm.BatchNo}");
                if (dispensaryStockz.Sum(s => s.AvailableQuantity) < invitm.Quantity) throw new Exception($"Stock is not available for ItemName = {invitm.ItemName}, BatchNo ={invitm.BatchNo}");

                var totalRemainingQty = invitm.Quantity;
                foreach (var stock in dispensaryStockz)
                {
                    var newStockTxn = new PHRMStockTransactionModel(
                        storeStock: stock,
                        transactionType: ENUM_PHRM_StockTransactionType.ProvisionalSaleItem,
                        transactionDate: invitm.CreatedOn,
                        referenceNo: invitm.InvoiceItemId,
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
                        stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity - (totalRemainingQty));
                        newStockTxn.SetInOutQuantity(inQty: 0, outQty: totalRemainingQty);
                        totalRemainingQty = 0;
                    }
                    pharmacyDbContext.StockTransactions.Add(newStockTxn);
                    pharmacyDbContext.SaveChanges();

                    if (totalRemainingQty == 0)
                    {
                        break;
                    }
                }

            });
        }

        private static void SaveProvisionalInvoiceItems(List<PHRMInvoiceTransactionItemsModel> invoiceItems, RbacUser currentUser, PharmacyDbContext pharmacyDbContext, DateTime currentDate, int FiscalYearId)
        {
            invoiceItems.ForEach(item =>
            {
                item.FiscalYearId = FiscalYearId;
                item.ReceiptNo = GetProvisionalReceiptNumber(pharmacyDbContext);
                item.CreatedOn = currentDate;
                item.CreatedBy = currentUser.EmployeeId;
                item.InvoiceId =item.InvoiceId==0? null :item.InvoiceId;
            });
            pharmacyDbContext.PHRMInvoiceTransactionItems.AddRange(invoiceItems);
            pharmacyDbContext.SaveChanges();
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
                        tempWardStock.SalePrice = Convert.ToDouble(wardDispatch.WardDispatchedItemsList[i].SalePrice);
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
                                                                      //    tempStockTxnItems.SalePrice = provisionalItem[i].SalePrice;
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
        public static int ReturnItemsToSupplierTransaction(PHRMReturnToSupplierModel returnToSupplierObj, RbacUser currentUser, PharmacyDbContext phrmdbcontext)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    double nowReturningQty = 0;
                    //Save Details of ReturnToSupplier
                    var currentDate = DateTime.Now;
                    var currentFiscalyearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

                    returnToSupplierObj.CreatedOn = currentDate;
                    returnToSupplierObj.CreatedBy = currentUser.EmployeeId;

                    var returnToSupplierItems = SystemExtension.Clone(returnToSupplierObj.returnToSupplierItems);

                    returnToSupplierObj.returnToSupplierItems.ForEach(retItem =>
                    {
                        nowReturningQty = retItem.Quantity;
                        var grItemDetails = (from gri in phrmdbcontext.PHRMGoodsReceiptItems.Where(a => a.StockId == retItem.StockId && a.BatchNo == retItem.BatchNo)
                                             select new
                                             {
                                                 GoodReceiptItemId = gri.GoodReceiptItemId,
                                                 InvoicedQty = gri.ReceivedQuantity,
                                                 FreeQty = gri.FreeQuantity
                                             }).First();

                        var previouslyReturnedQty = phrmdbcontext.PHRMReturnToSupplierItem.Where(a => a.GoodReceiptItemId == grItemDetails.GoodReceiptItemId).Sum(a => a.Quantity + a.FreeQuantity).GetValueOrDefault(0);

                        if ((grItemDetails.InvoicedQty - previouslyReturnedQty) > nowReturningQty)
                        {
                            retItem.Quantity = nowReturningQty;
                            retItem.FreeQuantity = 0;
                        }
                        else
                        {
                            retItem.Quantity = (grItemDetails.InvoicedQty - previouslyReturnedQty);
                            retItem.Quantity = retItem.Quantity < 0 ? 0 : retItem.Quantity;
                            retItem.FreeQuantity = nowReturningQty - retItem.Quantity;
                        }

                        retItem.CreatedBy = currentUser.EmployeeId;
                        retItem.CreatedOn = currentDate;
                    });
                    phrmdbcontext.PHRMReturnToSupplier.Add(returnToSupplierObj);
                    phrmdbcontext.SaveChanges();


                    foreach (var rtsitemClone in returnToSupplierItems)
                    {
                        var matchingOriginalItem = returnToSupplierObj.returnToSupplierItems
                            .FirstOrDefault(rtsitemOriginal =>
                                rtsitemOriginal.ItemId == rtsitemClone.ItemId &&
                                rtsitemOriginal.BatchNo == rtsitemClone.BatchNo);

                        if (matchingOriginalItem != null)
                        {
                            rtsitemClone.ReturnToSupplierItemId = matchingOriginalItem.ReturnToSupplierItemId;
                            rtsitemClone.ReturnToSupplierId = matchingOriginalItem.ReturnToSupplierId;
                        }
                    }

                    returnToSupplierItems.ForEach(RTSItem =>
                    {
                        nowReturningQty = RTSItem.Quantity;
                        var stockToDecrease = (from S in phrmdbcontext.StoreStocks
                                               join GRI in phrmdbcontext.PHRMGoodsReceiptItems on S.StoreStockId equals GRI.StoreStockId
                                               where S.IsActive == true && GRI.GoodReceiptItemId == RTSItem.GoodReceiptItemId
                                               select S
                                              ).Include(s => s.StockMaster).FirstOrDefault();

                        if (stockToDecrease == null) throw new Exception("Stock not found for ItemId = " + RTSItem.ItemId + " ,BatchNo = " + RTSItem.BatchNo);

                        if (stockToDecrease.AvailableQuantity < nowReturningQty) throw new Exception("Returned quantity is greater than available stock with ItemId = " + RTSItem.ItemId + " ,BatchNo = " + RTSItem.BatchNo);

                        decimal RTSNetRatePerItem = (RTSItem.TotalAmount) / (decimal)nowReturningQty;
                        var grItemDetails = (from gri in phrmdbcontext.PHRMGoodsReceiptItems.Where(a => a.StockId == RTSItem.StockId && a.BatchNo == RTSItem.BatchNo)
                                             select new
                                             {
                                                 InvoicedQty = gri.ReceivedQuantity,
                                                 FreeQty = gri.FreeQuantity
                                             });

                        double TotalReceivedQty = grItemDetails.Sum(a => a.InvoicedQty + a.FreeQty);

                        double ExistingStockQty = stockToDecrease.AvailableQuantity;

                        decimal ExistingCP = stockToDecrease.CostPrice;

                        decimal RTSAdjustedAmount = (RTSNetRatePerItem - ExistingCP) * (decimal)nowReturningQty;

                        double RemainingQty = ExistingStockQty - nowReturningQty;

                        decimal NewCP = RemainingQty == 0 ? 0 : (((decimal)RemainingQty * ExistingCP) - RTSAdjustedAmount) / (decimal)RemainingQty;

                        //Update the Available Quantity in the StoreStock 
                        stockToDecrease.UpdateAvailableQuantity(stockToDecrease.AvailableQuantity - nowReturningQty);
                        phrmdbcontext.SaveChanges();

                        //Add stock transaction for the decrement of stock
                        var newStockTxn = new PHRMStockTransactionModel(
                            storeStock: stockToDecrease,
                            transactionType: ENUM_PHRM_StockTransactionType.PurchaseReturnedItem,
                            transactionDate: returnToSupplierObj.ReturnDate,
                            referenceNo: RTSItem.ReturnToSupplierItemId,
                            createdBy: RTSItem.CreatedBy,
                            createdOn: currentDate,
                            fiscalYearId: currentFiscalyearId
                            );
                        //Update existing CostPrice with new CostPrice in StoreStock  Table
                        stockToDecrease.UpdateNewCostPrice(NewCP);

                        //Update existing CostPrice with new CostPrice in StockMaster Table
                        stockToDecrease.StockMaster.UpdateNewCostPrice(NewCP);

                        newStockTxn.SetInOutQuantity(inQty: 0, outQty: nowReturningQty);
                        //Update Cost Price in Stock Transaction table
                        newStockTxn.UpdateCostPrice(RTSNetRatePerItem);
                        phrmdbcontext.StockTransactions.Add(newStockTxn);
                        phrmdbcontext.SaveChanges();

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


                    //Find the stock list from ItemId, Batch, Expiry, CostPrice and SalePrice.
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
                                storeStock: stock,
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
                    //selecteddispensarystock.SalePrice = stkManageFromClient.SalePrice;
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
                    //selectedstockTxnItm.SalePrice = stkManageFromClient.SalePrice;
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

        public static Boolean StoreManageTransaction(ManageStockItem manageStockItem, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    PHRMStockTransactionModel newStockTxn = new PHRMStockTransactionModel();
                    var currentDate = DateTime.Now;
                    var currentFiscalyearId = GetFiscalYear(phrmdbcontext).FiscalYearId;

                    var existingStock = phrmdbcontext.StoreStocks.Include(s => s.StockMaster).Where(s => s.StoreId == manageStockItem.StoreId && s.StockId == manageStockItem.StockId
                    && s.ItemId == manageStockItem.ItemId && s.StockMaster.BatchNo == manageStockItem.BatchNo && s.StockMaster.CostPrice == manageStockItem.CostPrice).FirstOrDefault();

                    if (existingStock != null)
                    {
                        /*Manipal-RevisionNeeded*/
                        //Rohit/Sud:4Apr'23: Need to Generate NewReferenceNo for Stockmanage transactions as well -- to do after manipal
                        Random generator = new Random();
                        int stockMgRefNo_Dummy = generator.Next(1, 999999);

                        newStockTxn = new PHRMStockTransactionModel(
                                                                    storeStock: existingStock,
                                                                    transactionType: ENUM_PHRM_StockTransactionType.StockManage,
                                                                    transactionDate: currentDate,
                                                                    referenceNo: stockMgRefNo_Dummy,
                                                                    createdBy: currentUser.EmployeeId,
                                                                    createdOn: currentDate,
                                                                    fiscalYearId: currentFiscalyearId
                                                                    );
                        if (manageStockItem.InOut == "in")
                        {
                            newStockTxn.SetInOutQuantity(manageStockItem.UpdatedQty, 0);
                            existingStock.UpdateAvailableQuantity(existingStock.AvailableQuantity + manageStockItem.UpdatedQty);
                        }
                        else
                        {
                            newStockTxn.SetInOutQuantity(0, manageStockItem.UpdatedQty);
                            existingStock.UpdateAvailableQuantity(existingStock.AvailableQuantity - manageStockItem.UpdatedQty);
                        }
                        phrmdbcontext.StockTransactions.Add(newStockTxn);
                    }
                    phrmdbcontext.SaveChanges();
                    dbContextTransaction.Commit();
                    return true;
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
                //selecteddispensarystock.SalePrice = storeStockData.SalePrice;
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
                //StockTxnItem.SalePrice = storeStockData.SalePrice;
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
        public static bool ReturnFromCustomerTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, MasterDbContext masterDbContext, RbacUser currentUser, BillingDbContext billingDbContext)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;

                    var currFiscalYear = GetFiscalYear(phrmdbcontext);

                    SaveInvoiceReturn(ClientData, phrmdbcontext, currentUser, currentDate, currFiscalYear);

                    SaveEmployeeCashTransaction(ClientData, phrmdbcontext, currentUser, currentDate, currFiscalYear, masterDbContext);

                    UpdatePharmacyCreditStatusAndCreditBalance(phrmdbcontext, ClientData, currentUser);

                    UpdateStockAndSaveStockTransactions(ClientData, phrmdbcontext, currentUser, currentDate, currFiscalYear);

                    UpdateInsuranceBalance(ClientData, phrmdbcontext);

                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    return false;
                    throw ex;
                }
            }
        }

        private static void SaveInvoiceReturn(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, PharmacyFiscalYear currFiscalYear)
        {
            int currentMaxCreditNoteNumber = phrmdbcontext.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId)
                                                   .Select(a => a.CreditNoteId).DefaultIfEmpty(0).Max();


            int newCreditNoteNum = currentMaxCreditNoteNumber + 1;


            int invid = (from txn in phrmdbcontext.PHRMInvoiceTransaction
                         where txn.InvoicePrintId == ClientData.InvoiceId
                         select txn.InvoiceId).DefaultIfEmpty(0).Max();

            int? priceCategoryId = (from txnItem in phrmdbcontext.PHRMInvoiceTransactionItems
                                    where txnItem.InvoiceId == invid
                                    select txnItem.PriceCategoryId).DefaultIfEmpty(0).Max();

            int? SettlementId = SaveSettlement(ClientData, phrmdbcontext, currentUser);



            ClientData.InvoiceId = invid == 0 ? null : (int?)invid;
            ClientData.FiscalYearId = currFiscalYear.FiscalYearId;
            ClientData.CreditNoteId = newCreditNoteNum;
            ClientData.CreatedOn = currentDate;
            ClientData.CreatedBy = currentUser.EmployeeId;
            ClientData.SettlementId = SettlementId;
            ClientData.OrganizationId = ClientData.OrganizationId == 0 ? null : ClientData.OrganizationId;
            ClientData.InvoiceReturnItems.ForEach(returnedItem =>
            {
                //register returned items in the table
                returnedItem.CreatedOn = currentDate;
                returnedItem.CreatedBy = currentUser.EmployeeId;
                returnedItem.FiscalYearId = currFiscalYear.FiscalYearId;
                //returnedItem.CreditNoteNumber = newCreditNoteNum;
            });
            phrmdbcontext.PHRMInvoiceReturnModel.Add(ClientData);
            phrmdbcontext.SaveChanges();
        }

        private static int? SaveSettlement(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            int? SettlementId = null;
            if (ClientData.CashDiscount > 0)
            {
                PHRMSettlementModel settlement = new PHRMSettlementModel();

                settlement.DiscountReturnAmount = ClientData.CashDiscount;
                settlement.PatientId = ClientData.PatientId;
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
                SettlementId = settlement.SettlementId;
            }
            return SettlementId;
        }

        private static void SaveEmployeeCashTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, PharmacyFiscalYear currFiscalYear, MasterDbContext masterDbContext)
        {
            PaymentModes MstPaymentModes = masterDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == ENUM_BillPaymentMode.cash).FirstOrDefault();
            List<PHRMEmployeeCashTransaction> empTxns = new List<PHRMEmployeeCashTransaction>();

            if (ClientData.CashDiscount > 0)
            {
                PHRMEmployeeCashTransaction emptxn = new PHRMEmployeeCashTransaction();
                emptxn.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;
                emptxn.CounterID = ClientData.CounterId;
                emptxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.CashDiscountReceived;
                emptxn.InAmount = ClientData.CashDiscount;
                emptxn.ReferenceNo = ClientData.SettlementId;
                emptxn.PatientId = ClientData.PatientId;
                emptxn.EmployeeId = currentUser.EmployeeId;
                emptxn.ModuleName = ENUM_ModuleNames.Dispensary;
                emptxn.TransactionDate = currentDate;
                emptxn.Remarks = "cash discount collection";
                emptxn.IsActive = true;
                emptxn.FiscalYearId = currFiscalYear.FiscalYearId;
                empTxns.Add(emptxn);
            }

            PHRMEmployeeCashTransaction empTxn = new PHRMEmployeeCashTransaction();
            empTxn.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;
            empTxn.CounterID = ClientData.CounterId;
            empTxn.TransactionType = ENUM_PHRM_EmpCashTxnTypes.SalesReturn;
            empTxn.OutAmount = ClientData.ReturnCashAmount;
            empTxn.ReferenceNo = ClientData.InvoiceReturnId;
            empTxn.PatientId = ClientData.PatientId;
            empTxn.EmployeeId = currentUser.EmployeeId;
            empTxn.ModuleName = ENUM_ModuleNames.Dispensary;
            empTxn.TransactionDate = currentDate;
            empTxn.Remarks = "sales-return";
            empTxn.IsActive = true;
            empTxn.FiscalYearId = currFiscalYear.FiscalYearId;
            empTxns.Add(empTxn);
            phrmdbcontext.phrmEmployeeCashTransaction.AddRange(empTxns);
            phrmdbcontext.SaveChanges();
        }

        private static void UpdatePharmacyCreditStatusAndCreditBalance(PharmacyDbContext pharmacyDbContext, PHRMInvoiceReturnModel phrmInvoiceReturn, RbacUser currentUser)
        {
            try
            {
                var phrmCreditStatusObj = pharmacyDbContext.PHRMTransactionCreditBillStatus.Where(a => a.InvoiceId == phrmInvoiceReturn.InvoiceId).FirstOrDefault();

                if (phrmCreditStatusObj != null)
                {
                    //Incase of multiple return: We need to add previous return amount and current return total (ReturnTotalBill =prevReturnTotalBillAmount + phrmInvoiceReturn.TotalAmount )
                    decimal prevRetBillAmount = phrmCreditStatusObj.ReturnTotalBillAmount;
                    phrmCreditStatusObj.ReturnTotalBillAmount = phrmInvoiceReturn.TotalAmount + prevRetBillAmount;

                    decimal prevCoPayReturn = phrmCreditStatusObj.CoPayReturnAmount;
                    decimal currentCoPayReturn = phrmInvoiceReturn.IsCoPayment ? phrmInvoiceReturn.ReturnCashAmount : 0;
                    phrmCreditStatusObj.CoPayReturnAmount = prevCoPayReturn + currentCoPayReturn;

                    phrmCreditStatusObj.NetReceivableAmount = phrmCreditStatusObj.SalesTotalBillAmount - phrmCreditStatusObj.CoPayReceivedAmount - (phrmCreditStatusObj.ReturnTotalBillAmount - phrmCreditStatusObj.CoPayReturnAmount);

                    phrmCreditStatusObj.ModifiedOn = DateTime.Now;
                    phrmCreditStatusObj.ModifiedBy = currentUser.EmployeeId;

                    pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ReturnTotalBillAmount).IsModified = true;
                    pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.CoPayReturnAmount).IsModified = true;
                    pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.NetReceivableAmount).IsModified = true;
                    pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ModifiedOn).IsModified = true;
                    pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ModifiedBy).IsModified = true;
                    pharmacyDbContext.SaveChanges();


                    UpdateSchemeBalance(pharmacyDbContext, phrmInvoiceReturn, currentUser, phrmCreditStatusObj);
                }
            }
            catch (Exception)
            {

                throw;
            }


        }

        private static void UpdateSchemeBalance(PharmacyDbContext pharmacyDbContext, PHRMInvoiceReturnModel phrmInvoiceReturn, RbacUser currentUser, PHRMTransactionCreditBillStatus phrmCreditStatusObj)
        {
            var patientSchemeMapDetails = pharmacyDbContext.PatientSchemeMaps.Where(a => a.PatientId == phrmInvoiceReturn.PatientId && a.SchemeId == phrmInvoiceReturn.SchemeId && a.IsActive == true).FirstOrDefault();

            if (patientSchemeMapDetails != null && phrmInvoiceReturn.IsCoPayment == true)
            {
                var patientVisitDetails = pharmacyDbContext.PHRMPatientVisit.OrderByDescending(a => a.PatientVisitId).FirstOrDefault(a => a.PatientVisitId == phrmCreditStatusObj.PatientVisitId);
                if (patientVisitDetails != null)
                {
                    if (patientVisitDetails.VisitType.ToLower() != ENUM_VisitType.inpatient.ToLower())
                    {
                        patientSchemeMapDetails.OpCreditLimit = patientSchemeMapDetails.OpCreditLimit + phrmInvoiceReturn.TotalAmount;
                        pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.OpCreditLimit).IsModified = true;
                    }
                    else
                    {
                        patientSchemeMapDetails.IpCreditLimit = (decimal)(patientSchemeMapDetails.IpCreditLimit + phrmInvoiceReturn.TotalAmount);
                        pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.IpCreditLimit).IsModified = true;
                    }
                    patientSchemeMapDetails.ModifiedBy = currentUser.EmployeeId;
                    patientSchemeMapDetails.ModifiedOn = DateTime.Now;

                    pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.ModifiedBy).IsModified = true;
                    pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.ModifiedOn).IsModified = true;
                    pharmacyDbContext.SaveChanges();

                    var scheme = pharmacyDbContext.Schemes.FirstOrDefault(a => a.SchemeId == patientVisitDetails.SchemeId);
                    if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                    {
                        UpdateMedicareBalanceAfterReturn(patientVisitDetails, pharmacyDbContext, phrmInvoiceReturn.TotalAmount);
                    }

                }
            }
        }

        private static void UpdateMedicareBalanceAfterReturn(VisitModel patientVisitDetails, PharmacyDbContext pharmacyDbContext, decimal TotalAmount)
        {
            var medicareMemberDetail = pharmacyDbContext.MedicareMembers.Where(mm => mm.PatientId == patientVisitDetails.PatientId).FirstOrDefault();

            if (medicareMemberDetail != null)
            {
                var medicareMemberBalance = new MedicareMemberBalance();
                if (!medicareMemberDetail.IsDependent)
                {
                    medicareMemberBalance = pharmacyDbContext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.MedicareMemberId).FirstOrDefault();
                }
                else
                {
                    medicareMemberBalance = pharmacyDbContext.MedicareMemberBalances.Where(mm => mm.MedicareMemberId == medicareMemberDetail.ParentMedicareMemberId).FirstOrDefault();
                }
                if (patientVisitDetails.VisitType.ToLower() != ENUM_VisitType.inpatient.ToLower())
                {
                    medicareMemberBalance.OpBalance += TotalAmount;
                    medicareMemberBalance.OpUsedAmount -= TotalAmount;
                }
                else
                {
                    medicareMemberBalance.IpBalance += TotalAmount;
                    medicareMemberBalance.IpUsedAmount -= TotalAmount;
                }
                pharmacyDbContext.SaveChanges();
            }
        }

        private static void UpdateStockAndSaveStockTransactions(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser, DateTime currentDate, PharmacyFiscalYear currFiscalYear)
        {
            ClientData.InvoiceReturnItems.ForEach(returnedItem =>
            {
                List<int> previouslyReturnedInvRetItemId = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(i => i.InvoiceItemId == returnedItem.InvoiceItemId).Select(a => a.InvoiceReturnItemId).ToList();

                // find the total sold stock, substract with total returned stock
                var allStockTxnsForThisInvoiceItem = phrmdbcontext.StockTransactions
                                                                .Where(s => (s.ReferenceNo == returnedItem.InvoiceItemId && s.TransactionType == ENUM_PHRM_StockTransactionType.SaleItem)
                                                                || (previouslyReturnedInvRetItemId.Contains(s.ReferenceNo) && s.TransactionType == ENUM_PHRM_StockTransactionType.SaleReturnedItem)).ToList();

                // if no stock was returned previously, do not go further
                if (previouslyReturnedInvRetItemId != null || previouslyReturnedInvRetItemId.Count > 0)
                {
                    double totalSoldQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == ENUM_PHRM_StockTransactionType.SaleItem).Sum(b => b.OutQty);
                    double? totalReturnedQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == ENUM_PHRM_StockTransactionType.SaleReturnedItem).Sum(b => b.InQty);

                    double totalReturnableQtyForThisItem = totalSoldQtyForThisItem - (totalReturnedQtyForThisItem ?? 0);

                    //if total returnable quantity for the item is less than returned quantity from client side, throw exception
                    if ((decimal)totalReturnableQtyForThisItem < returnedItem.ReturnedQty) throw new Exception($"{totalReturnableQtyForThisItem} qty is already returned for {returnedItem.ItemName} with Batch : {returnedItem.BatchNo} ");
                }
                //Find the stock that was sold
                var stockIdList = allStockTxnsForThisInvoiceItem.Select(s => s.StockId).Distinct().ToList();
                var soldByStoreId = allStockTxnsForThisInvoiceItem[0].StoreId;
                var stockList = phrmdbcontext.StoreStocks.Include(s => s.StockMaster).Where(s => stockIdList.Contains(s.StockId) && s.StoreId == soldByStoreId).ToList();

                //use fifo to return the items into dispensary stock
                //at first, total remaining returned quantity will be the total quantity returned from the client-side, later deducted with every iteration
                decimal remainingReturnedQuantity = returnedItem.ReturnedQty;

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
                    if (totalReturnableQtyForThisStock < (double)remainingReturnedQuantity)
                    {
                        //Check if the sold store and returning store are same
                        if (stock.StoreId == returnedItem.StoreId)
                        {
                            stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + totalReturnableQtyForThisStock);

                            // create new txn for this store
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: stock,
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
                                    quantity: totalReturnableQtyForThisStock,
                                    costPrice: stock.CostPrice,
                                    salePrice: stock.SalePrice
                                    );

                                phrmdbcontext.StoreStocks.Add(returningStoreStock);
                                phrmdbcontext.SaveChanges();
                            }
                            // create new txn for this store
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: returningStoreStock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        newStockTxn.SetInOutQuantity(inQty: totalReturnableQtyForThisStock, outQty: 0);
                        remainingReturnedQuantity -= (decimal)totalReturnableQtyForThisStock;
                    }
                    else
                    {
                        //Check if the sold store and returning store are same
                        if (stock.StoreId == returnedItem.StoreId)
                        {
                            stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + (double)remainingReturnedQuantity);
                            // create new txn for this store
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: stock,
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
                                returningStoreStock.UpdateAvailableQuantity(newQty: returningStoreStock.AvailableQuantity + (double)remainingReturnedQuantity);
                            }
                            else
                            {
                                // If stock not found, create a new stock for this store
                                returningStoreStock = new PHRMStoreStockModel(
                                    stockMaster: stock.StockMaster,
                                    storeId: returnedItem.StoreId,
                                    quantity: (double)remainingReturnedQuantity,
                                    costPrice: stock.CostPrice,
                                    salePrice: stock.SalePrice
                                    );
                                phrmdbcontext.StoreStocks.Add(returningStoreStock);
                                phrmdbcontext.SaveChanges();
                            }
                            // create new txn for this store
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: returningStoreStock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        newStockTxn.SetInOutQuantity(inQty: (double)remainingReturnedQuantity, outQty: 0);
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
        }

        private static void UpdateInsuranceBalance(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext)
        {
            if (ClientData.ClaimCode != null)
            {
                InsuranceModel insurance = phrmdbcontext.PatientInsurances.Where(ins => ins.PatientId == ClientData.PatientId).FirstOrDefault();
                if (insurance != null)
                {
                    insurance.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance + Convert.ToDouble(ClientData.TotalAmount);
                    insurance.ModifiedOn = ClientData.CreatedOn;
                    insurance.ModifiedBy = ClientData.CreatedBy;

                    PHRMPatient patient = phrmdbcontext.PHRMPatient.Where(p => p.PatientId == ClientData.PatientId).FirstOrDefault();
                    if (patient == null) throw new Exception("Patient data not found");
                    patient.Ins_InsuranceBalance = insurance.Ins_InsuranceBalance;
                    phrmdbcontext.SaveChanges();
                }
            }
        }


        public static int ManualReturnTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext db, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currFiscalYear = GetFiscalYear(db);

                    int maxCreditNoteId = db.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Select(a => a.CreditNoteId).DefaultIfEmpty(0).Max();
                    int maxCreditNoteNum = db.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Select(a => a.CreditNoteNumber).DefaultIfEmpty(0).Max();

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
                        PHRMStockMaster masterStock = db.StockMasters.Where(a => a.ItemId == returnedItem.ItemId && a.IsActive == true && a.BatchNo == returnedItem.BatchNo && a.ExpiryDate == returnedItem.ExpiryDate && a.SalePrice == returnedItem.SalePrice).FirstOrDefault();

                        // If available, add new stock with stockId found in master stock, else add new master stock in both main store and dispensary stock table
                        if (masterStock == null)
                        {
                            masterStock = new PHRMStockMaster(
                                itemId: returnedItem.ItemId,
                                batchNo: returnedItem.BatchNo,
                                expiryDate: returnedItem.ExpiryDate,
                                costPrice: 0, // must be corrected later
                                salePrice: returnedItem.SalePrice,
                                createdBy: currentUser.EmployeeId,
                                createdOn: currentDate,
                                mrp: 0
                                );

                            // add the new barcode id
                            var barcodeService = new PharmacyStockBarcodeService(db);
                            masterStock.UpdateBarcodeId(barcodeService.AddStockBarcode(
                               stock: masterStock,
                               createdBy: currentUser.EmployeeId
                                ));

                            db.StockMasters.Add(masterStock);
                            db.SaveChanges();
                        }


                        //Check if storestock exists
                        //If exists then update available qty of the same storestock 
                        //else create new storestock and add to PHRM_TXN_StoreStock table
                        //Finally add into stock transaction table
                        var existingStoreStock = db.StoreStocks.Where(s => s.StockId == masterStock.StockId && s.StoreId == returnedItem.StoreId).FirstOrDefault();
                        if (existingStoreStock != null)
                        {
                            existingStoreStock.UpdateAvailableQuantity((existingStoreStock.AvailableQuantity + (double)returnedItem.ReturnedQty));
                        }
                        else
                        {
                            //add to dispensary stock
                            existingStoreStock = new PHRMStoreStockModel(
                                stockMaster: masterStock,
                                storeId: returnedItem.StoreId,
                                quantity: (double)returnedItem.ReturnedQty,
                                costPrice: masterStock.CostPrice,
                                salePrice: masterStock.SalePrice
                                );
                            db.StoreStocks.Add(existingStoreStock);

                        }
                        db.SaveChanges();

                        //add to dispensary stock transaction
                        var newDispensaryStockTxn = new PHRMStockTransactionModel(
                            storeStock: existingStoreStock,
                            transactionType: ENUM_PHRM_StockTransactionType.ManualSaleReturnedItem,
                            transactionDate: currentDate,
                            referenceNo: returnedItem.InvoiceReturnItemId,
                            createdBy: currentUser.EmployeeId,
                            createdOn: currentDate,
                            fiscalYearId: currFiscalYear.FiscalYearId
                            );
                        newDispensaryStockTxn.SetInOutQuantity(inQty: (double)returnedItem.ReturnedQty, outQty: 0);
                        db.StockTransactions.Add(newDispensaryStockTxn);
                        db.SaveChanges();
                    }

                    dbContextTransaction.Commit();
                    return ClientData.InvoiceReturnId;
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
                    var exisitingStock = phrmdbcontext.WardStock.Where(a => a.StoreId == stockToAdd.StoreId && a.ItemId == stockToAdd.ItemId && a.BatchNo == stockToAdd.BatchNo && a.ExpiryDate == stockToAdd.ExpiryDate && a.SalePrice == stockToAdd.SalePrice).FirstOrDefault();
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
                //        item.SubTotal = item.Quantity * (Convert.ToDecimal(item.SalePrice));
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
                        item.SalePrice = provisionalItem[i].SalePrice;
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
                        phrmdbcontext.Entry(grItm).Property(x => x.CreatedBy).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.CreatedOn).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.DiscountPercentage).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.FreeQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.GoodReceiptId).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.GRItemPrice).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ItemId).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ItemName).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SalePrice).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.ReceivedQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.RejectedQuantity).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SellingPrice).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.SubTotal).IsModified = false;
                        phrmdbcontext.Entry(grItm).Property(x => x.TotalAmount).IsModified = false;
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

            int maxCreditNoteId = 0;
            int maxCreditNoteNum = 0;

            var ReturnData = phrmdbcontext.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).ToList();
            if (ReturnData == null)
            {
                maxCreditNoteId = ReturnData.Max(a => a.CreditNoteId);
            }
            var ReturnItemData = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).ToList();
            if (ReturnItemData == null)
            {
                maxCreditNoteNum = ReturnItemData.Max(a => a.CreditNoteNumber);
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
                        invItm.CreditNoteNumber = (maxCreditNoteNum + 1);
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
                    ClientData.CreditNoteId = (maxCreditNoteId + 1);
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
        internal static int PostPOWithPOItems(PurchaseOrder_DTO purchaseOrderDTO, RbacUser currentUser, PharmacyDbContext phrmdbcontext, IMapper mapper)
        {
            var currentDate = DateTime.Now;
            try
            {
                PHRMPurchaseOrderModel purchaseOrder = MapPurchaseOrderDTOToPurchaseOrderModel(purchaseOrderDTO, mapper);
                purchaseOrder.PHRMPurchaseOrderItems.ForEach(item =>
                {
                    item.CreatedOn = currentDate;
                    item.CreatedBy = currentUser.EmployeeId;
                    item.PendingQuantity = item.Quantity;
                    item.POItemStatus = ENUM_PharmacyPurchaseOrderStatus.Active;
                    item.PendingFreeQuantity = item.FreeQuantity;
                });
                purchaseOrder.VerifierIds = SerializePHRMPOVerifiers(purchaseOrderDTO.VerifierList);
                purchaseOrder.POStatus = purchaseOrder.IsVerificationEnabled ? ENUM_PharmacyPurchaseOrderStatus.Pending : ENUM_PharmacyPurchaseOrderStatus.Active;
                purchaseOrder.CreatedOn = currentDate;
                purchaseOrder.CreatedBy = currentUser.EmployeeId;
                purchaseOrder.FiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                purchaseOrder.PurchaseOrderNo = GetPurchaseOrderNo(phrmdbcontext, purchaseOrder.FiscalYearId);
                phrmdbcontext.PHRMPurchaseOrder.Add(purchaseOrder);
                phrmdbcontext.SaveChanges();
                return purchaseOrder.PurchaseOrderId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        public static string SerializePHRMPOVerifiers(List<PHRMPOVerifier_DTO> verifiers)
        {
            var VerifierList = new List<object>();
            verifiers.ForEach(verifier =>
            {
                VerifierList.Add(new { Id = verifier.Id, Type = verifier.Type });
            });
            return DanpheJSONConvert.SerializeObject(VerifierList).Replace(" ", String.Empty);
        }
        private static PHRMPurchaseOrderModel MapPurchaseOrderDTOToPurchaseOrderModel(PurchaseOrder_DTO purchaseOrderDTO, IMapper mapper)
        {
            var purchaseOrderItemList = new List<PHRMPurchaseOrderItemsModel>();

            var purchaseOrder = mapper.Map<PHRMPurchaseOrderModel>(purchaseOrderDTO);
            foreach (var item in purchaseOrderDTO.PHRMPurchaseOrderItems)
            {
                var purchaseOrderItems = mapper.Map<PHRMPurchaseOrderItemsModel>(item);
                purchaseOrderItemList.Add(purchaseOrderItems);
            }
            purchaseOrder.PHRMPurchaseOrderItems = purchaseOrderItemList;
            return purchaseOrder;
        }


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
                             storeStock: storeStock,
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
            return db.PHRMRack.Where(rack => rack.RackId == rackId).Select(rack => rack.RackNo).FirstOrDefault() ?? ENUM_AssignNullValue.NA;
        }
        #region Add or update dispensary Stock List in PHRM_DispensaryStock table
        /// <summary>
        /// Add or Update Dispensary Stock Based On ItemId,Batch,ExpiryDate,SalePrice,Price,StockId.
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
        #region UPDATE SalePrice IN MAIN STORE

        public static async Task<PHRMUpdatedStockVM> UpdateMRPForAllStock(PHRMUpdatedStockVM mrpUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var masterStocks = await db.StockMasters.Where(SS => SS.ItemId == mrpUpdatedStock.ItemId && SS.ExpiryDate == mrpUpdatedStock.ExpiryDate && SS.BatchNo == mrpUpdatedStock.BatchNo && SS.SalePrice == mrpUpdatedStock.OldMRP && SS.CostPrice == mrpUpdatedStock.CostPrice).ToListAsync();
                    var storeStocks = await db.StoreStocks.Where(SS => SS.ItemId == mrpUpdatedStock.ItemId && SS.SalePrice == mrpUpdatedStock.OldMRP && SS.CostPrice == mrpUpdatedStock.CostPrice).ToListAsync();

                    if (masterStocks == null) throw new Exception("Stock Not Found");
                    foreach (var stock in masterStocks)
                    {
                        //Update mrp of master stock
                        stock.UpdateMRP(mrpUpdatedStock.SalePrice, currentUser.EmployeeId);


                        //Update history table for old mrp end-date
                        var oldStockMRPHistory = await db.MRPHistories.FirstOrDefaultAsync(s => s.StockId == stock.StockId && s.EndDate == null);
                        if (oldStockMRPHistory != null)
                        {
                            oldStockMRPHistory.EndDate = currentDate;
                        }
                        //Create New History for new SalePrice
                        var newStockMRPHistory = new PHRMMRPHistoryModel()
                        {
                            StockId = stock.StockId.Value,
                            SalePrice = mrpUpdatedStock.SalePrice,
                            CreatedBy = currentUser.EmployeeId,
                            StartDate = currentDate,
                        };
                        db.MRPHistories.Add(newStockMRPHistory);
                    }
                    storeStocks.ForEach(ss =>
                    {
                        ss.UpdateMRP(mrpUpdatedStock.SalePrice);
                    });
                    await db.SaveChangesAsync();
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
                    var stockMasters = await db.StockMasters.Where(SS => SS.ItemId == expbatchUpdatedStock.ItemId && SS.ExpiryDate == expbatchUpdatedStock.OldExpiryDate && SS.BatchNo == expbatchUpdatedStock.OldBatchNo && SS.SalePrice == expbatchUpdatedStock.SalePrice && SS.CostPrice == expbatchUpdatedStock.CostPrice).ToListAsync();

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
                    //var mainStoreCategory = ENUM_StoreCategory.Store;
                    var mainStoreObj = db.PHRMStore.Where(s => s.Category == ENUM_StoreCategory.Store && s.SubCategory == ENUM_StoreSubCategory.Pharmacy).FirstOrDefault();
                    if (mainStoreObj == null)
                    {
                        throw new Exception("Main Store not found");
                    }

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
                    int dispatchId=0;
                    //Add data in store dispatchItem table
                    if (dispatchedItems[0].DispatchId == null )
                    {
                         dispatchId = (from D in db.StoreDispatchItems
                                          select D.DispatchId).DefaultIfEmpty(0).Max() ?? 0;
                        dispatchId++;
                    }
                    else
                    {
                        dispatchId = (int)dispatchedItems[0].DispatchId;
                    }
                    for (int i = 0; i < dispatchedItems.Count(); i++)
                    {
                        dispatchedItems[i].SourceStoreId = mainStoreObj.StoreId;
                        dispatchedItems[i].CreatedBy = currentUser.EmployeeId;
                        dispatchedItems[i].CreatedOn = currentDateTime;
                        dispatchedItems[i].DispatchId = dispatchId;
                        dispatchedItems[i].RequisitionId = requisition.RequisitionId;
                        dispatchedItems[i].RequisitionItemId = requisition.RequisitionItems[i].RequisitionItemId;
                        dispatchedItems[i].PendingQuantity = (decimal)dispatchedItems[i].DispatchedQuantity;
                        db.StoreDispatchItems.Add(dispatchedItems[i]);
                    }
                    //Save Dispatch Items
                    await db.SaveChangesAsync();

                    //Find the stock to be decreased for each dispatched item
                    foreach (var dispatchItem in dispatchedItems)
                    {
                        var stockList = await db.StoreStocks.Include(s => s.StockMaster).Where(s => s.StoreId == dispatchItem.SourceStoreId && s.ItemId == dispatchItem.ItemId && s.AvailableQuantity > 0 && s.StockMaster.BatchNo == dispatchItem.BatchNo && s.StockMaster.ExpiryDate == dispatchItem.ExpiryDate && s.StockMaster.CostPrice == dispatchItem.CostPrice && s.StockMaster.SalePrice == dispatchItem.SalePrice && s.IsActive == true).ToListAsync();                        //If no stock found, stop the process
                        if (stockList == null) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");
                        //If total available quantity is less than the required/dispatched quantity, then stop the process
                        if (stockList.Sum(s => s.AvailableQuantity) < dispatchItem.DispatchedQuantity) throw new Exception($"Stock is not available for ItemId = {dispatchItem.ItemId}, BatchNo ={dispatchItem.BatchNo}");

                        var totalRemainingQty = dispatchItem.DispatchedQuantity;
                        foreach (var mainStoreStock in stockList)
                        {
                            var stockTxn = new PHRMStockTransactionModel(
                                storeStock: mainStoreStock,
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
                                                                quantity: 0,
                                                                costPrice: dispatchItem.CostPrice,
                                                                salePrice: dispatchItem.SalePrice);
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

        #region UpdateStockFromExcel
        public static string UpdateReconciledStockFromExcel(List<PharmacyStockModel> stockList, RbacUser currentUser, PharmacyDbContext pharmacyDbContext)
        {
            var stockTransaction = new PHRMStockTransactionModel();
            var currentDate = DateTime.Now;
            var currentFiscYrId = GetFiscalYear(pharmacyDbContext).FiscalYearId;
            PHRMStoreStockModel strstk = new PHRMStoreStockModel();
            using (var db = pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var stock in stockList)
                    {
                        /*Manipal-RevisionNeeded*/
                        //Rohit/Sud:4Apr'23: Need to Generate NewReferenceNo for Stockmanage transactions as well -- to do after manipal
                        Random generator = new Random();
                        int stockReconcilatioRefNo_Dummy = generator.Next(1, 999999);

                        double diffQty = stock.NewAvailableQuantity - stock.AvailableQuantity;
                        var stocks = pharmacyDbContext.StoreStocks.Include(s => s.StockMaster)
                                        .FirstOrDefault(x => x.StockId == stock.StockId && x.ItemId == stock.ItemId && x.StoreId == stock.StoreId);
                        if (stocks != null)
                        {
                            if (diffQty == 0)
                            {
                                continue;
                            }
                            else if (diffQty > 0)
                            {

                                stocks.UpdateAvailableQuantity(stock.NewAvailableQuantity);
                                // create new txn for this store
                                stockTransaction = new PHRMStockTransactionModel(
                                                    storeStock: stocks,
                                                    transactionType: ENUM_PHRM_StockTransactionType.StockManage,
                                                    transactionDate: currentDate,
                                                    referenceNo: stockReconcilatioRefNo_Dummy,
                                                    createdBy: currentUser.EmployeeId,
                                                    createdOn: currentDate,
                                                    fiscalYearId: currentFiscYrId
                                                    );
                                stockTransaction.SetInOutQuantity(diffQty, 0);
                                pharmacyDbContext.StockTransactions.Add(stockTransaction);
                            }
                            else if (diffQty < 0)
                            {
                                stocks.UpdateAvailableQuantity(stock.NewAvailableQuantity);
                                // create new txn for this store
                                stockTransaction = new PHRMStockTransactionModel(
                                                    storeStock: stocks,
                                                    transactionType: ENUM_PHRM_StockTransactionType.StockManage,
                                                    transactionDate: currentDate,
                                                    referenceNo: stockReconcilatioRefNo_Dummy,
                                                    createdBy: currentUser.EmployeeId,
                                                    createdOn: currentDate,
                                                    fiscalYearId: currentFiscYrId
                                                    );
                                stockTransaction.SetInOutQuantity(0, Math.Abs(diffQty));
                                pharmacyDbContext.StockTransactions.Add(stockTransaction);
                            }
                        }

                    }
                    pharmacyDbContext.SaveChanges();
                    db.Commit();
                }
                catch (Exception ex)
                {
                    db.Rollback();
                    throw ex;
                }
            }
            return null;
        }
        #endregion
        #region Multiple Invoice Item Return
        public static object PostReturnMultipleInvoiceFromCustomer(PharmacyDbContext db, PHRMInvoiceReturnModel returnInvoice, RbacUser currentUser, BillingDbContext billingDbContext)
        {
            var currFiscalYear = PharmacyBL.GetFiscalYear(db);
            var currentDate = DateTime.Now;

            var currentMaxCreditNoteNum = db.PHRMInvoiceReturnModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId)
                .Select(a => a.CreditNoteId).DefaultIfEmpty(0).Max();

            using (var dbContextTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    #region Save Return Detail

                    SaveInvoiceReturnDetails(db, returnInvoice, currentUser, currentDate, currentMaxCreditNoteNum);
                    #endregion

                    #region Adding Employee Cash Transaction
                    SaveEmployeeCashTransaction(db, returnInvoice, currentUser, currentDate);
                    #endregion

                    #region To Update the Credit Status And Credit Balance of the Patient 
                    UpdatePharmacyCreditStatusAndCreditBalanceUsingMultipleInvoice(db, returnInvoice.InvoiceReturnItems, currentUser);
                    #endregion

                    #region Stock ManipulationS
                    StockManipulationAfterInvoiceReturn(db, returnInvoice, currentUser, currFiscalYear, currentDate);
                    #endregion

                    dbContextTransaction.Commit();
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            return returnInvoice.InvoiceReturnId;
        }
        #endregion

        private static void SaveInvoiceReturnDetails(PharmacyDbContext db, PHRMInvoiceReturnModel returnInvoice, RbacUser currentUser, DateTime currentDate, int maxCreditNoteNum)
        {
            returnInvoice.CreatedBy = currentUser.EmployeeId;
            returnInvoice.CreatedOn = currentDate;
            returnInvoice.CreditNoteId = maxCreditNoteNum + 1;
            returnInvoice.ReferenceInvoiceNo = String.Join(",", returnInvoice.InvoiceReturnItems.Select(p => p.InvoiceNo).Distinct());
            returnInvoice.InvoiceReturnItems.ForEach(itm =>
            {
                itm.CreatedBy = currentUser.EmployeeId;
                itm.CreatedOn = currentDate;
                //itm.CreditNoteNumber = maxCreditNoteNum + 1;
                itm.StoreId = returnInvoice.StoreId;
                itm.CounterId = returnInvoice.CounterId;
                itm.Price = itm.SalePrice;
            });
            db.PHRMInvoiceReturnModel.Add(returnInvoice);
            db.SaveChanges();
        }
        private static void SaveEmployeeCashTransaction(PharmacyDbContext db, PHRMInvoiceReturnModel returnInvoice, RbacUser currentUser, DateTime currentDate)
        {
            List<PHRMEmployeeCashTransaction> empTxns = new List<PHRMEmployeeCashTransaction>();
            PHRMEmployeeCashTransaction empTxn = new PHRMEmployeeCashTransaction();
            if (returnInvoice.ReturnCashAmount > 0)
            {
                PaymentModes MstPaymentModes = db.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == ENUM_BillPaymentMode.cash).FirstOrDefault();
                empTxn.PaymentModeSubCategoryId = MstPaymentModes.PaymentSubCategoryId;
                empTxn.CounterID = returnInvoice.CounterId;
                empTxn.TransactionType = ENUM_EmpCashTransactionType.SalesReturn;
                empTxn.OutAmount = returnInvoice.ReturnCashAmount;
                empTxn.InAmount = 0;
                empTxn.ReferenceNo = returnInvoice.InvoiceReturnId;
                empTxn.PatientId = returnInvoice.PatientId;
                empTxn.EmployeeId = currentUser.EmployeeId;
                empTxn.ModuleName = ENUM_ModuleNames.Dispensary;
                empTxn.TransactionDate = currentDate;
                empTxn.Remarks = "sales-return";
                empTxn.IsActive = true;
                empTxn.FiscalYearId = returnInvoice.FiscalYearId;
                empTxns.Add(empTxn);
                db.phrmEmployeeCashTransaction.AddRange(empTxns);
                db.SaveChanges();
            }
        }

        private static void UpdatePharmacyCreditStatusAndCreditBalanceUsingMultipleInvoice(PharmacyDbContext pharmacyDbContext, List<PHRMInvoiceReturnItemsModel> phrmInvoiceReturnItems, RbacUser currentUser)
        {
            try
            {
                foreach (var phrmInvoiceReturnItem in phrmInvoiceReturnItems)
                {
                    var phrmCreditStatusObj = pharmacyDbContext.PHRMTransactionCreditBillStatus.Where(a => a.InvoiceId == phrmInvoiceReturnItem.InvoiceId).FirstOrDefault();

                    if (phrmCreditStatusObj != null)
                    {
                        //Incase of multiple return: We need to add previous return amount and current return total (ReturnTotalBill =prevReturnTotalBillAmount + phrmInvoiceReturn.TotalAmount )
                        decimal prevRetBillAmount = phrmCreditStatusObj.ReturnTotalBillAmount;
                        phrmCreditStatusObj.ReturnTotalBillAmount = phrmInvoiceReturnItem.TotalAmount + prevRetBillAmount;

                        decimal prevCoPayReturn = phrmCreditStatusObj.CoPayReturnAmount;
                        decimal currentCoPayReturn = phrmInvoiceReturnItem.IsCoPayment ? phrmInvoiceReturnItem.ReturnCashAmount : 0;
                        phrmCreditStatusObj.CoPayReturnAmount = prevCoPayReturn + currentCoPayReturn;

                        phrmCreditStatusObj.NetReceivableAmount = phrmCreditStatusObj.SalesTotalBillAmount - phrmCreditStatusObj.CoPayReceivedAmount - (phrmCreditStatusObj.ReturnTotalBillAmount - phrmCreditStatusObj.CoPayReturnAmount);

                        phrmCreditStatusObj.ModifiedOn = DateTime.Now;
                        phrmCreditStatusObj.ModifiedBy = currentUser.EmployeeId;

                        pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ReturnTotalBillAmount).IsModified = true;
                        pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.CoPayReturnAmount).IsModified = true;
                        pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.NetReceivableAmount).IsModified = true;
                        pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ModifiedOn).IsModified = true;
                        pharmacyDbContext.Entry(phrmCreditStatusObj).Property(p => p.ModifiedBy).IsModified = true;
                        UpdateSchemeBalanceFromMultipleInvoice(pharmacyDbContext, phrmInvoiceReturnItem, currentUser, phrmCreditStatusObj);
                    }
                }
            }
            catch (Exception)
            {

                throw;
            }
        }

        private static void UpdateSchemeBalanceFromMultipleInvoice(PharmacyDbContext pharmacyDbContext, PHRMInvoiceReturnItemsModel phrmInvoiceReturnItem, RbacUser currentUser, PHRMTransactionCreditBillStatus phrmCreditStatusObj)
        {
            var patientSchemeMapDetails = pharmacyDbContext.PatientSchemeMaps.Where(a => a.PatientId == phrmInvoiceReturnItem.PatientId && a.SchemeId == phrmInvoiceReturnItem.SchemeId && a.IsActive == true).FirstOrDefault();
            var patientVisitDetails = pharmacyDbContext.PHRMPatientVisit.OrderByDescending(a => a.PatientVisitId).FirstOrDefault(a => a.PatientVisitId == phrmCreditStatusObj.PatientVisitId);

            if (patientSchemeMapDetails != null && phrmInvoiceReturnItem.IsCoPayment && patientVisitDetails != null)
            {
                if (patientVisitDetails.VisitType.ToLower() != ENUM_VisitType.inpatient.ToLower())
                {
                    patientSchemeMapDetails.OpCreditLimit = patientSchemeMapDetails.OpCreditLimit + phrmInvoiceReturnItem.TotalAmount;
                    pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.OpCreditLimit).IsModified = true;
                }
                else
                {
                    patientSchemeMapDetails.IpCreditLimit = (decimal)(patientSchemeMapDetails.IpCreditLimit + phrmInvoiceReturnItem.TotalAmount);
                    pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.IpCreditLimit).IsModified = true;
                }
                patientSchemeMapDetails.ModifiedBy = currentUser.EmployeeId;
                patientSchemeMapDetails.ModifiedOn = DateTime.Now;

                pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.ModifiedBy).IsModified = true;
                pharmacyDbContext.Entry(patientSchemeMapDetails).Property(p => p.ModifiedOn).IsModified = true;
                pharmacyDbContext.SaveChanges();

                var scheme = pharmacyDbContext.Schemes.FirstOrDefault(a => a.SchemeId == patientVisitDetails.SchemeId);
                if (scheme != null && scheme.ApiIntegrationName == ENUM_Scheme_ApiIntegrationNames.Medicare)
                {
                    UpdateMedicareBalanceAfterReturn(patientVisitDetails, pharmacyDbContext, phrmInvoiceReturnItem.TotalAmount);
                }
            }
        }
        private static void StockManipulationAfterInvoiceReturn(PharmacyDbContext db, PHRMInvoiceReturnModel returnInvoice, RbacUser currentUser, PharmacyFiscalYear currFiscalYear, DateTime currentDate)
        {
            returnInvoice.InvoiceReturnItems.ForEach(returnedItem =>
            {
                List<int> previouslyReturnedInvRetItemId = db.PHRMInvoiceReturnItemsModel.Where(i => i.InvoiceItemId == returnedItem.InvoiceItemId).Select(a => a.InvoiceReturnItemId).ToList();

                var SaleTxn = ENUM_PHRM_StockTransactionType.SaleItem;
                var SaleReturnTxn = ENUM_PHRM_StockTransactionType.SaleReturnedItem;
                var allStockTxnsForThisInvoiceItem = db.StockTransactions
                                                                .Where(s => (s.ReferenceNo == returnedItem.InvoiceItemId && s.TransactionType == SaleTxn)
                                                                || (previouslyReturnedInvRetItemId.Contains(s.ReferenceNo) && s.TransactionType == SaleReturnTxn)).ToList();

                if (previouslyReturnedInvRetItemId != null || previouslyReturnedInvRetItemId.Count > 0)
                {
                    double totalSoldQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == SaleTxn).Sum(b => b.OutQty);
                    double? totalReturnedQtyForThisItem = allStockTxnsForThisInvoiceItem.Where(a => a.TransactionType == SaleReturnTxn).Sum(b => b.InQty);

                    double totalReturnableQtyForThisItem = totalSoldQtyForThisItem - (totalReturnedQtyForThisItem ?? 0);

                    if (totalReturnableQtyForThisItem < (double)returnedItem.ReturnedQty) throw new Exception($"{totalReturnableQtyForThisItem} qty is already returned for {returnedItem.ItemName} with Batch : {returnedItem.BatchNo} ");
                }

                var stockIdList = allStockTxnsForThisInvoiceItem.Select(s => s.StockId).Distinct().ToList();
                var soldByStoreId = allStockTxnsForThisInvoiceItem[0].StoreId;
                var stockList = db.StoreStocks.Include(s => s.StockMaster).Where(s => stockIdList.Contains(s.StockId) && s.StoreId == soldByStoreId).ToList();


                var remainingReturnedQuantity = returnedItem.ReturnedQty;

                foreach (var stock in stockList)
                {
                    double soldQuantityForThisStock = allStockTxnsForThisInvoiceItem.Where(s => s.StockId == stock.StockId).Sum(s => s.OutQty);
                    double? previouslyReturnedQuantityForThisStock = allStockTxnsForThisInvoiceItem.Where(s => s.StockId == stock.StockId).Sum(s => s.InQty);
                    double totalReturnableQtyForThisStock = soldQuantityForThisStock - (previouslyReturnedQuantityForThisStock ?? 0);
                    PHRMStockTransactionModel newStockTxn = null;
                    if (totalReturnableQtyForThisStock == 0)
                    {
                        continue;
                    }
                    if (totalReturnableQtyForThisStock < (double)remainingReturnedQuantity)
                    {
                        if (stock.StoreId == returnedItem.StoreId)
                        {
                            stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + totalReturnableQtyForThisStock);

                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: stock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        else
                        {
                            var returningStoreStock = db.StoreStocks.Include(a => a.StockMaster).FirstOrDefault(s => s.StockId == stock.StockId && s.StoreId == returnedItem.StoreId);
                            if (returningStoreStock != null)
                            {
                                returningStoreStock.UpdateAvailableQuantity(returningStoreStock.AvailableQuantity + totalReturnableQtyForThisStock);
                            }
                            else
                            {
                                returningStoreStock = new PHRMStoreStockModel(
                                    stockMaster: stock.StockMaster,
                                    storeId: returnedItem.StoreId,
                                    quantity: totalReturnableQtyForThisStock,
                                    costPrice: stock.CostPrice,
                                    salePrice: stock.SalePrice
                                    );

                                db.StoreStocks.Add(returningStoreStock);
                                db.SaveChanges();
                            }
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: returningStoreStock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        newStockTxn.SetInOutQuantity(inQty: totalReturnableQtyForThisStock, outQty: 0);
                        remainingReturnedQuantity -= (decimal)totalReturnableQtyForThisStock;
                    }
                    else
                    {
                        if (stock.StoreId == returnedItem.StoreId)
                        {
                            stock.UpdateAvailableQuantity(newQty: stock.AvailableQuantity + (double)remainingReturnedQuantity);
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: stock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        else
                        {
                            var returningStoreStock = db.StoreStocks.Include(a => a.StockMaster).FirstOrDefault(s => s.StoreStockId == stock.StoreStockId && s.StoreId == returnedItem.StoreId);
                            if (returningStoreStock != null)
                            {
                                returningStoreStock.UpdateAvailableQuantity(newQty: returningStoreStock.AvailableQuantity + (double)remainingReturnedQuantity);
                            }
                            else
                            {
                                returningStoreStock = new PHRMStoreStockModel(
                                    stockMaster: stock.StockMaster,
                                    storeId: returnedItem.StoreId,
                                    quantity: (double)remainingReturnedQuantity,
                                    costPrice: stock.CostPrice,
                                    salePrice: stock.SalePrice
                                    );
                                db.StoreStocks.Add(returningStoreStock);
                                db.SaveChanges();
                            }
                            newStockTxn = new PHRMStockTransactionModel(
                                                storeStock: returningStoreStock,
                                                transactionType: ENUM_PHRM_StockTransactionType.SaleReturnedItem,
                                                transactionDate: currentDate,
                                                referenceNo: returnedItem.InvoiceReturnItemId,
                                                createdBy: currentUser.EmployeeId,
                                                createdOn: currentDate,
                                                fiscalYearId: currFiscalYear.FiscalYearId
                                                );
                        }
                        newStockTxn.SetInOutQuantity(inQty: (double)remainingReturnedQuantity, outQty: 0);
                        remainingReturnedQuantity = 0;
                    }
                    db.StockTransactions.Add(newStockTxn);
                    db.SaveChanges();

                    if (remainingReturnedQuantity == 0)
                    {
                        break;
                    }
                }
                db.SaveChanges();
            });
        }

        private static int GetReferenceNo(PharmacyDbContext db)
        {
            int referenceNo = (from po in db.PHRMPurchaseOrderItems
                               select po.PurchaseOrderId).DefaultIfEmpty(0).Max();
            return referenceNo + 1;
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

//Deep Clone : Rohit
public static class SystemExtension
{
    public static T Clone<T>(this T source)
    {
        var serialized = JsonConvert.SerializeObject(source);
        return JsonConvert.DeserializeObject<T>(serialized);
    }
}

//Assign source object to destination object
//TParent is source object
//TChild is destination object: Rohit
//public static class PropertyCopier<TParent, TChild> where TParent : class
//                                            where TChild : class
//{
//    public static void Copy(TParent parent, TChild child)
//    {
//        var parentProperties = parent.GetType().GetProperties();
//        var childProperties = child.GetType().GetProperties();

//        foreach (var parentProperty in parentProperties)
//        {
//            foreach (var childProperty in childProperties)
//            {
//                if (parentProperty.Name == childProperty.Name && parentProperty.PropertyType == childProperty.PropertyType)
//                {
//                    childProperty.SetValue(child, parentProperty.GetValue(parent));
//                    break;
//                }
//            }
//        }
//    }
//}
public static class PropertyCopier<TParent, TChild> where TParent : class
                                            where TChild : class
{
    private static readonly IMapper mapper = new MapperConfiguration(cfg =>
    {
        cfg.CreateMap<TParent, TChild>();
    }).CreateMapper();

    public static void Copy(TParent parent, TChild child)
    {
        mapper.Map(parent, child);
    }
}
