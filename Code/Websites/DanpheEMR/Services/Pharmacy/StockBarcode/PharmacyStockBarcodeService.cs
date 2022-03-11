using System;
using DanpheEMR.DalLayer;
using DanpheEMR.Core.Configuration;
using Microsoft.Extensions.Options;
using System.Linq;
using DanpheEMR.Security;
using DanpheEMR.ServerModel;

namespace DanpheEMR.Services
{
    public class PharmacyStockBarcodeService
    {
        #region DECLARATIONS
        private PharmacyDbContext db;
        private readonly string connString = null;
        #endregion

        #region CTOR
        public PharmacyStockBarcodeService(IOptions<MyConfiguration> _config)
        {
            connString = _config.Value.Connectionstring;
            db = new PharmacyDbContext(connString);
        }
        public PharmacyStockBarcodeService(PharmacyDbContext pharmacyDb)
        {
            db = pharmacyDb;
        }
        #endregion

        #region METHODS, APIs
        /// <summary>
        /// Check if barcode is already available for the stock
        /// If yes, then return the already existing barcode id
        /// If no, then add new barcode and return the barcode id.
        /// </summary>
        /// <returns>the barcode id of the stock with provided itemId, batchNo, expiryDate, mrp</returns>
        public int AddStockBarcode(PHRMStockMaster stock, int createdBy)
        {
            if (stock.ItemId == null)
            {
                throw new InvalidOperationException($"Cannot add barcode for ItemId {stock.ItemId} and BatchNo {stock.BatchNo}");
            }
            // Check if barcode is already available for the stock
            var stockBarcodeEntity = db.StockBarcodes.Where(b => b.ItemId == stock.ItemId && b.BatchNo == stock.BatchNo && b.ExpiryDate == stock.ExpiryDate && b.MRP == stock.MRP).FirstOrDefault();
            // If no, add new barcode and return the barcode id.
            if (stockBarcodeEntity == null)
            {
                // find the max barcode id from the table
                var maxBarcodeId = db.StockBarcodes.Select(b => b.BarcodeId).DefaultIfEmpty(1000000).Max();

                stockBarcodeEntity = new PHRMStockBarcode(
                    barcodeId: ++maxBarcodeId,
                    itemId: stock.ItemId.Value,
                    batchNo: stock.BatchNo,
                    expiryDate: stock.ExpiryDate,
                    mrp: stock.MRP,
                    createdBy: createdBy,
                    createdOn: DateTime.Now
                    );
                db.Entry(stockBarcodeEntity).State = System.Data.Entity.EntityState.Added;
                db.SaveChanges();
            }
            // return the barcode id
            return stockBarcodeEntity.BarcodeId;
        }
        #endregion
    }
}
