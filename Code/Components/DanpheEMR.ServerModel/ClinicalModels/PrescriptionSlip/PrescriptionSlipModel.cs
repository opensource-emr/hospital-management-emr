using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PrescriptionSlipModel
    {
        [Key]
        public int Id { get; set; }
        public int VisitId { get; set; }
        public int ProviderId { get; set; }
        public int PatientId { get; set; }
        public DateTime VisitDate { get; set; }
        public DateTime ModifiedOn { get; set; }
        public int ModifiedBy { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        [NotMapped]
        public AcceptanceModel Acceptance { get; set; }
        [NotMapped]
        public HistoryModel History { get; set; }
        [NotMapped]
        public DilateModel Dilate { get; set; }
        [NotMapped]
        public IOPModel IOP{ get; set; }
        [NotMapped]
        public PlupModel Plup { get; set; }
        [NotMapped]
        public RetinoscopyModel Retinoscopy { get; set; }
        [NotMapped]
        public SchrimeModel Schrime { get; set; }
        [NotMapped]
        public TBUTModel TBUT { get; set; }
        [NotMapped]
        public VaUnaidedModel VaUnaided{ get; set; }
        [NotMapped]
        public FinalClassModel FinalClass { get; set; }
        [NotMapped]
        public AdviceDiagnosisModel AdviceDiagnosis { get; set; }
    }
}



