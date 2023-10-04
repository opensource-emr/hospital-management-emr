using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRM_MAP_MstItemsPriceCategory
    {
        [Key]
        public int PriceCategoryMapId { get; set; }
        public int PriceCategoryId { get; set; }
        public int ItemId { get; set; }
        public decimal? Price { get; set; }
        public bool DiscountApplicable { get; set; }
        public string ItemLegalCode { get; set; }
        public string ItemLegalName { get; set; }
        public decimal? Discount { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public virtual PHRMItemMasterModel Items { get; set; }
        [JsonIgnore]
        public virtual PHRMGenericModel generic { get; set; }
        public int? GenericId { get; set; }
    }
}
