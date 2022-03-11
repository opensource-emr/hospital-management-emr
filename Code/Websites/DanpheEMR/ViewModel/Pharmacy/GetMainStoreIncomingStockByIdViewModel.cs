using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    #region Output ViewModel
    public class GetMainStoreIncomingStockByIdViewModel
    {
        public IncomingStockDTO IncomingStockDetail { get; set; }
    }
    #endregion

    #region Method
    public static class GetMainStoreIncomingStockByIdFunc
    {
        public static async Task<GetMainStoreIncomingStockByIdViewModel> GetMainStoreIncomingStockById(this PharmacyDbContext db, int DispatchId)
        {
            var dispatchDetail = await (from D in db.StoreDispatchItems
                                        join I in db.PHRMItemMaster on D.ItemId equals I.ItemId
                                        join Gen in db.PHRMGenericModel on I.GenericId equals Gen.GenericId into Gens
                                        from GenLJ in Gens.DefaultIfEmpty()
                                        join S in db.PHRMStore on D.SourceStoreId equals S.StoreId
                                        join RE in db.Employees on D.ReceivedById equals RE.EmployeeId into REJ
                                        from RELJ in REJ.DefaultIfEmpty()
                                        where D.DispatchId == DispatchId
                                        group new { D, I, S, RELJ , GenLJ} by D.DispatchId into DGrouped
                                        select new IncomingStockDTO
                                        {
                                            DispatchId = DGrouped.Key,
                                            ReceivedBy = DGrouped.FirstOrDefault().RELJ.FullName,
                                            ReceivedOn = DGrouped.FirstOrDefault().D.ReceivedOn,
                                            ReceivedRemarks = DGrouped.FirstOrDefault().D.ReceivedRemarks,
                                            TransferredRemarks = DGrouped.FirstOrDefault().D.Remarks,
                                            RequestedFromStore = DGrouped.FirstOrDefault().S.Name,
                                            DispatchItems = DGrouped.Select(d => new IncomingStockItemDto
                                            {
                                                DispatchItemsId = d.D.DispatchItemsId,
                                                ItemId = d.D.ItemId,
                                                ItemName = d.I.ItemName,
                                                GenericName = d.GenLJ.GenericName ?? "N/A",
                                                BatchNo = d.D.BatchNo,
                                                ExpiryDate = d.D.ExpiryDate,
                                                CostPrice = d.D.CostPrice,
                                                DispatchedQuantity = d.D.DispatchedQuantity,
                                                ItemRemarks = d.D.ItemRemarks
                                            })
                                        }).FirstOrDefaultAsync();
            return new GetMainStoreIncomingStockByIdViewModel() { IncomingStockDetail = dispatchDetail };
        }
    } 
    #endregion

    #region DTOs
    public class IncomingStockDTO
    {
        public int? DispatchId { get; set; }
        public string ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        public string RequestedFromStore { get; set; }
        public string TransferredRemarks { get; set; }
        public IEnumerable<IncomingStockItemDto> DispatchItems { get; set; }
    }

    public class IncomingStockItemDto
    {
        public int DispatchItemsId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double DispatchedQuantity { get; set; }
        public decimal CostPrice { get; set; }
        public string ItemRemarks { get; set; }
        public string GenericName { get; set; }
    } 
    #endregion
}
