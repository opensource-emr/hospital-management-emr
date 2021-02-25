using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class ProfileModel
    {
        [Key]
        public int ProfileId { get; set; }
        public string ProfileName { get; set; }
        public int PriceCategoryId { get; set; }
        public bool IsActive { get; set; }
        public double? TDSPercentage { get; set; }
        public string Description { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<DateTime> CreatedOn { get; set; } //when coming from client we may get null value, which we've to update from server side.
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<DateTime> ModifiedOn { get; set; }

        [NotMapped]
        public string PriceCategoryName { get; set; }
        [NotMapped]
        public int? AttachedProfileId { get; set; }
    }
}
