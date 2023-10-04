using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.MedicareModels
{
    public class MedicareMemberBalance
    {
        [Key]
        public int MedicareMemberBalanceId { get; set; }
        public int MedicareMemberId { get; set; }
        public decimal OpBalance { get; set; }
        public decimal IpBalance { get; set; }
        public decimal OpUsedAmount { get; set; }
        public decimal IpUsedAmount { get; set; }
        public string HospitalNo { get; set; }
        public int PatientId { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
    }

}
