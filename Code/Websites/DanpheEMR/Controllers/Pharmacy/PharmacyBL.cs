using System;
using System.Collections.Generic;
using System.Linq;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using RefactorThis.GraphDiff;//for entity-update.
using System.Data.Entity;
using Microsoft.AspNetCore.Http;
using DanpheEMR.ServerModel.PharmacyModels;

using System.Configuration;
using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using DanpheEMR.Utilities;
using System.Data;
using System.Data.Entity.Migrations;
using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;

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
        public static BillingFiscalYear GetFiscalYear(string connString)
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
                    List<bool> flag = new List<bool>(); //for checking all transaction status
                                                        ////Add GoodsReceiptItems
                    bool isPoOrder = false;
                    isPoOrder = (grViewModelData.purchaseOrder.PurchaseOrderId <= 0) ? true : false;
                    //add server side createdby,authorizedby,
                    //save po and poitems first when gr without po created by user
                    if (isPoOrder == true)
                    {
                        bool poResultFlag = false;
                        poResultFlag = PostPOWithPOItems(grViewModelData.purchaseOrder, phrmdbcontext);
                        grViewModelData.goodReceipt.PurchaseOrderId = grViewModelData.purchaseOrder.PurchaseOrderId;
                        flag.Add(poResultFlag);
                    }

                    var GRItmReslt = AddGoodsReceiptAndGoodReceiptItems(phrmdbcontext, grViewModelData, currentUser);
                    flag.Add(GRItmReslt);

                    if (isPoOrder == false)
                    {
                        ///// Update  PO Status
                        var PoStsReslt = UpdatePOandPOItemsStatus(phrmdbcontext, grViewModelData);
                        flag.Add(PoStsReslt);
                    }

                    Boolean addStoreStockResponse = AddPhrmStoreStock(grViewModelData, phrmdbcontext, "in", currentUser);

                    flag.Add(addStoreStockResponse);

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
                    //Rollback all transaction if exception occured  i.e. WriteOff Insertion, Stock_Transaction Insertion, Stock Updation
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private static Boolean AddPhrmStoreStock(PHRMGoodsReceiptViewModel grViewModelData, PharmacyDbContext phrmdbcontext, string inout, RbacUser currentUser)
        {
            try
            {
                /// Getting GrId 
                var GRID = grViewModelData.goodReceipt.GoodReceiptId;
                /// Get GrItemsList based on GRID
                var grItemsList = (from GrItems in phrmdbcontext.PHRMGoodsReceiptItems
                                   join gr in phrmdbcontext.PHRMGoodsReceipt on GrItems.GoodReceiptId equals gr.GoodReceiptId
                                   where GrItems.GoodReceiptId == GRID
                                   select GrItems

                                ).ToList();
                List<bool> flag = new List<bool>();

                for (int i = 0; i < grItemsList.Count; i++)
                {
                    var selectedStoreStock = new PHRMStoreStockModel();
                    selectedStoreStock.ItemId = grItemsList[i].ItemId;
                    selectedStoreStock.ItemName = grItemsList[i].ItemName;
                    selectedStoreStock.BatchNo = grItemsList[i].BatchNo;
                    selectedStoreStock.ExpiryDate = grItemsList[i].ExpiryDate;
                    selectedStoreStock.CCCharge = grItemsList[i].CCCharge;
                    selectedStoreStock.Quantity = grItemsList[i].ReceivedQuantity;
                    selectedStoreStock.FreeQuantity = grItemsList[i].FreeQuantity;
                    selectedStoreStock.Price = grItemsList[i].GRItemPrice;
                    selectedStoreStock.DiscountPercentage = grItemsList[i].DiscountPercentage;
                    selectedStoreStock.VATPercentage = grItemsList[i].VATPercentage;
                    selectedStoreStock.SubTotal = grItemsList[i].SubTotal;
                    selectedStoreStock.TotalAmount = grItemsList[i].TotalAmount;
                    selectedStoreStock.InOut = inout;
                    selectedStoreStock.ReferenceNo = grItemsList[i].GoodReceiptItemId;
                    selectedStoreStock.GoodsReceiptItemId = grItemsList[i].GoodReceiptItemId;
                    selectedStoreStock.ReferenceItemCreatedOn = DateTime.Now;
                    selectedStoreStock.TransactionType = "goodsreceipt"; ///during GR Transaction Type is goodsreceipt
                    selectedStoreStock.MRP = grItemsList[i].MRP;
                    selectedStoreStock.CreatedBy = grItemsList[i].CreatedBy;
                    selectedStoreStock.CreatedOn = DateTime.Now;
                    selectedStoreStock.StoreId = grViewModelData.goodReceipt.StoreId;
                    selectedStoreStock.StoreName = grViewModelData.goodReceipt.StoreName;
                    selectedStoreStock.IsActive = true;
                    phrmdbcontext.PHRMStoreStock.Add(selectedStoreStock);
                    phrmdbcontext.SaveChanges();
                    flag.Add(true);

                    // for direct transfer to Dispensary stock
                    if (grViewModelData.goodReceipt.SendDirectToDispensary && grViewModelData.goodReceipt.SelectedDispensaryId > 0)
                    {
                        selectedStoreStock.DispensaryId = grViewModelData.goodReceipt.SelectedDispensaryId;
                        selectedStoreStock.UpdatedQty = grItemsList[i].ReceivedQuantity + grItemsList[i].FreeQuantity; // while transfer, updated quantity is transfering quantity
                        selectedStoreStock.InOut = "out";
                        var stockTfrFlag = TransferStoreStockToDispensary(selectedStoreStock, phrmdbcontext, currentUser);

                        flag.Add(stockTfrFlag);
                    }
                }

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
                return false;
            }
        }

        public static BillingFiscalYear GetFiscalYear(PharmacyDbContext phrmdbcontext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return phrmdbcontext.BillingFiscalYear.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }


        public static BillingFiscalYear GetFiscalYearGoodsReceipt(PharmacyDbContext phrmdbcontext, DateTime? DecidingDate = null)
        {
            DecidingDate = (DecidingDate == null) ? DateTime.Now.Date : DecidingDate;
            return phrmdbcontext.BillingFiscalYear.Where(fsc => fsc.StartYear <= DecidingDate && fsc.EndYear >= DecidingDate).FirstOrDefault();
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
        public static string GetFiscalYearFormattedName(PharmacyDbContext phrmdbcontext, int? fiscalYearId)
        {
            if (fiscalYearId != null)
            {
                return phrmdbcontext.BillingFiscalYear.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearFormatted;
            }
            else
            {
                return "";
            }

        }
        /// <summary>
        /// This is whole single transaction of Invoice
        /// From Client-Invoice,InvoiceItems, GRItems info
        /// Make - Stock, StockTransaction object and do below transaction
        /// Transactions as below
        /// 1. Save Invoice Details                     2.Save Invoice Items Details
        /// 3. Save Stock Transaction Items Details     4.Update GRItems (stock) details (available qty)
        /// 5. Update Stock Details (Available Quantity)
        /// Note: if above five transaction done successfully then Invoice Post done, If any one fails will all operation rollback
        /// </summary>
        public static PHRMInvoiceTransactionModel InvoiceTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var discPer = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status  
                    //Check whether stock is available
                    //var test = SalesValidation(invoiceDataFromClient, phrmdbcontext);
                    //if (test)
                    //{

                    //}
                    //Save Invoice And Invoice Items details
                    var saveRes = SaveInvoiceAndInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser);
                    flag.Add(saveRes);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    invoiceDataFromClient.InvoiceItems.ForEach(
                        itm =>
                        {
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                            tempdispensaryStkTxn.StockId = Convert.ToInt32(itm.StockId);
                            tempdispensaryStkTxn.AvailableQuantity = itm.Quantity;
                            tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                            tempdispensaryStkTxn.MRP = itm.MRP;
                            tempdispensaryStkTxn.InOut = "out";
                            tempdispensaryStkTxn.ItemId = itm.ItemId;
                            tempdispensaryStkTxn.Price = itm.Price;
                            tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                            phrmDispensaryItems.Add(tempdispensaryStkTxn);
                        }
                        );
                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                    flag.Add(addUpdateDispensaryReslt);


                    //Make StockTransaction object data for post/save
                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    //loop InvoiceItems and make stock transaction object
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        List<string> BatchNoForInvoiceItems = new List<string>();
                        //Quantity of InvoiceItems
                        //var discPer = (invoiceDataFromClient.DiscountAmount/ invoiceDataFromClient.SubTotal)*100;                     
                        var currQuantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        var tempStockTxnItems = new PHRMStockTransactionItemsModel();
                        tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        tempStockTxnItems.CreatedOn = DateTime.Now;
                        tempStockTxnItems.DiscountPercentage = Convert.ToDouble(invoiceDataFromClient.InvoiceItems[i].DiscountPercentage);
                        //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
                        tempStockTxnItems.ExpiryDate = invoiceDataFromClient.InvoiceItems[i].ExpiryDate;
                        tempStockTxnItems.FreeQuantity = invoiceDataFromClient.InvoiceItems[i].FreeQuantity;
                        //just to make insert work
                        tempStockTxnItems.GoodsReceiptItemId = invoiceDataFromClient.InvoiceItems[i].GrItemId;
                        tempStockTxnItems.Quantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        tempStockTxnItems.BatchNo = invoiceDataFromClient.InvoiceItems[i].BatchNo;
                        tempStockTxnItems.InOut = "out";
                        tempStockTxnItems.ItemId = invoiceDataFromClient.InvoiceItems[i].ItemId;
                        tempStockTxnItems.MRP = invoiceDataFromClient.InvoiceItems[i].MRP;
                        tempStockTxnItems.Price = invoiceDataFromClient.InvoiceItems[i].Price;
                        tempStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
                        tempStockTxnItems.ReferenceNo = invoiceDataFromClient.InvoiceItems[i].InvoiceId;
                        tempStockTxnItems.TransactionType = invoiceDataFromClient.PaymentMode == "cash" ? "sale" : "creditsale";
                        tempStockTxnItems.GoodsReceiptItemId = invoiceDataFromClient.InvoiceItems[i].GoodReceiptItemId;
                        string avlbleQty = invoiceDataFromClient.InvoiceItems[i].AvailableQuantity.ToString();
                        invoiceDataFromClient.InvoiceItems[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
                        tempStockTxnItems.SubTotal = Convert.ToDecimal(invoiceDataFromClient.InvoiceItems[i].SubTotal);
                        tempStockTxnItems.TotalAmount = Convert.ToDecimal(invoiceDataFromClient.InvoiceItems[i].TotalAmount);
                        //tempStockTxnItems.TotalAmount = ((tempStockTxnItems.SubTotal * Convert.ToDecimal(tempStockTxnItems.VATPercentage)) / 100) + tempStockTxnItems.SubTotal;
                        phrmStockTxnItems.Add(tempStockTxnItems);
                        if (currQuantity == 0)
                        {
                            break;
                        }
                    }
                    var StkTxnRes = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    flag.Add(StkTxnRes);
                    //Make goodsRecieptItems details object for updation
                    List<PHRMGoodsReceiptItemsModel> grItemsForUpdation = new List<PHRMGoodsReceiptItemsModel>();
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        invoiceDataFromClient.InvoiceItems.ForEach(gritem =>
                        {
                            PHRMGoodsReceiptItemsModel grItemForUpdation = new PHRMGoodsReceiptItemsModel();
                            grItemForUpdation.ItemId = gritem.ItemId.Value;
                            grItemForUpdation.AvailableQuantity = gritem.AvailableQuantity;
                            grItemsForUpdation.Add(grItemForUpdation);
                        });
                    }
                    //Update GRItems Available Quantity details
                    //var UpdateGRRes = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
                    //flag.Add(UpdateGRRes);
                    //Update Available Quantity of Item in Stock Table
                    List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        PHRMStockModel curtStock = new PHRMStockModel();
                        /////get list of Current Stock Item by Passing ItemId
                        int ItemId = Convert.ToInt32(invoiceDataFromClient.InvoiceItems[i].ItemId);
                        curtStock = GetStockItemsByItemId(ItemId, phrmdbcontext);
                        if (curtStock != null)
                        {   /////if Items is Already in Stoock Table then update the stock with latest quantity                                                                                   
                            curtStock.AvailableQuantity = curtStock.AvailableQuantity - Convert.ToDouble(invoiceDataFromClient.InvoiceItems[i].Quantity);
                            updateStockList.Add(curtStock);
                        }
                    }
                    //update stock details//commented: sudarshan--28may'18-- stock list is not available..
                    //uncomment this lateer..
                    //var UpdateStkRes = UpdateStock(phrmdbcontext, updateStockList);
                    //flag.Add(UpdateStkRes);

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
                        flag.Add(updatePresItemsOrderStatus);
                    }
                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return invoiceDataFromClient;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        ///invoiceDataFromClient = new PHRMInvoiceTransactionModel();
                        return invoiceDataFromClient;
                    }
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured 
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
            // using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            //{
            //    try
            //    {
            //        List<Boolean> flag = new List<bool>(); //for checking all transaction status       
            //        //Save Invoice And Invoice Items details
            //        var saveRes = SaveInvoiceAndInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser);
            //        flag.Add(saveRes);
            //        //Make StockTransaction object data for post/save
            //        List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
            //        //loop InvoiceItems and make stock transaction object
            //        for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
            //        {
            //            List<string> BatchNoForInvoiceItems = new List<string>();
            //            //Quantity of InvoiceItems
            //            var currQuantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
            //            //for (int j = 0; j < invoiceDataFromClient.InvoiceItems[i].SelectedGRItems.Count; j++)
            //            //{
            //                var tempStockTxnItems = new PHRMStockTransactionItemsModel();
            //                tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
            //                tempStockTxnItems.CreatedOn = DateTime.Now;
            //                tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
            //                //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].DiscountPercentage;
            //                tempStockTxnItems.ExpiryDate = invoiceDataFromClient.InvoiceItems[i].ExpiryDate;
            //                //tempStockTxnItems.ExpiryDate = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].ExpiryDate;
            //                tempStockTxnItems.FreeQuantity = invoiceDataFromClient.InvoiceItems[i].FreeQuantity;
            //                tempStockTxnItems.GoodsReceiptItemId = invoiceDataFromClient.InvoiceItems[i].GoodReceiptItemId;
            //                //tempStockTxnItems.GoodsReceiptItemId = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].GoodReceiptItemId;
            //                tempStockTxnItems.BatchNo = invoiceDataFromClient.InvoiceItems[i].BatchNo;
            //                //tempStockTxnItems.BatchNo = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].BatchNo;
            //                tempStockTxnItems.InOut = "out";
            //                tempStockTxnItems.ItemId = invoiceDataFromClient.InvoiceItems[i].ItemId;
            //                tempStockTxnItems.MRP = invoiceDataFromClient.InvoiceItems[i].MRP;
            //                tempStockTxnItems.Price = invoiceDataFromClient.InvoiceItems[i].Price;
            //                tempStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
            //                tempStockTxnItems.ReferenceNo = invoiceDataFromClient.InvoiceItems[i].InvoiceItemId;
            //                tempStockTxnItems.TransactionType = "sale";
            //                //if (currQuantity > invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity)
            //                //{
            //                   string avlbleQty = invoiceDataFromClient.InvoiceItems[i].AvailableQuantity.ToString();
            //                //    string avlbleQty = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity.ToString();
            //                //    tempStockTxnItems.Quantity = Convert.ToDouble(avlbleQty);
            //                //    BatchNoForInvoiceItems.Add(invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].BatchNo);
            //                //    invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity = 0;
            //                //    currQuantity = currQuantity - Convert.ToDouble(avlbleQty);
            //                //}
            //                //else if (currQuantity < invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity)
            //                //{
            //                //    tempStockTxnItems.Quantity = currQuantity;
            //                //    BatchNoForInvoiceItems.Add(invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].BatchNo);
            //                //    string avlbleQty = invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity.ToString();
            //                   invoiceDataFromClient.InvoiceItems[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
            //                //    currQuantity = 0;
            //                //}
            //                //else if (invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity == currQuantity)
            //                //{
            //                //    tempStockTxnItems.Quantity = currQuantity;
            //                //    invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].AvailableQuantity = 0;
            //                //    BatchNoForInvoiceItems.Add(invoiceDataFromClient.InvoiceItems[i].SelectedGRItems[j].BatchNo);
            //                //    currQuantity = 0;
            //                //}
            //                decimal subTotal = (Convert.ToDecimal(tempStockTxnItems.Quantity) - Convert.ToDecimal(tempStockTxnItems.FreeQuantity)) * Convert.ToDecimal(tempStockTxnItems.Price);
            //                decimal discountAmt = (subTotal * Convert.ToDecimal(tempStockTxnItems.DiscountPercentage)) / 100;
            //                tempStockTxnItems.SubTotal = subTotal - discountAmt;
            //                tempStockTxnItems.TotalAmount = ((tempStockTxnItems.SubTotal * Convert.ToDecimal(tempStockTxnItems.VATPercentage)) / 100) + tempStockTxnItems.SubTotal;
            //                phrmStockTxnItems.Add(tempStockTxnItems);
            //                if (currQuantity == 0)
            //                {
            //                    break;
            //                }
            //            //}
            //            //invoiceDataFromClient.InvoiceItems[i].BatchNo = BatchNoForInvoiceItems.Aggregate((x, y) => x + "," + y);
            //        }
            //        //Save StockTransaction details with calling method
            //        var StkTxnRes = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
            //        flag.Add(StkTxnRes);
            //        //Make goodsRecieptItems details object for updation
            //        List<PHRMGoodsReceiptItemsModel> grItemsForUpdation = new List<PHRMGoodsReceiptItemsModel>();
            //        for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
            //        {
            //            invoiceDataFromClient.InvoiceItems.ForEach(gritem =>
            //            {
            //                PHRMGoodsReceiptItemsModel  grItemForUpdation = new PHRMGoodsReceiptItemsModel();
            //                grItemForUpdation.ItemId = gritem.ItemId.Value;
            //                grItemForUpdation.AvailableQuantity = gritem.AvailableQuantity;
            //                grItemsForUpdation.Add(grItemForUpdation);
            //            });
            //        }
            //        //Update GRItems Available Quantity details
            //        var UpdateGRRes = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
            //        flag.Add(UpdateGRRes);
            //        //Update Available Quantity of Item in Stock Table
            //        List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
            //        for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
            //        {
            //            PHRMStockModel curtStock = new PHRMStockModel();
            //            /////get list of Current Stock Item by Passing ItemId
            //            int ItemId = Convert.ToInt32(invoiceDataFromClient.InvoiceItems[i].ItemId);
            //            curtStock = GetStockItemsByItemId(ItemId, phrmdbcontext);
            //            if (curtStock != null)
            //            {   /////if Items is Already in Stoock Table then update the stock with latest quantity                                                                                   
            //                curtStock.AvailableQuantity = curtStock.AvailableQuantity - Convert.ToDouble(invoiceDataFromClient.InvoiceItems[i].Quantity);
            //                updateStockList.Add(curtStock);
            //            }
            //        }
            //        //update stock details
            //        var UpdateStkRes = UpdateStock(phrmdbcontext, updateStockList);
            //        flag.Add(UpdateStkRes);

            //        //update prescriptionItems status 
            //        //if sale from prescription then do this
            //        //NBB-now we checking if there prescriptionid >0 then it's from prescription to sale
            //        if (invoiceDataFromClient.InvoiceItems[0].PrescriptionItemId > 0)
            //        {
            //            //get items for status update after sale prescription items
            //            var preItems = (from pres in phrmdbcontext.PHRMPrescriptionItems.AsEnumerable()
            //                            join sale in invoiceDataFromClient.InvoiceItems
            //                            on pres.PrescriptionItemId equals sale.PrescriptionItemId
            //                            select pres).ToList();
            //            var updatePresItemsOrderStatus = UpdatePrescriptionItems(preItems, phrmdbcontext);
            //            flag.Add(updatePresItemsOrderStatus);
            //        }
            //        if (CheckFlagList(flag))
            //        {
            //            dbContextTransaction.Commit();//Commit Transaction
            //            return invoiceDataFromClient;
            //        }
            //        else
            //        {
            //            dbContextTransaction.Rollback();//Rollback transaction
            //            ///invoiceDataFromClient = new PHRMInvoiceTransactionModel();
            //            return invoiceDataFromClient;
            //        }
            //    }
            //    catch (Exception ex)
            //    {
            //        //Rollback all transaction if exception occured 
            //        dbContextTransaction.Rollback();
            //        throw ex;
            //    }
            //}
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
            int fiscalYearId = GetFiscalYear(connString).FiscalYearId;
            DanpheEMR.DalLayer.PharmacyDbContext phrmDbContext = new DalLayer.PharmacyDbContext(connString);
            int? receiptNo = (from depTxn in phrmDbContext.DepositModel
                              where depTxn.FiscalYearId == fiscalYearId
                              select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();
            return receiptNo + 1;
        }
        public static PHRMInvoiceTransactionModel CreditInvoiceTransaction(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    var itmdis = (from dbc in phrmdbcontext.CFGParameters                       //get item level discount features detail.
                                  where dbc.ParameterGroupName.ToLower() == "Pharmacy"
                                  && dbc.ParameterName == "PharmacyItemlvlDiscount"
                                  select dbc.ParameterValue).FirstOrDefault();
                    if (itmdis == "false")                                                     //check item level discount features disable
                    {
                        invoiceDataFromClient.TotalAmount = invoiceDataFromClient.SubTotal;    //we applied general discount in client side on invoice but invoice not generated in provisional bill.
                        invoiceDataFromClient.DiscountAmount = 0;                              // and when item level discount features is disable then remove general discount total amt is = to subtotal.
                                                                                               // this code for only display total amt in provisional bill.
                    }
                    var discPer = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status       
                    //Save Invoice And Invoice Items details
                    var saveRes = SaveCreditInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser, requisitionId);
                    flag.Add(saveRes);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    //// Dinesh : 1-30-2020  solution for stock adjustment while doing the provisional transaction


                    invoiceDataFromClient.InvoiceItems.ForEach(
                        itm =>
                        {
                            //var StockId = phrmdbcontext.DispensaryStock.Where(x => x.ItemId == itm.ItemId && x.ExpiryDate == itm.ExpiryDate && x.BatchNo == itm.BatchNo).Select(s => s.StockId).FirstOrDefault();
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                            tempdispensaryStkTxn.AvailableQuantity = itm.Quantity;
                            tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                            tempdispensaryStkTxn.MRP = itm.MRP;
                            tempdispensaryStkTxn.InOut = "out";
                            tempdispensaryStkTxn.ItemId = itm.ItemId;
                            tempdispensaryStkTxn.Price = itm.Price;
                            tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                            tempdispensaryStkTxn.StockId = itm.StockId;
                            phrmDispensaryItems.Add(tempdispensaryStkTxn);
                        }
                        );
                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                    flag.Add(addUpdateDispensaryReslt);

                    //Make StockTransaction object data for post/save
                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    //loop InvoiceItems and make stock transaction object
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        List<string> BatchNoForInvoiceItems = new List<string>();
                        //Quantity of InvoiceItems
                        //var discPer = (invoiceDataFromClient.DiscountAmount/ invoiceDataFromClient.SubTotal)*100;
                        // double discPerForCalcn = decimal.ToDouble(discPer.Value);
                        var currQuantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        var tempStockTxnItems = new PHRMStockTransactionItemsModel();
                        tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        tempStockTxnItems.CreatedOn = DateTime.Now;
                        tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
                        tempStockTxnItems.ExpiryDate = invoiceDataFromClient.InvoiceItems[i].ExpiryDate;
                        tempStockTxnItems.FreeQuantity = invoiceDataFromClient.InvoiceItems[i].FreeQuantity;
                        //just to make insert work
                        tempStockTxnItems.GoodsReceiptItemId = null;
                        tempStockTxnItems.Quantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        tempStockTxnItems.BatchNo = invoiceDataFromClient.InvoiceItems[i].BatchNo;
                        tempStockTxnItems.InOut = "out";
                        tempStockTxnItems.ItemId = invoiceDataFromClient.InvoiceItems[i].ItemId;
                        tempStockTxnItems.MRP = invoiceDataFromClient.InvoiceItems[i].MRP;
                        tempStockTxnItems.Price = invoiceDataFromClient.InvoiceItems[i].Price;
                        tempStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
                        tempStockTxnItems.ReferenceNo = invoiceDataFromClient.InvoiceItems[i].InvoiceItemId;//we are saving invoiceitemid instead of invoice id as in sales
                        tempStockTxnItems.TransactionType = "provisionalsale";
                        string avlbleQty = invoiceDataFromClient.InvoiceItems[i].AvailableQuantity.ToString();
                        invoiceDataFromClient.InvoiceItems[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
                        tempStockTxnItems.SubTotal = Convert.ToDecimal(invoiceDataFromClient.InvoiceItems[i].SubTotal);
                        tempStockTxnItems.TotalAmount = Convert.ToDecimal(invoiceDataFromClient.InvoiceItems[i].TotalAmount);
                        //tempStockTxnItems.TotalAmount = ((tempStockTxnItems.SubTotal * Convert.ToDecimal(tempStockTxnItems.VATPercentage)) / 100) + tempStockTxnItems.SubTotal;
                        phrmStockTxnItems.Add(tempStockTxnItems);
                        if (currQuantity == 0)
                        {
                            break;
                        }
                    }
                    var StkTxnRes = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    flag.Add(StkTxnRes);
                    //Make goodsRecieptItems details object for updation
                    List<PHRMGoodsReceiptItemsModel> grItemsForUpdation = new List<PHRMGoodsReceiptItemsModel>();
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        invoiceDataFromClient.InvoiceItems.ForEach(gritem =>
                        {
                            PHRMGoodsReceiptItemsModel grItemForUpdation = new PHRMGoodsReceiptItemsModel();
                            grItemForUpdation.ItemId = gritem.ItemId.Value;
                            grItemForUpdation.AvailableQuantity = gritem.AvailableQuantity;
                            grItemsForUpdation.Add(grItemForUpdation);
                        });
                    }
                    //Update GRItems Available Quantity details
                    //var UpdateGRRes = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
                    //flag.Add(UpdateGRRes);
                    //Update Available Quantity of Item in Stock Table
                    List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    for (int i = 0; i < invoiceDataFromClient.InvoiceItems.Count; i++)
                    {
                        PHRMStockModel curtStock = new PHRMStockModel();
                        /////get list of Current Stock Item by Passing ItemId
                        int ItemId = Convert.ToInt32(invoiceDataFromClient.InvoiceItems[i].ItemId);
                        curtStock = GetStockItemsByItemId(ItemId, phrmdbcontext);
                        if (curtStock != null)
                        {   /////if Items is Already in Stoock Table then update the stock with latest quantity                                                                                   
                            curtStock.AvailableQuantity = curtStock.AvailableQuantity - Convert.ToDouble(invoiceDataFromClient.InvoiceItems[i].Quantity);
                            updateStockList.Add(curtStock);
                        }
                    }
                    //update stock details//commented: sudarshan--28may'18-- stock list is not available..
                    //uncomment this lateer..
                    //var UpdateStkRes = UpdateStock(phrmdbcontext, updateStockList);
                    //flag.Add(UpdateStkRes);

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
                        flag.Add(updatePresItemsOrderStatus);
                    }
                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return invoiceDataFromClient;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        ///invoiceDataFromClient = new PHRMInvoiceTransactionModel();
                        return invoiceDataFromClient;
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
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status       
                    //Save Invoice Items details
                    var saveRes = SaveProvisionInvoiceItems(provisionalItem, phrmdbcontext, currentUser);
                    flag.Add(saveRes);
                    //Make StockTransaction object data for post/save
                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    //loop InvoiceItems and make stock transaction object
                    for (int i = 0; i < provisionalItem.Count; i++)
                    {
                        List<string> BatchNoForInvoiceItems = new List<string>();
                        //Quantity of InvoiceItems
                        //var discPer = (provisionalItem.DiscountAmount/ provisionalItem.SubTotal)*100;
                        //double discPerForCalcn = decimal.ToDouble(discPer.Value);
                        var currQuantity = provisionalItem[i].Quantity.Value;
                        var tempStockTxnItems = new PHRMStockTransactionItemsModel();
                        tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        tempStockTxnItems.CreatedOn = DateTime.Now;
                        //tempStockTxnItems.DiscountPercentage = discPerForCalcn;
                        //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
                        tempStockTxnItems.ExpiryDate = provisionalItem[i].ExpiryDate;
                        tempStockTxnItems.FreeQuantity = provisionalItem[i].FreeQuantity;
                        //just to make insert work
                        tempStockTxnItems.GoodsReceiptItemId = null;
                        tempStockTxnItems.Quantity = provisionalItem[i].Quantity.Value;
                        tempStockTxnItems.BatchNo = provisionalItem[i].BatchNo;
                        tempStockTxnItems.InOut = "out";
                        tempStockTxnItems.ItemId = provisionalItem[i].ItemId;
                        tempStockTxnItems.MRP = provisionalItem[i].MRP;
                        tempStockTxnItems.Price = provisionalItem[i].Price;
                        tempStockTxnItems.ReferenceItemCreatedOn = DateTime.Now;
                        tempStockTxnItems.TransactionType = "nurserequest";
                        string avlbleQty = provisionalItem[i].AvailableQuantity.ToString();
                        provisionalItem[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
                        decimal subTotal = (Convert.ToDecimal(tempStockTxnItems.Quantity) - Convert.ToDecimal(tempStockTxnItems.FreeQuantity)) * Convert.ToDecimal(tempStockTxnItems.Price);
                        decimal discountAmt = (subTotal * Convert.ToDecimal(tempStockTxnItems.DiscountPercentage)) / 100;
                        tempStockTxnItems.SubTotal = subTotal - discountAmt;

                        phrmStockTxnItems.Add(tempStockTxnItems);
                        if (currQuantity == 0)
                        {
                            break;
                        }
                    }

                    var StkTxnRes = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    flag.Add(StkTxnRes);

                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return provisionalItem;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        ///invoiceDataFromClient = new PHRMInvoiceTransactionModel();
                        return provisionalItem;
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
        /// <summary>
        /// Umed-This is whole single transaction of Return Item To Supplier
        /// Transactions as below
        /// 1. Save Return To Supplier Items                     2.Save Stock Transaction Items Details
        /// 3. Update GoodsRecieptItems AvailableQuantity        4.Update Stock Details (Available Quantity)
        /// Note: if above Four transaction done successfully then ReturnToSupplierItem Post done, If any one fails will all operation rollback
        /// System.Data.SqlClient.SqlCommand.ExecuteReader(CommandBehavior behavior, String method)
        /// </summary> 
        public static Boolean ReturnItemsToSupplierTransaction(PHRMReturnToSupplierModel retSupplFromClient, PharmacyDbContext phrmdbcontext)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status 
                                                           ////Save Return To Supplier Items To Db 
                    var retSuppReslt = AddReturnToSupplierItems(retSupplFromClient, phrmdbcontext);
                    flag.Add(retSuppReslt);
                    ////Get ReturnToSupplierId
                    var ReturnToSupplierId = retSupplFromClient.ReturnToSupplierId;
                    ////Get ReturnToSupplierItemList 
                    var ReturnToSupplierItemsList = (from retSuppItem in phrmdbcontext.PHRMReturnToSupplierItem
                                                     join retSupp in phrmdbcontext.PHRMReturnToSupplier on retSuppItem.ReturnToSupplierId equals retSupp.ReturnToSupplierId
                                                     where retSuppItem.ReturnToSupplierId == ReturnToSupplierId
                                                     select retSuppItem
                                                     ).ToList();
                    //StockTxn Model For Adding Return Item To Supplier in StockTxn Also
                    //List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    List<PHRMStoreStockModel> phrmStoreStock = new List<PHRMStoreStockModel>();
                    //for (int i = 0; i < ReturnToSupplierItemsList.Count; i++)
                    //{
                    //    //////Gets and Sets ReturnToSupplierItem to StockTransactionItems
                    //    var selectedstockTxnItm = new PHRMStockTransactionItemsModel();

                    //    selectedstockTxnItm.ItemId = ReturnToSupplierItemsList[i].ItemId;
                    //    selectedstockTxnItm.BatchNo = ReturnToSupplierItemsList[i].BatchNo;
                    //    selectedstockTxnItm.ExpiryDate = ReturnToSupplierItemsList[i].ExpiryDate;
                    //    selectedstockTxnItm.FreeQuantity = ReturnToSupplierItemsList[i].FreeQuantity;
                    //    selectedstockTxnItm.Quantity = ReturnToSupplierItemsList[i].Quantity;
                    //    selectedstockTxnItm.Price = ReturnToSupplierItemsList[i].ItemPrice;
                    //    selectedstockTxnItm.DiscountPercentage = ReturnToSupplierItemsList[i].DiscountPercentage;
                    //    selectedstockTxnItm.VATPercentage = ReturnToSupplierItemsList[i].VATPercentage;
                    //    selectedstockTxnItm.SubTotal = ReturnToSupplierItemsList[i].SubTotal;
                    //    selectedstockTxnItm.TotalAmount = ReturnToSupplierItemsList[i].TotalAmount;
                    //    selectedstockTxnItm.InOut = "out";
                    //    selectedstockTxnItm.ReferenceNo = ReturnToSupplierItemsList[i].ReturnToSupplierItemId;
                    //    selectedstockTxnItm.ReferenceItemCreatedOn = DateTime.Now;
                    //    selectedstockTxnItm.TransactionType = "returntosupplier"; ///during GR Transaction Type is goodsreceipt
                    //    selectedstockTxnItm.MRP = ReturnToSupplierItemsList[i].MRP;
                    //    selectedstockTxnItm.CreatedBy = ReturnToSupplierItemsList[i].CreatedBy;
                    //    phrmStockTxnItems.Add(selectedstockTxnItm);

                    //}
                    for (int i = 0; i < ReturnToSupplierItemsList.Count; i++)
                    {
                        //////Gets and Sets ReturnToSupplierItem to StoreStock
                        var selectedstoreStock = new PHRMStoreStockModel();

                        selectedstoreStock.ItemId = ReturnToSupplierItemsList[i].ItemId;
                        selectedstoreStock.BatchNo = ReturnToSupplierItemsList[i].BatchNo;
                        selectedstoreStock.ExpiryDate = ReturnToSupplierItemsList[i].ExpiryDate;
                        selectedstoreStock.FreeQuantity = ReturnToSupplierItemsList[i].FreeQuantity;
                        selectedstoreStock.Quantity = ReturnToSupplierItemsList[i].Quantity;
                        selectedstoreStock.Price = ReturnToSupplierItemsList[i].ItemPrice;
                        selectedstoreStock.DiscountPercentage = ReturnToSupplierItemsList[i].DiscountPercentage;
                        selectedstoreStock.VATPercentage = ReturnToSupplierItemsList[i].VATPercentage;
                        selectedstoreStock.SubTotal = ReturnToSupplierItemsList[i].SubTotal;
                        selectedstoreStock.TotalAmount = ReturnToSupplierItemsList[i].TotalAmount;
                        selectedstoreStock.InOut = "out";
                        selectedstoreStock.CreatedOn = DateTime.Now;
                        selectedstoreStock.ReferenceNo = ReturnToSupplierItemsList[i].ReturnToSupplierItemId;
                        selectedstoreStock.ReferenceItemCreatedOn = (Convert.ToDateTime(ReturnToSupplierItemsList[i].CreatedOn));
                        selectedstoreStock.TransactionType = "returntosupplier"; ///during GR Transaction Type is goodsreceipt
                        selectedstoreStock.MRP = ReturnToSupplierItemsList[i].MRP;
                        selectedstoreStock.CreatedBy = ReturnToSupplierItemsList[i].CreatedBy;
                        selectedstoreStock.GoodsReceiptItemId = ReturnToSupplierItemsList[i].GoodReceiptItemId;
                        selectedstoreStock.IsActive = true;
                        selectedstoreStock.ItemName = (from itm in phrmdbcontext.PHRMItemMaster
                                                       where itm.ItemId == selectedstoreStock.ItemId
                                                       select itm.ItemName).ToList().FirstOrDefault();
                        selectedstoreStock.StoreId = (from store in phrmdbcontext.PHRMStoreStock
                                                      select store.StoreId).ToList().FirstOrDefault();
                        selectedstoreStock.StoreName = (from store in phrmdbcontext.PHRMStoreStock
                                                        select store.StoreName).ToList().FirstOrDefault();
                        phrmdbcontext.PHRMStoreStock.Add(selectedstoreStock);

                    }
                    ///common function to StockTransactionItems by passing List<PHRMStockTransactionItemsModel>
                    //var StkTxnReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    //flag.Add(StkTxnReslt);
                    ////////GRItem Model For Updating Available Qty of GRItem 
                    List<PHRMGoodsReceiptItemsModel> grItemsForUpdation = new List<PHRMGoodsReceiptItemsModel>();
                    for (int i = 0; i < retSupplFromClient.returnToSupplierItems.Count; i++)
                    {
                        var selectedGRItems = new PHRMGoodsReceiptItemsModel();
                        retSupplFromClient.returnToSupplierItems[i].SelectedGRItems.ForEach(gritem =>
                        {
                            grItemsForUpdation.Add(gritem);
                        });

                    }
                    //Update GRItems Available Quantity details
                    var UpGRItmReslt = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
                    flag.Add(UpGRItmReslt);
                    ////////Stock Model For Updating Available Qty of Stock 
                    List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    for (int i = 0; i < retSupplFromClient.returnToSupplierItems.Count; i++)
                    {
                        PHRMStockModel curtStock = new PHRMStockModel();
                        /////get list of Current Stock Item by Passing ItemId
                        curtStock = GetStockItemsByItemId(ReturnToSupplierItemsList[i].ItemId, phrmdbcontext);
                        if (curtStock != null)
                        {   /////if Items is Already in Stoock Table then update the stock by Removing Current Return Item Qty 
                            curtStock.AvailableQuantity = curtStock.AvailableQuantity - retSupplFromClient.returnToSupplierItems[i].Quantity;
                            updateStockList.Add(curtStock);
                        }
                    }
                    ///Update StockList Function By Passing StockList
                    //var UpStkReslt = UpdateStock(phrmdbcontext, updateStockList);
                    //flag.Add(UpStkReslt);

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
        public static Boolean WriteOffItemTransaction(PHRMWriteOffModel writeOffFromClient, PharmacyDbContext phrmdbcontext)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status
                                                           ////Save Return To Supplier Items To Db 
                    var WrtItmReslt = SaveWriteOffAndWriteOffItems(writeOffFromClient, phrmdbcontext);
                    flag.Add(WrtItmReslt);

                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    writeOffFromClient.phrmWriteOffItem.ForEach(
                        itm =>
                        {
                            var StockId = phrmdbcontext.DispensaryStock.Where(x => x.ItemId == itm.ItemId && x.ExpiryDate == itm.ExpiryDate && x.BatchNo == itm.BatchNo).Select(s => s.StockId).FirstOrDefault();
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                            tempdispensaryStkTxn.AvailableQuantity = itm.WriteOffQuantity;
                            tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                            tempdispensaryStkTxn.MRP = itm.MRP;
                            tempdispensaryStkTxn.InOut = "out";
                            tempdispensaryStkTxn.ItemId = itm.ItemId;
                            tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                            tempdispensaryStkTxn.StockId = StockId != 0 ? StockId : 0;
                            phrmDispensaryItems.Add(tempdispensaryStkTxn);
                        }
                        );
                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                    flag.Add(addUpdateDispensaryReslt);

                    ////////StockTxn Model For Adding Return Item To Supplier in StockTxn Also
                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    for (int i = 0; i < writeOffFromClient.phrmWriteOffItem.Count; i++)
                    {
                        var itm = writeOffFromClient.phrmWriteOffItem[i];
                        //////Gets and Sets ReturnToSupplierItem to StockTransactionItems
                        var selectedstockTxnItm = new PHRMStockTransactionItemsModel();

                        selectedstockTxnItm.ItemId = itm.ItemId;
                        selectedstockTxnItm.BatchNo = itm.BatchNo;
                        selectedstockTxnItm.ExpiryDate = itm.ExpiryDate;
                        selectedstockTxnItm.Quantity = itm.WriteOffQuantity;
                        selectedstockTxnItm.Price = itm.ItemPrice;
                        selectedstockTxnItm.DiscountPercentage = Convert.ToDouble(itm.DiscountPercentage);
                        selectedstockTxnItm.VATPercentage = Convert.ToDouble(itm.VATPercentage);
                        selectedstockTxnItm.SubTotal = itm.SubTotal;
                        selectedstockTxnItm.TotalAmount = itm.TotalAmount;
                        selectedstockTxnItm.InOut = "out";
                        selectedstockTxnItm.ReferenceNo = itm.WriteOffItemId;
                        selectedstockTxnItm.ReferenceItemCreatedOn = itm.CreatedOn;
                        selectedstockTxnItm.TransactionType = "writeoff";
                        selectedstockTxnItm.MRP = itm.MRP;
                        selectedstockTxnItm.CreatedBy = itm.CreatedBy;
                        selectedstockTxnItm.FreeQuantity = itm.FreeQuantity;
                        phrmStockTxnItems.Add(selectedstockTxnItm);

                    }
                    var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    flag.Add(StckTxnItmReslt);

                    //NBB-below is old scenario code now i've changed as per requirement
                    ////Get ReturnToSupplierId
                    //var WriteOffId = writeOffFromClient.WriteOffId;
                    //////Get ReturnToSupplierItemList 
                    //var WriteOffItemsList = (from wrtOffItem in phrmdbcontext.PHRMWriteOffItem
                    //                         join wrtOff in phrmdbcontext.PHRMWriteOff on wrtOffItem.WriteOffId equals wrtOff.WriteOffId
                    //                         where wrtOffItem.WriteOffId == WriteOffId
                    //                         select wrtOffItem
                    //                                 ).ToList();
                    ////////////StockTxn Model For Adding Return Item To Supplier in StockTxn Also
                    //List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    //for (int i = 0; i < WriteOffItemsList.Count; i++)
                    //{
                    //    //////Gets and Sets ReturnToSupplierItem to StockTransactionItems
                    //    var selectedstockTxnItm = new PHRMStockTransactionItemsModel();

                    //    selectedstockTxnItm.ItemId = WriteOffItemsList[i].ItemId;
                    //    selectedstockTxnItm.BatchNo = WriteOffItemsList[i].BatchNo;
                    //    ///selectedstockTxnItm.ExpiryDate = DateTime.Now;
                    //    selectedstockTxnItm.Quantity = WriteOffItemsList[i].WriteOffQuantity;
                    //    selectedstockTxnItm.Price = WriteOffItemsList[i].ItemPrice;
                    //    ///selectedstockTxnItm.DiscountPercentage = WriteOffItemsList[i].DiscountPercentage;
                    //    //selectedstockTxnItm.VATPercentage = WriteOffItemsList[i].VATPercentage;
                    //    //selectedstockTxnItm.SubTotal = WriteOffItemsList[i].SubTotal;
                    //    selectedstockTxnItm.TotalAmount = WriteOffItemsList[i].TotalAmount;
                    //    selectedstockTxnItm.InOut = "out";
                    //    selectedstockTxnItm.ReferenceNo = WriteOffItemsList[i].WriteOffItemId;
                    //    selectedstockTxnItm.ReferenceItemCreatedOn = DateTime.Now;
                    //    selectedstockTxnItm.TransactionType = "writeoff"; ///during GR Transaction Type is goodsreceipt
                    //                                                      ///selectedstockTxnItm.MRP = WriteOffItemsList[i].MRP;
                    //    selectedstockTxnItm.CreatedBy = WriteOffItemsList[i].CreatedBy;

                    //    phrmStockTxnItems.Add(selectedstockTxnItm);

                    //}
                    ///common function to StockTransactionItems by passing List<PHRMStockTransactionItemsModel>
                    //var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    //flag.Add(StckTxnItmReslt);
                    //////////GRItem Model For Updating Available Qty of GRItem 
                    //List<PHRMGoodsReceiptItemsModel> grItemsForUpdation = new List<PHRMGoodsReceiptItemsModel>();
                    //for (int i = 0; i < writeOffFromClient.phrmWriteOffItem.Count; i++)
                    //{
                    //    var selectedGRItems = new PHRMGoodsReceiptItemsModel();
                    //    writeOffFromClient.phrmWriteOffItem[i].SelectedGRItems.ForEach(gritem =>
                    //    {
                    //        grItemsForUpdation.Add(gritem);
                    //    });

                    //}
                    ////Update GRItems Available Quantity details
                    //var GrUpdtReslt = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
                    //flag.Add(GrUpdtReslt);
                    //////////Stock Model For Updating Available Qty of Stock 
                    //List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    //for (int i = 0; i < writeOffFromClient.phrmWriteOffItem.Count; i++)
                    //{
                    //    PHRMStockModel curtStock = new PHRMStockModel();
                    //    /////get list of Current Stock Item by Passing ItemId
                    //    curtStock = GetStockItemsByItemId(WriteOffItemsList[i].ItemId, phrmdbcontext);
                    //    if (curtStock != null)
                    //    {   /////if Items is Already in Stoock Table then update the stock by Removing Current Return Item Qty 
                    //        curtStock.AvailableQuantity = curtStock.AvailableQuantity - writeOffFromClient.phrmWriteOffItem[i].WriteOffQuantity;
                    //        updateStockList.Add(curtStock);
                    //    }
                    //}
                    /////Update StockList Function By Passing StockList
                    //var UpdtStckReslt = UpdateStock(phrmdbcontext, updateStockList);
                    //flag.Add(UpdtStckReslt);

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
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status

                    stkManageFromClient.Quantity = stkManageFromClient.UpdatedQty;
                    stkManageFromClient.CreatedOn = DateTime.Now;
                    stkManageFromClient.SubTotal = (double?)(Convert.ToDecimal(stkManageFromClient.Quantity) * stkManageFromClient.MRP);
                    stkManageFromClient.TotalAmount = ((stkManageFromClient.SubTotal * stkManageFromClient.VATPercentage) / 100) + stkManageFromClient.SubTotal;
                    stkManageFromClient.CreatedBy = currentUser.EmployeeId;
                    phrmdbcontext.StockManage.Add(stkManageFromClient);
                    phrmdbcontext.SaveChanges();

                    ////Update GRItems Available Quantity details
                    //var GrUpdtReslt = UpdateGoodsRecieptItemsAvailableQuantity(grItemsForUpdation, phrmdbcontext);
                    //flag.Add(GrUpdtReslt);

                    //////////Stock Model For Updating Available Qty of Stock 
                    //List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    //for (int i = 0; i < stkManageFromClient.Count; i++)
                    //{
                    //    PHRMStockModel curtStock = new PHRMStockModel();
                    //    /////get list of Current Stock Item by Passing ItemId
                    //    curtStock = GetStockItemsByItemId(stkManageFromClient[i].ItemId, phrmdbcontext);
                    //    ///adjustment-in and adjustment-out Flag which is set from Client side to check Count of Qty Added or Removed
                    //    if (curtStock != null && stkManageFromClient[i].StkManageInOut == "adjustment-in")
                    //    {   /////if  adjustment-in then add Diff Count to actual Qty
                    //        curtStock.AvailableQuantity = curtStock.AvailableQuantity + stkManageFromClient[i].QtyDiffCount;
                    //        updateStockList.Add(curtStock);
                    //    }
                    //    if (curtStock != null && stkManageFromClient[i].StkManageInOut == "adjustment-out")
                    //    {   /////if  adjustment-out then Remove Diff Count from actual Qty
                    //        curtStock.AvailableQuantity = curtStock.AvailableQuantity - stkManageFromClient[i].QtyDiffCount;
                    //        updateStockList.Add(curtStock);
                    //    }
                    //}
                    /////Update StockList Function By Passing StockList
                    //var UpdtStckReslt = UpdateStock(phrmdbcontext, updateStockList);
                    //flag.Add(UpdtStckReslt);
                    List<PHRMDispensaryStockModel> phrmDispensaryStockModels = new List<PHRMDispensaryStockModel>();
                    var selecteddispensarystock = new PHRMDispensaryStockModel();

                    selecteddispensarystock.ItemId = stkManageFromClient.ItemId;
                    selecteddispensarystock.BatchNo = stkManageFromClient.BatchNo;
                    selecteddispensarystock.ExpiryDate = stkManageFromClient.ExpiryDate;
                    selecteddispensarystock.AvailableQuantity = Convert.ToDouble(stkManageFromClient.Quantity);
                    selecteddispensarystock.Price = stkManageFromClient.Price;
                    selecteddispensarystock.InOut = stkManageFromClient.InOut; ////take from client side
                    selecteddispensarystock.MRP = stkManageFromClient.MRP;
                    phrmDispensaryStockModels.Add(selecteddispensarystock);

                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels);
                    flag.Add(addUpdateDispensaryReslt);



                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();

                    var selectedstockTxnItm = new PHRMStockTransactionItemsModel();
                    selectedstockTxnItm.ItemId = stkManageFromClient.ItemId;
                    selectedstockTxnItm.BatchNo = stkManageFromClient.BatchNo;
                    selectedstockTxnItm.ExpiryDate = stkManageFromClient.ExpiryDate;
                    selectedstockTxnItm.Quantity = Convert.ToDouble(stkManageFromClient.Quantity);
                    selectedstockTxnItm.Price = stkManageFromClient.Price;
                    selectedstockTxnItm.InOut = stkManageFromClient.InOut; ////take from client side
                    selectedstockTxnItm.ReferenceNo = stkManageFromClient.StockManageId;
                    selectedstockTxnItm.ReferenceItemCreatedOn = stkManageFromClient.CreatedOn;
                    selectedstockTxnItm.TransactionType = "stockmanage"; ///during GR Transaction Type is goodsreceipt
                    selectedstockTxnItm.MRP = stkManageFromClient.MRP;
                    selectedstockTxnItm.CreatedBy = currentUser.EmployeeId;
                    selectedstockTxnItm.SubTotal = Convert.ToDecimal(stkManageFromClient.SubTotal);
                    selectedstockTxnItm.TotalAmount = Convert.ToDecimal(stkManageFromClient.TotalAmount);
                    phrmStockTxnItems.Add(selectedstockTxnItm);

                    var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
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

        public static Boolean StoreManageTransaction(PHRMStoreStockModel strManageFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status

                    strManageFromClient.Quantity = (double)strManageFromClient.UpdatedQty;
                    strManageFromClient.CreatedOn = DateTime.Now;
                    strManageFromClient.SubTotal = Convert.ToDecimal(strManageFromClient.Quantity) * Convert.ToDecimal(strManageFromClient.MRP);
                    strManageFromClient.TotalAmount = ((strManageFromClient.SubTotal * Convert.ToDecimal(strManageFromClient.VATPercentage)) / 100) + strManageFromClient.SubTotal;
                    strManageFromClient.CreatedBy = currentUser.EmployeeId;
                    strManageFromClient.TransactionType = "stockmanage";
                    strManageFromClient.ReferenceItemCreatedOn = strManageFromClient.CreatedOn;
                    strManageFromClient.ReferenceNo = strManageFromClient.GoodsReceiptItemId;

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

        public static Boolean TransferStoreStockToDispensary(PHRMStoreStockModel storeStockData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            try
            {
                List<Boolean> flag = new List<bool>(); //for checking all transaction status

                storeStockData.Quantity = (double)storeStockData.UpdatedQty;
                storeStockData.CreatedOn = DateTime.Now;
                storeStockData.SubTotal = Convert.ToDecimal(storeStockData.Quantity) * Convert.ToDecimal(storeStockData.MRP);
                storeStockData.TotalAmount = ((storeStockData.SubTotal * Convert.ToDecimal(storeStockData.VATPercentage)) / 100) + storeStockData.SubTotal;
                storeStockData.CreatedBy = currentUser.EmployeeId;
                storeStockData.TransactionType = "Transfer To Dispensary";
                storeStockData.ReferenceItemCreatedOn = storeStockData.CreatedOn;
                storeStockData.ReferenceNo = storeStockData.GoodsReceiptItemId;
                storeStockData.IsActive = true;

                var StckTxnItmReslt = AddStoreTransactionItems(phrmdbcontext, storeStockData);
                flag.Add(StckTxnItmReslt);
                //# post to pharmacy despensary items table.
                List<PHRMDispensaryStockModel> phrmDispensaryStockModels = new List<PHRMDispensaryStockModel>();
                var selecteddispensarystock = new PHRMDispensaryStockModel();

                selecteddispensarystock.ItemId = storeStockData.ItemId;
                selecteddispensarystock.GoodReceiptItemId = storeStockData.GoodsReceiptItemId;
                selecteddispensarystock.BatchNo = storeStockData.BatchNo;
                selecteddispensarystock.ExpiryDate = storeStockData.ExpiryDate;
                selecteddispensarystock.AvailableQuantity = Convert.ToDouble(storeStockData.Quantity);
                selecteddispensarystock.Price = storeStockData.Price;
                selecteddispensarystock.InOut = "in";
                selecteddispensarystock.MRP = storeStockData.MRP;
                selecteddispensarystock.DispensaryId = storeStockData.DispensaryId;
                phrmDispensaryStockModels.Add(selecteddispensarystock);

                var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels, false);
                flag.Add(addUpdateDispensaryReslt);


                List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                var StockTxnItem = new PHRMStockTransactionItemsModel();
                StockTxnItem.ItemId = storeStockData.ItemId;
                StockTxnItem.BatchNo = storeStockData.BatchNo;
                StockTxnItem.ExpiryDate = storeStockData.ExpiryDate;
                StockTxnItem.Quantity = storeStockData.Quantity;
                StockTxnItem.Price = storeStockData.Price;
                StockTxnItem.DiscountPercentage = storeStockData.DiscountPercentage;
                StockTxnItem.VATPercentage = storeStockData.VATPercentage;
                StockTxnItem.CCCharge = storeStockData.CCCharge;
                StockTxnItem.SubTotal = storeStockData.SubTotal;
                StockTxnItem.TotalAmount = storeStockData.TotalAmount;
                StockTxnItem.InOut = "in";
                StockTxnItem.ReferenceNo = storeStockData.ReferenceNo;
                StockTxnItem.ReferenceItemCreatedOn = storeStockData.ReferenceItemCreatedOn;
                StockTxnItem.TransactionType = "Sent From Store";
                StockTxnItem.FreeQuantity = 0;
                StockTxnItem.CreatedBy = currentUser.EmployeeId;
                StockTxnItem.MRP = storeStockData.MRP;
                StockTxnItem.GoodsReceiptItemId = storeStockData.GoodsReceiptItemId;
                StockTxnItem.DispensaryId = storeStockData.DispensaryId;
                phrmStockTxnItems.Add(StockTxnItem);
                var StockTxnResult = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                flag.Add(StockTxnResult);

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


        public static Boolean TransferDispensaryStockToStore(PHRMStockTransactionItemsModel dispensaryStockData, int StoreId, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status
                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();

                    dispensaryStockData.Quantity = (double)dispensaryStockData.UpdatedQty;
                    dispensaryStockData.CreatedOn = DateTime.Now;
                    dispensaryStockData.SubTotal = Convert.ToDecimal(dispensaryStockData.Quantity) * Convert.ToDecimal(dispensaryStockData.MRP);
                    dispensaryStockData.TotalAmount = ((dispensaryStockData.SubTotal * Convert.ToDecimal(dispensaryStockData.VATPercentage)) / 100) + dispensaryStockData.SubTotal;
                    dispensaryStockData.CreatedBy = currentUser.EmployeeId;
                    dispensaryStockData.TransactionType = "Transfer To Store";
                    dispensaryStockData.ReferenceItemCreatedOn = dispensaryStockData.CreatedOn;
                    dispensaryStockData.ReferenceNo = dispensaryStockData.GoodsReceiptItemId;
                    phrmStockTxnItems.Add(dispensaryStockData);
                    var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);

                    flag.Add(StckTxnItmReslt);
                    //# post to pharmacy despensary items table.
                    List<PHRMDispensaryStockModel> phrmDispensaryStockModels = new List<PHRMDispensaryStockModel>();
                    var selecteddispensarystock = new PHRMDispensaryStockModel();

                    selecteddispensarystock.ItemId = dispensaryStockData.ItemId;
                    selecteddispensarystock.StockId = dispensaryStockData.StockId;
                    selecteddispensarystock.BatchNo = dispensaryStockData.BatchNo;
                    selecteddispensarystock.ExpiryDate = dispensaryStockData.ExpiryDate;
                    selecteddispensarystock.AvailableQuantity = Convert.ToDouble(dispensaryStockData.Quantity);
                    selecteddispensarystock.Price = dispensaryStockData.Price;
                    selecteddispensarystock.InOut = "out";
                    selecteddispensarystock.MRP = dispensaryStockData.MRP;
                    phrmDispensaryStockModels.Add(selecteddispensarystock);

                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels);
                    flag.Add(addUpdateDispensaryReslt);


                    var StoreTxnItem = new PHRMStoreStockModel();
                    StoreTxnItem.ItemId = dispensaryStockData.ItemId;
                    StoreTxnItem.BatchNo = dispensaryStockData.BatchNo;
                    StoreTxnItem.ExpiryDate = dispensaryStockData.ExpiryDate;
                    StoreTxnItem.Quantity = dispensaryStockData.Quantity;
                    StoreTxnItem.Price = dispensaryStockData.Price;
                    StoreTxnItem.DiscountPercentage = dispensaryStockData.DiscountPercentage;
                    StoreTxnItem.VATPercentage = dispensaryStockData.VATPercentage;
                    StoreTxnItem.CCCharge = dispensaryStockData.CCCharge;
                    StoreTxnItem.SubTotal = dispensaryStockData.SubTotal;
                    StoreTxnItem.TotalAmount = dispensaryStockData.TotalAmount;
                    StoreTxnItem.FreeQuantity = 0; //incase of transfer to store, free quantity is not possible
                    StoreTxnItem.InOut = "in";
                    StoreTxnItem.ReferenceNo = dispensaryStockData.ReferenceNo;
                    StoreTxnItem.ReferenceItemCreatedOn = dispensaryStockData.ReferenceItemCreatedOn;
                    StoreTxnItem.TransactionType = "Sent From Dispensary";
                    StoreTxnItem.CreatedBy = currentUser.EmployeeId;
                    StoreTxnItem.MRP = dispensaryStockData.MRP;
                    StoreTxnItem.GoodsReceiptItemId = dispensaryStockData.GoodsReceiptItemId;
                    StoreTxnItem.StoreId = StoreId;
                    StoreTxnItem.IsActive = true;
                    StoreTxnItem.ItemName = phrmdbcontext.PHRMItemMaster.FirstOrDefault(a => a.ItemId == dispensaryStockData.ItemId).ItemName;
                    StoreTxnItem.StoreName = phrmdbcontext.PHRMStore.FirstOrDefault(a => a.StoreId == StoreId).Name;
                    var StockTxnResult = AddStoreTransactionItems(phrmdbcontext, StoreTxnItem);
                    flag.Add(StockTxnResult);

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
        public static Boolean ReturnFromCustomerTransaction(PHRMInvoiceReturnModel ClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status                                           

                    //#1 Post to PHRMInvoiceReturnItemsModel
                    var invItmsPostResult = SaveReturnInvoiceItems(ClientData, phrmdbcontext, currentUser);
                    flag.Add(invItmsPostResult);
                    //var updateInvoiceReturnStatus = UpdateInvoiceReturnStatus(returnInvClientData[0].InvoiceId, phrmdbcontext);
                    //flag.Add(updateInvoiceReturnStatus);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();

                    // Deepak/Dinesh : 1-29-2020 temporary solution for stock adjustment while returning the item
                    foreach (var item in ClientData.InvoiceReturnItems)
                    {
                        //var StockId = phrmdbcontext.DispensaryStock.Where(x => x.ItemId == itm.ItemId && x.ExpiryDate == itm.ExpiryDate && x.BatchNo == itm.BatchNo).Select(s => s.StockId).FirstOrDefault();
                        var StockId = phrmdbcontext.DispensaryStock
                                                   .Where(x => x.ItemId == item.ItemId &&
                                                               x.ExpiryDate == item.ExpiryDate &&
                                                               x.BatchNo == item.BatchNo &&
                                                               x.MRP == item.MRP &&
                                                               x.Price == item.Price)
                                                   .OrderBy(x => x.StockId)
                                                   .Select(x => x.StockId)
                                                   .FirstOrDefault();

                        var tempdispensaryStkTxn = new PHRMDispensaryStockModel
                        {
                            AvailableQuantity = item.ReturnedQty,
                            BatchNo = item.BatchNo,
                            MRP = item.MRP,
                            InOut = "in",
                            ItemId = item.ItemId,
                            Price = item.Price,
                            ExpiryDate = item.ExpiryDate,
                            StockId = StockId != 0 ? StockId : 0
                        };
                        phrmDispensaryItems.Add(tempdispensaryStkTxn);

                    }

                    //returnInvClientData.ForEach(
                    //    itm =>
                    //    {
                    //        PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                    //        tempdispensaryStkTxn.AvailableQuantity = itm.Quantity;
                    //        tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                    //        tempdispensaryStkTxn.MRP = itm.MRP;
                    //        tempdispensaryStkTxn.InOut = "in";
                    //        tempdispensaryStkTxn.ItemId = itm.ItemId;
                    //        tempdispensaryStkTxn.Price = itm.Price;
                    //        tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;

                    //        phrmDispensaryItems.Add(tempdispensaryStkTxn);
                    //    }
                    //    );
                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                    flag.Add(addUpdateDispensaryReslt);


                    //#4 Post to Stock Transaction table as salereturn txn type

                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    ClientData.InvoiceReturnItems.ForEach(
                        itm =>
                        {
                            PHRMStockTransactionItemsModel tempStkTxn = new PHRMStockTransactionItemsModel();
                            tempStkTxn.BatchNo = itm.BatchNo;
                            tempStkTxn.CreatedBy = currentUser.EmployeeId;
                            tempStkTxn.CreatedOn = DateTime.Now;
                            tempStkTxn.DiscountPercentage = Convert.ToDouble(itm.DiscountPercentage);
                            tempStkTxn.MRP = itm.MRP;
                            tempStkTxn.InOut = "in";
                            tempStkTxn.ItemId = itm.ItemId;
                            tempStkTxn.Price = itm.Price;
                            tempStkTxn.Quantity = Convert.ToDouble(itm.ReturnedQty);
                            tempStkTxn.FreeQuantity = 0;
                            tempStkTxn.ReferenceNo = itm.InvoiceReturnItemId;
                            tempStkTxn.ReferenceItemCreatedOn = itm.CreatedOn;
                            tempStkTxn.ExpiryDate = itm.ExpiryDate;
                            tempStkTxn.SubTotal = Convert.ToDecimal(itm.SubTotal);
                            tempStkTxn.TotalAmount = Convert.ToDecimal(itm.TotalAmount);
                            tempStkTxn.TransactionType = "salereturn";
                            tempStkTxn.VATPercentage = Convert.ToDouble(itm.VATPercentage);
                            phrmStockTxnItems.Add(tempStkTxn);
                        }
                        );
                    var StckTxnItmReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
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
        #region Save Goods Receipt and GoodsReceiptItems In Database
        public static Boolean AddGoodsReceiptAndGoodReceiptItems(PharmacyDbContext phrmdbcontext, PHRMGoodsReceiptViewModel grViewModelData, RbacUser currentUser)
        {
            try
            {
                if (grViewModelData != null && grViewModelData.goodReceipt != null)
                {
                    var dispercentage = (decimal)0;
                    var vatpercentage = (decimal)0;
                    if (grViewModelData.goodReceipt.SubTotal > 0)
                    {
                        dispercentage = (decimal)(((grViewModelData.goodReceipt.DiscountAmount) * 100) / grViewModelData.goodReceipt.SubTotal);
                        vatpercentage = (decimal)((grViewModelData.goodReceipt.VATAmount * 100) / (grViewModelData.goodReceipt.SubTotal - grViewModelData.goodReceipt.DiscountAmount));
                    }
                    grViewModelData.goodReceipt.GoodReceiptItem.ForEach(item =>
                    {
                        item.CreatedBy = currentUser.EmployeeId;
                        item.CreatedOn = DateTime.Now;
                        item.AvailableQuantity = item.ReceivedQuantity;
                        //below fields are used for accounting do not remove
                        if (item.AvailableQuantity != 0)
                        {
                            item.GrPerItemVATAmt = (decimal)((((item.SubTotal - ((item.SubTotal * dispercentage) / 100)) / 100) * vatpercentage) / (decimal)item.ReceivedQuantity);
                            item.GrPerItemDisAmt = (decimal)(((item.SubTotal * Convert.ToDecimal(item.DiscountPercentage)) / 100) / (decimal)item.ReceivedQuantity);            //cal per item discount     
                        }
                    });

                    grViewModelData.goodReceipt.CreatedOn = DateTime.Now;
                    phrmdbcontext.PHRMGoodsReceipt.Add(grViewModelData.goodReceipt);
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

        #region Update PO and POItems Status
        public static Boolean UpdatePOandPOItemsStatus(PharmacyDbContext phrmdbcontext, PHRMGoodsReceiptViewModel grViewModelData)
        {

            try
            {
                var poid = grViewModelData.purchaseOrder.PurchaseOrderId;

                var POStatus = true;
                foreach (var POItems in grViewModelData.purchaseOrder.PHRMPurchaseOrderItems)
                {

                    if (POItems.ReceivedQuantity > 0 &&
                        POItems.PendingQuantity == 0)
                    {
                        POItems.POItemStatus = "complete";
                    }
                    else
                    {
                        POItems.POItemStatus = "partial";
                        POStatus = false;
                    }
                }

                if (POStatus)
                {
                    grViewModelData.purchaseOrder.POStatus = "complete";
                }

                if (poid != 0 && poid > 0 && grViewModelData.purchaseOrder != null)
                {
                    phrmdbcontext.UpdateGraph(grViewModelData.purchaseOrder,
                          map => map.
                          OwnedCollection(a => a.PHRMPurchaseOrderItems)
                        );

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

        #region Add Stock Transaction Items By Passing Reference ID
        public static Boolean AddStockTransactionItems(PharmacyDbContext phrmdbcontext, List<PHRMStockTransactionItemsModel> phrmStockTxnItems)
        {
            try
            {
                for (int i = 0; i < phrmStockTxnItems.Count; i++)
                {
                    phrmStockTxnItems[i].CreatedOn = DateTime.Now;
                    phrmdbcontext.PHRMStockTransactionModel.Add(phrmStockTxnItems[i]);
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
        public static Boolean AddStoreTransactionItems(PharmacyDbContext phrmdbcontext, PHRMStoreStockModel phrmStoreTxnItems)
        {
            try
            {
                phrmStoreTxnItems.CreatedOn = DateTime.Now;
                phrmdbcontext.PHRMStoreStock.Add(phrmStoreTxnItems);

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
        public static PHRMStockModel GetStockItemsByItemId(int itemId, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                PHRMStockModel stockItems = (from stock in phrmdbcontext.PHRMStock
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

        //#region Update Stock List
        //public static Boolean UpdateStock(PharmacyDbContext phrmdbcontext, List<PHRMStockModel> Stock)
        //{
        //    try
        //    {
        //        if (Stock.Count > 0)
        //        {
        //            Stock.ForEach(stkItm =>
        //            {
        //                phrmdbcontext.PHRMStock.Attach(stkItm);
        //                phrmdbcontext.Entry(stkItm).Property(x => x.AvailableQuantity).IsModified = true;
        //            });
        //            int i = phrmdbcontext.SaveChanges();
        //            return (i > 0) ? true : false;
        //        }
        //        else
        //        {
        //            return false;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //#endregion

        //#region Add Stock List
        //public static Boolean AddStock(PharmacyDbContext phrmdbcontext, List<PHRMStockModel> Stock)
        //{
        //    try
        //    {
        //        if (Stock.Count > 0)
        //        {
        //            Stock.ForEach(stkItm =>
        //            {
        //                phrmdbcontext.PHRMStock.Add(stkItm);
        //            });
        //            int i = phrmdbcontext.SaveChanges();
        //            return (i > 0) ? true : false;
        //        }
        //        else
        //        {
        //            return false;
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //#endregion

        #region Save Invoice and Invoice Items details to database        
        public static Boolean SaveInvoiceAndInvoiceItems(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            try
            {
                if (invoiceDataFromClient != null && invoiceDataFromClient.InvoiceItems != null)
                {

                    //invoiceDataFromClient.
                    //var discPerinTotal = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    // double discPerForCalcn = decimal.ToDouble(discPerinTotal.Value);
                    invoiceDataFromClient.InvoiceItems.ForEach(item =>
                    {
                        // to calculate Total discount Amount,per item discount amount and price according to discount given  
                        item.Price = item.Price - item.Price * (Convert.ToDecimal(item.DiscountPercentage / 100));
                        item.PerItemDisAmt = (decimal)(((item.SubTotal * Convert.ToDecimal(item.DiscountPercentage)) / 100) / (decimal)item.Quantity);
                        item.CreatedOn = DateTime.Now;
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

                    });
                    invoiceDataFromClient.CreateOn = DateTime.Now;
                    invoiceDataFromClient.CreatedBy = currentUser.EmployeeId;

                    if (invoiceDataFromClient.BilStatus == "unpaid")
                    {
                        invoiceDataFromClient.Creditdate = DateTime.Now;
                    }
                    else
                    {
                        invoiceDataFromClient.Creditdate = null;
                    }
                    invoiceDataFromClient.FiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    phrmdbcontext.PHRMInvoiceTransaction.Add(invoiceDataFromClient);
                    // phrmdbcontext.PHRMNarcoticRecord.Add();
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
        #region Save Provisional Invoice Items details to database        
        public static Boolean SaveCreditInvoiceItems(PHRMInvoiceTransactionModel invoiceDataFromClient, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            try
            {
                if (invoiceDataFromClient != null && invoiceDataFromClient.InvoiceItems != null)
                {
                    //invoiceDataFromClient.
                    List<int> ItemId = new List<int>();
                    // var discPerinTotal = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    //  double discPerForCalcn = decimal.ToDouble(discPerinTotal.Value);
                    invoiceDataFromClient.InvoiceItems.ForEach(item =>
                    {
                        // to calculate discount percent and price according to discount given  
                        item.InvoiceId = null;
                        item.BilItemStatus = "provisional";
                        item.VisitType = invoiceDataFromClient.VisitType;
                        item.PatientId = invoiceDataFromClient.PatientId;
                        item.Price = item.Price - item.Price * (Convert.ToDecimal(item.DiscountPercentage / 100));
                        item.PerItemDisAmt = (decimal)(((item.SubTotal * Convert.ToDecimal(item.DiscountPercentage)) / 100) / (decimal)item.Quantity);
                        item.CreatedOn = DateTime.Now;
                        item.CreatedBy = currentUser.EmployeeId;
                        //add narcotic record in-case of narcotic drugs
                        if (item.NarcoticsRecord.NMCNumber != null)
                        {
                            item.NarcoticsRecord.ItemId = item.ItemId;
                            item.NarcoticsRecord.InvoiceId = item.InvoiceId;
                            item.NarcoticsRecord.InvoiceItemId = item.InvoiceItemId;
                            phrmdbcontext.PHRMNarcoticRecord.Add(item.NarcoticsRecord);
                        }
                        phrmdbcontext.PHRMInvoiceTransactionItems.Add(item);
                    });
                    invoiceDataFromClient.FiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
                    invoiceDataFromClient.CreateOn = DateTime.Now;
                    invoiceDataFromClient.CreatedBy = currentUser.EmployeeId;
                    //phrmdbcontext.PHRMInvoiceTransaction.Add(invoiceDataFromClient);
                    // phrmdbcontext.PHRMNarcoticRecord.Add();
                    int i = phrmdbcontext.SaveChanges();

                    if (requisitionId > 0)
                    {
                        invoiceDataFromClient.InvoiceItems.ForEach(itm =>
                        {
                            if (itm.InvoiceItemId != 0)
                            {
                                ItemId.Add(itm.InvoiceItemId);
                            }
                        });
                        string InvoiceItemIdList = string.Join(",", ItemId);
                        PHRMDrugsRequistionModel phrmDrugRequsition = phrmdbcontext.DrugRequistion.Find(requisitionId);
                        phrmDrugRequsition.ReferenceId = InvoiceItemIdList;
                        phrmDrugRequsition.Status = "completed";
                        phrmdbcontext.Entry(phrmDrugRequsition).State = EntityState.Modified;
                        phrmdbcontext.Entry(phrmDrugRequsition).Property(x => x.Status).IsModified = true;
                        phrmdbcontext.Entry(phrmDrugRequsition).Property(x => x.ReferenceId).IsModified = true;
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

        #region Save Ward Requisition Items details to database        
        public static Boolean SaveWardRequisitionItems(WARDDispatchModel wardDispatchedItems, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            try
            {
                if (wardDispatchedItems != null && wardDispatchedItems.WardDispatchedItemsList != null)
                {
                    List<int> ItemId = new List<int>();
                    Boolean RequisitionFulfilled = true; //to check whether the request is fulfilled or not
                    var countCompare = phrmdbcontext.WardRequisitionItem.Where(a => a.RequisitionId == wardDispatchedItems.RequisitionId && a.DispatchedQty < a.Quantity).ToList().Count;
                    if (countCompare > wardDispatchedItems.WardDispatchedItemsList.Count)
                    {
                        RequisitionFulfilled = false;
                    }
                    wardDispatchedItems.CreatedOn = DateTime.Now;
                    wardDispatchedItems.CreatedBy = currentUser.EmployeeId;
                    wardDispatchedItems.RequisitionId = wardDispatchedItems.RequisitionId;
                    phrmdbcontext.WardDisapatch.Add(wardDispatchedItems);
                    phrmdbcontext.SaveChanges();
                    wardDispatchedItems.WardDispatchedItemsList.ForEach(item =>
                    {
                        item.DispatchId = wardDispatchedItems.DispatchId;
                        item.SubTotal = item.Quantity * (Convert.ToDecimal(item.MRP));
                        item.CreatedOn = DateTime.Now;
                        item.CreatedBy = currentUser.EmployeeId;
                        phrmdbcontext.WardDispatchItems.Add(item);

                        //decrement from store
                        var StoreStock = phrmdbcontext.PHRMStoreStock.Where(a => a.IsActive == true && a.ItemId == item.ItemId && a.BatchNo == item.BatchNo && a.ExpiryDate == item.ExpiryDate).
                        GroupBy(a => new { a.ItemId, a.ExpiryDate, a.BatchNo }).Select(a => new
                        {
                            InQuantity = a.Where(w => w.InOut == "in").Sum(s => s.Quantity),
                            OutQuantity = a.Where(w => w.InOut == "out").Sum(s => s.Quantity),
                            FreeInQuantity = a.Where(w => w.InOut == "in").Sum(s => s.FreeQuantity),
                            FreeOutQuantity = a.Where(w => w.InOut == "out").Sum(s => s.FreeQuantity),
                        }).Select(a => new
                        {
                            Quantity = a.InQuantity + a.FreeInQuantity - a.OutQuantity - a.FreeOutQuantity
                        }).FirstOrDefault();
                        if (StoreStock.Quantity < item.Quantity)
                        {
                            Exception ex = new Exception("Quantity has been changed.");
                            throw ex;
                        }
                        var UpdatedStock = phrmdbcontext.PHRMStoreStock.Where(a => a.IsActive == true && a.ItemId == item.ItemId && a.BatchNo == item.BatchNo && a.ExpiryDate == item.ExpiryDate).FirstOrDefault();
                        UpdatedStock.InOut = "out";
                        UpdatedStock.Quantity = item.Quantity;
                        UpdatedStock.Remark = "Substore Request";
                        UpdatedStock.ReferenceNo = item.DispatchId;
                        UpdatedStock.CreatedBy = currentUser.EmployeeId;
                        UpdatedStock.CreatedOn = DateTime.Now;
                        UpdatedStock.TransactionType = "Substore Dispatch";
                        item.Price = UpdatedStock.Price;
                        phrmdbcontext.PHRMStoreStock.Add(UpdatedStock);
                        phrmdbcontext.SaveChanges();
                        //update requisition item table
                        var requisitionItem = phrmdbcontext.WardRequisitionItem.Where(a => a.RequisitionItemId == item.RequisitionItemId).FirstOrDefault();
                        requisitionItem.DispatchedQty += item.Quantity;
                        if (requisitionItem.DispatchedQty < requisitionItem.Quantity)
                        {
                            RequisitionFulfilled = false;
                        }

                    });
                    decimal total = wardDispatchedItems.WardDispatchedItemsList.Where(a => a.DispatchId == wardDispatchedItems.DispatchId).Sum(item => item.SubTotal);
                    wardDispatchedItems.SubTotal = total;
                    int i = phrmdbcontext.SaveChanges();

                    if (wardDispatchedItems.RequisitionId > 0)
                    {
                        string RequistionItemIdList = string.Join(",", ItemId);
                        WARDRequisitionModel phrmwardRequisition = phrmdbcontext.WardRequisition.Find(wardDispatchedItems.RequisitionId);
                        phrmwardRequisition.ReferenceId = RequistionItemIdList;
                        if (RequisitionFulfilled)
                        {
                            phrmwardRequisition.Status = "complete";
                        }
                        else
                        {
                            phrmwardRequisition.Status = "partial";
                        }
                        phrmdbcontext.WardRequisition.Attach(phrmwardRequisition);
                        phrmdbcontext.Entry(phrmwardRequisition).State = EntityState.Modified;
                        phrmdbcontext.Entry(phrmwardRequisition).Property(x => x.Status).IsModified = true;
                        phrmdbcontext.Entry(phrmwardRequisition).Property(x => x.ReferenceId).IsModified = true;
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

        #region Save ReturnToSupplier and ReturnToSupplierItems To database
        public static Boolean AddReturnToSupplierItems(PHRMReturnToSupplierModel retSupplFromClient, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                if (retSupplFromClient != null && retSupplFromClient.returnToSupplierItems != null)
                {
                    retSupplFromClient.returnToSupplierItems.ForEach(item =>
                    {
                        item.CreatedOn = DateTime.Now;
                        item.FreeQuantity = item.FreeQuantityReturn;
                        item.FreeAmount = item.FreeAmountReturn;

                    });

                    retSupplFromClient.CreatedOn = DateTime.Now;
                    phrmdbcontext.PHRMReturnToSupplier.Add(retSupplFromClient);
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

        #region Save WriteOff and WriteOffItems To database
        public static Boolean SaveWriteOffAndWriteOffItems(PHRMWriteOffModel writeOffFromClient, PharmacyDbContext phrmdbcontext)
        {
            try
            {
                if (writeOffFromClient != null && writeOffFromClient.phrmWriteOffItem != null)
                {
                    writeOffFromClient.CreatedOn = DateTime.Now;
                    writeOffFromClient.phrmWriteOffItem.ForEach(item =>
                    {
                        item.GoodReceiptItemId = null;
                        item.CreatedOn = DateTime.Now;
                    });
                    writeOffFromClient.CreatedOn = DateTime.Now;
                    phrmdbcontext.PHRMWriteOff.Add(writeOffFromClient);
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
                });
                poFromClient.CreatedOn = DateTime.Now;
                poFromClient.PODate = DateTime.Now;
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

        public static Boolean CancelGoodsReceipt(PharmacyDbContext phrmdbcontext, int goodReceiptId, RbacUser currentUser,PHRMGoodsReceiptModel currentGr)
        {
            Boolean flag = true;
            //PHRMStoreModel store = new PHRMStoreModel();
            Boolean isTrue = false;
            var test1 = phrmdbcontext.PHRMGoodsReceiptItems.Where(a => a.GoodReceiptId == goodReceiptId).ToList();
            foreach (var testitm in test1)
            {
                var test = phrmdbcontext.PHRMStoreStock.Where(a => a.GoodsReceiptItemId == testitm.GoodReceiptItemId && a.InOut == "in").Sum(a => a.Quantity + a.FreeQuantity);
                var resitem = test;
                if (testitm.AvailableQuantity + testitm.FreeQuantity > test)
                {
                    isTrue = false;
                }
            }



            var phrmDispensaryStore = (from stk in phrmdbcontext.PHRMStoreStock
                                       join grItem in phrmdbcontext.PHRMGoodsReceiptItems on stk.GoodsReceiptItemId equals grItem.GoodReceiptItemId
                                       where grItem.GoodReceiptId == goodReceiptId && stk.TransactionType == "Transfer To Dispensary"
                                       && stk.InOut == "out"
                                       select stk).FirstOrDefault();

            if (phrmDispensaryStore != null)
            {
                var phrmMainStore = (from stk in phrmdbcontext.PHRMStoreStock
                                     join grItem in phrmdbcontext.PHRMGoodsReceiptItems on stk.GoodsReceiptItemId equals grItem.GoodReceiptItemId
                                     where grItem.GoodReceiptId == goodReceiptId && stk.TransactionType == "Sent From Dispensary"
                                     && stk.InOut == "in"
                                     select stk).FirstOrDefault();

                if (phrmMainStore != null)
                {
                    isTrue = true;
                }
                else
                {
                    isTrue = false;
                }

            }
            else
            {
                isTrue = true;
            }

            if (isTrue)
            {
                var store = phrmdbcontext.PHRMStore.Where(a => a.StoreId ==
              phrmdbcontext.PHRMGoodsReceipt.Where(b => b.GoodReceiptId == goodReceiptId).FirstOrDefault().StoreId);
                var grItems = (from gritms in phrmdbcontext.PHRMGoodsReceiptItems.AsEnumerable()
                               where gritms.GoodReceiptId == goodReceiptId
                               select gritms).ToList();
                List<PHRMStoreStockModel> tempList = new List<PHRMStoreStockModel>();
                grItems.ForEach(itm =>
                {
                    var stockTxnItems = phrmdbcontext.PHRMStoreStock
                        .Where(a => a.ItemId == itm.ItemId
                        && a.BatchNo == itm.BatchNo
                        && a.ExpiryDate == itm.ExpiryDate
                        && a.InOut == "in").ToList()
                        .GroupBy(b => new { b.ItemId, b.BatchNo, b.ExpiryDate })
                        .Select(c => new PHRMStoreStockModel
                        {
                            ItemId = c.Key.ItemId,
                            BatchNo = c.Key.BatchNo,
                            ExpiryDate = c.Key.ExpiryDate,
                            Quantity = c.Where(w => w.InOut == "in").Sum(q => q.Quantity)
                        }).FirstOrDefault();
                    if (stockTxnItems != null)
                    {
                        tempList.Add(stockTxnItems);
                    }
                });

                if (grItems.Count == tempList.Count)
                {
                    tempList.ForEach(tl =>
                    {
                        var res = grItems.Where(g => g.ItemId == tl.ItemId && g.BatchNo == tl.BatchNo && g.ExpiryDate == tl.ExpiryDate
                        ).ToList()
                        .GroupBy(k => new { k.ItemId, k.BatchNo, k.ExpiryDate })
                        .Select(c => new PHRMStockTransactionItemsModel
                        {
                            ItemId = c.Key.ItemId,
                            BatchNo = c.Key.BatchNo,
                            ExpiryDate = c.Key.ExpiryDate,
                            Quantity = c.Sum(q => q.ReceivedQuantity)
                        }).FirstOrDefault();
                        if (res == null || res.Quantity > tl.Quantity)
                        {
                            flag = false;
                        }
                    });
                    if (flag == true)
                    {
                        grItems.ForEach(a =>
                        {
                            PHRMStoreStockModel phrmStoreStock = new PHRMStoreStockModel();
                            phrmStoreStock.ItemId = a.ItemId;
                            phrmStoreStock.ItemName = a.ItemName;
                            phrmStoreStock.IsActive = true;
                            phrmStoreStock.BatchNo = a.BatchNo;
                            phrmStoreStock.ExpiryDate = a.ExpiryDate;
                            phrmStoreStock.Quantity = a.AvailableQuantity;
                            phrmStoreStock.FreeQuantity = a.FreeQuantity;
                            phrmStoreStock.Price = a.GRItemPrice;
                            phrmStoreStock.MRP = a.MRP;
                            phrmStoreStock.StoreId = store.FirstOrDefault().StoreId;
                            phrmStoreStock.StoreName = store.FirstOrDefault().Name;
                            phrmStoreStock.GoodsReceiptItemId = a.GoodReceiptItemId;
                            phrmStoreStock.SubTotal = a.SubTotal;
                            phrmStoreStock.TotalAmount = a.TotalAmount;
                            phrmStoreStock.InOut = "out";
                            phrmStoreStock.ReferenceNo = a.GoodReceiptItemId;
                            phrmStoreStock.TransactionType = "cancelgoodsreceipt";
                            phrmStoreStock.ReferenceItemCreatedOn = a.CreatedOn;
                            phrmStoreStock.CreatedBy = currentUser.EmployeeId;
                            phrmStoreStock.CreatedOn = DateTime.Now;
                            phrmdbcontext.PHRMStoreStock.Add(phrmStoreStock);
                            phrmdbcontext.SaveChanges();
                        });
                        var gr = (from g in phrmdbcontext.PHRMGoodsReceipt
                                  where g.GoodReceiptId == goodReceiptId
                                  select g).FirstOrDefault();
                        gr.IsCancel = true;
                        gr.CancelledBy = currentUser.EmployeeId;
                        gr.CancelledOn = DateTime.Now;
                        gr.CancelRemarks = currentGr.CancelRemarks;

                        phrmdbcontext.PHRMGoodsReceipt.Attach(gr);
                        phrmdbcontext.Entry(gr).State = EntityState.Modified;
                        phrmdbcontext.Entry(gr).Property(x => x.IsCancel).IsModified = true;
                        phrmdbcontext.SaveChanges();
                    }
                    else
                    {
                        flag = false;
                    }

                }
                else
                {
                    flag = false;
                }
            }
            else
            {
                flag = false;
            }
            return flag;
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
            return phrmDbContext.BillingFiscalYear.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearFormatted;
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
        public static Boolean AddUpdateDispensaryStock(PharmacyDbContext phrmdbcontext, List<PHRMDispensaryStockModel> Stock, bool? matchStockId = true)
        {
            try
            {
                if (Stock.Count > 0)
                {
                    foreach (var stkItm in Stock)
                    {
                        var rec = (from ss in phrmdbcontext.DispensaryStock
                                   where (ss.StockId == stkItm.StockId || matchStockId == false) &&
                                   ss.ItemId == stkItm.ItemId && ss.BatchNo == stkItm.BatchNo &&
                                   ss.ExpiryDate == stkItm.ExpiryDate && ss.MRP == stkItm.MRP
                                   select ss).FirstOrDefault();

                        if (rec != null)
                        {
                            if (stkItm.InOut == "out" && rec.AvailableQuantity < stkItm.AvailableQuantity)
                            {
                                var ex = new Exception("Quantity is not available");
                                throw ex;
                            }
                            rec.AvailableQuantity = (stkItm.InOut == "in") ? (rec.AvailableQuantity + stkItm.AvailableQuantity) : (rec.AvailableQuantity - stkItm.AvailableQuantity);
                            phrmdbcontext.DispensaryStock.Attach(rec);
                            phrmdbcontext.Entry(rec).State = EntityState.Modified;
                            phrmdbcontext.Entry(rec).Property(x => x.AvailableQuantity).IsModified = true;
                        }
                        else
                        {
                            phrmdbcontext.DispensaryStock.Add(stkItm);
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

        #region Dispatch Items Complete Transaction 
        //This function is complete transaction after dispatch items. Transactions as below
        //1)Save Dispatched Items,                          2)Save Stock Transaction 
        //3) Update Stock model (available Quantity)        4) Update Requisition and Requisition Items (Status and ReceivedQty,PendingQty, etc)
        public static Boolean DispatchItemsTransaction(PHRMRequisitionStockVM requisitionStockVMFromClient, PharmacyDbContext pharmacyDbContext)
        {
            //Transaction Begin
            using (var dbContextTransaction = pharmacyDbContext.Database.BeginTransaction())
            {
                try
                {
                    //Save Dispatched Items 
                    AddDispatchItems(pharmacyDbContext, requisitionStockVMFromClient.dispatchItems);
                    #region Logic for -Set ReferenceNo in StockTransaction Model from DispatchItems
                    //This for get ReferenceNO (DispatchItemsId from Dispatched Items) and save to StockTransaction    
                    requisitionStockVMFromClient.stockTransactions = requisitionStockVMFromClient.stockTransactions.GroupBy(a => a.ItemId).Select(a => a.First()).ToList();
                    foreach (var stockTXN in requisitionStockVMFromClient.stockTransactions)
                    {
                        var DispatchId = 0;
                        var stockIdFromsTXN = stockTXN.StoreStockId;

                        foreach (var dItem in requisitionStockVMFromClient.dispatchItems)
                        {
                            if (stockTXN.ItemId == dItem.ItemId)
                            {
                                DispatchId = dItem.DispatchItemsId;
                                stockTXN.Quantity = dItem.DispatchedQuantity;
                            }
                        }
                        stockTXN.TransactionType = "StoreRequisition";
                        stockTXN.FreeQuantity = 0;
                        stockTXN.ReferenceNo = DispatchId;
                    }
                    #endregion
                    //Save Stock Transaction record
                    AddStockTransaction(pharmacyDbContext, requisitionStockVMFromClient.stockTransactions);
                    //Update Stock records
                    UpdateStock(pharmacyDbContext, requisitionStockVMFromClient.stockTransactions);
                    //Update Requisition and Requisition Items after Dispatche Items
                    UpdateRequisitionWithRItems(pharmacyDbContext, requisitionStockVMFromClient.requisition);

                    //Commit Transaction
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    //Rollback all transaction if exception occured
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        #endregion
        #region Add DispatchItems
        //Save all Disaptch Items in database
        public static void AddDispatchItems(PharmacyDbContext pharmacyDbContext, List<PHRMDispatchItemsModel> dispatchItems)
        {
            try
            {
                int dispatchId;
                //var test= inventoryDbContext.DispatchItems.Last().DispatchId;
                int maxDispatchId = pharmacyDbContext.StoreDispatchItems.Count();
                if (maxDispatchId == 0)
                {
                    dispatchId = 1;
                }
                else
                {
                    dispatchId = pharmacyDbContext.StoreDispatchItems.ToList().Last().DispatchId + 1;
                }

                foreach (var dispatchItem in dispatchItems)
                {
                    dispatchItem.CreatedOn = System.DateTime.Now;
                    dispatchItem.DispatchId = dispatchId;
                    pharmacyDbContext.StoreDispatchItems.Add(dispatchItem);
                }
                //Save Dispatch Items
                pharmacyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Add Stock Transaction
        //All the stock transaction save to database
        public static void AddStockTransaction(PharmacyDbContext pharmacyDbContext, List<PHRMStoreStockModel> stockTransactions)
        {
            try
            {
                foreach (var stockTransactionItem in stockTransactions)
                {

                    stockTransactionItem.InOut = "out";
                    stockTransactionItem.CreatedOn = System.DateTime.Now;
                    pharmacyDbContext.PHRMStoreStock.Add(stockTransactionItem);
                    //Save Stock Transactions
                    pharmacyDbContext.SaveChanges();

                    var dispensarystockTXN = new PHRMStockTransactionItemsModel();
                    dispensarystockTXN.ItemId = stockTransactionItem.ItemId;
                    dispensarystockTXN.BatchNo = stockTransactionItem.BatchNo;
                    dispensarystockTXN.ExpiryDate = stockTransactionItem.ExpiryDate;
                    dispensarystockTXN.Quantity = stockTransactionItem.Quantity;
                    dispensarystockTXN.FreeQuantity = stockTransactionItem.FreeQuantity;
                    dispensarystockTXN.Price = stockTransactionItem.Price;
                    dispensarystockTXN.DiscountPercentage = stockTransactionItem.DiscountPercentage;
                    dispensarystockTXN.VATPercentage = stockTransactionItem.VATPercentage;
                    dispensarystockTXN.SubTotal = stockTransactionItem.SubTotal;
                    dispensarystockTXN.TotalAmount = stockTransactionItem.TotalAmount;
                    dispensarystockTXN.InOut = "in";
                    dispensarystockTXN.ReferenceNo = stockTransactionItem.ReferenceNo;
                    dispensarystockTXN.ReferenceItemCreatedOn = stockTransactionItem.ReferenceItemCreatedOn;
                    dispensarystockTXN.TransactionType = stockTransactionItem.TransactionType;
                    dispensarystockTXN.CreatedBy = stockTransactionItem.CreatedBy;
                    dispensarystockTXN.CreatedOn = stockTransactionItem.CreatedOn;
                    dispensarystockTXN.MRP = stockTransactionItem.MRP;
                    dispensarystockTXN.GoodsReceiptItemId = stockTransactionItem.GoodsReceiptItemId;
                    dispensarystockTXN.CCCharge = stockTransactionItem.CCCharge;
                    dispensarystockTXN.IsTransferredToACC = null;
                    pharmacyDbContext.PHRMStockTransactionModel.Add(dispensarystockTXN);
                    //Save Stock Transactions
                    pharmacyDbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update Requisition and Requisition Items
        //Update Stock records
        public static void UpdateRequisitionWithRItems(PharmacyDbContext pharmacyDbContext, PHRMStoreRequisitionModel requisition)
        {
            try
            {
                var checkStatus = true;
                foreach (var rItems in requisition.RequisitionItems)
                {
                    pharmacyDbContext.StoreRequisitionItems.Attach(rItems);
                    pharmacyDbContext.Entry(rItems).Property(x => x.ReceivedQuantity).IsModified = true;
                    pharmacyDbContext.Entry(rItems).Property(x => x.PendingQuantity).IsModified = true;
                    if (rItems.ReceivedQuantity >= rItems.PendingQuantity)
                    {
                        pharmacyDbContext.Entry(rItems).Property(x => x.RequisitionItemStatus).IsModified = true;
                    }
                    else
                    {
                        checkStatus = false;
                    }
                }
                if (checkStatus)
                {
                    pharmacyDbContext.StoreRequisition.Attach(requisition);
                    pharmacyDbContext.Entry(requisition).Property(x => x.RequisitionStatus).IsModified = true;
                }

                pharmacyDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update Stock
        //Update Stock records
        public static void UpdateStock(PharmacyDbContext pharmacyDbContext, List<PHRMStoreStockModel> StockTXN)
        {
            try
            {
                var dispensaryStock = new PHRMDispensaryStockModel();
                dispensaryStock.ItemId = StockTXN[0].ItemId;
                dispensaryStock.AvailableQuantity = StockTXN[0].Quantity;
                dispensaryStock.MRP = StockTXN[0].MRP;
                dispensaryStock.Price = StockTXN[0].Price;
                dispensaryStock.ExpiryDate = StockTXN[0].ExpiryDate;
                dispensaryStock.BatchNo = StockTXN[0].BatchNo;

                var availableStock = pharmacyDbContext.DispensaryStock.Where(a => a.ItemId == dispensaryStock.ItemId && a.MRP == dispensaryStock.MRP && a.Price == dispensaryStock.MRP && a.ExpiryDate == dispensaryStock.ExpiryDate && a.BatchNo == dispensaryStock.BatchNo).Select(a => a).FirstOrDefault();
                if (availableStock != null)
                {
                    availableStock.AvailableQuantity += dispensaryStock.AvailableQuantity;
                    pharmacyDbContext.DispensaryStock.Attach(availableStock);
                    pharmacyDbContext.Entry(availableStock).State = EntityState.Modified;
                    pharmacyDbContext.Entry(availableStock).Property(x => x.AvailableQuantity).IsModified = true;
                }
                else
                {
                    pharmacyDbContext.DispensaryStock.Add(dispensaryStock);
                }
                //Update Stock records
                pharmacyDbContext.SaveChanges();
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
            var totalItem = phrmdbcontext.DispensaryStock.ToList();
            foreach (var totItm in totalItem)
            {
                foreach (var invItm in invoiceItems)
                {
                    if (totItm.StockId == invItm.StockId && totItm.AvailableQuantity < invItm.Quantity)
                    {
                        isStockAvailable = false;
                    }
                }

            }
            return isStockAvailable;
        }
        #region UPDATE MRP IN BOTH DISPENSARY AND STORE
        public static void UpdateMRPForDispensaryStock(PHRMUpdatedStockVM mrpUpdatedStock, PharmacyDbContext db)
        {
            var dispensaryStockMRP = db.DispensaryStock.Where(DS => DS.StockId == mrpUpdatedStock.StockId).FirstOrDefault();
            if (dispensaryStockMRP == null) throw new Exception("Stock Not Found");
            var OldMRP = dispensaryStockMRP.MRP;
            dispensaryStockMRP.MRP = mrpUpdatedStock.MRP;
            //to Update in the history table
            mrpUpdatedStock.OldMRP = OldMRP ?? 0;
            db.SaveChanges();
        }

        public static void UpdateMRPForStoreStock(PHRMUpdatedStockVM mrpUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            var allStoreStock = db.PHRMStoreStock.Where(SS => SS.ItemId == mrpUpdatedStock.ItemId && SS.ExpiryDate == mrpUpdatedStock.ExpiryDate && SS.BatchNo == mrpUpdatedStock.BatchNo && SS.GoodsReceiptItemId == mrpUpdatedStock.GoodsReceiptItemId).ToList();
            if (allStoreStock == null) throw new Exception("Stock Not Found");
            allStoreStock.ForEach(SS =>
            {
                SS.MRP = mrpUpdatedStock.MRP;
                SS.SubTotal = Convert.ToDecimal(SS.MRP) * Convert.ToDecimal(SS.Quantity);
                SS.TotalAmount = SS.SubTotal;
                SS.ModifiedBy = currentUser.EmployeeId;
                SS.ModifiedOn = DateTime.Now;
                mrpUpdatedStock.StockId = SS.StoreStockId;
                mrpUpdatedStock.StoreStockId = SS.StoreStockId;
            });
            db.SaveChanges();
        }

        public static void UpdateMRPHistory(PHRMUpdatedStockVM mrpUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            var MRPHistoryData = new PHRMMRPHistoryModel();
            MRPHistoryData.PHRMStockTxnItemId = Convert.ToInt32(mrpUpdatedStock.StockId);
            MRPHistoryData.MRP = mrpUpdatedStock.MRP;
            MRPHistoryData.OldMRP = mrpUpdatedStock.OldMRP;
            MRPHistoryData.StoreStockId = (int)mrpUpdatedStock.StockId;
            MRPHistoryData.CreatedBy = currentUser.EmployeeId;
            MRPHistoryData.EndDate = DateTime.Now;
            MRPHistoryData.LocationId = mrpUpdatedStock.LocationId;
            db.MRPHistories.Add(MRPHistoryData);
            db.SaveChanges();
        }
        #endregion
        #region  UPDATE EXPIRY DATE AND BATCHNO IN STORE
        public static void UpdateStockExpiryDateandBatchNoForStoreStock(PHRMUpdatedStockVM expbatchUpdatedStock, PharmacyDbContext db, RbacUser currentUser)
        {
            var allStoreStock = db.PHRMStoreStock.Where(SS => SS.ItemId == expbatchUpdatedStock.ItemId && SS.BatchNo == expbatchUpdatedStock.OldBatchNo && SS.ExpiryDate == expbatchUpdatedStock.OldExpiryDate && SS.GoodsReceiptItemId == expbatchUpdatedStock.GoodsReceiptItemId).ToList();
            var dt = db;
            var stockData = dt.PHRMStoreStock.Where(ss => ss.ItemId == expbatchUpdatedStock.ItemId).FirstOrDefault();
            if (allStoreStock == null) throw new Exception("Stock Not Found");

            allStoreStock.ForEach(SS =>
            {
                SS.ExpiryDate = expbatchUpdatedStock.ExpiryDate;
                SS.BatchNo = expbatchUpdatedStock.BatchNo;
                SS.ModifiedBy = currentUser.EmployeeId;
                SS.ModifiedOn = DateTime.Now;
                expbatchUpdatedStock.StoreStockId = SS.StoreStockId;
            });
            db.SaveChanges();
        }
        #endregion
        public static void PostExpiryDateandBatchNoHistory(PHRMUpdatedStockVM storestockData, PharmacyDbContext db, RbacUser currentUser)
        {
            var ExpBatchHistoryData = new PHRMExpiryDateBatchNoHistoryModel();
            ExpBatchHistoryData.StoreStockId = storestockData.StoreStockId;
            ExpBatchHistoryData.OldExpiryDate = storestockData.OldExpiryDate;
            ExpBatchHistoryData.OldBatchNo = storestockData.OldBatchNo;
            ExpBatchHistoryData.CreatedBy = currentUser.EmployeeId;
            ExpBatchHistoryData.EndDate = DateTime.Now;
            db.ExpiryDateBatchNoHistories.Add(ExpBatchHistoryData);
            db.SaveChanges();
        }
    }
}