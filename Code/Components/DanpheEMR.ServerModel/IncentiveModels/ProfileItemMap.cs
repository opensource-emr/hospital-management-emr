using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.IncentiveModels
{
    public class ProfileItemMap
    {
        [Key]
        public int BillItemProfileMapId { get; set; }
        public Nullable<int> BillItemPriceId { get; set; }
        public int ProfileId { get; set; }

        public int ServiceItemId {get;set;}
        public double PerformerPercent { get; set; } // Krishna, 20th,jun'22, AssignedToPercent changed to PerformerPercent.
        public double PrescriberPercent { get; set; } // Krishna, 20th,jun'22, ReferredByPercent changed to PrescriberPercent.
        public int PriceCategoryId { get; set; }
        public string BillingTypesApplicable { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<DateTime> CreatedOn { get; set; } //when coming from client we may get null value, which we've to update from server side.
        public Nullable<int> ModifiedBy { get; set; }
        public Nullable<DateTime> ModifiedOn { get; set; }
        public double? ReferrerPercent { get; set; } // Krishna, 20th,jun'22, Added a new column ReferrerPercent.
        public Boolean IsActive { get; set; }
    }
}
