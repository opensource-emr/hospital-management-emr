using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FixedAssetStockModel
    {
        [Key]
        public int FixedAssetStockId { get; set; }
        public int? GoodsReceiptItemId { get; set; }
        public virtual ItemMasterModel ItemMasterModel { get; set; }
        public int ItemId { get; set; }
        public string AssetCode { get; set; }
        public string BarCodeNumber { get; set; }
        public string AssetsLocation { get; set; }
        public string BatchNo { get; set; }
        public DateTime? WarrantyExpiryDate { get; set; }
        public decimal ItemRate { get; set; }
        public decimal? MRP { get; set; }
        public double? DiscountPercent { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VATAmount { get; set; }
        public double? VAT { get; set; }
        public decimal? CcCharge { get; set; }
        public decimal? CcAmount { get; set; }
        public decimal? OtherCharge { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public int? CounterId { get; set; }
        public bool? IsBarCodeGenerated { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsAssetDamaged { get; set; }
        public string DamagedRemarks { get; set; }
        public string UndamagedRemarks { get; set; }
        public string Performance { get; set; }
        public int? TotalLife { get; set; }
        public double? YearOfUse { get; set; }
        public DateTime? ManufactureDate { get; set; }
        public bool IsUnderMaintenance { get; set; }
        public string SerialNo { get; set; }
        public string ModelNo { get; set; }
        public string BuildingBlockNumber { get; set; }
        public string Floors { get; set; }
        public string RoomNumber { get; set; }
        public string RoomPosition { get; set; }
        public int? DonationId { get; set; }

        public int? AssetHolderId { get; set; }
        public int StoreId { get; set; }

        public int? SubStoreId { get; set; }


        [NotMapped]
        public string CompanyPosition { get; set; }
        [NotMapped]
        public  string Name { get; set;}

        [NotMapped]
        public string PhoneNumber { get; set; }

        [NotMapped]
        public int? VendorId { get; set; }

        [NotMapped]
        public string CompanyPosition2 { get; set; }

        [NotMapped]
        public string Name2 { get; set; }

        [NotMapped]
        public string PhoneNumber2 { get; set; }

        [NotMapped]
        public string Location { get; set; }

        public bool IsMaintenanceRequired { get; set; }
        public int? ExpectedValueAfterUsefulLife { get; set; }
        public bool IsAssetDamageConfirmed { get; set; }
        public bool IsAssetScraped { get; set; }
        public decimal? ScrapAmount { get; set; }
        public string ScrapRemarks { get; set; }
        public string ScrapCancelRemarks { get; set; } 
        public int? PeriodicServiceDays { get; set; } 
        public DateTime? InstallationDate { get; set; }
        public string CssdStatus { get; set; }
        public string StockSpecification { get; set; }
    }
}
