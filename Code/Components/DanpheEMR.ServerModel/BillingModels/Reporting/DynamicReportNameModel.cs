using System;
using System.ComponentModel.DataAnnotations;

namespace DanpheEMR.ServerModel
{
    public  class DynamicReportNameModel
    {
        [Key]
        public int DynamicReportId { get; set; }
        public string ReportName { get; set; }
        public string ReportCode { get; set; }
        public string ReportDescription { get; set; }
        public string Module { get; set; }
        public string UsedIn_SPName { get; set; }
        public bool? IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
