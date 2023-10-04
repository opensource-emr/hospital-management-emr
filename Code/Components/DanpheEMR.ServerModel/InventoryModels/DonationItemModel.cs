using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class DonationItemModel
    {
        [Key]
        public int DonationItemId { get; set; }
        public int DonationId { get; set; }
        public string CategoryName { get; set; }
        public int ItemId { get; set; }
        public string Specification { get; set; }
        public string ModelNo { get; set; }
        public double DonationQuantity { get; set; }
        public decimal CostPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        [NotMapped]
        public string ItemName { get; set; }
        public int StockId { get; set; }
        [NotMapped]
        public string Code { get; set; }
        [NotMapped]
        public string Unit { get; set; }
        public bool IsActive { get; set; }
        public DateTime? GRDate { get; set; }
    }
}
