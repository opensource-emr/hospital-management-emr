using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMStockMaster : IEquatable<PHRMStockMaster>
    {
        #region Properties
        [Key]
        public int? StockId { get; private set; }
        public int? ItemId { get; private set; }
        public string BatchNo { get; private set; }
        public DateTime? ExpiryDate { get; private set; }
        public decimal CostPrice { get; private set; }
        public decimal MRP { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedOn { get; private set; }
        public int? ModifiedBy { get; private set; }
        public DateTime? ModifiedOn { get; private set; }
        public bool IsActive { get; private set; }
        public IList<PHRMStoreStockModel> StoreStocks { get; set; }

        public int? BarcodeId { get; private set; }
        public PHRMStockBarcode StockBarcode { get; set; }
        #endregion

        #region CTOR
        public PHRMStockMaster()
        {
            StoreStocks = new List<PHRMStoreStockModel>();
        }
        public PHRMStockMaster(int? itemId, string batchNo, DateTime? expiryDate, decimal costPrice, decimal? mRP, int createdBy, DateTime? createdOn) : this()
        {
            if (mRP == null) throw new InvalidOperationException("Cannot insert null value in MRP field for master stock.");
            ItemId = itemId;
            BatchNo = batchNo;
            ExpiryDate = expiryDate;
            CostPrice = costPrice;
            MRP = mRP.Value;
            CreatedBy = createdBy;
            CreatedOn = createdOn ?? DateTime.Now;
            IsActive = true;
        }
        #endregion

        #region Methods
        public void UpdateMRP(decimal? updatedMrp, int EmployeeId)
        {
            if (updatedMrp == null) throw new InvalidOperationException("Cannot insert null value in new MRP field for master stock.");
            MRP = updatedMrp.Value;
            UpdateModifiedDetail(EmployeeId);
        }

        public void UpdateBatch(string batchNo, int EmployeeId)
        {
            if (string.IsNullOrEmpty(batchNo)) throw new InvalidOperationException("Cannot insert null value in new Batch field for master stock.");
            BatchNo = batchNo;
            UpdateModifiedDetail(EmployeeId);
        }
        public void UpdateExpiry(DateTime? expiryDate, int EmployeeId)
        {
            if (expiryDate == null) throw new InvalidOperationException("Cannot insert null value in ExpiryDate field for master stock.");
            ExpiryDate = expiryDate;
            UpdateModifiedDetail(EmployeeId);
        }
        public void ActivateStock(int EmployeeId)
        {
            IsActive = true;
            UpdateModifiedDetail(EmployeeId);
        }
        public void DeactivateStock(int EmployeeId)
        {
            IsActive = false;
            UpdateModifiedDetail(EmployeeId);
        }
        private void UpdateModifiedDetail(int EmployeeId)
        {
            ModifiedBy = EmployeeId;
            ModifiedOn = DateTime.Now;
        }

        /// <summary>
        /// updates the barcode of the stock. mostly used during creating new stock
        /// </summary>
        public void UpdateBarcodeId(int barcodeId)
        {
            BarcodeId = barcodeId;
        }

        #region IEquatable Methods

        public override bool Equals(object obj)
        {
            return Equals(obj as PHRMStockMaster);
        }

        public bool Equals(PHRMStockMaster other)
        {
            return other != null &&
                   StockId == other.StockId &&
                   ItemId == other.ItemId &&
                   BatchNo == other.BatchNo &&
                   ExpiryDate == other.ExpiryDate &&
                   CostPrice == other.CostPrice &&
                   MRP == other.MRP &&
                   CreatedBy == other.CreatedBy &&
                   CreatedOn == other.CreatedOn &&
                   ModifiedBy == other.ModifiedBy &&
                   ModifiedOn == other.ModifiedOn &&
                   IsActive == other.IsActive;
        }

        public override string ToString()
        {
            return base.ToString();
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public static bool operator ==(PHRMStockMaster left, PHRMStockMaster right)
        {
            return EqualityComparer<PHRMStockMaster>.Default.Equals(left, right);
        }

        public static bool operator !=(PHRMStockMaster left, PHRMStockMaster right)
        {
            return !(left == right);
        }

        #endregion 
        #endregion
    }

}
