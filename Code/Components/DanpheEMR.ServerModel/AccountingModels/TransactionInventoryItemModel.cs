using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class TransactionInventoryItemModel
    {
        [Key]
        public int TransactionInventoryItemId { get; set; }
        public int TransactionItemId { get; set; }
        public int ItemId { get; set; }
        public double Amount { get; set; }
        public int Quantity { get; set; }
        public string Remarks { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool? IsTransferredToACC { get; set; }

    }
}
