using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace DanpheEMR.ServerModel
{
    public class SSU_InformationModel
    {
        [Key]
        public int SSU_InfoId { get; set; }
        public int PatientId { get; set; }
        public int TargetGroupId { get; set; }
        public string TargetGroup { get; set; }
        public string TG_CertificateType { get; set; }
        public string TG_CertificateNo { get; set; }
        public string IncomeSource { get; set; }
        public string PatFamilyFinancialStatus { get; set; }

        public int? CreatedBy { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }

}
