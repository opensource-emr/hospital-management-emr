
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LedgerModel
    {
        [Key]
        public int LedgerId { get; set; }
        public int LedgerGroupId { get; set; }                        
        public string LedgerName { get; set; }                
        public int? LedgerReferenceId { get; set; }
        public string Description { get; set; }
        public int? SectionId { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public bool? IsCostCenterApplicable { get; set; }
        public double? OpeningBalance { get; set; }
        public bool? DrCr { get; set; }
        public string Name { get; set; }
        public string LedgerType { get; set; }
        [NotMapped]
        public string PrimaryGroup { get; set; }
        [NotMapped]
        public string COA { get; set; }
        [NotMapped]
        public string LedgerGroupName { get; set; }
    }
}
