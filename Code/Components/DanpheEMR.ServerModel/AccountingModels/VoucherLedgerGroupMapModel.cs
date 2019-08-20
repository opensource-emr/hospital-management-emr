
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class VoucherLedgerGroupMapModel
    {      
        [Key]
        public int VoucherLedgerGroupMapId { get; set; }
        public int VoucherId { get; set; }
        public int LedgerGroupId { get; set; }
        public bool IsDebit { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }

        [NotMapped]
        public string actionName { get; set; }
    }
}
