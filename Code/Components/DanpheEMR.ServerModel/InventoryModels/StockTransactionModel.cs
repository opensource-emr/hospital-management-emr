using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class StockTransactionModel
    {

        [Key]
        public int StockTransactionId { get; private set; }
        public DateTime TransactionDate { get; private set; }
        public int StoreId { get; private set; }
        public int StockId { get; private set; } //refer to PHRMStockMaster
        public int? StoreStockId { get; private set; }
        public int FiscalYearId { get; private set; }
        public int ItemId { get; private set; }
        public string BatchNo { get; private set; }
        public DateTime? ExpiryDate { get; private set; }
        public string TransactionType { get; private set; }
        public double InQty { get; private set; }
        public double OutQty { get; private set; }
        public decimal? CostPrice { get; private set; }
        public decimal? MRP { get; private set; }
        public int? ReferenceNo { get; private set; }
        public string Remarks { get; private set; }
        public bool? IsActive { get; private set; }
        public bool? IsTransferredToACC { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime? CreatedOn { get; private set; }
        public StoreStockModel StoreStock { get; set; }
        public StockTransactionModel() { } // Required for LINQ Queries
        public StockTransactionModel(StoreStockModel stock, string transactionType, DateTime? transactionDate, int? referenceNo, int createdBy, DateTime? createdOn, int fiscalYearId)
        {
            if (transactionDate == null || stock == null || stock.StockMaster == null) throw new InvalidOperationException();

            TransactionDate = transactionDate.Value;
            StoreId = stock.StoreId;
            StockId = stock.StockId;
            StoreStockId = stock.StoreStockId;
            FiscalYearId = fiscalYearId;
            ItemId = stock.ItemId;
            BatchNo = stock.StockMaster.BatchNo;
            ExpiryDate = stock.StockMaster.ExpiryDate;
            TransactionType = transactionType;
            CostPrice = stock.StockMaster.CostPrice;
            MRP = stock.StockMaster.MRP;
            ReferenceNo = referenceNo;
            CreatedBy = createdBy;
            CreatedOn = createdOn;
            IsActive = true;
        }

        public void SetInQuantity(double inQty)
        {
            if (inQty <= 0) throw new InvalidOperationException();
            InQty = inQty;
            OutQty = 0;
        }
        public void SetOutQuantity(double outQty)
        {
            if (outQty <= 0) throw new InvalidOperationException();
            OutQty = outQty;
            InQty = 0;
        }
        public void UpdateTransactionDate(DateTime? newDate)
        {
            if (newDate == null) throw new InvalidOperationException("Cannot update Transaction Date to null value in Stock Transaction.");
            TransactionDate = newDate.Value;
        }
    }
}