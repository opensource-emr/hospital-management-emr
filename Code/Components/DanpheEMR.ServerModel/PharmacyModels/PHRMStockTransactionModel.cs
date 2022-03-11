using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMStockTransactionModel
    {

        [Key]
        public int StockTransactionId { get; private set; }
        public DateTime TransactionDate { get; private set; }
        public int StoreId { get; private set; }
        public int StockId { get; private set; } //refer to PHRMStockMaster
        public int StoreStockId { get; private set; }
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
        public bool? IsTransferedToAcc { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime? CreatedOn { get; private set; }
        public PHRMStockTransactionModel() { } // Required for LINQ Queries
        public PHRMStockTransactionModel(PHRMStoreStockModel stock, string transactionType, DateTime? transactionDate, int? referenceNo, int createdBy, DateTime? createdOn, int fiscalYearId)
        {
            if (transactionDate == null || stock == null || stock.StoreStockId == null || stock.StockMaster == null) throw new InvalidOperationException();

            TransactionDate = transactionDate.Value;
            StoreId = stock.StoreId;
            StockId = stock.StockId;
            StoreStockId = stock.StoreStockId.Value;
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


        public void SetInOutQuantity(double? inQty, double? outQty)
        {
            // if-guards
            if (inQty == null || outQty == null) throw new InvalidOperationException();
            if (inQty < 0 || outQty < 0) throw new InvalidOperationException();
            if ((inQty > 0 && outQty > 0) || (inQty == 0 && outQty == 0)) throw new InvalidOperationException();

            InQty = inQty.Value;
            OutQty = outQty.Value;
        }
        public void UpdateBatch(string batchNo, int EmployeeId)
        {
            if (string.IsNullOrEmpty(batchNo)) throw new InvalidOperationException("Cannot insert null value in new Batch field for stock txn.");
            BatchNo = batchNo;
            //UpdateModifiedDetail(EmployeeId);
        }
        public void UpdateExpiry(DateTime? expiryDate, int EmployeeId)
        {
            if (expiryDate == null) throw new InvalidOperationException("Cannot insert null value in ExpiryDate field for stock txn.");
            ExpiryDate = expiryDate;
           // UpdateModifiedDetail(EmployeeId);
        }
        //private void UpdateModifiedDetail(int EmployeeId)
        //{
        //    ModifiedBy = EmployeeId;
        //    ModifiedOn = DateTime.Now;
        //}
    }
}
