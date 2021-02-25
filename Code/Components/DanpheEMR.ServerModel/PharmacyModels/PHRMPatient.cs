using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class PHRMPatient
    {
        [Key]
        public int PatientId { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string Age { get; set; }

        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public int? PatientNo { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public bool? PhoneAcceptsText { get; set; }        
        public bool? IsDobVerified { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public string PatientCode { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsOutdoorPat { get; set; }  
        public string PANNumber { get; set; }
        public int? CountrySubDivisionId { get; set; } 
        public int? CountryId { get; set; }
        [NotMapped]
        public string CountrySubDivisionName { get; set; }
        [NotMapped]
        public int? ProviderId { get; set; }
        [NotMapped]
        public bool IsAdmitted { get; set; }
        public List<PHRMInvoiceTransactionItemsModel> PHRMInvoiceTransactionItems { get; set; }
    }
}
