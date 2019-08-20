using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel { 
    public class DischargeCancelModel
    {
        [Key]
        public int DischargeCancelId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? PatientAdmissionId { get; set; }
        public DateTime DischargedDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? DischargedBy { get; set; }
        public int? DischargeCancelledBy { get; set; }
        public int? BillingTransactionId { get; set; }
        public string DischargeCancelNote { get; set; }
    }
}
