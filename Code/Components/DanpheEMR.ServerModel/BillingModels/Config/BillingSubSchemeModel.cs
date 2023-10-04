using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel.BillingModels.Config
{
    public class BillingSubSchemeModel
    {
        [Key]
        public int SubSchemeId { get; set; }
        public string SubSchemeName { get; set; }
        public int SchemeId { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

    }
}
