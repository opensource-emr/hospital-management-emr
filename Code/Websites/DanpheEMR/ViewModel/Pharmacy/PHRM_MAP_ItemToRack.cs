using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.Pharmacy
{
    public class PHRM_MAPView_ItemToRack
    {
        [Key]
        public int MappingId { get; set; }
        public int? StoreId { get; set; }
        public int? RackId { get; set; }
        public int? ItemId { get; set; }
        public Boolean IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime ModifiedOn { get; set; }


    }
}
