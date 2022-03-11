using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.LabModels
{
    public class LabGovReportMappingModel
    {
        [Key]
        public int ReportMapId { get; set; }
        public int? ReportItemId { get; set; }
        public int LabItemId { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsComponentBased { get; set; }
        public int? ComponentId { get; set; }
        public bool? IsResultCount { get; set; }
        public string PositiveIndicator { get; set; }
    }
}
