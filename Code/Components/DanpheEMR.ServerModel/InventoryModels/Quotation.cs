using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class Quotation
    {
        [Key]
        public int? QuotationId { get; set; }
        public int? ReqForQuotationId { get; set; }
        public int VendorId { get; set; }
        public string VendorName { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public DateTime? IssuedDate { get; set; }
        public string Status { get; set; }
        public int StoreId { get; set; }
        public virtual List<QuotationItems> quotationItems { get; set; }

        /// <summary>
        /// TODO: Implement QuotationNo generation. <!--Remove after implemented-->
        /// Description: Maintains sequence for QuotationNo
        /// </summary>
        public int? RFQGroupId { get; set; }
        public int FiscalYearId { get; set; }
        public int? QuotationNo { get; set; }
    }
}
