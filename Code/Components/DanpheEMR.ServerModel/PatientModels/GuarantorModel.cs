using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class GuarantorModel
    {

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public int? PatientGurantorInfo { get; set; }
        [Key, ForeignKey("Patient")]
        public int PatientId { get; set; }
        public bool GuarantorSelf { get; set; }
        public string PatientRelationship { get; set; }
        public string GuarantorName { get; set; }
        public string GuarantorGender { get; set; }
        public int? GuarantorCountryId { get; set; }
        public string GuarantorPhoneNumber { get; set; }
        public DateTime? GuarantorDateOfBirth { get; set; }
        public string GuarantorStreet1 { get; set; }
        public string GuarantorStreet2 { get; set; }
        public string GuarantorCity { get; set; }
        public int? GuarantorCountrySubDivisionId { get; set; }
        public string GuarantorZIPCode { get; set; }
        public virtual PatientModel Patient { get; set; }

    }
}
