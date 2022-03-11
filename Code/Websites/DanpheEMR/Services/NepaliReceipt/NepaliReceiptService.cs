using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using System.Data.Entity;

namespace DanpheEMR.Services
{
    public class NepaliReceiptService : INepaliReceiptService
    {
        private InventoryDbContext inventoryDb;
        private PharmacyDbContext pharmacyDb;
        private WardSupplyDbContext wardDbContext;
        private readonly string connString = null;
        public NepaliReceiptService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            inventoryDb = new InventoryDbContext(connString);
            pharmacyDb = new PharmacyDbContext(connString);
            wardDbContext = new WardSupplyDbContext(connString);
        }
        #region Methods
        public async Task<DonationGRVm> GetDonationGRView(int GoodsReceiptId)
        {
            var donation = await (from GR in inventoryDb.GoodsReceipts
                                  where GR.GoodsReceiptID == GoodsReceiptId
                                  select new DonationGRDto
                                  {
                                      DonationDate = GR.GoodsArrivalDate,
                                      DonationFormNo = GR.BillNo
                                  }).FirstOrDefaultAsync();
            var donationItemGrouped = inventoryDb.GoodsReceiptItems.Where(GRI => GRI.GoodsReceiptId == GoodsReceiptId).GroupBy(a => a.ItemId).Select(a => a.OrderBy(b => b.ItemId).FirstOrDefault());
            donation.DonationItems = await (from GRI in donationItemGrouped
                                            join UOM in inventoryDb.UnitOfMeasurementMaster on GRI.Item.UnitOfMeasurementId equals UOM.UOMId
                                            select new DonationGRItemDto
                                            {
                                                ItemName = GRI.Item.ItemName,
                                                Specification = GRI.GRItemSpecification,
                                                Code = GRI.Item.Code,
                                                BatchNo = GRI.BatchNO,
                                                UOMName = UOM.UOMName,
                                                Quantity = GRI.ReceivedQuantity + GRI.RejectedQuantity,
                                                Rate = GRI.ItemRate,
                                                TotalAmount = GRI.TotalAmount,
                                                Remarks = GRI.Remarks
                                            }).ToListAsync();
            var result = new DonationGRVm() { DonationGR = donation };
            return result;
        }
        public NepaliRequisitionVm GetNepaliRequisitionView(int RequisitionId, string ModuleType)
        {

            switch (ModuleType)
            {
                case "inventory-substore":
                    {

                        var requisition = (from R in inventoryDb.Requisitions.Where(R => R.RequisitionId == RequisitionId)
                                           from C in inventoryDb.Employees.Where(E => E.EmployeeId == R.CreatedBy)
                                           select new NepaliRequisitionDto
                                           {
                                               RequisitionId = R.RequisitionId,
                                               RequisitionNo = R.RequisitionNo,
                                               RequisitionDate = R.RequisitionDate,
                                               RequestedByName = C.FullName,
                                               //TODO: Sanjit: Fix this code as it will always bring later fiscal year only
                                               FiscalYear = (from fy in inventoryDb.FiscalYears.OrderByDescending(a => a.FiscalYearName) select fy.FiscalYearName).FirstOrDefault(),
                                               RequestingRemarks = R.Remarks,
                                           }).FirstOrDefault();

                        requisition.RequisitionItems = (from RI in inventoryDb.RequisitionItems
                                                        join I in inventoryDb.Items on RI.ItemId equals I.ItemId
                                                        join UOM in inventoryDb.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals UOM.UOMId
                                                        where RI.RequisitionId == RequisitionId
                                                        select new NepaliRequisitionItemDto
                                                        {
                                                            RequisitionItemId = RI.RequisitionItemId,
                                                            ItemId = RI.ItemId,
                                                            ItemName = I.ItemName,
                                                            Quantity = RI.Quantity,
                                                            Remarks = RI.Remark,
                                                            UOMName = UOM.UOMName
                                                        }).ToList();
                        return new NepaliRequisitionVm() { requisition = requisition };
                    }
                case "fixedasset-substore":
                    {
                        var requisition = (from R in wardDbContext.WARDSupplyAssetRequisitionModels.Where(R => R.RequisitionId == RequisitionId)
                                           from C in wardDbContext.Employees.Where(E => E.EmployeeId == R.CreatedBy)
                                           select new NepaliRequisitionDto
                                           {
                                               RequisitionId = R.RequisitionId,
                                               RequisitionNo = R.RequisitionNo,
                                               RequisitionDate = R.RequisitionDate,
                                               RequestedByName = C.FullName,
                                               FiscalYear = (from fy in wardDbContext.InvFiscalYears.OrderByDescending(a => a.FiscalYearName) select fy.NpFiscalYearName).FirstOrDefault(),
                                               RequestingRemarks = ""
                                           }).FirstOrDefault();

                        requisition.RequisitionItems = (from RI in wardDbContext.WARDSupplyAssetRequisitionItemsModels
                                                        join I in wardDbContext.INVItemMaster on RI.ItemId equals I.ItemId
                                                        join UOM in wardDbContext.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals UOM.UOMId
                                                        where RI.RequisitionId == RequisitionId
                                                        select new NepaliRequisitionItemDto
                                                        {
                                                            RequisitionItemId = RI.RequisitionItemId,
                                                            ItemName = I.ItemName,
                                                            Remarks = RI.Remark,
                                                            ItemId = RI.ItemId,
                                                            Quantity = RI.Quantity,
                                                            UOMName = UOM.UOMName
                                                        }).ToList();

                        return new NepaliRequisitionVm { requisition = requisition };
                    }
                case "pharmacy-dispensary":
                    {
                        var requisition = (from R in pharmacyDb.StoreRequisition.Where(R => R.RequisitionId == RequisitionId)
                                           from C in pharmacyDb.Employees.Where(E => E.EmployeeId == R.CreatedBy)
                                           from DI in pharmacyDb.StoreDispatchItems.Where(D => D.RequisitionId == R.RequisitionId).DefaultIfEmpty()
                                           from DIEmployee in pharmacyDb.Employees.Where(E => E.EmployeeId == DI.CreatedBy).DefaultIfEmpty()
                                           from S in pharmacyDb.PHRMStore.Where(A => A.StoreId == R.StoreId).DefaultIfEmpty()
                                           select new NepaliRequisitionDto
                                           {
                                               RequisitionId = R.RequisitionId,
                                               RequisitionNo = R.RequisitionNo,
                                               RequisitionDate = R.RequisitionDate,
                                               RequestedByName = C.FullName,
                                               FiscalYear = (from fy in pharmacyDb.PharmacyFiscalYears.OrderByDescending(a => a.FiscalYearName) select fy.NpFiscalYearName).FirstOrDefault(),
                                               RequestingRemarks = "",

                                           }).FirstOrDefault();

                        requisition.RequisitionItems = (from RI in pharmacyDb.StoreRequisitionItems
                                                        join I in pharmacyDb.PHRMItemMaster on RI.ItemId equals I.ItemId
                                                        join G in pharmacyDb.PHRMGenericModel on I.GenericId equals G.GenericId
                                                        join UOM in pharmacyDb.PHRMUnitOfMeasurement on I.UOMId equals UOM.UOMId
                                                        where RI.RequisitionId == RequisitionId
                                                        select new NepaliRequisitionItemDto
                                                        {
                                                            RequisitionItemId = RI.RequisitionItemId,
                                                            ItemName = G.GenericName + " (" + I.ItemName + ")",
                                                            Remarks = RI.Remark,
                                                            ItemId = RI.ItemId,
                                                            Quantity = RI.Quantity,
                                                            UOMName = UOM.UOMName
                                                        }).ToList();

                        return new NepaliRequisitionVm { requisition = requisition };
                    }
                default:
                    break;
            }
            return new NepaliRequisitionVm();
        }
        public NepaliDispatchVm GetNepaliDispatchView(int DispatchId, string ModuleType)
        {
            switch (ModuleType)
            {
                case "pharmacy-dispensary":
                    {
                        var DispatchDetail = (from D in pharmacyDb.StoreDispatchItems
                                              join E in pharmacyDb.Employees on D.CreatedBy equals E.EmployeeId
                                              join I in pharmacyDb.PHRMItemMaster on D.ItemId equals I.ItemId
                                              join U in pharmacyDb.PHRMUnitOfMeasurement on I.UOMId equals U.UOMId
                                              //TODO: Add fiscal year id in the dispatch table and requisition table, later on.
                                              from FY in pharmacyDb.PharmacyFiscalYears.Where(fy => D.CreatedOn >= fy.StartDate && D.CreatedOn <= fy.EndDate)
                                              where D.DispatchId == DispatchId
                                              group new { D, E, FY, I, U } by D.DispatchId into DGrouped
                                              select new NepaliDispatchDTO
                                              {
                                                  DispatchId = DGrouped.FirstOrDefault().D.DispatchId,
                                                  RequisitionId = DGrouped.FirstOrDefault().D.RequisitionId,
                                                  DispatchedDate = DGrouped.FirstOrDefault().D.DispatchedDate,
                                                  FiscalYear = DGrouped.FirstOrDefault().FY.FiscalYearName,
                                                  DispatchItems = DGrouped.Select(DI => new NepaliDispatchItemDTO
                                                  {
                                                      DispatchItemId = DI.D.DispatchItemsId,
                                                      ItemId = DI.D.ItemId,
                                                      ItemName = DI.I.ItemName,
                                                      UOMName = DI.U.UOMName,
                                                      Quantity = DI.D.DispatchedQuantity,
                                                      Price = DI.D.CostPrice,
                                                      BatchNo = DI.D.BatchNo,
                                                      Remark = DI.D.Remarks,
                                                  }).ToList()
                                              }).FirstOrDefault();
                        return new NepaliDispatchVm { DispatchDetail = DispatchDetail };
                    }
                //case "inventory-substore":
              //      {
                        ///sud:20Sep'21--Corrected the LINQ query below which gives Dispatch Details..
                        ///Takin Quantity from StockTransaction Table.
                    //    var dispatchTxn = Enums.ENUM_INV_StockTransactionType.DispatchedItem;
                    //    var DispatchDetail = (from D in inventoryDb.DispatchItems
                    //                          join E in inventoryDb.Employees on D.CreatedBy equals E.EmployeeId
                    //                          from FY in inventoryDb.InventoryFiscalYears.Where(fy => D.CreatedOn >= fy.StartDate && D.CreatedOn <= fy.EndDate)

                    //                          where D.DispatchId == DispatchId
                    //                          select new NepaliDispatchDTO
                    //                          {
                    //                              ////TODO: Add fiscal year id in the dispatch table and requisition table, later on.
                    //                              DispatchId = D.DispatchId,
                    //                              RequisitionId = D.RequisitionId,
                    //                              DispatchedDate = D.DispatchedDate,
                    //                              FiscalYear = FY.FiscalYearName,
                    //                              DispatchItems =
                    //                                 (from ST in inventoryDb.StockTransactions.Where(x => D.DispatchItemsId == x.ReferenceNo && x.TransactionType == dispatchTxn)
                    //                                  join I in inventoryDb.Items on D.ItemId equals I.ItemId
                    //                                  join U in inventoryDb.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals U.UOMId
                    //                                  select new NepaliDispatchItemDTO()
                    //                                  {
                    //                                      DispatchItemId = D.DispatchItemsId,
                    //                                      ItemId = D.ItemId,
                    //                                      ItemName = I.ItemName,
                    //                                      RegisterPageNo = I.RegisterPageNumber,//sud:19Sep'21--Need to show this (in Nepali format)--Jinsi Khaata Paana No. 
                    //                                      UOMName = U.UOMName,
                    //                                      Quantity = ST.OutQty,
                    //                                      Price = ST.CostPrice,
                    //                                      BatchNo = ST.BatchNo,
                    //                                      Remark = D.ItemRemarks
                    //                                  }).ToList()

                    //                          }).FirstOrDefault();
                    //    return new NepaliDispatchVm { DispatchDetail = DispatchDetail };

                    //}

                case "inventory-substore":///Sud:20Sep'21--Issue in below when 2 different stocks are sent against single Dispatc.
                    {
                        var dispatchTxn = Enums.ENUM_INV_StockTransactionType.DispatchedItem;
                        var DispatchDetail = (from D in inventoryDb.DispatchItems
                                              join E in inventoryDb.Employees on D.CreatedBy equals E.EmployeeId
                                              join I in inventoryDb.Items on D.ItemId equals I.ItemId
                                              join U in inventoryDb.UnitOfMeasurementMaster on I.UnitOfMeasurementId equals U.UOMId
                                              from ST in inventoryDb.StockTransactions.Where(x => D.DispatchItemsId == x.ReferenceNo && x.TransactionType == dispatchTxn)
                                                  //TODO: Add fiscal year id in the dispatch table and requisition table, later on.
                                              from FY in inventoryDb.InventoryFiscalYears.Where(fy => D.CreatedOn >= fy.StartDate && D.CreatedOn <= fy.EndDate)

                                              where D.DispatchId == DispatchId
                                              group new { D, E, FY, I, U, ST } by D.DispatchId into DGrouped
                                              select new NepaliDispatchDTO
                                              {
                                                  DispatchId = DGrouped.FirstOrDefault().D.DispatchId,
                                                  RequisitionId = DGrouped.FirstOrDefault().D.RequisitionId,
                                                  DispatchedDate = DGrouped.FirstOrDefault().D.DispatchedDate,
                                                  FiscalYear = DGrouped.FirstOrDefault().FY.FiscalYearName,
                                                  DispatchItems = DGrouped.Select(DI => new NepaliDispatchItemDTO
                                                  {
                                                      DispatchItemId = DI.D.DispatchItemsId,
                                                      ItemId = DI.D.ItemId,
                                                      ItemName = DI.I.ItemName,
                                                      RegisterPageNo = DI.I.RegisterPageNumber,//sud:19Sep'21--Need to show this (in Nepali format)--Jinsi Khaata Paana No. 
                                                      UOMName = DI.U.UOMName,
                                                      Quantity = DI.ST.OutQty,
                                                      Price = DI.ST.CostPrice,
                                                      BatchNo = DI.ST.BatchNo,
                                                      Remark = DI.D.ItemRemarks
                                                  }).ToList()
                                              }).FirstOrDefault();
                        return new NepaliDispatchVm { DispatchDetail = DispatchDetail };
                    }


                default:
                    break;


            }
            return new NepaliDispatchVm();
        }

