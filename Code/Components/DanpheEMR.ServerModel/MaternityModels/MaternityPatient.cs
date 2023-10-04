using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MaternityPatient
    {
        [Key]
        public int MaternityPatientId { get; set; }
        public int PatientId { get; set; }
        public string HusbandName { get; set; }
        public double Height { get; set; }
        public double Weight { get; set; }
        public DateTime? LastMenstrualPeriod { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string PlaceOfDelivery { get; set; }
        public string Presentation { get; set; }
        public string Complications { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public int TypeOfDelivery { get; set; }
        public string OBSHistory { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ConcludedOn { get; set; }
        public int? ConcludedBy { get; set; }
        public bool IsActive { get; set; }
        public bool IsConcluded { get; set; }
    }

}
