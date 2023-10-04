using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMRackModel
    {
        [Key]
        public int RackId { get; set; }
        public int? ParentId { get; set; }
        public int StoreId { get; set; }
        public string RackNo { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
