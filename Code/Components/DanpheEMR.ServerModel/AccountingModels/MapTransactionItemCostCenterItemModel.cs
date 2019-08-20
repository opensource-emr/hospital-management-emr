using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MapTransactionItemCostCenterItemModel
    {
        [Key]
        public int TxnItemCostCenterItemId { get; set; }
        public int TransactionItemId { get; set; }
        public int CostCenterItemId { get; set; }
        public double? Amount { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
    }
}
