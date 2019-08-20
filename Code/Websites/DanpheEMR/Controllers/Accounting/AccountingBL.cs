using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;

namespace DanpheEMR.Controllers
{
    public class AccountingBL
    {
        //public static Boolean AccountClosureTransaction(AccountClosureVM closureVM, AccountingDbContext accountingDb)
        //{
        //    using (var dbContextTransaction = accountingDb.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            FiscalYearModel fy = accountingDb.FiscalYears.Where(a => a.IsActive == true).FirstOrDefault();

        //            if (fy != null)
        //            {
        //                fy.IsActive = false;
        //                UpdateFiscalYear(fy, accountingDb);
        //            }

        //            AddFiscalYear(closureVM.nextFiscalYear, accountingDb);

        //            closureVM.TnxModel.FiscalyearId = closureVM.nextFiscalYear.FiscalYearId;
        //            closureVM.TnxModel.VoucherId = 1;
        //            AddTransaction(closureVM.TnxModel, accountingDb);
        //            dbContextTransaction.Commit();
        //            return true;
        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }
        //}

        #region account closure
        //Ajay 24-10-2018
        public static bool AccountClosure(FiscalYearModel fiscalYear, AccountingDbContext accountingDBContext)
        {
            using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
            {
                try
                {
                    //get active fiscal year and deactive it
                    FiscalYearModel fy = accountingDBContext.FiscalYears.Where(a => a.IsActive == true).FirstOrDefault();
                    if (fy != null)
                    {
                        fy.IsActive = false;
                        UpdateFiscalYear(fy, accountingDBContext);
                    }
                    //add new fiscal year
                    AddFiscalYear(fiscalYear, accountingDBContext);
                    //get active ledgers with primary group Assets or Liabialities
                    var ledgers = (from led in accountingDBContext.Ledgers
                                   join ledGrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledGrp.LedgerGroupId
                                   where led.IsActive == true   // && (ledGrp.PrimaryGroup == "Assets" || ledGrp.PrimaryGroup == "Liabilities")
                                   select new
                                   {
                                       led.LedgerId,
                                       led.OpeningBalance,
                                       led.DrCr,
                                       ledGrp.PrimaryGroup
                                   }).ToList();

                    ledgers.ForEach(ledger =>
                    {
                        LedgerBalanceHistoryModel ledgerBalanceHistory = new LedgerBalanceHistoryModel();
                        LedgerModel led = accountingDBContext.Ledgers.Where(x => x.LedgerId == ledger.LedgerId).FirstOrDefault();
                        //calculate closing balance
                        if (ledger.PrimaryGroup == "Assets" || ledger.PrimaryGroup == "Liabilities")
                        {

                            double drAmount = accountingDBContext.TransactionItems
                                    .Where(x => x.LedgerId == ledger.LedgerId && x.DrCr == true)
                                    .Select(x => x.Amount).Sum().GetValueOrDefault();
                            double crAmount = accountingDBContext.TransactionItems
                                        .Where(x => x.LedgerId == ledger.LedgerId && x.DrCr == false)
                                        .Select(x => x.Amount).Sum().GetValueOrDefault();

                            if (led.DrCr == true)
                            {
                                drAmount = drAmount + led.OpeningBalance.Value;
                            }
                            if (led.DrCr == false)
                            {
                                crAmount = crAmount + led.OpeningBalance.Value;
                            }
                            if (drAmount > crAmount)
                            {
                                ledgerBalanceHistory.ClosingDrCr = true;
                                ledgerBalanceHistory.ClosingBalance = drAmount - crAmount;

                                led.OpeningBalance = drAmount - crAmount; 
                                led.DrCr = true;
                            }
                            if (drAmount < crAmount)
                            {
                                ledgerBalanceHistory.ClosingDrCr = false;
                                ledgerBalanceHistory.ClosingBalance = crAmount - drAmount;

                                led.OpeningBalance = crAmount - drAmount;
                                led.DrCr = false;
                            }
                        }
                        

                        //adding ledgerBalanceHistory
                        ledgerBalanceHistory.FiscalYearId = accountingDBContext.FiscalYears.Where(a => a.IsActive == true).FirstOrDefault().FiscalYearId;
                        ledgerBalanceHistory.LedgerId = ledger.LedgerId;
                        ledgerBalanceHistory.OpeningBalance = ledger.OpeningBalance;
                        ledgerBalanceHistory.OpeningDrCr = led.DrCr;
                        ledgerBalanceHistory.CreatedOn = DateTime.Now;
                        ledgerBalanceHistory.CreatedBy = fiscalYear.CreatedBy;
                        accountingDBContext.LedgerBalanceHistory.Add(ledgerBalanceHistory);
                        accountingDBContext.SaveChanges();


                        //updating ledger opening balance
                        accountingDBContext.Ledgers.Attach(led);
                        accountingDBContext.Entry(led).Property(x => x.OpeningBalance).IsModified = true;
                        accountingDBContext.Entry(led).Property(x => x.DrCr).IsModified = true;
                        accountingDBContext.SaveChanges();
                    });

                    

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
        #endregion
        public static Boolean AccountingTxnSync(AccountingTxnSyncVM txnSyncVM, AccountingDbContext accountingDb)
        {
            using (var dbContextTransaction = accountingDb.Database.BeginTransaction())
            {
                try
                {
                    foreach (var s in txnSyncVM.billingSyncs)
                    {
                        UpdateBillingSync(s, accountingDb);
                    }

                    foreach (var txn in txnSyncVM.txnModels)
                    {
                        AddTransaction(txn, accountingDb);
                    }

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

        #region Add Fiscal Year
        public static void AddFiscalYear(FiscalYearModel fiscal, AccountingDbContext accDbContext)
        {
            try
            {
                fiscal.CreatedOn = System.DateTime.Now;
                accDbContext.FiscalYears.Add(fiscal);
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Update Fiscal Year
        //update fiscal year will update only isActive
        public static void UpdateFiscalYear(FiscalYearModel fiscal, AccountingDbContext accDbContext)
        {
            try
            {
                accDbContext.FiscalYears.Attach(fiscal);
                accDbContext.Entry(fiscal).Property(x => x.IsActive).IsModified = true;
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Insert/Add Transaction
        public static void AddTransaction(TransactionModel txn, AccountingDbContext accDbContext)
        {
            try
            {
                txn.CreatedOn = System.DateTime.Now;
                txn.TransactionItems.ForEach(txnItem =>
                {
                    txnItem.CreatedOn = System.DateTime.Now;
                });

                accDbContext.Transactions.Add(txn);
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Updating BillingToAccounting SYNC 
        //here we are updating only IsTransferedToAcc
        public static void UpdateBillingSync(SyncBillingAccountingModel sync, AccountingDbContext accDbContext)
        {
            try
            {
                sync.IsTransferedToAcc = true;
                accDbContext.SyncBillingAccounting.Attach(sync);
                accDbContext.Entry(sync).Property(a => a.IsTransferedToAcc).IsModified = true;
                accDbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

    }
}
