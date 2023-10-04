using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class ReturnFromSubstoreItems
    {
        [Key]
        public int ReturnItemId { get; set; }
        public int ReturnId { get; set; }
        public int ItemId { get; set; }
        public string BatchNo { get; set; }
        public double ReturnQuantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Remark { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

    }
}
