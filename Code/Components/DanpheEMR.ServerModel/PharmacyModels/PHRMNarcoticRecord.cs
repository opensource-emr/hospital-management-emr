using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.PharmacyModels
{
    public class PHRMNarcoticRecord
    {
        [Key]
        public int? NarcoticRecordId { get; set; }
        public string BuyerName { get; set; }
        public int? EmployeId { get; set; }
        public int? ItemId { get; set; }
        public int? Quantity { get; set; }
        public string DoctorName { get; set; }
        public string NMCNumber { get; set; }
        public int? InvoiceId { get; set; }
        public int? InvoiceItemId { get; set; }
        public string Batch { get; set; }
        public string Refill { get; set; }
        public string ImgUrl { get; set; }

        public int CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
