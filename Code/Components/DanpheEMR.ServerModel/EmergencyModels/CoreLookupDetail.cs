using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.EmergencyModels
{
    public class CoreLookupDetail
    {
        [Key]
        public int Id { get; set; }
        public LookUpTypeEnum Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string DisplayName { get; set; }
        public int? DisplaySequence { get; set; }
        public int? ParentId { get; set; }
        public bool IsActive { get; set; }
        [NotMapped]
        public IEnumerable<CoreLookupDetail> ChildLookUpDetails { get; set; }
    }
    
}
