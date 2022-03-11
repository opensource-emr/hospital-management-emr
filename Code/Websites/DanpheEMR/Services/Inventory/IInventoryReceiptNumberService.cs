using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public interface IInventoryReceiptNumberService
    {


        /// <summary>
        /// Generates the (max + 1) Requisition Number from the Requisition Table based on FiscalYearId (must be implemented immediately) and ReqDisGroupId
        /// </summary>
        /// <param name="FiscalYearId">Fiscal Year Id</param>
        /// <param name="ReqDisGroupId">Store's ReqDisGroupId</param>
        /// <returns>latest (max+1) Requisition Number</returns>
        int GenerateRequisitionNumber(int? FiscalYearId, int? ReqDisGroupId);

        /// <summary>
        /// Generates the (max + 1) DispatchId from the Dispatch Table based on FiscalYearId (must be implemented immediately) and ReqDisGroupId
        /// </summary>
        /// <param name="DispatchedDate">Dispatched Date</param>
        /// <param name="ReqDisGroupId">Store's ReqDisGroupId</param>
        /// <returns>latest (max+1) DispatchId</returns>
        int GenerateDispatchNo(int? fiscalYearId, int? ReqDisGroupId);

        /// <summary>
        /// Generates the (max + 1) PR Number from the PR Table based on FiscalYearId (must be implemented immediately) and PRGroupId
        /// </summary>
        /// <param name="PurchaseRequestDate">Pruchase Request Date</param>
        /// <param name="PRGroupId">Store's PRGroupId</param>
        /// <returns>latest (max+1) PR Number</returns>
        int GeneratePurchaseRequestNumber(int? fiscalYearId, int? PRGroupId);

        /// <summary>
        /// Generates the (max + 1) Goods Arrival Number from the GR Table based on FiscalYearId and GRGroupId
        /// </summary>
        /// <param name="FiscalYearId">Fiscal Year Id</param>
        /// <param name="GRGroupId">Store's GRGroupId</param>
        /// <returns>latest (max+1) GR Number</returns>
        int GenerateGAN(DateTime? GoodsArrivalDate, int? GRGroupId);

        /// <summary>
        /// Generates the (max + 1) GR Number from the GR Table based on FiscalYearId and GRGroupId
        /// </summary>
        /// <param name="GoodsReceiptDate">Goods Receipt Date</param>
        /// <param name="GRGroupId">Store's GRGroupId</param>
        /// <returns>latest (max+1) GR Number</returns>
        int GenerateGRN(DateTime? GoodsReceiptDate, int? GRGroupId);

        int GeneratePurchaseOrderNumber(int? fiscalYearId, int? POGroupId);
        int GenerateRequestForQuotationNumber(int? fiscalYearId, int? RFQGroupId);

        int GenerateQuotationNumber(int? fiscalYearId, int? RFQGroupId);
    }

    
}
