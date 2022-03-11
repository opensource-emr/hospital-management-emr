using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class StockMasterModel : IEquatable<StockMasterModel>
    {
        [Key]
        public int? StockId { get; private set; }
        public int? ItemId { get; private set; }
        public string BatchNo { get; private set; }
        public DateTime? ExpiryDate { get; private set; }
        public decimal CostPrice { get; private set; }
        public decimal MRP { get; private set; }
        public string Specification { get; private set; }
        public int CreatedBy { get; private set; }
        public DateTime CreatedOn { get; private set; }
        public int? ModifiedBy { get; private set; }
        public DateTime? ModifiedOn { get; private set; }
        public bool IsActive { get; private set; }
        public IList<StoreStockModel> StoreStocks { get; set; }
        public StockMasterModel()
        {
            StoreStocks = new List<StoreStockModel>();
        }
        public StockMasterModel(int? itemId, string batchNo, DateTime? expiryDate, decimal costPrice, decimal? mRP, string specification, int createdBy, DateTime? createdOn) : this()
        {
            if (mRP == null) mRP = 0;
            ItemId = itemId;
            BatchNo = batchNo;
            ExpiryDate = expiryDate;
            CostPrice = costPrice;
            MRP = mRP.Value;
            Specification = specification;
            CreatedBy = createdBy;
            CreatedOn = createdOn ?? DateTime.Now;
            IsActive = true;
        }

        public void UpdateMRP(decimal? updatedMrp, int EmployeeId)
        {
            if (updatedMrp == null) throw new InvalidOperationException("Cannot insert null value in new MRP field for master stock.");
            MRP = updatedMrp.Value;
            UpdateModifiedDetail(EmployeeId);
        }

        public void UpdateBatch(string batchNo, int? EmployeeId)
        {
            BatchNo = batchNo;
            UpdateModifiedDetail(EmployeeId);
        }
        public void UpdateExpiry(DateTime? expiryDate, int? EmployeeId)
        {
            ExpiryDate = expiryDate;
            UpdateModifiedDetail(EmployeeId);
        }
        public void UpdateSpecification(string speicification, int? EmployeeId)
        {
            Specification = speicification;
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
        private void UpdateModifiedDetail(int? EmployeeId)
        {
            if (EmployeeId == null) throw new InvalidOperationException("Cannot insert null value in ModifiedBy field.");
            ModifiedBy = EmployeeId;
            ModifiedOn = DateTime.Now;
        }
        #region IEquatable Methods

        public override bool Equals(object obj)
        {
            return Equals(obj as StockMasterModel);
        }

        public bool Equals(StockMasterModel other)
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

        public static bool operator ==(StockMasterModel left, StockMasterModel right)
        {
            return EqualityComparer<StockMasterModel>.Default.Equals(left, right);
        }

        public static bool operator !=(StockMasterModel left, StockMasterModel right)
        {
            return !(left == right);
        }

        #endregion
    }
}
