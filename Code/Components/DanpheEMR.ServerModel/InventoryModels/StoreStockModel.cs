using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class StoreStockModel
    {
        [Key]
        public int? StoreStockId { get; set; }
        public int StoreId { get; private set; }
        public int StockId { get; private set; }
        public int ItemId { get; private set; }
        public decimal SellingPrice { get; private set; }
        public double AvailableQuantity { get; private set; }
        public double UnConfirmedQty_In { get; private set; }
        public double UnConfirmedQty_Out { get; private set; }
        public bool IsActive { get; private set; }
        public StockMasterModel StockMaster { get; set; }
        public IList<StockTransactionModel> StockTransactions { get; set; }
        public StoreStockModel() // required for LINQ operations
        {
            StockTransactions = new List<StockTransactionModel>();
        }
        public StoreStockModel(StockMasterModel stockMaster, int storeId, double? quantity, string transactionType, DateTime? transactionDate, DateTime currentDate, int? referenceNo, int createdBy, int fiscalYearId, bool needConfirmation)
        {
            // if-guards
            if (stockMaster.StockId == null || stockMaster.ItemId == null) throw new InvalidOperationException("Cannot insert null value in StockId or ItemId field for StoreStock.");
            if (quantity == null) throw new InvalidOperationException("Cannot insert null value in Quantity field for StoreStock.");
            if (transactionDate is null) { transactionDate = currentDate; }

            StockMaster = stockMaster;

            StockTransactions = new List<StockTransactionModel>();

            StockId = stockMaster.StockId.Value;
            StoreId = storeId;
            ItemId = stockMaster.ItemId.Value;
            SellingPrice = stockMaster.MRP;
            IsActive = true;

            AddStock(quantity: quantity.Value,
                transactionType: transactionType,
                transactionDate: transactionDate.Value,
                currentDate: currentDate,
                referenceNo: referenceNo,
                createdBy: createdBy,
                fiscalYearId: fiscalYearId,
                needConfirmation: needConfirmation);
        }
        public void AddStock(double quantity, string transactionType, DateTime? transactionDate, DateTime currentDate, int? referenceNo, int createdBy, int fiscalYearId, bool needConfirmation)
        {
            if (quantity <= 0) throw new InvalidOperationException("Cannot add 0 stock. Please Check.");
            if (transactionDate is null) { transactionDate = currentDate; }
            if (needConfirmation == true)
            {
                UnConfirmedQty_In += quantity;
            }
            else
            {
                AvailableQuantity += quantity;
            }
            var stockTxn = new StockTransactionModel(
                stock: this,
                transactionType: transactionType,
                transactionDate: transactionDate,
                referenceNo: referenceNo,
                createdBy: createdBy,
                createdOn: currentDate,
                fiscalYearId: fiscalYearId);

            stockTxn.SetInQuantity(inQty: quantity);
            StockTransactions.Add(stockTxn);
        }
        public void DecreaseStock(double quantity, string transactionType, DateTime? transactionDate, DateTime currentDate, int? referenceNo, int createdBy, int fiscalYearId, bool needConfirmation = true)
        {
            if (quantity <= 0) throw new InvalidOperationException("Cannot decrease 0 stock. Please Check.");
            if (transactionDate is null) { transactionDate = currentDate; }

            if (needConfirmation == true)
                UnConfirmedQty_Out += quantity;

            AvailableQuantity -= quantity;

            var stockTxn = new StockTransactionModel(
                stock: this,
                transactionType: transactionType,
                transactionDate: transactionDate,
                referenceNo: referenceNo,
                createdBy: createdBy,
                createdOn: currentDate,
                fiscalYearId: fiscalYearId);

            stockTxn.SetOutQuantity(outQty: quantity);
            StockTransactions.Add(stockTxn);
        }
        public void ConfirmStockReceived(double quantity)
        {
            UnConfirmedQty_In -= quantity;
            AvailableQuantity += quantity;
        }
        public void ConfirmStockDispatched(double quantity)
        {
            UnConfirmedQty_Out -= quantity;
        }
    }
}
