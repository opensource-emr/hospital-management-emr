using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.VerificationModels.Pharmacy
{
    public class PharmacyVerificationModel
    {
        [Key]
        public int VerificationId { get; set; }
        public int VerifiedBy { get; set; }
        public DateTime VerifiedOn { get; set; }
        public int? ParentVerificationId { get; set; }
        public int CurrentVerificationLevel { get; set; } 
        public int CurrentVerificationLevelCount { get; set; }
        public int MaxVerificationLevel { get; set; }   
        public string VerificationStatus { get; set; } 
        public string VerificationRemarks { get; set; }
        public string TransactionType { get; set; }
    }
}
