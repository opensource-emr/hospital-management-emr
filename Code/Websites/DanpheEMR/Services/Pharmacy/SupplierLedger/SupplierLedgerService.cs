using DanpheEMR.Controllers;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel.PharmacyModels;
using DanpheEMR.ViewModel.Pharmacy;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Pharmacy.SupplierLedger
{
    public class SupplierLedgerService : ISupplierLedgerService
    {
        #region DECLARATIONS
        private PharmacyDbContext db;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public SupplierLedgerService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);
        }
        #endregion

        #region METHODS, APIs
        public async Task<GetPHRMSupplierLedgerVM> GetAllAsync()
        {
            var supplierLedgerTxn = await (from SL in db.SupplierLedger
                                           from supplier in db.PHRMSupplier.Where(S => S.SupplierId == SL.SupplierId).DefaultIfEmpty()
                                           select new GetPHRMSupplierLedgerDTO
                                           {
                                               SupplierId = SL.SupplierId,
                                               SupplierName = supplier.SupplierName,
                                               TotalAmount = SL.CreditAmount,
                                               PaidAmount = SL.DebitAmount,
                                               DueAmount = SL.BalanceAmount,
                                               IsActive = SL.IsActive
                                           }).Where(l => l.IsActive == true).ToListAsync();

            return new GetPHRMSupplierLedgerVM { SupplierLedgers = supplierLedgerTxn };

        }

        public async Task<GetSupplierLedgerGRDetailsVM> GetSupplierLedgerGRDetails(int supplierId)
        {
            var supplier = await db.PHRMSupplier.FindAsync(supplierId);
            string supplierName = supplier.SupplierName;

            var supplierLedgerTxnsByGR = await (from ST in db.SupplierLedgerTransactions
                                                join GR in db.PHRMGoodsReceipt on ST.ReferenceNo equals GR.GoodReceiptId
                                                where ST.SupplierId == supplierId
                                                group new { ST, GR } by new { ST.LedgerId, GR.GoodReceiptId, ST.SupplierId, GR.GoodReceiptPrintId } into STG
                                                select new GetSupplierLedgerGRDetailsDTO
                                                {
                                                    LedgerId = STG.Key.LedgerId,
                                                    SupplierId = STG.Key.SupplierId,
                                                    GoodsReceiptId = STG.Key.GoodReceiptId,
                                                    GoodsReceiptPrintId = STG.Key.GoodReceiptPrintId,
                                                    GRDate = STG.Select(s => s.GR.GoodReceiptDate).FirstOrDefault(),
                                                    GRTotalAmount = STG.Select(s => s.GR.TotalAmount).FirstOrDefault(),
                                                    BillNo = STG.Select(s => s.GR.InvoiceNo).FirstOrDefault(),
                                                    DebitAmount = STG.Sum(s => s.ST.DebitAmount),
                                                    CreditAmount = STG.Sum(s => s.ST.CreditAmount),
                                                    BalanceAmount = STG.Sum(s => s.ST.CreditAmount) - STG.Sum(s => s.ST.DebitAmount), //always credit - debit
                                                }).ToListAsync();
            return new GetSupplierLedgerGRDetailsVM { SupplierName = supplierName, SupplierLedgerGRDetails = supplierLedgerTxnsByGR };

        }

        public int MakeSupplierLedgerPayment(IList<MakeSupplierLedgerPaymentVM> ledgerTxn, RbacUser currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    foreach (var ledger in ledgerTxn)
                    {
                        //find the supplier ledger
                        var entity = db.SupplierLedger.Find(ledger.LedgerId);

                        //TO-DO:If client side balance amount is not equal to server side balance amount
                        //if (ledger.BalanceAmount != entity.BalanceAmount) throw new Exception($"The amount for this ledger has been modified.");

                        //update the Debit and Balance amount 
                        entity.DebitAmount += ledger.PayingAmount;
                        entity.BalanceAmount = entity.CreditAmount - entity.DebitAmount;
                        entity.ModifiedBy = currentUser.EmployeeId;
                        entity.ModifiedOn = currentDate;

                        //add new txn records
                        var supplierLedgerTxn = new PHRMSupplierLedgerTransactionModel()
                        {
                            FiscalYearId = PharmacyBL.GetFiscalYear(connString).FiscalYearId,
                            LedgerId = ledger.LedgerId,
                            SupplierId = ledger.SupplierId,
                            DebitAmount = ledger.PayingAmount,
                            CreditAmount = 0,
                            // CreditAmount = ledger.BalanceAmount - ledger.PayingAmount,
                            ReferenceNo = ledger.GoodsReceiptId,
                            TransactionType = ENUM_SupplierLedgerTransaction.MakePayment,
                            IsActive = true,
                            CreatedBy = currentUser.EmployeeId,
                            CreatedOn = currentDate

                        };
                        db.SupplierLedgerTransactions.Add(supplierLedgerTxn);
                        db.SaveChanges();

                    }

                    dbTransaction.Commit();
                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
            }
            return ledgerTxn[0].LedgerId;
        }

        #endregion
    }
}
