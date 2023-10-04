using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel.WardSupplyModels
{
    public class WARDInventoryReturnModel
    {
        [Key]
        public int ReturnId { get; set; }
        public int SourceStoreId { get; set; }
        public int TargetStoreId { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string Remarks { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        public virtual List<WARDInventoryReturnItemsModel> ReturnItemsList { get; }
        public WARDInventoryReturnModel()
        {
            ReturnItemsList = new List<WARDInventoryReturnItemsModel>();
        }
    }
}
