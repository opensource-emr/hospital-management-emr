using System;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class IPBillingDiscount_DTO
    {
        public int PatientVisitId { get; set; }
        public int DiscountSchemeId { get; set; }
        public double ProvisionalDiscPercent { get; set; }
        public Boolean IsItemDiscountEnabled { get; set; }

    }
}
