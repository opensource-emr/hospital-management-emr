using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class EmergencyPatientModel
    {
        [Key]
        public int ERPatientId { get; set; }
        public int ERPatientNumber { get; set; }
        public int? PatientId { get; set; }
        public int? PatientVisitId { get; set; }
        public int? ERDischargeSummaryId { get; set; }
        public DateTime? VisitDateTime { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
	    public string LastName { get; set; }
	    public string Gender { get; set; }
        public string Age { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string ContactNo { get; set; }
        public string CareOfPersonContactNumber { get; set; }
	    public string Address { get; set; }
        public string ReferredBy { get; set; }
        public string ReferredTo { get; set; }
        public string Case { get; set; }
        public string ConditionOnArrival  { get; set; }        
        public int? ModeOfArrival { get; set; }
        public string CareOfPerson { get; set; }
        public string ERStatus { get; set; }
        public string TriageCode { get; set; }
        public int? TriagedBy { get; set; }
        public DateTime? TriagedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime?  ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool IsExistingPatient { get; set; }
        public string OldPatientId { get; set; }

        public string FinalizedStatus { get; set; }
        public string FinalizedRemarks { get; set; }
        public int? FinalizedBy { get; set; }
        public DateTime? FinalizedOn { get; set; }
        public int? ProviderId { get; set; }
        public string ProviderName { get; set; }
        public bool? IsPoliceCase { get; set; }

        [NotMapped]
        public string PatientCode { get; set; }
        [NotMapped]
        public string FullName { get; set; }
        [NotMapped]
        public int CountryId { get; set; }
        [NotMapped]
        public int CountrySubDivisionId { get; set; }
        [NotMapped]
        public string DefaultDepartmentName { get; set; }
        [NotMapped]
        public string ModeOfArrivalName { get; set; }

    }

}
