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
using DanpheEMR.ServerModel.InventoryModels;
using DanpheEMR.AccTransfer;
using System.Data;
using Newtonsoft.Json.Converters;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingSettingsController : CommonController
    {

        //private readonly string connString = null;
        public AccountingSettingsController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;

        }

        // GET: api/values
        [HttpGet]
        public string Get(string reqType, int voucherId, int ledgergroupId, int SectionId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDbContext = new AccountingDbContext(connString);
            //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
            int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

            try
            {

                if (reqType == "GetVoucherHead")
                {

                    var Voucherhead = (from voc in accountingDbContext.VoucherHeads
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
                                    ).ToList().OrderBy(a => a.VoucherHeadId);
                    responseData.Results = Voucherhead;
                    responseData.Status = "OK";
                }

                else if (reqType == "GetVouchers")
                {

                    var Voucher = (from voc in accountingDbContext.Vouchers
                                   select new
                                   {
                                       VoucherId = voc.VoucherId,
                                       VoucherName = voc.VoucherName,
                                       VoucherCode = voc.VoucherCode,
                                       IsActive = voc.IsActive,
                                       Description = voc.Description,
                                       CreatedOn = voc.CreatedOn,
                                       CreatedBy = voc.CreatedBy,
                                       ISCopyDescription = voc.ISCopyDescription
                                   }
                                    ).ToList().OrderBy(a => a.VoucherId);
                    responseData.Results = Voucher;
                    responseData.Status = "OK";
                }

                else if (reqType == "GetLedgers")
                {
                    var ledgers = (from ledger in accountingDbContext.Ledgers
                                   where ledger.HospitalId == currentHospitalId
                                   select new
                                   {
                                       ledger.HospitalId,
                                       LedgerId = ledger.LedgerId,
                                       LedgerName = ledger.LedgerName,
                                       IsActive = ledger.IsActive
                                   }).ToList().OrderBy(a => a.LedgerId);
                    responseData.Status = "OK";
                    responseData.Results = ledgers;
                }
                else if (reqType == "GetLedgerGroups")
                {
                    //NageshBB- 22Jul 2020-if this api called from other module , then we have hospital Id issue 
                    //for this resolution we have temp solution
                    //we have saved accPrimary id in parameter table so, we will return this hospital records here
                    //This is not correct solution , well solution is to show activate hospital popup when user get logged in into system.
                    //so, this will help us to make software as multi tenant. if user have 2 or more hospital permission then this popup will come.
                    //if user have only one hsopital permission then automatically activate this hospital
                    var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDbContext);
                    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
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
                    responseData = AccountingBL.CheckResponseObject(LedgerGrouplist,"Ledger Group");
                }

                else if (reqType == "GetLedgerGroupsDetails")
                {
                    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
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
                    responseData.Results = LedgerGrouplist;
                    responseData.Status = "OK";

                }

                else if (reqType == "GetFiscalYearList")
                {
                    var currentDate = DateTime.Now.Date;
                    var fiscalYearList = (from fsYear in accountingDbContext.FiscalYears
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
                    responseData.Status = "OK";
                    responseData.Results = fiscalYearList;
                }
                else if (reqType == "GetCostCenterItemList")
                {
                    var costCenterList = (from costCenter in accountingDbContext.CostCenterItems
                                          where costCenter.HospitalId == currentHospitalId
                                          select new
                                          {
                                              CostCenterItemId = costCenter.CostCenterItemId,
                                              CostCenterItemName = costCenter.CostCenterItemName,
                                              Description = costCenter.Description,
                                              IsActive = costCenter.IsActive
                                          }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = costCenterList;
                }
                else if (reqType == "GetChartofAccount")
                {
                    var chartOfAccountList = (from chartofAcc in accountingDbContext.ChartOfAccounts

                                              select new
                                              {
                                                  ChartOfAccountId = chartofAcc.ChartOfAccountId,
                                                  ChartOfAccountName = chartofAcc.ChartOfAccountName,
                                                  Description = chartofAcc.Description,
                                                  IsActive = chartofAcc.IsActive,
                                                  COACode = chartofAcc.COACode,
                                                  PrimaryGroupId = chartofAcc.PrimaryGroupId
                                              }).ToList<object>();
                    responseData = AccountingBL.CheckResponseObject(chartOfAccountList,"Chart of account");
                }
                else if (reqType == "LedgersList")
                {
                    var HospId = (currentHospitalId > 0) ? currentHospitalId : AccountingTransferData.GetAccPrimaryHospitalId(accountingDbContext);
                    var dToday = DateTime.Now.Date;
                    var CurrentFYId = AccountingTransferData.GetFiscalYearIdByDate(accountingDbContext, dToday, HospId);
                    List<SqlParameter> paramList = new List<SqlParameter>()
                                {
                                        new SqlParameter("@HospitalId", HospId),
                                        new SqlParameter("@FiscalYearIdForOpeningBal",null),
                                        new SqlParameter("@GetClosingBal", null)
                                };
                    var spDataTable = DALFunctions.GetDataTableFromStoredProc("SP_ACC_GetLedgerList", paramList, accountingDbContext);
                    var resultStr = JsonConvert.SerializeObject(spDataTable, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
                    var ledgerList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);                  
                    responseData.Status = "OK";
                    responseData.Results = ledgerList;
                }
                else if (reqType == "SectionsList")
                {
                    var sections = (from s in accountingDbContext.Section
                                    where s.HospitalId == currentHospitalId
                                    select new
                                    {
                                        s.HospitalId,
                                        s.SectionId,
                                        s.SectionName,
                                        s.SectionCode
                                    }).ToList();
                    responseData.Results = sections;
                    responseData.Status = "OK";
                }
                else if (reqType == "phrm-supplier")
                {
                    var supplier = (from s in accountingDbContext.PHRMSupplier
                                    select new
                                    {
                                        s.SupplierId,
                                        s.SupplierName
                                    }).ToList();
                    responseData.Results = supplier;
                    responseData.Status = "OK";
                }

                else if (reqType == "get-employee")
                {
                    var supplier = (from emp in accountingDbContext.Emmployees
                                    select new
                                    {
                                        emp.EmployeeId,
                                        EmployeeName = emp.FullName  // emp.FirstName + " " + (string.IsNullOrEmpty(emp.MiddleName) ? "" : emp.MiddleName + " ") + emp.LastName,
                                    }).ToList();
                    responseData.Results = supplier;
                    responseData.Status = "OK";
                }
                
                else if (reqType == "get-primary-list")
                {
                    var primaryGroupList  =accountingDbContext.PrimaryGroup.Where(p=>p.IsActive == true).ToList<object>();
                    responseData = AccountingBL.CheckResponseObject(primaryGroupList,"Primary Group");
                    responseData.Status = "OK";
                }
                else if (reqType == "getTrasferRuleDataBySectionId")
                 {
                    var section = accountingDbContext.Section.Where(s => s.SectionId == SectionId).FirstOrDefault();
                    var transferRulesData = (from m in accountingDbContext.GroupMapping where m.Section == SectionId
                                             join s in accountingDbContext.HospitalTransferRuleMappings on m.GroupMappingId equals s.TransferRuleId
                                             where s.HospitalId == currentHospitalId
                                             select new
                                             {
                                                 SectionName = section.SectionName,
                                                 ruleName = m.Description,
                                                 IsActive = s.IsActive,
                                                 groupMappingId = m.GroupMappingId,
                                                 VoucherName = accountingDbContext.Vouchers.AsQueryable()
                                                                .Where(t => t.VoucherId == m.VoucherId)
                                                                .Select(i => i.VoucherName).FirstOrDefault(),
                                                 customVoucherName = accountingDbContext.Vouchers.AsQueryable()
                                                                .Where(t => t.VoucherId == m.CustomVoucherId)
                                                                .Select(i => i.VoucherName).FirstOrDefault(),

                                             }).ToList();
                    responseData.Results = transferRulesData;
                    responseData.Status = "OK";
                 }
            }
            catch (Exception ex)
            {
                string str = ex.InnerException.Message.ToString();
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message;
            }
            return DanpheJSONConvert.SerializeObject(responseData);

        }

        // POST api/values
        [HttpPost]
        public string Post()
        {
            //if reqtype=employee, then use masterdbcontext.employee.add  and so on for others.

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();//type 'object' since we have variable return types
            responseData.Status = "OK";//by default status would be OK, hence assigning at the top
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
            int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string companyName = this.ReadQueryStringData("companyName");

                if (reqType == "AddLedgers")
                {
                    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                    //check for duplicate and don't allow to addd if found.
                    //match with current hospital id, and don't allow to add same ledger. 
                    if (accountingDBContext.Ledgers.Any(r => r.LedgerGroupId == ledger.LedgerGroupId && r.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower() && r.HospitalId == currentHospitalId))
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "we found ledger existed. Duplicate ledger not allowed";
                    }
                    else
                    {
                        using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
                        {
                            try
                            {
                                ledger.CreatedOn = System.DateTime.Now;
                                ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
                                ledger.HospitalId = currentHospitalId;
                                ledger.LedgerName = ledger.LedgerName.Trim();
                                accountingDBContext.Ledgers.Add(ledger);
                                accountingDBContext.SaveChanges();
                                AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, ledger);
                                if (ledger.LedgerType == "pharmacysupplier")
                                {
                                    LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                                    ledgerMapping.LedgerId = ledger.LedgerId;
                                    ledgerMapping.LedgerType = ledger.LedgerType;
                                    ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                                    ledgerMapping.HospitalId = currentHospitalId;
                                    accountingDBContext.LedgerMappings.Add(ledgerMapping);
                                }
                                accountingDBContext.SaveChanges();

                                var flag = DanpheEMR.AccTransfer.AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId,currentUser.EmployeeId);

                                if (flag)
                                {
                                    responseData.Results = ledger;
                                    responseData.Status = "OK";
                                    dbContextTransaction.Commit();
                                }
                                else
                                {
                                    responseData.Status = "Failed";
                                    dbContextTransaction.Rollback();
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
                if (reqType == "AddLedgersList")
                {
                    InventoryDbContext inventoryDBContext = new InventoryDbContext(connString);
                    List<LedgerModel> Ledgrs = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
                    bool ledBalnce = false;
                    using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
                    {
                        try
                        {

                            Ledgrs.ForEach(ledger =>
                             {
                                 //first create ledger if not existing, then update balance history for different types of ledgers.

                                 //Part:1--- Create ledger.. or Update LedgerInformation.
                                 if (ledger.LedgerId == 0)
                                 {
                                    var existedled = accountingDBContext.Ledgers.Where(l => l.LedgerGroupId == ledger.LedgerGroupId && l.LedgerName.Trim().ToLower() == ledger.LedgerName.Trim().ToLower())
                                   .FirstOrDefault();
                                     if (existedled == null)
                                     {
                                         ledger.CreatedOn = System.DateTime.Now;
                                         ledger.Code = AccountingTransferData.GetProvisionalLedgerCode(accountingDBContext, currentHospitalId);
                                         ledger.IsActive = true;
                                         ledger.HospitalId = currentHospitalId;
                                         accountingDBContext.Ledgers.Add(ledger);
                                         accountingDBContext.SaveChanges();
                                         AccountingTransferData.AddLedgerForClosedFiscalYears(accountingDBContext, ledger);
                                         ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId,currentUser.EmployeeId);
                                     }
                                     else
                                     {
                                         ledger.LedgerId = existedled.LedgerId;
                                     }

                                 }
                                 else
                                 {
                                     //hospitalid can't be udated in Existing ledger so no need to check... 
                                     var existLedger = accountingDBContext.Ledgers.Where(l => l.LedgerId == ledger.LedgerId && l.HospitalId == currentHospitalId).FirstOrDefault();
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
                                         accountingDBContext.Ledgers.Attach(existLedger);
                                         accountingDBContext.Entry(existLedger).State = EntityState.Modified;
                                         accountingDBContext.Entry(existLedger).Property(x => x.LedgerName).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.Description).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.DrCr).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.IsActive).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.PANNo).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.Address).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.MobileNo).IsModified = true;
                                         accountingDBContext.Entry(existLedger).Property(x => x.LandlineNo).IsModified = true;
                                         accountingDBContext.SaveChanges();
                                         ledBalnce = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(existLedger, accountingDBContext, false, currentHospitalId,currentUser.EmployeeId);

                                     }
                                 }


                                 //Part:2 --- Update LedgerMapping table for certain types eg: Consultant, PharmacySupplier, Inv-Vendors, etc.. 

                                 if (!string.IsNullOrEmpty(ledger.LedgerType))
                                 {
                                     if (ledger.LedgerType != "billingincomeledger")
                                     {
                                             var lederMapData = accountingDBContext.LedgerMappings.Where(l =>
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
                                                 accountingDBContext.LedgerMappings.Add(ledgerMapping);
                                             }
                                             else
                                             {
                                                 //hospitalid not required for existing ledger-mappings
                                                 lederMapData.LedgerId = ledger.LedgerId;
                                                 accountingDBContext.LedgerMappings.Attach(lederMapData);
                                                 accountingDBContext.Entry(lederMapData).State = EntityState.Modified;
                                                 accountingDBContext.Entry(lederMapData).Property(x => x.LedgerId).IsModified = true;
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
                                         var BillinglederMapData = accountingDBContext.AccountBillLedgerMapping.Where(l =>
                                                                                                      l.HospitalId == currentHospitalId &&
                                                                                                      l.ServiceDepartmentId == (int)ledger.ServiceDepartmentId && l.ItemId == ledger.ItemId).FirstOrDefault();

                                         if (BillinglederMapData == null)
                                         {
                                             AccountingBillLedgerMappingModel ledgerMapping = new AccountingBillLedgerMappingModel();
                                             ledgerMapping.LedgerId = ledger.LedgerId;
                                             ledgerMapping.ServiceDepartmentId = (int)ledger.ServiceDepartmentId;
                                             ledgerMapping.ItemId = ledger.ItemId;
                                             ledgerMapping.HospitalId = currentHospitalId;
                                             accountingDBContext.AccountBillLedgerMapping.Add(ledgerMapping);
                                         }
                                         else
                                         {
                                             //hospitalid not required for existing ledger-mappings
                                             BillinglederMapData.LedgerId = ledger.LedgerId;
                                             accountingDBContext.AccountBillLedgerMapping.Attach(BillinglederMapData);
                                             accountingDBContext.Entry(BillinglederMapData).State = EntityState.Modified;
                                             accountingDBContext.Entry(BillinglederMapData).Property(x => x.LedgerId).IsModified = true;
                                         }
                                         accountingDBContext.SaveChanges();
                                     }
                                 }

                             });

                            inventoryDBContext.SaveChanges();
                            accountingDBContext.SaveChanges();
                            if (ledBalnce)
                            {
                                responseData.Results = Ledgrs;
                                responseData.Status = "OK";
                                dbContextTransaction.Commit();
                            }
                            else
                            {
                                responseData.Status = "Failed";
                                dbContextTransaction.Rollback();
                            }

                        }
                        catch (Exception ex)
                        {
                            throw ex;
                        }
                    }


                }
                else if (reqType == "AddVouchers")
                {
                    VoucherModel voucher = DanpheJSONConvert.DeserializeObject<VoucherModel>(str);
                    voucher.CreatedOn = System.DateTime.Now;
                    voucher.CreatedBy = currentUser.UserId;
                    accountingDBContext.Vouchers.Add(voucher);
                    accountingDBContext.SaveChanges();
                    responseData.Results = voucher;
                    responseData.Status = "OK";
                }

                else if (reqType == "AddVoucherHead")
                {
                    VoucherHeadModel voucherHead = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(str);
                    if (accountingDBContext.VoucherHeads.Any(x => x.HospitalId == currentHospitalId && x.VoucherHeadId == voucherHead.VoucherHeadId && x.VoucherHeadName == voucherHead.VoucherHeadName))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        voucherHead.CreatedOn = System.DateTime.Now;
                        voucherHead.CreatedBy = currentUser.UserId;
                        voucherHead.HospitalId = currentHospitalId;
                        accountingDBContext.VoucherHeads.Add(voucherHead);
                        accountingDBContext.SaveChanges();
                        responseData.Results = voucherHead;
                        responseData.Status = "OK";
                    }
                }
                
                else if (reqType == "AddLedgersGroup")
                {
                    LedgerGroupModel ledgerGrpData = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
                    if (accountingDBContext.LedgerGroups.Any(lg =>
                    lg.HospitalId == currentHospitalId //sud-nagesh:20Jun'20-for HospitalSeparation
                    && lg.LedgerGroupName == ledgerGrpData.LedgerGroupName
                    && lg.COA == ledgerGrpData.COA
                    && lg.PrimaryGroup == ledgerGrpData.PrimaryGroup))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        ledgerGrpData.CreatedOn = DateTime.Now;
                        ledgerGrpData.CreatedBy = currentUser.UserId;
                        ledgerGrpData.HospitalId = currentHospitalId;//sud-nagesh:20Jun'20-for HospitalSeparation
                        var maxCode = accountingDBContext.LedgerGroups.AsQueryable()
                                            .Where(t => t.HospitalId == currentHospitalId && t.IsActive == true)
                                            .Select(i => i.Code).DefaultIfEmpty().ToList().Max(t => Convert.ToInt32(t));
                        ledgerGrpData.Code = Convert.ToString(maxCode + 1);
                        accountingDBContext.LedgerGroups.Add(ledgerGrpData);
                        accountingDBContext.SaveChanges();
                        responseData.Results = ledgerGrpData;
                        responseData.Status = "OK";
                    }
                }

              
                else if (reqType == "AddCostCenterItem")
                {
                    CostCenterItemModel costCenterMod = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(str);
                    costCenterMod.CreatedOn = System.DateTime.Now;
                    costCenterMod.CreatedBy = currentUser.UserId;
                    costCenterMod.HospitalId = currentHospitalId;
                    accountingDBContext.CostCenterItems.Add(costCenterMod);
                    accountingDBContext.SaveChanges();

                    responseData.Status = "OK";
                    responseData.Results = costCenterMod;
                }
                else if (reqType == "AddLedgerGroupCategory")
                {
                    LedgerGroupCategoryModel ledGrpCatMod = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(str);
                    ledGrpCatMod.CreatedOn = System.DateTime.Now;
                    ledGrpCatMod.CreatedBy = currentUser.UserId;
                    accountingDBContext.LedgerGroupsCategory.Add(ledGrpCatMod);
                    accountingDBContext.SaveChanges();

                    var curtLedGrpCategoryData = (from ledgrpCat in accountingDBContext.LedgerGroupsCategory
                                                  join chartOfAcc in accountingDBContext.ChartOfAccounts on ledgrpCat.ChartOfAccountId equals chartOfAcc.ChartOfAccountId
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
                    responseData.Status = "OK";
                    responseData.Results = curtLedGrpCategoryData;
                }
                else if (reqType == "AddSection")
                {
                    AccSectionModel section = DanpheJSONConvert.DeserializeObject<AccSectionModel>(str);
                    section.HospitalId = currentHospitalId;
                    accountingDBContext.Section.Add(section);
                    accountingDBContext.SaveChanges();
                    responseData.Results = section;
                    responseData.Status = "OK";
                }
                else if (reqType == "AddCOA")
                {
                    ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(str);
                    coa.CreatedOn = System.DateTime.Now;
                    coa.CreatedBy = currentUser.UserId;
                    coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(accountingDBContext,coa);
                    accountingDBContext.ChartOfAccounts.Add(coa);
                    accountingDBContext.SaveChanges();
                    responseData.Results = coa;
                    responseData.Status = "OK";
                }


            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();

            }

            return DanpheJSONConvert.SerializeObject(responseData, true);
        }



        // PUT api/values/5
        [HttpPut]
        public string Update(/*string reqType*/)
        {

            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();

            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
            int currentHospitalId = HttpContext.Session.Get<int>("AccSelectedHospitalId");

            try
            {
                //string str = Request.Form.Keys.First<string>();
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (!String.IsNullOrEmpty(str))
                {

                    if (reqType == "ledgerISActive")
                    {

                        LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                        accountingDBContext.Ledgers.Attach(ledger);
                        accountingDBContext.Entry(ledger).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Results = ledger;
                        responseData.Status = "OK";

                    }
                    else if (reqType == "reopen-fiscal-year")
                    {
                        try
                        {                          
                            FiscalYearModel fs = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);                            
                            DataTable fiscalYearDT = accountingDBContext.ReOpenFiscalYear(fs.FiscalYearId, currentUser.EmployeeId, currentHospitalId,fs.Remark);                            
                            var resultStr = JsonConvert.SerializeObject(fiscalYearDT, new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });
                            var fiscalYearList = JsonConvert.DeserializeObject<List<dynamic>>(resultStr);
                            responseData.Results = fiscalYearList;                     
                            responseData.Status = "OK";                      
                        }
                        catch (Exception ex)
                        {
                            responseData.Status = "Failed";
                            throw ex;
                        }

                    }
                    else if (reqType == "updateLedgerGrpIsActive")
                    {
                        LedgerGroupModel ledgerGrp = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
                        accountingDBContext.LedgerGroups.Attach(ledgerGrp);
                        accountingDBContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ledgerGrp;
                    }
                    else if (reqType == "updateLedgerGroup")
                    {
                        LedgerGroupModel ledgerGroup = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
                        var ledgerGrp = accountingDBContext.LedgerGroups.Where(x => x.LedgerGroupId == ledgerGroup.LedgerGroupId && x.HospitalId == currentHospitalId).FirstOrDefault();//sud-nagesh:20Jun'20-for HospitalSeparation
                        if (ledgerGrp != null)
                        {
                            ledgerGrp.COA = ledgerGroup.COA;
                            ledgerGrp.Description = ledgerGroup.Description;
                            ledgerGrp.IsActive = ledgerGroup.IsActive;
                            ledgerGrp.LedgerGroupName = ledgerGroup.LedgerGroupName;
                            ledgerGrp.ModifiedBy = ledgerGroup.ModifiedBy;
                            ledgerGrp.ModifiedOn = System.DateTime.Now;
                            ledgerGrp.PrimaryGroup = ledgerGroup.PrimaryGroup;
                            accountingDBContext.LedgerGroups.Attach(ledgerGrp);
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.COA).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.Description).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.IsActive).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.LedgerGroupName).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.ModifiedBy).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.ModifiedOn).IsModified = true;
                            accountingDBContext.Entry(ledgerGrp).Property(x => x.PrimaryGroup).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Results = ledgerGrp;
                            responseData.Status = "OK";
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }
                 
                    else if (reqType == "updateCostCenterItemStatus")
                    {
                        CostCenterItemModel ccImodel = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(str);
                        accountingDBContext.CostCenterItems.Attach(ccImodel);
                        accountingDBContext.Entry(ccImodel).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ccImodel;
                    }
                    else if (reqType == "updateLedgerGrpCategoryIsActive")
                    {
                        LedgerGroupCategoryModel ledgerGrpCat = DanpheJSONConvert.DeserializeObject<LedgerGroupCategoryModel>(str);
                        accountingDBContext.LedgerGroupsCategory.Attach(ledgerGrpCat);
                        accountingDBContext.Entry(ledgerGrpCat).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = ledgerGrpCat;
                    }
                    else if (reqType == "UpdateLedger")
                    {
                        LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                        var led = accountingDBContext.Ledgers.Where(s => s.LedgerId == ledger.LedgerId).FirstOrDefault();

                        using (var dbContextTransaction = accountingDBContext.Database.BeginTransaction())
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
                                    accountingDBContext.Ledgers.Attach(led);
                                    accountingDBContext.Entry(led).Property(x => x.IsActive).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.LedgerName).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.Description).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.DrCr).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.IsCostCenterApplicable).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.OpeningBalance).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.PANNo).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.Address).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.MobileNo).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.CreditPeriod).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.TDSPercent).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.LandlineNo).IsModified = true;
                                    accountingDBContext.Entry(led).Property(x => x.LedgerGroupId).IsModified = true;

                                    accountingDBContext.SaveChanges();

                                    var flag = AccountingTransferData.LedgerAddUpdateInBalanceHisotry(ledger, accountingDBContext, false, currentHospitalId,currentUser.EmployeeId);

                                    if (flag)
                                    {
                                        responseData.Status = "OK";
                                        responseData.Results = led;
                                        dbContextTransaction.Commit();
                                    }
                                    else
                                    {
                                        responseData.Status = "Failed";
                                        dbContextTransaction.Rollback();
                                    }
                                }
                                else
                                {
                                    responseData.Status = "Failed";
                                }

                            }
                            catch (Exception ex)
                            {
                                dbContextTransaction.Rollback();
                                throw ex;
                            }
                        }

                    }

                    else if (reqType == "UpdateVoucherHead")
                    {
                        VoucherHeadModel voucher = DanpheJSONConvert.DeserializeObject<VoucherHeadModel>(str);
                        var voucherHead = accountingDBContext.VoucherHeads.Where(s => s.VoucherHeadId == voucher.VoucherHeadId).FirstOrDefault();

                        if (voucherHead != null)
                        {
                            voucherHead.IsActive = voucher.IsActive;
                            voucherHead.VoucherHeadName = voucher.VoucherHeadName;
                            voucherHead.Description = voucher.Description;
                            voucherHead.ModifiedOn = System.DateTime.Now;
                            voucherHead.ModifiedBy = voucher.ModifiedBy;
                            voucherHead.IsDefault = voucher.IsDefault;

                            accountingDBContext.VoucherHeads.Attach(voucherHead);
                            accountingDBContext.Entry(voucherHead).Property(x => x.IsActive).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.VoucherHeadName).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.Description).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedOn).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedBy).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.IsDefault).IsModified = true;
                            accountingDBContext.SaveChanges();
                            if (voucher.IsDefault == true)
                            {
                                accountingDBContext.VoucherHeads.Where(v => v.VoucherHeadId != voucher.VoucherHeadId).ToList().ForEach(i => i.IsDefault = false);
                                accountingDBContext.SaveChanges();
                            }
                            responseData.Status = "OK";
                            responseData.Results = voucherHead;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }

                    else if (reqType == "UpdateSection")
                    {
                        AccSectionModel clientsection = DanpheJSONConvert.DeserializeObject<AccSectionModel>(str);

                        var section = accountingDBContext.Section.Where(s => s.SectionId == clientsection.SectionId).FirstOrDefault();

                        if (section != null)
                        {
                            section.SectionId = clientsection.SectionId;
                            section.SectionName = clientsection.SectionName;
                            section.SectionCode = clientsection.SectionCode;

                            accountingDBContext.Section.Attach(section);
                            accountingDBContext.Entry(section).Property(x => x.SectionId).IsModified = true;
                            accountingDBContext.Entry(section).Property(x => x.SectionName).IsModified = true;
                            accountingDBContext.Entry(section).Property(x => x.SectionCode).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = section;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }
                    else if (reqType == "UpdateCOA")
                    {
                        ChartOfAccountModel coa = DanpheJSONConvert.DeserializeObject<ChartOfAccountModel>(str);

                        var coaobj = accountingDBContext.ChartOfAccounts.Where(s => s.ChartOfAccountId == coa.ChartOfAccountId).FirstOrDefault();
                        coa.COACode = AccountingTransferData.GetAutoGeneratedCodeForCOA(accountingDBContext, coa);
                        if (coaobj != null)
                        {
                            coaobj.ChartOfAccountName = coa.ChartOfAccountName;
                            coaobj.COACode = coa.COACode;
                            coaobj.PrimaryGroupId = coa.PrimaryGroupId;
                            coaobj.Description = coa.Description;

                            accountingDBContext.ChartOfAccounts.Attach(coaobj);
                            accountingDBContext.Entry(coaobj).Property(x => x.ChartOfAccountName).IsModified = true;
                            accountingDBContext.Entry(coaobj).Property(x => x.COACode).IsModified = true;
                            accountingDBContext.Entry(coaobj).Property(x => x.PrimaryGroupId).IsModified = true;
                            accountingDBContext.Entry(coaobj).Property(x => x.Description).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = coaobj;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }
                    else if (reqType == "UpdateTransferRulesActive")
                    {
                        string rulename = DanpheJSONConvert.DeserializeObject<string>(str);
                        var groupMappingId = accountingDBContext.GroupMapping.Where(s => s.Description == rulename)
                                                                                .Select(i => i.GroupMappingId).FirstOrDefault();

                        if (groupMappingId > 0)
                        {
                            var TransferRule = accountingDBContext.HospitalTransferRuleMappings.Where(s => s.TransferRuleId == groupMappingId).FirstOrDefault();
                            TransferRule.IsActive = (TransferRule.IsActive == true) ? false : true;
                            accountingDBContext.HospitalTransferRuleMappings.Attach(TransferRule);
                            accountingDBContext.Entry(TransferRule).Property(x => x.IsActive).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = TransferRule;
                        }
                        else
                        {
                            responseData.Status = "Failed";
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }



    }
}

