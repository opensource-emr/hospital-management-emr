using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    //review:25Jan'17-sudarshan: consider adding 'Dose' property after consulting with Hari or Domain team.
    public class MedicationPrescriptionModel
    {
        [Key]
        public int MedicationPrescriptionId { get; set; }
        public int PatientId { get; set; }
        public int MedicationId { get; set; }
        [NotMapped]
        public string MedicationName { get; set; }
        public int ProviderId{ get; set; }
        [NotMapped]
        public string ProviderName { get; set; }
        public string Route { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
        public string Dose { get; set; }
        public string Frequency { get; set; }
        public int? Refill { get; set; }
        public string TypeofMedication { get; set; }
        // this is used to show ..selected medicine with tick mark  in order list 
        [NotMapped]
        public bool IsSelected { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public virtual PatientModel Patient { get; set; }
    }
}
