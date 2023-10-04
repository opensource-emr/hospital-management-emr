using System;

namespace DanpheEMR.Services.Visits.DTO
{
    public class NewClaimCode_DTO
    {
        public Int64 NewClaimCode { get; set; }
        public bool IsMaxLimitReached { get; set; }
    }
}
