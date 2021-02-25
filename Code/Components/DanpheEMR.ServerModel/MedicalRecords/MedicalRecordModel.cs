using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class MedicalRecordModel
    {
        [Key]
        public int MedicalRecordId { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int DischargeTypeId { get; set; }
        public int? DischargeConditionId { get; set; }
        public int? DeliveryTypeId { get; set; }
        public int? BabyBirthConditionId { get; set; }
        public int? DeathPeriodTypeId { get; set; }
        public int? OperationTypeId { get; set; }
        public int? OperatedByDoctor { get; set; }
        public string FileNumber { get; set; }
        public string OperationDiagnosis { get; set; }
        public DateTime? OperationDate { get; set; }
        public bool? IsOperationConducted { get; set; }
        public string Remarks { get; set; }
        public string AllTests { get; set; }
        public string ICDCode { get; set; }
        public int? GravitaId { get; set; }
        public int? GestationalWeek { get; set; }
        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }

        [NotMapped]
        public List<BabyBirthDetailsModel> BabyBirthDetails { get; set; }
        [NotMapped]
        public DeathDetailsModel DeathDetail { get; set; }
        [NotMapped]
        public List<PatLabtestSummaryModel> AllTestList { get; set; }
        [NotMapped]
        public List<ICD10CodeModel> ICDCodeList { get; set; }
        [NotMapped]
        public bool ShowBirthCertDetail { get; set; }
        [NotMapped]
        public bool ShowDeathCertDetail { get; set; }
    }
}
