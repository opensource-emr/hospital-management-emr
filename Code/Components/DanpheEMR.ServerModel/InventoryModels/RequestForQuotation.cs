using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class RequestForQuotation
    {
        [Key]
        public int ReqForQuotationId { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string RequestedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ApprovedBy { get; set; }
        public DateTime? RequestedOn { get; set; }
        public DateTime? RequestedCloseOn { get; set; }
        public string Status { get; set; }

        public virtual List<RequestForQuotationItem> ReqForQuotationItems { get; set; }
    }
}

