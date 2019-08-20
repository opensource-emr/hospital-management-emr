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
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DanpheEMR.Controllers
{
    [DanpheDataFilter()]
    [Route("api/[controller]")]
    public class AccountingReportController : CommonController
    {

        //private readonly string connString = null;
        public AccountingReportController(IOptions<MyConfiguration> _config) : base(_config)
        {
            //connString = _config.Value.Connectionstring;

        }

        // GET: api/values
        [HttpGet]
        public string Get(string reqType, int ledgerId, DateTime FromDate, DateTime ToDate, /*int transactionId*/ string transactionIds,int DayVoucherNumber, int voucherId)
        {
            DanpheHTTPResponse<object> responseData = new DanpheHTTPResponse<object>();
            AccountingDbContext accountingDBContext = new AccountingDbContext(connString);
            BillingDbContext billingDbContext = new BillingDbContext(connString);
            PharmacyDbContext pharmacyDbContext = new PharmacyDbContext(connString);
            InventoryDbContext inventoryDbContext = new InventoryDbContext(connString);
            try
            {
                #region Voucher Report
                if (reqType == "voucher-report")
                {
                    var OpeningBalanceData = (from t in accountingDBContext.Transactions
                                              join ti in accountingDBContext.TransactionItems on t.TransactionId equals ti.TransactionId
                                              join fisc in accountingDBContext.FiscalYears on t.FiscalyearId equals fisc.FiscalYearId
                                              where (DbFunctions.TruncateTime(t.TransactionDate) == FromDate) && (t.FiscalyearId == fisc.FiscalYearId)
                                              group new { fisc, ti, t } by new
                                              {
                                                  fisc.FiscalYearId,
                                                  t.TransactionDate,
                                              } into x
                                              select new
                                              {
                                                  Amountdr = x.Where(b => b.ti.DrCr == true && (DbFunctions.TruncateTime(b.t.TransactionDate) >= b.fisc.StartDate && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                  Amountcr = x.Where(b => b.ti.DrCr == false && (DbFunctions.TruncateTime(b.t.TransactionDate) >= b.fisc.StartDate && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                  x.Key.FiscalYearId,
                                              }).ToList();

                    var txnList = (from txn in accountingDBContext.Transactions
                                   join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                                   join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                                   where txn.IsActive == true && (DbFunctions.TruncateTime(txn.TransactionDate) >= FromDate && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate)
                                   select new
                                   {
                                       TransactionId = txn.TransactionId,
                                       FiscalYear = fiscal.FiscalYearName,
                                       VoucherNumber = txn.VoucherNumber,
                                       VoucherType = voucher.VoucherName,
                                       TransactionDate = DbFunctions.TruncateTime(txn.TransactionDate),// txn.TransactionDate.ToString("dd/mm/yyyy"),                                       
                                       Amount = (from txnItm in accountingDBContext.TransactionItems
                                                 where txnItm.TransactionId == txn.TransactionId
                                                 && txnItm.DrCr == true
                                                 group txnItm by new
                                                 {
                                                     txnItm.DrCr
                                                 } into g
                                                 select g.Sum(x => x.Amount)
                                                 ).FirstOrDefault()
                                   }).OrderByDescending(a => a.TransactionId).ToList();
                    //below query as per new requirement if wants old one result then please comment below and take txnList as result
                    var finalData = (from t in txnList
                                     group new { t } by new
                                     {
                                         t.VoucherNumber,
                                         t.FiscalYear,
                                         t.VoucherType,
                                         t.TransactionDate
                                     }
                                    into x
                                     select new
                                     {
                                         FiscalYear = x.Key.FiscalYear,
                                         VoucherNumber = x.Key.VoucherNumber,
                                         VoucherType = x.Key.VoucherType,
                                         TransactionDate = x.Key.TransactionDate,
                                         Amount = x.Sum(y => y.t.Amount)
                                     }).OrderByDescending(a => a.TransactionDate).ToList();

                    responseData.Status = "OK";
                    responseData.Results = finalData;
                }
                #endregion
                #region Ledger Report
                else if (reqType == "ledger-report")
                {
                    var dataList = (from t in accountingDBContext.Transactions
                                    join ti in accountingDBContext.TransactionItems on t.TransactionId equals ti.TransactionId
                                    join fisc in accountingDBContext.FiscalYears on t.FiscalyearId equals fisc.FiscalYearId
                                    join l in accountingDBContext.Ledgers on ti.LedgerId equals l.LedgerId
                                    where (ti.LedgerId == ledgerId) && (DbFunctions.TruncateTime(t.TransactionDate) <= ToDate) && (t.FiscalyearId == fisc.FiscalYearId)
                                    group new { t, ti, fisc, l } by new
                                    {
                                        fisc.FiscalYearId,
                                    }
                                    into x
                                    select new
                                    {
                                        x.Key.FiscalYearId,
                                        AmountDr = x.Where(b => b.ti.DrCr == true && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                        AmountCr = x.Where(b => b.ti.DrCr == false && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                    }).ToList();

                    var LedgerData = (from t in accountingDBContext.Transactions
                                      join ti in accountingDBContext.TransactionItems on t.TransactionId equals ti.TransactionId
                                      join l in accountingDBContext.Ledgers on ti.LedgerId equals l.LedgerId
                                      join v in accountingDBContext.Vouchers on t.VoucherId equals v.VoucherId
                                      join Fisc in accountingDBContext.FiscalYears on t.FiscalyearId equals Fisc.FiscalYearId
                                      where (ti.LedgerId == ledgerId) && (DbFunctions.TruncateTime(t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(t.TransactionDate) <= ToDate)
                                      select new
                                      {
                                          t.TransactionId,
                                          t.TransactionDate,
                                          t.VoucherNumber,
                                          l.LedgerName,
                                          l.OpeningBalance,
                                          OpeningBalanceType = l.DrCr == null ? true : l.DrCr,
                                          t.FiscalyearId,
                                          v.VoucherName,
                                          t.SectionId,
                                          ti.Amount,
                                          ti.DrCr,
                                      }).ToList();

                    var result = (from itm in LedgerData
                                  join data in dataList on itm.FiscalyearId equals data.FiscalYearId

                                  select new
                                  {
                                      itm.TransactionId,
                                      itm.TransactionDate,
                                      itm.VoucherNumber,
                                      itm.LedgerName,
                                      itm.VoucherName,
                                      LedgerDr = 0,
                                      LedgerCr = 0,
                                      itm.Amount,
                                      itm.DrCr,
                                      data.AmountCr,
                                      data.AmountDr,
                                      itm.OpeningBalance,
                                      itm.OpeningBalanceType,
                                      DepartmentName = "TempTest",
                                      TransactionItems = (from txnItm in accountingDBContext.TransactionItems
                                                          join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                          join txn in accountingDBContext.Transactions on txnItm.TransactionId equals itm.TransactionId
                                                          join v in accountingDBContext.Vouchers on txn.VoucherId equals v.VoucherId
                                                          where txnItm.TransactionId == txn.TransactionId && txn.IsActive == true && v.VoucherName == itm.VoucherName
                                                          && (DbFunctions.TruncateTime(txn.TransactionDate) >= FromDate && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate)
                                                          && ledger.LedgerName != itm.LedgerName && txn.TransactionDate == itm.TransactionDate
                                                          select new
                                                          {
                                                              txnItm.TransactionItemId,
                                                              LedgerName = ledger.LedgerName,
                                                              DrCr = txnItm.DrCr,
                                                              LedAmount = txnItm.Amount,
                                                              Details = (from txnitm in accountingDBContext.TransactionItems
                                                                         join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                         join pat in accountingDBContext.PatientModel on txndetail.ReferenceId equals pat.PatientId
                                                                         where txnItm.TransactionItemId == txnitm.TransactionItemId && txn.VoucherNumber == itm.VoucherNumber && txndetail.ReferenceType == "Patient"
                                                                         group new { txnitm, pat, txndetail } by new
                                                                         {
                                                                             txndetail.ReferenceId,
                                                                             txnitm.DrCr
                                                                         } into x1
                                                                         select new
                                                                         {
                                                                             Id = x1.Key.ReferenceId,
                                                                             Name = x1.Select(a => a.pat.FirstName + a.pat.LastName).FirstOrDefault(),
                                                                             DrCr = x1.Key.DrCr,
                                                                             Amount = x1.Select(a => a.txndetail.Amount).Sum(),
                                                                         }).ToList(),
                                                              //SupplierDetails = (from txnitm in accountingDBContext.TransactionItems
                                                              //                   join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                              //                   join sup in accountingDBContext.PHRMSupplier on txndetail.ReferenceId equals sup.SupplierId
                                                              //                   where txnItm.TransactionItemId == txnitm.TransactionItemId && txn.VoucherNumber == itm.VoucherNumber && txndetail.ReferenceType == "Supplier"
                                                              //                   group new { txnitm, sup, txndetail } by new
                                                              //                   {
                                                              //                       txndetail.ReferenceId,
                                                              //                       txnitm.DrCr
                                                              //                   } into x1
                                                              //                   select new
                                                              //                   {
                                                              //                       Id = x1.Key.ReferenceId,
                                                              //                       Name = x1.Select(a => a.sup.SupplierName).FirstOrDefault(),
                                                              //                       DrCr = x1.Key.DrCr,
                                                              //                       Amount = x1.Select(a => a.txndetail.Amount).Sum(),
                                                              //                   }).ToList(),
                                                              //   VendorDetails = (from txnitm in accountingDBContext.TransactionItems
                                                              //                       join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                              //                       join sup in accountingDBContext.InvVendors on txndetail.ReferenceId equals sup.VendorId
                                                              //                       where txnItm.TransactionItemId == txnitm.TransactionItemId && txn.VoucherNumber == itm.VoucherNumber && txndetail.ReferenceType == "Vendor"
                                                              //                    group new { txnitm, sup, txndetail } by new
                                                              //                       {
                                                              //                           txndetail.ReferenceId,
                                                              //                           txnitm.DrCr
                                                              //                       } into x1
                                                              //                       select new
                                                              //                       {
                                                              //                           Id = x1.Key.ReferenceId,
                                                              //                           Name = x1.Select(a => a.sup.VendorName).FirstOrDefault(),
                                                              //                           DrCr = x1.Key.DrCr,
                                                              //                           Amount = x1.Select(a => a.txndetail.Amount).Sum(),
                                                              //                       }).ToList(),
                                                              CapitalsGoods = (from txnitm in accountingDBContext.TransactionItems
                                                                         join txndetail in accountingDBContext.TransactionItemDetails on txnitm.TransactionItemId equals txndetail.TransactionItemId
                                                                         join pat in accountingDBContext.InventoryItems on txndetail.ReferenceId equals pat.ItemId
                                                                         where txnItm.TransactionItemId == txnitm.TransactionItemId && txn.VoucherNumber == itm.VoucherNumber && txndetail.ReferenceType == "Capital Goods Items"
                                                                               group new { txnitm, pat, txndetail } by new
                                                                         {
                                                                             txndetail.ReferenceId,
                                                                             txnitm.DrCr
                                                                         } into x1
                                                                         select new
                                                                         {
                                                                             Id = x1.Key.ReferenceId,
                                                                             Name = x1.Select(a => a.pat.ItemName).FirstOrDefault(),
                                                                             DrCr = x1.Key.DrCr,
                                                                             Amount = x1.Select(a => a.txndetail.Amount).Sum(),
                                                                         }).ToList(),
                                                          }).OrderByDescending(a => a.DrCr == true).ToList(),
                                  }).ToList();
                    result.ForEach(itm =>
                    {
                        itm.TransactionItems.ForEach(txn =>
                        {
                            //foreach (var det in txn.SupplierDetails)
                            //{
                            //    txn.Details.Add(det);
                            //}
                            //foreach (var det in txn.VendorDetails)
                            //{
                            //    txn.Details.Add(det);
                            //}
                            foreach (var det in txn.CapitalsGoods)
                            {
                                txn.Details.Add(det);
                            }
                        });
                    });
                    var FinalData = new
                    {
                        result,
                        dataList
                    };
                    responseData.Status = "OK";
                    responseData.Results = FinalData;
                }
                #endregion
                #region Trial Balance Report
                else if (reqType == "trailBalanceReport")
                {
                    //here fromDate is applied only on Opening Dr/Cr and Current Dr/Cr
                    // var trailBalance = (from led in accountingDBContext.Ledgers
                    //                     join txnItm in accountingDBContext.TransactionItems on led.LedgerId equals txnItm.LedgerId
                    //                     join txn in accountingDBContext.Transactions on txnItm.TransactionId equals txn.TransactionId
                    //                     join ledgrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledgrp.LedgerGroupId
                    //                     join fisc in accountingDBContext.FiscalYears on txn.FiscalyearId equals fisc.FiscalYearId
                    //                     where DbFunctions.TruncateTime(txn.TransactionDate) >= DbFunctions.TruncateTime(fisc.StartDate) && fisc.IsActive == true && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate
                    //                     group new { led, txn, txnItm, ledgrp } by new { ledgrp.COA }
                    //                     into x
                    //                     select new
                    //                     {
                    //                         //Level COA
                    //                         Particulars = x.Key.COA,
                    //                         CreatedOn = x.Select(a => a.txn.TransactionDate),
                    //                         //OpeningDr = x.Where(a => a.txnItm.DrCr == true && DbFunctions.TruncateTime(a.txn.TransactionDate) < FromDate).Sum(a => a.txnItm.Amount),
                    //                         //OpeningCr = x.Where(b => b.txnItm.DrCr == false && DbFunctions.TruncateTime(b.txn.TransactionDate) < FromDate).Sum(b => b.txnItm.Amount),
                    //                         //CurrentDr = x.Where(c => c.txnItm.DrCr == true && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItm.Amount),
                    //                         //CurrentCr = x.Where(c => c.txnItm.DrCr == false && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItm.Amount),
                    //                         LedgerGroupList = (from led in accountingDBContext.Ledgers
                    //                                            join txnItm in accountingDBContext.TransactionItems on led.LedgerId equals txnItm.LedgerId
                    //                                            join txn in accountingDBContext.Transactions on txnItm.TransactionId equals txn.TransactionId
                    //                                            join ledgrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledgrp.LedgerGroupId
                    //                                            join fisc in accountingDBContext.FiscalYears on txn.FiscalyearId equals fisc.FiscalYearId
                    //                                            where ledgrp.COA == x.Key.COA && DbFunctions.TruncateTime(txn.TransactionDate) >= DbFunctions.TruncateTime(fisc.StartDate) && fisc.IsActive == true && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate
                    //                                            group new { led, txn, txnItm, ledgrp } by new
                    //                                            { ledgrp.LedgerGroupName }
                    //                                             into x1
                    //                                            select new
                    //                                            {
                    //                                                //Level LedgerGroup
                    //                                                Particulars = x1.Key.LedgerGroupName,
                    //                                                CreatedOn = x1.Select(a => a.txn.TransactionDate),
                    //                                                //OpeningDr = x1.Where(a => a.txnItm.DrCr == true && DbFunctions.TruncateTime(a.txn.TransactionDate) < FromDate).Sum(a => a.txnItm.Amount),
                    //                                                //OpeningCr = x1.Where(b => b.txnItm.DrCr == false && DbFunctions.TruncateTime(b.txn.TransactionDate) < FromDate).Sum(b => b.txnItm.Amount),
                    //                                                //CurrentDr = x1.Where(c => c.txnItm.DrCr == true && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItm.Amount),
                    //                                                //CurrentCr = x1.Where(c => c.txnItm.DrCr == false && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItm.Amount),
                    //                                                LedgerList = (from led in accountingDBContext.Ledgers
                    //                                                              join txnItems in accountingDBContext.TransactionItems on led.LedgerId equals txnItems.LedgerId
                    //                                                              join txn in accountingDBContext.Transactions on txnItems.TransactionId equals txn.TransactionId
                    //                                                              join ledgrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledgrp.LedgerGroupId
                    //                                                              join fisc in accountingDBContext.FiscalYears on txn.FiscalyearId equals fisc.FiscalYearId
                    //                                                              where ledgrp.COA == x.Key.COA && ledgrp.LedgerGroupName == x1.Key.LedgerGroupName && DbFunctions.TruncateTime(txn.TransactionDate) >= DbFunctions.TruncateTime(fisc.StartDate) && fisc.IsActive == true && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate
                    //                                                              group new { led, txn, txnItems, ledgrp } by new { led.LedgerName }
                    //                                                              into y
                    //                                                              select new
                    //                                                              {
                    //                                                                  //Level Ledger
                    //                                                                  LedgerId = y.Select(a => a.led.LedgerId).FirstOrDefault(),
                    //                                                                  Particulars = y.Key.LedgerName,
                    //                                                                  CreatedOn = y.Select(a => a.txnItems.CreatedOn),
                    //                                                                  OpeningDr = y.Where(a => a.txnItems.DrCr == true && DbFunctions.TruncateTime(a.txn.TransactionDate) < FromDate).Sum(a => a.txnItems.Amount),
                    //                                                                  OpeningBalDr = y.Where(a => a.led.DrCr == true).Select(a => a.led.OpeningBalance).FirstOrDefault(),
                    //                                                                  OpeningCr = y.Where(b => b.txnItems.DrCr == false && DbFunctions.TruncateTime(b.txn.TransactionDate) < FromDate).Sum(b => b.txnItems.Amount),
                    //                                                                  OpeningBalCr = y.Where(a => a.led.DrCr == false).Select(a => a.led.OpeningBalance).FirstOrDefault(),
                    //                                                                  CurrentDr = y.Where(c => c.txnItems.DrCr == true && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItems.Amount),
                    //                                                                  CurrentCr = y.Where(c => c.txnItems.DrCr == false && DbFunctions.TruncateTime(c.txn.TransactionDate) >= FromDate).Sum(b => b.txnItems.Amount),
                    //                                                                  Details = (from itmdetail in accountingDBContext.TransactionItemDetails
                    //                                                                                  join patient in accountingDBContext.PatientModel on itmdetail.PatientId equals patient.PatientId
                    //                                                                                  join txnitm in y.Select(a => a.txnItems) on itmdetail.TransactionItemId equals txnitm.TransactionItemId
                    //                                                                                  group new { patient, itmdetail, txnitm } by new { itmdetail.PatientId} into n
                    //                                                                                   select new
                    //                                                                                  {
                    //                                                                                      Name = n.Select(a => a.patient.FirstName + a.patient.LastName).FirstOrDefault(),
                    //                                                                                      Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.itmdetail.Amount),
                    //                                                                                      Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.itmdetail.Amount),
                    //                                                                                  }).ToList(),
                    //                                                                  SupplierDetail = (from itmdetail in accountingDBContext.TransactionItemDetails
                    //                                                                                   join supplier in accountingDBContext.PHRMSupplier on itmdetail.SupplierId equals supplier.SupplierId
                    //                                                                                   join txnitm in y.Select(a => a.txnItems) on itmdetail.TransactionItemId equals txnitm.TransactionItemId
                    //                                                                                   group new { supplier, itmdetail, txnitm } by new { itmdetail.SupplierId} into n
                    //                                                                                   select new
                    //                                                                                   {
                    //                                                                                       Name = n.Select(a => a.supplier.SupplierName).FirstOrDefault(),
                    //                                                                                       Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.itmdetail.Amount),
                    //                                                                                       Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.itmdetail.Amount),
                    //                                                                                   }).ToList()
                    //                                                              }).ToList()
                    //                                            }).ToList()
                    //                     }).ToList();
                    //// DataTable trailBalance = accountingDBContext.trailBalanceReport(FromDate, ToDate);
                    // trailBalance.ForEach(itm =>
                    // {
                    //     itm.LedgerGroupList.ForEach(txn =>
                    //     {
                    //         txn.LedgerList.ForEach(ledgr =>
                    //         {
                    //             foreach (var det in ledgr.SupplierDetail)
                    //             {
                    //                 ledgr.Details.Add(det);
                    //             }
                    //         });
                    //     });
                    // });
                    var TransactionWithItems = (from txnItm in accountingDBContext.TransactionItems
                                                join txn in accountingDBContext.Transactions on txnItm.TransactionId equals txn.TransactionId
                                                join fisc in accountingDBContext.FiscalYears on txn.FiscalyearId equals fisc.FiscalYearId
                                                where DbFunctions.TruncateTime(txn.TransactionDate) >= DbFunctions.TruncateTime(fisc.StartDate)
                                                      && fisc.IsActive == true && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate
                                                select new
                                                {
                                                    TransactionDate = DbFunctions.TruncateTime(txn.TransactionDate),
                                                    LedgerId = txnItm.LedgerId,
                                                    CreatedOn = DbFunctions.TruncateTime(txnItm.CreatedOn),
                                                    DrCr = txnItm.DrCr,
                                                    Amount = txnItm.Amount,
                                                    TransactionItemId = txnItm.TransactionItemId
                                                }).ToList();
                    var LedgerDetails = (from led in accountingDBContext.Ledgers
                                         join ledgrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledgrp.LedgerGroupId
                                         select new
                                         {
                                             LedgerId = led.LedgerId,
                                             COA = ledgrp.COA,
                                             LedgerGroupName = ledgrp.LedgerGroupName,
                                             LedgerName = led.LedgerName,
                                             DrCr = led.DrCr,
                                             OpeningBalance = led.OpeningBalance
                                         }).ToList();
                    var PatientDetail = (from itemdetail in accountingDBContext.TransactionItemDetails
                                         join patient in accountingDBContext.PatientModel on itemdetail.ReferenceId equals patient.PatientId
                                         where itemdetail.ReferenceType == "Patient"
                                         select new
                                         {
                                             PatientId = patient.PatientId,
                                             PatientName = patient.FirstName + patient.LastName,
                                             Amount = itemdetail.Amount,
                                             TransactionItemId = itemdetail.TransactionItemId
                                         }).ToList();
                    //var SupplierDetail = (from itmdetails in accountingDBContext.TransactionItemDetails
                    //                      join supplier in accountingDBContext.PHRMSupplier on itmdetails.ReferenceId equals supplier.SupplierId
                    //                      where itmdetails.ReferenceType == "Supplier"
                    //                      select new
                    //                      {
                    //                          SupplierId = supplier.SupplierId,
                    //                          SupplierName = supplier.SupplierName,
                    //                          Amount = itmdetails.Amount,
                    //                          TransactionItemId = itmdetails.TransactionItemId
                    //                      }).ToList();
                    //var VendorDetail = (from itemdetail in accountingDBContext.TransactionItemDetails
                    //                     join patient in accountingDBContext.InvVendors on itemdetail.ReferenceId equals patient.VendorId
                    //                     where itemdetail.ReferenceType == "Vendor"
                    //                    select new
                    //                     {
                    //                        VendorId = patient.VendorId,
                    //                        VendorName = patient.VendorName,
                    //                         Amount = itemdetail.Amount,
                    //                         TransactionItemId = itemdetail.TransactionItemId
                    //                     }).ToList();
                    var InventoryItemDetail = (from itmdetails in accountingDBContext.TransactionItemDetails
                                          join supplier in accountingDBContext.InventoryItems on itmdetails.ReferenceId equals supplier.ItemId
                                          where itmdetails.ReferenceType == "Capital Goods Items"
                                               select new
                                          {
                                                   ItemId = supplier.ItemId,
                                                   ItemName = supplier.ItemName,
                                              Amount = itmdetails.Amount,
                                              TransactionItemId = itmdetails.TransactionItemId
                                          }).ToList();
                    var trialBalance = (from led in LedgerDetails
                                        join txnwithitms in TransactionWithItems on led.LedgerId equals txnwithitms.LedgerId
                                        group new { led, txnwithitms } by new { led.COA }
                                        into x
                                        select new
                                        {
                                            //Level COA
                                            Particulars = x.Key.COA,
                                            CreatedOn = x.Select(a => a.txnwithitms.TransactionDate),
                                            LedgerGroupList = (from led in LedgerDetails
                                                               join txnwithitms in TransactionWithItems on led.LedgerId equals txnwithitms.LedgerId
                                                               where led.COA == x.Key.COA
                                                               group new { led, txnwithitms } by new
                                                               { led.LedgerGroupName }
                                                                into x1
                                                               select new
                                                               {
                                                                   //Level LedgerGroup
                                                                   Particulars = x1.Key.LedgerGroupName,
                                                                   CreatedOn = x1.Select(a => a.txnwithitms.TransactionDate),
                                                                   LedgerList = (from led in LedgerDetails
                                                                                 join txnwithitms in TransactionWithItems on led.LedgerId equals txnwithitms.LedgerId
                                                                                 where led.COA == x.Key.COA && led.LedgerGroupName == x1.Key.LedgerGroupName
                                                                                 group new { led, txnwithitms } by new { led.LedgerName }
                                                                                 into y
                                                                                 select new
                                                                                 {
                                                                                     //Level Ledger
                                                                                     LedgerId = y.Select(a => a.led.LedgerId).FirstOrDefault(),
                                                                                     Particulars = y.Key.LedgerName,
                                                                                     CreatedOn = y.Select(a => a.txnwithitms.CreatedOn),
                                                                                     OpeningDr = y.Where(a => a.txnwithitms.DrCr == true && a.txnwithitms.TransactionDate < FromDate).Sum(a => a.txnwithitms.Amount),
                                                                                     OpeningBalDr = y.Where(a => a.led.DrCr == true).Select(a => a.led.OpeningBalance).FirstOrDefault(),
                                                                                     OpeningCr = y.Where(b => b.txnwithitms.DrCr == false && b.txnwithitms.TransactionDate < FromDate).Sum(b => b.txnwithitms.Amount),
                                                                                     OpeningBalCr = y.Where(a => a.led.DrCr == false).Select(a => a.led.OpeningBalance).FirstOrDefault(),
                                                                                     CurrentDr = y.Where(c => c.txnwithitms.DrCr == true && c.txnwithitms.TransactionDate >= FromDate).Sum(b => b.txnwithitms.Amount),
                                                                                     CurrentCr = y.Where(c => c.txnwithitms.DrCr == false && c.txnwithitms.TransactionDate >= FromDate).Sum(b => b.txnwithitms.Amount),
                                                                                     Details = (from patient in PatientDetail
                                                                                                join txnitm in y.Select(a => a.txnwithitms) on patient.TransactionItemId equals txnitm.TransactionItemId
                                                                                                group new { patient, txnitm } by new { patient.PatientId } into n
                                                                                                select new
                                                                                                {
                                                                                                    Name = n.Select(a => a.patient.PatientName).FirstOrDefault(),
                                                                                                    Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.patient.Amount),
                                                                                                    Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.patient.Amount),
                                                                                                }).ToList(),
                                                                                    // SupplierDetail = (from supplier in SupplierDetail
                                                                                    //                   join txnitm in y.Select(a => a.txnwithitms) on supplier.TransactionItemId equals txnitm.TransactionItemId
                                                                                    //                   group new { supplier, txnitm } by new { supplier.SupplierId } into n
                                                                                    //                   select new
                                                                                    //                   {
                                                                                    //                       Name = n.Select(a => a.supplier.SupplierName).FirstOrDefault(),
                                                                                    //                       Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.supplier.Amount),
                                                                                    //                       Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.supplier.Amount),
                                                                                    //                   }).ToList(),
                                                                                    //VendorDetail = (from supplier in VendorDetail
                                                                                    //                join txnitm in y.Select(a => a.txnwithitms) on supplier.TransactionItemId equals txnitm.TransactionItemId
                                                                                    //                   group new { supplier, txnitm } by new { supplier.VendorId } into n
                                                                                    //                   select new
                                                                                    //                   {
                                                                                    //                       Name = n.Select(a => a.supplier.VendorName).FirstOrDefault(),
                                                                                    //                       Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.supplier.Amount),
                                                                                    //                       Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.supplier.Amount),
                                                                                    //                   }).ToList(),
                                                                                     InventoryItems = (from supplier in InventoryItemDetail
                                                                                                     join txnitm in y.Select(a => a.txnwithitms) on supplier.TransactionItemId equals txnitm.TransactionItemId
                                                                                                     group new { supplier, txnitm } by new { supplier.ItemId } into n
                                                                                                     select new
                                                                                                     {
                                                                                                         Name = n.Select(a => a.supplier.ItemName).FirstOrDefault(),
                                                                                                         Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.supplier.Amount),
                                                                                                         Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.supplier.Amount),
                                                                                                     }).ToList()

                                                                                 }).ToList()
                                                               }).ToList()
                                        }).ToList();
                    trialBalance.ForEach(itm =>
                    {
                        itm.LedgerGroupList.ForEach(txn =>
                        {
                            txn.LedgerList.ForEach(ledgr =>
                            {
                                //foreach (var det in ledgr.SupplierDetail)
                                //{
                                //    ledgr.Details.Add(det);
                                //}
                                //foreach (var det in ledgr.VendorDetail)
                                //{
                                //    ledgr.Details.Add(det);
                                //}
                                foreach (var det in ledgr.InventoryItems)
                                {
                                    ledgr.Details.Add(det);
                                }
                            });
                        });
                    });
                    responseData.Status = "OK";
                    responseData.Results = trialBalance;
                }
                #endregion
                #region Profit and Loss Report
                else if (reqType == "profitLossReport")
                {
                    var result = (from l in accountingDBContext.Ledgers
                                  join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                                  where lg.PrimaryGroup == "Expenses" || lg.PrimaryGroup == "Revenue"
                                  group l by new { lg.PrimaryGroup } into x
                                  select new
                                  {
                                      x.Key.PrimaryGroup,
                                      COAList = (from l in accountingDBContext.Ledgers
                                                 join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                                                 where lg.PrimaryGroup == x.Key.PrimaryGroup && lg.COA != "Inventory"
                                                 group lg by new
                                                 {
                                                     lg.PrimaryGroup,
                                                     lg.COA
                                                 } into x2
                                                 select new
                                                 {
                                                     x2.Key.COA,
                                                     LedgerGroupList = (from l in accountingDBContext.Ledgers
                                                                        join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                                                                        where lg.COA == x2.Key.COA && lg.PrimaryGroup == x.Key.PrimaryGroup
                                                                        group lg by new
                                                                        {
                                                                            lg.PrimaryGroup,
                                                                            lg.COA,
                                                                            lg.LedgerGroupName,
                                                                        } into x3
                                                                        select new
                                                                        {
                                                                            x3.Key.LedgerGroupName,
                                                                            LedgerList = (from l in accountingDBContext.Ledgers
                                                                                          join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                                                                                          join ti in accountingDBContext.TransactionItems on l.LedgerId equals ti.LedgerId
                                                                                          join t in accountingDBContext.Transactions on ti.TransactionId equals t.TransactionId
                                                                                          where lg.COA == x2.Key.COA && lg.PrimaryGroup == x.Key.PrimaryGroup && lg.LedgerGroupName == x3.Key.LedgerGroupName && (DbFunctions.TruncateTime(t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(t.TransactionDate) <= ToDate)
                                                                                          group new { l, ti, t, lg } by new
                                                                                          {
                                                                                              lg.PrimaryGroup,
                                                                                              lg.COA,
                                                                                              lg.LedgerGroupName,
                                                                                              l.LedgerName
                                                                                          } into x4
                                                                                          select new
                                                                                          {
                                                                                              LedgerId = x4.Select(a => a.l.LedgerId).FirstOrDefault(),
                                                                                              x4.Key.LedgerName,
                                                                                              DrAmount = x4.Where(a => a.ti.DrCr == true).Sum(b => b.ti.Amount),// x3.Where(b => b.ti.DrCr == true).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum() - x3.Where(b => b.ti.DrCr == false).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                              CrAmount = x4.Where(a => a.ti.DrCr == false).Sum(b => b.ti.Amount),
                                                                                          }).ToList()
                                                                        }).ToList()
                                                 }).ToList()
                                  }).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                #endregion
                #region Balance sheet report
                else if (reqType == "balanceSheetReportData")
                {
                    var Ledgers = (from led in accountingDBContext.Ledgers
                                   join ledgrp in accountingDBContext.LedgerGroups on led.LedgerGroupId equals ledgrp.LedgerGroupId
                                   select new
                                   {
                                       led.LedgerId,
                                       led.LedgerName,
                                       led.OpeningBalance,
                                       led.DrCr,
                                       ledgrp.PrimaryGroup,
                                       ledgrp.COA,
                                       ledgrp.LedgerGroupName
                                   }).ToList();
                    var TransactionWithItems = (from ti in accountingDBContext.TransactionItems
                                                join t in accountingDBContext.Transactions on ti.TransactionId equals t.TransactionId
                                                where (DbFunctions.TruncateTime(t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(t.TransactionDate) <= ToDate)
                                                select new
                                                {
                                                    ti.TransactionItemId,
                                                    ti.LedgerId,
                                                    ti.DrCr,
                                                    ti.Amount
                                                }).ToList();
                    var PatientDetails = (from itmdetail in accountingDBContext.TransactionItemDetails
                                          join patient in accountingDBContext.PatientModel on itmdetail.ReferenceId equals patient.PatientId
                                          where itmdetail.ReferenceType == "Patient"
                                          select new
                                          {
                                              itmdetail.TransactionItemId,
                                              itmdetail.Amount,
                                              patient.PatientId,
                                              PatientName = patient.FirstName + patient.LastName
                                          }).ToList();
                    var InventoryItemDetail = (from itmdetails in accountingDBContext.TransactionItemDetails
                                               join supplier in accountingDBContext.InventoryItems on itmdetails.ReferenceId equals supplier.ItemId
                                               where itmdetails.ReferenceType == "Capital Goods Items"
                                               select new
                                               {
                                                   ItemId = supplier.ItemId,
                                                   ItemName = supplier.ItemName,
                                                   Amount = itmdetails.Amount,
                                                   TransactionItemId = itmdetails.TransactionItemId
                                               }).ToList();
                    //var SupplierDetails = (from itmdetail in accountingDBContext.TransactionItemDetails
                    //                       join supply in accountingDBContext.PHRMSupplier on itmdetail.ReferenceId equals supply.SupplierId
                    //                       where itmdetail.ReferenceType == "Supplier"
                    //                       select new
                    //                       {
                    //                           itmdetail.TransactionItemId,
                    //                           supply.SupplierId,
                    //                           supply.SupplierName,
                    //                           itmdetail.Amount
                    //                       }).ToList();
                    var result = (from l in Ledgers
                                  group l by new { l.PrimaryGroup } into x
                                  select new
                                  {
                                      x.Key.PrimaryGroup,
                                      COAList = (from l in Ledgers
                                                 where l.PrimaryGroup == x.Key.PrimaryGroup
                                                 group l by new
                                                 {
                                                     l.PrimaryGroup,
                                                     l.COA
                                                 } into x2
                                                 select new
                                                 {
                                                     x2.Key.COA,
                                                     LedgerGroupList = (from l in Ledgers
                                                                        where l.COA == x2.Key.COA && l.PrimaryGroup == x.Key.PrimaryGroup
                                                                        group l by new
                                                                        {
                                                                            l.PrimaryGroup,
                                                                            l.COA,
                                                                            l.LedgerGroupName,
                                                                        } into x3
                                                                        select new
                                                                        {
                                                                            x3.Key.LedgerGroupName,
                                                                            LedgerList = (from l in Ledgers
                                                                                          join ti in TransactionWithItems on l.LedgerId equals ti.LedgerId
                                                                                          where l.COA == x2.Key.COA && l.PrimaryGroup == x.Key.PrimaryGroup && x3.Key.LedgerGroupName == l.LedgerGroupName
                                                                                          group new { l, ti } by new
                                                                                          {
                                                                                              l.PrimaryGroup,
                                                                                              l.COA,
                                                                                              l.LedgerGroupName,
                                                                                              l.LedgerName
                                                                                          } into x4
                                                                                          select new
                                                                                          {
                                                                                              LedgerId = x4.Select(a => a.l.LedgerId).FirstOrDefault(),
                                                                                              x4.Key.PrimaryGroup,
                                                                                              x4.Key.LedgerName,
                                                                                              OpeningBalanceDr = x4.Where(a => a.l.DrCr == true).Select(a => a.l.OpeningBalance).FirstOrDefault(),
                                                                                              OpeningBalanceCr = x4.Where(a => a.l.DrCr == false).Select(a => a.l.OpeningBalance).FirstOrDefault(),
                                                                                              // Amount = x3.Where(b => b.ti.DrCr == true).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum() - x3.Where(b => b.ti.DrCr == false).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                              DRAmount = x4.Where(a => a.ti.DrCr == true).Select(a => a.ti.Amount).Sum(),
                                                                                              CRAmount = x4.Where(a => a.ti.DrCr == false).Select(a => a.ti.Amount).Sum(),
                                                                                              // Amount = x4.Select(a => a.ti.Amount).Sum(),
                                                                                              Details = (from patient in PatientDetails
                                                                                                         join txnitm in x4.Select(a => a.ti) on patient.TransactionItemId equals txnitm.TransactionItemId
                                                                                                         group new { patient, txnitm } by new { patient.PatientId } into n
                                                                                                         select new
                                                                                                         {
                                                                                                             Id = n.Key.PatientId,
                                                                                                             Name = n.Select(a => a.patient.PatientName).FirstOrDefault(),
                                                                                                             Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.patient.Amount),
                                                                                                             Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.patient.Amount),
                                                                                                         }).ToList(),
                                                                                              //SupplierDetail = (from supplier in SupplierDetails
                                                                                              //                  join txnitm in x4.Select(a => a.ti) on supplier.TransactionItemId equals txnitm.TransactionItemId
                                                                                              //                  group new { supplier, txnitm } by new { supplier.SupplierId } into n
                                                                                              //                  select new
                                                                                              //                  {
                                                                                              //                      Id = n.Key.SupplierId,
                                                                                              //                      Name = n.Select(a => a.supplier.SupplierName).FirstOrDefault(),
                                                                                              //                      Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.supplier.Amount),
                                                                                              //                      Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.supplier.Amount),
                                                                                              //                  }).ToList(),
                                                                                              InventoryItems = (from inv in InventoryItemDetail
                                                                                                                join txnitm in x4.Select(a => a.ti) on inv.TransactionItemId equals txnitm.TransactionItemId
                                                                                                                group new { inv, txnitm } by new { inv.ItemId } into n
                                                                                                                select new
                                                                                                                {
                                                                                                                    Id = n.Key.ItemId,
                                                                                                                    Name = n.Select(a => a.inv.ItemName).FirstOrDefault(),
                                                                                                                    Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.inv.Amount),
                                                                                                                    Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.inv.Amount),
                                                                                                                }).ToList()
                                                                                          }).ToList()
                                                                        }).ToList()
                                                 }).ToList()
                                  }).ToList();
                    result.ForEach(itm =>
                    {
                        itm.COAList.ForEach(txn =>
                        {
                            txn.LedgerGroupList.ForEach(ledgr =>
                            {
                                ledgr.LedgerList.ForEach(data =>
                                {
                                    //foreach (var det in data.SupplierDetail)
                                    //{
                                    //    data.Details.Add(det);
                                    //}
                                    foreach (var det in data.InventoryItems)
                                    {
                                        data.Details.Add(det);
                                    }
                                });
                            });
                        });
                    });
                    responseData.Status = "OK";
                    responseData.Results = result;
                    //var result = (from l in accountingDBContext.Ledgers
                    //              join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                    //              group lg by new { lg.PrimaryGroup } into x
                    //              select new
                    //              {
                    //                  x.Key.PrimaryGroup,
                    //                  COAList = (from l in accountingDBContext.Ledgers
                    //                             join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                    //                             where lg.PrimaryGroup == x.Key.PrimaryGroup
                    //                             group lg by new
                    //                             {
                    //                                 lg.PrimaryGroup,
                    //                                 lg.COA
                    //                             } into x2
                    //                             select new
                    //                             {
                    //                                 x2.Key.COA,
                    //                                 LedgerGroupList = (from l in accountingDBContext.Ledgers
                    //                                                    join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                    //                                                    where lg.COA == x2.Key.COA && lg.PrimaryGroup == x.Key.PrimaryGroup
                    //                                                    group lg by new
                    //                                                    {
                    //                                                        lg.PrimaryGroup,
                    //                                                        lg.COA,
                    //                                                        lg.LedgerGroupName,
                    //                                                    } into x3
                    //                                                    select new
                    //                                                    {
                    //                                                        x3.Key.LedgerGroupName,
                    //                                                        LedgerList = (from l in accountingDBContext.Ledgers
                    //                                                                      join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                    //                                                                      join ti in accountingDBContext.TransactionItems on l.LedgerId equals ti.LedgerId
                    //                                                                      join t in accountingDBContext.Transactions on ti.TransactionId equals t.TransactionId
                    //                                                                      where lg.COA == x2.Key.COA && lg.PrimaryGroup == x.Key.PrimaryGroup && x3.Key.LedgerGroupName == lg.LedgerGroupName && (DbFunctions.TruncateTime(t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(t.TransactionDate) <= ToDate)
                    //                                                                      group new { l, ti, t, lg } by new
                    //                                                                      {
                    //                                                                          lg.PrimaryGroup,
                    //                                                                          lg.COA,
                    //                                                                          lg.LedgerGroupName,
                    //                                                                          l.LedgerName
                    //                                                                      } into x4
                    //                                                                      select new
                    //                                                                      {
                    //                                                                          LedgerId = x4.Select(a => a.l.LedgerId).FirstOrDefault(),
                    //                                                                          x4.Key.PrimaryGroup,
                    //                                                                          x4.Key.LedgerName,
                    //                                                                          OpeningBalanceDr = x4.Where(a => a.l.DrCr == true).Select(a => a.l.OpeningBalance).FirstOrDefault(),
                    //                                                                          OpeningBalanceCr = x4.Where(a => a.l.DrCr == false).Select(a => a.l.OpeningBalance).FirstOrDefault(),
                    //                                                                          // Amount = x3.Where(b => b.ti.DrCr == true).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum() - x3.Where(b => b.ti.DrCr == false).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                    //                                                                          DRAmount = x4.Where(a => a.ti.DrCr == true).Select(a => a.ti.Amount).Sum(),
                    //                                                                          CRAmount = x4.Where(a => a.ti.DrCr == false).Select(a => a.ti.Amount).Sum(),
                    //                                                                          // Amount = x4.Select(a => a.ti.Amount).Sum(),
                    //                                                                          Details = (from itmdetail in accountingDBContext.TransactionItemDetails
                    //                                                                                           join patient in accountingDBContext.PatientModel on itmdetail.PatientId equals patient.PatientId
                    //                                                                                           join txnitm in x4.Select(a => a.ti) on itmdetail.TransactionItemId equals txnitm.TransactionItemId
                    //                                                                                           group new { patient, itmdetail, txnitm } by new { itmdetail.PatientId} into n
                    //                                                                                           select new
                    //                                                                                           {
                    //                                                                                              Id =n.Key.PatientId,
                    //                                                                                              Name = n.Select(a => a.patient.FirstName + a.patient.LastName).FirstOrDefault(),
                    //                                                                                               Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.itmdetail.Amount),
                    //                                                                                               Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.itmdetail.Amount),
                    //                                                                                           }).ToList(),
                    //                                                                          SupplierDetail = (from itmdetail in accountingDBContext.TransactionItemDetails
                    //                                                                                           join supply in accountingDBContext.PHRMSupplier on itmdetail.SupplierId equals supply.SupplierId
                    //                                                                                           join txnitm in x4.Select(a => a.ti) on itmdetail.TransactionItemId equals txnitm.TransactionItemId
                    //                                                                                           group new { supply, itmdetail, txnitm } by new { itmdetail.SupplierId } into n
                    //                                                                                           select new
                    //                                                                                           {
                    //                                                                                               Id = n.Key.SupplierId,
                    //                                                                                               Name = n.Select(a => a.supply.SupplierName).FirstOrDefault(),
                    //                                                                                               Dr = n.Where(a => a.txnitm.DrCr == true).Sum(a => a.itmdetail.Amount),
                    //                                                                                               Cr = n.Where(a => a.txnitm.DrCr == false).Sum(a => a.itmdetail.Amount),
                    //                                                                                           }).ToList(),
                    //                                                                      }).ToList()
                    //                                                    }).ToList()
                    //                             }).ToList()
                    //              }).ToList();
                    //result.ForEach(itm =>
                    //{
                    //    itm.COAList.ForEach(txn =>
                    //    {
                    //        txn.LedgerGroupList.ForEach(ledgr =>
                    //        {
                    //        ledgr.LedgerList.ForEach(data => {
                    //            foreach (var det in data.SupplierDetail)
                    //            {
                    //                data.Details.Add(det);
                    //            }
                    //        });
                    //        });
                    //    });
                    //});
                    //responseData.Status = "OK";
                    //responseData.Results = result;
                    ////  var outputString = DanpheJSONConvert.SerializeObject(responseData, true);
                }
                #endregion
                #region Daily Transaction Report
                else if (reqType == "daily-txn-report")
                {
                    var result = (from txn in accountingDBContext.Transactions
                                  where (DbFunctions.TruncateTime(txn.TransactionDate) >= FromDate && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate)
                                  group new { txn } by new { txn.TransactionDate, txn.VoucherNumber, txn.SectionId } into x
                                  select new
                                  {
                                      TransactionId = x.Select(a => a.txn.TransactionId),
                                       x.Key.VoucherNumber,
                                      x.Key.TransactionDate,
                                      TransactionType = x.Select(a => a.txn.TransactionType),
                                      SectionId = x.Key.SectionId,
                                      txnItems = (from itm in accountingDBContext.TransactionItems
                                                  join l in accountingDBContext.Ledgers on itm.LedgerId equals l.LedgerId
                                                  join newtxn in x on itm.TransactionId equals newtxn.txn.TransactionId
                                                  group new { itm, l } by new { l.LedgerId } into y
                                                  select new
                                                  {
                                                      LedgerName = y.Select(a => a.l.LedgerName).FirstOrDefault(),
                                                      DrAmount = y.Where(a => a.itm.DrCr == true).Sum(a => a.itm.Amount),
                                                      CrAmount = y.Where(a => a.itm.DrCr == false).Sum(a => a.itm.Amount)
                                                  }).ToList()
                                  }).OrderBy(a=> a.TransactionDate).ToList();

                    //var result = (from txn in accountingDBContext.Transactions
                    //              where (DbFunctions.TruncateTime(txn.TransactionDate) >= FromDate && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate)

                    //              select new
                    //              {
                    //                  txn.TransactionId,
                    //                  txn.VoucherNumber,
                    //                  txn.TransactionDate,
                    //                  txn.TransactionType,
                    //                  txn.SectionId,
                    //                  txnItems = (from itm in accountingDBContext.TransactionItems
                    //                              join l in accountingDBContext.Ledgers on itm.LedgerId equals l.LedgerId
                    //                              where itm.TransactionId == txn.TransactionId
                    //                              select new
                    //                              {
                    //                                  l.LedgerName,
                    //                                  itm.DrCr,
                    //                                  itm.Amount
                    //                              }).ToList()
                    //              }).OrderBy(a => a.TransactionDate).ToList();

                    responseData.Status = "OK";
                    responseData.Results = result;
                }
                else if (reqType == "txn-Origin-details")
                {
                    List<int> referanceIdList = new List<int>();
                    List<int> transactionIdList = transactionIds.Split(',').Select(int.Parse).ToList();


                    (from txnId in transactionIdList
                     join txnLinks in accountingDBContext.TransactionLinks on txnId equals txnLinks.TransactionId
                     select new
                     {
                         idList = txnLinks.ReferenceId.Split(',').Select(int.Parse).ToList(),
                         txnid = txnLinks.TransactionId
                     }).ToList().ForEach(a =>
                     {
                         a.idList.ForEach(newid => referanceIdList.Add((int)newid));
                     });

                    var txnModel = (from txn in accountingDBContext.Transactions
                                    join Ids in transactionIdList on txn.TransactionId equals Ids
                                    join txnlink in accountingDBContext.TransactionLinks on txn.TransactionId equals txnlink.TransactionId
                                    select new
                                    {
                                        TransactionId = txn.TransactionId,
                                        TransactionType = txn.TransactionType,
                                        SectionId = txn.SectionId,
                                        Remarks = txn.Remarks,
                                        referIds = txnlink.ReferenceId.ToString()
                                    }).ToList();

                    if (txnModel.Count > 0)
                    {
                        /* * Start Inventory Section */
                        if (txnModel.Where(a => a.SectionId == 1).ToList().Count > 0)
                        {
                            if (txnModel.Where(a => a.TransactionType.Contains("GoodReceipt")).ToList().Count > 0)
                            {
                                var goodsReceipt = (from gr in inventoryDbContext.GoodsReceipts.AsEnumerable()
                                                    join id in referanceIdList on gr.GoodsReceiptID equals id
                                                    join vendor in inventoryDbContext.Vendors on gr.VendorId equals vendor.VendorId
                                                    join gritm in inventoryDbContext.GoodsReceiptItems.AsEnumerable() on gr.GoodsReceiptID equals gritm.GoodsReceiptId
                                                    join itm in inventoryDbContext.Items on gritm.ItemId equals itm.ItemId
                                                    select new
                                                    {
                                                        itm = new
                                                        {
                                                            gr.PaymentMode,
                                                            gritm.TotalAmount,
                                                            VAT = gr.VATTotal,
                                                            gritm.SubTotal,
                                                            gritm.DiscountAmount,
                                                            gr.BillNo
                                                        },
                                                        vendor.VendorName,
                                                        TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault(),
                                                        ItemName= itm.ItemName,
                                                    }).ToList();
                                responseData.Results = goodsReceipt;
                            }
                            else if (txnModel.Where(a => a.TransactionType.Contains("WriteOff")).ToList().Count > 0)
                            {
                                var writeOff = (from wr in inventoryDbContext.WriteOffItems.AsEnumerable()
                                                join id in referanceIdList on wr.WriteOffId equals id
                                                join itm in inventoryDbContext.Items on wr.ItemId equals itm.ItemId
                                                select new
                                                {
                                                    itm = new
                                                    {
                                                        BatchNo = wr.BatchNO,
                                                        wr.TotalAmount
                                                    },
                                                    itm.ItemName,
                                                    TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                }).ToList();
                                responseData.Results = writeOff;
                            }
                            else if (txnModel.Where(a => a.TransactionType.Contains("ReturnToVendor")).ToList().Count > 0)
                            {
                                var returnTOVendor = (from rv in inventoryDbContext.ReturnToVendorItems.AsEnumerable()
                                                      join id in referanceIdList on rv.ReturnToVendorItemId equals id
                                                      join itm in inventoryDbContext.Items on rv.ItemId equals itm.ItemId
                                                      join vendor in inventoryDbContext.Vendors on rv.VendorId equals vendor.VendorId
                                                      select new
                                                      {
                                                          itm = new
                                                          {
                                                              rv.BatchNo,
                                                              rv.TotalAmount,
                                                              rv.VAT
                                                          },
                                                          itm.ItemName,
                                                          vendor.VendorName,
                                                          TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                      }).ToList();
                                responseData.Results = returnTOVendor;
                            }
                            else if (txnModel.Where(a => a.TransactionType.Contains("DispatchToDept")).ToList().Count > 0)
                            {
                                var DispatchToDept = (from wr in inventoryDbContext.StockTransactions.AsEnumerable()
                                                      join id in referanceIdList on wr.StockTxnId equals id
                                                      join st in inventoryDbContext.Stock on wr.StockId equals st.StockId
                                                      join itm in inventoryDbContext.Items on st.ItemId equals itm.ItemId
                                                      join gr in inventoryDbContext.GoodsReceiptItems on st.GoodsReceiptItemId equals gr.GoodsReceiptItemId
                                                      select new
                                                      {
                                                          itm = new
                                                          {
                                                              BatchNo = st.BatchNO,
                                                              TotalAmount = Math.Truncate((decimal)wr.Quantity) * gr.ItemRate,
                                                              gr.VAT,
                                                              gr.DiscountAmount,
                                                          },
                                                          itm.ItemName,
                                                          TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                      }).ToList();
                                responseData.Results = DispatchToDept;
                            }
                            responseData.Status = "OK";
                        }
                        /* * End Inventory Section */

                        /* * Start Billing Section */
                        if (txnModel.Where(a => a.SectionId == 2).ToList().Count > 0)
                        { 
                            //if (txnModel.Where(a => a.TransactionType.Contains("Deposit")).ToList().Count > 0)
                            //{
                            //    var DepositData = (from itm in billingDbContext.SyncBillingAccounting.AsEnumerable()
                            //                       join id in referanceIdList on itm.ReferenceId equals id
                            //                       join pat in billingDbContext.Patient on itm.PatientId equals pat.PatientId
                            //                       group new { itm, id, pat } by new { pat.PatientId , itm.TransactionType} into x
                            //                       select new
                            //                       {
                            //                           //itm = new
                            //                           //{
                            //                           //    TransactionType = x.Select(a => a.itm.TransactionType).FirstOrDefault(),
                            //                           //    PaymentMode = x.Select(a => a.itm.PaymentMode).FirstOrDefault(),
                            //                           //    TotalAmount = x.Sum(a => a.itm.TotalAmount),
                            //                           //    Tax = x.Sum(a => a.itm.TaxAmount),
                            //                           //    SubTotal = x.Sum(a => a.itm.SubTotal),
                            //                           //    DiscountAmount = x.Sum(a => a.itm.DiscountAmount)
                            //                           //},
                            //                           PatientName = x.Select(a => a.pat.FirstName + " " + a.pat.LastName).FirstOrDefault(),
                            //                           //TransactionType = txnModel.Where(a => a.referIds.Contains(x.Select(b => b.id).ToString())).Select(a => a.TransactionType).FirstOrDefault(),
                            //                           TransactionType = x.Key.TransactionType,
                            //                           PaymentMode = x.Select(a => a.itm.PaymentMode).FirstOrDefault(),
                            //                           TotalAmount = x.Sum(a => a.itm.TotalAmount),
                            //                       }).ToList();
                            //    responseData.Results = DepositData;
                            //}
                            //else
                            //{
                            //    var BillData = (from itm in billingDbContext.BillingTransactionItems.AsEnumerable()
                            //                    join bil in billingDbContext.BillingTransactions on itm.BillingTransactionId equals bil.BillingTransactionId
                            //                    join id in referanceIdList on itm.BillingTransactionItemId equals id
                            //                    join pat in billingDbContext.Patient on itm.PatientId equals pat.PatientId
                            //                    select new
                            //                    {
                            //                        itm,
                            //                        InvoiceNo = bil.InvoiceCode + bil.InvoiceNo,
                            //                        PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                            //                        TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                            //                    }).ToList();
                            //   responseData.Results = BillData;
                            //}

                            List<int> depositReferanceIdList = new List<int>();
                            List<int> BillReferanceIdList = new List<int>();
                            var deposits = txnModel.Where(c => c.TransactionType.Contains("Deposit"));
                            deposits.ToList().ForEach(d => { d.referIds.Split(',').Select(int.Parse).ToList().ForEach(a =>
                            {
                                depositReferanceIdList.Add(a);
                            });
                            });


                            var bills = txnModel.Where(c => !c.TransactionType.Contains("Deposit")).ToList();
                            bills.ToList().ForEach(d => {
                                d.referIds.Split(',').Select(int.Parse).ToList().ForEach(a =>
                                {
                                    BillReferanceIdList.Add(a);
                                });
                            });
                            var result = new
                            {
                                DepositData = (from itm in billingDbContext.SyncBillingAccounting.AsEnumerable()
                                               join id in depositReferanceIdList on itm.ReferenceId equals id
                                               join pat in billingDbContext.Patient on itm.PatientId equals pat.PatientId
                                               where itm.ReferenceModelName == "Deposit"
                                               group new { itm, id, pat } by new { pat.PatientId, itm.TransactionType } into x
                                               select new
                                               {
                                                   PatientName = x.Select(a => a.pat.FirstName + " " + a.pat.LastName).FirstOrDefault(),
                                                   TransactionType = x.Key.TransactionType,
                                                   PaymentMode = x.Select(a => a.itm.PaymentMode).FirstOrDefault(),
                                                   TotalAmount = x.Sum(a => a.itm.TotalAmount),
                                               }).ToList(),
                                BillData = (from itm in billingDbContext.BillingTransactionItems.AsEnumerable()
                                            join bil in billingDbContext.BillingTransactions on itm.BillingTransactionId equals bil.BillingTransactionId
                                            //join Sync in billingDbContext.SyncBillingAccounting on itm.BillingTransactionItemId equals Sync.ReferenceId
                                            join id in BillReferanceIdList on itm.BillingTransactionItemId equals id
                                            join pat in billingDbContext.Patient on itm.PatientId equals pat.PatientId
                                           // where Sync.ReferenceModelName == "BillingTransactionItem"
                                            select new
                                            {
                                                itm,
                                                InvoiceNo = bil.InvoiceCode + bil.InvoiceNo,
                                                PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,
                                                TransactionType = txnModel.Where(a => a.referIds.Contains(id.ToString())).Select(a => a.TransactionType).FirstOrDefault(),
                                            }).ToList(),
                            };
                            responseData.Results = result;
                            responseData.Status = "OK";
                        }
                        /* * End Billing Section */

                        /* * Start Pharmacy Section */
                        if (txnModel.Where(a => a.SectionId == 3).ToList().Count > 0)
                        {
                            if (txnModel.Where(a => a.TransactionType.Contains("CashInvoice") && !a.TransactionType.Contains("CashInvoiceReturn")).ToList().Count > 0)
                            {
                                var InvoiceData = (from itm in pharmacyDbContext.PHRMInvoiceTransactionItems.AsEnumerable()
                                                   join detail in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable() on itm.InvoiceId equals detail.InvoiceId
                                                   join id in referanceIdList on detail.InvoiceId equals id
                                                   join pat in pharmacyDbContext.PHRMPatient on detail.PatientId equals pat.PatientId
                                                   group new { itm, detail, pat } by new {  id } into x
                                                   select new
                                                   {
                                                       InvoiceNo = x.Select(a => a.detail.InvoiceId).FirstOrDefault(),
                                                       DiscountAmount = x.Select(a => a.detail.DiscountAmount).FirstOrDefault(),
                                                       VATAmount = x.Select(a => a.detail.VATAmount).FirstOrDefault(),
                                                       TotalAmount = x.Select(a => a.detail.TotalAmount).FirstOrDefault(),
                                                       //ItemName = x.Select(a => a.itm.ItemName),
                                                       ItemList = x.Select(a => new { a.itm.ItemName, a.itm.TotalAmount }).ToList(),
                                                       PatientName = x.Select(a => a.pat.FirstName + "" + a.pat.LastName).FirstOrDefault(),
                                                       TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                   }).ToList();
                                responseData.Results = InvoiceData;
                            }
                            else
                            if (txnModel.Where(a => a.TransactionType.Contains("ReturnToSupplier")).ToList().Count > 0)
                            {
                                var ReturnToSupplierData = (from itm in pharmacyDbContext.PHRMReturnToSupplierItem.AsEnumerable()
                                                            join detail in pharmacyDbContext.PHRMReturnToSupplier.AsEnumerable() on itm.ReturnToSupplierId equals detail.ReturnToSupplierId
                                                            join id in referanceIdList on detail.ReturnToSupplierId equals id
                                                            join gritm in pharmacyDbContext.PHRMGoodsReceiptItems on itm.GoodReceiptItemId equals gritm.GoodReceiptItemId
                                                            join sup in pharmacyDbContext.PHRMSupplier on detail.SupplierId equals sup.SupplierId
                                                            group new { itm, detail, sup, gritm } by new { id } into x
                                                            select new
                                                            {
                                                                SupplierName = x.Select(a => a.sup.SupplierName).FirstOrDefault(),
                                                                DiscountAmount = x.Select(a => a.detail.DiscountAmount).FirstOrDefault(),
                                                                VATAmount = x.Select(a => a.detail.VATAmount).FirstOrDefault(),
                                                                TotalAmount = x.Select(a => a.detail.TotalAmount).FirstOrDefault(),
                                                                ItemList = x.Select(a => new { a.gritm.ItemName, a.itm.TotalAmount }).ToList(),
                                                                TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                            }).ToList();
                                responseData.Results = ReturnToSupplierData;
                            }
                            else
                            if (txnModel.Where(a => a.TransactionType.Contains("CashInvoiceReturn")).ToList().Count > 0)
                            {
                                var CashInvoiceReturnData = (from itm in pharmacyDbContext.PHRMInvoiceTransaction.AsEnumerable()
                                                            join id in referanceIdList on itm.InvoiceId equals id
                                                            join detail in pharmacyDbContext.PHRMInvoiceReturnItemsModel.AsEnumerable() on itm.InvoiceId equals detail.InvoiceId
                                                            join pat in pharmacyDbContext.PHRMPatient on itm.PatientId equals pat.PatientId
                                                            join invitm in pharmacyDbContext.PHRMInvoiceTransactionItems on detail.InvoiceItemId equals invitm.InvoiceItemId
                                                             group new { invitm, itm, pat, detail, id} by new { itm.PatientId, id} into x
                                                             select new
                                                            {
                                                                InvoiceNo = x.Select(a => a.itm.InvoiceId).FirstOrDefault(),
                                                                PatientName = x.Select(a => a.pat.FirstName + "" + a.pat.LastName).FirstOrDefault(),
                                                                TotalAmount = x.Select(a => a.detail.TotalAmount).FirstOrDefault(),
                                                                 //  ItemName = x.Select(a => a.invitm.ItemName).FirstOrDefault(),
                                                                 ItemList = x.Select(a => new { a.invitm.ItemName, a.invitm.TotalAmount }).ToList(),
                                                                 TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                             }).ToList();
                                responseData.Results = CashInvoiceReturnData;
                            }
                            else
                            if (txnModel.Where(a => a.TransactionType.Contains("GoodReceipt")).ToList().Count > 0)
                            {
                                var GoodsData = (from itm in pharmacyDbContext.PHRMGoodsReceiptItems.AsEnumerable()
                                                 join id in referanceIdList on itm.GoodReceiptId equals id
                                                 join detail in pharmacyDbContext.PHRMGoodsReceipt.AsEnumerable() on itm.GoodReceiptId equals detail.GoodReceiptId
                                                 group new { itm, detail, id } by new { id } into x
                                                 select new
                                                 {
                                                    // GoodReceiptId = x.Select(a => a.id).FirstOrDefault(),
                                                     InvoiceNo = x.Select(a => a.detail.InvoiceNo).FirstOrDefault(),
                                                     SupplierName = x.Select(a => a.itm.SupplierName).FirstOrDefault(),
                                                     DiscountAmount = x.Select(a => a.detail.DiscountAmount).FirstOrDefault(),
                                                     VATAmount = x.Select(a => a.detail.VATAmount).FirstOrDefault(),
                                                     TotalAmount = x.Select(a => a.detail.TotalAmount).FirstOrDefault(),
                                                     //ItemName = x.Select(a => a.itm.ItemName),
                                                     //TotalAmount = x.Select(a => a.detail.TotalAmount),
                                                      ItemList = x.Select(a => new { a.itm.ItemName, a.itm.TotalAmount }).ToList(),
                                                     TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                                 }).ToList();
                                responseData.Results = GoodsData;
                            }
                            else if (txnModel.Where(a => a.TransactionType.Contains("PHRMDispatchToDeptReturn")).ToList().Count > 0)
                            {
                                var Data = (from stk in pharmacyDbContext.PHRMStockTransactionModel.AsEnumerable()
                                            join itm in pharmacyDbContext.PHRMItemMaster.AsEnumerable() on stk.ItemId equals itm.ItemId
                                            join id in referanceIdList on stk.StockTxnItemId equals id
                                            group new { stk, id, itm } by new { id } into x
                                            select new
                                            {
                                                ItemList = x.Select(a => new { a.itm.ItemName, a.stk.TotalAmount }).ToList(),
                                                TotalAmount = x.Select(a => a.stk.SubTotal).FirstOrDefault(),
                                                TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                            }).ToList();

                                responseData.Results = Data;
                            }
                            else if (txnModel.Where(a => a.TransactionType.Contains("PHRMDispatchToDept")).ToList().Count > 0)
                            {
                                var Data = (from stk in pharmacyDbContext.PHRMStockTransactionModel.AsEnumerable()
                                            join id in referanceIdList on stk.StockTxnItemId equals id
                                            join wdc in pharmacyDbContext.WardConsumption.AsEnumerable() on stk.ReferenceNo equals wdc.InvoiceItemId
                                            join pat in pharmacyDbContext.PHRMPatient.AsEnumerable() on wdc.PatientId equals pat.PatientId
                                            group new { stk, pat, id, wdc } by new
                                            {
                                                id,
                                                PatientName = pat.FirstName + " " + (string.IsNullOrEmpty(pat.MiddleName) ? "" : pat.MiddleName + " ") + pat.LastName,

                                            } into x
                                            select new
                                            {
                                                PatientName= x.Key.PatientName,
                                                ItemList = x.Select(a => new { a.wdc.ItemName, a.stk.TotalAmount }).ToList(),
                                                TotalAmount = x.Select(a => a.wdc.SubTotal).FirstOrDefault(),
                                                TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                            }).ToList();

                                responseData.Results = Data;
                            }
                            else
                            {
                                var Data = (from itm in pharmacyDbContext.PHRMWriteOffItem.AsEnumerable()
                                            join detail in pharmacyDbContext.PHRMWriteOff.AsEnumerable() on itm.WriteOffId equals detail.WriteOffId
                                            join id in referanceIdList on detail.WriteOffId equals id
                                            join gr in pharmacyDbContext.PHRMGoodsReceiptItems on itm.GoodReceiptItemId equals gr.GoodReceiptItemId
                                            group new { itm, detail, gr, id } by new { id } into x
                                            select new
                                            {
                                                SupplierName = x.Select(a => a.gr.SupplierName).FirstOrDefault(),
                                                DiscountAmount = x.Select(a => a.detail.DiscountAmount).FirstOrDefault(),
                                                VATAmount = x.Select(a => a.detail.VATAmount).FirstOrDefault(),
                                                TotalAmount = x.Select(a => a.detail.TotalAmount).FirstOrDefault(),
                                                ItemList = x.Select(a => new { a.gr.ItemName, a.itm.TotalAmount }).ToList(),
                                                TransactionType = txnModel.Where(a => a.referIds.Contains(a.referIds.ToString())).Select(a => a.TransactionType).FirstOrDefault()
                                            }).ToList();
                                responseData.Results = Data;
                            }
                            responseData.Status = "OK";
                        }
                        /* * End Pharmacy Section */
                    }

                    //Ajay : 16 jan 19 :-Old Code commented as per requirement
                    //TransactionModel txnModel = accountingDBContext.Transactions.Where(a => a.TransactionId == transactionId).FirstOrDefault();
                    //if (txnModel.SectionId == 2)
                    //{
                    //    var ReferIds = (from l in accountingDBContext.TransactionLinks
                    //                    where l.TransactionId == transactionId
                    //                    select l.ReferenceId).FirstOrDefault();
                    //    List<int> ReferanceId = ReferIds.Split(',').Select(int.Parse).ToList();

                    //    if (txnModel.TransactionType.Contains("Deposit"))
                    //    {
                    //        var DepositData = (from itm in billingDbContext.SyncBillingAccounting
                    //                           join id in ReferanceId on itm.ReferenceId equals id
                    //                           select new
                    //                           {
                    //                               itm,
                    //                               txnModel.TransactionType
                    //                           }).ToList();
                    //        responseData.Results = DepositData;
                    //    }
                    //    else
                    //    {
                    //        var BillData = (from itm in billingDbContext.BillingTransactionItems
                    //                        join id in ReferanceId on itm.BillingTransactionItemId equals id
                    //                        // join txn in accountingDBContext.Transactions on itm.TransactionType equals txn.TransactionType
                    //                        select new
                    //                        {
                    //                            itm,
                    //                            txnModel.TransactionType
                    //                        }).ToList();
                    //        responseData.Results = BillData;
                    //    }
                    //    responseData.Status = "OK";
                    //}
                    //else if (txnModel.SectionId == 3)
                    //{
                    //    var ReferIds = (from l in accountingDBContext.TransactionLinks
                    //                    where l.TransactionId == transactionId
                    //                    select l.ReferenceId).FirstOrDefault();
                    //    List<int> ReferanceId = ReferIds.Split(',').Select(int.Parse).ToList();
                    //    //   var transactionType = txnModel.Remarks.Contains("Invoice Items") ? "Invoice Items" : txnModel.Remarks.Contains("Return To Supplier Items") ? "Return To Supplier Items" : txnModel.Remarks.Contains("WriteOff Items") ? "WriteOff Items" : "Goods Receipt Items";
                    //    if (txnModel.Remarks.Contains("Invoice Items"))
                    //    {
                    //        var InvoiceData = (from itm in pharmacyDbContext.PHRMInvoiceTransactionItems
                    //                           join id in ReferanceId on itm.InvoiceItemId equals id
                    //                           join detail in pharmacyDbContext.PHRMInvoiceTransaction on itm.InvoiceId equals detail.InvoiceId
                    //                           select new
                    //                           {
                    //                               itm,
                    //                               detail,
                    //                               txnModel.TransactionType
                    //                           }).ToList();
                    //        responseData.Results = InvoiceData;
                    //    }
                    //    else if (txnModel.Remarks.Contains("Return To Supplier Items"))
                    //    {
                    //        var Data = (from itm in pharmacyDbContext.PHRMReturnToSupplierItem
                    //                    join id in ReferanceId on itm.ReturnToSupplierItemId equals id
                    //                    join detail in pharmacyDbContext.PHRMReturnToSupplier on itm.ReturnToSupplierId equals detail.ReturnToSupplierId
                    //                    select new
                    //                    {
                    //                        itm,
                    //                        detail,
                    //                        txnModel.TransactionType
                    //                    }).ToList();
                    //        responseData.Results = Data;
                    //    }
                    //    else if (txnModel.Remarks.Contains("Goods Receipt Items"))
                    //    {
                    //        var Data = (from itm in pharmacyDbContext.PHRMGoodsReceiptItems
                    //                    join id in ReferanceId on itm.GoodReceiptId equals id
                    //                    join detail in pharmacyDbContext.PHRMGoodsReceipt on itm.GoodReceiptId equals detail.GoodReceiptId
                    //                    select new
                    //                    {
                    //                        itm,
                    //                        detail,
                    //                        txnModel.TransactionType
                    //                    }).ToList();
                    //        responseData.Results = Data;
                    //    }
                    //    else
                    //    {
                    //        var Data = (from itm in pharmacyDbContext.PHRMWriteOffItem
                    //                    join id in ReferanceId on itm.WriteOffItemId equals id
                    //                    select new
                    //                    {
                    //                        itm,
                    //                        txnModel.TransactionType
                    //                    }).ToList();
                    //        responseData.Results = Data;
                    //    }
                    //    responseData.Status = "OK";
                    //}
                }
                #endregion
                #region Cash Flow Report
                else if (reqType == "cashflowReportData")
                {

                    var result = (from l in accountingDBContext.LedgerGroups
                                  group l by new { l.PrimaryGroup } into x
                                  select new
                                  {
                                      x.Key.PrimaryGroup,
                                      COAList = (from l in accountingDBContext.LedgerGroups
                                                 where l.PrimaryGroup == x.Key.PrimaryGroup
                                                 group l by new
                                                 {
                                                     l.PrimaryGroup,
                                                     l.COA
                                                 } into x2
                                                 select new
                                                 {
                                                     x2.Key.COA,
                                                     LedgerGroupList = (from l in accountingDBContext.Ledgers
                                                                        join lg in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lg.LedgerGroupId
                                                                        where lg.COA == x2.Key.COA && lg.PrimaryGroup == x.Key.PrimaryGroup
                                                                        group lg by new
                                                                        {
                                                                            lg.PrimaryGroup,
                                                                            lg.COA,
                                                                            lg.LedgerGroupName,
                                                                        } into x3
                                                                        select new
                                                                        {
                                                                            x3.Key.LedgerGroupName,
                                                                            LedgersList = (from ti in accountingDBContext.TransactionItems
                                                                                           join l in accountingDBContext.Ledgers on ti.LedgerId equals l.LedgerId
                                                                                           join lgroup in accountingDBContext.LedgerGroups on l.LedgerGroupId equals lgroup.LedgerGroupId
                                                                                           join t in accountingDBContext.Transactions on ti.TransactionId equals t.TransactionId
                                                                                           where lgroup.COA == x2.Key.COA && lgroup.PrimaryGroup == x.Key.PrimaryGroup && lgroup.LedgerGroupName == x3.Key.LedgerGroupName //&& (DbFunctions.TruncateTime(t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(t.TransactionDate) <= ToDate)
                                                                                           group new { lgroup, ti, t, l } by new
                                                                                           {
                                                                                               lgroup.PrimaryGroup,
                                                                                               lgroup.COA,
                                                                                               lgroup.LedgerGroupName,
                                                                                               l.LedgerName,
                                                                                               ti.DrCr,
                                                                                           } into x4
                                                                                           select new
                                                                                           {
                                                                                               x4.Key.LedgerName,
                                                                                               x4.Key.LedgerGroupName,
                                                                                               // OpenBal = x3.Where(b => b.l.LedgerName == "cash" && (DbFunctions.TruncateTime(b.t.TransactionDate) >= FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                               // CloseBal = x3.Where( && (DbFunctions.TruncateTime(b.t.TransactionDate) <= ToDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                               OpenBal = x4.Where(b => b.lgroup.LedgerGroupName == "Cash In Hand" && (DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                               Amountdr = x4.Where(b => b.ti.DrCr == true && (DbFunctions.TruncateTime(b.t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(b.t.TransactionDate) <= ToDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                               Amountcr = x4.Where(b => b.ti.DrCr == false && (DbFunctions.TruncateTime(b.t.TransactionDate) >= FromDate && DbFunctions.TruncateTime(b.t.TransactionDate) <= ToDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                                                           }).ToList()
                                                                        }).ToList()
                                                 }).ToList()
                                  }).ToList();
                    responseData.Status = "OK";
                    responseData.Results = result;
                    //var outputString = DanpheJSONConvert.SerializeObject(responseData, true);
                }
                #endregion
                #region Daywise Voucher Report
                else if (reqType == "daywise-voucher-report")
                {
                    var OpeningBalanceData = (from t in accountingDBContext.Transactions
                                              join ti in accountingDBContext.TransactionItems on t.TransactionId equals ti.TransactionId
                                              join fisc in accountingDBContext.FiscalYears on t.FiscalyearId equals fisc.FiscalYearId
                                              where (DbFunctions.TruncateTime(t.TransactionDate) == FromDate) && (t.FiscalyearId == fisc.FiscalYearId)
                                              group new { fisc, ti, t } by new
                                              {
                                                  fisc.FiscalYearId,
                                                  t.TransactionDate,
                                              } into x
                                              select new
                                              {
                                                  Amountdr = x.Where(b => b.ti.DrCr == true && (DbFunctions.TruncateTime(b.t.TransactionDate) >= b.fisc.StartDate && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                  Amountcr = x.Where(b => b.ti.DrCr == false && (DbFunctions.TruncateTime(b.t.TransactionDate) >= b.fisc.StartDate && DbFunctions.TruncateTime(b.t.TransactionDate) < FromDate)).Select(a => (int?)a.ti.Amount).DefaultIfEmpty(0).Sum(),
                                                  x.Key.FiscalYearId,
                                              }).ToList();

                    var txnList = (from txn in accountingDBContext.Transactions
                                   join voucher in accountingDBContext.Vouchers on txn.VoucherId equals voucher.VoucherId
                                   join fiscal in accountingDBContext.FiscalYears on txn.FiscalyearId equals fiscal.FiscalYearId
                                   where txn.IsActive == true && (DbFunctions.TruncateTime(txn.TransactionDate) >= FromDate && DbFunctions.TruncateTime(txn.TransactionDate) <= ToDate)
                                   select new
                                   {
                                       TransactionId = txn.TransactionId,
                                       FiscalYear = fiscal.FiscalYearName,
                                       //VoucherNumber = txn.VoucherNumber,
                                       VoucherNumber = txn.DayVoucherNumber,
                                       VoucherType = voucher.VoucherName,
                                       VoucherId = txn.VoucherId,
                                       TransactionDate = DbFunctions.TruncateTime(txn.TransactionDate),// txn.TransactionDate.ToString("dd/mm/yyyy"),                                       
                                       Amount = (from txnItm in accountingDBContext.TransactionItems
                                                 where txnItm.TransactionId == txn.TransactionId
                                                 && txnItm.DrCr == true
                                                 group txnItm by new
                                                 {
                                                     txnItm.DrCr
                                                 } into g
                                                 select g.Sum(x => x.Amount)
                                                 ).FirstOrDefault()
                                   }).OrderByDescending(a => a.TransactionId).ToList();
                    //below query as per new requirement if wants old one result then please comment below and take txnList as result
                    var finalData = (from t in txnList
                                     group new { t } by new
                                     {
                                         t.VoucherNumber,
                                         t.FiscalYear,
                                         t.VoucherType,
                                         t.TransactionDate
                                     }
                                    into x
                                     select new
                                     {
                                         FiscalYear = x.Key.FiscalYear,
                                         VoucherNumber = x.Key.VoucherNumber,
                                         VoucherType = x.Key.VoucherType,
                                         TransactionDate = x.Key.TransactionDate,
                                         Amount = x.Sum(y => y.t.Amount),
                                         VoucherId = x.Select(a=> a.t.VoucherId).FirstOrDefault()
                                     }).OrderByDescending(a => a.TransactionDate).ToList();

                    responseData.Status = "OK";
                    responseData.Results = finalData;
                }
                #endregion

                #region DayWise Voucher details by DayWise Voucher Number                
                else if (reqType == "daywise-voucher-detail-by-dayVoucherNO")
                {
                    //getting uniqueid and sectionid of transaction 
                    var txnids = (from txn in accountingDBContext.Transactions
                                  where txn.DayVoucherNumber == DayVoucherNumber && txn.IsActive == true && txn.VoucherId == voucherId
                                  select new
                                  {
                                      txn.SectionId,
                                      txn.TUId,
                                      txn.VoucherNumber
                                  }).FirstOrDefault();


                    if (txnids.VoucherNumber.Contains("SV") && txnids.SectionId == 2)
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
                                            where txn.DayVoucherNumber == DayVoucherNumber && txn.IsActive == true
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
                                        txn.Remarks,
                                        txn.DayVoucherNumber
                                    }).ToList();
                        //formatting data for sales voucher
                        var txnList = (from temptxn in temp
                                       select new
                                       {
                                           VoucherNumber = temptxn.VoucherNumber,
                                           DayVoucherNumber = temptxn.DayVoucherNumber,
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
                                                                   //txn.VoucherNumber
                                                                   txn.DayVoucherNumber
                                                               }
                                                               into x
                                                               select new
                                                               {
                                                                   LedgerId = x.Key.LedgerId,
                                                                   LedgerGroupName = x.Key.LedgerGroupName,
                                                                   LedgerName = x.Key.LedgerName,
                                                                   DrCr = x.Key.DrCr,
                                                                   VoucherNumber = x.Key.DayVoucherNumber,
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
                                       where txn.DayVoucherNumber == DayVoucherNumber && txn.IsActive == true && txn.VoucherId == voucherId
                                       select new
                                       {
                                           // TransactionId = txn.TransactionId,
                                           VoucherNumber = txn.VoucherNumber,
                                           DayVoucherNumber = txn.DayVoucherNumber,
                                           FiscalYear = fiscal.FiscalYearName,
                                           VoucherHead = head.VoucherHeadName,
                                           TransactionDate = txn.TransactionDate,
                                           VoucherType = voucher.VoucherName,
                                           Remarks = txn.Remarks,
                                           TransactionItems = (from txnItm in accountingDBContext.TransactionItems
                                                               join ledger in accountingDBContext.Ledgers on txnItm.LedgerId equals ledger.LedgerId
                                                               join txnp in accountingDBContext.Transactions on txnItm.TransactionId equals txnp.TransactionId
                                                               join ledgp in accountingDBContext.LedgerGroups on ledger.LedgerGroupId equals ledgp.LedgerGroupId
                                                               where txnp.DayVoucherNumber == DayVoucherNumber && txnp.VoucherId == voucherId
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
                                                                              where txn.DayVoucherNumber == DayVoucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Patient" && txn.VoucherId == voucherId
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
                                                                                      where txn.DayVoucherNumber == DayVoucherNumber && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Supplier" && txn.VoucherId == voucherId
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
                                                                                  where txn.DayVoucherNumber == DayVoucherNumber && txn.VoucherId == voucherId && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "User" && txn.TUId == txnids.TUId
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
                                                                                    where txn.DayVoucherNumber == DayVoucherNumber && txn.VoucherId == voucherId && txnitm.LedgerId == x.Key.LedgerId && txnitm.DrCr == x.Key.DrCr && txndetail.ReferenceType == "Vendor"
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
