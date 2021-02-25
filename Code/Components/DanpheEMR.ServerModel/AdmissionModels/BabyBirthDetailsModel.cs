using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class BabyBirthDetailsModel
    {
        [Key]
        public int BabyBirthDetailsId {get;set;}
        public string CertificateNumber {get;set;}
        public string Sex {get;set;}
        public string FathersName {get;set;}
        public decimal WeightOfBaby {get;set;}
        public DateTime BirthDate {get;set;}
        public TimeSpan BirthTime {get;set;}
        public int? DischargeSummaryId {get;set;}
        public int NumberOfBabies { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int? MedicalRecordId { get; set; }
        public int? IssuedBy { get; set; }
        public int? CertifiedBy { get; set; }
        public string FiscalYear { get; set; }
        public string BirthType { get; set; }
        public string BirthNumberType { get; set; }
        public int? PrintedBy { get; set; }
        public int PrintCount { get; set; }
        public DateTime? PrintedOn { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public bool IsActive { get; set; }

        [NotMapped]
        public bool IsDeleted { get; set; }
        [NotMapped]
        public string MotherName { get; set; }
        [NotMapped]
        public string Country { get; set; }
        [NotMapped]
        public string CountrySubDivision { get; set; }
        [NotMapped]
        public string Address { get; set; }
    }
}
