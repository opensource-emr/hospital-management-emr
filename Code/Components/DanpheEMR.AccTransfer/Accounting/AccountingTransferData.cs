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
using DanpheEMR.ServerModel.AccountingModels.DTOs;

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
        static private List<AccountingSync_DTO> BillingTxnSyncList = new List<AccountingSync_DTO>();
        static private List<AccountingSync_DTO> PharmacyTxnSyncList = new List<AccountingSync_DTO>();
        static private List<AccountingSync_DTO> InventoryTxnSyncList = new List<AccountingSync_DTO>();
        static private List<InventoryVendorLedger_DTO> vendorLedger = new List<InventoryVendorLedger_DTO>();
        static private List<PharmacySupplierLedger_DTO> supplierLedger = new List<PharmacySupplierLedger_DTO>();
        static private List<GoodsReceiptModel> InvGoodRecipt = new List<GoodsReceiptModel>();
        static private List<PHRMGoodsReceiptModel> PHRMGoodreceipt = new List<PHRMGoodsReceiptModel>();
        static private List<HospitalModel> ACCHospital = new List<HospitalModel>();
        static private List<AccSectionModel> SectionList = new List<AccSectionModel>();
        static private List<LedgerMappingModel> BillingCreditOrganizations = new List<LedgerMappingModel>();
        static private List<LedgerMappingModel> PHRMCreditOrganizations = new List<LedgerMappingModel>();
        static private List<LedgerMappingModel> INVOtherChargeList = new List<LedgerMappingModel>();
        static private List<ConsultantIncentiveModel> INCTVConsultantIncentive = new List<ConsultantIncentiveModel>();
        static private List<ConsultantLedger_DTO> ConsultantLedger = new List<ConsultantLedger_DTO>();
        static private List<ServiceDepartmentModel> ServiceDepartment = new List<ServiceDepartmentModel>();
        static private List<BillServiceItemModel> BillItems = new List<BillServiceItemModel>();
        static private List<ItemSubCategoryMasterModel> InventorySubCategory = new List<ItemSubCategoryMasterModel>();
        static private List<AccountingBillLedgerMappingModel> BillingIncomeLedger = new List<AccountingBillLedgerMappingModel>();
        static int EmployeeId;
        static private bool IsVatRegistered;
        ///for check true of false in maping tbl
        static private bool IsCustomVoucher;
        //static private List<AccPaymentModeDataViewModel> PaymentModeData = new List<AccPaymentModeDataViewModel>();
        //static private List<AccPaymentModeDataViewModel> PHRM_PaymentMode_Data = new List<AccPaymentModeDataViewModel>();
        static private List<InvOtherCharegeViewModel> INV_OtherCharegeData = new List<InvOtherCharegeViewModel>();
        static private List<SubLedgerModel> SubLedgerList = new List<SubLedgerModel>();



        //   DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        private static AccountingDbContext accountingDBContext;
        private static InventoryDbContext inventoryDbContext;
        public static PharmacyDbContext pharmacyDbContext;
        public static BillingDbContext billingDbContex;
        public static JObject InvetoryIntegrationParameters;
        public AccountingTransferData(string connString, int employeeId, int currHospitalId)
        {
            EmployeeId = employeeId;
            accountingDBContext = new AccountingDbContext(connString);
            inventoryDbContext = new InventoryDbContext(connString);
            pharmacyDbContext = new PharmacyDbContext(connString);
            billingDbContex = new BillingDbContext(connString);
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

            SubLedgerList = accountingDBContext.SubLedger.AsNoTracking().ToList();

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
                                                  LedgerName = credOrg.OrganizationName,
                                                  SubLedgerId = ledM.SubLedgerId
                                              }).ToList();

            BillingCreditOrganizations = billingCreditOrganizations.Select(p => new LedgerMappingModel()
            {
                ReferenceId = p.OrganizationId,
                LedgerName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
                SubLedgerId = p.SubLedgerId
            }).ToList();

            // Get Pharmacy credit organization                     
            var PHRM_CreditOrganizations = (from ledM in accountingDBContext.LedgerMappings
                                              join credOrg in accountingDBContext.PHRMCreditOrganization on ledM.ReferenceId equals credOrg.OrganizationId
                                              join led in accountingDBContext.Ledgers on ledM.LedgerId equals led.LedgerId
                                              where ledM.LedgerType == "PHRMCreditOrganization" && led.IsActive == true
                                              select new
                                              {
                                                  credOrg.OrganizationId,
                                                  ledM.LedgerId,
                                                  ledM.LedgerType,
                                                  LedgerName = credOrg.OrganizationName
                                              }).ToList();

            PHRMCreditOrganizations = PHRM_CreditOrganizations.Select(p => new LedgerMappingModel()
            {
                ReferenceId = (int)p.OrganizationId,
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


            // Get Inventory Other Charge                     
            var INV_OtherCharge = (from ledM in accountingDBContext.LedgerMappings
                                            join invCharge in accountingDBContext.InvCharges on ledM.ReferenceId equals invCharge.ChargeId
                                            join led in accountingDBContext.Ledgers on ledM.LedgerId equals led.LedgerId
                                            where ledM.LedgerType == "INVOtherCharge" && led.IsActive == true
                                            select new
                                            {
                                                invCharge.ChargeId,
                                                ledM.LedgerId,
                                                ledM.LedgerType,
                                                LedgerName = invCharge.ChargeName
                                            }).ToList();

            INVOtherChargeList = INV_OtherCharge.Select(p => new LedgerMappingModel()
            {
                ReferenceId = (int)p.ChargeId,
                LedgerName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
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
                                         LedgerName = emp.FullName,
                                         ledM.SubLedgerId
                                     }).ToList();

            ConsultantLedger = consultantLedgers.Select(p => new ConsultantLedger_DTO()
            {
                EmployeeId = p.EmployeeId,
                FullName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
                SubLedgerId = p.SubLedgerId
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
                                LedgerName = s.SupplierName,
                                SubLedgerId = m.SubLedgerId
                            }).ToList();
            supplierLedger = supplier.Select(a => new PharmacySupplierLedger_DTO
            {
                SupplierId = a.SupplierId,
                SupplierName = a.LedgerName,
                LedgerId = a.LedgerId,
                LedgerType = a.LedgerType,
                SubLedgerId = a.SubLedgerId
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
                              LedgerName = v.VendorName,
                              m.SubLedgerId
                          }).ToList();
            vendorLedger = vendor.Select(p => new InventoryVendorLedger_DTO()
            {
                VendorId = p.VendorId,
                VendorName = p.LedgerName,
                LedgerId = p.LedgerId,
                LedgerType = p.LedgerType,
                SubLedgerId = p.SubLedgerId
            }).ToList();

            var billingIncomeLedger = (from m in accountingDBContext.AccountBillLedgerMapping
                                       join led in accountingDBContext.Ledgers on m.LedgerId equals led.LedgerId
                                       where led.IsActive == true
                                       select new
                                       {
                                           m.ItemId,
                                           m.LedgerId,
                                           m.ServiceDepartmentId,
                                           LedgerName = led.LedgerName,
                                           HospitalId = m.HospitalId
                                       }).ToList();
            BillingIncomeLedger = billingIncomeLedger.Select(p => new AccountingBillLedgerMappingModel()
            {
                ItemId = p.ItemId,
                LedgerName = p.LedgerName,
                LedgerId = p.LedgerId,
                HospitalId = p.HospitalId,
                ServiceDepartmentId = p.ServiceDepartmentId
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
                isInv = GetInventoryTransactionData(SelectedDate, currHospitalId);
                if (isInv)
                {
                    txn = MapInventoryVoucher(FiscalYearId, currHospitalId);
                }
            }

            //Billing Section
            else if (sectionId == 2)
            {

                isbilling = GetBillingIncomeVoucherData(SelectedDate, currHospitalId);
                if (isbilling)
                {
                    //PaymentModeData = GetPaymentModeData(SelectedDate, currHospitalId);
                    txn = MapBillingIncomeVoucher(FiscalYearId, currHospitalId);
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
                isPhrm = GetPharmacyTransactionData(SelectedDate, currHospitalId);
                if (isPhrm)
                {
                    //PHRM_PaymentMode_Data = GetPharmacyPaymentModeData(SelectedDate, currHospitalId);
                    txn = MapPharmacyVoucher(FiscalYearId, currHospitalId);
                }
            }

            return txn;
        }

        private static List<AccPaymentModeDataViewModel> GetPaymentModeData(DateTime SelectedDate, int currHospitalId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@TransactionDate", SelectedDate.Date),
                    new SqlParameter("@HospitalId", currHospitalId)
                };
            DataTable dtPaymentModeTxn = DALFunctions.GetDataTableFromStoredProc("SP_ACC_Bill_GetPaymentModeAmountDateWise", paramList, accountingDBContext);

            var dataList = DataTableToList.ToDynamic(dtPaymentModeTxn);
            var PaymentModeDataList = dataList.Select(a => new AccPaymentModeDataViewModel
            {
                PaymentSubCategoryName = a.PaymentSubCategoryName,
                TransactionType = a.TransactionType,
                TotalAmount =(decimal) a.TotalAmount,
                LedgerId = a.LedgerId,
                OrganizationId = a.OrganizationId is DBNull ? null : a.OrganizationId
            }).ToList();
            return PaymentModeDataList;
        }

        //  method for ledger name for mapping to rules
        #region Method to Get Pharmachy Paymentmode wise collection
        private static List<AccPaymentModeDataViewModel> GetPharmacyPaymentModeData(DateTime SelectedDate, int currHospitalId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>()
                {
                    new SqlParameter("@TransactionDate", SelectedDate.Date),
                    new SqlParameter("@HospitalId", currHospitalId)
                };
            DataTable dtPaymentModeTxn = DALFunctions.GetDataTableFromStoredProc("SP_ACC_Bill_GetPharmacyPaymentModeWiseData", paramList, accountingDBContext);

            var dataList = DataTableToList.ToDynamic(dtPaymentModeTxn);
            var PaymentModeDataList = dataList.Select(a => new AccPaymentModeDataViewModel
            {
                PaymentSubCategoryName = a.PaymentSubCategoryName,
                TransactionType = a.TransactionType,
                TotalAmount = a.TotalAmount,
                LedgerId = a.LedgerId,
                OrganizationId = a.OrganizationId is DBNull ? null : a.OrganizationId,
                SubLedgerId = a.SubLedgerId,
            }).ToList();
            return PaymentModeDataList;
        }
        #endregion
        private static string GetLedgerName(string name, int currHospitalId)
        {
            try
            {
                //string ledgerName ;
                var ledger = LedgerList.Find(a => a.Name == name);
                if(ledger != null)
                {
                    return ledger.LedgerName;                   

                }
                else
                {
                    throw new Exception(name + " Ledger not found");
                }
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

        public static int GetDefaultSubLedgerId(int LedgerId)
        {
            try
            {
                if (LedgerId > 0)
                {
                    var subLedger = SubLedgerList.Where(a => a.LedgerId == LedgerId && a.IsDefault == true).FirstOrDefault();
                    if (subLedger != null)
                    {
                        return subLedger.SubLedgerId;
                    }
                    else
                    {
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

        public static int GetSubLedgerIdFromSubLedgerName(string name, int LedgerId)
        {
            try
            {
                if (name != null)
                {
                    var subLedger = SubLedgerList.Where(a => a.LedgerId == LedgerId && a.SubLedgerName.ToLower() == name.ToLower()).FirstOrDefault();
                    if (subLedger != null)
                    {
                        return subLedger.SubLedgerId;
                    }
                    else
                    {
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
                    if (accTxnItm.TransactionType == "DepositDeduct" || accTxnItm.TransactionType == "DiscountReturn") flag = true;
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
                            var EnableVoucherVerificationParam = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "EnableVoucherVerification").FirstOrDefault();
                            //here transaction list from billing or may be from inventory
                            //1-sectionId for inventory 2-sectionid for billing
                            var sectionId = Transaction[0].SectionId;
                            var IsingalVoucher = Convert.ToBoolean(InvetoryIntegrationParameters["IsSingalVoucher"].ToString());
                            var distinctVoucherIdAndDate = (from txn in Transaction
                                                            where txn.TransactionType !="DepositDeduct" && txn.TransactionType != "DiscountReturn"
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

                                var vNumber = GetVoucherNumber(accountingDBContext, distinctVoucherIdAndDate[p].VoucherId, distinctVoucherIdAndDate[p].TransactionDate, sectionId, false, currHospitalId);
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
                                    txn.IsReverseTxnAllow = true;
                                   if(txn.TransactionType != "DepositDeduct" && txn.TransactionType != "DiscountReturn") // ignoring Deposit Deduct and DiscountReturn transaction - Bikash,14thMarch
                                   {
                                        txn.IsCustomVoucher = IsCustomVoucher;
                                        txn.TUId = Tuid;
                                        txn.IsActive = true;
                                        if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                                        {
                                            txn.Status = ENUM_ACC_VoucherStatus.Draft;
                                        }
                                        else
                                        {
                                            txn.Status = ENUM_ACC_VoucherStatus.Verified;
                                            txn.IsVerified = true;
                                            txn.VerifiedBy = EmployeeId;
                                            txn.VerifiedOn = DateTime.Now;
                                            txn.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                                        }
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
                                   }
                                });
                                accountingDBContext.SaveChanges();
                                List<string> TransactionType = new List<string>();
                                var distinctTxnTypeList = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                                    distinctTxnTypeList.AddRange(txnType);
                                });
                                distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = new List<TransactionItemModel>();
                                    Transaction.ForEach(txn =>
                                    {
                                        var data = txn.TransactionItems.Where(item => item.TransactionType == distinctTxnTypeList[i]).ToList();
                                        filteredData.AddRange(data);
                                    });
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txnItem =>
                                    {
                                        var refId = txnItem.TransactionLinks.Select(s => s.ReferenceId).ToList();
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
                                    txn.IsReverseTxnAllow = true;
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Draft;
                                    }
                                    else
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Verified;
                                        txn.IsVerified = true;
                                        txn.VerifiedBy = EmployeeId;
                                        txn.VerifiedOn = DateTime.Now;
                                        txn.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                                    }
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
                                var distinctTxnTypeList = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                                    distinctTxnTypeList.AddRange(txnType);
                                });
                                distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = new List<TransactionItemModel>();
                                    Transaction.ForEach(txn =>
                                    {
                                        var data = txn.TransactionItems.Where(item => item.TransactionType == distinctTxnTypeList[i]).ToList();
                                        filteredData.AddRange(data);
                                    });
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txnItem =>
                                    {
                                        var refId = txnItem.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
                                    });
                                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
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
                                    txn.IsReverseTxnAllow = true;
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Draft;
                                    }
                                    else
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Verified;
                                        txn.IsVerified = true;
                                        txn.VerifiedBy = EmployeeId;
                                        txn.VerifiedOn = DateTime.Now;
                                        txn.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                                    }
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
                                var distinctTxnTypeList = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                                    distinctTxnTypeList.AddRange(txnType);
                                });
                                distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = new List<TransactionItemModel>();
                                    Transaction.ForEach(txn =>
                                    {
                                        var data = txn.TransactionItems.Where(item => item.TransactionType == distinctTxnTypeList[i]).ToList();
                                        filteredData.AddRange(data);
                                    });
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txnItem =>
                                    {
                                        var refId = txnItem.TransactionLinks.Select(s => s.ReferenceId).ToList();
                                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
                                    });
                                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                                }
                                updateReferenceIds = distinctTxnTypeList;
                                allReferenceIdWithTypeList = ReferenceIdWithTypeList;
                                accountingDBContext.SaveChanges();
                            }
                            else if (sectionId == 5)
                            {//incetive

                                Transaction.ForEach(txn =>
                                {
                                    txn.IsReverseTxnAllow = true;
                                    txn.IsCustomVoucher = IsCustomVoucher;
                                    txn.TUId = Tuid;
                                    txn.IsActive = true;
                                    if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Draft;
                                    }
                                    else
                                    {
                                        txn.Status = ENUM_ACC_VoucherStatus.Verified;
                                        txn.IsVerified = true;
                                        txn.VerifiedBy = EmployeeId;
                                        txn.VerifiedOn = DateTime.Now;
                                        txn.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                                    }
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
                                var distinctTxnTypeList = new List<string>();
                                Transaction.ForEach(txn =>
                                {
                                    var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                                    distinctTxnTypeList.AddRange(txnType);
                                });
                                distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                                Hashtable ReferenceIdWithTypeList = new Hashtable();
                                for (int i = 0; i < distinctTxnTypeList.Count; i++)
                                {
                                    var filteredData = new List<TransactionItemModel>();
                                    Transaction.ForEach(txn =>
                                    {
                                        var data = txn.TransactionItems.Where(item => item.TransactionType == distinctTxnTypeList[i]).ToList();
                                        filteredData.AddRange(data);
                                    });
                                    List<string> allReferenceIds = new List<string>();
                                    filteredData.ForEach(txnItem =>
                                    {
                                        var refId = txnItem.TransactionLinks.Select(s => s.ReferenceId).ToList();
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
        private static int GetTUID(AccountingDbContext accountingDbContext, int currHospitalId)
        {
            try
            {
                var Tuid = (from txn in accountingDBContext.Transactions
                            select txn.TUId).ToList().DefaultIfEmpty(0).Max();
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
                                   where s.SectionId == SectionId && s.HospitalId == currHospitalId
                                   select s.SectionCode).FirstOrDefault();
                if (IsSingleVoucher)
                {
                    if (sameDayMaxVNo > 0)
                    {
                        return sectionCode + '-' + voucherCode + '-' + sameDayMaxVNo;
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
                        return sectionCode + '-' + voucherCode + '-' + newNo1;
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
                txnItem.IsActive = true;
                if (txnItem.SubLedgers != null)
                {
                    txnItem.SubLedgers.ForEach(subLedgerItems =>
                    {
                        subLedgerItems.IsActive = true;
                        subLedgerItems.VoucherNo = transaction.VoucherNumber;
                        subLedgerItems.VoucherType = transaction.VoucherId;
                        subLedgerItems.VoucherDate = transaction.TransactionDate;
                        subLedgerItems.CreatedOn = DateTime.Now;
                        subLedgerItems.CreatedBy = EmployeeId;
                        subLedgerItems.HospitalId = currHospitalId;
                        subLedgerItems.DrAmount = txnItem.DrCr ? txnItem.Amount : 0;
                        subLedgerItems.CrAmount = txnItem.DrCr ? 0 : txnItem.Amount;
                        subLedgerItems.FiscalYearId = transaction.FiscalyearId;
                        subLedgerItems.CostCenterId = txnItem.CostCenterId;
                    });
                }
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
                        LedgerAddUpdateInBalanceHisotry(led, accountingDBContext, false, currHospitalId, EmployeeId);
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
                                            LedgerName = s.SupplierName,
                                            m.SubLedgerId
                                        }).ToList();
                        supplierLedger = supplier.Select(a => new PharmacySupplierLedger_DTO
                        {
                            SupplierId = a.SupplierId,
                            SupplierName = a.LedgerName,
                            LedgerId = a.LedgerId,
                            LedgerType = a.LedgerType,
                            SubLedgerId = a.SubLedgerId
                        }).ToList();
                        var vendor = (from m in accountingDBContext.LedgerMappings
                                      join v in accountingDBContext.InvVendors on m.ReferenceId equals v.VendorId
                                      where m.LedgerType == "inventoryvendor"
                                      select new
                                      {
                                          v.VendorId,
                                          m.LedgerId,
                                          m.LedgerType,
                                          LedgerName = v.VendorName,
                                          m.SubLedgerId
                                      }).ToList();
                        vendorLedger = vendor.Select(p => new InventoryVendorLedger_DTO()
                        {
                            VendorId = p.VendorId,
                            VendorName = p.LedgerName,
                            LedgerId = p.LedgerId,
                            LedgerType = p.LedgerType,
                            SubLedgerId = p.SubLedgerId
                        }).ToList();
                        var billingCreditOrganizations = (from ledM in accountingDBContext.LedgerMappings
                                                          join credOrg in accountingDBContext.BillCreditOrganizations on ledM.ReferenceId equals credOrg.OrganizationId
                                                          where ledM.LedgerType == "creditorganization"
                                                          select new
                                                          {
                                                              credOrg.OrganizationId,
                                                              ledM.LedgerId,
                                                              ledM.LedgerType,
                                                              LedgerName = credOrg.OrganizationName,
                                                              ledM.SubLedgerId
                                                          }).ToList();

                        BillingCreditOrganizations = billingCreditOrganizations.Select(p => new LedgerMappingModel()
                        {
                            ReferenceId = p.OrganizationId,
                            LedgerName = p.LedgerName,
                            LedgerId = p.LedgerId,
                            LedgerType = p.LedgerType,
                            SubLedgerId = p.SubLedgerId
                        }).ToList();

                        var consultantLedgers = (from ledM in accountingDBContext.LedgerMappings
                                                 join emp in accountingDBContext.Emmployees on ledM.ReferenceId equals emp.EmployeeId
                                                 where ledM.LedgerType == "consultant"
                                                 select new
                                                 {
                                                     emp.EmployeeId,
                                                     ledM.LedgerId,
                                                     ledM.LedgerType,
                                                     LedgerName = emp.FullName,
                                                     ledM.SubLedgerId
                                                 }).ToList();

                        ConsultantLedger = consultantLedgers.Select(p => new ConsultantLedger_DTO()
                        {
                            EmployeeId = p.EmployeeId,
                            FullName = p.LedgerName,
                            LedgerId = p.LedgerId,
                            LedgerType = p.LedgerType,
                            SubLedgerId = p.SubLedgerId
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
            BillingTxnSyncList = new List<AccountingSync_DTO>();
            PharmacyTxnSyncList = new List<AccountingSync_DTO>();
            InventoryTxnSyncList = new List<AccountingSync_DTO>();
            InvGoodRecipt = new List<GoodsReceiptModel>();
        }
        #endregion

        #region (Old Code)Get Billing data and Mapping with accounting rules for Acc Transfer, region
        // function commented by Bikash,7thMarch2022 - new function "GetBillingTxnDataNew" created for MultiplePayment Mode (cash, cheque, and other wallets like esewa, khalti, fonPay) 
        // method for get billing data 
        //private static bool GetBillingTxnData(DateTime SelectedDate, int currHospitalId)
        //{
        //    try
        //    {
        //        // isCredtiOrganizationAccounting variable to check is the credit organization wise records enable or disable. 
        //        var isCredtiOrganizationAccounting = bool.Parse(accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "isCredtiOrganizationAccounting").FirstOrDefault().ParameterValue);

        //        DataTable syncBill = accountingDBContext.BilTxnItemsDateWise(SelectedDate, currHospitalId);

        //        //NageshBB on 16 March 2020-added two line for convert datatable to list object
        //        var strDataBilling = JsonConvert.SerializeObject(syncBill, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });

        //        List<SyncBillingAccountingModel> sync = JsonConvert.DeserializeObject<List<SyncBillingAccountingModel>>(strDataBilling);

        //        // START:VIKAS:31 dec 2020: Get unique ledger group id from the parameters
        //        var Billingledgergroupuniquename = "";
        //        var BillparameterValue = accountingDBContext.CFGParameters.Where(ap => ap.ParameterGroupName == "Accounting" && ap.ParameterName == "LedgerGroupMapping").FirstOrDefault().ParameterValue;
        //        List<UniqueLedgerGroupModel> billuniqueLedger = JsonConvert.DeserializeObject<List<UniqueLedgerGroupModel>>(BillparameterValue);
        //        foreach (var data in billuniqueLedger)
        //        {
        //            if (data.LedgerType == "billingincomeledger")
        //            {
        //                Billingledgergroupuniquename = data.LedgergroupUniqueName;
        //            }
        //        }
        //        var ledgergroupId = accountingDBContext.LedgerGroups.Where(lg => lg.Name == Billingledgergroupuniquename).FirstOrDefault().LedgerGroupId;
        //        // START:VIKAS:31 dec 2020: Get unique ledger group id from the parameters

        //        ClearUnavailableLedgerList();

        //        // Findout ledgers are available in billing mapping
        //        sync.ForEach(itm =>
        //        {

        //            if (itm.TransactionType == "CashBill" || itm.TransactionType == "CreditBill"
        //            || itm.TransactionType == "CashBillReturn" || itm.TransactionType == "CreditBillReturn" )
        //            {
        //                GetLedgerIdFromServiceDepartment(itm.ServiceDepartmentId, ledgergroupId, itm.ItemId, currHospitalId);

        //            }
        //        });

        //        if (unavailableLedgerList.Count() > 0)
        //        {
        //            return false;
        //        }
        //        else
        //        {
        //            billingSyncList = new List<SyncBillingAccountingModel>();

        //            var billitm = sync.GroupBy(a => new
        //            {
        //                a.TransactionType,
        //                Convert.ToDateTime(a.TransactionDate).Date,
        //                a.LedgerId,
        //                a.CreditOrganizationId,
        //                PaymentMode = (a.PaymentMode == "card" || a.PaymentMode == "cheque") ? "bank" : a.PaymentMode
        //            })
        //                .Select(itm => new
        //                {
        //                    TransactionDate = itm.Select(a => a.TransactionDate).FirstOrDefault(),
        //                    //IncomeLedgerName = itm.Select(a => a.IncomeLedgerName).FirstOrDefault(),
        //                    TransactionType = itm.Select(a => a.TransactionType).FirstOrDefault(),
        //                    PaymentMode = itm.Select(a => a.PaymentMode).FirstOrDefault(),
        //                    SalesAmount = itm.Select(a => a.SubTotal).Sum(),
        //                    TaxAmount = itm.Select(a => a.TaxAmount).Sum(),
        //                    DiscountAmount = itm.Select(a => a.DiscountAmount).Sum(),
        //                    SettlementDiscountAmount = itm.Select(a => a.SettlementDiscountAmount).Sum(),
        //                    TotalAmountCreditBillPaid = itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.TotalAmount).Sum() - itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.SettlementDiscountAmount).Sum(),
        //                    TotalAmount = itm.Where(a => a.TransactionType != "CreditBillPaid").Select(a => a.TotalAmount).Sum(),
        //                    BillTxnItemIds = itm.Select(a => a.ReferenceId).ToList(),
        //                    BillSyncs = itm.Select(a => new { a.BillingAccountingSyncId, a.PatientId, a.TotalAmount, a.CreatedBy, a.ReferenceModelName }).ToList(),
        //                    // Remarks = "Transaction for " + itm.Select(a => a.IncomeLedgerName).FirstOrDefault()  + " income ledger : " + itm.Select(a => a.TransactionType).FirstOrDefault(),
        //                    Remarks = "Transaction for billing : " + itm.Select(a => a.TransactionType).FirstOrDefault(),
        //                    CreditOrganizationId = (isCredtiOrganizationAccounting) ? itm.Key.CreditOrganizationId : null,
        //                    ItemId = itm.Select(a => a.ItemId).FirstOrDefault(),
        //                    ServiceDepartmentId = itm.Select(a => a.ServiceDepartmentId).FirstOrDefault(),
        //                    LedgerId = itm.Select(a => a.LedgerId).FirstOrDefault(),
        //                }).OrderBy(s => s.TransactionDate).ToList();//.ThenBy(s => s.IncomeLedgerName).ToList();

        //            if (billitm.Count > 0)
        //            {
        //                var Syncbill = new List<SyncBillingAccountingModel>();
        //                Syncbill = billitm.Select(p => new SyncBillingAccountingModel()
        //                {
        //                    TransactionDate = p.TransactionDate,
        //                    //IncomeLedgerName = p.IncomeLedgerName,
        //                    TransactionType = p.TransactionType,
        //                    PaymentMode = p.PaymentMode,
        //                    SalesAmount = p.SalesAmount != null ? p.SalesAmount : 0,
        //                    TaxAmount = p.TaxAmount != null ? p.TaxAmount : 0,
        //                    SettlementDiscountAmount = p.SettlementDiscountAmount != null ? p.SettlementDiscountAmount : 0,
        //                    TotalAmount = p.TotalAmountCreditBillPaid > 0 ? p.TotalAmountCreditBillPaid : p.TotalAmount,
        //                    BillTxnItemIds = p.BillTxnItemIds,
        //                    Remarks = p.Remarks,
        //                    DiscountAmount = p.DiscountAmount != null ? p.DiscountAmount : 0,
        //                    BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
        //                    {
        //                        BillingAccountingSyncId = x.BillingAccountingSyncId,
        //                        PatientId = x.PatientId,
        //                        TotalAmount = x.TotalAmount,
        //                        CreatedBy = x.CreatedBy,
        //                        ReferenceModelName = x.ReferenceModelName,
        //                    }).ToList(),
        //                    CreditOrganizationId = p.CreditOrganizationId,
        //                    ItemId = p.ItemId,
        //                    ServiceDepartmentId = p.ServiceDepartmentId,
        //                    LedgerId = p.LedgerId
        //                }).ToList();
        //                Syncbill.ForEach(a =>
        //                {
        //                    a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
        //                    a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
        //                });
        //                //billingSyncList = Syncbill;
        //                foreach (var itm in Syncbill)
        //                {
        //                    if (itm.VoucherId != 0)
        //                    {
        //                        billingSyncList.Add(itm);
        //                    }
        //                }
        //            }
        //            if (billingSyncList.Count > 0)
        //            {
        //                return true;
        //            }
        //            else
        //            {
        //                return false;
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}

        // MapBillingTxnData function commented by Bikash,7thMarch2022 - new function "MapBillingTxnDataNew" created for MultiplePayment Mode (cash, cheque, and other wallets like esewa, khalti, fonPay) 
        //method for billing mapping
        //private static List<TransactionModel> MapBillingTxnData(int fiscalYearId, int currHospitalId)
        //{
        //    try
        //    {
        //        var accTxnFromBilling = new List<TransactionModel>();
        //        for (int i = 0; i < billingSyncList.Count; i++)
        //        {
        //            var record = billingSyncList[i];
        //            var transaction = new TransactionModel();
        //            transaction.FiscalyearId = fiscalYearId;
        //            transaction.Remarks = record.Remarks + record.TransactionDate;
        //            transaction.SectionId = 2;
        //            transaction.TransactionDate = record.TransactionDate;
        //            transaction.BillSyncs = record.BillSyncs;
        //            transaction.VoucherHeadId = 0;
        //            transaction.VoucherId = record.VoucherId;
        //            var referenceIdArray = record.BillTxnItemIds;
        //            transaction.TransactionLinks = new List<TransactionLinkModel>();
        //            TransactionLinkModel txnLink = new TransactionLinkModel();
        //            txnLink.ReferenceId = string.Join(",", referenceIdArray);
        //            transaction.TransactionLinks.Add(txnLink);


        //            switch (record.TransactionType)
        //            {
        //                case "DepositAdd":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "DepositAddCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(itm =>
        //                                    {
        //                                        TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
        //                                        accTxnItemDetail.ReferenceId = itm.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = itm.TotalAmount;
        //                                        accTxnItemDetail.Description = "DepositAdd->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "DepositAddPatientDeposits(Liability)")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(itm =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        accTxnItemDetail.ReferenceId = itm.PatientId;
        //                                        accTxnItemDetail.ReferenceType = "Patient";
        //                                        accTxnItemDetail.Amount = itm.TotalAmount;
        //                                        accTxnItemDetail.Description = "DepositAdd->Patient Deposits (Liability)->Advance From Patient";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //        accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);

        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "DepositReturn":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "DepositReturnCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "DepositReturn->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "DepositReturnPatientDeposits(Liability)")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceType = "Patient";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "DepositReturn->Patient Deposits (Liability)->Advance From Patient";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "CashBill":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "CashBillSales")
        //                                {
        //                                    accTxnItems.Amount = record.SalesAmount;
        //                                    ledId = (int)record.LedgerId;

        //                                }
        //                                else if (ruleRow.Description == "CashBillCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
        //                                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CashBill->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "CashBillDutiesandTaxes")
        //                                {
        //                                    accTxnItems.Amount = record.TaxAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                else if (ruleRow.Description == "CashBillAdministrationExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.DiscountAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                transaction.TransactionType = record.TransactionType;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "CreditBill":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        transaction.TransactionItems = new List<TransactionItemModel>();
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "CreditBillSales")
        //                                {
        //                                    accTxnItems.Amount = record.SalesAmount;
        //                                    ledId = (int)record.LedgerId;
        //                                }
        //                                else if (ruleRow.Description == "CreditBillSundryDebtors")
        //                                {
        //                                    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
        //                                    if (record.CreditOrganizationId == null)
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }
        //                                    else
        //                                    { 
        //                                        ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
        //                                    }
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        accTxnItemDetail.ReferenceId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceType = "Patient";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CreditBill->Sundry Debtors->Receivable";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "CreditBillDutiesandTaxes")
        //                                {
        //                                    accTxnItems.Amount = record.TaxAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                else if (ruleRow.Description == "CreditBillAdministrationExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.DiscountAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "CashBillReturn":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "CashBillReturnSales")
        //                                {
        //                                    accTxnItems.Amount = record.SalesAmount;
        //                                    ledId = (int)record.LedgerId;
        //                                }
        //                                else if (ruleRow.Description == "CashBillReturnCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
        //                                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CashBillReturn->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "CashBillReturnDutiesandTaxes")
        //                                {
        //                                    accTxnItems.Amount = record.TaxAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                else if (ruleRow.Description == "CashBillReturnAdministrationExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.DiscountAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "CreditBillPaid":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "CreditBillPaidCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = (record.TotalAmount - record.DiscountAmount) + record.TaxAmount;
        //                                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CreditBillPaid->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "CreditBillPaidSundryDebtors")
        //                                {
        //                                    accTxnItems.Amount = (record.TotalAmount + record.SettlementDiscountAmount) + record.TaxAmount;
        //                                    // ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
        //                                    if (record.CreditOrganizationId == null)
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }
        //                                    else
        //                                    {
        //                                        ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
        //                                    }
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //   accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceType = "Patient";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CreditBillPaid->Sundry Debtors->Receivable";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                //} else if (ruleRow.LedgerGroupName == "Duties and Taxes") {
        //                                //    accTxnItems.Amount = record.TaxAmount;
        //                                //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
        //                                //}
        //                                else if (ruleRow.Description == "CreditBillPaidAdministrationExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.SettlementDiscountAmount;
        //                                    //nbb-charak changes
        //                                    if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }
        //                                    else
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }

        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                case "CreditBillReturn":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "CreditBillReturnSales")
        //                                {
        //                                    accTxnItems.Amount = record.SalesAmount;
        //                                    ledId = (int)record.LedgerId;
        //                                }
        //                                else if (ruleRow.Description == "CreditBillReturnSundryDebtors")
        //                                {
        //                                    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
        //                                    //ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
        //                                    if (record.CreditOrganizationId == null)
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }
        //                                    else
        //                                    {
        //                                        ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
        //                                    }
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //   accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceType = "Patient";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "CreditBillReturn->Sundry Debtors->Receivable";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }
        //                                else if (ruleRow.Description == "CreditBillReturnDutiesandTaxes")
        //                                {
        //                                    accTxnItems.Amount = record.TaxAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                else if (ruleRow.Description == "CreditBillReturnAdministrationExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.DiscountAmount;
        //                                    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //                    case "DiscountReturn":
        //                    {
        //                        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
        //                        if (transferRule.Count > 0)
        //                        {
        //                            transaction.TransactionItems = new List<TransactionItemModel>();
        //                            transferRule.ForEach(ruleRow =>
        //                            {
        //                                var accTxnItems = new TransactionItemModel();
        //                                int ledId = 0;
        //                                if (ruleRow.Description == "DiscountReturnCashInHand" || ruleRow.Name == "ACA_BANK")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
        //                                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
        //                                    transaction.BillSyncs.ForEach(r =>
        //                                    {
        //                                        var accTxnItemDetail = new TransactionItemDetailModel();
        //                                        //  accTxnItemDetail.PatientId = r.PatientId;
        //                                        accTxnItemDetail.ReferenceId = r.CreatedBy;
        //                                        accTxnItemDetail.ReferenceType = "User";
        //                                        accTxnItemDetail.Amount = r.TotalAmount;
        //                                        accTxnItemDetail.Description = "DiscountReturn->Cash -> Created By";
        //                                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
        //                                    });
        //                                    accTxnItems.IsTxnDetails = true;
        //                                }                                        
        //                                else if (ruleRow.Description == "DiscountReturnAdministrativeExpenses")
        //                                {
        //                                    accTxnItems.Amount = record.TotalAmount;
        //                                    //nbb-charak changes
        //                                    if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }
        //                                    else
        //                                    {
        //                                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
        //                                    }

        //                                }
        //                                accTxnItems.DrCr = ruleRow.DrCr;
        //                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
        //                                transaction.TransactionType = record.TransactionType;
        //                                //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        //                                transaction.TransactionItems.Add(accTxnItems);
        //                            });
        //                        }
        //                        break;
        //                    }
        //            }

        //            if (CheckValidTxn(transaction, currHospitalId))
        //            {
        //                accTxnFromBilling.Add(transaction);
        //            }
        //            else
        //            {
        //                transaction = new TransactionModel();
        //            }
        //        }
        //        Transaction = accTxnFromBilling;
        //        return Transaction;
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        #endregion

        #region Billing Get and Transfer data region (New)
        private static bool GetBillingTxnDataNew(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                // isCredtiOrganizationAccounting variable to check is the credit organization wise records enable or disable. 
                var isCredtiOrganizationAccounting = bool.Parse(accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "isCredtiOrganizationAccounting").FirstOrDefault().ParameterValue);

                List<SyncBillingAccountingModel> sync = accountingDBContext.BilTxnItemsDateWise(SelectedDate, currHospitalId);

                ////NageshBB on 16 March 2020-added two line for convert datatable to list object
                //var strDataBilling = JsonConvert.SerializeObject(syncBill, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });

                //List<SyncBillingAccountingModel> sync = JsonConvert.DeserializeObject<List<SyncBillingAccountingModel>>(strDataBilling);

                // START:VIKAS:31 dec 2020: Get unique ledger group id from the parameters
                var Billingledgergroupuniquename = "";
                var BillparameterValue = accountingDBContext.CFGParameters.Where(ap => ap.ParameterGroupName == "Accounting" && ap.ParameterName == "LedgerGroupMapping").FirstOrDefault().ParameterValue;
                List<UniqueLedgerGroupVM> billuniqueLedger = JsonConvert.DeserializeObject<List<UniqueLedgerGroupVM>>(BillparameterValue);
                foreach (var data in billuniqueLedger)
                {
                    if (data.LedgerType == "billingincomeledger")
                    {
                        Billingledgergroupuniquename = data.LedgergroupUniqueName;
                    }
                }
                var ledgergroupId = accountingDBContext.LedgerGroups.Where(lg => lg.Name == Billingledgergroupuniquename).FirstOrDefault().LedgerGroupId;
                // START:VIKAS:31 dec 2020: Get unique ledger group id from the parameters

                ClearUnavailableLedgerList();

                // Findout ledgers are available in billing mapping
                sync.ForEach(itm =>
                {

                    if (itm.TransactionType == "CashBill" || itm.TransactionType == "CreditBill"
                    || itm.TransactionType == "CashBillReturn" || itm.TransactionType == "CreditBillReturn")
                    {
                        GetLedgerIdFromServiceDepartment(itm.ServiceDepartmentId, ledgergroupId, itm.ItemId, currHospitalId);

                    }
                });

                if (unavailableLedgerList.Count() > 0)
                {
                    return false;
                }
                else
                {
                    billingSyncList = new List<SyncBillingAccountingModel>();

                    var billitmT = sync.GroupBy(a => new
                    {
                        a.TransactionType,
                        Convert.ToDateTime(a.TransactionDate).Date,
                        a.CreditOrganizationId,
                        PaymentMode = (a.PaymentMode == "card" || a.PaymentMode == "cheque") ? "bank" : a.PaymentMode
                    })
                        .Select(itm => new
                        {
                            TransactionDate = itm.Select(a => a.TransactionDate).FirstOrDefault(),
                            //IncomeLedgerName = itm.Select(a => a.IncomeLedgerName).FirstOrDefault(),
                            TransactionType = itm.Select(a => a.TransactionType).FirstOrDefault(),
                            PaymentMode = itm.Select(a => a.PaymentMode).FirstOrDefault(),
                            SalesAmount = itm.Select(a => a.SubTotal).Sum(),
                            TaxAmount = itm.Select(a => a.TaxAmount).Sum(),
                            DiscountAmount = itm.Select(a => a.DiscountAmount).Sum(),
                            SettlementDiscountAmount = itm.Select(a => a.SettlementDiscountAmount).Sum(),
                            TotalAmountCreditBillPaid = itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.TotalAmount).Sum() - itm.Where(a => a.TransactionType == "CreditBillPaid").Select(a => a.SettlementDiscountAmount).Sum(),
                            TotalAmount = itm.Where(a => a.TransactionType != "CreditBillPaid").Select(a => a.TotalAmount).Sum(),
                            CoPaymentCashAmount = itm.Select(a => a.CoPaymentCashAmount).Sum(),
                            BillTxnItemIds = itm.Select(a => a.ReferenceId).ToList(),
                            BillSyncs = itm.Select(a => new { a.BillingAccountingSyncId, a.PatientId, a.TotalAmount, a.CreatedBy, a.ReferenceModelName }).ToList(),
                            // Remarks = "Transaction for " + itm.Select(a => a.IncomeLedgerName).FirstOrDefault()  + " income ledger : " + itm.Select(a => a.TransactionType).FirstOrDefault(),
                            Remarks = "Transaction for billing : " + itm.Key.TransactionType,
                            CreditOrganizationId = (isCredtiOrganizationAccounting) ? itm.Key.CreditOrganizationId : null,


                            BillTxnItms = itm.Select(a => new
                            {
                                a.LedgerId,
                                a.ItemId,
                                a.TotalAmount,
                                a.SubLedgerId
                            }).ToList()
                            .GroupBy(l => new { l.LedgerId, l.SubLedgerId })
                            .Select(i => new
                            {
                                LedgerId = i.Key.LedgerId,
                                TotalAmount = i.Select(a => a.TotalAmount).Sum(),
                                ItemId = i.Select(a => a.ItemId).FirstOrDefault(),
                                ServiceDepartmentId = itm.Select(a => a.ServiceDepartmentId).FirstOrDefault(),
                                SubLedgerId = i.Key.SubLedgerId
                            }).ToList(),

                            //LedgerIds = itm.Select(a =>a.LedgerId).Distinct().ToList(),
                        }).OrderBy(s => s.TransactionDate).ToList();//.ThenBy(s => s.IncomeLedgerName).ToList();


                    if (billitmT.Count > 0)
                    {
                        var Syncbill = new List<SyncBillingAccountingModel>();
                        Syncbill = billitmT.Select(p => new SyncBillingAccountingModel()
                        {
                            TransactionDate = p.TransactionDate,
                            //IncomeLedgerName = p.IncomeLedgerName,
                            TransactionType = p.TransactionType,
                            PaymentMode = p.PaymentMode,
                            SalesAmount = p.SalesAmount != null ? p.SalesAmount : 0,
                            TaxAmount = p.TaxAmount != null ? p.TaxAmount : 0,
                            SettlementDiscountAmount = p.SettlementDiscountAmount != null ? p.SettlementDiscountAmount : 0,
                            TotalAmount = p.TotalAmountCreditBillPaid > 0 ? p.TotalAmountCreditBillPaid : p.TotalAmount,
                            CoPaymentCashAmount = p.CoPaymentCashAmount,
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
                            CreditOrganizationId = p.CreditOrganizationId,
                            //ItemId = p.ItemId,
                            //ServiceDepartmentId = p.ServiceDepartmentId,
                            //LedgerId = p.LedgerId
                            BillTxnItms = p.BillTxnItms.Select(x => new SyncBillingAccountingModel()
                            {
                                TotalAmount = x.TotalAmount,
                                LedgerId = x.LedgerId,
                                ItemId = x.ItemId,
                                ServiceDepartmentId = x.ServiceDepartmentId,
                                SubLedgerId = x.SubLedgerId
                            }).ToList(),
                        }).ToList();
                        Syncbill.ForEach(a =>
                        {
                            a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                            a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                            if (a.TransactionType == "DepositDeduct" || a.TransactionType == "DepositDeduct") a.VoucherId = 0;

                        });
                        //billingSyncList = Syncbill;
                        foreach (var itm in Syncbill)
                        {
                            if (itm.VoucherId != 0 || (itm.VoucherId == 0 && (itm.TransactionType == "DepositDeduct" || itm.TransactionType == "DiscountReturn")))
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
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        private static bool GetBillingIncomeVoucherData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                List<SqlParameter> spParam = new List<SqlParameter>();
                spParam.Add(new SqlParameter("@TransactionDate", SelectedDate.Date));
                spParam.Add(new SqlParameter("@HospitalId", currHospitalId));
                // 1.Userwise Cash Collection : DR
                DataTable Userwise_Collection_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetUserWiseNetCollection", spParam, accountingDBContext);
                List<AccountingSync_DTO> Userwise_Collection = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(Userwise_Collection_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(Userwise_Collection);

                // 2.OPD Cash Sale : CR
                DataTable OPDSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_OPD_GetOutpatientSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> OPDSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(OPDSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(OPDSale);

                // 3.OPD Cash Sale Return : DR
                DataTable OPDSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_OPD_GetOutpatientSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> OPDSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(OPDSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(OPDSaleReturn);

                // 4.IPD Cash Sale : CR
                DataTable IPDSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_IPD_GetInpatientSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> IPDSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(IPDSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(IPDSale);

                // 5.IPD Cash Sale Return : DR
                DataTable IPDSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_IPD_GetInpatientSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> IPDSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(IPDSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(IPDSaleReturn);

                // 6. Discount : DR
                DataTable BillingDiscount_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetDiscounts", spParam, accountingDBContext);
                List<AccountingSync_DTO> BillingDiscount = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(BillingDiscount_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(BillingDiscount);

                // 7. Discount Return : CR
                DataTable BillingDiscountReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetDiscountReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> BillingDiscountReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(BillingDiscountReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(BillingDiscountReturn);

                // 8. Credit Sale : DR
                DataTable CreditSale_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetCreditOrganizationSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> CreditSale_Organization = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(CreditSale_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(CreditSale_Organization);

                // 9. Credit Sale Return : CR
                DataTable CreditSaleReturn_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetCreditOrganizationSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> CreditSaleReturn_Organization = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(CreditSaleReturn_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(CreditSaleReturn_Organization);

                // 10. Credit Sale Internal (Medicare) : DR
                DataTable CreditSaleInternal_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetInternalCreditOrganizationSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> CreditSaleInternal = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(CreditSaleInternal_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(CreditSaleInternal);

                // 11. Credit Sale Return Internal (Medicare) : CR
                DataTable CreditSaleReturnInternal_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetInternalCreditOrganizationSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> CreditSaleReturnInternal = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(CreditSaleReturnInternal_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(CreditSaleReturnInternal);

                // 12. IPD Deposit : DR
                DataTable IPDDeposit_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_IPD_GetInpatientDeposits", spParam, accountingDBContext);
                List<AccountingSync_DTO> IPDDeposit = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(IPDDeposit_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(IPDDeposit);

                // 13. IPD Deposit Adjustment : CR
                DataTable IPDDepositAdjustment_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_IPD_GetInpatientDepositReturns", spParam, accountingDBContext);
                List<AccountingSync_DTO> IPDDepositAdjustment = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(IPDDepositAdjustment_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(IPDDepositAdjustment);

                // 14. OPD Deposit : DR
                DataTable OPDDeposit_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_OPD_GetOutpatientDeposits", spParam, accountingDBContext);
                List<AccountingSync_DTO> OPDDeposit = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(OPDDeposit_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(OPDDeposit);

                // 15. OPD Deposit Adjustment : CR
                DataTable OPDDepositAdjustment_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_OPD_GetOutpatientDepositReturns", spParam, accountingDBContext);
                List<AccountingSync_DTO> OPDDepositAdjustment = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(OPDDepositAdjustment_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(OPDDepositAdjustment);

                // 15. Billing Settlement : CR
                DataTable BillingSettlement_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetSettlementTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> BillingSettlement = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(BillingSettlement_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(BillingSettlement);

                // 15. Billing Settlement Discount : DR
                DataTable BillingSettlementDiscount_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetSettlementDiscountTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> BillingSettlementDiscount = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(BillingSettlementDiscount_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(BillingSettlementDiscount);

                // 16. Billing Scheme Refund : DR
                DataTable SchemeRefund_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_BIL_GetSchemeRefundTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> SchemeRefund = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(SchemeRefund_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                BillingTxnSyncList.AddRange(SchemeRefund);

                //BillingTxnSyncList.OrderBy(a => a.DisplaySequence).ToList();

                if (BillingTxnSyncList.Count > 0 && BillingTxnSyncList.All(txn => txn.LedgerId > 0))
                {
                    return true;
                }
                BillingTxnSyncList = new List<AccountingSync_DTO>();
                return false;
            }
            catch(Exception ex)
            {
                BillingTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }

        private static bool GetPharmacyTransactionData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                List<SqlParameter> spParam = new List<SqlParameter>();
                spParam.Add(new SqlParameter("@TransactionDate", SelectedDate.Date));
                spParam.Add(new SqlParameter("@HospitalId", currHospitalId));

                // A. Sale Voucher

                // 1.Userwise Cash Collection : DR
                DataTable Userwise_Collection_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetUserWiseNetCollection", spParam, accountingDBContext);
                List<AccountingSync_DTO> Userwise_Collection = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(Userwise_Collection_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(Userwise_Collection);

                // 2.PHRM-OPD Cash Sale : CR
                DataTable PHRMOPDCashSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_OPD_CASH_GetOutpatientCashSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCashSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCashSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCashSale);

                // 3.PHRM-OPD Credit Sale  : CR
                DataTable PHRMOPDCreditSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_OPD_CREDIT_GetOutpatientCreditSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCreditSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCreditSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCreditSale);

                // 5.PHRM-OPD Cash Sale Return : DR
                DataTable PHRMOPDCashSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_OPD_CASH_GetOutpatientCashSaleReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCashSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCashSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCashSaleReturn);

                // 3.PHRM-OPD Credit Sale Return  : DR
                DataTable PHRMOPDCreditSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_OPD_CREDIT_GetOutpatientCreditSaleReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCreditSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCreditSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCreditSaleReturn);

                // 4.PHRM-IPD Cash Sale : CR
                DataTable PHRMIPDCASHSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_IPD_CASH_GetInpatientCashSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMIPDCASHSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMIPDCASHSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMIPDCASHSale);

                // 2.PHRM-IPD Credit Sale  : CR
                DataTable PHRMIPDCreditSale_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_IPD_CREDIT_GetInpatientCreditSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMIPDCreditSale = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMIPDCreditSale_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMIPDCreditSale);

                // 5.PHRM-IPD Cash Sale Return : DR
                DataTable PHRMIPDCashSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_IPD_CASH_GetInpatientCashSaleReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMIPDCashSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMIPDCashSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMIPDCashSaleReturn);

                // 3.PHRM-IPD Credit Sale Return  : DR
                DataTable PHRMIPDCreditSaleReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_IPD_CREDIT_GetInpatientCreditSaleReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMIPDCreditSaleReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMIPDCreditSaleReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMIPDCreditSaleReturn);

                // 6. Discount : DR
                DataTable PharmacyDiscount_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetDiscounts", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyDiscount = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyDiscount_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyDiscount);

                // 7. Discount Return : CR
                DataTable PHRMDiscountReturn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetDiscountReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMDiscountReturn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMDiscountReturn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMDiscountReturn);

                // 4.PHRM-OPD Credit Sale (Credit Organization Entry) : DR
                DataTable PHRMOPDCreditSaleOrganization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetCreditOrganizationSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCreditSaleOrganization = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCreditSaleOrganization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCreditSaleOrganization);

                // 4.PHRM-OPD Credit Sale Return (Credit Organization Entry) : CR
                DataTable PHRMOPDCreditSaleReturnOrganization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_CREDIT_GetCreditOrganizationSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCreditSaleReturnOrganization = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCreditSaleReturnOrganization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCreditSaleReturnOrganization);

                // 10. PHRM OPD Credit Sale Internal (Medicare) : DR
                DataTable PHRMOPDCreditSaleInternal_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetInternalCreditOrganizationSales", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDCreditSaleInternal_Organization = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDCreditSaleInternal_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDCreditSaleInternal_Organization);

                // 11. Credit Sale Return Internal (Medicare) : CR
                DataTable PHRMCreditSaleReturnInternal_Organization_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_CREDIT_GetInternalCreditOrganizationSalesReturn", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMCreditSaleReturnInternal = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMCreditSaleReturnInternal_Organization_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMCreditSaleReturnInternal);

                // 13. PHRM IPD Deposit Adjustment : DR
                DataTable PHRMIPDDepositAdjustment_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_IPD_GetOutpatientDepositReturns", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMIPDDepositAdjustment = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMIPDDepositAdjustment_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMIPDDepositAdjustment);

                // 15. PHRM OPD Deposit Adjustment : DR
                DataTable PHRMOPDDepositAdjustment_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_OPD_GetOutpatientDepositReturns", spParam, accountingDBContext);
                List<AccountingSync_DTO> PHRMOPDDepositAdjustment = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PHRMOPDDepositAdjustment_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PHRMOPDDepositAdjustment);

                // 15. Pharmacy Settlement : CR
                DataTable PharmacySettlement_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetSettlementTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacySettlement = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacySettlement_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacySettlement);

                // 15. Pharmacy Settlement Discount : DR
                DataTable PharmacySettlementDiscount_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetSettlementDiscountTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacySettlementDiscount = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacySettlementDiscount_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacySettlementDiscount);



                //B. Purchase Voucher

                // 1. Pharmacy  Good Receipt Purchase Entry : DR
                DataTable PharmacyGoodReceiptPurchase_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptPurchaseTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptPurchase = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptPurchase_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptPurchase);

                // 2. Pharmacy  Good Receipt VAT Entry : DR
                DataTable PharmacyGoodReceiptVAT_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptVATTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptVAT = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptVAT_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptVAT);

                // 2. Pharmacy  Good Receipt Supplier Entry : CR
                DataTable PharmacyGoodReceiptSupplier_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptSupplierTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptSupplier = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptSupplier_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptSupplier);


                //C. Credit Purchase Return Voucher
                //1.Pharmacy  Good Receipt Return Purchase Entry : CR
                DataTable PharmacyGoodReceiptReturnPurchase_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptReturnPurchaseTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptReturnPurchase = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptReturnPurchase_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptReturnPurchase);

                // 2. Pharmacy  Good Receipt Return VAT Entry : CR
                DataTable PharmacyGoodReceiptReturnVAT_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptReturnVATTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptReturnVAT = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptReturnVAT_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptReturnVAT);

                // 2. Pharmacy  Good Receipt Return Supplier Entry : DR
                DataTable PharmacyGoodReceiptReturnSupplier_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetGoodReceiptReturnSupplierTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyGoodReceiptReturnSupplier = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyGoodReceiptReturnSupplier_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyGoodReceiptReturnSupplier);

                // D. Consumable Dispatch To SubStore
                //1.Pharmacy Consumable Dispatch (SubStore Entry) : DR
                DataTable PharmacyDispatchSubStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetConsumableDispatchSubStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyDispatchSubStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyDispatchSubStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyDispatchSubStore);

                //2.Pharmacy Consumable Dispatch (Central Store Entry) : CR
                DataTable PharmacyDispatchCentralStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetConsumableDispatchMainStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyDispatchCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyDispatchCentralStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyDispatchCentralStore);

                // E. Consumable Dispatch Return From SubStore
                //1.Inventory Consumable Dispatch Return (Central Store Entry) : DR
                DataTable PharmacyDispatchReturnCentralStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetConsumableDispatchReturnMainStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyDispatchReturnCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyDispatchReturnCentralStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyDispatchReturnCentralStore);

                //2.Pharmacy Consumable Dispatch Return (SubStore Entry) : CR
                DataTable PharmacyDispatchReturnSubStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetConsumableDispatchReturnSubStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyDispatchReturnSubStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyDispatchReturnSubStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyDispatchReturnSubStore);

                // F. Write OFF 
                //1.Pharmacy WriteOff --CentralStore Entry : CR, --Expenses Department : DR
                DataTable PharmacyWriteOff_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetPharmacyWriteOffTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyWriteOff = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyWriteOff_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyWriteOff);

                // G.Pharmacy Stock Manage IN (Expense Entry) --CentralStore Entry : DR, --Expenses Department : CR
                DataTable PharmacyStockManageIn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetPharmacyStockManageInTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyStockManageIn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyStockManageIn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyStockManageIn);

                // G.Pharmacy Stock Manage OUT (Expense Entry) --CentralStore Entry : CR, --Expenses Department : DR
                DataTable PharmacyStockManageOut_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_PHRM_GetPharmacyStockManageOutTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> PharmacyStockManageOut = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(PharmacyStockManageOut_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                PharmacyTxnSyncList.AddRange(PharmacyStockManageOut);

                if (PharmacyTxnSyncList.Count > 0 && PharmacyTxnSyncList.All(txn => txn.LedgerId > 0))
                {
                    return true;
                }
                PharmacyTxnSyncList = new List<AccountingSync_DTO>();
                return false;
            }
            catch(Exception ex)
            {
                PharmacyTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }

        private static bool GetInventoryTransactionData(DateTime SelectedDate, int currHospitalId)
        {
            try
            {
                var vatParam = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "VatRegisteredHospital").FirstOrDefault().ParameterValue;
                var isVatRegistered = bool.Parse(vatParam);
                List<SqlParameter> spParam = new List<SqlParameter>();
                spParam.Add(new SqlParameter("@TransactionDate", SelectedDate.Date));
                spParam.Add(new SqlParameter("@HospitalId", currHospitalId));

                //A. Purchase Voucher

                // 1. Inventory Good Receipt Purchase Entry : DR
                DataTable InventoryGoodReceiptPurchase_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptPurchaseTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryGoodReceiptPurchase = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptPurchase_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryGoodReceiptPurchase);

                // 2. Inventory Good Receipt VAT Entry : DR
                if(isVatRegistered)
                {
                    DataTable InventoryGoodReceiptVAT_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptVATTransactions", spParam, accountingDBContext);
                    List<AccountingSync_DTO> InventoryGoodReceiptVAT = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptVAT_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                    InventoryTxnSyncList.AddRange(InventoryGoodReceiptVAT);
                }

                // 2. Inventory Good Receipt Vendor Entry : CR
                DataTable InventoryGoodReceiptVendor_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptVendorTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryGoodReceiptVendor = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptVendor_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryGoodReceiptVendor);


                //B. Purchase Return Voucher
                //1.Inventory Good Receipt Return Purchase Entry : CR
                DataTable InventoryGoodReceiptReturnPurchase_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptReturnPurchaseTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryGoodReceiptReturnPurchase = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptReturnPurchase_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryGoodReceiptReturnPurchase);

                // 2.Inventory Good Receipt Return VAT Entry : CR
                if (isVatRegistered)
                {
                    DataTable InventoryGoodReceiptReturnVAT_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptReturnVATTransactions", spParam, accountingDBContext);
                    List<AccountingSync_DTO> InventoryGoodReceiptReturnVAT = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptReturnVAT_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                    InventoryTxnSyncList.AddRange(InventoryGoodReceiptReturnVAT);
                }

                // 2.Inventory Good Receipt Return Vendor Entry : DR
                DataTable InventoryGoodReceiptReturnVendor_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetGoodReceiptReturnVendorTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryGoodReceiptReturnVendor = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryGoodReceiptReturnVendor_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryGoodReceiptReturnVendor);


                // C. Consumable Dispatch To SubStore
                //1.Inventory Consumable Dispatch (SubStore Entry) : DR
                DataTable InventoryDispatchSubStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumableDispatchSubStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryDispatchSubStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryDispatchSubStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryDispatchSubStore);

                //2.Inventory Consumable Dispatch (Central Store Entry) : CR
                DataTable InventoryDispatchCentralStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumableDispatchCentralStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryDispatchCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryDispatchCentralStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryDispatchCentralStore);

                // D. Consumable Dispatch Return From SubStore
                //1.Inventory Consumable Dispatch Return (SubStore Entry) : CR
                DataTable InventoryDispatchReturnSubStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumableDispatchReturnSubStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryDispatchReturnSubStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryDispatchReturnSubStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryDispatchReturnSubStore);

                //2.Inventory Consumable Dispatch Return (Central Store Entry) : DR
                DataTable InventoryDispatchReturnCentralStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumableDispatchReturnCentralStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryDispatchReturnCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryDispatchReturnCentralStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryDispatchReturnCentralStore);

                // E. Write OFF 
                //1.Inventory WriteOff --CentralStore Entry : CR, --Expenses Department : DR
                DataTable InventoryWriteOffCentralStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetInventoryWriteOffTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryWriteOffCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryWriteOffCentralStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryWriteOffCentralStore);

                // F.Inventory Stock Manage IN (Expense Entry) --CentralStore Entry : DR, --Expenses Department : CR
                DataTable InventoryStockManageIn_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetInventoryStockManageInTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryStockManageIn = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryStockManageIn_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryStockManageIn);

                // G.Inventory Stock Manage OUT (Expense Entry) --CentralStore Entry : CR, --Expenses Department : DR
                DataTable InventoryStockManageOut_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetInventoryStockManageOutTransactions", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryStockManageOut = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryStockManageOut_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryStockManageOut);

                // H.Inventory Consumption --CentralStore Entry : CR
                DataTable InventoryConsumptionCentrlStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumptionCentralStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryConsumptionCentralStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryConsumptionCentrlStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryConsumptionCentralStore);

                // I.Inventory Consumption --Expenses SubCategory/subStore : DR
                DataTable InventoryConsumptionSubStore_DataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_POST_INV_GetConsumptionSubStoreTransaction", spParam, accountingDBContext);
                List<AccountingSync_DTO> InventoryConsumptionSubStore = JsonConvert.DeserializeObject<List<AccountingSync_DTO>>(JsonConvert.SerializeObject(InventoryConsumptionSubStore_DataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" }));
                InventoryTxnSyncList.AddRange(InventoryConsumptionSubStore);

                if (InventoryTxnSyncList.Count > 0 && InventoryTxnSyncList.All(txn => txn.LedgerId > 0))
                {
                    return true;
                }
                InventoryTxnSyncList = new List<AccountingSync_DTO>();
                return false;
            }
            catch(Exception ex)
            {
                InventoryTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }
        #region Map billing data with accounting transfer rules
        private static List<TransactionModel> MapBillingTxnDataNew(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var DiscountReturnTxnData = billingSyncList.FindAll(a => a.TransactionType == "DiscountReturn");

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
                    //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.BillTxnItemIds;
                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    //transaction.TransactionLinks.Add(txnLink);
                    transaction.TransactionType = record.TransactionType;

                    switch (record.TransactionType)
                    {
                        case "DepositAdd":
                            {
                                //var DepositPaymentModes = PaymentModeData.FindAll(a=>a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        
                                        if (ruleRow.Description == "DepositAddCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            int ledId = 0;

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


                                            // DevN: 7th June '23 : We are not giving payment mode wise separate ledgers for cash now thus, commenting this code.
                                            // test
                                            //decimal TotalAmtFromPaymentMode = DepositPaymentModes.Sum(a => a.TotalAmount);

                                            //if (DepositPaymentModes.Count>0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    DepositPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.PaymentSubCategoryName != "Deposit") // Ignoring payment mode 'Deposit' during deposit add
                                            //        {

                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }                                          
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = record.TotalAmount;
                                            //    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}
                                            //

                                            accTxnItems.Amount = record.TotalAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

                                        }
                                        else if (ruleRow.Description == "DepositAddPatientDeposits(Liability)")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            int ledId = 0;

                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
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


                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //        accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        

                                    });
                                }
                                break;
                            }
                        case "DepositReturn":
                            {
                                //var DepositReturnPaymentModes = PaymentModeData.FindAll(a => a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        int ledId = 0;
                                        if (ruleRow.Description == "DepositReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {

                                            //if (DepositReturnPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    DepositReturnPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.PaymentSubCategoryName != "Deposit") // Ignoring payment mode 'Deposit' during deposit return
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = record.TotalAmount;
                                            //    var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = record.TotalAmount;
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

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
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
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


                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                       
                                    });
                                }
                                break;
                            }
                        case "CashBill":
                            {
                                //var CashBillPaymentModes = PaymentModeData.FindAll(a => a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        int ledId = 0;
                                        if (ruleRow.Description == "CashBillSales")
                                        {
                                            // create multiple transaction items for 'CashBillSales'  - Bikash,7thMarch'22
                                            record.BillTxnItms.ForEach(itms =>
                                            {
                                                var txnItms = new TransactionItemModel();
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                sLed.SubLedgerId = itms.SubLedgerId;
                                                sLed.LedgerId = (int)itms.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItms.SubLedgers = sLedgers;
                                                txnItms.CostCenterId = DefaultCostCenter.CostCenterId;
                                                txnItms.Amount = itms.TotalAmount;
                                                //ledId = (int)itms.LedgerId;
                                                txnItms.DrCr = ruleRow.DrCr;
                                                //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                txnItms.LedgerId = ((int)itms.LedgerId) > 0 ? (int)itms.LedgerId : 0;
                                                transaction.TransactionItems.Add(txnItms);
                                            });

                                        }

                                        else if (ruleRow.Description == "CashBillCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            //if (CashBillPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    CashBillPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.TotalAmount>0)
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                                    
                                            //    });
                                               
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            //    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            transaction.TransactionType = record.TransactionType;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);

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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            transaction.TransactionType = record.TransactionType;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }

                                        else if (ruleRow.Description == "CashBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            transaction.TransactionType = record.TransactionType;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }                                        

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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        int ledId = 0;
                                        if (ruleRow.Description == "CreditBillSales")
                                        {
                                            record.BillTxnItms.ForEach(itms =>
                                            {
                                                var txnItms = new TransactionItemModel();
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                sLed.SubLedgerId = itms.SubLedgerId;
                                                sLed.LedgerId = (int)itms.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItms.SubLedgers = sLedgers;
                                                txnItms.CostCenterId = DefaultCostCenter.CostCenterId;
                                                txnItms.Amount = itms.TotalAmount;
                                                //ledId = (int)itms.LedgerId;
                                                txnItms.DrCr = ruleRow.DrCr;
                                                //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                txnItms.LedgerId = ((int)itms.LedgerId) > 0 ? (int)itms.LedgerId : 0;
                                                transaction.TransactionItems.Add(txnItms);
                                            });
                                        }
                                        else if (ruleRow.Description == "CreditBillSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount - record.CoPaymentCashAmount + record.TaxAmount);
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ?(int)sub_Ledger.SubLedgerId : 0;
                                            }
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "CreditBillAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }

                                        else if (ruleRow.Description == ENUM_ACC_TransferRules.CreditBillCoPaymentCashAmount)
                                        {
                                            accTxnItems.Amount = record.CoPaymentCashAmount;
                                            ledId = GetLedgerId(GetLedgerName(ENUM_ACC_LedgerName.Cash, currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }

                                    });
                                }
                                break;
                            }
                        case "CashBillReturn":
                            {

                                //var CashBillReturnPaymentModes = PaymentModeData.FindAll(a => a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        if (ruleRow.Description == "CashBillReturnSales")
                                        {
                                            // create multiple transaction items for 'CashBillReturnSales'  - Bikash,7thMarch'22
                                            record.BillTxnItms.ForEach(itms =>
                                            {
                                                var txnItms = new TransactionItemModel();
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                sLed.SubLedgerId = itms.SubLedgerId;
                                                sLed.LedgerId = (int)itms.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItms.SubLedgers = sLedgers;
                                                txnItms.CostCenterId = DefaultCostCenter.CostCenterId;
                                                txnItms.Amount = itms.TotalAmount;
                                                //ledId = (int)itms.LedgerId;
                                                txnItms.DrCr = ruleRow.DrCr;
                                                //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                txnItms.LedgerId = ((int)itms.LedgerId) > 0 ? (int)itms.LedgerId : 0;
                                                transaction.TransactionItems.Add(txnItms);
                                            });
                                        }
                                        else if (ruleRow.Description == "CashBillReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {
                                            //if (CashBillReturnPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{

                                            //    // Discount Return Case for Multiple payment mode 
                                            //    if (DiscountReturnTxnData.Count > 0)
                                            //    {
                                            //        var discountReturnSum = DiscountReturnTxnData.Sum(a => a.TotalAmount);
                                            //        if (discountReturnSum > 0)
                                            //        {
                                            //            CashBillReturnPaymentModes.ForEach(a =>
                                            //            {
                                            //                if (a.PaymentSubCategoryName == "Cash")
                                            //                {
                                            //                    a.TotalAmount = (a.TotalAmount - discountReturnSum);
                                            //                }
                                            //            });

                                            //            // Create New transaction Item of DiscountReturn

                                            //            var txnItemPM = new TransactionItemModel();
                                            //            txnItemPM.Amount = discountReturnSum;
                                            //            txnItemPM.DrCr = false; // discount return will be Credit so false
                                            //            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //            txnItemPM.LedgerId = ledId;
                                            //            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //            subLed.LedgerId = ledId;
                                            //            subLedgers.Add(subLed);
                                            //            accTxnItems.SubLedgers = subLedgers;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }

                                            //      }

                                            //    // transaction item creation for all Multiple Payment mode
                                            //    CashBillReturnPaymentModes.ForEach(pm =>
                                            //    {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                                    
                                            //    });
                                                
                                            //}
                                            //else
                                            //{ // Single Payment Mode
                                                
                                            //    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            //    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);

                                            // Transcation Item Details 
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "CashBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                                                              
                                    });
                                }
                                break;
                            }
                        case "CreditBillPaid":
                            {
                                //var CreditBillPaidPaymentModes = PaymentModeData.FindAll(a => a.TransactionType == record.TransactionType && a.OrganizationId == record.CreditOrganizationId);

                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        if (ruleRow.Description == "CreditBillPaidCashInHand" || ruleRow.Name == "ACA_BANK")
                                        {

                                            //if (CreditBillPaidPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    CreditBillPaidPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.TotalAmount > 0)
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                                        
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            //    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
                                            var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "CreditBillPaidSundryDebtors")
                                        {
                                            accTxnItems.Amount = (record.TotalAmount + record.SettlementDiscountAmount) + record.TaxAmount;
                                            // ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
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
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}
                                        else if (ruleRow.Description == "CreditBillPaidAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.SettlementDiscountAmount;
                                            //nbb-charak changes
                                            if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }

                                        if (ruleRow.Description != "CreditBillPaidCashInHand" && ruleRow.Name != "ACA_BANK")
                                        {
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        
                                    });
                                }
                                break;
                            }
                        case "CreditBillReturn":
                            {
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    var ReturnIds = billingDbContex.BillInvoiceReturnItems.Where(a => record.BillTxnItemIds.Contains(a.BillReturnItemId)).Select(a => a.BillReturnId).Distinct().ToList();
                                    var ReturnedCashAmount = billingDbContex.BillInvoiceReturns.Where(a => ReturnIds.Contains(a.BillReturnId)).Select(a => a.ReturnCashAmount).Sum();
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;

                                        if (ruleRow.Description == "CreditBillReturnSales")
                                        {
                                            // create multiple transaction items for 'CreditBillReturnSales'  - Bikash,7thMarch'22
                                            record.BillTxnItms.ForEach(itms =>
                                            {
                                                var txnItms = new TransactionItemModel();
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                sLed.SubLedgerId = itms.SubLedgerId;
                                                sLed.LedgerId = (int)itms.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItms.SubLedgers = sLedgers;
                                                txnItms.CostCenterId = DefaultCostCenter.CostCenterId;
                                                txnItms.Amount = itms.TotalAmount;
                                                //ledId = (int)itms.LedgerId;
                                                txnItms.DrCr = ruleRow.DrCr;
                                                //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                txnItms.LedgerId = ((int)itms.LedgerId) > 0 ? (int)itms.LedgerId : 0;
                                                transaction.TransactionItems.Add(txnItms);
                                            });
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnSundryDebtors")
                                        {
                                            accTxnItems.Amount = (decimal)((record.SalesAmount - record.DiscountAmount - ReturnedCashAmount) + record.TaxAmount);
                                            //ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
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
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "CreditBillReturnAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }

                                        else if (ruleRow.Description == ENUM_ACC_TransferRules.CreditBillReturnCoPaymentCashAmount)
                                        {
                                            ledId = GetLedgerId(GetLedgerName(ENUM_ACC_LedgerName.Cash, currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.Amount = (decimal)ReturnedCashAmount;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }

                                        if (ruleRow.Description != "CreditBillReturnSales")
                                        {
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                    });
                                }
                                break;
                            }
                        //case "DiscountReturn":
                        //    {
                        //        var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                        //        if (transferRule.Count > 0)
                        //        {
                        //            transaction.TransactionItems = new List<TransactionItemModel>();
                        //            transferRule.ForEach(ruleRow =>
                        //            {
                        //                var accTxnItems = new TransactionItemModel();
                        //                int ledId = 0;
                        //                if (ruleRow.Description == "DiscountReturnCashInHand" || ruleRow.Name == "ACA_BANK")
                        //                {
                        //                    accTxnItems.Amount = record.TotalAmount;
                        //                    var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                        //                    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                        //                    accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                        //                    transaction.BillSyncs.ForEach(r =>
                        //                    {
                        //                        var accTxnItemDetail = new TransactionItemDetailModel();
                        //                        //  accTxnItemDetail.PatientId = r.PatientId;
                        //                        accTxnItemDetail.ReferenceId = r.CreatedBy;
                        //                        accTxnItemDetail.ReferenceType = "User";
                        //                        accTxnItemDetail.Amount = r.TotalAmount;
                        //                        accTxnItemDetail.Description = "DiscountReturn->Cash -> Created By";
                        //                        accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                        //                    });
                        //                    accTxnItems.IsTxnDetails = true;
                        //                }
                        //                else if (ruleRow.Description == "DiscountReturnAdministrativeExpenses")
                        //                {
                        //                    accTxnItems.Amount = record.TotalAmount;
                        //                    //nbb-charak changes
                        //                    if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
                        //                    {
                        //                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                        //                    }
                        //                    else
                        //                    {
                        //                        ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                        //                    }

                        //                }
                        //                accTxnItems.DrCr = ruleRow.DrCr;
                        //                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                        //                transaction.TransactionType = record.TransactionType;
                        //                //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                        //                transaction.TransactionItems.Add(accTxnItems);
                        //            });
                        //        }
                        //        break;
                        //    }
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
                var Temp = accTxnFromBilling.Select(tx =>
                {
                    if(tx.TransactionItems != null)
                           tx.TransactionItems = tx.TransactionItems.OrderByDescending(o => o.DrCr).ToList();

                    return tx;

                }).ToList();

                Transaction = Temp;

                return Transaction;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        #endregion
        }

        private static List<TransactionModel> MapBillingIncomeVoucher(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var BillingRuleMapping = RuleMappingList.Where(rule => rule.Section == 2).ToList();
                var accTxnFromBilling = new List<TransactionModel>();
                var subLedgerParam = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SubLedgerAndCostCenter").FirstOrDefault().ParameterValue;
                var parmValue = JsonConvert.DeserializeObject<SubLedgerCostCenterConfig_DTO>(subLedgerParam);
                BillingRuleMapping.ForEach(txnRule =>
                {
                    var syncTxnList = BillingTxnSyncList.Where(sync => sync.BaseTransactionType == txnRule.Description).ToList();
                    if(syncTxnList.Count > 0)
                    {
                        var txn = syncTxnList[0];
                        var transaction = new TransactionModel();
                        transaction.FiscalyearId = fiscalYearId;
                        transaction.Remarks = "Billing_IncomeVoucher" + txn.TransactionDate;
                        transaction.SectionId = 2;
                        transaction.TransactionDate = txn.TransactionDate;
                        transaction.VoucherId = (int)txnRule.VoucherId;
                        transaction.TransactionType = txnRule.Description;
                        transaction.TransactionItems = new List<TransactionItemModel>();


                        for (int i = 0; i < syncTxnList.Count; i++)
                        {
                            var record = syncTxnList[i];
                            var accTxnItems = new TransactionItemModel();

                            if (parmValue.EnableSubLedger)
                            {
                                var subLedgerTxns = new List<SubLedgerTransactionModel>();
                                var subLedTxn = new SubLedgerTransactionModel();
                                subLedTxn.SubLedgerId = record.SubLedgerId > 0 ? record.SubLedgerId : GetDefaultSubLedgerId(record.LedgerId);
                                subLedTxn.LedgerId = record.LedgerId;
                                subLedgerTxns.Add(subLedTxn);
                                accTxnItems.SubLedgers = subLedgerTxns;
                            }
                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                            accTxnItems.Amount = record.TotalAmount;
                            accTxnItems.DrCr = record.DrCr;
                            accTxnItems.LedgerId = record.LedgerId;
                            accTxnItems.Description = record.Description;

                            accTxnItems.TransactionLinks = new List<TransactionLinkModel>();
                            TransactionLinkModel txnLink = new TransactionLinkModel();
                            txnLink.ReferenceId = record.ReferenceIdCSV;
                            accTxnItems.TransactionLinks.Add(txnLink);
                            accTxnItems.TransactionType = record.TransactionType;
                            transaction.TransactionItems.Add(accTxnItems);
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
                });

                Transaction = accTxnFromBilling;
                BillingTxnSyncList = new List<AccountingSync_DTO>();
                return Transaction;
            }
            catch (Exception ex)
            {
                BillingTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }

        private static List<TransactionModel> MapPharmacyVoucher(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var PharmacyRuleMapping = RuleMappingList.Where(rule => rule.Section == 3).ToList();
                var accTxnFromPharmacy = new List<TransactionModel>();
                var subLedgerParam = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SubLedgerAndCostCenter").FirstOrDefault().ParameterValue;
                var parmValue = JsonConvert.DeserializeObject<SubLedgerCostCenterConfig_DTO>(subLedgerParam);
                PharmacyRuleMapping.ForEach(txnRule =>
                {
                    var syncTxnList = PharmacyTxnSyncList.Where(sync => sync.BaseTransactionType == txnRule.Description).ToList();
                    var distinctTxns = syncTxnList.Select(txn => txn.TransactionRefNo).Distinct().ToList();
                    distinctTxns.ForEach(a =>
                    {
                        var transactionList = syncTxnList.Where(t => t.TransactionRefNo == a).ToList();
                        var txn = transactionList[0];
                        var transaction = new TransactionModel();
                        transaction.FiscalyearId = fiscalYearId;
                        transaction.Remarks = txnRule.Description + " on " + txn.TransactionDate;
                        transaction.SectionId = 3;
                        transaction.TransactionDate = txn.TransactionDate;
                        transaction.VoucherId = (int)txnRule.VoucherId;
                        transaction.TransactionType = txnRule.Description;
                        transaction.TransactionItems = new List<TransactionItemModel>();

                        for (int i = 0; i < transactionList.Count; i++)
                        {
                            var record = transactionList[i];
                            var accTxnItems = new TransactionItemModel();
                            if (parmValue.EnableSubLedger)
                            {
                                var subLedgerTxns = new List<SubLedgerTransactionModel>();
                                var subLedTxn = new SubLedgerTransactionModel();
                                subLedTxn.SubLedgerId = record.SubLedgerId > 0 ? record.SubLedgerId : GetDefaultSubLedgerId(record.LedgerId);
                                subLedTxn.LedgerId = record.LedgerId;
                                subLedgerTxns.Add(subLedTxn);
                                accTxnItems.SubLedgers = subLedgerTxns;
                            }
                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                            accTxnItems.Amount = record.TotalAmount;
                            accTxnItems.DrCr = record.DrCr;
                            accTxnItems.LedgerId = record.LedgerId;
                            accTxnItems.Description = record.Description;

                            accTxnItems.TransactionLinks = new List<TransactionLinkModel>();
                            TransactionLinkModel txnLink = new TransactionLinkModel();
                            txnLink.ReferenceId = record.ReferenceIdCSV;
                            accTxnItems.TransactionLinks.Add(txnLink);
                            accTxnItems.TransactionType = record.TransactionType;
                            transaction.TransactionItems.Add(accTxnItems);
                        }
                        if (CheckValidTxn(transaction, currHospitalId))
                        {
                            accTxnFromPharmacy.Add(transaction);
                        }
                        else
                        {
                            transaction = new TransactionModel();
                        }
                    });
                });
                Transaction = accTxnFromPharmacy;
                PharmacyTxnSyncList = new List<AccountingSync_DTO>();
                return Transaction;
            }
            catch (Exception ex)
            {
                PharmacyTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }

        private static List<TransactionModel> MapInventoryVoucher(int fiscalYearId, int currHospitalId)
        {
            try
            {
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var InventoryRuleMapping = RuleMappingList.Where(rule => rule.Section == 1).ToList();
                var accTxnFromPharmacy = new List<TransactionModel>();
                var subLedgerParam = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SubLedgerAndCostCenter").FirstOrDefault().ParameterValue;
                var parmValue = JsonConvert.DeserializeObject<SubLedgerCostCenterConfig_DTO>(subLedgerParam);
                InventoryRuleMapping.ForEach(txnRule =>
                {
                    var syncTxnList = InventoryTxnSyncList.Where(sync => sync.BaseTransactionType == txnRule.Description).ToList();
                    var distinctTxns = syncTxnList.Select(txn => txn.TransactionRefNo).Distinct().ToList();
                    distinctTxns.ForEach(a =>
                    {
                        var transactionList = syncTxnList.Where(t => t.TransactionRefNo == a).ToList();
                        var txn = transactionList[0];
                        var transaction = new TransactionModel();
                        transaction.FiscalyearId = fiscalYearId;
                        transaction.Remarks = txnRule.Description + " on " + txn.TransactionDate;
                        transaction.SectionId = 1;
                        transaction.TransactionDate = txn.TransactionDate;
                        transaction.VoucherId = (int)txnRule.VoucherId;
                        transaction.TransactionType = txnRule.Description;
                        transaction.TransactionItems = new List<TransactionItemModel>();

                        for (int i = 0; i < transactionList.Count; i++)
                        {
                            var record = transactionList[i];
                            var accTxnItems = new TransactionItemModel();
                            if (parmValue.EnableSubLedger)
                            {
                                var subLedgerTxns = new List<SubLedgerTransactionModel>();
                                var subLedTxn = new SubLedgerTransactionModel();
                                subLedTxn.SubLedgerId = record.SubLedgerId > 0 ? record.SubLedgerId : GetDefaultSubLedgerId(record.LedgerId);
                                subLedTxn.LedgerId = record.LedgerId;
                                subLedgerTxns.Add(subLedTxn);
                                accTxnItems.SubLedgers = subLedgerTxns;
                            }
                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                            accTxnItems.Amount = record.TotalAmount;
                            accTxnItems.DrCr = record.DrCr;
                            accTxnItems.LedgerId = record.LedgerId;
                            accTxnItems.Description = record.Description;

                            accTxnItems.TransactionLinks = new List<TransactionLinkModel>();
                            TransactionLinkModel txnLink = new TransactionLinkModel();
                            txnLink.ReferenceId = record.ReferenceIdCSV;
                            accTxnItems.TransactionLinks.Add(txnLink);
                            accTxnItems.TransactionType = record.TransactionType;
                            transaction.TransactionItems.Add(accTxnItems);
                        }
                        if (CheckValidTxn(transaction, currHospitalId))
                        {
                            accTxnFromPharmacy.Add(transaction);
                        }
                        else
                        {
                            transaction = new TransactionModel();
                        }
                    });
                });
                Transaction = accTxnFromPharmacy;
                InventoryTxnSyncList = new List<AccountingSync_DTO>();
                return Transaction;
            }
            catch (Exception ex)
            {
                InventoryTxnSyncList = new List<AccountingSync_DTO>();
                throw ex;
            }
        }



        //method for get service departments as a income ledger
        //private static int GetLedgerIdFromServiceDepartment(string ledgerNameString, int ledgerGroupId, int? ledgerReferenceId, int currHospitalId)
        //{
        //    try
        //    {
        //        if (ledgerGroupId > 0)
        //        {

        //            var ledger = LedgerList.Find(x => x.LedgerName == ledgerNameString);          //   this.ledgerList.filter(x => x.LedgerName == ledgerNameString)[0];
        //            if (ledger != null)
        //            {
        //                return ledger.LedgerId;
        //            }
        //            else
        //            {
        //                var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
        //                var tempLed = new LedgerModel();
        //                tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
        //                tempLed.COA = ledGrp.COA;
        //                tempLed.LedgerGroupId = ledgerGroupId;
        //                tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
        //                tempLed.LedgerName = ledgerNameString;
        //                tempLed.LedgerReferenceId = ledgerReferenceId;
        //                tempLed.Description = "Income Ledger";
        //                var flag = true;
        //                tempLed.IsMapLedger = false;
        //                unavailableLedgerList.ForEach(l =>
        //                {
        //                    if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
        //                        && l.LedgerName == tempLed.LedgerName)
        //                    {
        //                        flag = false;
        //                    }
        //                });
        //                if (flag)
        //                {
        //                    unavailableLedgerList.Add(tempLed);
        //                    // AddLedgersFromAcc(currHospitalId);  // Vikas: 23Jul2020 : To display unavailble list on clien side
        //                }
        //                //  return LedgerList.Find(a => a.LedgerName == ledgerNameString).LedgerId;
        //                return 0;
        //            }
        //        }
        //        return 0;
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}

        private static int GetLedgerIdFromServiceDepartment(int? serviceDepId, int ledgerGroupId, int? itemId, int currHospitalId)
        {
            try
            {

                bool ledgerid = false;
                if (BillingIncomeLedger?.Count > 0)
                {
                    ledgerid = BillingIncomeLedger.Exists(a => a.ServiceDepartmentId == serviceDepId && a.ItemId == itemId);
                }
                if (ledgerid == true)
                {
                    return BillingIncomeLedger.Find(a => a.ServiceDepartmentId == serviceDepId && a.ItemId == itemId).LedgerId;
                }
                else
                {

                    var billItm = (from itm in accountingDBContext.ServiceItems
                                   join dep in accountingDBContext.ServiceDepartment on itm.ServiceDepartmentId equals dep.ServiceDepartmentId
                                   where itm.IntegrationItemId == itemId && dep.ServiceDepartmentId == serviceDepId
                                   select new
                                   {
                                       ItemId = itm.IntegrationItemId,
                                       ItemName = itm.ItemName,
                                       ServiceDepartmentId = itm.ServiceDepartmentId,
                                       ServiceDepartmentName = dep.ServiceDepartmentName
                                   }).FirstOrDefault();

                    // var billItm = billItems.Where(itm => itm.ItemId == itemId && itm.ServiceDepartmentId == serviceDepId).FirstOrDefault() ;
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = billItm.ServiceDepartmentName.ToString() + " Or " + billItm.ItemName.ToString();
                    tempLed.LedgerReferenceId = serviceDepId; // default service department as a ledger but user must create ledger from accounting=> setting=> create ledger (Billing ledger tab)
                    tempLed.LedgerType = "billingincomeledger";
                    bool flag = true;
                    tempLed.IsMapLedger = false;

                    if (flag)
                    {
                        unavailableLedgerList.Add(tempLed);

                    }
                    return 0;
                }

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
        #region Get Ledger of Phrmacy credit organization
        private static int GetLedgerIdFromPHRMCreditOrganization(int? PHRMCreditOrganizationId, int ledgerGroupId, int currHospitalId)
        {
            try
            {
                bool checkFlag = false;
                if (PHRMCreditOrganizations.Count > 0)
                {
                    checkFlag = PHRMCreditOrganizations.Exists(a => a.ReferenceId == PHRMCreditOrganizationId);
                }
                if (checkFlag == true)
                {
                    return PHRMCreditOrganizations.Find(a => a.ReferenceId == PHRMCreditOrganizationId).LedgerId;
                }
                else
                {
                    var creditOrg = (from c in accountingDBContext.PHRMCreditOrganization
                                     select c).ToList();
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = creditOrg.Where(c => c.OrganizationId == PHRMCreditOrganizationId).FirstOrDefault().OrganizationName;
                    tempLed.LedgerReferenceId = PHRMCreditOrganizationId;
                    tempLed.LedgerType = "PHRMCreditOrganization";
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

                    }
                    return 0;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region
        private static int GetLedgerIdFromInvOtherCharge(int? ChargeId, int ledgerGroupId, int currHospitalId)
        {
            try
            {
                bool checkFlag = false;
                if (INVOtherChargeList.Count > 0)
                {
                    checkFlag = INVOtherChargeList.Exists(a => a.ReferenceId == ChargeId);
                }
                if (checkFlag == true)
                {
                    return INVOtherChargeList.Find(a => a.ReferenceId == ChargeId).LedgerId;
                }
                else
                {
                    var invOtherCharge = (from c in accountingDBContext.InvCharges
                                     select c).ToList();
                    var ledGrp = LedgergroupList.Find(y => y.LedgerGroupId == ledgerGroupId);
                    var tempLed = new LedgerModel();
                    tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
                    tempLed.COA = ledGrp.COA;
                    tempLed.LedgerGroupId = ledgerGroupId;
                    tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
                    tempLed.LedgerName = invOtherCharge.Where(c => c.ChargeId == ChargeId).FirstOrDefault().ChargeName;
                    tempLed.LedgerReferenceId = ChargeId;
                    tempLed.LedgerType = "INVOtherCharge";
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

                    }
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
                //PaymentMode="Cash" && ItemType="Capital Goods" =>INVCashGoodReceiptFixedAsset1 else => INVCashGoodReceipt1
                //PaymentMode != "credit" && ItemType="Capital Goods" => INVCreditGoodReceiptFixedAsset" else => INVCreditGoodReceipt
                INV_OtherCharegeData = DataTableToList.ConvertToList<InvOtherCharegeViewModel>(dataset.Tables[6]);
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
                                                 TransactionType = x.Key.PaymentMode == "Cash" ? (x.Key.ItemCategory == "Capital Goods" ? "INVCashGoodReceiptFixedAsset" : "INVCashGoodReceipt") : (x.Key.ItemCategory == "Capital Goods" ? "INVCreditGoodReceiptFixedAsset" : "INVCreditGoodReceipt"),
                                                 SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                                 TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                                 TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                                                 VATAmount = x.Select(a => (decimal)a.gr.VATAmount).Sum(),
                                                 DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                                 CcCharge = x.Select(a => (decimal) a.gr.CcAmount).Sum(),
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
                            CcCharge = p.CcCharge,
                            DiscountAmount = p.DiscountAmount,
                            TotalAmount = p.TotalAmount,
                            ReferenceIds = p.ReferenceIds,
                            Remarks = p.Remarks,
                            TDSAmount = p.TDSAmount,
                            Type = p.Type,
                            BillSyncs = p.ItemDetails.Select(x => new SyncBillingAccountingModel()
                            {
                                ItemId = x.ItemId,
                                TotalAmount = x.TotalAmount,
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
                                                 GoodsReceiptID = gr.GoodsReceiptID,
                                                 PaymentMode = gr.PaymentMode,
                                                 ItemType = gr.ItemType,

                                             } into x
                                             select new
                                             {
                                                 x.Key.CreatedOn,
                                                 //x.Key.BillNo,
                                                 x.Key.GoodsReceiptID,
                                                 VendorId = x.Select(a => a.gr.VendorId).FirstOrDefault(),
                                                 VendorName = x.Select(a => a.gr.VendorName).FirstOrDefault(),
                                                 Type = x.Key.PaymentMode == "Cash" ? (x.Key.ItemType == "Capital Goods" ? "Goods Receipt Cash For Capital Goods" : "Goods Receipt Cash") : (x.Key.ItemType == "Capital Goods" ? "Goods Receipt Credit For Capital Goods" : "Credit Goods Receipt"),
                                                 TransactionType = x.Key.PaymentMode == "Cash" ? (x.Key.ItemType == "Capital Goods" ? "INVCashGoodReceiptFixedAsset" : "INVCashGoodReceipt") : (x.Key.ItemType == "Capital Goods" ? "INVCreditGoodReceiptFixedAsset" : "INVCreditGoodReceipt"),
                                                 SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                                 TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                                 TDSAmount = x.Select(a => (decimal)a.gr.TDSAmount).Sum(),
                                                 VATAmount = x.Select(a => (decimal)a.gr.VATAmount).Sum(),
                                                 DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                                 CcCharge = x.Select(a => (decimal) a.gr.CcAmount).Sum(),
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
                            CcCharge = p.CcCharge,
                            DiscountAmount = p.DiscountAmount,
                            TotalAmount = p.TotalAmount,
                            ReferenceIds = p.ReferenceIds,
                            Remarks = p.Remarks,
                            TDSAmount = p.TDSAmount,
                            Type = p.Type,
                            BillSyncs = p.ItemDetails.Select(x => new SyncBillingAccountingModel()
                            {
                                ItemId = x.ItemId,
                                TotalAmount = x.TotalAmount,
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

                //INVWriteOff
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
                                         Remarks = "Inventory Transaction entries to Accounting for write Off Items on date: " + +Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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

                //PaymentMode == "Cash" ? "INVReturnToVendorCashGR" : "INVReturnToVendorCreditGR"
                var returntovenderdata = DataTableToList.ToDynamic(dataset.Tables[2]);

                var returnToVender = (from ret in returntovenderdata.AsEnumerable()
                                      group new { ret } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(ret.CreatedOn).Date,
                                          VendorId = ret.VendorId,
                                          ret.PaymentMode,
                                          ret.ItemType
                                      } into x
                                      select new
                                      {
                                          x.Key.CreatedOn,
                                          x.Key.VendorId,
                                          VendorName = x.Select(a => a.ret.VendorName).FirstOrDefault(),
                                          //Type = x.Key.PaymentMode == "Cash" ? "Return To Vender Cash" : "Return To Vender Credit",
                                          //  Type = "Return To Vender",
                                          Type = x.Select(a => a.ret.PaymentMode).FirstOrDefault() == "Cash" ? (x.Select(a => a.ret.ItemType).FirstOrDefault() == "Capital Goods" ? "Goods Receipt Return Cash For Capital Goods" : "Goods Receipt Return Cash") : (x.Select(a => a.ret.ItemType).FirstOrDefault() == "Capital Goods" ? "Goods Receipt Return Credit For Capital Goods" : "Credit Goods Receipt Return"),
                                          TransactionType = x.Select(a => a.ret.PaymentMode).FirstOrDefault() == "Cash" ? (x.Select(a => a.ret.ItemType).FirstOrDefault() == "Capital Goods" ? "INVReturnCashGRFixedAsset" : "INVReturnToVendorCashGR") : (x.Select(a => a.ret.ItemType).FirstOrDefault() == "Capital Goods" ? "INVReturnCreditGRFixedAsset" : "INVReturnToVendorCreditGR"),
                                          //TransactionType = x.Key.PaymentMode == "Cash" ? "INVReturnToVendorCashGR" : "INVReturnToVendorCreditGR",
                                          TotalAmount = x.Select(a => (decimal)a.ret.TotalAmount).Sum(),
                                          VATAmount = x.Select(b => (decimal)b.ret.VATAmount).Sum(),
                                          DiscountAmount = x.Select(c => (decimal) c.ret.DiscountAmount).Sum(),
                                          Remarks = "Inventory Transaction entries to Accounting for Return to vendor Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                        DiscountAmount = p.DiscountAmount,
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
                //TransactionType-> NVDispatchToDept
                var dispatchToDept = (from wtxn in WARD_INV_Transaction
                                      group new { wtxn } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(wtxn.CreatedOn).Date,
                                          TransactionType = wtxn.TransactionType
                                      } into x
                                      select new
                                      {
                                          CreatedOn = x.Key.CreatedOn,
                                          TransactionType = x.Key.TransactionType,//NVDispatchToDept
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

                var INV_ReturnToDepartment = DataTableToList.ToDynamic(dataset.Tables[7]);
                //TransactionType-> INVDispatchToDeptReturn
                var returnToDept = (from wtxn in INV_ReturnToDepartment
                                    group new { wtxn } by new
                                      {
                                          CreatedOn = Convert.ToDateTime(wtxn.CreatedOn).Date,
                                          TransactionType = wtxn.TransactionType
                                      } into x
                                      select new
                                      {
                                          CreatedOn = x.Key.CreatedOn,
                                          TransactionType = x.Key.TransactionType,//INVDispatchToDeptReturn
                                          TotalAmount = x.Select(a => (decimal)a.wtxn.Price * (int)a.wtxn.Quantity).Sum(),
                                          Remarks = "Transaction of INV Return To Department Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                          ReferenceIds = x.Select(a => (int)a.wtxn.TransactionId).Distinct().ToList(),
                                      }).ToList();
                if (returnToDept.Count > 0)
                {
                    var returnDept = new List<GoodsReceiptModel>();
                    returnDept = returnToDept.Select(p => new GoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                    }).ToList();
                    returnDept.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    });
                    foreach (var itm in returnDept)
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
                                              TotalAmount = x.Select(a => (decimal)a.csm.TotalAmount).Sum(),
                                              Remarks = "Inventory Transaction entries to Accounting for consumption: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                              ReferenceIds = x.Select(a => (int)a.csm.TransactionId).Distinct().ToList(),  //we are using GoodsReceiptItemId as a referenceId
                                          }).ToList();


                if (ConsumedGoodsItems.Count > 0)
                {
                    // Dev : 14Feb,23 : Needed if we segragate  transation by subcategoryId.

                    //var consumption = new List<GoodsReceiptModel>();
                    //consumption = ConsumedGoodsItems.Select(p => new GoodsReceiptModel()
                    //{
                    //    CreatedOn = p.CreatedOn,
                    //    TransactionType = p.TransactionType,
                    //    TotalAmount = p.TotalAmount,
                    //    ReferenceIds = p.ReferenceIds,
                    //    Remarks = p.Remarks,
                    //    StoreId = p.SubCategoryId
                    //}).ToList();
                    //consumption.ForEach(a =>
                    //{
                    //    a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                    //    a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;
                    //});
                    //foreach (var item in consumption)
                    //{
                    //    if (item.VoucherId != 0)
                    //    {
                    //        InvGoodRecipt.Add(item);
                    //    }
                    //}

                    //var dispDept = new List<GoodsReceiptModel>();
                    var consumption = new GoodsReceiptModel();
                    consumption.CreatedOn = ConsumedGoodsItems[0].CreatedOn;
                    consumption.TransactionType = ConsumedGoodsItems[0].TransactionType;
                    consumption.Remarks = ConsumedGoodsItems[0].Remarks;
                    consumption.VoucherId = (RuleMappingList.Where(r => r.Description == consumption.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == consumption.TransactionType).VoucherId.Value : 0;
                    consumption.VoucherName = (consumption.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == consumption.VoucherId).VoucherName : null;
                    consumption.GoodsReceiptItem = new List<GoodsReceiptItemsModel>();
                    consumption.ReferenceIds = new List<int>();
                    ConsumedGoodsItems.ForEach(cItm => {
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
                                                  Remarks = "Inventory stock manage out from mainstore and substore on Date:" + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                                  ReferenceIds = x.Select(a => (int)a.stkMOut.TransactionId).Distinct().ToList() //WARD_INV_Transaction-TransactionId
                                                  //ReferenceIdsOne = x.Select(a => (int)a.stkMOut.StockTxnId).Distinct().ToList(),//INV_TXN_StockTransaction-StockTxnId
                                              }).ToList();


                if (invStockManageOutItems.Count > 0)
                {
                    var stkManageOut = new GoodsReceiptModel();
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
                        //stkManageOut.ReferenceIdsOne.AddRange(sItm.ReferenceIdsOne);
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

                //Table- INVStockManageIN
                var invStockManageIN = DataTableToList.ToDynamic(dataset.Tables[8]);
                var invStockManageInItems = (from stkMIn in invStockManageIN.AsEnumerable()
                                              group new { stkMIn } by new
                                              {
                                                  CreatedOn = Convert.ToDateTime(stkMIn.CreatedOn).Date,
                                                  SubCategoryId = stkMIn.SubCategoryId
                                              } into x
                                              select new
                                              {
                                                  x.Key.CreatedOn,
                                                  x.Key.SubCategoryId,
                                                  TransactionType = "INVStockManageIn",
                                                  TotalAmount = x.Select(a => (decimal)a.stkMIn.TotalAmount).Sum(),
                                                  Remarks = "Inventory stock manage In from mainstore and substore on Date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                                  ReferenceIds = x.Select(a => (int)a.stkMIn.TransactionId).Distinct().ToList()
                                                  //ReferenceIdsOne = x.Select(a => (int)a.stkMIn.StockTxnId).Distinct().ToList(),
                                              }).ToList();


                if (invStockManageInItems.Count > 0)
                {
                    var stkManageIn = new GoodsReceiptModel();
                    stkManageIn.CreatedOn = invStockManageInItems[0].CreatedOn;
                    stkManageIn.TransactionType = invStockManageInItems[0].TransactionType;
                    stkManageIn.Remarks = invStockManageInItems[0].Remarks;
                    stkManageIn.VoucherId = (RuleMappingList.Where(r => r.Description == stkManageIn.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == stkManageIn.TransactionType).VoucherId.Value : 0;
                    stkManageIn.VoucherName = (stkManageIn.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == stkManageIn.VoucherId).VoucherName : null;
                    stkManageIn.GoodsReceiptItem = new List<GoodsReceiptItemsModel>();
                    stkManageIn.ReferenceIds = new List<int>();
                    stkManageIn.ReferenceIdsOne = new List<int>();
                    invStockManageInItems.ForEach(sItm => {
                        stkManageIn.ReferenceIds.AddRange(sItm.ReferenceIds);
                        //stkManageIn.ReferenceIdsOne.AddRange(sItm.ReferenceIdsOne);
                        stkManageIn.TotalAmount = stkManageIn.TotalAmount + sItm.TotalAmount;
                    });
                    stkManageIn.GoodsReceiptItem = invStockManageInItems.Select(p => new GoodsReceiptItemsModel()
                    {
                        GoodsReceiptItemId = p.SubCategoryId,
                        TotalAmount = (decimal)p.TotalAmount,
                    }).ToList();
                    if (stkManageIn.VoucherId != 0)
                    {
                        if (stkManageIn.VoucherId != 0)
                        {
                            InvGoodRecipt.Add(stkManageIn);
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
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                for (int i = 0; i < InvGoodRecipt.Count; i++)
                {
                    var record = InvGoodRecipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks;
                    transaction.SectionId = 1;
                    transaction.BillSyncs = record.BillSyncs;
                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                    //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                    //accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    var referenceIdOneArray = record.ReferenceIdsOne;
                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = (referenceIdArray.Count > 0) ? string.Join(",", referenceIdArray) : null;
                    txnLink.ReferenceIdOne = (referenceIdOneArray != null && referenceIdOneArray.Count > 0) ? string.Join(",", referenceIdOneArray) : null;
                    //transaction.TransactionLinks.Add(txnLink);
                    switch (record.TransactionType)
                    {
                        case "INVWriteOff":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVWriteOff").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVWriteOff").MappingDetail;
                               // transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;

                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVWriteOffCostofGoodsConsumed")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_CONSUMED_COGC", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVWriteOffInventory")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCashGoodReceipt":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                var parameterVal = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                                var isGroupBy = (parameterVal != "") ? Convert.ToBoolean(parameterVal) : true;//need to change this group by 
                                //In cash goods receipt we have two entry of vendor ledger with Dr and Cr amount
                                //If isGroupBy is true then don't add vendor ledgers into voucher , if isGroupBy is false then add vendor ledgers into voucher
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceipt").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCashGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    var OtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId == record.VendorId).Sum(a => a.TotalAmount);
                                    var VATFromOtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.VATAmount);
                                    var OtherCRGCash = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.TotalAmount);
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = "INVCashGoodReceipt";//itm.TransactionType;

                                        if (ruleRow.Description == "INVCashGoodReceipt1SundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.VATAmount - record.DiscountAmount) : record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);

                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1Inventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount - record.DiscountAmount) : record.TotalAmount; //   record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt1DutiesandTaxes")
                                        {

                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.VATAmount + VATFromOtherCRG) : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }

                                        // DR : 1003-MERCHANDISE INVENTORY (1003)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1MERCHANDISEINVENTORY" && ruleRow.DrCr == true)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.CcCharge) : (record.SalesAmount + record.CcCharge + record.VATAmount + VATFromOtherCRG);
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        // CR : SUPPLIERS (A/C PAYABLES)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1SUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == false && isGroupBy == false)
                                        {
                                            //accTxnItems.Amount = record.SalesAmount - record.DiscountAmount;
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }

                                        // DR : SUPPLIERS (A/C PAYABLES)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1SUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == true && isGroupBy == false)
                                        {
                                            //  accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        // CR : Petty Cash (1296)
                                        else if (ruleRow.Description == "INVCashGoodReceipt1CASH&BANK" && ruleRow.DrCr == false)
                                        {
                                            //accTxnItems.Amount = record.SalesAmount - record.DiscountAmount;
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRGCash + record.CcCharge);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        //else if (ruleRow.Description == "INVCashGoodReceiptVatOnOtherCharge")
                                        //{
                                        //    var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId));
                                        //    if (OtherCharge.Count > 0)
                                        //    {
                                        //        var txnItemPM = new TransactionItemModel();
                                        //        txnItemPM.Amount = (double?)OtherCharge.Sum(a=> a.VATAmount);
                                        //        txnItemPM.DrCr = ruleRow.DrCr;
                                        //        txnItemPM.LedgerId = GetLedgerId(GetLedgerName("EDE_OTHER_CHARGE_VAT_ON_OTHER_CHARGE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //        transaction.TransactionItems.Add(txnItemPM);
                                        //    }
                                        //}
                                        else if (ruleRow.Description == "INVCashGoodReceiptOtherCharge")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId));
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.Amount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = oc.LedgerId > 0 ? (int)oc.LedgerId : GetLedgerIdFromInvOtherCharge(oc.ChargeId,ruleRow.LedgerGroupId,currHospitalId);
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptOtherChargeSupplier")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount= a.Sum(b => b.TotalAmount),VendorName = a.Select(c => c.VendorName).FirstOrDefault()}).ToList() ;
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptOtherChargeSupplier" && ruleRow.DrCr == false)
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount = a.Sum(b => b.TotalAmount), VendorName = a.Select(c => c.VendorName).FirstOrDefault() }).ToList();
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
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
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
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
                                            accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2CashInHand")
                                        {
                                            accTxnItems.Amount = record.SalesAmount + (decimal)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (decimal)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceipt2DiscountIncome")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
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
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCreditGoodReceipt").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCreditGoodReceipt").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    var OtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId == record.VendorId).Sum(a => a.TotalAmount);
                                    var VATFromOtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.VATAmount);
                                    var OtherCRGCash = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.TotalAmount);
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        //if (ruleRow.Description == "INVCreditGoodReceiptSundryCreditors")
                                        //{
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                        //    //getting LedgerId from LedgerMapping
                                        //    ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName);

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
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount - record.DiscountAmount : record.TotalAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}
                                        //else if (ruleRow.Description == "INVCreditGoodReceiptDutiesandTaxes")
                                        //{
                                        //    accTxnItems.Amount = (IsVatRegistered == true) ? record.VATAmount : 0;
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                        //}


                                        //---Main Distributor-- - Initial PRice: 100Vat = 13Total Cost for Customer(or Reseller) = 113 / -
                                        //--Reseller(Retail)--InitialPRice + Margin(30) = 130 / -Vat = 130 * 13 / 100 = 16.9 


                                        if (ruleRow.Description == "INVCreditGoodReceiptMERCHANDISEINVENTORY" && ruleRow.DrCr == true)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.CcCharge) : (record.SalesAmount + record.CcCharge + record.VATAmount + VATFromOtherCRG);
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptSUPPLIERS(A/CPAYABLES)" && ruleRow.DrCr == false)
                                        {
                                            //accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.DiscountAmount : record.TotalAmount;
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceipt1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.VATAmount + VATFromOtherCRG) : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceipt1DiscountIncome")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptOtherCharge")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId));
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.Amount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = oc.LedgerId > 0 ? (int)oc.LedgerId : GetLedgerIdFromInvOtherCharge(oc.ChargeId, ruleRow.LedgerGroupId, currHospitalId);
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptOtherChargeSupplier")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount = a.Sum(b => b.TotalAmount), VendorName = a.Select(c => c.VendorName).FirstOrDefault() }).ToList();
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        //accTxnItems.DrCr = ruleRow.DrCr;
                                        //accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                        //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCreditPaidGoodReceipt":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVCreditPaidGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.VATAmount - record.DiscountAmount) : record.TotalAmount;
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = record.SalesAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (decimal)record.TDSAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //     accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnToVendorCashGR":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCashGRInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.TotalAmount - record.VATAmount + record.DiscountAmount) :  (record.TotalAmount + record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            // accTxnItems.VendorId = itm.VendorId;
                                            transaction.TransactionType = record.TransactionType;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDiscountIncome")
                                        {
                                            accTxnItems.Amount =  record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRSUPPLIERS" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRSUPPLIERS" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRCashInHand")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        //else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes")
                                        //{
                                        //    accTxnItems.Amount = 0;
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        accTxnItems.SubLedgers = subLedgers; transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnCashGRFixedAsset":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVReturnCashGRFixedAsset").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVReturnCashGRFixedAsset").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.TotalAmount - record.VATAmount + record.DiscountAmount) : (record.TotalAmount + record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetDiscountIncome")
                                        {
                                            accTxnItems.Amount =  record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetSUPPLIERS" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetSUPPLIERS" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCashGRFixedAssetCashInHand")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        //else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes")
                                        //{
                                        //    accTxnItems.Amount = 0;
                                        //    ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnToVendorCreditGR":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCreditGRInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.TotalAmount - record.VATAmount + record.DiscountAmount) :  (record.TotalAmount + record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRSundryCreditors")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            //getting LedgerId from LedgerMapping 
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
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
                                            accTxnItems.Amount = (IsVatRegistered == true) ?record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRDiscountIncome")
                                        {
                                            accTxnItems.Amount =  record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVReturnCreditGRFixedAsset":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVReturnCreditGRFixedAsset").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVReturnCreditGRFixedAsset").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVReturnToVendorCreditGRFixedAssetInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.TotalAmount - record.VATAmount + record.DiscountAmount) : (record.TotalAmount + record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //accTxnItems.VendorId = itm.VendorId;
                                            //  accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRFixedAssetSundryCreditors")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            //getting LedgerId from LedgerMapping 
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory Credit Return GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRFixedAssetDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "INVReturnToVendorCreditGRFixedAssetDiscountIncome")
                                        {
                                            accTxnItems.Amount =  record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVDispatchToDept":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVDispatchToDeptCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVDispatchToDeptReturn":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVDispatchToDeptReturnCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "INVDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCreditGoodReceiptFixedAsset":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCreditGoodReceiptFixedAsset").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCreditGoodReceiptFixedAsset").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    var OtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId == record.VendorId).Sum(a => a.TotalAmount);
                                    var VATFromOtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.VATAmount);
                                    var OtherCRGCash = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.TotalAmount);
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetSundryCreditors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = accTxnItems.Amount;
                                            //accTxnItemDetail.Description = "Inventory Credit GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetFixedAssets")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.CcCharge) : (record.SalesAmount + record.CcCharge + record.VATAmount + VATFromOtherCRG);
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.ItemId;
                                                accTxnItemDetail.ReferenceType = "Capital Goods Items";
                                                accTxnItemDetail.Amount = record.TotalAmount;
                                                accTxnItemDetail.Description = "INVCreditGoodReceipt->FixedAssets";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.VATAmount + VATFromOtherCRG) : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetDiscountIncome")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.Description = "Inventory purchase, Bill number : " + record.BillNo;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetOtherCharge")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId));
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = (decimal)oc.Amount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = oc.LedgerId > 0 ? (int)oc.LedgerId : GetLedgerIdFromInvOtherCharge(oc.ChargeId, ruleRow.LedgerGroupId, currHospitalId);
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCreditGoodReceiptFixedAssetOtherChargeSupplier")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount = a.Sum(b => b.TotalAmount), VendorName = a.Select(c => c.VendorName).FirstOrDefault() }).ToList();
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        //accTxnItems.DrCr = ruleRow.DrCr;
                                        ////   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "INVCashGoodReceiptFixedAsset":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVCashGoodReceiptFixedAsset").VoucherId.Value;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "INVCashGoodReceiptFixedAsset").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    var OtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId == record.VendorId).Sum(a => a.TotalAmount);
                                    var VATFromOtherCRG = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.VATAmount);
                                    var OtherCRGCash = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId)).Sum(a => a.TotalAmount);
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = "INVCashGoodReceiptFixedAsset";//itm.TransactionType;
                                        if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1SundryCreditors")
                                        {
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            //getting LedgerId from LedgerMapping
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);

                                            //accTxnItems.IsTxnDetails = true;
                                            //accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //accTxnItemDetail.ReferenceId = record.VendorId;
                                            //accTxnItemDetail.ReferenceType = "Vendor";
                                            //accTxnItemDetail.Amount = record.TotalAmount;
                                            //accTxnItemDetail.Description = "Inventory GoodReceipt";
                                            //accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1SundryCreditors" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRG + record.CcCharge);
                                            ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.SalesAmount + record.CcCharge) : (record.SalesAmount + record.CcCharge + record.VATAmount + VATFromOtherCRG);
                                            ledId = GetLedgerId(GetLedgerName("ANCA_FIXED_ASSETS_FIXED_ASSETS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
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
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (record.VATAmount + VATFromOtherCRG) : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetOtherCharge")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId));
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.Amount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = oc.LedgerId > 0 ? (int)oc.LedgerId : GetLedgerIdFromInvOtherCharge(oc.ChargeId, ruleRow.LedgerGroupId, currHospitalId);
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetOtherChargeSupplier")
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount = a.Sum(b => b.TotalAmount), VendorName = a.Select(c => c.VendorName).FirstOrDefault() }).ToList();
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetOtherChargeSupplier" && ruleRow.DrCr == false)
                                        {
                                            var OtherCharge = INV_OtherCharegeData.FindAll(a => record.ReferenceIds.Contains(a.GoodsReceiptItemId) && a.VendorId != record.VendorId).GroupBy(a => a.VendorId).Select(a => new { VendorId = a.Key, TotalAmount = a.Sum(b => b.TotalAmount), VendorName = a.Select(c => c.VendorName).FirstOrDefault() }).ToList();
                                            OtherCharge.ForEach(oc =>
                                            {
                                                var txnItemPM = new TransactionItemModel();
                                                txnItemPM.Amount = oc.TotalAmount;
                                                txnItemPM.DrCr = ruleRow.DrCr;
                                                txnItemPM.LedgerId = GetLedgerIdFromVendor(oc.VendorId, ruleRow.LedgerGroupId, oc.VendorName, currHospitalId);
                                                var sLedgers = new List<SubLedgerTransactionModel>();
                                                var sLed = new SubLedgerTransactionModel();
                                                var sub_Ledger = vendorLedger.Find(a => a.VendorId == record.VendorId);
                                                sLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                sLed.LedgerId = txnItemPM.LedgerId;
                                                sLedgers.Add(sLed);
                                                txnItemPM.SubLedgers = sLedgers;
                                                txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                                transaction.TransactionItems.Add(txnItemPM);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetCASH&BANK" && ruleRow.DrCr == false)
                                        {
                                            //accTxnItems.Amount = record.SalesAmount - record.DiscountAmount;
                                            accTxnItems.Amount = (record.SalesAmount + record.VATAmount - record.DiscountAmount + OtherCRGCash + record.CcCharge);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        else if (ruleRow.Description == "INVCashGoodReceiptFixedAssetDiscountReceived")
                                        {
                                            accTxnItems.Amount = record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            if (accTxnItems.LedgerId > 0)
                                            {
                                                transaction.TransactionItems.Add(accTxnItems);
                                            }
                                        }
                                        //accTxnItems.DrCr = ruleRow.DrCr;
                                        ////   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }

                                if (CheckValidTxn(transaction, currHospitalId))
                                {
                                    accTxnFromInv.Add(transaction);
                                    transaction = new TransactionModel();
                                    transaction.FiscalyearId = fiscalYearId;
                                    transaction.Remarks = record.Remarks;
                                    transaction.SectionId = 1;
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Hospital").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }
                                var isTransferRuleAvailable = RuleMappingList.Any(s => s.Description == "INVCashGoodReceiptFixedAsset2");
                                if (isTransferRuleAvailable)
                                {
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
                                                accTxnItems.Amount = (IsVatRegistered == true) ? record.SalesAmount + record.VATAmount - record.DiscountAmount : record.TotalAmount;
                                                //getting LedgerId from LedgerMapping
                                                ledId = GetLedgerIdFromVendor(record.VendorId, ruleRow.LedgerGroupId, record.VendorName, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2CashInHand")
                                            {
                                                accTxnItems.Amount = record.SalesAmount + (decimal)record.TDSAmount;
                                                ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DutiesandTaxes")
                                            {
                                                accTxnItems.Amount = (decimal)record.TDSAmount;
                                                ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "INVCashGoodReceiptFixedAsset2DiscountIncome")
                                            {
                                                accTxnItems.Amount = record.DiscountAmount;
                                                ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            // accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        });
                                    }
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
                                            // Dev : 14 Feb ,2023 : Needed if we use costcenter mapping for each subcategory. 

                                            //var accTxnItems = new TransactionItemModel();
                                            //var SubCategoryMapping = accountingDBContext.LedgerMappings.Where(a => a.LedgerType == "inventorysubcategory" && a.ReferenceId == record.StoreId).FirstOrDefault();
                                            //transaction.CostCenterId = SubCategoryMapping.CostCenterId == null ? CostCenterNotApplicableCostCenterId : (int)SubCategoryMapping.CostCenterId;
                                            //accTxnItems.IsTxnDetails = false;
                                            //var ledId = 0;
                                            //accTxnItems.Amount = record.TotalAmount;
                                            //ledId = GetSubCategoryLedgerId(record.StoreId, currHospitalId);
                                            //accTxnItems.DrCr = ruleRow.DrCr;
                                            //accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //transaction.TransactionItems.Add(accTxnItems);

                                            record.GoodsReceiptItem.ForEach(gritm => {
                                                var accTxnItems = new TransactionItemModel();
                                                accTxnItems.IsTxnDetails = false;
                                                var ledId = 0;
                                                accTxnItems.Amount = gritm.TotalAmount;
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
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId); ; //ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
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
                                        if (ruleRow.Description == "INVStockManageOutSubCatetgory")
                                        {
                                            record.GoodsReceiptItem.ForEach(gritm => {
                                                var accTxnItems = new TransactionItemModel();
                                                accTxnItems.IsTxnDetails = false;
                                                var ledId = 0;
                                                accTxnItems.Amount = gritm.TotalAmount;
                                                ledId = GetSubCategoryLedgerId(gritm.GoodsReceiptItemId, currHospitalId);
                                                accTxnItems.DrCr = ruleRow.DrCr;
                                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                transaction.TransactionItems.Add(accTxnItems);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVStockManageOutInventoryLG")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            accTxnItems.IsTxnDetails = false;
                                            var ledId = 0;
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId); ; //ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                    });
                                }
                                break;
                            }

                        case "INVStockManageIn":
                            {
                                transaction.VoucherId = RuleMappingList.Find(s => s.Description == "INVStockManageIn").VoucherId.Value;
                                var transferRule = RuleMappingList.Find(a => a.Description == "INVStockManageIn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionType = record.TransactionType;
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        if (ruleRow.Description == "INVStockManageInSubCatetgory")
                                        {
                                            record.GoodsReceiptItem.ForEach(gritm => {
                                                var accTxnItems = new TransactionItemModel();
                                                accTxnItems.IsTxnDetails = false;
                                                var ledId = 0;
                                                accTxnItems.Amount = gritm.TotalAmount;
                                                ledId = GetSubCategoryLedgerId(gritm.GoodsReceiptItemId, currHospitalId);
                                                accTxnItems.DrCr = ruleRow.DrCr;
                                                accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                                transaction.TransactionItems.Add(accTxnItems);
                                            });
                                        }
                                        else if (ruleRow.Description == "INVStockManageInInventoryLG")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            accTxnItems.IsTxnDetails = false;
                                            var ledId = 0;
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            accTxnItems.Amount = record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId); ; //ACA_MERCHANDISE_INVENTORYMERCHANDISE_INVENTORY
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
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
                var Temp = accTxnFromInv.Select(tx =>
                {
                    if (tx.TransactionItems != null)
                        tx.TransactionItems = tx.TransactionItems.OrderByDescending(o => o.DrCr).ToList();

                    return tx;

                }).ToList();

                Transaction = Temp;
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
               
                var PHRMInvoiceTransaction = DataTableToList.ToDynamic(dataset.Tables[0]);
                //var PHRMInvoiceTransactionItems = DataTableToList.ToDynamic(dataset.Tables[1]);//12 July
                var PHRMInvoiceReturnModel = DataTableToList.ToDynamic(dataset.Tables[1]);
                var PHRMGoodsReceipt = DataTableToList.ToDynamic(dataset.Tables[2]);
                var PHRMWriteOff = DataTableToList.ToDynamic(dataset.Tables[3]);
                var PHRMStockTransactionModel = DataTableToList.ToDynamic(dataset.Tables[4]);
                var grvatdisamount = DataTableToList.ToDynamic(dataset.Tables[5]);
                var PHRMDeposit = DataTableToList.ToDynamic(dataset.Tables[6]);
                var PHRMSettlement = DataTableToList.ToDynamic(dataset.Tables[7]);
                var PHRMStokcAdjustment = DataTableToList.ToDynamic(dataset.Tables[8]);

                //TransactionTypes => "PHRMCreditInvoice1" : "PHRMCashInvoice1"
                var CashInvoice = (from invo in PHRMInvoiceTransaction.AsEnumerable()
                                   where invo.PaymentMode == "cash"
                                   //where invo.IsTransferredToACC != true
                                   //&& (Convert.ToDateTime(invo.CreateOn).Date >= FromDate && Convert.ToDateTime(invo.CreateOn).Date <= ToDate)
                                   group new { invo } by new
                                   {
                                       CreatedOn = Convert.ToDateTime(invo.CreateOn).Date,
                                       //PatientId = invo.PatientId,
                                   } into x
                                   select new
                                   {
                                       x.Key.CreatedOn,
                                       //x.Key.PatientId,
                                       TransactionType ="PHRMCashInvoice",
                                       Type ="Cash Invoice Sale",
                                       SalesAmount = x.Select(a => (decimal)a.invo.SubTotal).Sum(),
                                       TotalAmount = x.Select(a => (decimal)a.invo.TotalAmount).Sum(),
                                       VATAmount = x.Select(a => (decimal)a.invo.VATAmount).Sum(),
                                       DiscountAmount = x.Select(b => (decimal)b.invo.DiscountAmount).Sum(),
                                       BillSyncs = x.GroupBy(a => new { a.invo.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.invo.TotalAmount).Sum() }).ToList(),
                                       Remarks = "Transaction of Invoice Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId,
                            TotalAmount = x.TotalAmount,
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
                            PHRMItem.Add(itm);
                        }
                    }
                }

                var CreditInvoice = (from invo in PHRMInvoiceTransaction.AsEnumerable()
                                       where invo.PaymentMode == "credit"
                                       //&& (Convert.ToDateTime(invo.CreateOn).Date >= FromDate && Convert.ToDateTime(invo.CreateOn).Date <= ToDate)
                                   group new { invo } by new
                                   {
                                       CreatedOn = Convert.ToDateTime(invo.CreateOn).Date,
                                       CreditOrganizationId = invo.OrganizationId
                                       //PatientId = invo.PatientId,
                                   } into x
                                   select new
                                   {
                                       x.Key.CreatedOn,
                                       //x.Key.PatientId,
                                       TransactionType = "PHRMCreditInvoice",
                                       Type ="Credit invoice",
                                       SalesAmount = x.Select(a => (decimal)a.invo.SubTotal).Sum(),
                                       TotalAmount = x.Select(a => (decimal)a.invo.TotalAmount).Sum(),
                                       VATAmount = x.Select(a => (decimal)a.invo.VATAmount).Sum(),
                                       DiscountAmount = x.Select(b => (decimal)b.invo.DiscountAmount).Sum(),
                                       OrganizationId = x.Key.CreditOrganizationId,
                                       BillSyncs = x.GroupBy(a => new { a.invo.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.invo.TotalAmount).Sum() }).ToList(),
                                       Remarks = "Transaction of Credit Invoice Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                if (CreditInvoice.Count > 0)
                {
                    var invItem = new List<PHRMGoodsReceiptModel>();
                    invItem = CreditInvoice.Select(p => new PHRMGoodsReceiptModel()
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
                        CreditOrganizationId = p.OrganizationId,
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId,
                            TotalAmount = x.TotalAmount,
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
                            PHRMItem.Add(itm);
                        }
                    }
                }

                //NageshBB/Sanjit sir: 12-July 2021: commented and updated as per new changes in lph pharmacy
                //"PHRMCreditInvoiceReturn1" : "PHRMCashInvoiceReturn1",
                //var CashInvoiceReturn = (from invo in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                //                         join invReturnItm in PHRMInvoiceReturnItemsModel.AsEnumerable()
                //                         on invo.InvoiceId equals invReturnItm.InvoiceId
                //                         where invo.IsReturn == true
                //                         //  (Convert.ToDateTime(invReturnItm.CreatedOn).Date >= FromDate && Convert.ToDateTime(invReturnItm.CreatedOn).Date <= ToDate)
                //                         group new { invReturnItm, invo } by new
                //                         {
                //                             CreatedOn = Convert.ToDateTime(invReturnItm.CreatedOn).Date,
                //                             PaymentMode = invo.PaymentMode
                //                         } into x
                //                         select new
                //                         {
                //                             x.Key.CreatedOn,
                //                             TransactionType = x.Key.PaymentMode == "credit" ? "PHRMCreditInvoiceReturn1" : "PHRMCashInvoiceReturn1",
                //                             Type = x.Key.PaymentMode == "credit" ? "Credit Invoice Return" : "Cash Invoice Return",
                //                             SalesAmount = x.Select(a => (decimal)a.invReturnItm.SubTotal).Sum(),
                //                             TotalAmount = x.Select(a => (decimal)a.invReturnItm.TotalAmount).Sum(),
                //                             VATAmount = x.Select(c => (((decimal)c.invReturnItm.SubTotal - (((decimal)c.invReturnItm.SubTotal * (Convert.ToDecimal((decimal)c.invReturnItm.DiscountPercentage))) / 100)) * Convert.ToDecimal((decimal)c.invReturnItm.VATPercentage)) / 100).Sum(),
                //                             DiscountAmount = x.Select(b => (decimal)b.invReturnItm.SubTotal * (Convert.ToDecimal((decimal)b.invReturnItm.DiscountPercentage / 100))).Sum(),
                //                             Remarks = "Transaction of " + x.Key.PaymentMode + " Invoice return Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                //                             ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
                //                             GrAmount = (from gr in grvatdisamount
                //                                         join itm in x.Select(a => a.invo.InvoiceId).Distinct().ToList() on gr.InvoiceId equals itm
                //                                         select new
                //                                         {
                //                                             GrVatAmount = (decimal)gr.GrVATAmount,
                //                                             //GrDisAmount = (decimal)gr.GrDiscountAmount,
                //                                             GrCOGSAmount = (decimal)gr.GrCOGSAmount
                //                                         }).ToList(),
                //                         }).ToList();
                var CashInvoiceReturn = (from  invReturn in PHRMInvoiceReturnModel.AsEnumerable()
                                         where invReturn.PaymentMode == "cash"
                                         group new { invReturn} by new
                                         {
                                             CreatedOn = Convert.ToDateTime(invReturn.CreatedOn).Date,
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType ="PHRMCashInvoiceReturn",
                                             Type ="Cash Invoice Return",
                                             SalesAmount = x.Select(a => (decimal)a.invReturn.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => (decimal)a.invReturn.TotalAmount).Sum(),
                                             VATAmount = x.Select(c => (decimal)c.invReturn.VATAmount).Sum(),
                                             DiscountAmount = x.Select(b => (decimal)b.invReturn.DiscountAmount).Sum(),
                                             Remarks = "Transaction of Cash Invoice return Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                             ReferenceIds = x.Select(e =>(int) e.invReturn.InvoiceReturnId).Distinct().ToList(),
                                             GrAmount = (from gr in grvatdisamount
                                                         //join itm in x.Select(a => a.invReturn.InvoiceId).Distinct().ToList() on gr.InvoiceId equals itm
                                                         select new
                                                         {
                                                             GrVatAmount = 0, //(decimal)gr.GrVATAmount,                                                             
                                                             GrCOGSAmount =0 //(decimal)gr.GrCOGSAmount
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

                var CreditInvoiceReturn = (
                                           from invReturn in PHRMInvoiceReturnModel.AsEnumerable()
                                           where invReturn.PaymentMode == "credit"
                                           group new { invReturn } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(invReturn.CreatedOn).Date,
                                             OrganizationId = invReturn.OrganizationId
                                         } into x
                                         select new
                                         {
                                             x.Key.CreatedOn,
                                             TransactionType ="PHRMCreditInvoiceReturn",
                                             Type ="Credit Invoice Return",
                                             SalesAmount = x.Select(a => (decimal)a.invReturn.SubTotal).Sum(),
                                             TotalAmount = x.Select(a => (decimal)a.invReturn.TotalAmount).Sum(),
                                             OrganizationId = x.Key.OrganizationId,
                                             VATAmount = x.Select(c => (decimal)c.invReturn.VATAmount).Sum(),
                                             DiscountAmount = x.Select(b => (decimal)b.invReturn.DiscountAmount).Sum(),
                                             Remarks = "Transaction of Credit Invoice return Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                             BillSyncs = x.GroupBy(a => new { a.invReturn.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.invReturn.TotalAmount).Sum() }).ToList(),
                                             ReferenceIds = x.Select(a =>(int) a.invReturn.InvoiceReturnId).Distinct().ToList(),
                                             GrAmount = (from gr in grvatdisamount
                                                             //join itm in x.Select(a => a.invReturn.InvoiceId).Distinct().ToList() on gr.InvoiceId equals itm
                                                         select new
                                                         {
                                                             GrVatAmount = 0, //(decimal)gr.GrVATAmount,                                                             
                                                             GrCOGSAmount = 0 //(decimal)gr.GrCOGSAmount
                                                         }).ToList(),
                                         }).ToList();
                if (CreditInvoiceReturn.Count > 0)
                {
                    var invRTItem = new List<PHRMGoodsReceiptModel>();
                    invRTItem = CreditInvoiceReturn.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        SalesAmount = p.SalesAmount,
                        VATAmount = p.VATAmount,
                        DiscountAmount = p.DiscountAmount,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        CreditOrganizationId = p.OrganizationId,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        GrVATAmount = p.GrAmount.Select(a => a.GrVatAmount).Sum(),
                        GrCOGSAmount = p.GrAmount.Select(a => a.GrCOGSAmount).Sum(),
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = (int)x.PatientId,
                            TotalAmount = x.TotalAmount,
                        }).ToList()
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
                //"Credit" ? "PHRMCreditGoodReceipt" : "PHRMCashGoodReceipt"
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
                                             TransactionType = x.Key.TransactionType.ToLower() == "credit" ? "PHRMCreditGoodReceipt" : "PHRMCashGoodReceipt",
                                             Type = x.Key.TransactionType.ToLower() == "credit" ? "Credit Good Receipt" : "Cash Good Receipt",
                                             TotalAmount = x.Select(a => (decimal)a.gr.TotalAmount).Sum(),
                                             SalesAmount = x.Select(a => (decimal)a.gr.SubTotal).Sum(),
                                             VATAmount = x.Select(b => (decimal)b.gr.VATAmount).Sum(),
                                             DiscountAmount = x.Select(a => (decimal)a.gr.DiscountAmount).Sum(),
                                             Remarks = "Transaction of Goods Receipt Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                             ReferenceIds = x.Select(a => (int)a.gr.GoodReceiptId).Distinct().ToList(),
                                            // BillSyncs = x.GroupBy(a => new { a.gr.SupplierId }).Select(a => new { a.Key.SupplierId, TotalAmount = a.Select(b => (decimal)b.gr.TotalAmount).Sum() }).ToList(),
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
                        //BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        //{
                        //    PatientId = x.SupplierId,
                        //    TotalAmount = x.TotalAmount,
                        //}).ToList()
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

                //return to supplier "PHRMCreditReturnToSupplier" : "PHRMCashReturnToSupplier"
                var gritems = (from gr in pharmacyDbContext.PHRMGoodsReceipt
                               join gritm in pharmacyDbContext.PHRMGoodsReceiptItems on gr.GoodReceiptId equals gritm.GoodReceiptId
                               join supp in pharmacyDbContext.PHRMReturnToSupplierItem on gritm.GoodReceiptItemId equals supp.GoodReceiptItemId
                               group new { supp, gr } by new { supp.ReturnToSupplierId } into x
                               select new { x.Key.ReturnToSupplierId, TransactionType = x.Select(a => a.gr.TransactionType).FirstOrDefault() }).ToList();
                var returnToSupplier = (from ret in pharmacyDbContext.PHRMReturnToSupplier.AsEnumerable()
                                        join supplier in pharmacyDbContext.PHRMSupplier.AsEnumerable()
                                        on ret.SupplierId equals supplier.SupplierId
                                        join gr in gritems
                                        on ret.ReturnToSupplierId equals gr.ReturnToSupplierId
                                        where ret.IsTransferredToACC != true &&
                                                (Convert.ToDateTime(ret.ReturnDate).Date >= SelectedDate && Convert.ToDateTime(ret.ReturnDate).Date <= SelectedDate)
                                        group new { ret, gr } by new
                                        {
                                            CreatedOn = Convert.ToDateTime(ret.ReturnDate).Date,
                                            supplier.SupplierId,
                                            supplier.SupplierName,
                                            gr.TransactionType
                                        } into x
                                        select new
                                        {
                                            x.Key.CreatedOn,
                                            TransactionType = x.Key.TransactionType.ToLower() == "credit" ? "PHRMCreditReturnToSupplier" : "PHRMCashReturnToSupplier",
                                            Type = x.Key.TransactionType.ToLower() == "credit" ? "Credit Return to Supplier" : "Cash Return to Supplier",
                                            x.Key.SupplierId,
                                            x.Key.SupplierName,
                                            SalesAmount = x.Select(a => a.ret.SubTotal).Sum(),
                                            TotalAmount = x.Select(a => a.ret.TotalAmount).Sum(),
                                            VATAmount = x.Select(b => b.ret.VATAmount).Sum(),
                                            DiscountAmount = x.Select(b => b.ret.DiscountAmount).Sum(),
                                            CCAmount = x.Select(b => b.ret.CCAmount).Sum(),
                                            Remarks = "Transaction of Return To Supplier Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                        CCAmount = p.CCAmount
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
                                    Remarks = "Transaction of WriteOff Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                //PHRMDispatchToDept
                 var dispatchToDept = (from stxn in PHRMStockTransactionModel.AsEnumerable()
                                      where DBNull.Equals(stxn.TransactionType, "wardsupply")
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
                                          Remarks = "Transaction of PHRMDispatchToDept Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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
                //PHRMDispatchToDeptReturn
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
                                             Remarks = "Transaction of PHRMDispatchToDeptReturn Items on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
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

                //PHRMDeposit
                var depositPHRM = (from deposit in PHRMDeposit.AsEnumerable()
                                         group new { deposit } by new
                                         {
                                             CreatedOn = Convert.ToDateTime(deposit.CreatedOn).Date,
                                             DepositType = deposit.DepositType
                                         } into x
                                         where x.Key.DepositType != "depositdeduct"
                                   select new
                                         {
                                             CreatedOn = x.Key.CreatedOn,
                                             TransactionType = x.Key.DepositType == "deposit"? "PHRMDepositAdd" : "PHRMDepositReturn",
                                             Type = "Deposit",
                                             TotalAmount = x.Select(a => (decimal)a.deposit.DepositAmount).Sum(),
                                             BillSyncs = x.GroupBy(a => new { a.deposit.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.deposit.DepositAmount).Sum() }).ToList(),
                                             Remarks = x.Key.DepositType == "deposit" ? "Transaction of Deposit Add on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date) : "Transaction of Deposit Return on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                       ReferenceIds = x.Select(a => (int)a.deposit.DepositId).Distinct().ToList(),
                                         }).ToList();
                if (depositPHRM.Count > 0)
                {
                    var depositTxn = depositPHRM.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId,
                            TotalAmount = x.TotalAmount,
                        }).ToList()
                    }).ToList();
                    depositTxn.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in depositTxn)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
                    }
                }

                // Stock Adjustment-In
                var StockIn = (from stock in PHRMStokcAdjustment.AsEnumerable()
                               where stock.InQty >0
                                group new { stock } by new
                                {
                                    CreatedOn = Convert.ToDateTime(stock.TransactionDate).Date

                                } into x
                                select new
                                {
                                    x.Key.CreatedOn,
                                    TransactionType = "PHRMAdjustmentIn",
                                    Type = "Adjustment",
                                    TotalAmount = x.Select(a => (decimal)a.stock.CostPrice * (decimal) a.stock.InQty).Sum(),
                                    Remarks = "Transaction of Stock Adjustmetn In on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                    ReferenceIds = x.Select(a => (int)a.stock.StockTransactionId).Distinct().ToList(),
                                }).ToList();
                if (StockIn.Count > 0)
                {

                    var StockInItem = new List<PHRMGoodsReceiptModel>();
                    StockInItem = StockIn.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                    }).ToList();
                    StockInItem.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in StockInItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
                    }
                }
                
                // Stock Adjustment-Out
                var StockOut = (from stock in PHRMStokcAdjustment.AsEnumerable()
                               where stock.OutQty > 0
                               group new { stock } by new
                               {
                                   CreatedOn = Convert.ToDateTime(stock.TransactionDate).Date

                               } into x
                               select new
                               {
                                   x.Key.CreatedOn,
                                   TransactionType = "PHRMAdjustmentOut",
                                   Type = "Adjustment",
                                   TotalAmount = x.Select(a => (decimal)a.stock.CostPrice * (decimal)a.stock.OutQty).Sum(),
                                   Remarks = "Transaction of Stock Adjustmetn Out on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                   ReferenceIds = x.Select(a => (int)a.stock.StockTransactionId).Distinct().ToList(),
                               }).ToList();
                if (StockOut.Count > 0)
                {

                    var StockOutItem = new List<PHRMGoodsReceiptModel>();
                    StockOutItem = StockOut.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        Remarks = p.Remarks,
                        Type = p.Type,
                    }).ToList();
                    StockOutItem.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in StockOutItem)
                    {
                        if (itm.VoucherId != 0)
                        {
                            PHRMItem.Add(itm);
                        }
                    }
                }
                //PHRMSettlement
                var creditBillPaid = (from settlment in PHRMSettlement.AsEnumerable()
                                   group new { settlment } by new
                                   {
                                       CreatedOn = Convert.ToDateTime(settlment.SettlementDate).Date,
                                       OrganizationId = settlment.OrganizationId
                                   } into x
                                   select new
                                   {
                                       CreatedOn = x.Key.CreatedOn,
                                       TransactionType ="PHRMCreditBillPaid",
                                       Type = "CreditBillPaid",
                                       TotalAmount = x.Select(a => (decimal)a.settlment.CollectionFromReceivable).Sum(),
                                       DiscountGiven = x.Select(a => (decimal)a.settlment.DiscountAmount).Sum(),
                                       OrganizationId = x.Key.OrganizationId,
                                       Remarks ="Transaction of Credit bill paid on date: " + Convert.ToString(Convert.ToDateTime(x.Key.CreatedOn).Date),
                                       ReferenceIds = x.Select(a => (int)a.settlment.SettlementId).Distinct().ToList(),
                                       BillSyncs = x.GroupBy(a => new { a.settlment.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => (decimal)b.settlment.PaidAmount).Sum() }).ToList(),
                                   }).ToList();
                if (creditBillPaid.Count > 0)
                {
                    var settlementTxn = creditBillPaid.Select(p => new PHRMGoodsReceiptModel()
                    {
                        CreatedOn = p.CreatedOn,
                        TransactionType = p.TransactionType,
                        TotalAmount = p.TotalAmount,
                        ReferenceIds = p.ReferenceIds,
                        DiscountAmount = p.DiscountGiven,
                        CreditOrganizationId = p.OrganizationId,
                        Remarks = p.Remarks,
                        Type = p.Type,
                        BillSyncs = p.BillSyncs.Select(x => new SyncBillingAccountingModel()
                        {
                            PatientId = x.PatientId,
                            TotalAmount = x.TotalAmount,
                        }).ToList()
                    }).ToList();
                    settlementTxn.ForEach(a =>
                    {
                        a.VoucherId = (RuleMappingList.Where(r => r.Description == a.TransactionType).ToList().Count > 0) ? RuleMappingList.Find(c => c.Description == a.TransactionType).VoucherId.Value : 0;
                        a.VoucherName = (a.VoucherId != 0) ? voucherList.Find(c => c.VoucherId == a.VoucherId).VoucherName : null;

                    });
                    foreach (var itm in settlementTxn)
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
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var accTxnFromPhrm = new List<TransactionModel>();
                for (int i = 0; i < PHRMGoodreceipt.Count; i++)
                {
                    var record = PHRMGoodreceipt[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = record.Remarks + record.CreatedOn;
                    transaction.SectionId = 3;
                    transaction.BillSyncs = record.BillSyncs;
                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                    //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    //transaction.TransactionLinks.Add(txnLink);

                    switch (record.TransactionType)
                    {
                        case "PHRMCashInvoice":
                            {
                                //var CashSalePaymentMode = PHRM_PaymentMode_Data.FindAll(a => a.TransactionType == record.TransactionType);
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashInvoice").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCashInvoice").MappingDetail;
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        var ledId = 0;
                                        transaction.TransactionType = "PHRMCashInvoice";
                                        if (ruleRow.Description == "PHRMCashInvoice1Sales")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.SalesAmount : (decimal)(record.SalesAmount + record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ?(decimal) record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoice1CashInHand")
                                        {
                                            //if (CashSalePaymentMode.Count > 0)
                                            //{
                                            //    CashSalePaymentMode.ForEach(pm =>
                                            //    {
                                            //        if (pm.TotalAmount > 0)
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (decimal)(record.SalesAmount - record.DiscountAmount + record.VATAmount);
                                            //    ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = (decimal)(record.SalesAmount - record.DiscountAmount + record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }

                                        //if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses")
                                        //{
                                        //    accTxnItems = new TransactionItemModel();
                                        //    accTxnItems.IsTxnDetails = false;
                                        //    accTxnItems.Amount = record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
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
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }
                                var PHRMCashInvoice2 = RuleMappingList.Any(a => a.Description == "PHRMCashInvoice2");
                                if (PHRMCashInvoice2)
                                {
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
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "PHRMCashInvoice2CostofGoodsSold")
                                            {
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            //ajay 26 Jun
                                            //if (ruleRow.Description == "PHRMCashInvoice2CashInHand")
                                            //{
                                            //    accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.VATAmount;//+ record.VATAmount;
                                            //    ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            //}
                                            //else if (ruleRow.Description == "PHRMCashInvoice2SundryDebtors")
                                            //{
                                            //    accTxnItems.Amount = record.SalesAmount;
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
                                            //    accTxnItems.Amount = record.DiscountAmount;
                                            //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
                                            //}
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        });
                                    }
                                }
                                break;
                            }
                        case "PHRMCreditInvoice":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoice").VoucherId;
                                var transferRule1 = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoice").MappingDetail;
                                var CoPaymentCashAmount = (double?)pharmacyDbContext.PHRMInvoiceTransaction.Where(a => record.ReferenceIds.Contains(a.InvoiceId)).Select(a => a.ReceivedAmount).Sum();
                                if (transferRule1.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transaction.TransactionType = "PHRMCreditInvoice";
                                    transferRule1.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        accTxnItems.IsTxnDetails = false;
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoice1Sales")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.SalesAmount : (decimal)(record.SalesAmount + record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (decimal)(record.SalesAmount - record.DiscountAmount + record.VATAmount -(decimal?) CoPaymentCashAmount);
                                            if(record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                                subLed.LedgerId = ledId;
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                subLed.LedgerId = ledId;
                                            }
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = r.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "CreditBill->Sundry Debtors->Receivable";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoice1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == ENUM_ACC_TransferRules.PHRMCreditInvoice1CoPaymentCashAmount)
                                        {
                                            ledId = GetLedgerId(GetLedgerName(ENUM_ACC_LedgerName.Cash, currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            accTxnItems.Amount = (decimal)CoPaymentCashAmount;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }
                                var PHRMCreditInvoice2 = RuleMappingList.Any(a => a.Description == "PHRMCreditInvoice2");
                                if (PHRMCreditInvoice2)
                                {
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
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "PHRMCreditInvoice2CostofGoodsSold")
                                            {
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        });
                                    }
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMCashGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount);
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                            var sub_Ledger = supplierLedger.Find(a => a.SupplierId == record.SupplierId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = IsVatRegistered ? (decimal)(record.SalesAmount - record.DiscountAmount) : (decimal)record.TotalAmount; //   record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        //else if (ruleRow.Description == "PHRMCashGoodReceiptSundryCreditors")
                                        //{
                                        //    accTxnItems.Amount = record.SalesAmount;
                                        //    ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                        //    accTxnItems.SupplierId = record.SupplierId;
                                        //}
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        //else if (ruleRow.Description == "PHRMCashGoodReceiptDiscountIncome")
                                        //{
                                        //    accTxnItems.Amount = (double?)record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount);
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                            var sub_Ledger = supplierLedger.Find(a => a.SupplierId == record.SupplierId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            transaction.TransactionType = record.TransactionType;

                                        }
                                        else if (ruleRow.Description == "PHRMCreditGoodReceiptInventory")
                                        {
                                            accTxnItems.Amount = IsVatRegistered ? (decimal)(record.SalesAmount - record.DiscountAmount) : (decimal)record.TotalAmount; //record.SalesAmount; //(IsVatRegistered == true) ? record.SalesAmount : record.TotalAmount; //   record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        //else if (ruleRow.Description == "PHRMCreditGoodReceiptDiscountIncome")
                                        //{
                                        //    accTxnItems.Amount = (double?)record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMCreditPaidGoodReceiptSundryCreditors")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)(record.SalesAmount + record.VATAmount - record.DiscountAmount) : (decimal)(record.SalesAmount- record.DiscountAmount);
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                            var sub_Ledger = supplierLedger.Find(a => a.SupplierId == record.SupplierId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                            accTxnItems.SupplierId = record.SupplierId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptCashInHand")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)(record.SalesAmount + record.VATAmount - record.DiscountAmount) : (decimal)(record.TotalAmount - record.DiscountAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditPaidGoodReceiptDiscountIncome")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMCashInvoiceReturn":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCashInvoiceReturn").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCashInvoiceReturn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashInvoiceReturn1Sales")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.SalesAmount : (decimal)(record.SalesAmount + record.VATAmount);
                                            transaction.TransactionType = record.TransactionType;
                                            // record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1CashInHand")
                                        {
                                            accTxnItems.Amount = (decimal)(record.SalesAmount - record.DiscountAmount + record.VATAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        //else if (ruleRow.Description == "PHRMCashInvoiceReturn1AdministrationExpenses")
                                        //{
                                        //    accTxnItems.Amount = record.TradeDiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                var PHRMCashInvoiceReturn2 = RuleMappingList.Any(a => a.Description == "PHRMCashInvoiceReturn2");
                                if (PHRMCashInvoiceReturn2)
                                {
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
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "PHRMCashInvoiceReturn2CostofGoodsSold")
                                            {
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        });
                                    }
                                }
                                break;
                            }
                        case "PHRMCreditInvoiceReturn":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMCreditInvoiceReturn").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMCreditInvoiceReturn").MappingDetail;
                                var ReturnCoPaymentCashAmount = (double?)pharmacyDbContext.PHRMInvoiceReturnModel.Where(a => record.ReferenceIds.Contains(a.InvoiceReturnId)).Select(a => a.ReturnCashAmount).Sum();
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditInvoiceReturn1Sales")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.SalesAmount : (decimal)(record.SalesAmount + record.VATAmount);
                                            transaction.TransactionType = record.TransactionType;
                                            // record.TotalAmount - record.VATAmount;
                                            ledId = GetLedgerId(GetLedgerName("RDI_SALES_SALES-PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1DutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1AdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditInvoiceReturn1SundryDebtors")
                                        {
                                            accTxnItems.Amount = (decimal)(record.SalesAmount - record.DiscountAmount + record.VATAmount - (decimal?)ReturnCoPaymentCashAmount);
                                            if(record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                                subLed.LedgerId = ledId;
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                                subLed.LedgerId = ledId;
                                            }
                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(r =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = r.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = r.TotalAmount;
                                                accTxnItemDetail.Description = "CreditBillReturn->Sundry Debtors->Receivable";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == ENUM_ACC_TransferRules.PHRMCreditInvoiceReturn1CoPaymentCashAmount)
                                        {
                                            ledId = GetLedgerId(GetLedgerName(ENUM_ACC_LedgerName.Cash, currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            accTxnItems.Amount = (decimal)ReturnCoPaymentCashAmount;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                    transaction.TransactionDate = (DateTime)record.CreatedOn;
                                    //transaction.CostCenterId = 0;//voucherHeadList.Find(s => s.VoucherHeadName == "Pharmacy").VoucherHeadId;
                                    //        accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                    transaction.VoucherId = record.VoucherId;
                                    referenceIdArray = record.ReferenceIds;
                                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                                    txnLink = new TransactionLinkModel();
                                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                                    //transaction.TransactionLinks.Add(txnLink);
                                }
                                else
                                {
                                    transaction = new TransactionModel();
                                }

                                var PHRMCreditInvoiceReturn2 = RuleMappingList.Any(a => a.Description == "PHRMCreditInvoiceReturn2");
                                if (PHRMCreditInvoiceReturn2)
                                {
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
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else if (ruleRow.Description == "PHRMCreditInvoiceReturn2CostofGoodsSold")
                                            {
                                                accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.GrCOGSAmount : (decimal)(record.GrCOGSAmount + record.GrVATAmount);
                                                ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        });
                                    }
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCashReturnToSupplierInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)(record.SalesAmount - record.DiscountAmount + record.CCAmount) : (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            accTxnItems.SupplierId = record.SupplierId;
                                            // accTxnItems.IsTxnDetails = true;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        if (ruleRow.Description == "PHRMCashReturnToSupplierSundryCreditors")
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount);
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                            subLed.SubLedgerId = (int)supplierLedger.Find(a => a.SupplierId == record.SupplierId).SubLedgerId;
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierCashInHand")
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount);
                                            ledId = GetLedgerId(GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        //else if (ruleRow.Description == "PHRMCashReturnToSupplierDiscountIncome")
                                        //{
                                        //    accTxnItems.Amount = record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        accTxnItems.IsTxnDetails = false;
                                        var ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditReturnToSupplierInventory")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)(record.SalesAmount - record.DiscountAmount + record.CCAmount) : (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            accTxnItems.SupplierId = record.SupplierId;
                                            transaction.TransactionType = record.TransactionType;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierSundryCreditors")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName, currHospitalId);
                                            var sub_Ledger = supplierLedger.Find(a => a.SupplierId == record.SupplierId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditReturnToSupplierDutiesandTaxes")
                                        {
                                            accTxnItems.Amount = (IsVatRegistered == true) ? (decimal)record.VATAmount : 0;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_VAT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        //else if (ruleRow.Description == "PHRMCreditReturnToSupplierDiscountIncome")
                                        //{
                                        //    accTxnItems.Amount = record.DiscountAmount;
                                        //    ledId = GetLedgerId(GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        //}
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //   accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMWriteOff":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMWriteOff").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMWriteOff").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMWriteOffInventory")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMWriteOffCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        //accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMDispatchToDept":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMDispatchToDept").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMDispatchToDept").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMDispatchToDeptCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptInventory")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMDispatchToDeptReturn":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMDispatchToDeptReturn").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMDispatchToDeptReturn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMDispatchToDeptReturnCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        else if (ruleRow.Description == "PHRMDispatchToDeptReturnInventory")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                        }
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }
                        case "PHRMDepositAdd":
                            {
                                //var DepositPaymentModes = PHRM_PaymentMode_Data.FindAll(a => a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {

                                        if (ruleRow.Description == "PHRMDepositAddCashInHand")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            int ledId = 0;

                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //transaction.BillSyncs.ForEach(itm =>
                                            //{
                                            //    TransactionItemDetailModel accTxnItemDetail = new TransactionItemDetailModel();
                                            //    accTxnItemDetail.ReferenceId = itm.CreatedBy;
                                            //    accTxnItemDetail.ReferenceType = "User";
                                            //    accTxnItemDetail.Amount = itm.TotalAmount;
                                            //    accTxnItemDetail.Description = "DepositAdd->Cash -> Created By";
                                            //    accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            //});
                                            accTxnItems.IsTxnDetails = true;

                                            // test
                                            //decimal TotalAmtFromPaymentMode = DepositPaymentModes.Sum(a => a.TotalAmount);

                                            //if (DepositPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    DepositPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.PaymentSubCategoryName != "Deposit") // Ignoring payment mode 'Deposit' during deposit add
                                            //        {

                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int) pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (decimal)record.TotalAmount;
                                            //    var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    transaction.TransactionItems.Add(accTxnItems);
                                            //}

                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

                                        }
                                        else if (ruleRow.Description == "PHRMDepositAddPatientDeposits(Liability)")
                                        {
                                            var accTxnItems = new TransactionItemModel();
                                            int ledId = 0;
                                            var subLedgers = new List<SubLedgerTransactionModel>();
                                            var subLed = new SubLedgerTransactionModel();
                                            accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
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

                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //        accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }


                                    });
                                }
                                break;
                            }
                        case "PHRMDepositReturn":
                            {
                                //var DepositReturnPaymentModes = PHRM_PaymentMode_Data.FindAll(a => a.TransactionType == record.TransactionType);
                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        int ledId = 0;
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        if (ruleRow.Description == "PHRMDepositReturnCashInHand")
                                        {

                                            //if (DepositReturnPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    DepositReturnPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.PaymentSubCategoryName != "Deposit") // Ignoring payment mode 'Deposit' during deposit return
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }
                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (decimal)record.TotalAmount;
                                            //    var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    transaction.TransactionItems.Add(accTxnItems);

                                            //}

                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //transaction.BillSyncs.ForEach(r =>
                                            //{
                                            //    var accTxnItemDetail = new TransactionItemDetailModel();
                                            //    //  accTxnItemDetail.PatientId = r.PatientId;
                                            //    accTxnItemDetail.ReferenceId = r.CreatedBy;
                                            //    accTxnItemDetail.ReferenceType = "User";
                                            //    accTxnItemDetail.Amount = r.TotalAmount;
                                            //    accTxnItemDetail.Description = "DepositReturn->Cash -> Created By";
                                            //    accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            //});
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "PHRMDepositReturnPatientDeposits(Liability)")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);


                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            transaction.BillSyncs.ForEach(itm =>
                                            {
                                                var accTxnItemDetail = new TransactionItemDetailModel();
                                                accTxnItemDetail.ReferenceId = itm.PatientId;
                                                accTxnItemDetail.ReferenceType = "Patient";
                                                accTxnItemDetail.Amount = itm.TotalAmount;
                                                accTxnItemDetail.Description = "DepositReturn->Patient Deposits (Liability)->Advance From Patient";
                                                accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            });
                                            accTxnItems.IsTxnDetails = true;

                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            //  accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                            transaction.TransactionItems.Add(accTxnItems);
                                        }

                                    });
                                }
                                break;
                            }
                        case "PHRMCreditBillPaid":
                            {
                                //var CreditBillPaidPaymentModes = PHRM_PaymentMode_Data.FindAll(a => a.TransactionType == record.TransactionType &&  a.OrganizationId == record.CreditOrganizationId);

                                var transferRule = RuleMappingList.Find(a => a.Description == record.TransactionType).MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        int ledId = 0;
                                        if (ruleRow.Description == "PHRMCreditBillPaidCashInHand")
                                        {

                                            //if (CreditBillPaidPaymentModes.Count > 0) // && record.TotalAmount == TotalAmtFromPaymentMode
                                            //{
                                            //    CreditBillPaidPaymentModes.ForEach(pm =>
                                            //    {
                                            //        if (pm.TotalAmount > 0)
                                            //        {
                                            //            var txnItemPM = new TransactionItemModel();
                                            //            var sLedgers = new List<SubLedgerTransactionModel>();
                                            //            var sLed = new SubLedgerTransactionModel();
                                            //            sLed.SubLedgerId = GetDefaultSubLedgerId((int)pm.LedgerId);
                                            //            sLed.LedgerId = (int)pm.LedgerId;
                                            //            sLedgers.Add(sLed);
                                            //            txnItemPM.SubLedgers = sLedgers;
                                            //            txnItemPM.CostCenterId = DefaultCostCenter.CostCenterId;
                                            //            txnItemPM.Amount = pm.TotalAmount;
                                            //            txnItemPM.DrCr = ruleRow.DrCr;
                                            //            txnItemPM.LedgerId = (int)pm.LedgerId;
                                            //            transaction.TransactionItems.Add(txnItemPM);
                                            //        }

                                            //    });
                                            //}
                                            //else
                                            //{
                                            //    accTxnItems.Amount = (decimal)(record.TotalAmount - record.DiscountAmount);
                                            //    var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            //    ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            //    subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            //    subLed.LedgerId = ledId;
                                            //    subLedgers.Add(subLed);
                                            //    accTxnItems.SubLedgers = subLedgers;
                                            //    accTxnItems.DrCr = ruleRow.DrCr;
                                            //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            //    transaction.TransactionType = record.TransactionType;
                                            //    transaction.TransactionItems.Add(accTxnItems);


                                            //}

                                            accTxnItems.Amount = (decimal)(record.TotalAmount - record.DiscountAmount);
                                            var ledName = GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId);
                                            ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

                                            //accTxnItems.Amount = (record.TotalAmount - record.DiscountAmount) + record.TaxAmount;
                                            //var ledName = (record.PaymentMode == "cash") ? GetLedgerName("ACA_CASH_IN_HAND_CASH", currHospitalId) : GetLedgerName("ACA_BANK_HAMS_BANK", currHospitalId);
                                            //ledId = GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);


                                            accTxnItems.TransactionItemDetails = new List<TransactionItemDetailModel>();
                                            //transaction.BillSyncs.ForEach(r =>
                                            //{
                                            //    var accTxnItemDetail = new TransactionItemDetailModel();
                                            //    //  accTxnItemDetail.PatientId = r.PatientId;
                                            //    accTxnItemDetail.ReferenceId = r.CreatedBy;
                                            //    accTxnItemDetail.ReferenceType = "User";
                                            //    accTxnItemDetail.Amount = r.TotalAmount;
                                            //    accTxnItemDetail.Description = "CreditBillPaid->Cash -> Created By";
                                            //    accTxnItems.TransactionItemDetails.Add(accTxnItemDetail);
                                            //});
                                            accTxnItems.IsTxnDetails = true;
                                        }
                                        else if (ruleRow.Description == "PHRMCreditBillPaidSundryDebtors")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            if (record.CreditOrganizationId == null)
                                            {
                                                ledId = GetLedgerId(GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                                subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerIdFromBilCreditOrganization(record.CreditOrganizationId, ruleRow.LedgerGroupId, currHospitalId);
                                                var sub_Ledger = BillingCreditOrganizations.Find(a => a.ReferenceId == record.CreditOrganizationId);
                                                subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;

                                            }
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);
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
                                        else if (ruleRow.Description == "PHRMCreditBillPaidAdministrationExpenses")
                                        {
                                            accTxnItems.Amount = (decimal)record.DiscountAmount;
                                            //nbb-charak changes
                                            if (ACCHospital[0].HospitalShortName.ToLower() == "charak")
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            else
                                            {
                                                ledId = GetLedgerId(GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            }
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                            subLed.LedgerId = ledId;
                                            subLedgers.Add(subLed);
                                            accTxnItems.SubLedgers = subLedgers;
                                            accTxnItems.DrCr = ruleRow.DrCr;
                                            accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                            transaction.TransactionType = record.TransactionType;
                                            transaction.TransactionItems.Add(accTxnItems);

                                        }

                                        //if (ruleRow.Description != "CreditBillPaidCashInHand" && ruleRow.Name != "ACA_BANK")
                                        //{
                                        //    accTxnItems.DrCr = ruleRow.DrCr;
                                        //    accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        //    transaction.TransactionType = record.TransactionType;
                                        //    //      accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
                                        //    transaction.TransactionItems.Add(accTxnItems);
                                        //}

                                    });
                                }
                                break;
                            }

                        case "PHRMAdjustmentIn":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMAdjustmentIn").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMAdjustmentIn").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMAdjustmentInInventory")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMAdjustmentInCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        transaction.TransactionItems.Add(accTxnItems);
                                    });
                                }
                                break;
                            }

                        case "PHRMAdjustmentOut":
                            {
                                transaction.VoucherId = (int)RuleMappingList.Find(s => s.Description == "PHRMAdjustmentOut").VoucherId;
                                var transferRule = RuleMappingList.Find(a => a.Description == "PHRMAdjustmentOut").MappingDetail;
                                if (transferRule.Count > 0)
                                {
                                    transaction.TransactionItems = new List<TransactionItemModel>();
                                    transferRule.ForEach(ruleRow =>
                                    {
                                        var accTxnItems = new TransactionItemModel();
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        var ledId = 0;
                                        accTxnItems.IsTxnDetails = false;
                                        transaction.TransactionType = record.TransactionType;
                                        if (ruleRow.Description == "PHRMAdjustmentOutInventory")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        else if (ruleRow.Description == "PHRMAdjustmentOutCostofGoodsSold")
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerId(GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                        }
                                        subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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

                var Temp = accTxnFromPhrm.Select(tx =>
                {
                    if (tx.TransactionItems != null)
                        tx.TransactionItems = tx.TransactionItems.OrderByDescending(o => o.DrCr).ToList();

                    return tx;

                }).ToList();

                Transaction = Temp;
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
                var DefaultCostCenter = accountingDBContext.CostCenters.Where(a => a.IsDefault == true && a.IsActive == true).FirstOrDefault();
                var accTxnFromINCV = new List<TransactionModel>();
                for (int i = 0; i < INCTVConsultantIncentive.Count; i++)
                {
                    var record = INCTVConsultantIncentive[i];
                    var transaction = new TransactionModel();
                    transaction.FiscalyearId = fiscalYearId;
                    transaction.Remarks = "";
                    transaction.SectionId = 5;
                    transaction.TransactionDate = (DateTime)record.TransactionDate;
                    //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
                    transaction.VoucherId = record.VoucherId;
                    var referenceIdArray = record.ReferenceIds;
                    //transaction.TransactionLinks = new List<TransactionLinkModel>();
                    TransactionLinkModel txnLink = new TransactionLinkModel();
                    txnLink.ReferenceId = string.Join(",", referenceIdArray);
                    //transaction.TransactionLinks.Add(txnLink);

                    switch (record.TransactionType)
                    {
                        case "ConsultantIncentive":
                            {
                                //transaction.CostCenterId = CostCenterNotApplicableCostCenterId;
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
                                        var subLedgers = new List<SubLedgerTransactionModel>();
                                        var subLed = new SubLedgerTransactionModel();
                                        accTxnItems.CostCenterId = DefaultCostCenter.CostCenterId;
                                        transaction.TransactionType = record.TransactionType;
                                        var isMinus = (record.TotalAmount < 0) ? true : false;
                                        if (ruleRow.Description == "ConsultantIncentiveMEDICALDIRECTEXPENSES" && ruleRow.DrCr == true)
                                        {
                                            accTxnItems.Amount = (decimal)(record.TotalAmount + record.TotalTDS);
                                            ledId = GetLedgerId(GetLedgerName("EE_MEDICAL_DIRECT_EXPENSESCOMMISSION_EXPENSES_(TECHNICAL_DISTRIBUTION)", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "ConsultantIncentiveCONSULTANTTDS" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalTDS;
                                            ledId = GetLedgerId(GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE", currHospitalId), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId, currHospitalId);
                                            subLed.SubLedgerId = GetDefaultSubLedgerId(ledId);
                                        }
                                        else if (ruleRow.Description == "ConsultantIncentiveCONSULTANT(CREDITA/C)" && ruleRow.DrCr == false)
                                        {
                                            accTxnItems.Amount = (decimal)record.TotalAmount;
                                            ledId = GetLedgerIdFromConsultant(record.EmployeeId, ruleRow.LedgerGroupId, currHospitalId);
                                            var sub_Ledger = ConsultantLedger.Find(a => a.EmployeeId == record.EmployeeId);
                                            subLed.SubLedgerId = sub_Ledger != null ? (int)sub_Ledger.SubLedgerId : 0;
                                        }

                                        accTxnItems.DrCr = ruleRow.DrCr;
                                        accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
                                        if (isMinus == true)
                                        {
                                            accTxnItems.DrCr = (ruleRow.DrCr == true) ? false : true;
                                            accTxnItems.Amount = Convert.ToDecimal(Decimal.Negate(Convert.ToDecimal(accTxnItems.Amount)));
                                        }
                                        subLed.LedgerId = ledId;
                                        subLedgers.Add(subLed);
                                        accTxnItems.SubLedgers = subLedgers;
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

        //method for get vendor as a ledgerrecord.SupplierId, ruleRow.LedgerGroupId, record.SupplierName
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
                if (ConsultantLedger.Count > 0)
                {
                    checkFlag = ConsultantLedger.Exists(a => a.EmployeeId == empId);
                }
                if (checkFlag == true)
                {
                    return ConsultantLedger.Find(a => a.EmployeeId == empId).LedgerId;
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
            return  DALFunctions.GetDatasetFromStoredProc("SP_ACC_GetPharmacyTransactions", paramList, accountingDBContext);
             
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
        public static bool LedgerAddUpdateInBalanceHisotry(LedgerModel ledgerModel, AccountingDbContext accountingDBContext, bool IsBackDateEntry, int currHospitalId, int CurrentUserId)
        {
            try
            {
                // Get PrimaryGroups by code.
                var ledGroup = accountingDBContext.LedgerGroups.Where(lg => lg.LedgerGroupId == ledgerModel.LedgerGroupId
                && lg.HospitalId == currHospitalId).FirstOrDefault();

                //update ledger details in balance history table
                // Update Ledger method will update OpeningBalance, OpeningBalanceType,etc
                var currentFiscalYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                var FYId = GetFiscalYearIdForOpeningBalance(accountingDBContext, currentFiscalYearId, currHospitalId);
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
                    ledgerBalanceHistory.ClosingBalance = 0;
                    ledgerBalanceHistory.ClosingDrCr = true;
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
                //var code = (from led in accountingDBContext.Ledgers
                //            where led.HospitalId == currHospitalId
                //            select led.Code).ToList().Max();
                var code = "";
                
                var maxCode = accountingDBContext.Ledgers.AsQueryable()
                                            .Where(t => t.HospitalId == currHospitalId && t.Code.Length>0)
                                            .Select(i => i.Code).DefaultIfEmpty().ToList().Max(t => Convert.ToInt32(t));
                if (maxCode != 0)
                {
                    code = Convert.ToString(maxCode + 1);
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

        public static string GetProvisionalSubLedgerCode(AccountingDbContext accountingDBContext)
        {
            try
            {
                var code = "";
                var maxCode = accountingDBContext.SubLedger
                                            .Where(t => t.SubLedgerCode.Length > 0)
                                            .Select(i => i.SubLedgerCode).DefaultIfEmpty().ToList().Max(t => Convert.ToInt32(t));
                if (maxCode != 0)
                {
                    code = Convert.ToString(maxCode + 1);
                }
                else
                {
                    var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "MinimumSubLedgerCode").FirstOrDefault().ParameterValue;
                    if (paraValue != "")
                    {
                        code = paraValue;
                    }
                    else
                    {
                        var initialCode = "1001";
                        code = initialCode;
                    }
                }
                return code.ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

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

                    //var preFiscalYearId = GetFiscalYearIdByDate(accountingDbContext, fiscalYear.StartDate.AddDays(-10), currHospitalId);
                    //if (preFiscalYearId > 0)
                    //{
                    //    var preFYear = (from fy in accountingDbContext.FiscalYears
                    //                    where fy.FiscalYearId == preFiscalYearId && fy.HospitalId == currHospitalId
                    //                    select fy).FirstOrDefault();
                    //    correctFiscalYearId = (preFYear.IsClosed == true) ? selFiscalYearId : preFYear.FiscalYearId;
                    //}
                    //else
                    //{
                    //    correctFiscalYearId = selFiscalYearId;
                    //}

                    //NBB-21 sep 2021-we need to send last opened fiscal year from db 

                 
                    var lastOpenedFiscalYear = (from fy in accountingDbContext.FiscalYears
                                                where fy.HospitalId == currHospitalId && fy.IsClosed == false  && fy.IsActive == true
                                               select fy).OrderBy(f => f.FiscalYearId).FirstOrDefault();
                    if (lastOpenedFiscalYear != null)
                    {
                        correctFiscalYearId = lastOpenedFiscalYear.FiscalYearId;
                    }
                    else {
                        correctFiscalYearId = selFiscalYearId;
                    }
                    //GetFiscalYearIdByDate(accountingDbContext, fiscalYear.StartDate.AddDays(-10), currHospitalId);
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
                var accHospital = _accDbContext.CFGParameters.Where(a => a.ParameterGroupName.ToLower() == "accounting" && a.ParameterName.ToLower() == "accprimaryhospitalshortname").FirstOrDefault().ParameterValue;
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

        //NageshBB-20 Jan 2021
        #region Function for insert Ledger(s) into LedgerBalance History table for closed fiscal Year
        /// <summary>
        /// This is reusable function which check ledger entry into ledger balance history table for closed fiscal years
        /// not for IsActive=false fiscal years
        /// Problem
        /// =======================
        /// -Suppose fiscal year 2076-77 is closed and now 2077-78 is opened active fiscal year
        /// and user created one ledger i.e. LedgerABC
        /// Now we have this ledger in ledger table and Ledger baalnce history table with current fiscal year 2077-78
        /// if user want data for LedgerABC with closed fiscal years using  ledger report , trial balance, etc then we have issue because 
        /// LedgerABC not available in Ledger balance history with old fiscal year         
        /// solution
        /// ==================
        /// when user insert new ledger check this ledger is available into ledger balance hsitory table with all closed fiscal years
        /// if yes then no need to insert. if not then insert ledger into ledger balance history with every closed fiscal year
        /// </summary>
        /// <param name="_accDbContext"></param>
        /// <param name="_ledgerModelData"></param>
        /// <returns></returns>
        public static void AddLedgerForClosedFiscalYears(AccountingDbContext _accDbContext, LedgerModel _ledgerModelData)
        {
            try
            {
                if (_ledgerModelData.LedgerId > 0)
                {
                    var closedFiscalYears = (from fy in _accDbContext.FiscalYears
                                             where fy.IsClosed == true && fy.IsActive == true
                                             select new
                                             {
                                                 fy.FiscalYearId,
                                                 fy.FiscalYearName,
                                                 fy.IsActive,
                                                 fy.IsClosed
                                             }).ToList();
                    closedFiscalYears.ForEach(f =>
                    {
                        bool exists = _accDbContext.LedgerBalanceHistory.Any(t => t.LedgerId == _ledgerModelData.LedgerId && t.FiscalYearId == f.FiscalYearId && t.HospitalId == _ledgerModelData.HospitalId);
                        if (exists == false)
                        {
                            LedgerBalanceHistoryModel ledgerObj = new LedgerBalanceHistoryModel();
                            ledgerObj.FiscalYearId = f.FiscalYearId;
                            ledgerObj.LedgerId = _ledgerModelData.LedgerId;
                            ledgerObj.OpeningBalance = 0;
                            ledgerObj.OpeningDrCr = true;
                            ledgerObj.ClosingBalance = 0;
                            ledgerObj.ClosingDrCr = true;
                            ledgerObj.CreatedBy = _ledgerModelData.CreatedBy;
                            ledgerObj.CreatedOn = System.DateTime.Now;
                            ledgerObj.HospitalId = _ledgerModelData.HospitalId;
                            _accDbContext.LedgerBalanceHistory.Add(ledgerObj);
                            _accDbContext.SaveChanges();
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        //AniketJadhav-21 Jul 2021
        #region get autogenerated code for coa
        public static string GetAutoGeneratedCodeForCOA(AccountingDbContext accountingDbContext, ChartOfAccountModel coa)
        {
            try
            {
                var pg = accountingDbContext.PrimaryGroup.FirstOrDefault(a => a.PrimaryGroupId == coa.PrimaryGroupId).PrimaryGroupName.ToUpper();
                var name = coa.ChartOfAccountName.Replace(" ", "").ToUpper().Trim();
                return pg + "_" + name;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        public static bool DuplicateCheckByLedgerName(AccountingDbContext accountingDbContext, LedgerModel ledger, int currentHospitalId)
        {
            try
            {
                var matchedLedger = accountingDbContext.Ledgers.Where(l => l.LedgerGroupId == (int)ledger.LedgerGroupId && l.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower() && l.HospitalId == currentHospitalId).FirstOrDefault();
                return (matchedLedger == null) ? false : true;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #region Save SubLedgerBalanceHistory
        public static bool SubLedgerBalanceHisotrySave(List<SubLedgerModel> subLedgerModel, AccountingDbContext accountingDBContext, int currHospitalId, int CurrentUserId)
        {
            try
            {
                var currentFiscalYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                var FYId = GetFiscalYearIdForOpeningBalance(accountingDBContext, currentFiscalYearId, currHospitalId);
                var balanceHistory = new List<SubLedgerBalanceHistory>();
                subLedgerModel.ForEach(sub =>
                {
                    var fYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                    SubLedgerBalanceHistory subLedgerBalanceHistory = new SubLedgerBalanceHistory();
                    subLedgerBalanceHistory.SubLedgerId = sub.SubLedgerId;
                    subLedgerBalanceHistory.FiscalYearId = fYearId;
                    subLedgerBalanceHistory.OpeningBalance = sub.OpeningBalance;
                    subLedgerBalanceHistory.OpeningDrCr = sub.DrCr;
                    subLedgerBalanceHistory.ClosingBalance = 0;
                    subLedgerBalanceHistory.ClosingDrCr = sub.DrCr;
                    subLedgerBalanceHistory.CreatedOn = DateTime.Now.Date;
                    subLedgerBalanceHistory.CreatedBy = sub.CreatedBy;
                    subLedgerBalanceHistory.HospitalId = currHospitalId;
                    balanceHistory.Add(subLedgerBalanceHistory);
                });
                accountingDBContext.SubLedgerBalanceHistory.AddRange(balanceHistory);
                accountingDBContext.SaveChanges();
                return true;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion
        #region Update SubLedgerBalanceHistory
        public static async Task<bool> SubLedgerBalanceHisotryUpdate(SubLedgerModel subLedgerModel, AccountingDbContext accountingDBContext, int currHospitalId, int CurrentUserId)
        {
            try
            {
                var currentFiscalYearId = GetFiscalYearIdByDate(accountingDBContext, DateTime.Now.Date, currHospitalId);
                var existingSubLedger = await accountingDBContext.SubLedgerBalanceHistory.Where(a => a.SubLedgerId == subLedgerModel.SubLedgerId && a.FiscalYearId == currentFiscalYearId).FirstOrDefaultAsync();
                if (existingSubLedger != null)
                {
                    existingSubLedger.OpeningBalance = subLedgerModel.OpeningBalance;
                    existingSubLedger.OpeningDrCr = subLedgerModel.DrCr;
                    existingSubLedger.HospitalId = currHospitalId;
                    existingSubLedger.ModifiedOn = DateTime.Now;
                    existingSubLedger.ModifiedBy = CurrentUserId;
                    accountingDBContext.SubLedgerBalanceHistory.Attach(existingSubLedger);
                    accountingDBContext.Entry(existingSubLedger).Property(x => x.ModifiedOn).IsModified = true;
                    accountingDBContext.Entry(existingSubLedger).Property(x => x.ModifiedBy).IsModified = true;
                    accountingDBContext.Entry(existingSubLedger).Property(x => x.OpeningBalance).IsModified = true;
                    accountingDBContext.Entry(existingSubLedger).Property(x => x.OpeningDrCr).IsModified = true;
                }
                await accountingDBContext.SaveChangesAsync();
                return true;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion 
    }

    public static class ENUM_ACC_TransferRules
    {
        public static readonly string CreditBillCoPaymentCashAmount = "CreditBillCoPaymentCashAmount";
        public static readonly string CreditBillReturnCoPaymentCashAmount = "CreditBillReturnCoPaymentCashAmount";
        public static readonly string PHRMCreditInvoice1CoPaymentCashAmount = "PHRMCreditInvoice1CoPaymentCashAmount";
        public static readonly string PHRMCreditInvoiceReturn1CoPaymentCashAmount = "PHRMCreditInvoiceReturn1CoPaymentCashAmount";
    }

    public static class ENUM_ACC_LedgerName
    {
        public static readonly string Cash = "ACA_CASH_IN_HAND_CASH";
    }
    public static class ENUM_ACC_VoucherStatus
    {
        public static readonly string Draft = "draft";
        public static readonly string InReview = "inreview";
        public static readonly string Verified = "verified";
        public static readonly string Canceled = "canceled";
    }

    public class SubLedgerCostCenterConfig_DTO
    {
        public bool EnableSubLedger { get; set; }
        public bool EnableCostCenter { get; set; }
    }
}
