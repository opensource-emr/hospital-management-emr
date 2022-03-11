using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMItemMasterModel
    {
        [Key]
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public int CompanyId { get; set; }
        //[NotMapped]
        //public int SupplierId { get; set; }
        public int ItemTypeId { get; set; }
        public int UOMId { get; set; }
        public double? ReOrderQuantity { get; set; }
        public double? MinStockQuantity { get; set; }
        public double? BudgetedQuantity { get; set; }
        public double? PurchaseVATPercentage { get; set; }
        public double? SalesVATPercentage { get; set; }
        public bool IsVATApplicable { get; set; }
        public int? PackingTypeId { get; set; }
        public bool IsInternationalBrand { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public String Dosage { get; set; }
        public string Frequency { get; set; }
        public string Duration { get; set; }
        public int? GenericId { get; set; }
        public string ABCCategory { get; set; }
        public int? Rack { get; set; }
        public int? StoreRackId { get; set; }
        public int? SalesCategoryId { get; set; }
        public string VED { get; set; }
        public double? CCCharge { get; set; }
        public bool IsNarcotic { get; set; }
        public bool? IsInsuranceApplicable { get; set; }
        public decimal? GovtInsurancePrice { get; set; }
    }
}
