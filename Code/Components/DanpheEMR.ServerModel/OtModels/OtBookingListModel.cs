using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class OtBookingListModel
    {
        [Key]
        public int OTBookingId { get; set; }
        public int PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public DateTime? BookedForDate { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public string SurgeryType { get; set; }
        public string Diagnosis { get; set; }
        public string ProcedureType { get; set; }
        public string AnesthesiaType { get; set; }
        public string Remarks { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancellationRemarks { get; set; }
        public string ConsentFormPath { get; set; }
        public string PACFormPath { get; set; }
        public bool IsActive { get; set; }
        public virtual List<OTTeamsModel> OtTeam {get; set; }
    }
}
