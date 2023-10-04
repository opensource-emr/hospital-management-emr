using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ReferralSource
    {
        [Key]
        public int ReferralSourceId { get; set; }
        public int PatientId { get; set; }
        public bool Newspaper { get; set; }
        public bool Unknown { get; set; }
        public bool Doctor { get; set; }
        public bool Radio { get; set; }
        public bool WebPage { get; set; }
        public bool FriendAndFamily { get; set; }
        public bool Staff { get; set; }
        public bool TV { get; set; }
        public string Others { get; set; }
        public bool Magazine { get; set; }
        public string Note { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual PatientModel Patient { get; set; }
    }
}
