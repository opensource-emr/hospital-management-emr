using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class ItemCategoryMasterModel
    {
        [Key]
        public int ItemCategoryId { get; set; }
        public string ItemCategoryName { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        //sud:18Sep'21--We can have different Codes for Different Categories.
        //eg: as per Ma.Le.Pa:for CapitalGoods=४०८/४७,for Consumables=४०७/५२
        public string CategoryCode { get; set; }
    }
}
