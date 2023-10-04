using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.InventoryModels
{
    public class RequestForQuotationVendor
    {
        [Key]
        public int ReqForQuotationVendorId { get; set; }
        public int VendorId { get; set; }
        public int? ReqForQuotationId { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }

    }
}
