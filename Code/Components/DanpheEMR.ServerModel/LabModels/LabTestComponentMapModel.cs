using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class LabTestComponentMapModel
    {
        [Key]
        public int ComponentMapId { get; set; }
        public Int64 LabTestId { get; set; }
        public int ComponentId { get; set; }
        public int DisplaySequence { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public bool IsActive { get; set; }

        public string GroupName { get; set; }

        public int IndentationCount { get; set; }
        public bool? ShowInSheet { get; set; }
    }
}
