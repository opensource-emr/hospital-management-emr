using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Services.Billing.DTO
{
    public class PatientScheme_DTO
    {
        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public int SchemeId { get; set; }
        public string PolicyNo { get; set; }
        public string PolicyHolderUID { get; set; }
        public decimal OpCreditLimit { get; set; }
        public decimal IpCreditLimit { get; set; }
        public string PolicyHolderEmployerName { get; set; }
        public Int64? LatestClaimCode { get; set; }
        public string OtherInfo { get; set; }
        public string PolicyHolderEmployerID { get; set; }



    }
}
