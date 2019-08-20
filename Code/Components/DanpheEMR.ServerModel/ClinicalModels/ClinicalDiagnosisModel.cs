using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DanpheEMR.ServerModel.ClinicalModels;


namespace DanpheEMR.ServerModel
{
   public class ClinicalDiagnosisModel
    {
        [Key]
        public int DiagnosisId { get; set; }
        public int NotesId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }

        public int ICD10ID { get; set; }
        public string ICD10Description { get; set; }
        public string ICD10Code { get; set; }

        [NotMapped]
        public List<LabRequisitionModel> AllIcdLabOrders = new List<LabRequisitionModel>();
        [NotMapped]
        public List<ImagingRequisitionModel> AllIcdImagingOrders = new List<ImagingRequisitionModel>();
        [NotMapped]
        public List<PHRMPrescriptionItemModel> AllIcdPrescriptionOrders = new List<PHRMPrescriptionItemModel>();


        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
