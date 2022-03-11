using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.Security;
using DanpheEMR.Enums;
using System.Data.SqlClient;
using System.Data.Entity.Infrastructure;

namespace DanpheEMR.Controllers.Billing
{
    public class BillingTransactionBL
    {
        //private static int invoiceNoTest = 1; // to test the duplicate invoiceNo.

        //post to BIL_TXN_BillingTransaction
        public static BillingTransactionModel PostBillingTransaction(BillingDbContext dbContext,
            string connString,
            BillingTransactionModel billingTransaction,
            RbacUser currentUser,
            DateTime currentDate)
        {
            List<BillingTransactionItemModel> newTxnItems = new List<BillingTransactionItemModel>();
            dbContext.AuditDisabled = false;
            if (billingTransaction.BillingTransactionItems != null && billingTransaction.BillingTransactionItems.Count > 0)
            {
                foreach (var txnItem in billingTransaction.BillingTransactionItems)
                {

                    BillingTransactionItemModel clonedItem = BillingTransactionItemModel.GetClone(txnItem);
                    clonedItem.BillingTransaction = null;
                    newTxnItems.Add(clonedItem);
                }
                billingTransaction.BillingTransactionItems = null;
            }
            //if paymentmode is credit, paiddate and paidamount should be null
            //handle this in client side as well. 
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            if (billingTransaction.BillStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                //sud:11May'21--Removing Adjustment Amounts. <NOT REQUIRED>
                //double? totalAmount = billingTransaction.TotalAmount;
                //int i = (int)totalAmount;
                //billingTransaction.TotalAmount = i;
                //string s = totalAmount.ToString();
                //s = s.Replace(i + "", "");
                //billingTransaction.AdjustmentTotalAmount = String.IsNullOrEmpty(s) ? 0 : Convert.ToDecimal(s);
                billingTransaction.PaidDate = null;
                billingTransaction.PaidAmount = null;
                billingTransaction.PaymentReceivedBy = null;
                billingTransaction.PaidCounterId = null;

            }
            else if (billingTransaction.BillStatus == ENUM_BillingStatus.paid)// "paid")
            {
                //sud:11May'21--Removing Adjustment Amounts. <NOT REQUIRED>
                //double? totalAmount = billingTransaction.TotalAmount;
                //int i = (int)totalAmount;
                //billingTransaction.TotalAmount = i;
                //string s = totalAmount.ToString();
                //s = s.Replace(i + "", "");
                //billingTransaction.AdjustmentTotalAmount = String.IsNullOrEmpty(s) ? 0 : Convert.ToDecimal(s);
                billingTransaction.PaidDate = currentDate;
                billingTransaction.PaidCounterId = billingTransaction.CounterId;
                billingTransaction.PaymentReceivedBy = billingTransaction.CreatedBy;
            }

            BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

            //ashim: 26Aug2018: Moved from client side to server side.
            billingTransaction.CreatedOn = currentDate;
            billingTransaction.CreatedBy = currentUser.EmployeeId;
            billingTransaction.FiscalYearId = fiscYear.FiscalYearId;
            //billingTransaction.InvoiceCode = BillingBL.InvoiceCode;
            billingTransaction.InvoiceCode = billingTransaction.IsInsuranceBilling == true ? "INS" : BillingBL.InvoiceCode;
            //if (string.IsNullOrEmpty(billingTransaction.LabTypeName))
            //{
            //    billingTransaction.LabTypeName = "op-lab";
            //}
            dbContext.BillingTransactions.Add(billingTransaction);

            dbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
            dbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dbContext, connString); //To avoid the duplicate the invoiceNo..

            dbContext.AuditDisabled = true;

            PostUpdateBillingTransactionItems(dbContext,
                   connString,
                   newTxnItems,
                   currentUser, currentDate,
                   billingTransaction.BillStatus,
                   billingTransaction.CounterId,
                   billingTransaction.BillingTransactionId);
            dbContext.SaveChanges();

