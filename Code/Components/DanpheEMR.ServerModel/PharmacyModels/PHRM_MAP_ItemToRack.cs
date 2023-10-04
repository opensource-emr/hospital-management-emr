using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRM_MAP_ItemToRack
    {
        [Key]
        public int MappingId { get; set; }
        public int StoreId { get; set; }
        public int? RackId { get; set; }
        public int ItemId { get; set; }
        public Boolean IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        [NotMapped]
        public string RackNo { get; set; }
        [NotMapped]
        public int IIndex { get; set; }
        [NotMapped]
        public int JIndex { get; set; }
    }
}
