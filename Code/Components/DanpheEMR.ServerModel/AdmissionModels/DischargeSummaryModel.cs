using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class DischargeSummaryModel
    {
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int DischargeSummaryId { get; set; }

        //[Key, ForeignKey("Visit")]
        [Key]
        public int PatientVisitId { get; set; }
        public int DischargeTypeId { get; set; }
        public int ConsultantId { get; set; }
        public int DoctorInchargeId { get; set; }
        public string OperativeProcedure { get; set; }
        public string OperativeFindings { get; set; }
        public int? AnaesthetistsId { get; set; }
        public string Diagnosis { get; set; }
        public string CaseSummary { get; set; }
        public string Condition { get; set; }
        public string Treatment { get; set; }
        public string HistologyReport { get; set; }
        public string SpeicialNotes { get; set; }
        public string Medications { get; set; }
        public string Allergies { get; set; }
        public string Activities { get; set; }
        public string Diet { get; set; }
        public int? RestDays { get; set; }
        public int? FollowUp { get; set; }
        public string Others { get; set; }
        //Ashim: 15Dec2017 : ResidenceDr is not mandatory
        public int? ResidenceDrId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        //public virtual VisitModel Visit { get; set; }
        public bool? IsSubmitted { get; set; }
        public bool? IsDischargeCancel { get; set; }
        public string LabTests { get; set; }
        public int? DischargeConditionId { get; set; }
        public int? DeliveryTypeId { get; set; }
        public int? BabyBirthConditionId { get; set; }
        public int? DeathTypeId { get; set; }
        public string DeathPeriod { get; set; }
        [NotMapped]
        public virtual List<DischargeSummaryMedication> DischargeSummaryMedications { get; set; }
        [NotMapped]
        public virtual List<BabyBirthDetailsModel> BabyBirthDetails { get; set; }

        public int? NotesId { get; set; }
        public string ChiefComplaint { get; set; }
        public string PendingReports { get; set; }
        public string HospitalCourse { get; set; }
        public string PresentingIllness { get; set; }
        public string ProcedureNts { get; set; }
        public string SelectedImagingItems { get; set; }
    }
}
