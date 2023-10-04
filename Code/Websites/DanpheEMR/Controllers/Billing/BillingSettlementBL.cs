using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.BillingModels;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.Services.Billing.DTO;
using DocumentFormat.OpenXml.Wordprocessing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;

namespace DanpheEMR.Controllers.Billing
{
    public class BillingSettlementBL
    {
        public static object SaveSettlement(BillNewSettlement_DTO billNewSettlement_DTO, SettlementDbContext _settlementDbContext, RbacUser currentUser, string connString)
        {

            try
            {
                if (IsValidDeposit(_settlementDbContext, billNewSettlement_DTO.PatientId, billNewSettlement_DTO.DepositDeducted))
                {
                    //step 1: Deserialize into BillSettlementModel
                    BillSettlementModel settlement = new BillSettlementModel()
                    {
                        PatientId = billNewSettlement_DTO.PatientId,
                        PayableAmount = billNewSettlement_DTO.PayableAmount,
                        RefundableAmount = billNewSettlement_DTO.RefundableAmount,
                        PaidAmount = billNewSettlement_DTO.PaidAmount,
                        ReturnedAmount = billNewSettlement_DTO.ReturnedAmount,
                        DepositDeducted = billNewSettlement_DTO.DepositDeducted,
                        DueAmount = billNewSettlement_DTO.DueAmount,
                        DiscountAmount = billNewSettlement_DTO.DiscountAmount,
                        PaymentMode = billNewSettlement_DTO.PaymentMode,
                        PaymentDetails = billNewSettlement_DTO.PaymentDetails,
                        CounterId = billNewSettlement_DTO.CounterId,
                        Remarks = billNewSettlement_DTO.Remarks,
                        IsActive = true,
                        Patient = billNewSettlement_DTO.Patient,
                        CollectionFromReceivable = billNewSettlement_DTO.CollectionFromReceivable,
                        DiscountReturnAmount = billNewSettlement_DTO.DiscountReturnAmount,
                        OrganizationId = billNewSettlement_DTO.OrganizationId,
                        StoreId = billNewSettlement_DTO.StoreId,
                        ModuleName = ENUM_ModuleNames.Billing

                    };

                    //step 2: Deserialize BillingTransactions and PharmacyTransactions
                    List<BillingTransactionModel> newBillingTransactionList = new List<BillingTransactionModel>();
                    var billingInvoices = billNewSettlement_DTO.BillingTransactions;
                    foreach (var txn in billingInvoices)
                    {

                        BillingTransactionModel newTxn = _settlementDbContext.BillingTransactions.Where(b => b.BillingTransactionId == txn.TransactionId).FirstOrDefault();
                        newBillingTransactionList.Add(newTxn);

                    }

                    List<PHRMInvoiceTransactionModel> newPharmacyTransactionList = new List<PHRMInvoiceTransactionModel>();
                    var pharmacyInvoices = billNewSettlement_DTO.PHRMInvoiceTransactionModels;
                    foreach (var txn in pharmacyInvoices)
                    {

                        PHRMInvoiceTransactionModel newTxn = _settlementDbContext.PHRMInvoiceTransactionModels.Where(b => b.InvoiceId == txn.TransactionId).FirstOrDefault();
                        newPharmacyTransactionList.Add(newTxn);

                    }


                    //step 3: assign Server Side Values to the input model and save settlement
                    settlement.SettlementReceiptNo = GetSettlementReceiptNo(_settlementDbContext);
                    DateTime currentDateTime = DateTime.Now;
                    settlement.CreatedBy = currentUser.EmployeeId;
                    settlement.CreatedOn = currentDateTime;
                    settlement.SettlementDate = currentDateTime;
                    settlement.FiscalYearId = GetFiscalYear(_settlementDbContext).FiscalYearId;

                    _settlementDbContext.BillSettlements.Add(settlement);
                    _settlementDbContext.SaveChanges();

                    billNewSettlement_DTO.SettlementId = settlement.SettlementId; //Assigning 


                    //step 4: Update Credit BillStatuses of respective Module
                    if (newBillingTransactionList.Count > 0)
                    {
                        UpdateBillingCreditBillStatus(newBillingTransactionList, _settlementDbContext, settlement.SettlementId, currentUser.EmployeeId);
                    }

                    if (newPharmacyTransactionList.Count > 0)
                    {
                        UpdatePharmacyCreditBillStatus(newPharmacyTransactionList, _settlementDbContext, settlement.SettlementId, currentUser.EmployeeId);
                    }

                    //step 5: Book EmployeeCashTransactions...
                    SaveEmployeeCashTransactions(_settlementDbContext, currentUser, connString, settlement, billNewSettlement_DTO.empCashTransactionModel, currentDateTime);

                    //step 6: Update Billing Invoice And Items
                    UpdateBillingInvoiceAndItems(newBillingTransactionList, _settlementDbContext, settlement, currentUser);
                    //step 7: Update Pharmacy Invoice And Items
                    UpdatePharmacyInvoiceAndItems(newPharmacyTransactionList, _settlementDbContext, settlement, currentUser);

                    //step 8: Handle Deposits
                    HandleDeposits(_settlementDbContext, currentUser, connString, settlement);



                    //step 9: Update InvoiceReturn table by updating SettlementId
                    //to update BillReturnInvoice table by updating SettlementId for the rows that are being settled.

                    //Krishna, Need to change below logic
                    var billingInvoiceReturnIds = billNewSettlement_DTO.BillingTransactions.SelectMany(a => a.ArrayOfBillReturnIds).ToList();
                    var pharmacyInvoiceReturnIds = billNewSettlement_DTO.PHRMInvoiceTransactionModels.SelectMany(a => a.ArrayOfBillReturnIds).ToList();
                    if (billingInvoiceReturnIds != null && billingInvoiceReturnIds.Count > 0)
                    {
                        BillInvoiceReturnModel billInvoiceReturnModel = new BillInvoiceReturnModel();
                        foreach (int retId in billingInvoiceReturnIds)
                        {
                            billInvoiceReturnModel = _settlementDbContext.BillInvoiceReturns.Where(b => b.BillReturnId == retId).FirstOrDefault();
                            billInvoiceReturnModel.SettlementId = settlement.SettlementId;
                            _settlementDbContext.Entry(billInvoiceReturnModel).Property(a => a.SettlementId).IsModified = true;
                        }
                        _settlementDbContext.SaveChanges();
                    }

                    if (pharmacyInvoiceReturnIds != null && pharmacyInvoiceReturnIds.Count > 0)
                    {
                        PHRMInvoiceReturnModel pharmacyInvoiceReturnModel = new PHRMInvoiceReturnModel();
                        foreach (int retId in pharmacyInvoiceReturnIds)
                        {
                            pharmacyInvoiceReturnModel = _settlementDbContext.PHRMInvoiceReturnModels.Where(b => b.InvoiceReturnId == retId).FirstOrDefault();
                            pharmacyInvoiceReturnModel.SettlementId = settlement.SettlementId;

                            _settlementDbContext.Entry(pharmacyInvoiceReturnModel).Property(a => a.SettlementId).IsModified = true;
                        }
                        _settlementDbContext.SaveChanges();
                    }

                }
                else
                {
                    throw new Exception("Deposit Amount is Invalid, Please try again.");
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return billNewSettlement_DTO.SettlementId;

        }

        private static void HandleDeposits(SettlementDbContext settlementDbContext, RbacUser currentUser, string connString, BillSettlementModel settlement)
        {
            //Krishna, get DefaultDepositHead
            var DefaultDepositHead = settlementDbContext.DepositHeadModels.FirstOrDefault(a => a.IsDefault == true);
            var DepositHeadId = DefaultDepositHead != null ? DefaultDepositHead.DepositHeadId : 0;

            //Add new row to deposit table if Deposit is deducted
            if (settlement.DepositDeducted > 0)
            {
                VisitModel patientVisit = settlementDbContext.PatientVisits.Where(visit => visit.PatientId == settlement.PatientId)
                    .OrderByDescending(a => a.PatientVisitId)
                    .FirstOrDefault();
                BillingDepositModel depositModel = new BillingDepositModel()
                {
                    OutAmount = (decimal)settlement.DepositDeducted,
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,// "depositdeduct",
                    ModuleName = ENUM_ModuleNames.Billing,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    CreditOrganizationId = null,
                    DepositHeadId = DepositHeadId, 
                    IsActive = true,
                    FiscalYearId = GetFiscalYear(settlementDbContext).FiscalYearId,
                    Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = settlement.CounterId,
                    PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                    SettlementId = settlement.SettlementId,
                    PatientId = settlement.PatientId,
                    DepositBalance = 0,
                    ReceiptNo = GetDepositReceiptNo(settlementDbContext),
                    //PaymentMode = "cash",//yubraj 4th July '19
                    PaymentMode = ENUM_BillPaymentMode.cash, //krishna 26th NOV'21
                    VisitType = ENUM_VisitType.outpatient // Bibek 18thJune'23
                };

                settlementDbContext.BillingDeposits.Add(depositModel);
                settlementDbContext.SaveChanges();

                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel()
                {
                    TransactionType = ENUM_DepositTransactionType.DepositDeduct,
                    ReferenceNo = depositModel.DepositId,
                    InAmount = 0,
                    OutAmount = (double)depositModel.OutAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = DateTime.Now,
                    CounterID = depositModel.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetDepositPaymentModeSubCategoryId(settlementDbContext),
                    ModuleName = ENUM_ModuleNames.Billing
                };
                AddEmpCashTransaction(settlementDbContext, empCashTransaction);
            }

            //Add new row to Deposit table if there is refundable amount.
            if (settlement.RefundableAmount > 0)
            {
                VisitModel patientVisit = settlementDbContext.PatientVisits.Where(visit => visit.PatientId == settlement.PatientId)
                    .OrderByDescending(a => a.PatientVisitId)
                    .FirstOrDefault();
                BillingDepositModel depositModel = new BillingDepositModel()
                {
                    OutAmount = (decimal)settlement.RefundableAmount,
                    TransactionType = ENUM_DepositTransactionType.ReturnDeposit,// "returnDeposit",
                    ModuleName = ENUM_ModuleNames.Billing,
                    OrganizationOrPatient = ENUM_Deposit_OrganizationOrPatient.Patient,
                    CreditOrganizationId = null,
                    DepositHeadId = DepositHeadId,
                    IsActive = true,
                    FiscalYearId = GetFiscalYear(settlementDbContext).FiscalYearId,
                    Remarks = "Deposit used in Settlement Receipt No. SR" + settlement.SettlementReceiptNo + " on " + settlement.SettlementDate,
                    CreatedBy = currentUser.EmployeeId,
                    CreatedOn = DateTime.Now,
                    CounterId = settlement.CounterId,
                    PatientVisitId = patientVisit != null ? (int?)patientVisit.PatientVisitId : null,
                    SettlementId = settlement.SettlementId,
                    PatientId = settlement.PatientId,
                    DepositBalance = 0,
                    ReceiptNo = GetDepositReceiptNo(settlementDbContext),
                    //PaymentMode = "cash",//yubraj 4th July '19
                    PaymentMode = ENUM_BillPaymentMode.cash, //Krishna 26th NOV'21
                    VisitType = ENUM_VisitType.outpatient // Bibek 18thJune'23

                };

                settlementDbContext.BillingDeposits.Add(depositModel);
                settlementDbContext.SaveChanges();

                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel()
                {
                    TransactionType = ENUM_DepositTransactionType.ReturnDeposit, //depositReturn
                    ReferenceNo = depositModel.DepositId,
                    InAmount = 0,
                    OutAmount = (double)depositModel.OutAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = DateTime.Now,
                    CounterID = depositModel.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(settlementDbContext),
                    ModuleName = "Billing"
                };

                AddEmpCashTransaction(settlementDbContext, empCashTransaction);
            }
        }

        private static void SaveEmployeeCashTransactions(SettlementDbContext settlementDbContext, RbacUser currentUser, string connString, BillSettlementModel settlement, List<EmpCashTransactionModel> empCashTransactionModel, DateTime currentDateTime)
        {
            //CollectionFromReceivable as InAmount into EmpCashTranscation table...
            if (settlement.CollectionFromReceivable > 0)
            {
                List<EmpCashTransactionModel> empCashTransactionsList = new List<EmpCashTransactionModel>();
                for (int i = 0; i < empCashTransactionModel.Count; i++)
                {
                    EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel
                    {
                        TransactionType = ENUM_EMP_CashTransactinType.CollectionFromReceivable,
                        ReferenceNo = settlement.SettlementId,
                        InAmount = empCashTransactionModel[i].InAmount,
                        OutAmount = 0,
                        EmployeeId = currentUser.EmployeeId,
                        TransactionDate = currentDateTime,
                        CounterID = settlement.CounterId,
                        PatientId = settlement.PatientId,
                        ModuleName = "Billing",
                        Remarks = empCashTransactionModel[i].Remarks,
                        PaymentModeSubCategoryId = empCashTransactionModel[i].PaymentModeSubCategoryId
                    };
                    empCashTransactionsList.Add(empCashTransaction);
                }
                AddEmpCashtransactionForBilling(settlementDbContext, empCashTransactionsList);
            }

            //adding CashDiscountGiven during settlement as OutAmount into EmpCashTransaction table.. 
            if (settlement.DiscountAmount > 0)
            {
                EmpCashTransactionModel empCashTransaction = new EmpCashTransactionModel()
                {
                    TransactionType = ENUM_EMP_CashTransactinType.CashDiscountGiven,
                    ReferenceNo = settlement.SettlementId,
                    InAmount = 0,
                    OutAmount = settlement.DiscountAmount,
                    EmployeeId = currentUser.EmployeeId,
                    TransactionDate = currentDateTime,
                    CounterID = settlement.CounterId,
                    PatientId = settlement.PatientId,
                    PaymentModeSubCategoryId = GetPaymentModeSubCategoryId(settlementDbContext),
                    ModuleName = "Billing"
                };
                AddEmpCashTransaction(settlementDbContext, empCashTransaction);
            }
        }

        private static void UpdatePharmacyInvoiceAndItems(List<PHRMInvoiceTransactionModel> newPharmacyTransactionList, SettlementDbContext settlementDbContext, BillSettlementModel settlement, RbacUser currentUser)
        {
            if (newPharmacyTransactionList != null && newPharmacyTransactionList.Count > 0)
            {
                foreach (var txn in newPharmacyTransactionList)
                {
                    settlementDbContext.PHRMInvoiceTransactionModels.Attach(txn);
                    txn.SettlementId = settlement.SettlementId;
                    txn.BilStatus = ENUM_BillingStatus.paid;
                    txn.PaidDate = settlement.SettlementDate;
                    txn.Remark = settlement.Remarks;

                    settlementDbContext.Entry(txn).Property(b => b.BilStatus).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaymentMode).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.Remark).IsModified = true;

                    //Update BillStatus and PaidDate of each transaction items attached with above transactions
                    List<PHRMInvoiceTransactionItemsModel> txnItems = settlementDbContext.PHRMInvoiceTransactionItems
                                                                  .Where(b => b.InvoiceId == txn.InvoiceId).ToList();

                    if (txnItems != null && txnItems.Count > 0)
                    {
                        for (int i = 0; i < txnItems.Count; i++)
                        {
                            txnItems[i] = UpdatePharmacyTxnItemsBillStatus(settlementDbContext, txnItems[i], ENUM_BillingStatus.paid);
                        }
                        settlementDbContext.SaveChanges();
                    }

                }
                    settlementDbContext.SaveChanges();
            }
        }

