using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ExternalReferrerVM
    {
        public int ExternalReferrerId { get; set; }
        public string ReferrerName { get; set; }
        public string ContactAddress { get; set; }
        public string EmailAddress { get; set; }
        public string ContactNumber { get; set; }
        public bool IsActive { get; set; }

        public double? TDSPercent { get; set; }//pratik:14April'2020
        public bool? IsIncentiveApplicable { get; set; }//pratik:14April'2020
        public string PANNumber { get; set; }//pratik:14April'2020
        public string NMCNumber { get; set; }//pratik:14April'2020
    }


}
