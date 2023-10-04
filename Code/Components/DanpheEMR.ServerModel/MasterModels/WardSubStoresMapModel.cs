using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.MasterModels
{
    public class WardSubStoresMapModel
    {
        [Key]
        public int WardSubStoresMapId { get; set; }
        public int WardId { get; set; }
        public int StoreId { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
