using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MappingDetailModel
    {
        [Key]
        public int AccountingMappingDetailId  { get; set; }
        public int GroupMappingId { get; set; }   
        public int? LedgerGroupId { get; set; }
        public bool? DrCr { get; set; }
        public string Description { get; set; }
        [NotMapped]
        public string LedgerGroupName { get; set; }
        [NotMapped]
        public string Name { get; set; }
        [NotMapped]
        public int? LedgerReferenceId { get; set; }

    }
}
