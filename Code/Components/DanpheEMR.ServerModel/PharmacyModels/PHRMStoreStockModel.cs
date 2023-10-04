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
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public bool IsActive { get; private set; }
        public  virtual PHRMStockMaster StockMaster { get; set; }
        public PHRMStoreStockModel() { } // required for LINQ operations
        private PHRMStoreStockModel(int? stockId, int storeId, int? itemId, double? quantity, decimal costPrice, decimal salePrice)
        {
            // if-guards
            if (quantity == null) throw new InvalidOperationException("Cannot insert null value in Quantity field for StoreStock.");

            StockId = stockId.Value;
            StoreId = storeId;
            ItemId = itemId.Value;
            AvailableQuantity = quantity.Value;
            CostPrice = costPrice;
            SalePrice = salePrice;
            IsActive = true;
        }
        public PHRMStoreStockModel(PHRMStockMaster stockMaster, int storeId, double? quantity, decimal costPrice, decimal salePrice) : this(stockMaster.StockId, storeId, stockMaster.ItemId, quantity, costPrice, salePrice)
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
        public void UpdateNewCostPrice(decimal newCp)
        {
            CostPrice = newCp;
        }

        public void UpdateMRP(decimal salePrice)
        {
            SalePrice = salePrice;
        }
    }
}
