using DanpheEMR.Controllers.Dispensary;
using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services
{
    public class CssdItemService : ICssdItemService
    {
        #region Fields
        private readonly string connString;
        private InventoryDbContext db;
        #endregion

        #region CTOR
        public CssdItemService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);
        }
        #endregion

        #region Methods
        public async Task<CssdItemTransactionModel> AddCssdItemTransaction(CssdItemTransactionModel cssdItemTransaction)
        {
            db.CssdItemTransactions.Add(cssdItemTransaction);
            await db.SaveChangesAsync();
            return cssdItemTransaction;
        }

        public async Task<int> DisinfectCSSDItem(int CssdTxnId, string DisinfectantName, string DisinfectionRemarks, RbacUser currentUser)
        {
            var cssdTxnItem = await db.CssdItemTransactions.FindAsync(CssdTxnId);
            cssdTxnItem.CssdStatus = Enums.ENUM_CssdStatus.Finalized;
            cssdTxnItem.DisinfectantName = DisinfectantName;
            cssdTxnItem.DisinfectedBy = currentUser.EmployeeId;
            cssdTxnItem.DisinfectedOn = DateTime.Now;
            cssdTxnItem.DisinfectionRemarks = DisinfectionRemarks;
            await db.SaveChangesAsync();
            return CssdTxnId;
        }

        public async Task<int> DispatchCSSDItem(int CssdTxnId, string DispatchRemarks, RbacUser currentUser)
        {
            using (var dbResource = db.Database.BeginTransaction())
            {
                try
                {
                    //Find the cssd txn row in the database
                    var cssdTxnItem = await db.CssdItemTransactions.FindAsync(CssdTxnId);

                    //Update the status to complete
                    cssdTxnItem.CssdStatus = Enums.ENUM_CssdStatus.Complete;
                    cssdTxnItem.DispatchedBy = currentUser.EmployeeId;
                    cssdTxnItem.DispatchedOn = DateTime.Now;
                    cssdTxnItem.DispatchRemarks = DispatchRemarks;

                    //Find the stock in fixed asset stock table
                    var assetEntity = await db.FixedAssetStock.FindAsync(cssdTxnItem.FixedAssetStockId);

                    //update the cssd status to complete
                    assetEntity.CssdStatus = Enums.ENUM_CssdStatus.Complete;
                    //save in db
                    await db.SaveChangesAsync();
                    //commit the transaction
                    dbResource.Commit();
                    return cssdTxnItem.CssdTxnId;
                }
                catch (Exception)
                {
                    dbResource.Rollback();
                    throw;
                }
            }
        }

        public async Task<IList<FinalizedItemDto>> GetAllFinalizedCSSDTransactions(DateTime FromDate, DateTime ToDate)
        {
            var tomorrowDate = ToDate.AddDays(1);
            var cssdFinalizedStatus = Enums.ENUM_CssdStatus.Finalized;
            var allFinalizedCssdTransactions = await (from cssdTxn in db.CssdItemTransactions
                                                      join item in db.Items on cssdTxn.ItemId equals item.ItemId
                                                      join asset in db.FixedAssetStock on cssdTxn.FixedAssetStockId equals asset.FixedAssetStockId
                                                      join store in db.StoreMasters on cssdTxn.StoreId equals store.StoreId
                                                      join requestingEmp in db.Employees on cssdTxn.RequestedBy equals requestingEmp.EmployeeId
                                                      join disinfectionEmp in db.Employees on cssdTxn.DisinfectedBy equals disinfectionEmp.EmployeeId into disinfectEmps
                                                      from disinfectionEmpLJ in disinfectEmps.DefaultIfEmpty()
                                                      where FromDate <= cssdTxn.RequestedOn && cssdTxn.RequestedOn < tomorrowDate && cssdTxn.CssdStatus == cssdFinalizedStatus
                                                      select new FinalizedItemDto
                                                      {
                                                          CssdTxnId = cssdTxn.CssdTxnId,
                                                          ItemName = item.ItemName,
                                                          ItemCode = item.Code,
                                                          TagNumber = asset.BarCodeNumber,
                                                          RequestedFrom = store.Name,
                                                          RequestedBy = requestingEmp.FullName,
                                                          RequestDate = cssdTxn.RequestedOn,
                                                          Disinfectant = cssdTxn.DisinfectantName,
                                                          DisinfectedDate = cssdTxn.DisinfectedOn,
                                                          DisinfectedBy = (disinfectionEmpLJ == null) ? "" : disinfectionEmpLJ.FullName
                                                      }).OrderByDescending(a => a.RequestDate).ToListAsync();
            return allFinalizedCssdTransactions;
        }

        public async Task<IList<PendingItemsDto>> GetAllPendingCSSDTransactions(DateTime FromDate, DateTime ToDate)
        {
            var tomorrowDate = ToDate.AddDays(1);
            var cssdPendingStatus = Enums.ENUM_CssdStatus.Pending;
            var allPendingCssdTransactions = await (from cssdTxn in db.CssdItemTransactions
                                                    join item in db.Items on cssdTxn.ItemId equals item.ItemId
                                                    join asset in db.FixedAssetStock on cssdTxn.FixedAssetStockId equals asset.FixedAssetStockId
                                                    join store in db.StoreMasters on cssdTxn.StoreId equals store.StoreId
                                                    join requestingEmp in db.Employees on cssdTxn.RequestedBy equals requestingEmp.EmployeeId
                                                    where FromDate <= cssdTxn.RequestedOn && cssdTxn.RequestedOn < tomorrowDate && cssdTxn.CssdStatus == cssdPendingStatus
                                                    select new PendingItemsDto
                                                    {
                                                        CssdTxnId = cssdTxn.CssdTxnId,
                                                        RequestDate = cssdTxn.RequestedOn,
                                                        ItemName = item.ItemName,
                                                        ItemCode = item.Code,
                                                        TagNumber = asset.BarCodeNumber,
                                                        RequestedFrom = store.Name,
                                                        RequestedBy = requestingEmp.FullName
                                                    }).OrderByDescending(a => a.RequestDate).ToListAsync();
            return allPendingCssdTransactions;
        }
        #endregion
    }

    #region ViewModel, Dto

    public class PendingItemsDto
    {
        public int CssdTxnId { get; set; }
        public DateTime RequestDate { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string TagNumber { get; set; }
        public string RequestedFrom { get; set; }
        public string RequestedBy { get; set; }
    }
    public class FinalizedItemDto
    {
        public int CssdTxnId { get; set; }
        public DateTime RequestDate { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string TagNumber { get; set; }
        public string RequestedFrom { get; set; }
        public string RequestedBy { get; set; }
        public string Disinfectant { get; set; }
        public DateTime? DisinfectedDate { get; set; }
        public string DisinfectedBy { get; set; }
    }
    #endregion
}
