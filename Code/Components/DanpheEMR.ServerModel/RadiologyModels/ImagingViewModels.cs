using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DanpheEMR.ServerModel
{
    public class ImagingReportPrintVM
    {
        //this is the requisition Id..
        public Int64 RequisitionNo { get; set; }
        public string PatientName { get; set; }
        public string PatientCode { get; set; }
        public DateTime? DateOfBrith { get; set; }
        public string Gender { get; set; }
        public string ProviderName { get; set; }
        public int? ProviderId { get; set; }
        public string ImagingItemName { get; set; }
        public string ReportText { get; set; }
        public string FooterText { get; set; }
        public DateTime CreatedOn { get; set; }
        public string Age { get; set; }
    }
}
