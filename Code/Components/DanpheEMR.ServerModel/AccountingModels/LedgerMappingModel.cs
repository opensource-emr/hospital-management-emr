using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerMappingModel
    {
        [Key]
        public int LedgerMappingId { get; set; }

        public int LedgerId { get; set; }

        public int ReferenceId { get; set; }

        public string LedgerType { get; set; }
        [NotMapped]
        public string LedgerName { get; set; }

        //sud-nagesh: 20June'20-- for Acc-Hospital Separation.
        public int? HospitalId { get; set; }
    }
}
