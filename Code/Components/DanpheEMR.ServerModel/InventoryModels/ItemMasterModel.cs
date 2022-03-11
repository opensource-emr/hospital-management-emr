using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ItemMasterModel
    {
        [Key]
        public int ItemId { get; set; }
        public string Code { get; set; }
        public int? CompanyId { get; set; }
        public int? ItemCategoryId { get; set; }
        //public int AccountHeadId { get; set; }
        public int? SubCategoryId { get; set; }
        public int? PackagingTypeId { get; set; }
        public int? UnitOfMeasurementId { get; set; }
        public string ItemName { get; set; }
        public string ItemType { get; set; }
        public string Description { get; set; }
        public double? ReOrderQuantity { get; set; }
        public bool? IsVATApplicable { get; set; }
        public decimal? VAT { get; set; }
        public double? MinStockQuantity { get; set; }
        public double? BudgetedQuantity { get; set; }
        public decimal? StandardRate { get; set; }
        public double? UnitQuantity { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }

        public string MSSNO { get; set; } /// Rajib: 11/25/2020 Tilaganga Hospital
        public string HSNCODE { get; set; } /// Rajib: 11/25/2020 Tilaganga Hospital

        public int? VendorId { get; set; } /// Rajib: 11/25/2020 Tilaganga Hospital
        public bool? IsCssdApplicable { get; set; }
        public bool? IsColdStorageApplicable { get; set; }
        public bool? IsPatConsumptionApplicable { get; set; }
        public int? MaintenanceOwnerRoleId { get; set; }
        public int? RegisterPageNumber { get; set; }
        public int? StoreId { get; set; }
    }
}
