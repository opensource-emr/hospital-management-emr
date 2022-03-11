using DanpheEMR.ServerModel.InventoryModels;
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
        public int StoreId { get; set; }
        public virtual List<RequestForQuotationItem> ReqForQuotationItems { get; set; }
        public virtual List<RequestForQuotationVendor> ReqForQuotationVendors { get; set; }

        /// <summary>
        /// TODO: Implement QuotationNo generation. <!--Remove after implemented-->
        /// Maintains sequence for RequestForQuotationNo
        /// </summary>
        public int? RFQGroupId { get; set; }
        public int FiscalYearId { get; set; }
        public int? RequestForQuotationNo { get; set; }
    }
}