        private static void UpdateBillingInvoiceAndItems(List<BillingTransactionModel> newBillingTransactionList, SettlementDbContext settlementDbContext, BillSettlementModel settlement, RbacUser currentUser)
        {
            if (newBillingTransactionList != null && newBillingTransactionList.Count > 0)
            {
                foreach (var txn in newBillingTransactionList)
                {
                    settlementDbContext.BillingTransactions.Attach(txn);
                    txn.SettlementId = settlement.SettlementId;
                    txn.BillStatus = ENUM_BillingStatus.paid;// "paid";
                    txn.PaidAmount = txn.TotalAmount;
                    txn.PaidDate = settlement.SettlementDate;
                    txn.PaymentReceivedBy = currentUser.EmployeeId;
                    txn.PaidCounterId = settlement.CounterId;

                    settlementDbContext.Entry(txn).Property(b => b.BillStatus).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.SettlementId).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaidAmount).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaidDate).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaymentReceivedBy).IsModified = true;
                    settlementDbContext.Entry(txn).Property(b => b.PaidCounterId).IsModified = true;

                    //Update BillStatus and PaidDate of each transaction items attached with above transactions
                    List<BillingTransactionItemModel> txnItems = settlementDbContext.BillingTransactionItems
                                                                  .Where(b => b.BillingTransactionId == txn.BillingTransactionId).ToList();

