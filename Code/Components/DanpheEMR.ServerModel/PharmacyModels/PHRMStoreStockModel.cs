using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMStoreStockModel
    {
        [Key]
        public int? StoreStockId { get; set; }
        public int StoreId { get; private set; }
        public int StockId { get; private set; }
        public int ItemId { get; private set; }
        public double AvailableQuantity { get; private set; }
        public double UnConfirmedQty_In { get; private set; }
        public double UnConfirmedQty_Out { get; private set; }
        public bool IsActive { get; private set; }
        public PHRMStockMaster StockMaster { get; set; }
        public PHRMStoreStockModel() { } // required for LINQ operations
        private PHRMStoreStockModel(int? stockId, int storeId, int? itemId, double? quantity)
        {
            // if-guards
            if (quantity == null) throw new InvalidOperationException("Cannot insert null value in Quantity field for StoreStock.");

            StockId = stockId.Value;
            StoreId = storeId;
            ItemId = itemId.Value;
            AvailableQuantity = quantity.Value;
            IsActive = true;
        }
        public PHRMStoreStockModel(PHRMStockMaster stockMaster, int storeId, double? quantity) : this(stockMaster.StockId, storeId, stockMaster.ItemId, quantity)
        {
            // if-guards
            if (stockMaster.StockId == null || stockMaster.ItemId == null) throw new InvalidOperationException("Cannot insert null value in StockId or ItemId field for StoreStock.");
            StockMaster = stockMaster;
        }

        public void UpdateAvailableQuantity(double newQty)
        {
            AvailableQuantity = newQty;
        }
        public void IncreaseUnconfirmedQty(double inQty, double outQty)
        {
            if (inQty < 0 || outQty < 0) throw new InvalidOperationException("Can not insert negative value");
            UnConfirmedQty_In += inQty;
            UnConfirmedQty_Out += outQty;
        }
        public void DecreaseUnconfirmedQty(double inQty, double outQty)
        {
            if (inQty < 0 || outQty < 0) throw new InvalidOperationException("Can not insert negative value");
            UnConfirmedQty_In -= inQty;
            UnConfirmedQty_Out -= outQty;
        }
    }
}
