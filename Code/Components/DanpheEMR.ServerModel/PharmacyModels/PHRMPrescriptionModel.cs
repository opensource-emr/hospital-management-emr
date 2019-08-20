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
        public int ProviderId { get; set; }
        public string Notes { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string ProviderFullName { get; set; }
        public bool? IsInPatient { get; set; }
        public string PrescriptionStatus { get; set; }
        //public virtual List<PHRMPrescriptionItemsModel> PHRMPrescriptionItems { get; set; }
        [NotMapped]
        public string PatientName { get; set; }
    }
}
