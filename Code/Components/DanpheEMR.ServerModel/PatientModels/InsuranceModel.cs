using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class InsuranceModel
    {
        [Key]
        public int PatientInsuranceInfoId { get; set; }
        public int PatientId { get; set; }
        public string InsuranceNumber { get; set; }
        public string InsuranceName { get; set; }
        public string CardNumber { get; set; }
        public string SubscriberFirstName { get; set; }
        public string SubscriberLastName { get; set; }
        public string SubscriberGender { get; set; }
        public DateTime? SubscriberDOB { get; set; }
        public string SubscriberIDCardNumber { get; set; }
        public string SubscriberIDCardType { get; set; }
        public string IMISCode { get; set; }

        //additional
        public double InitialBalance { get; set; }
        public double CurrentBalance { get; set; }
        public int InsuranceProviderId { get; set; }

        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        //---------------------------------------------
        [NotMapped]
        public string InsuranceProviderName { get; set; }
        public virtual PatientModel Patient { get; set; }
    }
}
