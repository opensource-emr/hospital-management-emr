using DanpheEMR.ServerModel.InventoryModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DispatchItemsModel
    {
        [Key]
        public int DispatchItemsId { get; set; }
        public int? DepartmentId { get; set; }
        public int RequisitionId { get; set; } //added later for easier use, hospitals like MIKC may face issue if we use this one.
        public int RequisitionItemId { get; set; }
        public double DispatchedQuantity { get; set; }
        public DateTime? DispatchedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ReceivedBy { get; set; }
        public string Remarks { get; set; }
        public string ItemRemarks { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public int DispatchId { get; set; }
        public DateTime? MatIssueDate { get; set; }
        public string MatIssueTo { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public int? ReceivedById { get; set; }
        public DateTime? ReceivedOn { get; set; }
        public string ReceivedRemarks { get; set; }
        [NotMapped]
        public int? IssueNo { get; set; }

        /// <summary>
        /// Maintains sequence for DispatchId
        /// </summary>
        public int? ReqDisGroupId { get; set; }
        public int FiscalYearId { get; set; }

        public int? DispatchNo { get; set; }
        public string ItemCategory { get; set; }
        public string Specification { get; set; }
        [NotMapped]
        public bool IsFixedAsset { get; set; }
        public List<MAP_DispatchItems_FixedAssetStock> DispatchedAssets { get; set; } = new List<MAP_DispatchItems_FixedAssetStock>();
        [NotMapped]
        public int? StoreStockId { get; set; }
        public double? CostPrice { get; set; }
        public DispatchModel Dispatch { get; set; }
    }

    public class MAP_DispatchItems_FixedAssetStock
    {
        public int DispatchItemsId { get; set; }
        public int FixedAssetStockId { get; set; }
        public FixedAssetStockModel Asset { get; set; }
    }
}
