using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class VerificationModel
    {
        [Key]
        public int VerificationId { get; set; }
        public int VerifiedBy { get; set; }
        public DateTime VerifiedOn { get; set; }
        public int? ParentVerificationId { get; set; }
        public int CurrentVerificationLevel { get; set; }  // 1, 2 (parent=> 1), 3 => (parent => 2) 
        public int CurrentVerificationLevelCount { get; set; } 
        public int MaxVerificationLevel { get; set; }   //  3
        public string VerificationStatus { get; set; }  // approved, rejected
        public string VerificationRemarks { get; set; }
    }
}
