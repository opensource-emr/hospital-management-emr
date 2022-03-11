using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class AccountingBillLedgerMappingModel
    {
        [Key]
        public int BillLedgerMappingId { get; set; }
        public int LedgerId { get; set; }
        public int ServiceDepartmentId { get; set; }
        public int? ItemId { get ; set;}
        public int? HospitalId { get; set; }

        [NotMapped]
        public string LedgerName { get; set; }
        

    }
}
