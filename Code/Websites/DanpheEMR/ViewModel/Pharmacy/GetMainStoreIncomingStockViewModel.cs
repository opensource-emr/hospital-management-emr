using DanpheEMR.DalLayer;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class GetMainStoreIncomingStockViewModel
    {
        public IList<GetMainStoreIncomingStockDto> incomingStockList { get; set; }
    }
    public static class GetMainStoreIncomingStockFunc
    {
        public static async Task<GetMainStoreIncomingStockViewModel> GetMainStoreIncomingStock(this PharmacyDbContext db , DateTime FromDate , DateTime ToDate)
        {
            var realToDate = ToDate.AddDays(1);
            var mainStoreCategory = Enums.ENUM_StoreCategory.Store;
            var mainStoreIds = db.PHRMStore.Where(s => s.Category == mainStoreCategory).Select(s => s.StoreId).ToList();

            var unconfirmedStock = await (from D in db.StoreDispatchItems
                                          join S in db.PHRMStore on D.SourceStoreId equals S.StoreId
                                          join E in db.Employees on D.CreatedBy equals E.EmployeeId
                                          join RE in db.Employees on D.ReceivedById equals RE.EmployeeId into REG
                                          from RELJ in REG.DefaultIfEmpty()
                                          where mainStoreIds.Contains(D.TargetStoreId)
                                          group new { D, S, E, RELJ } by new { D.DispatchId, D.DispatchedDate, E.FullName, D.ReceivedById } into DGrouped
                                          select new GetMainStoreIncomingStockDto
                                          {
                                              DispatchId = DGrouped.Key.DispatchId,
                                              DispatchedDate = DGrouped.Key.DispatchedDate,
                                              DispatchedBy = DGrouped.Key.FullName,
                                              ReceivedBy = (DGrouped.Key.ReceivedById == null) ? "Not Received" : DGrouped.FirstOrDefault().RELJ.FullName,
                                              ReceivedOn = DGrouped.FirstOrDefault().D.ReceivedOn,
                                              CanUserReceiveStock = DGrouped.FirstOrDefault().D.ReceivedById == null,
                                              Status = (DGrouped.FirstOrDefault().D.ReceivedById == null) ? "pending" : "received",
                                              TransferredFrom = DGrouped.FirstOrDefault().S.Name
                                          }).Where(s => s.DispatchedDate > FromDate && s.DispatchedDate < realToDate).OrderByDescending(s => s.DispatchId).ToListAsync();

            return new GetMainStoreIncomingStockViewModel { incomingStockList = unconfirmedStock };
        }
    }

    public class GetMainStoreIncomingStockDto
    {
        public int? DispatchId { get; set; }
        public DateTime? DispatchedDate { get; set; }
        public string DispatchedBy { get; set; }
        public string ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public bool CanUserReceiveStock { get; set; }
        public string Status { get; set; }
        public string TransferredFrom { get; set; }
    }
}