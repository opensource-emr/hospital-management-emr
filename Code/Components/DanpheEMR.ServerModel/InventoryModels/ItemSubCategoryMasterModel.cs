using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class ItemSubCategoryMasterModel
    {
        [Key]
        public int SubCategoryId { get; set; }
        public string Code { get; set; }
        public string SubCategoryName { get; set; }
        // public int? AccountHeadId { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsConsumable { get; set; }
        public int? LedgerId { get; set; }

        [NotMapped]
        public string LedgerType { get; set; }
   }
}
