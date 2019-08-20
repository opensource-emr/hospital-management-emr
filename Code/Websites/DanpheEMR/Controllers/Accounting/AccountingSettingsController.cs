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
        public string Get(string reqType, int voucherId, int ledgergroupId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDbContext = new AccountingDbContext(connString);

            try
            {

                if (reqType == "voucherList")
                {
                    List<VoucherModel> voucherList = (from voucherlist in accountingDbContext.Vouchers
                                                      select voucherlist).ToList();
                    responseData.Results = voucherList;
                }
                else if (reqType == "GetVoucherHead")
                {

                    var Voucherhead = (from voc in accountingDbContext.VoucherHeads
                                   select new
                                   {
                                       VoucherHeadId = voc.VoucherHeadId,
                                       VoucherHeadName = voc.VoucherHeadName,
                                       IsActive = voc.IsActive,
                                       Description = voc.Description,
                                       CreatedOn = voc.CreatedOn,
                                       CreatedBy = voc.CreatedBy
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
                                       CreatedBy = voc.CreatedBy
                                   }
                                    ).ToList().OrderBy(a => a.VoucherId);
                    responseData.Results = Voucher;
                    responseData.Status = "OK";
                }
                else if (reqType == "GetVoucherswithVOCMap")
                {

                    var Voucher = (from vMap in accountingDbContext.VoucherLedgerGroupMaps
                                   join voc in accountingDbContext.Vouchers on vMap.VoucherId equals voc.VoucherId
                                   where vMap.LedgerGroupId == ledgergroupId
                                   group vMap by new { voc.VoucherId, voc.VoucherName, vMap.LedgerGroupId } into p
                                   select new
                                   {
                                       VoucherId = p.Key.VoucherId,
                                       VoucherName = p.Key.VoucherName,
                                       LedgerGroupId = p.Key.LedgerGroupId,

                                   }
                                    ).ToList();
                    responseData.Results = Voucher;
                    responseData.Status = "OK";
                }
                else if (reqType == "voucher-ledgerList")
                {

                    //List<LedgerModel> ledgerList = (from ledger in accountingDbContext.Ledgers
                    //                                join ledgerGroup in accountingDbContext.LedgerGroups on ledger.LedgerGroupId equals ledgerGroup.LedgerGroupId
                    //                                join voucherLedgerMap in accountingDbContext.VoucherLedgerGroupMaps on ledgerGroup.LedgerGroupId equals voucherLedgerMap.LedgerGroupId
                    //                                where voucherLedgerMap.VoucherId == voucherId
                    //                                select ledger).ToList();
                    //responseData.Results = ledgerList;
                }

                else if (reqType == "itemList")
                {
                    List<ItemModel> items = (from item in accountingDbContext.Items
                                             select item).ToList();
                    responseData.Results = items;
                }
                else if (reqType == "GetLedgers")
                {
                    var ledgers = (from ledger in accountingDbContext.Ledgers
                                   select new
                                   {
                                       LedgerId = ledger.LedgerId,
                                       LedgerName = ledger.LedgerName,
                                       IsActive = ledger.IsActive
                                   }).ToList().OrderBy(a => a.LedgerId);
                    responseData.Status = "OK";
                    responseData.Results = ledgers;
                }
                else if (reqType == "GetLedgerGroups")
                {
                    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
                                           select new
                                           {
                                               ledgrp.LedgerGroupId,
                                               ledgrp.PrimaryGroup,
                                               ledgrp.COA,
                                                ledgrp.LedgerGroupName,
                                               ledgrp.IsActive,
                                               ledgrp.Description,
                                               ledgrp.Name
                                           }
                                          ).ToList();
                    responseData.Results = LedgerGrouplist;
                    responseData.Status = "OK";

                }
                else if (reqType == "GetItems")
                {
                    var itemsList = (from itm in accountingDbContext.Items
                                         //join ledger in accountingDbContext.Ledgers on itm.LedgerId equals ledger.LedgerId
                                     select new
                                     {
                                         ItemId = itm.ItemId,
                                         ItemName = itm.ItemName,
                                         AvailableQuantity = itm.AvailableQuantity,
                                         IsActive = itm.IsActive,
                                         Description = itm.Description,
                                         CreatedBy = itm.CreatedBy,
                                         CreatedOn = itm.CreatedOn,
                                         //LedgerId = itm.LedgerId,
                                         //LedgerName = ledger.LedgerName
                                     }).ToList().OrderBy(a => a.ItemName);
                    //// responseData.Status = "OK";
                    responseData.Results = itemsList;
                }
                else if (reqType == "GetLedgerGroupsDetails")
                {
                    var LedgerGrouplist = (from ledgrp in accountingDbContext.LedgerGroups
                                           select new
                                           {
                                               ledgrp.PrimaryGroup,
                                               ledgrp.COA,
                                               IsActive = ledgrp.IsActive,
                                               Description = ledgrp.Description,
                                           }
                                          ).ToList();
                    responseData.Results = LedgerGrouplist;
                    responseData.Status = "OK";

                }
                else if (reqType == "GetLedgerGrpVoucherByLedgerGrpId")
                {
                    var LedgerGrpVoucherByLedGrpIdList = (from ledMap in accountingDbContext.VoucherLedgerGroupMaps
                                                          join ledGrp in accountingDbContext.LedgerGroups on ledMap.LedgerGroupId equals ledGrp.LedgerGroupId
                                                          join voc in accountingDbContext.Vouchers on ledMap.VoucherId equals voc.VoucherId
                                                          where ledMap.LedgerGroupId == ledgergroupId
                                                          select new
                                                          {
                                                              VoucherLedgerGroupMapId = ledMap.VoucherLedgerGroupMapId,
                                                              LedgerGroupName = ledGrp.LedgerGroupName,
                                                              LedgerGroupId = ledGrp.LedgerGroupId,
                                                              VoucherId = voc.VoucherId,
                                                              VoucherName = voc.VoucherName,
                                                              IsDebit = ledMap.IsDebit,
                                                              CreatedOn = ledMap.CreatedOn,
                                                              CreatedBy = ledMap.CreatedBy,
                                                              IsActive = ledMap.IsActive
                                                          }
                                                 ).ToList();
                    responseData.Results = LedgerGrpVoucherByLedGrpIdList;
                    responseData.Status = "OK";
                }
                else if (reqType == "GetFiscalYearList")
                {
                    var fiscalYearList = (from fsYear in accountingDbContext.FiscalYears
                                          select new
                                          {
                                              FiscalYearId = fsYear.FiscalYearId,
                                              FiscalYearName = fsYear.FiscalYearName,
                                              StartDate = fsYear.StartDate,
                                              EndDate = fsYear.EndDate,
                                              Description = fsYear.Description,
                                              IsActive = fsYear.IsActive

                                          }).ToList().OrderByDescending(p => p.IsActive);
                    responseData.Status = "OK";
                    responseData.Results = fiscalYearList;
                }
                else if (reqType == "GetCostCenterItemList")
                {
                    var costCenterList = (from costCenter in accountingDbContext.CostCenterItems
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
                                                  IsActive = chartofAcc.IsActive
                                              }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = chartOfAccountList;
                }
                else if (reqType == "LedgersList")
                {
                    var ledgerList = (from ledGroup in accountingDbContext.LedgerGroups
                                      join led in accountingDbContext.Ledgers
                                      on ledGroup.LedgerGroupId equals led.LedgerGroupId
                                      select new
                                      {
                                          led.LedgerId,
                                          led.LedgerGroupId,
                                          ledGroup.PrimaryGroup,
                                          ledGroup.COA,
                                          ledGroup.LedgerGroupName,
                                          led.LedgerName,
                                          led.LedgerReferenceId,
                                          led.SectionId,
                                          led.Description,
                                          IsActive = led.IsActive,
                                          led.OpeningBalance,
                                          led.DrCr,
                                          led.CreatedBy,
                                          led.CreatedOn,
                                          led.Name
                                      }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = ledgerList;
                }
                else if(reqType== "phrm-supplier")
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
                responseData.Status = "OK";

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

            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                string companyName = this.ReadQueryStringData("companyName");

                if (reqType == "AddLedgers")
                {
                    LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                    if (accountingDBContext.Ledgers.Any(r => r.LedgerGroupId == ledger.LedgerGroupId && r.LedgerName == ledger.LedgerName))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        ledger.CreatedOn = System.DateTime.Now;
                        accountingDBContext.Ledgers.Add(ledger);
                        accountingDBContext.SaveChanges();
                        if (ledger.LedgerType == "pharmacysupplier")
                        {
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = ledger.LedgerId;
                            ledgerMapping.LedgerType = ledger.LedgerType;
                            ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                            accountingDBContext.LedgerMappings.Add(ledgerMapping);
                        }
                        accountingDBContext.SaveChanges();
                        responseData.Results = ledger;
                        responseData.Status = "OK";
                    }

                }
                if (reqType == "AddLedgersList")
                {
                    List<LedgerModel> Ledgrs = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
                    //if (accountingDBContext.Ledgers.Any(r => r.LedgerGroupId == ledger.LedgerGroupId && r.LedgerName == ledger.LedgerName))
                    //{
                    //    responseData.Status = "Failed";
                    //}
                    //else
                    //{
                    Ledgrs.ForEach(ledger =>
                    {
                        ledger.CreatedOn = System.DateTime.Now;
                        accountingDBContext.Ledgers.Add(ledger);
                        accountingDBContext.SaveChanges();
                        if (ledger.LedgerType == "pharmacysupplier")
                        {
                            LedgerMappingModel ledgerMapping = new LedgerMappingModel();
                            ledgerMapping.LedgerId = ledger.LedgerId;
                            ledgerMapping.LedgerType = ledger.LedgerType;
                            ledgerMapping.ReferenceId = (int)ledger.LedgerReferenceId;
                            accountingDBContext.LedgerMappings.Add(ledgerMapping);
                        }
                    });
                    
                        accountingDBContext.SaveChanges();
                        responseData.Results = Ledgrs;
                        responseData.Status = "OK";
                    //}

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
                    if(accountingDBContext.VoucherHeads.Any(x=>x.VoucherHeadId== voucherHead.VoucherHeadId && x.VoucherHeadName == voucherHead.VoucherHeadName))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        voucherHead.CreatedOn = System.DateTime.Now;
                        voucherHead.CreatedBy = currentUser.UserId;
                        accountingDBContext.VoucherHeads.Add(voucherHead);
                        accountingDBContext.SaveChanges();
                        responseData.Results = voucherHead;
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "AddItems")
                {
                    ItemModel item = DanpheJSONConvert.DeserializeObject<ItemModel>(str);
                    item.CreatedOn = System.DateTime.Now;
                    accountingDBContext.Items.Add(item);
                    accountingDBContext.SaveChanges();
                    var itemWithLedgerName = (from led in accountingDBContext.Ledgers
                                              where led.LedgerId == item.LedgerId
                                              select new
                                              {
                                                  ItemId = item.ItemId,
                                                  ItemName = item.ItemName,
                                                  AvailableQuantity = item.AvailableQuantity,
                                                  IsActive = item.IsActive,
                                                  Description = item.Description,
                                                  LedgerId = item.LedgerId,
                                                  LedgerName = led.LedgerName
                                              }
                                           );
                    responseData.Results = itemWithLedgerName;
                    responseData.Status = "OK";
                }
                else if (reqType == "AddLedgersGroup")
                {
                    LedgerGroupModel ledgerGrpData = DanpheJSONConvert.DeserializeObject<LedgerGroupModel>(str);
                    if (accountingDBContext.LedgerGroups.Any(r => r.LedgerGroupName == ledgerGrpData.LedgerGroupName && r.COA == ledgerGrpData.COA && r.PrimaryGroup == ledgerGrpData.PrimaryGroup))
                    {
                        responseData.Status = "Failed";
                    }
                    else
                    {
                        ledgerGrpData.CreatedOn = DateTime.Now;
                        ledgerGrpData.CreatedBy = currentUser.UserId;
                        accountingDBContext.LedgerGroups.Add(ledgerGrpData);
                        accountingDBContext.SaveChanges();
                        responseData.Results = ledgerGrpData;
                        responseData.Status = "OK";
                    }
                }
                else if (reqType == "manageVoucherWithLedgegroup")
                {
                    List<VoucherLedgerGroupMapModel> mappedData = DanpheJSONConvert.DeserializeObject<List<VoucherLedgerGroupMapModel>>(str);
                    var postMappedLedgerGroup = new List<VoucherLedgerGroupMapModel>();
                    var putMappedLedgerGroup = new List<VoucherLedgerGroupMapModel>();
                    //map and separate two list for add and update 
                    mappedData.ForEach(x =>
                    {
                        if (x.actionName == "post")
                        {
                            x.CreatedOn = DateTime.Now;
                            x.CreatedBy = currentUser.UserId;
                            postMappedLedgerGroup.Add(x);
                        }
                        else if (x.actionName == "put")
                        {
                            putMappedLedgerGroup.Add(x);
                        }
                    });
                    //update
                    foreach (var itm in putMappedLedgerGroup)
                    {
                        accountingDBContext.VoucherLedgerGroupMaps.Attach(itm);
                        accountingDBContext.Entry(itm).Property(x => x.IsActive).IsModified = true;
                    }
                    accountingDBContext.SaveChanges();

                    //add
                    foreach (var itm in postMappedLedgerGroup)
                    {
                        accountingDBContext.VoucherLedgerGroupMaps.Add(itm);
                    }
                    accountingDBContext.SaveChanges();
                    responseData.Status = "OK";
                }
                else if (reqType == "AddFiscalYear")
                {
                    FiscalYearModel fsModel = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);

                    var checkFiscalYear = (from fs in accountingDBContext.FiscalYears
                                           where ((fs.FiscalYearName == fsModel.FiscalYearName) && (fs.IsActive == true))
                                           select fs).FirstOrDefault();
                    if (checkFiscalYear != null)
                    {
                        fsModel = null;
                        responseData.Results = fsModel;
                    }
                    else
                    {
                        fsModel.CreatedOn = System.DateTime.Now;
                        fsModel.CreatedBy = currentUser.UserId;
                        accountingDBContext.FiscalYears.Add(fsModel);
                        accountingDBContext.SaveChanges();

                        var fiscalCurtData = (from fisCal in accountingDBContext.FiscalYears
                                              where fisCal.FiscalYearId == fsModel.FiscalYearId
                                              select new
                                              {
                                                  FiscalYearId = fisCal.FiscalYearId,
                                                  FiscalYearName = fisCal.FiscalYearName,
                                                  StartYear = fisCal.StartDate,
                                                  EndYear = fisCal.EndDate,
                                                  Description = fisCal.Description,
                                                  IsActive = fisCal.IsActive,
                                              });
                        responseData.Results = fiscalCurtData;
                    }
                    responseData.Status = "OK";

                }
                else if (reqType == "AddCostCenterItem")
                {
                    CostCenterItemModel costCenterMod = DanpheJSONConvert.DeserializeObject<CostCenterItemModel>(str);
                    costCenterMod.CreatedOn = System.DateTime.Now;
                    costCenterMod.CreatedBy = currentUser.UserId;
                    accountingDBContext.CostCenterItems.Add(costCenterMod);
                    accountingDBContext.SaveChanges();

                    var curtCostCenterItmData = (from costCenterItm in accountingDBContext.CostCenterItems
                                                 where costCenterItm.CostCenterItemId == costCenterMod.CostCenterItemId
                                                 select new
                                                 {
                                                     CostCenterItemId = costCenterItm.CostCenterItemId,
                                                     CostCenterItemName = costCenterItm.CostCenterItemName,
                                                     Description = costCenterItm.Description,
                                                     IsActive = costCenterItm.IsActive,
                                                 });
                    responseData.Status = "OK";
                    responseData.Results = curtCostCenterItmData;
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


            try
            {
                //string str = Request.Form.Keys.First<string>();
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");
                RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                if (!String.IsNullOrEmpty(str))
                {

                    if (reqType == "itemISActive")
                    {

                        ItemModel item = DanpheJSONConvert.DeserializeObject<ItemModel>(str);
                        accountingDBContext.Items.Attach(item);
                        accountingDBContext.Entry(item).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Results = item;
                        responseData.Status = "OK";

                    }
                    else if (reqType == "ledgerISActive")
                    {

                        LedgerModel ledger = DanpheJSONConvert.DeserializeObject<LedgerModel>(str);
                        accountingDBContext.Ledgers.Attach(ledger);
                        accountingDBContext.Entry(ledger).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Results = ledger;
                        responseData.Status = "OK";

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
                        var ledgerGrp = accountingDBContext.LedgerGroups.Where(x => x.LedgerGroupId == ledgerGroup.LedgerGroupId).FirstOrDefault();
                        if(ledgerGrp != null)
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
                    else if (reqType == "updateFiscalYearStatus")
                    {
                        FiscalYearModel fiscalYearModel = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);
                        accountingDBContext.FiscalYears.Attach(fiscalYearModel);
                        accountingDBContext.Entry(fiscalYearModel).Property(x => x.IsActive).IsModified = true;
                        accountingDBContext.SaveChanges();
                        responseData.Status = "OK";
                        responseData.Results = fiscalYearModel;
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
                        if (led != null)
                        {
                            led.IsActive = ledger.IsActive;
                            led.LedgerName = ledger.LedgerName;
                            led.OpeningBalance = ledger.OpeningBalance;
                            led.Description = ledger.Description;
                            led.IsCostCenterApplicable = ledger.IsCostCenterApplicable;
                            led.DrCr = ledger.DrCr;
                            accountingDBContext.Ledgers.Attach(led);
                            accountingDBContext.Entry(led).Property(x => x.IsActive).IsModified = true;
                            accountingDBContext.Entry(led).Property(x => x.LedgerName).IsModified = true;
                            accountingDBContext.Entry(led).Property(x => x.Description).IsModified = true;
                            accountingDBContext.Entry(led).Property(x => x.DrCr).IsModified = true;
                            accountingDBContext.Entry(led).Property(x => x.IsCostCenterApplicable).IsModified = true;
                            accountingDBContext.Entry(led).Property(x => x.OpeningBalance).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = led;
                        }
                        else
                        {
                            responseData.Status = "Failed";
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
                            accountingDBContext.VoucherHeads.Attach(voucherHead);
                            accountingDBContext.Entry(voucherHead).Property(x => x.IsActive).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.VoucherHeadName).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.Description).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedOn).IsModified = true;
                            accountingDBContext.Entry(voucherHead).Property(x => x.ModifiedBy).IsModified = true;
                            accountingDBContext.SaveChanges();
                            responseData.Status = "OK";
                            responseData.Results = voucherHead;
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




        #region Save Goods Receipt and GoodsReceiptItems In Database
        public static Boolean AddLedgerGroup(AccountingDbContext accountingdbcontext, LedgerGroupModel ledgerGroupData, RbacUser currentUser)
        {
            try
            {
                if (ledgerGroupData != null)
                {
                    ledgerGroupData.CreatedOn = System.DateTime.Now;
                    ledgerGroupData.CreatedBy = currentUser.UserId;
                    accountingdbcontext.LedgerGroups.Add(ledgerGroupData);
                    int i = accountingdbcontext.SaveChanges();
                    return (i > 0) ? true : false;
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
        #endregion


        #region Save Goods Receipt and GoodsReceiptItems In Database
        public static Boolean VoucherLedgerGroupMap(AccountingDbContext accountingdbcontext, List<VoucherLedgerGroupMapModel> voucherLedgerMapData, RbacUser currentUser)
        {
            try
            {
                if (voucherLedgerMapData != null)
                {
                    ///  VoucherLedgerGroupMapModel vouchMap = new VoucherLedgerGroupMapModel();

                    for (int i = 0; i < voucherLedgerMapData.Count; i++)
                    {
                        voucherLedgerMapData[i].CreatedOn = DateTime.Now;
                        accountingdbcontext.VoucherLedgerGroupMaps.Add(voucherLedgerMapData[i]);
                    }

                    int j = accountingdbcontext.SaveChanges();
                    return (j > 0) ? true : false;


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
        #endregion

        #region Method for check all flag from flaglist
        public static Boolean CheckFlagList(List<Boolean> flagList)
        {
            try
            {
                Boolean flag = true;
                if (flagList.Count <= 0)
                {
                    return false;
                }
                for (int i = 0; i < flagList.Count; i++)
                {
                    if (flagList[i] == false)
                    {
                        flag = false;
                        break;
                    }
                }
                return (flag == true) ? true : false;

            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
        #endregion
    }
}