                    if (txnItems != null && txnItems.Count > 0)
                    {
                        for (int i = 0; i < txnItems.Count; i++)
                        {
                            txnItems[i] = UpdateBillingTxnItemsBillStatus(settlementDbContext, txnItems[i], ENUM_BillingStatus.paid, currentUser, settlement.SettlementDate, settlement.CounterId);
                        }
                        settlementDbContext.SaveChanges();
                    }
                }
                settlementDbContext.SaveChanges();
            }
        }

        private static void UpdatePharmacyCreditBillStatus(List<PHRMInvoiceTransactionModel> newPharmacyTransactionList, SettlementDbContext settlementDbContext, int settlementId, int employeeId)
        {
            try
            {
                if (newPharmacyTransactionList.Count > 0)
                {
                    var patientId = newPharmacyTransactionList[0].PatientId;
                    var invoiceIds = newPharmacyTransactionList.Select(a => a.InvoiceId);
                    List<PHRMTransactionCreditBillStatus> phrmCreditBillStatuses = settlementDbContext.PHRMTransactionCreditBillStatuses
                                                                            .Where(a => a.PatientId == patientId && invoiceIds.Contains(a.InvoiceId))
                                                                            .ToList();
                    phrmCreditBillStatuses.ForEach(a =>
                    {
                        a.SettlementId = settlementId;
                        a.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                        a.ModifiedBy = employeeId;
                        a.ModifiedOn = DateTime.Now;

                        settlementDbContext.Entry(a).Property(p => p.SettlementId).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.SettlementStatus).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.ModifiedBy).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.ModifiedOn).IsModified = true;

                    });
                    settlementDbContext.SaveChanges();
                }
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        private static void UpdateBillingCreditBillStatus(List<BillingTransactionModel> newBillingTransactionList, SettlementDbContext settlementDbContext, int settlementId, int employeeId)
        {
            try
            {
                if (newBillingTransactionList.Count > 0)
                {
                    var patientId = newBillingTransactionList[0].PatientId;
                    var billingTransactionIds = newBillingTransactionList.Select(a => a.BillingTransactionId);
                    List<BillingTransactionCreditBillStatusModel> billingTransactionCreditBillStatuses = settlementDbContext.BillingTransactionCreditBillStatuses
                                                                            .Where(a => a.PatientId == patientId && billingTransactionIds.Contains(a.BillingTransactionId))
                                                                            .ToList();
                    billingTransactionCreditBillStatuses.ForEach(a =>
                    {
                        a.SettlementId = settlementId;
                        a.SettlementStatus = ENUM_ClaimManagement_SettlementStatus.Completed;
                        a.ModifiedBy = employeeId;
                        a.ModifiedOn = DateTime.Now;

                        settlementDbContext.Entry(a).Property(p => p.SettlementId).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.SettlementStatus).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.ModifiedBy).IsModified = true;
                        settlementDbContext.Entry(a).Property(p => p.ModifiedOn).IsModified = true;

                    });
                    settlementDbContext.SaveChanges();
                }
            }
            catch (Exception e)
            {

                throw e;
            }
        }

        private static int GetSettlementReceiptNo(SettlementDbContext settlementDbContext)
        {
            int? currSettlmntNo = settlementDbContext.BillSettlements.Select(a => a.SettlementReceiptNo).DefaultIfEmpty(0).Max();
            if (!currSettlmntNo.HasValue)
            {
                currSettlmntNo = 0;
            }

            return currSettlmntNo.Value + 1;
        }

        #region This gets the PaymentModeSubCategoryId of Cash PaymentMode.....
        private static int GetPaymentModeSubCategoryId(SettlementDbContext settlementDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = settlementDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "cash");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion
        #region This gets the PaymentModeSubCategoryId of Deposit PaymentMode.....
        private static int GetDepositPaymentModeSubCategoryId(SettlementDbContext settlementDbContext)
        {
            var paymentModeSubCategoryId = 0;
            var paymentModes = settlementDbContext.PaymentModes.Where(a => a.PaymentSubCategoryName.ToLower() == "deposit");
            if (paymentModes != null)
            {
                paymentModeSubCategoryId = paymentModes.Select(a => a.PaymentSubCategoryId).FirstOrDefault();
            }
            return paymentModeSubCategoryId;
        }
        #endregion

        private static bool IsValidDeposit(SettlementDbContext setttlementDbContext, int patientId, double? depositUsed)
        {
            var patientAllDepositTxns = (from bill in setttlementDbContext.BillingDeposits
                                         where bill.PatientId == patientId && bill.IsActive == true
                                         group bill by new { bill.PatientId, bill.TransactionType } into p
                                         select new
                                         {
                                             TransactionType = p.Key.TransactionType,
                                             SumInAmount = p.Sum(a => a.InAmount),
                                             SumOutAmount = p.Sum(a => a.OutAmount)
                                         }).ToList();
            decimal totalDepositAmt, totalDepositDeductAmt, totalDepositReturnAmt, currentDepositBalance;
            currentDepositBalance = totalDepositAmt = totalDepositDeductAmt = totalDepositReturnAmt = 0;

            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault() != null)
            {
                totalDepositAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "deposit").FirstOrDefault().SumInAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault() != null)
            {
                totalDepositDeductAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "depositdeduct").FirstOrDefault().SumOutAmount;
            }
            if (patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault() != null)
            {
                totalDepositReturnAmt = patientAllDepositTxns.Where(bil => bil.TransactionType.ToLower() == "returndeposit").FirstOrDefault().SumOutAmount;
            }
            currentDepositBalance = totalDepositAmt - totalDepositDeductAmt - totalDepositReturnAmt;

            depositUsed = depositUsed == null ? 0 : depositUsed;
            return (decimal)depositUsed <= currentDepositBalance ? true : false;
        }

        //startDate<currDate && currDate <= end
        //it should be less than or equal to fsc.EndDate
        public static BillingFiscalYear GetFiscalYear(SettlementDbContext settlementDbContext)
        {
            DateTime currentDate = DateTime.Now.Date;
            return settlementDbContext.BillingFiscalYears.Where(fsc => fsc.StartYear <= currentDate && fsc.EndYear >= currentDate).FirstOrDefault();
        }

        public static void AddEmpCashtransactionForBilling(SettlementDbContext settlementDbContext, List<EmpCashTransactionModel> empCashTransaction)
        {
            try
            {
                for (int i = 0; i < empCashTransaction.Count; i++)
                {
                    EmpCashTransactionModel empCashTxn = new EmpCashTransactionModel()
                    {
                        TransactionType = empCashTransaction[i].TransactionType,
                        ReferenceNo = empCashTransaction[i].ReferenceNo,
                        EmployeeId = empCashTransaction[i].EmployeeId,
                        InAmount = empCashTransaction[i].InAmount,
                        OutAmount = empCashTransaction[i].OutAmount,
                        Description = empCashTransaction[i].Description,
                        TransactionDate = empCashTransaction[i].TransactionDate,
                        CounterID = empCashTransaction[i].CounterID,
                        IsActive = true,
                        ModuleName = empCashTransaction[i].ModuleName,
                        PatientId = empCashTransaction[i].PatientId,
                        PaymentModeSubCategoryId = empCashTransaction[i].PaymentModeSubCategoryId,
                        Remarks = empCashTransaction[i].Remarks
                    };
                    settlementDbContext.EmpCashTransactions.Add(empCashTxn);
                }
                settlementDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        public static void AddEmpCashTransaction(SettlementDbContext settlementDbContext, EmpCashTransactionModel empCashTransaction)
        {
            try
            {
                EmpCashTransactionModel empCashTxn = new EmpCashTransactionModel()
                {
                    TransactionType = empCashTransaction.TransactionType,
                    ReferenceNo = empCashTransaction.ReferenceNo,
                    EmployeeId = empCashTransaction.EmployeeId,
                    InAmount = empCashTransaction.InAmount,
                    OutAmount = empCashTransaction.OutAmount,
                    Description = empCashTransaction.Description,
                    TransactionDate = empCashTransaction.TransactionDate,
                    CounterID = empCashTransaction.CounterID,
                    IsActive = true,
                    ModuleName = empCashTransaction.ModuleName,
                    PatientId = empCashTransaction.PatientId,
                    PaymentModeSubCategoryId = empCashTransaction.PaymentModeSubCategoryId,
                };
                settlementDbContext.EmpCashTransactions.Add(empCashTxn);
                settlementDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception("Unable to Add Cash Transaction Detail:" + ex.ToString());
            }
        }

        //updates billStatus and related fields in BIL_TXN_BillingTransactionItems table.
        public static BillingTransactionItemModel UpdateBillingTxnItemsBillStatus(SettlementDbContext settlementDbContext, BillingTransactionItemModel billItem, string billStatus, RbacUser currentUser, DateTime? modifiedDate = null, int? counterId = null)
        {
            modifiedDate = modifiedDate != null ? modifiedDate : DateTime.Now;
            settlementDbContext.BillingTransactionItems.Attach(billItem);
            if (billStatus == ENUM_BillingStatus.paid)
            {
                billItem.PaidDate = modifiedDate;
                billItem.BillStatus = ENUM_BillingStatus.paid;// "paid";
                billItem.PaymentReceivedBy = currentUser.EmployeeId;
                billItem.PaidCounterId = counterId;
                billItem.ModifiedBy = currentUser.EmployeeId;
                billItem.ModifiedOn = modifiedDate;

                settlementDbContext.Entry(billItem).Property(b => b.PaidDate).IsModified = true;
                settlementDbContext.Entry(billItem).Property(a => a.BillStatus).IsModified = true;
                settlementDbContext.Entry(billItem).Property(b => b.PaymentReceivedBy).IsModified = true;
                settlementDbContext.Entry(billItem).Property(b => b.PaidCounterId).IsModified = true;
                settlementDbContext.Entry(billItem).Property(b => b.ModifiedBy).IsModified = true;
                settlementDbContext.Entry(billItem).Property(b => b.ModifiedOn).IsModified = true;
            }
            return billItem;
        }

        private static PHRMInvoiceTransactionItemsModel UpdatePharmacyTxnItemsBillStatus(SettlementDbContext settlementDbContext, PHRMInvoiceTransactionItemsModel billItem, string billStatus)
        {
            settlementDbContext.PHRMInvoiceTransactionItems.Attach(billItem);
            if (billStatus == ENUM_BillingStatus.paid)
            {
                billItem.BilItemStatus = billStatus;

                settlementDbContext.Entry(billItem).Property(a => a.BilItemStatus).IsModified = true;
            }

            return billItem;
        }

        public static int? GetDepositReceiptNo(SettlementDbContext settlementDbContext)
        {

            ////This is to get the uncommited row data (ReceiptNo).
            //using (new TransactionScope(TransactionScopeOption.Required, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            //{
            //}
                int fiscalYearId = GetFiscalYear(settlementDbContext).FiscalYearId;
                int? receiptNo = (from depTxn in settlementDbContext.BillingDeposits
                                  where depTxn.FiscalYearId == fiscalYearId
                                  select depTxn.ReceiptNo).DefaultIfEmpty(0).Max();

                return receiptNo + 1;
        }
    }
}
