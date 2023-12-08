using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PHRMPrescriptionModel
    {
        [Key]
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public int? PrescriberId { get; set; }
        public string Notes { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string PrescriberName { get; set; }
        public bool? IsInPatient { get; set; }
        public string PrescriptionStatus { get; set; }
        public virtual List<PHRMPrescriptionItemModel> PHRMPrescriptionItems { get; set; }
        [NotMapped]
        public string PatientName { get; set; }
    }
}
