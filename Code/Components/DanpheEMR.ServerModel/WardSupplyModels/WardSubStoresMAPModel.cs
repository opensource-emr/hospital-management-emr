using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.WardSupplyModels
{
    public class WardSubStoresMAPModel
    {
        [Key]
        public int WardSubStoresMapId { get; set; }
        public int WardId { get; set; }
        public int StoreId { get; set; }
        public Boolean IsDefault { get; set; }
        public Boolean IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
