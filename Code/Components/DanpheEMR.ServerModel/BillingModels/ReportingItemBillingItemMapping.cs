using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class ReportingItemBillingItemMapping
    {
        [Key]
        public int RptItem_BillItemMappingId { get; set; }
        public int ReportingItemsId { get; set; }
        public int? BillItemPriceId { get; set; }
        public bool? IsActive { get; set; }
    }
}
