using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    #region Output ViewModel
    public class GetPODetailByPOIdViewModel
    {
        public GetPODetailByPOIdDTO purchaseOrder { get; set; }
    }
    #endregion

    #region Methods
    public static class GetPODetailsByPOIdFRunc
    {
        public static async Task<GetPODetailByPOIdViewModel> GetPODetailsByPOIdAsync(this PharmacyDbContext db, int purchaseOrderId)
        {
            var purchaseOrder = await (from po in db.PHRMPurchaseOrder.Where(a => a.PurchaseOrderId == purchaseOrderId)
                                       join supp in db.PHRMSupplier on po.SupplierId equals supp.SupplierId
                                       join rbacuser in db.Employees on po.CreatedBy equals rbacuser.EmployeeId
                                       select new GetPODetailByPOIdDTO
                                       {
                                           SupplierName = supp.SupplierName,
                                           PurchaseOrderId = po.PurchaseOrderId,
                                           Pin = supp.PANNumber,
                                           ContactNo = supp.ContactNo,
                                           ContactAddress = supp.ContactAddress,
                                           PODate = po.PODate,
                                           POStatus = po.POStatus,
                                           Email = supp.Email,
                                           UserName = rbacuser.FullName,
                                           SubTotal = po.SubTotal,
                                           VATAmount = po.VATAmount,
                                           TotalAmount = po.TotalAmount
                                       }).FirstOrDefaultAsync();

            purchaseOrder.PurchaseOrderItems = await (from poitems in db.PHRMPurchaseOrderItems.Where(a => a.PurchaseOrderId == purchaseOrderId)
                                                      join item in db.PHRMItemMaster on poitems.ItemId equals item.ItemId
                                                      join uom in db.PHRMUnitOfMeasurement on item.UOMId equals uom.UOMId
                                                      select new GetPODetailByPOIdItemDTO
                                                      {
                                                          ItemName = item.ItemName,
                                                          UOMName = uom.UOMName,
                                                          PendingQuantity = poitems.PendingQuantity,
                                                          ReceivedQuantity = poitems.ReceivedQuantity,
                                                          Quantity = poitems.Quantity,
                                                          StandaredPrice = poitems.StandaredPrice,
                                                          SubTotal = poitems.SubTotal,
                                                          TotalAmount = poitems.TotalAmount,
                                                          VATAmount = poitems.VATAmount,
                                                          IsCancel = poitems.IsCancel
                                                      }).Where(s => s.IsCancel == false || s.IsCancel == null).ToListAsync();
            return new GetPODetailByPOIdViewModel() { purchaseOrder = purchaseOrder };
        }
    }

    #endregion

    #region DTOs
    public class GetPODetailByPOIdItemDTO
    {
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public double Quantity { get; set; }
        public decimal StandaredPrice { get; set; }

        public double ReceivedQuantity { get; set; }
        public double PendingQuantity { get; set; }
        public decimal SubTotal { get; set; }
        public decimal VATAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public int DeliveryDays { get; set; }
        public string AuthorizedRemark { get; set; }
        public string Remarks { get; set; }
        public string POItemStatus { get; set; }
        public bool? IsCancel { get; set; }
    }
    public class GetPODetailByPOIdDTO
    {
        public int PurchaseOrderId { get; set; }
        public DateTime? PODate { get; set; }
        public string POStatus { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal VATAmount { get; set; }
        public string DeliveryAddress { get; set; }
        public string Remarks { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string Pin { get; set; }
        public string Email { get; set; }
        public string ContactNo { get; set; }
        public string ContactAddress { get; set; }
        public string City { get; set; }
        public IList<GetPODetailByPOIdItemDTO> PurchaseOrderItems { get; set; }
        public string UserName { get; set; }
    }
    #endregion
}
