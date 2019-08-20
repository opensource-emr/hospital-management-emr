using DanpheEMR.CommonTypes;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DanpheEMR.ServerModel;
using System.Data.Entity;
using System.Collections;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Security;
using DanpheEMR.Core.Caching;
using DanpheEMR.Utilities;

namespace DanpheEMR.Controllers.TransferData
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
        static private FiscalYearModel FiscalYear = new FiscalYearModel();
        static private List<TransactionModel> Transaction = new List<TransactionModel>();
        static private List<SyncBillingAccountingModel> billingSyncList = new List<SyncBillingAccountingModel>();
        static private List<VendorMasterModel> vendorLedger = new List<VendorMasterModel>();
        static private List<PHRMSupplierModel> supplierLedger = new List<PHRMSupplierModel>();
        static private List<GoodsReceiptModel> InvGoodRecipt = new List<GoodsReceiptModel>();
        static private List<PHRMGoodsReceiptModel> PHRMGoodreceipt = new List<PHRMGoodsReceiptModel>();
        static int EmployeeId;



        DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
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
            GetMapAndTransferDataSectionWise();
        }

        #region Mster data initialization 
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
                                  where fsc.IsActive == true
                                  select fsc).FirstOrDefault();
            FiscalYear = fiscalyearList;
            //get Account transfer rules
            var AccTransferRules = (from grp in accountingDBContext.GroupMapping
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
        }
        #endregion


        #region common methods for all section like billing, inventory, pharmacy, etc
        public bool GetMapAndTransferDataSectionWise()
        {
            //GetMasterData();
            //Inventory Section
            bool isInv = GetInventoryTxnData();
            if (isInv)
            {
                MapInventoryTxnData();
                PostTxnData();
            }

            //Billing Section
            bool isbilling = GetBillingTxnData();
            if (isbilling)
            {
                MapBillingTxnData();
                PostTxnData();
            }

            //pharmacy section
            //bool isPhrm = GetPharmacyData();
            //if (isPhrm)
            //{
            //    MapPharmacyData();
            //    PostTxnData();
            //}
            Clear();
            if (isbilling == false
                //&& isPhrm == false
                && isInv == false)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        // method for ledger name for mapping to rules
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
                    int ledger = LedgerList.Find(x => x.LedgerName == ledgerNameString).LedgerId;            //   this.ledgerList.filter(x => x.LedgerName == ledgerNameString)[0];
                    if (ledger > 0)
                    {
                        return ledger;
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

        #region coomon methods for post data
        //method for update transferred records
        private static bool PostTxnData()
        {
            try
            {
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
                throw ex;
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
            }
            catch (Exception ex)
            {
                throw ex;
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
        private static bool GetBillingTxnData()
        {
            try
            {
                var Billtxn = (from syncItm in accountingDBContext.SyncBillingAccounting
                               where syncItm.IsTransferedToAcc != true
                               group new { syncItm } by new
                               {
                                   syncItm.TransactionType,
                                   TransactionDate = DbFunctions.TruncateTime(syncItm.TransactionDate),
                                   syncItm.IncomeLedgerName,
                                   PaymentMode = (syncItm.PaymentMode == "card" || syncItm.PaymentMode == "cheque") ? "bank" : syncItm.PaymentMode
                               } into x
                               select new
                               {
                                   x.Key.TransactionDate,
                                   x.Key.IncomeLedgerName,
                                   x.Key.TransactionType,
                                   x.Key.PaymentMode,
                                   SalesAmount = x.Sum(a => a.syncItm.SubTotal),
                                   TaxAmount = x.Sum(a => a.syncItm.TaxAmount),
                                   DiscountAmount = x.Sum(a => a.syncItm.DiscountAmount),
                                   SettlementDiscountAmount = x.Sum(a => a.syncItm.SettlementDiscountAmount),
                                   TotalAmount = x.Key.TransactionType == "CreditBillPaid" ? x.Sum(a => a.syncItm.TotalAmount) - x.Sum(a => a.syncItm.SettlementDiscountAmount) : x.Sum(a => a.syncItm.TotalAmount), //in case of deposit add/deduct
                                   BillTxnItemIds = x.Select(a => a.syncItm.ReferenceId).ToList(),
                                   BillSyncs = x.Select(a => new { a.syncItm.BillingAccountingSyncId, a.syncItm.PatientId, a.syncItm.TotalAmount, a.syncItm.CreatedBy, a.syncItm.ReferenceModelName }).ToList(),
                                   //     Remarks ="Transaction for" + x.Key.IncomeLedgerName + " income ledger" + x.Key.TransactionType,
                                   Remarks = "Transaction for " + x.Key.IncomeLedgerName + " income ledger : " + x.Key.TransactionType,
                               }).OrderBy(s => s.TransactionDate).ThenBy(s => s.IncomeLedgerName).ToList();
                if (Billtxn.Count > 0)
                {
                    var Syncbill = new List<SyncBillingAccountingModel>();
                    Syncbill = Billtxn.Select(p => new SyncBillingAccountingModel()
                    {
                        TransactionDate = p.TransactionDate,
                        IncomeLedgerName = p.IncomeLedgerName,
                        TransactionType = p.TransactionType,
                        PaymentMode = p.PaymentMode,
                        SalesAmount = p.SalesAmount,
                        TaxAmount = p.TaxAmount,
                        SettlementDiscountAmount = p.SettlementDiscountAmount,
                        TotalAmount = p.TotalAmount,
                        BillTxnItemIds = p.BillTxnItemIds,
                        Remarks = p.Remarks,
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
        private static List<TransactionModel> MapBillingTxnData()
        {
            try
            {
                var accTxnFromBilling = new List<TransactionModel>();
                for (int i = 0; i < billingSyncList.Count; i++)
                {
                    var record = billingSyncList[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
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
                                            ledId = GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
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
                                            ledId = GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
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
                                            ledId = GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
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
                                        else if (ruleRow.Description == "CashBillReturnAdministrationExpenses")
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
                                            ledId = GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
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
        #endregion

        #region Inventory get,map and transfer data 
        //method for get inventory data 
        private static bool GetInventoryTxnData()
        {
            try
            {
                var goodsReceiptItems = (from gr in inventoryDbContext.GoodsReceipts
                                         join vendor in inventoryDbContext.Vendors on gr.VendorId equals vendor.VendorId
                                         where gr.IsTransferredToACC != true
                                         group new { gr, vendor } by new
                                         {
                                             CreatedOn = DbFunctions.TruncateTime(gr.CreatedOn),
                                             PaymentMode = gr.PaymentMode,
                                             VendorId = vendor.VendorId,
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             x.Key.VendorId,
                                             VendorName = x.Select(a => a.vendor.VendorName).FirstOrDefault(),
                                             Type = x.Key.PaymentMode == "Cash" ? "Goods Receipt Cash" : "Credit Goods Receipt",
                                             TransactionType = x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt",
                                             SalesAmount = x.Select(a => a.gr.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => a.gr.TotalAmount).Sum(),
                                             VATAmount = x.Select(b => b.gr.VATTotal).Sum(),
                                             DiscountAmount = x.Select(c => c.gr.DiscountAmount).Sum(),
                                             Remarks = "Inventory Transaction entries to Accounting for  " + (x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt ") + "on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => a.gr.GoodsReceiptID).Distinct().ToList(),
                                         }).ToList();
                var writeOffItems = (from wf in inventoryDbContext.WriteOffItems
                                     where wf.IsTransferredToACC != true
                                     group new { wf } by new
                                     {
                                         CreatedOn = DbFunctions.TruncateTime(wf.CreatedOn),

                                     } into x
                                     select new
                                     {
                                         x.Key.CreatedOn,
                                         Type = "WriteOff",
                                         TransactionType = "INVWriteOff",
                                         TotalAmount = x.Select(a => a.wf.TotalAmount).Sum(),
                                         VATAmount = 0, //x.Select(b => b.gr.VATAmount).Sum(),
                                         Remarks = "Inventory Transaction entries to Accounting for write Off Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                         ReferenceIds = x.Select(a => a.wf.WriteOffId).Distinct().ToList(),
                                     }).ToList();
                var returnToVender = (from ret in inventoryDbContext.ReturnToVendorItems
                                      join vendor in inventoryDbContext.Vendors
                                      on ret.VendorId equals vendor.VendorId
                                      join goodreceipt in inventoryDbContext.GoodsReceipts on ret.GoodsReceiptId equals goodreceipt.GoodsReceiptID
                                      where ret.IsTransferredToACC != true
                                      group new { ret, vendor, goodreceipt } by new
                                      {
                                          CreatedOn = DbFunctions.TruncateTime(ret.CreatedOn),
                                          VendorId = ret.VendorId,
                                          goodreceipt.PaymentMode
                                      } into x
                                      select new
                                      {
                                          x.Key.CreatedOn,
                                          x.Key.VendorId,
                                          VendorName = x.Select(a => a.vendor.VendorName).FirstOrDefault(),
                                          Type = x.Key.PaymentMode == "Cash" ? "Return To Vender Cash" : "Return To Vender Credit",
                                          //  Type = "Return To Vender",
                                          TransactionType = x.Key.PaymentMode == "Cash" ? "INVReturnToVendorCashGR" : "INVReturnToVendorCreditGR",
                                          TotalAmount = x.Select(a => a.ret.TotalAmount).Sum(),
                                          VATAmount = x.Select(b => b.ret.VAT).Sum(),
                                          Remarks = "Inventory Transaction entries to Accounting for Return to vendor Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                          ReferenceIds = x.Select(a => a.ret.ReturnToVendorItemId).Distinct().ToList(),
                                      }).ToList();
                if (goodsReceiptItems.Count > 0 || writeOffItems.Count > 0 || returnToVender.Count > 0)
                {
                    var invItem = new List<GoodsReceiptModel>();
                    invItem = goodsReceiptItems.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        VendorId = p.VendorId,
                        VendorName = p.VendorName,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type
                    }).ToList();
                    invItem.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    // InvGoodRecipt = invItem;
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
                        invItem.Add(itm);
                    }

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
                        invItem.Add(itm);
                    }
                    InvGoodRecipt = invItem;
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
        private static List<TransactionModel> MapInventoryTxnData()
        {
            try
            {
                var accTxnFromInv = new List<TransactionModel>();
                for (int i = 0; i < InvGoodRecipt.Count; i++)
                {
                    var record = InvGoodRecipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
                    transaction.Remarks = record.Remarks + record.CreatedOn;
                    transaction.SectionId = 1;
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
                                        if (ruleRow.Description == "INVWriteOffCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            //Adding Item Details With VendorId
                                            //let accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = itm.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = itm.TotalAmount;
                                            //accTxnItemDetail.Description = "Inventory WriteOff COGS";
                                            //accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
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
                                            accTxnItems.Amount = (double)record.TotalAmount + (double)record.VATAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                            accTxnItems.IsTxnDetails = true;
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            accTxnItemDetail.ReferenceId = record.VendorId;
                                            accTxnItemDetail.ReferenceType = "Vendor";
                                            accTxnItemDetail.Amount = (double)record.SalesAmount;
                                            accTxnItemDetail.Description = "Inventory GoodReceipt";
                                            accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1Inventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
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
                                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
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
                                            accTxnItems.Amount = (double)record.SalesAmount + (double)record.VATAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
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
                                            accTxnItems.Amount = (double)record.TotalAmount + (double)record.VATAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
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
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
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
                                            accTxnItems.Amount = (double)record.TotalAmount + (double)record.VATAmount;
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
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            //accTxnItems.VendorId = itm.VendorId;
                                            //  accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount + (double)record.VATAmount;
                                            //getting LedgerId from LedgerMapping 
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);
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
        private static bool GetPharmacyData()
        {
            try
            {
                var PHRMItem = new List<PHRMGoodsReceiptModel>();
                var CashInvoice = (from invo in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                                   where invo.IsTransferredToACC != true
                                   group new { invo } by new
                                   {
                                       CreatedOn = Convert.ToDateTime(invo.CreateOn).Date,
                                       //PatientId = invo.PatientId,
                                   } into x
                                   select new
                                   {
                                       x.Key.CreatedOn,
                                       //x.Key.PatientId,
                                       TransactionType = "PHRMCashInvoice1",
                                       Type = "Cash Invoice Sale",
                                       SalesAmount = x.Select(a => a.invo.SubTotal).Sum(),
                                       TotalAmount = x.Select(a => a.invo.TotalAmount).Sum(),
                                       VATAmount = x.Select(a => a.invo.VATAmount).Sum(),
                                       DiscountAmount = x.Select(b => b.invo.DiscountAmount).Sum(),
                                       BillSyncs = x.GroupBy(a => new { a.invo.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => b.invo.TotalAmount).Sum() }).ToList(),
                                       Remarks = "Transaction of Invoice Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                       ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
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
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId.Value,
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
                                         join invReturnItm in pharmacyDbContext.PHRMInvoiceReturnItemsModel
                                         on invo.InvoiceId equals invReturnItm.InvoiceId
                                         where invReturnItm.IsTransferredToACC != true
                                         group new { invReturnItm, invo } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(invReturnItm.CreatedOn).Date
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType = "PHRMCashInvoiceReturn",
                                             Type = "Cash Invoice Return",
                                             SalesAmount = x.Select(a => a.invReturnItm.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => a.invReturnItm.TotalAmount).Sum(),
                                             VATAmount = x.Select(c => ((c.invReturnItm.SubTotal - ((c.invReturnItm.SubTotal * (Convert.ToDecimal(c.invReturnItm.DiscountPercentage))) / 100)) * Convert.ToDecimal(c.invReturnItm.VATPercentage)) / 100).Sum(),
                                             DiscountAmount = x.Select(b => b.invReturnItm.SubTotal * (Convert.ToDecimal(b.invReturnItm.DiscountPercentage / 100))).Sum(),
                                             Remarks = "Transaction of Invoice return Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
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
                    }).ToList();
                    invRTItem.ForEach(a =>
                    {
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in invRTItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }
                var goodsReceiptItems = (from gr in pharmacyDbContext.PHRMGoodsReceipt
                                         where gr.IsTransferredToACC != true
                                         group new { gr } by new
                                         {
                                             CreatedOn = DbFunctions.TruncateTime(gr.CreatedOn),
                                             gr.SupplierId,
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType = "PHRMCashGoodReceipt1",
                                             Type = "Cash Good Receipt",
                                             TotalAmount = x.Select(a => a.gr.TotalAmount).Sum(),
                                             SalesAmount = x.Select(a => a.gr.SubTotal).Sum(),
                                             VATAmount = x.Select(b => b.gr.VATAmount).Sum(),
                                             DiscountAmount = x.Select(b => b.gr.DiscountAmount).Sum(),
                                             Remarks = "Transaction of Goods Receipt Items on date: ", //+ DbFunctions.TruncateTime(x.Key.CreatedOn),
                                             ReferenceIds = x.Select(a => a.gr.GoodReceiptId).Distinct().ToList(),
                                             x.Key.SupplierId,
                                             SupplierName = (from s in pharmacyDbContext.PHRMSupplier where s.SupplierId == x.Key.SupplierId select s.SupplierName).FirstOrDefault()
                                         }).ToList();
                if (goodsReceiptItems.Count > 0)
                {
                    var GrItem = new List<PHRMGoodsReceiptModel>();
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
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in GrItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }
                var returnToSupplier = (from ret in pharmacyDbContext.PHRMReturnToSupplier
                                        join supplier in pharmacyDbContext.PHRMSupplier
                                        on ret.SupplierId equals supplier.SupplierId
                                        where ret.IsTransferredToACC != true
                                        group new { ret } by new
                                        {
                                            CreatedOn = DbFunctions.TruncateTime(ret.CreatedOn),
                                            supplier.SupplierId,
                                            supplier.SupplierName

                                        } into x
                                        select new
                                        {
                                            x.Key.CreatedOn,
                                            TransactionType = "PHRMCashReturnToSupplier",
                                            Type = "Return to Supplier",
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
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in returnItem)
                    {
                        PHRMItem.Add(itm);
                    }
                }

                var writeoff = (from wrOf in pharmacyDbContext.PHRMWriteOff
                                where wrOf.IsTransferredToACC != true
                                group new { wrOf } by new
                                {
                                    CreatedOn = DbFunctions.TruncateTime(wrOf.CreatedOn)

                                } into x
                                select new
                                {
                                    x.Key.CreatedOn,
                                    TransactionType = "PHRMWriteOff",
                                    Type = "Breakage",
                                    TotalAmount = x.Select(a => a.wrOf.TotalAmount).Sum(),
                                    SalesAmount = x.Select(a => a.wrOf.SubTotal).Sum(),
                                    VATAmount = x.Select(b => b.wrOf.VATAmount).Sum(),
                                    DiscountAmount = x.Select(b => b.wrOf.DiscountAmount).Sum(),
                                    Remarks = "Transaction of WriteOff Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                                    ReferenceIds = x.Select(a => a.wrOf.WriteOffId).Distinct().ToList(),
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
                        a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });
                    foreach (var itm in wffItem)
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
        private static List<TransactionModel> MapPharmacyData()
        {
            try
            {
                var accTxnFromPhrm = new List<TransactionModel>();
                for (int i = 0; i < PHRMGoodreceipt.Count; i++)
                {
                    var record = PHRMGoodreceipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
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
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashInvoice1").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCashInvoice1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoice1Sales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;//- record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1SundryDebtors")
                                        {
                                            accTxnItems.Amount = ((double)record.SalesAmount - (double)record.DiscountAmount) + (double)record.VATAmount;//+ record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            transaction.TransactionType = "PHRMCashInvoice1";//record.TransactionType;
                                                                                             //Adding Item Details With PatientId

                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            record.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                  accTxnItemDetail.ReferenceId = r.PatientId;
                                               // accTxnItemDetail.ReferenceId = r.CreatedBy;
                                                accTxnItemDetail.ReferenceType = "PHRMPatient";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "Pharmacy Cash Invoice Sale";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
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
                                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
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
                                        if (ruleRow.Description == "PHRMCashInvoice2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;//+ record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice2SundryDebtors")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            accTxnItems.IsTxnDetails = true; //Adding ItemDetails with PatientId
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            record.BillSyncs.ForEach(a =>
                                            {
                                                TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceType = "PHRMPatient";
                                                accTxnItemDetail.ReferenceId = a.PatientId;
                                                accTxnItemDetail.Amount = a.TotalAmount;
                                                accTxnItemDetail.Description = "Pharmacy Cash Invoice Sale";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice2AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashInvoiceReturn":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashInvoiceReturn").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCashInvoiceReturn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoiceReturnSales")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            transaction.TransactionType = record.TransactionType;
                                            // record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturnCashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturnDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashReturnToSupplier":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashReturnToSupplier").VoucherId.Value;
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
                                            accTxnItems.Amount = (double)record.SalesAmount;
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
                                            accTxnItems.Amount = (double)record.VATAmount;
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
                        case "PHRMCashGoodReceipt1":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashGoodReceipt1").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCashGoodReceipt1").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashGoodReceipt1SundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount + (double)record.VATAmount;
                                            //getting LedgerId From Ledger-Supplier mapping
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = "PHRMCashGoodReceipt1";//record.TransactionType;
                                            accTxnItems.SupplierId = record.SupplierId;
                                            //Adding Transaction details with SupplierId
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.SupplierId = record.SupplierId;
                                            accTxnItemDetail.ReferenceId = record.SupplierId;
                                            accTxnItemDetail.ReferenceType = "Supplier";
                                            accTxnItemDetail.Amount = (double)record.SalesAmount;
                                            accTxnItemDetail.Description = "Pharmacy GoodReceipt";
                                            accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceipt1Inventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceipt1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
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
                                    transaction.FiscalyearId = FiscalYear.FiscalYearId;
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



                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMCashGoodReceipt2").VoucherId.Value;
                                var transferRule2 = RuleMappingList.Find(a => a.Description == "PHRMCashGoodReceipt2").MappingDetail;
                                if (transferRule2.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule2.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashGoodReceipt2SundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount; //record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
                                            //accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = "PHRMCashGoodReceipt2";//record.TransactionType;
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceipt2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.TotalAmount - record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceipt2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceipt2DiscountIncome")
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
                        case "PHRMWriteOff":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "PHRMWriteOff").VoucherId.Value;
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
                if (vendorLedger?.Count > 0)
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
