using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientBedInfo
    {
        [Key]
        public int PatientBedInfoId { get; set; }
        [ForeignKey("Admission")]
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int WardId { get; set; }
        public int BedId { get; set; }
        public int BedFeatureId { get; set; }
        public double BedPrice { get; set; }
        public string Action { get; set; }
        public string OutAction { get; set; }
        public string Remarks { get; set; }
        public DateTime? StartedOn { get; set; }
        public DateTime? EndedOn { get; set; }
        public int CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public int? CancelledBy { get; set; }
        public DateTime? CancelledOn { get; set; }
        public string CancelRemarks { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }
        public bool? BedOnHoldEnabled { get; set; }
        public virtual AdmissionModel Admission { get; set; }
        public BedFeature BedFeature { get; set; }
        public WardModel Ward { get; set; }
        public BedModel Bed { get; set; }

        public int? RequestingDeptId { get; set; }//sud:19Jun'18
        [NotMapped]
        public BillingTransactionItemModel BedChargeBilItm { get; set; }
        [NotMapped]
        public bool? IsExistBedFeatureId { get; set; }
        [NotMapped]
        public int? ReservedBedId { get; set; }
        [NotMapped]
        public bool? IsInsurancePatient { get; set; }

        public int? BedQuantity { get; set; }
        public int? SecondaryDoctorId { get; set; }
        public int? ReceivedBy { get; set; }
        public DateTime? ReceivedOn { get; set; }

    }
}
