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

        /*Manipal-RevisionNeeded*/
        /*DevN:7Apr'23--We've made this Not NULL in Code, but not in Db yet.. This may impact in mutiple functions.. so recheck this again. */
        public int LedgerGroupId { get; set; }
        public bool DrCr { get; set; }
        public string Description { get; set; }
        [NotMapped]
        public string LedgerGroupName { get; set; }
        [NotMapped]
        public string Name { get; set; }
        [NotMapped]
        public int? LedgerReferenceId { get; set; }

    }
}