            if (billingTransaction.BillStatus == ENUM_BillingStatus.paid)
            { //If transaction is done with Depositor paymentmode is credit we don't have to add in EmpCashTransaction table
                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = "CashSales";
                empCashTransaction.ReferenceNo = billingTransaction.BillingTransactionId;
                empCashTransaction.InAmount = billingTransaction.TotalAmount;
                empCashTransaction.OutAmount = 0;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                //empCashTransaction.Description = billingTransaction.de;
                empCashTransaction.TransactionDate = DateTime.Now;
                empCashTransaction.CounterID = billingTransaction.CounterId;

                BillingBL.AddEmpCashTransaction(dbContext, empCashTransaction);
            }

            //step:3-- if there's deposit deduction, then add to deposit table. 
            if (billingTransaction.PaymentMode != ENUM_BillPaymentMode.credit // "credit" 
                && billingTransaction.DepositUsed != null && billingTransaction.DepositUsed > 0)
            {
                double? depBalance = 0;
                if (billingTransaction.InvoiceType == ENUM_InvoiceType.inpatientDischarge)
                {
                    //in case of discharge bill, we clear all remaining deposits of a patient.
                    //but from client side, we're already making deposit balance=0.
                    //so only for DepositTable, we have to re-calcaultate the balance amount again.
                    depBalance = billingTransaction.DepositReturnAmount;
                }
                else
                {
                    depBalance = billingTransaction.DepositBalance;
                }

                BillingDeposit dep = new BillingDeposit()
                {
                    DepositType = ENUM_BillDepositType.DepositDeduct, //"depositdeduct",
                    Remarks = "Deposit used in InvoiceNo. " + billingTransaction.InvoiceCode + billingTransaction.InvoiceNo,
                    //Remarks = "depositdeduct" + " for transactionid:" + billingTransaction.BillingTransactionId,
                    IsActive = true,
                    Amount = billingTransaction.DepositUsed,
                    BillingTransactionId = billingTransaction.BillingTransactionId,
                    DepositBalance = depBalance,
                    FiscalYearId = billingTransaction.FiscalYearId,
                    CounterId = billingTransaction.CounterId,
                    CreatedBy = billingTransaction.CreatedBy,
                    CreatedOn = currentDate,
                    PatientId = billingTransaction.PatientId,
                    PatientVisitId = billingTransaction.PatientVisitId,
                    PaymentMode = billingTransaction.PaymentMode,
                    PaymentDetails = billingTransaction.PaymentDetails,
                    ReceiptNo = BillingBL.GetDepositReceiptNo(connString)
                };
                billingTransaction.ReceiptNo = dep.ReceiptNo + 1;
                dbContext.BillingDeposits.Add(dep);
                dbContext.SaveChanges();


                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel();
                empCashTransaction.TransactionType = ENUM_BillDepositType.DepositDeduct;
                empCashTransaction.ReferenceNo = dep.DepositId;
                empCashTransaction.InAmount = 0;
                empCashTransaction.OutAmount = dep.Amount;
                empCashTransaction.EmployeeId = currentUser.EmployeeId;
                //empCashTransaction.Description = billingTransaction.de;
                empCashTransaction.TransactionDate = DateTime.Now;
                empCashTransaction.CounterID = dep.CounterId;

                BillingBL.AddEmpCashTransaction(dbContext, empCashTransaction);
            }
            billingTransaction.FiscalYear = fiscYear.FiscalYearFormatted;
            return billingTransaction;
        }

