using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class PatientVisitProcedure
    {
        [Key]
        public int PatientVisitProcedureId { get; set; }
        public int PatientId { get; set; }
        public int PatientVisitId { get; set; }
        public int ProviderId { get; set; }
        public int BillItemPriceId { get; set; }
        public string ItemName { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public bool? IsActive { get; set; }
    }
}
