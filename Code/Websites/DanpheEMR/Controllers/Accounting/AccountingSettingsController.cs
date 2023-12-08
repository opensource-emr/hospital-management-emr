using DanpheEMR.AccTransfer;
using DanpheEMR.CommonTypes;
using DanpheEMR.Controllers.Billing.Shared;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.AccountingModels;
using DanpheEMR.ServerModel.AccountingModels.DTOs;
using DanpheEMR.ServerModel.ClinicalModels;
using DanpheEMR.Services.Accounting.DTOs;
using DanpheEMR.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingSettingsController : CommonController
    {
        private readonly AccountingDbContext _accountingDbContext;


        //private readonly string connString = null;
        public AccountingSettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;
            _accountingDbContext = new AccountingDbContext(connString);

        }

        [HttpGet]
        [Route("GetSubLedgers")]
        public async Task<DanpheHTTPResponse<object>> GetSubLedgers()
        {
            DanpheHTTPResponse<object> responseDate = new DanpheHTTPResponse<object>();
            try
            {
                AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
                responseDate.Results = await accountingDbContext.SubLedger
                                        .Join(accountingDbContext.Ledgers, subLedger => subLedger.LedgerId, ledger => ledger.LedgerId, (subLeder, ledger) =>
                                        new SubLedger_DTO
                                        {
                                            SubLedgerId = subLeder.SubLedgerId,
                                            SubLedgerCode = subLeder.SubLedgerCode,
                                            SubLedgerName = subLeder.SubLedgerName,
                                            IsActive = subLeder.IsActive,
                                            IsDefault = subLeder.IsDefault,
                                            Description = subLeder.Description,
                                            HospitalId = subLeder.HospitalId,
                                            LedgerId = ledger.LedgerId,
                                            LedgerName = ledger.LedgerName,
                                            OpeningBalance = subLeder.OpeningBalance,
                                            DrCr = subLeder.DrCr
                                        }).ToListAsync();
                responseDate.Status = ENUM_DanpheHttpResponseText.OK;
            }
            catch (Exception ex)
            {
                responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                responseDate.ErrorMessage = ex.Message;
            }
            return responseDate;
        }

        [HttpPut]
        [Route("ActivateDeactiveSubLedger")]
        public async Task<DanpheHTTPResponse<object>> ActivateDeactiveSubLedger([FromBody] SubLedgerModel subLedger)
        {
            AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
            using (var dbContextTransaction = accountingDbContext.Database.BeginTransaction())
            {
                DanpheHTTPResponse<object> responseDate = new DanpheHTTPResponse<object>();
                try
                {
                    //var subLedger = JsonConvert.DeserializeObject<SubLedgerModel>(ledger);
                    var obj = await accountingDbContext.SubLedger.Where(a => a.SubLedgerId == subLedger.SubLedgerId).FirstOrDefaultAsync();
                    obj.IsActive = !subLedger.IsActive;
                    accountingDbContext.Entry(obj).Property(a => a.IsActive).IsModified = true;
                    await accountingDbContext.SaveChangesAsync();
                    dbContextTransaction.Commit();
                    responseDate.Results = obj;
                    responseDate.Status = ENUM_DanpheHttpResponseText.OK;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                    responseDate.ErrorMessage = ex.Message;
                }
                return responseDate;
            }
        }

        [HttpPut]
        [Route("UpdateSubLedger")]
        public async Task<DanpheHTTPResponse<object>> UpdateSubLedger([FromBody] SubLedgerModel subLedger)
        {
            AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
            using (var dbContextTransaction = accountingDbContext.Database.BeginTransaction())
            {
                DanpheHTTPResponse<object> responseDate = new DanpheHTTPResponse<object>();
                try
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    int currHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
                    //var subLedger = JsonConvert.DeserializeObject<SubLedgerModel>(ledger);
                    var obj = await accountingDbContext.SubLedger.Where(a => a.SubLedgerId == subLedger.SubLedgerId).FirstOrDefaultAsync();
                    if (obj != null)
                    {
                        obj.LedgerId = subLedger.LedgerId;
                        obj.SubLedgerName = subLedger.SubLedgerName;
                        obj.Description = subLedger.Description;
                        obj.OpeningBalance = subLedger.OpeningBalance;
                        obj.DrCr = subLedger.DrCr;
                        accountingDbContext.Entry(obj).Property(a => a.SubLedgerName).IsModified = true;
                        accountingDbContext.Entry(obj).Property(a => a.Description).IsModified = true;
                        accountingDbContext.Entry(obj).Property(a => a.OpeningBalance).IsModified = true;
                        accountingDbContext.Entry(obj).Property(a => a.DrCr).IsModified = true;
                        await accountingDbContext.SaveChangesAsync();
                        var flag = await AccountingTransferData.SubLedgerBalanceHisotryUpdate(subLedger, accountingDbContext, currHospitalId, currentUser.UserId);
                        if (flag)
                        {
                            dbContextTransaction.Commit();
                            responseDate.Results = subLedger;
                            responseDate.Status = ENUM_DanpheHttpResponseText.OK;
                        }
                        else
                        {
                            dbContextTransaction.Rollback();
                            responseDate.Results = "Unable to add SubLedger";
                            responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                        }
                    }
                    responseDate.Results = obj;
                    responseDate.Status = ENUM_DanpheHttpResponseText.OK;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                    responseDate.ErrorMessage = ex.Message;
                }
                return responseDate;
            }

        }

        [HttpPost]
        [Route("AddSubLedger")]
        public Task<DanpheHTTPResponse<object>> AddSubLedger(string ledger)
        {
            AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
            using (var dbContextTransaction = accountingDbContext.Database.BeginTransaction())
            {
                DanpheHTTPResponse<object> responseDate = new DanpheHTTPResponse<object>();
                try
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
                    int currHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
                    var subLedger = JsonConvert.DeserializeObject<List<SubLedgerModel>>(ledger);
                    subLedger.ForEach(sub =>
                   {
                       Random subLedgerCodeGenerator = new Random();
                       int subledgerCode = subLedgerCodeGenerator.Next(1, 999999);
                       sub.SubLedgerCode = subledgerCode.ToString();// AccountingTransferData.GetProvisionalSubLedgerCode(accountingDbContext);
                       sub.CreatedBy = currentUser.UserId;
                       sub.CreatedOn = DateTime.Now;
                       sub.HospitalId = currHospitalId;
                       accountingDbContext.SubLedger.Add(sub);
                       accountingDbContext.SaveChanges();
                   });
                    var flag = AccountingTransferData.SubLedgerBalanceHisotrySave(subLedger, accountingDbContext, currHospitalId, currentUser.UserId);
                    if (flag)
                    {
                        dbContextTransaction.Commit();
                        responseDate.Results = subLedger;
                        responseDate.Status = ENUM_DanpheHttpResponseText.OK;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();
                        responseDate.Results = "Unable to add SubLedger";
                        responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                    }
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    responseDate.Status = ENUM_DanpheHttpResponseText.Failed;
                    responseDate.ErrorMessage = ex.Message;
                }
                return Task.FromResult(responseDate);
            }
        }


        [HttpPost]
        [Route("SubLedger")]
        public IActionResult SubLedger([FromBody] List<SubLedgerForMakePayment_DTO> subLedger_DTOs)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddSubLedgerFromMakePayment(subLedger_DTOs, currentUser);
            return InvokeHttpPostFunction(func);
        }

        private object AddSubLedgerFromMakePayment(List<SubLedgerForMakePayment_DTO> subLedger_DTOs, RbacUser currentUser)
        {
            int currHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {List<SubLedgerModel> subLedgers = new List<SubLedgerModel>();
                    var subLedger = new SubLedgerModel();
                    subLedger_DTOs.ForEach(sub =>
                    {                       
                        Random subLedgerCodeGenerator = new Random();
                        int subledgerCode = subLedgerCodeGenerator.Next(1, 999999);
                        subLedger.SubLedgerCode = subledgerCode.ToString(); 
                        subLedger.SubLedgerName = sub.SubLedgerName;
                        subLedger.DrCr = sub.DrCr;
                        subLedger.LedgerId = sub.LedgerId;
                        subLedger.Description= sub.Description;
                        subLedger.IsActive = sub.IsActive;
                        subLedger.CreatedBy= currentUser.UserId;
                        subLedger.CreatedOn=DateTime.Now;
                        subLedger.OpeningBalance= sub.OpeningBalance;
                        subLedger.HospitalId = currHospitalId;
                        subLedger.IsDefault = sub.IsDefault;
                        subLedgers.Add(subLedger);
                    });
                    _accountingDbContext.SubLedger.AddRange(subLedgers);
                    _accountingDbContext.SaveChanges();
                    var flag = AccountingTransferData.SubLedgerBalanceHisotrySave(subLedgers, _accountingDbContext, currHospitalId, currentUser.UserId);

                    if (flag)
                    {
                        subLedger_DTOs.ForEach(sub =>
                        {
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = sub.LedgerId;
                            ledgerMapping.SubLedgerId = subLedger.SubLedgerId;
                            ledgerMapping.LedgerType = sub.LedgerType;
                            ledgerMapping.ReferenceId = (int)sub.ReferenceId;
                            ledgerMapping.HospitalId = currHospitalId;
                            _accountingDbContext.LedgerMappings.Add(ledgerMapping);
                        });
                        
                        _accountingDbContext.SaveChanges();

                        dbContextTransaction.Commit();
                    }
                    else
                    {
                        dbContextTransaction.Rollback();
                    }
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw new Exception("Unable to Post SubLedger.");
                }
                return true;
            }
        }

        [HttpGet]
        [Route("VoucherHeads")]
        public IActionResult GetVoucherHeads()
        {
            //if (reqType == "GetVoucherHead")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);

            Func<object> func = () => (from voc in _accountingDbContext.VoucherHeads
                                       where voc.HospitalId == currentHospitalId
                                       select new
                                       {
                                           VoucherHeadId = voc.VoucherHeadId,
                                           HospitalId = voc.HospitalId,
                                           VoucherHeadName = voc.VoucherHeadName,
                                           IsActive = voc.IsActive,
                                           Description = voc.Description,
                                           CreatedOn = voc.CreatedOn,
                                           CreatedBy = voc.CreatedBy,
                                           IsDefault = voc.IsDefault
                                       }
                                ).OrderBy(a => a.VoucherHeadId).ToList();

            return InvokeHttpGetFunction(func);

            //Func<Task<object>> func = async () => await _medicareService.GetDesignations(_medicareDbContext);
            //return await InvokeHttpGetFunctionAsync(func);

        }

        [HttpGet]
        [Route("Vouchers")]
        public IActionResult GetVouchers()
        {
            //if (reqType == "GetVouchers")

            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);

            Func<object> func = () => (from voc in _accountingDbContext.Vouchers

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
                                           ShowChequeNumber = (voc.ShowChequeNumber == null) ? false : voc.ShowChequeNumber,
                                           ShowPayeeName = (voc.ShowPayeeName == null) ? false : voc.ShowPayeeName
                                       }
                                                               ).OrderBy(a => a.VoucherId).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Ledgers")]
        public IActionResult GetLedgers()
        {
            //(reqType == "GetLedgers")

            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => (from ledger in _accountingDbContext.Ledgers
                                       where ledger.HospitalId == currentHospitalId
                                       select new
                                       {
                                           ledger.HospitalId,
                                           LedgerId = ledger.LedgerId,
                                           LedgerName = ledger.LedgerName,
                                           IsActive = ledger.IsActive
                                       }
                                                         ).OrderBy(a => a.LedgerId).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("LedgerGroups")]
        public IActionResult LedgerGroups()
        {
            //if (reqType == "GetLedgerGroups")
            Func<object> func = () => GetLedgerGroups();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("LedgerGroupsDetails")]
        public IActionResult GetLedgerGroupsDetails()
        {

            //if (reqType == "GetLedgerGroupsDetails")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);

            Func<object> func = () => (from ledgrp in _accountingDbContext.LedgerGroups
                                       where ledgrp.HospitalId == currentHospitalId
                                       select new
                                       {
                                           ledgrp.HospitalId,
                                           ledgrp.PrimaryGroup,
                                           ledgrp.COA,
                                           IsActive = ledgrp.IsActive,
                                           Description = ledgrp.Description,
                                       }
                                      ).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("FiscalYearList")]
        public IActionResult FiscalYearList()
        {
            //if (reqType == "GetFiscalYearList")
            Func<object> func = () => GetFiscalYearList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("CostCenterItemList")]
        public IActionResult GetCostCenterItemList()
        {
            //if (reqType == "GetCostCenterItemList")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => (from costCenter in _accountingDbContext.CostCenterItems
                                       where costCenter.HospitalId == currentHospitalId
                                       select new
                                       {
                                           CostCenterItemId = costCenter.CostCenterItemId,
                                           CostCenterItemName = costCenter.CostCenterItemName,
                                           Description = costCenter.Description,
                                           IsActive = costCenter.IsActive
                                       }).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("ChartofAccount")]
        public IActionResult GetChartofAccount()
        {
            //if (reqType == "GetChartofAccount")
            Func<object> func = () => (from chartofAcc in _accountingDbContext.ChartOfAccounts

                                       select new
                                       {
                                           ChartOfAccountId = chartofAcc.ChartOfAccountId,
                                           ChartOfAccountName = chartofAcc.ChartOfAccountName,
                                           Description = chartofAcc.Description,
                                           IsActive = chartofAcc.IsActive,
                                           COACode = chartofAcc.COACode,
                                           PrimaryGroupId = chartofAcc.PrimaryGroupId
                                       }).ToList<object>();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("LedgersList")]
        public IActionResult LedgersList()
        {
            //if (reqType == "LedgersList")
            Func<object> func = () => GetLedgersList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("SectionsList")]
        public IActionResult GetSectionsList()
        {
            //if (reqType == "SectionsList")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            Func<object> func = () => (from s in _accountingDbContext.Section
                                       where s.HospitalId == currentHospitalId
                                       select new
                                       {
                                           s.HospitalId,
                                           s.SectionId,
                                           s.SectionName,
                                           s.SectionCode
                                       }).ToList();
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("PharmacySupplier")]
        public IActionResult GetPharmacySupplier()
        {
            //if (reqType == "phrm-supplier")
            Func<object> func = () => (from s in _accountingDbContext.PHRMSupplier
                                       select new
                                       {
                                           s.SupplierId,
                                           s.SupplierName
                                       }).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("Employee")]
        public IActionResult GetEmployee()
        {
            //if (reqType == "get-employee")
            Func<object> func = () => (from emp in _accountingDbContext.Emmployees
                                       select new
                                       {
                                           emp.EmployeeId,
                                           EmployeeName = emp.FullName,
                                       }).ToList();
            return InvokeHttpGetFunction(func);

        }

        [HttpGet]
        [Route("PrimaryList")]
        public IActionResult GetPrimaryList()
        {
            //(reqType == "get-primary-list")

            Func<object> func = () => (_accountingDbContext.PrimaryGroup.Where(p => p.IsActive == true).ToList<object>());
            return InvokeHttpGetFunction(func);
        }

        [HttpGet]
        [Route("TransferRules")]
        public IActionResult TrasferRuleDataBySectionId(int SectionId)
        {
            //if (reqType == "getTrasferRuleDataBySectionId")
            Func<object> func = () => GetTrasferRuleDataBySectionId(SectionId);
            return InvokeHttpGetFunction(func);

        }


        // GET: api/values
        //[HttpGet]
        //public string Get(string reqType, int voucherId, int ledgergroupId, int SectionId)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

        //    try
        //    {

        //        //if (reqType == "GetVoucherHead")
        //        //{

        //        //    var Voucherhead = (from voc in accountingDbContext.VoucherHeads
        //        //                       where voc.HospitalId == currentHospitalId
        //        //                       select new
        //        //                       {
        //        //                           VoucherHeadId = voc.VoucherHeadId,
        //        //                           HospitalId = voc.HospitalId,
        //        //                           VoucherHeadName = voc.VoucherHeadName,
        //        //                           IsActive = voc.IsActive,
        //        //                           Description = voc.Description,
        //        //                           CreatedOn = voc.CreatedOn,
        //        //                           CreatedBy = voc.CreatedBy,
        //        //                           IsDefault = voc.IsDefault
        //        //                       }
        //        //                    ).ToList().OrderBy(a => a.VoucherHeadId);
        //        //    responseData.Results = Voucherhead;
        //        //    responseData.Status = "OK";
        //        //}

        //        //else
        //        //if (reqType == "GetVouchers")
        //        //{

        //        //    var Voucher = (from voc in accountingDbContext.Vouchers
        //        //                   select new
        //        //                   {
        //        //                       VoucherId = voc.VoucherId,
        //        //                       VoucherName = voc.VoucherName,
        //        //                       VoucherCode = voc.VoucherCode,
        //        //                       IsActive = voc.IsActive,
        //        //                       Description = voc.Description,
        //        //                       CreatedOn = voc.CreatedOn,
        //        //                       CreatedBy = voc.CreatedBy,
        //        //                       ISCopyDescription = voc.ISCopyDescription,
        //        //                       ShowChequeNumber = (voc.ShowChequeNumber == null) ? false : voc.ShowChequeNumber,
        //        //                       ShowPayeeName = (voc.ShowPayeeName == null) ? false : voc.ShowPayeeName
        //        //                   }
        //        //                    ).ToList().OrderBy(a => a.VoucherId);
        //        //    responseData.Results = Voucher;
        //        //    responseData.Status = "OK";
        //        //}

        //        //else 
        //        //if
        //        //    (reqType == "GetLedgers")
        //        //{
        //        //    var ledgers = (from ledger in accountingDbContext.Ledgers
        //        //                   where ledger.HospitalId == currentHospitalId
        //        //                   select new
        //        //                   {
        //        //                       ledger.HospitalId,
        //        //                       LedgerId = ledger.LedgerId,
        //        //                       LedgerName = ledger.LedgerName,
        //        //                       IsActive = ledger.IsActive
        //        //                   }).ToList().OrderBy(a => a.LedgerId);
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = ledgers;
        //        //}
        //        //else

        //        //if (reqType == "GetLedgerGroups")
        //        //{
        //        //    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
        //        //    //for this resolution we have temp solution
        //        //    //we have saved accPrimary id in parameter table so, we will return this hospital records here
        //        //    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
        //        //    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
        //        //    //if user have only one hsopital permission then automatically activate this hospital
        //        //    var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDbContext);
        //        //    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
        //        //                           where ledgrp.HospitalId == HospId
        //        //                           select new
        //        //                           {
        //        //                               ledgrp.HospitalId,
        //        //                               ledgrp.LedgerGroupId,
        //        //                               ledgrp.PrimaryGroup,
        //        //                               ledgrp.COA,
        //        //                               ledgrp.LedgerGroupName,
        //        //                               ledgrp.IsActive,
        //        //                               ledgrp.Description,
        //        //                               ledgrp.Name
        //        //                           }
        //        //                          ).ToList<object>();
        //        //    responseData = AccountingBL.CheckResponseObject(LedgerGrouplist, "Ledger Group");
        //        //}

        //        //else


        //        //if (reqType == "GetLedgerGroupsDetails")
        //        //{
        //        //    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
        //        //                           where ledgrp.HospitalId == currentHospitalId
        //        //                           select new
        //        //                           {
        //        //                               ledgrp.HospitalId,
        //        //                               ledgrp.PrimaryGroup,
        //        //                               ledgrp.COA,
        //        //                               IsActive = ledgrp.IsActive,
        //        //                               Description = ledgrp.Description,
        //        //                           }
        //        //                          ).ToList();
        //        //    responseData.Results = LedgerGrouplist;
        //        //    responseData.Status = "OK";

        //        //}

        //        //else 

        //        //if (reqType == "GetFiscalYearList")
        //        //{
        //        //    var currentDate = DateTime.Now.Date;
        //        //    var fiscalYearList = (from fsYear in accountingDbContext.FiscalYears
        //        //                          where fsYear.HospitalId == currentHospitalId
        //        //                          select new
        //        //                          {
        //        //                              FiscalYearId = fsYear.FiscalYearId,
        //        //                              HospitalId = fsYear.HospitalId,//sud-nagesh:20Jun'20
        //        //                              FiscalYearName = fsYear.FiscalYearName,
        //        //                              StartDate = fsYear.StartDate,
        //        //                              EndDate = fsYear.EndDate,
        //        //                              Description = fsYear.Description,
        //        //                              IsActive = fsYear.IsActive,
        //        //                              CurrentDate = currentDate,
        //        //                              IsClosed = fsYear.IsClosed,
        //        //                              showreopen = (fsYear.IsClosed == true) ? true : false

        //        //                          }).ToList().OrderByDescending(p => p.FiscalYearId);
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = fiscalYearList;
        //        //}
        //        //else 

        //        //if (reqType == "GetCostCenterItemList")
        //        //{
        //        //    var costCenterList = (from costCenter in accountingDbContext.CostCenterItems
        //        //                          where costCenter.HospitalId == currentHospitalId
        //        //                          select new
        //        //                          {
        //        //                              CostCenterItemId = costCenter.CostCenterItemId,
        //        //                              CostCenterItemName = costCenter.CostCenterItemName,
        //        //                              Description = costCenter.Description,
        //        //                              IsActive = costCenter.IsActive
        //        //                          }).ToList();
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = costCenterList;
        //        //}
        //        //else 

        //        //if (reqType == "GetChartofAccount")
        //        //{
        //        //    var chartOfAccountList = (from chartofAcc in accountingDbContext.ChartOfAccounts

        //        //                              select new
        //        //                              {
        //        //                                  ChartOfAccountId = chartofAcc.ChartOfAccountId,
        //        //                                  ChartOfAccountName = chartofAcc.ChartOfAccountName,
        //        //                                  Description = chartofAcc.Description,
        //        //                                  IsActive = chartofAcc.IsActive,
        //        //                                  COACode = chartofAcc.COACode,
        //        //                                  PrimaryGroupId = chartofAcc.PrimaryGroupId
        //        //                              }).ToList<object>();
        //        //    responseData = AccountingBL.CheckResponseObject(chartOfAccountList, "Chart of account");
        //        //}
        //        //else


        //        //if (reqType == "LedgersList")
        //        //{
        //        //    var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDbContext);
        //        //    var dToday = DateTime.Now.Date;
        //        //    var CurrentFYId = AccountingTransferData.GetFiscalYearIdByDate(accountingDbContext, dToday, HospId);
        //        //    List<SqlParameter> paramList = new List<SqlParameter>()
        //        //                {
        //        //                        new SqlParameter("@HospitalId", HospId),
        //        //                        new SqlParameter("@FiscalYearIdForOpeningBal",null),
        //        //                        new SqlParameter("@GetClosingBal", null)
        //        //                };
        //        //    var spDataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetLedgerList", paramList, accountingDbContext);
        //        //    var resultStr = JsonConvert.SerializeObject(spDataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
        //        //    var ledgerList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = ledgerList;
        //        //}
        //        //else

        //        //if (reqType == "SectionsList")
        //        //{
        //        //    var sections = (from s in accountingDbContext.Section
        //        //                    where s.HospitalId == currentHospitalId
        //        //                    select new
        //        //                    {
        //        //                        s.HospitalId,
        //        //                        s.SectionId,
        //        //                        s.SectionName,
        //        //                        s.SectionCode
        //        //                    }).ToList();
        //        //    responseData.Results = sections;
        //        //    responseData.Status = "OK";
        //        //}
        //        //else 

        //        //if (reqType == "phrm-supplier")
        //        //{
        //        //    var supplier = (from s in accountingDbContext.PHRMSupplier
        //        //                    select new
        //        //                    {
        //        //                        s.SupplierId,
        //        //                        s.SupplierName
        //        //                    }).ToList();
        //        //    responseData.Results = supplier;
        //        //    responseData.Status = "OK";
        //        //}

        //        //else 

        //        //if (reqType == "get-employee")
        //        //{
        //        //    var supplier = (from emp in accountingDbContext.Emmployees
        //        //                    select new
        //        //                    {
        //        //                        emp.EmployeeId,
        //        //                        EmployeeName = emp.FullName  // emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
        //        //                    }).ToList();
        //        //    responseData.Results = supplier;
        //        //    responseData.Status = "OK";
        //        //}

        //        //else


        //        //if (reqType == "get-primary-list")
        //        //{
        //        //    var primaryGroupList = accountingDbContext.PrimaryGroup.Where(p => p.IsActive == true).ToList<object>();
        //        //    responseData = AccountingBL.CheckResponseObject(primaryGroupList, "Primary Group");
        //        //    responseData.Status = "OK";
        //        //}
        //        //else 


        //                if (reqType == "getTrasferRuleDataBySectionId")
        //                {
        //                    var section = accountingDbContext.Section.Where(s => s.SectionId == SectionId).FirstOrDefault();
        //        var transferRulesData = (from m in accountingDbContext.GroupMapping
        //                                 where m.Section == SectionId
        //                                 join s in accountingDbContext.HospitalTransferRuleMappings on m.GroupMappingId equals s.TransferRuleId
        //                                 where s.HospitalId == currentHospitalId
        //                                 select new
        //                                 {
        //                                     SectionName = section.SectionName,
        //                                     ruleName = m.Description,
        //                                     IsActive = s.IsActive,
        //                                     groupMappingId = m.GroupMappingId,
        //                                     VoucherName = accountingDbContext.Vouchers.AsQueryable()
        //                                                    .Where(t => t.VoucherId == m.VoucherId)
        //                                                    .Select(i => i.VoucherName).FirstOrDefault(),
        //                                     customVoucherName = accountingDbContext.Vouchers.AsQueryable()
        //                                                    .Where(t => t.VoucherId == m.CustomVoucherId)
        //                                                    .Select(i => i.VoucherName).FirstOrDefault(),

        //                                 }).ToList();
        //        responseData.Results = transferRulesData;
        //                    responseData.Status = "OK";
        //                }
        //}
        //            catch (Exception ex)
        //{
        //    string str = ex.InnerException.Message.ToString();
        //    responseData.Status = "Failed";
        //    responseData.ErrorMessage = ex.Message;
        //}
        //return DanpheJSONConvert.SerializeObject(responseData);

        //        }

        [HttpPost]
        [Route("Ledgers")]
        public IActionResult AddLedgers()
        {
            //if (reqType == "AddLedgers")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddingLedgers(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LedgersList")]
        public IActionResult PostLedgersList()
        {
            //if (reqType == "AddLedgersList")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddLedgerList(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("Vouchers")]
        public IActionResult Vouchers()
        {
            //if (reqType == "AddVouchers")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddVouchers(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("VoucherHead")]
        public IActionResult VoucherHead()
        {
            //if (reqType == "AddVoucherHead")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddVoucherHead(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);

        }

        [HttpPost]
        [Route("LedgersGroup")]
        public IActionResult LedgersGroup()
        {
            //if (reqType == "AddLedgersGroup")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddLedgersGroup(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("CostCenterItem")]
        public IActionResult CostCenterItem()
        {
            //if (reqType == "AddCostCenterItem")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddCostCenterItem(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("LedgerGroupCategory")]
        public IActionResult LedgerGroupCategory()
        {
            //if (reqType == "AddLedgerGroupCategory")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddLedgerGroupCategory(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("Section")]
        public IActionResult Section()
        {
            //if (reqType == "AddSection") 
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => AddSection(ipDataStr);
            return InvokeHttpPostFunction(func);
        }

        [HttpPost]
        [Route("ChartOfAccount")]
        public IActionResult ChartOfAccount()
        {
            //if (reqType == "AddCOA")
            string ipDataStr = this.ReadPostData();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            Func<object> func = () => AddChartOfAccount(ipDataStr, currentUser);
            return InvokeHttpPostFunction(func);
        }


        // POST api/values
        //[HttpPost]
        //public string Post()
        //{
        //    //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
        //    responseData.Status = "OK";//by default status would be OK, hence assigning at the top
        //    AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
        //    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

        //    try
        //    {
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");
        //        string companyName = this.ReadQueryStringData("companyName");



        //        //if (reqType == "AddLedgers")
        //        //{
        //        //    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
        //        //    //check for duplicate and don't allow to addd if found.
        //        //    //match with current hospital id, and don't allow to add same ledger. 
        //        //    if (accountingDBContext.Ledgers.Any(r => r.LedgerGroupId == ledger.LedgerGroupId && r.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower() && r.HospitalId == currentHospitalId))
        //        //    {
        //        //        responseData.Status = "Failed";
        //        //        responseData.ErrorMessage = "we found ledger existed. Duplicate ledger not allowed";
        //        //    }
        //        //    else
        //        //    {
        //        //        using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //        //        {
        //        //            try
        //        //            {
        //        //                ledger.CreatedOn = System.DateTime.Now;
        //        //                ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
        //        //                ledger.HospitalId = currentHospitalId;
        //        //                ledger.LedgerName = ledger.LedgerName.Trim();
        //        //                accountingDBContext.Ledgers.Add(ledger);
        //        //                accountingDBContext.SaveChanges();
        //        //                AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, ledger);
        //        //                if (ledger.LedgerType == "pharmacysupplier")
        //        //                {
        //        //                    LedgerMappingModel ledgerMapping = new LedgerMappingModel();
        //        //                    ledgerMapping.LedgerId = ledger.LedgerId;
        //        //                    ledgerMapping.LedgerType = ledger.LedgerType;
        //        //                    ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
        //        //                    ledgerMapping.HospitalId = currentHospitalId;
        //        //                    accountingDBContext.LedgerMappings.Add(ledgerMapping);
        //        //                }
        //        //                accountingDBContext.SaveChanges();

        //        //                var flag = DanpheEMR.AccTransfer.AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId, currentUser.EmployeeId);
        //        //                // Dev: 4 Jan '23 : Add Default SubLedger for each ledger 
        //        //                var subLedger = new SubLedgerModel();
        //        //                subLedger.SubLedgerName = "Default SubLedger";
        //        //                subLedger.IsDefault = true;
        //        //                subLedger.OpeningBalance = 0;
        //        //                subLedger.DrCr = true;
        //        //                subLedger.Description = "Default subledger inserted during ledger creation.";
        //        //                subLedger.IsActive = true;
        //        //                subLedger.LedgerId = ledger.LedgerId;
        //        //                subLedger.SubLedgerCode = AccountingTransferData.GetProvisionalSubLedgerCode(accountingDBContext);
        //        //                subLedger.CreatedBy = currentUser.UserId;
        //        //                subLedger.CreatedOn = DateTime.Now;
        //        //                subLedger.HospitalId = currentHospitalId;
        //        //                accountingDBContext.SubLedger.Add(subLedger);
        //        //                var SubLedgerList = new List<SubLedgerModel>();
        //        //                SubLedgerList.Add(subLedger);
        //        //                accountingDBContext.SaveChanges();
        //        //                flag = AccountingTransferData.SubLedgerBalanceHisotrySave(SubLedgerList, accountingDBContext, currentHospitalId, currentUser.UserId);

        //        //                if (flag)
        //        //                {
        //        //                    responseData.Results = ledger;
        //        //                    responseData.Status = "OK";
        //        //                    dbContextTransaction.Commit();
        //        //                }
        //        //                else
        //        //                {
        //        //                    responseData.Status = "Failed";
        //        //                    dbContextTransaction.Rollback();
        //        //                }

        //        //            }
        //        //            catch (Exception ex)
        //        //            {
        //        //                dbContextTransaction.Rollback();
        //        //                throw ex;
        //        //            }
        //        //        }
        //        //    }

        //        //}
        //        //if (reqType == "AddLedgersList")
        //        //{
        //        //    InventoryDbContext inventoryDBContext = new InventoryDbContext(connString);
        //        //    List<LedgerModel> Ledgrs = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
        //        //    bool ledBalnce = false;
        //        //    using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //        //    {
        //        //        try
        //        //        {

        //        //            Ledgrs.ForEach(ledger =>
        //        //             {
        //        //                 //first create ledger if not existing, then update balance history for different types of ledgers.

        //        //                 //Part:1--- Create ledger.. or Update LedgerInformation.
        //        //                 if (ledger.LedgerId == 0)
        //        //                 {
        //        //                     var existedled = accountingDBContext.Ledgers.Where(l => l.LedgerGroupId == ledger.LedgerGroupId && l.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower())
        //        //                    .FirstOrDefault();
        //        //                     if (existedled == null)
        //        //                     {
        //        //                         ledger.CreatedOn = System.DateTime.Now;
        //        //                         ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
        //        //                         ledger.IsActive = true;
        //        //                         ledger.HospitalId = currentHospitalId;
        //        //                         accountingDBContext.Ledgers.Add(ledger);
        //        //                         accountingDBContext.SaveChanges();
        //        //                         AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, ledger);
        //        //                         ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId, currentUser.EmployeeId);

        //        //                         // Dev: 4 Jan '23 : Add Default SubLedger for each ledger 
        //        //                         var subLedger = new SubLedgerModel();
        //        //                         subLedger.SubLedgerName = "Default SubLedger";
        //        //                         subLedger.IsDefault = true;
        //        //                         subLedger.OpeningBalance = 0;
        //        //                         subLedger.DrCr = true;
        //        //                         subLedger.Description = "Default subledger inserted during ledger creation.";
        //        //                         subLedger.IsActive = true;
        //        //                         subLedger.LedgerId = ledger.LedgerId;
        //        //                         subLedger.SubLedgerCode = AccountingTransferData.GetProvisionalSubLedgerCode(accountingDBContext);
        //        //                         subLedger.CreatedBy = currentUser.UserId;
        //        //                         subLedger.CreatedOn = DateTime.Now;
        //        //                         subLedger.HospitalId = currentHospitalId;
        //        //                         accountingDBContext.SubLedger.Add(subLedger);
        //        //                         var SubLedgerList = new List<SubLedgerModel>();
        //        //                         SubLedgerList.Add(subLedger);
        //        //                         accountingDBContext.SaveChanges();
        //        //                         ledBalnce = AccountingTransferData.SubLedgerBalanceHisotrySave(SubLedgerList, accountingDBContext, currentHospitalId, currentUser.UserId);
        //        //                     }
        //        //                     else
        //        //                     {
        //        //                         ledger.LedgerId = existedled.LedgerId;
        //        //                     }

        //        //                 }
        //        //                 else
        //        //                 {
        //        //                     //hospitalid can't be udated in Existing ledger so no need to check... 
        //        //                     var existLedger = accountingDBContext.Ledgers.Where(l => l.LedgerId == ledger.LedgerId && l.HospitalId == currentHospitalId).FirstOrDefault();
        //        //                     if (existLedger != null)
        //        //                     {
        //        //                         existLedger.LedgerId = ledger.LedgerId;
        //        //                         existLedger.LedgerName = ledger.LedgerName;
        //        //                         existLedger.Description = ledger.Description;
        //        //                         existLedger.DrCr = ledger.DrCr;
        //        //                         existLedger.IsActive = ledger.IsActive;
        //        //                         existLedger.PANNo = ledger.PANNo;
        //        //                         existLedger.Address = ledger.Address;
        //        //                         existLedger.MobileNo = ledger.MobileNo;
        //        //                         existLedger.LandlineNo = ledger.LandlineNo;
        //        //                         existLedger.LedgerType = ledger.LedgerType;
        //        //                         existLedger.LedgerReferenceId = ledger.LedgerReferenceId;
        //        //                         accountingDBContext.Ledgers.Attach(existLedger);
        //        //                         accountingDBContext.Entry(existLedger).State = EntityState.Modified;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.LedgerName).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.Description).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.DrCr).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.IsActive).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.PANNo).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.Address).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.MobileNo).IsModified = true;
        //        //                         accountingDBContext.Entry(existLedger).Property(x => x.LandlineNo).IsModified = true;
        //        //                         accountingDBContext.SaveChanges();
        //        //                         ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(existLedger, accountingDBContext, false, currentHospitalId, currentUser.EmployeeId);

        //        //                     }
        //        //                 }


        //        //                 //Part:2 --- Update LedgerMapping table for certain types eg: Consultant, PharmacySupplier, Inv-Vendors, etc.. 

        //        //                 if (!string.IsNullOrEmpty(ledger.LedgerType))
        //        //                 {
        //        //                     if (ledger.LedgerType != "billingincomeledger")
        //        //                     {
        //        //                         var lederMapData = accountingDBContext.LedgerMappings.Where(l =>
        //        //                                                                                  l.HospitalId == currentHospitalId &&
        //        //                                                                                  l.ReferenceId == (int)ledger.LedgerReferenceId
        //        //                                                                                  && l.LedgerType.ToLower() == ledger.LedgerType.ToLower()).FirstOrDefault();

        //        //                         //if null then it will create new mapping, else update existing ledger. 
        //        //                         if (lederMapData == null)
        //        //                         {
        //        //                             LedgerMappingModel ledgerMapping = new LedgerMappingModel();
        //        //                             ledgerMapping.LedgerId = ledger.LedgerId;
        //        //                             ledgerMapping.LedgerType = ledger.LedgerType;
        //        //                             ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
        //        //                             ledgerMapping.HospitalId = currentHospitalId;
        //        //                             accountingDBContext.LedgerMappings.Add(ledgerMapping);
        //        //                         }
        //        //                         else
        //        //                         {
        //        //                             //hospitalid not required for existing ledger-mappings
        //        //                             lederMapData.LedgerId = ledger.LedgerId;
        //        //                             accountingDBContext.LedgerMappings.Attach(lederMapData);
        //        //                             accountingDBContext.Entry(lederMapData).State = EntityState.Modified;
        //        //                             accountingDBContext.Entry(lederMapData).Property(x => x.LedgerId).IsModified = true;
        //        //                         }

        //        //                         //We need to update also in Inventory Table if current request is for InvSubcategory.
        //        //                         if (ledger.LedgerType == "inventorysubcategory")
        //        //                         {
        //        //                             var subcateogryData = inventoryDBContext.ItemSubCategoryMaster.Where(l => l.SubCategoryId == (int)ledger.LedgerReferenceId).FirstOrDefault();
        //        //                             if (subcateogryData != null)
        //        //                             {
        //        //                                 subcateogryData.LedgerId = ledger.LedgerId;
        //        //                                 inventoryDBContext.ItemSubCategoryMaster.Attach(subcateogryData);
        //        //                                 inventoryDBContext.Entry(subcateogryData).State = EntityState.Modified;
        //        //                                 inventoryDBContext.Entry(subcateogryData).Property(x => x.LedgerId).IsModified = true;

        //        //                             }
        //        //                         }
        //        //                     }
        //        //                     else
        //        //                     {
        //        //                         // insert and upate ledger mapping table for billing service department ledger
        //        //                         var BillinglederMapData = accountingDBContext.AccountBillLedgerMapping.Where(l =>
        //        //                                                                                      l.HospitalId == currentHospitalId &&
        //        //                                                                                      l.ServiceDepartmentId == (int)ledger.ServiceDepartmentId && l.ItemId == ledger.ItemId).FirstOrDefault();

        //        //                         if (BillinglederMapData == null)
        //        //                         {
        //        //                             AccountingBillLedgerMappingModel ledgerMapping = new AccountingBillLedgerMappingModel();
        //        //                             ledgerMapping.LedgerId = ledger.LedgerId;
        //        //                             ledgerMapping.ServiceDepartmentId = (int)ledger.ServiceDepartmentId;
        //        //                             ledgerMapping.ItemId = ledger.ItemId;
        //        //                             ledgerMapping.HospitalId = currentHospitalId;
        //        //                             accountingDBContext.AccountBillLedgerMapping.Add(ledgerMapping);
        //        //                         }
        //        //                         else
        //        //                         {
        //        //                             //hospitalid not required for existing ledger-mappings
        //        //                             BillinglederMapData.LedgerId = ledger.LedgerId;
        //        //                             accountingDBContext.AccountBillLedgerMapping.Attach(BillinglederMapData);
        //        //                             accountingDBContext.Entry(BillinglederMapData).State = EntityState.Modified;
        //        //                             accountingDBContext.Entry(BillinglederMapData).Property(x => x.LedgerId).IsModified = true;
        //        //                         }
        //        //                         accountingDBContext.SaveChanges();
        //        //                     }
        //        //                 }

        //        //             });

        //        //            inventoryDBContext.SaveChanges();
        //        //            accountingDBContext.SaveChanges();
        //        //            if (ledBalnce)
        //        //            {
        //        //                responseData.Results = Ledgrs;
        //        //                responseData.Status = "OK";
        //        //                dbContextTransaction.Commit();
        //        //            }
        //        //            else
        //        //            {
        //        //                responseData.Status = "Failed";
        //        //                dbContextTransaction.Rollback();
        //        //            }

        //        //        }
        //        //        catch (Exception ex)
        //        //        {
        //        //            throw ex;
        //        //        }
        //        //    }


        //        //}
        //        //else



        //        //if (reqType == "AddVouchers")
        //        //{
        //        //    VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(str);
        //        //    voucher.CreatedOn = System.DateTime.Now;
        //        //    voucher.CreatedBy = currentUser.UserId;
        //        //    accountingDBContext.Vouchers.Add(voucher);
        //        //    accountingDBContext.SaveChanges();
        //        //    responseData.Results = voucher;
        //        //    responseData.Status = "OK";
        //        //}

        //        //else



        //        //if (reqType == "AddVoucherHead")
        //        //{
        //        //    VoucherHeadModel voucherHead = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(str);
        //        //    if (accountingDBContext.VoucherHeads.Any(x => x.HospitalId == currentHospitalId && x.VoucherHeadId == voucherHead.VoucherHeadId && x.VoucherHeadName == voucherHead.VoucherHeadName))
        //        //    {
        //        //        responseData.Status = "Failed";
        //        //    }
        //        //    else
        //        //    {
        //        //        voucherHead.CreatedOn = System.DateTime.Now;
        //        //        voucherHead.CreatedBy = currentUser.UserId;
        //        //        voucherHead.HospitalId = currentHospitalId;
        //        //        accountingDBContext.VoucherHeads.Add(voucherHead);
        //        //        accountingDBContext.SaveChanges();
        //        //        responseData.Results = voucherHead;
        //        //        responseData.Status = "OK";
        //        //    }
        //        //}

        //        //else



        //        //if (reqType == "AddLedgersGroup")
        //        //{
        //        //    LedgerGroupModel ledgerGrpData = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
        //        //    if (accountingDBContext.LedgerGroups.Any(lg =>
        //        //    lg.HospitalId == currentHospitalId //sud-nagesh:20Jun'20-for HospitalSeparation
        //        //    && lg.LedgerGroupName == ledgerGrpData.LedgerGroupName
        //        //    && lg.COA == ledgerGrpData.COA
        //        //    && lg.PrimaryGroup == ledgerGrpData.PrimaryGroup))
        //        //    {
        //        //        responseData.Status = "Failed";
        //        //    }
        //        //    else
        //        //    {
        //        //        ledgerGrpData.CreatedOn = DateTime.Now;
        //        //        ledgerGrpData.CreatedBy = currentUser.UserId;
        //        //        ledgerGrpData.HospitalId = currentHospitalId;//sud-nagesh:20Jun'20-for HospitalSeparation
        //        //        var maxCode = accountingDBContext.LedgerGroups.AsQueryable()
        //        //                            .Where(t => t.HospitalId == currentHospitalId && t.IsActive == true)
        //        //                            .Select(i => i.Code).DefaultIfEmpty().ToList().Max(t => Convert.ToInt32(t));
        //        //        ledgerGrpData.Code = Convert.ToString(maxCode + 1);
        //        //        accountingDBContext.LedgerGroups.Add(ledgerGrpData);
        //        //        accountingDBContext.SaveChanges();
        //        //        responseData.Results = ledgerGrpData;
        //        //        responseData.Status = "OK";
        //        //    }
        //        //}
        //        //else 

        //        //if (reqType == "AddCostCenterItem")
        //        //{
        //        //    CostCenterItemModel costCenterMod = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(str);
        //        //    costCenterMod.CreatedOn = System.DateTime.Now;
        //        //    costCenterMod.CreatedBy = currentUser.UserId;
        //        //    costCenterMod.HospitalId = currentHospitalId;
        //        //    accountingDBContext.CostCenterItems.Add(costCenterMod);
        //        //    accountingDBContext.SaveChanges();

        //        //    responseData.Status = "OK";
        //        //    responseData.Results = costCenterMod;
        //        //}
        //        //else 


        //        //if (reqType == "AddLedgerGroupCategory")
        //        //{
        //        //    LedgerGroupCategoryModel ledGrpCatMod = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(str);
        //        //    ledGrpCatMod.CreatedOn = System.DateTime.Now;
        //        //    ledGrpCatMod.CreatedBy = currentUser.UserId;
        //        //    accountingDBContext.LedgerGroupsCategory.Add(ledGrpCatMod);
        //        //    accountingDBContext.SaveChanges();

        //        //    var curtLedGrpCategoryData = (from ledgrpCat in accountingDBContext.LedgerGroupsCategory
        //        //                                  join chartOfAcc in accountingDBContext.ChartOfAccounts on ledgrpCat.ChartOfAccountId equals chartOfAcc.ChartOfAccountId
        //        //                                  where ledgrpCat.LedgerGroupCategoryId == ledGrpCatMod.LedgerGroupCategoryId
        //        //                                  select new
        //        //                                  {
        //        //                                      LedgerGroupCategoryId = ledgrpCat.LedgerGroupCategoryId,
        //        //                                      LedgerGroupCategoryName = ledgrpCat.LedgerGroupCategoryName,
        //        //                                      ChartOfAccountName = chartOfAcc.ChartOfAccountName,
        //        //                                      Description = ledgrpCat.Description,
        //        //                                      IsActive = ledgrpCat.IsActive,
        //        //                                      IsDebit = ledgrpCat.IsDebit,
        //        //                                  });
        //        //    responseData.Status = "OK";
        //        //    responseData.Results = curtLedGrpCategoryData;
        //        //}
        //        //else



        //        //if (reqType == "AddSection")
        //        //{
        //        //    AccSectionModel section = DanpheJSONConvert.DeserializeObject<AccSectionModel>(str);
        //        //    section.HospitalId = currentHospitalId;
        //        //    accountingDBContext.Section.Add(section);
        //        //    accountingDBContext.SaveChanges();
        //        //    responseData.Results = section;
        //        //    responseData.Status = "OK";
        //        //}
        //        //else

        //        if (reqType == "AddCOA")
        //        {
        //            ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(str);
        //            coa.CreatedOn = System.DateTime.Now;
        //            coa.CreatedBy = currentUser.UserId;
        //            coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(accountingDBContext, coa);
        //            accountingDBContext.ChartOfAccounts.Add(coa);
        //            accountingDBContext.SaveChanges();
        //            responseData.Results = coa;
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

        [HttpPut]
        [Route("LedgerISActive")]
        public IActionResult EditLedgerISActive()
        {
            //if (reqType == "ledgerISActive")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateLedgerISActive(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("ReopenFiscalYear")]
        public IActionResult EditReopenFiscalYear()
        {
            //if (reqType == "reopen-fiscal-year")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateReopenFiscalYear(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("LedgerGroupActivateDeactivate")]
        public IActionResult EditLedgerGroupActivateDeactivate()
        {
            //if (reqType == "updateLedgerGrpIsActive")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateLedgerGroupActivateDeactivate(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("LedgerGroup")]
        public IActionResult EditLedgerGroup()
        {
            // if (reqType == "updateLedgerGroup")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateLedgerGroup(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("CostCenterItemStatus")]
        public IActionResult EditCostCenterItemStatus()
        {
            //if (reqType == "updateCostCenterItemStatus")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateCostCenterItemStatus(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("LedgerGroupCategoryActivateDeactivate")]
        public IActionResult EditLedgerGroupCategoryActivateDeactivate()
        {
            //if (reqType == "updateLedgerGrpCategoryIsActive")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateLedgerGroupCategoryActivateDeactivate(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("Ledger")]
        public IActionResult EditLedger()
        {
            // if (reqType == "UpdateLedger")
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateLedger(ipDataStr, currentUser);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("VoucherHead")]
        public IActionResult EditVoucherHead()
        {
            // if (reqType == "UpdateVoucherHead")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateVoucherHead(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("Section")]
        public IActionResult EditSection()
        {
            //   if (reqType == "UpdateSection")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateSection(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("ChartOfAccount")]
        public IActionResult EditChartOfAccount()
        {
            //if (reqType == "UpdateCOA")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateChartOfAccount(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("TransferRuleActivateDeactivate")]
        public IActionResult EditTransferRulesActive()
        {
            //if (reqType == "UpdateTransferRulesActive")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateTransferRulesActive(ipDataStr);
            return InvokeHttpPutFunction(func);
        }
        [HttpPut]
        [Route("VoucherShowChequeNo")]
        public IActionResult EditVoucherShowChequeNo()
        {
            //if (reqType == "VoucherShowChequeNo")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateVoucherShowChequeNo(ipDataStr);
            return InvokeHttpPutFunction(func);
        }

        [HttpPut]
        [Route("VoucherShowPayeeName")]
        public IActionResult EditVoucherShowPayeeName()
        {
            //if (reqType == "VoucherShowPayeeName")
            string ipDataStr = this.ReadPostData();
            Func<object> func = () => UpdateVoucherShowPayeeName(ipDataStr);
            return InvokeHttpPutFunction(func);
        }





        // PUT api/values/5
        //[HttpPut]
        //public string Update(/*string reqType*/)
        //{
        //    DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
        //    AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
        //    //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        //    int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

        //    try
        //    {
        //        //string str = Request.Form.Keys.First<string>();
        //        string str = this.ReadPostData();
        //        string reqType = this.ReadQueryStringData("reqType");
        //        RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
        //        if (!String.IsNullOrEmpty(str))
        //        {

        //if (reqType == "ledgerISActive")
        //{

        //    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
        //    accountingDBContext.Ledgers.Attach(ledger);
        //    accountingDBContext.Entry(ledger).Property(x => x.IsActive).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Results = ledger;
        //    responseData.Status = "OK";

        //}
        //else


        //if (reqType == "reopen-fiscal-year")
        //{
        //    try
        //    {FiscalYearModel fs = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);
        //        DataTable fiscalYearDT = accountingDBContext.ReOpenFiscalYear(fs.FiscalYearId, currentUser.EmployeeId, currentHospitalId, fs.Remark);
        //        var resultStr = JsonConvert.SerializeObject(fiscalYearDT, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
        //        var fiscalYearList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
        //        responseData.Results = fiscalYearList;
        //        responseData.Status = "OK";
        //    }
        //    catch (Exception ex)
        //    {
        //        
        //        responseData.Status = "Failed";
        //        throw ex;
        //    }

        //}
        //else 

        //if (reqType == "updateLedgerGrpIsActive")
        //{
        //    LedgerGroupModel ledgerGrp = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
        //    accountingDBContext.LedgerGroups.Attach(ledgerGrp);
        //    accountingDBContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = ledgerGrp;
        //}
        //else

        //if (reqType == "updateLedgerGroup")
        //{
        //    LedgerGroupModel ledgerGroup = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
        //    var ledgerGrp = accountingDBContext.LedgerGroups.Where(x => x.LedgerGroupId == ledgerGroup.LedgerGroupId && x.HospitalId == currentHospitalId).FirstOrDefault();//sud-nagesh:20Jun'20-for HospitalSeparation
        //    if (ledgerGrp != null)
        //    {
        //        ledgerGrp.COA = ledgerGroup.COA;
        //        ledgerGrp.Description = ledgerGroup.Description;
        //        ledgerGrp.IsActive = ledgerGroup.IsActive;
        //        ledgerGrp.LedgerGroupName = ledgerGroup.LedgerGroupName;
        //        ledgerGrp.ModifiedBy = ledgerGroup.ModifiedBy;
        //        ledgerGrp.ModifiedOn = System.DateTime.Now;
        //        ledgerGrp.PrimaryGroup = ledgerGroup.PrimaryGroup;
        //        accountingDBContext.LedgerGroups.Attach(ledgerGrp);
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.COA).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.Description).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.LedgerGroupName).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.ModifiedBy).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.ModifiedOn).IsModified = true;
        //        accountingDBContext.Entry(ledgerGrp).Property(x => x.PrimaryGroup).IsModified = true;
        //        accountingDBContext.SaveChanges();
        //        responseData.Results = ledgerGrp;
        //        responseData.Status = "OK";
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}

        //else


        //if (reqType == "updateCostCenterItemStatus")
        //{
        //    CostCenterItemModel ccImodel = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(str);
        //    accountingDBContext.CostCenterItems.Attach(ccImodel);
        //    accountingDBContext.Entry(ccImodel).Property(x => x.IsActive).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = ccImodel;
        //}
        //else 

        //if (reqType == "updateLedgerGrpCategoryIsActive")
        //{
        //    LedgerGroupCategoryModel ledgerGrpCat = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(str);
        //    accountingDBContext.LedgerGroupsCategory.Attach(ledgerGrpCat);
        //    accountingDBContext.Entry(ledgerGrpCat).Property(x => x.IsActive).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Status = "OK";
        //    responseData.Results = ledgerGrpCat;
        //}
        //else


        //if (reqType == "UpdateLedger")
        //{
        //    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
        //    var led = accountingDBContext.Ledgers.Where(s => s.LedgerId == ledger.LedgerId).FirstOrDefault();

        //    using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
        //    {
        //        try
        //        {

        //            if (led != null)
        //            {
        //                led.IsActive = ledger.IsActive;
        //                led.LedgerName = ledger.LedgerName;
        //                led.OpeningBalance = ledger.OpeningBalance;
        //                led.Description = ledger.Description;
        //                led.IsCostCenterApplicable = ledger.IsCostCenterApplicable;
        //                led.DrCr = ledger.DrCr;
        //                led.PANNo = ledger.PANNo;
        //                led.Address = ledger.Address;
        //                led.MobileNo = ledger.MobileNo;
        //                led.CreditPeriod = ledger.CreditPeriod;
        //                led.TDSPercent = ledger.TDSPercent;
        //                led.LandlineNo = ledger.LandlineNo;
        //                led.LedgerGroupId = ledger.LedgerGroupId;
        //                led.LegalLedgerName = ledger.LegalLedgerName;
        //                accountingDBContext.Ledgers.Attach(led);
        //                accountingDBContext.Entry(led).Property(x => x.IsActive).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.LedgerName).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.Description).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.DrCr).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.IsCostCenterApplicable).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.OpeningBalance).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.PANNo).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.Address).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.MobileNo).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.CreditPeriod).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.TDSPercent).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.LandlineNo).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.LedgerGroupId).IsModified = true;
        //                accountingDBContext.Entry(led).Property(x => x.LegalLedgerName).IsModified = true;

        //                accountingDBContext.SaveChanges();

        //                var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId, currentUser.EmployeeId);

        //                if (flag)
        //                {
        //                    responseData.Status = "OK";
        //                    responseData.Results = led;
        //                    dbContextTransaction.Commit();
        //                }
        //                else
        //                {
        //                    responseData.Status = "Failed";
        //                    dbContextTransaction.Rollback();
        //                }
        //            }
        //            else
        //            {
        //                responseData.Status = "Failed";
        //            }

        //        }
        //        catch (Exception ex)
        //        {
        //            dbContextTransaction.Rollback();
        //            throw ex;
        //        }
        //    }

        //}

        //else

        //if (reqType == "UpdateVoucherHead")
        //{
        //    VoucherHeadModel voucher = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(str);
        //    var voucherHead = accountingDBContext.VoucherHeads.Where(s => s.VoucherHeadId == voucher.VoucherHeadId).FirstOrDefault();

        //    if (voucherHead != null)
        //    {
        //        voucherHead.IsActive = voucher.IsActive;
        //        voucherHead.VoucherHeadName = voucher.VoucherHeadName;
        //        voucherHead.Description = voucher.Description;
        //        voucherHead.ModifiedOn = System.DateTime.Now;
        //        voucherHead.ModifiedBy = voucher.ModifiedBy;
        //        voucherHead.IsDefault = voucher.IsDefault;

        //        accountingDBContext.VoucherHeads.Attach(voucherHead);
        //        accountingDBContext.Entry(voucherHead).Property(x => x.IsActive).IsModified = true;
        //        accountingDBContext.Entry(voucherHead).Property(x => x.VoucherHeadName).IsModified = true;
        //        accountingDBContext.Entry(voucherHead).Property(x => x.Description).IsModified = true;
        //        accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedOn).IsModified = true;
        //        accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedBy).IsModified = true;
        //        accountingDBContext.Entry(voucherHead).Property(x => x.IsDefault).IsModified = true;
        //        accountingDBContext.SaveChanges();
        //        if (voucher.IsDefault == true)
        //        {
        //            accountingDBContext.VoucherHeads.Where(v => v.VoucherHeadId != voucher.VoucherHeadId).ToList().ForEach(i => i.IsDefault = false);
        //            accountingDBContext.SaveChanges();
        //        }
        //        responseData.Status = "OK";
        //        responseData.Results = voucherHead;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}

        //else

        //if (reqType == "UpdateSection")
        //{
        //    AccSectionModel clientsection = DanpheJSONConvert.DeserializeObject<AccSectionModel>(str);

        //    var section = accountingDBContext.Section.Where(s => s.SectionId == clientsection.SectionId).FirstOrDefault();

        //    if (section != null)
        //    {
        //        section.SectionId = clientsection.SectionId;
        //        section.SectionName = clientsection.SectionName;
        //        section.SectionCode = clientsection.SectionCode;

        //        accountingDBContext.Section.Attach(section);
        //        accountingDBContext.Entry(section).Property(x => x.SectionId).IsModified = true;
        //        accountingDBContext.Entry(section).Property(x => x.SectionName).IsModified = true;
        //        accountingDBContext.Entry(section).Property(x => x.SectionCode).IsModified = true;
        //        accountingDBContext.SaveChanges();
        //        responseData.Status = "OK";
        //        responseData.Results = section;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}
        //else 



        //if (reqType == "UpdateCOA")
        //{
        //    ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(str);

        //    var coaobj = accountingDBContext.ChartOfAccounts.Where(s => s.ChartOfAccountId == coa.ChartOfAccountId).FirstOrDefault();
        //    coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(accountingDBContext, coa);
        //    if (coaobj != null)
        //    {
        //        coaobj.ChartOfAccountName = coa.ChartOfAccountName;
        //        coaobj.COACode = coa.COACode;
        //        coaobj.PrimaryGroupId = coa.PrimaryGroupId;
        //        coaobj.Description = coa.Description;

        //        accountingDBContext.ChartOfAccounts.Attach(coaobj);
        //        accountingDBContext.Entry(coaobj).Property(x => x.ChartOfAccountName).IsModified = true;
        //        accountingDBContext.Entry(coaobj).Property(x => x.COACode).IsModified = true;
        //        accountingDBContext.Entry(coaobj).Property(x => x.PrimaryGroupId).IsModified = true;
        //        accountingDBContext.Entry(coaobj).Property(x => x.Description).IsModified = true;
        //        accountingDBContext.SaveChanges();
        //        responseData.Status = "OK";
        //        responseData.Results = coaobj;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}
        //else

        //if (reqType == "UpdateTransferRulesActive")
        //{
        //    string rulename = DanpheJSONConvert.DeserializeObject<string>(str);
        //    var groupMappingId = accountingDBContext.GroupMapping.Where(s => s.Description == rulename)
        //                                                            .Select(i => i.GroupMappingId).FirstOrDefault();

        //    if (groupMappingId > 0)
        //    {
        //        var TransferRule = accountingDBContext.HospitalTransferRuleMappings.Where(s => s.TransferRuleId == groupMappingId).FirstOrDefault();
        //        TransferRule.IsActive = (TransferRule.IsActive == true) ? false : true;
        //        accountingDBContext.HospitalTransferRuleMappings.Attach(TransferRule);
        //        accountingDBContext.Entry(TransferRule).Property(x => x.IsActive).IsModified = true;
        //        accountingDBContext.SaveChanges();
        //        responseData.Status = "OK";
        //        responseData.Results = TransferRule;
        //    }
        //    else
        //    {
        //        responseData.Status = "Failed";
        //    }
        //}
        //else

        //if (reqType == "VoucherShowChequeNo")
        //{

        //    VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(str);
        //    accountingDBContext.Vouchers.Attach(voucher);
        //    accountingDBContext.Entry(voucher).Property(x => x.ShowChequeNumber).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Results = voucher;
        //    responseData.Status = "OK";

        //}
        //else


        //if (reqType == "VoucherShowPayeeName")
        //{

        //    VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(str);
        //    accountingDBContext.Vouchers.Attach(voucher);
        //    accountingDBContext.Entry(voucher).Property(x => x.ShowPayeeName).IsModified = true;
        //    accountingDBContext.SaveChanges();
        //    responseData.Results = voucher;
        //    responseData.Status = "OK";

        //}

        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        responseData.Status = "Failed";
        //        responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
        //    }
        //    return DanpheJSONConvert.SerializeObject(responseData, true);
        //}

        // DELETE api/values/5



        [HttpPost]
        [Route("CostCenter")]
        public async Task<IActionResult> PostCostCenter([FromBody] CostCenterModel costCenter)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            CostCenterModelDTO costCenterDTO = new CostCenterModelDTO();
            try
            {
                //costCenter.CostCenterId = costCenter.CostCenterId;
                var latestCostCenter = _accountingDbContext.CostCenters.OrderByDescending(o => o.CostCenterId).FirstOrDefault();

                int latestCostcenterId = 0;
                if (latestCostCenter != null)
                {
                    latestCostcenterId = latestCostCenter.CostCenterId + 1;
                }
                else
                {
                    latestCostcenterId = 1;
                }
                costCenter.CostCenterCode = latestCostcenterId.ToString().PadLeft(5, '0');

                costCenter.CreatedBy = currentUser.EmployeeId;
                costCenter.CreatedOn = DateTime.Now;

                if (costCenter.ParentCostCenterId == null || costCenter.ParentCostCenterId == 0)
                {
                    costCenter.HierarchyLevel = 0;
                }
                else
                {
                    costCenter.HierarchyLevel = costCenter.HierarchyLevel + 1;
                }
                _accountingDbContext.CostCenters.Add(costCenter);
                await _accountingDbContext.SaveChangesAsync();

                costCenterDTO.CostCenterId = costCenter.CostCenterId;
                costCenterDTO.CostCenterName = costCenter.CostCenterName;
                costCenterDTO.ParentCostCenterId = costCenter.ParentCostCenterId;
                costCenterDTO.Description = costCenter.Description;
                costCenterDTO.IsActive = costCenter.IsActive;
                costCenterDTO.HierarchyLevel=costCenter.HierarchyLevel;


                if (costCenter.ParentCostCenterId != 0)
                {
                    var ParentCostCenterDetail = _accountingDbContext.CostCenters.Where(p => p.CostCenterId == costCenter.ParentCostCenterId).FirstOrDefault();
                    if (ParentCostCenterDetail != null)
                    {
                        costCenterDTO.ParentCostCenterName = ParentCostCenterDetail.CostCenterName;
                    }
                    costCenterDTO.CostCenterId = costCenter.CostCenterId;
                    costCenterDTO.CostCenterName = costCenter.CostCenterName;
                    costCenterDTO.ParentCostCenterId = costCenter.ParentCostCenterId;
                    costCenterDTO.Description = costCenter.Description;
                    costCenterDTO.IsActive = costCenter.IsActive;
                }
                else
                {
                    costCenterDTO.ParentCostCenterName = "N/A";

                }
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = costCenterDTO;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.Results = ex.ToString();
            }
            return Ok(responseData);

        }

        [HttpGet]
        [Route("CostCenters")]
        public async Task<IActionResult> GetCostCenters()
        {
            Func<Task<object>> func = async () => await GetAllCostCenters();
            return await InvokeHttpGetFunctionAsync(func);
        }






        [HttpPut]
        [Route("CostCenter")]
        public async Task<IActionResult> UpdateCostCenter([FromBody] CostCenterModel costCenter)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            try
            {
                var costCenterDetail = await _accountingDbContext.CostCenters.Where(cc => cc.CostCenterId == costCenter.CostCenterId).FirstOrDefaultAsync();
                costCenterDetail.ModifiedBy = currentUser.EmployeeId;
                costCenterDetail.ModifiedOn = DateTime.Now;
                costCenterDetail.CostCenterName = costCenter.CostCenterName;
                costCenterDetail.ParentCostCenterId = costCenter.ParentCostCenterId;
                costCenterDetail.Description = costCenter.Description;
                costCenterDetail.HierarchyLevel = costCenter.HierarchyLevel;
                costCenterDetail.IsDefault = costCenter.IsDefault;
                await _accountingDbContext.SaveChangesAsync();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = costCenterDetail;


            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.Results = ex.ToString();
            }
            return Ok(responseData);

        }

        [HttpGet]
        [Route("GetParentCostCenters")]
        public async Task<IActionResult> GetParentCostCenters()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            try
            {
                var costCenters = await _accountingDbContext.CostCenters.Where(r => r.ParentCostCenterId == 0 || r.HierarchyLevel < 2).Select(a => new
                {
                    ParentCostCenterId = a.CostCenterId,
                    ParentCostCenterName = a.CostCenterName,       
                    HierarchyLevel = a.HierarchyLevel
                }).ToListAsync();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = costCenters;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.Results = ex.ToString();
            }
            return Ok(responseData);
        }


        [HttpPut]
        [Route("CostCenter/ActivateDeactivate")]
        public async Task<IActionResult> ActivateDeactivateCostCenter()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>(ENUM_SessionVariables.CurrentUser);
            try
            {
                string str = this.ReadPostData();
                CostCenterModel costCenter = DanpheJSONConvert.DeserializeObject<CostCenterModel>(str);
                var costCenterDetail = await _accountingDbContext.CostCenters.Where(cc => cc.CostCenterId == costCenter.CostCenterId).FirstOrDefaultAsync();
                costCenterDetail.ModifiedBy = currentUser.EmployeeId;
                costCenterDetail.ModifiedOn = DateTime.Now;
                costCenterDetail.IsActive = !costCenterDetail.IsActive;
                _accountingDbContext.CostCenters.Attach(costCenterDetail);
                _accountingDbContext.Entry(costCenterDetail).Property(x => x.ModifiedBy).IsModified = true;
                _accountingDbContext.Entry(costCenterDetail).Property(x => x.ModifiedOn).IsModified = true;
                _accountingDbContext.Entry(costCenterDetail).Property(x => x.IsActive).IsModified = true;
                await _accountingDbContext.SaveChangesAsync();
                responseData.Status = ENUM_DanpheHttpResponseText.OK;
                responseData.Results = costCenterDetail.IsActive;
            }
            catch (Exception ex)
            {
                responseData.Status = ENUM_DanpheHttpResponseText.Failed;
                responseData.Results = ex.ToString();
            }
            return Ok(responseData);

        }


        private async Task<object> GetAllCostCenters()
        {
            var costCenters = await _accountingDbContext.CostCenters.Select(cc => new
            {
                CostCenterId = cc.CostCenterId,
                CostCenterCode = cc.CostCenterCode,
                CostCenterName = cc.CostCenterName,
                ParentCostCenterId = cc.ParentCostCenterId,
                ParentCostCenterName = (_accountingDbContext.CostCenters.Where(parent => parent.CostCenterId == cc.ParentCostCenterId).Select(parent => parent.CostCenterName)),
                BusinessCenterName = cc.BusinessCenterName,
                Description = cc.Description,
                IsDefault = cc.IsDefault,
                IsActive = cc.IsActive,
                HierarchyLevel = cc.HierarchyLevel
            }).ToListAsync();
            return costCenters;
        }
        private object GetLedgerGroups()
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
            var LedgerGrouplist = (from ledgrp in _accountingDbContext.LedgerGroups
                                   where ledgrp.HospitalId == HospId
                                   select new
                                   {
                                       ledgrp.HospitalId,
                                       ledgrp.LedgerGroupId,
                                       ledgrp.PrimaryGroup,
                                       ledgrp.COA,
                                       ledgrp.LedgerGroupName,
                                       ledgrp.IsActive,
                                       ledgrp.Description,
                                       ledgrp.Name
                                   }
                                  ).ToList<object>();
            return LedgerGrouplist;
        }
        private object GetFiscalYearList()
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            var currentDate = DateTime.Now.Date;
            var fiscalYearList = (from fsYear in _accountingDbContext.FiscalYears
                                  where fsYear.HospitalId == currentHospitalId
                                  select new
                                  {
                                      FiscalYearId = fsYear.FiscalYearId,
                                      HospitalId = fsYear.HospitalId,//sud-nagesh:20Jun'20
                                      FiscalYearName = fsYear.FiscalYearName,
                                      StartDate = fsYear.StartDate,
                                      EndDate = fsYear.EndDate,
                                      Description = fsYear.Description,
                                      IsActive = fsYear.IsActive,
                                      CurrentDate = currentDate,
                                      IsClosed = fsYear.IsClosed,
                                      showreopen = (fsYear.IsClosed == true) ? true : false

                                  }).ToList().OrderByDescending(p => p.FiscalYearId);

            return fiscalYearList;

        }
        private object GetLedgersList()
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(_accountingDbContext);
            var dToday = DateTime.Now.Date;
            var CurrentFYId = AccountingTransferData.GetFiscalYearIdByDate(_accountingDbContext, dToday, HospId);
            List<SqlParameter> paramList = new List<SqlParameter>()
                                {
                                        new SqlParameter("@HospitalId", HospId),
                                        new SqlParameter("@FiscalYearIdForOpeningBal",null),
                                        new SqlParameter("@GetClosingBal", null)
                                };
            var spDataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetLedgerList", paramList, _accountingDbContext);
            var resultStr = JsonConvert.SerializeObject(spDataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
            var ledgerList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
            return ledgerList;
        }
        private object GetTrasferRuleDataBySectionId(int SectionId)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            var section = _accountingDbContext.Section.Where(s => s.SectionId == SectionId).FirstOrDefault();
            var transferRulesData = (from m in _accountingDbContext.GroupMapping
                                     where m.Section == SectionId
                                     join s in _accountingDbContext.HospitalTransferRuleMappings on m.GroupMappingId equals s.TransferRuleId
                                     where s.HospitalId == currentHospitalId
                                     select new
                                     {
                                         SectionName = section.SectionName,
                                         ruleName = m.Description,
                                         IsActive = s.IsActive,
                                         groupMappingId = m.GroupMappingId,
                                         VoucherName = _accountingDbContext.Vouchers.AsQueryable()
                                                        .Where(t => t.VoucherId == m.VoucherId)
                                                        .Select(i => i.VoucherName).FirstOrDefault(),
                                         customVoucherName = _accountingDbContext.Vouchers.AsQueryable()
                                                        .Where(t => t.VoucherId == m.CustomVoucherId)
                                                        .Select(i => i.VoucherName).FirstOrDefault(),

                                     }).ToList();
            return transferRulesData;
        }
        private object AddingLedgers(string ipDataStr, RbacUser currentUser)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(ipDataStr);
            //check for duplicate and don't allow to addd if found.
            //match with current hospital id, and don't allow to add same ledger. 
            if (_accountingDbContext.Ledgers.Any(r => r.LedgerGroupId == ledger.LedgerGroupId && r.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower() && r.HospitalId == currentHospitalId))
            {

                throw new Exception("we found ledger existed. Duplicate ledger not allowed");
            }
            else
            {
                using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
                {
                    try
                    {
                        ledger.CreatedOn = System.DateTime.Now;
                        /*Manipal-RevisionNeeded*/
                        /*HighPrioRevision: DevN 7th March'23-- Generating random ledgerCode Previous Max+1 logic not working for manipal */

                        Random ledgerCodeGenerator = new Random();
                        int ledgerCode = ledgerCodeGenerator.Next(1, 999999);
                        ledger.Code = ledgerCode.ToString(); //AccountingTransferData.GetProvisionalLedgerCode(_accountingDbContext, currentHospitalId);
                        ledger.HospitalId = currentHospitalId;
                        ledger.LedgerName = ledger.LedgerName.Trim();
                        _accountingDbContext.Ledgers.Add(ledger);
                        _accountingDbContext.SaveChanges();
                        AccountingTransferData.AddLedgerForClosedFiscalYears(_accountingDbContext, ledger);
                        if (ledger.LedgerType == "pharmacysupplier")
                        {
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = ledger.LedgerId;
                            ledgerMapping.LedgerType = ledger.LedgerType;
                            ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                            ledgerMapping.HospitalId = currentHospitalId;
                            _accountingDbContext.LedgerMappings.Add(ledgerMapping);
                        }
                        _accountingDbContext.SaveChanges();

                        var flag = DanpheEMR.AccTransfer.AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, _accountingDbContext, false, currentHospitalId, currentUser.EmployeeId);
                        // Dev: 4 Jan '23 : Add Default SubLedger for each ledger 
                        var subLedger = new SubLedgerModel();
                        subLedger.SubLedgerName = "Default";
                        subLedger.IsDefault = true;
                        subLedger.OpeningBalance = 0;
                        subLedger.DrCr = true;
                        subLedger.Description = "Default subledger inserted during ledger creation.";
                        subLedger.IsActive = true;
                        subLedger.LedgerId = ledger.LedgerId;
                        /*Manipal-RevisionNeeded*/
                        /*HighPrioRevision: DevN 7th March'23-- Generating random SubLedgerCode Previous Max+1 logic not working for manipal */

                        Random subLedgerCodeGenerator = new Random();
                        int subledgerCode = subLedgerCodeGenerator.Next(1, 999999);
                        subLedger.SubLedgerCode = subledgerCode.ToString();// AccountingTransferData.GetProvisionalSubLedgerCode(_accountingDbContext);
                        subLedger.CreatedBy = currentUser.UserId;
                        subLedger.CreatedOn = DateTime.Now;
                        subLedger.HospitalId = currentHospitalId;
                        _accountingDbContext.SubLedger.Add(subLedger);
                        var SubLedgerList = new List<SubLedgerModel>();
                        SubLedgerList.Add(subLedger);
                        _accountingDbContext.SaveChanges();
                        flag = AccountingTransferData.SubLedgerBalanceHisotrySave(SubLedgerList, _accountingDbContext, currentHospitalId, currentUser.UserId);

                        if (flag)
                        {
                            dbContextTransaction.Commit();
                            return ledger;
                        }
                        else
                        {

                            dbContextTransaction.Rollback();
                            throw new Exception("unable to save ledger");
                        }

                    }
                    catch (Exception ex)
                    {
                        dbContextTransaction.Rollback();
                        throw ex;
                    }

                }

            }
        }
        private object AddLedgerList(string ipDataStr, RbacUser currentUser)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            InventoryDbContext inventoryDBContext = new InventoryDbContext(connString);
            List<LedgerModel> Ledgrs = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(ipDataStr);
            var subLedgerParam = _accountingDbContext.CFGParameters.Where(a => a.ParameterGroupName == "Accounting" && a.ParameterName == "SubLedgerAndCostCenter").FirstOrDefault().ParameterValue;
            var parmValue = DanpheJSONConvert.DeserializeObject<SubLedgerAndCostCenterConfig_DTO>(subLedgerParam);
            bool ledBalnce = false;
            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {

                    Ledgrs.ForEach(ledger =>
                    {
                        //first create ledger if not existing, then update balance history for different types of ledgers.

                        //Part:1--- Create ledger.. or Update LedgerInformation.
                        if (ledger.LedgerId == 0)
                        {
                            var existedled = _accountingDbContext.Ledgers.Where(l => l.LedgerGroupId == ledger.LedgerGroupId && l.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower())
                           .FirstOrDefault();
                            if (existedled == null)
                            {
                                //led.CreatedOn = System.DateTime.Now;
                                /*Manipal-RevisionNeeded*/
                                /*HighPrioRevision: DevN 7th March'23-- Generating random ledgerCode Previous Max+1 logic not working for manipal */

                                Random ledgerCodeGenerator = new Random();
                                int ledgerCode = ledgerCodeGenerator.Next(1, 999999);
                                ledger.Code = ledgerCode.ToString(); //countingTransferData.GetProvisionalLedgerCode(_accountingDbContext, currentHospitalId);
                                ledger.IsActive = true;
                                ledger.CreatedBy = currentUser.EmployeeId;
                                ledger.CreatedOn = DateTime.Now;
                                ledger.HospitalId = currentHospitalId;
                                _accountingDbContext.Ledgers.Add(ledger);
                                _accountingDbContext.SaveChanges();
                                AccountingTransferData.AddLedgerForClosedFiscalYears(_accountingDbContext, ledger);
                                ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, _accountingDbContext, false, currentHospitalId, currentUser.EmployeeId);
                            }
                            else
                            {
                                ledger.LedgerId = existedled.LedgerId;
                            }

                        }
                        else
                        {
                            //hospitalid can't be udated in Existing ledger so no need to check... 
                            var existLedger = _accountingDbContext.Ledgers.Where(l => l.LedgerId == ledger.LedgerId && l.HospitalId == currentHospitalId).FirstOrDefault();
                            if (existLedger != null)
                            {
                                existLedger.LedgerId = ledger.LedgerId;
                                existLedger.LedgerName = ledger.LedgerName;
                                existLedger.Description = ledger.Description;
                                existLedger.DrCr = ledger.DrCr;
                                existLedger.IsActive = ledger.IsActive;
                                existLedger.PANNo = ledger.PANNo;
                                existLedger.Address = ledger.Address;
                                existLedger.MobileNo = ledger.MobileNo;
                                existLedger.LandlineNo = ledger.LandlineNo;
                                existLedger.LedgerType = ledger.LedgerType;
                                existLedger.LedgerReferenceId = ledger.LedgerReferenceId;
                                existLedger.OpeningBalance = ledger.OpeningBalance;
                                _accountingDbContext.Ledgers.Attach(existLedger);
                                _accountingDbContext.Entry(existLedger).State = EntityState.Modified;
                                _accountingDbContext.Entry(existLedger).Property(x => x.LedgerName).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.Description).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.DrCr).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.IsActive).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.PANNo).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.Address).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.MobileNo).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.LandlineNo).IsModified = true;
                                _accountingDbContext.Entry(existLedger).Property(x => x.OpeningBalance).IsModified = true;
                                _accountingDbContext.SaveChanges();
                                ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(existLedger, _accountingDbContext, false, currentHospitalId, currentUser.EmployeeId);
                            }
                        }

                        var existedSubLedger = _accountingDbContext.SubLedger.Where(sub => sub.LedgerId == ledger.LedgerId && sub.SubLedgerName.Trim().ToLower() == ledger.SubLedgerName.Trim().ToLower()).FirstOrDefault();
                        if (existedSubLedger == null && parmValue.EnableSubLedger)
                        {
                            // Dev: 4 Jan '23 : Add Default SubLedger for each ledger 
                            var subLedger = new SubLedgerModel();
                            subLedger.SubLedgerName = ledger.SubLedgerName == "" ? ledger.LedgerName : ledger.SubLedgerName;
                            subLedger.IsDefault = true;
                            subLedger.OpeningBalance = ledger.OpeningBalance;
                            subLedger.DrCr = true;
                            subLedger.Description = "Default subledger";
                            subLedger.IsActive = true;
                            subLedger.LedgerId = ledger.LedgerId;
                            /*Manipal-RevisionNeeded*/
                            /*HighPrioRevision: DevN 7th March'23-- Generating random SuuLedgerCode Previous Max+1 logic not working for manipal */

                            Random subLedgerCodeGenerator = new Random();
                            int subledgerCode = subLedgerCodeGenerator.Next(1, 999999);
                            subLedger.SubLedgerCode = subledgerCode.ToString(); //AccountingTransferData.GetProvisionalSubLedgerCode(_accountingDbContext);
                            subLedger.CreatedBy = currentUser.UserId;
                            subLedger.CreatedOn = DateTime.Now;
                            subLedger.HospitalId = currentHospitalId;
                            _accountingDbContext.SubLedger.Add(subLedger);
                            var SubLedgerList = new List<SubLedgerModel>();
                            SubLedgerList.Add(subLedger);
                            _accountingDbContext.SaveChanges();
                            ledBalnce = AccountingTransferData.SubLedgerBalanceHisotrySave(SubLedgerList, _accountingDbContext, currentHospitalId, currentUser.UserId);
                            ledger.SubLedgerId = subLedger.SubLedgerId;
                        }
                        else
                        {
                            ledger.SubLedgerId = existedSubLedger != null ? (int?)existedSubLedger.SubLedgerId : null;

                        }


                        //Part:2 --- Update LedgerMapping table for certain types eg: Consultant, PharmacySupplier, Inv-Vendors, etc.. 

                        if (!string.IsNullOrEmpty(ledger.LedgerType))
                        {
                            if (ledger.LedgerType != "billingincomeledger")
                            {
                                var lederMapData = _accountingDbContext.LedgerMappings.Where(l =>
                                                                                         l.HospitalId == currentHospitalId &&
                                                                                         l.ReferenceId == (int)ledger.LedgerReferenceId
                                                                                         && l.LedgerType.ToLower() == ledger.LedgerType.ToLower()).FirstOrDefault();

                                //if null then it will create new mapping, else update existing ledger. 
                                if (lederMapData == null)
                                {
                                    LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                                    ledgerMapping.LedgerId = ledger.LedgerId;
                                    ledgerMapping.LedgerType = ledger.LedgerType;
                                    ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                                    ledgerMapping.HospitalId = currentHospitalId;
                                    //ledgerMapping.CostCenterId = ledger.CostCenterId;
                                    ledgerMapping.SubLedgerId = ledger.SubLedgerId;
                                    _accountingDbContext.LedgerMappings.Add(ledgerMapping);
                                }
                                else
                                {
                                    //hospitalid not required for existing ledger-mappings
                                    lederMapData.LedgerId = ledger.LedgerId;
                                   // lederMapData.CostCenterId = ledger.CostCenterId;
                                    lederMapData.SubLedgerId = ledger.SubLedgerId;
                                    _accountingDbContext.LedgerMappings.Attach(lederMapData);
                                    _accountingDbContext.Entry(lederMapData).State = EntityState.Modified;
                                    _accountingDbContext.SaveChanges();
                                }

                                //We need to update also in Inventory Table if current request is for InvSubcategory.
                                if (ledger.LedgerType == "inventorysubcategory")
                                {
                                    var subcateogryData = inventoryDBContext.ItemSubCategoryMaster.Where(l => l.SubCategoryId == (int)ledger.LedgerReferenceId).FirstOrDefault();
                                    if (subcateogryData != null)
                                    {
                                        subcateogryData.LedgerId = ledger.LedgerId;
                                        inventoryDBContext.ItemSubCategoryMaster.Attach(subcateogryData);
                                        inventoryDBContext.Entry(subcateogryData).State = EntityState.Modified;
                                        inventoryDBContext.Entry(subcateogryData).Property(x => x.LedgerId).IsModified = true;

                                    }
                                }
                            }
                            else
                            {
                                // insert and upate ledger mapping table for billing service department ledger
                                var BillinglederMapData = _accountingDbContext.AccountBillLedgerMapping.Where(l =>
                                                                                             l.HospitalId == currentHospitalId &&
                                                                                             l.ServiceDepartmentId == (int)ledger.ServiceDepartmentId && l.ItemId == ledger.ItemId).FirstOrDefault();

                                if (BillinglederMapData == null)
                                {
                                    AccountingBillLedgerMappingModel ledgerMapping = new AccountingBillLedgerMappingModel();
                                    ledgerMapping.LedgerId = ledger.LedgerId;
                                    ledgerMapping.ServiceDepartmentId = (int)ledger.ServiceDepartmentId;
                                    ledgerMapping.ItemId = (int)ledger.ItemId;
                                    ledgerMapping.HospitalId = currentHospitalId;
                                    ledgerMapping.SubLedgerId = ledger.SubLedgerId;
                                    _accountingDbContext.AccountBillLedgerMapping.Add(ledgerMapping);
                                }
                                else
                                {
                                    //hospitalid not required for existing ledger-mappings
                                    BillinglederMapData.LedgerId = ledger.LedgerId;
                                    BillinglederMapData.SubLedgerId = ledger.SubLedgerId;
                                    _accountingDbContext.AccountBillLedgerMapping.Attach(BillinglederMapData);
                                    _accountingDbContext.Entry(BillinglederMapData).State = EntityState.Modified;
                                    _accountingDbContext.Entry(BillinglederMapData).Property(x => x.LedgerId).IsModified = true;
                                }
                                _accountingDbContext.SaveChanges();
                            }
                        }

                    });

                    inventoryDBContext.SaveChanges();
                    _accountingDbContext.SaveChanges();
                    if (ledBalnce)
                    {
                        dbContextTransaction.Commit();
                        return Ledgrs;
                    }
                    else
                    {

                        dbContextTransaction.Rollback();
                        throw new Exception("Failed to add ledger");
                    }

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }



        }
        private object AddVouchers(string ipDataStr, RbacUser currentUser)
        {
            VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(ipDataStr);

            voucher.CreatedOn = System.DateTime.Now;
            voucher.CreatedBy = currentUser.UserId;
            _accountingDbContext.Vouchers.Add(voucher);
            _accountingDbContext.SaveChanges();
            return voucher;
        }
        private object AddVoucherHead(string ipDataStr, RbacUser currentUser)

        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            VoucherHeadModel voucherHead = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(ipDataStr);
            if (_accountingDbContext.VoucherHeads.Any(x => x.HospitalId == currentHospitalId && x.VoucherHeadId == voucherHead.VoucherHeadId && x.VoucherHeadName == voucherHead.VoucherHeadName))
            {
                throw new Exception("failed to add voucherhead");
            }
            else
            {
                voucherHead.CreatedOn = System.DateTime.Now;
                voucherHead.CreatedBy = currentUser.UserId;
                voucherHead.HospitalId = currentHospitalId;
                _accountingDbContext.VoucherHeads.Add(voucherHead);
                _accountingDbContext.SaveChanges();
                return voucherHead;
            }
        }
        private object AddLedgersGroup(string ipDataStr, RbacUser currentUser)
        {

            //if (reqType == "AddLedgersGroup")
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            LedgerGroupModel ledgerGrpData = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(ipDataStr);
            if (_accountingDbContext.LedgerGroups.Any(lg => lg.HospitalId == currentHospitalId && lg.LedgerGroupName == ledgerGrpData.LedgerGroupName
            && lg.COA == ledgerGrpData.COA
            && lg.PrimaryGroup == ledgerGrpData.PrimaryGroup))
            {
                throw new Exception("failed to add ledgersgroup");
            }
            else
            {
                ledgerGrpData.CreatedOn = DateTime.Now;
                ledgerGrpData.CreatedBy = currentUser.UserId;
                ledgerGrpData.HospitalId = currentHospitalId;//sud-nagesh:20Jun'20-for HospitalSeparation

                /*Manipal-RevisionNeeded*/
                /*HighPrioRevision: DevN 7th March'23-- Generating random LedgerGroupCode Previous Max+1 logic not working for manipal */

                //var maxCode = _accountingDbContext.LedgerGroups.AsQueryable()
                //                    .Where(t => t.HospitalId == currentHospitalId && t.IsActive == true)
                //                    .Select(i => i.Code).DefaultIfEmpty().ToList().Max(t => Convert.ToInt32(t));

                Random ledgerGroupCodeGenerator = new Random();
                int ledgerGroupCode = ledgerGroupCodeGenerator.Next(1, 999999);
                ledgerGrpData.Code = ledgerGroupCode.ToString();
                _accountingDbContext.LedgerGroups.Add(ledgerGrpData);
                _accountingDbContext.SaveChanges();
                return ledgerGrpData;
            }
        }
        private object AddCostCenterItem(string ipDataStr, RbacUser currentUser)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            CostCenterItemModel costCenterMod = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(ipDataStr);
            costCenterMod.CreatedOn = System.DateTime.Now;
            costCenterMod.CreatedBy = currentUser.UserId;
            costCenterMod.HospitalId = currentHospitalId;
            _accountingDbContext.CostCenterItems.Add(costCenterMod);
            _accountingDbContext.SaveChanges();
            return costCenterMod;


        }
        private object AddLedgerGroupCategory(string ipDataStr, RbacUser currentUser)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            LedgerGroupCategoryModel ledGrpCatMod = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(ipDataStr);
            ledGrpCatMod.CreatedOn = System.DateTime.Now;
            ledGrpCatMod.CreatedBy = currentUser.UserId;
            _accountingDbContext.LedgerGroupsCategory.Add(ledGrpCatMod);
            _accountingDbContext.SaveChanges();

            var curtLedGrpCategoryData = (from ledgrpCat in _accountingDbContext.LedgerGroupsCategory
                                          join chartOfAcc in _accountingDbContext.ChartOfAccounts on ledgrpCat.ChartOfAccountId equals chartOfAcc.ChartOfAccountId
                                          where ledgrpCat.LedgerGroupCategoryId == ledGrpCatMod.LedgerGroupCategoryId
                                          select new
                                          {
                                              LedgerGroupCategoryId = ledgrpCat.LedgerGroupCategoryId,
                                              LedgerGroupCategoryName = ledgrpCat.LedgerGroupCategoryName,
                                              ChartOfAccountName = chartOfAcc.ChartOfAccountName,
                                              Description = ledgrpCat.Description,
                                              IsActive = ledgrpCat.IsActive,
                                              IsDebit = ledgrpCat.IsDebit,
                                          });

            return curtLedGrpCategoryData;


        }
        private object AddSection(string ipDataStr)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            AccSectionModel section = DanpheJSONConvert.DeserializeObject<AccSectionModel>(ipDataStr);
            section.HospitalId = currentHospitalId;
            _accountingDbContext.Section.Add(section);
            _accountingDbContext.SaveChanges();
            return section;
        }
        private object AddChartOfAccount(string ipDataStr, RbacUser currentUser)
        {
            ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(ipDataStr);
            coa.CreatedOn = System.DateTime.Now;
            coa.CreatedBy = currentUser.UserId;
            coa.ModifiedBy = null;
            coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(_accountingDbContext, coa);
            _accountingDbContext.ChartOfAccounts.Add(coa);
            _accountingDbContext.SaveChanges();
            return coa;
        }
        private object UpdateLedgerISActive(string ipDataStr)
        {
            LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(ipDataStr);
            _accountingDbContext.Ledgers.Attach(ledger);
            _accountingDbContext.Entry(ledger).Property(x => x.IsActive).IsModified = true;
            _accountingDbContext.SaveChanges();
            return ledger;
        }
        private object UpdateReopenFiscalYear(string ipDataStr, RbacUser currentuser)
        {

            try
            {
                int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
                FiscalYearModel fs = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(ipDataStr);
                DataTable fiscalYearDT = _accountingDbContext.ReOpenFiscalYear(fs.FiscalYearId, currentuser.EmployeeId, currentHospitalId, fs.Remark);
                var resultStr = JsonConvert.SerializeObject(fiscalYearDT, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
                var fiscalYearList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
                return fiscalYearList;
            }
            catch (Exception ex)
            {
                throw ex;
            }


        }
        private object UpdateLedgerGroupActivateDeactivate(string ipDataStr)
        {
            LedgerGroupModel ledgerGrp = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(ipDataStr);
            _accountingDbContext.LedgerGroups.Attach(ledgerGrp);
            _accountingDbContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
            _accountingDbContext.SaveChanges();
            return ledgerGrp;

        }
        private object UpdateLedgerGroup(string ipDataStr)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            LedgerGroupModel ledgerGroup = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(ipDataStr);
            var ledgerGrp = _accountingDbContext.LedgerGroups.Where(x => x.LedgerGroupId == ledgerGroup.LedgerGroupId && x.HospitalId == currentHospitalId).FirstOrDefault();
            if (ledgerGrp != null)
            {
                ledgerGrp.COA = ledgerGroup.COA;
                ledgerGrp.Description = ledgerGroup.Description;
                ledgerGrp.IsActive = ledgerGroup.IsActive;
                ledgerGrp.LedgerGroupName = ledgerGroup.LedgerGroupName;
                ledgerGrp.ModifiedBy = ledgerGroup.ModifiedBy;
                ledgerGrp.ModifiedOn = System.DateTime.Now;
                ledgerGrp.PrimaryGroup = ledgerGroup.PrimaryGroup;
                _accountingDbContext.LedgerGroups.Attach(ledgerGrp);
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.COA).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.Description).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.LedgerGroupName).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.ModifiedBy).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.ModifiedOn).IsModified = true;
                _accountingDbContext.Entry(ledgerGrp).Property(x => x.PrimaryGroup).IsModified = true;
                _accountingDbContext.SaveChanges();
                return ledgerGrp;

            }
            else
            {

                throw new Exception("failed to update ledgergroup");
            }
        }
        private object UpdateCostCenterItemStatus(string ipDataStr)
        {
            CostCenterItemModel ccImodel = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(ipDataStr);
            _accountingDbContext.CostCenterItems.Attach(ccImodel);
            _accountingDbContext.Entry(ccImodel).Property(x => x.IsActive).IsModified = true;
            _accountingDbContext.SaveChanges();
            return ccImodel;
        }
        private object UpdateLedgerGroupCategoryActivateDeactivate(string ipDataStr)
        {
            LedgerGroupCategoryModel ledgerGrpCat = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(ipDataStr);
            _accountingDbContext.LedgerGroupsCategory.Attach(ledgerGrpCat);
            _accountingDbContext.Entry(ledgerGrpCat).Property(x => x.IsActive).IsModified = true;
            _accountingDbContext.SaveChanges();
            return ledgerGrpCat;
        }
        private object UpdateLedger(string ipDataStr, RbacUser currentUser)
        {
            int currentHospitalId = HttpContext.Session.Get<int>(ENUM_SessionValues.CurrentHospitalId);
            LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(ipDataStr);
            var led = _accountingDbContext.Ledgers.Where(s => s.LedgerId == ledger.LedgerId).FirstOrDefault();

            using (var dbContextTransaction = _accountingDbContext.Database.BeginTransaction())
            {
                try
                {

                    if (led != null)
                    {
                        led.IsActive = ledger.IsActive;
                        led.LedgerName = ledger.LedgerName;
                        led.OpeningBalance = ledger.OpeningBalance;
                        led.Description = ledger.Description;
                        led.IsCostCenterApplicable = ledger.IsCostCenterApplicable;
                        led.DrCr = ledger.DrCr;
                        led.PANNo = ledger.PANNo;
                        led.Address = ledger.Address;
                        led.MobileNo = ledger.MobileNo;
                        led.CreditPeriod = ledger.CreditPeriod;
                        led.TDSPercent = ledger.TDSPercent;
                        led.LandlineNo = ledger.LandlineNo;
                        led.LedgerGroupId = ledger.LedgerGroupId;
                        led.LegalLedgerName = ledger.LegalLedgerName;
                        _accountingDbContext.Ledgers.Attach(led);
                        _accountingDbContext.Entry(led).Property(x => x.IsActive).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.LedgerName).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.Description).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.DrCr).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.IsCostCenterApplicable).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.OpeningBalance).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.PANNo).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.Address).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.MobileNo).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.CreditPeriod).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.TDSPercent).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.LandlineNo).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.LedgerGroupId).IsModified = true;
                        _accountingDbContext.Entry(led).Property(x => x.LegalLedgerName).IsModified = true;

                        _accountingDbContext.SaveChanges();

                        var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, _accountingDbContext, false, currentHospitalId, currentUser.EmployeeId);


                        if (flag)
                        {

                            return led;
                            dbContextTransaction.Commit();
                        }
                        else
                        {

                            throw new Exception("failed to update ledger");
                            dbContextTransaction.Rollback();
                        }
                    }
                    else
                    {

                        throw new Exception("failed to update ledger");
                    }

                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw ex;
                }
            }
        }
        private object UpdateVoucherHead(string ipDataStr)
        {
            VoucherHeadModel voucher = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(ipDataStr);
            var voucherHead = _accountingDbContext.VoucherHeads.Where(s => s.VoucherHeadId == voucher.VoucherHeadId).FirstOrDefault();

            if (voucherHead != null)
            {
                voucherHead.IsActive = voucher.IsActive;
                voucherHead.VoucherHeadName = voucher.VoucherHeadName;
                voucherHead.Description = voucher.Description;
                voucherHead.ModifiedOn = System.DateTime.Now;
                voucherHead.ModifiedBy = voucher.ModifiedBy;
                voucherHead.IsDefault = voucher.IsDefault;

                _accountingDbContext.VoucherHeads.Attach(voucherHead);
                _accountingDbContext.Entry(voucherHead).Property(x => x.IsActive).IsModified = true;
                _accountingDbContext.Entry(voucherHead).Property(x => x.VoucherHeadName).IsModified = true;
                _accountingDbContext.Entry(voucherHead).Property(x => x.Description).IsModified = true;
                _accountingDbContext.Entry(voucherHead).Property(x => x.ModifiedOn).IsModified = true;
                _accountingDbContext.Entry(voucherHead).Property(x => x.ModifiedBy).IsModified = true;
                _accountingDbContext.Entry(voucherHead).Property(x => x.IsDefault).IsModified = true;
                _accountingDbContext.SaveChanges();
                if (voucher.IsDefault == true)
                {
                    _accountingDbContext.VoucherHeads.Where(v => v.VoucherHeadId != voucher.VoucherHeadId).ToList().ForEach(i => i.IsDefault = false);
                    _accountingDbContext.SaveChanges();
                }

                return voucherHead;
            }
            else
            {
                throw new Exception("failed to update voucherhead");
            }
        }
        private object UpdateSection(string ipDataStr)
        {
            AccSectionModel clientsection = DanpheJSONConvert.DeserializeObject<AccSectionModel>(ipDataStr);

            var section = _accountingDbContext.Section.Where(s => s.SectionId == clientsection.SectionId).FirstOrDefault();

            if (section != null)
            {
                section.SectionId = clientsection.SectionId;
                section.SectionName = clientsection.SectionName;
                section.SectionCode = clientsection.SectionCode;

                _accountingDbContext.Section.Attach(section);
                _accountingDbContext.Entry(section).Property(x => x.SectionId).IsModified = true;
                _accountingDbContext.Entry(section).Property(x => x.SectionName).IsModified = true;
                _accountingDbContext.Entry(section).Property(x => x.SectionCode).IsModified = true;
                _accountingDbContext.SaveChanges();
                return section;
            }
            else
            {
                throw new Exception("failed to update section");
            }

        }
        private object UpdateChartOfAccount(string ipDataStr)
        {
            ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(ipDataStr);

            var coaobj = _accountingDbContext.ChartOfAccounts.Where(s => s.ChartOfAccountId == coa.ChartOfAccountId).FirstOrDefault();
            coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(_accountingDbContext, coa);
            if (coaobj != null)
            {
                coaobj.ChartOfAccountName = coa.ChartOfAccountName;
                coaobj.COACode = coa.COACode;
                coaobj.PrimaryGroupId = coa.PrimaryGroupId;
                coaobj.Description = coa.Description;

                _accountingDbContext.ChartOfAccounts.Attach(coaobj);
                _accountingDbContext.Entry(coaobj).Property(x => x.ChartOfAccountName).IsModified = true;
                _accountingDbContext.Entry(coaobj).Property(x => x.COACode).IsModified = true;
                _accountingDbContext.Entry(coaobj).Property(x => x.PrimaryGroupId).IsModified = true;
                _accountingDbContext.Entry(coaobj).Property(x => x.Description).IsModified = true;
                _accountingDbContext.SaveChanges();
                return coaobj;
            }
            else
            {
                throw new Exception("failed to update chart of account");
            }

        }
        private object UpdateTransferRulesActive(string ipDataStr)
        {
            string rulename = DanpheJSONConvert.DeserializeObject<string>(ipDataStr);
            var groupMappingId = _accountingDbContext.GroupMapping.Where(s => s.Description == rulename)
                                                                    .Select(i => i.GroupMappingId).FirstOrDefault();

            if (groupMappingId > 0)
            {
                var TransferRule = _accountingDbContext.HospitalTransferRuleMappings.Where(s => s.TransferRuleId == groupMappingId).FirstOrDefault();
                TransferRule.IsActive = (TransferRule.IsActive == true) ? false : true;
                _accountingDbContext.HospitalTransferRuleMappings.Attach(TransferRule);
                _accountingDbContext.Entry(TransferRule).Property(x => x.IsActive).IsModified = true;
                _accountingDbContext.SaveChanges();

                return TransferRule;
            }
            else
            {
                throw new Exception("failed to update chart of transfer rules active");
            }

        }
        private object UpdateVoucherShowChequeNo(string ipDataStr)
        {
            VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(ipDataStr);
            _accountingDbContext.Vouchers.Attach(voucher);
            _accountingDbContext.Entry(voucher).Property(x => x.ShowChequeNumber).IsModified = true;
            _accountingDbContext.SaveChanges();
            return voucher;

        }
        private object UpdateVoucherShowPayeeName(string ipDataStr)
        {
            VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(ipDataStr);
            _accountingDbContext.Vouchers.Attach(voucher);
            _accountingDbContext.Entry(voucher).Property(x => x.ShowPayeeName).IsModified = true;
            _accountingDbContext.SaveChanges();
            return voucher;

        }

    }

}



