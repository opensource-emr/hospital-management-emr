using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class FinalDiagnosisModel
    {
        [Key]
        public int FinalDiagnosisId { get; set; }
        public int PatientVisitId { get; set; }
        public int PatientId { get; set; }
        public int ICD10ID { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool IsActive { get; set; }


        public override int GetHashCode()
        {
            return this.ICD10ID.GetHashCode();
        }
        public override bool Equals(object obj)
        {
            if (!(obj is FinalDiagnosisModel))
                throw new ArgumentException("Obj is not an FinalDiagnosisModel");
            var icd = obj as FinalDiagnosisModel;
            if (icd == null)
                return false;
            return this.ICD10ID.Equals(icd.ICD10ID);
        }
    }
}
