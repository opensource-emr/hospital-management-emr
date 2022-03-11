using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.ServerModel;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public class InventoryReceiptNumberService : IInventoryReceiptNumberService
    {
        public InventoryDbContext db;
        private readonly string connString = null;
        public InventoryReceiptNumberService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);
        }

        /// <summary>
        /// Generates the (max + 1) Requisition Number from the Requisition Table based on FiscalYearId (must be implemented immediately) and ReqDisGroupId
        /// </summary>
        /// <param name="FiscalYearId">FiscalYearId</param>
        /// <param name="ReqDisGroupId">Store's ReqDisGroupId</param>
        /// <returns>latest (max+1) Requisition Number</returns>
        public int GenerateRequisitionNumber(int? FiscalYearId, int? ReqDisGroupId)
        {

            int requisitionNumber = (from req in db.Requisitions
                                     where req.FiscalYearId == FiscalYearId && req.ReqDisGroupId == ReqDisGroupId
                                     select req.RequisitionNo).DefaultIfEmpty(0).Max();
            return ++requisitionNumber;
        }

        /// <summary>
        /// Generates the (max + 1) DispatchId from the Dispatch Table based on FiscalYearId (must be implemented immediately) and ReqDisGroupId
        /// </summary>
        /// <param name="DispatchedDate">Dispatched Date</param>
        /// <param name="ReqDisGroupId">Store's ReqDisGroupId</param>
        /// <returns>latest (max+1) DispatchId</returns>
        public int GenerateDispatchNo(int? fiscalYearId, int? ReqDisGroupId)
        {
            int dispatchId = (from req in db.DispatchItems
                              where req.FiscalYearId == fiscalYearId && req.ReqDisGroupId == ReqDisGroupId
                              select req.DispatchId).DefaultIfEmpty(0).Max();
            return ++dispatchId;
        }

        /// <summary>
        /// Generates the (max + 1) PR Number from the PR Table based on FiscalYearId (must be implemented immediately) and PRGroupId
        /// </summary>
        /// <param name="PurchaseRequestDate">Pruchase Request Date</param>
        /// <param name="PRGroupId">Store's PRGroupId</param>
        /// <returns>latest (max+1) PR Number</returns>
        public int GeneratePurchaseRequestNumber(int? fiscalYearId, int? PRGroupId)
        {
            int prNumber = (from invtxn in db.PurchaseRequest
                            where invtxn.FiscalYearId == fiscalYearId && invtxn.PRGroupId == PRGroupId
                            select invtxn.PRNumber ?? 0).DefaultIfEmpty(0).Max();
            return ++prNumber;
        }

        /// <summary>
        /// Generates the (max + 1) Goods Arrival Number from the GR Table based on FiscalYearId and GRGroupId
        /// </summary>
        /// <param name="GoodsArrivalDate">Goods Arrival Date</param>
        /// <param name="GRGroupId">Store's GRGroupId</param>
        /// <returns>latest (max+1) GR Number</returns>
        public int GenerateGAN(DateTime? GoodsArrivalDate, int? GRGroupId)
        {
            if (GoodsArrivalDate is null)
            {
                GoodsArrivalDate = DateTime.Now;
            }
            var selectedFiscalYear = GetFiscalYearByDate(GoodsArrivalDate.Value);

            int goodsArrivalNo = (from invtxn in db.GoodsReceipts
                                  where selectedFiscalYear.StartDate <= invtxn.GoodsArrivalDate && selectedFiscalYear.EndDate >= invtxn.GoodsArrivalDate
                                        && invtxn.GRGroupId == GRGroupId
                                  select invtxn.GoodsArrivalNo).DefaultIfEmpty(0).Max();
            return ++goodsArrivalNo;
        }

        /// <summary>
        /// Generates the (max + 1) GR Number from the GR Table based on FiscalYearId and GRGroupId
        /// </summary>
        /// <param name="GoodsReceiptDate">Goods Receipt Date</param>
        /// <param name="GRGroupId">Store's GRGroupId</param>
        /// <returns>latest (max+1) GR Number</returns>
        public int GenerateGRN(DateTime? GoodsReceiptDate, int? GRGroupId)
        {
            if (GoodsReceiptDate is null)
            {
                GoodsReceiptDate = DateTime.Now;
            }
            var selectedFiscalYear = GetFiscalYearByDate(GoodsReceiptDate.Value);

            int goodreceiptnumber = (from invtxn in db.GoodsReceipts
                                     where invtxn.FiscalYearId == selectedFiscalYear.FiscalYearId
                                        && invtxn.GRGroupId == GRGroupId
                                     select invtxn.GoodsReceiptNo ?? 0).DefaultIfEmpty(0).Max();
            return ++goodreceiptnumber;
        }


        //To generate purchase order number according to the fiscal year.
        public int GeneratePurchaseOrderNumber(int? fiscalYearId, int? POGroupId)
        {
            int poNumber = (from invtxn in db.PurchaseOrders
                            where invtxn.FiscalYearId == fiscalYearId && invtxn.POGroupId == POGroupId
                            select invtxn.PONumber ?? 0).DefaultIfEmpty(0).Max();
            return ++poNumber;
        }

        //To generate RequestForQuotationNumber according to the fiscal year.
        public int GenerateRequestForQuotationNumber(int? fiscalYearId, int? RFQGroupId)
        {

            int RFQNumber = (from invtxn in db.ReqForQuotation
                             where invtxn.FiscalYearId == fiscalYearId && invtxn.RFQGroupId == RFQGroupId
                             select invtxn.RequestForQuotationNo ?? 0).DefaultIfEmpty(0).Max();
            return ++RFQNumber;
        }

        //To generate QuotationNumber according to the fiscal year.
        public int GenerateQuotationNumber(int? fiscalYearId, int? RFQGroupId)
        {
            int QNumber = (from invtxn in db.Quotations
                           where invtxn.FiscalYearId == fiscalYearId && invtxn.RFQGroupId == RFQGroupId
                           select invtxn.QuotationNo ?? 0).DefaultIfEmpty(0).Max();
            return ++QNumber;
        }
        private InventoryFiscalYear GetFiscalYearByDate(DateTime invtxnDate)
        {
            var fiscalYear = db.InventoryFiscalYears.Where(fsc => fsc.StartDate <= invtxnDate && fsc.EndDate >= invtxnDate).FirstOrDefault();
            if (fiscalYear == null)
            {
                throw new InvalidOperationException($"Cannot find {nameof(fiscalYear)}.");
            }
            return fiscalYear;
        }
    }
}
