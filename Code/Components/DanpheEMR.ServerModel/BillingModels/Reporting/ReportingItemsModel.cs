using System;
using System.ComponentModel.DataAnnotations;


namespace DanpheEMR.ServerModel
{
    public class ReportingItemsModel
    {
        [Key]
        public int ReportingItemsId { get; set; }
        public string ReportingItemName { get; set; }
        public int? DynamicReportId { get; set; }
        public string RptCountUnit { get; set; }
        public bool? IsActive { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}
