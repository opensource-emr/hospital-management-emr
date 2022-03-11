using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    #region Output View Model
    public class GetRequisitionDetailsForDispatchViewModel
    {
        public RequisitionDto Requisition { get; set; }
    }
    #endregion

    #region Method
    public static class GetRequisitionItemsForDispatchFunc
    {
        public static async Task<GetRequisitionDetailsForDispatchViewModel> GetRequisitionDetailsForDispatch(this PharmacyDbContext db, int RequisitionId)
        {
            //Get Necessary Requisition Details first
            var requisition = await (from R in db.StoreRequisition.Where(r => r.RequisitionId == RequisitionId)
                                     join D in db.PHRMStore on R.StoreId equals D.StoreId
                                     select new RequisitionDto
                                     {
                                         RequisitionId = R.RequisitionId,
                                         RequisitionNo = R.RequisitionNo,
                                         RequestingDispensaryId = D.StoreId,
                                         RequestingDispensaryName = D.Name,
                                     }).FirstOrDefaultAsync();
            //Fill in the requisition items details in requisition object
            requisition.RequisitionItems = await (from RI in db.StoreRequisitionItems.Where(ri => ri.RequisitionId == RequisitionId && (ri.RequisitionItemStatus == "active" || ri.RequisitionItemStatus == "partial"))
                                                  join I in db.PHRMItemMaster on RI.ItemId equals I.ItemId
                                                  join Rack in db.PHRMRack on I.StoreRackId equals Rack.RackId into Racks
                                                  from RackLJ in Racks.DefaultIfEmpty()
                                                  select new RequisitionItemDto
                                                  {
                                                      RequisitionItemId = RI.RequisitionItemId,
                                                      ItemId = RI.ItemId,
                                                      ItemName = I.ItemName,
                                                      RequestedQuantity = RI.Quantity,
                                                      PendingQuantity = RI.PendingQuantity,
                                                      AllocatedStoreRackName = (RackLJ != null) ? RackLJ.Name : "N/A",
                                                  }).ToListAsync();
            var mainStoreId = db.PHRMStore.Where(a => a.Category == "store" && a.SubCategory == "pharmacy").Select(a => a.StoreId).FirstOrDefault();
            //for each item, find the stock and find out available stock and prefil dispatching item with first-expiry-first-out logic
            foreach (var item in requisition.RequisitionItems)
            {
                //find the available stock
                item.AvailableStockList = await (from S in db.StoreStocks.Where(s => s.StoreId == mainStoreId && s.ItemId == item.ItemId && s.IsActive == true && s.AvailableQuantity > 0)
                                                 group S by new { S.StockMaster.BatchNo, S.StockMaster.ExpiryDate, S.StockMaster.MRP, S.StockMaster.CostPrice } into SGrouped
                                                 orderby SGrouped.Key.ExpiryDate
                                                 select new AvailableStockDto
                                                 {
                                                     BatchNo = SGrouped.Key.BatchNo,
                                                     ExpiryDate = SGrouped.Key.ExpiryDate,
                                                     MRP = SGrouped.Key.MRP,
                                                     CostPrice = SGrouped.Key.CostPrice,
                                                     AvailableQuantity = SGrouped.Sum(s => s.AvailableQuantity)
                                                 }).ToListAsync();
                //if no stock found, then dispatch should not be allowed, set the flag here and disable in client side.
                if (item.AvailableStockList?.Count() == 0) item.IsDispatchForbidden = true;
                //pre-fill the dispatch items with first-expriy-first-out logic
                var totalRequiredQuantity = item.PendingQuantity;
                foreach (var stock in item.AvailableStockList)
                {
                    var dispatchItem = new DispatchItemDto()
                    {
                        BatchNo = stock.BatchNo,
                        ExpiryDate = stock.ExpiryDate,
                        MRP = stock.MRP,
                        CostPrice = stock.CostPrice
                    };
                    if (stock.AvailableQuantity < totalRequiredQuantity)
                    {
                        dispatchItem.AvailableQuantity = stock.AvailableQuantity;
                        dispatchItem.DispatchedQuantity = stock.AvailableQuantity;
                        totalRequiredQuantity -= stock.AvailableQuantity;
                        item.DispatchedItems.Add(dispatchItem);
                    }
                    else
                    {
                        dispatchItem.AvailableQuantity = stock.AvailableQuantity;
                        dispatchItem.DispatchedQuantity = totalRequiredQuantity ?? 0;
                        item.DispatchedItems.Add(dispatchItem);
                        item.IsDispatchingNow = true;
                        break;
                    }
                }
            }
            return new GetRequisitionDetailsForDispatchViewModel() { Requisition = requisition };
        }
    }
    #endregion

    #region DTOs
    public class RequisitionDto
    {
        public int RequisitionId { get; set; }
        public int RequisitionNo { get; set; }
        public int RequestingDispensaryId { get; internal set; }
        public string RequestingDispensaryName { get; set; }
        public List<RequisitionItemDto> RequisitionItems { get; set; }
    }

    public class RequisitionItemDto
    {
        public int RequisitionItemId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public double? RequestedQuantity { get; set; }
        public double? PendingQuantity { get; set; }
        public string AllocatedStoreRackName { get; set; }
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
        public double DispatchedQuantity { get; set; }
    }
    public class UniqueStockIdentifier
    {
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public decimal? MRP { get; set; }
        public decimal? CostPrice { get; set; }
        public double AvailableQuantity { get; set; }
    }
    #endregion
}
