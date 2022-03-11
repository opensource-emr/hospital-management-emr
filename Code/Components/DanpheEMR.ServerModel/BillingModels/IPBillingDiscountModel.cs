using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.BillingModels
{
    public class IPBillingDiscountModel
    {
        public int PatientVisitId { get; set; }
        public int DiscountSchemeId { get; set; }
        public double? ProvisionalDiscPercent { get; set; }
        public Boolean IsItemDiscountEnabled { get; set; }

    }
}
