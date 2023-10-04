using DanpheEMR.Core.Configuration;
using DanpheEMR.DalLayer;
using DanpheEMR.Enums;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;
using DanpheEMR.ServerModel.InventoryModels;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace DanpheEMR.Services.Inventory.InventoryDonation
{
    public class DonationService : IDonationService
    {
        #region DECLARATIONS
        private InventoryDbContext db;
        private RbacDbContext _rbacDb;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public DonationService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new InventoryDbContext(connString);

        }
        #endregion
        public List<VendorMasterModel> GetVendorsThatReceiveDonation()
        {
            try
            {
                var query = db.Vendors.Where(x => x.ReceiveDonation == true).ToList();
                return query;
            }
            catch (Exception Ex)
            {
                throw Ex;
            }
        }
        public List<DonationVM> GetAllDonation(DateTime fromDate, DateTime toDate, int StoreId)
        {
            try
            {
                var donationDetails = (from donations in db.donations
                                       join vendors in db.Vendors on donations.VendorId equals vendors.VendorId
                                       join store in db.StoreMasters on donations.StoreId equals store.StoreId
                                       join emp in db.Employees on donations.CreatedBy equals emp.EmployeeId
                                       where store.StoreId == StoreId && donations.IsActive && DbFunctions.TruncateTime(donations.CreatedOn) >= DbFunctions.TruncateTime(fromDate) && DbFunctions.TruncateTime(donations.CreatedOn) <= DbFunctions.TruncateTime(toDate)
                                       select new DonationVM
                                       {
                                           DonationId = donations.DonationId,
                                           DonationNo = donations.DonationNo,
                                           VendorName = vendors.VendorName,
                                           VendorId = vendors.VendorId,
                                           StoreId = store.StoreId,
                                           StoreName = store.Name,
                                           DonatedDate = donations.CreatedOn,
                                           DonationReferenceNo = donations.DonationReferenceNo,
                                           DonationReferenceDate = donations.DonationReferenceDate,
                                           Username = emp.FullName,
                                           TotalAmount = donations.TotalAmount,
                                           Remarks = donations.Remarks

                                       }).OrderByDescending(x=>x.DonationNo).ToList();
                return donationDetails;
            }
            catch (Exception Ex)
            {
                throw Ex;

            }
        }
        public DonationDetailsVM GetDonationViewById(int DonationId)
        {
            try
            {
                var donationDetails = (from donations in db.donations
                                       join vendors in db.Vendors on donations.VendorId equals vendors.VendorId
                                       join store in db.StoreMasters on donations.StoreId equals store.StoreId
                                       join emp in db.Employees on donations.CreatedBy equals emp.EmployeeId
                                       where donations.DonationId == DonationId
                                       select new DonationVM
                                       {
                                           DonationId = donations.DonationId,
                                           DonationNo = donations.DonationNo,
                                           VendorName = vendors.VendorName,
                                           VendorId = vendors.VendorId,
                                           StoreId = store.StoreId,
                                           StoreName = store.Name,
                                           DonatedDate = donations.CreatedOn,
                                           DonationReferenceNo = donations.DonationReferenceNo,
                                           DonationReferenceDate = donations.DonationReferenceDate,
                                           Username = emp.FullName,
                                           TotalAmount = donations.TotalAmount,
                                           Remarks = donations.Remarks

                                       }).FirstOrDefault();
                var donationItemDetails = (from donationsItems in db.donationItems
                                           join items in db.Items on donationsItems.ItemId equals items.ItemId
                                           join uom in db.UnitOfMeasurementMaster on items.UnitOfMeasurementId equals uom.UOMId
                                           join gri in db.GoodsReceiptItems on donationsItems.StockId equals gri.StockId
                                           where donationsItems.DonationId == DonationId
                                           select new DonationItemsVM
                                           {
                                               DonationItemId = donationsItems.DonationItemId,
                                               CategoryName = donationsItems.CategoryName,
                                               ItemName = items.ItemName,
                                               Code = items.Code,
                                               BatchNo = gri.BatchNO,
                                               Specification = donationsItems.Specification,
                                               Unit = uom.UOMName,
                                               ModelNo = donationsItems.ModelNo,
                                               CostPrice = donationsItems.CostPrice,
                                               TotalAmount = donationsItems.TotalAmount,
                                               DonationQuantity = donationsItems.DonationQuantity,
                                               Remarks = donationsItems.Remarks,
                                               GRDate = donationsItems.GRDate

                                           }).ToList();
                var donationData = new DonationDetailsVM { donationDetails = donationDetails, donationItemDetails = donationItemDetails };
                return donationData;
            }
            catch (Exception Ex)
            {
                throw Ex;

            }
        }
        public DonationVM GetDonationById(int DonationId)
        {
            var donationDetails = (from donations in db.donations
                                   join vendors in db.Vendors on donations.VendorId equals vendors.VendorId
                                   join store in db.StoreMasters on donations.StoreId equals store.StoreId
                                   select new DonationVM
                                   {
                                       DonationId = donations.DonationId,
                                       DonationNo = donations.DonationNo,
                                       VendorName = vendors.VendorName,
                                       VendorId = vendors.VendorId,
                                       StoreId = store.StoreId,
                                       DonationReferenceDate = donations.DonationReferenceDate,
                                       DonationReferenceNo = donations.DonationReferenceNo,
                                       TotalAmount = donations.TotalAmount,
                                       Remarks = donations.Remarks,
                                       DonationItems = (from donationItems in db.donationItems
                                                        join items in db.Items on donationItems.ItemId equals items.ItemId
                                                        join uom in db.UnitOfMeasurementMaster on items.UnitOfMeasurementId equals uom.UOMId
                                                        where donationItems.DonationId == DonationId
                                                        select new DonationItemsVM
                                                        {
                                                            ItemId = donationItems.ItemId,
                                                            ItemName = items.ItemName,
                                                            CategoryName = donationItems.CategoryName,
                                                            TotalAmount = donationItems.TotalAmount,
                                                            CostPrice = donationItems.CostPrice,
                                                            ModelNo = donationItems.ModelNo,
                                                            Unit = uom.UOMName,
                                                            Specification = donationItems.Specification,
                                                            Remarks = donationItems.Remarks,
                                                            DonationQuantity = donationItems.DonationQuantity,
                                                            GRDate= donationItems.GRDate,
                                                        }).ToList()
                                   }).FirstOrDefault();
            return donationDetails;
        }


        public int SaveDonation(DonationModel donation)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;
                    donation.CreatedOn = DateTime.Now;
                    donation.FiscalYearId = currentFiscalYearId;
                    donation.DonationNo = GetDonationNo(db, currentFiscalYearId);
                    donation.IsActive = true;
                    donation.DonationItems.ForEach(item =>
                    {
                        item.CreatedBy = donation.CreatedBy;
                        item.CreatedOn = donation.CreatedOn;
                        item.IsActive = true;
                    });
                    db.donations.Add(donation);
                    db.SaveChanges();

                    donation.DonationItems.ForEach(item =>
                    {
                        var inventoryStockList = db.StoreStocks.Include("StockMaster").Where(s => s.StoreId == donation.StoreId &&
                                                                            s.ItemId == item.ItemId &&
                                                                            s.AvailableQuantity > 0 &&
                                                                            s.StockMaster.StockId == item.StockId &&
                                                                            s.IsActive)
                                                                    .ToList();
                        if (inventoryStockList == null) throw new Exception($"Stock is not available for Item = {item.ItemName}");
                        if (inventoryStockList.Sum(s => s.AvailableQuantity) < item.DonationQuantity) throw new Exception($"Stock is not available for ItemName = {item.ItemName}");
                        var totalRemainingQty = item.DonationQuantity;
                        foreach (var inventoryStock in inventoryStockList)
                        {
                            var inventoryStockTxn = new StockTransactionModel(
                                stock: inventoryStock,
                                transactionType: ENUM_PHRM_StockTransactionType.DonationItem,
                                transactionDate: donation.CreatedOn,
                                referenceNo: item.DonationItemId,
                                createdBy: donation.CreatedBy,
                                createdOn: currentDate,
                                fiscalYearId: currentFiscalYearId
                                );

                            if (inventoryStock.AvailableQuantity < totalRemainingQty)
                            {
                                totalRemainingQty -= inventoryStock.AvailableQuantity;
                                inventoryStockTxn.SetOutQuantity(outQty: inventoryStock.AvailableQuantity);
                                db.StockTransactions.Add(inventoryStockTxn);
                            }
                            else
                            {
                                inventoryStock.DecreaseStock(totalRemainingQty, ENUM_PHRM_StockTransactionType.DonationItem, inventoryStockTxn.CreatedOn, DateTime.Now, inventoryStockTxn.ReferenceNo, inventoryStockTxn.CreatedBy, inventoryStockTxn.FiscalYearId, false);
                                totalRemainingQty = 0;
                            }
                            db.SaveChanges();

                            if (totalRemainingQty == 0)
                            {
                                break;
                            }
                        }

                    });
                    dbTransaction.Commit();
                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
                return donation.DonationId;
            }
        }

        public int UpdateDonation(DonationModel donation, int DonationId, int currentUser)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var donationDetails = db.donations.Where(a => a.DonationId == DonationId).FirstOrDefault();
                    if (donationDetails == null) throw new Exception($"Donation  is not available");
                    donationDetails.ModifiedBy = currentUser;
                    donationDetails.ModifiedOn = DateTime.Now;
                    donationDetails.VendorId = donation.VendorId;
                    donationDetails.DonationNo = donation.DonationNo;
                    donationDetails.DonationReferenceDate = donation.DonationReferenceDate;
                    donationDetails.DonationReferenceNo = donation.DonationReferenceNo;
                    db.donations.Attach(donationDetails);
                    db.Entry(donationDetails).Property(x => x.ModifiedBy).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.ModifiedOn).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.VendorId).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.DonationNo).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.DonationReferenceDate).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.DonationReferenceNo).IsModified = true;
                    db.SaveChanges();
                    dbTransaction.Commit();

                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
                return donation.DonationId;
            }
        }
        public bool CancelDonation(int DonationId, int currentUser, string Remarks)
        {
            using (var dbTransaction = db.Database.BeginTransaction())
            {
                try
                {
                    var donationDetails = db.donations.Include("Donationitems").Where(a => a.DonationId == DonationId).FirstOrDefault();
                    donationDetails.IsActive = false;
                    donationDetails.Remarks = Remarks;
                    donationDetails.DonationItems.ForEach(item =>
                    {
                        item.IsActive = false;
                    });
                    db.donations.Attach(donationDetails);
                    db.Entry(donationDetails).Property(x => x.IsActive).IsModified = true;
                    db.Entry(donationDetails).Property(x => x.Remarks).IsModified = true;

                    donationDetails.DonationItems.ForEach(item =>
                    {
                        db.Entry(item).Property(x => x.IsActive).IsModified = true;
                    });

                    var currentDate = DateTime.Now;
                    var currentFiscalYearId = GetFiscalYear(db).FiscalYearId;

                    donationDetails.DonationItems.ForEach(item =>
                    {
                        var inventoryStockList = db.StoreStocks.Include("StockMaster").Where(s => s.StoreId == donationDetails.StoreId &&
                                                                            s.ItemId == item.ItemId &&
                                                                            s.StockMaster.StockId == item.StockId &&
                                                                            s.IsActive)
                                                                    .ToList();
                        var totalRemainingQty = item.DonationQuantity;
                        foreach (var inventoryStock in inventoryStockList)
                        {
                            inventoryStock.AddStock(totalRemainingQty, ENUM_PHRM_StockTransactionType.CancelDonationItem, DateTime.Now, DateTime.Now, donationDetails.DonationNo, donationDetails.CreatedBy, donationDetails.FiscalYearId, false);
                            db.SaveChanges();

                            if (totalRemainingQty == 0)
                            {
                                break;
                            }
                        }

                    });
                    dbTransaction.Commit();
                }
                catch (Exception Ex)
                {
                    dbTransaction.Rollback();
                    throw Ex;
                }
                return true;
            }
        }


        public static InventoryFiscalYear GetFiscalYear(InventoryDbContext db)
        {
            DateTime currentDate = DateTime.Now.Date;
            return db.InventoryFiscalYears.Where(fsc => fsc.StartDate <= currentDate && fsc.EndDate >= currentDate).FirstOrDefault();
        }
        public static int GetDonationNo(InventoryDbContext db, int fiscalYearId)
        {
            int donationNo = (from donations in db.donations
                              where donations.FiscalYearId == fiscalYearId
                              select donations.DonationNo).DefaultIfEmpty(0).Max();

            return donationNo + 1;
        }

    }
}
