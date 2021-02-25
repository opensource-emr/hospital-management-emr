using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class LabGovReportItemModel
    {
        [Key]
        public int ReportItemId { get; set; }
        public int SerialNumber { get; set; }
        public string TestName { get; set; }
        public string GroupName { get; set; }
        public string DisplayName { get; set; }
        public bool? HasInnerItems { get; set; }
        public string InnerTestGroupName { get; set; }

        [NotMapped]
        public int Count { get; set; }
    }
}
