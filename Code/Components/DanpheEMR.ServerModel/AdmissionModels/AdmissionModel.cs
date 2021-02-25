using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class AdmissionModel
    {
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int PatientAdmissionId { get; set; }

        [Key, ForeignKey("Visit")]
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int AdmittingDoctorId { get; set; }
        public DateTime AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string AdmissionNotes { get; set; }
        public string AdmissionOrders { get; set; }
        public string AdmissionStatus { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public virtual VisitModel Visit { get; set; }
        //public DateTime? TransferDate { get; set; }
        public string BillStatusOnDischarge { get; set; }
        public string DischargeRemarks { get; set; }
        public int? DischargedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public string CareOfPersonName { get; set; }
        public string CareOfPersonPhoneNo { get; set; }
        public string CareOfPersonRelation { get; set; }
        public virtual List<PatientBedInfo> PatientBedInfos { get; set; }
        [NotMapped]
        public virtual BillingDeposit BilDeposit { get; set; }
        [NotMapped]
        public List<BillingTransactionItemModel> BilTxnItems { get; set; }

        //RequestingDepartmentId is moved to ADT_TXN_PatientBedInfo table.
        [NotMapped]
        public int? RequestingDeptId { get; set; }//sud:19Jun'18

        //Added by Yubraj --19th November 2018
        public DateTime? CancelledOn { get; set; }
        public int? CancelledBy{ get; set; }
        public string CancelledRemark { get; set; }

        public string ProcedureType { get; set; }
        
        public bool? IsPoliceCase { get; set; }
    }
}