        #endregion

    }



    #region ViewModels, Dtos
    public class DonationGRVm
    {
        public DonationGRDto DonationGR { get; set; }
    }

    public class DonationGRDto
    {
        public DateTime? DonationDate { get; set; }
        public string DonationFormNo { get; set; }
        public List<DonationGRItemDto> DonationItems { get; set; }
        public DonationGRDto()
        {
            DonationItems = new List<DonationGRItemDto>();
        }
    }

    public class DonationGRItemDto
    {
        public string ItemName { get; set; }
        public string Specification { get; set; }
        public string Code { get; set; }
        public string BatchNo { get; set; }
        public string UOMName { get; set; }
        public double Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
    }
    public class NepaliRequisitionVm
    {
        public NepaliRequisitionDto requisition { get; set; }
    }
    public class NepaliRequisitionDto
    {
        public int RequisitionId { get; set; }
        public int? RequisitionNo { get; set; }
        public DateTime? RequisitionDate { get; set; }
        public string RequestedByName { get; set; }
        public string RequestingRemarks { get; set; }
        public string FiscalYear { get; set; }
        public IList<NepaliRequisitionItemDto> RequisitionItems { get; set; }
        public NepaliRequisitionDto()
        {
            RequisitionItems = new List<NepaliRequisitionItemDto>();
        }
    }
    public class NepaliRequisitionItemDto
    {
        public int RequisitionItemId { get; set; }
        public int? ItemId { get; set; }
        public string ItemName { get; set; }
        public string UOMName { get; set; }
        public double? Quantity { get; set; }
        public string Remarks { get; set; }
    }
    public class NepaliDispatchVm
    {
        public NepaliDispatchDTO DispatchDetail { get; set; }
    }
    public class NepaliDispatchDTO
    {
        public int? DispatchId { get; set; }

        public int? RequisitionId { get; set; }

        public DateTime? DispatchedDate { get; set; }

        public string Remark { get; set; }

        public string FiscalYear { get; set; }
        public ICollection<NepaliDispatchItemDTO> DispatchItems { get; set; }

        public NepaliDispatchDTO()
        {
            DispatchItems = new List<NepaliDispatchItemDTO>();
        }
    }
    public class NepaliDispatchItemDTO
    {
        public int? DispatchId { get; set; }

        public int? RequisitionId { get; set; }
        public int DispatchItemId { get; set; }

        public int ItemId { get; set; }

        public string ItemName { get; set; }
        public DateTime? DispatchedDate { get; set; }

        public string BatchNo { get; set; }
        public string UOMName { get; set; }

        public double Quantity { get; set; }

        public decimal? MRP { get; set; }

        public decimal? Price { get; set; }

        public decimal SubTotal { get; set; }

        public string Remark { get; set; }

        public int? RegisterPageNo { get; set; }//sud:19Sep'21--for Jinsi Khaata Paana Number (Ma.Le.Pa)

    }
    #endregion
}
