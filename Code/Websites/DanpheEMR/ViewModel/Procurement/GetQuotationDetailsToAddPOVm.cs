using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Procurement
{
    public class GetQuotationDetailsToAddPOVm
    {
        public GetQuotationDetailsToAddPODto PurchaseOrder { get; set; }
    }
    public static class GetQuotationDetailsToAddPOFunc
    {
        public static async Task<GetQuotationDetailsToAddPOVm> GetQuotationDetailsToAddPO(this InventoryDbContext db, int ReqForQuotationId)
        {
            var po = await (from reqForQuotation in db.ReqForQuotation
                            join reqFrQuotItem in db.ReqForQuotationItems on reqForQuotation.ReqForQuotationId equals reqFrQuotItem.ReqForQuotationId
                            join quotation in db.Quotations on reqForQuotation.ReqForQuotationId equals quotation.ReqForQuotationId
                            join quotationItem in db.QuotationItems on quotation.QuotationId equals quotationItem.QuotationId

                            where reqForQuotation.ReqForQuotationId == ReqForQuotationId && quotation.Status == "selected"
                            select new GetQuotationDetailsToAddPODto
                            {
                                QuotationId = quotation.QuotationId,
                                QuotationNo = quotation.QuotationId, //change it later after quotation number is introduced
                                VendorId = quotation.VendorId,
                            }).FirstOrDefaultAsync();

            po.PurchaseOrderItems = await (from quotationItem in db.QuotationItems
                                           join quotation in db.Quotations on quotationItem.QuotationId equals quotation.QuotationId
                                           join reqFrQuotItem in db.ReqForQuotationItems on new { ReqForQuotationId = quotation.ReqForQuotationId ?? 0, quotationItem.ItemId } equals new { reqFrQuotItem.ReqForQuotationId, reqFrQuotItem.ItemId }
                                           where quotationItem.QuotationId == po.QuotationId
                                           select new GetQuotationItemDetailsToAddPODto
                                           {
                                               Description = quotationItem.Description,
                                               ItemId = quotationItem.ItemId,
                                               QuotationItemId = quotationItem.QuotationItemId,
                                               QuotationQuantity = reqFrQuotItem.Quantity,
                                               QuotationRate = quotationItem.Price ?? 0
                                           }).ToListAsync();
            return new GetQuotationDetailsToAddPOVm { PurchaseOrder = po };
        }
    }
    public class GetQuotationDetailsToAddPODto
    {
        public int? QuotationId { get; set; }
        public int? QuotationNo { get; set; }
        public int VendorId { get; set; }
        public IList<GetQuotationItemDetailsToAddPODto> PurchaseOrderItems { get; set; } = new List<GetQuotationItemDetailsToAddPODto>();
    }
    public class GetQuotationItemDetailsToAddPODto
    {
        public int? QuotationItemId { get; set; }
        public int ItemId { get; set; }
        public double QuotationQuantity { get; set; }
        public decimal QuotationRate { get; set; }
        public string Description { get; set; }
    }
}
