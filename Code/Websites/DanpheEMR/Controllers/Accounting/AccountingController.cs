using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DanpheEMR.Core.Configuration;
using DanpheEMR.ServerModel;
using DanpheEMR.DalLayer;
using System.Data.Entity;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using DanpheEMR.Utilities;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http.Features;
using DanpheEMR.CommonTypes;
using RefactorThis.GraphDiff;//for entity-update.
using DanpheEMR.Security;
using System.Data;
using System.Data.Entity.Core.Objects;
using System.Collections;
using DanpheEMR.AccTransfer;
using DanpheEMR.Core.Caching;
using DanpheEMR.ServerModel.IncentiveModels;
using DanpheEMR.Core;
using DanpheEMR.ServerModel.AccountingModels;
using Newtonsoft.Json.Converters;
using DanpheEMR.Enums;
using DanpheEMR.ServerModel.AccountingModels.ViewModels;
using DanpheEMR.Controllers.Stickers.DTOs;
using DanpheEMR.Controllers.Accounting.DTOs;
using DanpheEMR.Services.Accounting.DTOs;
using DanpheEMR.ServerModel.MedicareModels;
using DanpheEMR.ServerModel.AccountingModels.DTOs;
using DanpheEMR.ServerModel.AccountingModels.Transactions;
//using System.Collections;

namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingController : CommonController
    {
        private AccountingDbContext _accountingDbContext;
        public AccountingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;
            _accountingDbContext = new AccountingDbContext(connString);
        }

        #region Start HTTP GET APIs

        #region Get Vouchers
        [HttpGet]
        [Route("Vouchers")]
        public IActionResult Vouchers()
        {
            //if (reqType == "Vouchers")
            Func<object> func = () => GetVoucher();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Voucher Head
        [HttpGet]
        [Route("VoucherHeads")]
        public IActionResult GetVoucherHead()
        {
            //else if (reqType == "get-voucher-head")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetVoucherHead(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Ledger List
        [HttpGet]
        [Route("Ledgers")]
        public IActionResult GetLedgers()
        {
            //else if (reqType == "ledger-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetLedgerList(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get MappedLedger List
        [HttpGet]
        [Route("MappedLedgers")]
        public IActionResult GetMappedLedgers(string ledgerType)
        {
            //else if (reqType == "get-mapped-ledger-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetMappedLedgers(ledgerType, currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get FiscalYear List
        [HttpGet]
        [Route("FiscalYears")]
        public IActionResult GetFiscalYear()
        {
            //else if (reqType == "fiscalyear-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetFiscalYear(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get CostCenterItems List
        [HttpGet]
        [Route("CostCenterItems")]
        public IActionResult GetCostCenterItems()
        {
            //else if (reqType == "costcentric-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetCostCenterItems(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Active Fiscal Year List
        [HttpGet]
        [Route("ActiveFiscalYears")]
        public IActionResult GetActiveFiscalYear()
        {
            //else if (reqType == "active-fiscal-year")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetActiveFiscalYears(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Transaction List
        [HttpGet]
        [Route("Transactions")]
        public IActionResult GetTransactionList(int transactionId)
        {
            //else if (reqType == "transaction")
            Func<object> func = () => GetTransactionList(transactionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Transaction By VoucherNumber
        [HttpGet]
        [Route("TransactionByVoucherNumber")]
        public IActionResult GetTransactionByVoucherNumber(string voucherNumber, int? sectionId, int FiscalYearId)
        {
            //else if (reqType == "transactionbyVoucher")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetTransactionByVoucherNumber(currentHospitalId, sectionId, voucherNumber, FiscalYearId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Check Reference Transaction Id
        [HttpGet]
        [Route("RefrenceTransactionId")]
        public IActionResult CheckRefreceTransactionId(string voucherNumber, int? voucherId)
        {
            //else if (reqType == "check-reference-txnId")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => CheckRefrenceTransactionId(currentHospitalId, voucherNumber, voucherId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Data For Inventory To Accounting
        [HttpGet]
        [Route("InventoryToAccounting")]
        public IActionResult GetInventoryDataForPostToAccounting(DateTime SelectedDate, int FiscalYearId)
        {
            //else if (reqType == "inventory-to-accounting")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetInventoryDataForPostToAccounting(currentUser, currentHospitalId, SelectedDate, FiscalYearId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Ledger Mapping List
        [HttpGet]
        [Route("LedgerMapping")]
        public IActionResult GetLedgerMapping()
        {
            //else if (reqType == "ledger-mapping")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetLedgerMapping(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Consultant Ledgers
        [HttpGet]
        [Route("ConsultantLedgers")]
        public IActionResult GetConsultantLedgers()
        {
            //else if (reqType == "get-employee")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetConsultantLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Pharmacy Supplier Ledgers
        [HttpGet]
        [Route("PharmacySupplierLedgers")]
        public IActionResult GetPharmacySupplierLedgers()
        {
            //else if (reqType == "phrm-supplier")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetPharmacySupplierLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Inventory Vendor Ledgers
        [HttpGet]
        [Route("InventoryVendorLedgers")]
        public IActionResult GetInventoryVendorLedgers()
        {
            //else if (reqType == "get-invVendor-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetInventoryVendorLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Inventory SubCategory Ledgers
        [HttpGet]
        [Route("InventorySubCategoryLedgers")]
        public IActionResult GetInventorySubCategoryLedgers()
        {
            //else if (reqType == "get-invSubcategory-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetInventorySubCategoryLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Credit Organization Ledgers
        [HttpGet]
        [Route("CreditOrganizationLedgers")]
        public IActionResult GetCreditOrganizationLedgers()
        {
            //else if (reqType == "get-creditOrg-list")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetCreditOrganizationLedgers(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

   

        #region Get Data For Billing To Accounting
        [HttpGet]
        [Route("BillingToAccounting")]
        public IActionResult GetBillingDataForPostToAccounting(DateTime SelectedDate, int FiscalYearId)
        {
            //else if (reqType == "billing-to-accounting")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetBillingDataForPostToAccounting(currentUser, currentHospitalId, SelectedDate, FiscalYearId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Data For Pharmacy To Accounting
        [HttpGet]
        [Route("PharmacyToAccounting")]
        public IActionResult GetPharmacyDataForPostToAccounting(DateTime SelectedDate, int FiscalYearId)
        {
            //else if (reqType == "pharmacy-to-accounting")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetPharmacyDataForPostToAccounting(currentUser, currentHospitalId, SelectedDate, FiscalYearId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Data For Incentive To Accounting
        [HttpGet]
        [Route("IncentiveToAccounting")]
        public IActionResult GetIncentiveDataForPostToAccounting(DateTime SelectedDate, int FiscalYearId)
        {
            //else if (reqType == "incentive-to-accounting")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetIncentiveDataForPostToAccounting(currentUser, currentHospitalId, SelectedDate, FiscalYearId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Voucher Detail For Edit Voucher
        [HttpGet]
        [Route("Voucher")]
        public IActionResult GetVoucherDetailForEditVoucher(string voucherNumber, int FiscalYearId)
        {
            //else if (reqType == "getVoucherforedit")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetVoucherDetailForEditVoucher(voucherNumber, FiscalYearId, currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Provisional Voucher Number
        [HttpGet]
        [Route("ProvisionalVoucherNumber")]
        public IActionResult GetProvisionalVoucherNumber(int? voucherId,int? sectionId, DateTime transactiondate)
        {
            //else if (reqType == "gettempVoucherNumber")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetProvisionalVoucherNumber(voucherId, sectionId, transactiondate, currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Accounting Codes
        [HttpGet]
        [Route("AccountingCodes")]
        public IActionResult GetAccountingCodes()
        {
            //else if (reqType == "code-details")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetAccountingCodes(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Provisional Ledger Code
        [HttpGet]
        [Route("ProvisionalLedgerCode")]
        public IActionResult GetProvisionalLedgerCode()
        {
            //else if (reqType == "provisional-ledger-code")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetProvisionalLedgerCode(currentHospitalId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Provisional Ledger Detail
        [HttpGet]
        [Route("ProvisionalLedgerDetail")]
        public IActionResult ProvisionalLedgerDetail(string ledgerType, int referenceId)
        {
            //else if (reqType == "get-provisional-ledger")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetProvisionalLedgerDetail(ledgerType, currentHospitalId, referenceId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Accounting Hospital/Tenants
        [HttpGet]
        [Route("Hospitals")]
        public IActionResult GetHospitals()
        {
            //else if (reqType == "getAllActiveTenants")
            Func<object> func = () => GetActiveTenants();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get FiscalYear Logs
        [HttpGet]
        [Route("FiscalYearLogs")]
        public IActionResult FiscalYearLogs()
        {
            //else if (reqType == "get-fsyearactivity")
            Func<object> func = () => GetFiscalYearLogs();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Employee Ledgers
        [HttpGet]
        [Route("EmployeeLedgers")]
        public IActionResult GetAllEmployeeLedgers()
        {
            //else if (reqType == "acc-get-employee-ledger-list")
            Func<object> func = () => GetEmployeeLedgers();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Accounting Transaction Dates
        [HttpGet]
        [Route("TransactionDates")]
        public IActionResult GetTransactionDates(DateTime FromDate, DateTime ToDate, int? sectionId)
        {
            //else if (reqType == "acc-get-txn-dates")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => GetTransactionDates(FromDate, ToDate, currentHospitalId, sectionId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Bank Reconciliation Categories
        [HttpGet]
        [Route("BankReconciliationCategories")]
        public IActionResult BankReconciliationCategoies(DateTime FromDate, DateTime ToDate, int? sectionId)
        {
            //if (reqType == "get-bank-reconciliation-category")
            Func<object> func = () => GetBanckReconciliationCategories();
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Good Receipt List
        [HttpGet]
        [Route("GoodReceipts")]
        public IActionResult GoodReceiptList(int? sectionId, int? voucherId, DateTime transactiondate, string voucherNumber)
        {
            //if (reqType == "get-grlist")
            Func<object> func = () => GetGoodReceiptList(sectionId, voucherId, transactiondate, voucherNumber);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion

        #region Get Bank Reconciliation Category 

        [HttpGet]
        [Route("GetBankReconciliationCategory")]
        public string GetBankReconciliationCategory()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            var BankReconciliationCategory = _accountingDbContext.BankReconciliationCategory.Where(c => c.IsActive == true).ToList();

            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = BankReconciliationCategory;

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        #endregion

        #region Get Payment Modes ledger mapping details

        [HttpGet]
        [Route("get-paymentmodes")]
        public string GetPaymentModeMapLedgers()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);

            try
            {
                var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                                  where lm.HospitalId == currentHospitalId && lm.LedgerType == ENUM_ACC_LedgerType.PaymentMode
                                  select new
                                  {
                                      LedgerId = lm.LedgerId,
                                      LedgerMappingId = lm.LedgerMappingId,
                                      LedgerType = lm.LedgerType,
                                      ReferenceId = lm.ReferenceId,
                                      SubLedgerId = lm.SubLedgerId
                                  }).AsQueryable();

                var NewEmpledgerList = (from payMod in _accountingDbContext.PaymentMode
                                        join ledgMp in ledMapLsit on payMod.PaymentSubCategoryId equals ledgMp.ReferenceId into lmp
                                        from ledM in lmp.DefaultIfEmpty()
                                        join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                        from led in ld.DefaultIfEmpty()
                                        join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                        from subLed in sl.DefaultIfEmpty()
                                        where payMod.ShowInMultiplePaymentMode == true
                                        select new
                                        {
                                            LedgerId = led != null ? led.LedgerId > 0 ? led.LedgerId : 0 : 0,
                                            LedgerGroupId = led != null ? (int?)led.LedgerGroupId : 0,
                                            LedgerName = led != null ? led.LedgerName : "",
                                            LedgerReferenceId = payMod.PaymentSubCategoryId,
                                            Description = led != null ? led.Description : "",
                                            IsActive = led != null ? (bool?)led.IsActive : false,
                                            IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                            OpeningBalance = led != null ? led.OpeningBalance : 0,
                                            DrCr = led != null ? led.DrCr : false,
                                            Name = led != null ? led.Name : "",
                                            LedgerType = ledM != null ? ledM.LedgerType : "",
                                            Code = led != null ? led.Code : "",
                                            PANNo = led != null ? led.PANNo : "",
                                            Address = led != null ? led.Address : "",
                                            MobileNo = led != null ? led.MobileNo : "",
                                            CreditPeriod = led != null ? led.CreditPeriod : 0,
                                            TDSPercent = led != null ? led.TDSPercent : 0,
                                            LandlineNo = led != null ? led.LandlineNo : "",
                                            PaymentMode = payMod.PaymentSubCategoryName,
                                            PaymentSubCategoryId = payMod.PaymentSubCategoryId,
                                            IsSelected = false,
                                            IsMapped = led != null ? ((led.LedgerId > 0) ? true : false) : false,
                                            SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                            SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                        }).OrderByDescending(l => l.LedgerId).ToList();
                responseData.Results = NewEmpledgerList;
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
            }
            catch (Exception ex)
            {

                throw ex;
            }

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        #endregion

        #region Get Suspense A/C Reconciliation Detail
        [HttpGet]
        [Route("SuspenseAccountReconciliationDetail")]
        public IActionResult GetSuspenaseAccountReconciliationInfo(int BankLedgerId, int SuspenseAccountLedgerId)
        {
            Func<object> func = () => GetSuspenseAccountReconciliationDetail(BankLedgerId,SuspenseAccountLedgerId);
            return InvokeHttpGetFunction<object>(func);
        }
        #endregion
        #endregion


        //public string Get(int? voucherId, int transactionId, int ledgerId, string voucherNumber, string ledgerName, DateTime FromDate, DateTime ToDate, int? sectionId, string ledgerType, int referenceId, DateTime SelectedDate, int FiscalYearId, DateTime transactiondate)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
        //    InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
        //    BillingDbContext billingDbContext = new BillingDbContext(connString);
        //    PharmacyDbContext pharmacyDbContext = new PharmacyDbContext(connString);

        //    var IsCustomVoucher = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "CustomSaleVoucher").Select(a => a.ParameterValue).FirstOrDefault();

        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");


        //    try
        //    {
        //        string reqType = this.ReadQueryStringData("reqType");
        // #region Vouchers
        //if (reqType == "Vouchers")
        //{
        //    var voucherList = (from voc in accountingDBContext.Vouchers
        //                       where voc.IsActive == true
        //                       select new
        //                       {
        //                           VoucherId = voc.VoucherId,
        //                           VoucherName = voc.VoucherName,
        //                           VoucherCode = voc.VoucherCode,
        //                           IsActive = voc.IsActive,
        //                           Description = voc.Description,
        //                           CreatedOn = voc.CreatedOn,
        //                           CreatedBy = voc.CreatedBy,
        //                           ISCopyDescription = voc.ISCopyDescription,
        //                           ShowPayeeName = voc.ShowPayeeName,
        //                           ShowChequeNumber = voc.ShowChequeNumber
        //                       }).ToList<object>();
        //    responseData = AccountingBL.CheckResponseObject(voucherList,"Voucher");
        //}
        //else if (reqType == "get-voucher-head")
        //{
        //    var voucherHeadList = (from voucherHead in accountingDBContext.VoucherHeads
        //                           where voucherHead.IsActive == true && voucherHead.HospitalId == currentHospitalId
        //                           select new
        //                           {
        //                               voucherHead.VoucherHeadId,
        //                               voucherHead.HospitalId,
        //                               voucherHead.VoucherHeadName,
        //                               voucherHead.Description,
        //                               voucherHead.CreatedOn,
        //                               voucherHead.CreatedBy,
        //                               voucherHead.IsActive,
        //                               voucherHead.IsDefault
        //                           }).ToList<object>();
        //    responseData = AccountingBL.CheckResponseObject(voucherHeadList,"VoucherHead");
        //}
        // #endregion
        //#region Ledger List
        //else if (reqType == "ledger-list")
        //{
        //    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //    //for this resolution we have temp solution
        //    //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //    //if user have only one hsopital permission then automatically activate this hospital
        //    var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);
        //    var dToday = DateTime.Now.Date;
        //    var CurrentFYId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, dToday, HospId);
        //    List<SqlParameter> paramList = new List<SqlParameter>()
        //                {
        //                        new SqlParameter("@HospitalId", HospId),
        //                        new SqlParameter("@FiscalYearIdForOpeningBal",AccountingTransferData.GetFiscalYearIdForOpeningBalance(accountingDBContext, CurrentFYId, HospId)),
        //                        new SqlParameter("@GetClosingBal", true)
        //                };
        //    var spDataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetLedgerList", paramList, accountingDBContext);
        //    var resultStr = JsonConvert.SerializeObject(spDataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
        //    var ledgerList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
        //    responseData= AccountingBL.CheckResponseObject(ledgerList,"Ledger");
        //}
        //#endregion
        // VIKAS : 13 Apr 2020: 
        //else if (reqType == "get-mapped-ledger-list")
        //{
        //    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //    //for this resolution we have temp solution
        //    //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //    //if user have only one hsopital permission then automatically activate this hospital
        //    var HospId = 0;
        //    if (ledgerType == "inventorysubcategory")
        //    {
        //        HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);
        //    }
        //    else
        //    {
        //        HospId = currentHospitalId;
        //    }
        //    var ledgerList = (from led in accountingDBContext.Ledgers.AsEnumerable()
        //                      join ledgrp in accountingDBContext.LedgerGroups.AsEnumerable() on led.LedgerGroupId equals ledgrp.LedgerGroupId
        //                      join ledMp in accountingDBContext.LedgerMappings.AsEnumerable() on led.LedgerId equals ledMp.LedgerId
        //                      where led.IsActive == true && ledMp.LedgerType == ledgerType
        //                      && ledgrp.HospitalId == HospId && led.HospitalId == HospId
        //                      select new
        //                      {
        //                          LedgerId = led.LedgerId,
        //                          LedgerName = led.LedgerName,
        //                          LedgerGroupId = led.LedgerGroupId,
        //                          LedgerGroupName = ledgrp.LedgerGroupName,
        //                          PrimaryGroup = ledgrp.PrimaryGroup,
        //                          COA = ledgrp.COA,
        //                          LedgerReferenceId = led.LedgerReferenceId,
        //                          SectionId = led.SectionId,
        //                          Name = led.Name,
        //                          LedgerType = led.LedgerType,
        //                          Code = led.Code
        //                      }).ToList();


        //    responseData.Status = "OK";
        //    responseData.Results = ledgerList;
        //}
        //#region Active Fiscal Year List
        //else if (reqType == "fiscalyear-list")
        //{
        //    var currentDate = DateTime.Now.Date;
        //    var fscList = (from fsc in accountingDBContext.FiscalYears
        //                   where fsc.HospitalId == currentHospitalId && fsc.IsActive == true
        //                   select fsc).OrderByDescending(a => a.FiscalYearId).ToList();
        //    var todaydate = DateTime.Now;
        //    var currentFsId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, todaydate, currentHospitalId);
        //    var currentfs = fscList.Where(fs => fs.FiscalYearId == currentFsId).FirstOrDefault();
        //    var prevFs = (currentfs != null) ? AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, currentfs.StartDate.AddDays(-10), currentHospitalId) : 0;

        //    fscList.ForEach(fs =>
        //    {
        //        fs.HospitalId = currentHospitalId;
        //        fs.nStartDate = this.GetNepaliDate(fs.StartDate);
        //        fs.nEndDate = this.GetNepaliDate(fs.EndDate);
        //        fs.showreopen = ((fs.FiscalYearId == prevFs) && fs.IsClosed == true) ? true : false;
        //    });
        //    responseData.Status = "OK";
        //    responseData.Results = fscList;
        //}
        //#endregion
        //#region Cost Centric List
        //else if (reqType == "costcentric-list")
        //{
        //    var cstCntList = (from cst in accountingDBContext.CostCenterItems
        //                      where cst.IsActive == true && cst.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          cst.HospitalId,
        //                          cst.CostCenterItemId,
        //                          cst.CostCenterItemName
        //                      }).ToList();
        //    responseData.Status = "OK";
        //    responseData.Results = cstCntList;
        //}
        //#endregion
        //#region Active Fiscal Year
        //else if (reqType == "active-fiscal-year")
        //{
        //    var res = (from yr in accountingDBContext.FiscalYears
        //               where yr.IsActive == true && yr.HospitalId == currentHospitalId
        //               select yr).FirstOrDefault();

        //    responseData.Status = "OK";
        //    responseData.Results = res;
        //}
        //#endregion
        //#region Transaction List
        //else if (reqType == "transaction")
        //{
        //    var txnList = (from txn in accountingDBContext.Transactions
        //                   where txn.HospitalId == currentHospitalId
        //                   join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
        //                   join costCenter in accountingDBContext.CostCenterItems on txn.CostCenterId equals costCenter.CostCenterItemId
        //                   join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
        //                   where txn.TransactionId == transactionId && txn.IsActive == true && fiscal.HospitalId == currentHospitalId
        //                   select new
        //                   {
        //                       TransactionId = txn.TransactionId,
        //                       HospitalId = txn.HospitalId,
        //                       VoucherNumber = txn.VoucherNumber,
        //                       FiscalYear = fiscal.FiscalYearName,
        //                       CostCenterName = costCenter.CostCenterItemName,
        //                       TransactionDate = txn.TransactionDate,
        //                       VoucherType = voucher.VoucherName,
        //                       Remarks = txn.Remarks,
        //                       TransactionItems = (from txnItm in accountingDBContext.TransactionItems
        //                                           where txnItm.HospitalId == currentHospitalId
        //                                           join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
        //                                           join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
        //                                           where txnItm.TransactionId == txn.TransactionId
        //                                           && ledgp.HospitalId == currentHospitalId
        //                                           && ledger.HospitalId == currentHospitalId
        //                                           select new
        //                                           {
        //                                               HospitalId = currentHospitalId,
        //                                               LedgerGroupName = ledgp.LedgerGroupName,
        //                                               LedgerName = ledger.LedgerName,
        //                                               DrCr = txnItm.DrCr,
        //                                               Amount = txnItm.Amount
        //                                           }).OrderByDescending(a => a.DrCr == true).ToList()
        //                   }).FirstOrDefault();
        //    responseData.Status = "OK";
        //    responseData.Results = txnList;
        //}
        //#endregion
        //#region Transaction By Voucher
        //else if (reqType == "transactionbyVoucher")
        //{
        //    //getting uniqueid and sectionid of transaction 

        //    try
        //    {
        //        //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //        //for this resolution we have temp solution
        //        //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //        //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //        //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //        //if user have only one hsopital permission then automatically activate this hospital
        //        var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);

        //        var sectionIdStr = (sectionId > 0) ? sectionId.ToString() : string.Empty;
        //        var txnids = (from txn in accountingDBContext.Transactions
        //                      where txn.HospitalId == HospId &&
        //                      txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.SectionId.ToString().Contains(sectionIdStr)
        //                      select new
        //                      {
        //                          txn.SectionId,
        //                      }).FirstOrDefault();

        //        if (txnids != null)
        //        {
        //            if (voucherNumber.Contains("SV") && txnids.SectionId == 2 && IsCustomVoucher == "true")
        //            {//Ajay 15Feb Here we only getting records for Billing Sales Voucher
        //             //getting single transaction with multiple vouchers
        //                var alltransactions = (from txn in accountingDBContext.Transactions
        //                                           //  where txn.TUId == txnids.TUId
        //                                       where txn.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
        //                                       select txn).ToList();
        //                var alltransactionitems = (from txnitm in accountingDBContext.TransactionItems.AsEnumerable()
        //                                           join txn in alltransactions on txnitm.TransactionId equals txn.TransactionId
        //                                           select txnitm).ToList();
        //                //getting only single sales voucher records
        //                var transactions = (from txn in alltransactions
        //                                    where txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
        //                                    select txn).ToList();
        //                //getting transaction items for selected trasnaction
        //                var transactionitems = (from ti in alltransactionitems
        //                                        join t in transactions on ti.TransactionId equals t.TransactionId
        //                                        select ti).ToList();
        //                //getting vouchers
        //                var vouchers = (from v in accountingDBContext.Vouchers select v).ToList();
        //                //getting voucher heads
        //                var voucherheads = (from head in accountingDBContext.VoucherHeads
        //                                    where head.HospitalId == currentHospitalId
        //                                    select head).ToList();
        //                //fiscal year
        //                var fiscalYear = (from fiscal in accountingDBContext.FiscalYears
        //                                  where fiscal.HospitalId == currentHospitalId
        //                                  select fiscal).ToList();
        //                //getting ledgers
        //                var ledgers = (from l in accountingDBContext.Ledgers
        //                               where l.HospitalId == currentHospitalId
        //                               select l).ToList();
        //                //getting ledgergroups
        //                var ledgergroup = (from lg in accountingDBContext.LedgerGroups
        //                                   where lg.HospitalId == currentHospitalId
        //                                   select lg).ToList();
        //                //getting trasnaction items details for supplier patient and for user
        //                var transactionitemdetails = (from d in accountingDBContext.TransactionItemDetails select d).ToList();
        //                //getting patient
        //                var patients = (from pat in accountingDBContext.PatientModel.AsEnumerable()
        //                                join txndetail in transactionitemdetails on pat.PatientId equals txndetail.ReferenceId
        //                                join txnitm in alltransactionitems on txndetail.TransactionItemId equals txnitm.TransactionItemId
        //                                where txndetail.ReferenceType == "Patient"
        //                                select new
        //                                {
        //                                    txndetail.ReferenceId,
        //                                    txnitm.LedgerId,
        //                                    txnitm.DrCr,
        //                                    Name = pat.FirstName + pat.LastName,
        //                                    txndetail.Amount
        //                                }).ToList();
        //                //getting suppliers
        //                var supplier = (from sup in accountingDBContext.PHRMSupplier select sup).ToList();
        //                //getting user details
        //                var userDetails = (from txn in alltransactions
        //                                   join txnitm in alltransactionitems on txn.TransactionId equals txnitm.TransactionId
        //                                   join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
        //                                   join emp in accountingDBContext.Emmployees.AsEnumerable() on txndetail.ReferenceId equals emp.EmployeeId
        //                                   where txndetail.ReferenceType == "User"
        //                                   select new
        //                                   {
        //                                       LedgerId = txnitm.LedgerId,
        //                                       DrCr = txnitm.DrCr,
        //                                       Name = emp.FirstName + " " + (string.IsNullOrEmpty(emp.LastName) ? "" : emp.LastName),
        //                                       txndetail.ReferenceId,
        //                                       txndetail.Amount,
        //                                       txn.VoucherNumber,
        //                                   }).ToList();
        //                //getting amount of credit note voucher and payment voucher
        //                var Amounts = (from txn in alltransactions
        //                               join txnItm in alltransactionitems on txn.TransactionId equals txnItm.TransactionId
        //                               join led in ledgers on txnItm.LedgerId equals led.LedgerId
        //                               join ledG in ledgergroup on led.LedgerGroupId equals ledG.LedgerGroupId
        //                               group new { txn, txnItm, led, ledG } by new { txn.VoucherId } into x
        //                               select new
        //                               {
        //                                   ReturnAmount = x.Where(a => a.txn.VoucherNumber.Contains("CN") && a.txnItm.DrCr == true /*&& a.txn.TransactionType.StartsWith("Cash")*/).Sum(a => a.txnItm.Amount),
        //                                   PaymentAmount = x.Where(a => a.txn.VoucherNumber.Contains("PMTV") && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount),
        //                                   ReturnDiscount = x.Where(a => a.led.Name == "EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount),
        //                                   ReceivablesAmount = (x.Where(a => a.ledG.Name == "ACA_SUNDRY_DEBTORS" && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount)
        //                                                - x.Where(a => a.ledG.Name == "ACA_SUNDRY_DEBTORS" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount))

        //                               }).ToList();
        //                //getting user cash collection
        //                var UserCashCollection = (from user in userDetails
        //                                          group new { user } by new { user.ReferenceId } into x
        //                                          select new
        //                                          {
        //                                              UserName = x.Select(a => a.user.Name).FirstOrDefault(),
        //                                              SalesDr = x.Where(a => a.user.DrCr == true && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
        //                                              SalesCr = x.Where(a => a.user.DrCr == false && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
        //                                              DepositDr = x.Where(a => a.user.DrCr == true && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
        //                                              DepositCr = x.Where(a => a.user.DrCr == false && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
        //                                          }).ToList();
        //                //getting record for selected sales voucher
        //                var temp = (from txn in transactions
        //                            join voucher in vouchers on txn.VoucherId equals voucher.VoucherId
        //                            join costCenter in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenter.CostCenterId
        //                            join fiscal in fiscalYear on txn.FiscalyearId equals fiscal.FiscalYearId
        //                            join emp in accountingDBContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
        //                            select new
        //                            {
        //                                txn.VoucherNumber,
        //                                fiscal.FiscalYearName,
        //                                costCenter.CostCenterName,
        //                                txn.TransactionDate,
        //                                voucher.VoucherName,
        //                                txn.Remarks,
        //                                txn.SectionId,
        //                                txn.IsEditable,
        //                                txn.IsGroupTxn,
        //                                Preparedby = emp.FullName,
        //                            }).ToList();
        //                //formatting data for sales voucher
        //                var txnList = (from temptxn in temp
        //                               select new
        //                               {
        //                                   VoucherNumber = temptxn.VoucherNumber,
        //                                   FiscalYear = temptxn.FiscalYearName,
        //                                   CostCenterName = temptxn.CostCenterName,
        //                                   TransactionDate = temptxn.TransactionDate,
        //                                   VoucherType = temptxn.VoucherName,
        //                                   Remarks = temptxn.Remarks,
        //                                   SectionId = temptxn.SectionId,
        //                                   IsGroupTxn = temptxn.IsGroupTxn,
        //                                   IsEditable = temptxn.IsEditable,
        //                                   Preparedby = temptxn.Preparedby,
        //                                   TransactionItems = (from txnItm in alltransactionitems
        //                                                       join ledger in ledgers on txnItm.LedgerId equals ledger.LedgerId
        //                                                       join txn in alltransactions on txnItm.TransactionId equals txn.TransactionId
        //                                                       join ledgp in ledgergroup on ledger.LedgerGroupId equals ledgp.LedgerGroupId
        //                                                       group new { ledger, ledgp, txnItm, txn } by new
        //                                                       {
        //                                                           ledgp.LedgerGroupName,
        //                                                           ledger.LedgerName,
        //                                                           ledger.Code,
        //                                                           txnItm.DrCr,
        //                                                           ledger.LedgerId,
        //                                                           txn.TransactionType,
        //                                                           txn.VoucherNumber
        //                                                       }
        //                                                       into x
        //                                                       select new
        //                                                       {
        //                                                           LedgerId = x.Key.LedgerId,
        //                                                           LedgerGroupName = x.Key.LedgerGroupName,
        //                                                           LedgerName = x.Key.LedgerName,
        //                                                           Code = x.Key.Code,
        //                                                           DrCr = x.Key.DrCr,
        //                                                           VoucherNumber = x.Key.VoucherNumber,
        //                                                           TransactionType = x.Select(a => a.txn.TransactionType).ToList(),
        //                                                           Name = x.Select(a => a.ledger.Name).FirstOrDefault(),
        //                                                           Amount = x.Select(a => a.txnItm.Amount).Sum(),
        //                                                           Remarks = x.Select(a => a.txn.Remarks),
        //                                                           Details = (from pat in patients
        //                                                                      where pat.LedgerId == x.Key.LedgerId && pat.DrCr == x.Key.DrCr
        //                                                                      group new { pat } by new
        //                                                                      {
        //                                                                          pat.ReferenceId,
        //                                                                          pat.DrCr
        //                                                                      } into x1
        //                                                                      select new
        //                                                                      {
        //                                                                          Name = x1.Select(a => a.pat.Name).FirstOrDefault(),
        //                                                                          Dr = x1.Where(a => a.pat.DrCr == true).Sum(a => a.pat.Amount),
        //                                                                          Cr = x1.Where(a => a.pat.DrCr == false).Sum(a => a.pat.Amount),
        //                                                                      }).ToList(),
        //                                                           SupplierDetails = (from txnitm in transactionitems
        //                                                                              join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
        //                                                                              join sup in supplier on txndetail.ReferenceId equals sup.SupplierId
        //                                                                              where txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Supplier"
        //                                                                              group new { txnitm, sup, txndetail } by new
        //                                                                              {
        //                                                                                  txndetail.ReferenceId,
        //                                                                                  txnitm.DrCr
        //                                                                              } into x1
        //                                                                              select new
        //                                                                              {
        //                                                                                  Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
        //                                                                                  Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
        //                                                                                  Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
        //                                                                              }).ToList(),
        //                                                           //UserDetails = (from u in userDetails
        //                                                           //               where u.LedgerId == x.Key.LedgerId && u.DrCr == x.Key.DrCr
        //                                                           //               group new { u } by new
        //                                                           //               {
        //                                                           //                   u.ReferenceId,
        //                                                           //                   u.DrCr
        //                                                           //               } into x1
        //                                                           //               select new
        //                                                           //               {
        //                                                           //                   Name = x1.Select(a => a.u.Name).FirstOrDefault(),
        //                                                           //                   Dr = x1.Where(a => a.u.DrCr == true).Sum(a => a.u.Amount),
        //                                                           //                   Cr = x1.Where(a => a.u.DrCr == false).Sum(a => a.u.Amount),
        //                                                           //               }).ToList(),
        //                                                       }).OrderByDescending(a => a.DrCr).ToList()
        //                               }).FirstOrDefault();
        //                //merging supplier details and patient details, user details
        //                txnList.TransactionItems.ForEach(data =>
        //                {
        //                    //foreach (var det in data.UserDetails)
        //                    //{
        //                    //    data.Details.Add(det);
        //                    //}
        //                    foreach (var det in data.SupplierDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                });
        //                //combining final result with credit not amount, payment amount, UserCashCollection and sales voucher transaction details
        //                var res = new
        //                {
        //                    Amounts = new
        //                    {
        //                        ReturnAmount = Amounts.Sum(a => a.ReturnAmount),
        //                        PaymentAmount = Amounts.Sum(a => a.PaymentAmount),
        //                        RetrunDiscount = Amounts.Sum(a => a.ReturnDiscount),
        //                        ReceivableAmount = Amounts.Sum(a => a.ReceivablesAmount),
        //                    },
        //                    txnList,
        //                    SectionId = txnids.SectionId,
        //                    UserCashCollection
        //                };
        //                responseData.Results = res;
        //            }
        //            else if (voucherNumber.Contains("SV") && txnids.SectionId == 3 && IsCustomVoucher == "true")
        //            {
        //                var txnlists = (from txn in accountingDBContext.Transactions
        //                                where txn.HospitalId == currentHospitalId
        //                                join txnitm in accountingDBContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
        //                                join ledger in accountingDBContext.Ledgers on txnitm.LedgerId equals ledger.LedgerId
        //                                join ledgrp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgrp.LedgerGroupId
        //                                where txnitm.HospitalId == currentHospitalId
        //                                && ledger.HospitalId == currentHospitalId
        //                                && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
        //                                // txn.TUId == txnids.TUId && 
        //                                select new
        //                                {
        //                                    txn.TransactionId,
        //                                    txnitm.TransactionItemId,
        //                                    txnitm.LedgerId,
        //                                    LedgerGroupName = (txn.TransactionType.Contains("Return") && ledgrp.LedgerGroupName == "Sales") ? ledgrp.LedgerGroupName + " (Return)" : ledgrp.LedgerGroupName,
        //                                    ledger.LedgerName,
        //                                    ledger.Code,
        //                                    txnitm.DrCr,
        //                                    Amount = txnitm.Amount,
        //                                    Remarks = txn.Remarks,
        //                                    txn.SectionId
        //                                });
        //                var txnDetails = (from txn in accountingDBContext.Transactions
        //                                  where txn.HospitalId == currentHospitalId
        //                                  join txnitm in accountingDBContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
        //                                  join txndet in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndet.TransactionItemId
        //                                  where txnitm.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
        //                                  // txn.TUId == txnids.TUId &&
        //                                  select new
        //                                  {
        //                                      txndet.ReferenceId,
        //                                      txndet.ReferenceType,
        //                                      txnitm.DrCr,
        //                                      txndet.Amount,
        //                                      txnitm.LedgerId,
        //                                      txn.TUId
        //                                  });
        //                var txnList = (from txn in accountingDBContext.Transactions
        //                               where txn.HospitalId == currentHospitalId
        //                               join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
        //                               join costCenter in accountingDBContext.CostCenters on txn.CostCenterId equals costCenter.CostCenterId
        //                               join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
        //                               join emp in accountingDBContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
        //                               where
        //                               //head.HospitalId == currentHospitalId &&
        //                               txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
        //                               select new
        //                               {
        //                                   // TransactionId = txn.TransactionId,
        //                                   VoucherNumber = txn.VoucherNumber,
        //                                   FiscalYear = fiscal.FiscalYearName,
        //                                   CostCenterName = costCenter.CostCenterName,
        //                                   TransactionDate = txn.TransactionDate,
        //                                   VoucherType = voucher.VoucherName,
        //                                   Remarks = txn.Remarks,
        //                                   SectionId = txn.SectionId,
        //                                   IsGroupTxn = txn.IsGroupTxn,
        //                                   IsEditable = txn.IsEditable,
        //                                   Preparedby = emp.FullName,
        //                                   TransactionItems = (from itms in txnlists
        //                                                       group new { itms } by new
        //                                                       {
        //                                                           itms.LedgerGroupName,
        //                                                           itms.LedgerName,
        //                                                           itms.DrCr,
        //                                                           itms.LedgerId,
        //                                                           itms.Code
        //                                                       }
        //                                                       into x
        //                                                       select new
        //                                                       {
        //                                                           LedgerId = x.Key.LedgerId,
        //                                                           LedgerGroupName = x.Key.LedgerGroupName,
        //                                                           LedgerName = x.Key.LedgerName,
        //                                                           Code = x.Key.Code,
        //                                                           DrCr = x.Key.DrCr,
        //                                                           Amount = x.Select(a => a.itms.Amount).Sum(),
        //                                                           Remarks = x.Select(a => a.itms.Remarks),
        //                                                           Details = (from txn in txnDetails
        //                                                                      join pat in accountingDBContext.PatientModel on txn.ReferenceId equals pat.PatientId
        //                                                                      where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Patient"
        //                                                                      group new { txn, pat } by new
        //                                                                      {
        //                                                                          txn.ReferenceId,
        //                                                                          txn.DrCr
        //                                                                      } into x1
        //                                                                      select new
        //                                                                      {
        //                                                                          Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
        //                                                                          Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                          Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                      }).ToList(),
        //                                                           SupplierDetails = (from txn in txnDetails
        //                                                                              join sup in accountingDBContext.PHRMSupplier on txn.ReferenceId equals sup.SupplierId
        //                                                                              where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Supplier"
        //                                                                              group new { txn, sup } by new
        //                                                                              {
        //                                                                                  txn.ReferenceId,
        //                                                                                  txn.DrCr
        //                                                                              } into x1
        //                                                                              select new
        //                                                                              {
        //                                                                                  Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
        //                                                                                  Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                                  Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                              }).ToList(),
        //                                                           UserDetails = (from txn in txnDetails
        //                                                                          join emp in accountingDBContext.Emmployees on txn.ReferenceId equals emp.EmployeeId
        //                                                                          where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "User" //&& txn.TUId == txnids.TUId
        //                                                                          group new { txn, emp } by new
        //                                                                          {
        //                                                                              txn.ReferenceId,
        //                                                                              txn.DrCr
        //                                                                          } into x1
        //                                                                          select new
        //                                                                          {
        //                                                                              Name = x1.Select(a => a.emp.FirstName + " " + (string.IsNullOrEmpty(a.emp.LastName) ? "" : a.emp.LastName)).FirstOrDefault(),
        //                                                                              Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                              Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                          }).ToList(),
        //                                                           VendorDetails = (from txn in txnDetails
        //                                                                            join ven in accountingDBContext.InvVendors on txn.ReferenceId equals ven.VendorId
        //                                                                            where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Vendor"
        //                                                                            group new { txn, ven } by new
        //                                                                            {
        //                                                                                txn.ReferenceId,
        //                                                                                txn.DrCr
        //                                                                            } into x1
        //                                                                            select new
        //                                                                            {
        //                                                                                Name = x1.Select(a => a.ven.VendorName).FirstOrDefault(),
        //                                                                                Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                                Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                            }).ToList(),
        //                                                       }).OrderByDescending(a => a.DrCr).ToList()
        //                               }).FirstOrDefault();
        //                txnList.TransactionItems.ForEach(data =>
        //                {
        //                    foreach (var det in data.UserDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                    foreach (var det in data.SupplierDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                    foreach (var det in data.VendorDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                });
        //                var res = new
        //                {
        //                    SectionId = txnids.SectionId,
        //                    txnList
        //                };
        //                responseData.Results = res;

        //            }
        //            else if (txnids.SectionId == 4) // manual voucher entry
        //            {
        //                //var ledgGrp = (from ledg in accountingDBContext.LedgerGroups.AsEnumerable()
        //                //               where ledg.HospitalId == currentHospitalId
        //                //               select ledg).AsEnumerable().ToList();

        //                var txnList = (from txn in accountingDBContext.Transactions
        //                               where txn.HospitalId == currentHospitalId
        //                               join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
        //                               join costCenter in accountingDBContext.CostCenters on txn.CostCenterId equals costCenter.CostCenterId
        //                               join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
        //                               join emp in accountingDBContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
        //                               where //head.HospitalId == currentHospitalId
        //                               fiscal.HospitalId == currentHospitalId
        //                               && txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
        //                               select new
        //                               {
        //                                   VoucherNumber = txn.VoucherNumber,
        //                                   FiscalYear = fiscal.FiscalYearName,
        //                                   CostCenterName = costCenter.CostCenterName,
        //                                   TransactionDate = txn.TransactionDate,
        //                                   VoucherType = voucher.VoucherName,
        //                                   Remarks = txn.Remarks,
        //                                   SectionId = txn.SectionId,
        //                                   IsGroupTxn = txn.IsGroupTxn,
        //                                   IsEditable = txn.IsEditable,
        //                                   VoucherId = voucher.VoucherId,
        //                                   CostCenterId = costCenter.CostCenterId,
        //                                   IsAllowReverseVoucher = txn.IsAllowReverseVoucher,
        //                                   TransactionId = txn.TransactionId,
        //                                   PayeeName = txn.PayeeName,
        //                                   ChequeNumber = txn.ChequeNumber,
        //                                   HospitalId = txn.HospitalId,
        //                                   Preparedby = emp.FullName,
        //                                   TransactionItems = (from txnItm in accountingDBContext.TransactionItems
        //                                                       where txnItm.HospitalId == currentHospitalId
        //                                                       join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
        //                                                       join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
        //                                                       where
        //                                                       ledger.HospitalId == currentHospitalId && ledgp.HospitalId == currentHospitalId &&
        //                                                       txn.VoucherNumber == voucherNumber && txnItm.TransactionId == txn.TransactionId
        //                                                       select new
        //                                                       {

        //                                                           LedgerId = ledger.LedgerId,
        //                                                           LedgerGroupName = ledgp.LedgerGroupName,
        //                                                           LedgerName = ledger.LedgerName,
        //                                                           Code = ledger.Code,
        //                                                           DrCr = txnItm.DrCr,
        //                                                           Amount = txnItm.Amount,
        //                                                           Description = txnItm.Description,
        //                                                           SubLedgers = (from subLedgerTxn in accountingDBContext.SubLedgerRecord
        //                                                                         join subLedger in accountingDBContext.SubLedger on subLedgerTxn.SubLedgerId equals subLedger.SubLedgerId
        //                                                                         where subLedgerTxn.TransactionItemId == txnItm.TransactionItemId
        //                                                                         select new
        //                                                                         {
        //                                                                            LedgerId = subLedgerTxn.LedgerId,
        //                                                                            SubLedgerName = subLedger.SubLedgerName,
        //                                                                            SubLedgerId = subLedger.SubLedgerId,
        //                                                                            DrAmount = subLedgerTxn.DrAmount,
        //                                                                            CrAmount = subLedgerTxn.CrAmount,
        //                                                                            VoucherNo = subLedgerTxn.VoucherNo,
        //                                                                            VoucherType = subLedgerTxn.VoucherType,
        //                                                                            Description = subLedgerTxn.Description
        //                                                                         }).ToList()
        //                                                       }).ToList()
        //                               }).FirstOrDefault();
        //                var res = new
        //                {
        //                    SectionId = txnids.SectionId,
        //                    txnList
        //                };
        //                responseData.Results = res;
        //            }
        //            else
        //            {

        //                var txnDetails = (from txn in accountingDBContext.Transactions
        //                                  where txn.HospitalId == HospId
        //                                  join txnitm in accountingDBContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
        //                                  join txndet in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndet.TransactionItemId
        //                                  where
        //                                  txnitm.HospitalId == HospId &&
        //                                  txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
        //                                  select new
        //                                  {
        //                                      txndet.ReferenceId,
        //                                      txndet.ReferenceType,
        //                                      txnitm.DrCr,
        //                                      txndet.Amount,
        //                                      txnitm.LedgerId,
        //                                      txn.TUId,
        //                                      txn.SectionId

        //                                  });
        //                var txnList = (from txn in accountingDBContext.Transactions
        //                               where txn.HospitalId == HospId
        //                               join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
        //                               join costCenter in accountingDBContext.CostCenters on txn.CostCenterId equals costCenter.CostCenterId
        //                               join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
        //                               join emp in accountingDBContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
        //                               where
        //                               //head.HospitalId == HospId &&
        //                               fiscal.HospitalId == HospId &&
        //                               txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
        //                               select new
        //                               {
        //                                   // TransactionId = txn.TransactionId,
        //                                   VoucherNumber = txn.VoucherNumber,
        //                                   FiscalYear = fiscal.FiscalYearName,
        //                                   CostCenterName = costCenter.CostCenterName,
        //                                   TransactionDate = txn.TransactionDate,
        //                                   VoucherType = voucher.VoucherName,
        //                                   Remarks = txn.Remarks,
        //                                   Sectionid = txn.SectionId,
        //                                   IsGroupTxn = txn.IsGroupTxn,
        //                                   IsEditable = txn.IsEditable,
        //                                   VoucherId = voucher.VoucherId,
        //                                   CostCenterId = costCenter.CostCenterId,
        //                                   IsAllowReverseVoucher = txn.IsAllowReverseVoucher,
        //                                   TransactionId = txn.TransactionId,
        //                                   HospitalId = txn.HospitalId,
        //                                   Preparedby = emp.FullName,
        //                                   PayeeName = txn.PayeeName,
        //                                   ChequeNumber = txn.ChequeNumber,
        //                                   TransactionItems = (from txnItm in accountingDBContext.TransactionItems
        //                                                       where txnItm.HospitalId == HospId
        //                                                       join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
        //                                                       join txnp in accountingDBContext.Transactions on txnItm.TransactionId equals txnp.TransactionId
        //                                                       join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
        //                                                       where ledger.HospitalId == HospId
        //                                                       && ledgp.HospitalId == HospId
        //                                                       && txnp.VoucherNumber == voucherNumber
        //                                                       && txnp.FiscalyearId == FiscalYearId
        //                                                       group new { ledger, ledgp, txnItm, txnp } by new
        //                                                       {
        //                                                           ledgp.LedgerGroupName,
        //                                                           ledger.LedgerName,
        //                                                           txnItm.DrCr,
        //                                                           ledger.LedgerId,
        //                                                           ledger.Code
        //                                                       }
        //                                                       into x
        //                                                       select new
        //                                                       {
        //                                                           LedgerId = x.Key.LedgerId,
        //                                                           LedgerGroupName = x.Key.LedgerGroupName,
        //                                                           LedgerName = x.Key.LedgerName,
        //                                                           Code = x.Key.Code,
        //                                                           DrCr = x.Key.DrCr,
        //                                                           Amount = x.Select(a => a.txnItm.Amount).Sum(),
        //                                                           Remarks = x.Select(a => a.txnItm.Description),
        //                                                           Details = (from txn in txnDetails
        //                                                                      join pat in accountingDBContext.PatientModel on txn.ReferenceId equals pat.PatientId
        //                                                                      where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Patient"
        //                                                                      group new { txn, pat } by new
        //                                                                      {
        //                                                                          txn.ReferenceId,
        //                                                                          txn.DrCr
        //                                                                      } into x1
        //                                                                      select new
        //                                                                      {
        //                                                                          Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
        //                                                                          Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                          Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                      }).ToList(),
        //                                                           SupplierDetails = (from txn in txnDetails
        //                                                                              join sup in accountingDBContext.PHRMSupplier on txn.ReferenceId equals sup.SupplierId
        //                                                                              where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Supplier"
        //                                                                              group new { txn, sup } by new
        //                                                                              {
        //                                                                                  txn.ReferenceId,
        //                                                                                  txn.DrCr
        //                                                                              } into x1
        //                                                                              select new
        //                                                                              {
        //                                                                                  Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
        //                                                                                  Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                                  Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                              }).ToList(),
        //                                                           UserDetails = (from txn in txnDetails
        //                                                                          join emp in accountingDBContext.Emmployees on txn.ReferenceId equals emp.EmployeeId
        //                                                                          where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "User" //&& txn.TUId == txnids.TUId
        //                                                                          group new { txn, emp } by new
        //                                                                          {
        //                                                                              txn.ReferenceId,
        //                                                                              txn.DrCr
        //                                                                          } into x1
        //                                                                          select new
        //                                                                          {
        //                                                                              Name = x1.Select(a => a.emp.FirstName + " " + (string.IsNullOrEmpty(a.emp.LastName) ? "" : a.emp.LastName)).FirstOrDefault(),
        //                                                                              Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                              Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                          }).ToList(),
        //                                                           VendorDetails = (from txn in txnDetails
        //                                                                            join ven in accountingDBContext.InvVendors on txn.ReferenceId equals ven.VendorId
        //                                                                            where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Vendor"
        //                                                                            group new { txn, ven } by new
        //                                                                            {
        //                                                                                txn.ReferenceId,
        //                                                                                txn.DrCr
        //                                                                            } into x1
        //                                                                            select new
        //                                                                            {
        //                                                                                Name = x1.Select(a => a.ven.VendorName).FirstOrDefault(),
        //                                                                                Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
        //                                                                                Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
        //                                                                            }).ToList(),
        //                                                       }).OrderByDescending(a => a.DrCr).ToList()
        //                               }).FirstOrDefault();
        //                txnList.TransactionItems.ForEach(data =>
        //                {
        //                    foreach (var det in data.UserDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                    foreach (var det in data.SupplierDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                    foreach (var det in data.VendorDetails)
        //                    {
        //                        data.Details.Add(det);
        //                    }
        //                });
        //                var res = new
        //                {
        //                    SectionId = txnids.SectionId,
        //                    txnList
        //                };
        //                responseData.Results = res;
        //            }
        //        }
        //        else
        //        {
        //            responseData.ErrorMessage = "Invalid voucher number";
        //        }
        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }

        //}
        //#endregion
        //#region Check Reference Transaction Id
        //else if (reqType == "check-reference-txnId")
        //{
        //    var txn = accountingDBContext.Transactions.
        //        Where(a => a.HospitalId == currentHospitalId && a.VoucherNumber == voucherNumber && a.VoucherId == voucherId && a.IsActive == true).FirstOrDefault();
        //    if (txn != null)
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = txn;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Transaction Not Found";
        //    }
        //}
        //#endregion
        //#region Inventory GRI Items For Accounting
        //else if (reqType == "inventory-to-accounting")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
        //    List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(1, SelectedDate, FiscalYearId, currentHospitalId);
        //    var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
        //    if (unavailableLedger.Count > 0)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.Results = unavailableLedger;
        //    }
        //    else
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = result;
        //    }
        //    DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
        //}
        //#endregion
        //#region Ledger Mapping
        //else if (reqType == "ledger-mapping")
        //{
        //    var res = new
        //    {
        //        supplier = (from m in accountingDBContext.LedgerMappings
        //                    where m.HospitalId == currentHospitalId && m.LedgerType == "pharmacysupplier"
        //                    select m).ToList(),
        //        vendor = (from m in accountingDBContext.LedgerMappings
        //                  where m.HospitalId == currentHospitalId && m.LedgerType == "inventoryvendor"
        //                  select m).ToList(),
        //        consultant = (from m in accountingDBContext.LedgerMappings
        //                      where m.HospitalId == currentHospitalId && m.LedgerType == "consultant"
        //                      select m).ToList(),
        //        creditorganization = (from m in accountingDBContext.LedgerMappings
        //                              where m.HospitalId == currentHospitalId && m.LedgerType == "creditorganization"
        //                              select m).ToList(),
        //        subcategory = (from m in accountingDBContext.LedgerMappings
        //                       where m.HospitalId == currentHospitalId && m.LedgerType == "inventorysubcategory"
        //                       select m).ToList(),
        //    };
        //    responseData.Status = "OK";
        //    responseData.Results = res;
        //}
        //#endregion

        //#region consultant ledger
        //else if (reqType == "get-employee")
        //{
        //    var ledMapLsit = (from lm in accountingDBContext.LedgerMappings
        //                      where lm.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          LedgerId = (lm.LedgerType == "consultant") ? lm.LedgerId : 0,
        //                          LedgerMappingId = lm.LedgerMappingId,
        //                          LedgerType = (lm.LedgerType == "consultant") ? lm.LedgerType : "",
        //                          ReferenceId = (lm.LedgerType == "consultant") ? lm.ReferenceId : 0

        //                      }).AsQueryable();
        //    var NewEmpledgerList = (from empl in accountingDBContext.Emmployees
        //                            join ledMp in ledMapLsit on empl.EmployeeId equals ledMp.ReferenceId into lm
        //                            from ledM in lm.DefaultIfEmpty()
        //                            join ledger in accountingDBContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            join department in accountingDBContext.Departments on empl.DepartmentId equals department.DepartmentId into dept
        //                            from dep in dept.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = ledM.LedgerType,
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                EmployeeName = empl.FullName,
        //                                EmployeeId = empl.EmployeeId,
        //                                DepartmentName = dep.DepartmentName,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false
        //                            }).OrderByDescending(l => l.LedgerId).ToList();
        //    responseData.Results = NewEmpledgerList;
        //    responseData.Status = "OK";
        //}
        //#endregion
        //#region pharmacy supplier  ledger
        //else if (reqType == "phrm-supplier")
        //{
        //    var ledMapLsit = (from lm in accountingDBContext.LedgerMappings
        //                      where lm.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          LedgerId = (lm.LedgerType == "pharmacysupplier") ? lm.LedgerId : 0,
        //                          LedgerMappingId = lm.LedgerMappingId,
        //                          LedgerType = (lm.LedgerType == "pharmacysupplier") ? lm.LedgerType : "",
        //                          ReferenceId = (lm.LedgerType == "pharmacysupplier") ? lm.ReferenceId : 0

        //                      }).AsQueryable();
        //    var NewEmpledgerList = (from phrmsup in accountingDBContext.PHRMSupplier
        //                            join ledMp in ledMapLsit on phrmsup.SupplierId equals ledMp.ReferenceId into lm
        //                            from ledM in lm.DefaultIfEmpty()
        //                            join ledger in accountingDBContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = ledM.LedgerType,
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                SupplierName = phrmsup.SupplierName,
        //                                SupplierId = phrmsup.SupplierId,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false,
        //                                SectionId = led.SectionId
        //                            }).OrderByDescending(l => l.LedgerId).ToList();
        //    responseData.Results = NewEmpledgerList;
        //    responseData.Status = "OK";
        //}
        //#endregion

        //#region inventory vendor ledger
        //else if (reqType == "get-invVendor-list")
        //{
        //    var ledMapLsit = (from lm in accountingDBContext.LedgerMappings
        //                      where lm.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          LedgerId = (lm.LedgerType == "inventoryvendor") ? lm.LedgerId : 0,
        //                          LedgerMappingId = lm.LedgerMappingId,
        //                          LedgerType = (lm.LedgerType == "inventoryvendor") ? lm.LedgerType : "",
        //                          ReferenceId = (lm.LedgerType == "inventoryvendor") ? lm.ReferenceId : 0

        //                      }).AsQueryable();
        //    var NewEmpledgerList = (from invVendor in accountingDBContext.InvVendors
        //                            join ledMp in ledMapLsit on invVendor.VendorId equals ledMp.ReferenceId into lm
        //                            from ledM in lm.DefaultIfEmpty()
        //                            join ledger in accountingDBContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = ledM.LedgerType,
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                VendorName = invVendor.VendorName,
        //                                VendorId = invVendor.VendorId,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false,
        //                                SectionId=led.SectionId
        //                            }).OrderByDescending(l => l.LedgerId).ToList();
        //    responseData.Results = NewEmpledgerList;
        //    responseData.Status = "OK";
        //}
        //#endregion

        //#region inventory Subcategory ledger
        //else if (reqType == "get-invSubcategory-list")
        //{
        //    var ledMapLsit = (from lm in accountingDBContext.LedgerMappings
        //                      where lm.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          LedgerId = (lm.LedgerType == "inventorysubcategory") ? lm.LedgerId : 0,
        //                          LedgerMappingId = lm.LedgerMappingId,
        //                          LedgerType = (lm.LedgerType == "inventorysubcategory") ? lm.LedgerType : "",
        //                          ReferenceId = (lm.LedgerType == "inventorysubcategory") ? lm.ReferenceId : 0

        //                      }).AsQueryable();
        //    var NewEmpledgerList = (from invSubcategory in accountingDBContext.ItemSubCategoryMaster
        //                            join ledMp in ledMapLsit on invSubcategory.SubCategoryId equals ledMp.ReferenceId into lm
        //                            from ledM in lm.DefaultIfEmpty()
        //                            join ledger in accountingDBContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = ledM.LedgerType,
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                SubCategoryName = invSubcategory.SubCategoryName,
        //                                SubCategoryId = invSubcategory.SubCategoryId,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false
        //                            }).OrderByDescending(l => l.LedgerId).ToList();
        //    responseData.Results = NewEmpledgerList;
        //    responseData.Status = "OK";
        //}
        //#endregion
        //#region Credit Organizations ledger
        //else if (reqType == "get-creditOrg-list")
        //{
        //    var ledMapLsit = (from lm in accountingDBContext.LedgerMappings
        //                      where lm.HospitalId == currentHospitalId
        //                      select new
        //                      {
        //                          LedgerId = (lm.LedgerType == "creditorganization") ? lm.LedgerId : 0,
        //                          LedgerMappingId = lm.LedgerMappingId,
        //                          LedgerType = (lm.LedgerType == "creditorganization") ? lm.LedgerType : "",
        //                          ReferenceId = (lm.LedgerType == "creditorganization") ? lm.ReferenceId : 0

        //                      }).AsQueryable();
        //    var NewEmpledgerList = (from crOrg in accountingDBContext.BillCreditOrganizations
        //                            join ledMp in ledMapLsit on crOrg.OrganizationId equals ledMp.ReferenceId into lm
        //                            from ledM in lm.DefaultIfEmpty()
        //                            join ledger in accountingDBContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = ledM.LedgerType,
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                OrganizationName = crOrg.OrganizationName,
        //                                OrganizationId = crOrg.OrganizationId,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false
        //                            }).OrderByDescending(l => l.LedgerId).ToList();
        //    responseData.Results = NewEmpledgerList;
        //    responseData.Status = "OK";
        //}
        //#endregion

        //#region billing items ledger
        //else if (reqType == "get-billings-ledgers")
        //{
        //    var ServiceDepartment = accountingDBContext.ServiceDepartment.AsQueryable();
        //    var BillItemPrice = accountingDBContext.BillItemPrice.AsQueryable();
        //    var AccountBillLedgerMapping = accountingDBContext.AccountBillLedgerMapping.AsQueryable();
        //    var Ledgers = accountingDBContext.Ledgers.AsQueryable();

        //    var billingItemsList = (from sv in ServiceDepartment
        //                            join item in BillItemPrice on sv.ServiceDepartmentId equals item.ServiceDepartmentId into items  from itm in items.DefaultIfEmpty()
        //                            join ledMp in AccountBillLedgerMapping on new { p1 = sv.ServiceDepartmentId, p2 = (int?)itm.ItemId } equals new { p1 = ledMp.ServiceDepartmentId, p2 = (int?)ledMp.ItemId }
        //                             into lm  from ledM in lm.DefaultIfEmpty()
        //                            join ledger in Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
        //                            from led in ld.DefaultIfEmpty()
        //                            where itm.ItemId>0
        //                            select new
        //                            {
        //                                LedgerId = (led.LedgerId > 0) ? led.LedgerId : 0,
        //                                LedgerGroupId = (int?)led.LedgerGroupId,
        //                                LedgerName = led.LedgerName,
        //                                LedgerReferenceId = led.LedgerReferenceId,
        //                                Description = led.Description,
        //                                IsActive = (bool?)led.IsActive,
        //                                IsCostCenterApplicable = led.IsCostCenterApplicable,
        //                                OpeningBalance = led.OpeningBalance,
        //                                DrCr = led.DrCr,
        //                                Name = led.Name,
        //                                LedgerType = "billingincomeledger",
        //                                Code = led.Code,
        //                                PANNo = led.PANNo,
        //                                Address = led.Address,
        //                                MobileNo = led.MobileNo,
        //                                CreditPeriod = led.CreditPeriod,
        //                                TDSPercent = led.TDSPercent,
        //                                LandlineNo = led.LandlineNo,
        //                                ServiceDepartmentId = sv.ServiceDepartmentId,
        //                                ServiceDepartmentName = sv.ServiceDepartmentName,
        //                                IsSelected = false,
        //                                IsMapped = (led.LedgerId > 0) ? true : false,
        //                                ItemId = (itm.ItemId > 0) ? (int?)itm.ItemId : 0,
        //                                itm.ItemName
        //                            }).OrderByDescending(l=> l.LedgerId).AsQueryable();
        //    responseData.Results = billingItemsList;
        //    responseData.Status = "OK";
        //}
        //#endregion
        //#region Fiscal Year List
        //else if (reqType == "fiscalYearList")
        // Dev : 30 Jan 2023 : This reqType is no longer in use....
        //{
        //    var fiscalYears = accountingDBContext.FiscalYears.Where(f => f.HospitalId == currentHospitalId && f.IsActive == true).ToList();
        //    responseData.Status = "OK";
        //    responseData.Results = fiscalYears;
        //}
        //#endregion

        //#region Billing data for Accounting
        //else if (reqType == "billing-to-accounting")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
        //   List<TransactionModel> res = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(2, SelectedDate, FiscalYearId, currentHospitalId);

        //    var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
        //    if (unavailableLedger.Count > 0)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.Results = unavailableLedger;
        //    }
        //    else
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = res;
        //    }
        //    DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
        //}
        //#endregion
        //#region Pharmacy data for Accounting
        //else if (reqType == "pharmacy-to-accounting")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
        //    List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(3, SelectedDate, FiscalYearId, currentHospitalId);

        //    var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
        //    if (unavailableLedger.Count > 0)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.Results = unavailableLedger;
        //    }
        //    else
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = result;
        //    }
        //    DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
        //}
        //#endregion
        //#region incentive data for Accounting
        //else if (reqType == "incentive-to-accounting")
        //{
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
        //    List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(5, SelectedDate, FiscalYearId, currentHospitalId);
        //    var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
        //    if (unavailableLedger.Count > 0)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.Results = unavailableLedger;
        //    }
        //    else
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = result;
        //    }
        //    DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
        //}
        //#endregion
        //#region get Voucher detail for edit manual Vcoucher
        //else if (reqType == "getVoucherforedit")
        //{
        //    //getting uniqueid and sectionid of transaction 

        //    if (voucherNumber != null && FiscalYearId != null)
        //    {

        //        var transactionData = (from txn in accountingDBContext.Transactions
        //                               where txn.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
        //                               select new
        //                               {
        //                                   TransactionId = txn.TransactionId
        //                                    ,
        //                                   VoucherId = txn.VoucherId
        //                                    ,
        //                                   FiscalYearId = txn.FiscalyearId
        //                                    ,
        //                                   TransactionDate = txn.TransactionDate
        //                                    ,
        //                                   CreatedBy = txn.CreatedBy
        //                                    ,
        //                                   CreatedOn = txn.CreatedOn
        //                                    ,
        //                                   IsActive = txn.IsActive
        //                                    ,
        //                                   IsBackDateEntry = txn.IsBackDateEntry
        //                                    ,
        //                                   Remarks = txn.Remarks
        //                                    ,
        //                                   SectionId = txn.SectionId
        //                                    ,
        //                                   VoucherNumber = txn.VoucherNumber
        //                                    ,
        //                                   CostCenterId = txn.CostCenterId
        //                                   ,
        //                                   TotalAmount = 0
        //                                    ,
        //                                   TransactionItems = (from txnItem in accountingDBContext.TransactionItems
        //                                                       where txnItem.TransactionId == txn.TransactionId
        //                                                       select new  { 
        //                                                            CreatedOn =txnItem.CreatedOn,
        //                                                            Amount = txnItem.Amount,
        //                                                            LedgerId = txnItem.LedgerId,
        //                                                            IsActive = txnItem.IsActive,
        //                                                            DrCr = txnItem.DrCr,
        //                                                            Description = txnItem.Description,
        //                                                            HospitalId = txnItem.HospitalId,
        //                                                            TransactionItemId = txnItem.TransactionItemId,
        //                                                            SubLedgers = accountingDBContext.SubLedgerRecord.Where(sub => sub.TransactionItemId == txnItem.TransactionItemId).ToList(),
        //                                                            CreatedBy = txnItem.CreatedBy,
        //                                                            TransactionId = txnItem.TransactionId
        //                                                       }).ToList()

        //                                    ,
        //                                   TransactionType = txn.TransactionType
        //                                    ,
        //                                   TUId = txn.TUId
        //                                    ,
        //                                   DayVoucherNumber = txn.DayVoucherNumber
        //                                    ,
        //                                   IsCustomVoucher = txn.IsCustomVoucher
        //                               }
        //                               ).FirstOrDefault();
        //        responseData.Status = (transactionData != null) ? "OK" : "Failed";
        //        responseData.Results = transactionData;
        //        responseData.ErrorMessage = "No maching Voucher Number for selected fiscal year";
        //    }

        //    else
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "No maching Voucher Number";
        //    }
        //}
        //#endregion
        //#region Get provisional  Voucher Number for creating new manual voucher 
        //else if (reqType == "gettempVoucherNumber")
        //{
        //    if (voucherId != null && sectionId != null && transactiondate != null)
        //    {
        //        string TempVoucherNumber;
        //        var fYearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, transactiondate, currentHospitalId);
        //        responseData.Results = GetVoucherNumber(accountingDBContext, voucherId, sectionId.Value, currentHospitalId, fYearId);
        //        responseData.Status = "OK";
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "No maching Voucher Number";

        //    }

        //}
        //#endregion

        //else if (reqType == "code-details")
        //{
        //    var result = ((List<AccountingCodeDetailsModel>)DanpheCache.GetMasterData(MasterDataEnum.AccountingCodes))
        //                  .Where(c => c.HospitalId == currentHospitalId).ToList<object>();
        //    responseData = AccountingBL.CheckResponseObject(result,"Code-Details");
        //}
        //#region Get Provisional Ledger Code
        //else if (reqType == "provisional-ledger-code")
        //{
        //    var result = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
        //    if (result != null)
        //    {
        //        responseData.Status = "OK";
        //        responseData.Results = result;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "provisional ledger code generation has problem , please try again !";
        //    }

        //}
        //#endregion
        //#region Get Provisional Ledger information when we going to create ledger from module i.e. inventory , pharmacy, incentive
        //else if (reqType == "get-provisional-ledger")
        //{
        //    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //    //for this resolution we have temp solution
        //    //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //    //if user have only one hsopital permission then automatically activate this hospital
        //    var HospId = 0;
        //    if (ledgerType == "inventorysubcategory" || ledgerType == "consultant")
        //    {
        //        HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);
        //    }
        //    else
        //    {
        //        HospId = currentHospitalId;
        //    }

        //    EmployeeModel emp = new EmployeeModel();
        //    //this api call will get ledgertype and reference id and will find ledger details , if ledger already there then return ledger details
        //    //if ledger is not created and not mapped into ledgerMapping table then api will assign values to ledger model and return to client for creation new ledger 
        //    string ledgerGroupUniqueName = "";
        //    string COA = "";
        //    var IsExist = true;
        //    var paraValue = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "LedgerGroupMapping").FirstOrDefault().ParameterValue;
        //    if (paraValue != "")
        //    {
        //        List<dynamic> json = JsonConvert.DeserializeObject<List<dynamic>>(paraValue);

        //        //get consultant ledger group unique name
        //        if (ledgerType == "consultant")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "consultant");
        //            ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId &&
        //                                       ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "consultant"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;
        //            emp = (from e in accountingDBContext.Emmployees where e.EmployeeId == referenceId select e).FirstOrDefault();

        //        }
        //        else if (ledgerType == "inventorysubcategory")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "inventorysubcategory");
        //            COA = (paramData != null) ? paramData.COA : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "inventorysubcategory"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }
        //        else if (ledgerType == "inventoryvendor")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "inventoryvendor");
        //            //COA = (paramData != null) ? paramData.COA : "";
        //            ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "inventoryvendor"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }
        //        else if (ledgerType == "creditorganization")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "creditorganization");
        //            COA = (paramData != null) ? paramData.COA : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "creditorganization"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }
        //        else if (ledgerType == "pharmacysupplier")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "pharmacysupplier");
        //           // COA = (paramData != null) ? paramData.COA : "";
        //            ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "pharmacysupplier"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }
        //        else if (ledgerType == "INVOtherCharge")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "INVOtherCharge");
        //            ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "INVOtherCharge"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }

        //        else if (ledgerType == "PHRMCreditOrganization")
        //        {
        //            var paramData = json.Find(p => p.LedgerType == "PHRMCreditOrganization");
        //            ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
        //            var checkExistingLedger = (from ledMap in accountingDBContext.LedgerMappings
        //                                       where
        //                                       ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
        //                                        && ledMap.LedgerType == "PHRMCreditOrganization"
        //                                       select ledMap).FirstOrDefault();
        //            IsExist = (checkExistingLedger != null) ? true : false;

        //        }
        //        if (IsExist == true)
        //        {
        //            responseData.Status = "Failed";
        //            responseData.ErrorMessage = "ledger is existing, duplicate ledger not allowed !";
        //        }
        //    }
        //    if ((ledgerGroupUniqueName != "" || COA != "") && IsExist == false)
        //    {
        //        var ledCode = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, HospId);

        //        var result = (from ledGrp in accountingDBContext.LedgerGroups
        //                      join led in accountingDBContext.Ledgers on ledGrp.LedgerGroupId equals led.LedgerGroupId into ledger
        //                      from LedgerModel in ledger.DefaultIfEmpty()
        //                      where ledGrp.HospitalId == HospId &&
        //                      ((ledgerGroupUniqueName != "") ? (ledGrp.Name == ledgerGroupUniqueName) : (ledGrp.COA.ToLower() == COA.ToLower())) //ledGrp.Name.Contains(ledgerGroupUniqueName) || ledGrp.COA.ToLower().Contains(COA.ToLower())
        //                      select new
        //                      {
        //                          ledGrp.PrimaryGroup,
        //                          ledGrp.COA,
        //                          ledGrp.LedgerGroupId,
        //                          ledGrp.LedgerGroupName,
        //                          Code = ledCode,
        //                          LedgerName = (ledgerType == "consultant") ? emp.FullName : null
        //                      }).FirstOrDefault();
        //        if (result != null)
        //        {

        //            responseData.Status = "OK";
        //            responseData.Results = result;
        //        }
        //        else
        //        {
        //            responseData.Status = "Failed";
        //            responseData.ErrorMessage = "Please create the ledger group and update name in core parameter";
        //        }
        //    }
        //}
        //#endregion

        //else if (reqType == "getAllActiveTenants")
        //{
        //    var result = accountingDBContext.Hospitals.Where(h => h.IsActive == true).ToList();
        //    responseData.Status = "OK";
        //    responseData.Results = result;
        //}
        //else if (reqType == "get-fsyearactivity")
        //{
        //    var result = (from fslog in accountingDBContext.FiscalYearLog
        //                  join fs in accountingDBContext.FiscalYears on fslog.FiscalYearId equals fs.FiscalYearId
        //                  join emp in accountingDBContext.Emmployees on fslog.CreatedBy equals emp.EmployeeId
        //                  select new
        //                  {
        //                      fs.FiscalYearName,
        //                      fslog.CreatedOn,
        //                      fslog.LogType,
        //                      emp.FirstName,
        //                      fslog.LogDetails
        //                  }).ToList();
        //    responseData.Status = "OK";
        //    responseData.Results = result;
        //}
        //this api used for incentive , where get ledger and employee mapping details using sp
        //else if (reqType == "acc-get-employee-ledger-list")
        //{
        //    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //    //for this resolution we have temp solution
        //    //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //    //if user have only one hsopital permission then automatically activate this hospital
        //    var HospId = AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);

        //    List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@HospitalId", HospId) };
        //    //sud: 20Jun'20-- new param is added in below sp.. hence changed..
        //    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetAllEmployee_LedgerList", paramList, accountingDBContext);
        //    responseData.Results = dt;
        //    responseData.Status = "OK";

        //}
        //else if (reqType == "acc-get-txn-dates")
        //{
        //    List<SqlParameter> paramList = new List<SqlParameter>() {
        //            new SqlParameter("@FromDate",FromDate),
        //            new SqlParameter("@ToDate", ToDate),
        //            new SqlParameter("@HospitalId", currentHospitalId),
        //            new SqlParameter("@SectionId", sectionId)                    };
        //    DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetTransactionDates", paramList, accountingDBContext);
        //    responseData.Results = dt;
        //    responseData.Status = "OK";

        //}
        //#region bank-reconciliation-category
        //if (reqType == "get-bank-reconciliation-category")
        //{
        //    var BankReconciliationCategory = accountingDBContext.BankReconciliationCategory.Where(c => c.IsActive == true).ToList();

        //    responseData.Status = "OK";
        //    responseData.Results = BankReconciliationCategory;
        //}
        //#endregion
        //#region good receipt list
        //if (reqType == "get-grlist")
        //{
        //    if (sectionId == 1)
        //    {
        //        var grInvList = (from gr in accountingDBContext.GoodsReceiptModels
        //                         join v in accountingDBContext.InvVendors on gr.VendorId equals v.VendorId
        //                         join pm in accountingDBContext.AccountingPaymentModels on gr.GoodsReceiptID equals pm.GoodReceiptID into p
        //                         from pay in p.DefaultIfEmpty().OrderByDescending(a => a.PaymentId).Take(1)
        //                         where gr.VendorId == voucherId && gr.PaymentMode.ToLower().ToString() == "credit" && gr.IsCancel == false && gr.IsPaymentDoneFromAcc == false
        //                         select new
        //                         {
        //                             GRId = gr.GoodsReceiptID,
        //                             GRDate = gr.GoodsReceiptDate,
        //                             GRNo = gr.GoodsReceiptNo,
        //                             TotalAmount = gr.TotalAmount,
        //                             VendorId = gr.VendorId,
        //                             VendorName=v.VendorName,
        //                             PaidAmount = pay == null ? 0 : pay.PaidAmount,
        //                             RemainingAmount = pay == null ? gr.TotalAmount : pay.RemainingAmount,
        //                             DueAmount = pay == null ? gr.TotalAmount : gr.TotalAmount - pay.PaidAmount
        //                         }).ToList();
        //        if (transactiondate!=DateTime.MinValue)
        //        {
        //            grInvList = grInvList.Where(a => a.GRDate.Value.Date==transactiondate.Date).ToList();

        //         }
        //        if(!string.IsNullOrEmpty(voucherNumber))
        //        {
        //            grInvList = grInvList.Where(a =>a.GRNo == short.Parse(voucherNumber)).ToList();
        //        }

        //        responseData.Status = "OK";
        //        responseData.Results = grInvList;
        //    }
        //    else
        //    {
        //        var grPhrmList = (from gr in accountingDBContext.PHRMGoodsReceipt
        //                      join s in accountingDBContext.PHRMSupplier on gr.SupplierId equals s.SupplierId
        //                      join pm in accountingDBContext.AccountingPaymentModels on gr.GoodReceiptId equals pm.GoodReceiptID into p
        //                      from pay in p.DefaultIfEmpty().OrderByDescending(a => a.PaymentId).Take(1)
        //                      where gr.SupplierId == voucherId && gr.TransactionType.ToLower().ToString() == "credit" && gr.IsCancel == false && gr.IsPaymentDoneFromAcc == false
        //                      select new
        //                      {
        //                          GRId = gr.GoodReceiptId,
        //                          GRDate = gr.GoodReceiptDate,
        //                          InvoiceNo = gr.InvoiceNo,
        //                          TotalAmount = gr.TotalAmount,
        //                          SupplierId = gr.SupplierId,
        //                          SupplierName = s.SupplierName,
        //                          VatAmount = gr.VATAmount,
        //                          PaidAmount = pay == null ? 0 : pay.PaidAmount,
        //                          RemainingAmount = pay == null ? gr.TotalAmount: pay.RemainingAmount,
        //                          DueAmount = pay == null ? gr.TotalAmount : gr.TotalAmount - pay.PaidAmount
        //                      }).ToList();
        //        if (transactiondate != DateTime.MinValue)
        //        {
        //            grPhrmList = grPhrmList.Where(a => a.GRDate.Value.Date == transactiondate.Date).ToList();

        //        }
        //        if (!string.IsNullOrEmpty(voucherNumber))
        //        {
        //            grPhrmList = grPhrmList.Where(a => a.InvoiceNo.Trim().ToLower() == voucherNumber.Trim().ToLower()).ToList();
        //        }
        //        responseData.Status = "OK";
        //        responseData.Results = grPhrmList;
        //    }
        //}
        //#endregion
        //    }

        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}


        #region Start HTTP POST APIs

        #region Post Transaction
        [HttpPost]
        [Route("Trannsaction")]
        public IActionResult PostTransaction()
        {
            //if (reqType == "postTransaction")
            string postStringContent = this.ReadPostData();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostTransaction(postStringContent, currentHospitalId, currentUser);
            return InvokeHttpPostFunction(func);
        }
        #endregion

        #region Post Transaction List
        [HttpPost]
        [Route("Transactions")]
        public IActionResult PostTransactionList()
        {
            //if (reqType == "postTransactionList")
            string postStringContent = this.ReadPostData();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostTransactionList(postStringContent, currentUser, currentHospitalId);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Post Account Closure
        [HttpPost]
        [Route("AccountClose")]
        public IActionResult PostAccountClosure()
        {
            //else if (reqType == "post-account-closure")
            string postStringContent = this.ReadPostData();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostAccountClosure(postStringContent, currentHospitalId, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Add Ledgers During Post To Accounting
        [HttpPost]
        [Route("Ledgers")]
        public IActionResult AddLedgers()
        {
            //else if (reqType == "AddLedgersFromAcc")
            string postStringContent = this.ReadPostData();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => AddLedgers(postStringContent, currentHospitalId);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Add Single Ledger From Shared Component
        [HttpPost]
        [Route("Ledger")]
        public IActionResult AddLedger()
        {
            //else if (reqType == "create-ledger-shared-component")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddLedgersFromSharedComponents(postStringContent, currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Post Reverse Transaction
        [HttpPost]
        [Route("ReverseTransaction")]
        public IActionResult ReverTransaction()
        {
            //else if (reqType == "post-reverse-transaction")
            string postStringContent = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => ReverseTransaction(postStringContent, currentUser, currentHospitalId);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Post Incentive Payment Voucher
        [HttpPost]
        [Route("IncentivePayment")]
        public IActionResult IncentivePayment()
        {
            //if (reqType == "postIncentivePaymentVoucher")
            string postStringContent = this.ReadPostData();
            string transactionObject = this.ReadQueryStringData("transactionObj");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostIncentivePaymentVoucher(currentUser, postStringContent, transactionObject);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Post Make Payment
        [HttpPost]
        [Route("Payment")]
        public IActionResult MakePayment([FromBody] MakePayment_DTO makePayment_dto)
        {
            //else if (reqType == "post-payment")
            //string postStringContent = this.ReadPostData();
            //string transactionObject = this.ReadQueryStringData("transactionObj");
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => PostAccountingPayment(makePayment_dto,currentUser);
            return InvokeHttpPostFunction<object>(func);
        }
        #endregion

        #region Update Bank Reconciliation Category 

        [HttpPost]
        [Route("UpdateBankReconciliationCategory")]
        public string UpdateBankReconciliationCategory([FromBody] List<BankReconciliationCategoryModel> bankReconcilitions)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            bankReconcilitions.ForEach(a =>
            {
                var item = accountingDBContext.BankReconciliationCategory.Where(bank => bank.CategoryId == a.CategoryId).FirstOrDefault();
                item.MappedLedgerId = a.MappedLedgerId;
                item.SubLedgerId = a.SubLedgerId;
                item.DrCr = a.DrCr;
                accountingDBContext.Entry(item).Property(x => x.MappedLedgerId).IsModified = true;
                accountingDBContext.Entry(item).Property(x => x.SubLedgerId).IsModified = true;
                accountingDBContext.Entry(item).Property(x => x.DrCr).IsModified = true;
                accountingDBContext.SaveChanges();
            });

            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = bankReconcilitions;

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        #endregion

        #region Update Medicare Types

        [HttpPost]
        [Route("UpdateMedicareTypes")]
        public string UpdateMedicareTypes([FromBody] List<MedicareTypes> medicareType)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            medicareType.ForEach(a =>
            {
                var item = accountingDBContext.MedicareType.FirstOrDefault(med => med.MedicareTypeId == a.MedicareTypeId);
               
                    if (a.LedgerId == null)
                    {
                        throw new Exception("LedgerId cannot be null.");
                    }
                else { 

                    item.LedgerId = a.LedgerId;
                    accountingDBContext.Entry(item).Property(x => x.LedgerId).IsModified = true;
                    accountingDBContext.SaveChanges();
                }
            });

            responseData.Status = ENUM_Danphe_HTTP_ResponseStatus.OK;
            responseData.Results = medicareType;

            return DanpheJSONConvert.SerializeObject(responseData, true);

        }
        #endregion

        #region Post Suspense A/C Reconciliation
        [HttpPost]
        [Route("SuspenseAcc/Reconcile")]
        public IActionResult PostSuspenaseAccountReconciliation([FromBody] SuspenseAccountTransaction_DTO txnDTO)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => SaveSuspenaseAccountReconciliation(txnDTO,currentUser,currentHospitalId);
            return InvokeHttpPostFunction<object>(func);

        }
        #endregion

        #endregion


        //public string Post()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
        //    InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
        //    BillingDbContext billingDbContext = new BillingDbContext(connString);
        //    PharmacyDbContext pharmacyDbContext = new PharmacyDbContext(connString);
        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");

        //    try
        //    {
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");

        //#region Post Transaction
        //if (reqType == "postTransaction")
        //{
        //    TransactionModel txnClient = DanpheJSONConvert.
        //        DeserializeObject<TransactionModel>(str);
        //    if (txnClient != null)
        //    {
        //        var isGroupbyData = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
        //        var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
        //        txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

        //        txnClient.TransactionDate = Convert.ToDateTime(txnClient.TransactionDate.ToString()).Date;
        //        // txnClient.Remarks = "manual voucher entry on " + txnClient.TransactionDate;
        //        txnClient.IsCustomVoucher = false; //for manual voucher there is no custom voucher things 
        //        txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, txnClient.TransactionDate.Value, currentHospitalId);
        //        txnClient.VoucherNumber = GetVoucherNumber(accountingDBContext, txnClient.VoucherId, 4, currentHospitalId, txnClient.FiscalyearId);
        //        txnClient.TUId = GetTUID(accountingDBContext, currentHospitalId);
        //        txnClient.SectionId = 4;//for manual entry we are using section 4
        //        txnClient.IsReverseTxnAllow = false;
        //        txnClient.TransactionType = "ManualEntry";
        //        txnClient.IsEditable = true;
        //        txnClient.HospitalId = currentHospitalId;
        //        txnClient.IsAllowReverseVoucher = txnClient.IsAllowReverseVoucher.HasValue ? txnClient.IsAllowReverseVoucher : true;
        //        accountingDBContext.Transactions.Add(ProcessTransactions(txnClient, currentHospitalId));
        //        accountingDBContext.SaveChanges();
        //        var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();

        //        // Vikas: 20-Aug-2020: If Reversed vucher entry in Reverse Transaction table.
        //        if (txnClient.IsReverseVoucher == true)
        //        {
        //            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");//getting current user
        //            ReverseTransactionModel reverseTransactionData = new ReverseTransactionModel();
        //            reverseTransactionData.CreatedOn = DateTime.Now;
        //            reverseTransactionData.CreatedBy = currentUser.EmployeeId;
        //            List<TransactionModel> txnList = accountingDBContext.Transactions.Where(a => a.TransactionId == txnClient.PrevTransactionId 
        //                                                                                    && a.FiscalyearId == txnClient.FiscalyearId
        //                                                                                    && a.SectionId == txnClient.SectionId
        //                                                                                    && a.HospitalId == currentHospitalId).Select(a => a).ToList();
        //                if (txnList.Count > 0)
        //                {
        //                    txnList.ForEach(txn =>
        //                    {
        //                        txn.TransactionItems = accountingDBContext.TransactionItems.Where(p => p.HospitalId == currentHospitalId && p.TransactionId == txn.TransactionId).Select(p => p).ToList();
        //                        txn.TransactionItems.ForEach(b =>
        //                        {
        //                            b.TransactionItemDetails = accountingDBContext.TransactionItemDetails.Where(c => c.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
        //                            b.SubLedgers = accountingDBContext.SubLedgerRecord.Where(d => d.TransactionItemId == b.TransactionItemId).Select(y => y).ToList();
        //                        });
        //                        txn.TransactionLinks = accountingDBContext.TransactionLinks.Where(x => x.TransactionId == txn.TransactionId).Select(x => x).ToList();
        //                    });
        //                    string jsonTxnData = DanpheJSONConvert.SerializeObject(txnList);
        //                    List<TransactionModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionModel>>(jsonTxnData);
        //                    reverseTransactionData.TUId = txnsForJson[0].TUId;
        //                    reverseTransactionData.FiscalYearId = txnsForJson[0].FiscalyearId;
        //                    reverseTransactionData.JsonData = DanpheJSONConvert.SerializeObject(txnsForJson);
        //                    reverseTransactionData.TransactionDate = txnsForJson[0].TransactionDate;
        //                    reverseTransactionData.Section = txnsForJson[0].SectionId;
        //                    reverseTransactionData.Reason = "reversed manual voucher";
        //                    accountingDBContext.ReverseTransaction.Add(reverseTransactionData);
        //                    accountingDBContext.SaveChanges();
        //                }

        //            var PreviousVoucher = accountingDBContext.Transactions.Where(txn => txn.TransactionId == txnClient.PrevTransactionId).FirstOrDefault();
        //            if (PreviousVoucher != null)
        //            {
        //                PreviousVoucher.IsAllowReverseVoucher = false;
        //                accountingDBContext.Entry(PreviousVoucher).Property(a => a.IsAllowReverseVoucher).IsModified = true;
        //                accountingDBContext.SaveChanges();
        //            }
        //        }

        //        var FinalData = new
        //            {
        //                txnClient.VoucherNumber,
        //                txnClient.FiscalyearId
        //            };
        //        responseData.Results = FinalData;
        //        responseData.Status = "OK";
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}
        //#endregion               
        //#region Post Transaction List
        ////else 
        //if (reqType == "postTransactionList")
        //{
        //    //REMARK: RAMAVTAR: NEED TO MAKE THIS ONE TRANSACTION

        //    List<TransactionModel> txnListClient = DanpheJSONConvert.
        //        DeserializeObject<List<TransactionModel>>(str);
        //    AccountingTransferData accountingTransferData = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
        //    var check = AccountingTransferData.PostTxnData(txnListClient, currentHospitalId);

        //}
        //#endregion
        //#region Post List of Transaction
        //else if (reqType == "post-txns")
        //{
        // Dev : 31 Jan 2023 : This API has been Depricated....
        //    List<TransactionModel> transactions = DanpheJSONConvert.
        //        DeserializeObject<List<TransactionModel>>(str);
        //    transactions.ForEach(txn =>
        //                {
        //                    txn.HospitalId = currentHospitalId;
        //                    accountingDBContext.Transactions.Add(ProcessTransactions(txn, currentHospitalId));
        //                });
        //    accountingDBContext.SaveChanges();
        //    responseData.Status = "OK";
        //}
        //#endregion
        //#region Post Account Closure
        //else if (reqType == "post-account-closure")
        //{
        //    ////account closure transaction 

        //    FiscalYearModel fiscalYear = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);
        //    var CurrentDate = DateTime.Now.Date;
        //    var CurrentfiscalYear = accountingDBContext.FiscalYears.Where(f => f.HospitalId == currentHospitalId && f.FiscalYearId == fiscalYear.FiscalYearId).FirstOrDefault();

        //    // 1. Check next yeard fiscal year available or not.
        //    var nextFiscalYearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, CurrentfiscalYear.EndDate.AddDays(10), currentHospitalId);

        //    if (nextFiscalYearId > 0)
        //    {

        //        List<SqlParameter> paramList = new List<SqlParameter>()
        //        {
        //                 new SqlParameter("@CurrentFiscalYearId",CurrentfiscalYear.FiscalYearId),
        //                 new SqlParameter("@NextFiscalYearId", nextFiscalYearId),
        //                 new SqlParameter("@HospitalId", currentHospitalId)
        //        };
        //        int ret = DALFunctions.ExecuteStoredProcedure("SP_ACC_AccountClosure", paramList, accountingDBContext);
        //        var tempModel = new FiscalYearLogModel();
        //        tempModel.FiscalYearId = fiscalYear.FiscalYearId;
        //        tempModel.HospitalId = currentHospitalId;
        //        tempModel.LogType = "closed";
        //        tempModel.LogDetails = "closed for testing purpose";
        //        tempModel.CreatedOn = CurrentDate;
        //        tempModel.CreatedBy = currentUser.EmployeeId;
        //        accountingDBContext.FiscalYearLog.Add(tempModel);
        //        accountingDBContext.SaveChanges();

        //        responseData.Results = (from fy in accountingDBContext.FiscalYears
        //                                where fy.IsActive == true
        //                                select fy).ToList();
        //        responseData.Status = "OK";

        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = "Next fiscal year is not created. Please create first fiscal year.";
        //    }
        //}
        //#endregion
        //#region Adding Ledger while transfer record to Accounting, it will add single or multiple ledgers
        //else if (reqType == "AddLedgersFromAcc")
        //{
        //    using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            List<LedgerModel> ledgers = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
        //            {
        //                ledgers.ForEach(led =>
        //                {
        //                    led.CreatedOn = System.DateTime.Now;
        //                    led.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
        //                    led.HospitalId = currentHospitalId;
        //                    led.LedgerName = led.LedgerName.Trim();
        //                    accountingDBContext.Ledgers.Add(led);
        //                    accountingDBContext.SaveChanges();
        //                    AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, led);
        //                    if (led.LedgerType != "" && led.LedgerType.Length > 0)
        //                    {
        //                        LedgerMappingModel ledgerMapping = new LedgerMappingModel();
        //                        ledgerMapping.LedgerId = led.LedgerId;
        //                        ledgerMapping.LedgerType = led.LedgerType;
        //                        ledgerMapping.ReferenceId = (int)led.LedgerReferenceId;
        //                        ledgerMapping.HospitalId = currentHospitalId;
        //                        accountingDBContext.LedgerMappings.Add(ledgerMapping);
        //                        accountingDBContext.SaveChanges();
        //                    }
        //                    var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(led, accountingDBContext, false, currentHospitalId,led.CreatedBy);

        //                    if (flag)
        //                    {
        //                        responseData.Status = "OK";
        //                        dbContextTransaction.Commit();
        //                    }
        //                    else
        //                    {
        //                        responseData.Status = "Failed";
        //                        dbContextTransaction.Rollback();
        //                    }
        //                });
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            throw ex;
        //        }
        //    }
        //}
        //#endregion

        //#region Add Single Ledger at a time and return all properties which needed
        //else if (reqType == "create-ledger-shared-component")
        //{
        //    using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //            //for this resolution we have temp solution
        //            //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //            //if user have only one hsopital permission then automatically activate this hospital
        //            var HospId = AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);

        //            LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
        //            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
        //            if (accountingDBContext.LedgerMappings.Any(r => r.HospitalId == HospId && r.ReferenceId == ledger.LedgerReferenceId && r.LedgerType == ledger.LedgerType))
        //            {
        //                responseData.Status = "Failed";
        //                responseData.ErrorMessage = "Ledger already created please create new one.";
        //            }
        //            else
        //            {
        //                ledger.CreatedOn = System.DateTime.Now;
        //                ledger.IsActive = true;
        //                ledger.CreatedBy = currentUser.EmployeeId;
        //                ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, HospId);
        //                ledger.HospitalId = HospId;
        //                ledger.LedgerName = ledger.LedgerName.Trim();
        //                accountingDBContext.Ledgers.Add(ledger);
        //                accountingDBContext.SaveChanges();
        //                AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, ledger);
        //                if (ledger.LedgerType != "inventorysubcategory" && ledger.LedgerType.Length > 0)
        //                {
        //                    ledgerMapping.LedgerId = ledger.LedgerId;
        //                    ledgerMapping.LedgerType = ledger.LedgerType;
        //                    ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
        //                    ledgerMapping.HospitalId = HospId;
        //                    accountingDBContext.LedgerMappings.Add(ledgerMapping);
        //                }
        //                accountingDBContext.SaveChanges();
        //                var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, HospId,currentUser.EmployeeId);

        //                if (flag)
        //                {
        //                    responseData.Results = ledger;
        //                    responseData.Status = "OK";
        //                }
        //                else
        //                {
        //                    responseData.Status = "Failed";
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //            if (ledger.LedgerId > 0) // && ledgerMapping.LedgerMappingId > 0
        //            {
        //                dbContextTransaction.Commit();
        //            }
        //            else
        //            {
        //                dbContextTransaction.Rollback();
        //                responseData.Status = "Failed";
        //                responseData.ErrorMessage = "Ledger with mapping saving has issue, please try again!";
        //            }

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }

        //}
        //#endregion


        //#region post undo transaction
        //else if (reqType == "post-reverse-transaction")
        //{
        //    try
        //    {
        //        //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");//getting current user
        //        ReverseTransactionModel reverseTransactionData = DanpheJSONConvert.DeserializeObject<ReverseTransactionModel>(str);
        //        reverseTransactionData.CreatedOn = DateTime.Now;
        //        reverseTransactionData.CreatedBy = currentUser.EmployeeId;
        //        //get all transaction with matching sectionId and date
        //        List<TransactionModel> txnList = accountingDBContext.Transactions.Where(a => DbFunctions.TruncateTime(a.TransactionDate) == reverseTransactionData.TransactionDate && a.SectionId == reverseTransactionData.Section
        //                                                                             && a.IsReverseTxnAllow != false && a.HospitalId == currentHospitalId).Select(a => a).ToList();

        //        if (txnList.Count > 0)
        //        {
        //            txnList.ForEach(txn =>
        //            {
        //                txn.TransactionItems = accountingDBContext.TransactionItems.Where(p => p.HospitalId == currentHospitalId && p.TransactionId == txn.TransactionId).Select(p => p).ToList();
        //                txn.TransactionItems.ForEach(b =>
        //                {
        //                    b.TransactionItemDetails = accountingDBContext.TransactionItemDetails.Where(c => c.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
        //                });
        //                txn.TransactionLinks = accountingDBContext.TransactionLinks.Where(x => x.TransactionId == txn.TransactionId).Select(x => x).ToList();
        //            });
        //            string jsonTxnData = DanpheJSONConvert.SerializeObject(txnList);
        //            List<TransactionModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionModel>>(jsonTxnData);
        //            //NageshBB: 20Aug2020
        //            //We need transactionItems for track records with amount . so we need to save transactionItems for reverse txn
        //            //txnsForJson.ForEach(b =>
        //            //{
        //            //    b.TransactionItems = null;
        //            //});
        //            reverseTransactionData.TUId = txnsForJson[0].TUId;
        //            reverseTransactionData.FiscalYearId = txnsForJson[0].FiscalyearId;
        //            reverseTransactionData.JsonData = DanpheJSONConvert.SerializeObject(txnsForJson);

        //            //update IsTransferToAccounting 
        //            bool IsReverseTransaction = true;
        //            var checkFlag = true;
        //            if (reverseTransactionData.Section == 1)//inventory
        //            {
        //                List<string> TransactionType = new List<string>();
        //                var distinctTxnTypeList = txnList.Select(a => a.TransactionType).ToList().Distinct().ToList();//getting all transaction types in list

        //                Hashtable ReferenceIdWithTypeList = new Hashtable();//hashtable will save txntype and txn list
        //                List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
        //                for (int i = 0; i < distinctTxnTypeList.Count; i++)
        //                {
        //                    var filteredData = (from t in txnList
        //                                        where t.TransactionType == distinctTxnTypeList[i]
        //                                        select t).ToList();
        //                    List<string> allReferenceIds = new List<string>();
        //                    List<string> allReferenceIdsOne = new List<string>();//NageshBB:20Aug2020
        //                    filteredData.ForEach(txn =>
        //                    {
        //                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
        //                        refId.ForEach(newId => allReferenceIds.Add((string)newId));

        //                        var refIdOne = txn.TransactionLinks.Select(tone => tone.ReferenceIdOne).ToList();//NageshBB:20Aug2020
        //                        refIdOne.ForEach(newId => allReferenceIdsOne.Add((string)newId));//NageshBB:20Aug2020
        //                    });
        //                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
        //                    string refIdOneStr = string.Join(",", allReferenceIdsOne.Select(p => p));//NageshBB:20Aug2020
        //                    if (refIdOneStr.Length > 0) //NageshBB:20Aug2020
        //                    {
        //                        AllReferenceIds.Add(new AccountingReferenceTypeViewModel
        //                        {
        //                            Type = distinctTxnTypeList[i],
        //                            ReferenceIds = refIdStr,
        //                            ReferenceIdsOne = refIdOneStr
        //                        });
        //                    }
        //                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
        //                }

        //                if (distinctTxnTypeList.Count > 0)
        //                {
        //                    foreach (string txnType in distinctTxnTypeList)
        //                    {                                        
        //                        checkFlag = (checkFlag == true) ? accountingDBContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction,null,AllReferenceIds) : checkFlag;
        //                    }
        //                }
        //            }
        //            else if (reverseTransactionData.Section == 2)//billing
        //            {

        //                //nbb reverse transaction changes after removed sync table
        //                List<string> TransactionType = new List<string>();
        //                var distinctTxnTypeList = txnList.Select(a => a.TransactionType).ToList().Distinct().ToList();//getting all transaction types in list

        //                Hashtable ReferenceIdWithTypeList = new Hashtable();//hashtable will save txntype and txn list
        //                for (int i = 0; i < distinctTxnTypeList.Count; i++)
        //                {
        //                    var filteredData = (from t in txnList
        //                                        where t.TransactionType == distinctTxnTypeList[i]
        //                                        select t).ToList();
        //                    List<string> allReferenceIds = new List<string>();
        //                    filteredData.ForEach(txn =>
        //                    {
        //                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
        //                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
        //                    });
        //                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
        //                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
        //                }

        //                if (distinctTxnTypeList.Count > 0)
        //                {
        //                    foreach (string txnType in distinctTxnTypeList)
        //                    {                                        
        //                        checkFlag = (checkFlag == true) ? accountingDBContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction,null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
        //                    }
        //                }
        //            }
        //            else if (reverseTransactionData.Section == 3)//pharmacy
        //            {
        //                List<string> TransactionType = new List<string>();
        //                var distinctTxnTypeList = txnList.Select(a => a.TransactionType).ToList().Distinct().ToList();
        //                Hashtable ReferenceIdWithTypeList = new Hashtable();
        //                for (int i = 0; i < distinctTxnTypeList.Count; i++)
        //                {
        //                    var filteredData = (from t in txnList
        //                                        where t.TransactionType == distinctTxnTypeList[i]
        //                                        select t).ToList();
        //                    List<string> allReferenceIds = new List<string>();
        //                    filteredData.ForEach(txn =>
        //                    {
        //                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
        //                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
        //                    });
        //                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
        //                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
        //                }

        //                if (distinctTxnTypeList.Count > 0)
        //                {
        //                    foreach (string txnType in distinctTxnTypeList)
        //                    {                                        
        //                        checkFlag = (checkFlag == true) ? accountingDBContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction,null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
        //                    }
        //                }
        //            }
        //            else if (reverseTransactionData.Section == 5)//incetive
        //            {
        //                List<string> TransactionType = new List<string>();
        //                var distinctTxnTypeList = txnList.Select(a => a.TransactionType).ToList().Distinct().ToList();
        //                Hashtable ReferenceIdWithTypeList = new Hashtable();
        //                for (int i = 0; i < distinctTxnTypeList.Count; i++)
        //                {
        //                    var filteredData = (from t in txnList
        //                                        where t.TransactionType == distinctTxnTypeList[i]
        //                                        select t).ToList();
        //                    List<string> allReferenceIds = new List<string>();
        //                    filteredData.ForEach(txn =>
        //                    {
        //                        var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
        //                        refId.ForEach(newId => allReferenceIds.Add((string)newId));
        //                    });
        //                    string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
        //                    ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
        //                }

        //                if (distinctTxnTypeList.Count > 0)
        //                {
        //                    foreach (string txnType in distinctTxnTypeList)
        //                    {                                        
        //                        checkFlag = (checkFlag == true) ? accountingDBContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction,null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
        //                    }
        //                }
        //            }

        //            //deleting transactions
        //            if (checkFlag == true)
        //            {
        //                txnList.ForEach(a =>
        //                {
        //                    a.TransactionItems.ForEach(c =>
        //                    {
        //                        accountingDBContext.TransactionItemDetails.RemoveRange(c.TransactionItemDetails);
        //                    });
        //                    accountingDBContext.TransactionItems.RemoveRange(a.TransactionItems);
        //                    accountingDBContext.TransactionLinks.RemoveRange(a.TransactionLinks);
        //                });
        //                accountingDBContext.ReverseTransaction.Add(reverseTransactionData);
        //                accountingDBContext.Transactions.RemoveRange(txnList);
        //                accountingDBContext.SaveChanges();
        //                responseData.Results = true;
        //            }
        //            else
        //            {
        //                responseData.Results = false;
        //            }
        //        }
        //        else
        //        {
        //            responseData.Results = false;
        //        }
        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
        //#endregion
        //#region Post Incentive Payment Voucher
        //if (reqType == "postIncentivePaymentVoucher")
        //{
        //    PaymentInfoModel paymentInfoModel = DanpheJSONConvert.DeserializeObject<PaymentInfoModel>(str);

        //    //GetVoucherNumber(accountingDBContext, distinctVoucherIdAndDate[p].VoucherId, distinctVoucherIdAndDate[p].TransactionDate, sectionId);
        //    string transactionObject = this.ReadQueryStringData("transactionObj");
        //    TransactionModel txnClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(transactionObject);
        //    int payInfoId = 0;
        //    using (var dbTransact = accountingDBContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            if (txnClient != null)
        //            {
        //                var isGroupbyData = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
        //                var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
        //                txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

        //                var HospitalId = AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);
        //                txnClient.HospitalId = HospitalId;
        //                txnClient.TransactionDate = System.DateTime.Now.Date;
        //                txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, txnClient.TransactionDate.Value, HospitalId);
        //                CostCenterModel costCenter = accountingDBContext.CostCenters.Where(cc => cc.CostCenterName == ENUM_ACC_DefaultCostCenterName.Hospital).FirstOrDefault();
        //                txnClient.CostCenterId = costCenter != null ? costCenter.CostCenterId : 1;//There will be at-least one voucher head. -- remove this hardcode and take from parameter
        //                txnClient.TransactionType = "IncentivePayment";
        //                txnClient.IsCustomVoucher = false;
        //                txnClient.VoucherId = accountingDBContext.Vouchers.Where(v => v.VoucherCode.ToLower() == "pmtv").FirstOrDefault().VoucherId;
        //                txnClient.VoucherNumber = GetVoucherNumber(accountingDBContext, txnClient.VoucherId, 5, HospitalId, txnClient.FiscalyearId);
        //                txnClient.TUId = GetTUID(accountingDBContext, HospitalId);
        //                txnClient.SectionId = 5;//for manual entry we are using section 4
        //                txnClient.IsReverseTxnAllow = false;
        //                accountingDBContext.Transactions.Add(ProcessTransactions(txnClient, txnClient.HospitalId.Value));
        //                accountingDBContext.SaveChanges();

        //                var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();
        //                paymentInfoModel.CreatedOn = System.DateTime.Now;
        //                paymentInfoModel.VoucherNumber = txnClient.VoucherNumber;
        //                paymentInfoModel.Remarks = txnClient.Remarks;
        //                accountingDBContext.PaymentInfo.Add(paymentInfoModel);
        //                accountingDBContext.SaveChanges();
        //                payInfoId = paymentInfoModel.PaymentInfoId;
        //                dbTransact.Commit();
        //            }

        //        }
        //        catch (Exception ex)
        //        {
        //            responseData.Status = "Failed";
        //            dbTransact.Rollback();
        //            throw ex;
        //        }
        //    }

        //    List<SqlParameter> paramList = new List<SqlParameter>()
        //    {
        //        new SqlParameter("@FromDate", paymentInfoModel.FromDate),
        //        new SqlParameter("@ToDate", paymentInfoModel.ToDate),
        //        new SqlParameter("@employeeId", paymentInfoModel.EmployeeId),
        //        new SqlParameter("@paymentInfoId", payInfoId)
        //    };
        //    int ret = DALFunctions.ExecuteStoredProcedure("SP_INCTV_PaymentInfo_Update", paramList, accountingDBContext);
        //    var resFinal = new { VoucherNumber = txnClient.VoucherNumber, FiscalYearId = txnClient.FiscalyearId };

        //    responseData.Results = resFinal;
        //    responseData.Status = "OK";

        //}
        //#endregion

        //#region post accounting payment 
        //else if (reqType == "post-payment")
        //{

        //    AccountingPaymentModel payment = DanpheJSONConvert.DeserializeObject<AccountingPaymentModel>(str);
        //    string transactionObject = this.ReadQueryStringData("transactionObj");
        //    TransactionModel txnClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(transactionObject);
        //    int payInfoId = 0;
        //    using (var dbTransact = accountingDBContext.Database.BeginTransaction())
        //    {
        //        try
        //        {
        //            if (txnClient != null)
        //            {
        //                var isGroupbyData = accountingDBContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
        //                var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
        //                txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

        //                var HospitalId = AccountingTransferData.GetAccPrimaryHospitalId(accountingDBContext);
        //                txnClient.HospitalId = HospitalId;
        //                txnClient.TransactionDate = System.DateTime.Now.Date;
        //                txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, txnClient.TransactionDate.Value, HospitalId);
        //                CostCenterModel costCenter = accountingDBContext.CostCenters.Where(cc => cc.CostCenterName == ENUM_ACC_DefaultCostCenterName.Hospital).FirstOrDefault();
        //                txnClient.CostCenterId = costCenter != null ? costCenter.CostCenterId : 1;//There will be at-least one voucher head. -- remove this hardcode and take from parameter
        //                txnClient.TransactionType = payment.SectionId==1? "InventoryPayment": "PharmacyPayment";
        //                txnClient.IsCustomVoucher = false;
        //                txnClient.VoucherId = accountingDBContext.Vouchers.Where(v => v.VoucherCode.ToLower() == "pmtv").FirstOrDefault().VoucherId;
        //                txnClient.VoucherNumber = GetVoucherNumber(accountingDBContext, txnClient.VoucherId,payment.SectionId, HospitalId, txnClient.FiscalyearId);
        //                txnClient.TUId = GetTUID(accountingDBContext, HospitalId);
        //                txnClient.SectionId = payment.SectionId;
        //                txnClient.IsReverseTxnAllow = false;
        //                accountingDBContext.Transactions.Add(ProcessTransactions(txnClient, txnClient.HospitalId.Value));
        //                accountingDBContext.SaveChanges();

        //                var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();
        //                payment.CreatedOn = System.DateTime.Now;
        //                payment.CreatedBy = txnClient.CreatedBy;
        //                payment.PaidAmount = payment.VoucherAmount + payment.PaidAmount;
        //                payment.IsPaymentDone = (payment.PaidAmount == payment.TotalAmount) ? true : false;
        //                payment.VoucherNumber = txnClient.VoucherNumber;
        //                payment.TransactionId = txnClient.TransactionId;
        //                payment.PaymentDate= System.DateTime.Now;
        //                accountingDBContext.AccountingPaymentModels.Add(payment);
        //                accountingDBContext.SaveChanges();

        //                payInfoId = payment.PaymentId;
        //                if (payment.IsPaymentDone == true)
        //                {
        //                    if (payment.SectionId == 1)
        //                    {
        //                        var grInv = accountingDBContext.GoodsReceiptModels.Where(a => a.GoodsReceiptID == payment.GoodReceiptID).FirstOrDefault();
        //                        grInv.IsPaymentDoneFromAcc = true;
        //                        accountingDBContext.GoodsReceiptModels.Attach(grInv);
        //                        accountingDBContext.Entry(grInv).State = EntityState.Modified;
        //                        accountingDBContext.Entry(grInv).Property(x => x.IsPaymentDoneFromAcc).IsModified = true;
        //                    }
        //                    else
        //                    {
        //                        var grPhm = accountingDBContext.PHRMGoodsReceipt.Where(a => a.GoodReceiptId == payment.GoodReceiptID).FirstOrDefault();
        //                        grPhm.IsPaymentDoneFromAcc = true;
        //                        accountingDBContext.PHRMGoodsReceipt.Attach(grPhm);
        //                        accountingDBContext.Entry(grPhm).State = EntityState.Modified;
        //                        accountingDBContext.Entry(grPhm).Property(x => x.IsPaymentDoneFromAcc).IsModified = true;
        //                    }
        //                    accountingDBContext.SaveChanges();
        //                }
        //                dbTransact.Commit();
        //            }
        //            var res = new { VoucherNumber = txnClient.VoucherNumber, FiscalYearId = txnClient.FiscalyearId };
        //            responseData.Results = res;
        //            responseData.Status = "OK";
        //        }
        //        catch (Exception ex)
        //        {
        //            responseData.Status = "Failed";
        //            dbTransact.Rollback();
        //            throw ex;
        //        }
        //    }
        //}
        //#endregion
        //        if (responseData.Status == null || responseData.Status == "")
        //        {//need to remove ok from here and status will update from api region
        //            responseData.Status = "OK";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        #region START HTTP PUT APIs

        #region Update Transaction
        [HttpPut]
        [Route("Transaction")]
        public IActionResult UpdateTransaction()
        {
            //if (reqType == "putTransaction")
            string postStringContent = this.ReadPostData();
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => UpdateTransaction(postStringContent, currentHospitalId, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion

        #region Verify Voucher
        [HttpPut]
        [Route("VerifyVoucher")]
        public IActionResult VerifyVoucher([FromBody] VoucherVerify_DTO voucherData)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => VerifyVoucher(voucherData, currentUser);
            return InvokeHttpPutFunction(func);
        }
        #endregion



        #endregion


        //[HttpPut]
        //public string Put()
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    AccountingDbContext accountingDBContext = new AccountingDbContext(connString);

        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

        //    try
        //    {
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");

        //        //for edit manual voucher update voucher
        //        #region Post Transaction
        //        if (reqType == "putTransaction")
        //        {

        //            string Str = this.ReadPostData();
        //            TransactionModel txnFromClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(Str);

        //            // Edit Voucher logs entries.
        //            var txnitemdata = accountingDBContext.TransactionItems.AsNoTracking().Where(t => t.TransactionId == txnFromClient.TransactionId).ToList();

        //            string jsonTxnData = DanpheJSONConvert.SerializeObject(txnitemdata);
        //            List<TransactionItemModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionItemModel>>(jsonTxnData);
        //            EditVoucherLogModel editvoucherLog = new EditVoucherLogModel();
        //            editvoucherLog.TransactionDate = txnFromClient.TransactionDate;
        //            editvoucherLog.SectionId = txnFromClient.SectionId;
        //            editvoucherLog.VoucherNumber = txnFromClient.VoucherNumber;
        //            editvoucherLog.Reason = txnFromClient.Reason;
        //            editvoucherLog.HospitalId = currentHospitalId;
        //            editvoucherLog.FiscalYearId = AccountingTransferData.GetFiscalYearIdByDate(accountingDBContext, txnFromClient.TransactionDate.Value, currentHospitalId); ///txnFromClient.FiscalyearId;
        //            editvoucherLog.CreatedOn = DateTime.Now;
        //            editvoucherLog.CreatedBy = currentUser.EmployeeId;
        //            editvoucherLog.OldVocherJsonData = DanpheJSONConvert.SerializeObject(txnsForJson);
        //            accountingDBContext.EditVoucherLog.Add(editvoucherLog);
        //            txnitemdata = null;

        //            using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //            {
        //                try
        //                {
        //                    if (txnFromClient != null && txnFromClient.TransactionItems != null && txnFromClient.TransactionItems.Count > 0)
        //                    {
        //                        var txnId = txnFromClient.TransactionId;
        //                        var ToUpdate = (from txnData in accountingDBContext.Transactions
        //                                        where txnData.TransactionId == txnFromClient.TransactionId
        //                                        select txnData).FirstOrDefault();
        //                        //if any old item has been deleted, we need to compareitemidlist
        //                        List<int> txnItmIdList = accountingDBContext.TransactionItems.Where(a => a.HospitalId == currentHospitalId && a.TransactionId == txnId).Select(a => a.TransactionItemId).ToList();
        //                        //accountingDBContext.Transactions.Attach(ToUpdate);
        //                        //accountingDBContext.Entry(reqFromClient).Property(a => a.Remarks).IsModified = true;
        //                        ToUpdate.Remarks = txnFromClient.Remarks;
        //                        if (txnFromClient.IsBackDateEntry == true)
        //                        {
        //                            ToUpdate.IsBackDateEntry = txnFromClient.IsBackDateEntry;
        //                        }
        //                        ToUpdate.TransactionDate = txnFromClient.TransactionDate;
        //                        ToUpdate.ModifiedBy = currentUser.EmployeeId;
        //                        ToUpdate.ModifiedOn = System.DateTime.Now;
        //                        accountingDBContext.Transactions.Attach(ToUpdate);
        //                        accountingDBContext.Entry(ToUpdate).State = EntityState.Modified;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.Remarks).IsModified = true;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.IsBackDateEntry).IsModified = true;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.TransactionDate).IsModified = true;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.CreatedOn).IsModified = false;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.CreatedBy).IsModified = false;

        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.VoucherNumber).IsModified = false;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.VoucherId).IsModified = false;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.ModifiedBy).IsModified = true;
        //                        accountingDBContext.Entry(ToUpdate).Property(x => x.ModifiedOn).IsModified = true;

        //                        txnFromClient.TransactionItems.ForEach(item =>
        //                        {
        //                            if (item.TransactionItemId > 0) //old elememnt will have the requisitionItemId
        //                                {
        //                                item.HospitalId = currentHospitalId;
        //                                    //for updating old element
        //                                    accountingDBContext.TransactionItems.Attach(item);
        //                                accountingDBContext.Entry(item).Property(a => a.DrCr).IsModified = true;
        //                                accountingDBContext.Entry(item).Property(a => a.LedgerId).IsModified = true;
        //                                accountingDBContext.Entry(item).Property(a => a.Amount).IsModified = true;
        //                                accountingDBContext.Entry(item).Property(a => a.Description).IsModified = true;
        //                                accountingDBContext.Entry(item).Property(a => a.HospitalId).IsModified = true;
        //                                if(item.SubLedgers != null)
        //                                {
        //                                    item.SubLedgers.ForEach(subLed =>
        //                                    {
        //                                        accountingDBContext.SubLedgerRecord.Attach(subLed);
        //                                        accountingDBContext.Entry(subLed).Property(a => a.DrAmount).IsModified = true;
        //                                        accountingDBContext.Entry(subLed).Property(a => a.CrAmount).IsModified = true;
        //                                        accountingDBContext.Entry(subLed).Property(a => a.SubLedgerId).IsModified = true;
        //                                    });
        //                                }
        //                                accountingDBContext.SaveChanges();
        //                                    //delete the present itemid from the list, so later we can delete the remaining item in the list.
        //                                    txnItmIdList = txnItmIdList.Where(a => a != item.TransactionItemId).ToList();
        //                            }
        //                            else //new items wont have ItemId
        //                                {
        //                                    //for adding new txnitm
        //                                    item.CreatedOn = DateTime.Now;
        //                                item.CreatedBy = currentUser.EmployeeId;
        //                                item.TransactionId = txnId;
        //                                item.HospitalId = currentHospitalId;
        //                                if (item.SubLedgers != null)
        //                                {
        //                                    item.SubLedgers.ForEach(subLedgerItems =>
        //                                    {
        //                                        subLedgerItems.VoucherNo = txnFromClient.VoucherNumber;
        //                                        subLedgerItems.VoucherType = txnFromClient.VoucherId;
        //                                        subLedgerItems.VoucherDate = txnFromClient.TransactionDate;
        //                                        subLedgerItems.CreatedOn = DateTime.Now;
        //                                        subLedgerItems.CreatedBy = currentUser.EmployeeId;
        //                                        subLedgerItems.HospitalId = currentHospitalId;
        //                                        subLedgerItems.FiscalYearId = txnFromClient.FiscalyearId;
        //                                    });
        //                                }
        //                                accountingDBContext.TransactionItems.Add(item);
        //                                accountingDBContext.SaveChanges();
        //                            }
        //                        });
        //                        //for deleting old element
        //                        if (txnItmIdList.Any())
        //                        {
        //                            foreach (int reqitmid in txnItmIdList)
        //                            {
        //                                var _subledgerList = accountingDBContext.SubLedgerRecord.Where(a => a.TransactionItemId == reqitmid).Select( a=> a.Id).ToList();
        //                                _subledgerList.ForEach(subLed =>
        //                                {
        //                                    var _subLedger = accountingDBContext.SubLedgerRecord.Find(subLed);
        //                                    accountingDBContext.Entry(_subLedger).State = EntityState.Deleted;
        //                                });
        //                                var reqitm = accountingDBContext.TransactionItems.Find(reqitmid);
        //                                accountingDBContext.Entry(reqitm).State = EntityState.Deleted;
        //                            }

        //                        }
        //                        var FinalData = new
        //                        {
        //                            txnFromClient.VoucherNumber,
        //                            txnFromClient.FiscalyearId
        //                        };
        //                        responseData.Results = FinalData;

        //                        accountingDBContext.SaveChanges();
        //                        responseData.Status = "OK";
        //                        dbContextTransaction.Commit();
        //                    }

        //                }
        //                catch (Exception ex)
        //                {

        //                    responseData.Status = "Failed";
        //                    dbContextTransaction.Rollback();
        //                    throw ex;
        //                }
        //            }
        //        }
        //        #endregion

        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        private string GetNepaliDate(DateTime mydate)
        {
            try
            {
                string ndate = null;
                NepaliDateType nepDateToday = DanpheDateConvertor.ConvertEngToNepDate(mydate);
                var day = NepaliDateModel.NepaliDayList.Find(a => a.DayNumberEng == nepDateToday.Day).DayNumberNep;
                var month = NepaliDateModel.NepaliMonthList.Find(a => a.MonthNumber == nepDateToday.Month).MonthName;
                var year = NepaliDateModel.NepaliYearList.Find(a => a.YearNumberEng == nepDateToday.Year).YearNumberNep;
                ndate = day + " " + month + " " + year;
                return ndate;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object PostTransaction(string postStringContent, int currentHospitalId, RbacUser currentUser)
        {
            using (var accountingTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    TransactionModel txnClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(postStringContent);
                    if (txnClient != null)
                    {
                        var isGroupbyData = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                        var EnableVoucherVerificationParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "EnableVoucherVerification").FirstOrDefault();
                        var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
                        txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

                        txnClient.TransactionDate = Convert.ToDateTime(txnClient.TransactionDate.ToString()).Date;
                        // txnClient.Remarks = "manual voucher entry on " + txnClient.TransactionDate;
                        txnClient.IsCustomVoucher = false; //for manual voucher there is no custom voucher things 
                        txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, txnClient.TransactionDate, currentHospitalId);
                        txnClient.VoucherNumber = GetVoucherNumber(_accountingDbContext, txnClient.VoucherId, 4, currentHospitalId, txnClient.FiscalyearId);
                        txnClient.TUId = GetTUID(_accountingDbContext, currentHospitalId);
                        txnClient.SectionId = 4;//for manual entry we are using section 4
                        txnClient.IsReverseTxnAllow = false;
                        txnClient.TransactionType = "ManualEntry";
                        txnClient.IsEditable = true;
                        txnClient.HospitalId = currentHospitalId;
                        txnClient.IsAllowReverseVoucher = txnClient.IsAllowReverseVoucher ? txnClient.IsAllowReverseVoucher : true;
                        txnClient.IsVoucherReversed = txnClient.IsReverseVoucher == true ? true : false;
                        if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Draft;
                        }
                        else
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Verified;
                            txnClient.IsVerified = true;
                            txnClient.VerifiedBy = currentUser.EmployeeId;
                            txnClient.VerifiedOn = DateTime.Now;
                            txnClient.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                        }
                        _accountingDbContext.Transactions.Add(ProcessTransactions(txnClient, currentHospitalId));
                        _accountingDbContext.SaveChanges();
                       // var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();

                        // Vikas: 20-Aug-2020: If Reversed vucher entry in Reverse Transaction table.
                        if (txnClient.IsReverseVoucher == true)
                        {
                            //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");//getting current user
                            ReverseTransactionModel reverseTransactionData = new ReverseTransactionModel();
                            reverseTransactionData.CreatedOn = DateTime.Now;
                            reverseTransactionData.CreatedBy = currentUser.EmployeeId;
                            List<TransactionModel> txnList = _accountingDbContext.Transactions.Where(a => a.TransactionId == txnClient.PrevTransactionId
                                                                                                    && a.FiscalyearId == txnClient.FiscalyearId
                                                                                                    && a.SectionId == txnClient.SectionId
                                                                                                    && a.HospitalId == currentHospitalId).Select(a => a).ToList();
                            if (txnList.Count > 0)
                            {
                                txnList.ForEach(txn =>
                                {
                                    txn.TransactionItems = _accountingDbContext.TransactionItems.Where(p => p.HospitalId == currentHospitalId && p.TransactionId == txn.TransactionId).Select(p => p).ToList();
                                    txn.TransactionItems.ForEach(b =>
                                    {
                                        b.TransactionItemDetails = _accountingDbContext.TransactionItemDetails.Where(c => c.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
                                        b.SubLedgers = _accountingDbContext.SubLedgerRecord.Where(d => d.TransactionItemId == b.TransactionItemId).Select(y => y).ToList();
                                        b.TransactionLinks = _accountingDbContext.TransactionLinks.Where(x => x.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
                                    });
                                    //txn.TransactionLinks = _accountingDbContext.TransactionLinks.Where(x => x.TransactionId == txn.TransactionId).Select(x => x).ToList();
                                });
                                string jsonTxnData = DanpheJSONConvert.SerializeObject(txnList);
                                List<TransactionModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionModel>>(jsonTxnData);
                                reverseTransactionData.TUId = txnsForJson[0].TUId;
                                reverseTransactionData.FiscalYearId = txnsForJson[0].FiscalyearId;
                                reverseTransactionData.JsonData = DanpheJSONConvert.SerializeObject(txnsForJson);
                                reverseTransactionData.TransactionDate = txnsForJson[0].TransactionDate;
                                reverseTransactionData.Section = txnsForJson[0].SectionId;
                                reverseTransactionData.HospitalId = txnsForJson[0].HospitalId;
                                reverseTransactionData.Reason = "reversed manual voucher";
                                _accountingDbContext.ReverseTransaction.Add(reverseTransactionData);
                                _accountingDbContext.SaveChanges();
                            }

                            var PreviousVoucher = _accountingDbContext.Transactions.Where(txn => txn.TransactionId == txnClient.PrevTransactionId).FirstOrDefault();
                            if (PreviousVoucher != null)
                            {
                                if (PreviousVoucher.IsAllowReverseVoucher == false)
                                {
                                    throw new Exception("This voucher has already been reversed. You are not allowed to reverse it again.");
                                }
                                PreviousVoucher.IsAllowReverseVoucher = false;
                                PreviousVoucher.IsVoucherReversed = true;
                                _accountingDbContext.Entry(PreviousVoucher).Property(a => a.IsAllowReverseVoucher).IsModified = true;
                                _accountingDbContext.Entry(PreviousVoucher).Property(a => a.IsVoucherReversed).IsModified = true;
                                _accountingDbContext.SaveChanges();
                            }
                        }

                        var FinalData = new
                        {
                            txnClient.VoucherNumber,
                            txnClient.FiscalyearId
                        };
                        accountingTransaction.Commit();
                        return FinalData;
                    }
                    else
                    {
                        throw new Exception("Unable to Post Voucher Transaction.");
                    }
                }
                catch (Exception ex)
                {
                    accountingTransaction.Rollback();
                    throw new Exception(ex.Message);
                }
            }
        }

        private object GetVoucher()
        {
            var voucherList = (from voc in _accountingDbContext.Vouchers
                               where voc.IsActive == true
                               select new
                               {
                                   VoucherId = voc.VoucherId,
                                   VoucherName = voc.VoucherName,
                                   VoucherCode = voc.VoucherCode,
                                   IsActive = voc.IsActive,
                                   Description = voc.Description,
                                   CreatedOn = voc.CreatedOn,
                                   CreatedBy = voc.CreatedBy,
                                   ISCopyDescription = voc.ISCopyDescription,
                                   ShowPayeeName = voc.ShowPayeeName,
                                   ShowChequeNumber = voc.ShowChequeNumber
                               }).ToList<object>();
            return voucherList;
        }

        private object GetVoucherHead(int currentHospitalId)
        {
            var voucherHeadList = (from voucherHead in _accountingDbContext.VoucherHeads
                                   where voucherHead.IsActive == true && voucherHead.HospitalId == currentHospitalId
                                   select new
                                   {
                                       voucherHead.VoucherHeadId,
                                       voucherHead.HospitalId,
                                       voucherHead.VoucherHeadName,
                                       voucherHead.Description,
                                       voucherHead.CreatedOn,
                                       voucherHead.CreatedBy,
                                       voucherHead.IsActive,
                                       voucherHead.IsDefault
                                   }).ToList<object>();
            return voucherHeadList;
        }

        private object GetLedgerList(int currentHospitalId)
        {
            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
            //for this resolution we have temp solution
            //we have saved accPrimary id in parameter table so, we will return this hospital records here
            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
            //if user have only one hsopital permission then automatically activate this hospital
            var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
            var dToday = DateTime.Now.Date;
            var CurrentFYId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, dToday, HospId);
            List<SqlParameter> paramList = new List<SqlParameter>()
                                {
                                        new SqlParameter("@HospitalId", HospId),
                                        new SqlParameter("@FiscalYearIdForOpeningBal",AccountingTransferData.GetFiscalYearIdForOpeningBalance(_accountingDbContext, CurrentFYId, HospId)),
                                        new SqlParameter("@GetClosingBal", true)
                                };
            var spDataTable = DALFunctions.GetDataTableFromStoredProc(ENUM_StoredProcedures.LedgerList, paramList, _accountingDbContext);
            var resultStr = JsonConvert.SerializeObject(spDataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            var ledgerList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
            return ledgerList;
        }

        private object GetMappedLedgers(string ledgerType, int currentHospitalId)
        {
            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
            //for this resolution we have temp solution
            //we have saved accPrimary id in parameter table so, we will return this hospital records here
            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
            //if user have only one hsopital permission then automatically activate this hospital
            var HospId = 0;
            if (ledgerType == ENUM_ACC_LedgerType.InventorySubCategory)
            {
                HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
            }
            else
            {
                HospId = currentHospitalId;
            }
            var ledgerList = (from led in _accountingDbContext.Ledgers.AsEnumerable()
                              join ledgrp in _accountingDbContext.LedgerGroups.AsEnumerable() on led.LedgerGroupId equals ledgrp.LedgerGroupId
                              join ledMp in _accountingDbContext.LedgerMappings.AsEnumerable() on led.LedgerId equals ledMp.LedgerId
                              where led.IsActive == true && ledMp.LedgerType == ledgerType
                              && ledgrp.HospitalId == HospId && led.HospitalId == HospId
                              select new
                              {
                                  LedgerId = led.LedgerId,
                                  LedgerName = led.LedgerName,
                                  LedgerGroupId = led.LedgerGroupId,
                                  LedgerGroupName = ledgrp.LedgerGroupName,
                                  PrimaryGroup = ledgrp.PrimaryGroup,
                                  COA = ledgrp.COA,
                                  LedgerReferenceId = led.LedgerReferenceId,
                                  SectionId = led.SectionId,
                                  Name = led.Name,
                                  LedgerType = led.LedgerType,
                                  Code = led.Code
                              }).ToList();
            return ledgerList;
        }

        private object GetFiscalYear(int currentHospitalId)
        {
            var currentDate = DateTime.Now.Date;
            var fscList = (from fsc in _accountingDbContext.FiscalYears
                           where fsc.HospitalId == currentHospitalId && fsc.IsActive == true
                           select fsc).OrderByDescending(a => a.FiscalYearId).ToList();
            var todaydate = DateTime.Now;
            var currentFsId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, todaydate, currentHospitalId);
            var currentfs = fscList.Where(fs => fs.FiscalYearId == currentFsId).FirstOrDefault();
            var prevFs = (currentfs != null) ? AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, currentfs.StartDate.AddDays(-10), currentHospitalId) : 0;

            fscList.ForEach(fs =>
            {
                fs.HospitalId = currentHospitalId;
                fs.nStartDate = this.GetNepaliDate(fs.StartDate);
                fs.nEndDate = this.GetNepaliDate(fs.EndDate);
                fs.showreopen = ((fs.FiscalYearId == prevFs) && fs.IsClosed == true) ? true : false;
            });
            return fscList;
        }

        private object GetCostCenterItems(int currentHospitalId)
        {
            var cstCntList = (from cst in _accountingDbContext.CostCenterItems
                              where cst.IsActive == true && cst.HospitalId == currentHospitalId
                              select new
                              {
                                  cst.HospitalId,
                                  cst.CostCenterItemId,
                                  cst.CostCenterItemName
                              }).ToList();
            return cstCntList;
        }

        private object GetActiveFiscalYears(int currentHospitalId)
        {
            var res = (from yr in _accountingDbContext.FiscalYears
                       where yr.IsActive == true && yr.HospitalId == currentHospitalId
                       select yr).FirstOrDefault();
            return res;
        }

        private object GetTransactionList(int currentHospitalId, int transactionId)
        {
            var txnList = (from txn in _accountingDbContext.Transactions
                           where txn.HospitalId == currentHospitalId
                           join voucher in _accountingDbContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                          // join costCenter in _accountingDbContext.CostCenterItems on txn.CostCenterId equals costCenter.CostCenterItemId
                           join fiscal in _accountingDbContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                           where txn.TransactionId == transactionId && txn.IsActive == true && fiscal.HospitalId == currentHospitalId
                           select new
                           {
                               TransactionId = txn.TransactionId,
                               HospitalId = txn.HospitalId,
                               VoucherNumber = txn.VoucherNumber,
                               FiscalYear = fiscal.FiscalYearName,
                               CostCenterName = "",//costCenter.CostCenterItemName,
                               TransactionDate = txn.TransactionDate,
                               VoucherType = voucher.VoucherName,
                               Remarks = txn.Remarks,
                               TransactionItems = (from txnItm in _accountingDbContext.TransactionItems
                                                   where txnItm.HospitalId == currentHospitalId
                                                   join ledger in _accountingDbContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                   join ledgp in _accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                   where txnItm.TransactionId == txn.TransactionId
                                                   && ledgp.HospitalId == currentHospitalId
                                                   && ledger.HospitalId == currentHospitalId
                                                   select new
                                                   {
                                                       HospitalId = currentHospitalId,
                                                       LedgerGroupName = ledgp.LedgerGroupName,
                                                       LedgerName = ledger.LedgerName,
                                                       DrCr = txnItm.DrCr,
                                                       Amount = txnItm.Amount
                                                   }).OrderByDescending(a => a.DrCr == true).ToList()
                           }).FirstOrDefault();
            return txnList;
        }

        private object GetTransactionByVoucherNumber(int currentHospitalId, int? sectionId, string voucherNumber, int FiscalYearId)
        {
            //getting uniqueid and sectionid of transaction 

            try
            {
                var CostCenterNotApplicableCostCenterId = -1;
                var IsCustomVoucher = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "CustomSaleVoucher").Select(a => a.ParameterValue).FirstOrDefault();
                //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
                //for this resolution we have temp solution
                //we have saved accPrimary id in parameter table so, we will return this hospital records here
                //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
                //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
                //if user have only one hsopital permission then automatically activate this hospital
                var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);

                var sectionIdStr = (sectionId > 0) ? sectionId.ToString() : string.Empty;
                var txnids = (from txn in _accountingDbContext.Transactions
                              where txn.HospitalId == HospId &&
                              txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.SectionId.ToString().Contains(sectionIdStr)
                              select new
                              {
                                  txn.SectionId,
                              }).FirstOrDefault();

                if (txnids != null)
                {
                    //var ledgGrp = (from ledg in accountingDBContext.LedgerGroups.AsEnumerable()
                    //               where ledg.HospitalId == currentHospitalId
                    //               select ledg).AsEnumerable().ToList();

                    var txnList = (from txn in _accountingDbContext.Transactions
                                   where txn.HospitalId == currentHospitalId
                                   join voucher in _accountingDbContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                                   //join costCenters in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenters.CostCenterId into cc
                                   //from costCenter in cc.DefaultIfEmpty()
                                   join fiscal in _accountingDbContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                                   join emp in _accountingDbContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
                                   join emp2 in _accountingDbContext.Emmployees on txn.VerifiedBy equals emp2.EmployeeId into data
                                   from verifier in data.DefaultIfEmpty()
                                   where //head.HospitalId == currentHospitalId
                                   fiscal.HospitalId == currentHospitalId
                                   && txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
                                   select new
                                   {
                                       VoucherNumber = txn.VoucherNumber,
                                       FiscalYear = fiscal.FiscalYearName,
                                       FiscalYearId = txn.FiscalyearId,
                                       CostCenterName = "",// costCenter != null ? costCenter.CostCenterName : "--Not Applicable--",
                                       TransactionDate = txn.TransactionDate,
                                       VoucherType = voucher.VoucherName,
                                       Remarks = txn.Remarks,
                                       ChequeDate = txn.ChequeDate,
                                       SectionId = txn.SectionId,
                                       IsGroupTxn = txn.IsGroupTxn,
                                       IsEditable = txn.IsEditable,
                                       VoucherId = voucher.VoucherId,
                                       CostCenterId = "",//costCenter != null ? costCenter.CostCenterId : CostCenterNotApplicableCostCenterId,
                                       IsAllowReverseVoucher = txn.IsAllowReverseVoucher,
                                       TransactionId = txn.TransactionId,
                                       PayeeName = txn.PayeeName,
                                       ChequeNumber = txn.ChequeNumber,
                                       HospitalId = txn.HospitalId,
                                       Preparedby = emp.FullName,
                                       IsVerified = txn.IsVerified,
                                       IsVoucherReversed = txn.IsVoucherReversed,
                                       VerifiedBy = verifier == null ? null : verifier.FullName,
                                       TransactionItems = (from txnItm in _accountingDbContext.TransactionItems
                                                           where txnItm.HospitalId == currentHospitalId
                                                           join ledger in _accountingDbContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                           join ledgp in _accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                           join costCenters in _accountingDbContext.CostCenters on txnItm.CostCenterId equals costCenters.CostCenterId
                                                           where
                                                           ledger.HospitalId == currentHospitalId && ledgp.HospitalId == currentHospitalId &&
                                                           txn.VoucherNumber == voucherNumber && txnItm.TransactionId == txn.TransactionId
                                                           select new
                                                           {

                                                               LedgerId = ledger.LedgerId,
                                                               LedgerGroupName = ledgp.LedgerGroupName,
                                                               LedgerName = ledger.LedgerName,
                                                               Code = ledger.Code,
                                                               DrCr = txnItm.DrCr,
                                                               Amount = txnItm.Amount,
                                                               Description = txnItm.Description,
                                                               CostCenterId = costCenters.CostCenterId,
                                                               CostCenterName = costCenters.CostCenterName,
                                                               TransactionItemId = txnItm.TransactionItemId,
                                                               SubLedgers = (from subLedgerTxn in _accountingDbContext.SubLedgerRecord
                                                                             join subLedger in _accountingDbContext.SubLedger on subLedgerTxn.SubLedgerId equals subLedger.SubLedgerId
                                                                             where subLedgerTxn.TransactionItemId == txnItm.TransactionItemId
                                                                             select new
                                                                             {
                                                                                 LedgerId = subLedgerTxn.LedgerId,
                                                                                 SubLedgerName = subLedger.SubLedgerName,
                                                                                 SubLedgerId = subLedger.SubLedgerId,
                                                                                 DrAmount = subLedgerTxn.DrAmount,
                                                                                 CrAmount = subLedgerTxn.CrAmount,
                                                                                 VoucherNo = subLedgerTxn.VoucherNo,
                                                                                 VoucherType = subLedgerTxn.VoucherType,
                                                                                 Description = subLedgerTxn.Description,
                                                                                 SubLedgerCode = subLedger.SubLedgerCode,
                                                                                 SubLedgerTransactionId = subLedgerTxn.SubLedgerTransactionId,
                                                                                 TransactionItemId = subLedgerTxn.TransactionItemId
                                                                             }).ToList()
                                                           }).OrderBy(a=> a.TransactionItemId).ToList()
                                   }).FirstOrDefault();
                    var res = new
                    {
                        SectionId = txnids.SectionId,
                        txnList
                    };
                    return res;


                    //if (voucherNumber.Contains("SV") && txnids.SectionId == 2 && IsCustomVoucher == "true")
                    //{//Ajay 15Feb Here we only getting records for Billing Sales Voucher
                    // //getting single transaction with multiple vouchers
                    //    var alltransactions = (from txn in _accountingDbContext.Transactions
                    //                               //  where txn.TUId == txnids.TUId
                    //                           where txn.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
                    //                           select txn).ToList();
                    //    var alltransactionitems = (from txnitm in _accountingDbContext.TransactionItems.AsEnumerable()
                    //                               join txn in alltransactions on txnitm.TransactionId equals txn.TransactionId
                    //                               select txnitm).ToList();
                    //    //getting only single sales voucher records
                    //    var transactions = (from txn in alltransactions
                    //                        where txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
                    //                        select txn).ToList();
                    //    //getting transaction items for selected trasnaction
                    //    var transactionitems = (from ti in alltransactionitems
                    //                            join t in transactions on ti.TransactionId equals t.TransactionId
                    //                            select ti).ToList();
                    //    //getting vouchers
                    //    var vouchers = (from v in _accountingDbContext.Vouchers select v).ToList();
                    //    //getting voucher heads
                    //    var voucherheads = (from head in _accountingDbContext.VoucherHeads
                    //                        where head.HospitalId == currentHospitalId
                    //                        select head).ToList();
                    //    //fiscal year
                    //    var fiscalYear = (from fiscal in _accountingDbContext.FiscalYears
                    //                      where fiscal.HospitalId == currentHospitalId
                    //                      select fiscal).ToList();
                    //    //getting ledgers
                    //    var ledgers = (from l in _accountingDbContext.Ledgers
                    //                   where l.HospitalId == currentHospitalId
                    //                   select l).ToList();
                    //    //getting ledgergroups
                    //    var ledgergroup = (from lg in _accountingDbContext.LedgerGroups
                    //                       where lg.HospitalId == currentHospitalId
                    //                       select lg).ToList();
                    //    //getting trasnaction items details for supplier patient and for user
                    //    var transactionitemdetails = (from d in _accountingDbContext.TransactionItemDetails select d).ToList();
                    //    //getting patient
                    //    var patients = (from pat in _accountingDbContext.PatientModel.AsEnumerable()
                    //                    join txndetail in transactionitemdetails on pat.PatientId equals txndetail.ReferenceId
                    //                    join txnitm in alltransactionitems on txndetail.TransactionItemId equals txnitm.TransactionItemId
                    //                    where txndetail.ReferenceType == "Patient"
                    //                    select new
                    //                    {
                    //                        txndetail.ReferenceId,
                    //                        txnitm.LedgerId,
                    //                        txnitm.DrCr,
                    //                        Name = pat.FirstName + pat.LastName,
                    //                        txndetail.Amount
                    //                    }).ToList();
                    //    //getting suppliers
                    //    var supplier = (from sup in _accountingDbContext.PHRMSupplier select sup).ToList();
                    //    //getting user details
                    //    var userDetails = (from txn in alltransactions
                    //                       join txnitm in alltransactionitems on txn.TransactionId equals txnitm.TransactionId
                    //                       join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                    //                       join emp in _accountingDbContext.Emmployees.AsEnumerable() on txndetail.ReferenceId equals emp.EmployeeId
                    //                       where txndetail.ReferenceType == "User"
                    //                       select new
                    //                       {
                    //                           LedgerId = txnitm.LedgerId,
                    //                           DrCr = txnitm.DrCr,
                    //                           Name = emp.FirstName + " " + (string.IsNullOrEmpty(emp.LastName) ? "" : emp.LastName),
                    //                           txndetail.ReferenceId,
                    //                           txndetail.Amount,
                    //                           txn.VoucherNumber,
                    //                       }).ToList();
                    //    //getting amount of credit note voucher and payment voucher
                    //    var Amounts = (from txn in alltransactions
                    //                   join txnItm in alltransactionitems on txn.TransactionId equals txnItm.TransactionId
                    //                   join led in ledgers on txnItm.LedgerId equals led.LedgerId
                    //                   join ledG in ledgergroup on led.LedgerGroupId equals ledG.LedgerGroupId
                    //                   group new { txn, txnItm, led, ledG } by new { txn.VoucherId } into x
                    //                   select new
                    //                   {
                    //                       ReturnAmount = x.Where(a => a.txn.VoucherNumber.Contains("CN") && a.txnItm.DrCr == true /*&& a.txn.TransactionType.StartsWith("Cash")*/).Sum(a => a.txnItm.Amount),
                    //                       PaymentAmount = x.Where(a => a.txn.VoucherNumber.Contains("PMTV") && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount),
                    //                       ReturnDiscount = x.Where(a => a.led.Name == "EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount),
                    //                       ReceivablesAmount = (x.Where(a => a.ledG.Name == "ACA_SUNDRY_DEBTORS" && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount)
                    //                                    - x.Where(a => a.ledG.Name == "ACA_SUNDRY_DEBTORS" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount))

                    //                   }).ToList();
                    //    //getting user cash collection
                    //    var UserCashCollection = (from user in userDetails
                    //                              group new { user } by new { user.ReferenceId } into x
                    //                              select new
                    //                              {
                    //                                  UserName = x.Select(a => a.user.Name).FirstOrDefault(),
                    //                                  SalesDr = x.Where(a => a.user.DrCr == true && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                    //                                  SalesCr = x.Where(a => a.user.DrCr == false && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                    //                                  DepositDr = x.Where(a => a.user.DrCr == true && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                    //                                  DepositCr = x.Where(a => a.user.DrCr == false && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                    //                              }).ToList();
                    //    //getting record for selected sales voucher
                    //    var temp = (from txn in transactions
                    //                join voucher in vouchers on txn.VoucherId equals voucher.VoucherId
                    //                //join costCenters in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenters.CostCenterId into cc
                    //                //from costCenter in cc.DefaultIfEmpty()
                    //                join fiscal in fiscalYear on txn.FiscalyearId equals fiscal.FiscalYearId
                    //                join emp in _accountingDbContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
                    //                select new
                    //                {
                    //                    txn.VoucherNumber,
                    //                    fiscal.FiscalYearName,
                    //                   // CostCenterName = costCenter != null ? costCenter.CostCenterName : "Not Applicable",
                    //                    txn.TransactionDate,
                    //                    voucher.VoucherName,
                    //                    txn.Remarks,
                    //                    txn.SectionId,
                    //                    txn.IsEditable,
                    //                    txn.IsGroupTxn,
                    //                    Preparedby = emp.FullName,
                    //                }).ToList();
                    //    //formatting data for sales voucher
                    //    var txnList = (from temptxn in temp
                    //                   select new
                    //                   {
                    //                       VoucherNumber = temptxn.VoucherNumber,
                    //                       FiscalYear = temptxn.FiscalYearName,
                    //                       CostCenterName = "",//temptxn.CostCenterName,
                    //                       TransactionDate = temptxn.TransactionDate,
                    //                       VoucherType = temptxn.VoucherName,
                    //                       Remarks = temptxn.Remarks,
                    //                       SectionId = temptxn.SectionId,
                    //                       IsGroupTxn = temptxn.IsGroupTxn,
                    //                       IsEditable = temptxn.IsEditable,
                    //                       Preparedby = temptxn.Preparedby,
                    //                       TransactionItems = (from txnItm in alltransactionitems
                    //                                           join ledger in ledgers on txnItm.LedgerId equals ledger.LedgerId
                    //                                           join txn in alltransactions on txnItm.TransactionId equals txn.TransactionId
                    //                                           join ledgp in ledgergroup on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                    //                                           group new { ledger, ledgp, txnItm, txn } by new
                    //                                           {
                    //                                               ledgp.LedgerGroupName,
                    //                                               ledger.LedgerName,
                    //                                               ledger.Code,
                    //                                               txnItm.DrCr,
                    //                                               ledger.LedgerId,
                    //                                               txn.TransactionType,
                    //                                               txn.VoucherNumber
                    //                                           }
                    //                                           into x
                    //                                           select new
                    //                                           {
                    //                                               LedgerId = x.Key.LedgerId,
                    //                                               LedgerGroupName = x.Key.LedgerGroupName,
                    //                                               LedgerName = x.Key.LedgerName,
                    //                                               Code = x.Key.Code,
                    //                                               DrCr = x.Key.DrCr,
                    //                                               VoucherNumber = x.Key.VoucherNumber,
                    //                                               TransactionType = x.Select(a => a.txn.TransactionType).ToList(),
                    //                                               Name = x.Select(a => a.ledger.Name).FirstOrDefault(),
                    //                                               Amount = x.Select(a => a.txnItm.Amount).Sum(),
                    //                                               Remarks = x.Select(a => a.txn.Remarks),
                    //                                               Details = (from pat in patients
                    //                                                          where pat.LedgerId == x.Key.LedgerId && pat.DrCr == x.Key.DrCr
                    //                                                          group new { pat } by new
                    //                                                          {
                    //                                                              pat.ReferenceId,
                    //                                                              pat.DrCr
                    //                                                          } into x1
                    //                                                          select new
                    //                                                          {
                    //                                                              Name = x1.Select(a => a.pat.Name).FirstOrDefault(),
                    //                                                              Dr = x1.Where(a => a.pat.DrCr == true).Sum(a => a.pat.Amount),
                    //                                                              Cr = x1.Where(a => a.pat.DrCr == false).Sum(a => a.pat.Amount),
                    //                                                          }).ToList(),
                    //                                               SupplierDetails = (from txnitm in transactionitems
                    //                                                                  join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                    //                                                                  join sup in supplier on txndetail.ReferenceId equals sup.SupplierId
                    //                                                                  where txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Supplier"
                    //                                                                  group new { txnitm, sup, txndetail } by new
                    //                                                                  {
                    //                                                                      txndetail.ReferenceId,
                    //                                                                      txnitm.DrCr
                    //                                                                  } into x1
                    //                                                                  select new
                    //                                                                  {
                    //                                                                      Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                    //                                                                      Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                    //                                                                      Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                    //                                                                  }).ToList(),
                    //                                               //UserDetails = (from u in userDetails
                    //                                               //               where u.LedgerId == x.Key.LedgerId && u.DrCr == x.Key.DrCr
                    //                                               //               group new { u } by new
                    //                                               //               {
                    //                                               //                   u.ReferenceId,
                    //                                               //                   u.DrCr
                    //                                               //               } into x1
                    //                                               //               select new
                    //                                               //               {
                    //                                               //                   Name = x1.Select(a => a.u.Name).FirstOrDefault(),
                    //                                               //                   Dr = x1.Where(a => a.u.DrCr == true).Sum(a => a.u.Amount),
                    //                                               //                   Cr = x1.Where(a => a.u.DrCr == false).Sum(a => a.u.Amount),
                    //                                               //               }).ToList(),
                    //                                           }).OrderByDescending(a => a.DrCr).ToList()
                    //                   }).FirstOrDefault();
                    //    //merging supplier details and patient details, user details
                    //    txnList.TransactionItems.ForEach(data =>
                    //    {
                    //        //foreach (var det in data.UserDetails)
                    //        //{
                    //        //    data.Details.Add(det);
                    //        //}
                    //        foreach (var det in data.SupplierDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //    });
                    //    //combining final result with credit not amount, payment amount, UserCashCollection and sales voucher transaction details
                    //    var res = new
                    //    {
                    //        Amounts = new
                    //        {
                    //            ReturnAmount = Amounts.Sum(a => a.ReturnAmount),
                    //            PaymentAmount = Amounts.Sum(a => a.PaymentAmount),
                    //            RetrunDiscount = Amounts.Sum(a => a.ReturnDiscount),
                    //            ReceivableAmount = Amounts.Sum(a => a.ReceivablesAmount),
                    //        },
                    //        txnList,
                    //        SectionId = txnids.SectionId,
                    //        UserCashCollection
                    //    };
                    //    return res;
                    //}
                    //else if (voucherNumber.Contains("SV") && txnids.SectionId == 3 && IsCustomVoucher == "true")
                    //{
                    //    var txnlists = (from txn in _accountingDbContext.Transactions
                    //                    where txn.HospitalId == currentHospitalId
                    //                    join txnitm in _accountingDbContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
                    //                    join ledger in _accountingDbContext.Ledgers on txnitm.LedgerId equals ledger.LedgerId
                    //                    join ledgrp in _accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgrp.LedgerGroupId
                    //                    where txnitm.HospitalId == currentHospitalId
                    //                    && ledger.HospitalId == currentHospitalId
                    //                    && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
                    //                    // txn.TUId == txnids.TUId && 
                    //                    select new
                    //                    {
                    //                        txn.TransactionId,
                    //                        txnitm.TransactionItemId,
                    //                        txnitm.LedgerId,
                    //                        LedgerGroupName = (txn.TransactionType.Contains("Return") && ledgrp.LedgerGroupName == "Sales") ? ledgrp.LedgerGroupName + " (Return)" : ledgrp.LedgerGroupName,
                    //                        ledger.LedgerName,
                    //                        ledger.Code,
                    //                        txnitm.DrCr,
                    //                        Amount = txnitm.Amount,
                    //                        Remarks = txn.Remarks,
                    //                        txn.SectionId
                    //                    });
                    //    var txnDetails = (from txn in _accountingDbContext.Transactions
                    //                      where txn.HospitalId == currentHospitalId
                    //                      join txnitm in _accountingDbContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
                    //                      join txndet in _accountingDbContext.TransactionItemDetails on txnitm.TransactionItemId equals txndet.TransactionItemId
                    //                      where txnitm.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
                    //                      // txn.TUId == txnids.TUId &&
                    //                      select new
                    //                      {
                    //                          txndet.ReferenceId,
                    //                          txndet.ReferenceType,
                    //                          txnitm.DrCr,
                    //                          txndet.Amount,
                    //                          txnitm.LedgerId,
                    //                          txn.TUId
                    //                      });
                    //    var txnList = (from txn in _accountingDbContext.Transactions
                    //                   where txn.HospitalId == currentHospitalId
                    //                   join voucher in _accountingDbContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                    //                   //join costCenters in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenters.CostCenterId into cc
                    //                   //from costCenter in cc.DefaultIfEmpty()
                    //                   join fiscal in _accountingDbContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                    //                   join emp in _accountingDbContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
                    //                   where
                    //                   //head.HospitalId == currentHospitalId &&
                    //                   txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
                    //                   select new
                    //                   {
                    //                       // TransactionId = txn.TransactionId,
                    //                       VoucherNumber = txn.VoucherNumber,
                    //                       FiscalYear = fiscal.FiscalYearName,
                    //                       CostCenterName = "",//costCenter != null ? costCenter.CostCenterName : "Not Applicable",
                    //                       TransactionDate = txn.TransactionDate,
                    //                       VoucherType = voucher.VoucherName,
                    //                       Remarks = txn.Remarks,
                    //                       SectionId = txn.SectionId,
                    //                       IsGroupTxn = txn.IsGroupTxn,
                    //                       IsEditable = txn.IsEditable,
                    //                       Preparedby = emp.FullName,
                    //                       TransactionItems = (from itms in txnlists
                    //                                           group new { itms } by new
                    //                                           {
                    //                                               itms.LedgerGroupName,
                    //                                               itms.LedgerName,
                    //                                               itms.DrCr,
                    //                                               itms.LedgerId,
                    //                                               itms.Code
                    //                                           }
                    //                                           into x
                    //                                           select new
                    //                                           {
                    //                                               LedgerId = x.Key.LedgerId,
                    //                                               LedgerGroupName = x.Key.LedgerGroupName,
                    //                                               LedgerName = x.Key.LedgerName,
                    //                                               Code = x.Key.Code,
                    //                                               DrCr = x.Key.DrCr,
                    //                                               Amount = x.Select(a => a.itms.Amount).Sum(),
                    //                                               Remarks = x.Select(a => a.itms.Remarks),
                    //                                               Details = (from txn in txnDetails
                    //                                                          join pat in _accountingDbContext.PatientModel on txn.ReferenceId equals pat.PatientId
                    //                                                          where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Patient"
                    //                                                          group new { txn, pat } by new
                    //                                                          {
                    //                                                              txn.ReferenceId,
                    //                                                              txn.DrCr
                    //                                                          } into x1
                    //                                                          select new
                    //                                                          {
                    //                                                              Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
                    //                                                              Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                              Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                          }).ToList(),
                    //                                               SupplierDetails = (from txn in txnDetails
                    //                                                                  join sup in _accountingDbContext.PHRMSupplier on txn.ReferenceId equals sup.SupplierId
                    //                                                                  where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Supplier"
                    //                                                                  group new { txn, sup } by new
                    //                                                                  {
                    //                                                                      txn.ReferenceId,
                    //                                                                      txn.DrCr
                    //                                                                  } into x1
                    //                                                                  select new
                    //                                                                  {
                    //                                                                      Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                    //                                                                      Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                      Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                                  }).ToList(),
                    //                                               UserDetails = (from txn in txnDetails
                    //                                                              join emp in _accountingDbContext.Emmployees on txn.ReferenceId equals emp.EmployeeId
                    //                                                              where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "User" //&& txn.TUId == txnids.TUId
                    //                                                              group new { txn, emp } by new
                    //                                                              {
                    //                                                                  txn.ReferenceId,
                    //                                                                  txn.DrCr
                    //                                                              } into x1
                    //                                                              select new
                    //                                                              {
                    //                                                                  Name = x1.Select(a => a.emp.FirstName + " " + (string.IsNullOrEmpty(a.emp.LastName) ? "" : a.emp.LastName)).FirstOrDefault(),
                    //                                                                  Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                  Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                              }).ToList(),
                    //                                               VendorDetails = (from txn in txnDetails
                    //                                                                join ven in _accountingDbContext.InvVendors on txn.ReferenceId equals ven.VendorId
                    //                                                                where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Vendor"
                    //                                                                group new { txn, ven } by new
                    //                                                                {
                    //                                                                    txn.ReferenceId,
                    //                                                                    txn.DrCr
                    //                                                                } into x1
                    //                                                                select new
                    //                                                                {
                    //                                                                    Name = x1.Select(a => a.ven.VendorName).FirstOrDefault(),
                    //                                                                    Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                    Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                                }).ToList(),
                    //                                           }).OrderByDescending(a => a.DrCr).ToList()
                    //                   }).FirstOrDefault();
                    //    txnList.TransactionItems.ForEach(data =>
                    //    {
                    //        foreach (var det in data.UserDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //        foreach (var det in data.SupplierDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //        foreach (var det in data.VendorDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //    });
                    //    var res = new
                    //    {
                    //        SectionId = txnids.SectionId,
                    //        txnList
                    //    };
                    //    return res;

                    //}
                    //else if (txnids.SectionId == 4) // manual voucher entry
                    //{
                    //    //var ledgGrp = (from ledg in accountingDBContext.LedgerGroups.AsEnumerable()
                    //    //               where ledg.HospitalId == currentHospitalId
                    //    //               select ledg).AsEnumerable().ToList();

                    //    var txnList = (from txn in _accountingDbContext.Transactions
                    //                   where txn.HospitalId == currentHospitalId
                    //                   join voucher in _accountingDbContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                    //                   //join costCenters in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenters.CostCenterId into cc
                    //                   //from costCenter in cc.DefaultIfEmpty()
                    //                   join fiscal in _accountingDbContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                    //                   join emp in _accountingDbContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
                    //                   where //head.HospitalId == currentHospitalId
                    //                   fiscal.HospitalId == currentHospitalId
                    //                   && txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
                    //                   select new
                    //                   {
                    //                       VoucherNumber = txn.VoucherNumber,
                    //                       FiscalYear = fiscal.FiscalYearName,
                    //                       CostCenterName ="",// costCenter != null ? costCenter.CostCenterName : "--Not Applicable--",
                    //                       TransactionDate = txn.TransactionDate,
                    //                       VoucherType = voucher.VoucherName,
                    //                       Remarks = txn.Remarks,
                    //                       ChequeDate = txn.ChequeDate,
                    //                       SectionId = txn.SectionId,
                    //                       IsGroupTxn = txn.IsGroupTxn,
                    //                       IsEditable = txn.IsEditable,
                    //                       VoucherId = voucher.VoucherId,
                    //                       CostCenterId = "",//costCenter != null ? costCenter.CostCenterId : CostCenterNotApplicableCostCenterId,
                    //                       IsAllowReverseVoucher = txn.IsAllowReverseVoucher,
                    //                       TransactionId = txn.TransactionId,
                    //                       PayeeName = txn.PayeeName,
                    //                       ChequeNumber = txn.ChequeNumber,
                    //                       HospitalId = txn.HospitalId,
                    //                       Preparedby = emp.FullName,
                    //                       IsVerified = txn.IsVerified,
                    //                       TransactionItems = (from txnItm in _accountingDbContext.TransactionItems
                    //                                           where txnItm.HospitalId == currentHospitalId
                    //                                           join ledger in _accountingDbContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                    //                                           join ledgp in _accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                    //                                           join costCenters in _accountingDbContext.CostCenters on txnItm.CostCenterId equals costCenters.CostCenterId
                    //                                           where
                    //                                           ledger.HospitalId == currentHospitalId && ledgp.HospitalId == currentHospitalId &&
                    //                                           txn.VoucherNumber == voucherNumber && txnItm.TransactionId == txn.TransactionId
                    //                                           select new
                    //                                           {

                    //                                               LedgerId = ledger.LedgerId,
                    //                                               LedgerGroupName = ledgp.LedgerGroupName,
                    //                                               LedgerName = ledger.LedgerName,
                    //                                               Code = ledger.Code,
                    //                                               DrCr = txnItm.DrCr,
                    //                                               Amount = txnItm.Amount,
                    //                                               Description = txnItm.Description,
                    //                                               CostCenterId = costCenters.CostCenterId,
                    //                                               CostCenterName = costCenters.CostCenterName,
                    //                                               TransactionItemId = txnItm.TransactionItemId,
                    //                                               SubLedgers = (from subLedgerTxn in _accountingDbContext.SubLedgerRecord
                    //                                                             join subLedger in _accountingDbContext.SubLedger on subLedgerTxn.SubLedgerId equals subLedger.SubLedgerId
                    //                                                             where subLedgerTxn.TransactionItemId == txnItm.TransactionItemId
                    //                                                             select new
                    //                                                             {
                    //                                                                 LedgerId = subLedgerTxn.LedgerId,
                    //                                                                 SubLedgerName = subLedger.SubLedgerName,
                    //                                                                 SubLedgerId = subLedger.SubLedgerId,
                    //                                                                 DrAmount = subLedgerTxn.DrAmount,
                    //                                                                 CrAmount = subLedgerTxn.CrAmount,
                    //                                                                 VoucherNo = subLedgerTxn.VoucherNo,
                    //                                                                 VoucherType = subLedgerTxn.VoucherType,
                    //                                                                 Description = subLedgerTxn.Description,
                    //                                                                 SubLedgerCode = subLedger.SubLedgerCode,
                    //                                                                 SubLedgerTransactionId = subLedgerTxn.SubLedgerTransactionId,
                    //                                                                 TransactionItemId = subLedgerTxn.TransactionItemId
                    //                                                             }).ToList()
                    //                                           }).ToList()
                    //                   }).FirstOrDefault();
                    //    var res = new
                    //    {
                    //        SectionId = txnids.SectionId,
                    //        txnList
                    //    };
                    //    return res;
                    //}
                    //else
                    //{

                    //    var txnDetails = (from txn in _accountingDbContext.Transactions
                    //                      where txn.HospitalId == HospId
                    //                      join txnitm in _accountingDbContext.TransactionItems on txn.TransactionId equals txnitm.TransactionId
                    //                      join txndet in _accountingDbContext.TransactionItemDetails on txnitm.TransactionItemId equals txndet.TransactionItemId
                    //                      where
                    //                      txnitm.HospitalId == HospId &&
                    //                      txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
                    //                      select new
                    //                      {
                    //                          txndet.ReferenceId,
                    //                          txndet.ReferenceType,
                    //                          txnitm.DrCr,
                    //                          txndet.Amount,
                    //                          txnitm.LedgerId,
                    //                          txn.TUId,
                    //                          txn.SectionId

                    //                      });
                    //    var txnList = (from txn in _accountingDbContext.Transactions
                    //                   where txn.HospitalId == HospId
                    //                   join voucher in _accountingDbContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                    //                  // join costCenters in _accountingDbContext.CostCenters on txn.CostCenterId equals costCenters.CostCenterId into cc
                    //                   //from costCenter in cc.DefaultIfEmpty()
                    //                   join fiscal in _accountingDbContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                    //                   join emp in _accountingDbContext.Emmployees on txn.CreatedBy equals emp.EmployeeId
                    //                   where
                    //                   //head.HospitalId == HospId &&
                    //                   fiscal.HospitalId == HospId &&
                    //                   txn.VoucherNumber == voucherNumber && txn.IsActive == true && txn.FiscalyearId == FiscalYearId
                    //                   select new
                    //                   {
                    //                       // TransactionId = txn.TransactionId,
                    //                       VoucherNumber = txn.VoucherNumber,
                    //                       FiscalYear = fiscal.FiscalYearName,
                    //                       CostCenterName = "",//,costCenter != null ? costCenter.CostCenterName : "Not Applicable",
                    //                       TransactionDate = txn.TransactionDate,
                    //                       VoucherType = voucher.VoucherName,
                    //                       Remarks = txn.Remarks,
                    //                       Sectionid = txn.SectionId,
                    //                       IsGroupTxn = txn.IsGroupTxn,
                    //                       IsEditable = txn.IsEditable,
                    //                       VoucherId = voucher.VoucherId,
                    //                       CostCenterId = "",//costCenter != null ? costCenter.CostCenterId : CostCenterNotApplicableCostCenterId,
                    //                       IsAllowReverseVoucher = txn.IsAllowReverseVoucher,
                    //                       TransactionId = txn.TransactionId,
                    //                       HospitalId = txn.HospitalId,
                    //                       Preparedby = emp.FullName,
                    //                       PayeeName = txn.PayeeName,
                    //                       ChequeNumber = txn.ChequeNumber,
                    //                       TransactionItems = (from txnItm in _accountingDbContext.TransactionItems
                    //                                           where txnItm.HospitalId == HospId
                    //                                           join ledger in _accountingDbContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                    //                                           join txnp in _accountingDbContext.Transactions on txnItm.TransactionId equals txnp.TransactionId
                    //                                           join ledgp in _accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                    //                                           where ledger.HospitalId == HospId
                    //                                           && ledgp.HospitalId == HospId
                    //                                           && txnp.VoucherNumber == voucherNumber
                    //                                           && txnp.FiscalyearId == FiscalYearId
                    //                                           group new { ledger, ledgp, txnItm, txnp } by new
                    //                                           {
                    //                                               ledgp.LedgerGroupName,
                    //                                               ledger.LedgerName,
                    //                                               txnItm.DrCr,
                    //                                               ledger.LedgerId,
                    //                                               ledger.Code
                    //                                           }
                    //                                           into x
                    //                                           select new
                    //                                           {
                    //                                               LedgerId = x.Key.LedgerId,
                    //                                               LedgerGroupName = x.Key.LedgerGroupName,
                    //                                               LedgerName = x.Key.LedgerName,
                    //                                               Code = x.Key.Code,
                    //                                               DrCr = x.Key.DrCr,
                    //                                               Amount = x.Select(a => a.txnItm.Amount).Sum(),
                    //                                               Remarks = x.Select(a => a.txnItm.Description),
                    //                                               Details = (from txn in txnDetails
                    //                                                          join pat in _accountingDbContext.PatientModel on txn.ReferenceId equals pat.PatientId
                    //                                                          where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Patient"
                    //                                                          group new { txn, pat } by new
                    //                                                          {
                    //                                                              txn.ReferenceId,
                    //                                                              txn.DrCr
                    //                                                          } into x1
                    //                                                          select new
                    //                                                          {
                    //                                                              Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
                    //                                                              Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                              Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                          }).ToList(),
                    //                                               SupplierDetails = (from txn in txnDetails
                    //                                                                  join sup in _accountingDbContext.PHRMSupplier on txn.ReferenceId equals sup.SupplierId
                    //                                                                  where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Supplier"
                    //                                                                  group new { txn, sup } by new
                    //                                                                  {
                    //                                                                      txn.ReferenceId,
                    //                                                                      txn.DrCr
                    //                                                                  } into x1
                    //                                                                  select new
                    //                                                                  {
                    //                                                                      Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                    //                                                                      Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                      Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                                  }).ToList(),
                    //                                               UserDetails = (from txn in txnDetails
                    //                                                              join emp in _accountingDbContext.Emmployees on txn.ReferenceId equals emp.EmployeeId
                    //                                                              where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "User" //&& txn.TUId == txnids.TUId
                    //                                                              group new { txn, emp } by new
                    //                                                              {
                    //                                                                  txn.ReferenceId,
                    //                                                                  txn.DrCr
                    //                                                              } into x1
                    //                                                              select new
                    //                                                              {
                    //                                                                  Name = x1.Select(a => a.emp.FirstName + " " + (string.IsNullOrEmpty(a.emp.LastName) ? "" : a.emp.LastName)).FirstOrDefault(),
                    //                                                                  Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                  Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                              }).ToList(),
                    //                                               VendorDetails = (from txn in txnDetails
                    //                                                                join ven in _accountingDbContext.InvVendors on txn.ReferenceId equals ven.VendorId
                    //                                                                where txn.LedgerId == x.Key.LedgerId && txn.DrCr == x.Key.DrCr && txn.ReferenceType == "Vendor"
                    //                                                                group new { txn, ven } by new
                    //                                                                {
                    //                                                                    txn.ReferenceId,
                    //                                                                    txn.DrCr
                    //                                                                } into x1
                    //                                                                select new
                    //                                                                {
                    //                                                                    Name = x1.Select(a => a.ven.VendorName).FirstOrDefault(),
                    //                                                                    Dr = x1.Where(a => a.txn.DrCr == true).Sum(a => a.txn.Amount),
                    //                                                                    Cr = x1.Where(a => a.txn.DrCr == false).Sum(a => a.txn.Amount),
                    //                                                                }).ToList(),
                    //                                           }).OrderByDescending(a => a.DrCr).ToList()
                    //                   }).FirstOrDefault();
                    //    txnList.TransactionItems.ForEach(data =>
                    //    {
                    //        foreach (var det in data.UserDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //        foreach (var det in data.SupplierDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //        foreach (var det in data.VendorDetails)
                    //        {
                    //            data.Details.Add(det);
                    //        }
                    //    });
                    //    var res = new
                    //    {
                    //        SectionId = txnids.SectionId,
                    //        txnList
                    //    };
                    //    return res;
                    //}
                }
                else
                {
                    throw new Exception("Invalid voucher number");
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message + " exception details:" + ex.ToString());
            }
        }

        private object CheckRefrenceTransactionId(int currentHospitalId, string voucherNumber, int? voucherId)
        {
            var txn = _accountingDbContext.Transactions.Where(a => a.HospitalId == currentHospitalId && a.VoucherNumber == voucherNumber && a.VoucherId == voucherId && a.IsActive == true).FirstOrDefault();
            if (txn != null)
            {
                return txn;
            }
            else
            {
                throw new Exception("Transaction Not Found");
            }
        }

        private object GetInventoryDataForPostToAccounting(RbacUser currentUser, int currentHospitalId, DateTime SelectedDate, int FiscalYearId)
        {
            AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
            List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(1, SelectedDate, FiscalYearId, currentHospitalId);
            var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
            if (unavailableLedger.Count > 0)
            {
                var dataToReturn = new
                {
                    data = 0,
                    unavailableLedger = unavailableLedger
                };
                DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
                return dataToReturn;
            }
            else
            {
                return new
                {
                    data = result,
                    unavailableLedger = 0
                };
            }
        }

        private object GetLedgerMapping(int currentHospitalId)
        {
            var res = new
            {
                supplier = (from m in _accountingDbContext.LedgerMappings
                            where m.HospitalId == currentHospitalId && m.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier
                            select m).ToList(),
                vendor = (from m in _accountingDbContext.LedgerMappings
                          where m.HospitalId == currentHospitalId && m.LedgerType == ENUM_ACC_LedgerType.InventoryVendor
                          select m).ToList(),
                consultant = (from m in _accountingDbContext.LedgerMappings
                              where m.HospitalId == currentHospitalId && m.LedgerType == ENUM_ACC_LedgerType.Consultant
                              select m).ToList(),
                creditorganization = (from m in _accountingDbContext.LedgerMappings
                                      where m.HospitalId == currentHospitalId && m.LedgerType == ENUM_ACC_LedgerType.CreditOrganization
                                      select m).ToList(),
                subcategory = (from m in _accountingDbContext.LedgerMappings
                               where m.HospitalId == currentHospitalId && m.LedgerType == ENUM_ACC_LedgerType.InventorySubCategory
                               select m).ToList(),
            };
            return res;
        }

        private object GetConsultantLedgers(int currentHospitalId)
        {
            var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                              where lm.HospitalId == currentHospitalId
                              select new
                              {
                                  LedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.Consultant) ? lm.LedgerId : 0,
                                  LedgerMappingId = lm.LedgerMappingId,
                                  LedgerType = (lm.LedgerType == ENUM_ACC_LedgerType.Consultant) ? lm.LedgerType : "",
                                  ReferenceId = (lm.LedgerType == ENUM_ACC_LedgerType.Consultant) ? lm.ReferenceId : 0,
                                  SubLedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.Consultant) ? lm.SubLedgerId : 0

                              }).AsQueryable();
            var NewEmpledgerList = (from empl in _accountingDbContext.Emmployees
                                    join ledMp in ledMapLsit on empl.EmployeeId equals ledMp.ReferenceId into lm
                                    from ledM in lm.DefaultIfEmpty()
                                    join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                    from led in ld.DefaultIfEmpty()
                                    join department in _accountingDbContext.Departments on empl.DepartmentId equals department.DepartmentId into dept
                                    from dep in dept.DefaultIfEmpty()
                                    join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                    from subLed in sl.DefaultIfEmpty()
                                    select new
                                    {
                                        LedgerId = led != null ? led.LedgerId : 0,
                                        LedgerGroupId = led != null ? led.LedgerGroupId : 0,
                                        LedgerName = led != null ? led.LedgerName : "",
                                        LedgerReferenceId = led != null ? led.LedgerReferenceId : null,
                                        Description = led != null ? led.Description : "",
                                        IsActive = led != null ? led.IsActive : false,
                                        IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                        OpeningBalance = led != null ? led.OpeningBalance : 0,
                                        DrCr = led != null ? led.DrCr : true,
                                        Name = led != null ? led.Name : "",
                                        LedgerType = ledM != null ? ledM.LedgerType : "",
                                        Code = led != null ? led.Code : "0",
                                        PANNo = led != null ? led.PANNo : "",
                                        Address = led != null ? led.Address : "",
                                        MobileNo = led != null ? led.MobileNo : "",
                                        CreditPeriod = led != null ? led.CreditPeriod : null,
                                        TDSPercent = led != null ? led.TDSPercent : 0,
                                        LandlineNo = led != null ? led.LandlineNo : "",
                                        EmployeeName = empl.FullName,
                                        EmployeeId = empl.EmployeeId,
                                        DepartmentName = dep != null ? dep.DepartmentName: "",
                                        IsSelected = false,
                                        IsMapped = ((led != null ? led.LedgerId : -1) > 0) ? true : false,
                                        SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                        SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                    }).OrderByDescending(l => l.LedgerId).ToList();
            return NewEmpledgerList;
        }

        private object GetPharmacySupplierLedgers(int currentHospitalId)
        {
            var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                              where lm.HospitalId == currentHospitalId
                              select new
                              {
                                  LedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier) ? lm.LedgerId : 0,
                                  LedgerMappingId = lm.LedgerMappingId,
                                  LedgerType = (lm.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier) ? lm.LedgerType : "",
                                  ReferenceId = (lm.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier) ? lm.ReferenceId : 0,
                                  SubLedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier) ? lm.SubLedgerId : 0

                              }).AsQueryable();
            var NewEmpledgerList = (from phrmsup in _accountingDbContext.PHRMSupplier
                                    join ledMp in ledMapLsit on phrmsup.SupplierId equals ledMp.ReferenceId into lm
                                    from ledM in lm.DefaultIfEmpty()
                                    join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                    from led in ld.DefaultIfEmpty()
                                    join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                    from subLed in sl.DefaultIfEmpty()
                                    select new
                                    {
                                        LedgerId = led != null ? led.LedgerId : 0,
                                        LedgerGroupId = led != null ? led.LedgerGroupId : 0,
                                        LedgerName = led != null ? led.LedgerName : "",
                                        LedgerReferenceId = led != null ? led.LedgerReferenceId : null,
                                        Description = led != null ? led.Description : "",
                                        IsActive = led != null ? led.IsActive : false,
                                        IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                        OpeningBalance = led != null ? led.OpeningBalance : 0,
                                        DrCr = led != null ? led.DrCr : true,
                                        Name = led != null ? led.Name : "",
                                        LedgerType = ledM != null ? ledM.LedgerType : "",
                                        Code = led != null ? led.Code : "0",
                                        PANNo = led != null ? led.PANNo : "",
                                        Address = led != null ? led.Address : "",
                                        MobileNo = led != null ? led.MobileNo : "",
                                        CreditPeriod = led != null ? led.CreditPeriod : null,
                                        TDSPercent = led != null ? led.TDSPercent: 0,
                                        LandlineNo = led != null ? led.LandlineNo : "",
                                        SupplierName = phrmsup.SupplierName,
                                        SupplierId = phrmsup.SupplierId,
                                        IsSelected = false,
                                        IsMapped = ((led != null ? led.LedgerId : -1) > 0) ? true : false,
                                        SectionId = led != null ? led.SectionId : 4,
                                        SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                        SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                    }).OrderByDescending(l => l.LedgerId).ToList();
            return NewEmpledgerList;
        }

        private object GetInventoryVendorLedgers(int currentHospitalId)
        {
            var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                              where lm.HospitalId == currentHospitalId
                              select new
                              {
                                  LedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryVendor) ? lm.LedgerId : 0,
                                  LedgerMappingId = lm.LedgerMappingId,
                                  LedgerType = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryVendor) ? lm.LedgerType : "",
                                  ReferenceId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryVendor) ? lm.ReferenceId : 0,
                                   SubLedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryVendor) ? lm.SubLedgerId : 0

                              }).AsQueryable();
            var NewEmpledgerList = (from invVendor in _accountingDbContext.InvVendors
                                    join ledMp in ledMapLsit on invVendor.VendorId equals ledMp.ReferenceId into lm
                                    from ledM in lm.DefaultIfEmpty()
                                    join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                    from led in ld.DefaultIfEmpty()
                                    join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                    from subLed in sl.DefaultIfEmpty()
                                    select new
                                    {
                                        LedgerId = led != null ? led.LedgerId : 0,
                                        LedgerGroupId = led != null ? led.LedgerGroupId : 0,
                                        LedgerName = led != null ? led.LedgerName : "",
                                        LedgerReferenceId = led != null ? led.LedgerReferenceId : null,
                                        Description =led != null ? led.Description: "",
                                        IsActive = led != null ? led.IsActive :false,
                                        IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                        OpeningBalance = led != null ? led.OpeningBalance: 0,
                                        DrCr = led != null ? led.DrCr : false,
                                        Name = led != null ? led.Name : "",
                                        LedgerType = ledM != null ? ledM.LedgerType : "",
                                        Code = led != null ? led.Code : "",
                                        PANNo = led != null ? led.PANNo : "",
                                        Address = led != null ? led.Address : "",
                                        MobileNo = led != null ? led.MobileNo : "",
                                        CreditPeriod = led != null ? led.CreditPeriod : null,
                                        TDSPercent = led != null ? led.TDSPercent : 0,
                                        LandlineNo = led != null ? led.LandlineNo : "",
                                        VendorName = invVendor.VendorName,
                                        VendorId = invVendor.VendorId,
                                        IsSelected = false,
                                        IsMapped = ((led != null ? led.LedgerId : -1) > 0) ? true : false,
                                        SectionId = led != null ? led.SectionId : 0,
                                        SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                        SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                    }).OrderByDescending(l => l.LedgerId).ToList();
            return NewEmpledgerList;
        }

        private object GetInventorySubCategoryLedgers(int currentHospitalId)
        {
            var CostCenterNotApplicableCostCenterId = -1;
            var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                              where lm.HospitalId == currentHospitalId
                              select new
                              {
                                  LedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryConsumption) ? lm.LedgerId : 0,
                                  LedgerMappingId = lm.LedgerMappingId,
                                  LedgerType = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryConsumption) ? lm.LedgerType : "",
                                  ReferenceId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryConsumption) ? lm.ReferenceId : 0,
                                  SubLedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.InventoryConsumption) ? lm.SubLedgerId : 0,
                                  CostCenterId = lm.CostCenterId

                              }).AsQueryable();
            var NewEmpledgerList = (from invSubstore in _accountingDbContext.PHRMStore 
                                    join ledMp in ledMapLsit on invSubstore.StoreId equals ledMp.ReferenceId into lm
                                    from ledM in lm.DefaultIfEmpty()
                                    join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                    from led in ld.DefaultIfEmpty()
                                    join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                    from subLed in sl.DefaultIfEmpty()
                                    where invSubstore.Category == "substore"
                                    select new
                                    {
                                        LedgerId = led != null ? led.LedgerId : 0,
                                        LedgerGroupId = led != null ? led.LedgerGroupId : 0,
                                        LedgerName = led != null ? led.LedgerName : "",
                                        LedgerReferenceId = led != null ? led.LedgerReferenceId : null,
                                        Description = led != null ? led.Description : "",
                                        IsActive = led != null ? led.IsActive : false,
                                        IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                        OpeningBalance = led != null ? led.OpeningBalance : 0,
                                        DrCr = led != null ? led.DrCr : false,
                                        Name = led != null ? led.Name : "",
                                        LedgerType = ledM != null ? ledM.LedgerType : "",
                                        Code = led != null ? led.Code : "",
                                        PANNo = led != null ? led.PANNo : "",
                                        Address = led != null ? led.Address : "",
                                        MobileNo = led != null ? led.MobileNo : "",
                                        CreditPeriod = led != null ? led.CreditPeriod : null,
                                        TDSPercent = led != null ? led.TDSPercent : 0,
                                        LandlineNo = led != null ? led.LandlineNo : "",
                                        StoreName = invSubstore.Name,
                                        StoreId = invSubstore.StoreId,
                                        IsSelected = false,
                                        IsMapped = ((led != null ? led.LedgerId : -1) > 0) ? true : false,
                                        CostCenterId = ledM != null ? ledM.CostCenterId : CostCenterNotApplicableCostCenterId,
                                        SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                        SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                    }).OrderByDescending(l => l.LedgerId).ToList();
            return NewEmpledgerList;
        }

        private object GetCreditOrganizationLedgers(int currentHospitalId)
        {
            var ledMapLsit = (from lm in _accountingDbContext.LedgerMappings
                              where lm.HospitalId == currentHospitalId
                              select new
                              {
                                  LedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.CreditOrganization) ? lm.LedgerId : 0,
                                  LedgerMappingId = lm.LedgerMappingId,
                                  LedgerType = (lm.LedgerType == ENUM_ACC_LedgerType.CreditOrganization) ? lm.LedgerType : "",
                                  ReferenceId = (lm.LedgerType == ENUM_ACC_LedgerType.CreditOrganization) ? lm.ReferenceId : 0,
                                  SubLedgerId = (lm.LedgerType == ENUM_ACC_LedgerType.CreditOrganization) ? lm.SubLedgerId : 0

                              }).AsQueryable();
            var NewEmpledgerList = (from crOrg in _accountingDbContext.BillCreditOrganizations
                                    join ledMp in ledMapLsit on crOrg.OrganizationId equals ledMp.ReferenceId into lm
                                    from ledM in lm.DefaultIfEmpty()
                                    join ledger in _accountingDbContext.Ledgers on ledM.LedgerId equals ledger.LedgerId into ld
                                    from led in ld.DefaultIfEmpty()
                                    join subLedger in _accountingDbContext.SubLedger on ledM.SubLedgerId equals subLedger.SubLedgerId into sl
                                    from subLed in sl.DefaultIfEmpty()
                                    select new
                                    {
                                        LedgerId = led != null ? led.LedgerId : 0,
                                        LedgerGroupId = led != null ? led.LedgerGroupId : 0,
                                        LedgerName = led != null ? led.LedgerName:"",
                                        LedgerReferenceId = led != null ? led.LedgerReferenceId : null,
                                        Description = led != null ? led.Description : "",
                                        IsActive = led != null ? led.IsActive : false,
                                        IsCostCenterApplicable = led != null ? led.IsCostCenterApplicable : false,
                                        OpeningBalance = led != null ? led.OpeningBalance : 0,
                                        DrCr = led != null ? led.DrCr : false,
                                        Name = led != null ? led.Name : "",
                                        LedgerType = ledM != null ? ledM.LedgerType : "",
                                        Code = led != null ? led.Code : "",
                                        PANNo = led != null ? led.PANNo : "",
                                        Address = led != null ? led.Address : "",
                                        MobileNo = led != null ? led.MobileNo : "",
                                        CreditPeriod = led != null ? led.CreditPeriod : null,
                                        TDSPercent = led != null ? led.TDSPercent : 0,
                                        LandlineNo = led != null ? led.LandlineNo : "",
                                        OrganizationName = crOrg.OrganizationName,
                                        OrganizationId = crOrg.OrganizationId,
                                        IsSelected = false,
                                        IsMapped = ((led != null ? led.LedgerId : -1) > 0) ? true : false,
                                        SubLedgerId = subLed != null ? subLed.SubLedgerId : 0,
                                        SubLedgerName = subLed != null ? subLed.SubLedgerName : ""
                                    }).OrderByDescending(l => l.LedgerId).ToList();
            return NewEmpledgerList;
        }

       

        private object GetBillingDataForPostToAccounting(RbacUser currentUser, int currentHospitalId, DateTime SelectedDate, int FiscalYearId)
        {
            AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
            List<TransactionModel> res = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(2, SelectedDate, FiscalYearId, currentHospitalId);

            var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
            if (unavailableLedger.Count > 0)
            {
                var dataToReturn = new
                {
                    data = 0,
                    unavailableLedger = unavailableLedger
                };
                DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
                return dataToReturn;
            }
            else
            {
                return new
                {
                    data = res,
                    unavailableLedger = 0
                };
            }
        }

        private object GetPharmacyDataForPostToAccounting(RbacUser currentUser, int currentHospitalId, DateTime SelectedDate, int FiscalYearId)
        {
            AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
            List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(3, SelectedDate, FiscalYearId, currentHospitalId);
            var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
            if (unavailableLedger.Count > 0)
            {
                var dataToReturn = new
                {
                    data = 0,
                    unavailableLedger = unavailableLedger
                };
                DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
                return dataToReturn;
            }
            else
            {
                return new
                {
                    data = result,
                    unavailableLedger = 0
                };
            }
        }

        private object GetIncentiveDataForPostToAccounting(RbacUser currentUser, int currentHospitalId, DateTime SelectedDate, int FiscalYearId)
        {
            AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
            List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(5, SelectedDate, FiscalYearId, currentHospitalId);
            var unavailableLedger = DanpheEMR.AccTransfer.AccountingTransferData.GetUnavailableLedgerList();
            if (unavailableLedger.Count > 0)
            {
                var dataToReturn = new
                {
                    data = 0,
                    unavailableLedger = unavailableLedger
                };
                DanpheEMR.AccTransfer.AccountingTransferData.ClearUnavailableLedgerList();
                return dataToReturn;
            }
            else
            {
                return new
                {
                    data = result,
                    unavailableLedger = 0
                };
            }
        }

        private object GetVoucherDetailForEditVoucher(string voucherNumber, int FiscalYearId, int currentHospitalId)
        {
            //getting uniqueid and sectionid of transaction 

            if (voucherNumber != null && FiscalYearId != null)
            {

                var transactionData = (from txn in _accountingDbContext.Transactions
                                       where txn.HospitalId == currentHospitalId && txn.VoucherNumber == voucherNumber && txn.FiscalyearId == FiscalYearId
                                       select new
                                       {
                                           TransactionId = txn.TransactionId
                                            ,
                                           VoucherId = txn.VoucherId
                                            ,
                                           FiscalYearId = txn.FiscalyearId
                                            ,
                                           TransactionDate = txn.TransactionDate
                                            ,
                                           CreatedBy = txn.CreatedBy
                                            ,
                                           CreatedOn = txn.CreatedOn
                                            ,
                                           IsActive = txn.IsActive
                                            ,
                                           IsBackDateEntry = txn.IsBackDateEntry
                                            ,
                                           Remarks = txn.Remarks
                                            ,
                                           SectionId = txn.SectionId
                                            ,
                                           VoucherNumber = txn.VoucherNumber
                                            ,
                                           CostCenterId = 0//txn.CostCenterId
                                           ,
                                           TotalAmount = 0
                                            ,
                                           TransactionItems = (from txnItem in _accountingDbContext.TransactionItems
                                                               join costCenter in _accountingDbContext.CostCenters on txnItem.CostCenterId equals costCenter.CostCenterId
                                                               where txnItem.TransactionId == txn.TransactionId
                                                               select new
                                                               {
                                                                   CreatedOn = txnItem.CreatedOn,
                                                                   Amount = txnItem.Amount,
                                                                   LedgerId = txnItem.LedgerId,
                                                                   IsActive = txnItem.IsActive,
                                                                   DrCr = txnItem.DrCr,
                                                                   Description = txnItem.Description,
                                                                   HospitalId = txnItem.HospitalId,
                                                                   TransactionItemId = txnItem.TransactionItemId,
                                                                   CostCenterId = costCenter.CostCenterId,
                                                                   SubLedgers = _accountingDbContext.SubLedgerRecord.Where(sub => sub.TransactionItemId == txnItem.TransactionItemId).ToList(),
                                                                   CreatedBy = txnItem.CreatedBy,
                                                                   TransactionId = txnItem.TransactionId
                                                               }).ToList()

                                            ,
                                           TransactionType = txn.TransactionType
                                            ,
                                           TUId = txn.TUId
                                            ,
                                           DayVoucherNumber = txn.DayVoucherNumber
                                            ,
                                           IsCustomVoucher = txn.IsCustomVoucher
                                       }
                                       ).FirstOrDefault();
                if (transactionData != null)
                {
                    return transactionData;
                }
                else
                {
                    throw new Exception("No maching Voucher Number for selected fiscal year");
                }
            }

            else
            {
                throw new Exception("No maching Voucher Number");
            }
        }

        private object GetProvisionalVoucherNumber(int? voucherId, int? sectionId, DateTime transactiondate, int currentHospitalId)
        {
            if (voucherId != null && sectionId != null && transactiondate != null)
            {
                string TempVoucherNumber;
                var fYearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, transactiondate, currentHospitalId);
                return GetVoucherNumber(_accountingDbContext, voucherId, sectionId.Value, currentHospitalId, fYearId);
            }
            else
            {
                throw new Exception("No maching Voucher Number");

            }

        }

        private object GetAccountingCodes(int currentHospitalId)
        {
            var result = ((List<AccountingCodeDetailsModel>)DanpheCache.GetMasterData(MasterDataEnum.AccountingCodes))
              .Where(c => c.HospitalId == currentHospitalId).ToList<object>();
            return result;
        }

        private object GetProvisionalLedgerCode(int currentHospitalId)
        {
            var result = AccountingTransferData.GetProvisionalLedgerCode(_accountingDbContext, currentHospitalId);
            if (result != null)
            {
                return result;
            }
            else
            {
                throw new Exception("provisional ledger code generation has problem , please try again !");
            }
        }

        private object GetProvisionalLedgerDetail(string ledgerType, int currentHospitalId, int referenceId)
        {
            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
            //for this resolution we have temp solution
            //we have saved accPrimary id in parameter table so, we will return this hospital records here
            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
            //if user have only one hsopital permission then automatically activate this hospital
            var HospId = 0;
            if (ledgerType == ENUM_ACC_LedgerType.InventorySubCategory || ledgerType == ENUM_ACC_LedgerType.Consultant)
            {
                HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
            }
            else
            {
                HospId = currentHospitalId;
            }

            EmployeeModel emp = new EmployeeModel();
            //this api call will get ledgertype and reference id and will find ledger details , if ledger already there then return ledger details
            //if ledger is not created and not mapped into ledgerMapping table then api will assign values to ledger model and return to client for creation new ledger 
            string ledgerGroupUniqueName = "";
            string COA = "";
            var IsExist = true;
            var paraValue = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "LedgerGroupMapping").FirstOrDefault().ParameterValue;
            if (paraValue != "")
            {
                List<dynamic> json = JsonConvert.DeserializeObject<List<dynamic>>(paraValue);

                //get consultant ledger group unique name
                if (ledgerType == ENUM_ACC_LedgerType.Consultant)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.Consultant);
                    ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId &&
                                               ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.Consultant
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;
                    emp = (from e in _accountingDbContext.Emmployees where e.EmployeeId == referenceId select e).FirstOrDefault();

                }
                else if (ledgerType == ENUM_ACC_LedgerType.InventorySubCategory)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.InventorySubCategory);
                    COA = (paramData != null) ? paramData.COA : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.InventorySubCategory
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }
                else if (ledgerType == ENUM_ACC_LedgerType.InventoryVendor)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.InventoryVendor);
                    //COA = (paramData != null) ? paramData.COA : "";
                    ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.InventoryVendor
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }
                else if (ledgerType == ENUM_ACC_LedgerType.CreditOrganization)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.CreditOrganization);
                    COA = (paramData != null) ? paramData.COA : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.CreditOrganization
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }
                else if (ledgerType == ENUM_ACC_LedgerType.PharmacySupplier)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier);
                    // COA = (paramData != null) ? paramData.COA : "";
                    ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.PharmacySupplier
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }
                else if (ledgerType == ENUM_ACC_LedgerType.InventoryOtherCharge)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.InventoryOtherCharge);
                    ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.InventoryOtherCharge
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }

                else if (ledgerType == ENUM_ACC_LedgerType.PharmacyCreditOrganization)
                {
                    var paramData = json.Find(p => p.LedgerType == ENUM_ACC_LedgerType.PharmacyCreditOrganization);
                    ledgerGroupUniqueName = (paramData != null) ? paramData.LedgergroupUniqueName : "";
                    var checkExistingLedger = (from ledMap in _accountingDbContext.LedgerMappings
                                               where
                                               ledMap.HospitalId == HospId && ledMap.ReferenceId == referenceId
                                                && ledMap.LedgerType == ENUM_ACC_LedgerType.PharmacyCreditOrganization
                                               select ledMap).FirstOrDefault();
                    IsExist = (checkExistingLedger != null) ? true : false;

                }
                if (IsExist == true)
                {
                    throw new Exception("ledger is existing, duplicate ledger not allowed !");
                }
            }
            if ((ledgerGroupUniqueName != "" || COA != "") && IsExist == false)
            {
                var ledCode = AccountingTransferData.GetProvisionalLedgerCode(_accountingDbContext, HospId);

                var result = (from ledGrp in _accountingDbContext.LedgerGroups
                              join led in _accountingDbContext.Ledgers on ledGrp.LedgerGroupId equals led.LedgerGroupId into ledger
                              from LedgerModel in ledger.DefaultIfEmpty()
                              where ledGrp.HospitalId == HospId &&
                              ((ledgerGroupUniqueName != "") ? (ledGrp.Name == ledgerGroupUniqueName) : (ledGrp.COA.ToLower() == COA.ToLower())) //ledGrp.Name.Contains(ledgerGroupUniqueName) || ledGrp.COA.ToLower().Contains(COA.ToLower())
                              select new
                              {
                                  ledGrp.PrimaryGroup,
                                  ledGrp.COA,
                                  ledGrp.LedgerGroupId,
                                  ledGrp.LedgerGroupName,
                                  Code = ledCode,
                                  LedgerName = (ledgerType == ENUM_ACC_LedgerType.Consultant) ? emp.FullName : null
                              }).FirstOrDefault();
                if (result != null)
                {
                    return result;
                }
                else
                {
                    throw new Exception("Please create the ledger group and update name in core parameter");
                }
            }
            else
            {
                throw new Exception("Error.");
            }
        }

        private object GetActiveTenants()
        {
            var result = _accountingDbContext.Hospitals.Where(h => h.IsActive == true).ToList();
            return result;
        }

        private object GetFiscalYearLogs()
        {
            var result = (from fslog in _accountingDbContext.FiscalYearLog
                          join fs in _accountingDbContext.FiscalYears on fslog.FiscalYearId equals fs.FiscalYearId
                          join emp in _accountingDbContext.Emmployees on fslog.CreatedBy equals emp.EmployeeId
                          select new
                          {
                              fs.FiscalYearName,
                              fslog.CreatedOn,
                              fslog.LogType,
                              emp.FirstName,
                              fslog.LogDetails
                          }).ToList();
            return result;
        }

        private object GetEmployeeLedgers()
        {
            //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
            //for this resolution we have temp solution
            //we have saved accPrimary id in parameter table so, we will return this hospital records here
            //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
            //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
            //if user have only one hsopital permission then automatically activate this hospital
            var HospId = AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);

            List<SqlParameter> paramList = new List<SqlParameter>() { new SqlParameter("@HospitalId", HospId) };
            //sud: 20Jun'20-- new param is added in below sp.. hence changed..
            DataTable dt = DALFunctions.GetDataTableFromStoredProc(ENUM_StoredProcedures.EmployeeLedgerList, paramList, _accountingDbContext);
            return dt;
        }

        private object GetTransactionDates(DateTime FromDate, DateTime ToDate, int currentHospitalId, int? sectionId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                            new SqlParameter("@FromDate",FromDate),
                            new SqlParameter("@ToDate", ToDate),
                            new SqlParameter("@HospitalId", currentHospitalId),
                            new SqlParameter("@SectionId", sectionId)                    };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc(ENUM_StoredProcedures.AccountingTransactionDates, paramList, _accountingDbContext);
            return dt;
        }

        private object GetBanckReconciliationCategories()
        {
            var BankReconciliationCategory = _accountingDbContext.BankReconciliationCategory.Where(c => c.IsActive == true).ToList();
            return BankReconciliationCategory;
        }

        private object GetGoodReceiptList(int? sectionId, int? voucherId, DateTime transactiondate, string voucherNumber)
        {
            if (sectionId == 1)
            {
                var grInvList = (from gr in _accountingDbContext.GoodsReceiptModels
                                 join v in _accountingDbContext.InvVendors on gr.VendorId equals v.VendorId
                                 join pm in _accountingDbContext.AccountingPaymentModels on gr.GoodsReceiptID equals pm.GoodReceiptID into p
                                 from pay in p.DefaultIfEmpty().OrderByDescending(a => a.PaymentId).Take(1)
                                 where gr.VendorId == voucherId && gr.PaymentMode.ToLower().ToString() == ENUM_BillPaymentMode.credit && gr.IsCancel == false && gr.IsPaymentDoneFromAcc == false
                                 select new
                                 {
                                     GRId = gr.GoodsReceiptID,
                                     GRDate = gr.GoodsReceiptDate,
                                     GRNo = gr.GoodsReceiptNo,
                                     TotalAmount = gr.TotalAmount,
                                     VendorId = gr.VendorId,
                                     VendorName = v.VendorName,
                                     PaidAmount = pay == null ? 0 : pay.PaidAmount,
                                     RemainingAmount = pay == null ? gr.TotalAmount : pay.RemainingAmount,
                                     DueAmount = pay == null ? gr.TotalAmount : gr.TotalAmount - pay.PaidAmount
                                 }).ToList();
                if (transactiondate != DateTime.MinValue)
                {
                    grInvList = grInvList.Where(a => a.GRDate.Value.Date == transactiondate.Date).ToList();

                }
                if (!string.IsNullOrEmpty(voucherNumber))
                {
                    grInvList = grInvList.Where(a => a.GRNo == short.Parse(voucherNumber)).ToList();
                }
                return grInvList;
            }
            else
            {
                var grPhrmList = (from gr in _accountingDbContext.PHRMGoodsReceipt
                                  join s in _accountingDbContext.PHRMSupplier on gr.SupplierId equals s.SupplierId
                                  join pm in _accountingDbContext.AccountingPaymentModels on gr.GoodReceiptId equals pm.GoodReceiptID into p
                                  from pay in p.DefaultIfEmpty().OrderByDescending(a => a.PaymentId).Take(1)
                                  where gr.SupplierId == voucherId && gr.TransactionType.ToLower().ToString() == ENUM_BillPaymentMode.credit && gr.IsCancel == false && gr.IsPaymentDoneFromAcc == false
                                  select new
                                  {
                                      GRId = gr.GoodReceiptId,
                                      GRDate = gr.GoodReceiptDate,
                                      InvoiceNo = gr.InvoiceNo,
                                      TotalAmount = gr.TotalAmount,
                                      SupplierId = gr.SupplierId,
                                      SupplierName = s.SupplierName,
                                      VatAmount = gr.VATAmount,
                                      PaidAmount = pay == null ? 0 : pay.PaidAmount,
                                      RemainingAmount = pay == null ? gr.TotalAmount : pay.RemainingAmount,
                                      DueAmount = pay == null ? gr.TotalAmount : gr.TotalAmount - pay.PaidAmount
                                  }).ToList();
                if (transactiondate != DateTime.MinValue)
                {
                    grPhrmList = grPhrmList.Where(a => a.GRDate.Date == transactiondate.Date).ToList();

                }
                if (!string.IsNullOrEmpty(voucherNumber))
                {
                    grPhrmList = grPhrmList.Where(a => a.InvoiceNo.Trim().ToLower() == voucherNumber.Trim().ToLower()).ToList();
                }
                return grPhrmList;
            }
        }

        private object PostTransactionList(string str, RbacUser currentUser, int currentHospitalId)
        {
            //REMARK: RAMAVTAR: NEED TO MAKE THIS ONE TRANSACTION
            List<TransactionModel> txnListClient = DanpheJSONConvert.
                DeserializeObject<List<TransactionModel>>(str);
            AccountingTransferData accountingTransferData = new AccountingTransferData(connString, currentUser.EmployeeId, currentHospitalId);
            var check = AccountingTransferData.PostTxnData(txnListClient, currentHospitalId);
            return check;
        }

        private object PostAccountClosure(string str, int currentHospitalId, RbacUser currentUser)
        {
            ////account closure transaction 

            FiscalYearModel fiscalYear = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);
            var CurrentDate = DateTime.Now.Date;
            var CurrentfiscalYear = _accountingDbContext.FiscalYears.Where(f => f.HospitalId == currentHospitalId && f.FiscalYearId == fiscalYear.FiscalYearId).FirstOrDefault();

            // 1. Check next yeard fiscal year available or not.
            var nextFiscalYearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, CurrentfiscalYear.EndDate.AddDays(10), currentHospitalId);

            if (nextFiscalYearId > 0)
            {
                var unvarifiedVoucherExists = _accountingDbContext.Transactions.Any(a => a.Status == Enums.ENUM_ACC_VoucherStatus.Draft || a.Status == Enums.ENUM_ACC_VoucherStatus.InReview);
                if (unvarifiedVoucherExists)
                {
                    throw new Exception("There are some unvarified vouchers, Please verify them before account closure.");
                }
                else
                {
                    List<SqlParameter> paramList = new List<SqlParameter>()
                        {
                                 new SqlParameter("@CurrentFiscalYearId",CurrentfiscalYear.FiscalYearId),
                                 new SqlParameter("@NextFiscalYearId", nextFiscalYearId),
                                 new SqlParameter("@HospitalId", currentHospitalId)
                        };
                    int ret = DALFunctions.ExecuteStoredProcedure(ENUM_StoredProcedures.AccountClosure, paramList, _accountingDbContext);
                    var tempModel = new FiscalYearLogModel();
                    tempModel.FiscalYearId = fiscalYear.FiscalYearId;
                    tempModel.HospitalId = currentHospitalId;
                    tempModel.LogType = "closed";
                    tempModel.LogDetails = "closed for testing purpose";
                    tempModel.CreatedOn = CurrentDate;
                    tempModel.CreatedBy = currentUser.EmployeeId;
                    _accountingDbContext.FiscalYearLog.Add(tempModel);
                    _accountingDbContext.SaveChanges();

                    var Results = (from fy in _accountingDbContext.FiscalYears
                                   where fy.IsActive == true
                                   select fy).ToList();
                    return Results;
                }
            }
            else
            {
                throw new Exception("Next fiscal year is not created. Please create first fiscal year.");
            }
        }

        private object AddLedgers(string str, int currentHospitalId)
        {
            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    List<LedgerModel> ledgers = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
                    {
                        ledgers.ForEach(led =>
                        {
                            led.CreatedOn = System.DateTime.Now;
                            led.Code = AccountingTransferData.GetProvisionalLedgerCode(_accountingDbContext, currentHospitalId);
                            led.HospitalId = currentHospitalId;
                            led.LedgerName = led.LedgerName.Trim();
                            _accountingDbContext.Ledgers.Add(led);
                            _accountingDbContext.SaveChanges();
                            AccountingTransferData.AddLedgerForClosedFiscalYears(_accountingDbContext, led);
                            if (led.LedgerType != "" && led.LedgerType.Length > 0)
                            {
                                LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                                ledgerMapping.LedgerId = led.LedgerId;
                                ledgerMapping.LedgerType = led.LedgerType;
                                ledgerMapping.ReferenceId = (int)led.LedgerReferenceId;
                                ledgerMapping.HospitalId = currentHospitalId;
                                _accountingDbContext.LedgerMappings.Add(ledgerMapping);
                                _accountingDbContext.SaveChanges();
                            }
                            var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(led, _accountingDbContext, false, currentHospitalId, led.CreatedBy);

                            if (flag)
                            {
                                dbContextTransaction.Commit();
                            }
                            else
                            {
                                dbContextTransaction.Rollback();
                                throw new Exception("Error, While Adding Ledgers.");
                            }
                        });
                    }
                    return true;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        private object AddLedgersFromSharedComponents(string str, RbacUser currentUser)
        {
            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
                    //for this resolution we have temp solution
                    //we have saved accPrimary id in parameter table so, we will return this hospital records here
                    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
                    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
                    //if user have only one hsopital permission then automatically activate this hospital
                    var HospId = AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);

                    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                    LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                    if (_accountingDbContext.LedgerMappings.Any(r => r.HospitalId == HospId && r.ReferenceId == ledger.LedgerReferenceId && r.LedgerType == ledger.LedgerType))
                    {
                        throw new Exception("Ledger already created please create new one.");
                    }
                    else
                    {
                        ledger.CreatedOn = System.DateTime.Now;
                        ledger.IsActive = true;
                        ledger.CreatedBy = currentUser.EmployeeId;
                        ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(_accountingDbContext, HospId);
                        ledger.HospitalId = HospId;
                        ledger.LedgerName = ledger.LedgerName.Trim();
                        _accountingDbContext.Ledgers.Add(ledger);
                        _accountingDbContext.SaveChanges();
                        AccountingTransferData.AddLedgerForClosedFiscalYears(_accountingDbContext, ledger);
                        if (ledger.LedgerType != ENUM_ACC_LedgerType.InventorySubCategory && ledger.LedgerType.Length > 0)
                        {
                            ledgerMapping.LedgerId = ledger.LedgerId;
                            ledgerMapping.LedgerType = ledger.LedgerType;
                            ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                            ledgerMapping.HospitalId = HospId;
                            _accountingDbContext.LedgerMappings.Add(ledgerMapping);
                        }
                        _accountingDbContext.SaveChanges();
                        var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, _accountingDbContext, false, HospId, currentUser.EmployeeId);

                        if (!flag)
                        {
                            dbContextTransaction.Rollback();
                            throw new Exception("Error during add ledger.");
                        }
                    }
                    if (ledger.LedgerId > 0) // && ledgerMapping.LedgerMappingId > 0
                    {
                        dbContextTransaction.Commit();
                        return ledger;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();
                        throw new Exception("Ledger with mapping saving has issue, please try again!");
                    }

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object ReverseTransaction(string str, RbacUser currentUser, int currentHospitalId)
        {
            try
            {
                //RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");//getting current user
                ReverseTransactionModel reverseTransactionData = DanpheJSONConvert.DeserializeObject<ReverseTransactionModel>(str);
                reverseTransactionData.CreatedOn = DateTime.Now;
                reverseTransactionData.CreatedBy = currentUser.EmployeeId;
                reverseTransactionData.HospitalId = currentHospitalId;
                //get all transaction with matching sectionId and date
                List<TransactionModel> txnList = _accountingDbContext.Transactions.Where(a => DbFunctions.TruncateTime(a.TransactionDate) == reverseTransactionData.TransactionDate && a.SectionId == reverseTransactionData.Section
                                                                                     && a.IsReverseTxnAllow != false && a.HospitalId == currentHospitalId).Select(a => a).ToList();

                if (txnList.Count > 0)
                {
                    txnList.ForEach(txn =>
                    {
                        txn.TransactionItems = _accountingDbContext.TransactionItems.Where(p => p.HospitalId == currentHospitalId && p.TransactionId == txn.TransactionId).Select(p => p).ToList();
                        txn.TransactionItems.ForEach(b =>
                        {
                            b.TransactionItemDetails = _accountingDbContext.TransactionItemDetails.Where(c => c.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
                            b.SubLedgers = _accountingDbContext.SubLedgerRecord.Where(d => d.TransactionItemId == b.TransactionItemId).ToList();
                            b.TransactionLinks = _accountingDbContext.TransactionLinks.Where(x => x.TransactionItemId == b.TransactionItemId).Select(x => x).ToList();
                        });
                        //txn.TransactionLinks = _accountingDbContext.TransactionLinks.Where(x => x.TransactionId == txn.TransactionId).Select(x => x).ToList();
                    });
                    string jsonTxnData = DanpheJSONConvert.SerializeObject(txnList);
                    List<TransactionModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionModel>>(jsonTxnData);
                    //NageshBB: 20Aug2020
                    //We need transactionItems for track records with amount . so we need to save transactionItems for reverse txn
                    //txnsForJson.ForEach(b =>
                    //{
                    //    b.TransactionItems = null;
                    //});
                    reverseTransactionData.TUId = txnsForJson[0].TUId;
                    reverseTransactionData.FiscalYearId = txnsForJson[0].FiscalyearId;
                    reverseTransactionData.JsonData = DanpheJSONConvert.SerializeObject(txnsForJson);

                    //update IsTransferToAccounting 
                    bool IsReverseTransaction = true;
                    var checkFlag = true;
                    if (reverseTransactionData.Section == 1)//inventory
                    {

                        List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = new List<string>();
                        txnList.ForEach(txn =>
                        {
                            var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                            distinctTxnTypeList.AddRange(txnType);
                        });
                        distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = new List<TransactionItemModel>();
                            txnList.ForEach(txn =>
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

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                checkFlag = (checkFlag == true) ? _accountingDbContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction, null, AllReferenceIds) : checkFlag;
                            }
                        }
                    }
                    else if (reverseTransactionData.Section == 2)//billing
                    {

                        //nbb reverse transaction changes after removed sync table
                        List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = new List<string>();
                        txnList.ForEach(txn =>
                        {
                            var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                            distinctTxnTypeList.AddRange(txnType);
                        });
                        distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = new List<TransactionItemModel>();
                            txnList.ForEach(txn =>
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

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                checkFlag = (checkFlag == true) ? _accountingDbContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction, null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
                            }
                        }
                    }
                    else if (reverseTransactionData.Section == 3)//pharmacy
                    {
                        List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = new List<string>();
                        txnList.ForEach(txn =>
                        {
                            var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                            distinctTxnTypeList.AddRange(txnType);
                        });
                        distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = new List<TransactionItemModel>();
                            txnList.ForEach(txn =>
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

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                checkFlag = (checkFlag == true) ? _accountingDbContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction, null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
                            }
                        }
                    }
                    else if (reverseTransactionData.Section == 5)//incetive
                    {
                        List<AccountingReferenceTypeViewModel> AllReferenceIds = new List<AccountingReferenceTypeViewModel>();
                        List<string> TransactionType = new List<string>();
                        var distinctTxnTypeList = new List<string>();
                        txnList.ForEach(txn =>
                        {
                            var txnType = txn.TransactionItems.Select(item => item.TransactionType).Distinct().ToList();
                            distinctTxnTypeList.AddRange(txnType);
                        });
                        distinctTxnTypeList = distinctTxnTypeList.Distinct().ToList();
                        Hashtable ReferenceIdWithTypeList = new Hashtable();
                        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                        {
                            var filteredData = new List<TransactionItemModel>();
                            txnList.ForEach(txn =>
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

                        if (distinctTxnTypeList.Count > 0)
                        {
                            foreach (string txnType in distinctTxnTypeList)
                            {
                                checkFlag = (checkFlag == true) ? _accountingDbContext.UndoTxnUpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType, currentHospitalId, IsReverseTransaction, null, new List<AccountingReferenceTypeViewModel>()) : checkFlag;
                            }
                        }
                    }

                    //deleting transactions
                    if (checkFlag == true)
                    {
                        txnList.ForEach(a =>
                        {
                            a.TransactionItems.ForEach(c =>
                            {
                                _accountingDbContext.TransactionItemDetails.RemoveRange(c.TransactionItemDetails);
                                _accountingDbContext.SubLedgerRecord.RemoveRange(c.SubLedgers);
                                _accountingDbContext.TransactionLinks.RemoveRange(c.TransactionLinks);
                            });
                            _accountingDbContext.TransactionItems.RemoveRange(a.TransactionItems);
                        });
                        _accountingDbContext.ReverseTransaction.Add(reverseTransactionData);
                        _accountingDbContext.Transactions.RemoveRange(txnList);
                        _accountingDbContext.SaveChanges();
                    }
                    else
                    {
                        throw new Exception("Unable to perform reverse transaction.");
                    }
                }
                else
                {
                    throw new Exception("No Transaction Found.");
                }
                return true;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private object PostIncentivePaymentVoucher(RbacUser currentUser, string str, string transactionObject)
        {
            PaymentInfoModel paymentInfoModel = DanpheJSONConvert.DeserializeObject<PaymentInfoModel>(str);

            //GetVoucherNumber(accountingDBContext, distinctVoucherIdAndDate[p].VoucherId, distinctVoucherIdAndDate[p].TransactionDate, sectionId);
            TransactionModel txnClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(transactionObject);
            int payInfoId = 0;
            using (var dbTransact = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (txnClient != null)
                    {
                        var isGroupbyData = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                        var EnableVoucherVerificationParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "EnableVoucherVerification").FirstOrDefault();
                        var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
                        txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

                        var HospitalId = AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
                        txnClient.HospitalId = HospitalId;
                        txnClient.TransactionDate = System.DateTime.Now.Date;
                        txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, txnClient.TransactionDate, HospitalId);
                        CostCenterModel costCenter = _accountingDbContext.CostCenters.Where(cc => cc.CostCenterName == ENUM_ACC_DefaultCostCenterName.Hospital).FirstOrDefault();
                        //txnClient.CostCenterId = costCenter != null ? costCenter.CostCenterId : 1;//There will be at-least one voucher head. -- remove this hardcode and take from parameter
                        txnClient.TransactionType = "IncentivePayment";
                        txnClient.IsCustomVoucher = false;
                        txnClient.VoucherId = _accountingDbContext.Vouchers.Where(v => v.VoucherCode.ToLower() == "pmtv").FirstOrDefault().VoucherId;
                        txnClient.VoucherNumber = GetVoucherNumber(_accountingDbContext, txnClient.VoucherId, 5, HospitalId, txnClient.FiscalyearId);
                        txnClient.TUId = GetTUID(_accountingDbContext, HospitalId);
                        txnClient.SectionId = 5;//for manual entry we are using section 4
                        txnClient.IsReverseTxnAllow = false;
                        if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Draft;
                        }
                        else
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Verified;
                            txnClient.IsVerified = true;
                            txnClient.VerifiedBy = currentUser.EmployeeId;
                            txnClient.VerifiedOn = DateTime.Now;
                            txnClient.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                        }
                        txnClient.TransactionItems.ForEach(item =>
                        {
                            var defaultCostCenter = _accountingDbContext.CostCenters.Where(a => a.IsDefault == true).FirstOrDefault();
                            if (defaultCostCenter != null)
                            {
                                item.CostCenterId = defaultCostCenter.CostCenterId;
                            }
                        });
                        _accountingDbContext.Transactions.Add(ProcessTransactions(txnClient, txnClient.HospitalId));
                        _accountingDbContext.SaveChanges();

                        //var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();
                        paymentInfoModel.CreatedOn = System.DateTime.Now;
                        paymentInfoModel.VoucherNumber = txnClient.VoucherNumber;
                        paymentInfoModel.Remarks = txnClient.Remarks;
                        _accountingDbContext.PaymentInfo.Add(paymentInfoModel);
                        _accountingDbContext.SaveChanges();
                        payInfoId = paymentInfoModel.PaymentInfoId;
                        dbTransact.Commit();
                    }

                }
                catch (Exception ex)
                {
                    dbTransact.Rollback();
                    throw ex;
                }
            }

            List<SqlParameter> paramList = new List<SqlParameter>()
                    {
                        new SqlParameter("@FromDate", paymentInfoModel.FromDate),
                        new SqlParameter("@ToDate", paymentInfoModel.ToDate),
                        new SqlParameter("@employeeId", paymentInfoModel.EmployeeId),
                        new SqlParameter("@paymentInfoId", payInfoId)
                    };
            int ret = DALFunctions.ExecuteStoredProcedure(ENUM_StoredProcedures.IncentivePaymentInfoUpdate, paramList, _accountingDbContext);
            var resFinal = new { VoucherNumber = txnClient.VoucherNumber, FiscalYearId = txnClient.FiscalyearId };
            return resFinal;
        }

        private object PostAccountingPayment(MakePayment_DTO makePayment_dto, RbacUser currentUser)
        {
            AccountingPaymentModel payment = makePayment_dto.Payment;
            TransactionModel txnClient = makePayment_dto.Transaction;
            int payInfoId = 0;
            using (var dbTransact = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (txnClient != null)
                    {
                        var isGroupbyData = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                        var EnableVoucherVerificationParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "EnableVoucherVerification").FirstOrDefault();
                        var subLedgerParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SubLedgerAndCostCenter").FirstOrDefault().ParameterValue;
                        var parmValue = DanpheJSONConvert.DeserializeObject<SubLedgerAndCostCenterConfig_DTO>(subLedgerParam);
                        var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
                        txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

                        var HospitalId = AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
                        txnClient.HospitalId = HospitalId;
                        txnClient.TransactionDate = System.DateTime.Now.Date;
                        txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, txnClient.TransactionDate, HospitalId);
                        CostCenterModel costCenter = _accountingDbContext.CostCenters.Where(cc => cc.CostCenterName == ENUM_ACC_DefaultCostCenterName.Hospital).FirstOrDefault();
                        //txnClient.CostCenterId = costCenter != null ? costCenter.CostCenterId : 1;//There will be at-least one voucher head. -- remove this hardcode and take from parameter
                        txnClient.TransactionType = payment.SectionId == 1 ? "InventoryPayment" : "PharmacyPayment";
                        txnClient.IsCustomVoucher = false;
                        txnClient.VoucherId = _accountingDbContext.Vouchers.Where(v => v.VoucherCode.ToLower() == "pmtv").FirstOrDefault().VoucherId;
                        txnClient.VoucherNumber = GetVoucherNumber(_accountingDbContext, txnClient.VoucherId, payment.SectionId, HospitalId, txnClient.FiscalyearId);
                        txnClient.TUId = GetTUID(_accountingDbContext, HospitalId);
                        txnClient.SectionId = payment.SectionId;
                        txnClient.IsReverseTxnAllow = false;
                        if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Draft;
                        }
                        else
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Verified;
                            txnClient.IsVerified = true;
                            txnClient.VerifiedBy = currentUser.EmployeeId;
                            txnClient.VerifiedOn = DateTime.Now;
                            txnClient.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                        }
                        txnClient.TransactionItems.ForEach(item =>
                        {
                            var defaultCostCenter = _accountingDbContext.CostCenters.Where(a => a.IsDefault == true).FirstOrDefault();
                            if (defaultCostCenter != null)
                            {
                                item.CostCenterId = defaultCostCenter.CostCenterId;
                            }
                        });

                        var transaction = ProcessTransactions(txnClient, txnClient.HospitalId);
                        _accountingDbContext.Transactions.Add(transaction);
                        _accountingDbContext.SaveChanges();

                        //var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();
                        payment.CreatedOn = System.DateTime.Now;
                        payment.CreatedBy = txnClient.CreatedBy;
                        payment.PaidAmount = payment.VoucherAmount + payment.PaidAmount;
                        payment.IsPaymentDone = (payment.PaidAmount == payment.TotalAmount) ? true : false;
                        payment.VoucherNumber = txnClient.VoucherNumber;
                        payment.TransactionId = txnClient.TransactionId;
                        payment.PaymentDate = System.DateTime.Now;
                        _accountingDbContext.AccountingPaymentModels.Add(payment);
                        _accountingDbContext.SaveChanges();
                        payInfoId = payment.PaymentId;
                        if (payment.IsPaymentDone == true)
                        {
                            if (payment.SectionId == 1)
                            {
                                var grInv = _accountingDbContext.GoodsReceiptModels.Where(a => a.GoodsReceiptID == payment.GoodReceiptID).FirstOrDefault();
                                grInv.IsPaymentDoneFromAcc = true;
                                _accountingDbContext.GoodsReceiptModels.Attach(grInv);
                                _accountingDbContext.Entry(grInv).State = EntityState.Modified;
                                _accountingDbContext.Entry(grInv).Property(x => x.IsPaymentDoneFromAcc).IsModified = true;
                            }
                            else
                            {
                                var grPhm = _accountingDbContext.PHRMGoodsReceipt.Where(a => a.GoodReceiptId == payment.GoodReceiptID).FirstOrDefault();
                                grPhm.IsPaymentDoneFromAcc = true;
                                _accountingDbContext.PHRMGoodsReceipt.Attach(grPhm);
                                _accountingDbContext.Entry(grPhm).State = EntityState.Modified;
                                _accountingDbContext.Entry(grPhm).Property(x => x.IsPaymentDoneFromAcc).IsModified = true;
                            }
                            _accountingDbContext.SaveChanges();
                        }
                        dbTransact.Commit();
                    }
                    var res = new { VoucherNumber = txnClient.VoucherNumber, FiscalYearId = txnClient.FiscalyearId };
                    return res;
                }
                catch (Exception ex)
                {
                    dbTransact.Rollback();
                    throw ex;
                }
            }
        }

        private object UpdateTransaction(string Str, int currentHospitalId, RbacUser currentUser)
        {
            TransactionModel txnFromClient = DanpheJSONConvert.DeserializeObject<TransactionModel>(Str);

            // Edit Voucher logs entries.
            var txnitemdata = _accountingDbContext.TransactionItems.AsNoTracking().Where(t => t.TransactionId == txnFromClient.TransactionId).ToList();

            string jsonTxnData = DanpheJSONConvert.SerializeObject(txnitemdata);
            List<TransactionItemModel> txnsForJson = DanpheJSONConvert.DeserializeObject<List<TransactionItemModel>>(jsonTxnData);
            EditVoucherLogModel editvoucherLog = new EditVoucherLogModel();
            editvoucherLog.TransactionDate = txnFromClient.TransactionDate;
            editvoucherLog.SectionId = txnFromClient.SectionId;
            editvoucherLog.VoucherNumber = txnFromClient.VoucherNumber;
            editvoucherLog.Reason = txnFromClient.Reason;
            editvoucherLog.HospitalId = currentHospitalId;
            editvoucherLog.FiscalYearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, txnFromClient.TransactionDate, currentHospitalId); ///txnFromClient.FiscalyearId;
            editvoucherLog.CreatedOn = DateTime.Now;
            editvoucherLog.CreatedBy = currentUser.EmployeeId;
            editvoucherLog.OldVocherJsonData = DanpheJSONConvert.SerializeObject(txnsForJson);
            _accountingDbContext.EditVoucherLog.Add(editvoucherLog);
            txnitemdata = null;

            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    if (txnFromClient != null && txnFromClient.TransactionItems != null && txnFromClient.TransactionItems.Count > 0)
                    {
                        var txnId = txnFromClient.TransactionId;
                        var ToUpdate = (from txnData in _accountingDbContext.Transactions
                                        where txnData.TransactionId == txnFromClient.TransactionId
                                        select txnData).FirstOrDefault();
                        //if any old item has been deleted, we need to compareitemidlist
                        List<int> txnItmIdList = _accountingDbContext.TransactionItems.Where(a => a.HospitalId == currentHospitalId && a.TransactionId == txnId).Select(a => a.TransactionItemId).ToList();
                        //accountingDBContext.Transactions.Attach(ToUpdate);
                        //accountingDBContext.Entry(reqFromClient).Property(a => a.Remarks).IsModified = true;
                        ToUpdate.Remarks = txnFromClient.Remarks;
                        if (txnFromClient.IsBackDateEntry == true)
                        {
                            ToUpdate.IsBackDateEntry = txnFromClient.IsBackDateEntry;
                        }
                        ToUpdate.TransactionDate = txnFromClient.TransactionDate;
                        ToUpdate.ModifiedBy = currentUser.EmployeeId;
                        ToUpdate.ModifiedOn = System.DateTime.Now;
                        _accountingDbContext.Transactions.Attach(ToUpdate);
                        _accountingDbContext.Entry(ToUpdate).State = EntityState.Modified;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.Remarks).IsModified = true;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.IsBackDateEntry).IsModified = true;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.TransactionDate).IsModified = true;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.CreatedOn).IsModified = false;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.CreatedBy).IsModified = false;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.VoucherNumber).IsModified = false;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.VoucherId).IsModified = false;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.ModifiedBy).IsModified = true;
                        _accountingDbContext.Entry(ToUpdate).Property(x => x.ModifiedOn).IsModified = true;

                        txnFromClient.TransactionItems.ForEach(item =>
                        {
                            if (item.TransactionItemId > 0) //old elememnt will have the requisitionItemId
                            {
                                item.HospitalId = currentHospitalId;
                                //for updating old element
                                _accountingDbContext.TransactionItems.Attach(item);
                                _accountingDbContext.Entry(item).Property(a => a.DrCr).IsModified = true;
                                _accountingDbContext.Entry(item).Property(a => a.LedgerId).IsModified = true;
                                _accountingDbContext.Entry(item).Property(a => a.Amount).IsModified = true;
                                _accountingDbContext.Entry(item).Property(a => a.Description).IsModified = true;
                                _accountingDbContext.Entry(item).Property(a => a.HospitalId).IsModified = true;
                                _accountingDbContext.Entry(item).Property(a => a.CostCenterId).IsModified = true;
                                if (item.SubLedgers != null)
                                {
                                    item.SubLedgers.ForEach(subLed =>
                                    {
                                        subLed.CostCenterId = item.CostCenterId;
                                        subLed.LedgerId = item.LedgerId;
                                        subLed.DrAmount = item.DrCr ? item.Amount : 0;
                                        subLed.CrAmount = item.DrCr ? 0 : item.Amount;
                                        subLed.HospitalId = currentHospitalId;
                                        _accountingDbContext.SubLedgerRecord.Attach(subLed);
                                        _accountingDbContext.Entry(subLed).Property(a => a.DrAmount).IsModified = true;
                                        _accountingDbContext.Entry(subLed).Property(a => a.CrAmount).IsModified = true;
                                        _accountingDbContext.Entry(subLed).Property(a => a.SubLedgerId).IsModified = true;
                                        _accountingDbContext.Entry(subLed).Property(a => a.LedgerId).IsModified = true;
                                        _accountingDbContext.Entry(subLed).Property(a => a.CostCenterId).IsModified = true;
                                    });
                                }
                                _accountingDbContext.SaveChanges();
                                //delete the present itemid from the list, so later we can delete the remaining item in the list.
                                txnItmIdList = txnItmIdList.Where(a => a != item.TransactionItemId).ToList();
                            }
                            else //new items wont have ItemId
                            {
                                //for adding new txnitm
                                item.CreatedOn = DateTime.Now;
                                item.CreatedBy = currentUser.EmployeeId;
                                item.TransactionId = txnId;
                                item.HospitalId = currentHospitalId;
                                if (item.SubLedgers != null)
                                {
                                    item.SubLedgers.ForEach(subLedgerItems =>
                                    {
                                        subLedgerItems.DrAmount = item.DrCr ? item.Amount : 0;
                                        subLedgerItems.CrAmount = item.DrCr ? 0 : item.Amount;
                                        subLedgerItems.LedgerId = item.LedgerId;
                                        subLedgerItems.VoucherNo = txnFromClient.VoucherNumber;
                                        subLedgerItems.VoucherType = txnFromClient.VoucherId;
                                        subLedgerItems.VoucherDate = txnFromClient.TransactionDate;
                                        subLedgerItems.CreatedOn = DateTime.Now;
                                        subLedgerItems.CreatedBy = currentUser.EmployeeId;
                                        subLedgerItems.HospitalId = currentHospitalId;
                                        subLedgerItems.FiscalYearId = txnFromClient.FiscalyearId;
                                        subLedgerItems.CostCenterId = item.CostCenterId;
                                    });
                                }
                                _accountingDbContext.TransactionItems.Add(item);
                                _accountingDbContext.SaveChanges();
                            }
                        });
                        //for deleting old element
                        if (txnItmIdList.Any())
                        {
                            foreach (int reqitmid in txnItmIdList)
                            {
                                var _subledgerList = _accountingDbContext.SubLedgerRecord.Where(a => a.TransactionItemId == reqitmid).Select(a => a.SubLedgerTransactionId).ToList();
                                _subledgerList.ForEach(subLed =>
                                {
                                    var _subLedger = _accountingDbContext.SubLedgerRecord.Find(subLed);
                                    _accountingDbContext.Entry(_subLedger).State = EntityState.Deleted;
                                });
                                var reqitm = _accountingDbContext.TransactionItems.Find(reqitmid);
                                _accountingDbContext.Entry(reqitm).State = EntityState.Deleted;
                            }

                        }
                        var FinalData = new
                        {
                            txnFromClient.VoucherNumber,
                            txnFromClient.FiscalyearId
                        };
                        _accountingDbContext.SaveChanges();
                        dbContextTransaction.Commit();
                        return FinalData;
                    }
                    else
                    {
                        throw new Exception("No transaction found.");
                    }
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }

        #region Get Voucher Number only for Manual voucher entry
        //Logic like single voucher for day for transfer to accounting 
        //manual voucher entry will create new voucher number every time
        //NageshBB-22-oct-2018
        //now voucher number like JV-1,JV-2,PV-1,PV-2....JV-n,PV-n 
        //here JV is Journal voucher, PV is Purchase Voucher
        //NageshBB on 16 march 2020- this function will return voucher number for manual voucher and incentive payment now
        //this function will send voucher unique by section every time
        private string GetVoucherNumber(AccountingDbContext accountingDBContext, int? voucherId, int sectionId, int currHospitalId, int fYearId)
        {
            List<AccSectionModel> SectionList = new List<AccSectionModel>();



            sectionId = (sectionId > 0) ? sectionId : 4; //here we are checking if sectionid send then we will take or default manual voucher section id 4 assigned           
            var voucherCode = (from v in accountingDBContext.Vouchers
                               where v.VoucherId == voucherId
                               select v.VoucherCode).FirstOrDefault();
            int? maxVNo = (from txn in accountingDBContext.Transactions
                           where txn.HospitalId == currHospitalId && txn.FiscalyearId == fYearId &&
                           txn.VoucherId == voucherId && txn.SectionId == sectionId
                           select txn.VoucherSerialNo).DefaultIfEmpty(0).Max();
            var SectionCode = (from sec in accountingDBContext.Section
                               where sec.SectionId == sectionId && sec.HospitalId == currHospitalId
                               select sec.SectionCode).FirstOrDefault();

            var newVoucherNo = (maxVNo > 0) ? maxVNo + 1 : 1;
            var voucherNumberFinal = (SectionCode.Length > 0) ? SectionCode + '-' + voucherCode + '-' + newVoucherNo.ToString() : voucherCode + '-' + newVoucherNo.ToString();
            return voucherNumberFinal;
        }

        //this will return tuid
        private int GetTUID(AccountingDbContext accountingDBContext, int currHospitalId)
        {
            try
            {
                var Tuid = (from txn in accountingDBContext.Transactions
                            where txn.HospitalId == currHospitalId
                            select txn.TUId).ToList().DefaultIfEmpty(0).Max();
                if (Tuid != 0)
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
        #endregion

        #region Process Transaction
        private TransactionModel ProcessTransactions(TransactionModel transaction, int currHospitalId)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            transaction.CreatedBy = currentUser.EmployeeId;
            transaction.CreatedOn = DateTime.Now;
            transaction.HospitalId = currHospitalId;
            transaction.TransactionItems.ForEach(txnItem =>
            {
                txnItem.HospitalId = currHospitalId;
                txnItem.CreatedOn = DateTime.Now;
                txnItem.CreatedBy = currentUser.EmployeeId;
                if (txnItem.SubLedgers != null)
                {
                    txnItem.SubLedgers.ForEach(subLedgerItems =>
                    {
                        subLedgerItems.VoucherNo = transaction.VoucherNumber;
                        subLedgerItems.VoucherType = transaction.VoucherId;
                        subLedgerItems.VoucherDate = transaction.TransactionDate;
                        subLedgerItems.CreatedOn = DateTime.Now;
                        subLedgerItems.CreatedBy = currentUser.EmployeeId;
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
        #endregion

        private object VerifyVoucher(VoucherVerify_DTO voucherData, RbacUser currentUser)
        {
            using (var dbTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    var transaction = _accountingDbContext.Transactions.Where(a => a.VoucherNumber == voucherData.VoucherNumber && a.FiscalyearId == voucherData.FiscalYearId).ToList();
                    if (transaction != null)
                    {
                        transaction.ForEach(txn =>
                        {
                            txn.Status = Enums.ENUM_ACC_VoucherStatus.Verified;
                            txn.VerificationRemarks = txn.Remarks = voucherData.Remarks;
                            txn.ModifiedBy = txn.VerifiedBy = currentUser.EmployeeId;
                            txn.ModifiedOn = txn.VerifiedOn = DateTime.Now;
                            txn.IsVerified = true;
                            _accountingDbContext.Entry(txn).State = EntityState.Modified;
                            _accountingDbContext.SaveChanges();

                            var transactionItem = _accountingDbContext.TransactionItems.Where(a => a.TransactionId == txn.TransactionId).ToList();
                            if (transactionItem != null)
                            {
                                transactionItem.ForEach(item =>
                                {
                                    item.Description = voucherData.Items.Where(a => a.TransactionItemId == item.TransactionItemId).Select(b => b.Description).FirstOrDefault();
                                    item.CostCenterId = voucherData.Items.Where(a => a.TransactionItemId == item.TransactionItemId).Select(b => b.CostCenterId).FirstOrDefault();
                                    _accountingDbContext.Entry(item).State = EntityState.Modified;
                                    _accountingDbContext.SaveChanges();

                                    var subLedgerTransactions = _accountingDbContext.SubLedgerRecord.Where(a => a.TransactionItemId == item.TransactionItemId).ToList();
                                    if (subLedgerTransactions != null)
                                    {
                                        subLedgerTransactions.ForEach(subLedgerTxn =>
                                        {
                                            subLedgerTxn.IsVerified = true;
                                            subLedgerTxn.CostCenterId = item.CostCenterId;
                                            _accountingDbContext.Entry(subLedgerTxn).State = EntityState.Modified;
                                            _accountingDbContext.SaveChanges();
                                        });
                                    }
                                });
                            }
                        });
                        dbTransaction.Commit();
                    }
                    var FinalData = new
                    {
                        VoucherNumber = voucherData.VoucherNumber,
                        FiscalyearId = voucherData.FiscalYearId
                    };
                    return FinalData;
                }
                catch (Exception ex)
                {
                    dbTransaction.Rollback();
                    throw ex;
                }
            }
        }

        private object GetSuspenseAccountReconciliationDetail(int BankLedgerId, int SuspenseAccountLedgerId)
        {
            List<SqlParameter> paramList = new List<SqlParameter>() {
                            new SqlParameter("@SuspenseAccountLedgerId",SuspenseAccountLedgerId),
                            new SqlParameter("@BankLedgerId", BankLedgerId)                  };
            DataTable dt = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetSuspenseAccountReconciliationDetail", paramList, _accountingDbContext);
            return dt;
        }

        private object SaveSuspenaseAccountReconciliation(SuspenseAccountTransaction_DTO txnDTO, RbacUser currentUser, int hospitalId)
        {
            using (var accountingTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {
                    TransactionModel txnClient = txnDTO.Transaction;
                    if (txnClient != null)
                    {
                        var isGroupbyData = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "IsAllowGroupby").FirstOrDefault().ParameterValue;
                        var EnableVoucherVerificationParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "EnableVoucherVerification").FirstOrDefault();
                        var IdGroupBy = (isGroupbyData != "") ? Convert.ToBoolean(isGroupbyData) : true;
                        txnClient.IsGroupTxn = (IdGroupBy) ? IdGroupBy : false;

                        txnClient.TransactionDate = Convert.ToDateTime(txnClient.TransactionDate.ToString()).Date;
                        txnClient.IsCustomVoucher = false;
                        txnClient.FiscalyearId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, txnClient.TransactionDate, hospitalId);
                        txnClient.VoucherNumber = GetVoucherNumber(_accountingDbContext, txnClient.VoucherId, 4, hospitalId, txnClient.FiscalyearId);
                        txnClient.TUId = GetTUID(_accountingDbContext, hospitalId);
                        txnClient.SectionId = 4;
                        txnClient.IsReverseTxnAllow = false;
                        txnClient.TransactionType = "ManualEntry";
                        txnClient.IsEditable = true;
                        txnClient.HospitalId = hospitalId;
                        txnClient.IsAllowReverseVoucher = txnClient.IsAllowReverseVoucher ? txnClient.IsAllowReverseVoucher : true;
                        txnClient.IsVoucherReversed = txnClient.IsReverseVoucher == true ? true : false;
                        if (EnableVoucherVerificationParam != null && Convert.ToBoolean(EnableVoucherVerificationParam.ParameterValue))
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Draft;
                        }
                        else
                        {
                            txnClient.Status = Enums.ENUM_ACC_VoucherStatus.Verified;
                            txnClient.IsVerified = true;
                            txnClient.VerifiedBy = currentUser.EmployeeId;
                            txnClient.VerifiedOn = DateTime.Now;
                            txnClient.VerificationRemarks = "Voucher Verification is disabled. Thus, auto verifying the voucher.";
                        }
                        _accountingDbContext.Transactions.Add(ProcessTransactions(txnClient, hospitalId));
                        _accountingDbContext.SaveChanges();

                        var mapReconciliation = new BankAndSuspenseAccountReconciliationMapModel();
                        mapReconciliation.BankLedgerId = txnDTO.ReconciliationMap.BankLedgerId;
                        mapReconciliation.BankReconciliationVoucherNumber = txnDTO.ReconciliationMap.BankReconciliationVoucherNumber;
                        mapReconciliation.SuspensReconciliationVoucherNumber = txnClient.VoucherNumber;

                        _accountingDbContext.SuspenseAccountReconcileMap.Add(mapReconciliation);
                        _accountingDbContext.SaveChanges();

                        var FinalData = new
                        {
                            txnClient.VoucherNumber,
                            txnClient.FiscalyearId
                        };
                        accountingTransaction.Commit();
                        return FinalData;
                    }
                    else
                    {
                        throw new Exception("Unable to Save Voucher Transaction.");
                    }
                }
                catch (Exception ex)
                {
                    accountingTransaction.Rollback();
                    throw new Exception(ex.Message);
                }
            }
        }

    }
}