
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerGroupModel
    {
        [Key]
        public int LedgerGroupId { get; set; }
        public string PrimaryGroup { get; set; }
        public string COA { get; set; }
        public string LedgerGroupName { get; set; }
        public string Description { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Name { get; set; }
        [NotMapped]
        public int LedgerId { get; set; }
        [NotMapped]
        public string LedgerName { get; set; }
        [NotMapped]
        public int? LedgerReferenceId { get; set; }
        [NotMapped]
        public int? SectionId { get; set; }      
        [NotMapped]
        public string LedName { get; set; }
        [NotMapped]
        public string LedgerType { get; set; }
    }
}
