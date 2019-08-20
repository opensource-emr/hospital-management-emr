//using DanpheEMR.CommonTypes;
using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using System.Collections;
using DanpheEMR.Security;
using DanpheEMR.Core.Caching;
using System.Configuration;
using System.Data;
using System.Reflection;
using System.ComponentModel;
using System.Dynamic;
using System.Data.SqlClient;

namespace DanpheEMR.AccTransfer
{
    public class AccountingTransferData
    {
        //Property Declaration
        static private List<LedgerModel> LedgerList = new List<LedgerModel>();
        static private List<LedgerModel> unavailableLedgerList = new List<LedgerModel>();
        static private List<LedgerGroupModel> LedgergroupList = new List<LedgerGroupModel>();
        static private List<VoucherModel> voucherList = new List<VoucherModel>();
        static private List<VoucherHeadModel> voucherHeadList = new List<VoucherHeadModel>();
        static private List<GroupMappingModel> RuleMappingList = new List<GroupMappingModel>();
        static private List<FiscalYearModel> FiscalYearList = new List<FiscalYearModel>();
        static private List<TransactionModel> Transaction = new List<TransactionModel>();
        static private List<SyncBillingAccountingModel> billingSyncList = new List<SyncBillingAccountingModel>();
        static private List<VendorMasterModel> vendorLedger = new List<VendorMasterModel>();
        static private List<PHRMSupplierModel> supplierLedger = new List<PHRMSupplierModel>();
        static private List<GoodsReceiptModel> InvGoodRecipt = new List<GoodsReceiptModel>();
        static private List<PHRMGoodsReceiptModel> PHRMGoodreceipt = new List<PHRMGoodsReceiptModel>();
        static int EmployeeId;
        static private bool IsVatRegistered;



        //   DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        private static AccountingDbContext accountingDBContext;
        private static InventoryDbContext inventoryDbContext;
        public static PharmacyDbContext pharmacyDbContext;
        public AccountingTransferData(string connString, int employeeId)
        {
            EmployeeId = employeeId;
            accountingDBContext = new AccountingDbContext(connString);
            inventoryDbContext = new InventoryDbContext(connString);
            pharmacyDbContext = new PharmacyDbContext(connString);
            GetMasterData();
            // GetMapAndTransferDataSectionWise();
        }

        #region Master data initialization 
        public static void GetMasterData()
        {
            //master data initialization
            //get Ledgers List
            var ledgerList = (from led in accountingDBContext.Ledgers
                              join ledgrp in accountingDBContext.LedgerGroups
                               on led.LedgerGroupId equals ledgrp.LedgerGroupId
                              where led.IsActive == true
                              select new
                              {
                                  led.LedgerId,
                                  led.LedgerName,
                                  led.LedgerGroupId,
                                  ledgrp.LedgerGroupName,
                                  ledgrp.PrimaryGroup,
                                  ledgrp.COA,
                                  led.LedgerReferenceId,
                                  led.SectionId,
                                  led.Name,
                                  led.LedgerType
                              }).ToList();
            LedgerList = ledgerList.Select(p => new LedgerModel()
            {
                LedgerId = p.LedgerId,
                LedgerName = p.LedgerName,
                LedgerGroupId = p.LedgerGroupId,
                LedgerGroupName = p.LedgerGroupName,
                COA = p.COA,
                PrimaryGroup = p.PrimaryGroup,
                LedgerReferenceId = p.LedgerReferenceId,
                SectionId = p.SectionId,
                Name = p.Name,
                LedgerType = p.LedgerType
            }).ToList();
            //get ledger group list
            var ledgerGrouplist = (from ledgrp in accountingDBContext.LedgerGroups
                                   select new
                                   {
                                       LedgerGroupId = ledgrp.LedgerGroupId,
                                       ledgrp.PrimaryGroup,
                                       ledgrp.COA,
                                       LedgerGroupName = ledgrp.LedgerGroupName,
                                       IsActive = ledgrp.IsActive,
                                       Description = ledgrp.Description,
                                       ledgrp.Name
                                   }).ToList().OrderBy(r => r.LedgerGroupId);
            LedgergroupList = ledgerGrouplist.Select(p => new LedgerGroupModel()
            {
                Description = p.Description,
                IsActive = p.IsActive,
                LedgerGroupId = p.LedgerGroupId,
                LedgerGroupName = p.LedgerGroupName,
                COA = p.COA,
                PrimaryGroup = p.PrimaryGroup,
                Name = p.Name,
            }).ToList();
            //get vouchers list
            var vouchers = (from voucher in accountingDBContext.Vouchers
                            where voucher.IsActive == true
                            select voucher).ToList();
            voucherList = vouchers;
            //get voucher heads
            var voucherHeads = (from voucher in accountingDBContext.VoucherHeads
                                where voucher.IsActive == true
                                select voucher).ToList();
            voucherHeadList = voucherHeads;
            // get fiscal years data
            var fiscalyearList = (from fsc in accountingDBContext.FiscalYears
                                  select fsc).ToList();
            FiscalYearList = fiscalyearList;
            //get Account transfer rules
            var activeHosp = accountingDBContext.Hospitals
                .Where(a => a.IsActive == true)
                .FirstOrDefault();
            var ruleList = (from hosprulemap in accountingDBContext.HospitalTransferRuleMappings
                            where hosprulemap.HospitalId == activeHosp.HospitalId && hosprulemap.IsActive == true
                            select hosprulemap.TransferRuleId).ToList();
            var AccTransferRules = (from grp in accountingDBContext.GroupMapping
                                    join ruleid in ruleList on grp.GroupMappingId equals ruleid
                                    select new
                                    {
                                        grp.GroupMappingId,
                                        grp.Section,
                                        grp.Description,
                                        grp.VoucherId,
                                        MappingDetail = (from mapDetail in accountingDBContext.MappingDetail
                                                         join ledgrp in accountingDBContext.LedgerGroups
                                                         on mapDetail.LedgerGroupId equals ledgrp.LedgerGroupId
                                                         where grp.GroupMappingId == mapDetail.GroupMappingId
                                                         select new
                                                         {
                                                             mapDetail.AccountingMappingDetailId,
                                                             mapDetail.LedgerGroupId,
                                                             ledgrp.LedgerGroupName,
                                                             ledgrp.Name,
                                                             mapDetail.DrCr,
                                                             mapDetail.Description
                                                         }).ToList()
                                    }).ToList();
            RuleMappingList = AccTransferRules.Select(p => new GroupMappingModel()
            {
                GroupMappingId = p.GroupMappingId,
                Section = p.Section,
                Description = p.Description,
                VoucherId = p.VoucherId,
                MappingDetail = p.MappingDetail.Select(x => new MappingDetailModel()
                {
                    AccountingMappingDetailId = x.AccountingMappingDetailId,
                    LedgerGroupId = x.LedgerGroupId,
                    LedgerGroupName = x.LedgerGroupName,
                    Name = x.Name,
                    DrCr = x.DrCr,
                    Description = x.Description
                }).ToList()
            }).ToList();
            var supplier = (from m in accountingDBContext.LedgerMappings
                            join s in accountingDBContext.PHRMSupplier on m.ReferenceId equals s.SupplierId
                            where m.LedgerType == "pharmacysupplier"
                            select new
                            {
                                m.LedgerId,
                                s.SupplierId,
                                m.LedgerType,
                                LedgerName = s.SupplierName
                            }).ToList();
            supplierLedger = supplier.Select(a => new PHRMSupplierModel
            {
                SupplierId = a.SupplierId,
                SupplierName = a.LedgerName,
                LedgerId = a.LedgerId,
                LedgerType = a.LedgerType,
            }).ToList();
            var vendor = (from m in accountingDBContext.LedgerMappings
                          join v in accountingDBContext.InvVendors on m.ReferenceId equals v.VendorId
                          where m.LedgerType == "inventoryvendor"
                          select new
                          {
                              v.VendorId,
                              m.LedgerId,
                              m.LedgerType,
                              LedgerName = v.VendorName
                          }).ToList();
            vendorLedger = vendor.Select(p => new VendorMasterModel()
            {
                VendorId = p.VendorId,
                VendorName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
            }).ToList();

            var vatRegistered = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "VatRegisteredHospital").Select(a => a.ParameterValue).FirstOrDefault();
            IsVatRegistered = (vatRegistered == "true") ? true : false;
        }
        #endregion

        #region common methods for all section like billing, inventory, pharmacy, etc
        //public bool GetMapAndTransferDataSectionWise()
        //{
        //    //GetMasterData();
        //    //Inventory Section
        //    bool isInv = GetInventoryTxnData();
        //    if (isInv)
        //    {
        //        MapInventoryTxnData();
        //        PostTxnData();
        //    }

        //    //Billing Section
        //    bool isbilling = GetBillingTxnData();
        //    if (isbilling)
        //    {
        //        MapBillingTxnData();
        //        PostTxnData();
        //    }

        //    //pharmacy section
        //    bool isPhrm = GetPharmacyData();
        //    if (isPhrm)
        //    {
        //        MapPharmacyData();
        //        PostTxnData();
        //    }
        //    Clear();
        //    if (isbilling == false && isPhrm == false && isInv == false)
        //    {
        //        return false;
        //    }
        //    else
        //    {
        //        return true;
        //    }
        //}

