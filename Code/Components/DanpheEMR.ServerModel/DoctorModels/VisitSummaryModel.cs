using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public class VisitSummaryModel
    {
        [Key]
        public int VisitSummaryId { get; set; }
        public int PatientId { get; set; }
        public int VisitId { get; set; }
        public int QnairId { get; set; }
        public int QuestionId { get; set; }
        public string Answer { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public int? ModifiedBy { get; set; }

        public bool? IsActive { get; set; }
    }
}
