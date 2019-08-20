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
//using System.Collections;

namespace DanpheEMR.Controllers
{

    [RequestFormSizeLimit(valueCountLimit: 100000, Order = 1)]
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingController : CommonController
    {
        // GET: api/values
        //private readonly string connString = null;
        public AccountingController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;

        }


        [HttpGet]
        public string Get(int voucherId, int transactionId, int ledgerId, string voucherNumber, string ledgerName, DateTime FromDate, DateTime ToDate)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            PharmacyDbContext pharmacyDbContext = new PharmacyDbContext(connString);
            try
            {
                string reqType = this.ReadQueryStringData("reqType");
                #region Vouchers
                if (reqType == "Vouchers")
                {
                    var voucherList = (from voucher in accountingDBContext.Vouchers
                                       where voucher.IsActive == true
                                       select new
                                       {
                                           voucher.VoucherId,
                                           voucher.VoucherName
                                       }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = voucherList;
                }
                else if (reqType == "get-voucher-head")
                {
                    var voucherHeadList = (from voucherHead in accountingDBContext.VoucherHeads
                                           where voucherHead.IsActive == true
                                           select new
                                           {
                                               voucherHead.VoucherHeadId,
                                               voucherHead.VoucherHeadName,
                                               voucherHead.Description,
                                               voucherHead.CreatedOn,
                                               voucherHead.CreatedBy,
                                               voucherHead.IsActive,
                                           }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = voucherHeadList;
                }
                #endregion
                #region Ledger List
                else if (reqType == "ledger-list")
                {
                    var TransactionWithItems = (from ti in accountingDBContext.TransactionItems
                                                join t in accountingDBContext.Transactions on ti.TransactionId equals t.TransactionId
                                                group new { ti } by new { ti.LedgerId } into x
                                                select new
                                                {
                                                    LedgerId = x.Key.LedgerId,
                                                    Amount = x.Where(a => a.ti.DrCr == true).Select(a => a.ti.Amount).DefaultIfEmpty(0).Sum() - x.Where(a => a.ti.DrCr != true).Select(a => a.ti.Amount).DefaultIfEmpty(0).Sum()
                                                }).ToList().AsEnumerable();
                    var ledgerList = (from led in accountingDBContext.Ledgers.AsEnumerable()
                                      join ledgrp in accountingDBContext.LedgerGroups.AsEnumerable()
                                       on led.LedgerGroupId equals ledgrp.LedgerGroupId
                                      where led.IsActive == true
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
                                          ClosingBalance = TransactionWithItems.Any(a => a.LedgerId == led.LedgerId) ? (from ti in TransactionWithItems where ti.LedgerId == led.LedgerId select ti.Amount).FirstOrDefault() : 0
                                      }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = ledgerList;
                }
                #endregion
                #region Active Fiscal Year List
                else if (reqType == "fiscalyear-list")
                {
                    var fscList = (from fsc in accountingDBContext.FiscalYears
                                       //where fsc.IsActive == true
                                   select fsc).OrderByDescending(a => a.FiscalYearId).ToList();
                    for (var i = 0; i < fscList.Count; i++)
                    {
                        fscList[i].nStartDate = this.GetNepaliDate(fscList[i].StartDate);
                        fscList[i].nEndDate = this.GetNepaliDate(fscList[i].EndDate);
                    }
                    responseData.Status = "OK";
                    responseData.Results = fscList;
                }
                #endregion
                #region Cost Centric List
                else if (reqType == "costcentric-list")
                {
                    var cstCntList = (from cst in accountingDBContext.CostCenterItems
                                      where cst.IsActive == true
                                      select new
                                      {
                                          cst.CostCenterItemId,
                                          cst.CostCenterItemName
                                      }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = cstCntList;
                }
                #endregion
                #region Ledger Items
                else if (reqType == "ledger-items")
                {
                    var itemList = (from itm in accountingDBContext.Items
                                    where itm.IsActive == true
                                    //where itm.LedgerId==ledgerId
                                    select new
                                    {
                                        itm.ItemId,
                                        itm.ItemName
                                    }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = itemList;
                }
                #endregion
                #region Account Closure
                else if (reqType == "account-closure")
                {
                    var result = (from ledgrp in accountingDBContext.LedgerGroups
                                  join lgr in accountingDBContext.Ledgers on ledgrp.LedgerGroupId equals lgr.LedgerGroupId
                                  join tI in accountingDBContext.TransactionItems on lgr.LedgerId equals tI.LedgerId
                                  group ledgrp by new { ledgrp.PrimaryGroup } into x1
                                  select new
                                  {
                                      x1.Key.PrimaryGroup,
                                      COAs = (from ledgrp2 in accountingDBContext.LedgerGroups
                                              where ledgrp2.PrimaryGroup == x1.Key.PrimaryGroup
                                              group ledgrp2 by new { ledgrp2.PrimaryGroup, ledgrp2.COA } into x2
                                              select new
                                              {
                                                  x2.Key.COA,
                                                  LedgerGroups = (from lgrp in accountingDBContext.LedgerGroups
                                                                  where lgrp.PrimaryGroup == x1.Key.PrimaryGroup && lgrp.COA == x2.Key.COA
                                                                  group lgrp by new
                                                                  {
                                                                      lgrp.PrimaryGroup,
                                                                      lgrp.COA,
                                                                      lgrp.LedgerGroupName,
                                                                      lgrp.LedgerGroupId
                                                                  } into x3
                                                                  select new
                                                                  {
                                                                      x3.Key.PrimaryGroup,
                                                                      x3.Key.COA,
                                                                      x3.Key.LedgerGroupName,
                                                                      Ledgers = (from lgroup in accountingDBContext.LedgerGroups
                                                                                 join l in accountingDBContext.Ledgers on lgroup.LedgerGroupId equals l.LedgerGroupId
                                                                                 join tItm in accountingDBContext.TransactionItems on l.LedgerId equals tItm.LedgerId
                                                                                 join txn in accountingDBContext.Transactions on tItm.TransactionId equals txn.TransactionId
                                                                                 join fy in accountingDBContext.FiscalYears on txn.FiscalyearId equals fy.FiscalYearId
                                                                                 where fy.IsActive == true && lgroup.LedgerGroupId == x3.Key.LedgerGroupId
                                                                                 group new { lgroup, l, txn, tItm } by new
                                                                                 {
                                                                                     lgroup.PrimaryGroup,
                                                                                     lgroup.COA,
                                                                                     lgroup.LedgerGroupName,
                                                                                     l.LedgerId,
                                                                                     l.LedgerName
                                                                                 } into x4
                                                                                 select new
                                                                                 {
                                                                                     x4.Key.LedgerId,
                                                                                     x4.Key.LedgerName,
                                                                                     CrAmt = x4.Where(a => a.tItm.DrCr == false).Sum(a => a.tItm.Amount),
                                                                                     DrAmt = x4.Where(a => a.tItm.DrCr == true).Sum(a => a.tItm.Amount)
                                                                                 }).ToList()
                                                                  }).ToList()
                                              }).ToList()
                                  }).ToList();
                    responseData.Results = result;
                    responseData.Status = "OK";

                }
                #endregion
                #region Active Fiscal Year
                else if (reqType == "active-fiscal-year")
                {
                    var res = (from yr in accountingDBContext.FiscalYears
                               where yr.IsActive == true
                               select yr).FirstOrDefault();

                    responseData.Status = "OK";
                    responseData.Results = res;
                }
                #endregion
                #region Ledgers from Voucher Id
                else if (reqType == "ledgersFrmVoucherId")
                {
                    //var ledgerList = (from voucherLedgerGroupMap in accountingDBContext.VoucherLedgerGroupMaps
                    //                  join ledgerGroup in accountingDBContext.LedgerGroups on voucherLedgerGroupMap.LedgerGroupId equals ledgerGroup.LedgerGroupId
                    //                  join ledger in accountingDBContext.Ledgers on ledgerGroup.LedgerGroupId equals ledger.LedgerGroupId
                    //                  where (voucherLedgerGroupMap.VoucherId == voucherId && ledger.IsActive == true && voucherLedgerGroupMap.IsActive == true && ledgerGroup.IsActive == true)
                    //                  select new
                    //                  {
                    //                      ledger.LedgerId,
                    //                      ledger.LedgerName,
                    //                      ledger.IsInventoryAffected,
                    //                      ledger.CurrentBalance,
                    //                      voucherLedgerGroupMap.IsDebit,
                    //                      ledger.IsCostCenterApplicable,
                    //                      ledger.IsActive
                    //                  }).ToList();
                    //responseData.Status = "OK";
                    //responseData.Results = ledgerList;
                }
                #endregion
                #region Ledger Transaction List
                else if (reqType == "ledger-txn-list")
                {
                    //var txnIdList = (from txnItm in accountingDBContext.TransactionItems
                    //                 where txnItm.LedgerId == ledgerId && txnItm.IsActive == true
                    //                 select txnItm.TransactionId).ToList();

                    //var ledger = (from txnItm in accountingDBContext.TransactionItems
                    //              join led in accountingDBContext.Ledgers on txnItm.LedgerId equals led.LedgerId
                    //              where txnItm.LedgerId == ledgerId && txnItm.IsActive == true
                    //              select new
                    //              {
                    //                  LedgerName = led.LedgerName,
                    //                  OpeningBalance = led.OpeningBalance,
                    //                  CurrentBalance = led.CurrentBalance,
                    //                  DrTotalAmount = 0,
                    //                  CrTotalAmount = 0,
                    //                  LedgerTransactionItems = (from nesTxnItm in accountingDBContext.TransactionItems
                    //                                            join txn in accountingDBContext.Transactions on nesTxnItm.TransactionId equals txn.TransactionId
                    //                                            join refTxn in accountingDBContext.Transactions on txn.ReferenceTransactionId equals refTxn.TransactionId into refTxnTemp
                    //                                            from referenceTxn in refTxnTemp.DefaultIfEmpty()
                    //                                            join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                    //                                            join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                    //                                            join nesLedger in accountingDBContext.Ledgers on nesTxnItm.LedgerId equals nesLedger.LedgerId
                    //                                            where nesTxnItm != null && txnIdList.Contains(nesTxnItm.TransactionId) && nesTxnItm.LedgerId != ledgerId
                    //                                            select new
                    //                                            {
                    //                                                TransactionId = txn.TransactionId,
                    //                                                FiscalYear = fiscal.FiscalYearName,
                    //                                                VoucherNumber = txn.VoucherNumber,
                    //                                                ReferenceVoucherNumber = (int?)referenceTxn.VoucherNumber ?? 0,
                    //                                                VoucherType = voucher.VoucherName,
                    //                                                TransactionDate = txn.TransactionDate,
                    //                                                LedgerName = nesLedger.LedgerName,
                    //                                                IsDebit = nesTxnItm.IsDebit,
                    //                                                Amount = nesTxnItm.Amount
                    //                                            }).OrderBy(a => a.TransactionId).ThenByDescending(a => a.IsDebit).ToList()

                    //              }).FirstOrDefault();
                    //var result = ledger;

                    //responseData.Status = "OK";
                    //responseData.Results = ledger;
                }
                #endregion
                #region Transaction List
                else if (reqType == "transaction")
                {
                    var txnList = (from txn in accountingDBContext.Transactions
                                   join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                                   join head in accountingDBContext.VoucherHeads on txn.VoucherHeadId equals head.VoucherHeadId
                                   join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                                   where txn.TransactionId == transactionId && txn.IsActive == true
                                   select new
                                   {
                                       TransactionId = txn.TransactionId,
                                       VoucherNumber = txn.VoucherNumber,
                                       FiscalYear = fiscal.FiscalYearName,
                                       VoucherHead = head.VoucherHeadName,
                                       TransactionDate = txn.TransactionDate,
                                       VoucherType = voucher.VoucherName,
                                       Remarks = txn.Remarks,
                                       TransactionItems = (from txnItm in accountingDBContext.TransactionItems
                                                           join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                           join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                           where txnItm.TransactionId == txn.TransactionId
                                                           select new
                                                           {
                                                               LedgerGroupName = ledgp.LedgerGroupName,
                                                               LedgerName = ledger.LedgerName,
                                                               DrCr = txnItm.DrCr,
                                                               Amount = txnItm.Amount
                                                           }).OrderByDescending(a => a.DrCr == true).ToList()
                                   }).FirstOrDefault();
                    responseData.Status = "OK";
                    responseData.Results = txnList;
                }
                #endregion
                #region Transaction By Voucher
                else if (reqType == "transactionbyVoucher")
                {
                    //getting uniqueid and sectionid of transaction 
                    var txnids = (from txn in accountingDBContext.Transactions
                                  where txn.VoucherNumber == voucherNumber && txn.IsActive == true
                                  select new
                                  {
                                      txn.SectionId,
                                      txn.TUId
                                  }).FirstOrDefault();
                    if (voucherNumber.Contains("SV") && txnids.SectionId == 2)
                    {//Ajay 15Feb Here we only getting records for Billing Sales Voucher
                        //getting single transaction with multiple vouchers
                        var alltransactions = (from txn in accountingDBContext.Transactions
                                               where txn.TUId == txnids.TUId
                                               select txn).ToList();
                        var alltransactionitems = (from txnitm in accountingDBContext.TransactionItems.AsEnumerable()
                                                   join txn in alltransactions on txnitm.TransactionId equals txn.TransactionId
                                                   select txnitm).ToList();
                        //getting only single sales voucher records
                        var transactions = (from txn in alltransactions
                                            where txn.VoucherNumber == voucherNumber && txn.IsActive == true
                                            select txn).ToList();
                        //getting transaction items for selected trasnaction
                        var transactionitems = (from ti in alltransactionitems
                                                join t in transactions on ti.TransactionId equals t.TransactionId
                                                select ti).ToList();
                        //getting vouchers
                        var vouchers = (from v in accountingDBContext.Vouchers select v).ToList();
                        //getting voucher heads
                        var voucherheads = (from head in accountingDBContext.VoucherHeads select head).ToList();
                        //fiscal year
                        var fiscalYear = (from fiscal in accountingDBContext.FiscalYears select fiscal).ToList();
                        //getting ledgers
                        var ledgers = (from l in accountingDBContext.Ledgers select l).ToList();
                        //getting ledgergroups
                        var ledgergroup = (from lg in accountingDBContext.LedgerGroups select lg).ToList();
                        //getting trasnaction items details for supplier patient and for user
                        var transactionitemdetails = (from d in accountingDBContext.TransactionItemDetails select d).ToList();
                        //getting patient
                        var patients = (from pat in accountingDBContext.PatientModel.AsEnumerable()
                                        join txndetail in transactionitemdetails on pat.PatientId equals txndetail.ReferenceId
                                        join txnitm in alltransactionitems on txndetail.TransactionItemId equals txnitm.TransactionItemId
                                        where txndetail.ReferenceType == "Patient"
                                        select new
                                        {
                                            txndetail.ReferenceId,
                                            txnitm.LedgerId,
                                            txnitm.DrCr,
                                            Name = pat.FirstName + pat.LastName,
                                            txndetail.Amount
                                        }).ToList();
                        //getting suppliers
                        var supplier = (from sup in accountingDBContext.PHRMSupplier select sup).ToList();
                        //getting user details
                        var userDetails = (from txn in alltransactions
                                           join txnitm in alltransactionitems on txn.TransactionId equals txnitm.TransactionId
                                           join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                           join emp in accountingDBContext.Emmployees.AsEnumerable() on txndetail.ReferenceId equals emp.EmployeeId
                                           where txndetail.ReferenceType == "User"
                                           select new
                                           {
                                               LedgerId = txnitm.LedgerId,
                                               DrCr = txnitm.DrCr,
                                               Name = emp.FirstName + " " + (string.IsNullOrEmpty(emp.LastName) ? "" : emp.LastName),
                                               txndetail.ReferenceId,
                                               txndetail.Amount,
                                               txn.VoucherNumber,
                                           }).ToList();
                        //getting amount of credit note voucher and payment voucher
                        var Amounts = (from txn in alltransactions
                                       join txnItm in alltransactionitems on txn.TransactionId equals txnItm.TransactionId
                                       join led in ledgers on txnItm.LedgerId equals led.LedgerId
                                       group new { txn, txnItm, led } by new { txn.VoucherId } into x
                                       select new
                                       {
                                           ReturnAmount = x.Where(a => a.txn.VoucherNumber.Contains("CN") && a.txnItm.DrCr == true /*&& a.txn.TransactionType.StartsWith("Cash")*/).Sum(a => a.txnItm.Amount),
                                           PaymentAmount = x.Where(a => a.txn.VoucherNumber.Contains("PMTV") && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount),
                                           ReturnDiscount = x.Where(a => a.led.Name == "EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount),
                                           ReceivablesAmount = x.Where(a => a.led.Name == "ACA_SUNDRY_DEBTORS_RECEIVABLES" && a.txnItm.DrCr == true).Sum(a => a.txnItm.Amount)
                                                        - x.Where(a => a.led.Name == "ACA_SUNDRY_DEBTORS_RECEIVABLES" && a.txnItm.DrCr == false).Sum(a => a.txnItm.Amount)
                                       }).ToList();
                        //getting user cash collection
                        var UserCashCollection = (from user in userDetails
                                                  group new { user } by new { user.ReferenceId } into x
                                                  select new
                                                  {
                                                      UserName = x.Select(a => a.user.Name).FirstOrDefault(),
                                                      SalesDr = x.Where(a => a.user.DrCr == true && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                                                      SalesCr = x.Where(a => a.user.DrCr == false && a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                                                      DepositDr = x.Where(a => a.user.DrCr == true && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                                                      DepositCr = x.Where(a => a.user.DrCr == false && !a.user.VoucherNumber.Contains("SV")).Sum(a => a.user.Amount),
                                                  }).ToList();
                        //getting record for selected sales voucher
                        var temp = (from txn in transactions
                                    join voucher in vouchers on txn.VoucherId equals voucher.VoucherId
                                    join head in voucherheads on txn.VoucherHeadId equals head.VoucherHeadId
                                    join fiscal in fiscalYear on txn.FiscalyearId equals fiscal.FiscalYearId
                                    select new
                                    {
                                        txn.VoucherNumber,
                                        fiscal.FiscalYearName,
                                        head.VoucherHeadName,
                                        txn.TransactionDate,
                                        voucher.VoucherName,
                                        txn.Remarks
                                    }).ToList();
                        //formatting data for sales voucher
                        var txnList = (from temptxn in temp
                                       select new
                                       {
                                           VoucherNumber = temptxn.VoucherNumber,
                                           FiscalYear = temptxn.FiscalYearName,
                                           VoucherHead = temptxn.VoucherHeadName,
                                           TransactionDate = temptxn.TransactionDate,
                                           VoucherType = temptxn.VoucherName,
                                           Remarks = temptxn.Remarks,
                                           TransactionItems = (from txnItm in alltransactionitems
                                                               join ledger in ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                               join txn in alltransactions on txnItm.TransactionId equals txn.TransactionId
                                                               join ledgp in ledgergroup on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                               group new { ledger, ledgp, txnItm, txn } by new
                                                               {
                                                                   ledgp.LedgerGroupName,
                                                                   ledger.LedgerName,
                                                                   txnItm.DrCr,
                                                                   ledger.LedgerId,
                                                                   txn.TransactionType,
                                                                   txn.VoucherNumber
                                                               }
                                                               into x
                                                               select new
                                                               {
                                                                   LedgerId = x.Key.LedgerId,
                                                                   LedgerGroupName = x.Key.LedgerGroupName,
                                                                   LedgerName = x.Key.LedgerName,
                                                                   DrCr = x.Key.DrCr,
                                                                   VoucherNumber = x.Key.VoucherNumber,
                                                                   TransactionType = x.Select(a => a.txn.TransactionType).ToList(),
                                                                   Name = x.Select(a => a.ledger.Name).FirstOrDefault(),
                                                                   Amount = x.Select(a => a.txnItm.Amount).Sum(),
                                                                   Remarks = x.Select(a => a.txn.Remarks),
                                                                   Details = (from pat in patients
                                                                              where pat.LedgerId == x.Key.LedgerId && pat.DrCr == x.Key.DrCr
                                                                              group new { pat } by new
                                                                              {
                                                                                  pat.ReferenceId,
                                                                                  pat.DrCr
                                                                              } into x1
                                                                              select new
                                                                              {
                                                                                  Name = x1.Select(a => a.pat.Name).FirstOrDefault(),
                                                                                  Dr = x1.Where(a => a.pat.DrCr == true).Sum(a => a.pat.Amount),
                                                                                  Cr = x1.Where(a => a.pat.DrCr == false).Sum(a => a.pat.Amount),
                                                                              }).ToList(),
                                                                   SupplierDetails = (from txnitm in transactionitems
                                                                                      join txndetail in transactionitemdetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                                      join sup in supplier on txndetail.ReferenceId equals sup.SupplierId
                                                                                      where txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Supplier"
                                                                                      group new { txnitm, sup, txndetail } by new
                                                                                      {
                                                                                          txndetail.ReferenceId,
                                                                                          txnitm.DrCr
                                                                                      } into x1
                                                                                      select new
                                                                                      {
                                                                                          Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                                                                                          Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                                                                                          Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                                                                                      }).ToList(),
                                                                   //UserDetails = (from u in userDetails
                                                                   //               where u.LedgerId == x.Key.LedgerId && u.DrCr == x.Key.DrCr
                                                                   //               group new { u } by new
                                                                   //               {
                                                                   //                   u.ReferenceId,
                                                                   //                   u.DrCr
                                                                   //               } into x1
                                                                   //               select new
                                                                   //               {
                                                                   //                   Name = x1.Select(a => a.u.Name).FirstOrDefault(),
                                                                   //                   Dr = x1.Where(a => a.u.DrCr == true).Sum(a => a.u.Amount),
                                                                   //                   Cr = x1.Where(a => a.u.DrCr == false).Sum(a => a.u.Amount),
                                                                   //               }).ToList(),
                                                               }).OrderByDescending(a => a.DrCr).ToList()
                                       }).FirstOrDefault();
                        //merging supplier details and patient details, user details
                        txnList.TransactionItems.ForEach(data =>
                        {
                            //foreach (var det in data.UserDetails)
                            //{
                            //    data.Details.Add(det);
                            //}
                            foreach (var det in data.SupplierDetails)
                            {
                                data.Details.Add(det);
                            }
                        });
                        //combining final result with credit not amount, payment amount, UserCashCollection and sales voucher transaction details
                        var res = new
                        {
                            Amounts = new
                            {
                                ReturnAmount = Amounts.Sum(a => a.ReturnAmount),
                                PaymentAmount = Amounts.Sum(a => a.PaymentAmount),
                                RetrunDiscount = Amounts.Sum(a => a.ReturnDiscount),
                                ReceivableAmount = Amounts.Sum(a => a.ReceivablesAmount),
                            },
                            txnList,
                            SectionId = txnids.SectionId,
                            UserCashCollection
                        };
                        responseData.Results = res;
                    }
                    else
                    {
                        var txnList = (from txn in accountingDBContext.Transactions
                                       join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                                       join head in accountingDBContext.VoucherHeads on txn.VoucherHeadId equals head.VoucherHeadId
                                       join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                                       where txn.VoucherNumber == voucherNumber && txn.IsActive == true
                                       select new
                                       {
                                           // TransactionId = txn.TransactionId,
                                           VoucherNumber = txn.VoucherNumber,
                                           FiscalYear = fiscal.FiscalYearName,
                                           VoucherHead = head.VoucherHeadName,
                                           TransactionDate = txn.TransactionDate,
                                           VoucherType = voucher.VoucherName,
                                           Remarks = txn.Remarks,
                                           TransactionItems = (from txnItm in accountingDBContext.TransactionItems
                                                               join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                               join txnp in accountingDBContext.Transactions on txnItm.TransactionId equals txnp.TransactionId
                                                               join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                               where txnp.VoucherNumber == voucherNumber
                                                               group new { ledger, ledgp, txnItm, txnp } by new
                                                               {
                                                                   ledgp.LedgerGroupName,
                                                                   ledger.LedgerName,
                                                                   txnItm.DrCr,
                                                                   ledger.LedgerId
                                                               }
                                                               into x
                                                               select new
                                                               {
                                                                   LedgerId = x.Key.LedgerId,
                                                                   LedgerGroupName = x.Key.LedgerGroupName,
                                                                   LedgerName = x.Key.LedgerName,
                                                                   DrCr = x.Key.DrCr,
                                                                   Amount = x.Select(a => a.txnItm.Amount).Sum(),
                                                                   Remarks = x.Select(a => a.txnp.Remarks),
                                                                   Details = (from txnitm in accountingDBContext.TransactionItems
                                                                              join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                              join pat in accountingDBContext.PatientModel on txndetail.ReferenceId equals pat.PatientId
                                                                              join txn in accountingDBContext.Transactions on txnitm.TransactionId equals txn.TransactionId
                                                                              where txn.VoucherNumber == voucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Patient"
                                                                              group new { txnitm, pat, txndetail } by new
                                                                              {
                                                                                  txndetail.ReferenceId,
                                                                                  txnitm.DrCr
                                                                              } into x1
                                                                              select new
                                                                              {
                                                                                  Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
                                                                                  Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                                                                                  Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                                                                              }).ToList(),
                                                                   SupplierDetails = (from txnitm in accountingDBContext.TransactionItems
                                                                                      join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                                      join sup in accountingDBContext.PHRMSupplier on txndetail.ReferenceId equals sup.SupplierId
                                                                                      join txn in accountingDBContext.Transactions on txnitm.TransactionId equals txn.TransactionId
                                                                                      where txn.VoucherNumber == voucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Supplier"
                                                                                      group new { txnitm, sup, txndetail } by new
                                                                                      {
                                                                                          txndetail.ReferenceId,
                                                                                          txnitm.DrCr
                                                                                      } into x1
                                                                                      select new
                                                                                      {
                                                                                          Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                                                                                          Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                                                                                          Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                                                                                      }).ToList(),
                                                                   UserDetails = (from txnitm in accountingDBContext.TransactionItems
                                                                                  join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                                  join emp in accountingDBContext.Emmployees on txndetail.ReferenceId equals emp.EmployeeId
                                                                                  join txn in accountingDBContext.Transactions on txnitm.TransactionId equals txn.TransactionId
                                                                                  where txn.VoucherNumber == voucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "User" && txn.TUId == txnids.TUId
                                                                                  group new { txnitm, emp, txndetail } by new
                                                                                  {
                                                                                      txndetail.ReferenceId,
                                                                                      txnitm.DrCr
                                                                                  } into x1
                                                                                  select new
                                                                                  {
                                                                                      Name = x1.Select(a => a.emp.FirstName + " " + (string.IsNullOrEmpty(a.emp.LastName) ? "" : a.emp.LastName)).FirstOrDefault(),
                                                                                      Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                                                                                      Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                                                                                  }).ToList(),
                                                                   VendorDetails = (from txnitm in accountingDBContext.TransactionItems
                                                                                    join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                                    join ven in accountingDBContext.InvVendors on txndetail.ReferenceId equals ven.VendorId
                                                                                    join txn in accountingDBContext.Transactions on txnitm.TransactionId equals txn.TransactionId
                                                                                    where txn.VoucherNumber == voucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Vendor"
                                                                                    group new { txnitm, ven, txndetail } by new
                                                                                    {
                                                                                        txndetail.ReferenceId,
                                                                                        txnitm.DrCr
                                                                                    } into x1
                                                                                    select new
                                                                                    {
                                                                                        Name = x1.Select(a => a.ven.VendorName).FirstOrDefault(),
                                                                                        Dr = x1.Where(a => a.txnitm.DrCr == true).Sum(a => a.txndetail.Amount),
                                                                                        Cr = x1.Where(a => a.txnitm.DrCr == false).Sum(a => a.txndetail.Amount),
                                                                                    }).ToList(),
                                                               }).OrderByDescending(a => a.DrCr).ToList()
                                       }).FirstOrDefault();
                        txnList.TransactionItems.ForEach(data =>
                        {
                            foreach (var det in data.UserDetails)
                            {
                                data.Details.Add(det);
                            }
                            foreach (var det in data.SupplierDetails)
                            {
                                data.Details.Add(det);
                            }
                            foreach (var det in data.VendorDetails)
                            {
                                data.Details.Add(det);
                            }
                        });
                        var res = new
                        {
                            SectionId = txnids.SectionId,
                            txnList
                        };
                        responseData.Results = res;
                    }
                    responseData.Status = "OK";
                }
                #endregion
                #region Check Reference Transaction Id
                else if (reqType == "check-reference-txnId")
                {
                    var txn = accountingDBContext.Transactions.
                        Where(a => a.VoucherNumber == voucherNumber && a.VoucherId == voucherId && a.IsActive == true).FirstOrDefault();
                    if (txn != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = txn;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.ErrorMessage = "Transaction Not Found";
                    }
                }
                #endregion
                #region Inventory GRI Items For Accounting
                else if (reqType == "inventory-to-accounting")
                {
                    AccountingTransferData obj = new AccountingTransferData(connString, 1);
                    List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(1, FromDate, ToDate);

                    //var result = new
                    //{
                    //    goodsReceiptItems = (from gr in inventoryDbContext.GoodsReceipts
                    //                         join vendor in inventoryDbContext.Vendors on gr.VendorId equals vendor.VendorId
                    //                         where gr.IsTransferredToACC != true && (DbFunctions.TruncateTime(gr.CreatedOn) >= FromDate && DbFunctions.TruncateTime(gr.CreatedOn) <= ToDate)
                    //                         group new { gr, vendor } by new
                    //                         {
                    //                             CreatedOn = DbFunctions.TruncateTime(gr.CreatedOn),
                    //                             PaymentMode = gr.PaymentMode,
                    //                             VendorId = vendor.VendorId,
                    //                         } into x
                    //                         select new
                    //                         {
                    //                             x.Key.CreatedOn,
                    //                             x.Key.VendorId,
                    //                             VendorName = x.Select(a => a.vendor.VendorName).FirstOrDefault(),
                    //                             Type = x.Key.PaymentMode == "Cash" ? "Goods Receipt Cash" : "Credit Goods Receipt",
                    //                             TransactionType = x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt",
                    //                             SalesAmount = x.Select(a => a.gr.SubTotal).Sum(),
                    //                             TotalAmount = x.Select(a => a.gr.TotalAmount).Sum(),
                    //                             VATAmount = x.Select(b => b.gr.VATTotal).Sum(),
                    //                             DiscountAmount = x.Select(c => c.gr.DiscountAmount).Sum(),
                    //                             Remarks = "Inventory Transaction entries to Accounting for" + (x.Key.PaymentMode == "Cash" ? "INVCashGoodReceipt1" : "INVCreditGoodReceipt ") + "on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                             ReferenceIds = x.Select(a => a.gr.GoodsReceiptID).Distinct().ToList(),
                    //                         }).ToList(),
                    //    writeOffItems = (from wf in inventoryDbContext.WriteOffItems
                    //                     where wf.IsTransferredToACC != true && (DbFunctions.TruncateTime(wf.CreatedOn) >= FromDate && DbFunctions.TruncateTime(wf.CreatedOn) <= ToDate)
                    //                     group new { wf } by new
                    //                     {
                    //                         CreatedOn = DbFunctions.TruncateTime(wf.CreatedOn),

                    //                     } into x
                    //                     select new
                    //                     {
                    //                         x.Key.CreatedOn,
                    //                         Type = "WriteOff",
                    //                         TransactionType = "INVWriteOff",
                    //                         TotalAmount = x.Select(a => a.wf.TotalAmount).Sum(),
                    //                         VATAmount = 0, //x.Select(b => b.gr.VATAmount).Sum(),
                    //                         Remarks = "Inventory Transaction entries to Accounting for write Off Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                         ReferenceIds = x.Select(a => a.wf.WriteOffId).Distinct().ToList(),
                    //                     }).ToList(),
                    //    returnToVender = (from ret in inventoryDbContext.ReturnToVendorItems
                    //                      join vendor in inventoryDbContext.Vendors
                    //                      on ret.VendorId equals vendor.VendorId
                    //                      join goodreceipt in inventoryDbContext.GoodsReceipts on ret.GoodsReceiptId equals goodreceipt.GoodsReceiptID
                    //                      where ret.IsTransferredToACC != true && (DbFunctions.TruncateTime(ret.CreatedOn) >= FromDate && DbFunctions.TruncateTime(ret.CreatedOn) <= ToDate)
                    //                      group new { ret, vendor, goodreceipt } by new
                    //                      {
                    //                          CreatedOn = DbFunctions.TruncateTime(ret.CreatedOn),
                    //                          VendorId = ret.VendorId,
                    //                          goodreceipt.PaymentMode
                    //                      } into x
                    //                      select new
                    //                      {
                    //                          x.Key.CreatedOn,
                    //                          x.Key.VendorId,
                    //                          VendorName = x.Select(a => a.vendor.VendorName).FirstOrDefault(),
                    //                          Type = x.Key.PaymentMode == "Cash" ? "Return To Vender Cash" : "Return To Vender Credit",
                    //                          //  Type = "Return To Vender",
                    //                          TransactionType = x.Key.PaymentMode == "Cash" ? "INVReturnToVendorCashGR" : "INVReturnToVendorCreditGR",
                    //                          TotalAmount = x.Select(a => a.ret.TotalAmount).Sum(),
                    //                          VATAmount = x.Select(b => b.ret.VAT).Sum(),
                    //                          Remarks = "Inventory Transaction entries to Accounting for Return to vendor Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                          ReferenceIds = x.Select(a => a.ret.ReturnToVendorItemId).Distinct().ToList(),
                    //                      }).ToList(),
                    //};

                    responseData.Status = "OK";
                    responseData.Results = result;

                }
                #endregion
                #region Ledger Mapping
                else if (reqType == "ledger-mapping")
                {
                    var res = new
                    {
                        supplier = (from m in accountingDBContext.LedgerMappings
                                    join s in accountingDBContext.PHRMSupplier on m.ReferenceId equals s.SupplierId
                                    where m.LedgerType == "pharmacysupplier"
                                    select new
                                    {
                                        m.LedgerId,
                                        s.SupplierId,
                                        m.LedgerType,
                                        LedgerName = s.SupplierName
                                    }).ToList(),
                        vendor = (from m in accountingDBContext.LedgerMappings
                                  join v in accountingDBContext.InvVendors on m.ReferenceId equals v.VendorId
                                  where m.LedgerType == "inventoryvendor"
                                  select new
                                  {
                                      v.VendorId,
                                      m.LedgerId,
                                      m.LedgerType,
                                      LedgerName = v.VendorName
                                  }).ToList()
                    };
                    responseData.Status = "OK";
                    responseData.Results = res;
                }
                #endregion
                #region Fiscal Year List
                else if (reqType == "fiscalYearList")
                {
                    var fiscalYears = accountingDBContext.FiscalYears.ToList();
                    responseData.Status = "OK";
                    responseData.Results = fiscalYears;
                }
                #endregion
                #region Accounting Transfer Rules
                else if (reqType == "accTransferRule")
                {
                    var result = (from grp in accountingDBContext.GroupMapping
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
                                  }
                                  ).ToList();
                    if (result.Count > 0 && result != null)
                    {
                        responseData.Status = "OK";
                        responseData.Results = result;
                    }
                    else
                    {
                        responseData.Status = "Failed";
                        responseData.Results = "record not found";
                    }
                }
                #endregion
                #region Billing data for Accounting
                else if (reqType == "billing-to-accounting")
                {
                    RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
                    AccountingTransferData obj = new AccountingTransferData(connString, currentUser.EmployeeId);
                    List<TransactionModel> res = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(2, FromDate, ToDate);

                    //var res = (from syncItm in billingDbContext.SyncBillingAccounting
                    //           where syncItm.IsTransferedToAcc != true && (DbFunctions.TruncateTime(syncItm.TransactionDate) >= FromDate && DbFunctions.TruncateTime(syncItm.TransactionDate) <= ToDate)
                    //           group new { syncItm } by new
                    //           {
                    //               syncItm.TransactionType,
                    //               TransactionDate = DbFunctions.TruncateTime(syncItm.TransactionDate),
                    //               syncItm.IncomeLedgerName,
                    //               PaymentMode = (syncItm.PaymentMode == "card" || syncItm.PaymentMode == "cheque") ? "bank" : syncItm.PaymentMode
                    //           } into x
                    //           select new
                    //           {
                    //               x.Key.TransactionDate,
                    //               x.Key.IncomeLedgerName,
                    //               x.Key.TransactionType,
                    //               x.Key.PaymentMode,
                    //               SalesAmount = x.Sum(a => a.syncItm.SubTotal),
                    //               TaxAmount = x.Sum(a => a.syncItm.TaxAmount),
                    //               DiscountAmount = x.Sum(a => a.syncItm.DiscountAmount),
                    //               SettlementDiscountAmount = x.Sum(a => a.syncItm.SettlementDiscountAmount),
                    //               TotalAmount = x.Key.TransactionType == "CreditBillPaid" ? x.Sum(a => a.syncItm.TotalAmount) - x.Sum(a => a.syncItm.SettlementDiscountAmount) : x.Sum(a => a.syncItm.TotalAmount), //in case of deposit add/deduct
                    //               BillTxnItemIds = x.Select(a => a.syncItm.ReferenceId).ToList(),
                    //               BillSyncs = x.Select(a => new { a.syncItm.BillingAccountingSyncId, a.syncItm.PatientId, a.syncItm.TotalAmount, a.syncItm.CreatedBy, a.syncItm.ReferenceModelName }).ToList(),
                    //               //     Remarks ="Transaction for" + x.Key.IncomeLedgerName + " income ledger" + x.Key.TransactionType,
                    //               Remarks = "Transaction for " + x.Key.IncomeLedgerName + " income ledger : " + x.Key.TransactionType,
                    //           }
                    //           ).OrderBy(s => s.TransactionDate).ThenBy(s => s.IncomeLedgerName).ToList();
                    responseData.Status = "OK";
                    responseData.Results = res;
                }
                #endregion
                #region Pharmacy data for Accounting
                else if (reqType == "pharmacy-to-accounting")
                {
                    AccountingTransferData obj = new AccountingTransferData(connString, 1);
                    List<TransactionModel> result = DanpheEMR.AccTransfer.AccountingTransferData.GetMapAndTransferDataSectionWise(3, FromDate, ToDate);
                    //var result = new
                    //{
                    //    //NageshBB- 15 Jan 2019
                    //    /////ReferenceIds - this for track back records 
                    //    //for billing we are saving BillingItemsId as referenceIds
                    //    //but for pharmacy we are saving Parent table id's as reference id's 
                    //    //Please note we need to track back using parent table id's
                    //    CashInvoice = (from invo in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                    //                   where invo.IsTransferredToACC != true && (Convert.ToDateTime(invo.CreateOn).Date >= FromDate && Convert.ToDateTime(invo.CreateOn).Date <= ToDate)
                    //                   group new { invo } by new
                    //                   {
                    //                       CreatedOn = Convert.ToDateTime(invo.CreateOn).Date,
                    //                       //PatientId = invo.PatientId,
                    //                   } into x
                    //                   select new
                    //                   {
                    //                       x.Key.CreatedOn,
                    //                       //x.Key.PatientId,
                    //                       TransactionType = "PHRMCashInvoice1",
                    //                       Type = "Cash Invoice Sale",
                    //                       SalesAmount = x.Select(a => a.invo.SubTotal).Sum(),
                    //                       TotalAmount = x.Select(a => a.invo.TotalAmount).Sum(),
                    //                       VATAmount = x.Select(a => a.invo.VATAmount).Sum(),
                    //                       DiscountAmount = x.Select(b => b.invo.DiscountAmount).Sum(),
                    //                       BillSyncs = x.GroupBy(a => new { a.invo.PatientId }).Select(a => new { a.Key.PatientId, TotalAmount = a.Select(b => b.invo.TotalAmount).Sum() }).ToList(),
                    //                       Remarks = "Transaction of Invoice Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                       ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
                    //                   }).ToList(),
                    //    CashInvoiceReturn = (from invo in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                    //                         join invReturnItm in pharmacyDbContext.PHRMInvoiceReturnItemsModel
                    //                         on invo.InvoiceId equals invReturnItm.InvoiceId
                    //                         where invReturnItm.IsTransferredToACC != true && (Convert.ToDateTime(invReturnItm.CreatedOn).Date >= FromDate && Convert.ToDateTime(invReturnItm.CreatedOn).Date <= ToDate)
                    //                         group new { invReturnItm, invo } by new
                    //                         {
                    //                             CreatedOn = Convert.ToDateTime(invReturnItm.CreatedOn).Date
                    //                         } into x
                    //                         select new
                    //                         {
                    //                             x.Key.CreatedOn,
                    //                             TransactionType = "PHRMCashInvoiceReturn",
                    //                             Type = "Cash Invoice Return",
                    //                             SalesAmount = x.Select(a => a.invReturnItm.SubTotal).Sum(),
                    //                             TotalAmount = x.Select(a => a.invReturnItm.TotalAmount).Sum(),
                    //                             VATAmount = x.Select(c => ((c.invReturnItm.SubTotal - ((c.invReturnItm.SubTotal * (Convert.ToDecimal(c.invReturnItm.DiscountPercentage))) / 100)) * Convert.ToDecimal(c.invReturnItm.VATPercentage)) / 100).Sum(),
                    //                             DiscountAmount = x.Select(b => b.invReturnItm.SubTotal * (Convert.ToDecimal(b.invReturnItm.DiscountPercentage / 100))).Sum(),
                    //                             Remarks = "Transaction of Invoice return Items on date: ", // + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                             ReferenceIds = x.Select(a => a.invo.InvoiceId).Distinct().ToList(),
                    //                         }).ToList(),

                    //    writeoff = (from wrOf in pharmacyDbContext.PHRMWriteOff
                    //                where wrOf.IsTransferredToACC != true && (DbFunctions.TruncateTime(wrOf.CreatedOn) >= FromDate && DbFunctions.TruncateTime(wrOf.CreatedOn) <= ToDate)
                    //                group new { wrOf } by new
                    //                {
                    //                    CreatedOn = DbFunctions.TruncateTime(wrOf.CreatedOn)

                    //                } into x
                    //                select new
                    //                {
                    //                    x.Key.CreatedOn,
                    //                    TransactionType = "PHRMWriteOff",
                    //                    Type = "Breakage",
                    //                    TotalAmount = x.Select(a => a.wrOf.TotalAmount).Sum(),
                    //                    SalesAmount = x.Select(a => a.wrOf.SubTotal).Sum(),
                    //                    VATAmount = x.Select(b => b.wrOf.VATAmount).Sum(),
                    //                    DiscountAmount = x.Select(b => b.wrOf.DiscountAmount).Sum(),
                    //                    Remarks = "Transaction of WriteOff Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                    ReferenceIds = x.Select(a => a.wrOf.WriteOffId).Distinct().ToList(),
                    //                }).ToList(),

                    //    returnToSupplier = (from ret in pharmacyDbContext.PHRMReturnToSupplier
                    //                        join supplier in pharmacyDbContext.PHRMSupplier
                    //                        on ret.SupplierId equals supplier.SupplierId
                    //                        where ret.IsTransferredToACC != true && (DbFunctions.TruncateTime(ret.CreatedOn) >= FromDate && DbFunctions.TruncateTime(ret.CreatedOn) <= ToDate)
                    //                        group new { ret } by new
                    //                        {
                    //                            CreatedOn = DbFunctions.TruncateTime(ret.CreatedOn),
                    //                            supplier.SupplierId,
                    //                            supplier.SupplierName

                    //                        } into x
                    //                        select new
                    //                        {
                    //                            x.Key.CreatedOn,
                    //                            TransactionType = "PHRMCashReturnToSupplier",
                    //                            Type = "Return to Supplier",
                    //                            x.Key.SupplierId,
                    //                            x.Key.SupplierName,
                    //                            SalesAmount = x.Select(a => a.ret.SubTotal).Sum(),
                    //                            TotalAmount = x.Select(a => a.ret.TotalAmount).Sum(),
                    //                            VATAmount = x.Select(b => b.ret.VATAmount).Sum(),
                    //                            DiscountAmount = x.Select(b => b.ret.DiscountAmount).Sum(),
                    //                            Remarks = "Transaction of Return To Supplier Items on date: ",// + DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                            ReferenceIds = x.Select(a => a.ret.ReturnToSupplierId).ToList(),
                    //                        }).ToList(),
                    //    goodsReceiptItems = (from gr in pharmacyDbContext.PHRMGoodsReceipt
                    //                         where gr.IsTransferredToACC != true && (DbFunctions.TruncateTime(gr.CreatedOn) >= FromDate && DbFunctions.TruncateTime(gr.CreatedOn) <= ToDate)
                    //                         group new { gr } by new
                    //                         {
                    //                             CreatedOn = DbFunctions.TruncateTime(gr.CreatedOn),
                    //                             gr.SupplierId,
                    //                         } into x
                    //                         select new
                    //                         {
                    //                             x.Key.CreatedOn,
                    //                             TransactionType = "PHRMCashGoodReceipt1",
                    //                             Type = "Cash Good Receipt",
                    //                             TotalAmount = x.Select(a => a.gr.TotalAmount).Sum(),
                    //                             SalesAmount = x.Select(a => a.gr.SubTotal).Sum(),
                    //                             VATAmount = x.Select(b => b.gr.VATAmount).Sum(),
                    //                             DiscountAmount = x.Select(b => b.gr.DiscountAmount).Sum(),
                    //                             Remarks = "Transaction of Goods Receipt Items on date: ", //+ DbFunctions.TruncateTime(x.Key.CreatedOn),
                    //                             ReferenceIds = x.Select(a => a.gr.GoodReceiptId).Distinct().ToList(),
                    //                             x.Key.SupplierId,
                    //                             SupplierName = (from s in pharmacyDbContext.PHRMSupplier where s.SupplierId == x.Key.SupplierId select s.SupplierName).FirstOrDefault()
                    //                         }).ToList(),
                    //};

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
            }

            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }
        [HttpPost]
        public string Post()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            PharmacyDbContext pharmacyDbContext = new PharmacyDbContext(connString);
            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");

                #region Post Transaction
                if (reqType == "postTransaction")
                {
                    TransactionModel txnClient = DanpheJSONConvert.
                        DeserializeObject<TransactionModel>(str);
                    if (txnClient != null)
                    {
                        txnClient.VoucherNumber = GetVoucherNumber(accountingDBContext, txnClient.VoucherId);
                        txnClient.TUId = GetTUID(accountingDBContext);
                        txnClient.SectionId = 4;//for manual entry we are using section 4
                        accountingDBContext.Transactions.Add(ProcessTransactions(txnClient));
                        accountingDBContext.SaveChanges();
                        var referenceIds = txnClient.TransactionLinks.Select(s => s.ReferenceId).ToArray();
                        // responseData.Results = txnClient.TransactionId;
                        responseData.Results = txnClient.VoucherNumber;
                        responseData.Status = "OK";
                    }
                    else
                    {
                        responseData.Status = "Failed";
                    }
                }
                #endregion
                #region Post Transaction List
                else if (reqType == "postTransactionList")
                {
                    //REMARK: RAMAVTAR: NEED TO MAKE THIS ONE TRANSACTION

                    List<TransactionModel> txnListClient = DanpheJSONConvert.
                        DeserializeObject<List<TransactionModel>>(str);


                    AccountingTransferData accountingTransferData = new AccountingTransferData(connString, 1);
                    var check = AccountingTransferData.PostTxnData(txnListClient);
                    //List<int> syncedIds = new List<int>();
                    ////15Jan'19 NageshBB-here we are changing logic of voucher no
                    ////Hams wants voucher no like same voucherNo for one time txn
                    ////here no meaning of get voucher no every time
                    //if (txnListClient.Count > 0)
                    //{
                    //    //here transaction list from billing or may be from inventory
                    //    //1-sectionId for inventory 2-sectionid for billing
                    //    var sectionId = txnListClient[0].SectionId;
                    //    var distinctVouchers = (from txn in txnListClient
                    //                            select new { txn.VoucherId }).Distinct().ToList();
                    //    var Tuid = GetTUID(accountingDBContext);
                    //    Hashtable voucherNumberList = new Hashtable();
                    //    for (int p = 0; p < distinctVouchers.Count; p++)
                    //    {
                    //        string vNum = GetVoucherNumber(accountingDBContext, distinctVouchers[p].VoucherId);
                    //        voucherNumberList.Add(distinctVouchers[p].VoucherId, vNum);
                    //    }
                    //    //for below line user can only transfer one type of voucher records
                    //    // string VoucherNumber = GetVoucherNumber(accountingDBContext, txnListClient[0].VoucherId);//new code for voucher number creation 
                    //    if (sectionId == 2)
                    //    {//billing

                    //        List<string> allSyncAccBillingIds = new List<string>();
                    //        txnListClient.ForEach(txn =>
                    //        {
                    //            //txn.VoucherNumber = GetVoucherNumber(accountingDBContext, txn.VoucherId); 
                    //            txn.TUId = Tuid;
                    //            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                    //            TransactionModel txntemp = ProcessTransactions(txn);
                    //            accountingDBContext.Transactions.Add(txntemp);
                    //            accountingDBContext.SaveChanges();
                    //            //updating Sync_BillingAccounting
                    //            var txntype = "BillingRecords";
                    //            txn.BillSyncs.ForEach(bill =>
                    //            {
                    //                var refId = bill.BillingAccountingSyncId.ToString();
                    //                allSyncAccBillingIds.Add(refId);
                    //            });
                    //            string refIdStr = string.Join(",", allSyncAccBillingIds.Select(p => p));
                    //            accountingDBContext.UpdateIsTransferToACC(refIdStr, txntype);
                    //            //txn.BillSyncs.ForEach(sync =>
                    //            //{
                    //            //    if (!syncedIds.Any(a => a == sync.BillingAccountingSyncId))
                    //            //    {
                    //            //        syncedIds.Add(sync.BillingAccountingSyncId);
                    //            //        sync.IsTransferedToAcc = true;
                    //            //        accountingDBContext.SyncBillingAccounting.Attach(sync);
                    //            //        accountingDBContext.Entry(sync).Property(a => a.IsTransferedToAcc).IsModified = true;
                    //            //    }
                    //            //});

                    //            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                    //            {
                    //                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                    //                {
                    //                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                    //                    {
                    //                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                    //                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                    //                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                    //                    }
                    //                }
                    //            }
                    //        });
                    //        accountingDBContext.SaveChanges();
                    //    }
                    //    else if (sectionId == 1)
                    //    {//inventory
                    //        //List<string> allReferenceIds = new List<string>();
                    //        txnListClient.ForEach(txn =>
                    //        {
                    //            txn.TUId = Tuid;
                    //            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                    //            // txn.VoucherNumber = "INV-" + txn.TransactionLinks[txn.TransactionLinks.Count - 1].ReferenceId.ToString();
                    //            //  accountingDBContext.Transactions.Add(ProcessTransactions(txn));
                    //            //var referId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                    //            //referId.ForEach(newId => allReferenceIds.Add((int)newId));
                    //            TransactionModel txntemp = ProcessTransactions(txn);
                    //            accountingDBContext.Transactions.Add(txntemp);
                    //            accountingDBContext.SaveChanges();
                    //            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                    //            {
                    //                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                    //                {
                    //                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                    //                    {
                    //                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                    //                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                    //                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                    //                    }
                    //                }
                    //            }
                    //        });

                    //        accountingDBContext.SaveChanges();
                    //        List<string> TransactionType = new List<string>();
                    //        var distinctTxnTypeList = txnListClient.Select(a => a.TransactionType).ToList().Distinct().ToList();
                    //        Hashtable ReferenceIdWithTypeList = new Hashtable();
                    //        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                    //        {
                    //            var filteredData = (from t in txnListClient
                    //                                where t.TransactionType == distinctTxnTypeList[i]
                    //                                select t).ToList();
                    //            List<string> allReferenceIds = new List<string>();
                    //            filteredData.ForEach(txn =>
                    //            {
                    //                var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                    //                refId.ForEach(newId => allReferenceIds.Add((string)newId));
                    //            });
                    //            string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                    //            ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                    //        }

                    //        if (distinctTxnTypeList.Count > 0)
                    //        {
                    //            foreach (string txnType in distinctTxnTypeList)
                    //            {
                    //                accountingDBContext.UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                    //            }
                    //        }
                    //    }
                    //    else
                    //    {//pharmacy

                    //        txnListClient.ForEach(txn =>
                    //        {
                    //            txn.TUId = Tuid;
                    //            txn.VoucherNumber = voucherNumberList[txn.VoucherId].ToString();
                    //            TransactionModel txntemp = ProcessTransactions(txn);
                    //            accountingDBContext.Transactions.Add(txntemp);
                    //            accountingDBContext.SaveChanges();
                    //            for (int i = 0; i < txntemp.TransactionItems.Count; i++)
                    //            {
                    //                if (txntemp.TransactionItems[i].IsTxnDetails == true)
                    //                {
                    //                    for (int j = 0; j < txntemp.TransactionItems[i].TransactionItemDetails.Count; j++)
                    //                    {
                    //                        TransactionItemDetailModel tmpTxnDetail = txntemp.TransactionItems[i].TransactionItemDetails[j];
                    //                        tmpTxnDetail.TransactionItemId = txntemp.TransactionItems[i].TransactionItemId;
                    //                        accountingDBContext.TransactionItemDetails.Add(tmpTxnDetail);
                    //                    }
                    //                }
                    //            }
                    //        });
                    //        accountingDBContext.SaveChanges();
                    //        List<string> TransactionType = new List<string>();
                    //        var distinctTxnTypeList = txnListClient.Select(a => a.TransactionType).ToList().Distinct().ToList();
                    //        Hashtable ReferenceIdWithTypeList = new Hashtable();
                    //        for (int i = 0; i < distinctTxnTypeList.Count; i++)
                    //        {
                    //            var filteredData = (from t in txnListClient
                    //                                where t.TransactionType == distinctTxnTypeList[i]
                    //                                select t).ToList();
                    //            List<string> allReferenceIds = new List<string>();
                    //            filteredData.ForEach(txn =>
                    //            {
                    //                var refId = txn.TransactionLinks.Select(s => s.ReferenceId).ToList();
                    //                refId.ForEach(newId => allReferenceIds.Add((string)newId));
                    //            });
                    //            string refIdStr = string.Join(",", allReferenceIds.Select(p => p));
                    //            ReferenceIdWithTypeList.Add(distinctTxnTypeList[i], refIdStr);
                    //        }

                    //        if (distinctTxnTypeList.Count > 0)
                    //        {
                    //            foreach (string txnType in distinctTxnTypeList)
                    //            {
                    //                accountingDBContext.UpdateIsTransferToACC(ReferenceIdWithTypeList[txnType].ToString(), txnType);
                    //            }
                    //        }
                    //    }
                    //    responseData.Results = "no single voucher";
                    //    responseData.Status = "OK";
                    //    //    responseData.Results = "Transfered all records to accounting";
                    //}
                    //else
                    //{
                    //    responseData.Status = "Failed";
                    //    responseData.Results = "No record found";
                    //}
                }
                #endregion
                #region Post List of Transaction
                else if (reqType == "post-txns")
                {
                    List<TransactionModel> transactions = DanpheJSONConvert.
                        DeserializeObject<List<TransactionModel>>(str);
                    transactions.ForEach(txn =>
                                {
                                    accountingDBContext.Transactions.Add(ProcessTransactions(txn));
                                });
                    accountingDBContext.SaveChanges();
                    responseData.Status = "OK";
                }
                #endregion
                #region Post Account Closure
                else if (reqType == "post-account-closure")
                {
                    ////account closure transaction 
                    //AccountClosureVM closureVM = DanpheJSONConvert.DeserializeObject<AccountClosureVM>(str);

                    //Boolean Flag = AccountingBL.AccountClosureTransaction(closureVM, accountingDBContext);

                    FiscalYearModel fiscalYear = DanpheJSONConvert.DeserializeObject<FiscalYearModel>(str);

                    Boolean Flag = AccountingBL.AccountClosure(fiscalYear, accountingDBContext);


                }
                #endregion
                #region Adding Ledger while transfer record to Accounting
                else if (reqType == "AddLedgersFromAcc")
                {
                    try
                    {
                        List<LedgerModel> ledgers = DanpheJSONConvert.DeserializeObject<List<LedgerModel>>(str);
                        {
                            ledgers.ForEach(led =>
                            {
                                led.CreatedOn = System.DateTime.Now;
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
                            responseData.Status = "OK";
                        }
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
                #endregion
                #region Post Sync Accounting
                else if (reqType == "post-sync-accounting")
                {
                    AccountingTxnSyncVM txnSyncVM = DanpheJSONConvert.DeserializeObject<AccountingTxnSyncVM>(str);

                    Boolean Flag = AccountingBL.AccountingTxnSync(txnSyncVM, accountingDBContext);
                }
                #endregion
                #region Post Accounting Invoice Data
                else if (reqType == "post-accounting-invoice-data")
                {
                    AccountingInvoiceDataModel invoiceDataModel = DanpheJSONConvert.DeserializeObject<AccountingInvoiceDataModel>(str);
                    invoiceDataModel.CreatedOn = DateTime.Now;
                    accountingDBContext.AccountingInvoiceData.Add(invoiceDataModel);
                    accountingDBContext.SaveChanges();
                }
                #endregion
                responseData.Status = "OK";
            }
            catch (Exception ex)
            {
                responseData.Status = "Failed";
                responseData.ErrorMessage = ex.Message + " exception details:" + ex.ToString();
            }
            return DanpheJSONConvert.SerializeObject(responseData, true);
        }


        [HttpPut]
        public string Put()
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            try
            {
                string str = this.ReadPostData();
                string reqType = this.ReadQueryStringData("reqType");

                responseData.Status = "OK";
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

        #region Update Ledger Balance
        /*Calculation Method:
        If transactionItem's Ledger's IsDebit is equal to LedgerGroup's IsDebit
        Then Add the the ledger's amount to current balance
        Else
        Subtract the ledger's amount from current balance*/
        public void UpdateLedgerBalance(List<TransactionItemModel> transactionItemList)
        {
            //AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            //transactionItemList.ForEach(txnItm =>
            //{
            //    LedgerModel ledger = (from led in accountingDBContext.Ledgers
            //                          where led.LedgerId == txnItm.LedgerId
            //                          select led).FirstOrDefault();

            //    if (ledger != null)
            //    {
            //        bool IsDebit = (from ledGrp in accountingDBContext.LedgerGroups
            //                        join ledGrpCat in accountingDBContext.LedgerGroupsCategory on ledGrp.LedgerGroupCategoryId equals ledGrpCat.LedgerGroupCategoryId
            //                        where ledGrp.LedgerGroupId == ledger.LedgerGroupId
            //                        select ledGrpCat.IsDebit).FirstOrDefault();

            //        if (txnItm.DrCr == IsDebit)
            //            ledger.CurrentBalance -= txnItm.Amount;
            //        else
            //            ledger.CurrentBalance += txnItm.Amount;
            //        accountingDBContext.Ledgers.Attach(ledger);
            //        accountingDBContext.Entry(ledger).State = EntityState.Modified;
            //        accountingDBContext.Entry(ledger).Property(x => x.CreatedOn).IsModified = false;
            //        accountingDBContext.Entry(ledger).Property(x => x.CreatedBy).IsModified = false;
            //        accountingDBContext.SaveChanges();
            //    }
            //});

        }
        #endregion
        #region Get Voucher Number
        //NageshBB-22-oct-2018
        //now voucher number like JV-1,JV-2,PV-1,PV-2....JV-n,PV-n 
        //here JV is Journal voucher, PV is Purchase Voucher
        public string GetVoucherNumber(AccountingDbContext accountingDBContext, int voucherId)
        {
            var transList = (from txn in accountingDBContext.Transactions
                             where txn.VoucherId == voucherId
                             select txn
                                ).ToList().LastOrDefault();
            var voucherCode = (from v in accountingDBContext.Vouchers
                               where v.VoucherId == voucherId
                               select v.VoucherCode).FirstOrDefault();
            //var strList = voucherName.Split(' ').ToList<string>();
            //string tempStr = "";
            //strList.ForEach(t => {
            //    t.Trim();
            //    if (t.Length > 0)
            //    {
            //        tempStr = tempStr + t[0];
            //    }
            //});
            if (transList != null)
            {
                IList<string> l = transList.VoucherNumber.Split('-');
                int maxno = ToInt(l[1]) + 1;
                return (l[0] + '-' + maxno.ToString()).ToUpper();
            }
            else
            {
                return voucherCode + "-1";
            }
        }

        //this will return tuid
        public int? GetTUID(AccountingDbContext accountingDBContext)
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
        #endregion
        #region Update Item Quantity
        public void UpdateItemQuantity(List<TransactionInventoryItemModel> txnInvItemList, bool? isDebit)
        {
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            txnInvItemList.ForEach(invItm =>
            {
                ItemModel item = (from itm in accountingDBContext.Items
                                  where itm.ItemId == invItm.ItemId
                                  select itm).FirstOrDefault();
                if (item != null)
                {
                    if (isDebit == true)
                        item.AvailableQuantity += invItm.Quantity;
                    else
                        item.AvailableQuantity -= invItm.Quantity;
                    accountingDBContext.Items.Attach(item);
                    accountingDBContext.Entry(item).State = EntityState.Modified;
                    accountingDBContext.Entry(item).Property(x => x.CreatedOn).IsModified = false;
                    accountingDBContext.Entry(item).Property(x => x.CreatedBy).IsModified = false;
                    accountingDBContext.SaveChanges();
                }
            });
        }
        #endregion
        #region Process Transaction
        public TransactionModel ProcessTransactions(TransactionModel transaction)
        {
            RbacUser currentUser = HttpContext.Session.Get<RbacUser>("currentuser");
            transaction.CreatedBy = currentUser.EmployeeId;
            transaction.CreatedOn = DateTime.Now;
            transaction.TransactionItems.ForEach(txnItem =>
            {
                txnItem.CreatedOn = DateTime.Now;
                txnItem.CreatedBy = currentUser.EmployeeId;
            });
            return transaction;
        }
        #endregion
        public string GetNepaliDate(DateTime mydate)
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

    }
}