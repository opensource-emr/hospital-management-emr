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
//using DanpheEMR.Sync.IRDNepal.Models;
using Newtonsoft.Json;
using DanpheEMR.Utilities;
using System.Data;
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
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status
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

                    ///Getting GrId 
                    var GRID = grViewModelData.goodReceipt.GoodReceiptId;
                    ///Get GrItemsList based on GRID
                    var grItemsList = (from GrItems in phrmdbcontext.PHRMGoodsReceiptItems
                                       join gr in phrmdbcontext.PHRMGoodsReceipt on GrItems.GoodReceiptId equals gr.GoodReceiptId
                                       where GrItems.GoodReceiptId == GRID
                                       select GrItems

                                    ).ToList();
                    /////// Add GRItems Txn to StockTransactionItems
                    //List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    //List<PHRMStoreStockModel> phrmStoreStock = new List<PHRMStoreStockModel>();
                    //for (int i = 0; i < grItemsList.Count; i++)
                    //{
                    //    //////Gets and Sets GRItems Txn to StockTransactionItems
                    //    var selectedstockTxnItm = new PHRMStockTransactionItemsModel();

                    //    selectedstockTxnItm.ItemId = grItemsList[i].ItemId;
                    //    selectedstockTxnItm.BatchNo = grItemsList[i].BatchNo;
                    //    selectedstockTxnItm.ExpiryDate = grItemsList[i].ExpiryDate;
                    //    selectedstockTxnItm.CCCharge = grItemsList[i].CCCharge;
                    //    selectedstockTxnItm.Quantity = grItemsList[i].ReceivedQuantity;
                    //    selectedstockTxnItm.FreeQuantity = grItemsList[i].FreeQuantity;
                    //    selectedstockTxnItm.Price = grItemsList[i].GRItemPrice;
                    //    selectedstockTxnItm.DiscountPercentage = grItemsList[i].DiscountPercentage;
                    //    selectedstockTxnItm.VATPercentage = grItemsList[i].VATPercentage;
                    //    selectedstockTxnItm.SubTotal = grItemsList[i].SubTotal;
                    //    selectedstockTxnItm.TotalAmount = grItemsList[i].TotalAmount;
                    //    selectedstockTxnItm.InOut = "in";
                    //    selectedstockTxnItm.ReferenceNo = grItemsList[i].GoodReceiptItemId;
                    //    selectedstockTxnItm.ReferenceItemCreatedOn = DateTime.Now;
                    //    selectedstockTxnItm.TransactionType = "goodsreceipt"; ///during GR Transaction Type is goodsreceipt
                    //    selectedstockTxnItm.MRP = grItemsList[i].MRP;
                    //    selectedstockTxnItm.CreatedBy = grItemsList[i].CreatedBy;
                    //    //grItemsList[i].CounterId;
                    //    phrmStockTxnItems.Add(selectedstockTxnItm);
                    //    phrmdbcontext.SaveChanges();
                    //}
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
                        selectedStoreStock.InOut = "in";
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
                    }
                    ///common function to StockTransactionItems by passing List<PHRMStockTransactionItemsModel>
                    //var StkTxnReslt = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
                    flag.Add(true);
                    ///Ajay/04/jan'19: Commented below code ,now stock table is managed in trigger
                    /////  Add and Update Available Quantity of Item in Stock Table
                    //List<PHRMStockModel> updateStockList = new List<PHRMStockModel>();
                    //List<PHRMStockModel> addStockList = new List<PHRMStockModel>();
                    //for (int i = 0; i < grItemsList.Count; i++)
                    //{
                    //    PHRMStockModel curtStock = new PHRMStockModel();


                    //    /////get list of Current Stock Item by Passing ItemId
                    //    curtStock = GetStockItemsByItemId(grItemsList[i].ItemId, phrmdbcontext);
                    //    if (curtStock != null)
                    //    {   /////if Items is Already in Stoock Table then update the stock with latest quantity                                                                                   
                    //        curtStock.AvailableQuantity = curtStock.AvailableQuantity + grItemsList[i].ReceivedQuantity;
                    //        updateStockList.Add(curtStock);
                    //        //UpdateStock(phrmdbcontext, curtStock);
                    //    }
                    //    else
                    //    {   //// if Items is Not present in List means We have to add current item as New Item in Stock table
                    //        PHRMStockModel addStockData = new PHRMStockModel();
                    //        addStockData.ItemId = grItemsList[i].ItemId;
                    //        addStockData.AvailableQuantity = grItemsList[i].ReceivedQuantity;
                    //        addStockList.Add(addStockData);
                    //    }


                    //}

                    //if (updateStockList.Count > 0)
                    //{
                    //    var UpdStkReslt = UpdateStock(phrmdbcontext, updateStockList);
                    //    flag.Add(UpdStkReslt);

                    //}
                    //if (addStockList.Count > 0)
                    //{
                    //    var AddStkReslt = AddStock(phrmdbcontext, addStockList);
                    //    flag.Add(AddStkReslt);
                    //}

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
        public static BillingFiscalYear GetFiscalYear(PharmacyDbContext phrmdbcontext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return phrmdbcontext.BillingFiscalYear.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }

        public static int GetInvoiceNumber(PharmacyDbContext phrmdbcontext)
        {
            int fiscalYearId = GetFiscalYear(phrmdbcontext).FiscalYearId;
            
            int invoiceNumber = (from txn in phrmdbcontext.PHRMInvoiceTransaction
                                  where txn.FiscalYearId == fiscalYearId
                                  select txn.InvoicePrintId).DefaultIfEmpty(0).Max();
            return invoiceNumber + 1;
        }

        public static string GetFiscalYearFormattedName(PharmacyDbContext phrmdbcontext, int? fiscalYearId)
        {
            if (fiscalYearId != null)
            {
                return phrmdbcontext.BillingFiscalYear.Where(fsc => fsc.FiscalYearId == fiscalYearId).FirstOrDefault().FiscalYearFormatted;
            }
            else {
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
                    //Save Invoice And Invoice Items details
                    var saveRes = SaveInvoiceAndInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser);
                    flag.Add(saveRes);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    invoiceDataFromClient.InvoiceItems.ForEach(
                        itm =>
                        {
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
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
                        double discPerForCalcn = decimal.ToDouble(discPer.Value);
                        var currQuantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        var tempStockTxnItems = new PHRMStockTransactionItemsModel();
                        tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        tempStockTxnItems.CreatedOn = DateTime.Now;
                        tempStockTxnItems.DiscountPercentage = discPerForCalcn;
                        //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
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
                        tempStockTxnItems.ReferenceNo = invoiceDataFromClient.InvoiceItems[i].InvoiceId;
                        tempStockTxnItems.TransactionType = "sale";
                        tempStockTxnItems.GoodsReceiptItemId = invoiceDataFromClient.InvoiceItems[i].GoodReceiptItemId;
                        string avlbleQty = invoiceDataFromClient.InvoiceItems[i].AvailableQuantity.ToString();
                        invoiceDataFromClient.InvoiceItems[i].AvailableQuantity = Convert.ToDouble(avlbleQty) - currQuantity;
                        decimal subTotal = (Convert.ToDecimal(tempStockTxnItems.Quantity) - Convert.ToDecimal(tempStockTxnItems.FreeQuantity)) * Convert.ToDecimal(tempStockTxnItems.Price);
                        decimal discountAmt = (subTotal * Convert.ToDecimal(tempStockTxnItems.DiscountPercentage)) / 100;
                        tempStockTxnItems.SubTotal = subTotal - discountAmt;
                        tempStockTxnItems.TotalAmount = tempStockTxnItems.SubTotal * (1 - Convert.ToDecimal(discPerForCalcn));
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
                    var discPer = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status       
                    //Save Invoice And Invoice Items details
                    var saveRes = SaveCreditInvoiceItems(invoiceDataFromClient, phrmdbcontext, currentUser, requisitionId);
                    flag.Add(saveRes);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    invoiceDataFromClient.InvoiceItems.ForEach(
                        itm =>
                        {
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
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
                        double discPerForCalcn = decimal.ToDouble(discPer.Value);
                        var currQuantity = invoiceDataFromClient.InvoiceItems[i].Quantity.Value;
                        var tempStockTxnItems = new PHRMStockTransactionItemsModel();
                        tempStockTxnItems.CreatedBy = currentUser.EmployeeId;
                        tempStockTxnItems.CreatedOn = DateTime.Now;
                        tempStockTxnItems.DiscountPercentage = discPerForCalcn;
                        //tempStockTxnItems.DiscountPercentage = invoiceDataFromClient.InvoiceItems[i].DiscountPercentage.Value;
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
                        decimal subTotal = (Convert.ToDecimal(tempStockTxnItems.Quantity) - Convert.ToDecimal(tempStockTxnItems.FreeQuantity)) * Convert.ToDecimal(tempStockTxnItems.Price);
                        decimal discountAmt = (subTotal * Convert.ToDecimal(tempStockTxnItems.DiscountPercentage)) / 100;
                        tempStockTxnItems.SubTotal = subTotal - discountAmt;
                        tempStockTxnItems.TotalAmount = tempStockTxnItems.SubTotal * (1 - Convert.ToDecimal(discPerForCalcn));
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
        public static WARDDispatchModel WardRequisitionItemsDispatch(WARDDispatchModel wardDispatchedItems, PharmacyDbContext phrmdbcontext, RbacUser currentUser, int requisitionId = 0)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {

                    List<Boolean> flag = new List<bool>();

                    var saveRes = SaveWardRequisitionItems(wardDispatchedItems, phrmdbcontext, currentUser, requisitionId);
                    flag.Add(saveRes);
                    //Make StockTransaction object data for post/save

                    List<WARDStockModel> wardStockTxnItems = new List<WARDStockModel>();
                    var ward = (from wardReq in phrmdbcontext.WardRequisition
                                join wardReqItem in phrmdbcontext.WardRequisitionItem on wardReq.RequisitionId equals wardReqItem.RequisitionId
                                join wardModel in phrmdbcontext.WardModel on wardReq.WardId equals wardModel.WardId
                                join disp in phrmdbcontext.WardDisapatch on wardReqItem.RequisitionId equals disp.RequisitionId
                                where wardReq.RequisitionId == wardDispatchedItems.RequisitionId
                                select new
                                {
                                    WardId = wardReq.WardId,
                                    WardName = wardModel.WardName
                                }).FirstOrDefault();

                    //loop RequisitionItems and make stock transaction object
                    for (int i = 0; i < wardDispatchedItems.WardDispatchedItemsList.Count; i++)
                    {

                        var currQuantity = wardDispatchedItems.WardDispatchedItemsList[i].Quantity;
                        var tempStockTxnItems = new WARDStockModel();

                        tempStockTxnItems.WardId = ward.WardId;
                        tempStockTxnItems.WardName = ward.WardName;
                        tempStockTxnItems.ItemId = wardDispatchedItems.WardDispatchedItemsList[i].ItemId;
                        tempStockTxnItems.AvailableQuantity = wardDispatchedItems.WardDispatchedItemsList[i].Quantity;
                        tempStockTxnItems.MRP = Convert.ToDouble(wardDispatchedItems.WardDispatchedItemsList[i].MRP);
                        tempStockTxnItems.BatchNo = wardDispatchedItems.WardDispatchedItemsList[i].BatchNo;
                        tempStockTxnItems.ExpiryDate = wardDispatchedItems.WardDispatchedItemsList[i].ExpiryDate;
                        tempStockTxnItems.ItemName = wardDispatchedItems.WardDispatchedItemsList[i].ItemName;
                        tempStockTxnItems.DispachedQuantity = wardDispatchedItems.WardDispatchedItemsList[i].Quantity;
                        tempStockTxnItems.StockType = "pharmacy";
                        wardStockTxnItems.Add(tempStockTxnItems);
                        if (currQuantity == 0)
                        {
                            break;
                        }
                    }
                    var StkTxnRes = AddWardStockItems(phrmdbcontext, wardStockTxnItems);
                    flag.Add(StkTxnRes);

                    if (CheckFlagList(flag))
                    {
                        dbContextTransaction.Commit();//Commit Transaction
                        return wardDispatchedItems;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();//Rollback transaction
                        return wardDispatchedItems;
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
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                            tempdispensaryStkTxn.AvailableQuantity = itm.WriteOffQuantity;
                            tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                            tempdispensaryStkTxn.MRP = itm.MRP;
                            tempdispensaryStkTxn.InOut = "out";
                            tempdispensaryStkTxn.ItemId = itm.ItemId;
                            tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
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
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
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
                    selecteddispensarystock.BatchNo = storeStockData.BatchNo;
                    selecteddispensarystock.ExpiryDate = storeStockData.ExpiryDate;
                    selecteddispensarystock.AvailableQuantity = Convert.ToDouble(storeStockData.Quantity);
                    selecteddispensarystock.Price = storeStockData.Price;
                    selecteddispensarystock.InOut = "in";
                    selecteddispensarystock.MRP = storeStockData.MRP;
                    phrmDispensaryStockModels.Add(selecteddispensarystock);

                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryStockModels);
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
                    StockTxnItem.CreatedBy = currentUser.EmployeeId;
                    StockTxnItem.MRP = storeStockData.MRP;
                    StockTxnItem.GoodsReceiptItemId = storeStockData.GoodsReceiptItemId;
                    StockTxnItem.DispensaryId = storeStockData.DispensaryId;
                    phrmStockTxnItems.Add(StockTxnItem);
                    var StockTxnResult = AddStockTransactionItems(phrmdbcontext, phrmStockTxnItems);
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
                    StoreTxnItem.ItemName = (from itm in phrmdbcontext.PHRMItemMaster
                                             where itm.ItemId == dispensaryStockData.ItemId
                                             select itm.ItemName).ToList().FirstOrDefault();
                    StoreTxnItem.StoreName = (from store in phrmdbcontext.PHRMStore
                                              where store.StoreId == StoreId
                                              select store.Name).ToList().FirstOrDefault();
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
        public static Boolean ReturnFromCustomerTransaction(List<PHRMInvoiceReturnItemsModel> returnInvClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            //Transaction Begin
            using (var dbContextTransaction = phrmdbcontext.Database.BeginTransaction())
            {
                try
                {
                    List<Boolean> flag = new List<bool>(); //for checking all transaction status                                           

                    //#1 Post to PHRMInvoiceReturnItemsModel
                    var invItmsPostResult = SaveReturnInvoiceItems(returnInvClientData, phrmdbcontext, currentUser);
                    flag.Add(invItmsPostResult);
                    var updateInvoiceReturnStatus = UpdateInvoiceReturnStatus(returnInvClientData[0].InvoiceId, phrmdbcontext);
                    flag.Add(updateInvoiceReturnStatus);
                    //# post to PHRMDispensaryStock tables.
                    List<PHRMDispensaryStockModel> phrmDispensaryItems = new List<PHRMDispensaryStockModel>();
                    returnInvClientData.ForEach(
                        itm =>
                        {
                            PHRMDispensaryStockModel tempdispensaryStkTxn = new PHRMDispensaryStockModel();
                            tempdispensaryStkTxn.AvailableQuantity = itm.Quantity;
                            tempdispensaryStkTxn.BatchNo = itm.BatchNo;
                            tempdispensaryStkTxn.MRP = itm.MRP;
                            tempdispensaryStkTxn.InOut = "in";
                            tempdispensaryStkTxn.ItemId = itm.ItemId;
                            tempdispensaryStkTxn.Price = itm.Price;
                            tempdispensaryStkTxn.ExpiryDate = itm.ExpiryDate;
                            phrmDispensaryItems.Add(tempdispensaryStkTxn);
                        }
                        );
                    var addUpdateDispensaryReslt = AddUpdateDispensaryStock(phrmdbcontext, phrmDispensaryItems);
                    flag.Add(addUpdateDispensaryReslt);


                    //#4 Post to Stock Transaction table as salereturn txn type

                    List<PHRMStockTransactionItemsModel> phrmStockTxnItems = new List<PHRMStockTransactionItemsModel>();
                    returnInvClientData.ForEach(
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
                            tempStkTxn.Quantity = Convert.ToDouble(itm.Quantity);
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
                        item.GrPerItemVATAmt = (decimal)((((item.SubTotal - ((item.SubTotal * dispercentage) / 100)) / 100) * vatpercentage) / (decimal)item.ReceivedQuantity);
                        item.GrPerItemDisAmt = (decimal)(((item.SubTotal * dispercentage) / 100) / (decimal)item.ReceivedQuantity);
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
        public static Boolean AddWardStockItems(PharmacyDbContext phrmdbcontext, List<WARDStockModel> wardStockTxnItems)
        {
            try
            {
                for (int i = 0; i < wardStockTxnItems.Count; i++)
                {
                    phrmdbcontext.WardStock.Add(wardStockTxnItems[i]);
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
                    var discPerinTotal = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    double discPerForCalcn = decimal.ToDouble(discPerinTotal.Value);
                    invoiceDataFromClient.InvoiceItems.ForEach(item =>
                    {
                        // to calculate discount percent and price according to discount given  
                        item.TotalAmount = item.TotalAmount - item.TotalAmount * (Convert.ToDecimal(discPerForCalcn / 100));
                        item.Price = item.Price - item.Price * (Convert.ToDecimal(discPerForCalcn / 100));
                        item.DiscountPercentage = discPerForCalcn;
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

                    });
                    invoiceDataFromClient.CreateOn = DateTime.Now;
                    invoiceDataFromClient.CreatedBy = currentUser.EmployeeId;
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
                    var discPerinTotal = (invoiceDataFromClient.DiscountAmount / invoiceDataFromClient.SubTotal) * 100;
                    double discPerForCalcn = decimal.ToDouble(discPerinTotal.Value);
                    invoiceDataFromClient.InvoiceItems.ForEach(item =>
                    {
                        // to calculate discount percent and price according to discount given  
                        item.InvoiceId = null;
                        item.BilItemStatus = "provisional";
                        item.PatientId = invoiceDataFromClient.PatientId;
                        item.TotalAmount = item.TotalAmount - item.TotalAmount * (Convert.ToDecimal(discPerForCalcn / 100));
                        item.Price = item.Price - item.Price * (Convert.ToDecimal(discPerForCalcn / 100));
                        item.DiscountPercentage = discPerForCalcn;
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

                    wardDispatchedItems.CreatedOn = DateTime.Now.Date;
                    wardDispatchedItems.CreatedBy = currentUser.EmployeeId;
                    wardDispatchedItems.RequisitionId = wardDispatchedItems.RequisitionId;
                    phrmdbcontext.WardDisapatch.Add(wardDispatchedItems);
                    wardDispatchedItems.WardDispatchedItemsList.ForEach(item =>
                    {
                        item.DispatchId = wardDispatchedItems.DispatchId;
                        item.SubTotal = item.Quantity * (Convert.ToDecimal(item.MRP));
                        item.CreatedOn = DateTime.Now;
                        item.CreatedBy = currentUser.EmployeeId;
                        phrmdbcontext.WardDispatchItems.Add(item);
                    });
                    decimal total = wardDispatchedItems.WardDispatchedItemsList.Where(a => a.DispatchId == wardDispatchedItems.DispatchId).Sum(item => item.SubTotal);
                    wardDispatchedItems.SubTotal = total;
                    int i = phrmdbcontext.SaveChanges();

                    if (wardDispatchedItems.RequisitionId > 0)
                    {
                        string RequistionItemIdList = string.Join(",", ItemId);
                        WARDRequisitionModel phrmwardRequisition = phrmdbcontext.WardRequisition.Find(wardDispatchedItems.RequisitionId);
                        phrmwardRequisition.ReferenceId = RequistionItemIdList;
                        phrmwardRequisition.Status = "complete";
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
        private static Boolean SaveReturnInvoiceItems(List<PHRMInvoiceReturnItemsModel> returnInvClientData, PharmacyDbContext phrmdbcontext, RbacUser currentUser)
        {
            var currFiscalYear = GetFiscalYear(phrmdbcontext);
            int? maxCreditNoteNum = phrmdbcontext.PHRMInvoiceReturnItemsModel.Where(a => a.FiscalYearId == currFiscalYear.FiscalYearId).Max(a => a.CreditNoteNumber);
            if (maxCreditNoteNum == null || !maxCreditNoteNum.HasValue)
            {
                maxCreditNoteNum = 0;
            }

            try
            {
                if (returnInvClientData.Count > 0)
                {
                    returnInvClientData.ForEach(invItm =>
                    {
                        invItm.CreatedOn = System.DateTime.Now;
                        invItm.CreatedBy = currentUser.EmployeeId;
                        invItm.FiscalYearId = currFiscalYear.FiscalYearId;
                        invItm.CreditNoteNumber = (int?)(maxCreditNoteNum + 1);
                        phrmdbcontext.PHRMInvoiceReturnItemsModel.Add(invItm);
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

        public static Boolean CancelGoodsReceipt(PharmacyDbContext phrmdbcontext, int goodReceiptId, RbacUser currentUser)
        {
            Boolean flag = true;
            //PHRMStoreModel store = new PHRMStoreModel();
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
                        //PHRMStockTransactionItemsModel stockTransactionItem = new PHRMStockTransactionItemsModel();
                        //stockTransactionItem.ItemId = a.ItemId;
                        //stockTransactionItem.BatchNo = a.BatchNo;
                        //stockTransactionItem.ExpiryDate = a.ExpiryDate;
                        //stockTransactionItem.Quantity = a.AvailableQuantity;
                        //stockTransactionItem.FreeQuantity = a.FreeQuantity;
                        //stockTransactionItem.Price = a.GRItemPrice;
                        //stockTransactionItem.MRP = a.SellingPrice;
                        //stockTransactionItem.GoodsReceiptItemId = a.GoodReceiptItemId;
                        //stockTransactionItem.SubTotal = a.SubTotal;
                        //stockTransactionItem.TotalAmount = a.TotalAmount;
                        //stockTransactionItem.InOut = "out";
                        //stockTransactionItem.ReferenceNo = a.GoodReceiptItemId;
                        //stockTransactionItem.TransactionType = "cancelgoodsreceipt";
                        //stockTransactionItem.ReferenceItemCreatedOn = a.CreatedOn;
                        //stockTransactionItem.CreatedBy = currentUser.EmployeeId;
                        //stockTransactionItem.CreatedOn = DateTime.Now;
                        //phrmdbcontext.PHRMStockTransactionModel.Add(stockTransactionItem);
                        //phrmdbcontext.SaveChanges();
                        //To store in storestock table 
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
            return flag;
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

        #region Add or update dispensary Stock List in PHRM_DispensaryStock table
        public static Boolean AddUpdateDispensaryStock(PharmacyDbContext phrmdbcontext, List<PHRMDispensaryStockModel> Stock)
        {
            try
            {
                if (Stock.Count > 0)
                {
                    Stock.ForEach(stkItm =>
                    {
                        var rec = (from ss in phrmdbcontext.DispensaryStock
                                   where ss.ItemId == stkItm.ItemId && ss.BatchNo == stkItm.BatchNo &&
                                   ss.ExpiryDate == stkItm.ExpiryDate && (ss.MRP == stkItm.MRP || ss.Price == stkItm.Price)
                                   select ss).ToList().FirstOrDefault();

                        if (rec != null)
                        {
                            rec.AvailableQuantity = (stkItm.InOut == "in") ? (rec.AvailableQuantity + stkItm.AvailableQuantity) : (rec.AvailableQuantity - stkItm.AvailableQuantity);
                            phrmdbcontext.DispensaryStock.Attach(rec);
                            phrmdbcontext.Entry(rec).State = EntityState.Modified;
                            phrmdbcontext.Entry(rec).Property(x => x.AvailableQuantity).IsModified = true;

                        }
                        else
                        {
                            phrmdbcontext.DispensaryStock.Add(stkItm);
                        }
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
    }
}
