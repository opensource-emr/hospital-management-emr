using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel
{
    public class RequestForQuotationItem
    {
        [Key]
        public int ReqForQuotationItemId { get; set; }
        [NotMapped]
        public int QuotationId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int ReqForQuotationId { get; set; }
        public int Quantity { get; set; }
        public int Price { get; set; }
        public string Description { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        // public string POItemStatus { get; set; }
    }
}
