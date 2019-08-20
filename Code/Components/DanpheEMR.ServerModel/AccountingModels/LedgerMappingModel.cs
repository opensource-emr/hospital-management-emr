using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    }
}
