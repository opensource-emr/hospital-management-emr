using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.FixedAsset
{
    //swapnil-2-april-2021
    #region Output View Model
    public class GetRequisitionDetailsForDispatchViewModel
    {
        public RequisitionDto Requisition { get; set; }
    }
    #endregion

    #region Method
    public static class GetRequisitionItemsForDispatchFunc
    {
        public static async Task<GetRequisitionDetailsForDispatchViewModel> GetRequisitionDetailsForDispatch(this WardSupplyDbContext db, int RequisitionId)
        {
            //Get Necessary Requisition Details first
            var requisition = await (from R in db.WARDSupplyAssetRequisitionModels.Where(r => r.RequisitionId == RequisitionId)
                                     join D in db.StoreModel on R.StoreId equals D.StoreId
                                     select new RequisitionDto
                                     {
                                         RequisitionId = R.RequisitionId,
                                         RequisitionNo = R.RequisitionNo,
                                         RequisitionStoreId = R.StoreId,
                                         RequisitionStoreName = D.Name,
                                         RequisitionSubStoreId = R.SubStoreId,
                                         RequisitionSubStoreName = D.StoreLabel,
                                         RequestedBy = R.CreatedBy,
                                         RequestedOn = R.RequisitionDate,
                                         RequisitionStatus = R.RequisitionStatus                          
                                     }).FirstOrDefaultAsync();
            int? reqStoreId = (requisition != null) ? requisition.RequisitionStoreId.Value: 0 ;
            //Fill in the requisition items details in requisition object
            requisition.RequisitionItems = await (from RI in db.WARDSupplyAssetRequisitionItemsModels.Where(ri => ri.RequisitionId == RequisitionId && ri.PendingQuantity!=0)
                                                  join itm in db.INVItemMaster on RI.ItemId equals itm.ItemId
                                                  select new RequisitionItemDto
                                                  {
                                                      RequisitionItemId = RI.RequisitionItemId,
                                                      ItemId = RI.ItemId,
                                                      ItemName = itm.ItemName,
                                                      RequestedQuantity = RI.Quantity,
                                                      PendingQuantity = RI.PendingQuantity,
                                                      CancelgQuantity=RI.CancelQuantity,
                                                      ReceivedQuantity=RI.ReceivedQuantity,
                                                      RequisitionItemStatus=RI.RequisitionItemStatus
                                                  }).ToListAsync();
            //for each item, find the stock and find out available stock and prefil dispatching item with first-expiry-first-out logic
            foreach (var item in requisition.RequisitionItems)
            {
                //find the available stock
                item.AvailableStockList = await (from S in db.FixedAssetStock.Where(s => s.ItemId == item.ItemId  == true && s.IsActive==true 
                                                 && s.StoreId==reqStoreId && s.SubStoreId==null 
                                                 )                                              
                                                 select new AvailableStockDto
                                                 {
                                                     BatchNo = S.BatchNo,
                                                     FixedAssetStockId=S.FixedAssetStockId,
                                                     Price=S.ItemRate,
                                                     VATAmount=S.VATAmount,
                                                     BarCodeNumber=S.BarCodeNumber
                                                 }).ToListAsync();
                //if no stock found, then dispatch should not be allowed, set the flag here and disable in client side.
                if (item.AvailableStockList?.Count() == 0)
                    item.IsDispatchForbidden = true;
                else
                    item.AvailableQuantity = item.AvailableStockList?.Count() ?? 0;
                
            }
            
            return new GetRequisitionDetailsForDispatchViewModel() { Requisition = requisition };
        }
    }
    #endregion

    #region DTOs
    public class RequisitionDto
    {
        public int RequisitionId { get; set; }
        public int? RequisitionNo { get; set; }
        public int? RequisitionStoreId { get; set; }
        public string RequisitionStoreName { get; set; }
        public int? RequisitionSubStoreId { get; set; }
        public string RequisitionSubStoreName{ get; set; }
        public int? RequestedBy { get; set; }
        public DateTime RequestedOn { get; set; }
        public string RequisitionStatus { get; set; }
        public List<RequisitionItemDto> RequisitionItems { get; set; }
    }

    public class RequisitionItemDto
    {
        public int RequisitionItemId { get; set; }
        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public double? RequestedQuantity { get; set; }
        public double? ReceivedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public double? CancelgQuantity { get; set; }
        public string RequisitionItemStatus{ get; set; }
        public int? AvailableQuantity { get; set; }
        public List<AvailableStockDto> AvailableStockList { get; set; }
        public List<DispatchItemDto> DispatchedItems { get; set; }
        public bool IsDispatchingNow { get; set; }
        public bool IsDispatchForbidden { get; set; }

        public RequisitionItemDto()
        {
            AvailableStockList = new List<AvailableStockDto>();
            DispatchedItems = new List<DispatchItemDto>();
        }
    }
    public class AvailableStockDto : UniqueStockIdentifier
    {
    }
    public class DispatchItemDto : UniqueStockIdentifier
    {
        public List<AvailableStockDto> BarCodeNumberList { get; set; }
    }
   
    public class UniqueStockIdentifier
    {
        public int FixedAssetStockId { get; set; }
        public string BatchNo { get; set; }
        public string BarCodeNumber { get; set; }
        public decimal Price { get; set; }
        public decimal? VATAmount { get; set; }
    }
    #endregion
}
