using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.WardSupplyModels
{
    public class WARDInventoryReturnItemsModel
    {
        [Key]
        public int ReturnItemId { get; set; }
        public int ItemId { get; set; }
        public double ReturnQuantity { get; set; }
        public int ReturnId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string Remark { get; set; }
        public string BatchNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        [NotMapped]
        public bool IsFixedAsset { get; set; }
        public WARDInventoryReturnModel WardReturn { get; set; }
        public List<MAP_ReturnItems_FixedAssetStock> ReturnAssets { get; set; } = new List<MAP_ReturnItems_FixedAssetStock>();

    }

    public class MAP_ReturnItems_FixedAssetStock
    {
        public int ReturnItemId { get; set; }
        public int FixedAssetStockId { get; set; }
        public FixedAssetStockModel Asset { get; set; }
    }
}