        //method to transfer all txn
        public static List<TransactionModel> GetMapAndTransferDataSectionWise(int sectionId, DateTime FromDate, DateTime ToDate)
        {
            //Inventory Section
            List<TransactionModel> txn = new List<TransactionModel>();
            bool isInv = false;
            bool isbilling = false;
            bool isPhrm = false;
            var fisyearid = (from f in FiscalYearList
                             where f.StartDate <= FromDate && ToDate <= f.EndDate
                             select f.FiscalYearId).FirstOrDefault();
            if (sectionId == 1)
            {
                isInv = GetInventoryTxnData(FromDate, ToDate);
                if (isInv)
                {
                    txn = MapInventoryTxnData(fisyearid);
                }
            }

            //Billing Section
            else if (sectionId == 2)
            {
                isbilling = GetBillingTxnData(FromDate, ToDate);
                if (isbilling)
                {
                    txn = MapBillingTxnData(fisyearid);
                }
            }

            //pharmacy section
            else
            {
                isPhrm = GetPharmacyData(FromDate, ToDate);
                if (isPhrm)
                {
                    txn = MapPharmacyData(fisyearid);
                }
            }
            return txn;
        }

        //  method for ledger name for mapping to rules
        private static string GetLedgerName(string ledgername)
        {
            try
            {
                string ledger = LedgerList.Find(a => a.Name == ledgername).LedgerName;
                return ledger;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //method to get ledgerId for mapping to rules
        private static int GetLedgerId(string ledgerNameString, int ledgerGroupId, int? ledgerReferenceId)
        {
            try
            {
                if (ledgerGroupId > 0)
                {

                    var ledger = LedgerList.Find(x => x.LedgerName == ledgerNameString);          //   this.ledgerList.filter(x => x.LedgerName == ledgerNameString)[0];
                    if (ledger != null)
                    {
                        return ledger.LedgerId;
                    }
                    else
                    {
                        var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                        var tempLed = new LedgerModel();
                        tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                        tempLed.COA = ledGrp.COA;
                        tempLed.LedgerGroupId = ledgerGroupId;
                        tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                        tempLed.LedgerName = ledgerNameString;
                        tempLed.LedgerReferenceId = ledgerReferenceId;
                        var flag = true;
                        unavailableLedgerList.ForEach(l =>
                        {
                            if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
                                && l.LedgerName == tempLed.LedgerName)
                            {
                                flag = false;
                            }
                        });
                        if (flag)
                        {
                            unavailableLedgerList.Add(tempLed);
                        }
                        return 0;
                    }
                }
                return 0;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //methods to check valid transactions
        private static bool CheckValidTxn(TransactionModel accTxnItm)
        {
            try
            {
                bool flag = true;
                if (accTxnItm.TransactionItems.Count > 0)
                {
                    accTxnItm.TransactionItems.ForEach(s =>
                    {
                        if (s.LedgerId == 0)
                        {
                            flag = false;
                        }
                    });
                    flag = true;
                }
                else
                {
                    flag = false;
                }
                return flag;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        #region common methods for post data
        //method for update transferred records
        //methos for automatic transfer
        public static double PostTxnData(int section)
        {
            try
            {
                //GetMapAndTransferDataSectionWise(section); //temporaty created
                var TxnCounts = Transaction.Count;
                if (Transaction.Count > 0)
                {
                    //here transaction list from billing or may be from inventory
                    //1-sectionId for inventory 2-sectionid for billing
                    var sectionId = Transaction[0].SectionId;
                    var distinctVouchers = (from txn in Transaction
                                            select new { txn.VoucherId }).Distinct().ToList();
                    var Tuid = GetTUID(accountingDBContext);
                    Hashtable voucherNumberList = new Hashtable();
                    for (int p = 0; p < distinctVouchers.Count; p++)
                    {
                        string vNum = GetVoucherNumber(accountingDBContext, distinctVouchers[p].VoucherId);
                        voucherNumberList.Add(distinctVouchers[p].VoucherId, vNum);
                    }
                    //for below line user can only transfer one type of voucher records
                    // string VoucherNumber = GetVoucherNumber(accountingDBContext, Transaction[0].VoucherId);//new code for voucher number creation 
                    if (sectionId == 2)
                    {//billing

                        List<string> allSyncAccBillingIds = new List<string>();
                        Transaction.ForEach(txn =>
                        {
                            //txn.VoucherNumber = GetVoucherNumber(accountingDBContext, txn.VoucherId); 
                            txn.TUId = Tuid;
                            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                            txn.IsActive = true;
                            TransactionModel txntemp = ProcessTransactions(txn);
                            accountingDBContext.Transactions.Add(txntemp);
                            accountingDBContext.SaveChanges();
                            //updating Sync_BillingAccounting table 
                            var txntype = "BillingRecords";
                            txn.BillSyncs.ForEach(bill =>
                            {
                                var refId = bill.BillingAccountingSyncId.ToString();
                                allSyncAccBillingIds.Add(refId);
                            });
                            string refIdStr = string.Join(",", allSyncAccBillingIds.Select(p => p));
                            accountingDBContext.UpdateIsTransferToACC(refIdStr, txntype);

                            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                            {
                                txntemp.TransactionItems[i].IsActive = true;
                                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                {
                                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                    {
                                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                    }
                                }
                            }
                        });
                        accountingDBContext.SaveChanges();
                    }
                    else if (sectionId == 1)
                    {//inventory
                     //List<string> allReferenceIds = new List<string>();
                        Transaction.ForEach(txn =>
                        {
                            txn.TUId = Tuid;
                            txn.IsActive = true;
                            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                            // txn.VoucherNumber = "INV-" + txn.TransactionLinks[txn.TransactionLinks.Count - 1].ReferenceId.ToString();
                            //  accountingDBContext.Transactions.Add(ProcessTransactions(txn));
                            //var referId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                            //referId.ForEach(newId => allReferenceIds.Add((int)newId));
                            TransactionModel txntemp = ProcessTransactions(txn);
                            accountingDBContext.Transactions.Add(txntemp);
                            accountingDBContext.SaveChanges();
                            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                            {
                                txntemp.TransactionItems[i].IsActive = true;
                                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                {
                                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                    {
                                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                    }
                                }
                            }
                        });
                        accountingDBContext.SaveChanges();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = Transaction.Select(a => a.TransactionType).ToList().Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = (from t in Transaction
                                                where t.TransactionType == distinctTxnTypeList[i]
                                                select t).ToList();
                            List<string> allReferenceIds = new List<string>();
                            filteredData.ForEach(txn =>
                            {
                                var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                refId.ForEach(newId => allReferenceIds.Add((string)newId));
                            });
                            string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                            ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                        }

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                accountingDBContext.UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                            }
                        }
                        accountingDBContext.SaveChanges();

                    }
                    else
                    {//pharmacy

                        Transaction.ForEach(txn =>
                        {
                            txn.TUId = Tuid;
                            txn.IsActive = true;
                            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                            TransactionModel txntemp = ProcessTransactions(txn);
                            accountingDBContext.Transactions.Add(txntemp);
                            accountingDBContext.SaveChanges();
                            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                            {
                                txntemp.TransactionItems[i].IsActive = true;
                                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                {
                                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                    {
                                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                    }
                                }
                            }
                        });
                        accountingDBContext.SaveChanges();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = Transaction.Select(a => a.TransactionType).ToList().Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = (from t in Transaction
                                                where t.TransactionType == distinctTxnTypeList[i]
                                                select t).ToList();
                            List<string> allReferenceIds = new List<string>();
                            filteredData.ForEach(txn =>
                            {
                                var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                refId.ForEach(newId => allReferenceIds.Add((string)newId));
                            });
                            string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                            ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                        }

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                accountingDBContext.UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                            }
                        }
                        accountingDBContext.SaveChanges();
                    }
                    Clear();
                    return TxnCounts;
                }
                else
                {
                    Clear();
                    return 0;
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //post method for user to transfer verified txns 
        public static bool PostTxnData(List<TransactionModel> txndata)
        {
            try
            {
                var conn = accountingDBContext.Database.Connection;
                conn.Open();
                using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
                {
                    try
                    {
                        Transaction = txndata;
                        List<string> updateReferenceIds = new List<string>();
                        Hashtable allReferenceIdWithTypeList = new Hashtable();
                        string refBillingSyncIds = "";
                        if (Transaction.Count > 0)
                        {
                            //here transaction list from billing or may be from inventory
                            //1-sectionId for inventory 2-sectionid for billing
                            var sectionId = Transaction[0].SectionId;
                            var distinctVouchers = (from txn in Transaction
                                                    select new { txn.VoucherId }).Distinct().ToList();
                            var Tuid = GetTUID(accountingDBContext);
                            Hashtable voucherNumberList = new Hashtable();
                            for (int p = 0; p < distinctVouchers.Count; p++)
                            {
                                string vNum = GetVoucherNumber(accountingDBContext, distinctVouchers[p].VoucherId);
                                voucherNumberList.Add(distinctVouchers[p].VoucherId, vNum);
                            }
                            //for below line user can only transfer one type of voucher records
                            // string VoucherNumber = GetVoucherNumber(accountingDBContext, Transaction[0].VoucherId);//new code for voucher number creation 
                            if (sectionId == 2)
                            {//billing

                                List<string> allSyncAccBillingIds = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    //txn.VoucherNumber = GetVoucherNumber(accountingDBContext, txn.VoucherId); 
                                    txn.TUId = Tuid;
                                    txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                                    txn.IsActive = true;
                                    TransactionModel txntemp = ProcessTransactions(txn);
                                    accountingDBContext.Transactions.Add(txntemp);
                                    accountingDBContext.SaveChanges();
                                    //updating Sync_BillingAccounting table 
                                    // var txntype = "BillingRecords";
                                    txn.BillSyncs.ForEach(bill =>
                                    {
                                        var refId = bill.BillingAccountingSyncId.ToString();
                                        allSyncAccBillingIds.Add(refId);
                                    });
                                    string refIdStr = string.Join(",", allSyncAccBillingIds.Select(p => p));
                                    refBillingSyncIds = refIdStr; //for updateing if txns are commit
                                    //accountingDBContext.UpdateIsTransferToACC(refIdStr, txntype);
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].IsActive = true;
                                        if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                        {
                                            for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                            {
                                                TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                                tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                                accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                            }
                                        }
                                    }
                                });
                                accountingDBContext.SaveChanges();
                            }
                            else if (sectionId == 1)
                            {//inventory
                             //List<string> allReferenceIds = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                                    // txn.VoucherNumber = "INV-" + txn.TransactionLinks[txn.TransactionLinks.Count - 1].ReferenceId.ToString();
                                    //  accountingDBContext.Transactions.Add(ProcessTransactions(txn));
                                    //var referId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                    //referId.ForEach(newId => allReferenceIds.Add((int)newId));
                                    TransactionModel txntemp = ProcessTransactions(txn);
                                    accountingDBContext.Transactions.Add(txntemp);
                                    accountingDBContext.SaveChanges();
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].IsActive = true;
                                        if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                        {
                                            for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                            {
                                                TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                                tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                                accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                            }
                                        }
                                    }
                                });
                                accountingDBContext.SaveChanges();
                                List<string> TransactionType = new List<string>();
                                var distinctTxnTypeList = Transaction.Select(a => a.TransactionType).ToList().Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = (from t in Transaction
                                                        where t.TransactionType == distinctTxnTypeList[i]
                                                        select t).ToList();
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txn =>
                                    {
                                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
                                    });
                                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                                }

                                //if (distinctTxnTypeList.Count > 0)
                                //{
                                //    foreach (string txnType in distinctTxnTypeList)
                                //    {
                                //        accountingDBContext.UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                                //    }
                                //}
                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();

                            }
                            else
                            {//pharmacy

                                Transaction.ForEach(txn =>
                                {
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                                    TransactionModel txntemp = ProcessTransactions(txn);
                                    accountingDBContext.Transactions.Add(txntemp);
                                    accountingDBContext.SaveChanges();
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].IsActive = true;
                                        if (txntemp.TransactionItems[i].IsTxnDetails == true)
                                        {
                                            for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                                            {
                                                TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                                                tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                                                accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                                            }
                                        }
                                    }
                                });
                                accountingDBContext.SaveChanges();
                                List<string> TransactionType = new List<string>();
                                var distinctTxnTypeList = Transaction.Select(a => a.TransactionType).ToList().Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = (from t in Transaction
                                                        where t.TransactionType == distinctTxnTypeList[i]
                                                        select t).ToList();
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txn =>
                                    {
                                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
                                    });
                                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                                }

                                //if (distinctTxnTypeList.Count > 0)
                                //{
                                //    foreach (string txnType in distinctTxnTypeList)
                                //    {
                                //        UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                                //    }
                                //}
                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();
                            }

                            dbContextTransaction.Commit();
                            if (updateReferenceIds.Count > 0 && sectionId != 2)  ///if txn committed successfully, all reference ids will update 
                            {
                                foreach (string txnType in updateReferenceIds)
                                {
                                    accountingDBContext.UpdateIsTransferToACC(allReferenceIdWithTypeList[txnType].ToString(), txnType);
                                }
                            }
                            else
                            {
                                accountingDBContext.UpdateIsTransferToACC(refBillingSyncIds, "BillingRecords");
                            }
                            Clear();
                            return true;
                        }
                        else
                        {
                            Clear();
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
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                accountingDBContext.Database.Connection.Close();
            }
        }

        //this will return tuid
        private static int? GetTUID(AccountingDbContext accountingDbContext)
        {
            try
            {
                var Tuid = (from txn in accountingDBContext.Transactions
                            select txn.TUId).ToList().Max();
                if (Tuid != null)
                {
                    Tuid = Tuid + 1;
                }
                else
                {
                    Tuid = 1;
                }
                return Tuid;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //method to create voucher number for transactions
        private static string GetVoucherNumber(AccountingDbContext accountingDBContext, int? voucherId)
        {
            var transList = (from txn in accountingDBContext.Transactions
                             where txn.VoucherId == voucherId
                             select txn
                                ).ToList().LastOrDefault();
            var voucherCode = (from v in accountingDBContext.Vouchers
                               where v.VoucherId == voucherId
                               select v.VoucherCode).FirstOrDefault();
            if (transList != null)
            {
                IList<string> l = transList.VoucherNumber.Split('-');
                int maxno = int.Parse(l[1]) + 1;
                return (l[0] + '-' + maxno.ToString()).ToUpper();
            }
            else
            {
                return voucherCode + "-1";
            }
        }
        //Process Transaction
        private static TransactionModel ProcessTransactions(TransactionModel transaction)
        {

            transaction.CreatedBy = EmployeeId;
            transaction.CreatedOn = DateTime.Now;
            transaction.TransactionItems.ForEach(txnItem =>
            {
                txnItem.CreatedOn = DateTime.Now;
                txnItem.CreatedBy = EmployeeId;
            });
            return transaction;
        }
        //method for add new ledger into ledgers
        private static void AddLedgersFromAcc()
        {
            using (var PostLedger = accountingDBContext.Database.BeginTransaction())
            {
                try
                {
                    unavailableLedgerList.ForEach(led =>
                    {
                        led.CreatedOn = System.DateTime.Now;
                        led.IsActive = true;
                        accountingDBContext.Ledgers.Add(led);
                        accountingDBContext.SaveChanges();
                        if (led.LedgerType == "pharmacysupplier" || led.LedgerType == "inventoryvendor")
                        {
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = led.LedgerId;
                            ledgerMapping.LedgerType = led.LedgerType;
                            ledgerMapping.ReferenceId = (int)led.LedgerReferenceId;
                            accountingDBContext.LedgerMappings.Add(ledgerMapping);
                            accountingDBContext.SaveChanges();
                        }
                    });
                    unavailableLedgerList = new List<LedgerModel>();
                    var supplier = (from m in accountingDBContext.LedgerMappings
                                    join s in accountingDBContext.PHRMSupplier on m.ReferenceId equals s.SupplierId
                                    where m.LedgerType == "pharmacysupplier"
                                    select new
                                    {
                                        m.LedgerId,
                                        s.SupplierId,
                                        m.LedgerType,
                                        LedgerName = s.SupplierName
                                    }).ToList();
                    supplierLedger = supplier.Select(a => new PHRMSupplierModel
                    {
                        SupplierId = a.SupplierId,
                        SupplierName = a.LedgerName,
                        LedgerId = a.LedgerId,
                        LedgerType = a.LedgerType,
                    }).ToList();
                    var vendor = (from m in accountingDBContext.LedgerMappings
                                  join v in accountingDBContext.InvVendors on m.ReferenceId equals v.VendorId
                                  where m.LedgerType == "inventoryvendor"
                                  select new
                                  {
                                      v.VendorId,
                                      m.LedgerId,
                                      m.LedgerType,
                                      LedgerName = v.VendorName
                                  }).ToList();
                    vendorLedger = vendor.Select(p => new VendorMasterModel()
                    {
                        VendorId = p.VendorId,
                        VendorName = p.LedgerName,
                        LedgerId = p.LedgerId,
                        LedgerType = p.LedgerType,
                    }).ToList();
                    var ledgerList = (from led in accountingDBContext.Ledgers
                                      join ledgrp in accountingDBContext.LedgerGroups
                                       on led.LedgerGroupId equals ledgrp.LedgerGroupId
                                      where led.IsActive == true
                                      select new
                                      {
                                          led.LedgerId,
                                          led.LedgerName,
                                          led.LedgerGroupId,
                                          ledgrp.LedgerGroupName,
                                          ledgrp.PrimaryGroup,
                                          ledgrp.COA,
                                          led.LedgerReferenceId,
                                          led.SectionId,
                                          led.Name,
                                          led.LedgerType
                                      }).ToList();
                    LedgerList = ledgerList.Select(p => new LedgerModel()
                    {
                        LedgerId = p.LedgerId,
                        LedgerName = p.LedgerName,
                        LedgerGroupId = p.LedgerGroupId,
                        LedgerGroupName = p.LedgerGroupName,
                        COA = p.COA,
                        PrimaryGroup = p.PrimaryGroup,
                        LedgerReferenceId = p.LedgerReferenceId,
                        SectionId = p.SectionId,
                        Name = p.Name,
                        LedgerType = p.LedgerType
                    }).ToList();
                    PostLedger.Commit();
                }
                catch (Exception ex)
                {
                    PostLedger.Rollback();
                    throw ex;
                }
            }
        }
        //method to clear data after transfer to accounting
        private static void Clear()
        {
            Transaction = new List<TransactionModel>();
            billingSyncList = new List<SyncBillingAccountingModel>();
            InvGoodRecipt = new List<GoodsReceiptModel>();
        }
        #endregion

        #region Billing Get and Transfer data region
        //method for get billing data 
        private static bool GetBillingTxnData(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                DataTable syncBill = accountingDBContext.BilTxnItemsDateWise(FromDate, ToDate);

                List<SyncBillingAccountingModel> sync = syncBill.AsEnumerable().Select(
                                            dataRow => new SyncBillingAccountingModel
                                            {
                                                BillingAccountingSyncId = dataRow.Field<int>("BillingAccountingSyncId"),
                                                TransactionDate = dataRow.Field<DateTime>("TransactionDate"),
                                                TransactionType = dataRow.Field<string>("TransactionType"),
                                                ReferenceModelName = dataRow.Field<string>("ReferenceModelName"),
                                                ReferenceId = dataRow.Field<int>("ReferenceId"),
                                                ServiceDepartmentId = dataRow.Field<int?>("ServiceDepartmentId"),
                                                ItemId = dataRow.Field<int?>("ItemId"),
                                                IncomeLedgerName = dataRow.Field<string>("IncomeLedgerName"),
                                                PatientId = dataRow.Field<int>("PatientId"),
                                                PaymentMode = dataRow.Field<string>("PaymentMode"),
                                                SubTotal = dataRow.Field<double?>("SubTotal"),
                                                TaxAmount = dataRow.Field<double?>("TaxAmount"),
                                                DiscountAmount = dataRow.Field<double?>("DiscountAmount"),
                                                TotalAmount = dataRow.Field<double?>("TotalAmount"),
                                                SettlementDiscountAmount = dataRow.Field<double?>("SettlementDiscountAmount"),
                                                CreatedOn = dataRow.Field<DateTime?>("CreatedOn"),
                                                CreatedBy = dataRow.Field<int?>("CreatedBy"),
                                                IsTransferedToAcc = dataRow.Field<bool?>("IsTransferedToAcc")
                                            }).ToList();
                var billitm = sync.GroupBy(a => new { a.TransactionType, Convert.ToDateTime(a.TransactionDate).Date, a.IncomeLedgerName, PaymentMode = (a.PaymentMode == "card" || a.PaymentMode == "cheque") ? "bank" : a.PaymentMode })
                    .Select(itm => new
                    {
                        TransactionDate = itm.Select(a => a.TransactionDate).FirstOrDefault(),
                        IncomeLedgerName = itm.Select(a => a.IncomeLedgerName).FirstOrDefault(),
                        TransactionType = itm.Select(a => a.TransactionType).FirstOrDefault(),
                        PaymentMode = itm.Select(a => a.PaymentMode).FirstOrDefault(),
                        SalesAmount = itm.Select(a => a.SubTotal).Sum(),
                        TaxAmount = itm.Select(a => a.TaxAmount).Sum(),
                        DiscountAmount = itm.Select(a => a.DiscountAmount).Sum(),
                        SettlementDiscountAmount = itm.Select(a => a.SettlementDiscountAmount).Sum(),
                        TotalAmountCreditBillPaid = itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.TotalAmount).Sum() - itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.SettlementDiscountAmount).Sum(),
                        TotalAmount = itm.Where(a => a.TransactionType != "CreditBillPaid").Select(a => a.TotalAmount).Sum(),
                        BillTxnItemIds = itm.Select(a => a.ReferenceId).ToList(),
                        BillSyncs = itm.Select(a => new { a.BillingAccountingSyncId, a.PatientId, a.TotalAmount, a.CreatedBy, a.ReferenceModelName }).ToList(),
                        Remarks = "Transaction for " + itm.Select(a => a.IncomeLedgerName).FirstOrDefault()
                        + " income ledger : " + itm.Select(a => a.TransactionType).FirstOrDefault()
                    }).OrderBy(s => s.TransactionDate).ThenBy(s => s.IncomeLedgerName).ToList();

                if (billitm.Count > 0)
                {
                    var Syncbill = new List<SyncBillingAccountingModel>();
                    Syncbill = billitm.Select(p => new SyncBillingAccountingModel()
                    {
                        TransactionDate = p.TransactionDate,
                        IncomeLedgerName = p.IncomeLedgerName,
                        TransactionType = p.TransactionType,
                        PaymentMode = p.PaymentMode,
                        SalesAmount = p.SalesAmount != null ? p.SalesAmount : 0,
                        TaxAmount = p.TaxAmount != null ? p.TaxAmount : 0,
                        SettlementDiscountAmount = p.SettlementDiscountAmount != null ? p.SettlementDiscountAmount : 0,
                        TotalAmount = p.TotalAmountCreditBillPaid > 0 ? p.TotalAmountCreditBillPaid : p.TotalAmount,
                        BillTxnItemIds = p.BillTxnItemIds,
                        Remarks = p.Remarks,
                        DiscountAmount = p.DiscountAmount != null ? p.DiscountAmount : 0,
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            BillingAccountingSyncId = x.BillingAccountingSyncId,
                            PatientId = x.PatientId,
                            TotalAmount = x.TotalAmount,
                            CreatedBy = x.CreatedBy,
                            ReferenceModelName = x.ReferenceModelName,
                        }).ToList()
                    }).ToList();
                    Syncbill.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    billingSyncList = Syncbill;
                }
                if (billingSyncList.Count > 0)
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

        //method for billing mapping
        private static List<TransactionModel> MapBillingTxnData(int fiscalYearId)
        {
            try
            {
                var accTxnFromBilling = new List<TransactionModel>();
                for (int i = 0; i < billingSyncList.Count; i++)
                {
                    var record = billingSyncList[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks + record.TransactionDate;
                    transaction.SectionId = 2;
                    transaction.TransactionDate = record.TransactionDate;
                    transaction.BillSyncs = record.BillSyncs;
                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.BillTxnItemIds;
                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    transaction.TransactionLinks.Add(txnLink);


                    switch (record.TransactionType)
                    {
                        case "DepositAdd":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "DepositAddCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH") : GetLedgerName("ACA_BANK_HAMS_BANK");
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.CreatedBy;
                                                accTxnItemDetail.ReferenceType = "User";
                                                accTxnItemDetail.Amount = itm.TotalAmount;
                                                accTxnItemDetail.Description = "DepositAdd->Cash -> Created By";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "DepositAddPatientDeposits(Liability)")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = itm.TotalAmount;
                                                accTxnItemDetail.Description = "DepositAdd->Patient Deposits (Liability)->Advance From Patient";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        //        accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);

                                    });
                                }
                                break;
                            }
                        case "DepositReturn":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "DepositReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH");
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                //  accTxnItemDetail.PatientId = r.PatientId;
                                                accTxnItemDetail.ReferenceId = r.CreatedBy;
                                                accTxnItemDetail.ReferenceType = "User";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "DepositReturn->Cash -> Created By";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "DepositReturnPatientDeposits(Liability)")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                //  accTxnItemDetail.PatientId = r.PatientId;
                                                accTxnItemDetail.ReferenceId = r.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "DepositReturn->Patient Deposits (Liability)->Advance From Patient";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "CashBill":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "CashBillSales")
                                        {
                                            accTxnItems.Amount = record.SalesAmount;
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CashBillCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH") : GetLedgerName("ACA_BANK_HAMS_BANK");
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                    {
                                        var accTxnItemDetail = new TransactionItemDetailModel();
                                        //  accTxnItemDetail.PatientId = r.PatientId;
                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
                                        accTxnItemDetail.ReferenceType = "User";
                                        accTxnItemDetail.Amount = r.TotalAmount;
                                        accTxnItemDetail.Description = "CashBill->Cash -> Created By";
                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                    });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "CashBillDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "CashBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        transaction.TransactionType = record.TransactionType;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "CreditBill":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                transaction.TransactionItems = new List<TransactionItemModel>();
                                if (transferRule.Count > 0)
                                {
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "CreditBillSales")
                                        {
                                            accTxnItems.Amount = record.SalesAmount;
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CreditBillSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                    {
                                        var accTxnItemDetail = new TransactionItemDetailModel();
                                        //   accTxnItemDetail.PatientId = r.PatientId;
                                        accTxnItemDetail.ReferenceId = r.PatientId;
                                        accTxnItemDetail.ReferenceType = "Patient";
                                        accTxnItemDetail.Amount = r.TotalAmount;
                                        accTxnItemDetail.Description = "CreditBill->Sundry Debtors->Receivable";
                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                    });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "CreditBillDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "CreditBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "CashBillReturn":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "CashBillReturnSales")
                                        {
                                            accTxnItems.Amount = record.SalesAmount;
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CashBillReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH") : GetLedgerName("ACA_BANK_HAMS_BANK");
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                               {
                                                   var accTxnItemDetail = new TransactionItemDetailModel();
                                                   //  accTxnItemDetail.PatientId = r.PatientId;
                                                   accTxnItemDetail.ReferenceId = r.CreatedBy;
                                                   accTxnItemDetail.ReferenceType = "User";
                                                   accTxnItemDetail.Amount = r.TotalAmount;
                                                   accTxnItemDetail.Description = "CashBillReturn->Cash -> Created By";
                                                   accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                               });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "CashBillReturnDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "CashBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "CreditBillPaid":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "CreditBillPaidCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount - record.SettlementDiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH") : GetLedgerName("ACA_BANK_HAMS_BANK");
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                //  accTxnItemDetail.PatientId = r.PatientId;
                                                accTxnItemDetail.ReferenceId = r.CreatedBy;
                                                accTxnItemDetail.ReferenceType = "User";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "CreditBillPaid->Cash -> Created By";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "CreditBillPaidSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                    {
                                        var accTxnItemDetail = new TransactionItemDetailModel();
                                        //   accTxnItemDetail.PatientId = r.PatientId;
                                        accTxnItemDetail.ReferenceId = r.PatientId;
                                        accTxnItemDetail.ReferenceType = "Patient";
                                        accTxnItemDetail.Amount = r.TotalAmount;
                                        accTxnItemDetail.Description = "CreditBillPaid->Sundry Debtors->Receivable";
                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                    });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        //} else if (ruleRow.LedgerGroupName == "Duties and Taxes") {
                                        //    accTxnItems.Amount = record.TaxAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}
                                        else if (ruleRow.Description == "CreditBillPaidAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.SettlementDiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "CreditBillReturn":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        if (ruleRow.Description == "CreditBillReturnSales")
                                        {
                                            accTxnItems.Amount = record.SalesAmount;
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                //   accTxnItemDetail.PatientId = r.PatientId;
                                                accTxnItemDetail.ReferenceId = r.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "CreditBillReturn->Sundry Debtors->Receivable";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = record.TaxAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionType = record.TransactionType;
                                        // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                    }

                    if (CheckValidTxn(transaction))
                    {
                        accTxnFromBilling.Add(transaction);
                    }
                    else
                    {
                        transaction = new TransactionModel();
                    }
                }
                Transaction = accTxnFromBilling;
                return Transaction;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //method for get service departments as a income ledger
        private static int GetLedgerIdFromServiceDepartment(string ledgerNameString, int ledgerGroupId, int? ledgerReferenceId)
        {
            try
            {
                if (ledgerGroupId > 0)
                {

                    var ledger = LedgerList.Find(x => x.LedgerName == ledgerNameString);          //   this.ledgerList.filter(x => x.LedgerName == ledgerNameString)[0];
                    if (ledger != null)
                    {
                        return ledger.LedgerId;
                    }
                    else
                    {
                        var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                        var tempLed = new LedgerModel();
                        tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                        tempLed.COA = ledGrp.COA;
                        tempLed.LedgerGroupId = ledgerGroupId;
                        tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                        tempLed.LedgerName = ledgerNameString;
                        tempLed.LedgerReferenceId = ledgerReferenceId;
                        tempLed.Description = "Income Ledger for Hams";
                        var flag = true;
                        unavailableLedgerList.ForEach(l =>
                        {
                            if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
                                && l.LedgerName == tempLed.LedgerName)
                            {
                                flag = false;
                            }
                        });
                        if (flag)
                        {
                            unavailableLedgerList.Add(tempLed);
                            AddLedgersFromAcc();
                        }
                        return LedgerList.Find(a => a.LedgerName == ledgerNameString).LedgerId;
                    }
                }
                return 0;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Inventory get,map and transfer data 
        //method for get inventory data 
        private static bool GetInventoryTxnData(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                InvGoodRecipt = new List<GoodsReceiptModel>();
                var dataset = accountingDBContext.InvTxnsDateWise(Convert.ToDateTime(FromDate).Date, Convert.ToDateTime(ToDate).Date);

                var goodreceiptdata = DataTableToList.ToDynamic(dataset.Tables[0]);

                //var goodsReceiptItems = (from gr in goodreceiptdata.AsEnumerable()
                //                         group new { gr } by new
                //                         {
                //                             CreatedOn = Convert.ToDateTime(gr.CreatedOn).Date,
                //                             PaymentMode = gr.PaymentMode,
                //                             VendorId = gr.VendorId,
                //                         } into x
                //                         select new
                //                         {
                //                             x.Key.CreatedOn,
                //                             x.Key.VendorId,
                //                             VendorName = x.Select(a => a.gr.VendorName).FirstOrDefault(),
                //                             Type = x.Key.PaymentMode == "Cash" ? "Goods Receipt Cash" : "Credit Goods Receipt",
                //                             TransactionType = x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt",
                //                             SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                //                             TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                //                             TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                //                             VATAmount = x.Select(a => (decimal)a.gr.VATTotal).Sum(),
                //                             DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                //                             Remarks = "Inventory Transaction entries to Accounting for  " + (x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt ") + "on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                //                             ReferenceIds = x.Select(a => (int)a.gr.GoodsReceiptID).Distinct().ToList(),
                //                         }).ToList();
                var goodsReceiptItems = (from gr in goodreceiptdata.AsEnumerable()
                                         group new { gr } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(gr.CreatedOn).Date,
                                             PaymentMode = gr.PaymentMode,
                                             VendorId = gr.VendorId,
                                             ItemCategory = gr.ItemType,
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             x.Key.VendorId,
                                             VendorName = x.Select(a => a.gr.VendorName).FirstOrDefault(),
                                             Type = x.Key.PaymentMode == "Cash" ? (x.Key.ItemCategory == "Capital Goods" ? "Goods Receipt Cash For Capital Goods" : "Goods Receipt Cash") : (x.Key.ItemCategory == "Capital Goods" ? "Goods Receipt Credit For Capital Goods" : "Credit Goods Receipt"),
                                             TransactionType = x.Key.PaymentMode == "Cash" ? (x.Key.ItemCategory == "Capital Goods" ? "INVCashGoodReceiptFixedAsset1" : "INVCashGoodReceipt1") : (x.Key.ItemCategory == "Capital Goods" ? "INVCreditGoodReceiptFixedAsset" : "INVCreditGoodReceipt"),
                                             SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                             TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                                             VATAmount = x.Select(a => (decimal)a.gr.VATAmount).Sum(),
                                             DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                             ItemDetails = x.GroupBy(a => new { a.gr.ItemId }).Select(a => new { a.Key.ItemId, TotalAmount = a.Select(b => (decimal)b.gr.TotalAmount).Sum() }).ToList(),
                                             Remarks = "Inventory Transaction entries to Accounting for  " + (x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt ") + "on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => (int)a.gr.GoodsReceiptItemId).Distinct().ToList(), //we are using GoodsReceiptItemId as a referenceId
                                         }).ToList();
                if (goodsReceiptItems.Count > 0)
                {
                    var invItem = new List<GoodsReceiptModel>();
                    invItem = goodsReceiptItems.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        VendorId = p.VendorId,
                        //  ItemId = p.ItemId,
                        VendorName = p.VendorName,
                        //  ItemName = p.ItemName,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        TDSAmount = p.TDSAmount,
                        Type = p.Type,
                        BillSyncs = p.ItemDetails.Select(x => new SyncBillingAccountingModel()
                        {
                            ItemId = x.ItemId,
                            TotalAmount = (double)x.TotalAmount,
                        }).ToList()
                    }).ToList();
                    invItem.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in invItem)
                    {
                        InvGoodRecipt.Add(itm);
                    }
                }


                var writeoffdata = DataTableToList.ToDynamic(dataset.Tables[1]);

                var writeOffItems = (from wf in writeoffdata.AsEnumerable()
                                     group new { wf } by new
                                     {
                                         CreatedOn = Convert.ToDateTime(wf.CreatedOn).Date,
                                     } into x
                                     select new
                                     {
                                         x.Key.CreatedOn,
                                         Type = "WriteOff",
                                         TransactionType = "INVWriteOff",
                                         TotalAmount = x.Select(a => (decimal)a.wf.TotalAmount).Sum(),
                                         VATAmount = 0, //x.Select(b => b.gr.VATAmount).Sum(),
                                         Remarks = "Inventory Transaction entries to Accounting for write Off Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                         ReferenceIds = x.Select(a => (int)a.wf.WriteOffId).Distinct().ToList(),
                                     }).ToList();
                if (writeOffItems.Count > 0)
                {
                    var wrItem = new List<GoodsReceiptModel>();
                    wrItem = writeOffItems.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        VATAmount = p.VATAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type
                    }).ToList();
                    wrItem.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in wrItem)
                    {
                        InvGoodRecipt.Add(itm);
                    }
                }

                var returntovenderdata = DataTableToList.ToDynamic(dataset.Tables[2]);

                var returnToVender = (from ret in returntovenderdata.AsEnumerable()
                                      group new { ret } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(ret.CreatedOn).Date,
                                          VendorId = ret.VendorId,
                                          ret.PaymentMode
                                      } into x
                                      select new
                                      {
                                          x.Key.CreatedOn,
                                          x.Key.VendorId,
                                          VendorName = x.Select(a => a.ret.VendorName).FirstOrDefault(),
                                          Type = x.Key.PaymentMode == "Cash" ? "Return To Vender Cash" : "Return To Vender Credit",
                                          //  Type = "Return To Vender",
                                          TransactionType = x.Key.PaymentMode == "Cash" ? "INVReturnToVendorCashGR" : "INVReturnToVendorCreditGR",
                                          TotalAmount = x.Select(a => (decimal)a.ret.TotalAmount).Sum(),
                                          VATAmount = x.Select(b => (decimal)b.ret.VAT).Sum(),
                                          Remarks = "Inventory Transaction entries to Accounting for Return to vendor Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                          ReferenceIds = x.Select(a => (int)a.ret.ReturnToVendorItemId).Distinct().ToList(),
                                      }).ToList();
                if (returnToVender.Count > 0)
                {
                    var InvRet = new List<GoodsReceiptModel>();
                    InvRet = returnToVender.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        VendorId = p.VendorId,
                        VendorName = p.VendorName,
                        Type = p.Type,
                        TransactionType = p.TransactionType,
                        VATAmount = p.VATAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                    }).ToList();
                    InvRet.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in InvRet)
                    {
                        InvGoodRecipt.Add(itm);
                    }
                }

                var stocktxndata = DataTableToList.ToDynamic(dataset.Tables[3]);

                var dispatchToDept = (from stxn in stocktxndata
                                      group new { stxn } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(stxn.CreatedOn).Date,
                                          TransactionType = stxn.TransactionType
                                      } into x
                                      select new
                                      {
                                          CreatedOn = x.Key.CreatedOn,
                                          Type = x.Key.TransactionType == "dispatch" ? "Dispatch to department " : "Return To Inventory",
                                          TransactionType = x.Key.TransactionType == "dispatch" ? "INVDispatchToDept" : "INVDispatchToDeptReturn",
                                          TotalAmount = x.Select(a => (decimal)a.stxn.ItemRate * (int)a.stxn.Quantity).Sum(),
                                          // VatAmount = x.Select(a => a.gritm.SubTotal).Sum(),
                                          Remarks = "Transaction of INVDispatchToDept Items on date: ",
                                          ReferenceIds = x.Select(a => (int)a.stxn.StockTxnId).Distinct().ToList(), // we are using StockTxnId from StockTransactions as referenceId 
                                      }).ToList();
                if (dispatchToDept.Count > 0)
                {
                    var dispDept = new List<GoodsReceiptModel>();
                    dispDept = dispatchToDept.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        Type = p.Type,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                    }).ToList();
                    dispDept.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in dispDept)
                    {
                        InvGoodRecipt.Add(itm);
                    }
                }

                if (InvGoodRecipt.Count > 0)
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
        //method for billing mapping
        private static List<TransactionModel> MapInventoryTxnData(int fiscalYearId)
        {
            try
            {
                var accTxnFromInv = new List<TransactionModel>();
                for (int i = 0; i < InvGoodRecipt.Count; i++)
                {
                    var record = InvGoodRecipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks + record.CreatedOn;
                    transaction.SectionId = 1;
                    transaction.BillSyncs = record.BillSyncs;
                    transaction.TransactionDate = record.CreatedOn;
                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                    //accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    transaction.TransactionLinks.Add(txnLink);

                    switch (record.TransactionType)
                    {
                        case "INVWriteOff":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVWriteOff").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVWriteOff").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVWriteOffCostofGoodsConsumed")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_CONSUMED_COGC"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVWriteOffInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCashGoodReceipt1":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt1").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCashGoodReceipt1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = "INVCashGoodReceipt1";//itm.TransactionType;
                                        if (ruleRow.Description == "INVCashGoodReceipt1SundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);

                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount; //   (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromInv.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks;
                                    transaction.SectionId = 1;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt2").VoucherId.Value;
                                var transferRule2 = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = "INVCashGoodReceipt2";//itm.TransactionType;
                                        if (ruleRow.Description == "INVCashGoodReceipt2SundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount + (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCreditGoodReceipt":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCreditGoodReceipt").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCreditGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVCreditGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);

                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory Credit GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCreditPaidGoodReceipt":
                            {
                                //not handled on server side
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCreditPaidGoodReceipt").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCreditPaidGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVCreditPaidGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //     accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnToVendorCashGR":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVReturnToVendorCashGR").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVReturnToVendorCashGR").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCashGRInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            // accTxnItems.VendorId = itm.VendorId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDiscountIncome")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRCashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnToVendorCreditGR":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVReturnToVendorCreditGR").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVReturnToVendorCreditGR").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCreditGRInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount - (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            //accTxnItems.VendorId = itm.VendorId;
                                            //  accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping 
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory Credit Return GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVDispatchToDept":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVDispatchToDept").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVDispatchToDept").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVDispatchToDeptCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVDispatchToDeptReturn":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVDispatchToDeptReturn").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVDispatchToDeptReturn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVDispatchToDeptReturnCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCreditGoodReceiptFixedAsset":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCreditGoodReceiptFixedAsset").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCreditGoodReceiptFixedAsset").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory Credit GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetFixedAssets")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.ItemId;
                                                accTxnItemDetail.ReferenceType = "Capital Goods Items";
                                                accTxnItemDetail.Amount = (double)record.TotalAmount;
                                                accTxnItemDetail.Description = "INVCreditGoodReceipt->FixedAssets";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCashGoodReceiptFixedAsset1":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceiptFixedAsset1").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCashGoodReceiptFixedAsset1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = "INVCashGoodReceiptFixedAsset1";//itm.TransactionType;
                                        if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1SundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);

                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = (double)record.TotalAmount;
                                            //accTxnItemDetail.Description = "Inventory GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount; //   (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.ItemId;
                                                accTxnItemDetail.ReferenceType = "Capital Goods";
                                                accTxnItemDetail.Amount = itm.TotalAmount;
                                                accTxnItemDetail.Description = "INVCashGoodReceipt -> FixedAssets";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromInv.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks;
                                    transaction.SectionId = 1;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceiptFixedAsset2").VoucherId.Value;
                                var transferRule2 = RuleMappingList.Find(s => s.Description == "INVCashGoodReceiptFixedAsset2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = "INVCashGoodReceiptFixedAsset2";//itm.TransactionType;
                                        if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2SundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount + (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                    }

                    if (CheckValidTxn(transaction))
                    {
                        accTxnFromInv.Add(transaction);
                    }
                    else
                    {
                        transaction = new TransactionModel();
                    }
                }
                Transaction = accTxnFromInv;
                return Transaction;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //method for get vendor as a ledger
        private static int GetLedgerIdFromVendor(int VendorId, int ledgerGroupId, string VendorName)
        {
            try
            {
                bool ledgerid = false;
                if (vendorLedger?.Count > 0)
                {
                    ledgerid = vendorLedger.Exists(a => a.VendorId == VendorId);
                }
                if (ledgerid == true)
                {
                    return vendorLedger.Find(a => a.VendorId == VendorId).LedgerId;
                }
                else
                {
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = VendorName;
                    tempLed.LedgerReferenceId = VendorId;
                    tempLed.LedgerType = "inventoryvendor";
                    bool flag = true;
                    unavailableLedgerList.ForEach(l =>
                    {
                        if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
                            && l.LedgerName == tempLed.LedgerName && l.LedgerReferenceId == tempLed.LedgerReferenceId)
                        {
                            flag = false;
                        }
                    });
                    if (flag)
                    {
                        unavailableLedgerList.Add(tempLed);
                        AddLedgersFromAcc();

                    }
                    return vendorLedger.Find(a => a.VendorId == VendorId).LedgerId;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region pharmacy get,map and transfer data 
        //method for get pharmacy data 
        private static bool GetPharmacyData(DateTime FromDate, DateTime ToDate)
        {
            try
            {
                DataSet dataset = PhrmTxnItemsDateWise(FromDate, ToDate);
                var PHRMItem = new List<PHRMGoodsReceiptModel>();

                //var PHRMInvoiceTransaction = DataTableToList.ConvertToList<PHRMInvoiceTransactionModel>(dataset.Tables[0]);                         //Table 1
                //var PHRMInvoiceTransactionItems = DataTableToList.ConvertToList<PHRMInvoiceTransactionItemsModel>(dataset.Tables[1]);               //Table 2
                //var PHRMInvoiceReturnItemsModel = DataTableToList.ConvertToList<PHRMInvoiceReturnItemsModel>(dataset.Tables[2]);                         //Table 3
                //var PHRMGoodsReceipt = DataTableToList.ConvertToList<PHRMGoodsReceiptModel>(dataset.Tables[3]);                                     //Table 4
                //var PHRMWriteOff = DataTableToList.ConvertToList<PHRMWriteOffModel>(dataset.Tables[4]);                                             //Table 5
                //var PHRMStockTransactionModel = DataTableToList.ConvertToList<PHRMStockTransactionItemsModel>(dataset.Tables[5]);                   //Table 6

                var PHRMInvoiceTransaction = DataTableToList.ToDynamic(dataset.Tables[0]);
                var PHRMInvoiceTransactionItems = DataTableToList.ToDynamic(dataset.Tables[1]);
                var PHRMInvoiceReturnItemsModel = DataTableToList.ToDynamic(dataset.Tables[2]);
                var PHRMGoodsReceipt = DataTableToList.ToDynamic(dataset.Tables[3]);
                var PHRMWriteOff = DataTableToList.ToDynamic(dataset.Tables[4]);
                var PHRMStockTransactionModel = DataTableToList.ToDynamic(dataset.Tables[5]);
                var grvatdisamount = DataTableToList.ToDynamic(dataset.Tables[6]);

                var CashInvoice = (from invo in PHRMInvoiceTransaction.AsEnumerable()
                                       //where invo.IsTransferredToACC != true
                                       //&& (Convert.ToDateTime(invo.CreateOn).Date >= FromDate && Convert.ToDateTime(invo.CreateOn).Date <= ToDate)
                                   group new { invo } by new
                                   {
                                       invo.PaymentMode,
                                       CreatedOn = Convert.ToDateTime(invo.CreateOn).Date,
                                       //PatientId = invo.PatientId,
                                   } into x
                                   select new
                                   {
                                       x.Key.CreatedOn,
                                       //x.Key.PatientId,
                                       TransactionType = x.Key.PaymentMode == "credit" ? "PHRMCreditInvoice1" : "PHRMCashInvoice1",
                                       Type = x.Key.PaymentMode == "credit" ? "Credit invoice" : "Cash Invoice Sale",
                                       SalesAmount = x.Select(a => (decimal)a.invo.SubTotal).Sum(),
                                       TotalAmount = x.Select(a => (decimal)a.invo.TotalAmount).Sum(),
                                       VATAmount = x.Select(a => (decimal)a.invo.VATAmount).Sum(),
                                       DiscountAmount = x.Select(b => (decimal)b.invo.DiscountAmount).Sum(),
                                       BillSyncs = x.GroupBy(a => new { a.invo.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.invo.TotalAmount).Sum() }).ToList(),
                                       Remarks = "Transaction of Invoice Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                       ReferenceIds = x.Select(a => (int)a.invo.InvoiceId).Distinct().ToList(),
                                       GrAmount = (from gr in grvatdisamount
                                                   join itm in x.Select(a => a.invo.InvoiceId).Distinct().ToList() on gr.InvoiceId equals itm
                                                   select new
                                                   {
                                                       GrVatAmount = (decimal)gr.GrVATAmount,
                                                       //GrDisAmount = (decimal)gr.GrDiscountAmount,
                                                       GrCOGSAmount = (decimal)gr.GrCOGSAmount
                                                   }).ToList(),
                                   }).ToList();
                if (CashInvoice.Count > 0)
                {
                    var invItem = new List<PHRMGoodsReceiptModel>();
                    invItem = CashInvoice.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        GrVATAmount = p.GrAmount.Select(a => a.GrVatAmount).Sum(),
                        GrCOGSAmount = p.GrAmount.Select(a => a.GrCOGSAmount).Sum(),
                        //GrDiscountAmount = p.GrAmount.Select(a => a.GrDisAmount).Sum(),
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId,
                            TotalAmount = (double)x.TotalAmount,
                        }).ToList()
                    }).ToList();
                    invItem.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in invItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }
                var CashInvoiceReturn = (from invo in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                                         join invReturnItm in PHRMInvoiceReturnItemsModel.AsEnumerable()
                                         on invo.InvoiceId equals invReturnItm.InvoiceId
                                         where invo.IsReturn == true
                                         //  (Convert.ToDateTime(invReturnItm.CreatedOn).Date >= FromDate && Convert.ToDateTime(invReturnItm.CreatedOn).Date <= ToDate)
                                         group new { invReturnItm, invo } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(invReturnItm.CreatedOn).Date,
                                             PaymentMode = invo.PaymentMode
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType = x.Key.PaymentMode == "credit" ? "PHRMCreditInvoiceReturn1" : "PHRMCashInvoiceReturn1",
                                             Type = x.Key.PaymentMode == "credit" ? "Credit Invoice Return" : "Cash Invoice Return",
                                             SalesAmount = x.Select(a => (decimal)a.invReturnItm.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => (decimal)a.invReturnItm.TotalAmount).Sum(),
                                             VATAmount = x.Select(c => (((decimal)c.invReturnItm.SubTotal - (((decimal)c.invReturnItm.SubTotal * (Convert.ToDecimal((decimal)c.invReturnItm.DiscountPercentage))) / 100)) * Convert.ToDecimal((decimal)c.invReturnItm.VATPercentage)) / 100).Sum(),
                                             DiscountAmount = x.Select(b => (decimal)b.invReturnItm.SubTotal * (Convert.ToDecimal((decimal)b.invReturnItm.DiscountPercentage / 100))).Sum(),
                                             Remarks = "Transaction of " + x.Key.PaymentMode + " Invoice return Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
                                             GrAmount = (from gr in grvatdisamount
                                                         join itm in x.Select(a => a.invo.InvoiceId).Distinct().ToList() on gr.InvoiceId equals itm
                                                         select new
                                                         {
                                                             GrVatAmount = (decimal)gr.GrVATAmount,
                                                             //GrDisAmount = (decimal)gr.GrDiscountAmount,
                                                             GrCOGSAmount = (decimal)gr.GrCOGSAmount
                                                         }).ToList(),
                                         }).ToList();
                if (CashInvoiceReturn.Count > 0)
                {
                    var invRTItem = new List<PHRMGoodsReceiptModel>();
                    invRTItem = CashInvoiceReturn.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        GrVATAmount = p.GrAmount.Select(a => a.GrVatAmount).Sum(),
                        GrCOGSAmount = p.GrAmount.Select(a => a.GrCOGSAmount).Sum(),
                        //GrDiscountAmount = p.GrAmount.Select(a => a.GrDisAmount).Sum(),
                    }).ToList();
                    invRTItem.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in invRTItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }
                var goodsReceiptItems = (from gr in PHRMGoodsReceipt.AsEnumerable()
                                         where gr.IsCancel == false
                                         // gr.IsTransferredToACC != true 
                                         group new { gr } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(gr.CreatedOn).Date,
                                             SupplierId = (int)gr.SupplierId,
                                             gr.TransactionType,
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType = x.Key.TransactionType == "Credit" ? "PHRMCreditGoodReceipt" : "PHRMCashGoodReceipt",
                                             Type = x.Key.TransactionType == "Credit" ? "Credit Good Receipt" : "Cash Good Receipt",
                                             TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                             SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                             VATAmount = x.Select(b => (decimal)b.gr.VATAmount).Sum(),
                                             DiscountAmount = x.Select(b => (decimal)b.gr.DiscountAmount).Sum(),
                                             Remarks = "Transaction of Goods Receipt Items on date: ", //+ DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => (int)a.gr.GoodReceiptId).Distinct().ToList(),
                                             x.Key.SupplierId,
                                             SupplierName = (from s in pharmacyDbContext.PHRMSupplier where s.SupplierId == x.Key.SupplierId select (string)s.SupplierName).FirstOrDefault()
                                         }).ToList();
                if (goodsReceiptItems.Count > 0)
                {
                    List<PHRMGoodsReceiptModel> GrItem = new List<PHRMGoodsReceiptModel>();
                    GrItem = goodsReceiptItems.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        SupplierName = p.SupplierName,
                        SupplierId = p.SupplierId,
                    }).ToList();
                    GrItem.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in GrItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }
                var gritems = (from gr in pharmacyDbContext.PHRMGoodsReceipt.AsEnumerable()
                               join gritm in pharmacyDbContext.PHRMGoodsReceiptItems.AsEnumerable() on gr.GoodReceiptId equals gritm.GoodReceiptId
                               join supp in pharmacyDbContext.PHRMReturnToSupplierItem.AsEnumerable() on gritm.GoodReceiptItemId equals supp.GoodReceiptItemId
                               group new { supp, gr } by new { supp.ReturnToSupplierId } into x
                               select new { x.Key.ReturnToSupplierId, TransactionType = x.Select(a => a.gr.TransactionType).FirstOrDefault() }).ToList();
                var returnToSupplier = (from ret in pharmacyDbContext.PHRMReturnToSupplier.AsEnumerable()
                                        join supplier in pharmacyDbContext.PHRMSupplier.AsEnumerable()
                                        on ret.SupplierId equals supplier.SupplierId
                                        join gr in gritems
                                        on ret.ReturnToSupplierId equals gr.ReturnToSupplierId
                                        where ret.IsTransferredToACC != true &&
                                                (Convert.ToDateTime(ret.CreatedOn).Date >= FromDate && Convert.ToDateTime(ret.CreatedOn).Date <= ToDate)
                                        group new { ret, gr } by new
                                        {
                                            CreatedOn = Convert.ToDateTime(ret.CreatedOn).Date,
                                            supplier.SupplierId,
                                            supplier.SupplierName,
                                            gr.TransactionType
                                        } into x
                                        select new
                                        {
                                            x.Key.CreatedOn,
                                            TransactionType = x.Key.TransactionType == "Credit" ? "PHRMCreditReturnToSupplier" : "PHRMCashReturnToSupplier",
                                            Type = x.Key.TransactionType == "Credit" ? "Credit Return to Supplier" : "Cash Return to Supplier",
                                            x.Key.SupplierId,
                                            x.Key.SupplierName,
                                            SalesAmount = x.Select(a => a.ret.SubTotal).Sum(),
                                            TotalAmount = x.Select(a => a.ret.TotalAmount).Sum(),
                                            VATAmount = x.Select(b => b.ret.VATAmount).Sum(),
                                            DiscountAmount = x.Select(b => b.ret.DiscountAmount).Sum(),
                                            Remarks = "Transaction of Return To Supplier Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                            ReferenceIds = x.Select(a => a.ret.ReturnToSupplierId).ToList(),
                                        }).ToList();
                if (returnToSupplier.Count > 0)
                {
                    var returnItem = new List<PHRMGoodsReceiptModel>();
                    returnItem = returnToSupplier.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        SupplierName = p.SupplierName,
                        SupplierId = p.SupplierId,
                    }).ToList();
                    returnItem.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in returnItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }

                var writeoff = (from wrOf in PHRMWriteOff.AsEnumerable()
                                    //where wrOf.IsTransferredToACC != true
                                group new { wrOf } by new
                                {
                                    CreatedOn = Convert.ToDateTime(wrOf.CreatedOn).Date

                                } into x
                                select new
                                {
                                    x.Key.CreatedOn,
                                    TransactionType = "PHRMWriteOff",
                                    Type = "Breakage",
                                    TotalAmount = x.Select(a => (decimal)a.wrOf.TotalAmount).Sum(),
                                    SalesAmount = x.Select(a => (decimal)a.wrOf.SubTotal).Sum(),
                                    VATAmount = x.Select(b => (decimal)b.wrOf.VATAmount).Sum(),
                                    DiscountAmount = x.Select(b => (decimal)b.wrOf.DiscountAmount).Sum(),
                                    Remarks = "Transaction of WriteOff Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                    ReferenceIds = x.Select(a => (int)a.wrOf.WriteOffId).Distinct().ToList(),
                                }).ToList();
                if (writeoff.Count > 0)
                {

                    var wffItem = new List<PHRMGoodsReceiptModel>();
                    wffItem = writeoff.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                    }).ToList();
                    wffItem.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in wffItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }

                var dispatchToDept = (from stxn in PHRMStockTransactionModel.AsEnumerable()
                                      where DBNull.Equals(stxn.TransactionType, "wardsupply")

                                      //&& stxn.IsTransferredToACC != true

                                      group new { stxn } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(stxn.CreatedOn).Date
                                      } into x
                                      select new
                                      {
                                          CreatedOn = x.Key.CreatedOn,
                                          TransactionType = "PHRMDispatchToDept",
                                          Type = "PHRMDispatchToDept",
                                          TotalAmount = x.Select(a => (decimal)a.stxn.TotalAmount).Sum(),
                                          SalesAmount = x.Select(a => (decimal)a.stxn.SubTotal).Sum(),
                                          Remarks = "Transaction of PHRMDispatchToDept Items on date: ",
                                          ReferenceIds = x.Select(a => (int)a.stxn.StockTxnItemId).Distinct().ToList(),
                                      }).ToList();
                if (dispatchToDept.Count > 0)
                {
                    var dispatch = dispatchToDept.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                    }).ToList();
                    dispatch.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in dispatch)
                    {
                        PHRMItem.Add(itm);
                    }
                }

                var dispatchToDeptRet = (from stxn in PHRMStockTransactionModel.AsEnumerable()
                                         where DBNull.Equals(stxn.TransactionType, "WardToPharmacy")
                                         //&& stxn.IsTransferredToACC != true
                                         group new { stxn } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(stxn.CreatedOn).Date
                                         } into x
                                         select new
                                         {
                                             CreatedOn = x.Key.CreatedOn,
                                             TransactionType = "PHRMDispatchToDeptReturn",
                                             Type = "PHRMDispatchToDeptReturn",
                                             TotalAmount = x.Select(a => (decimal)a.stxn.TotalAmount).Sum(),
                                             SalesAmount = x.Select(a => (decimal)a.stxn.SubTotal).Sum(),
                                             Remarks = "Transaction of PHRMDispatchToDeptReturn Items on date: ",
                                             ReferenceIds = x.Select(a => (int)a.stxn.StockTxnItemId).Distinct().ToList(),
                                         }).ToList();
                if (dispatchToDeptRet.Count > 0)
                {
                    var dispatchret = dispatchToDeptRet.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                    }).ToList();
                    dispatchret.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in dispatchret)
                    {
                        PHRMItem.Add(itm);
                    }
                }

                PHRMGoodreceipt = PHRMItem;
                if (PHRMGoodreceipt.Count > 0)
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
        //method for pharmacy mapping
        private static List<TransactionModel> MapPharmacyData(int fiscalYearId)
        {
            try
            {
                var accTxnFromPhrm = new List<TransactionModel>();
                for (int i = 0; i < PHRMGoodreceipt.Count; i++)
                {
                    var record = PHRMGoodreceipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks + record.CreatedOn;
                    transaction.SectionId = 3;
                    transaction.TransactionDate = record.CreatedOn;
                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    transaction.TransactionLinks.Add(txnLink);

                    switch (record.TransactionType)
                    {
                        case "PHRMCashInvoice1":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashInvoice1").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCashInvoice1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = "PHRMCashInvoice1";
                                        if (ruleRow.Description == "PHRMCashInvoice1Sales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;//- record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1CashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);


                                        //if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
                                        //{
                                        //    accTxnItems = new TransactionItemModel();
                                        //    accTxnItems.IsTxnDetails = false;
                                        //    accTxnItems.Amount = (double)record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //    accTxnItems.DrCr = ruleRow.DrCr;
                                        //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //    transaction.TransactionItems.Add(accTxnItems);
                                        //}
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashInvoice2").VoucherId.Value;
                                var transferRule2 = RuleMappingList.Find(a => a.Description == "PHRMCashInvoice2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transaction.TransactionType = "PHRMCashInvoice2";//record.TransactionType;
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoice2Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        //ajay 26 Jun
                                        //if (ruleRow.Description == "PHRMCashInvoice2CashInHand")
                                        //{
                                        //    accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;//+ record.VATAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}
                                        //else if (ruleRow.Description == "PHRMCashInvoice2SundryDebtors")
                                        //{
                                        //    accTxnItems.Amount = (double)record.SalesAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //    accTxnItems.IsTxnDetails = true; //Adding ItemDetails with PatientId
                                        //    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                        //    record.BillSyncs.ForEach(a =>
                                        //    {
                                        //        TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                        //        accTxnItemDetail.ReferenceType = "PHRMPatient";
                                        //        accTxnItemDetail.ReferenceId = a.PatientId;
                                        //        accTxnItemDetail.Amount = a.TotalAmount;
                                        //        accTxnItemDetail.Description = "Pharmacy Cash Invoice Sale";
                                        //        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        //    });
                                        //}
                                        //else if (ruleRow.Description == "PHRMCashInvoice2AdministrationExpenses")
                                        //{
                                        //    accTxnItems.Amount = (double)record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCreditInvoice1":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoice1").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoice1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transaction.TransactionType = "PHRMCreditInvoice1";
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoice1Sales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoice2").VoucherId;
                                var transferRule2 = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoice2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transaction.TransactionType = "PHRMCreditInvoice2";//record.TransactionType;
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoice2Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashGoodReceipt":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashGoodReceipt").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCashGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMCashGoodReceiptSundryCreditors" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId From Ledger-Supplier mapping
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.SupplierId = record.SupplierId;
                                            ////Adding Transaction details with SupplierId
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            ////accTxnItemDetail.SupplierId = record.SupplierId;
                                            //accTxnItemDetail.ReferenceId = record.SupplierId;
                                            //accTxnItemDetail.ReferenceType = "Supplier";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Pharmacy GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount; //   (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.TotalAmount - record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double?)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCreditGoodReceipt":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditGoodReceipt").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCreditGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            //getting LedgerId From Ledger-Supplier mapping
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            //accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                            //accTxnItems.SupplierId = record.SupplierId;
                                            ////Adding Transaction details with SupplierId
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            ////accTxnItemDetail.SupplierId = record.SupplierId;
                                            //accTxnItemDetail.ReferenceId = record.SupplierId;
                                            //accTxnItemDetail.ReferenceType = "Supplier";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Pharmacy credit GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount; //   (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCreditPaidGoodReceipt":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditPaidGoodReceipt").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCreditPaidGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMCreditPaidGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount - (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double?)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashInvoiceReturn1":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashInvoiceReturn1").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCashInvoiceReturn1").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoiceReturn1Sales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            transaction.TransactionType = record.TransactionType;
                                            // record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1CashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.TradeDiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashInvoiceReturn2").VoucherId;
                                var transferRule2 = RuleMappingList.Find(a => a.Description == "PHRMCashInvoiceReturn2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = "PHRMCashInvoiceReturn2";//record.TransactionType;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoiceReturn2Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCreditInvoiceReturn1":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoiceReturn1").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoiceReturn1").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoiceReturn1Sales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            transaction.TransactionType = record.TransactionType;
                                            // record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoiceReturn2").VoucherId;
                                var transferRule2 = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoiceReturn2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transaction.TransactionType = "PHRMCreditInvoiceReturn2";
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoiceReturn2Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashReturnToSupplier":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashReturnToSupplier").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCashReturnToSupplier").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashReturnToSupplierInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                            // accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierCashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCreditReturnToSupplier":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditReturnToSupplier").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCreditReturnToSupplier").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditReturnToSupplierInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMWriteOff":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMWriteOff").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMWriteOff").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMWriteOffInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMWriteOffCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMDispatchToDept":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMDispatchToDept").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMDispatchToDept").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMDispatchToDeptCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMDispatchToDeptReturn":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMDispatchToDeptReturn").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMDispatchToDeptReturn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMDispatchToDeptReturnCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                    }
                    if (CheckValidTxn(transaction))
                    {
                        accTxnFromPhrm.Add(transaction);
                    }
                    else
                    {
                        transaction = new TransactionModel();
                    }
                }

                Transaction = accTxnFromPhrm;
                return Transaction;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //method for get vendor as a ledgerrecord.SupplierId, ruleRow.LedgerGroupId, record.SupplierName
        private static int GetLedgerIdFromSupplier(int? supplierid, int ledgerGroupId, string SupplierName)
        {
            try
            {
                bool ledgerid = false;
                if (supplierLedger.Count > 0)
                {
                    ledgerid = supplierLedger.Exists(a => a.SupplierId == supplierid);
                }
                if (ledgerid == true)
                {
                    return supplierLedger.Find(a => a.SupplierId == supplierid).LedgerId;
                }
                else
                {

                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = SupplierName;
                    tempLed.LedgerReferenceId = supplierid;
                    tempLed.LedgerType = "pharmacysupplier";
                    var flag = true;
                    unavailableLedgerList.ForEach(l =>
                    {
                        if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
                            && l.LedgerName == tempLed.LedgerName && l.LedgerReferenceId == tempLed.LedgerReferenceId)
                        {
                            flag = false;
                        }
                    });
                    if (flag)
                    {
                        unavailableLedgerList.Add(tempLed);
                        AddLedgersFromAcc();
                    }
                    return supplierLedger.Find(a => a.SupplierId == supplierid).LedgerId;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Get phrm TxnItems datewise for transfer to accounting 
        public static DataSet PhrmTxnItemsDateWise(DateTime FromDate, DateTime ToDate)
        {
            //  AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@FromDate", FromDate),
                    new SqlParameter("@ToDate", ToDate)
                };
            DataSet phrmTxn = DALFunctions.GetDatasetFromStoredProc("SP_ACC_GetPharmacyTransactions", paramList, accountingDBContext);
            return phrmTxn;
        }
        #endregion

        //NBB-if we are using this server side transfering from application then it's return current user employeeid 
        //but when we create service using this code then we need to save employeeid in config file and get it from there because that time session not available
        //public static int GetCurrentUserEmpId()
        //{
        //    try {
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //        return currentUser.EmployeeId;
        //    }
        //    catch (Exception ex) {
        //        return 1;  //now it's hardcoded for resolve error
        //    }

        //}

        //->Constructor -> Get master data -> callSectionwise()
        //->CallSectionWise -> call to perticular section
    }
}