        //Krishna: 5th,Jan'2022 // avoids the duplicate the invoiceNo..
        private static void GenerateInvoiceNoAndSaveInvoice(BillingTransactionModel billingTransaction, BillingDbContext dbContext, string connString)
        {
            try
            {
                billingTransaction.InvoiceNo = BillingBL.GetInvoiceNumber(connString);
                //if(invoiceNoTest == 1) { billingTransaction.InvoiceNo = 258017; invoiceNoTest++; }//logic to test the duplicate invoice no and retry to get the latest invoiceNo
                dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                if (ex is DbUpdateException dbUpdateEx)
                {
                    if (dbUpdateEx.InnerException?.InnerException is SqlException sqlException)
                    {

                        if (sqlException.Number == 2627)// unique constraint error in BillingTranscation table..
                        {
                            GenerateInvoiceNoAndSaveInvoice(billingTransaction, dbContext, connString);
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
        }

        //post to BIL_TXN_BillingTransactionItems
        public static List<BillingTransactionItemModel> PostUpdateBillingTransactionItems(BillingDbContext dbContext, string connString,
            List<BillingTransactionItemModel> billingTransactionItems,
            RbacUser currentUser,
            DateTime currentDate,
            string billStatus,
            int? counterId,
             int? billingTransactionId = null)
        {

            BillingFiscalYear fiscYear = BillingBL.GetFiscalYear(connString);

            var srvDepts = dbContext.ServiceDepartment.ToList();
            //var empList = masterDbContext.Employees.ToList();
            if (billingTransactionItems != null && billingTransactionItems.Count > 0)
            {
                // we are using this only for Provisional billing hence we can use first element to check billing status..
                int? ProvisionalReceiptNo = null;
                if (billingTransactionItems[0].BillStatus == ENUM_BillingStatus.provisional)
                {
                    ProvisionalReceiptNo = BillingBL.GetProvisionalReceiptNo(connString);
                }
                for (int i = 0; i < billingTransactionItems.Count; i++)
                {
                    var txnItem = billingTransactionItems[i];
                    if (txnItem.BillingTransactionItemId == 0)
                    {
                        //if (string.IsNullOrEmpty(txnItem.LabTypeName))
                        //{
                        //    txnItem.LabTypeName = "op-lab";
                        //}
                        txnItem.CreatedOn = currentDate;
                        txnItem.CreatedBy = currentUser.EmployeeId;
                        txnItem.RequisitionDate = currentDate;
                        txnItem.CounterId = counterId;
                        txnItem.BillingTransactionId = billingTransactionId;
                        if (txnItem.BillStatus == ENUM_BillingStatus.provisional) // "provisional")
                        {
                            txnItem.ProvisionalReceiptNo = ProvisionalReceiptNo;
                            txnItem.ProvisionalFiscalYearId = fiscYear.FiscalYearId;
                            txnItem.ProvFiscalYear = fiscYear.FiscalYearFormatted; //not mapped
                        }
                        //assign providername and servicedepartmentname to each of the incoming transaction items.
                        //Needs Revision: 12-12-17: sud: I think we don't need to get providername since that property already comes from client side: 
                        //txnItem.ProviderName = (from a in empList where a.EmployeeId == txnItem.ProviderId select a.FullName).FirstOrDefault();
                        txnItem.ServiceDepartmentName = (from b in srvDepts where b.ServiceDepartmentId == txnItem.ServiceDepartmentId select b.ServiceDepartmentName).FirstOrDefault();

                        txnItem = GetBillStatusMapped(txnItem, billStatus, currentDate, currentUser.EmployeeId, counterId);
                        UpdateRequisitionItemsBillStatus(dbContext, txnItem.ServiceDepartmentName, billStatus, currentUser, txnItem.RequisitionId, currentDate);
                        dbContext.BillingTransactionItems.Add(txnItem);
                    }
                    else
                    {
                        txnItem = UpdateTxnItemBillStatus(dbContext, txnItem, billStatus, currentUser, currentDate, counterId, billingTransactionId);
                    }


                    //update the Requisitions billingstatus as 'paid' for above items. 
                    //List<Int32?> requisitionIds = (from a in billTranItems select a.BillItemRequisitionId).ToList();
                    BillItemRequisition billItemRequisition = (from bill in dbContext.BillItemRequisitions
                                                               where bill.RequisitionId == txnItem.RequisitionId
                                                               && bill.ServiceDepartmentId == txnItem.ServiceDepartmentId
                                                               select bill).FirstOrDefault();
                    if (billItemRequisition != null)
                    {
                        billItemRequisition.BillStatus = "paid";
                        dbContext.Entry(billItemRequisition).State = System.Data.Entity.EntityState.Modified;
                    }
                }
                dbContext.SaveChanges();
            }
            else
            {
                throw new Exception("BillingTranscation Items is null");
            }
            return billingTransactionItems;
        }


        //updates billStatus and related fields in BIL_TXN_BillingTransactionItems table.
        public static BillingTransactionItemModel UpdateTxnItemBillStatus(BillingDbContext billingDbContext,
            BillingTransactionItemModel billItem,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            DateTime? modifiedDate = null,
            int? counterId = null,
            int? billingTransactionId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;

            billItem = GetBillStatusMapped(billItem, billStatus, modifiedDate, currentUser.EmployeeId, counterId);
            billingDbContext.BillingTransactionItems.Attach(billItem);
            //update returnstatus and returnquantity
            if (billStatus == "paid")
            {
                billingDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
            }
            else if (billStatus == "unpaid")
            {

                billingDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
                billingDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
            }
            else if (billStatus == "cancel")
            {

                billingDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "adtCancel")
            {

                billingDbContext.Entry(billItem).Property(a => a.CancelledBy).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelledOn).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.CancelRemarks).IsModified = true;

            }
            else if (billStatus == "returned")
            {
                billingDbContext.Entry(billItem).Property(a => a.ReturnStatus).IsModified = true;
                billingDbContext.Entry(billItem).Property(a => a.ReturnQuantity).IsModified = true;
            }

            if (billItem.BillingTransactionId == null)
            {
                billItem.BillingTransactionId = billingTransactionId;
                billingDbContext.Entry(billItem).Property(b => b.BillingTransactionId).IsModified = true;
            }

            //these fields could also be changed during update.
            billingDbContext.Entry(billItem).Property(b => b.BillStatus).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Price).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.Quantity).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.SubTotal).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercent).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountPercentAgg).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.DiscountSchemeId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TotalAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.ProviderId).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.ProviderName).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.TaxableAmount).IsModified = true;
            billingDbContext.Entry(billItem).Property(a => a.NonTaxableAmount).IsModified = true;

            UpdateRequisitionItemsBillStatus(billingDbContext, billItem.ServiceDepartmentName, billStatus, currentUser, billItem.RequisitionId, modifiedDate);

            //update bill status in BillItemRequistion (Order Table)
            BillItemRequisition billItemRequisition = (from bill in billingDbContext.BillItemRequisitions
                                                       where bill.RequisitionId == billItem.RequisitionId
                                                       && bill.ServiceDepartmentId == billItem.ServiceDepartmentId
                                                       select bill).FirstOrDefault();
            if (billItemRequisition != null)
            {
                billItemRequisition.BillStatus = billStatus;
                billingDbContext.Entry(billItemRequisition).Property(a => a.BillStatus).IsModified = true;
            }
            return billItem;
        }

        //updates billStatus in respective tables.
        public static void UpdateRequisitionItemsBillStatus(BillingDbContext billingDbContext,
            string serviceDepartmentName,
            string billStatus, //provisional,paid,unpaid,returned
            RbacUser currentUser,
            long? requisitionId,
            DateTime? modifiedDate)
        {

            string integrationName = billingDbContext.ServiceDepartment
             .Where(a => a.ServiceDepartmentName == serviceDepartmentName)
             .Select(a => a.IntegrationName).FirstOrDefault();

            if (integrationName != null)
            {
                //update return status in lab 
                if (integrationName.ToLower() == "lab")
                {
                    var labItem = billingDbContext.LabRequisitions.Where(req => req.RequisitionId == requisitionId).FirstOrDefault();
                    if (labItem != null)
                    {
                        labItem.BillingStatus = billStatus;
                        labItem.ModifiedOn = modifiedDate;
                        labItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(labItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(labItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(labItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Radiology
                else if (integrationName.ToLower() == "radiology")
                {
                    var radioItem = billingDbContext.RadiologyImagingRequisitions.Where(req => req.ImagingRequisitionId == requisitionId).FirstOrDefault();
                    if (radioItem != null)
                    {
                        radioItem.BillingStatus = billStatus;
                        radioItem.ModifiedOn = modifiedDate;
                        radioItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(radioItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(radioItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(radioItem).Property(a => a.ModifiedBy).IsModified = true;
                    }

                }
                //update return status for Visit
                else if (integrationName.ToLower() == "opd" || integrationName.ToLower() == "er")
                {
                    var visitItem = billingDbContext.Visit.Where(vis => vis.PatientVisitId == requisitionId).FirstOrDefault();
                    if (visitItem != null)
                    {
                        visitItem.BillingStatus = billStatus;
                        visitItem.ModifiedOn = modifiedDate;
                        visitItem.ModifiedBy = currentUser.EmployeeId;
                        billingDbContext.Entry(visitItem).Property(a => a.BillingStatus).IsModified = true;
                        billingDbContext.Entry(visitItem).Property(a => a.ModifiedOn).IsModified = true;
                        billingDbContext.Entry(visitItem).Property(a => a.ModifiedBy).IsModified = true;
                    }
                }

                billingDbContext.AddAuditCustomField("ChangedByUserId", currentUser.EmployeeId);
                billingDbContext.AddAuditCustomField("ChangedByUserName", currentUser.UserName);

                billingDbContext.SaveChanges();
            }
        }


        //maps billStatus and related fields based on billStatus.
        public static BillingTransactionItemModel GetBillStatusMapped(BillingTransactionItemModel billItem,
            string billStatus,
            DateTime? currentDate,
            int userId,
            int? counterId)
        {
            if (billStatus == ENUM_BillingStatus.paid) //"paid")
            {
                billItem.PaidDate = currentDate;
                billItem.BillStatus = ENUM_BillingStatus.paid;// "paid";
                billItem.PaymentReceivedBy = userId;
                billItem.PaidCounterId = counterId;

            }
            else if (billStatus == ENUM_BillingStatus.unpaid)// "unpaid")
            {
                billItem.PaidDate = null;
                billItem.BillStatus = ENUM_BillingStatus.unpaid;// "unpaid";
                billItem.PaidCounterId = null;
                billItem.PaymentReceivedBy = null;

            }
            else if (billStatus == ENUM_BillingStatus.cancel)// "cancel")
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = ENUM_BillingStatus.cancel;// "cancel";
                billItem.CancelledOn = currentDate;
            }
            else if (billStatus == ENUM_BillingStatus.returned)//"returned")
            {
                billItem.ReturnStatus = true;
                billItem.ReturnQuantity = billItem.Quantity;//all items will be returned            
            }
            else if (billStatus == "adtCancel") // if admission cancelled
            {
                billItem.CancelledBy = userId;
                billItem.BillStatus = "adtCancel";
                billItem.CancelledOn = currentDate;
            }
            return billItem;
        }


        //updates price, quantity, bed charges etc.
        public static void UpdateBillingTransactionItems(BillingDbContext billingDbContext, BillingTransactionItemModel txnItmFromClient)
        {
            if (txnItmFromClient != null && txnItmFromClient.BillingTransactionItemId != 0)
            {

                using (var dbContextTransaction = billingDbContext.Database.BeginTransaction())
                {
                    try
                    {

                        BillingTransactionItemModel txnItmFromDb = billingDbContext.BillingTransactionItems
          .Where(itm => itm.BillingTransactionItemId == txnItmFromClient.BillingTransactionItemId).FirstOrDefault();
                        billingDbContext.BillingTransactionItems.Attach(txnItmFromDb);

                        txnItmFromDb.Price = txnItmFromClient.Price;
                        txnItmFromDb.Quantity = txnItmFromClient.Quantity;
                        txnItmFromDb.SubTotal = txnItmFromClient.SubTotal;
                        txnItmFromDb.DiscountAmount = txnItmFromClient.DiscountAmount;
                        txnItmFromDb.DiscountPercent = txnItmFromClient.DiscountPercent;
                        txnItmFromDb.TotalAmount = txnItmFromClient.TotalAmount;
                        txnItmFromDb.ProviderId = txnItmFromClient.ProviderId;
                        txnItmFromDb.ProviderName = txnItmFromClient.ProviderName;
                        txnItmFromDb.RequestedBy = txnItmFromClient.RequestedBy;
                        txnItmFromDb.DiscountPercentAgg = txnItmFromClient.DiscountPercentAgg;
                        txnItmFromDb.TaxableAmount = txnItmFromClient.TaxableAmount;
                        txnItmFromDb.NonTaxableAmount = txnItmFromClient.NonTaxableAmount;
                        txnItmFromDb.ModifiedBy = txnItmFromClient.ModifiedBy;
                        txnItmFromDb.ModifiedOn = DateTime.Now;

                        billingDbContext.Entry(txnItmFromDb).Property(a => a.Price).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.Quantity).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.SubTotal).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercent).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.DiscountPercentAgg).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.TotalAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ProviderId).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.RequestedBy).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ProviderName).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.TaxableAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.NonTaxableAmount).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedBy).IsModified = true;
                        billingDbContext.Entry(txnItmFromDb).Property(a => a.ModifiedOn).IsModified = true;
                        //var billingTransact = billingDbContext.BillingTransactionItems;
                        //billingTransact.Add(txnItmFromDb);
                        //billingDbContext.BillingTransactionItems.Add(txnItmFromDb);
                        //Salakha: commented code, After update qty, date should not be update
                        ////check if bed item was edited.
                        //BillItemPrice billItem = (from item in billingDbContext.BillItemPrice
                        //                          join srvDept in billingDbContext.ServiceDepartment on item.ServiceDepartmentId equals srvDept.ServiceDepartmentId
                        //                          where item.ServiceDepartmentId == txnItmFromDb.ServiceDepartmentId
                        //                          && item.ItemId == txnItmFromClient.ItemId
                        //                          && srvDept.IntegrationName.ToLower() == "bed charges"
                        //                          select item).FirstOrDefault();
                        //if (billItem != null)
                        //{
                        //    PatientBedInfo selBedInfo = (from selBed in billingDbContext.PatientBedInfos
                        //                                 where selBed.PatientVisitId == txnItmFromClient.PatientVisitId
                        //                                 && selBed.BedFeatureId == txnItmFromClient.ItemId
                        //                                 select selBed).OrderByDescending(a=> a.PatientBedInfoId).FirstOrDefault();
                        //    if (selBedInfo != null)
                        //    {
                        //        PatientBedInfo nextBedInfo = (from nextBed in billingDbContext.PatientBedInfos
                        //                                      where nextBed.PatientVisitId == txnItmFromClient.PatientVisitId
                        //                                       && nextBed.StartedOn == selBedInfo.EndedOn
                        //                                       //sud/Yub:11Feb'19--if startedon/endedon is same then nextbed and current bed are same. adding bedinfoId != logic.
                        //                                       && selBedInfo.PatientBedInfoId != nextBed.PatientBedInfoId
                        //                                      select nextBed).FirstOrDefault();

                        //        DateTime endDate = Convert.ToDateTime(selBedInfo.StartedOn).AddDays(Convert.ToInt32(txnItmFromClient.Quantity - 1));
                        //        selBedInfo.EndedOn = endDate;
                        //        billingDbContext.Entry(selBedInfo).Property(a => a.EndedOn).IsModified = true;
                        //        if (nextBedInfo != null)
                        //        {
                        //            nextBedInfo.StartedOn = selBedInfo.EndedOn;
                        //            billingDbContext.Entry(nextBedInfo).Property(a => a.StartedOn).IsModified = true;
                        //        }
                        //    }
                        //}

                        billingDbContext.SaveChanges();

                        dbContextTransaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        //rollback all changes if any error occurs
                        dbContextTransaction.Rollback();
                        throw ex;
                    }
                }
            }
        }

    }

}
