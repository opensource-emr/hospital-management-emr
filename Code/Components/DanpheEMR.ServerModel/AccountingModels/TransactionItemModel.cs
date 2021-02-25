using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TransactionItemModel
    {
        [Key]
        public int TransactionItemId { get; set; }
        public int TransactionId { get; set; }
        public int LedgerId { get; set; }        
        public bool? DrCr { get; set; }
        public double? Amount { get; set; }                
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }

        public virtual List<TransactionInventoryItemModel> InventoryItems { get; set; }
        public virtual List<TransactionCostCenterItemModel> CostCenterItems { get; set; }
        //public virtual List<TransactionItemDetailModel> TransactionItemDetails { get; set; }
        [NotMapped]
        public bool IsTxnDetails { get; set; }
        [NotMapped]
        public virtual List<TransactionItemDetailModel> TransactionItemDetails { get; set; }
        [NotMapped]
        public int? SupplierId { get; set; }
        public string Description { get; set; }

        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
    }
}
