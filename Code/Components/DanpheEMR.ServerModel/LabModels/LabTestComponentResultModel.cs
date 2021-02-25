using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class LabTestComponentResult
    {
        [Key]
        public Int64 TestComponentResultId { get; set; }
        public Int64 RequisitionId { get; set; }
        public Int64 LabTestId { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string Range { get; set; }
        public string ComponentName { get; set; }
        public string Method { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string Remarks { get; set; }
        public int? TemplateId { get; set; }
        //public bool? IsPrint { get; set; }
        //public int? PrintId { get; set; }
        public string RangeDescription { get; set; }
        public virtual LabRequisitionModel LabRequisition { get; set; }
        public bool? IsNegativeResult { get; set; }
        public string NegativeResultText { get; set; }
        public bool? IsAbnormal { get; set; }

        public int? LabReportId { get; set; }

        public bool? IsActive { get; set; }

        public string AbnormalType { get; set; }

        public int? ResultGroup { get; set; }

    }

}
