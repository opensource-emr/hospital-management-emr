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
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using DanpheEMR.ServerModel.IncentiveModels;
using Newtonsoft.Json.Converters;
using System.Runtime.InteropServices;
using DanpheEMR.Core;
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.ServerModel.AccountingModels;
using System.Net.Http.Headers;


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
        static private List<HospitalModel> ACCHospital = new List<HospitalModel>();
        static private List<AccSectionModel> SectionList = new List<AccSectionModel>();
        static private List<LedgerMappingModel> BillingCreditOrganizations = new List<LedgerMappingModel>();
        static private List<ConsultantIncentiveModel> INCTVConsultantIncentive = new List<ConsultantIncentiveModel>();
        static private List<EmployeeModel> EmployeeLedger = new List<EmployeeModel>();
        static private List<ItemSubCategoryMasterModel> InventorySubCategory = new List<ItemSubCategoryMasterModel>();
        static int EmployeeId;
        static private bool IsVatRegistered;
        ///for check true of false in maping tbl
        static private bool IsCustomVoucher;



        //   DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        private static AccountingDbContext accountingDBContext;
        private static InventoryDbContext inventoryDbContext;
        public static PharmacyDbContext pharmacyDbContext;
        public static JObject InvetoryIntegrationParameters;
        public AccountingTransferData(string connString, int employeeId, int currHospitalId)
        {
            EmployeeId = employeeId;
            accountingDBContext = new AccountingDbContext(connString);
            inventoryDbContext = new InventoryDbContext(connString);
            pharmacyDbContext = new PharmacyDbContext(connString);
            GetMasterData(currHospitalId);
            // GetMapAndTransferDataSectionWise();
        }

        #region Master data initialization 
        public static void GetMasterData(int currHospitalId)
        {
            // Get Inventory Integration parameters.
            var InvparameterValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Inventory" && a.ParameterName == "InventoryACCIntegration").FirstOrDefault().ParameterValue;
            InvetoryIntegrationParameters = JsonConvert.DeserializeObject<JObject>(InvparameterValue);

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

            // Get billing credit organization                     
            var billingCreditOrganizations = (from ledM in accountingDBContext.LedgerMappings
                                              join credOrg in accountingDBContext.BillCreditOrganizations on ledM.ReferenceId equals credOrg.OrganizationId
                                              join led in accountingDBContext.Ledgers on ledM.LedgerId equals led.LedgerId
                                              where ledM.LedgerType == "creditorganization" && led.IsActive == true
                                              select new
                                              {
                                                  credOrg.OrganizationId,
                                                  ledM.LedgerId,
                                                  ledM.LedgerType,
                                                  LedgerName = credOrg.OrganizationName
                                              }).ToList();

            BillingCreditOrganizations = billingCreditOrganizations.Select(p => new LedgerMappingModel()
            {
                ReferenceId = p.OrganizationId,
                LedgerName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
            }).ToList();
            //Get Inventory sub category list here
            var InvSubCategories = (from ledM in accountingDBContext.LedgerMappings
                                    join led in accountingDBContext.Ledgers
                                    on ledM.LedgerId equals led.LedgerId
                                    where ledM.LedgerType == "inventorysubcategory" && led.IsActive == true
                                    select new
                                    {
                                        ledM.ReferenceId,
                                        ledM.LedgerId,
                                        ledM.LedgerType,
                                        LedName = led.LedgerName
                                    }).ToList();
            InventorySubCategory = InvSubCategories.Select(p => new ItemSubCategoryMasterModel()
            {
                SubCategoryId = p.ReferenceId,
                SubCategoryName = p.LedName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType
            }).ToList();

            // Get consultant ledgers                    
            var consultantLedgers = (from ledM in accountingDBContext.LedgerMappings
                                     join emp in accountingDBContext.Emmployees on ledM.ReferenceId equals emp.EmployeeId
                                     join led in accountingDBContext.Ledgers on ledM.LedgerId equals led.LedgerId
                                     where ledM.LedgerType == "consultant" && led.IsActive == true
                                     select new
                                     {
                                         emp.EmployeeId,
                                         ledM.LedgerId,
                                         ledM.LedgerType,
                                         LedgerName = emp.FullName
                                     }).ToList();

            EmployeeLedger = consultantLedgers.Select(p => new EmployeeModel()
            {
                EmployeeId = p.EmployeeId,
                FullName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
            }).ToList();

            //get ledger group list
            var ledgerGrouplist = (from ledgrp in accountingDBContext.LedgerGroups
                                   where ledgrp.HospitalId == currHospitalId && ledgrp.IsActive == true
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

            var activeHosp = accountingDBContext.Hospitals
                .Where(a => a.IsActive == true)
                .FirstOrDefault();
            if (activeHosp.HospitalId > 0)
            {
                ACCHospital.Add(activeHosp);
            }

            // Get Section list for accounting billing, pharmacy, inventory
            //var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SectionList").FirstOrDefault().ParameterValue;
            //if (paraValue != "")
            //{
            //    JObject jObject = JObject.Parse(paraValue);
            //    var secList = jObject.SelectToken("SectionList").ToList();
            //    SectionList = (secList != null) ? JsonConvert.DeserializeObject<List<AccSectionModel>>(JsonConvert.SerializeObject(secList)) : SectionList; ;
            //}

            SectionList = accountingDBContext.Section.Where(s => s.IsActive == true).ToList();
            //get Account transfer rules
            var ruleList = (from hosprulemap in accountingDBContext.HospitalTransferRuleMappings
                            where hosprulemap.HospitalId == activeHosp.HospitalId && hosprulemap.IsActive == true
                            select hosprulemap.TransferRuleId).ToList();
            var ledgerGroups = accountingDBContext.LedgerGroups.AsEnumerable().ToList();
            var mapdetails = accountingDBContext.MappingDetail.AsEnumerable().ToList();
            var AccTransferRules = (from grp in accountingDBContext.GroupMapping.AsEnumerable()
                                    join ruleid in ruleList.AsEnumerable() on grp.GroupMappingId equals ruleid
                                    select new
                                    {
                                        grp.GroupMappingId,
                                        grp.Section,
                                        grp.Description,
                                        grp.VoucherId,
                                        //add CustomVoucherid
                                        grp.CustomVoucherId,
                                        MappingDetail = (from mapDetail in mapdetails
                                                         where grp.GroupMappingId == mapDetail.GroupMappingId
                                                         select new
                                                         {
                                                             mapDetail.AccountingMappingDetailId,
                                                             mapDetail.LedgerGroupId,
                                                             LedgerGroupName = (mapDetail.LedgerGroupId != null) ? (ledgerGroups.Where(ld => ld.LedgerGroupId == mapDetail.LedgerGroupId).Select(l => l.LedgerGroupName).FirstOrDefault()) : null,
                                                             Name = (mapDetail.LedgerGroupId != null) ? (ledgerGroups.Where(ld => ld.LedgerGroupId == mapDetail.LedgerGroupId).Select(l => l.Name).FirstOrDefault()) : null,
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
                //add CustomVoucherid
                CustomVoucherId = p.CustomVoucherId,
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
                            join led in accountingDBContext.Ledgers on m.LedgerId equals led.LedgerId
                            where m.LedgerType == "pharmacysupplier" && led.IsActive == true
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
                          join led in accountingDBContext.Ledgers on m.LedgerId equals led.LedgerId
                          where m.LedgerType == "inventoryvendor" && led.IsActive == true
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
            //--custome voucher means , deposit add and deposit return saving as sales voucher 
            //This is requirement by Hams . But in real accounting deposit add, deposit return goes into receipt voucher, payment voucher
            var customVoucherFlag = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "CustomSaleVoucher").Select(a => a.ParameterValue).FirstOrDefault();
            IsCustomVoucher = (customVoucherFlag == "true") ? true : false;
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
        public static List<TransactionModel> GetMapAndTransferDataSectionWise(int sectionId, DateTime SelectedDate, int FiscalYearId, int currHospitalId)
        {
            //Inventory Section
            List<TransactionModel> txn = new List<TransactionModel>();
            bool isInv = false;
            bool isbilling = false;
            bool isPhrm = false;
            //var fisyearid = (from f in FiscalYearList
            //                 where f.StartDate <= FromDate && ToDate <= f.EndDate
            //                 select f.FiscalYearId).FirstOrDefault();

            if (sectionId == 1)
            {
                isInv = GetInventoryTxnData(SelectedDate, currHospitalId);
                if (isInv)
                {
                    txn = MapInventoryTxnData(FiscalYearId, currHospitalId);
                }
            }

            //Billing Section
            else if (sectionId == 2)
            {
                isbilling = GetBillingTxnData(SelectedDate, currHospitalId);
                if (isbilling)
                {
                    txn = MapBillingTxnData(FiscalYearId, currHospitalId);
                }
            }
            //Incetive Section
            else if (sectionId == 5)
            {
                isbilling = GetInectiveTxnData(SelectedDate, currHospitalId);
                if (isbilling)
                {
                    txn = MapIncentiveData(FiscalYearId, currHospitalId);
                }
            }
            //pharmacy section
            else
            {
                isPhrm = GetPharmacyData(SelectedDate, currHospitalId);
                if (isPhrm)
                {
                    txn = MapPharmacyData(FiscalYearId, currHospitalId);
                }
            }

            return txn;
        }

        //  method for ledger name for mapping to rules
        private static string GetLedgerName(string ledgername, int currHospitalId)
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
        private static int GetLedgerId(string ledgerNameString, int ledgerGroupId, int? ledgerReferenceId, int currHospitalId)
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
                        tempLed.IsMapLedger = true;
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
                        //var ledgerBalance = LedgerAddUpdateInBalanceHisotry(tempLed, accountingDBContext, false, currHospitalId);

                        //if (ledgerBalance)
                        //{
                        //    return 0;
                        //}
                        //else
                        //{
                        //    return 1;
                        //}
                    }
                }
                return 0;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static int GetSubCategoryLedgerId(int ledgerReferenceId, int currHospitalId)
        {
            try
            {
                if (ledgerReferenceId > 0)
                {
                    bool checkFlag = false;
                    if (InventorySubCategory.Count > 0)
                    {
                        checkFlag = InventorySubCategory.Exists(a => a.SubCategoryId == ledgerReferenceId);
                    }
                    if (checkFlag == true)
                    {
                        return InventorySubCategory.Find(a => a.SubCategoryId == ledgerReferenceId).LedgerId.Value;
                    }
                    else
                    {
                        var SubCategoryData = accountingDBContext.ItemSubCategoryMaster.Where(s => s.SubCategoryId == ledgerReferenceId).FirstOrDefault();
                        var tempLed = new LedgerModel();
                        tempLed.LedgerReferenceId = ledgerReferenceId;
                        tempLed.LedgerName = SubCategoryData.SubCategoryName;
                        tempLed.Description = "Inventory items subcategory ledger";
                        var flag = true;
                        tempLed.IsMapLedger = true;
                        if (flag)
                        {
                            unavailableLedgerList.Add(tempLed);
                        }
                    }

                }
                return 0;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static List<LedgerModel> GetUnavailableLedgerList()
        {
            try
            {
                return unavailableLedgerList;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        public static void ClearUnavailableLedgerList()
        {
            try
            {
                unavailableLedgerList = new List<LedgerModel>();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //methods to check valid transactions
        private static bool CheckValidTxn(TransactionModel accTxnItm, int currHospitalId)
        {
            try
            {
                bool flag = true;
                if (accTxnItm.TransactionItems != null)
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

        //post method for user to transfer verified txns 
        public static bool PostTxnData(List<TransactionModel> txndata, int currHospitalId)
        {
            try
            {
                //var conn = accountingDBContext.Database.Connection;
                //conn.Open();

                using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
                {
                    try
                    {
                        accountingDBContext.Configuration.AutoDetectChangesEnabled = false;
                        Transaction = txndata;
                        List<string> updateReferenceIds = new List<string>(); 
                        Hashtable allReferenceIdWithTypeList = new Hashtable();
                        List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
                        string refBillingSyncIds = "";
                        if (Transaction.Count > 0)
                        {
                            var isGroupbyData = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                            //here transaction list from billing or may be from inventory
                            //1-sectionId for inventory 2-sectionid for billing
                            var sectionId = Transaction[0].SectionId;
                            var IsingalVoucher = Convert.ToBoolean(InvetoryIntegrationParameters["IsSingalVoucher"].ToString());
                            var distinctVoucherIdAndDate = (from txn in Transaction
                                                            group txn by new { txn.VoucherId, txn.TransactionDate } into x
                                                            select new
                                                            {
                                                                x.Key.VoucherId,
                                                                x.Key.TransactionDate,
                                                            }).ToList();
                            var Tuid = GetTUID(accountingDBContext, currHospitalId);
                            // Hashtable voucherNumberList = new Hashtable();
                            List<VoucherNum> voucherNumberList = new List<VoucherNum>();
                            for (int p = 0; p < distinctVoucherIdAndDate.Count; p++)
                            {

                                var vNumber = GetVoucherNumber(accountingDBContext, distinctVoucherIdAndDate[p].VoucherId, distinctVoucherIdAndDate[p].TransactionDate, sectionId, true, currHospitalId);
                                VoucherNum obj = new VoucherNum();
                                obj.VoucherId = distinctVoucherIdAndDate[p].VoucherId;
                                obj.TransactionDate = (DateTime)distinctVoucherIdAndDate[p].TransactionDate;
                                obj.VoucherNumber = vNumber;
                                voucherNumberList.Add(obj);
                                //voucherNumberList.Add(distinctVouchers[p].VoucherId, vNum);
                            }
                            //for below line user can only transfer one type of voucher records                            
                            if (sectionId == 2)
                            {//billing                               
                                //nbb billing changes
                                Transaction.ForEach(txn =>
                                {
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    txn.VoucherNumber = voucherNumberList.Find(s => s.VoucherId == txn.VoucherId && s.TransactionDate == txn.TransactionDate).VoucherNumber.ToString();
                                    TransactionModel txntemp = ProcessTransactions(txn, currHospitalId);
                                    txntemp.HospitalId = currHospitalId;
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].HospitalId = currHospitalId;
                                    }
                                    accountingDBContext.Transactions.Add(txntemp);
                                    accountingDBContext.SaveChanges();

                                    //code for add tarnsaction into transaction history tbl for Synced.
                                    AccountingTransactionHistoryModel ToSynce = new AccountingTransactionHistoryModel();
                                    ToSynce.TransactionDate = txn.TransactionDate;
                                    ToSynce.SyncedOn = txn.CreatedOn;
                                    ToSynce.SyncedBy = txn.CreatedBy;
                                    ToSynce.SectionId = txn.SectionId;
                                    ToSynce.TransactionType = txn.TransactionType;
                                    accountingDBContext.AccountingTransactionHistory.Add(ToSynce);
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

                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();
                            }
                            else if (sectionId == 1)
                            {//inventory
                             //List<string> allReferenceIds = new List<string>();     
                                Transaction.ForEach(txn =>
                                 {
                                     txn.IsCustomVoucher = IsCustomVoucher;
                                     txn.TUId = Tuid;
                                     txn.IsActive = true;
                                     txn.VoucherNumber = (IsingalVoucher) ? voucherNumberList.Find(s => s.VoucherId == txn.VoucherId && s.TransactionDate == txn.TransactionDate).VoucherNumber.ToString()
                                                                          : GetVoucherNumber(accountingDBContext, txn.VoucherId, txn.TransactionDate, sectionId, IsingalVoucher, currHospitalId);

                                     if (txn.TransactionType == "INVCreditGoodReceipt" || txn.TransactionType == "INVCashGoodReceipt1")
                                     {
                                         var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
                                         txn.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;
                                     }                                   
                                     TransactionModel txntemp = ProcessTransactions(txn, currHospitalId);
                                     txntemp.HospitalId = currHospitalId;

                                     for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                     {
                                         txntemp.TransactionItems[i].HospitalId = currHospitalId;
                                     }
                                     accountingDBContext.Transactions.Add(txntemp);
                                     accountingDBContext.SaveChanges();
                                     //code for add tarnsaction into transaction history tbl for Synced.
                                     AccountingTransactionHistoryModel ToSynce = new AccountingTransactionHistoryModel();
                                     ToSynce.TransactionDate = txn.TransactionDate;
                                     ToSynce.SyncedOn = txn.CreatedOn;
                                     ToSynce.SyncedBy = txn.CreatedBy;
                                     ToSynce.SectionId = txn.SectionId;
                                     ToSynce.TransactionType = txn.TransactionType;
                                     accountingDBContext.AccountingTransactionHistory.Add(ToSynce);
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
                                    List<string> allReferenceIdsOne = new List<string>();//NageshBB:20Aug2020
                                    filteredData.ForEach(txn =>
                                    {
                                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();                                        
                                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
                                        
                                        var refIdOne = txn.TransactionLinks.Select(tone => tone.ReferenceIdOne).ToList();//NageshBB:20Aug2020
                                        refIdOne.ForEach(newId => allReferenceIdsOne.Add((string)newId));//NageshBB:20Aug2020
                                    });
                                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                                    string refIdOneStr = string.Join(",", allReferenceIdsOne.Select(p => p));//NageshBB:20Aug2020
                                    if (refIdOneStr.Length > 0) //NageshBB:20Aug2020
                                    {
                                        AllReferenceIds.Add(new AccountingReferenceTypeViewModel 
                                        {
                                            Type = distinctTxnTypeList[i],
                                            ReferenceIds = refIdStr,
                                            ReferenceIdsOne = refIdOneStr
                                        });
                                    }                                  
                                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                                }
                                
                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();

                            }
                            else if (sectionId == 3)
                            {//pharmacy

                                Transaction.ForEach(txn =>
                                {
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    txn.VoucherNumber = voucherNumberList.Find(s => s.VoucherId == txn.VoucherId && s.TransactionDate == txn.TransactionDate).VoucherNumber.ToString();
                                    TransactionModel txntemp = ProcessTransactions(txn, currHospitalId);
                                    txntemp.HospitalId = currHospitalId;
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].HospitalId = currHospitalId;
                                    }
                                    accountingDBContext.Transactions.Add(txntemp);
                                    accountingDBContext.SaveChanges();
                                    //code for add tarnsaction into transaction history tbl for Synced.
                                    AccountingTransactionHistoryModel ToSynce = new AccountingTransactionHistoryModel();
                                    ToSynce.TransactionDate = txn.TransactionDate;
                                    ToSynce.SyncedOn = txn.CreatedOn;
                                    ToSynce.SyncedBy = txn.CreatedBy;
                                    ToSynce.SectionId = txn.SectionId;
                                    ToSynce.TransactionType = txn.TransactionType;
                                    accountingDBContext.AccountingTransactionHistory.Add(ToSynce);
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
                            else if (sectionId == 5)
                            {//incetive

                                Transaction.ForEach(txn =>
                                {
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    txn.VoucherNumber = voucherNumberList.Find(s => s.VoucherId == txn.VoucherId && s.TransactionDate == txn.TransactionDate).VoucherNumber.ToString();
                                    TransactionModel txntemp = ProcessTransactions(txn, currHospitalId);
                                    for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                                    {
                                        txntemp.TransactionItems[i].HospitalId = currHospitalId;
                                    }
                                    accountingDBContext.Transactions.Add(txntemp);
                                    txntemp.HospitalId = currHospitalId;
                                    accountingDBContext.SaveChanges();
                                    //code for add tarnsaction into transaction history tbl for Synced.
                                    AccountingTransactionHistoryModel ToSynce = new AccountingTransactionHistoryModel();
                                    ToSynce.TransactionDate = txn.TransactionDate;
                                    ToSynce.SyncedOn = txn.CreatedOn;
                                    ToSynce.SyncedBy = txn.CreatedBy;
                                    ToSynce.SectionId = txn.SectionId;
                                    ToSynce.TransactionType = txn.TransactionType;
                                    accountingDBContext.AccountingTransactionHistory.Add(ToSynce);
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
                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();
                            }


                            dbContextTransaction.Commit();

                            if (updateReferenceIds.Count > 0)  ///if txn committed successfully, all reference ids will update 
                            {
                                foreach (string txnType in updateReferenceIds)
                                {
                                    accountingDBContext.UpdateIsTransferToACC(allReferenceIdWithTypeList[txnType].ToString(), txnType, AllReferenceIds);
                                }
                            }
                            else
                            {
                                //accountingDBContext.UpdateIsTransferToACC(refBillingSyncIds, "BillingRecords");

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
        }
        private static int? GetTUID(AccountingDbContext accountingDbContext, int currHospitalId)
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
        private static string GetVoucherNumber(AccountingDbContext accountingDBContext, int? voucherId, DateTime? transactionDate, int? SectionId, bool IsSingleVoucher, int currHospitalId)
        {
            {
                
                var FiscalyearId = GetFiscalYearIdByDate(accountingDBContext, transactionDate, currHospitalId);
                int? sameDayMaxVNo = (from txn in accountingDBContext.Transactions
                              where txn.HospitalId == currHospitalId && txn.FiscalyearId == FiscalyearId &&
                              txn.VoucherId == voucherId && txn.SectionId == SectionId && txn.TransactionDate == transactionDate
                              select txn.VoucherSerialNo).DefaultIfEmpty(0).Max();

                var voucherCode = (from v in accountingDBContext.Vouchers
                                   where v.VoucherId == voucherId
                                   select v.VoucherCode).FirstOrDefault();

                var sectionCode = (from s in SectionList.AsEnumerable()
                                   where s.SectionId == SectionId && s.HospitalId==currHospitalId
                                   select s.SectionCode).FirstOrDefault();
                if (IsSingleVoucher)
                {
                    if (sameDayMaxVNo > 0 )
                    {                        
                        return sectionCode+'-'+voucherCode+'-'+ sameDayMaxVNo;
                    }
                    else
                    {                     
                        int? lastDayMaxVNo = (from txn in accountingDBContext.Transactions
                                                where txn.HospitalId == currHospitalId && txn.FiscalyearId == FiscalyearId &&
                                                txn.VoucherId == voucherId && txn.SectionId == SectionId
                                                select txn.VoucherSerialNo).DefaultIfEmpty(0).Max();

                        if (lastDayMaxVNo > 0)
                        {
                            int? newNo = lastDayMaxVNo + 1;
                            return sectionCode + '-' + voucherCode + '-' + newNo;                          
                        }
                        else
                        {
                            return sectionCode + "-" + voucherCode + "-1";
                        }
                    }
                }
                else
                {                    
                    int? lastDayMaxVcNo = (from txn in accountingDBContext.Transactions
                                         where txn.HospitalId == currHospitalId && txn.FiscalyearId == FiscalyearId &&
                                         txn.VoucherId == voucherId && txn.SectionId == SectionId
                                         select txn.VoucherSerialNo).DefaultIfEmpty(0).Max();
                    if (lastDayMaxVcNo > 0)
                    {
                        int? newNo1 = lastDayMaxVcNo + 1;
                        return sectionCode + '-' + voucherCode + '-' + newNo1 ;
                    }
                    else
                    {
                        return sectionCode + "-" + voucherCode + "-1";
                    }
                }
            }
        }

        //Process Transaction
        private static TransactionModel ProcessTransactions(TransactionModel transaction, int currHospitalId)
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
        private static void AddLedgersFromAcc(int currHospitalId)
        {
            using (var PostLedger = accountingDBContext.Database.BeginTransaction())
            {
                try
                {
                    var isUpdateList = false;
                    unavailableLedgerList.ForEach(led =>
                    {
                        led.CreatedOn = System.DateTime.Now;
                        led.HospitalId = currHospitalId;
                        led.Code = GetProvisionalLedgerCode(accountingDBContext, currHospitalId);
                        led.IsActive = true;
                        led.CreatedBy = EmployeeId;
                        accountingDBContext.Ledgers.Add(led);
                        accountingDBContext.SaveChanges();
                        if (led.LedgerType == "pharmacysupplier" || led.LedgerType == "inventoryvendor" || led.LedgerType == "creditorganization" || led.LedgerType == "consultant")
                        {
                            isUpdateList = true;
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = led.LedgerId;
                            ledgerMapping.LedgerType = led.LedgerType;
                            ledgerMapping.ReferenceId = (int)led.LedgerReferenceId;
                            ledgerMapping.HospitalId = led.HospitalId;
                            accountingDBContext.LedgerMappings.Add(ledgerMapping);
                            accountingDBContext.SaveChanges();
                        }
                        LedgerAddUpdateInBalanceHisotry(led, accountingDBContext, false, currHospitalId,EmployeeId);
                    });
                    unavailableLedgerList = new List<LedgerModel>();
                    if (isUpdateList == true)
                    {
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
                        var billingCreditOrganizations = (from ledM in accountingDBContext.LedgerMappings
                                                          join credOrg in accountingDBContext.BillCreditOrganizations on ledM.ReferenceId equals credOrg.OrganizationId
                                                          where ledM.LedgerType == "creditorganization"
                                                          select new
                                                          {
                                                              credOrg.OrganizationId,
                                                              ledM.LedgerId,
                                                              ledM.LedgerType,
                                                              LedgerName = credOrg.OrganizationName
                                                          }).ToList();

                        BillingCreditOrganizations = billingCreditOrganizations.Select(p => new LedgerMappingModel()
                        {
                            ReferenceId = p.OrganizationId,
                            LedgerName = p.LedgerName,
                            LedgerId = p.LedgerId,
                            LedgerType = p.LedgerType,
                        }).ToList();

                        var consultantLedgers = (from ledM in accountingDBContext.LedgerMappings
                                                 join emp in accountingDBContext.Emmployees on ledM.ReferenceId equals emp.EmployeeId
                                                 where ledM.LedgerType == "consultant"
                                                 select new
                                                 {
                                                     emp.EmployeeId,
                                                     ledM.LedgerId,
                                                     ledM.LedgerType,
                                                     LedgerName = emp.FullName
                                                 }).ToList();

                        EmployeeLedger = consultantLedgers.Select(p => new EmployeeModel()
                        {
                            EmployeeId = p.EmployeeId,
                            FullName = p.LedgerName,
                            LedgerId = p.LedgerId,
                            LedgerType = p.LedgerType,
                        }).ToList();

                    }

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
        private static bool GetBillingTxnData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                // isCredtiOrganizationAccounting variable to check is the credit organization wise records enable or disable. 
                var isCredtiOrganizationAccounting = bool.Parse(accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "isCredtiOrganizationAccounting").FirstOrDefault().ParameterValue);

                DataTable syncBill = accountingDBContext.BilTxnItemsDateWise(SelectedDate, currHospitalId);

                //NageshBB on 16 March 2020-added two line for convert datatable to list object
                var strDataBilling = JsonConvert.SerializeObject(syncBill, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });

                List<SyncBillingAccountingModel> sync = JsonConvert.DeserializeObject<List<SyncBillingAccountingModel>>(strDataBilling);

                billingSyncList = new List<SyncBillingAccountingModel>();
                //NageshBB on 16 March 2020commented below code , which was used for convert datatable to list object

                //List<SyncBillingAccountingModel> sync = allBillingRecords.AsEnumerable().Select(
                //                            dataRow => new SyncBillingAccountingModel
                //                            {
                //                                BillingAccountingSyncId = dataRow.Field<int>("BillingAccountingSyncId"),
                //                                TransactionDate = dataRow.Field<DateTime>("TransactionDate"),
                //                                TransactionType = dataRow.Field<string>("TransactionType"),
                //                                ReferenceModelName = dataRow.Field<string>("ReferenceModelName"),
                //                                ReferenceId = dataRow.Field<int>("ReferenceId"),
                //                                ServiceDepartmentId = dataRow.Field<int?>("ServiceDepartmentId"),
                //                                ItemId = dataRow.Field<int?>("ItemId"),
                //                                IncomeLedgerName = dataRow.Field<string>("IncomeLedgerName"),
                //                                PatientId = dataRow.Field<int>("PatientId"),
                //                                PaymentMode = dataRow.Field<string>("PaymentMode"),
                //                                SubTotal = dataRow.Field<double?>("SubTotal"),
                //                                TaxAmount = dataRow.Field<double?>("TaxAmount"),
                //                                DiscountAmount = dataRow.Field<double?>("DiscountAmount"),
                //                                TotalAmount = dataRow.Field<double?>("TotalAmount"),
                //                                SettlementDiscountAmount = dataRow.Field<double?>("SettlementDiscountAmount"),
                //                                CreatedOn = dataRow.Field<DateTime?>("CreatedOn"),
                //                                CreatedBy = dataRow.Field<int?>("CreatedBy"),
                //                                IsTransferedToAcc = dataRow.Field<bool?>("IsTransferedToAcc"),
                //                                CreditOrganizationId = (isCredtiOrganizationAccounting) ? dataRow.Field<int?>("CreditOrganizationId") :null
                //                            }).ToList();

                var billitm = sync.GroupBy(a => new
                {
                    a.TransactionType,
                    Convert.ToDateTime(a.TransactionDate).Date,
                    a.IncomeLedgerName,
                    a.CreditOrganizationId,
                    PaymentMode = (a.PaymentMode == "card" || a.PaymentMode == "cheque") ? "bank" : a.PaymentMode
                })
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
                        + " income ledger : " + itm.Select(a => a.TransactionType).FirstOrDefault(),
                        //CreditOrganizationId = itm.Key.CreditOrganizationId
                        CreditOrganizationId = (isCredtiOrganizationAccounting) ? itm.Key.CreditOrganizationId : null
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
                        }).ToList(),
                        CreditOrganizationId = p.CreditOrganizationId
                    }).ToList();
                    Syncbill.ForEach(a =>
                    {
                        //a.VoucherId = (IsCustomVoucher == true) ? RuleMappingList.Find(c => c.Description == a.TransactionType).CustomVoucherId.Value : RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        //// a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        //a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    });
                    //billingSyncList = Syncbill;
                    foreach (var itm in Syncbill)
                    {
                        if (itm.VoucherId != 0)
                        {
                            billingSyncList.Add(itm);
                        }
                    }
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
        private static List<TransactionModel> MapBillingTxnData(int fiscalYearId, int currHospitalId)
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
                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                    //accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
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
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CashBillCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "CashBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CreditBillSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId.Value, currHospitalId);
                                            }
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "CreditBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CashBillReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "CashBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            // ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId.Value, currHospitalId);
                                            }
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
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                        //}
                                        else if (ruleRow.Description == "CreditBillPaidAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.SettlementDiscountAmount;
                                            //nbb-charak changes
                                            if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            }

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
                                            ledId = GetLedgerIdFromServiceDepartment(record.IncomeLedgerName, ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);    //here service deptname are income ledgers for Hospital
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            //ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId.Value, currHospitalId);
                                            }
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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

                    if (CheckValidTxn(transaction, currHospitalId))
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
        private static int GetLedgerIdFromServiceDepartment(string ledgerNameString, int ledgerGroupId, int? ledgerReferenceId, int currHospitalId)
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
                        tempLed.Description = "Income Ledger";
                        var flag = true;
                        tempLed.IsMapLedger = false;
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
                            // AddLedgersFromAcc(currHospitalId);  // Vikas: 23Jul2020 : To display unavailble list on clien side
                        }
                        //  return LedgerList.Find(a => a.LedgerName == ledgerNameString).LedgerId;
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

        //method for Billing credit organization as Ledger
        private static int GetLedgerIdFromBilCreditOrganization(int? BilCreditOrganizationId, int ledgerGroupId, int currHospitalId)
        {
            try
            {
                bool checkFlag = false;
                if (BillingCreditOrganizations.Count > 0)
                {
                    checkFlag = BillingCreditOrganizations.Exists(a => a.ReferenceId == BilCreditOrganizationId);
                }
                if (checkFlag == true)
                {
                    return BillingCreditOrganizations.Find(a => a.ReferenceId == BilCreditOrganizationId).LedgerId;
                }
                else
                {
                    var creditOrg = (from c in accountingDBContext.BillCreditOrganizations
                                     select c).ToList();
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = creditOrg.Where(c => c.OrganizationId == BilCreditOrganizationId).FirstOrDefault().OrganizationName;
                    tempLed.LedgerReferenceId = BilCreditOrganizationId;
                    tempLed.LedgerType = "creditorganization";
                    bool flag = true;
                    tempLed.IsMapLedger = true;
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
                        //AddLedgersFromAcc(currHospitalId); // Vikas: 23Jul2020 : To display unavailble list on clien side

                    }
                    //return BillingCreditOrganizations.Find(a => a.ReferenceId == BilCreditOrganizationId).LedgerId;
                    return 0;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Inventory get,map and transfer data 
        //method for get inventory data 
        private static bool GetInventoryTxnData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                InvGoodRecipt = new List<GoodsReceiptModel>();
                var dataset = accountingDBContext.InvTxnsDateWise(SelectedDate, currHospitalId);
                var goodreceiptdata = DataTableToList.ToDynamic(dataset.Tables[0]);
                InvGoodRecipt = new List<GoodsReceiptModel>();
                var IsAllowGroupByVoucher = Convert.ToBoolean(InvetoryIntegrationParameters["IsAllowGroupByVoucher"].ToString());
                if (!IsAllowGroupByVoucher)
                {
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
                                                 CreatedOn = x.Key.CreatedOn,
                                                 VendorId = x.Key.VendorId,
                                                 VendorName = x.Select(a => a.gr.VendorName).FirstOrDefault(),
                                                 Type = x.Key.PaymentMode == "Cash" ? (x.Key.ItemCategory == "Capital Goods" ? "Goods Receipt Cash For Capital Goods" : "Goods Receipt Cash") : (x.Key.ItemCategory == "Capital Goods" ? "Goods Receipt Credit For Capital Goods" : "Credit Goods Receipt"),
                                                 TransactionType = x.Key.PaymentMode == "Cash" ? (x.Key.ItemCategory == "Capital Goods" ? "INVCashGoodReceiptFixedAsset1" : "INVCashGoodReceipt1") : (x.Key.ItemCategory == "Capital Goods" ? "INVCreditGoodReceiptFixedAsset" : "INVCreditGoodReceipt"),
                                                 SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                                 TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                                 TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                                                 VATAmount = x.Select(a => (decimal)a.gr.VATAmount).Sum(),
                                                 DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                                 ItemDetails = x.GroupBy(a => new { a.gr.ItemId }).Select(a => new { a.Key.ItemId, TotalAmount = a.Select(b => (decimal)b.gr.TotalAmount).Sum() }).ToList(),
                                                 Remarks = "Inventory " + (x.Select(a => a.gr.PaymentMode).FirstOrDefault()) + " good receipt voucher for Bill No: " + (x.Select(a => a.gr.BillNo).FirstOrDefault()) + " and Goods Receipt No. : " + (x.Select(a => a.gr.GoodsReceiptNo).FirstOrDefault()) + " on GoodsReceipt date: " + (x.Select(a => a.gr.CreatedOn).FirstOrDefault()),
                                                 ReferenceIds = x.Select(a => (int)a.gr.GoodsReceiptItemId).Distinct().ToList(), //we are using GoodsReceiptItemId as a referenceId
                                              }).ToList();
                    if (goodsReceiptItems.Count > 0)
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
                            a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                            a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                        });
                        foreach (var itm in invItem)
                        {
                            if (itm.VoucherId != 0)
                            {
                                InvGoodRecipt.Add(itm);
                            }
                        }
                    }
                }
                else
                {
                    var goodsReceiptItems = (from gr in goodreceiptdata.AsEnumerable()
                                             group new { gr } by new
                                             {
                                                 CreatedOn = Convert.ToDateTime(gr.CreatedOn).Date,
                                                 //BillNo = gr.BillNo
                                                 GoodsReceiptID = gr.GoodsReceiptID
                                             } into x
                                             select new
                                             {
                                                 x.Key.CreatedOn,
                                                 //x.Key.BillNo,
                                                 x.Key.GoodsReceiptID,
                                                 VendorId = x.Select(a => a.gr.VendorId).FirstOrDefault(),
                                                 VendorName = x.Select(a => a.gr.VendorName).FirstOrDefault(),
                                                 Type = x.Select(a => a.gr.PaymentMode).FirstOrDefault() == "Cash" ? (x.Select(a => a.gr.ItemType).FirstOrDefault() == "Capital Goods" ? "Goods Receipt Cash For Capital Goods" : "Goods Receipt Cash") : (x.Select(a => a.gr.ItemType).FirstOrDefault() == "Capital Goods" ? "Goods Receipt Credit For Capital Goods" : "Credit Goods Receipt"),
                                                 TransactionType = x.Select(a => a.gr.PaymentMode).FirstOrDefault() == "Cash" ? (x.Select(a => a.gr.ItemType).FirstOrDefault() == "Capital Goods" ? "INVCashGoodReceiptFixedAsset1" : "INVCashGoodReceipt1") : (x.Select(a => a.gr.ItemType).FirstOrDefault() == "Capital Goods" ? "INVCreditGoodReceiptFixedAsset" : "INVCreditGoodReceipt"),
                                                 SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                                 TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                                 TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                                                 VATAmount = x.Select(a => (decimal)a.gr.VATAmount).Sum(),
                                                 DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                                 ItemDetails = x.GroupBy(a => new { a.gr.ItemId }).Select(a => new { a.Key.ItemId, TotalAmount = a.Select(b => (decimal)b.gr.TotalAmount).Sum() }).ToList(),
                                                 Remarks = "Inventory " + (x.Select(a => a.gr.PaymentMode).FirstOrDefault()) + " good receipt voucher for Bill No: " + (x.Select(a => a.gr.BillNo).FirstOrDefault()) + " and Goods ReceiptNo. : " + (x.Select(a => a.gr.GoodsReceiptNo).FirstOrDefault()) + " on GoodsReceipt date: " + (x.Select(a => a.gr.CreatedOn).FirstOrDefault()),
                                                 ReferenceIds = x.Select(a => (int)a.gr.GoodsReceiptItemId).Distinct().ToList(), //we are using GoodsReceiptItemId as a referenceId
                                              }).ToList();
                    if (goodsReceiptItems.Count > 0)
                    {
                        var invItem = new List<GoodsReceiptModel>();
                        invItem = goodsReceiptItems.Select(p => new GoodsReceiptModel()
                        {
                            //BillNo = p.BillNo,
                            GoodsReceiptID = p.GoodsReceiptID,
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
                            a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                            a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                        });
                        foreach (var itm in invItem)
                        {
                            if (itm.VoucherId != 0)
                            {
                                InvGoodRecipt.Add(itm);
                            }
                        }
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    });
                    foreach (var itm in wrItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            InvGoodRecipt.Add(itm);
                        }
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    });
                    foreach (var itm in InvRet)
                    {
                        if (itm.VoucherId != 0)
                        {
                            InvGoodRecipt.Add(itm);
                        }
                    }
                }


                var WARD_INV_Transaction = DataTableToList.ToDynamic(dataset.Tables[3]);

                var dispatchToDept = (from wtxn in WARD_INV_Transaction
                                      group new { wtxn } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(wtxn.CreatedOn).Date,
                                          TransactionType = wtxn.TransactionType
                                      } into x
                                      select new
                                      {
                                          CreatedOn = x.Key.CreatedOn,
                                          TransactionType = x.Key.TransactionType,
                                          TotalAmount = x.Select(a => (decimal)a.wtxn.Price * (int)a.wtxn.Quantity).Sum(),
                                          Remarks = "Transaction of INVDispatchToDept (Dispatch items) Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                          ReferenceIds = x.Select(a => (int)a.wtxn.TransactionId).Distinct().ToList(), // we are using TransactionId from WARD_INV_Transaction as referenceId 
                                      }).ToList();
                if (dispatchToDept.Count > 0)
                {
                    var dispDept = new List<GoodsReceiptModel>();
                    dispDept = dispatchToDept.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                    }).ToList();
                    dispDept.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    });
                    foreach (var itm in dispDept)
                    {
                        if (itm.VoucherId != 0)
                        {
                            InvGoodRecipt.Add(itm);
                        }
                    }
                }

                // INVDeptConsumedGoods
                var ConsumedGoods = DataTableToList.ToDynamic(dataset.Tables[4]);
                var ConsumedGoodsItems = (from csm in ConsumedGoods.AsEnumerable()
                                          group new { csm } by new
                                          {
                                              CreatedOn = Convert.ToDateTime(csm.CreatedOn).Date,
                                              SubCategoryId = csm.SubCategoryId
                                          } into x
                                          select new
                                          {
                                              x.Key.CreatedOn,
                                              x.Key.SubCategoryId,
                                              TransactionType = "INVDeptConsumedGoods",
                                              TotalAmount = x.Select(a=> (decimal) a.csm.TotalAmount).Sum(), 
                                              Remarks = "Inventory Transaction entries to Accounting for consumption: ",
                                              ReferenceIds = x.Select(a => (int)a.csm.TransactionId).Distinct().ToList(),  //we are using GoodsReceiptItemId as a referenceId
                                          }).ToList();


                if (ConsumedGoodsItems.Count > 0)
                {
                    //var dispDept = new List<GoodsReceiptModel>();
                    var consumption = new GoodsReceiptModel();
                    consumption.CreatedOn = ConsumedGoodsItems[0].CreatedOn;
                    consumption.TransactionType= ConsumedGoodsItems[0].TransactionType;
                    consumption.Remarks= ConsumedGoodsItems[0].Remarks;
                    consumption.VoucherId = (RuleMappingList.Where(r => r.Description == consumption.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == consumption.TransactionType).VoucherId.Value : 0;
                    consumption.VoucherName = (consumption.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == consumption.VoucherId).VoucherName : null;
                    consumption.GoodsReceiptItem = new List<GoodsReceiptItemsModel>();
                    consumption.ReferenceIds = new List<int>();
                    ConsumedGoodsItems.ForEach(cItm=> {
                        consumption.ReferenceIds.AddRange(cItm.ReferenceIds);
                        consumption.TotalAmount = consumption.TotalAmount + cItm.TotalAmount;
                    });
                    consumption.GoodsReceiptItem = ConsumedGoodsItems.Select(p => new GoodsReceiptItemsModel()
                    {                        
                        GoodsReceiptItemId = p.SubCategoryId,                                                                    
                        TotalAmount = (decimal)p.TotalAmount,                        
                    }).ToList();                  
                    if (consumption.VoucherId != 0)
                    {
                        InvGoodRecipt.Add(consumption);
                    }                   
                }

                //Table-6 INVStockManageOut
                var invStockManageOut = DataTableToList.ToDynamic(dataset.Tables[5]);
                var invStockManageOutItems = (from stkMOut in invStockManageOut.AsEnumerable()
                                          group new { stkMOut } by new
                                          {
                                              CreatedOn = Convert.ToDateTime(stkMOut.CreatedOn).Date,
                                              SubCategoryId = stkMOut.SubCategoryId
                                          } into x
                                          select new
                                          {
                                              x.Key.CreatedOn,
                                              x.Key.SubCategoryId,
                                              TransactionType = "INVStockManageOut",
                                              TotalAmount = x.Select(a => (decimal)a.stkMOut.TotalAmount).Sum(),
                                              Remarks = "Inventory stock manage out from mainstore and substore ",
                                              ReferenceIds = x.Select(a => (int)a.stkMOut.TransactionId).Distinct().ToList(), //WARD_INV_Transaction-TransactionId
                                              ReferenceIdsOne = x.Select(a => (int)a.stkMOut.StockTxnId).Distinct().ToList(),//INV_TXN_StockTransaction-StockTxnId
                                          }).ToList();


                if (invStockManageOutItems.Count > 0)
                {                    
                    var stkManageOut  = new GoodsReceiptModel();
                    stkManageOut.CreatedOn = invStockManageOutItems[0].CreatedOn;
                    stkManageOut.TransactionType = invStockManageOutItems[0].TransactionType;
                    stkManageOut.Remarks = invStockManageOutItems[0].Remarks;
                    stkManageOut.VoucherId = (RuleMappingList.Where(r => r.Description == stkManageOut.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == stkManageOut.TransactionType).VoucherId.Value : 0;
                    stkManageOut.VoucherName = (stkManageOut.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == stkManageOut.VoucherId).VoucherName : null;
                    stkManageOut.GoodsReceiptItem = new List<GoodsReceiptItemsModel>();
                    stkManageOut.ReferenceIds = new List<int>();
                    stkManageOut.ReferenceIdsOne = new List<int>();
                    invStockManageOutItems.ForEach(sItm => {
                        stkManageOut.ReferenceIds.AddRange(sItm.ReferenceIds);
                        stkManageOut.ReferenceIdsOne.AddRange(sItm.ReferenceIdsOne);
                        stkManageOut.TotalAmount = stkManageOut.TotalAmount + sItm.TotalAmount;
                    });
                    stkManageOut.GoodsReceiptItem = invStockManageOutItems.Select(p => new GoodsReceiptItemsModel()
                    {
                        GoodsReceiptItemId = p.SubCategoryId,
                        TotalAmount = (decimal)p.TotalAmount,
                    }).ToList();
                    if (stkManageOut.VoucherId != 0)
                    {
                        if (stkManageOut.VoucherId != 0)
                        {
                            InvGoodRecipt.Add(stkManageOut);
                        }
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
        private static List<TransactionModel> MapInventoryTxnData(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var accTxnFromInv = new List<TransactionModel>();
                unavailableLedgerList = new List<LedgerModel>();
                for (int i = 0; i < InvGoodRecipt.Count; i++)
                {
                    var record = InvGoodRecipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks;
                    transaction.SectionId = 1;
                    transaction.BillSyncs = record.BillSyncs;
                    transaction.TransactionDate = record.CreatedOn;
                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                    //accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    var referenceIdOneArray = record.ReferenceIdsOne;
                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();                    
                    txnLink.ReferenceId = (referenceIdArray.Count > 0) ?string.Join(",", referenceIdArray):null;
                    txnLink.ReferenceIdOne =(referenceIdOneArray!=null && referenceIdOneArray.Count >0)? string.Join(",", referenceIdOneArray):null;
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
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_CONSUMED_COGC", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVWriteOffInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                var parameterVal = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                                var isGroupBy = (parameterVal != "") ? Convert.ToBoolean(parameterVal) : true;//need to change this group by 
                                //In cash goods receipt we have two entry of vendor ledger with Dr and Cr amount
                                //If isGroupBy is true then don't add vendor ledgers into voucher , if isGroupBy is false then add vendor ledgers into voucher
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);

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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }

                                        // DR : 1003-MERCHANDISE INVENTORY (1003)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1MERCHANDISEINVENTORY" && ruleRow.DrCr == true)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerId(GetLedgerName("ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        // CR : SUPPLIERS (A/C PAYABLES)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1SUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == false && isGroupBy == false)
                                        {
                                            //accTxnItems.Amount = (double)record.SalesAmount - (double)record.DiscountAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }

                                        // DR : SUPPLIERS (A/C PAYABLES)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1SUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == true && isGroupBy == false)
                                        {
                                            //  accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }
                                        // CR : Petty Cash (1296)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1CASH&BANK" && ruleRow.DrCr == false)
                                        {
                                            //accTxnItems.Amount = (double)record.SalesAmount - (double)record.DiscountAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_&_BANKPETTY_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }

                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        if (accTxnItems.LedgerId > 0)
                                        {
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromInv.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks;
                                    transaction.SectionId = 1;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
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

                                //transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt2").VoucherId.Value;
                                //var transferRule2 = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt2").MappingDetail;
                                var rulesData = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt2");
                                transaction.VoucherId = (rulesData == null) ? 0 : rulesData.VoucherId.Value;
                                var transferRule2 = (rulesData == null) ? null : rulesData.MappingDetail;
                                if (transferRule2 != null)
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount + (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                        //if (ruleRow.Description == "INVCreditGoodReceiptSundryCreditors")
                                        //{
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                        //    //getting LedgerId from LedgerMapping
                                        //    ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName);

                                        //    //accTxnItems.IsTxnDetails = true;
                                        //    //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                        //    //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                        //    //accTxnItemDetail.ReferenceId = record.VendorId;
                                        //    //accTxnItemDetail.ReferenceType = "Vendor";
                                        //    //accTxnItemDetail.Amount = accTxnItems.Amount;
                                        //    //accTxnItemDetail.Description = "Inventory Credit GoodReceipt";
                                        //    //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        //}
                                        //else if (ruleRow.Description == "INVCreditGoodReceiptInventory")
                                        //{
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                        //}
                                        //else if (ruleRow.Description == "INVCreditGoodReceiptDutiesandTaxes")
                                        //{
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                        //}


                                        //---Main Distributor-- - Initial PRice: 100Vat = 13Total Cost for Customer(or Reseller) = 113 / -
                                        //--Reseller(Retail)--InitialPRice + Margin(30) = 130 / -Vat = 130 * 13 / 100 = 16.9 


                                        if (ruleRow.Description == "INVCreditGoodReceiptMERCHANDISEINVENTORY" && ruleRow.DrCr == true)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptSUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == false)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.DiscountAmount : (double)record.TotalAmount;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            // accTxnItems.VendorId = itm.VendorId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDiscountIncome")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRCashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            //accTxnItems.VendorId = itm.VendorId;
                                            //  accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            //getting LedgerId from LedgerMapping 
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);

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
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromInv.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks;
                                    transaction.SectionId = 1;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
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
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId.Value, record.VendorName, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2CashInHand")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount + (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (double)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVDeptConsumedGoods":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVDeptConsumedGoods").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVDeptConsumedGoods").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionType = record.TransactionType;
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {                                                                              
                                        // DR: 
                                        if (ruleRow.Description == "INVConsumptionParent")
                                        {
                                            record.GoodsReceiptItem.ForEach(gritm=> {
                                                var accTxnItems = new TransactionItemModel();
                                                accTxnItems.IsTxnDetails = false;
                                                var ledId = 0;
                                                accTxnItems.Amount = (double)gritm.TotalAmount;
                                                ledId = GetSubCategoryLedgerId(gritm.GoodsReceiptItemId, currHospitalId);
                                                accTxnItems.DrCr = ruleRow.DrCr;
                                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                transaction.TransactionItems.Add(accTxnItems);
                                            });                                            
                                        }
                                        else if (ruleRow.Description == "INVConsumptionInventoryLG")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            accTxnItems.IsTxnDetails = false;
                                            var ledId = 0;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId); ; //ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }                                       
                                    });
                                }
                                break;
                            }

                        case "INVStockManageOut":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVStockManageOut").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVStockManageOut").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionType = record.TransactionType;
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        // DR: 
                                        if (ruleRow.Description == "INVConsumptionParent")
                                        {
                                            record.GoodsReceiptItem.ForEach(gritm => {
                                                var accTxnItems = new TransactionItemModel();
                                                accTxnItems.IsTxnDetails = false;
                                                var ledId = 0;
                                                accTxnItems.Amount = (double)gritm.TotalAmount;
                                                ledId = GetSubCategoryLedgerId(gritm.GoodsReceiptItemId, currHospitalId);
                                                accTxnItems.DrCr = ruleRow.DrCr;
                                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                transaction.TransactionItems.Add(accTxnItems);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVConsumptionInventoryLG")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            accTxnItems.IsTxnDetails = false;
                                            var ledId = 0;
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId); ; //ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                    });
                                }
                                break;
                            }
                    }

                    if (CheckValidTxn(transaction, currHospitalId))
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
        private static int GetLedgerIdFromVendor(int VendorId, int ledgerGroupId, string VendorName, int currHospitalId)
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
                    tempLed.IsMapLedger = true;
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
                        // AddLedgersFromAcc(currHospitalId); // Vikas: 23Jul2020 : To display unavailble list on clien side

                    }
                    //return vendorLedger.Find(a => a.VendorId == VendorId).LedgerId;                  
                    return 0;
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
        private static bool GetPharmacyData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                DataSet dataset = PhrmTxnItemsDateWise(SelectedDate, currHospitalId);
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
                        //a.VoucherId = RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value;
                        //a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in invItem)
                    {
                        if(itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }                       
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in invRTItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
                    }
                }
                var goodsReceiptItems = (from gr in PHRMGoodsReceipt.AsEnumerable()
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
                                             DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in GrItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
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
                                                (Convert.ToDateTime(ret.CreatedOn).Date >= SelectedDate && Convert.ToDateTime(ret.CreatedOn).Date <= SelectedDate)
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in returnItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in wffItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in dispatch)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
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
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in dispatchret)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
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
        private static List<TransactionModel> MapPharmacyData(int fiscalYearId, int currHospitalId)
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
                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
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
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1CashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                        //    accTxnItems.DrCr = ruleRow.DrCr;
                                        //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //    transaction.TransactionItems.Add(accTxnItems);
                                        //}
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        //ajay 26 Jun
                                        //if (ruleRow.Description == "PHRMCashInvoice2CashInHand")
                                        //{
                                        //    accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;//+ record.VATAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
                                        //}
                                        //else if (ruleRow.Description == "PHRMCashInvoice2SundryDebtors")
                                        //{
                                        //    accTxnItems.Amount = (double)record.SalesAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
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
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId);
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
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)record.SalesAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName, currHospitalId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.TotalAmount - record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double?)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName, currHospitalId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.SalesAmount + (double)record.VATAmount - (double)record.DiscountAmount : (double)record.TotalAmount - (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double?)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1CashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.TradeDiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount : (double)(record.SalesAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromPhrm.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks + record.CreatedOn;
                                    transaction.SectionId = 3;
                                    transaction.TransactionDate = record.CreatedOn;
                                    transaction.VoucherHeadId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn2CostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.GrCOGSAmount : (double)record.GrCOGSAmount + (double)record.GrVATAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                            // accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierCashInHand")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDiscountIncome")
                                        {
                                            accTxnItems.Amount = (double)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.SupplierId = record.SupplierId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierSundryCreditors")
                                        {
                                            accTxnItems.Amount = (double)(record.SalesAmount - record.DiscountAmount) + (double)record.VATAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (double)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMWriteOffCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = (double)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                    }
                    if (CheckValidTxn(transaction, currHospitalId))
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
        #endregion

        #region incentive get,map and transfer data 
        //method for get incentive data 
        private static bool GetInectiveTxnData(DateTime selectedDate, int currHospitalId)
        {
            try
            {
                DataSet dataset = IncetiveTxnDateWise(selectedDate, currHospitalId);
                List<ConsultantIncentiveModel> IncentiveTxnData = new List<ConsultantIncentiveModel>();
                var consultantData = DataTableToList.ToDynamic(dataset.Tables[0]);
                IncentiveTxnData = new List<ConsultantIncentiveModel>();
                // var ConsultantIncentive = consultantData.AsEnumerable().ToList();

                var ConsultantIncentive = (from invc in consultantData.AsEnumerable()
                                           select new
                                           {
                                               TransactionDate = invc.TransactionDate,
                                               TransactionType = (invc.TransactionType),
                                               ReferenceIds = invc.ReferenceIds,
                                               Remarks = (invc.Remarks == DBNull.Value) ? string.Empty : invc.Remarks.ToString(), //   p.Remarks,
                                               EmployeeName = invc.EmployeeName,
                                               EmployeeId = invc.EmployeeId,
                                               TotalAmount = invc.TotalAmount,
                                               TotalTDS = invc.TotalTDS
                                           }).ToList();
                if (ConsultantIncentive.Count > 0)
                {
                    List<ConsultantIncentiveModel> inctvTxn = new List<ConsultantIncentiveModel>();
                    inctvTxn = ConsultantIncentive.Select(p => new ConsultantIncentiveModel()
                    {
                        TransactionDate = p.TransactionDate,
                        TransactionType = p.TransactionType,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        EmployeeName = p.EmployeeName,
                        EmployeeId = p.EmployeeId,
                        TotalAmount = p.TotalAmount,
                        TotalTDS = p.TotalTDS
                    }).ToList();

                    inctvTxn.ForEach(a =>
                    {
                        a.VoucherId = (int)RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId;
                        a.VoucherName = voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName;
                    });

                    foreach (var itm in inctvTxn)
                    {
                        IncentiveTxnData.Add(itm);
                    }
                }

                INCTVConsultantIncentive = IncentiveTxnData;
                if (INCTVConsultantIncentive.Count > 0)
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

        //method for incentive mapping
        private static List<TransactionModel> MapIncentiveData(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var accTxnFromINCV = new List<TransactionModel>();
                for (int i = 0; i < INCTVConsultantIncentive.Count; i++)
                {
                    var record = INCTVConsultantIncentive[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = "";
                    transaction.SectionId = 5;
                    transaction.TransactionDate = record.TransactionDate;
                    transaction.VoucherHeadId = 0;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    transaction.TransactionLinks.Add(txnLink);

                    switch (record.TransactionType)
                    {
                        case "ConsultantIncentive":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "ConsultantIncentive").VoucherId;
                                transaction.VoucherNumber = record.VoucherName;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "ConsultantIncentive").MappingDetail;
                                if (transferRule1.Count > 0)
                                {

                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;                                       
                                        transaction.TransactionType = record.TransactionType;
                                        var isMinus = (record.TotalAmount < 0) ? true : false;
                                        if (ruleRow.Description == "ConsultantIncentiveMEDICALDIRECTEXPENSES" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount =  record.TotalAmount+ record.TotalTDS;                                           
                                            ledId = GetLedgerId(GetLedgerName("EE_MEDICAL_DIRECT_EXPENSESCOMMISSION_EXPENSES_(TECHNICAL_DISTRIBUTION)", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "ConsultantIncentiveCONSULTANTTDS" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = record.TotalTDS;
                                            ledId = GetLedgerId(GetLedgerName("LCL_CONSULTANT_TDSCONSULTANT_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId.Value, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "ConsultantIncentiveCONSULTANT(CREDITA/C)" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerIdFromConsultant(record.EmployeeId, ruleRow.LedgerGroupId.Value, currHospitalId);
                                        }
                                        
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        if (isMinus==true)
                                        {
                                            accTxnItems.DrCr = (ruleRow.DrCr == true ) ? false : true;
                                            accTxnItems.Amount = Convert.ToDouble( Decimal.Negate(Convert.ToDecimal( accTxnItems.Amount.Value)));
                                        }
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });

                                   
                                }                                
                                break;
                            }

                    }
                    if (CheckValidTxn(transaction, currHospitalId))
                    {
                        accTxnFromINCV.Add(transaction);
                    }
                    else
                    {
                        transaction = new TransactionModel();
                    }
                }

                Transaction = accTxnFromINCV;
                return Transaction;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //method for get vendor as a ledgerrecord.SupplierId, ruleRow.LedgerGroupId.Value, record.SupplierName
        private static int GetLedgerIdFromSupplier(int? supplierid, int ledgerGroupId, string SupplierName, int currHospitalId)
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
                    tempLed.IsMapLedger = true;
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
                        //  AddLedgersFromAcc(currHospitalId); // Vikas: 23Jul2020 : To display unavailble list on clien side
                    }
                    //  return supplierLedger.Find(a => a.SupplierId == supplierid).LedgerId;
                    return 0;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        //method for Billing credit organization as Ledger
        private static int GetLedgerIdFromConsultant(int? empId, int ledgerGroupId, int currHospitalId)
        {
            try
            {
                bool checkFlag = false;
                if (EmployeeLedger.Count > 0)
                {
                    checkFlag = EmployeeLedger.Exists(a => a.EmployeeId == empId);
                }
                if (checkFlag == true)
                {
                    return EmployeeLedger.Find(a => a.EmployeeId == empId).LedgerId;
                }
                else
                {
                    var employee = (from c in accountingDBContext.Emmployees
                                    select c).ToList();
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = employee.Where(c => c.EmployeeId == empId).FirstOrDefault().FullName;
                    tempLed.LedgerReferenceId = empId;
                    tempLed.LedgerType = "consultant";
                    bool flag = true;
                    tempLed.IsMapLedger = true;
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
                        //AddLedgersFromAcc(currHospitalId); // Vikas: 23Jul2020 : To display unavailble list on clien side

                    }
                    //return EmployeeLedger.Find(a => a.EmployeeId == empId).LedgerId;
                    return 0;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Get phrm TxnItems datewise for transfer to accounting 
        //Get phrm TxnItems datewise for transfer to accounting
        //NBB-This function get data from more than one (Invoice, return, deposit, etc) table data so it's slow in entity framework
        //because of this reason we are getting from database stored procedure
        public static DataSet PhrmTxnItemsDateWise(DateTime SelectedDate, int currHospitalId)
        {
            //  AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@TransactionDate", SelectedDate.Date),
                    new SqlParameter("@HospitalId", currHospitalId)
                };
            DataSet phrmTxn = DALFunctions.GetDatasetFromStoredProc("SP_ACC_GetPharmacyTransactions", paramList, accountingDBContext);
            return phrmTxn;
        }
        #endregion

        #region Get incentive TxnItems datewise for transfer to accounting 
        public static DataSet IncetiveTxnDateWise(DateTime SelectedDate, int currHospitalId)
        {
            //  AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@TransactionDate", SelectedDate),
                };
            DataSet inctvTxn = DALFunctions.GetDatasetFromStoredProc("SP_INCTV_ACC_GetTransactionInfoForAccTransfer", paramList, accountingDBContext);
            return inctvTxn;
        }
        #endregion
        public class VoucherNum
        {
            public int VoucherId { get; set; }
            public DateTime TransactionDate { get; set; }
            public string VoucherNumber { get; set; }
        }

        #region Get FiscalYearId by Date
        /// <summary>
        /// this function will return fiscal yar id by date
        /// </summary>
        /// <param name="accountingdBContext"></param>
        /// <param name="date"></param>
        /// <param name="currHospitalId"></param>
        /// <returns></returns>
        public static int GetFiscalYearIdByDate(AccountingDbContext accountingdBContext, DateTime? date, int currHospitalId)
        {            
            var fiscalYearId = accountingdBContext.FiscalYears.Where(f => f.StartDate <= date && f.EndDate >= date && f.HospitalId == currHospitalId && f.IsActive == true).Select(fs => fs.FiscalYearId).FirstOrDefault();
            return fiscalYearId;
        }
        #endregion
        public static bool LedgerAddUpdateInBalanceHisotry(LedgerModel ledgerModel, AccountingDbContext accountingDBContext, bool IsBackDateEntry, int currHospitalId,int CurrentUserId)
        {
            try
            {
                // Get PrimaryGroups by code.
                var ledGroup = accountingDBContext.LedgerGroups.Where(lg => lg.LedgerGroupId == ledgerModel.LedgerGroupId
                && lg.HospitalId == currHospitalId).FirstOrDefault();

                //update ledger details in balance history table
                // Update Ledger method will update OpeningBalance, OpeningBalanceType,etc
                var currentFiscalYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                var FYId= GetFiscalYearIdForOpeningBalance(accountingDBContext, currentFiscalYearId, currHospitalId);
                var existLed = accountingDBContext.LedgerBalanceHistory.Where(l => l.LedgerId == ledgerModel.LedgerId && l.FiscalYearId == FYId).FirstOrDefault();
                if (existLed != null)
                {
                    existLed.OpeningBalance = ledgerModel.OpeningBalance;//NageshBB-21Ju'20 for now we are taking as per client opening balance  (ledGroup.PrimaryGroup == "ASSETS" || ledGroup.PrimaryGroup == "LIABILITIES") ?
                    existLed.OpeningDrCr = ledgerModel.DrCr;
                    existLed.HospitalId = currHospitalId;
                    existLed.ModifiedOn = DateTime.Now;
                    existLed.ModifiedBy = CurrentUserId;
                    accountingDBContext.LedgerBalanceHistory.Attach(existLed);
                    accountingDBContext.Entry(existLed).Property(x => x.ModifiedOn).IsModified = true;
                    accountingDBContext.Entry(existLed).Property(x => x.ModifiedBy).IsModified = true;
                    accountingDBContext.Entry(existLed).Property(x => x.OpeningBalance).IsModified = true;
                    accountingDBContext.Entry(existLed).Property(x => x.OpeningDrCr).IsModified = true;

                }
                else
                {
                    var fYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                    LedgerBalanceHistoryModel ledgerBalanceHistory = new LedgerBalanceHistoryModel();
                    ledgerBalanceHistory.LedgerId = ledgerModel.LedgerId;
                    ledgerBalanceHistory.FiscalYearId = GetFiscalYearIdForOpeningBalance(accountingDBContext, fYearId, currHospitalId);
                    ledgerBalanceHistory.OpeningBalance = ledgerModel.OpeningBalance;//NageshBB-21Ju'20 for now we are taking as per client opening balance  (ledGroup.PrimaryGroup == "ASSETS" || ledGroup.PrimaryGroup == "LIABILITIES") ?
                    ledgerBalanceHistory.OpeningDrCr = ledgerModel.DrCr;
                    ledgerBalanceHistory.CreatedOn = DateTime.Now.Date;
                    ledgerBalanceHistory.CreatedBy = ledgerModel.CreatedBy;
                    ledgerBalanceHistory.HospitalId = currHospitalId;
                    accountingDBContext.LedgerBalanceHistory.Add(ledgerBalanceHistory);
                }
                accountingDBContext.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }

        #region GET Provisional Ledger Coode 
        /// <summary>
        /// LedgerCode only integer but we are saving as string format should like 1001,1002....
        /// code start from 1001
        /// </summary>
        /// <param name="accountingDBContext"></param>
        /// <param name="currHospitalId"></param>
        /// <returns></returns>
        public static string GetProvisionalLedgerCode(AccountingDbContext accountingDBContext, int currHospitalId)
        {
            try
            {
                var code = (from led in accountingDBContext.Ledgers
                            where led.HospitalId == currHospitalId
                            select led.Code).ToList().Max();
                if (code != null && code.Length > 0)
                {
                    code = Convert.ToString(Convert.ToInt32(code) + 1);
                }
                else
                {
                    //get default starting ledger code from parameter if not have value into parameter table then set 1001 as default
                    var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "MinimumLedgerCode").FirstOrDefault().ParameterValue;
                    if (paraValue != "")
                    {
                        code = paraValue;
                    }
                    else
                    {
                        code = "1001";//starting ledger from 1001
                    }
                }
                return code.ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        //NageshBB - 03 Jul 2020 
        #region Get correct FiscalYearId for oening balance 
        /// <summary>
        ///if selected fiscal year is closed then we will get opening balance of this closed fiscal year 
        ///but if we selected toDate and previous fiscal year is not closed then we will get opening balance from last opened fiscal year
        ///here is all logic and we will send fiscal year id for get opening balance 
        /// </summary>
        /// <param name="accountingDbContext"></param>
        /// <param name="selFiscalYearId"></param>
        /// <param name="currHospitalId"></param>
        /// <returns></returns>
        public static int GetFiscalYearIdForOpeningBalance(AccountingDbContext accountingDbContext, int selFiscalYearId, int currHospitalId)
        {
            try
            {
                int correctFiscalYearId = 0;
                var fiscalYear = (from fy in accountingDbContext.FiscalYears
                                  where fy.FiscalYearId == selFiscalYearId && fy.HospitalId == currHospitalId
                                  select fy).FirstOrDefault();
                //if selFiscalYear is closed current or any then return this closed fiscal year id
                if (fiscalYear.IsClosed == true)
                {
                    correctFiscalYearId = fiscalYear.FiscalYearId;
                }
                else
                {
                    //means fiscal year is not closed . 
                    //In this case check previous fiscal year . 
                    //if previous fiscal year not found or closed then send current fiscal year id .                     
                    var preFiscalYearId = GetFiscalYearIdByDate(accountingDbContext, fiscalYear.StartDate.AddDays(-10), currHospitalId);
                    if (preFiscalYearId > 0)
                    {
                        var preFYear = (from fy in accountingDbContext.FiscalYears
                                        where fy.FiscalYearId == preFiscalYearId && fy.HospitalId == currHospitalId
                                        select fy).FirstOrDefault();
                        correctFiscalYearId = (preFYear.IsClosed == true) ? selFiscalYearId : preFYear.FiscalYearId;
                    }
                    else
                    {
                        correctFiscalYearId = selFiscalYearId;
                    }
                }
                return correctFiscalYearId;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        //NagesehBB - 24 Jul 2020
        #region Get accounting primary hospital id . this is used for other module where we have 2 tenants
        public static int GetAccPrimaryHospitalId(AccountingDbContext _accDbContext)
        {
            try
            {
                var accHospital  = _accDbContext.CFGParameters.Where(a => a.ParameterGroupName.ToLower() == "accounting" && a.ParameterName.ToLower() == "accprimaryhospitalshortname").FirstOrDefault().ParameterValue;
                var hospId = (from h in _accDbContext.Hospitals
                              where h.HospitalShortName.ToLower() == accHospital.ToLower() && h.IsActive == true
                              select h.HospitalId).FirstOrDefault();
                return hospId;                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

    }
}
