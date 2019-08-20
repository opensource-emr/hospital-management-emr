using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.ViewModel.ADT
{
    public class BedPatientViewModel
    {
        public int BedId { get; set; }
        public string BedCode { get; set; }
        public int BedNumber { get; set; }
        public int WardId { get; set; }
        public bool IsOccupied { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public int PatientBedInfoId { get; set; }

        public int PatientId { get; set; }
        public string PatientCode { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientAdmissionId { get; set; }
        public int BedFeatureId { get; set; }
        public double BedPrice { get; set; }
        public string Action { get; set; }
        public string Remarks { get; set; }
        public DateTime? StartedOn { get; set; }
        public DateTime? EndedOn { get; set; }
        public DateTime? AdmittedDate { get; set; }
        public DateTime? DischargedDate { get; set; }
        public string PatientName { get; set; }
        public string WardName { get; set; }
        public string Address { get; set; }
    }
}
