using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel
{
    public class GetRFQDetailsByIdVM
    {
        public IList<GetRFQDetailsByIdDTO> RFQDetailList { get; set; }
    }
    public static class GetRFQDetailsByIdFunction
    {
        public static async Task<GetRFQDetailsByIdVM> GetRFQDetails(this InventoryDbContext db, int ReqForQuotationId)
        {
            var result = await (from rfqVendor in db.ReqForQuotationVendors
                                join vendor in db.Vendors on rfqVendor.VendorId equals vendor.VendorId
                                join rfqItem in db.ReqForQuotationItems on rfqVendor.ReqForQuotationId equals rfqItem.ReqForQuotationId
                                join Q in db.Quotations on new { rfqVendor.ReqForQuotationId, rfqVendor.VendorId } equals new { Q.ReqForQuotationId, Q.VendorId } into QJ
                                from QLG in QJ.DefaultIfEmpty()
                                join qItem in db.QuotationItems on new { QLG.QuotationId, rfqItem.ItemId } equals new { qItem.QuotationId, qItem.ItemId } into QIJ
                                from QILG in QIJ.DefaultIfEmpty()
                                where rfqVendor.ReqForQuotationId == ReqForQuotationId
                                group new { vendor, rfqVendor, QLG, rfqItem, QILG } by new { rfqVendor.VendorId, vendor.VendorName } into rfqG
                                select new GetRFQDetailsByIdDTO
                                {
                                    VendorId = rfqG.Key.VendorId,
                                    QuotationId = rfqG.Select(r => r.QLG).FirstOrDefault() != null ? rfqG.Select(s => s.QLG.QuotationId).FirstOrDefault() : 0,
                                    VendorName = rfqG.Key.VendorName,
                                    RFQItemList = rfqG.Select(r => new GetRFQItemDetailsDTO
                                    {
                                        ItemId = r.rfqItem.ItemId,
                                        ItemName = r.rfqItem.ItemName,
                                        Description = r.rfqItem.Description,
                                        Quantity = r.rfqItem.Quantity,
                                        Price = r.QILG != null ? r.QILG.Price : null,
                                        QuotationId = (r.QLG != null) ? (int?)r.QLG.QuotationId : null,
                                        QuotationItemId = r.QILG != null ? (int?)r.QILG.QuotationItemId : null,
                                        ReqForQuotationId = r.rfqItem.ReqForQuotationId,
                                        ReqForQuotationItemId = r.rfqItem.ReqForQuotationItemId
                                    }).ToList()

                                }).ToListAsync();
            return new GetRFQDetailsByIdVM { RFQDetailList = result };
        }
    }
    public class GetRFQDetailsByIdDTO
    {
        public int VendorId { get; set; }
        public int? QuotationId { get; set; }
        public string VendorName { get; set; }
        public IList<GetRFQItemDetailsDTO> RFQItemList { get; set; }
    }

    public class GetRFQItemDetailsDTO
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public decimal? Price { get; set; }
        public int? QuotationId { get; set; }
        public int? QuotationItemId { get; set; }
        public int ReqForQuotationId { get; set; }
        public int ReqForQuotationItemId { get; set; }
    }

}
