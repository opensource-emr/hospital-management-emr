using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class GroupMappingModel
    {
        [Key]
        public int GroupMappingId { get; set; }
        public string Description { get; set; }
        public int? Section { get; set; }    
        public string Details { get; set; }
        public int? VoucherId { get; set; }
        public string Remarks { get; set; }
        [NotMapped]
        public virtual List<MappingDetailModel> MappingDetail { get; set; }

    }
}
